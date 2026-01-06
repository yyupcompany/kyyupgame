import { Router, Request, Response, NextFunction } from 'express';
import * as activityRegistrationController from '../controllers/activity-registration.controller';
import jwt from 'jsonwebtoken';

/**
* @swagger
 * components:
 *   schemas:
 *     Activity-registration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-registration ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "示例Activity-registration"
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
 *     CreateActivity-registrationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "新Activity-registration"
 *     UpdateActivity-registrationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-registration 名称
 *           example: "更新后的Activity-registration"
 *     Activity-registrationListResponse:
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
 *                 $ref: '#/components/schemas/Activity-registration'
 *         message:
 *           type: string
 *           example: "获取activity-registration列表成功"
 *     Activity-registrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-registration'
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
 * activity-registration管理路由文件
 * 提供activity-registration的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-registration列表
 * - 创建新activity-registration
 * - 获取activity-registration详情
 * - 更新activity-registration信息
 * - 删除activity-registration
*
 * 权限要求：需要有效的JWT Token认证
*/

const router = Router();

// 临时内联 verifyToken 函数以避免导入问题
const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供有效的认证令牌',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: '认证令牌不能为空',
        code: 'EMPTY_TOKEN'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;

      if (!decoded || !decoded.id) {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (jwtError: any) {
      let message = '令牌验证失败';
      let code = 'TOKEN_VERIFY_ERROR';

      if (jwtError.name === 'TokenExpiredError') {
        message = '认证令牌已过期';
        code = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        message = '无效的认证令牌格式';
        code = 'INVALID_TOKEN_FORMAT';
      }

      res.status(401).json({
        success: false,
        message,
        code
      });
    }
  } catch (error: any) {
    console.error('[认证中间件] 令牌验证异常:', error);
    res.status(500).json({
      success: false,
      message: '认证服务异常',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
        code: 'USER_NOT_AUTHENTICATED'
      });
      return;
    }

    if (!user.permissions || !user.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission
      });
      return;
    }

    next();
  };
};

// 注意：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/activity-registrations:
 *   post:
 *     summary: 创建活动报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *               - contactName
 *               - contactPhone
 *               - attendeeCount
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *               contactName:
 *                 type: string
 *                 description: 联系人姓名
 *               contactPhone:
 *                 type: string
 *                 description: 联系人电话
 *               childName:
 *                 type: string
 *                 description: 孩子姓名
 *               childAge:
 *                 type: integer
 *                 description: 孩子年龄
 *               childGender:
 *                 type: integer
 *                 description: 孩子性别 - 0:未知 1:男 2:女
 *               attendeeCount:
 *                 type: integer
 *                 description: 参加人数
 *               specialNeeds:
 *                 type: string
 *                 description: 特殊需求
 *               source:
 *                 type: string
 *                 description: 来源渠道
 *     responses:
 *       200:
 *         description: 活动报名创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.createRegistration
);

