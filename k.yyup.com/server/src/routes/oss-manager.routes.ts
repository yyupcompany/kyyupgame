import { Router } from 'express';
import { OSSManagerController } from '../controllers/oss-manager.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * OSS 文件管理路由
*/

// 列出 OSS 中的所有文件
router.get('/files', OSSManagerController.listOSSFiles);

// 获取 OSS 目录结构
router.get('/structure', OSSManagerController.getOSSStructure);

// 获取 OSS 统计信息
router.get('/stats', OSSManagerController.getOSSStats);

// 删除 OSS 中的文件
router.post('/delete', OSSManagerController.deleteOSSFile);

export default router;

