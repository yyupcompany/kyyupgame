import { Router } from 'express';
import {
  create,
  getById,
  list,
  update,
  remove,
  getStatistics,
  getPendingFollowups,
  generateAiSuggestion,
  createValidation,
  updateValidation,
  listValidation
} from '../controllers/parent-communication.controller';

const router = Router();

/**
 * 家长沟通记录API
 *
 * 提供家长沟通记录的CRUD操作和统计分析功能
 * 支持AI智能回复建议生成
 */

// 基础 CRUD 路由（express-validator已在控制器中处理验证）
router.post('/', createValidation, create);
router.get('/', listValidation, list);
router.get('/statistics', getStatistics);
router.get('/pending-followups', getPendingFollowups);
router.get('/:id', getById);
router.put('/:id', updateValidation, update);
router.delete('/:id', remove);

// AI 智能功能
router.post('/:communicationId/ai-suggestion', generateAiSuggestion);

export default router;
