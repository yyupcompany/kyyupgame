/**
 * 文档导入控制器
 * 处理AI驱动的文档解析和数据导入功能
 */

import { Request, Response } from 'express';
import DocumentImportService from '../services/ai/document-import.service';
import { logger } from '../utils/logger';
import { DocumentImportRequest as MiddlewareRequest } from '../middlewares/document-import-permission.middleware';

interface ExtendedRequest extends MiddlewareRequest {
  body: {
    documentType: 'teacher' | 'parent';
    documentContent: string;
    previewOnly?: boolean; // 仅预览，不实际导入
  };
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export class DocumentImportController {
  /**
   * 导入文档数据
   * POST /api/document-import/import
   */
  async importDocument(req: ExtendedRequest, res: Response) {
    try {
      const { documentType, documentContent, previewOnly = false } = req.body;
      const { id: importerId, role: importerRole, username } = req.user;

      logger.info('开始文档导入处理', {
        documentType,
        importerId,
        importerRole,
        username,
        previewOnly,
        contentLength: documentContent.length
      });

      // 调用文档导入服务
      const result = await DocumentImportService.importDocument({
        documentContent,
        documentType,
        importerRole,
        importerId
      });

      if (!result.success) {
        logger.warn('文档导入失败', {
          importerId,
          documentType,
          errors: result.errors,
          validationErrors: result.validationErrors
        });

        return res.status(400).json({
          success: false,
          message: '文档导入失败',
          errors: result.errors,
          validationErrors: result.validationErrors,
          parsedData: result.parsedData // 返回解析的数据供前端显示
        });
      }

      logger.info('文档导入成功', {
        importerId,
        documentType,
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        errorsCount: result.errors?.length || 0
      });

      res.json({
        success: true,
        message: '文档导入成功',
        data: {
          documentType,
          importedCount: result.importedCount,
          skippedCount: result.skippedCount,
          totalParsed: result.parsedData?.length || 0,
          parsedData: result.parsedData,
          errors: result.errors
        }
      });

    } catch (error) {
      logger.error('文档导入控制器异常', {
        error,
        user: req.user,
        body: req.body
      });

      res.status(500).json({
        success: false,
        message: '文档导入服务异常',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 预览文档解析结果（不实际导入）
   * POST /api/document-import/preview
   */
  async previewDocument(req: ExtendedRequest, res: Response) {
    try {
      const { documentType, documentContent } = req.body;
      const { id: importerId, role: importerRole, username } = req.user;

      logger.info('开始文档预览解析', {
        documentType,
        importerId,
        importerRole,
        username,
        contentLength: documentContent.length
      });

      // 调用AI解析但不实际导入
      const result = await DocumentImportService.importDocument({
        documentContent,
        documentType,
        importerRole,
        importerId
      });

      // 即使解析成功也不进行实际导入，只返回解析结果
      res.json({
        success: true,
        message: '文档预览解析完成',
        data: {
          documentType,
          totalParsed: result.parsedData?.length || 0,
          parsedData: result.parsedData,
          validationErrors: result.validationErrors,
          canImport: result.success && (!result.validationErrors || result.validationErrors.length === 0)
        }
      });

    } catch (error) {
      logger.error('文档预览解析异常', {
        error,
        user: req.user,
        body: req.body
      });

      res.status(500).json({
        success: false,
        message: '文档预览解析失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取导入权限信息
   * GET /api/document-import/permissions
   */
  async getImportPermissions(req: MiddlewareRequest, res: Response) {
    try {
      const userRole = req.user.role.toLowerCase();
      
      const permissions = {
        teacher: ['principal', 'admin'].includes(userRole),
        parent: ['teacher', 'principal', 'admin'].includes(userRole)
      };

      res.json({
        success: true,
        data: {
          userRole: req.user.role,
          permissions,
          canImportTeacher: permissions.teacher,
          canImportParent: permissions.parent,
          permissionInfo: {
            teacher: '只有园长和管理员可以导入教师数据',
            parent: '教师、园长和管理员可以导入家长数据'
          }
        }
      });

    } catch (error) {
      logger.error('获取导入权限信息失败', { error, user: req.user });

      res.status(500).json({
        success: false,
        message: '获取权限信息失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取导入历史记录
   * GET /api/document-import/history
   */
  async getImportHistory(req: MiddlewareRequest, res: Response) {
    try {
      // TODO: 实现导入历史记录功能
      // 可以创建 import_logs 表来记录每次导入操作
      
      res.json({
        success: true,
        message: '导入历史记录功能待实现',
        data: {
          history: [],
          total: 0
        }
      });

    } catch (error) {
      logger.error('获取导入历史记录失败', { error, user: req.user });

      res.status(500).json({
        success: false,
        message: '获取历史记录失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取支持的文档格式信息
   * GET /api/document-import/formats
   */
  async getSupportedFormats(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          supportedFormats: [
            {
              type: 'text',
              description: '纯文本格式',
              examples: ['姓名: 张三\n邮箱: zhang@example.com\n电话: 13800138000']
            },
            {
              type: 'table',
              description: '表格格式（制表符或逗号分隔）',
              examples: ['姓名\t邮箱\t电话\n张三\tzhang@example.com\t13800138000']
            },
            {
              type: 'json',
              description: 'JSON格式',
              examples: ['[{"name": "张三", "email": "zhang@example.com", "phone": "13800138000"}]']
            }
          ],
          teacherFields: [
            { field: 'name', required: true, description: '教师姓名' },
            { field: 'email', required: false, description: '邮箱地址' },
            { field: 'phone', required: false, description: '手机号码' },
            { field: 'qualification', required: false, description: '教师资格' },
            { field: 'experience', required: false, description: '工作年限' },
            { field: 'specialization', required: false, description: '专业领域' },
            { field: 'employmentDate', required: false, description: '入职日期' }
          ],
          parentFields: [
            { field: 'name', required: true, description: '家长姓名' },
            { field: 'email', required: false, description: '邮箱地址' },
            { field: 'phone', required: false, description: '手机号码' },
            { field: 'relationship', required: false, description: '与学生关系' },
            { field: 'occupation', required: false, description: '职业' },
            { field: 'address', required: false, description: '地址' },
            { field: 'studentName', required: false, description: '学生姓名' }
          ]
        }
      });

    } catch (error) {
      logger.error('获取支持格式信息失败', { error });

      res.status(500).json({
        success: false,
        message: '获取格式信息失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}

export default new DocumentImportController();