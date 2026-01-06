/**
 * 学生管理服务
 * 处理与学生相关的业务逻辑
 */
import {
  Student,
} from '../../models/student.model';
import { Kindergarten } from '../../models/kindergarten.model';
import { Class } from '../../models/class.model';
import { ParentStudentRelation } from '../../models/parent-student-relation.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { Op, FindOptions, WhereOptions, Transaction, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../../init';
import { SearchHelper, SearchParams, PaginationHelper } from '../../utils/search-helper';
import {
  CreateStudentDto,
  UpdateStudentDto,
  AssignClassDto,
  BatchAssignClassDto,
  UpdateStudentStatusDto,
} from '../../types/student';
import {
  createStudentSchema,
  updateStudentSchema,
  assignClassSchema,
  batchAssignClassSchema,
  updateStudentStatusSchema,
  studentFilterSchema,
} from '../../validations/student.validation';

// 服务层内部类型定义
interface StudentFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  kindergartenId?: number;
  classId?: number;
  status?: number;
  gender?: number;
  ageStart?: number;
  ageEnd?: number;
  enrollmentDateStart?: string;
  enrollmentDateEnd?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 创建学生时需要的属性
type StudentCreationData = Omit<InferCreationAttributes<Student>, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'graduationDate'>;

export class StudentService {
  /**
   * 创建新学生
   */
  public async createStudent(
    dto: CreateStudentDto,
    creatorId: number
  ): Promise<Student> {
    const { error } = createStudentSchema.validate(dto);
    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return sequelize.transaction(async (transaction: Transaction) => {
      const existingStudent = await Student.findOne({
        where: { studentNo: dto.studentNo },
        transaction,
      });
      if (existingStudent) {
        throw ApiError.badRequest('学号已存在');
      }

      const kindergarten = await Kindergarten.findByPk(dto.kindergartenId, {
        transaction,
      });
      if (!kindergarten) {
        throw ApiError.notFound('指定的幼儿园不存在');
      }

      if (dto.classId) {
        const classExists = await Class.findByPk(dto.classId, { transaction });
        if (!classExists) {
          throw ApiError.notFound('指定的班级不存在');
        }
      }

      const studentData = {
        ...dto,
        status: dto.status ?? 1,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : new Date(),
        enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date(),
        interests: (Array.isArray(dto.interests) ? dto.interests.join(',') : dto.interests) || null,
        tags: (Array.isArray(dto.tags) ? dto.tags.join(',') : dto.tags) || null,
        creatorId,
        updaterId: creatorId,
      } as StudentCreationData;

      const student = await Student.create(studentData, { transaction });
      return this.getStudentById(student.id, transaction);
    });
  }

