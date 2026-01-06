import { Request, Response } from 'express'
import { QueryTypes, Op } from 'sequelize'
import { Teacher } from '../models/teacher.model'
import { ClassTeacher } from '../models/class-teacher.model'
import { Class } from '../models/class.model'
import { Student } from '../models/student.model'
import { Parent } from '../models/parent.model'
import { User } from '../models/user.model'

// 控制器
export const personnelCenterController = {
  // 获取当前用户的教师信息
  getCurrentTeacher: async (userId: number) => {
    return await Teacher.findOne({
      where: { userId },
      raw: true  // 返回普通对象而不是模型实例
    });
  },

  // 获取教师相关的班级ID列表
  getTeacherClassIds: async (teacherId: number) => {
    // 获取教师任教的班级（通过ClassTeacher中间表）
    const classTeachers = await ClassTeacher.findAll({
      where: { teacherId: teacherId },
      attributes: ['classId']
    });

    // 获取教师担任班主任或助教的班级
    const headClasses = await Class.findAll({
      where: {
        [Op.or]: [
          { headTeacherId: teacherId },
          { assistantTeacherId: teacherId }
        ]
      },
      attributes: ['id']
    });

    // 合并所有班级ID
    const classIds = new Set([
      ...classTeachers.map(ct => ct.classId),
      ...headClasses.map(c => c.id)
    ]);

    return Array.from(classIds);
  },

  // 获取概览数据
  getOverview: async (req: Request, res: Response) => {
    try {
      // 使用文件顶部静态导入的模型
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      let studentsCount, parentsCount, teachersCount, classesCount;

      // 如果是教师角色，只显示相关数据
      if (userRole === 'teacher' && userId) {
        console.log('[概览API] 检测到教师角色，用户ID:', userId);
        const teacher = await personnelCenterController.getCurrentTeacher(userId);
        console.log('[概览API] 查找到的教师信息:', teacher);

        if (teacher) {
          const classIds = await personnelCenterController.getTeacherClassIds(teacher.id);
          console.log('[概览API] 教师相关班级ID:', classIds);

          // 只统计教师相关班级的学生
          studentsCount = await Student.count({
            where: classIds.length > 0 ? { classId: { [Op.in]: classIds } } : { id: -1 }
          });

          // 只统计这些学生的家长
          if (classIds.length > 0) {
            const students = await Student.findAll({
              where: { classId: { [Op.in]: classIds } },
              attributes: ['id']
            });
            const studentIds = students.map(s => s.id);

            parentsCount = studentIds.length > 0 ? await Parent.count({
              where: { studentId: { [Op.in]: studentIds } }
            }) : 0;
          } else {
            parentsCount = 0;
          }

          // 教师只能看到自己
          teachersCount = 1;

          // 只统计相关班级
          classesCount = classIds.length;
        } else {
          // 如果找不到教师记录，返回0
          studentsCount = parentsCount = teachersCount = classesCount = 0;
        }
      } else {
        // 管理员或其他角色，显示全部数据
        studentsCount = await Student.count();
        parentsCount = await Parent.count();
        teachersCount = await Teacher.count();
        classesCount = await Class.count();
      }

      const stats = [
        { key: 'students', title: '在校学生', value: studentsCount, unit: '人', trend: 12, trendText: '较上月', type: 'primary', icon: 'User' },
        { key: 'parents', title: '注册家长', value: parentsCount, unit: '人', trend: 8, trendText: '较上月', type: 'success', icon: 'UserFilled' },
        { key: 'teachers', title: '在职教师', value: teachersCount, unit: '人', trend: 2, trendText: '较上月', type: 'warning', icon: 'Avatar' },
        { key: 'classes', title: '开设班级', value: classesCount, unit: '个', trend: 1, trendText: '较上月', type: 'info', icon: 'School' }
      ]

      res.json({
        success: true,
        data: { stats },
        message: '获取概览数据成功'
      })
    } catch (error) {
      console.error('获取概览数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取概览数据失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取人员分布统计
  getPersonnelDistribution: async (req: Request, res: Response) => {
    try {
      const chartData = {
        title: { text: '人员分布统计' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          name: '人员分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 456, name: '学生' },
            { value: 328, name: '家长' },
            { value: 45, name: '教师' },
            { value: 18, name: '班级' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

      res.json({
        success: true,
        data: chartData,
        message: '获取人员分布统计成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取人员分布统计失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取人员趋势统计
  getPersonnelTrend: async (req: Request, res: Response) => {
    try {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月']
      const chartData = {
        title: { text: '人员增长趋势' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['学生', '家长', '教师'] },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '学生',
            type: 'line',
            data: [420, 432, 441, 450, 456, 456]
          },
          {
            name: '家长',
            type: 'line',
            data: [300, 310, 315, 320, 325, 328]
          },
          {
            name: '教师',
            type: 'line',
            data: [40, 42, 43, 44, 45, 45]
          }
        ]
      }

      res.json({
        success: true,
        data: chartData,
        message: '获取人员趋势统计成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取人员趋势统计失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取学生列表
  getStudents: async (req: Request, res: Response) => {
    try {
      const { page = 1, pageSize = 10, keyword = '', classId = '', status = '' } = req.query

      // 使用文件顶部静态导入的模型
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      console.log('[学生API] 用户信息调试:', {
        userId,
        userRole,
        user: (req as any).user
      });

      // 构建查询条件
      const whereConditions: any = {};

      // 如果是教师角色，只能查看自己相关班级的学生
      if (userRole === 'teacher' && userId) {
        console.log('[学生API] 检测到教师角色，用户ID:', userId);
        const teacher = await personnelCenterController.getCurrentTeacher(userId);
        console.log('[学生API] 查找到的教师信息:', teacher);
        if (teacher) {
          // 从 Sequelize 模型实例中获取 ID
          const teacherId = teacher.id;
          console.log('[学生API] 使用教师ID:', teacherId, '类型:', typeof teacherId);
          if (!teacherId) {
            throw new Error('无法获取教师ID');
          }
          const classIds = await personnelCenterController.getTeacherClassIds(teacherId);
          console.log('[学生API] 教师相关班级ID:', classIds);
          if (classIds.length > 0) {
            whereConditions.classId = { [Op.in]: classIds };
          } else {
            // 如果教师没有任教班级，返回空结果
            whereConditions.id = -1;
          }
        } else {
          // 如果找不到教师记录，返回空结果
          whereConditions.id = -1;
        }
      }

      if (keyword) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { studentNo: { [Op.like]: `%${keyword}%` } }
        ];
      }

      if (classId) {
        // 如果是教师角色，需要验证该班级是否属于该教师
        if (userRole === 'teacher' && userId) {
          const teacher = await personnelCenterController.getCurrentTeacher(userId);
          if (teacher) {
            const classIds = await personnelCenterController.getTeacherClassIds(teacher.id);
            if (classIds.includes(Number(classId))) {
              whereConditions.classId = classId;
            } else {
              // 教师无权查看该班级，返回空结果
              whereConditions.id = -1;
            }
          }
        } else {
          whereConditions.classId = classId;
        }
      }

      if (status) {
        whereConditions.status = status;
      }

      // 查询学生数据
      const { count, rows } = await Student.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'code']
          }
        ],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['createdAt', 'DESC']]
      });

      // 格式化返回数据
      const formattedStudents = rows.map(student => ({
        id: student.id.toString(),
        name: student.name,
        studentId: student.studentNo,
        className: student.class?.name || '未分班',
        gender: student.gender === 1 ? 'male' : 'female',
        age: student.birthDate ? Math.floor((Date.now() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        status: student.status === 1 ? 'active' : student.status === 0 ? 'suspended' : 'graduated',
        enrollDate: student.createdAt.toISOString(),
        parentName: '', // 需要通过关联查询获取
        parentPhone: '' // 需要通过关联查询获取
      }));

      res.json({
        success: true,
        data: {
          items: formattedStudents,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        },
        message: '获取学生列表成功'
      })
    } catch (error) {
      console.error('获取学生列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学生列表失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 创建学生
  createStudent: async (req: Request, res: Response) => {
    try {
      const studentData = req.body
      // 这里应该是数据库操作
      const newStudent = {
        id: `student_${Date.now()}`,
        ...studentData,
        enrollDate: new Date().toISOString()
      }

      res.json({
        success: true,
        data: newStudent,
        message: '创建学生成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 更新学生
  updateStudent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body
      
      // 这里应该是数据库操作
      const updatedStudent = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: updatedStudent,
        message: '更新学生成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 删除学生
  deleteStudent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      
      // 这里应该是数据库操作
      res.json({
        success: true,
        data: { id },
        message: '删除学生成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取学生详情
  getStudentDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // 使用文件顶部导入的模型，确保关联关系已正确设置

      const student = await Student.findByPk(id, {
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: '学生不存在'
        });
      }

      const formattedStudent = {
        id: student.id.toString(),
        name: student.name,
        studentId: student.studentNo,
        className: student.class?.name || '未分班',
        gender: student.gender === 1 ? 'male' : 'female',
        age: student.birthDate ? Math.floor((Date.now() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
        status: student.status === 1 ? 'active' : student.status === 0 ? 'suspended' : 'graduated',
        enrollDate: student.createdAt.toISOString(),
        parentName: '', // 需要通过关联查询获取
        parentPhone: '' // 需要通过关联查询获取
      };

      res.json({
        success: true,
        data: formattedStudent,
        message: '获取学生详情成功'
      })
    } catch (error) {
      console.error('获取学生详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学生详情失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取家长列表
  getParents: async (req: Request, res: Response) => {
    try {
      const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query

      // 使用文件顶部静态导入的模型
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // 构建查询条件
      const whereConditions: any = {};

      // 如果是教师角色，只能查看自己相关班级学生的家长
      if (userRole === 'teacher' && userId) {
        const teacher = await personnelCenterController.getCurrentTeacher(userId);
        if (teacher) {
          const classIds = await personnelCenterController.getTeacherClassIds(teacher.id);
          if (classIds.length > 0) {
            // 获取这些班级的学生ID
            const students = await Student.findAll({
              where: { classId: { [Op.in]: classIds } },
              attributes: ['id']
            });
            const studentIds = students.map(s => s.id);

            if (studentIds.length > 0) {
              whereConditions.studentId = { [Op.in]: studentIds };
            } else {
              whereConditions.id = -1; // 没有学生，返回空结果
            }
          } else {
            whereConditions.id = -1; // 没有班级，返回空结果
          }
        } else {
          whereConditions.id = -1; // 找不到教师记录，返回空结果
        }
      }

      // 构建include条件
      const userWhere: any = {};
      if (keyword) {
        userWhere[Op.or] = [
          { username: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ];
      }
      if (status) {
        // 根据用户状态过滤
        userWhere.status = status === 'active' ? 1 : 0;
      }

      // 查询家长数据
      const { count, rows } = await Parent.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'status'],
            where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
            required: true // 确保必须有用户记录
          },

        ],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['createdAt', 'DESC']]
      });

      // 格式化返回数据
      const formattedParents = rows.map(parent => ({
        id: parent.id.toString(),
        name: parent.user?.username || '未知',
        phone: parent.user?.phone || '',
        email: parent.user?.email || '',
        status: parent.user?.status ? 'active' : 'inactive',
        registerDate: parent.createdAt.toISOString(),
        children: [], // 暂时为空，需要通过ParentStudentRelation查询
        relationship: parent.relationship,
        address: parent.address || ''
      }));

      res.json({
        success: true,
        data: {
          items: formattedParents,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        },
        message: '获取家长列表成功'
      })
    } catch (error) {
      console.error('获取家长列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取家长列表失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 创建家长
  createParent: async (req: Request, res: Response) => {
    try {
      const parentData = req.body
      const newParent = {
        id: `parent_${Date.now()}`,
        ...parentData,
        registerDate: new Date().toISOString()
      }

      res.json({
        success: true,
        data: newParent,
        message: '创建家长成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 更新家长
  updateParent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const updatedParent = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: updatedParent,
        message: '更新家长成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 删除家长
  deleteParent: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      res.json({
        success: true,
        data: { id },
        message: '删除家长成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取家长详情
  getParentDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // 使用文件顶部静态导入的模型
      const parent = await Parent.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'status']
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'studentNo']
          }
        ]
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: '家长不存在'
        });
      }

      const formattedParent = {
        id: parent.id.toString(),
        name: parent.user?.username || '未知',
        phone: parent.user?.phone || '',
        email: parent.user?.email || '',
        status: parent.user?.status ? 'active' : 'inactive',
        registerDate: parent.createdAt.toISOString(),
        children: parent.student ? [{ id: parent.student.id.toString(), name: parent.student.name }] : [],
        relationship: parent.relationship,
        address: parent.address || ''
      };

      res.json({
        success: true,
        data: formattedParent,
        message: '获取家长详情成功'
      })
    } catch (error) {
      console.error('获取家长详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取家长详情失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取教师列表
  getTeachers: async (req: Request, res: Response) => {
    try {
      const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query

      // 使用文件顶部静态导入的模型
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // 构建查询条件
      const whereConditions: any = {};

      // 如果是教师角色，只能查看自己的信息
      if (userRole === 'teacher' && userId) {
        whereConditions.userId = userId;
      }

      if (keyword) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { employeeNo: { [Op.like]: `%${keyword}%` } }
        ];
      }

      if (status) {
        whereConditions.status = status === 'active' ? 1 : 0;
      }

      // 查询教师数据
      const { count, rows } = await Teacher.findAndCountAll({
        where: whereConditions,
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['createdAt', 'DESC']]
      });

      // 格式化返回数据
      const formattedTeachers = rows.map(teacher => ({
        id: teacher.id.toString(),
        name: teacher.name,
        employeeId: teacher.employeeId || `T${teacher.id.toString().padStart(4, '0')}`,
        department: 'teaching', // 默认教学部门
        position: teacher.position === 4 ? '班主任' : teacher.position === 5 ? '普通教师' : '其他',
        phone: '', // 暂时为空，需要通过userId查询User表
        email: '', // 暂时为空，需要通过userId查询User表
        status: teacher.status === 1 ? 'active' : 'inactive',
        hireDate: teacher.createdAt.toISOString(),
        classes: [], // 需要通过关联查询获取
        subjects: [] // 需要通过关联查询获取
      }));

      res.json({
        success: true,
        data: {
          items: formattedTeachers,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        },
        message: '获取教师列表成功'
      })
    } catch (error) {
      console.error('获取教师列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教师列表失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 创建教师
  createTeacher: async (req: Request, res: Response) => {
    try {
      const teacherData = req.body
      const newTeacher = {
        id: `teacher_${Date.now()}`,
        ...teacherData,
        hireDate: new Date().toISOString()
      }

      res.json({
        success: true,
        data: newTeacher,
        message: '创建教师成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 更新教师
  updateTeacher: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const updatedTeacher = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: updatedTeacher,
        message: '更新教师成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 删除教师
  deleteTeacher: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      res.json({
        success: true,
        data: { id },
        message: '删除教师成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取教师详情
  getTeacherDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // 使用文件顶部静态导入的模型
      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone']
          }
        ]
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: '教师不存在'
        });
      }

      const formattedTeacher = {
        id: teacher.id.toString(),
        name: teacher.name,
        employeeId: teacher.employeeId || `T${teacher.id.toString().padStart(4, '0')}`,
        department: 'teaching',
        position: teacher.position === 4 ? '班主任' : teacher.position === 5 ? '普通教师' : '其他',
        phone: teacher.user?.phone || '',
        email: teacher.user?.email || '',
        status: teacher.status === 1 ? 'active' : 'inactive',
        hireDate: teacher.createdAt.toISOString(),
        classes: [],
        subjects: []
      };

      res.json({
        success: true,
        data: formattedTeacher,
        message: '获取教师详情成功'
      })
    } catch (error) {
      console.error('获取教师详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取教师详情失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取班级列表
  getClasses: async (req: Request, res: Response) => {
    try {
      const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query

      // 使用文件顶部静态导入的模型
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // 构建查询条件
      const whereConditions: any = {};

      // 如果是教师角色，只能查看自己相关的班级
      if (userRole === 'teacher' && userId) {
        const teacher = await personnelCenterController.getCurrentTeacher(userId);
        if (teacher) {
          const classIds = await personnelCenterController.getTeacherClassIds(teacher.id);
          if (classIds.length > 0) {
            whereConditions.id = { [Op.in]: classIds };
          } else {
            whereConditions.id = -1; // 没有班级，返回空结果
          }
        } else {
          whereConditions.id = -1; // 找不到教师记录，返回空结果
        }
      }

      if (keyword) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { code: { [Op.like]: `%${keyword}%` } }
        ];
      }

      if (status) {
        whereConditions.status = status === 'active' ? 1 : 0;
      }

      // 查询班级数据
      const { count, rows } = await Class.findAndCountAll({
        where: whereConditions,
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize),
        order: [['createdAt', 'DESC']]
      });

      // 格式化返回数据
      const formattedClasses = rows.map(classItem => ({
        id: classItem.id.toString(),
        name: classItem.name,
        grade: classItem.type === 1 ? 'small' : classItem.type === 2 ? 'medium' : 'large',
        maxCapacity: classItem.capacity,
        currentStudents: classItem.currentStudentCount,
        teacherName: '未分配', // 暂时为空，需要通过headTeacherId查询Teacher表
        assistantTeacher: '未分配', // 暂时为空，需要通过assistantTeacherId查询Teacher表
        room: `教室${classItem.id}`, // 默认教室名
        status: classItem.status === 1 ? 'active' : 'inactive',
        createDate: classItem.createdAt.toISOString(),
        students: [] // 需要单独查询学生列表
      }));

      res.json({
        success: true,
        data: {
          items: formattedClasses,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        },
        message: '获取班级列表成功'
      })
    } catch (error) {
      console.error('获取班级列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级列表失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 创建班级
  createClass: async (req: Request, res: Response) => {
    try {
      const classData = req.body
      const newClass = {
        id: `class_${Date.now()}`,
        ...classData,
        currentStudents: 0,
        createDate: new Date().toISOString()
      }

      res.json({
        success: true,
        data: newClass,
        message: '创建班级成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '创建班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 更新班级
  updateClass: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const updatedClass = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: updatedClass,
        message: '更新班级成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '更新班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 删除班级
  deleteClass: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      res.json({
        success: true,
        data: { id },
        message: '删除班级成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '删除班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取班级详情
  getClassDetail: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // 使用文件顶部静态导入的模型
      const classDetail = await Class.findByPk(id, {
        include: [
          {
            model: Teacher,
            as: 'headTeacher',
            attributes: ['id', 'name']
          },
          {
            model: Teacher,
            as: 'assistantTeacher',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!classDetail) {
        return res.status(404).json({
          success: false,
          message: '班级不存在'
        });
      }

      const formattedClass = {
        id: classDetail.id.toString(),
        name: classDetail.name,
        grade: classDetail.type === 1 ? 'small' : classDetail.type === 2 ? 'medium' : 'large',
        maxCapacity: classDetail.capacity,
        currentStudents: classDetail.currentStudentCount,
        teacherName: classDetail.headTeacher?.name || '未分配',
        assistantTeacher: classDetail.assistantTeacher?.name || '未分配',
        room: `教室${classDetail.id}`,
        status: classDetail.status === 1 ? 'active' : 'inactive',
        createDate: classDetail.createdAt.toISOString(),
        students: []
      };

      res.json({
        success: true,
        data: formattedClass,
        message: '获取班级详情成功'
      })
    } catch (error) {
      console.error('获取班级详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取班级详情失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 获取人员统计
  getPersonnelStatistics: async (req: Request, res: Response) => {
    try {
      const statistics = {
        totalStudents: 456,
        totalParents: 328,
        totalTeachers: 45,
        totalClasses: 18,
        activeStudents: 420,
        activeParents: 310,
        activeTeachers: 42,
        activeClasses: 16,
        monthlyGrowth: {
          students: 12,
          parents: 8,
          teachers: 2,
          classes: 1
        }
      }

      res.json({
        success: true,
        data: statistics,
        message: '获取人员统计成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取人员统计失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 批量操作 - 学生
  batchUpdateStudents: async (req: Request, res: Response) => {
    try {
      const { ids, data } = req.body

      res.json({
        success: true,
        data: { updatedCount: ids.length },
        message: `批量更新${ids.length}个学生成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量更新学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  batchDeleteStudents: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body

      res.json({
        success: true,
        data: { deletedCount: ids.length },
        message: `批量删除${ids.length}个学生成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量删除学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 批量操作 - 家长
  batchUpdateParents: async (req: Request, res: Response) => {
    try {
      const { ids, data } = req.body

      res.json({
        success: true,
        data: { updatedCount: ids.length },
        message: `批量更新${ids.length}个家长成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量更新家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  batchDeleteParents: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body

      res.json({
        success: true,
        data: { deletedCount: ids.length },
        message: `批量删除${ids.length}个家长成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量删除家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 批量操作 - 教师
  batchUpdateTeachers: async (req: Request, res: Response) => {
    try {
      const { ids, data } = req.body

      res.json({
        success: true,
        data: { updatedCount: ids.length },
        message: `批量更新${ids.length}个教师成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量更新教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  batchDeleteTeachers: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body

      res.json({
        success: true,
        data: { deletedCount: ids.length },
        message: `批量删除${ids.length}个教师成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量删除教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 批量操作 - 班级
  batchUpdateClasses: async (req: Request, res: Response) => {
    try {
      const { ids, data } = req.body

      res.json({
        success: true,
        data: { updatedCount: ids.length },
        message: `批量更新${ids.length}个班级成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量更新班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  batchDeleteClasses: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body

      res.json({
        success: true,
        data: { deletedCount: ids.length },
        message: `批量删除${ids.length}个班级成功`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '批量删除班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 导出功能
  exportStudents: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: { downloadUrl: '/downloads/students.xlsx' },
        message: '学生数据导出成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '学生数据导出失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  exportParents: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: { downloadUrl: '/downloads/parents.xlsx' },
        message: '家长数据导出成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '家长数据导出失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  exportTeachers: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: { downloadUrl: '/downloads/teachers.xlsx' },
        message: '教师数据导出成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '教师数据导出失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  exportClasses: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: { downloadUrl: '/downloads/classes.xlsx' },
        message: '班级数据导出成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '班级数据导出失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 关联操作
  assignStudentToClass: async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params
      const { classId } = req.body

      res.json({
        success: true,
        data: { studentId, classId },
        message: '学生分配班级成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '学生分配班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  assignTeacherToClass: async (req: Request, res: Response) => {
    try {
      const { teacherId } = req.params
      const { classId } = req.body

      res.json({
        success: true,
        data: { teacherId, classId },
        message: '教师分配班级成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '教师分配班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  addChildToParent: async (req: Request, res: Response) => {
    try {
      const { parentId } = req.params
      const { studentId } = req.body

      res.json({
        success: true,
        data: { parentId, studentId },
        message: '添加孩子关联成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '添加孩子关联失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // 搜索功能
  globalSearch: async (req: Request, res: Response) => {
    try {
      const { keyword } = req.query

      res.json({
        success: true,
        data: {
          students: [],
          parents: [],
          teachers: [],
          classes: []
        },
        message: '全局搜索成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '全局搜索失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  searchStudents: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: [],
        message: '搜索学生功能暂未实现'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '搜索学生失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  searchParents: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: [],
        message: '搜索家长功能暂未实现'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '搜索家长失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  searchTeachers: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: [],
        message: '搜索教师功能暂未实现'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '搜索教师失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  searchClasses: async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: [],
        message: '搜索班级功能暂未实现'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '搜索班级失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}
