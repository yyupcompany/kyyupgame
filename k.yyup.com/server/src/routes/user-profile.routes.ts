/**
* @swagger
 * components:
 *   schemas:
 *     User-profile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User-profile ID
 *           example: 1
 *         name:
 *           type: string
 *           description: User-profile 名称
 *           example: "示例User-profile"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateUser-profileRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: User-profile 名称
 *           example: "新User-profile"
 *     UpdateUser-profileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User-profile 名称
 *           example: "更新后的User-profile"
 *     User-profileListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User-profile'
 *         message:
 *           type: string
 *           example: "获取user-profile列表成功"
 *     User-profileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/User-profile'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * user-profile管理路由文件
 * 提供user-profile的基础CRUD操作
*
 * 功能包括：
 * - 获取user-profile列表
 * - 创建新user-profile
 * - 获取user-profile详情
 * - 更新user-profile信息
 * - 删除user-profile
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 用户个人中心路由
*/

import { Router } from 'express';
import { UserProfileController } from '../controllers/user-profile.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// 配置头像上传
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    const filename = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif)'));
    }
  }
});

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary 获取当前用户信息
* @description 获取当前登录用户的详细个人信息，包括基本信息、联系方式、角色权限、账户设置等。支持返回用户的完整档案信息和个人偏好设置。
* @tags UserProfile - 用户个人中心
* @access Private
* @security [{"bearerAuth": []}]
* @param {boolean} [query.includePermissions=false] query optional 是否包含权限信息
* @param {boolean} [query.includePreferences=true] query optional 是否包含个人偏好设置
* @param {boolean} [query.includeUsageStats=false] query optional 是否包含使用统计
* @param {string} [query.fields] query optional 指定返回字段，多个字段用逗号分隔 - basic:基本信息, contact:联系方式, preferences:偏好设置, all:全部
* @responses {200} {object} Success_用户信息获取成功
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {404} {object} Error_用户不存在
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/profile', UserProfileController.getProfile);

/**
* @summary 更新用户信息
* @description 更新当前登录用户的个人信息，包括基本信息、联系方式、偏好设置等。支持部分更新和数据验证，确保信息的准确性和完整性。
* @tags UserProfile - 用户个人中心
* @access Private
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 用户信息更新数据
* @param {string} [requestBody.body.nickname] optional 用户昵称（2-20个字符）
* @param {string} [requestBody.body.phone] optional 手机号码（11位数字）
* @param {string} [requestBody.body.email] optional 电子邮箱地址
* @param {string} [requestBody.body.gender] optional 性别 - male:男, female:女, other:其他
* @param {string} [requestBody.body.birthday] optional 出生日期（YYYY-MM-DD格式）
* @param {string} [requestBody.body.address] optional 联系地址
* @param {string} [requestBody.body.bio] optional 个人简介（最多200字符）
* @param {object} [requestBody.body.preferences] optional 个人偏好设置
* @param {string} [requestBody.body.preferences.language] optional 界面语言偏好 - zh-CN:中文, en-US:英文
* @param {string} [requestBody.body.preferences.timezone] optional 时区设置
* @param {object} [requestBody.body.preferences.notifications] optional 通知设置
* @param {boolean} [requestBody.body.preferences.notifications.email] optional 是否接收邮件通知
* @param {boolean} [requestBody.body.preferences.notifications.push] optional 是否接收推送通知
* @param {string} [requestBody.body.preferences.notifications.frequency] optional 通知频率 - immediate:立即, daily:每日, weekly:每周
* @responses {200} {object} Success_用户信息更新成功
* @responses {400} {object} Error_请求参数错误或数据验证失败
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {409} {object} Error_数据冲突（如邮箱已存在）
* @responses {500} {object} Error_服务器内部错误
*/
router.put('/profile', UserProfileController.updateProfile);

/**
* @summary 修改密码
* @description 修改当前用户的登录密码。需要验证当前密码的正确性，新密码需要符合安全策略（长度、复杂度等）。修改成功后需要重新登录。
* @tags UserProfile - 用户个人中心
* @access Private
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 密码修改数据
* @param {string} requestBody.body.currentPassword.required 当前密码
* @param {string} requestBody.body.newPassword.required 新密码（8-20位，包含字母和数字）
* @param {string} requestBody.body.confirmPassword.required 确认新密码（必须与新密码一致）
* @param {boolean} [requestBody.body.logoutOtherDevices=false] optional 是否同时退出其他设备
* @responses {200} {object} Success_密码修改成功
* @responses {400} {object} Error_请求参数错误或密码验证失败
* @responses {401} {object} Error_当前密码错误或未授权访问
* @responses {403} {object} Error_密码修改过于频繁
* @responses {500} {object} Error_服务器内部错误
*/
router.post('/change-password', UserProfileController.changePassword);

/**
* @summary 上传头像
* @description 上传并设置用户头像图片。支持jpg、png、gif格式，文件大小限制5MB。上传成功后会自动压缩和裁剪，生成多种尺寸的缩略图。
* @tags UserProfile - 用户个人中心
* @access Private
* @security [{"bearerAuth": []}]
* @requestBody multipart/form-data
* @param {file} formData.avatar.required 头像图片文件（jpeg, jpg, png, gif格式，最大5MB）
* @param {integer} [formData.cropX] optional 裁剪起始X坐标
* @param {integer} [formData.cropY] optional 裁剪起始Y坐标
* @param {integer} [formData.cropWidth] optional 裁剪宽度
* @param {integer} [formData.cropHeight] optional 裁剪高度
* @param {boolean} [formData.grayscale=false] optional 是否转换为黑白头像
* @responses {200} {object} Success_头像上传成功
* @responses {400} {object} Error_请求参数错误或文件格式不支持
* @responses {401} {object} Error_未授权访问
* @responses {413} {object} Error_文件大小超出限制
* @responses {415} {object} Error_文件类型不支持
* @responses {500} {object} Error_服务器内部错误或文件上传失败
*/
router.post('/upload-avatar', upload.single('avatar'), UserProfileController.uploadAvatar);

export default router;

