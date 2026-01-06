import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';

// 🚀 AI Bridge服务已迁移到统一租户中心 (端口4001)
// 原来的AI Bridge路由和服务已注释，切换到统一租户中心

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/ai-bridge/parse-batch-data:
 *   post:
 *     summary: AI解析批量数据（使用豆包1.6 Flash）
 *     tags: [AI Bridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - type
 *             properties:
 *               text:
 *                 type: string
 *                 description: 需要解析的文本数据
 *               type:
 *                 type: string
 *                 enum: [学生, 家长, 教师, 班级]
 *                 description: 数据类型
 *               model:
 *                 type: string
 *                 default: doubao-1.6-flash
 *                 description: 使用的AI模型
 *     responses:
 *       200:
 *         description: 解析成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: 参数错误
 *       500:
 *         description: AI解析失败
*/
// 🚀 原AI Bridge路由已禁用，现在使用统一租户中心的AI Bridge服务(端口4001)
// router.post('/parse-batch-data', AIBridgeController.parseBatchData);

// 添加提示路由，返回切换信息
router.get('/migration-info', (req, res) => {
  res.json({
    success: true,
    message: 'AI Bridge服务已迁移到统一租户中心',
    newServiceUrl: 'http://localhost:4001/api/v1/ai/bridge',
    migrationStatus: 'completed',
    features: ['真实AI模型支持', '统一计费系统', '租户权限管理', '多模态AI能力']
  });
});

export default router;



