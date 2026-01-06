import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student/student.service';
import { ApiError } from '../utils/apiError';
import { ApiResponseEnhanced } from '../utils/apiResponseEnhanced';
import { PaginationHelper } from '../utils/paginationHelper';
import {
  CreateStudentDto,
  UpdateStudentDto,
  AssignClassDto,
  BatchAssignClassDto,
  UpdateStudentStatusDto
} from '../types/student';

/**
 * 学生控制器
 * 负责处理与学生相关的HTTP请求，并将业务逻辑委托给StudentService。
 */
export class StudentController {
  private studentService = new StudentService();

  /**
   * 创建新学生
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createStudentDto: CreateStudentDto = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      const student = await this.studentService.createStudent(createStudentDto, userId);
      ApiResponseEnhanced.success(res, student, '学生创建成功', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取学生列表（分页和过滤）
   */
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 解析分页参数
      const paginationOptions = PaginationHelper.parsePaginationParams(req.query);

      // 添加权限过滤
      const user = req.user as any;
      let additionalFilters: any = {};

      // 根据用户角色添加权限过滤
      if (user.role === 'teacher') {
        // 教师：只能访问自己管理的班级的学生
        additionalFilters.teacherId = user.id;
      } else if (user.role === 'parent') {
        // 家长：只能访问自己关联的学生
        additionalFilters.parentId = user.id;
      }
      // admin 和 principal 可以访问所有学生

      // 获取学生数据和总数
      const result = await this.studentService.getStudents({
        ...req.query,
        ...paginationOptions,
        ...additionalFilters
      });

