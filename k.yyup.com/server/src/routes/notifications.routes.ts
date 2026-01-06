import { Router } from 'express';
import { checkParentStudentAccess, verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { markAsRead, deleteNotification, markAllAsRead } from '../controllers/notification.controller';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
* @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 通知唯一标识符
 *           example: 1
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "新消息通知"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "您有一条新的消息，请及时查看"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "info"
 *         user_id:
 *           type: integer
 *           description: 接收用户ID
 *           example: 123
 *         is_read:
 *           type: boolean
 *           description: 是否已读
 *           example: false
 *         read_at:
 *           type: string
 *           format: date-time
 *           description: 阅读时间
 *           nullable: true
 *           example: "2024-01-01T12:00:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T10:00:00Z"
*     
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *         total:
 *           type: integer
 *           description: 总数量
 *           example: 10
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *           example: 1
*     
 *     UnreadCountResponse:
 *       type: object
 *       properties:
 *         unread_count:
 *           type: integer
 *           description: 未读通知数量
 *           example: 5
*     
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - type
 *         - user_id
 *       properties:
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "新消息通知"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "您有一条新的消息，请及时查看"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "info"
 *         user_id:
 *           type: integer
 *           description: 接收用户ID
 *           example: 123
*     
 *     UpdateNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "更新的通知标题"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "更新的通知内容"
 *         type:
 *           type: string
 *           description: 通知类型
 *           enum: ["info", "warning", "error", "success"]
 *           example: "warning"
*/

/**
* @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取通知列表
 *     description: 获取当前用户的所有通知列表，按创建时间倒序排列
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取通知列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NotificationListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/',  async (req, res) => {
  try {
    const notifications = await sequelize.query(
      'SELECT * FROM notifications ORDER BY created_at DESC',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      items: notifications,
      total: notifications.length,
      page: 1,
      pageSize: notifications.length,
      totalPages: 1
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取通知列表失败');
  }
});

/**
* @swagger
 * /api/notifications/unread/count:
 *   get:
 *     summary: 获取未读通知数量
 *     description: 获取当前用户的未读通知数量统计
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取未读通知数量
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/unread/count',  async (req, res) => {
  try {
    const result = await sequelize.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      unread_count: (result[0] as any)?.count || 0
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取未读通知数失败');
  }
});

/**
* @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量 (兼容路径)
 *     description: 获取当前用户的未读通知数量统计 (兼容性接口)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取未读通知数量
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UnreadCountResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/unread-count',  async (req, res) => {
  try {
    const result = await sequelize.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      unread_count: (result[0] as any)?.count || 0
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取未读通知数失败');
  }
});

/**
* @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: 批量标记所有通知为已读
 *     description: 将当前用户的所有未读通知标记为已读状态
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功标记所有通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.patch('/mark-all-read',  markAllAsRead);

/**
* @swagger
 * /api/notifications/batch-read:
 *   post:
 *     summary: 批量标记通知为已读 (兼容路径)
 *     description: 批量将指定的通知标记为已读状态 (兼容性接口)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要标记为已读的通知ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 成功批量标记通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/batch-read',  markAllAsRead);

/**
* @swagger
 * /api/notifications:
 *   post:
 *     summary: 创建新通知
 *     description: 创建一条新的系统通知
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: 成功创建通知
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/',  async (req, res) => {
  try {
    return ApiResponse.error(res, '创建通知功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建通知失败');
  }
});

/**
* @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: 获取通知详情
 *     description: 根据通知ID获取特定通知的详细信息
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取通知详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:id',  async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = await sequelize.query(
      'SELECT * FROM notifications WHERE id = ? LIMIT 1',
      { 
        replacements: [id],
        type: QueryTypes.SELECT 
      }
    );

    if (notifications.length === 0) {
      return ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404);
    }

    return ApiResponse.success(res, notifications[0]);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取通知详情失败');
  }
});

/**
* @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: 更新通知信息
 *     description: 根据通知ID更新通知的详细信息
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationRequest'
 *     responses:
 *       200:
 *         description: 成功更新通知信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/:id',  async (req, res) => {
  try {
    return ApiResponse.error(res, '更新通知功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新通知失败');
  }
});

/**
* @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: 标记通知为已读
 *     description: 将指定的通知标记为已读状态
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功标记通知为已读
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.patch('/:id/read',  markAsRead);

/**
* @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: 删除通知
 *     description: 根据通知ID删除指定的通知
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除通知
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/:id',  deleteNotification);



export default router; 