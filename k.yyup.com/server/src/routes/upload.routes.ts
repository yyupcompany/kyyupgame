/**
 * 通用文件上传API路由
 * 支持各种类型文件上传到OSS
*/

import { Router } from 'express';
import multer from 'multer';
import { tenantOSS } from '../services/tenant-oss-router.service';
import { verifyToken } from '../middlewares/auth.middleware';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  }
});

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/upload:
 *   post:
 *     summary: 通用文件上传
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: formData
 *         name: file
 *         required: true
 *         schema:
 *           type: string
 *           format: binary
 *         description: 要上传的文件
 *       - in: formData
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, other]
 *         description: 文件类型分类
 *     responses:
 *       200:
 *         description: 上传成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/', upload.single('file'), async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;
    const { type = 'other' } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件',
        data: null
      });
    }

    let directory: 'documents' | 'logos' | 'user-uploads' = 'user-uploads';
    switch (type) {
      case 'image':
        directory = 'user-uploads';
        break;
      case 'document':
        directory = 'documents';
        break;
      case 'video':
        directory = 'user-uploads';
        break;
      case 'audio':
        directory = 'user-uploads';
        break;
      default:
        directory = 'user-uploads';
    }

    const ext = path.extname(file.originalname);
    const uniqueName = `${type}-${userId}-${uuidv4()}${ext}`;

    // 使用租户OSS上传文件
    const uploadResult = await tenantOSS.uploadFile(req, file.buffer, {
      filename: uniqueName,
      directory: directory,
      contentType: file.mimetype
    });

    console.log(`[UPLOAD]: ✅ 文件上传成功: 用户${userId}, 类型: ${type}, 文件: ${uploadResult.ossPath}`);

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileId: uuidv4(),
        originalName: file.originalname,
        fileName: uploadResult.filename,
        fileSize: file.size,
        fileType: type,
        mimeType: file.mimetype,
        url: uploadResult.url,
        ossPath: uploadResult.ossPath,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[UPLOAD]: 文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: 批量文件上传
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: formData
 *         name: files
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *         description: 要上传的文件列表
 *       - in: formData
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, document, video, audio, other]
 *         description: 文件类型分类
 *     responses:
 *       200:
 *         description: 上传成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/multiple', upload.array('files', 10), async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const files = req.files as Express.Multer.File[];
    const { type = 'other' } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件',
        data: null
      });
    }

    let directory: 'documents' | 'logos' | 'user-uploads' = 'user-uploads';
    switch (type) {
      case 'image':
        directory = 'user-uploads';
        break;
      case 'document':
        directory = 'documents';
        break;
      case 'video':
        directory = 'user-uploads';
        break;
      case 'audio':
        directory = 'user-uploads';
        break;
      default:
        directory = 'user-uploads';
    }

    const uploadResults: any[] = [];

    for (const file of files) {
      try {
        // 生成唯一文件名，保留原始文件扩展名
        const ext = path.extname(file.originalname);
        const uniqueName = `${type}-${userId}-${uuidv4()}${ext}`;

        // 使用租户OSS上传文件
        const uploadResult = await tenantOSS.uploadFile(req, file.buffer, {
          filename: uniqueName,
          directory: directory,
          contentType: file.mimetype
        });

        uploadResults.push({
          fileId: uuidv4(),
          originalName: file.originalname,
          fileName: uploadResult.filename,
          fileSize: file.size,
          fileType: type,
          mimeType: file.mimetype,
          url: uploadResult.url,
          ossPath: uploadResult.ossPath
        });

      } catch (error) {
        console.error('[UPLOAD]: 文件 ${file.originalname} 上传失败:', error);
        // 继续处理其他文件，不中断整个过程
      }
    }

    console.log(`[UPLOAD]: ✅ 批量文件上传完成: 用户${userId}, 成功: ${uploadResults.length}/${files.length}`);

    res.json({
      success: true,
      message: `批量上传完成，成功上传 ${uploadResults.length} 个文件`,
      data: {
        totalFiles: files.length,
        successCount: uploadResults.length,
        failedCount: files.length - uploadResults.length,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        files: uploadResults
      }
    });

  } catch (error: any) {
    console.error('[UPLOAD]: 批量文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '批量文件上传失败',
      error: error.message,
      data: null
    });
  }
});

export default router;