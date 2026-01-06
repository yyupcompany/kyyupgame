import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/customer-pool/stats:
 *   get:
 *     summary: 获取客户池统计
 *     description: 获取客户池的总体统计信息，包括总数量、今日新增、转化数量等
 *     tags:
 *       - Customer Pool
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取客户池统计成功
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
 *                   example: "获取客户池统计成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 客户总数
 *                       example: 120
 *                     newToday:
 *                       type: integer
 *                       description: 今日新增客户数
 *                       example: 8
 *                     converted:
 *                       type: integer
 *                       description: 已转化客户数
 *                       example: 35
 *                     followUp:
 *                       type: integer
 *                       description: 需要跟进的客户数
 *                       example: 45
 *                     categories:
 *                       type: object
 *                       description: 客户分类统计
 *                       properties:
 *                         interested:
 *                           type: integer
 *                           description: 有兴趣的客户数
 *                           example: 60
 *                         considering:
 *                           type: integer
 *                           description: 考虑中的客户数
 *                           example: 30
 *                         notInterested:
 *                           type: integer
 *                           description: 无兴趣的客户数
 *                           example: 20
 *                         converted:
 *                           type: integer
 *                           description: 已转化的客户数
 *                           example: 10
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "获取客户池统计失败"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/stats', verifyToken, (req, res) => {
  try {
    const stats = {
      total: 120,
      newToday: 8,
      converted: 35,
      followUp: 45,
      categories: {
        interested: 60,
        considering: 30,
        notInterested: 20,
        converted: 10
      }
    };

    return res.status(200).json({
      success: true,
      message: "获取客户池统计成功",
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "获取客户池统计失败",
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * @swagger
 * /api/customer-pool/list:
 *   get:
 *     summary: 获取客户池列表
 *     description: 分页获取客户池列表，支持分页查询
 *     tags:
 *       - Customer Pool
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取客户池列表成功
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
 *                   example: "获取客户池列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 客户ID
 *                             example: 1
 *                           name:
 *                             type: string
 *                             description: 客户姓名
 *                             example: "客户1"
 *                           phone:
 *                             type: string
 *                             description: 客户电话
 *                             example: "13912345678"
 *                           source:
 *                             type: string
 *                             description: 客户来源
 *                             enum: ["广告", "转介绍", "活动", "自然流量"]
 *                             example: "广告"
 *                           interest:
 *                             type: integer
 *                             description: 兴趣程度(0-4)
 *                             minimum: 0
 *                             maximum: 4
 *                             example: 3
 *                           status:
 *                             type: string
 *                             description: 客户状态
 *                             enum: ["新客户", "已联系", "已邀约", "已转化", "无意向"]
 *                             example: "新客户"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 创建时间
 *                             example: "2024-01-01T00:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           description: 每页数量
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 120
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "获取客户池列表失败"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/list', verifyToken, (req, res) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 模拟数据
    const customers = Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      name: `客户${(page - 1) * pageSize + i + 1}`,
      phone: `1391234${5678 + i}`,
      source: ["广告", "转介绍", "活动", "自然流量"][Math.floor(Math.random() * 4)],
      interest: Math.floor(Math.random() * 5),
      status: ["新客户", "已联系", "已邀约", "已转化", "无意向"][Math.floor(Math.random() * 5)],
      createdAt: new Date().toISOString()
    }));
    
    return res.status(200).json({
      success: true,
      message: "获取客户池列表成功",
      data: {
        list: customers,
        pagination: {
          page,
          pageSize,
          total: 120
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "获取客户池列表失败",
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
