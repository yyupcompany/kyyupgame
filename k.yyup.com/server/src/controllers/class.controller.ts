import { Request, Response } from 'express';
import {  Class as ClassModel  } from '../models/index';
import {  Kindergarten  } from '../models/index';
import {  Student  } from '../models/index';
import {  Teacher  } from '../models/index';
import {  ClassTeacher  } from '../models/index';
import { CreateClassDto, UpdateClassDto } from '../types/class';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import {  Op, WhereOptions, QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { formatPaginationResponse, safelyGetArrayFromQuery } from '../utils/data-formatter';
import { ClassListQueryResult, PaginationResponse, ApiResponse as ApiResponseType } from '../types/database.types';
import { SqlHelper } from '../utils/sqlHelper';

/**
 * 班级控制器
 * 处理与班级相关的所有请求
 */
export class ClassController {
  /**
   * 创建班级
   * @param req 请求对象
   * @param res 响应对象
   */
  public async create(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();
    try {
      const classData = req.body as CreateClassDto;
      const userId = req.user?.id;

      // 验证必填字段
      if (!classData.name || !classData.kindergartenId) {
        await transaction.rollback();
        return ApiResponse.error(res, '缺少必填字段', 'MISSING_REQUIRED_FIELDS', 400);
      }

      // 验证参数边界值
      if (classData.capacity !== undefined) {
        const capacity = Number(classData.capacity);
        if (isNaN(capacity) || capacity < 1 || capacity > 50) {
          await transaction.rollback();
          return ApiResponse.error(res, '班级容量必须在1-50之间', 'INVALID_CAPACITY', 400);
        }
      }

      if (classData.name && (typeof classData.name !== 'string' || classData.name.length > 50)) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级名称长度不能超过50字符', 'NAME_TOO_LONG', 400);
      }

      // 检查幼儿园是否存在
      const kindergartenExists = await SqlHelper.recordExists(
        'kindergartens', 
        'id', 
        classData.kindergartenId,
        { 
          whereAddition: 'deleted_at IS NULL',
          transaction 
        }
      );
      
      if (!kindergartenExists) {
        await transaction.rollback();
        return ApiResponse.error(res, '幼儿园不存在', 'KINDERGARTEN_NOT_FOUND', 400);
      }

      // 检查班级名称是否已存在
      const classExists = await SqlHelper.recordExists(
        'classes', 
        'name', 
        classData.name,
        { 
          whereAddition: 'kindergarten_id = :kindergartenId AND deleted_at IS NULL',
          replacements: { kindergartenId: classData.kindergartenId },
          transaction 
        }
      );

      if (classExists) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级名称已存在', 'CLASS_NAME_EXISTS', 400);
      }

      // 准备班级数据
      const now = new Date();
      
      // 生成班级代码（如果没有提供）
      const classCode = classData.code || `CLASS_${Date.now()}`;
      
      // 创建班级 - 使用 Sequelize ORM
      const newClass = await ClassModel.create({
        name: classData.name,
        code: classCode,
        kindergartenId: classData.kindergartenId,
        type: classData.type || 1,
        grade: classData.grade || null,
        headTeacherId: classData.headTeacherId || classData.teacherId || null,
        assistantTeacherId: classData.assistantTeacherId || null,
        capacity: classData.capacity || 30,
        currentStudentCount: 0,
        classroom: classData.classroom || null,
        description: classData.description || null,
        imageUrl: classData.imageUrl || null,
        status: classData.status || 1,
        creatorId: userId || null,
        updaterId: userId || null,
        isSystem: 0
      }, { transaction });
      
      const classId = newClass.id;

      // 如果有教师信息，创建班级教师关联
      if (classData.teacherIds && classData.teacherIds.length > 0) {
        // 创建教师-班级关联
        const teacherClassValues = classData.teacherIds.map((teacherId: number, index: number) => [
          classId,
          teacherId,
          index === 0 ? 1 : 0, // is_main_teacher
          null, // subject
          new Date().toISOString().split('T')[0], // start_date (DATE format)
          null, // end_date
          1, // status
          null, // remark
          userId || null, // creator_id
          userId || null, // updater_id
          new Date(), // created_at
          new Date() // updated_at
        ]);
        
        await SqlHelper.batchInsert(
          'class_teachers',
          ['class_id', 'teacher_id', 'is_main_teacher', 'subject', 'start_date', 'end_date', 'status', 'remark', 'creator_id', 'updater_id', 'created_at', 'updated_at'],
          teacherClassValues,
          transaction
        );
      } else if (classData.teacherId) {
        // 单个教师关联
        const teacherClassData = SqlHelper.camelToSnake({
          classId,
          teacherId: classData.teacherId,
          isMainTeacher: 1,
          subject: null,
          startDate: new Date().toISOString().split('T')[0],
          endDate: null,
          status: 1,
          remark: null,
          creatorId: userId || null,
          updaterId: userId || null
        });
        
        await SqlHelper.insert('class_teachers', teacherClassData, { transaction });
      }

      // 获取创建的班级信息
      const classQuery = `
        SELECT
          c.*,
          k.name AS kindergarten_name
        FROM ${tenantDb}.classes c
        JOIN ${tenantDb}.kindergartens k ON c.kindergarten_id = k.id
        WHERE c.id = :classId
      `;
      
      const classes = await sequelize.query(classQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];

      // 获取班级教师信息
      const teachersQuery = `
        SELECT
          ct.id, ct.teacher_id, ct.is_main_teacher, ct.subject,
          u.real_name AS teacher_name, t.position, t.teacher_no
        FROM ${tenantDb}.class_teachers ct
        JOIN ${tenantDb}.teachers t ON ct.teacher_id = t.id
        JOIN ${tenantDb}.users u ON t.user_id = u.id
        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL
      `;
      
      const teachers = await sequelize.query(teachersQuery, {
        replacements: { classId },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];

      let classInfo = null;
      if (classes && classes.length > 0) {
        classInfo = SqlHelper.snakeToCamel(classes[0]);
        classInfo.teachers = teachers.map(teacher => ({
          id: teacher.id,
          name: teacher.teacher_name,
          position: teacher.position,
          teacherNo: teacher.teacher_no,
          isMainTeacher: teacher.is_main_teacher === 1,
          subject: teacher.subject
        }));
      }

      await transaction.commit();
      return ApiResponse.success(res, classInfo, '创建班级成功');
    } catch (error: any) {
      await transaction.rollback();
      console.error('创建班级详细错误:', {
        message: error?.message,
        name: error?.name,
        sql: error?.sql,
        parameters: error?.parameters,
        stack: error?.stack
      });
      
      // 返回更具体的错误信息
      if (error?.name === 'SequelizeUniqueConstraintError') {
        return ApiResponse.error(res, '班级代码已存在', 'CLASS_CODE_EXISTS', 400);
      }
      
      if (error?.name === 'SequelizeForeignKeyConstraintError') {
        return ApiResponse.error(res, '关联数据不存在', 'FOREIGN_KEY_ERROR', 400);
      }
      
      return ApiResponse.error(res, `创建班级失败: ${error?.message || '未知错误'}`, 'CLASS_CREATE_ERROR', 500);
    }
  }

  /**
   * 获取班级列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async list(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      console.log('=== 班级列表查询开始 ===');
      console.log('查询参数:', req.query);
      console.log('用户信息:', (req as any).user);
      
      const { page = 1, pageSize = 10, keyword, kindergartenId, status } = req.query;
      const pageNum = Math.max(1, Number(page) || 1);
      const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10));
      const offset = Math.max(0, (pageNum - 1) * pageSizeNum);
      const limit = pageSizeNum;

      // 构建查询条件
      let whereClause = 'c.deleted_at IS NULL';
      const replacements: any = { limit, offset };
      
      // 权限过滤：根据用户角色控制访问权限
      const user = (req as any).user;
      console.log('用户权限信息:', {
        isAdmin: user.isAdmin,
        role: user.role,
        kindergartenId: user.kindergartenId
      });

      // 根据用户角色添加权限过滤
      if (user.role === 'teacher') {
        // 教师：只能查看自己管理的班级
        whereClause += ` AND c.id IN (
          SELECT DISTINCT ct.class_id
          FROM class_teachers ct
          WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL
        )`;
        replacements.teacherId = user.id;
        console.log('教师权限过滤，只能查看自己管理的班级');
      } else if (user.role === 'parent') {
        // 家长：只能查看自己孩子所在的班级
        whereClause += ` AND c.id IN (
          SELECT DISTINCT s.class_id
          FROM students s
          INNER JOIN parent_student_relations psr ON s.id = psr.student_id
          WHERE psr.user_id = :parentId AND psr.deleted_at IS NULL
        )`;
        replacements.parentId = user.id;
        console.log('家长权限过滤，只能查看孩子所在的班级');
      } else if (!user.isAdmin && user.kindergartenId) {
        // 园长：只能查看自己幼儿园的班级
        whereClause += ' AND c.kindergarten_id = :userKindergartenId';
        replacements.userKindergartenId = user.kindergartenId;
        console.log('园长权限过滤，只能查看自己幼儿园的班级');
      } else if (user.isAdmin) {
        console.log('超级管理员，可以查看所有班级');
      }
      
      if (keyword) {
        whereClause += ' AND c.name LIKE :keyword';
        replacements.keyword = `%${String(keyword)}%`;
      }
      
      if (kindergartenId && !isNaN(Number(kindergartenId))) {
        whereClause += ' AND c.kindergarten_id = :kindergartenId';
        replacements.kindergartenId = Number(kindergartenId);
      }
      
      if (status !== undefined && status !== null && status !== '') {
        // 处理数字状态和字符串状态
        const statusStr = String(status).trim();
        const statusNum = Number(statusStr);

        if (!isNaN(statusNum) && isFinite(statusNum)) {
          // 有效的数字状态
          whereClause += ' AND c.status = :status';
          replacements.status = statusNum;
        } else if (typeof statusStr === 'string' && statusStr.length > 0) {
          // 处理字符串状态映射
          const statusMap: { [key: string]: number } = {
            'active': 1,
            'inactive': 0,
            'disabled': 2
          };
          const lowerStatus = statusStr.toLowerCase();
          if (statusMap.hasOwnProperty(lowerStatus)) {
            whereClause += ' AND c.status = :status';
            replacements.status = statusMap[lowerStatus];
          }
          // 如果是无效的字符串状态，忽略该参数，不添加到查询条件中
        }
        // 如果status参数无效，忽略该参数，不添加到查询条件中
      }

      // 获取总数
      console.log('执行总数查询:', `SELECT COUNT(*) as total FROM ${tenantDb}.classes c WHERE ${whereClause}`);
      console.log('查询参数:', replacements);
      
      const countResult = await sequelize.query(
        `SELECT COUNT(*) as total FROM ${tenantDb}.classes c WHERE ${whereClause}`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      );
      
      console.log('总数查询结果:', countResult);

      // 查询班级列表
      console.log('执行列表查询:', `SELECT c.id, c.name, c.code FROM ${tenantDb}.classes c WHERE ${whereClause} ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
      const rows = await sequelize.query(
        `SELECT
          c.id, c.name, c.code, c.kindergarten_id, k.name as kindergarten_name,
          c.type, c.grade, c.head_teacher_id, htu.real_name as head_teacher_name,
          c.assistant_teacher_id, atu.real_name as assistant_teacher_name,
          c.capacity, c.current_student_count, c.classroom,
          c.description, c.image_url, c.status, c.created_at, c.updated_at
        FROM
          ${tenantDb}.classes c
          LEFT JOIN ${tenantDb}.kindergartens k ON c.kindergarten_id = k.id
          LEFT JOIN ${tenantDb}.teachers ht ON c.head_teacher_id = ht.id
          LEFT JOIN ${tenantDb}.users htu ON ht.user_id = htu.id
          LEFT JOIN ${tenantDb}.teachers at ON c.assistant_teacher_id = at.id
          LEFT JOIN ${tenantDb}.users atu ON at.user_id = atu.id
        WHERE
          ${whereClause}
        ORDER BY
          c.created_at DESC
        LIMIT :limit OFFSET :offset`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      ) as any[];
      
      console.log('=== 列表查询结果 ===');
      console.log('rows:', rows);
      console.log('类型:', typeof rows, 'isArray:', Array.isArray(rows));
      console.log('长度:', Array.isArray(rows) ? rows.length : 'N/A');

      // 格式化结果
      const rowsArray = Array.isArray(rows) ? rows : (Array.isArray(rows[0]) ? rows[0] : []);
      const formattedClasses = rowsArray.map((row: any) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        kindergartenId: row.kindergarten_id,
        kindergarten: {
          id: row.kindergarten_id,
          name: row.kindergarten_name
        },
        type: row.type,
        grade: row.grade,
        headTeacherId: row.head_teacher_id,
        assistantTeacherId: row.assistant_teacher_id,
        capacity: row.capacity,
        currentStudentCount: row.current_student_count,
        classroom: row.classroom,
        description: row.description,
        imageUrl: row.image_url,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;
      const totalPages = Math.ceil(total / limit);

      // 临时调试：直接返回原始数据
      if (req.query.debug === '1') {
        return ApiResponse.success(res, {
          debug: true,
          whereClause,
          replacements,
          countResult,
          rawRows: rows,
          rowsLength: Array.isArray(rows) ? rows.length : 0,
          rowsType: typeof rows,
          isArray: Array.isArray(rows),
          firstRow: Array.isArray(rows) ? rows[0] || null : null,
          rowsStructure: rows,
          rowsArrayLength: rowsArray.length,
          rowsArrayType: typeof rowsArray,
          formattedLength: formattedClasses.length
        }, '调试信息');
      }

      return ApiResponse.success(res, {
        items: formattedClasses,
        total,
        page: Number(page),
        pageSize: limit,
        totalPages
      }, '获取班级列表成功');
    } catch (error) {
      console.error('班级列表查询错误:', error);
      return ApiResponse.handleError(res, error, '获取班级列表失败');
    }
  }

  /**
   * 获取班级详情
   * @param req 请求对象
   * @param res 响应对象
   */
  public async detail(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const { id } = req.params;

      // 验证班级ID
      const classId = parseInt(id);
      if (!classId || isNaN(classId) || classId <= 0) {
        return ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400);
      }

      // 查询班级基本信息
      const classResults = await sequelize.query(
        `SELECT
          c.*,
          k.name AS kindergarten_name
        FROM ${tenantDb}.classes c
        LEFT JOIN ${tenantDb}.kindergartens k ON c.kindergarten_id = k.id
        WHERE c.id = :id AND c.deleted_at IS NULL`,
          {
          replacements: { id: classId },
          type: QueryTypes.SELECT
        }
      ) as Record<string, unknown>[];

      if (classResults.length === 0) {
        throw ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
      }

      // 确保classInfo不为null
      const classInfo = classResults[0];
      if (!classInfo) {
        throw ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
      }

      // 查询班级学生
      const students = await sequelize.query(
        `SELECT
          s.id, s.name, s.student_no AS studentNo,
          s.birth_date as birthday, s.gender, s.status
        FROM ${tenantDb}.students s
        WHERE s.class_id = :classId AND s.deleted_at IS NULL`,
        {
          replacements: { classId: classId },
          type: QueryTypes.SELECT
        }
      ) as Record<string, unknown>[];

      // 查询班级教师
      const teachers = await sequelize.query(
        `SELECT
          t.id, u.real_name as name, t.position, t.teacher_no AS teacherNo,
          ct.is_main_teacher AS isMainTeacher, ct.subject
        FROM ${tenantDb}.teachers t
        JOIN ${tenantDb}.class_teachers ct ON t.id = ct.teacher_id
        JOIN ${tenantDb}.users u ON t.user_id = u.id
        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL AND t.deleted_at IS NULL`,
        {
          replacements: { classId: classId },
          type: QueryTypes.SELECT
        }
      ) as Record<string, unknown>[];

      // 格式化班级详情响应
      const classDetail = {
        id: classInfo.id,
        name: classInfo.name,
        code: classInfo.code,
        kindergartenId: classInfo.kindergarten_id,
        kindergarten: {
          id: classInfo.kindergarten_id,
          name: classInfo.kindergarten_name
        },
        type: classInfo.type,
        grade: classInfo.grade,
        headTeacherId: classInfo.head_teacher_id,
        assistantTeacherId: classInfo.assistant_teacher_id,
        capacity: classInfo.capacity,
        currentStudentCount: classInfo.current_student_count,
        classroom: classInfo.classroom,
        description: classInfo.description,
        imageUrl: classInfo.image_url,
        status: classInfo.status,
        students: students,
        teachers: teachers.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          position: teacher.position,
          teacherNo: teacher.teacherNo,
          isMainTeacher: teacher.isMainTeacher === 1,
          subject: teacher.subject
        })),
        createdAt: classInfo.created_at,
        updatedAt: classInfo.updated_at
      };

      ApiResponse.success(res, classDetail, '获取班级详情成功');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取班级详情失败', 'CLASS_DETAIL_ERROR');
    }
  }

  /**
   * 更新班级信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public async update(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateClassDto;
      const userId = req.user?.id;

      // 验证班级ID
      const classId = parseInt(id);
      if (!classId || isNaN(classId) || classId <= 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400);
      }

      // 检查班级是否存在
      const classResults = await sequelize.query(
        `SELECT * FROM ${tenantDb}.classes WHERE id = :id AND deleted_at IS NULL`,
        {
          replacements: { id: classId },
          type: QueryTypes.SELECT,
          transaction
        }
      ) as Record<string, unknown>[];

      if (classResults.length === 0) {
        await transaction.rollback();
        throw ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
      }

      // 确保classInfo不为null
      const classInfoArray = classResults as Record<string, unknown>[];
      const classInfo = classInfoArray[0];
      if (!classInfo) {
        await transaction.rollback();
        throw ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
      }

      // 如果更新班级名称，检查是否已存在
      if (updateData.name && updateData.name !== classInfo.name) {
        const existingClasses = await sequelize.query(
          `SELECT id FROM ${tenantDb}.classes 
           WHERE name = :name 
           AND kindergarten_id = :kindergartenId 
           AND id != :id 
           AND deleted_at IS NULL`,
          {
            replacements: { 
            name: updateData.name,
              kindergartenId: updateData.kindergartenId || classInfo.kindergarten_id,
              id
            },
            type: QueryTypes.SELECT,
            transaction
          }
        );

        if (Array.isArray(existingClasses) && existingClasses.length > 0) {
          await transaction.rollback();
          throw ApiError.badRequest('班级名称已存在', 'CLASS_NAME_EXISTS');
        }
      }

      // 如果更新幼儿园，检查幼儿园是否存在
      if (updateData.kindergartenId && updateData.kindergartenId !== classInfo.kindergarten_id) {
        const kindergartens = await sequelize.query(
          `SELECT id FROM ${tenantDb}.kindergartens WHERE id = :kindergartenId AND deleted_at IS NULL`,
          {
            replacements: { kindergartenId: updateData.kindergartenId },
            type: QueryTypes.SELECT,
            transaction
          }
        );

        if (!Array.isArray(kindergartens) || kindergartens.length === 0) {
          await transaction.rollback();
          throw ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
        }
      }

      // 构建更新字段
      const updateFields = [];
      const replacements: Record<string, unknown> = { id: classId, updatedBy: userId };

      if (updateData.name !== undefined) {
        updateFields.push('name = :name');
        replacements.name = updateData.name;
      }

      if (updateData.code !== undefined) {
        updateFields.push('code = :code');
        replacements.code = updateData.code;
      }

      if (updateData.kindergartenId !== undefined) {
        updateFields.push('kindergarten_id = :kindergartenId');
        replacements.kindergartenId = updateData.kindergartenId;
      }

      if (updateData.type !== undefined) {
        updateFields.push('type = :type');
        replacements.type = updateData.type;
      }

      if (updateData.grade !== undefined) {
        updateFields.push('grade = :grade');
        replacements.grade = updateData.grade;
      }

      if (updateData.teacherId !== undefined) {
        updateFields.push('head_teacher_id = :headTeacherId');
        replacements.headTeacherId = updateData.teacherId;
      }

      if (updateData.headTeacherId !== undefined) {
        updateFields.push('head_teacher_id = :headTeacherId');
        replacements.headTeacherId = updateData.headTeacherId;
      }

      if (updateData.assistantTeacherId !== undefined) {
        updateFields.push('assistant_teacher_id = :assistantTeacherId');
        replacements.assistantTeacherId = updateData.assistantTeacherId;
      }

      if (updateData.capacity !== undefined) {
        updateFields.push('capacity = :capacity');
        replacements.capacity = updateData.capacity;
      }

      if (updateData.classroom !== undefined) {
        updateFields.push('classroom = :classroom');
        replacements.classroom = updateData.classroom;
      }

      if (updateData.description !== undefined) {
        updateFields.push('description = :description');
        replacements.description = updateData.description;
      }

      if (updateData.imageUrl !== undefined) {
        updateFields.push('image_url = :imageUrl');
        replacements.imageUrl = updateData.imageUrl;
      }

      if (updateData.status !== undefined) {
        updateFields.push('status = :status');
        replacements.status = updateData.status;
      }

      // 添加更新时间和更新人
      updateFields.push('updated_at = NOW()');
      updateFields.push('updater_id = :updatedBy');

      // 执行更新
      if (updateFields.length > 0) {
        await sequelize.query(
          `UPDATE ${tenantDb}.classes SET ${updateFields.join(', ')} WHERE id = :id`,
          {
            replacements,
            type: QueryTypes.UPDATE,
            transaction
          }
        );
      }

      // 如果有教师IDs，更新班级教师关联
      if (updateData.teacherIds && updateData.teacherIds.length > 0) {
        // 先删除现有关联
        await sequelize.query(
          `UPDATE ${tenantDb}.class_teachers SET deleted_at = NOW() WHERE class_id = :classId AND deleted_at IS NULL`,
          {
            replacements: { classId: id },
            type: QueryTypes.UPDATE,
            transaction
          }
        );

        // 添加新关联
        const teacherValues = updateData.teacherIds.map((teacherId: number, index: number) => {
          return `(${id}, ${teacherId}, ${index === 0 ? 1 : 0}, NULL, CURDATE(), NULL, 1, NULL, ${userId || 'NULL'}, ${userId || 'NULL'}, NOW(), NOW())`;
        }).join(',');

        if (teacherValues) {
          await sequelize.query(
            `INSERT INTO ${tenantDb}.class_teachers (
              class_id, teacher_id, is_main_teacher, subject, start_date, 
              end_date, status, remark, creator_id, updater_id, created_at, updated_at
            ) VALUES ${teacherValues}`,
            {
              type: QueryTypes.INSERT,
              transaction
            }
          );
        }
      }

      // 获取更新后的班级信息
      const updatedClass = await sequelize.query(
        `SELECT 
          c.*, 
          k.name AS kindergarten_name
        FROM ${tenantDb}.classes c
        JOIN ${tenantDb}.kindergartens k ON c.kindergarten_id = k.id
        WHERE c.id = :id`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
          transaction
        }
      );

      // 获取班级教师信息
      const classTeachers = await sequelize.query(
        `SELECT 
          ct.id, ct.teacher_id, ct.is_main_teacher, ct.subject,
          u.real_name AS teacher_name, t.position, t.teacher_no
        FROM ${tenantDb}.class_teachers ct
        JOIN ${tenantDb}.teachers t ON ct.teacher_id = t.id
        JOIN ${tenantDb}.users u ON t.user_id = u.id
        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL`,
        {
          replacements: { classId: id },
          type: QueryTypes.SELECT,
          transaction
        }
      );

      // 格式化响应数据
      const updatedClassArray = Array.isArray(updatedClass) ? updatedClass : [];
      const classData = updatedClassArray.length > 0 ? updatedClassArray[0] as Record<string, unknown> : null;
      
      if (!classData) {
        await transaction.rollback();
        throw ApiError.notFound('更新后的班级数据未找到', 'CLASS_NOT_FOUND');
      }
      
      const formattedClass = {
        id: classData.id,
        name: classData.name,
        code: classData.code,
        kindergartenId: classData.kindergarten_id,
        kindergarten: {
          id: classData.kindergarten_id,
          name: classData.kindergarten_name
        },
        type: classData.type,
        grade: classData.grade,
        headTeacherId: classData.head_teacher_id,
        assistantTeacherId: classData.assistant_teacher_id,
        capacity: classData.capacity,
        currentStudentCount: classData.current_student_count,
        classroom: classData.classroom,
        description: classData.description,
        imageUrl: classData.image_url,
        status: classData.status,
        teachers: Array.isArray(classTeachers) ? classTeachers.map((teacher: any) => ({
          id: teacher.teacher_id,
          name: teacher.teacher_name,
          position: teacher.position,
          teacherNo: teacher.teacher_no,
          isMainTeacher: teacher.is_main_teacher === 1,
          subject: teacher.subject
        })) : [],
        createdAt: classData.created_at,
        updatedAt: classData.updated_at
      };

      await transaction.commit();
      ApiResponse.success(res, formattedClass, '更新班级信息成功');
    } catch (error) {
      await transaction.rollback();
      console.error('更新班级错误:', error);
      if (error instanceof ApiError) {
        return ApiResponse.error(res, error.message, error.code, error.statusCode);
      }
      return ApiResponse.error(res, '更新班级信息失败', 'CLASS_UPDATE_ERROR', 500);
    }
  }

  /**
   * 删除班级
   * @param req 请求对象
   * @param res 响应对象
   */
  public async delete(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // 验证班级ID
      const classId = parseInt(id);
      if (!classId || isNaN(classId) || classId <= 0) {
        return ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400);
      }

      // 先检查班级是否存在（不使用事务）
      const classResults = await sequelize.query(
        `SELECT id FROM ${tenantDb}.classes WHERE id = :id AND deleted_at IS NULL`,
        {
          replacements: { id: classId },
          type: QueryTypes.SELECT
        }
      ) as Record<string, unknown>[];

      if (classResults.length === 0) {
        res.status(404).json({
          success: false,
          message: '班级不存在'
        });
        return;
      }

      // 开始事务处理删除逻辑
      const transaction = await sequelize.transaction();
      try {
        // 检查班级是否有关联的学生
        const studentResults = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tenantDb}.students WHERE class_id = :classId AND deleted_at IS NULL`,
          {
            replacements: { classId: classId },
            type: QueryTypes.SELECT,
            transaction
          }
        ) as Record<string, unknown>[];

        // 安全地访问count属性
        const studentCountObj = studentResults[0] as { count: number };
        if (studentCountObj.count > 0) {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message: '该班级有关联的学生，无法删除'
          });
          return;
        }

        // 检查班级是否有关联的教师
        const teacherResults = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tenantDb}.class_teachers WHERE class_id = :classId AND deleted_at IS NULL`,
          {
            replacements: { classId: classId },
            type: QueryTypes.SELECT,
            transaction
          }
        ) as Record<string, unknown>[];

        // 安全地访问count属性
        const teacherCountObj = teacherResults[0] as { count: number };
        if (teacherCountObj.count > 0) {
          // 软删除班级与教师的关联关系
          await sequelize.query(
            `UPDATE ${tenantDb}.class_teachers SET deleted_at = NOW(), updater_id = :userId WHERE class_id = :classId AND deleted_at IS NULL`,
            {
              replacements: { classId: classId, userId: userId || null },
              type: QueryTypes.UPDATE,
              transaction
            }
          );
        }

        // 软删除班级
        await sequelize.query(
          `UPDATE ${tenantDb}.classes SET deleted_at = NOW(), updater_id = :userId WHERE id = :id`,
          {
            replacements: { id: classId, userId: userId || null },
            type: QueryTypes.UPDATE,
            transaction
          }
        );

        await transaction.commit();
        ApiResponse.success(res, { message: '删除班级成功' });
      } catch (error) {
        // 安全地回滚事务
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.log('事务回滚错误（可能已回滚）:', rollbackError);
        }
        throw error;
      }
    } catch (error) {
      console.error('删除班级失败:', error);
      throw ApiError.serverError('删除班级失败', 'CLASS_DELETE_ERROR');
    }
  }

  /**
   * 获取班级统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      // 获取基本统计
      const [basicStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,
          SUM(current_student_count) as totalStudents,
          SUM(capacity) as totalCapacity,
          AVG(current_student_count) as avgStudentsPerClass
        FROM ${tenantDb}.classes 
        WHERE deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      });

      // 获取按类型统计
      const [typeStats] = await sequelize.query(`
        SELECT 
          type,
          COUNT(*) as count
        FROM ${tenantDb}.classes 
        WHERE deleted_at IS NULL
        GROUP BY type
        ORDER BY type
      `, {
        type: QueryTypes.SELECT
      });

      // 获取按年级统计
      const [gradeStats] = await sequelize.query(`
        SELECT 
          grade,
          COUNT(*) as count
        FROM ${tenantDb}.classes 
        WHERE deleted_at IS NULL AND grade IS NOT NULL
        GROUP BY grade
        ORDER BY grade
      `, {
        type: QueryTypes.SELECT
      });

      const stats = Array.isArray(basicStats) ? basicStats[0] : basicStats;
      const statsData = stats as Record<string, any>;
      
      ApiResponse.success(res, {
        total: Number(statsData.total) || 0,
        active: Number(statsData.active) || 0,
        inactive: Number(statsData.inactive) || 0,
        totalStudents: Number(statsData.totalStudents) || 0,
        totalCapacity: Number(statsData.totalCapacity) || 0,
        avgStudentsPerClass: Number(statsData.avgStudentsPerClass) || 0,
        utilizationRate: statsData.totalCapacity > 0 ? 
          ((Number(statsData.totalStudents) / Number(statsData.totalCapacity)) * 100).toFixed(2) : '0.00',
        byType: typeStats || [],
        byGrade: gradeStats || []
      }, '获取班级统计成功');
    } catch (error) {
      console.error('获取班级统计失败:', error);
      throw ApiError.serverError('获取班级统计失败', 'CLASS_STATS_ERROR');
    }
  }

  /**
   * 获取班级学生列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public async getStudents(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    try {
      const classId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      if (!classId || isNaN(classId)) {
        return ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400);
      }

      // 检查班级是否存在
      const classExists = await SqlHelper.recordExists('classes', 'id', classId, {
        whereAddition: 'deleted_at IS NULL'
      });

      if (!classExists) {
        return ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
      }

      // 获取班级学生列表
      const studentsQuery = `
        SELECT 
          s.id,
          s.student_no,
          s.name,
          s.gender,
          s.birth_date,
          s.enrollment_date,
          s.status,
          s.avatar_url,
          p.name AS parent_name,
          p.phone AS parent_phone
        FROM ${tenantDb}.students s
        LEFT JOIN ${tenantDb}.parent_student_relations psr ON s.id = psr.student_id AND psr.deleted_at IS NULL
        LEFT JOIN ${tenantDb}.parents p ON psr.parent_id = p.id AND p.deleted_at IS NULL
        WHERE s.class_id = :classId AND s.deleted_at IS NULL
        ORDER BY s.student_no ASC
        LIMIT :limit OFFSET :offset
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM ${tenantDb}.students s
        WHERE s.class_id = :classId AND s.deleted_at IS NULL
      `;

      const [students, countResult] = await Promise.all([
        sequelize.query(studentsQuery, {
          replacements: { classId, limit, offset },
          type: QueryTypes.SELECT
        }) as Promise<Record<string, any>[]>,
        sequelize.query(countQuery, {
          replacements: { classId },
          type: QueryTypes.SELECT
        }) as Promise<Record<string, any>[]>
      ]);

      const total = countResult[0]?.total || 0;
      const formattedStudents = students.map(student => SqlHelper.snakeToCamel(student));

      const paginationData = formatPaginationResponse(total, page, limit, formattedStudents);
      
      return ApiResponse.success(res, paginationData, '获取班级学生列表成功');
    } catch (error) {
      console.error('获取班级学生列表错误:', error);
      return ApiResponse.error(res, '获取班级学生列表失败', 'GET_CLASS_STUDENTS_ERROR', 500);
    }
  }

  /**
   * 向班级添加学生
   * @param req 请求对象
   * @param res 响应对象
   */
  public async addStudent(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();
    try {
      const classId = parseInt(req.params.id);
      const { studentIds } = req.body;
      const userId = req.user?.id;

      if (!classId || isNaN(classId)) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400);
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '学生ID列表不能为空', 'MISSING_STUDENT_IDS', 400);
      }

      // 检查班级是否存在
      const classInfo = await sequelize.query(
        'SELECT id, capacity, current_student_count FROM ${tenantDb}.classes WHERE id = :classId AND deleted_at IS NULL',
        {
          replacements: { classId },
          type: QueryTypes.SELECT,
          transaction
        }
      ) as Record<string, any>[];

      if (!classInfo || classInfo.length === 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
      }

      const currentClass = classInfo[0];
      const availableCapacity = currentClass.capacity - currentClass.current_student_count;

      if (studentIds.length > availableCapacity) {
        await transaction.rollback();
        return ApiResponse.error(res, `班级容量不足，最多还能添加 ${availableCapacity} 名学生`, 'INSUFFICIENT_CAPACITY', 400);
      }

      // 检查学生是否存在且未分配班级
      const studentsQuery = `
        SELECT id, name, class_id 
        FROM ${tenantDb}.students 
        WHERE id IN (${studentIds.map(() => '?').join(',')}) AND deleted_at IS NULL
      `;

      const students = await sequelize.query(studentsQuery, {
        replacements: studentIds,
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];

      if (students.length !== studentIds.length) {
        await transaction.rollback();
        return ApiResponse.error(res, '部分学生不存在', 'STUDENTS_NOT_FOUND', 400);
      }

      const studentsWithClass = students.filter(s => s.class_id);
      if (studentsWithClass.length > 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '部分学生已分配班级', 'STUDENTS_ALREADY_ASSIGNED', 400);
      }

      // 更新学生的班级信息
      await sequelize.query(
        `UPDATE ${tenantDb}.students SET class_id = :classId, updater_id = :userId, updated_at = NOW() 
         WHERE id IN (${studentIds.map(() => '?').join(',')})`,
        {
          replacements: [classId, userId, ...studentIds],
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      // 更新班级的学生数量
      await sequelize.query(
        'UPDATE ${tenantDb}.classes SET current_student_count = current_student_count + :count, updated_at = NOW() WHERE id = :classId',
        {
          replacements: { count: studentIds.length, classId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();
      return ApiResponse.success(res, { addedCount: studentIds.length }, '学生添加到班级成功');
    } catch (error) {
      await transaction.rollback();
      console.error('添加学生到班级错误:', error);
      return ApiResponse.error(res, '添加学生到班级失败', 'ADD_STUDENT_TO_CLASS_ERROR', 500);
    }
  }

  /**
   * 从班级移除学生
   * @param req 请求对象
   * @param res 响应对象
   */
  public async removeStudent(req: Request, res: Response): Promise<void> {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const transaction = await sequelize.transaction();
    try {
      const classId = parseInt(req.params.id);
      const studentId = parseInt(req.params.studentId);
      const userId = req.user?.id;

      if (!classId || isNaN(classId)) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400);
      }

      if (!studentId || isNaN(studentId)) {
        await transaction.rollback();
        return ApiResponse.error(res, '学生ID无效', 'INVALID_STUDENT_ID', 400);
      }

      // 检查班级是否存在
      const classExists = await SqlHelper.recordExists('classes', 'id', classId, {
        whereAddition: 'deleted_at IS NULL',
        transaction
      });

      if (!classExists) {
        await transaction.rollback();
        return ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
      }

      // 检查学生是否存在且在该班级中
      const studentQuery = `
        SELECT id, name, class_id 
        FROM ${tenantDb}.students 
        WHERE id = :studentId AND deleted_at IS NULL
      `;

      const students = await sequelize.query(studentQuery, {
        replacements: { studentId },
        type: QueryTypes.SELECT,
        transaction
      }) as Record<string, any>[];

      if (!students || students.length === 0) {
        await transaction.rollback();
        return ApiResponse.error(res, '学生不存在', 'STUDENT_NOT_FOUND', 404);
      }

      const student = students[0];
      if (student.class_id !== classId) {
        await transaction.rollback();
        return ApiResponse.error(res, '学生不在该班级中', 'STUDENT_NOT_IN_CLASS', 400);
      }

      // 从班级中移除学生
      await sequelize.query(
        'UPDATE ${tenantDb}.students SET class_id = NULL, updater_id = :userId, updated_at = NOW() WHERE id = :studentId',
        {
          replacements: { studentId, userId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      // 更新班级的学生数量
      await sequelize.query(
        'UPDATE ${tenantDb}.classes SET current_student_count = current_student_count - 1, updated_at = NOW() WHERE id = :classId',
        {
          replacements: { classId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();
      return ApiResponse.success(res, { studentName: student.name }, '学生从班级移除成功');
    } catch (error) {
      await transaction.rollback();
      console.error('从班级移除学生错误:', error);
      return ApiResponse.error(res, '从班级移除学生失败', 'REMOVE_STUDENT_FROM_CLASS_ERROR', 500);
    }
  }
} 