/**
* @swagger
 * /api/activity-registrations:
 *   get:
 *     summary: 获取活动报名列表
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: 学生ID
 *       - in: query
 *         name: contactName
 *         schema:
 *           type: string
 *         description: 联系人姓名
 *       - in: query
 *         name: contactPhone
 *         schema:
 *           type: string
 *         description: 联系人电话
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态 - 0:待审核 1:已确认 2:已拒绝 3:已取消 4:已签到 5:未出席
 *       - in: query
 *         name: isConversion
 *         schema:
 *           type: integer
 *         description: 是否转化 - 0:未转化 1:已转化
 *     responses:
 *       200:
 *         description: 获取活动报名列表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrations
);

/**
* @swagger
 * /api/activity-registrations/by-activity/{activityId}:
 *   get:
 *     summary: 按活动获取报名列表
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 按活动获取报名列表成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-activity/:activityId',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationsByActivity
);

/**
* @swagger
 * /api/activity-registrations/by-student/{studentId}:
 *   get:
 *     summary: 按学生获取报名列表
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 按学生获取报名列表成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 学生不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-student/:studentId',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationsByStudent
);

/**
* @swagger
 * /api/activity-registrations/by-status/{status}:
 *   get:
 *     summary: 按状态获取报名列表
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, rejected, cancelled, checked-in, absent]
 *         description: 报名状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 按状态获取报名列表成功
 *       401:
 *         description: 未授权
 *       400:
 *         description: 状态参数无效
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-status/:status',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationsByStatus
);

/**
* @swagger
 * /api/activity-registrations/batch-confirm:
 *   post:
 *     summary: 批量确认报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationIds
 *             properties:
 *               registrationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 报名ID列表
 *     responses:
 *       200:
 *         description: 批量确认报名成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/batch-confirm',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.batchConfirmRegistrations
);

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   get:
 *     summary: 获取活动报名详情
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     responses:
 *       200:
 *         description: 获取活动报名详情成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationById
);

/**
* @swagger
 * /api/activity-registrations/{id}/payment:
 *   get:
 *     summary: 获取报名付款信息
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     responses:
 *       200:
 *         description: 获取报名付款信息成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id/payment',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationPayment
);

/**
* @swagger
 * /api/activity-registrations/{id}/payment:
 *   post:
 *     summary: 处理报名付款
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: 付款金额
 *               paymentMethod:
 *                 type: string
 *                 enum: [wechat, alipay, cash, bank_transfer]
 *                 description: 付款方式
 *     responses:
 *       200:
 *         description: 处理报名付款成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/payment',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.processRegistrationPayment
);

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   put:
 *     summary: 更新活动报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactName:
 *                 type: string
 *                 description: 联系人姓名
 *               contactPhone:
 *                 type: string
 *                 description: 联系人电话
 *               childName:
 *                 type: string
 *                 description: 孩子姓名
 *               childAge:
 *                 type: integer
 *                 description: 孩子年龄
 *               childGender:
 *                 type: integer
 *                 description: 孩子性别 - 0:未知 1:男 2:女
 *               attendeeCount:
 *                 type: integer
 *                 description: 参加人数
 *               specialNeeds:
 *                 type: string
 *                 description: 特殊需求
 *               source:
 *                 type: string
 *                 description: 来源渠道
 *               remark:
 *                 type: string
 *                 description: 备注信息
 *     responses:
 *       200:
 *         description: 活动报名更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.updateRegistration
);

/**
* @swagger
 * /api/activity-registrations/{id}:
 *   delete:
 *     summary: 删除活动报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     responses:
 *       200:
 *         description: 活动报名删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.delete(
  '/:id',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.deleteRegistration
);

/**
* @swagger
 * /api/activity-registrations/{id}/review:
 *   post:
 *     summary: 审核活动报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: 是否通过
 *               reason:
 *                 type: string
 *                 description: 拒绝原因
 *     responses:
 *       200:
 *         description: 活动报名审核成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/review',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.reviewRegistration
);

/**
* @swagger
 * /api/activity-registrations/{id}/cancel:
 *   post:
 *     summary: 取消活动报名
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 取消原因
 *     responses:
 *       200:
 *         description: 活动报名取消成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/cancel',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.cancelRegistration
);

/**
* @swagger
 * /api/activity-registrations/{id}/check-in:
 *   post:
 *     summary: 签到
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 签到成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/check-in',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.checkIn
);

/**
* @swagger
 * /api/activity-registrations/{id}/absent:
 *   post:
 *     summary: 标记为未出席
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     responses:
 *       200:
 *         description: 已标记为未出席
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/absent',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.markAsAbsent
);

/**
* @swagger
 * /api/activity-registrations/{id}/feedback:
 *   post:
 *     summary: 记录反馈
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: 反馈内容
 *     responses:
 *       200:
 *         description: 反馈记录成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/feedback',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.recordFeedback
);

/**
* @swagger
 * /api/activity-registrations/{id}/convert:
 *   post:
 *     summary: 标记为转化
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 报名ID
 *     responses:
 *       200:
 *         description: 已标记为转化
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/convert',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.markAsConverted
);

/**
* @swagger
 * /api/activity-registrations/activity/{activityId}/stats:
 *   get:
 *     summary: 获取活动报名统计数据
 *     tags: [活动报名]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 获取活动报名统计数据成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/activity/:activityId/stats',
  verifyToken,
  checkPermission('ACTIVITY_REGISTRATION_MANAGE'),
  activityRegistrationController.getRegistrationStats
);

export default router; 