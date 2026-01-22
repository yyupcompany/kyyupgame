import { Router } from 'express';
import {
  createAlert,
  listAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  getAlertStats,
  createRule,
  listRules,
  toggleRule,
  checkAlerts,
  createAlertValidation,
  updateAlertValidation,
  listValidation,
  createRuleValidation
} from '../controllers/alert.controller';
import { validateRequest } from '../middlewares/validate.middleware';

const router = Router();

/**
 * 预警中心API
 *
 * 提供告警管理和告警规则配置功能
 * 支持定时任务触发告警检查
 */

// 告警管理路由
router.post('/', createAlertValidation, validateRequest, createAlert);
router.get('/', listValidation, validateRequest, listAlerts);
router.get('/statistics', getAlertStats);
router.get('/:id', getAlert);
router.put('/:id', updateAlertValidation, validateRequest, updateAlert);
router.delete('/:id', deleteAlert);

// 告警规则路由
router.post('/rules', createRuleValidation, validateRequest, createRule);
router.get('/rules/list', listRules);
router.put('/rules/:id/toggle', toggleRule);

// 定时任务触发告警检查
router.post('/check', checkAlerts);

export default router;
