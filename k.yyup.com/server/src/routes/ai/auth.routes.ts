import { Router } from 'express';
// import { aiAuthMiddleware } from '../../middlewares/ai'; // 假设的中间件
import { handleMiddlewareResponse } from './utils/handleMiddlewareResponse';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
* /api/v1/ai/auth/map-user:
*   post:
*     summary: 获取或创建用户关联
*     tags: [Auth]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: 用户关联信息
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AIUserRelation'
*/
// 1. 获取或创建用户关联 (依赖auth中间件解析出的userId)
router.post('/map-user', async (req, res) => {
  // const { userId } = req.auth; // 假设userId从认证中间件附加
  // const result = await aiAuthMiddleware.mapUser(userId);
  // handleMiddlewareResponse(res, result);
  res.status(501).json({ message: 'Not Implemented' });
});

/**
* @swagger
* /api/v1/ai/auth/permissions:
*   get:
*     summary: 获取用户权限
*     tags: [Auth]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: 用户权限列表
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AIUserPermissions'
*/
// 2. 获取用户权限 (依赖auth中间件解析出的userId)
router.get('/permissions', async (req, res) => {
  // const { userId } = req.auth; // 假设userId从认证中间件附加
  // const result = await aiAuthMiddleware.getUserPermissions(userId);
  // handleMiddlewareResponse(res, result);
  res.status(501).json({ message: 'Not Implemented' });
});

export default router; 