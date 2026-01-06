/**
* @swagger
 * components:
 *   schemas:
 *     Principal-performance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Principal-performance ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Principal-performance 名称
 *           example: "示例Principal-performance"
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
 *     CreatePrincipal-performanceRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Principal-performance 名称
 *           example: "新Principal-performance"
 *     UpdatePrincipal-performanceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Principal-performance 名称
 *           example: "更新后的Principal-performance"
 *     Principal-performanceListResponse:
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
 *                 $ref: '#/components/schemas/Principal-performance'
 *         message:
 *           type: string
 *           example: "获取principal-performance列表成功"
 *     Principal-performanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Principal-performance'
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
 * principal-performance管理路由文件
 * 提供principal-performance的基础CRUD操作
*
 * 功能包括：
 * - 获取principal-performance列表
 * - 创建新principal-performance
 * - 获取principal-performance详情
 * - 更新principal-performance信息
 * - 删除principal-performance
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/principal-performance:
 *   get:
 *     summary: 获取园长绩效概览
 *     description: 获取当前园长的绩效概览数据，包括总分、排名、趋势和各项快速统计
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长绩效概览
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
 *                     currentScore:
 *                       type: number
 *                       description: 当前绩效得分
 *                       example: 92.5
 *                     ranking:
 *                       type: integer
 *                       description: 当前排名
 *                       example: 3
 *                     totalPrincipals:
 *                       type: integer
 *                       description: 总园长数量
 *                       example: 15
 *                     trend:
 *                       type: string
 *                       description: 绩效趋势
 *                       enum: [up, down, stable]
 *                       example: up
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       description: 最后更新时间
 *                     quickStats:
 *                       type: object
 *                       description: 各项快速统计
 *                       properties:
 *                         enrollment:
 *                           type: number
 *                           example: 95.0
 *                         teaching:
 *                           type: number
 *                           example: 90.0
 *                         management:
 *                           type: number
 *                           example: 88.0
 *                         finance:
 *                           type: number
 *                           example: 94.0
 *                         safety:
 *                           type: number
 *                           example: 96.0
 *                 message:
 *                   type: string
 *                   example: 获取园长绩效概览成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/', checkPermission('principal:performance'), async (req, res) => {
  try {
    // 模拟园长绩效概览数据
    const overview = {
      currentScore: 92.5,
      ranking: 3,
      totalPrincipals: 15,
      trend: 'up',
      lastUpdated: new Date().toISOString(),
      quickStats: {
        enrollment: 95.0,
        teaching: 90.0,
        management: 88.0,
        finance: 94.0,
        safety: 96.0
      }
    };

    res.json({
      success: true,
      data: overview,
      message: '获取园长绩效概览成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取园长绩效概览失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/principal-performance/stats:
 *   get:
 *     summary: 获取园长绩效统计
 *     description: 获取详细的园长绩效统计数据，包括分类得分、月度趋势和成就数据
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长绩效统计
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
 *                     totalScore:
 *                       type: number
 *                       description: 总分
 *                       example: 92.5
 *                     ranking:
 *                       type: integer
 *                       description: 排名
 *                       example: 3
 *                     totalPrincipals:
 *                       type: integer
 *                       description: 总园长数量
 *                       example: 15
 *                     monthlyTrend:
 *                       type: array
 *                       description: 月度趋势
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-01"
 *                           score:
 *                             type: number
 *                             example: 88.5
 *                     categories:
 *                       type: object
 *                       description: 分类得分
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           score:
 *                             type: number
 *                             example: 95.0
 *                           weight:
 *                             type: number
 *                             example: 30
 *                           weightedScore:
 *                             type: number
 *                             example: 28.5
 *                     achievements:
 *                       type: array
 *                       description: 成就数据
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "招生目标达成率"
 *                           value:
 *                             type: string
 *                             example: "105%"
 *                           trend:
 *                             type: string
 *                             enum: [up, down, stable]
 *                             example: up
 *                 message:
 *                   type: string
 *                   example: 获取园长绩效统计成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/stats', checkPermission('principal:performance'), async (req, res) => {
  try {
    // 模拟园长绩效统计数据
    const stats = {
      totalScore: 92.5,
      ranking: 3,
      totalPrincipals: 15,
      monthlyTrend: [
        { month: '2024-01', score: 88.5 },
        { month: '2024-02', score: 90.2 },
        { month: '2024-03', score: 91.8 },
        { month: '2024-04', score: 92.5 }
      ],
      categories: {
        enrollment: { score: 95.0, weight: 30, weightedScore: 28.5 },
        teaching: { score: 90.0, weight: 25, weightedScore: 22.5 },
        management: { score: 88.0, weight: 20, weightedScore: 17.6 },
        finance: { score: 94.0, weight: 15, weightedScore: 14.1 },
        safety: { score: 96.0, weight: 10, weightedScore: 9.6 }
      },
      achievements: [
        { title: '招生目标达成率', value: '105%', trend: 'up' },
        { title: '教学质量评分', value: '4.8/5.0', trend: 'stable' },
        { title: '家长满意度', value: '96%', trend: 'up' },
        { title: '员工满意度', value: '88%', trend: 'down' }
      ]
    };

    res.json({
      success: true,
      data: stats,
      message: '获取园长绩效统计成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取园长绩效统计失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/principal-performance/rankings:
 *   get:
 *     summary: 获取园长绩效排名
 *     description: 获取园长绩效排名列表，显示所有园长的排名情况和得分对比
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长绩效排名
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
 *                     rankings:
 *                       type: array
 *                       description: 排名列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank:
 *                             type: integer
 *                             description: 排名
 *                             example: 1
 *                           principalId:
 *                             type: integer
 *                             description: 园长ID
 *                             example: 5
 *                           principalName:
 *                             type: string
 *                             description: 园长姓名
 *                             example: "张园长"
 *                           kindergartenName:
 *                             type: string
 *                             description: 幼儿园名称
 *                             example: "阳光幼儿园"
 *                           totalScore:
 *                             type: number
 *                             description: 总分
 *                             example: 96.8
 *                           enrollmentScore:
 *                             type: number
 *                             description: 招生得分
 *                             example: 98.5
 *                           teachingScore:
 *                             type: number
 *                             description: 教学得分
 *                             example: 95.2
 *                           managementScore:
 *                             type: number
 *                             description: 管理得分
 *                             example: 96.0
 *                           change:
 *                             type: string
 *                             description: 排名变化
 *                             enum: [up, down, stable]
 *                             example: up
 *                     total:
 *                       type: integer
 *                       description: 总数量
 *                       example: 4
 *                     updateTime:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *                 message:
 *                   type: string
 *                   example: 获取园长绩效排名成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/rankings', checkPermission('principal:performance'), async (req, res) => {
  try {
    // 模拟园长绩效排名数据
    const rankings = [
      {
        rank: 1,
        principalId: 5,
        principalName: '张园长',
        kindergartenName: '阳光幼儿园',
        totalScore: 96.8,
        enrollmentScore: 98.5,
        teachingScore: 95.2,
        managementScore: 96.0,
        change: 'up'
      },
      {
        rank: 2,
        principalId: 3,
        principalName: '李园长',
        kindergartenName: '快乐幼儿园',
        totalScore: 94.2,
        enrollmentScore: 92.0,
        teachingScore: 96.5,
        managementScore: 94.1,
        change: 'stable'
      },
      {
        rank: 3,
        principalId: 1,
        principalName: '王园长',
        kindergartenName: '智慧幼儿园',
        totalScore: 92.5,
        enrollmentScore: 95.0,
        teachingScore: 90.0,
        managementScore: 88.0,
        change: 'up'
      },
      {
        rank: 4,
        principalId: 7,
        principalName: '赵园长',
        kindergartenName: '未来幼儿园',
        totalScore: 89.3,
        enrollmentScore: 87.5,
        teachingScore: 91.2,
        managementScore: 89.1,
        change: 'down'
      }
    ];

    res.json({
      success: true,
      data: {
        rankings,
        total: rankings.length,
        updateTime: new Date().toISOString()
      },
      message: '获取园长绩效排名成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取园长绩效排名失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/principal-performance/details:
 *   get:
 *     summary: 获取园长绩效详情
 *     description: 获取特定园长的详细绩效信息，包括各项指标详情、改进建议和趋势分析
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: principalId
 *         schema:
 *           type: integer
 *         description: 园长ID
 *         example: 1
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 查询期间
 *         example: "2024-04"
 *     responses:
 *       200:
 *         description: 成功获取园长绩效详情
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
 *                     principalId:
 *                       type: integer
 *                       description: 园长ID
 *                       example: 1
 *                     principalName:
 *                       type: string
 *                       description: 园长姓名
 *                       example: "王园长"
 *                     kindergartenName:
 *                       type: string
 *                       description: 幼儿园名称
 *                       example: "智慧幼儿园"
 *                     period:
 *                       type: string
 *                       description: 统计期间
 *                       example: "2024-04"
 *                     totalScore:
 *                       type: number
 *                       description: 总分
 *                       example: 92.5
 *                     detailedScores:
 *                       type: object
 *                       description: 详细得分
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "招生管理"
 *                           score:
 *                             type: number
 *                             example: 95.0
 *                           maxScore:
 *                             type: number
 *                             example: 100
 *                           weight:
 *                             type: number
 *                             example: 30
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "招生目标达成率"
 *                                 score:
 *                                   type: number
 *                                   example: 98
 *                                 target:
 *                                   type: number
 *                                   example: 100
 *                                 actual:
 *                                   type: number
 *                                   example: 105
 *                     improvements:
 *                       type: array
 *                       description: 改进建议
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                             example: "员工满意度"
 *                           current:
 *                             type: number
 *                             example: 85
 *                           target:
 *                             type: number
 *                             example: 90
 *                           suggestion:
 *                             type: string
 *                             example: "加强员工关怀，提升福利待遇"
 *                     trends:
 *                       type: object
 *                       description: 趋势分析
 *                       properties:
 *                         monthly:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "2024-01"
 *                               score:
 *                                 type: number
 *                                 example: 88.5
 *                 message:
 *                   type: string
 *                   example: 获取园长绩效详情成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/details', checkPermission('principal:performance'), async (req, res) => {
  try {
    const { principalId, period } = req.query;
    
    // 模拟园长绩效详情数据
    const details = {
      principalId: principalId || 1,
      principalName: '王园长',
      kindergartenName: '智慧幼儿园',
      period: period || '2024-04',
      totalScore: 92.5,
      detailedScores: {
        enrollment: {
          category: '招生管理',
          score: 95.0,
          maxScore: 100,
          weight: 30,
          items: [
            { name: '招生目标达成率', score: 98, target: 100, actual: 105 },
            { name: '招生转化率', score: 92, target: 85, actual: 88 },
            { name: '招生成本控制', score: 95, target: 5000, actual: 4800 }
          ]
        },
        teaching: {
          category: '教学质量',
          score: 90.0,
          maxScore: 100,
          weight: 25,
          items: [
            { name: '教学质量评估', score: 92, target: 90, actual: 92 },
            { name: '教师培训完成率', score: 88, target: 95, actual: 88 },
            { name: '课程创新度', score: 90, target: 85, actual: 90 }
          ]
        },
        management: {
          category: '运营管理',
          score: 88.0,
          maxScore: 100,
          weight: 20,
          items: [
            { name: '员工满意度', score: 85, target: 90, actual: 85 },
            { name: '运营效率', score: 90, target: 85, actual: 90 },
            { name: '制度执行率', score: 89, target: 95, actual: 89 }
          ]
        }
      },
      improvements: [
        { area: '员工满意度', current: 85, target: 90, suggestion: '加强员工关怀，提升福利待遇' },
        { area: '教师培训', current: 88, target: 95, suggestion: '增加培训频次，完善培训体系' }
      ],
      trends: {
        monthly: [
          { month: '2024-01', score: 88.5 },
          { month: '2024-02', score: 90.2 },
          { month: '2024-03', score: 91.8 },
          { month: '2024-04', score: 92.5 }
        ]
      }
    };

    res.json({
      success: true,
      data: details,
      message: '获取园长绩效详情成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取园长绩效详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/principal-performance/export:
 *   get:
 *     summary: 导出园长绩效报告
 *     description: 导出园长绩效报告为Excel或PDF格式，支持按期间导出
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *           default: excel
 *         description: 导出格式
 *         example: excel
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: 导出期间
 *         example: "2024-04"
 *     responses:
 *       200:
 *         description: 成功生成导出文件
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
 *                     filename:
 *                       type: string
 *                       description: 文件名
 *                       example: "principal_performance_2024-04.excel"
 *                     downloadUrl:
 *                       type: string
 *                       description: 下载链接
 *                       example: "/downloads/principal_performance_1672876800000.excel"
 *                     size:
 *                       type: string
 *                       description: 文件大小
 *                       example: "2.5MB"
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 生成时间
 *                 message:
 *                   type: string
 *                   example: 绩效报告导出成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/export', checkPermission('principal:performance'), async (req, res) => {
  try {
    const { format = 'excel', period } = req.query;
    
    // 模拟导出功能
    const exportData = {
      filename: `principal_performance_${period || '2024-04'}.${format}`,
      downloadUrl: `/downloads/principal_performance_${Date.now()}.${format}`,
      size: '2.5MB',
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData,
      message: '绩效报告导出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '导出绩效报告失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/principal-performance/goals:
 *   get:
 *     summary: 获取园长绩效目标
 *     description: 获取园长绩效目标设置和完成情况，包括各项指标的目标值、当前值和完成进度
 *     tags: [Principal Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长绩效目标
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
 *                     currentPeriod:
 *                       type: string
 *                       description: 当前期间
 *                       example: "2024-04"
 *                     targets:
 *                       type: object
 *                       description: 目标设置
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "招生目标"
 *                           targets:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "新生招生数量"
 *                                 target:
 *                                   type: number
 *                                   example: 120
 *                                 current:
 *                                   type: number
 *                                   example: 126
 *                                 unit:
 *                                   type: string
 *                                   example: "人"
 *                                 progress:
 *                                   type: number
 *                                   description: 完成进度百分比
 *                                   example: 105
 *                     overallProgress:
 *                       type: number
 *                       description: 总体完成进度
 *                       example: 98.5
 *                     achievedTargets:
 *                       type: integer
 *                       description: 已完成目标数
 *                       example: 8
 *                     totalTargets:
 *                       type: integer
 *                       description: 总目标数
 *                       example: 9
 *                 message:
 *                   type: string
 *                   example: 获取园长绩效目标成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/goals', checkPermission('principal:performance'), async (req, res) => {
  try {
    // 模拟园长绩效目标数据
    const goals = {
      currentPeriod: '2024-04',
      targets: {
        enrollment: {
          category: '招生目标',
          targets: [
            { name: '新生招生数量', target: 120, current: 126, unit: '人', progress: 105 },
            { name: '招生转化率', target: 85, current: 88, unit: '%', progress: 103.5 },
            { name: '招生成本', target: 5000, current: 4800, unit: '元/人', progress: 104.2 }
          ]
        },
        teaching: {
          category: '教学目标',
          targets: [
            { name: '教学质量评分', target: 4.5, current: 4.6, unit: '分', progress: 102.2 },
            { name: '家长满意度', target: 95, current: 96, unit: '%', progress: 101.1 },
            { name: '教师培训完成率', target: 95, current: 88, unit: '%', progress: 92.6 }
          ]
        },
        management: {
          category: '管理目标',
          targets: [
            { name: '员工满意度', target: 90, current: 85, unit: '%', progress: 94.4 },
            { name: '运营成本控制', target: 15, current: 14.2, unit: '%', progress: 105.6 },
            { name: '安全事故率', target: 0, current: 0, unit: '次', progress: 100 }
          ]
        }
      },
      overallProgress: 98.5,
      achievedTargets: 8,
      totalTargets: 9
    };

    res.json({
      success: true,
      data: goals,
      message: '获取园长绩效目标成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取园长绩效目标失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router; 