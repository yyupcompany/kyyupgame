/**
 * 教师学生测评管理API路由
*/
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { verifyToken } from '../middlewares/auth.middleware';
import AssessmentRecord from '../models/assessment-record.model';
import Student from '../models/student.model';
import Teacher from '../models/teacher.model';
import Class from '../models/class.model';
// Student 不存在，使用 Student.classId 直接查询
import ClassTeacher from '../models/class-teacher.model';
import Parent from '../models/parent.model';
import ParentStudentRelation from '../models/parent-student-relation.model';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
 * 权限验证中间件 - 确保是教师角色
*/
const teacherOnlyMiddleware = (req: any, res: Response, next: any) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'principal') {
    return res.status(403).json({
      success: false,
      message: '无权访问该资源',
    });
  }
  next();
};

router.use(teacherOnlyMiddleware);

/**
 * 验证教师是否有权访问某个学生的数据
*/
const verifyTeacherStudentAccess = async (teacherId: number, studentId: number): Promise<boolean> => {
  try {
    // 查找教师负责的班级
    const classTeachers = await ClassTeacher.findAll({
      where: { teacherId },
    });

    if (classTeachers.length === 0) {
      return false;
    }

    const classIds = classTeachers.map((ct) => ct.classId);

    // 检查学生是否在这些班级中
    const student = await Student.findOne({
      where: {
        id: studentId,
        classId: { [Op.in]: classIds },
      },
    });

    return !!student;
  } catch (error) {
    console.error('[TEACHER]: 验证教师学生访问权限失败:', error);
    return false;
  }
};

/**
 * 获取教师班级学生列表（含测评统计）
 * GET /api/teacher/assessment/students
*/
router.get('/students', async (req: any, res: Response) => {
  try {
    const teacherId = req.user.teacherId;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: '教师ID不存在',
      });
    }

    // 获取教师负责的班级
    const classTeachers = await ClassTeacher.findAll({
      where: { teacherId },
      include: [
        {
          model: Class,
          as: 'class',
        },
      ],
    });

    if (classTeachers.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const classIds = classTeachers.map((ct) => ct.classId);

    // 获取班级学生
    const classStudents = await Student.findAll({
      where: {
        classId: { [Op.in]: classIds },
      },
      include: [
        {
          model: Student,
          as: 'student',
        },
        {
          model: Class,
          as: 'class',
        },
      ],
    });

    // 获取学生测评统计
    const students = await Promise.all(
      classStudents.map(async (cs: any) => {
        const student = cs.student;
        if (!student) return null;

        // 通过学生找到家长
        const parentRelation = await ParentStudentRelation.findOne({
          where: { studentId: student.id },
          include: [
            {
              model: Parent,
              as: 'parent',
            },
          ],
        });

        if (!parentRelation) {
          return {
            id: student.id,
            name: student.name,
            age: student.age,
            gender: student.gender,
            avatar: student.avatar,
            className: cs.class?.name || '',
            assessmentCount: 0,
            lastAssessmentDate: null,
            averageScore: 0,
          };
        }

        const parentId = parentRelation.userId;

        // 获取该家长的测评记录
        const assessmentRecords = await AssessmentRecord.findAll({
          where: {
            parentId,
            status: 'completed',
          },
        });

        const assessmentCount = assessmentRecords.length;
        const lastAssessmentDate = assessmentRecords.length > 0
          ? assessmentRecords[assessmentRecords.length - 1].createdAt
          : null;

        const averageScore = assessmentRecords.length > 0
          ? Math.round(
              assessmentRecords.reduce((sum, r) => sum + (r.totalScore || 0), 0) /
                assessmentRecords.length
            )
          : 0;

        return {
          id: student.id,
          name: student.name,
          age: student.age,
          gender: student.gender,
          avatar: student.avatar,
          className: cs.class?.name || '',
          assessmentCount,
          lastAssessmentDate,
          averageScore,
        };
      })
    );

    const validStudents = students.filter((s) => s !== null);

    res.json({
      success: true,
      data: validStudents,
    });
  } catch (error: any) {
    console.error('[TEACHER]: 获取学生列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取学生列表失败',
    });
  }
});

