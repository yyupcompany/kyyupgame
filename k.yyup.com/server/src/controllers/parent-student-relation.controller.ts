import { Request, Response, NextFunction } from 'express';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { User } from '../models/user.model';
import { Student } from '../models/student.model';

/**
 * 亲子关系控制器
 * 管理家长与学生的关联关系
 */
export class ParentStudentRelationController {
  /**
   * 获取指定家长的所有学生
   * GET /api/parents/:id/students
   */
  public getParentStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.id);
      const currentUser = req.user as any;

      // 权限检查：只能查看自己的学生信息，除非是管理员或园长
      if (currentUser.role !== 'admin' && currentUser.role !== 'principal' && currentUser.id !== parentId) {
        res.status(403).json({
          success: false,
          message: '您只能查看自己的学生信息',
          error: 'PARENT_ACCESS_DENIED'
        });
        return;
      }

      const relations = await ParentStudentRelation.findAll({
        where: { userId: parentId },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'gender', 'birthDate', 'studentNumber', 'enrollmentDate', 'status']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'realName', 'phone', 'email']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: '获取家长学生列表成功',
        data: relations
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 为指定家长添加学生关系
   * POST /api/parents/:id/students
   */
  public addParentStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.id);
      const currentUser = req.user as any;
      const { studentId, relationship, isPrimaryContact, isLegalGuardian, ...otherData } = req.body;

      // 权限检查：只有管理员和园长可以为其他家长添加关系，家长只能为自己添加
      if (currentUser.role !== 'admin' && currentUser.role !== 'principal' && currentUser.id !== parentId) {
        res.status(403).json({
          success: false,
          message: '您只能为自己添加学生关系',
          error: 'PARENT_ADD_DENIED'
        });
        return;
      }

      // 验证学生是否存在
      const student = await Student.findByPk(studentId);
      if (!student) {
        res.status(404).json({
          success: false,
          message: '学生不存在',
          error: 'STUDENT_NOT_FOUND'
        });
        return;
      }

      // 检查关系是否已存在
      const existingRelation = await ParentStudentRelation.findOne({
        where: {
          userId: parentId,
          studentId: studentId
        }
      });

      if (existingRelation) {
        res.status(400).json({
          success: false,
          message: '该家长与学生的关系已存在'
        });
        return;
      }

      const relation = await ParentStudentRelation.create({
        userId: parentId,
        studentId,
        relationship,
        isPrimaryContact: isPrimaryContact ? 1 : 0,
        isLegalGuardian: isLegalGuardian ? 1 : 0,
        ...otherData
      });

      res.status(201).json({
        success: true,
        message: '添加家长学生关系成功',
        data: relation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 删除指定家长的学生关系
   * DELETE /api/parents/:parentId/students/:studentId
   */
  public removeParentStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.parentId);
      const studentId = Number(req.params.studentId);
      const currentUser = req.user as any;

      // 权限检查：只有管理员和园长可以为其他家长删除关系，家长只能为自己删除
      if (currentUser.role !== 'admin' && currentUser.role !== 'principal' && currentUser.id !== parentId) {
        res.status(403).json({
          success: false,
          message: '您只能删除自己的学生关系',
          error: 'PARENT_DELETE_DENIED'
        });
        return;
      }

      const relation = await ParentStudentRelation.findOne({
        where: {
          userId: parentId,
          studentId: studentId
        }
      });

      if (!relation) {
        res.status(404).json({
          success: false,
          message: '未找到该家长与学生的关系'
        });
        return;
      }

      await relation.destroy();

      res.status(200).json({
        success: true,
        message: '删除家长学生关系成功',
        data: { parentId, studentId }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取所有亲子关系
   * GET /api/parent-student-relations
   */
  public getAllRelations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, pageSize = 10, parentId, studentId } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);

      const whereCondition: any = {};
      if (parentId) whereCondition.userId = parentId;
      if (studentId) whereCondition.studentId = studentId;

      // 简化查询，先不使用关联
      const { count, rows } = await ParentStudentRelation.findAndCountAll({
        where: whereCondition,
        limit: Number(pageSize),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: '获取亲子关系列表成功',
        data: {
          list: rows,
          pagination: {
            total: count,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: Math.ceil(count / Number(pageSize))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新亲子关系信息
   * PUT /api/parent-student-relations/:id
   */
  public updateRelation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const relationId = Number(req.params.id);
      const updateData = req.body;

      const relation = await ParentStudentRelation.findByPk(relationId);
      if (!relation) {
        res.status(404).json({
          success: false,
          message: '未找到该亲子关系'
        });
        return;
      }

      // 处理布尔值转换
      if (updateData.isPrimaryContact !== undefined) {
        updateData.isPrimaryContact = updateData.isPrimaryContact ? 1 : 0;
      }
      if (updateData.isLegalGuardian !== undefined) {
        updateData.isLegalGuardian = updateData.isLegalGuardian ? 1 : 0;
      }

      await relation.update(updateData);

      res.status(200).json({
        success: true,
        message: '更新亲子关系成功',
        data: relation
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取指定学生的所有家长
   * GET /api/students/:id/parents
   */
  public getStudentParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = Number(req.params.id);
      
      const relations = await ParentStudentRelation.findAll({
        where: { studentId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'realName', 'phone', 'email']
          },
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'name', 'gender', 'birthDate', 'studentNumber']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: '获取学生家长列表成功',
        data: relations
      });
    } catch (error) {
      next(error);
    }
  };
}