/**
* 双因素认证（2FA）路由
*
* API端点：
* - POST /api/auth/2fa/setup - 初始化2FA设置
* - POST /api/auth/2fa/verify - 验证并启用2FA
* - POST /api/auth/2fa/disable - 禁用2FA
* - POST /api/auth/2fa/verify-login - 登录时验证2FA
* - GET /api/auth/2fa/status - 获取2FA状态
* - GET /api/auth/2fa/authenticators - 获取支持的验证器APP
*/

import { Router } from 'express';
import { twoFactorController } from '../controllers/two-factor.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
* @route   POST /api/auth/2fa/setup
* @desc    初始化2FA设置（生成二维码和备用码）
* @access  Private
*/
router.post('/setup', authenticate, twoFactorController.setup.bind(twoFactorController));

/**
* @route   POST /api/auth/2fa/verify
* @desc    验证并启用2FA
* @access  Private
*/
router.post('/verify', authenticate, twoFactorController.verifyAndEnable.bind(twoFactorController));

/**
* @route   POST /api/auth/2fa/disable
* @desc    禁用2FA
* @access  Private
*/
router.post('/disable', authenticate, twoFactorController.disable.bind(twoFactorController));

/**
* @route   POST /api/auth/2fa/verify-login
* @desc    登录时验证2FA
* @access  Public（但在登录流程中使用）
*/
router.post('/verify-login', twoFactorController.verifyLogin.bind(twoFactorController));

/**
* @route   GET /api/auth/2fa/status
* @desc    获取2FA状态
* @access  Private
*/
router.get('/status', authenticate, twoFactorController.getStatus.bind(twoFactorController));

/**
* @route   GET /api/auth/2fa/authenticators
* @desc    获取支持的验证器APP列表
* @access  Public
*/
router.get('/authenticators', twoFactorController.getAuthenticators.bind(twoFactorController));

export default router;
