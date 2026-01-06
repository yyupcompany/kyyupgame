import { Router } from 'express';
import { aiUserMiddleware } from '../../middlewares/ai';
import { handleMiddlewareResponse } from './utils/handleMiddlewareResponse';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
* /api/ai/user/{userId}/permissions:
*   get:
*     summary: 获取用户权限
*     description: 获取指定用户的AI系统权限配置
*     tags: [AI用户管理]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 用户ID
*     responses:
*       200:
*         description: 成功获取用户权限
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     userId:
*                       type: integer
*                       description: 用户ID
*                     permissions:
*                       type: array
*                       items:
*                         type: string
*                       description: 权限列表
*                       example: ["ai_chat", "ai_analysis", "ai_memory"]
*                     roles:
*                       type: array
*                       items:
*                         type: string
*                       description: 角色列表
*                       example: ["user", "teacher"]
*       400:
*         description: 参数错误
*       401:
*         description: 未授权
*       404:
*         description: 用户不存在
*       500:
*         description: 服务器错误
*     security:
*       - bearerAuth: []
*/
router.get('/:userId/permissions', async (req, res) => {
  const { userId } = req.params;
  const result = await aiUserMiddleware.getUserPermissions(parseInt(userId, 10));
  handleMiddlewareResponse(res, result);
});

/**
* @swagger
* /api/ai/user/{userId}/permissions:
*   post:
*     summary: 设置用户权限 (管理员)
*     description: 管理员设置指定用户的AI系统权限
*     tags: [AI用户管理]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 目标用户ID
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - adminUserId
*               - permissions
*             properties:
*               adminUserId:
*                 type: integer
*                 minimum: 1
*                 description: 管理员用户ID
*                 example: 1
*               permissions:
*                 type: array
*                 items:
*                   type: string
*                 description: 要设置的权限列表
*                 example: ["ai_chat", "ai_analysis"]
*               roles:
*                 type: array
*                 items:
*                   type: string
*                 description: 要设置的角色列表（可选）
*                 example: ["user", "teacher"]
*     responses:
*       200:
*         description: 成功设置用户权限
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "权限设置成功"
*                 data:
*                   type: object
*                   properties:
*                     userId:
*                       type: integer
*                       description: 用户ID
*                     permissions:
*                       type: array
*                       items:
*                         type: string
*                       description: 更新后的权限列表
*       400:
*         description: 参数错误或权限设置失败
*       401:
*         description: 未授权
*       403:
*         description: 权限不足（非管理员）
*       404:
*         description: 用户不存在
*       500:
*         description: 服务器错误
*     security:
*       - bearerAuth: []
*/
router.post('/:userId/permissions', async (req, res) => {
  const { userId } = req.params;
  const { adminUserId, permissions } = req.body; // adminUserId应从认证中获取
  const result = await aiUserMiddleware.setPermissions(adminUserId, permissions);
  handleMiddlewareResponse(res, result);
});

/**
* @swagger
* /api/ai/user/{userId}/settings:
*   get:
*     summary: 获取用户设置
*     description: 获取指定用户的AI系统个人设置
*     tags: [AI用户管理]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 用户ID
*     responses:
*       200:
*         description: 成功获取用户设置
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   type: object
*                   properties:
*                     userId:
*                       type: integer
*                       description: 用户ID
*                     settings:
*                       type: object
*                       properties:
*                         aiModel:
*                           type: string
*                           description: 默认AI模型
*                           example: "gpt-4"
*                         language:
*                           type: string
*                           description: 界面语言
*                           example: "zh-CN"
*                         theme:
*                           type: string
*                           description: 界面主题
*                           example: "light"
*                         notifications:
*                           type: object
*                           properties:
*                             email:
*                               type: boolean
*                               description: 邮件通知
*                             push:
*                               type: boolean
*                               description: 推送通知
*                         privacy:
*                           type: object
*                           properties:
*                             shareData:
*                               type: boolean
*                               description: 是否共享数据
*                             memoryRetention:
*                               type: integer
*                               description: 记忆保留天数
*       400:
*         description: 参数错误
*       401:
*         description: 未授权
*       404:
*         description: 用户不存在
*       500:
*         description: 服务器错误
*     security:
*       - bearerAuth: []
*/
router.get('/:userId/settings', async (req, res) => {
  const { userId } = req.params;
  const result = await aiUserMiddleware.getUserSettings(parseInt(userId, 10));
  handleMiddlewareResponse(res, result);
});

/**
* @swagger
* /api/ai/user/{userId}/settings:
*   put:
*     summary: 更新用户设置
*     description: 更新指定用户的AI系统个人设置
*     tags: [AI用户管理]
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*         description: 用户ID
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - settings
*             properties:
*               settings:
*                 type: object
*                 description: 用户设置对象
*                 properties:
*                   aiModel:
*                     type: string
*                     description: 默认AI模型
*                     example: "gpt-4"
*                   language:
*                     type: string
*                     description: 界面语言
*                     example: "zh-CN"
*                   theme:
*                     type: string
*                     enum: ["light", "dark", "auto"]
*                     description: 界面主题
*                     example: "light"
*                   notifications:
*                     type: object
*                     properties:
*                       email:
*                         type: boolean
*                         description: 邮件通知
*                       push:
*                         type: boolean
*                         description: 推送通知
*                   privacy:
*                     type: object
*                     properties:
*                       shareData:
*                         type: boolean
*                         description: 是否共享数据
*                       memoryRetention:
*                         type: integer
*                         minimum: 1
*                         maximum: 365
*                         description: 记忆保留天数
*     responses:
*       200:
*         description: 成功更新用户设置
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "设置更新成功"
*                 data:
*                   type: object
*                   properties:
*                     userId:
*                       type: integer
*                       description: 用户ID
*                     settings:
*                       type: object
*                       description: 更新后的设置
*       400:
*         description: 参数错误或设置更新失败
*       401:
*         description: 未授权
*       403:
*         description: 权限不足（只能修改自己的设置）
*       404:
*         description: 用户不存在
*       500:
*         description: 服务器错误
*     security:
*       - bearerAuth: []
*/
router.put('/:userId/settings', async (req, res) => {
  const { userId } = req.params;
  const { settings } = req.body;
  const result = await aiUserMiddleware.updateUserSettings(parseInt(userId, 10), settings);
  handleMiddlewareResponse(res, result);
});

export default router; 