/**
 * 获取学生测评详情
 * GET /api/teacher/assessment/student/:studentId
*/
router.get('/student/:studentId', async (req: any, res: Response) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.teacherId;

    // 验证权限
    const hasAccess = await verifyTeacherStudentAccess(teacherId, Number(studentId));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: '无权访问该学生的测评数据',
      });
    }

    // 获取学生信息
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在',
      });
    }

    // 获取学生班级
    const classStudent = await Student.findOne({
      where: { id: studentId },
      include: [
        {
          model: Class,
          as: 'class',
        },
      ],
    });

    // 通过学生找到家长
    const parentRelation = await ParentStudentRelation.findOne({
      where: { studentId },
    });

    if (!parentRelation) {
      return res.json({
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.name,
            age: student.birthDate ? new Date().getFullYear() - new Date(student.birthDate).getFullYear() : 0,
            gender: student.gender,
            avatar: student.photoUrl,
            className: (classStudent as any)?.class?.name || '',
          },
          assessmentHistory: [],
          latestDimensions: null,
          teacherNotes: [],
        },
      });
    }

    // 获取测评历史
    const assessmentHistory = await AssessmentRecord.findAll({
      where: {
        parentId: parentRelation.userId,
        status: 'completed',
      },
      order: [['createdAt', 'DESC']],
    });

    const history = assessmentHistory.map((record: any) => ({
      id: record.id,
      type: record.assessmentType,
      totalScore: record.totalScore,
      createdAt: record.createdAt,
      dimensionScores: record.dimensionScores || {
        cognitive: 0,
        physical: 0,
        social: 0,
        emotional: 0,
        language: 0,
      },
    }));

    // 获取最新的维度得分
    const latestDimensions = assessmentHistory.length > 0
      ? (assessmentHistory[0] as any).dimensionScores || {
          cognitive: 0,
          physical: 0,
          social: 0,
          emotional: 0,
          language: 0,
        }
      : null;

    // 教师备注（这里暂时返回空数组，需要创建对应的模型）
    const teacherNotes: any[] = [];

    // 计算年龄
    const calculateAge = (birthDate: Date | null) => {
      if (!birthDate) return null;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          age: calculateAge(student.birthDate),
          gender: student.gender,
          avatar: student.photoUrl,
          className: (classStudent as any)?.class?.name || '',
        },
        assessmentHistory: history,
        latestDimensions,
        teacherNotes,
      },
    });
  } catch (error: any) {
    console.error('[TEACHER]: 获取学生测评详情失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取学生测评详情失败',
    });
  }
});

/**
 * 添加教师备注
 * POST /api/teacher/assessment/note
*/
router.post('/note', async (req: any, res: Response) => {
  try {
    const { studentId, recordId, content } = req.body;
    const teacherId = req.user.teacherId;

    // 验证权限
    const hasAccess = await verifyTeacherStudentAccess(teacherId, Number(studentId));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: '无权操作该学生的数据',
      });
    }

    // 这里需要创建教师备注模型，暂时返回成功
    // TODO: 实现教师备注的数据库存储

    res.json({
      success: true,
      message: '备注添加成功',
      data: {
        id: Date.now(),
        studentId,
        recordId,
        content,
        teacherName: req.user.name || '教师',
        createdAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('[TEACHER]: 添加教师备注失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '添加教师备注失败',
    });
  }
});

