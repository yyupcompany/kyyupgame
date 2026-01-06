/**
 * 短信代理控制器
 * 代理租户业务系统的短信请求到统一认证中心
 */

import { Request, Response } from 'express';
import { adminIntegrationService } from '../middlewares/auth.middleware';
import { ApiResponseEnhanced } from '../utils/apiResponseEnhanced';

export class SmsProxyController {
  /**
   * 发送验证码（代理到统一认证中心）
   * POST /api/sms/send-code
   */
  static async sendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, type, scene } = req.body;

      // 参数验证
      if (!phone) {
        ApiResponseEnhanced.badRequest(res, '手机号不能为空');
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        ApiResponseEnhanced.badRequest(res, '手机号格式不正确');
        return;
      }

      if (!type) {
        ApiResponseEnhanced.badRequest(res, '验证码类型不能为空');
        return;
      }

      // 调用统一认证中心API
      const result = await adminIntegrationService.sendVerificationCode({
        phone,
        type,
        scene,
      });

      if (result.success) {
        ApiResponseEnhanced.success(res, result.data, result.message || '验证码已发送');
      } else {
        ApiResponseEnhanced.error(res, result.message || '发送验证码失败', 'SEND_FAILED', 400);
      }
    } catch (error: any) {
      console.error('[短信代理] 发送验证码失败:', error);
      ApiResponseEnhanced.error(res, error.message || '发送验证码失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 验证验证码（代理到统一认证中心）
   * POST /api/sms/verify-code
   */
  static async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, code, type } = req.body;

      // 参数验证
      if (!phone || !code) {
        ApiResponseEnhanced.badRequest(res, '手机号和验证码不能为空');
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        ApiResponseEnhanced.badRequest(res, '手机号格式不正确');
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        ApiResponseEnhanced.badRequest(res, '验证码格式不正确');
        return;
      }

      // 调用统一认证中心API
      const result = await adminIntegrationService.verifyCode({
        phone,
        code,
        type: type || 'register',
      });

      if (result.success) {
        ApiResponseEnhanced.success(res, result.data, result.message || '验证成功');
      } else {
        ApiResponseEnhanced.error(res, result.message || '验证码验证失败', 'VERIFY_FAILED', 400);
      }
    } catch (error: any) {
      console.error('[短信代理] 验证验证码失败:', error);
      ApiResponseEnhanced.error(res, error.message || '验证码验证失败', 'INTERNAL_ERROR', 500);
    }
  }

  /**
   * 验证码注册（代理到统一认证中心）
   * POST /api/auth/register-by-code
   */
  static async registerByCode(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, verificationCode, source, referenceId, inviteCode } = req.body;

      // 参数验证
      if (!name || !phone || !verificationCode) {
        ApiResponseEnhanced.badRequest(res, '姓名、手机号和验证码不能为空');
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        ApiResponseEnhanced.badRequest(res, '手机号格式不正确');
        return;
      }

      if (!/^\d{6}$/.test(verificationCode)) {
        ApiResponseEnhanced.badRequest(res, '验证码格式不正确');
        return;
      }

      // 调用统一认证中心API
      const result = await adminIntegrationService.registerByCode({
        name,
        phone,
        verificationCode,
        source,
        referenceId,
        inviteCode,
      });

      if (result.success) {
        // 注册成功，返回token和用户信息
        ApiResponseEnhanced.success(res, result.data, result.message || '注册成功');
      } else {
        ApiResponseEnhanced.error(res, result.message || '注册失败', 'REGISTER_FAILED', 400);
      }
    } catch (error: any) {
      console.error('[短信代理] 验证码注册失败:', error);
      ApiResponseEnhanced.error(res, error.message || '注册失败', 'INTERNAL_ERROR', 500);
    }
  }
}

export default SmsProxyController;
