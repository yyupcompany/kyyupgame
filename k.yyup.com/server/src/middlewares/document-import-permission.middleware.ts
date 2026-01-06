/**
 * 文档导入权限检查中间件
 * 根据用户角色和导入类型检查权限
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface DocumentImportRequest extends Request {
  user: {
    id: number;
    username: string;
    role: string;
  };
  body: {
    documentType: 'teacher' | 'parent';
    documentContent: string;
  };
}

/**
 * 权限配置
 */
const IMPORT_PERMISSIONS = {
  teacher: ['principal', 'admin'], // 园长和管理员可以导入教师数据
  parent: ['teacher', 'principal', 'admin'] // 教师、园长和管理员可以导入家长数据
};

/**
 * 检查文档导入权限
 */
export const checkDocumentImportPermission = (
  req: DocumentImportRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentType } = req.body;
    const userRole = req.user?.role?.toLowerCase();
    
    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'documentType参数必须提供'
      });
    }

    if (!['teacher', 'parent'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'documentType只能是teacher或parent'
      });
    }

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: '用户角色信息缺失'
      });
    }

    const allowedRoles = IMPORT_PERMISSIONS[documentType];
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('用户尝试无权限的文档导入操作', {
        userId: req.user.id,
        username: req.user.username,
        userRole,
        documentType,
        allowedRoles
      });

      return res.status(403).json({
        success: false,
        message: `您的角色 ${userRole} 无权限导入${documentType === 'teacher' ? '教师' : '家长'}数据。${documentType === 'teacher' ? '只有园长和管理员可以导入教师数据' : '教师、园长和管理员可以导入家长数据'}。`
      });
    }

    logger.info('文档导入权限检查通过', {
      userId: req.user.id,
      username: req.user.username,
      userRole,
      documentType
    });

    next();
    
  } catch (error) {
    logger.error('文档导入权限检查失败', { error, user: req.user });
    
    res.status(500).json({
      success: false,
      message: '权限检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 验证请求体数据
 */
export const validateDocumentImportRequest = (
  req: DocumentImportRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentContent, documentType } = req.body;

    if (!documentContent || typeof documentContent !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'documentContent参数必须是有效的字符串'
      });
    }

    if (documentContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '文档内容过短，请提供有效的文档内容'
      });
    }

    if (documentContent.length > 100000) { // 100KB限制
      return res.status(400).json({
        success: false,
        message: '文档内容过大，请限制在100KB以内'
      });
    }

    next();
    
  } catch (error) {
    logger.error('文档导入请求验证失败', { error });
    
    res.status(500).json({
      success: false,
      message: '请求验证失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
};

/**
 * 组合中间件 - 同时检查权限和验证请求
 */
export const documentImportMiddleware = [
  validateDocumentImportRequest,
  checkDocumentImportPermission
];