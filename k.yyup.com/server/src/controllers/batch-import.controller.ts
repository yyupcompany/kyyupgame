/**
 * 批量导入控制器
 *
 * 提供批量数据导入的API端点
 */

import { Request, Response } from 'express';
import { batchImportService } from '../services/ai/batch-import.service';
import { customerBatchImportService } from '../services/ai/customer-batch-import.service';
import { userContextProviderService } from '../services/ai/user-context-provider.service';

/**
 * 批量导入控制器类
 */
class BatchImportController {
  /**
   * 上传并预览导入文件
   * POST /api/batch-import/preview
   */
  async previewImport(req: Request, res: Response) {
    try {
      console.log('📤 [批量导入] 收到预览请求');

      // 检查文件
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      // 获取参数
      const { entityType } = req.body;
      if (!entityType) {
        return res.status(400).json({
          success: false,
          message: '请指定实体类型'
        });
      }

      console.log(`📄 [批量导入] 文件: ${req.file.originalname}, 实体类型: ${entityType}`);

      // 解析文件
      const data = batchImportService.parseFile(req.file.buffer, req.file.originalname);

      // 获取用户上下文
      const userContext = userContextProviderService.extractUserContextFromRequest(req);

      // 预览导入
      const preview = await batchImportService.previewImport(entityType, data, userContext);

      res.json({
        success: true,
        data: preview
      });
    } catch (error: any) {
      console.error('❌ [批量导入] 预览失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '预览导入失败'
      });
    }
  }

  /**
   * 执行批量导入
   * POST /api/batch-import/execute
   */
  async executeImport(req: Request, res: Response) {
    try {
      console.log('📥 [批量导入] 收到执行请求');

      const { entityType, data } = req.body;

      if (!entityType || !data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          message: '参数错误：需要 entityType 和 data 数组'
        });
      }

      console.log(`📥 [批量导入] 实体类型: ${entityType}, 数据行数: ${data.length}`);

      // 获取用户上下文
      const userContext = userContextProviderService.extractUserContextFromRequest(req);

      // 执行批量导入
      const result = await batchImportService.batchImport(entityType, data, userContext);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error: any) {
      console.error('❌ [批量导入] 执行失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '批量导入失败'
      });
    }
  }

  /**
   * 客户预览导入
   * POST /api/batch-import/customer-preview
   */
  async previewCustomerImport(req: Request, res: Response) {
    try {
      console.log('📤 [客户导入预览] 收到预览请求');

      // 检查文件
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      console.log(`📄 [客户导入预览] 文件: ${req.file.originalname}`);

      // 生成预览数据
      const preview = await customerBatchImportService.generatePreview(
        req.file.buffer,
        req.file.originalname
      );

      res.json({
        success: true,
        data: preview
      });
    } catch (error: any) {
      console.error('❌ [客户导入预览] 预览失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '预览导入失败'
      });
    }
  }

  /**
   * 下载导入模板
   * GET /api/batch-import/template/:entityType
   */
  async downloadTemplate(req: Request, res: Response) {
    try {
      const { entityType } = req.params;

      console.log(`📄 [批量导入] 下载模板: ${entityType}`);

      // 生成模板
      const buffer = batchImportService.generateTemplate(entityType);

      // 设置响应头
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${entityType}_import_template.xlsx"`);

      // 发送文件
      res.send(buffer);
    } catch (error: any) {
      console.error('❌ [批量导入] 下载模板失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '下载模板失败'
      });
    }
  }
}

// 导出单例
export const batchImportController = new BatchImportController();

