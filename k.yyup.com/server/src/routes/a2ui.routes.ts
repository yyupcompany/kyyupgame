/**
 * A2UI 路由定义
 */

import { Router } from 'express';
import { a2uiController } from '../controllers/a2ui.controller';
import { a2uiCSPMiddleware, setSSECSPHeaders } from '../middlewares/a2ui-csp.middleware';

const router = Router();

/**
 * @route POST /a2ui/begin-rendering
 * @desc 开始A2UI渲染流程
 * @access Public (根据项目需求可改为需要认证)
 */
router.post('/begin-rendering', a2uiCSPMiddleware, (req, res, next) => {
  a2uiController.beginRendering(req, res, next);
});

/**
 * @route POST /a2ui/event
 * @desc 处理A2UI客户端事件
 * @access Public (根据项目需求可改为需要认证)
 */
router.post('/event', a2uiCSPMiddleware, (req, res, next) => {
  a2uiController.handleEvent(req, res, next);
});

/**
 * @route GET /a2ui/session/:sessionId
 * @desc 获取A2UI会话状态
 * @access Public
 */
router.get('/session/:sessionId', a2uiCSPMiddleware, (req, res, next) => {
  a2uiController.getSessionStatus(req, res, next);
});

/**
 * @route POST /a2ui/end-session
 * @desc 结束A2UI会话
 * @access Public
 */
router.post('/end-session', a2uiCSPMiddleware, (req, res, next) => {
  a2uiController.endSession(req, res, next);
});

/**
 * @route POST /a2ui/report-error
 * @desc 上报A2UI错误
 * @access Public
 */
router.post('/report-error', a2uiCSPMiddleware, (req, res, next) => {
  a2uiController.reportError(req, res, next);
});

export default router;
