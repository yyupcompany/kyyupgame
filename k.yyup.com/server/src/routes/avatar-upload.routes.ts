/**
 * 头像上传API路由
 * 支持学生和用户头像上传到OSS
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
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/upload/avatar/student/{studentId}:
 *   post:
 *     summary: 上传学生头像
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *       - in: formData
 *         name: avatar
 *         required: true
 *         schema:
 *           type: string
 *           format: binary
 *         description: 头像文件
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
router.post('/avatar/student/:studentId', upload.single('avatar'), async (req: any, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的头像文件',
        data: null
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: '学生ID不能为空',
        data: null
      });
    }

    // 生成唯一文件名，保留原始文件扩展名
    const ext = path.extname(file.originalname);
    const uniqueName = `student-${studentId}-${uuidv4()}${ext}`;

    // 使用租户OSS上传学生头像
    const uploadResult = await tenantOSS.uploadFile(req, file.buffer, {
      filename: uniqueName,
      directory: 'user-uploads', // 租户隔离的通用上传目录
      contentType: file.mimetype
    });

    console.log(`[AVATARUPLOAD]: ✅ 学生头像上传成功: 学生${studentId}, 文件: ${uploadResult.ossPath}`);

    res.json({
      success: true,
      message: '学生头像上传成功',
      data: {
        studentId: Number(studentId),
        avatarUrl: uploadResult.url,
        ossPath: uploadResult.ossPath,
        filename: uploadResult.filename,
        size: uploadResult.size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[AVATARUPLOAD]: 学生头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/upload/avatar/user:
 *   post:
 *     summary: 上传用户头像
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: formData
 *         name: avatar
 *         required: true
 *         schema:
 *           type: string
 *           format: binary
 *         description: 头像文件
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
router.post('/avatar/user', upload.single('avatar'), async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

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
        message: '请选择要上传的头像文件',
        data: null
      });
    }

    // 生成唯一文件名，保留原始文件扩展名
    const ext = path.extname(file.originalname);
    const uniqueName = `user-${userId}-${uuidv4()}${ext}`;

    // 使用租户OSS上传用户头像
    const uploadResult = await tenantOSS.uploadFile(req, file.buffer, {
      filename: uniqueName,
      directory: 'user-uploads', // 租户隔离的通用上传目录
      contentType: file.mimetype
    });

    console.log(`[AVATARUPLOAD]: ✅ 用户头像上传成功: 用户${userId}, 文件: ${uploadResult.ossPath}`);

    res.json({
      success: true,
      message: '用户头像上传成功',
      data: {
        userId,
        avatarUrl: uploadResult.url,
        ossPath: uploadResult.ossPath,
        filename: uploadResult.filename,
        size: uploadResult.size,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[AVATARUPLOAD]: 用户头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/upload/avatar/teacher/{teacherId}:
 *   post:
 *     summary: 上传教师头像
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *       - in: formData
 *         name: avatar
 *         required: true
 *         schema:
 *           type: string
 *           format: binary
 *         description: 头像文件
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
router.post('/avatar/teacher/:teacherId', upload.single('avatar'), async (req: any, res) => {
  try {
    const { teacherId } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的头像文件',
        data: null
      });
    }

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: '教师ID不能为空',
        data: null
      });
    }

    // 生成唯一文件名，保留原始文件扩展名
    const ext = path.extname(file.originalname);
    const uniqueName = `teacher-${teacherId}-${uuidv4()}${ext}`;

    // 使用租户OSS上传教师头像
    const uploadResult = await tenantOSS.uploadFile(req, file.buffer, {
      filename: uniqueName,
      directory: 'user-uploads', // 租户隔离的通用上传目录
      contentType: file.mimetype
    });

    console.log(`[AVATARUPLOAD]: ✅ 教师头像上传成功: 教师${teacherId}, 文件: ${uploadResult.ossPath}`);

    res.json({
      success: true,
      message: '教师头像上传成功',
      data: {
        teacherId: Number(teacherId),
        avatarUrl: uploadResult.url,
        ossPath: uploadResult.ossPath,
        filename: uploadResult.filename,
        size: uploadResult.size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[AVATARUPLOAD]: 教师头像上传失败:', error);
    res.status(500).json({
      success: false,
      message: '头像上传失败',
      error: error.message,
      data: null
    });
  }
});

export default router;