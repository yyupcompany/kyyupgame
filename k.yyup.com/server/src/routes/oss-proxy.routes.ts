import express from 'express';
import { OSSProxyController } from '../controllers/oss-proxy.controller';
import { tenantFileAccessMiddleware } from '../middlewares/oss-security.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * OSS文件代理路由
*
 * 安全策略:
 * - 公共资源(system/games/education): 无需认证
 * - 租户资源(rent/{phone}/): 需要租户隔离验证
*/

// 游戏资源专用路由 (公共)
// GET /api/oss-proxy/games/:type/:subType/:filename
router.get('/games/:type/:subType/:filename', OSSProxyController.getGameAsset);

// 教育资源专用路由 (公共)
// GET /api/oss-proxy/education/:category/:subType/:filename
router.get('/education/:category/:subType/:filename', OSSProxyController.getEducationAsset);

// 系统文件路由 (公共)
// GET /api/oss-proxy/system/:category/:subType/:filename
router.get('/system/:category/:subType/:filename', OSSProxyController.getSystemFile);

// 开发资源路由 (公共)
// GET /api/oss-proxy/development/:subType/:filename
router.get('/development/:subType/:filename', OSSProxyController.getDevelopmentAsset);

// 批量获取资源URL
// POST /api/oss-proxy/batch
router.post('/batch', OSSProxyController.batchGetAssets);

// 多租户支持路由 (需租户隔离验证) - 从 req.tenant 自动获取 phone
// GET /api/oss-proxy/tenant/:fileType/:filename
router.get('/tenant/:fileType/:filename', tenantFileAccessMiddleware, OSSProxyController.getTenantFile);

// 获取文件信息
// GET /api/oss-proxy/info/*
router.get('/info/*', OSSProxyController.getFileInfo);

// 通用文件代理 (放在最后，作为兜底)
// GET /api/oss-proxy/*
router.get('/*', OSSProxyController.proxyFile);

export default router;