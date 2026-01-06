/**
 * 双因素认证（2FA）控制器
 *
 * 提供2FA相关API端点：
 * - POST /api/auth/2fa/setup - 初始化2FA设置
 * - POST /api/auth/2fa/verify - 验证并启用2FA
 * - POST /api/auth/2fa/disable - 禁用2FA
 * - POST /api/auth/2fa/verify-login - 登录时验证2FA码
 * - GET /api/auth/2fa/status - 获取2FA状态
 * - GET /api/auth/2fa/authenticators - 获取支持的验证器APP列表
 */

import { Request, Response } from 'express';
import { TwoFactorService, TwoFactorSetup } from '../services/two-factor.service';
import { User } from '../models';
import { Op } from 'sequelize';

const twoFactorService = new TwoFactorService();

/**
 * 2FA控制器
 */
export class TwoFactorController {
  /**
   * 初始化2FA设置
   * POST /api/auth/2fa/setup
   */
  async setup(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: '未登录'
          }
        });
        return;
      }

      // 获取用户信息
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: '用户不存在'
          }
        });
        return;
      }

      // 检查是否已启用2FA
      if ((user as any).two_fa_enabled) {
        res.status(400).json({
          success: false,
          error: {
            message: '双因素认证已启用，如需重新设置请先禁用'
          }
        });
        return;
      }

      // 生成2FA设置信息
      const setupInfo: TwoFactorSetup = await twoFactorService.generateSetup(
        (user as any).username || (user as any).phone || `user_${userId}`
      );

      // 格式化备用码用于显示
      const formattedBackupCodes = twoFactorService.formatBackupCodes(setupInfo.backupCodes);

      res.json({
        success: true,
        data: {
          qrCode: setupInfo.secret.qrCode,
          backupCodes: formattedBackupCodes,
          verificationToken: setupInfo.verificationToken,
          instructions: twoFactorService.getSetupInstructions(),
          authenticators: twoFactorService.getSupportedAuthenticators()
        }
      });

    } catch (error: any) {
      console.error('初始化2FA设置失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '初始化失败',
          detail: error.message
        }
      });
    }
  }

  /**
   * 验证并启用2FA
   * POST /api/auth/2fa/verify
   *
   * Body:
   * - token: 6位TOTP验证码
   * - secret: TOTP密钥（base32）
   * - backupCodes: 备用恢复码数组（加密前）
   * - verificationToken: 验证令牌
   */
  async verifyAndEnable(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: '未登录'
          }
        });
        return;
      }

      const { token, secret, backupCodes, verificationToken } = req.body;

      // 验证参数
      if (!token || !secret || !backupCodes || !verificationToken) {
        res.status(400).json({
          success: false,
          error: {
            message: '缺少必要参数'
          }
        });
        return;
      }

      // 验证设置
      const result = await twoFactorService.verifySetup(secret, token, backupCodes);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            message: result.message
          }
        });
        return;
      }

      // 加密并保存到数据库
      const encryptedSecret = twoFactorService.encryptSecret(secret);
      const encryptedBackupCodes = twoFactorService.encryptBackupCodes(backupCodes);

      await User.update(
        {
          two_fa_enabled: true,
          two_fa_secret: encryptedSecret,
          two_fa_backup_codes: encryptedBackupCodes,
          two_fa_enabled_at: new Date()
        },
        { where: { id: userId } }
      );

      res.json({
        success: true,
        message: '双因素认证已启用',
        data: {
          enabled: true,
          enabledAt: new Date()
        }
      });

    } catch (error: any) {
      console.error('启用2FA失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '启用失败',
          detail: error.message
        }
      });
    }
  }

  /**
   * 禁用2FA
   * POST /api/auth/2fa/disable
   *
   * Body:
   * - password: 当前密码（需要验证）
   * - token: 可选，2FA验证码（如果已启用）
   */
  async disable(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: '未登录'
          }
        });
        return;
      }

      const { password, token } = req.body;

      // 获取用户信息
      const user = await User.findByPk(userId) as any;
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: '用户不存在'
          }
        });
        return;
      }

      // TODO: 验证密码
      // const bcrypt = require('bcrypt');
      // const isValidPassword = await bcrypt.compare(password, user.password);
      // if (!isValidPassword) {
      //   res.status(401).json({
      //     success: false,
      //     error: { message: '密码错误' }
      //   });
      //   return;
      // }

      // 如果已启用2FA，需要验证2FA码
      if (user.two_fa_enabled && token) {
        const secret = twoFactorService.decryptSecret(user.two_fa_secret);
        const isValid = twoFactorService.verifyToken(secret, token);

        if (!isValid) {
          res.status(400).json({
            success: false,
            error: {
              message: '验证码错误'
            }
          });
          return;
        }
      }

      // 禁用2FA
      await User.update(
        {
          two_fa_enabled: false,
          two_fa_secret: null,
          two_fa_backup_codes: null
        },
        { where: { id: userId } }
      );

      res.json({
        success: true,
        message: '双因素认证已禁用'
      });

    } catch (error: any) {
      console.error('禁用2FA失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '禁用失败',
          detail: error.message
        }
      });
    }
  }

  /**
   * 登录时验证2FA码
   * POST /api/auth/2fa/verify-login
   *
   * Body:
   * - userId: 用户ID
   * - token: 6位TOTP验证码或备用恢复码
   * - useBackupCode: 是否使用备用码（可选）
   */
  async verifyLogin(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token, useBackupCode = false } = req.body;

      if (!userId || !token) {
        res.status(400).json({
          success: false,
          error: {
            message: '缺少必要参数'
          }
        });
        return;
      }

      // 获取用户信息
      const user = await User.findByPk(userId) as any;
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: '用户不存在'
          }
        });
        return;
      }

      // 检查是否启用2FA
      if (!user.two_fa_enabled) {
        res.status(400).json({
          success: false,
          error: {
            message: '该用户未启用双因素认证'
          }
        });
        return;
      }

      let isValid = false;
      let newBackupCodes = null;

      if (useBackupCode) {
        // 验证备用恢复码
        if (!twoFactorService.verifyBackupCode(user.two_fa_backup_codes, token)) {
          res.status(400).json({
            success: false,
            error: {
              message: '无效的备用恢复码'
            }
          });
          return;
        }

        // 使用并移除备用码
        newBackupCodes = await twoFactorService.useBackupCode(user.two_fa_backup_codes, token);
        isValid = true;
      } else {
        // 验证TOTP码
        const secret = twoFactorService.decryptSecret(user.two_fa_secret);
        if (!secret) {
          res.status(500).json({
            success: false,
            error: {
              message: '密钥解析失败'
            }
          });
          return;
        }

        isValid = twoFactorService.verifyToken(secret, token);
      }

      if (!isValid) {
        res.status(400).json({
          success: false,
          error: {
            message: '验证码错误',
            remainingTime: twoFactorService.getRemainingSeconds()
          }
        });
        return;
      }

      // 更新备用码（如果使用了）
      if (newBackupCodes) {
        await User.update(
          { two_fa_backup_codes: newBackupCodes },
          { where: { id: userId } }
        );
      }

      // 验证成功，返回用户信息和Token
      // TODO: 调用JWT服务生成令牌
      res.json({
        success: true,
        message: '验证成功',
        data: {
          userId: user.id,
          username: user.username,
          phone: user.phone,
          role: user.role,
          remainingBackupCodes: newBackupCodes
            ? JSON.parse(twoFactorService.decryptSecret(newBackupCodes) || '[]').length
            : undefined
        }
      });

    } catch (error: any) {
      console.error('验证登录2FA失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '验证失败',
          detail: error.message
        }
      });
    }
  }

  /**
   * 获取2FA状态
   * GET /api/auth/2fa/status
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: '未登录'
          }
        });
        return;
      }

      const user = await User.findByPk(userId) as any;
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: '用户不存在'
          }
        });
        return;
      }

      const backupCodesCount = user.two_fa_backup_codes
        ? JSON.parse(twoFactorService.decryptSecret(user.two_fa_backup_codes) || '[]').length
        : 0;

      res.json({
        success: true,
        data: {
          enabled: user.two_fa_enabled || false,
          enabledAt: user.two_fa_enabled_at,
          remainingBackupCodes: backupCodesCount
        }
      });

    } catch (error: any) {
      console.error('获取2FA状态失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '获取状态失败',
          detail: error.message
        }
      });
    }
  }

  /**
   * 获取支持的验证器APP列表
   * GET /api/auth/2fa/authenticators
   */
  async getAuthenticators(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          authenticators: twoFactorService.getSupportedAuthenticators(),
          instructions: twoFactorService.getSetupInstructions()
        }
      });
    } catch (error: any) {
      console.error('获取验证器列表失败:', error);
      res.status(500).json({
        success: false,
        error: {
          message: '获取失败',
          detail: error.message
        }
      });
    }
  }
}

/**
 * 导出控制器实例
 */
export const twoFactorController = new TwoFactorController();

/**
 * 导出路由
 */
export default {
  TwoFactorController,
  twoFactorController
};