/**
 * 获取班级统计
 * GET /api/teacher/assessment/class-statistics
*/
router.get('/class-statistics', async (req: any, res: Response) => {
  try {
    const teacherId = req.user.teacherId;

    // 获取教师负责的第一个班级（简化处理）
    const classTeacher = await ClassTeacher.findOne({
      where: { teacherId },
      include: [
        {
          model: Class,
          as: 'class',
        },
      ],
    });

    if (!classTeacher) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const classData = (classTeacher as any).class;
    const classId = classTeacher.classId;

    // 获取班级学生数
    const studentCount = await Student.count({
      where: { classId },
    });

    // 获取班级所有学生
    const classStudents = await Student.findAll({
      where: { classId },
      include: [
        {
          model: Student,
          as: 'student',
        },
      ],
    });

    // 获取所有学生的测评记录
    let totalAssessments = 0;
    let totalScore = 0;
    const dimensionTotals = {
      cognitive: 0,
      physical: 0,
      social: 0,
      emotional: 0,
      language: 0,
    };

    for (const cs of classStudents) {
      const student = (cs as any).student;
      if (!student) continue;

      const parentRelation = await ParentStudentRelation.findOne({
        where: { studentId: student.id },
      });

      if (!parentRelation) continue;

      const records = await AssessmentRecord.findAll({
        where: {
          parentId: parentRelation.userId,
          status: 'completed',
        },
      });

      totalAssessments += records.length;

      records.forEach((record: any) => {
        totalScore += record.totalScore || 0;
        if (record.dimensionScores) {
          dimensionTotals.cognitive += record.dimensionScores.cognitive || 0;
          dimensionTotals.physical += record.dimensionScores.physical || 0;
          dimensionTotals.social += record.dimensionScores.social || 0;
          dimensionTotals.emotional += record.dimensionScores.emotional || 0;
          dimensionTotals.language += record.dimensionScores.language || 0;
        }
      });
    }

    const averageScore = totalAssessments > 0 
      ? Math.round(totalScore / totalAssessments) 
      : 0;

    const dimensionAverages = {
      cognitive: totalAssessments > 0 
        ? Math.round(dimensionTotals.cognitive / totalAssessments) 
        : 0,
      physical: totalAssessments > 0 
        ? Math.round(dimensionTotals.physical / totalAssessments) 
        : 0,
      social: totalAssessments > 0 
        ? Math.round(dimensionTotals.social / totalAssessments) 
        : 0,
      emotional: totalAssessments > 0 
        ? Math.round(dimensionTotals.emotional / totalAssessments) 
        : 0,
      language: totalAssessments > 0 
        ? Math.round(dimensionTotals.language / totalAssessments) 
        : 0,
    };

    res.json({
      success: true,
      data: {
        className: classData?.name || '班级',
        studentCount,
        assessmentCount: totalAssessments,
        averageScore,
        dimensionAverages,
      },
    });
  } catch (error: any) {
    console.error('[TEACHER]: 获取班级统计失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取班级统计失败',
    });
  }
});

/**
 * 获取重点关注学生列表
 * GET /api/teacher/assessment/focus-students
*/
router.get('/focus-students', async (req: any, res: Response) => {
  try {
    const teacherId = req.user.teacherId;

    // 获取教师班级所有学生
    const classTeachers = await ClassTeacher.findAll({
      where: { teacherId },
    });

    if (classTeachers.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const classIds = classTeachers.map((ct) => ct.classId);

    const classStudents = await Student.findAll({
      where: {
        classId: { [Op.in]: classIds },
      },
      include: [
        {
          model: Student,
          as: 'student',
        },
      ],
    });

    // 筛选出平均分低于75的学生
    const focusStudents = await Promise.all(
      classStudents.map(async (cs: any) => {
        const student = cs.student;
        if (!student) return null;

        const parentRelation = await ParentStudentRelation.findOne({
          where: { studentId: student.id },
        });

        if (!parentRelation) return null;

        const records = await AssessmentRecord.findAll({
          where: {
            parentId: parentRelation.userId,
            status: 'completed',
          },
        });

        if (records.length === 0) return null;

        const averageScore = Math.round(
          records.reduce((sum, r) => sum + (r.totalScore || 0), 0) / records.length
        );

        // 只返回平均分低于75的学生
        if (averageScore < 75) {
          // 计算年龄
          const calculateAge = (birthDate: Date | null) => {
            if (!birthDate) return null;
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            return age;
          };

          return {
            id: student.id,
            name: student.name,
            age: calculateAge(student.birthDate),
            gender: student.gender,
            avatar: student.photoUrl,
            averageScore,
            focusReason: '测评分数偏低，建议加强关注和指导',
          };
        }

        return null;
      })
    );

    const validFocusStudents = focusStudents.filter((s) => s !== null);

    res.json({
      success: true,
      data: validFocusStudents,
    });
  } catch (error: any) {
    console.error('[TEACHER]: 获取重点关注学生失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取重点关注学生失败',
    });
  }
});

export default router;

