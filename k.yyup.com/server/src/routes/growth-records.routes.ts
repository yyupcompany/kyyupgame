/**
 * 成长记录路由
 *
 * API端点:
 * - GET    /api/growth-records          - 获取成长记录列表
 * - GET    /api/growth-records/:id      - 获取单个成长记录
 * - POST   /api/growth-records          - 创建成长记录
 * - PUT    /api/growth-records/:id      - 更新成长记录
 * - DELETE /api/growth-records/:id      - 删除成长记录
 * - GET    /api/growth-records/chart    - 获取成长曲线
 * - GET    /api/growth-records/report   - 获取成长评估报告
 * - GET    /api/growth-records/peer-comparison - 同龄对比
 * - POST   /api/growth-records/bulk     - 批量导入
 */

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {
  getGrowthRecords,
  getGrowthRecord,
  createGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  getGrowthChart,
  getGrowthReport,
  getPeerComparison,
  bulkCreateGrowthRecords
} from '../controllers/growth-records.controller';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken);

/**
 * @route GET /api/growth-records
 * @desc 获取成长记录列表
 * @access Private
 */
router.get('/', getGrowthRecords);

/**
 * @route POST /api/growth-records
 * @desc 创建成长记录
 * @access Private
 */
router.post('/', createGrowthRecord);

/**
 * @route GET /api/growth-records/chart
 * @desc 获取成长曲线数据（用于图表展示）
 * @access Private
 */
router.get('/chart', getGrowthChart);

/**
 * @route GET /api/growth-records/report/:studentId
 * @desc 获取学生成长评估报告
 * @access Private
 */
router.get('/report/:studentId', getGrowthReport);

/**
 * @route GET /api/growth-records/peer-comparison/:studentId
 * @desc 获取同龄对比数据
 * @access Private
 */
router.get('/peer-comparison/:studentId', getPeerComparison);

/**
 * @route POST /api/growth-records/bulk
 * @desc 批量导入成长记录
 * @access Private
 */
router.post('/bulk', bulkCreateGrowthRecords);

/**
 * @route GET /api/growth-records/:id
 * @desc 获取单个成长记录
 * @access Private
 */
router.get('/:id', getGrowthRecord);

/**
 * @route PUT /api/growth-records/:id
 * @desc 更新成长记录
 * @access Private
 */
router.put('/:id', updateGrowthRecord);

/**
 * @route DELETE /api/growth-records/:id
 * @desc 删除成长记录
 * @access Private
 */
router.delete('/:id', deleteGrowthRecord);

export default router;
