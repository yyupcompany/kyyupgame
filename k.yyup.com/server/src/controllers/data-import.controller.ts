import { Request, Response, NextFunction } from 'express';
import { DataImportService } from '../services/data-import.service';
import { DataValidationService } from '../services/data-validation.service';
import { DataImportSecurityMiddleware } from '../middlewares/data-import-security.middleware';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { auditLogPresets } from '../middlewares/audit-log.middleware';

/**
 * 数据导入控制器
 * 处理数据导入工作流的所有HTTP请求
 */

export class DataImportController {
  private dataImportService: DataImportService;
  private dataValidationService: DataValidationService;

  constructor() {
    this.dataImportService = new DataImportService();
    this.dataValidationService = new DataValidationService();
  }

  /**
   * 检查用户导入权限
   */
  checkPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { importType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!importType) {
        throw ApiError.badRequest('导入类型不能为空');
      }

      const hasPermission = await this.dataImportService.checkImportPermission(userId, importType);

      res.json({
        success: true,
        data: {
          hasPermission,
          importType,
          userId
        },
        message: hasPermission ? '权限验证通过' : '权限不足'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 解析上传的文档
   */
  parseDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filePath, importType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!filePath || !importType) {
        throw ApiError.badRequest('文件路径和导入类型不能为空');
      }

      // 检查权限
      const hasPermission = await this.dataImportService.checkImportPermission(userId, importType);
      if (!hasPermission) {
        throw ApiError.forbidden('没有数据导入权限');
      }

      // 解析文档
      const parsedData = await this.dataImportService.parseDocument(filePath, importType);

      res.json({
        success: true,
        data: parsedData,
        message: '文档解析成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取数据库表结构
   */
  getSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!type) {
        throw ApiError.badRequest('类型参数不能为空');
      }

      // 检查权限
      const hasPermission = await this.dataImportService.checkImportPermission(userId, type);
      if (!hasPermission) {
        throw ApiError.forbidden('没有数据导入权限');
      }

      // 获取数据库结构
      const schema = await this.dataImportService.getDatabaseSchema(type);
      const validationRules = this.dataValidationService.getValidationRules(type);

      res.json({
        success: true,
        data: {
          schema,
          validationRules,
          type
        },
        message: '获取数据库结构成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 🎯 生成智能字段映射和对比表
   */
  generateMapping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentFields, importType, sampleData } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!documentFields || !importType) {
        throw ApiError.badRequest('文档字段和导入类型不能为空');
      }

      // 检查权限
      const hasPermission = await this.dataImportService.checkImportPermission(userId, importType);
      if (!hasPermission) {
        throw ApiError.forbidden('没有数据导入权限');
      }

      // 获取数据库结构
      const databaseSchema = await this.dataImportService.getDatabaseSchema(importType);

      // 🎯 生成智能字段映射和对比表
      const result = await this.dataImportService.generateFieldMapping(
        documentFields,
        databaseSchema,
        importType,
        sampleData
      );

      // 记录操作日志
      logger.info('字段映射生成成功', {
        userId,
        importType,
        documentFieldsCount: documentFields.length,
        willImportCount: result.summary.willImportCount,
        willIgnoreCount: result.summary.willIgnoreCount,
        canProceed: result.summary.canProceed
      });

      res.json({
        success: true,
        data: {
          mappings: result.mappings,
          comparisonTable: result.comparisonTable,
          summary: result.summary,
          databaseSchema,
          documentFields
        },
        message: '字段映射分析完成'
      });
    } catch (error) {
      logger.error('字段映射生成失败', { error, userId: req.user?.id, importType: req.body.importType });
      next(error);
    }
  };

  /**
   * 数据预览和验证
   */
  previewData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, fieldMappings, importType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!data || !fieldMappings || !importType) {
        throw ApiError.badRequest('数据、字段映射和导入类型不能为空');
      }

      // 检查权限
      const hasPermission = await this.dataImportService.checkImportPermission(userId, importType);
      if (!hasPermission) {
        throw ApiError.forbidden('没有数据导入权限');
      }

      // 获取数据库结构
      const databaseSchema = await this.dataImportService.getDatabaseSchema(importType);

      // 数据验证和预览
      const preview = await this.dataImportService.validateAndPreview(
        data,
        fieldMappings,
        databaseSchema
      );

      res.json({
        success: true,
        data: preview,
        message: '数据预览生成成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 执行数据导入
   */
  executeImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, fieldMappings, importType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      if (!data || !fieldMappings || !importType) {
        throw ApiError.badRequest('数据、字段映射和导入类型不能为空');
      }

      // 检查权限
      const hasPermission = await this.dataImportService.checkImportPermission(userId, importType);
      if (!hasPermission) {
        throw ApiError.forbidden('没有数据导入权限');
      }

      // 数据验证
      const validation = this.dataValidationService.validateBatch(data, importType);
      
      if (validation.invalidRecords.length > 0) {
        res.status(400).json({
          success: false,
          message: '数据验证失败',
          data: {
            validRecords: validation.validRecords.length,
            invalidRecords: validation.invalidRecords.length,
            errors: validation.invalidRecords
          }
        });
        return;
      }

      // 执行批量插入
      const importResult = await this.dataImportService.executeBatchInsert(
        validation.validRecords,
        fieldMappings,
        importType,
        userId
      );

      res.json({
        success: importResult.success,
        data: importResult,
        message: importResult.success ? '数据导入成功' : '数据导入部分成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取导入历史记录
   */
  getImportHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { page = 1, pageSize = 10, importType } = req.query;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      // TODO: 实现导入历史查询逻辑
      // 从操作日志中查询用户的导入记录    // const mockHistory = {
    //         total: 0,
    //         page: parseInt(page as string),
    //         pageSize: parseInt(pageSize as string),
    //         items: []
    //       };

      res.json({
        success: true,
        data: [],
        message: '获取导入历史成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取支持的导入类型
   */
  getSupportedTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw ApiError.unauthorized('用户未登录');
      }

      // 检查用户对各种类型的导入权限
      const types = ['student', 'parent', 'teacher'];
      const permissions = await Promise.all(
        types.map(async (type) => ({
          type,
          hasPermission: await this.dataImportService.checkImportPermission(userId, type),
          displayName: this.getDisplayName(type)
        }))
      );

      res.json({
        success: true,
        data: {
          supportedTypes: permissions.filter(p => p.hasPermission),
          allTypes: permissions
        },
        message: '获取支持的导入类型成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取类型显示名称
   */
  private getDisplayName(type: string): string {
    const displayNames: Record<string, string> = {
      student: '学生',
      parent: '家长',
      teacher: '教师'
    };
    return displayNames[type] || type;
  }
}
