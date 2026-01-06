import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 确保海报上传目录存在
const postersUploadsPath = path.join(__dirname, '../../../uploads/posters'); // Adjusted path relative to dist/controllers
if (!fs.existsSync(postersUploadsPath)) {
  fs.mkdirSync(postersUploadsPath, { recursive: true });
}

// 专门为海报设计的 Multer storage 配置
const posterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postersUploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `poster-${uniqueSuffix}${ext}`);
  },
});

export const uploadPosterImageMiddleware = multer({ storage: posterStorage });

export class PosterUploadController {
  async uploadPosterImage(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: '未找到上传的海报图片文件',
        });
        return;
      }

      // 构建文件信息，特别是可访问的 URL
      // 假设 Express 静态服务配置为从 /uploads 提供服务
      const fileUrl = `/uploads/posters/${file.filename}`;

      res.status(201).json({
        success: true,
        message: '海报图片上传成功',
        data: {
          url: fileUrl, // 前端期望的字段名
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        },
      });
    } catch (error: unknown) {
      console.error('海报图片上传失败:', error);
      res.status(500).json({
        success: false,
        message: '海报图片上传失败',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} 