  /**
   * 获取学生列表（分页和过滤）
   */
  public async getStudents(
    filters: any
  ): Promise<{ rows: Student[]; count: number }> {
    const sequelize = Student.sequelize;
    if (!sequelize) {
      throw ApiError.serverError('数据库连接不可用');
    }

    // 构建搜索参数
    const searchParams: SearchParams = {
      keyword: filters.keyword,
      page: filters.page ? Number(filters.page) : 1,
      pageSize: filters.pageSize ? Number(filters.pageSize) : 10,
      sortBy: filters.sortBy || 'created_at',
      sortOrder: filters.sortOrder || 'DESC',
      status: filters.status,
      grade: filters.grade,
      classId: filters.classId ? Number(filters.classId) : undefined,
      kindergartenId: filters.kindergartenId ? Number(filters.kindergartenId) : undefined,
      gender: filters.gender,
      ageStart: filters.ageStart,
      ageEnd: filters.ageEnd,
      enrollmentDateStart: filters.enrollmentDateStart,
      enrollmentDateEnd: filters.enrollmentDateEnd,
      tags: filters.tags
    };

    // 使用SearchHelper构建查询，使用学生搜索配置
    const searchConfig = SearchHelper.configs.student;
    const queryResult = SearchHelper.buildSearchQuery(searchParams, searchConfig, 's');

    // 处理权限过滤
    let whereClause = queryResult.whereClause;
    const replacements = { ...queryResult.replacements };

    // 处理 parentId 过滤 - 只显示当前家长的孩子
    if (filters.parentId) {
      // 如果指定了 parentId，只查询该家长关联的学生
      whereClause = `s.id IN (
        SELECT student_id FROM parent_student_relations
        WHERE user_id = :parentId AND deleted_at IS NULL
      ) AND ${whereClause}`;
      replacements.parentId = Number(filters.parentId);
    }

    // 处理 teacherId 过滤 - 只显示该教师管理的班级的学生
    if (filters.teacherId) {
      whereClause = `s.id IN (
        SELECT s2.id FROM students s2
        INNER JOIN classes c ON s2.class_id = c.id
        INNER JOIN class_teachers ct ON c.id = ct.class_id
        WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL
      ) AND ${whereClause}`;
      replacements.teacherId = Number(filters.teacherId);
    }

    // 计数查询
    const countQuery = `
      SELECT COUNT(*) as total
      FROM students s
      LEFT JOIN users p ON s.id = p.id
      WHERE ${whereClause}
    `;

    // 数据查询
    const dataQuery = `
      SELECT
        s.*,
        k.id as kindergarten_id,
        k.name as kindergarten_name,
        c.id as class_id,
        c.name as class_name
      FROM students s
      LEFT JOIN kindergartens k ON s.kindergarten_id = k.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users p ON s.id = p.id
      WHERE ${whereClause}
      ${queryResult.orderBy}
      LIMIT ${queryResult.limit} OFFSET ${queryResult.offset}
    `;

    // 执行查询
    const [countResult, dataResult] = await Promise.all([
      sequelize.query(countQuery, {
        replacements,
        type: 'SELECT'
      }),
      sequelize.query(dataQuery, {
        replacements,
        type: 'SELECT'
      })
    ]);

    const countList = Array.isArray(countResult) ? countResult : [];
    const count = countList.length > 0 ? (countList[0] as Record<string, any>).total : 0;

    const dataList = Array.isArray(dataResult) ? dataResult : [];
    const rows = dataList.map((item: any) => ({
      ...item,
      kindergarten: item.kindergarten_id ? {
        id: item.kindergarten_id,
        name: item.kindergarten_name
      } : null,
      class: item.class_id ? {
        id: item.class_id,
        name: item.class_name
      } : null
    }));

    return { rows: rows as Student[], count: Number(count) };
  }

  /**
   * 搜索学生
   */
  public async searchStudents(
    filters: any
  ): Promise<{ rows: Student[]; count: number }> {
    // 直接调用getStudents方法，添加status=1的过滤条件
    const searchFilters = {
      ...filters,
      status: 1  // 只搜索正常状态的学生
    };
    
    return this.getStudents(searchFilters);
  }

  /**
   * 获取可用学生列表（未分配班级的学生）
   */
  public async getAvailableStudents(
    filters: any
  ): Promise<{ rows: Student[]; count: number }> {
    // 直接调用getStudents方法，添加特定的过滤条件
    const availableFilters = {
      ...filters,
      status: 1,  // 只查询正常状态的学生
      classId: null  // 未分配班级的学生
    };
    
    return this.getStudents(availableFilters);
  }

