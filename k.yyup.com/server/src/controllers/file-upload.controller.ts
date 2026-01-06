import { Request, Response } from 'express';
import multer from 'multer';
import fileUploadService from '../services/file-upload.service';
import { videoProcessingService } from '../services/video-processing.service';

// Multer内存存储配置
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedMimes = [
    // 图片
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // 视频
    'video/mp4',
    'video/webm',
    // 音频
    'audio/mpeg',
    'audio/wav',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
};

// Multer上传中间件配置（根据文件类型动态限制大小）
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB（视频文件）
  },
});

/**
 * 文件上传控制器
 */
export class FileUploadController {
  /**
   * 上传单个文件
   */
  async uploadSingleFile(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const userId = (req as any).user?.id;

      if (!file) {
        res.status(400).json({
          success: false,
          message: '未找到上传的文件',
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未登录',
        });
        return;
      }

      let fileBuffer = file.buffer;
      let processedInfo: any = {};

      // 如果是视频文件，进行处理
      if (file.mimetype.startsWith('video/')) {
        console.log(`🎬 检测到视频文件: ${file.originalname}`);

        const result = await videoProcessingService.processUploadedVideo(
          file.buffer,
          file.originalname
        );

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: result.error || '视频处理失败',
          });
          return;
        }

        fileBuffer = result.buffer!;
        processedInfo = {
          duration: result.duration,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.originalSize && result.compressedSize
            ? ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1) + '%'
            : undefined
        };

        console.log(`✅ 视频处理完成: 时长${result.duration?.toFixed(1)}秒, 压缩${processedInfo.compressionRatio}`);
      }

      // 上传文件（使用处理后的buffer）
      const fileStorage = await fileUploadService.uploadFile(
        fileBuffer,
        file.originalname,
        file.mimetype,
        userId,
        'notification',
        10 * 1024 * 1024 // 10MB限制
      );

      res.status(201).json({
        success: true,
        message: '文件上传成功',
        data: {
          id: fileStorage.id,
          fileName: fileStorage.fileName,
          originalName: fileStorage.originalName,
          fileSize: fileStorage.fileSize,
          fileType: fileStorage.fileType,
          url: fileStorage.accessUrl,
          ...processedInfo
        },
      });
    } catch (error: unknown) {
      console.error('文件上传失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '文件上传失败',
      });
    }
  }

  /**
   * 上传多个文件
   */
  async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = (req as any).user?.id;

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: '未找到上传的文件',
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '用户未登录',
        });
        return;
      }

      // 处理文件（包括视频转码）
      const processedFiles: Array<{
        buffer: Buffer;
        originalName: string;
        mimeType: string;
        processedInfo?: any;
      }> = [];

      for (const file of files) {
        let fileBuffer = file.buffer;
        let processedInfo: any = {};

        // 如果是视频文件，进行处理
        if (file.mimetype.startsWith('video/')) {
          console.log(`🎬 处理视频文件: ${file.originalname}`);

          const result = await videoProcessingService.processUploadedVideo(
            file.buffer,
            file.originalname
          );

          if (!result.success) {
            res.status(400).json({
              success: false,
              message: `视频 ${file.originalname} 处理失败: ${result.error}`,
            });
            return;
          }

          fileBuffer = result.buffer!;
          processedInfo = {
            duration: result.duration,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize
          };
        }

        processedFiles.push({
          buffer: fileBuffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          processedInfo
        });
      }

      // 批量上传文件
      const fileData = processedFiles.map(file => ({
        buffer: file.buffer,
        originalName: file.originalName,
        mimeType: file.mimeType,
      }));

      const uploadedFiles = await fileUploadService.uploadFiles(
        fileData,
        userId,
        'notification'
      );

      res.status(201).json({
        success: true,
        message: `成功上传${uploadedFiles.length}个文件`,
        data: uploadedFiles.map((file, index) => ({
          id: file.id,
          fileName: file.fileName,
          originalName: file.originalName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          url: file.accessUrl,
          ...processedFiles[index].processedInfo
        })),
      });
    } catch (error: unknown) {
      console.error('批量文件上传失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '批量文件上传失败',
      });
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          message: '文件ID不能为空',
        });
        return;
      }

      await fileUploadService.deleteFile(parseInt(fileId));

      res.status(200).json({
        success: true,
        message: '文件删除成功',
      });
    } catch (error: unknown) {
      console.error('文件删除失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '文件删除失败',
      });
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          message: '文件ID不能为空',
        });
        return;
      }

      const file = await fileUploadService.getFileInfo(parseInt(fileId));

      if (!file) {
        res.status(404).json({
          success: false,
          message: '文件不存在',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: file.id,
          fileName: file.fileName,
          originalName: file.originalName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          url: file.accessUrl,
          createdAt: file.createdAt,
        },
      });
    } catch (error: unknown) {
      console.error('获取文件信息失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取文件信息失败',
      });
    }
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await fileUploadService.getFileStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: unknown) {
      console.error('获取文件统计失败:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '获取文件统计失败',
      });
    }
  }
}

export default new FileUploadController();