      // 如果结果已经是标准格式，直接返回
      if (result && typeof result === 'object' && 'items' in result && 'total' in result) {
        const paginatedResponse = PaginationHelper.createPaginationResponse(
          (result as any).items || (result as { data?: any[] }).data || (result as { list?: any[] }).list || [],
          (result as any).total || (result as { count?: number }).count || 0,
          paginationOptions,
          '获取学生列表成功'
        );
        ApiResponseEnhanced.success(res, paginatedResponse.data, '获取学生列表成功');
      } else if (result && typeof result === 'object' && 'rows' in result) {
        // ✨ 修复：处理 Service 返回的 { rows, count } 格式
        const paginatedResponse = PaginationHelper.createPaginationResponse(
          (result as { rows: any[] }).rows || [],
          (result as { count: number }).count || 0,
          paginationOptions,
          '获取学生列表成功'
        );
        ApiResponseEnhanced.success(res, paginatedResponse.data, '获取学生列表成功');
      } else {
        // 转换非标准格式为标准格式
        const normalizedResponse = PaginationHelper.normalizePaginationResponse(result);
        ApiResponseEnhanced.success(res, normalizedResponse.data, '获取学生列表成功');
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * 搜索学生
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.studentService.searchStudents(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取可用学生列表（未分配班级的学生）
   */
  public getAvailableStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.studentService.getAvailableStudents(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取学生详情
   */
  public detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // 验证ID参数
      const studentId = parseInt(id, 10);
      if (isNaN(studentId) || studentId <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }

      // 添加权限检查
      const user = req.user as any;
      let hasPermission = false;

      if (user.role === 'admin' || user.role === 'principal') {
        // 管理员和园长可以访问所有学生
        hasPermission = true;
      } else if (user.role === 'teacher') {
        // 教师只能访问自己管理的班级的学生
        const sequelize = require('../init').sequelize;
        const [teacherStudents] = await sequelize.query(`
          SELECT s.id FROM students s
          INNER JOIN classes c ON s.class_id = c.id
          INNER JOIN class_teachers ct ON c.id = ct.class_id
          WHERE ct.teacher_id = ? AND s.id = ? AND ct.deleted_at IS NULL
          LIMIT 1
        `, {
          replacements: [user.id, studentId]
        });
        hasPermission = teacherStudents.length > 0;
      } else if (user.role === 'parent') {
        // 家长只能访问自己关联的学生
        const sequelize = require('../init').sequelize;
        const [parentStudents] = await sequelize.query(`
          SELECT s.id FROM students s
          INNER JOIN parent_student_relations psr ON s.id = psr.student_id
          WHERE psr.user_id = ? AND s.id = ? AND psr.deleted_at IS NULL
          LIMIT 1
        `, {
          replacements: [user.id, studentId]
        });
        hasPermission = parentStudents.length > 0;
      }

      if (!hasPermission) {
        throw ApiError.forbidden('您无权访问此学生的信息');
      }

      const student = await this.studentService.getStudentById(studentId);
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取学生的家长列表
   */
  public getParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // 验证ID参数
      const studentId = parseInt(id, 10);
      if (isNaN(studentId) || studentId <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }
      
      const parents = await this.studentService.getStudentParents(studentId);
      res.status(200).json(parents);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新学生信息
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateStudentDto: UpdateStudentDto = req.body;
      
      // 验证ID参数
      const studentId = parseInt(id, 10);
      if (isNaN(studentId) || studentId <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }
      
      // 验证请求体不为空
      if (!req.body || Object.keys(req.body).length === 0) {
        throw ApiError.badRequest('更新数据不能为空');
      }
      
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      
      const updatedStudent = await this.studentService.updateStudent(studentId, updateStudentDto, userId);
      res.status(200).json(updatedStudent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 删除学生
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      // 验证ID参数
      const studentId = parseInt(id, 10);
      if (isNaN(studentId) || studentId <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }
      
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      
      await this.studentService.deleteStudent(studentId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * 为单个学生分配班级
   */
  public assignClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignClassDto: AssignClassDto = req.body;
      
      // 验证请求体
      if (!req.body || Object.keys(req.body).length === 0) {
        throw ApiError.badRequest('分配班级数据不能为空');
      }
      
      // 验证必填字段
      if (!assignClassDto.studentId || !assignClassDto.classId) {
        throw ApiError.badRequest('学生ID和班级ID都是必填项');
      }
      
      // 验证ID格式
      if (isNaN(Number(assignClassDto.studentId)) || Number(assignClassDto.studentId) <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }
      
      if (isNaN(Number(assignClassDto.classId)) || Number(assignClassDto.classId) <= 0) {
        throw ApiError.badRequest('无效的班级ID');
      }
      
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      
      const result = await this.studentService.assignStudentToClass(assignClassDto, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 批量为学生分配班级
   */
  public batchAssignClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchAssignClassDto: BatchAssignClassDto = req.body;
      
      // 验证请求体
      if (!req.body || Object.keys(req.body).length === 0) {
        throw ApiError.badRequest('批量分配班级数据不能为空');
      }
      
      // 验证必填字段
      if (!batchAssignClassDto.studentIds || !batchAssignClassDto.classId) {
        throw ApiError.badRequest('学生ID列表和班级ID都是必填项');
      }
      
      // 验证学生ID列表
      if (!Array.isArray(batchAssignClassDto.studentIds) || batchAssignClassDto.studentIds.length === 0) {
        throw ApiError.badRequest('学生ID列表必须是非空数组');
      }
      
      // 验证学生ID格式
      for (const studentId of batchAssignClassDto.studentIds) {
        if (isNaN(Number(studentId)) || Number(studentId) <= 0) {
          throw ApiError.badRequest(`无效的学生ID: ${studentId}`);
        }
      }
      
      // 验证班级ID格式
      if (isNaN(Number(batchAssignClassDto.classId)) || Number(batchAssignClassDto.classId) <= 0) {
        throw ApiError.badRequest('无效的班级ID');
      }
      
      // 检查重复的学生ID
      const uniqueStudentIds = [...new Set(batchAssignClassDto.studentIds)];
      if (uniqueStudentIds.length !== batchAssignClassDto.studentIds.length) {
        throw ApiError.badRequest('学生ID列表中存在重复的ID');
      }
      
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      
      const result = await this.studentService.batchAssignStudentsToClass(batchAssignClassDto, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新学生状态
   */
  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updateStudentStatusDto: UpdateStudentStatusDto = req.body;
      
      // 验证请求体
      if (!req.body || Object.keys(req.body).length === 0) {
        throw ApiError.badRequest('更新状态数据不能为空');
      }
      
      // 验证必填字段
      if (!updateStudentStatusDto.studentId || updateStudentStatusDto.status === undefined) {
        throw ApiError.badRequest('学生ID和状态都是必填项');
      }
      
      // 验证学生ID格式
      if (isNaN(Number(updateStudentStatusDto.studentId)) || Number(updateStudentStatusDto.studentId) <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }
      
      // 验证状态值
      const validStatuses = [0, 1, 2]; // 0:离园, 1:在读, 2:休学
      if (!validStatuses.includes(updateStudentStatusDto.status)) {
        throw ApiError.badRequest('状态值只能是0(离园)、1(在读)或2(休学)');
      }
      
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }
      
      const result = await this.studentService.updateStudentStatus(updateStudentStatusDto, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取学生统计数据
   */
  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.studentService.getStudentStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * 按班级获取学生列表
   */
  public getStudentsByClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { classId, page = 1, pageSize = 10, keyword } = req.query;

      if (!classId) {
        throw ApiError.badRequest('班级ID是必填项');
      }

      const result = await this.studentService.getStudentsByClass({
        classId: classId as string,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        keyword: keyword as string
      });

      res.status(200).json({
        success: true,
        message: '获取班级学生列表成功',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 添加学生到班级
   */
  public addToClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }

      if (!studentData.classId) {
        throw ApiError.badRequest('班级ID是必填项');
      }

      const student = await this.studentService.addToClass(studentData, userId);

      res.status(201).json({
        success: true,
        message: '学生已添加到班级',
        data: student
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 从班级移除学生
   */
  public removeFromClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { classId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('无法获取用户ID');
      }

      const studentId = parseInt(id, 10);
      if (isNaN(studentId) || studentId <= 0) {
        throw ApiError.badRequest('无效的学生ID');
      }

      if (!classId) {
        throw ApiError.badRequest('班级ID是必填项');
      }

      const result = await this.studentService.removeFromClass(studentId, classId, userId);

      res.status(200).json({
        success: true,
        message: '学生已从班级移除',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}