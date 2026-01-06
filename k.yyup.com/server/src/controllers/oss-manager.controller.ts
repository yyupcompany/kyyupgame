import { Request, Response } from 'express';
import { SystemOSSService } from '../services/system-oss.service';

export class OSSManagerController {
  /**
   * 列出 OSS 中的所有文件
   */
  static async listOSSFiles(req: Request, res: Response) {
    try {
      const { prefix = '', marker = '' } = req.query;
      
      const result = await SystemOSSService.listFiles(
        prefix as string,
        marker as string
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '未知错误'
      });
    }
  }

  /**
   * 获取 OSS 目录结构
   */
  static async getOSSStructure(req: Request, res: Response) {
    try {
      const structure = await SystemOSSService.getDirectoryStructure();
      
      res.json({
        success: true,
        data: structure
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '未知错误'
      });
    }
  }

  /**
   * 获取 OSS 统计信息
   */
  static async getOSSStats(req: Request, res: Response) {
    try {
      const stats = await SystemOSSService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '未知错误'
      });
    }
  }

  /**
   * 删除 OSS 中的文件
   */
  static async deleteOSSFile(req: Request, res: Response) {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          message: '文件路径不能为空'
        });
      }
      
      await SystemOSSService.deleteFile(key);
      
      res.json({
        success: true,
        message: '文件删除成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || '未知错误'
      });
    }
  }
}

