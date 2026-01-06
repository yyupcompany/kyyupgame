import { Request, Response } from 'express';
import {  Teacher  } from '../models/index';
import {  User  } from '../models/index';
import {  Kindergarten  } from '../models/index';
import {  Class  } from '../models/index';
import { sequelize } from '../init';
import { Op, WhereOptions, Transaction, Includeable } from 'sequelize';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { CreateTeacherDto, UpdateTeacherDto } from '../types/teacher';
import { SqlHelper } from '../utils/sqlHelper';
import { SearchHelper, SearchParams, PaginationHelper } from '../utils/search-helper';
import { QueryTypes } from 'sequelize';

// 扩展 Teacher 模型接口以包含 setClasses 方法
declare module '../models/teacher.model' {
  interface Teacher {
    setClasses(classes: Class[], options?: unknown): Promise<void>;
    name?: string; // 从User模型关联获取
    employeeId?: string; // 映射到teacherNo
  }
}

// 扩展 Request 类型以包含 user 属性
declare module 'express' {
  interface Request {
    user?: User;
  }
}

/**
 * 教师控制器
 * 处理与教师相关的所有请求
 */
export class TeacherController {
  /**
   * 创建教师
   * @param req 请求对象
   * @param res 响应对象
   */
  public async create(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();

    try {
      const teacherData = req.body as CreateTeacherDto;
      const kindergartenId = teacherData.kindergartenId || (req.user as any)?.kindergartenId;

      // 🔍 调试日志
      console.log('📋 [教师创建] 接收到的请求数据:', {
        kindergartenId,
        userId: teacherData.userId,
        realName: teacherData.realName,
        phone: teacherData.phone,
        position: teacherData.position,
        roleId: teacherData.roleId
      });

      // 场景1：从人员中心创建（提供 realName、phone、email 等）
      let userId = teacherData.userId;
      if (!userId && teacherData.realName && teacherData.phone) {
        console.log('📝 场景1：从人员中心创建教师，需要先创建用户');

        // 创建用户
        const userResult = await SqlHelper.insert('users', {
          username: teacherData.phone,
          password: await require('bcrypt').hash('123456', 10),
          real_name: teacherData.realName,
          phone: teacherData.phone,
          email: teacherData.email || '',
          role: 'teacher',
          status: 'active'
        }, { transaction });

        userId = userResult.insertId;
        console.log('✅ 用户创建成功, ID:', userId);

        // 创建 user_roles 关联
        if (teacherData.roleId) {
          await SqlHelper.insert('user_roles', {
            user_id: userId,
            role_id: teacherData.roleId,
            created_at: new Date(),
            updated_at: new Date()
          }, { transaction });
          console.log('✅ user_roles 创建成功, roleId:', teacherData.roleId);
        }
      }

      // 🔍 验证前的调试日志
      console.log('🔍 [教师创建] 验证前的数据:', {
        userId,
        kindergartenId,
        position: teacherData.position,
        positionType: typeof teacherData.position
      });

      // 验证必填字段
      if (!userId || !kindergartenId || !teacherData.position) {
        console.log('❌ [教师创建] 验证失败:', {
          userIdValid: !!userId,
          kindergartenIdValid: !!kindergartenId,
          positionValid: !!teacherData.position
        });
        throw ApiError.badRequest('缺少必填字段', 'MISSING_REQUIRED_FIELDS');
      }

      // 检查幼儿园是否存在
      const kindergartenExists = await SqlHelper.recordExists(
        'kindergartens',
        'id',
        kindergartenId,
        { transaction }
      );

      if (!kindergartenExists) {
        throw ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      // 检查用户是否存在
      const userExists = await SqlHelper.recordExists(
        'users',
        'id',
        userId,
        { transaction }
      );

      if (!userExists) {
        throw ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
      }

      // 如果提供了教师编号，检查是否已存在
      if (teacherData.teacherNo) {
        const existingTeacher = await SqlHelper.recordExists(
          'teachers',
          'teacher_no',
          teacherData.teacherNo,
          { transaction }
        );

        if (existingTeacher) {
          throw ApiError.badRequest('教师编号已存在', 'TEACHER_NO_EXISTS');
        }
      }

      // 获取幼儿园的 group_id
      const kindergartenInfo = await SqlHelper.getRecord(
        'kindergartens',
        'id',
        kindergartenId,
        { transaction }
      );
      const groupId = kindergartenInfo?.group_id;

      // 准备教师数据
      const teacherDataObj: Record<string, any> = {
        userId,
        kindergartenId,
        groupId,  // ✅ 绑定集团ID
        teacherNo: teacherData.teacherNo || '',
        position: Number(teacherData.position),
        status: teacherData.status || 1
      };

      // 只添加有值的可选字段
      if (teacherData.remark) {
        teacherDataObj.remark = teacherData.remark;
      }
      if (teacherData.hireDate) {
        teacherDataObj.hireDate = teacherData.hireDate;
      }
      if (teacherData.education) {
        teacherDataObj.education = teacherData.education;
      }
      if (teacherData.major) {
        teacherDataObj.major = teacherData.major;
      }

      const teacherDataToInsert = SqlHelper.camelToSnake(teacherDataObj);

      // 创建教师
      const result = await SqlHelper.insert('teachers', teacherDataToInsert, { transaction });
      const teacherId = result.insertId;

      // 如果提供了班级ID列表，关联班级
      if (teacherData.classIds && teacherData.classIds.length > 0) {
        // 验证班级是否存在
        const classesCount = await SqlHelper.getCount('classes', {
          where: `id IN (${teacherData.classIds.join(',')})`,
          transaction
        });
        
        if (classesCount > 0) {
          // 创建教师-班级关联
          const teacherClassValues = teacherData.classIds.map(classId => [
            teacherId,
            classId,
            new Date(),
            new Date()
          ]);
          
          await SqlHelper.batchInsert(
            'class_teachers',
            ['teacher_id', 'class_id', 'created_at', 'updated_at'],
            teacherClassValues,
            transaction
          );
        }
      }

      // 获取完整的教师信息
      const teacherQuery = `
        SELECT t.*,
               u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,
               k.id AS kindergarten_id, k.name AS kindergarten_name,
               g.id AS group_id, g.name AS group_name
        FROM ${tenantDb}.teachers t
        JOIN ${tenantDb}.users u ON t.user_id = u.id
        JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        LEFT JOIN ${tenantDb}.\`groups\` g ON t.group_id = g.id
        WHERE t.id = :teacherId
      `;

      const teachers = await sequelize.query(teacherQuery, {
        replacements: { teacherId },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];

      let responseData = null;
      if (teachers && teachers.length > 0) {
        const teacherRecord = teachers[0];

        // ✅ 返回完整的用户和教师信息
        responseData = {
          user: {
            id: teacherRecord.user_id,
            username: teacherRecord.username,
            realName: teacherRecord.user_name,
            phone: teacherRecord.phone,
            email: teacherRecord.email,
            role: 'teacher',
            status: 'active'
          },
          teacher: {
            id: teacherRecord.id,
            userId: teacherRecord.user_id,
            kindergartenId: teacherRecord.kindergarten_id,
            kindergartenName: teacherRecord.kindergarten_name,
            groupId: teacherRecord.group_id,
            groupName: teacherRecord.group_name,
            teacherNo: teacherRecord.teacher_no,
            position: teacherRecord.position,
            status: teacherRecord.status
          }
        };

        // 获取关联的班级
        if (teacherData.classIds && teacherData.classIds.length > 0) {
          const classesQuery = `
            SELECT c.*
            FROM ${tenantDb}.classes c
            JOIN ${tenantDb}.class_teachers ct ON c.id = ct.class_id
            WHERE ct.teacher_id = :teacherId
          `;

          const classes = await sequelize.query(classesQuery, {
            replacements: { teacherId },
            type: QueryTypes.SELECT,
            transaction
          }) as Record<string, any>[];

          responseData.teacher.classes = classes.map(c => SqlHelper.snakeToCamel(c));
        }
      }

      await transaction.commit();
      ApiResponse.success(res, responseData, '创建教师成功');
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('创建教师错误详情:', error);
      throw ApiError.serverError('创建教师失败: ' + (error as Error).message, 'TEACHER_CREATE_ERROR');
    }
  }

  /**
   * 获取教师列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async list(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      // 构建搜索参数
      const searchParams: SearchParams = {
        keyword: req.query.keyword as string,
        page: req.query.page ? Number(req.query.page) : 1,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
        kindergartenId: req.query.kindergartenId ? Number(req.query.kindergartenId) : undefined,
        status: req.query.status
      };

      // 使用SearchHelper构建查询
      const searchConfig = SearchHelper.configs.teacher;
      const queryResult = SearchHelper.buildSearchQuery(searchParams, searchConfig, 't');
      
      // 查询总记录数
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE ${queryResult.whereClause}
      `;
      
      const countResult = await sequelize.query(countQuery, {
        replacements: queryResult.replacements,
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      const total = countResult && countResult.length > 0 ? Number(countResult[0].total) : 0;
      
      // 如果没有记录，直接返回空数组
      if (total === 0) {
        const paginationResponse = PaginationHelper.buildResponse([], 0, searchParams.page!, searchParams.pageSize!);
        ApiResponse.success(res, paginationResponse, '获取教师列表成功');
        return;
      }
      
      // 查询教师列表
      const teachersQuery = `
        SELECT 
          t.*,
          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,
          k.id AS kindergarten_id, k.name AS kindergarten_name
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE ${queryResult.whereClause}
        ${queryResult.orderBy}
        LIMIT ${queryResult.limit} OFFSET ${queryResult.offset}
      `;
      
      const teachers = await sequelize.query(teachersQuery, {
        replacements: queryResult.replacements,
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 获取所有教师的ID
      const teacherIds = teachers.map(t => t.id);
      
      // 暂时跳过班级关联查询，避免表名问题
      let teacherClassesMap: Record<number, any[]> = {};
      
      // 格式化教师数据
      const formattedTeachers = teachers.map(teacher => {
        const teacherId = teacher.id;
        const formattedTeacher = SqlHelper.snakeToCamel(teacher);
        
        // 组织返回数据结构
        return {
          ...formattedTeacher,
          user: {
            id: teacher.user_id,
            username: teacher.username,
            name: teacher.user_name,
            phone: teacher.phone,
            email: teacher.email
          },
          kindergarten: {
            id: teacher.kindergarten_id,
            name: teacher.kindergarten_name
          },
          classes: teacherClassesMap[teacherId] || []
        };
      });
      
      // 使用PaginationHelper构建响应
      const paginationResponse = PaginationHelper.buildResponse(
        formattedTeachers, 
        total, 
        searchParams.page!, 
        searchParams.pageSize!
      );
      
      ApiResponse.success(res, paginationResponse, '获取教师列表成功');
    } catch (error) {
      console.error('教师列表API出错:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取教师列表失败', 'TEACHER_LIST_ERROR');
    }
  }

  /**
   * 获取教师详情
   * @param req 请求对象
   * @param res 响应对象
   */
  public async detail(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        throw ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
      }
      
      // 查询教师基本信息及关联的用户、幼儿园信息
      const teacherQuery = `
        SELECT 
          t.*,
          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,
          k.id AS kindergarten_id, k.name AS kindergarten_name
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE t.id = :id AND t.deleted_at IS NULL
      `;
      
      const teachers = await sequelize.query(teacherQuery, {
        replacements: { id: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      if (!teachers || teachers.length === 0) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }
      
      const teacher = teachers[0];
      const formattedTeacher = SqlHelper.snakeToCamel(teacher);
      
      // 查询教师关联的班级信息
      const classesQuery = `
        SELECT 
          c.id, c.name, c.code, c.type, c.grade, c.status,
          c.capacity, c.current_student_count, c.classroom, c.description, c.image_url
        FROM ${tenantDb}.classes c
        JOIN ${tenantDb}.class_teachers ct ON c.id = ct.class_id
        WHERE ct.teacher_id = :teacherId
        AND ct.deleted_at IS NULL
        AND c.deleted_at IS NULL
      `;
      
      const classes = await sequelize.query(classesQuery, {
        replacements: { teacherId: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 格式化返回数据
      const result = {
        ...formattedTeacher,
        user: {
          id: teacher.user_id,
          username: teacher.username,
          name: teacher.user_name,
          phone: teacher.phone,
          email: teacher.email
        },
        kindergarten: {
          id: teacher.kindergarten_id,
          name: teacher.kindergarten_name
        },
        classes: classes.map(c => SqlHelper.snakeToCamel(c))
      };
      
      ApiResponse.success(res, result, '获取教师详情成功');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取教师详情失败', 'TEACHER_DETAIL_ERROR');
    }
  }

  /**
   * 根据用户ID获取教师信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getByUserId(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const { userId } = req.params;
      
      if (!userId || isNaN(Number(userId))) {
        throw ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
      }
      
      // 查询教师基本信息及关联的用户、幼儿园信息
      const teacherQuery = `
        SELECT 
          t.*,
          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,
          k.id AS kindergarten_id, k.name AS kindergarten_name
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE t.user_id = :userId AND t.deleted_at IS NULL
      `;
      
      const teachers = await sequelize.query(teacherQuery, {
        replacements: { userId: Number(userId) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      if (!teachers || teachers.length === 0) {
        throw ApiError.notFound('未找到该用户对应的教师信息', 'TEACHER_NOT_FOUND_FOR_USER');
      }
      
      const teacher = teachers[0];
      const formattedTeacher = SqlHelper.snakeToCamel(teacher);
      
      // 查询教师关联的班级信息
      const classesQuery = `
        SELECT 
          c.id, c.name, c.code, c.type, c.grade, c.status,
          c.capacity, c.current_student_count, c.classroom, c.description, c.image_url
        FROM ${tenantDb}.classes c
        JOIN ${tenantDb}.class_teachers ct ON c.id = ct.class_id
        WHERE ct.teacher_id = :teacherId 
        AND ct.deleted_at IS NULL
        AND c.deleted_at IS NULL
      `;
      
      const classes = await sequelize.query(classesQuery, {
        replacements: { teacherId: teacher.id },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 构建返回结果
      const result = {
        ...formattedTeacher,
        user: {
          id: teacher.user_id,
          username: teacher.username,
          name: teacher.user_name,
          phone: teacher.phone,
          email: teacher.email
        },
        kindergarten: {
          id: teacher.kindergarten_id,
          name: teacher.kindergarten_name
        },
        classes: classes.map(c => SqlHelper.snakeToCamel(c))
      };
      
      ApiResponse.success(res, result, '获取教师信息成功');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取教师信息失败', 'TEACHER_GET_BY_USER_ERROR');
    }
  }

  /**
   * 更新教师信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async update(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const teacherData = req.body as UpdateTeacherDto;
      
      if (!id || isNaN(Number(id))) {
        throw ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
      }

      // 检查教师是否存在
      const teacherExists = await SqlHelper.recordExists(
        'teachers', 
        'id', 
        Number(id), 
        { transaction }
      );
      
      if (!teacherExists) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }
      
      // 获取教师当前信息
      const teacher = await SqlHelper.getRecord('teachers', 'id', Number(id), { transaction });
      
      if (!teacher) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }

      // 如果更新教师编号，检查是否已存在
      if (teacherData.teacherNo && teacherData.teacherNo !== teacher.teacher_no) {
        const existingTeacherExists = await SqlHelper.recordExists(
          'teachers', 
          'teacher_no', 
          teacherData.teacherNo, 
          { 
            whereAddition: `id <> ${Number(id)}`, 
            transaction 
          }
        );

        if (existingTeacherExists) {
          throw ApiError.badRequest('教师编号已存在', 'TEACHER_NO_EXISTS');
        }
      }

      // 如果更新幼儿园，检查幼儿园是否存在
      if (teacherData.kindergartenId && teacherData.kindergartenId !== teacher.kindergarten_id) {
        const kindergartenExists = await SqlHelper.recordExists(
          'kindergartens', 
          'id', 
          teacherData.kindergartenId, 
          { transaction }
        );
        
        if (!kindergartenExists) {
          throw ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
        }
      }

      // 如果更新用户，检查用户是否存在
      if (teacherData.userId && teacherData.userId !== teacher.user_id) {
        const userExists = await SqlHelper.recordExists(
          'users', 
          'id', 
          teacherData.userId, 
          { transaction }
        );
        
        if (!userExists) {
          throw ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
        }
      }

      // 准备更新数据
      const updateData: Record<string, any> = {};
      
      if (teacherData.userId !== undefined) updateData.user_id = teacherData.userId;
      if (teacherData.kindergartenId !== undefined) updateData.kindergarten_id = teacherData.kindergartenId;
      if (teacherData.teacherNo !== undefined) updateData.teacher_no = teacherData.teacherNo;
      if (teacherData.position !== undefined) updateData.position = Number(teacherData.position);
      if (teacherData.status !== undefined) updateData.status = teacherData.status;
      if (teacherData.remark !== undefined) updateData.remark = teacherData.remark;
      updateData.updated_at = new Date();

      // 更新教师信息
      await SqlHelper.update(
        'teachers', 
        updateData, 
        `id = ${Number(id)}`, 
        { transaction }
      );

      // 如果提供了班级ID列表，更新班级关联
      if (teacherData.classIds) {
        // 首先软删除现有的班级关联
        await sequelize.query(
          `UPDATE ${tenantDb}.class_teachers SET deleted_at = NOW() WHERE teacher_id = :teacherId`,
          {
            replacements: { teacherId: Number(id) },
            type: QueryTypes.UPDATE,
            transaction
          }
        );
        
        // 如果有新的班级关联，则添加
        if (teacherData.classIds.length > 0) {
          // 验证班级是否存在
          const classesCount = await SqlHelper.getCount('classes', {
            where: `id IN (${teacherData.classIds.join(',')})`,
            transaction
          });
          
          if (classesCount > 0) {
            // 创建新的教师-班级关联
            const teacherClassValues = teacherData.classIds.map(classId => [
              Number(id),
              classId,
              new Date(),
              new Date()
            ]);
            
            await SqlHelper.batchInsert(
              'class_teachers',
              ['teacher_id', 'class_id', 'created_at', 'updated_at'],
              teacherClassValues,
              transaction
            );
          }
        }
      }

      // 获取更新后的教师信息
      const teacherQuery = `
        SELECT 
          t.*,
          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email, u.avatar,
          k.id AS kindergarten_id, k.name AS kindergarten_name
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE t.id = :id AND t.deleted_at IS NULL
      `;
      
      const teachers = await sequelize.query(teacherQuery, {
        replacements: { id: Number(id) },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];
      
      if (!teachers || teachers.length === 0) {
        throw ApiError.serverError('获取更新后的教师信息失败', 'TEACHER_UPDATE_ERROR');
      }
      
      const updatedTeacher = teachers[0];
      const formattedTeacher = SqlHelper.snakeToCamel(updatedTeacher);
      
      // 获取关联的班级信息
      const classesQuery = `
        SELECT 
          c.id, c.name, c.code, c.type, c.grade, c.status
        FROM ${tenantDb}.classes c
        JOIN ${tenantDb}.class_teachers ct ON c.id = ct.class_id
        WHERE ct.teacher_id = :teacherId
        AND ct.deleted_at IS NULL
        AND c.deleted_at IS NULL
      `;
      
      const classes = await sequelize.query(classesQuery, {
        replacements: { teacherId: Number(id) },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];
      
      // 格式化返回数据
      const result = {
        ...formattedTeacher,
        user: {
          id: updatedTeacher.user_id,
          username: updatedTeacher.username,
          name: updatedTeacher.user_name,
          phone: updatedTeacher.phone,
          email: updatedTeacher.email,
          avatar: updatedTeacher.avatar
        },
        kindergarten: {
          id: updatedTeacher.kindergarten_id,
          name: updatedTeacher.kindergarten_name
        },
        classes: classes.map(c => SqlHelper.snakeToCamel(c))
      };

      await transaction.commit();
      ApiResponse.success(res, result, '更新教师信息成功');
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('教师更新错误:', error);
      throw ApiError.serverError('更新教师信息失败', 'TEACHER_UPDATE_ERROR');
    }
  }

  /**
   * 删除教师
   * @param req 请求对象
   * @param res 响应对象
   */
  public async delete(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        throw ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
      }

      // 检查教师是否存在
      const teacherExists = await SqlHelper.recordExists(
        'teachers', 
        'id', 
        Number(id), 
        { transaction }
      );
      
      if (!teacherExists) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }
      
      // 软删除教师-班级关联
      await sequelize.query(
        `UPDATE ${tenantDb}.class_teachers SET deleted_at = NOW() WHERE teacher_id = :teacherId`,
        {
          replacements: { teacherId: Number(id) },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
      
      // 软删除教师记录
      await SqlHelper.softDelete(
        'teachers', 
        'id', 
        Number(id), 
        { transaction }
      );

      await transaction.commit();
      ApiResponse.success(res, { message: '删除教师成功' });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('删除教师失败', 'TEACHER_DELETE_ERROR');
    }
  }

  /**
   * 获取教师统计信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async stats(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        throw ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
      }
      
      // 检查教师是否存在
      const teacherExists = await SqlHelper.recordExists('teachers', 'id', Number(id));
      if (!teacherExists) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }
      
      // 获取教师基本信息
      const teacherQuery = `
        SELECT 
          t.id, t.teacher_no, t.position, t.status,
          u.real_name as teacher_name, u.phone, u.email,
          k.name as kindergarten_name
        FROM ${tenantDb}.teachers t
        LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
        LEFT JOIN ${tenantDb}.kindergartens k ON t.kindergarten_id = k.id
        WHERE t.id = :id AND t.deleted_at IS NULL
      `;
      
      const teachers = await sequelize.query(teacherQuery, {
        replacements: { id: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      if (!teachers || teachers.length === 0) {
        throw ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
      }
      
      const teacher = teachers[0];
      
      // 获取班级统计
      const classStatsQuery = `
        SELECT 
          COUNT(*) as total_classes,
          SUM(CASE WHEN ct.is_main_teacher = 1 THEN 1 ELSE 0 END) as main_classes,
          COUNT(DISTINCT ct.subject) as subjects_count
        FROM ${tenantDb}.class_teachers ct
        WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL
      `;
      
      const classStats = await sequelize.query(classStatsQuery, {
        replacements: { teacherId: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 获取学生统计
      const studentStatsQuery = `
        SELECT 
          COUNT(DISTINCT s.id) as total_students,
          AVG(YEAR(CURDATE()) - YEAR(s.birth_date)) as average_age,
          COUNT(DISTINCT s.class_id) as classes_with_students
        FROM ${tenantDb}.students s
        JOIN ${tenantDb}.classes c ON s.class_id = c.id
        JOIN ${tenantDb}.class_teachers ct ON c.id = ct.class_id
        WHERE ct.teacher_id = :teacherId 
        AND ct.deleted_at IS NULL 
        AND s.deleted_at IS NULL
        AND c.deleted_at IS NULL
      `;
      
      const studentStats = await sequelize.query(studentStatsQuery, {
        replacements: { teacherId: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 获取科目分布
      const subjectStatsQuery = `
        SELECT 
          ct.subject,
          COUNT(*) as class_count,
          SUM(CASE WHEN ct.is_main_teacher = 1 THEN 1 ELSE 0 END) as main_teacher_count
        FROM ${tenantDb}.class_teachers ct
        WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL
        GROUP BY ct.subject
        ORDER BY class_count DESC
      `;
      
      const subjectStats = await sequelize.query(subjectStatsQuery, {
        replacements: { teacherId: Number(id) },
        type: QueryTypes.SELECT
      }) as Record<string, any>[];
      
      // 获取最近活动统计（如果有活动表）
      let activityStats = [];
      try {
        const activityStatsQuery = `
          SELECT 
            COUNT(*) as total_activities,
            SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) as active_activities,
            SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_activities
          FROM ${tenantDb}.activities a
          WHERE a.teacher_id = :teacherId AND a.deleted_at IS NULL
        `;
        
        const activityResults = await sequelize.query(activityStatsQuery, {
          replacements: { teacherId: Number(id) },
          type: QueryTypes.SELECT
        }) as Record<string, any>[];
        
        activityStats = activityResults;
      } catch (error) {
        // 如果活动表不存在或查询失败，使用默认值
        activityStats = [{ total_activities: 0, active_activities: 0, completed_activities: 0 }];
      }
      
      // 构建统计响应
      const stats = {
        teacher: {
          id: teacher.id,
          name: teacher.teacher_name || '未知教师',
          teacherNo: teacher.teacher_no,
          position: teacher.position,
          kindergartenName: teacher.kindergarten_name,
          phone: teacher.phone,
          email: teacher.email
        },
        class: {
          totalClasses: Number(classStats[0]?.total_classes || 0),
          mainClasses: Number(classStats[0]?.main_classes || 0),
          subjectsCount: Number(classStats[0]?.subjects_count || 0)
        },
        student: {
          totalStudents: Number(studentStats[0]?.total_students || 0),
          averageAge: Number(studentStats[0]?.average_age || 0),
          classesWithStudents: Number(studentStats[0]?.classes_with_students || 0)
        },
        subjects: subjectStats.map(subject => ({
          name: subject.subject,
          classCount: Number(subject.class_count),
          isMainTeacher: Number(subject.main_teacher_count) > 0
        })),
        activities: {
          total: Number(activityStats[0]?.total_activities || 0),
          active: Number(activityStats[0]?.active_activities || 0),
          completed: Number(activityStats[0]?.completed_activities || 0)
        }
      };
      
      ApiResponse.success(res, stats, '获取教师统计信息成功');
    } catch (error) {
      console.error('获取教师统计信息错误:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取教师统计信息失败', 'TEACHER_STATS_ERROR');
    }
  }

  /**
   * 获取全局教师统计信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async globalStats(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      // 获取教师总体统计
      const teacherStatsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN t.status = 0 THEN 1 ELSE 0 END) as inactive,
          COUNT(DISTINCT t.kindergarten_id) as kindergartens,
          COUNT(DISTINCT t.position) as positions
        FROM ${tenantDb}.teachers t
        WHERE t.deleted_at IS NULL
      `;
      
      const teacherStats = await sequelize.query(teacherStatsQuery, {
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      // 获取职位分布
      const positionStatsQuery = `
        SELECT 
          t.position,
          COUNT(*) as count
        FROM ${tenantDb}.teachers t
        WHERE t.deleted_at IS NULL AND t.position IS NOT NULL
        GROUP BY t.position
        ORDER BY count DESC
      `;
      
      const positionStats = await sequelize.query(positionStatsQuery, {
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      // 获取班级分配统计
      const classStatsQuery = `
        SELECT 
          COUNT(DISTINCT ct.teacher_id) as teachers_with_classes,
          COUNT(DISTINCT ct.class_id) as total_class_assignments,
          AVG(teacher_class_count.class_count) as avg_classes_per_teacher
        FROM ${tenantDb}.class_teachers ct
        LEFT JOIN (
          SELECT teacher_id, COUNT(*) as class_count
          FROM ${tenantDb}.class_teachers
          WHERE deleted_at IS NULL
          GROUP BY teacher_id
        ) teacher_class_count ON ct.teacher_id = teacher_class_count.teacher_id
        WHERE ct.deleted_at IS NULL
      `;
      
      const classStats = await sequelize.query(classStatsQuery, {
        type: QueryTypes.SELECT
      }) as Record<string, any>[];

      const stats = {
        total: Number(teacherStats[0]?.total || 0),
        active: Number(teacherStats[0]?.active || 0),
        inactive: Number(teacherStats[0]?.inactive || 0),
        kindergartens: Number(teacherStats[0]?.kindergartens || 0),
        positions: Number(teacherStats[0]?.positions || 0),
        positionDistribution: positionStats || [],
        classAssignments: {
          teachersWithClasses: Number(classStats[0]?.teachers_with_classes || 0),
          totalAssignments: Number(classStats[0]?.total_class_assignments || 0),
          avgClassesPerTeacher: Number(classStats[0]?.avg_classes_per_teacher || 0)
        }
      };

      ApiResponse.success(res, stats, '获取教师统计信息成功');
    } catch (error) {
      console.error('获取全局教师统计信息错误:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiResponse.error(res, '获取教师统计信息失败', 'INTERNAL_ERROR', 500);
    }
  }
}

export const teacherController = new TeacherController(); 
