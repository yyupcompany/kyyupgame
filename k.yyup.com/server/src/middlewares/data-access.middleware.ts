import { Request, Response, NextFunction } from 'express';
import { sequelize } from '../init';

/**
 * 数据权限验证中间件
 * 用于确保教师只能访问自己管理的班级的学生数据
 * 家长只能访问自己关联的学生数据
 */

/**
 * 检查教师是否有权访问特定学生
 */
export const checkTeacherStudentAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;
    const studentId = req.params.id || req.params.studentId || req.body.studentId;

    // 非教师角色直接通过
    if (user.role !== 'teacher') {
      next();
      return;
    }

    if (!studentId) {
      next();
      return;
    }

    // 检查该教师是否有权访问此学生
    const [result] = await sequelize.query(`
      SELECT s.id FROM students s
      INNER JOIN classes c ON s.class_id = c.id
      INNER JOIN class_teachers ct ON c.id = ct.class_id
      WHERE ct.teacher_id = ? AND s.id = ? AND ct.deleted_at IS NULL
      LIMIT 1
    `, {
      replacements: [user.id, studentId]
    });

    if (result.length === 0) {
      res.status(403).json({
        success: false,
        message: '您无权访问此学生的信息',
        error: 'TEACHER_STUDENT_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('教师学生权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};

/**
 * 检查教师是否有权访问特定班级
 */
export const checkTeacherClassAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;
    const classId = req.params.id || req.params.classId || req.body.classId;

    // 非教师角色直接通过
    if (user.role !== 'teacher') {
      next();
      return;
    }

    if (!classId) {
      next();
      return;
    }

    // 检查该教师是否有权访问此班级
    const [result] = await sequelize.query(`
      SELECT ct.id FROM class_teachers ct
      WHERE ct.teacher_id = ? AND ct.class_id = ? AND ct.deleted_at IS NULL
      LIMIT 1
    `, {
      replacements: [user.id, classId]
    });

    if (result.length === 0) {
      res.status(403).json({
        success: false,
        message: '您无权访问此班级的信息',
        error: 'TEACHER_CLASS_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('教师班级权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};

/**
 * 检查家长是否有权访问特定学生
 */
export const checkParentStudentAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;
    const studentId = req.params.id || req.params.studentId || req.body.studentId;

    // 非家长角色直接通过
    if (user.role !== 'parent') {
      next();
      return;
    }

    if (!studentId) {
      next();
      return;
    }

    // 检查该家长是否有权访问此学生
    const [result] = await sequelize.query(`
      SELECT psr.id FROM parent_student_relations psr
      WHERE psr.user_id = ? AND psr.student_id = ? AND psr.deleted_at IS NULL
      LIMIT 1
    `, {
      replacements: [user.id, studentId]
    });

    if (result.length === 0) {
      res.status(403).json({
        success: false,
        message: '您无权访问此学生的信息',
        error: 'PARENT_STUDENT_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('家长学生权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};

/**
 * 检查家长是否有权访问特定班级（通过孩子关系）
 */
export const checkParentClassAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;
    const classId = req.params.id || req.params.classId || req.body.classId;

    // 非家长角色直接通过
    if (user.role !== 'parent') {
      next();
      return;
    }

    if (!classId) {
      next();
      return;
    }

    // 检查该家长的孩子是否在此班级
    const [result] = await sequelize.query(`
      SELECT psr.id FROM parent_student_relations psr
      INNER JOIN students s ON psr.student_id = s.id
      WHERE psr.user_id = ? AND s.class_id = ? AND psr.deleted_at IS NULL AND s.deleted_at IS NULL
      LIMIT 1
    `, {
      replacements: [user.id, classId]
    });

    if (result.length === 0) {
      res.status(403).json({
        success: false,
        message: '您无权访问此班级的信息',
        error: 'PARENT_CLASS_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('家长班级权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};

/**
 * 通用学生数据权限检查
 * 根据用户角色自动应用相应的权限检查
 */
export const checkStudentDataAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 管理员和园长跳过检查
    if (user.role === 'admin' || user.role === 'principal') {
      next();
      return;
    }

    // 根据角色调用相应的检查函数
    if (user.role === 'teacher') {
      await checkTeacherStudentAccess(req, res, next);
    } else if (user.role === 'parent') {
      await checkParentStudentAccess(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    console.error('学生数据权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};

/**
 * 通用班级数据权限检查
 * 根据用户角色自动应用相应的权限检查
 */
export const checkClassDataAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user as any;

    // 管理员和园长跳过检查
    if (user.role === 'admin' || user.role === 'principal') {
      next();
      return;
    }

    // 根据角色调用相应的检查函数
    if (user.role === 'teacher') {
      await checkTeacherClassAccess(req, res, next);
    } else if (user.role === 'parent') {
      await checkParentClassAccess(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    console.error('班级数据权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败',
      error: 'PERMISSION_CHECK_ERROR'
    });
    return;
  }
};