  /**
   * 获取学生详情
   */
  public async getStudentById(
    id: number,
    transaction?: Transaction
  ): Promise<Student> {
    // 使用原始SQL查询避免关联问题
    const sequelize = Student.sequelize;
    if (!sequelize) {
      throw ApiError.serverError('数据库连接不可用');
    }

    const query = `
      SELECT 
        s.*,
        k.id as kindergarten_id,
        k.name as kindergarten_name,
        c.id as class_id,
        c.name as class_name
      FROM students s
      LEFT JOIN kindergartens k ON s.kindergarten_id = k.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = :studentId AND s.deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { studentId: id },
      type: 'SELECT',
      transaction
    });

    const resultList = Array.isArray(results) ? results : [];
    const studentData = resultList.length > 0 ? resultList[0] as Record<string, any> : null;
    
    if (!studentData) {
      throw ApiError.notFound('学生不存在');
    }

    // 构造返回对象
    const student = {
      ...studentData,
      kindergarten: studentData.kindergarten_id ? {
        id: studentData.kindergarten_id,
        name: studentData.kindergarten_name
      } : null,
      class: studentData.class_id ? {
        id: studentData.class_id,
        name: studentData.class_name
      } : null
    };

    return student as any;
  }

  /**
   * 获取学生的家长列表
   */
  public async getStudentParents(studentId: number): Promise<ParentStudentRelation[]> {
    // 先检查学生是否存在
    const student = await this.getStudentById(studentId);
    if (!student) {
      throw ApiError.notFound('学生不存在');
    }

    const sequelize = Student.sequelize;
    if (!sequelize) {
      throw ApiError.serverError('数据库连接不可用');
    }

    const query = `
      SELECT 
        psr.*,
        u.id as user_id,
        u.username,
        u.email,
        u.real_name
      FROM parent_student_relations psr
      LEFT JOIN users u ON psr.user_id = u.id
      WHERE psr.student_id = :studentId AND psr.deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { studentId },
      type: 'SELECT'
    });

    const resultList = Array.isArray(results) ? results : [];
    const parents = resultList.map((item: any) => ({
      ...item,
      user: item.user_id ? {
        id: item.user_id,
        username: item.username,
        email: item.email,
        realName: item.real_name
      } : null
    }));

    return parents as ParentStudentRelation[];
  }

  /**
   * 更新学生信息
   */
  public async updateStudent(
    id: number,
    dto: UpdateStudentDto,
    updaterId: number
  ): Promise<Student> {
    const { error } = updateStudentSchema.validate(dto);
    if (error) {
      throw ApiError.badRequest(error.message);
    }

    // 先检查学生是否存在
    const existingStudent = await this.getStudentById(id);
    if (!existingStudent) {
      throw ApiError.notFound('学生不存在');
    }
    
    const { interests, tags, ...restDto } = dto;
    const updateData: Partial<StudentCreationData> = { ...restDto, updaterId };

    if (interests !== undefined) {
      updateData.interests = Array.isArray(interests) ? interests.join(',') : interests;
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
    }

    // 使用Sequelize模型的update方法
    await Student.update(updateData, {
      where: { id }
    });
    
    return this.getStudentById(id);
  }

  /**
   * 删除学生
   */
  public async deleteStudent(id: number, deleterId: number): Promise<void> {
    // 检查学生是否存在，如果不存在则直接返回（幂等性）
    try {
      await this.getStudentById(id);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        // 学生不存在，删除操作视为成功（幂等性）
        return;
      }
      throw error;
    }

    // 使用Sequelize模型的update和destroy方法
    await Student.update({ updaterId: deleterId }, { where: { id } });
    await Student.destroy({ where: { id } });
  }

  /**
   * 为学生分配班级
   */
  public async assignStudentToClass(
    dto: AssignClassDto,
    updaterId: number
  ): Promise<Student> {
    const { error } = assignClassSchema.validate(dto);
    if (error) {
      throw ApiError.badRequest(error.message);
    }
    const { studentId, classId } = dto;
    
    // 检查学生是否存在
    const existingStudent = await this.getStudentById(studentId);
    if (!existingStudent) {
      throw ApiError.notFound('学生不存在');
    }
    
    const classItem = await Class.findByPk(classId);
    if (!classItem) {
      throw ApiError.notFound('班级不存在');
    }
    
    await Student.update({ classId, updaterId }, { where: { id: studentId } });
    return this.getStudentById(studentId);
  }

  /**
   * 批量分配班级
   */
  public async batchAssignStudentsToClass(
    dto: BatchAssignClassDto,
    updaterId: number
  ): Promise<{ updatedCount: number }> {
    const { error } = batchAssignClassSchema.validate(dto);
    if (error) {
      throw ApiError.badRequest(error.message);
    }

    const { studentIds, classId } = dto;
    const classItem = await Class.findByPk(classId);
    if (!classItem) {
      throw ApiError.notFound('班级不存在');
    }

    const [updatedCount] = await Student.update(
      { classId, updaterId },
      { where: { id: { [Op.in]: studentIds } } }
    );
    return { updatedCount };
  }

  /**
   * 更新学生状态
   */
  public async updateStudentStatus(
    dto: UpdateStudentStatusDto,
    updaterId: number
  ): Promise<{ success: boolean }> {
    const { error } = updateStudentStatusSchema.validate(dto);
    if (error) {
      throw ApiError.badRequest(error.message);
    }
    const { studentId, status } = dto;
    
    // 检查学生是否存在
    const existingStudent = await this.getStudentById(studentId);
    if (!existingStudent) {
      throw ApiError.notFound('学生不存在');
    }
    
    await Student.update({ status, updaterId }, { where: { id: studentId } });
    return { success: true };
  }

  /**
   * 获取学生统计数据
   */
  public async getStudentStats(): Promise<any> {
    try {
      const sequelizeInstance = Student.sequelize;
      if (!sequelizeInstance) {
        throw ApiError.serverError('数据库连接不可用');
      }

      // 获取基本统计
      const [basicStats] = await sequelizeInstance.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN gender = 1 THEN 1 ELSE 0 END) as male,
          SUM(CASE WHEN gender = 0 THEN 1 ELSE 0 END) as female,
          SUM(CASE WHEN class_id IS NOT NULL AND class_id > 0 THEN 1 ELSE 0 END) as assigned,
          SUM(CASE WHEN class_id IS NULL OR class_id = 0 THEN 1 ELSE 0 END) as unassigned
        FROM students 
        WHERE deleted_at IS NULL
      `);

      // 获取年龄分布
      const [ageStats] = await sequelizeInstance.query(`
        SELECT 
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '0-3岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 6 THEN '5-6岁'
            ELSE '6岁以上'
          END as ageGroup,
          COUNT(*) as count
        FROM students 
        WHERE deleted_at IS NULL
        GROUP BY 
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '0-3岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5岁'
            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 6 THEN '5-6岁'
            ELSE '6岁以上'
          END
        ORDER BY ageGroup
      `);

      const stats = Array.isArray(basicStats) ? basicStats[0] : basicStats;
      const statsData = stats as Record<string, any>;
      
      return {
        success: true,
        message: '获取学生统计成功',
        data: {
          total: Number(statsData.total) || 0,
          active: Number(statsData.active) || 0,
          inactive: Number(statsData.inactive) || 0,
          male: Number(statsData.male) || 0,
          female: Number(statsData.female) || 0,
          assigned: Number(statsData.assigned) || 0,
          unassigned: Number(statsData.unassigned) || 0,
          ageDistribution: ageStats || []
        }
      };
    } catch (error) {
      console.error('获取学生统计失败:', error);
      throw ApiError.serverError('获取学生统计失败');
    }
  }
  /**
   * 按班级获取学生列表
   */
  public async getStudentsByClass(params: {
    classId: string;
    page: number;
    pageSize: number;
    keyword?: string;
  }): Promise<{ list: any[]; total: number; page: number; pageSize: number }> {
    const sequelizeInstance = Student.sequelize;
    if (!sequelizeInstance) {
      throw ApiError.serverError('数据库连接不可用');
    }

    const { classId, page, pageSize, keyword } = params;
    const offset = (page - 1) * pageSize;

    // 构建WHERE条件
    let whereClause = 'WHERE s.class_id = :classId AND s.deleted_at IS NULL';
    const replacements: any = { classId: parseInt(classId, 10) };

    if (keyword) {
      whereClause += ' AND (s.name LIKE :keyword OR s.student_no LIKE :keyword)';
      replacements.keyword = `%${keyword}%`;
    }

    // 计数查询
    const countQuery = `
      SELECT COUNT(*) as total
      FROM students s
      ${whereClause}
    `;

    // 数据查询
    const dataQuery = `
      SELECT
        s.id,
        s.student_no as studentId,
        s.name,
        s.gender,
        TIMESTAMPDIFF(YEAR, s.birth_date, CURDATE()) as age,
        DATE_FORMAT(s.birth_date, '%Y-%m-%d') as birthDate,
        '' as parentName,
        '' as parentPhone,
        DATE_FORMAT(s.enrollment_date, '%Y-%m-%d') as enrollDate,
        CASE
          WHEN s.status = 1 THEN '在读'
          WHEN s.status = 0 THEN '退学'
          WHEN s.status = 2 THEN '休学'
          ELSE '请假'
        END as status,
        s.household_address as address,
        s.allergy_history as healthStatus,
        s.remark as remarks,
        c.name as className
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = pageSize;
    replacements.offset = offset;

    // 执行查询
    const [countResult, dataResult] = await Promise.all([
      sequelizeInstance.query(countQuery, {
        replacements,
        type: 'SELECT'
      }),
      sequelizeInstance.query(dataQuery, {
        replacements,
        type: 'SELECT'
      })
    ]);

    const countList = Array.isArray(countResult) ? countResult : [];
    const total = countList.length > 0 ? (countList[0] as Record<string, any>).total : 0;

    const dataList = Array.isArray(dataResult) ? dataResult : [];
    const list = dataList.map((item: any) => ({
      ...item,
      gender: item.gender === 1 ? '男' : '女',
      healthStatus: item.healthStatus ? item.healthStatus.split(',') : ['healthy']
    }));

    return {
      list,
      total: Number(total),
      page,
      pageSize
    };
  }

  /**
   * 添加学生到班级
   */
  public async addToClass(studentData: any, creatorId: number): Promise<any> {
    return sequelize.transaction(async (transaction) => {
      // 检查班级是否存在
      const classItem = await Class.findByPk(studentData.classId, { transaction });
      if (!classItem) {
        throw ApiError.notFound('班级不存在');
      }

      // 检查学号是否已存在
      const existingStudent = await Student.findOne({
        where: { studentNo: studentData.studentId },
        transaction
      });
      if (existingStudent) {
        throw ApiError.badRequest('学号已存在');
      }

      // 创建学生数据
      const newStudentData = {
        name: studentData.name,
        studentNo: studentData.studentId,
        classId: parseInt(studentData.classId, 10),
        kindergartenId: 1, // 默认幼儿园ID，实际应该从用户信息获取
        status: 1, // 在读状态
        birthDate: new Date(studentData.birthDate),
        enrollmentDate: new Date(studentData.enrollDate || new Date()),
        gender: studentData.gender === '男' ? 1 : 2,
        allergyHistory: Array.isArray(studentData.healthStatus) ? studentData.healthStatus.join(',') : 'healthy',
        remark: studentData.remarks,
        householdAddress: studentData.address,
        creatorId,
        updaterId: creatorId
      };

      const student = await Student.create(newStudentData, { transaction });
      return this.getStudentById(student.id, transaction);
    });
  }

  /**
   * 从班级移除学生
   */
  public async removeFromClass(studentId: number, classId: string, updaterId: number): Promise<boolean> {
    return sequelize.transaction(async (transaction) => {
      // 检查学生是否存在
      const student = await Student.findByPk(studentId, { transaction });
      if (!student) {
        throw ApiError.notFound('学生不存在');
      }

      // 检查学生是否在指定班级中
      if (student.classId !== parseInt(classId, 10)) {
        throw ApiError.badRequest('学生不在指定班级中');
      }

      // 将学生的班级ID设为null，表示从班级中移除
      await Student.update(
        { classId: null, updaterId },
        { where: { id: studentId }, transaction }
      );

      return true;
    });
  }
}

export default StudentService;