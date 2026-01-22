/**
 * Teacher端 SOP模板系统路由
 * 新的SOP模板系统API路由
 */
import { Router } from 'express';
import teacherSOPController from '../controllers/teacher/sop.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由需要认证
router.use(verifyToken);

// =============================================
// 模板查询
// =============================================
// 获取可用模板列表（仅销售类）
router.get('/templates', teacherSOPController.getTemplates);

// 获取模板详情
router.get('/templates/:id', teacherSOPController.getTemplateById);

// =============================================
// 实例管理
// =============================================
// 创建SOP实例
router.post('/instances', teacherSOPController.createInstance);

// 获取我的实例列表
router.get('/instances', teacherSOPController.getInstances);

// 获取实例详情
router.get('/instances/:id', teacherSOPController.getInstanceById);

// 更新实例（自定义）
router.put('/instances/:id', teacherSOPController.updateInstance);

// 删除实例
router.delete('/instances/:id', teacherSOPController.deleteInstance);

// =============================================
// 进度管理
// =============================================
// 更新节点进度
router.put('/instances/:id/nodes/:order/progress', teacherSOPController.updateNodeProgress);

// 完成实例
router.post('/instances/:id/complete', teacherSOPController.completeInstance);

export default router;
