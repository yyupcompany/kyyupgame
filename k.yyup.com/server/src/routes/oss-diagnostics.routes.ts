import { Router } from 'express';
import { OSSdiagnosticsController } from '../controllers/oss-diagnostics.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * OSS 诊断路由
*/

// 诊断 OSS 连接
router.get('/diagnose', OSSdiagnosticsController.diagnoseConnection);

// 获取 OSS 配置指南
router.get('/guide', OSSdiagnosticsController.getConfigurationGuide);

export default router;

