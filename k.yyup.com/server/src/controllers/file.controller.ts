import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { parseId, parsePage, parsePageSize, parseBoolean } from '../utils/param-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { imageCompressionService } from '../services/image-compression.service';

// 临时类型定义，替代已删除的file.service.ts
interface FileQueryParams {
  module?: string;
  uploaderType?: string;
  uploaderId?: number;
  fileType?: string;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface CreateFileDto {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  storageType: string;
  accessUrl: string;
  isPublic: boolean;
  uploaderId?: number;
  uploaderType?: string;
  module?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

interface UpdateFileDto {
  fileName?: string;
  originalName?: string;
  isPublic?: boolean;
  module?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
  status?: any;
}

// 临时FileService类，提供基本功能
class FileService {
  async getFileList(params: FileQueryParams) {
    // 临时实现，返回空列表
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      totalPages: 0
    };
  }

  async getFileStatistics() {
    return {
      totalFiles: 0,
      totalSize: 0,
      fileTypes: {}
    };
  }

  async getStorageInfo() {
    return {
      totalSpace: 0,
      usedSpace: 0,
      freeSpace: 0
    };
  }

  async getFileById(id: string) {
    return null;
  }

  async createFile(data: CreateFileDto) {
    return {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateFile(id: string, data: UpdateFileDto) {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async deleteFile(id: string, physicalDelete?: boolean) {
    return true;
  }

  async cleanupTempFiles(olderThanHours?: number) {
    return { deletedCount: 0, freedSpace: 0 };
  }
}

// 确保上传目录存在
const uploadsPath = path.join(__dirname, '../../../uploads/files');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer storage 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // 允许的文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',  // 添加SVG支持
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml'
    ];

    // 检查文件类型
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`));
      return;
    }

    // 检查文件扩展名
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.csv', '.json', '.xml'
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      cb(new Error(`不支持的文件扩展名: ${fileExtension}`));
      return;
    }

    // 检查文件名长度
    if (file.originalname.length > 255) {
      cb(new Error('文件名过长，请缩短文件名'));
      return;
    }

    // 检查文件名是否包含危险字符
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.originalname)) {
      cb(new Error('文件名包含非法字符'));
      return;
    }

    cb(null, true);
  } catch (error) {
    cb(new Error('文件验证失败'));
  }
};

// 创建multer实例
export const uploadFileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  }
});

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  /**
   * 获取文件列表
   */
  public getFileList = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryParams: FileQueryParams = {
        module: req.query.module as string,
        uploaderType: req.query.uploaderType as string,
        uploaderId: req.query.uploaderId ? parseId(req.query.uploaderId as string) : undefined,
        fileType: req.query.fileType as string,
        status: req.query.status as string,
        keyword: req.query.keyword as string,
        page: parsePage(req.query.page as string),
        pageSize: parsePageSize(req.query.pageSize as string),
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
      };

      const result = await this.fileService.getFileList(queryParams);
      ApiResponse.success(res, result);
    } catch (error) {
      ApiResponse.handleError(res, error, '获取文件列表失败');
    }
  }

  /**
   * 获取文件统计信息
   */
  public getFileStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.fileService.getFileStatistics();
      ApiResponse.success(res, stats);
    } catch (error) {
      ApiResponse.handleError(res, error, '获取文件统计失败');
    }
  }

  /**
   * 获取存储空间信息
   */
  public getStorageInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const storageInfo = await this.fileService.getStorageInfo();
      ApiResponse.success(res, storageInfo);
    } catch (error) {
      ApiResponse.handleError(res, error, '获取存储空间信息失败');
    }
  }

  /**
   * 获取文件详情
   */
  public getFileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await this.fileService.getFileById(id);

      if (!file) {
        ApiResponse.notFound(res, '文件不存在');
        return;
      }

      ApiResponse.success(res, file);
    } catch (error) {
      ApiResponse.handleError(res, error, '获取文件详情失败');
    }
  }

  /**
   * 文件上传
   */
  public uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file as Express.Multer.File;

      if (!file) {
        ApiResponse.badRequest(res, '未找到上传的文件');
        return;
      }

      // 验证文件大小
      if (file.size > 10 * 1024 * 1024) {
        ApiResponse.badRequest(res, '文件大小不能超过10MB');
        return;
      }

      // 🔧 如果是图片文件，自动压缩以减少token消耗
      let finalFile = file;
      let compressionInfo = null;
      const isImage = file.mimetype.startsWith('image/');

      if (isImage) {
        try {
          console.log(`🖼️ 检测到图片上传，开始压缩: ${file.originalname}`);

          // 压缩图片
          const compressionResult = await imageCompressionService.compressImageFile(file.path, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 80,
            format: 'jpeg'
          });

          // 保存压缩后的图片（覆盖原文件）
          fs.writeFileSync(file.path, compressionResult.buffer);

          // 更新文件信息
          finalFile = {
            ...file,
            size: compressionResult.compressedSize
          };

          compressionInfo = {
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: compressionResult.compressionRatio,
            width: compressionResult.width,
            height: compressionResult.height
          };

          console.log(`✅ 图片压缩完成: ${file.originalname}`);
          console.log(`   原始大小: ${(compressionResult.originalSize / 1024).toFixed(2)} KB`);
          console.log(`   压缩大小: ${(compressionResult.compressedSize / 1024).toFixed(2)} KB`);
          console.log(`   压缩率: ${compressionResult.compressionRatio.toFixed(2)}%`);
        } catch (error) {
          console.error('图片压缩失败，使用原始文件:', error);
          // 压缩失败时继续使用原始文件
        }
      }

      // 获取用户信息（如果有认证）
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.role || 'user';

      // 安全地解析FormData参数
      let isPublic = false;
      let metadata = null;
      
      try {
        isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
      } catch (error) {
        console.warn('解析isPublic参数失败:', error);
      }

      try {
        if (req.body.metadata && typeof req.body.metadata === 'string') {
          metadata = JSON.parse(req.body.metadata);
        } else if (req.body.metadata && typeof req.body.metadata === 'object') {
          metadata = req.body.metadata;
        }
      } catch (error) {
        console.warn('解析metadata参数失败:', error);
        metadata = null;
      }

      // 构建文件访问URL
      const fileUrl = `/uploads/files/${file.filename}`;

      // 创建文件记录
      const createFileData: CreateFileDto = {
        fileName: finalFile.filename,
        originalName: finalFile.originalname,
        filePath: finalFile.path,
        fileSize: finalFile.size,
        fileType: finalFile.mimetype,
        storageType: 'local',
        accessUrl: fileUrl,
        isPublic,
        uploaderId: userId || null,
        uploaderType: userType,
        module: req.body.module || 'general',
        referenceId: req.body.referenceId || null,
        referenceType: req.body.referenceType || null,
        metadata: compressionInfo ? { ...metadata, compression: compressionInfo } : metadata
      };

      const fileRecord = await this.fileService.createFile(createFileData);

      // 🔧 返回压缩信息
      const responseData = compressionInfo
        ? { ...fileRecord, compression: compressionInfo }
        : fileRecord;

      ApiResponse.success(res, responseData, '文件上传成功', 201);
    } catch (error) {
      // 如果是multer错误，提供更友好的错误信息
      if (error instanceof multer.MulterError) {
        switch (error.code) {
          case 'LIMIT_FILE_SIZE':
            ApiResponse.badRequest(res, '文件大小超过限制（最大10MB）');
            return;
          case 'LIMIT_FILE_COUNT':
            ApiResponse.badRequest(res, '文件数量超过限制');
            return;
          case 'LIMIT_UNEXPECTED_FILE':
            ApiResponse.badRequest(res, '上传了意外的文件字段');
            return;
          default:
            ApiResponse.badRequest(res, `文件上传错误: ${error.message}`);
            return;
        }
      }
      
      ApiResponse.handleError(res, error, '文件上传失败');
    }
  }

  /**
   * 文件下载
   */
  public downloadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const file = await this.fileService.getFileById(id);

      if (!file) {
        ApiResponse.notFound(res, '文件不存在');
        return;
      }

      // 检查文件是否存在于磁盘
      if (file.storageType === 'local') {
        const fullPath = path.resolve(file.filePath);

        if (!fs.existsSync(fullPath)) {
          ApiResponse.error(res, '文件已损坏或不存在', 'FILE_NOT_FOUND', 404);
          return;
        }

        // 使用 res.download() 确保正确的下载行为
        // res.download() 会自动设置正确的 Content-Type 和 Content-Disposition
        res.download(fullPath, file.originalName, (err) => {
          if (err) {
            console.error('文件下载失败:', err);
            // 只有在响应尚未发送时才发送错误
            if (!res.headersSent) {
              ApiResponse.error(res, '文件下载失败', 'DOWNLOAD_ERROR', 500);
            }
          }
        });
      } else {
        // 对于其他存储类型，重定向到访问URL
        res.redirect(file.accessUrl);
      }
    } catch (error) {
      // 只有在响应尚未发送时才发送错误
      if (!res.headersSent) {
        ApiResponse.handleError(res, error, '文件下载失败');
      }
    }
  }

  /**
   * 更新文件信息
   */
  public updateFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateFileDto = {
        fileName: req.body.fileName,
        originalName: req.body.originalName,
        isPublic: req.body.isPublic,
        module: req.body.module,
        referenceId: req.body.referenceId,
        referenceType: req.body.referenceType,
        metadata: req.body.metadata,
        status: req.body.status
      };

      // 移除undefined值
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateFileDto] === undefined) {
          delete updateData[key as keyof UpdateFileDto];
        }
      });

      const updatedFile = await this.fileService.updateFile(id, updateData);
      ApiResponse.success(res, updatedFile, '文件信息更新成功');
    } catch (error) {
      ApiResponse.handleError(res, error, '更新文件信息失败');
    }
  }

  /**
   * 删除文件
   */
  public deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const physicalDelete = req.query.physical === 'true';

      const success = await this.fileService.deleteFile(id, physicalDelete);
      
      if (success) {
        ApiResponse.success(res, null, physicalDelete ? '文件已彻底删除' : '文件已删除');
      } else {
        ApiResponse.error(res, '删除文件失败', 'DELETE_FAILED', 500);
      }
    } catch (error) {
      ApiResponse.handleError(res, error, '删除文件失败');
    }
  }

  /**
   * 清理临时文件
   */
  public cleanupTempFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const olderThanHours = req.query.hours ? Number(req.query.hours) : 24;
      
      const result = await this.fileService.cleanupTempFiles(olderThanHours);
      
      ApiResponse.success(res, result, `清理完成，删除了 ${result.deletedCount} 个临时文件，释放了 ${Math.round(result.freedSpace / 1024 / 1024 * 100) / 100} MB 空间`);
    } catch (error) {
      ApiResponse.handleError(res, error, '清理临时文件失败');
    }
  }

  /**
   * 批量上传文件
   */
  public uploadMultipleFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        ApiResponse.badRequest(res, '未找到上传的文件');
        return;
      }

      // 验证文件数量
      if (files.length > 5) {
        ApiResponse.badRequest(res, '一次最多只能上传5个文件');
        return;
      }

      // 验证总文件大小
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) { // 50MB总限制
        ApiResponse.badRequest(res, '文件总大小不能超过50MB');
        return;
      }

      const uploadedFiles = [];
      const errors = [];
      const userId = (req as any).user?.id;
      const userType = (req as any).user?.role || 'user';

      // 安全地解析FormData参数
      let isPublic = false;
      let metadata = null;
      
      try {
        isPublic = req.body.isPublic === 'true' || req.body.isPublic === true;
      } catch (error) {
        console.warn('解析isPublic参数失败:', error);
      }

      try {
        if (req.body.metadata && typeof req.body.metadata === 'string') {
          metadata = JSON.parse(req.body.metadata);
        } else if (req.body.metadata && typeof req.body.metadata === 'object') {
          metadata = req.body.metadata;
        }
      } catch (error) {
        console.warn('解析metadata参数失败:', error);
        metadata = null;
      }

      for (const uploadedFile of files) {
        try {
          // 验证单个文件大小
          if (uploadedFile.size > 10 * 1024 * 1024) {
            errors.push({
              fileName: uploadedFile.originalname,
              error: '文件大小超过10MB限制'
            });
            continue;
          }

          const fileUrl = `/uploads/files/${uploadedFile.filename}`;
          
          const createFileData: CreateFileDto = {
            fileName: uploadedFile.filename,
            originalName: uploadedFile.originalname,
            filePath: uploadedFile.path,
            fileSize: uploadedFile.size,
            fileType: uploadedFile.mimetype,
            storageType: 'local',
            accessUrl: fileUrl,
            isPublic,
            uploaderId: userId || null,
            uploaderType: userType,
            module: req.body.module || 'general',
            referenceId: req.body.referenceId || null,
            referenceType: req.body.referenceType || null,
            metadata
          };

          const fileRecord = await this.fileService.createFile(createFileData);
          uploadedFiles.push(fileRecord);
        } catch (error) {
          errors.push({
            fileName: uploadedFile.originalname,
            error: error instanceof Error ? error.message : '上传失败'
          });
        }
      }

      if (uploadedFiles.length === 0) {
        return ApiResponse.error(res, '所有文件上传失败', 'UPLOAD_FAILED', 400);
      }

      const response = {
        files: uploadedFiles,
        count: uploadedFiles.length,
        totalCount: files.length
      };

      if (errors.length > 0) {
        (response as any).errors = errors;
        ApiResponse.success(res, response, `部分文件上传成功: ${uploadedFiles.length}/${files.length}`, 201);
      } else {
        ApiResponse.success(res, response, `成功上传 ${uploadedFiles.length} 个文件`, 201);
      }
    } catch (error) {
      // 如果是multer错误，提供更友好的错误信息
      if (error instanceof multer.MulterError) {
        switch (error.code) {
          case 'LIMIT_FILE_SIZE':
            ApiResponse.badRequest(res, '文件大小超过限制（最大10MB）');
            return;
          case 'LIMIT_FILE_COUNT':
            ApiResponse.badRequest(res, '文件数量超过限制（最多5个文件）');
            return;
          case 'LIMIT_UNEXPECTED_FILE':
            ApiResponse.badRequest(res, '上传了意外的文件字段');
            return;
          default:
            ApiResponse.badRequest(res, `批量文件上传错误: ${error.message}`);
            return;
        }
      }
      
      ApiResponse.handleError(res, error, '批量文件上传失败');
    }
  }
} 