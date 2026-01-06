/**
 * 用户个人中心控制器
 * @description 处理用户个人信息、密码修改、头像上传等功能
 */

import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';

export class UserProfileController {
  /**
   * @swagger
   * /api/user/profile:
   *   get:
   *     summary: 获取当前用户信息
   *     tags: [用户个人中心]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功获取用户信息
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     username:
   *                       type: string
   *                     realName:
   *                       type: string
   *                     email:
   *                       type: string
   *                     phone:
   *                       type: string
   *                     avatar:
   *                       type: string
   *                     role:
   *                       type: string
   *                     status:
   *                       type: string
   *                     createdAt:
   *                       type: string
   *                     lastLoginAt:
   *                       type: string
   *                     loginCount:
   *                       type: integer
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      console.log('🔍 [getProfile] 请求用户ID:', userId);

      if (!userId) {
        console.warn('⚠️  [getProfile] 用户未授权：req.user为空或无ID');
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      console.log('🔍 [getProfile] 查询用户信息，userId:', userId);
      const user = await User.findByPk(userId, {
        attributes: [
          'id', 'username', 'realName', 'email', 'phone', 
          'status', 'createdAt', 'updatedAt'
        ]
      });

      if (!user) {
        console.warn('⚠️  [getProfile] 用户不存在，userId:', userId);
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      console.log('✅ [getProfile] 用户信息查询成功:', user.get());

      // 获取用户角色
      const userRole = (req as any).user?.role || 'user';

      return res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          realName: user.realName || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: '', // User模型没有avatar字段，返回空字符串
          role: userRole,
          status: user.status || 'active',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.updatedAt || user.createdAt || new Date().toISOString(),
          loginCount: 0 // User模型没有loginCount字段
        }
      });
    } catch (error: any) {
      console.error('❌ [getProfile] 获取用户信息失败:', error);
      console.error('❌ [getProfile] 错误堆栈:', error.stack);
      return res.status(500).json({
        success: false,
        message: '获取用户信息失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/user/profile:
   *   put:
   *     summary: 更新用户信息
   *     tags: [用户个人中心]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               realName:
   *                 type: string
   *                 description: 真实姓名
   *               email:
   *                 type: string
   *                 description: 邮箱
   *               phone:
   *                 type: string
   *                 description: 手机号
   *     responses:
   *       200:
   *         description: 更新成功
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { realName, email, phone } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证邮箱格式
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确'
        });
      }

      // 验证手机号格式
      if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: '手机号格式不正确'
        });
      }

      // 检查邮箱是否已被其他用户使用
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: '该邮箱已被使用'
          });
        }
      }

      // 检查手机号是否已被其他用户使用
      if (phone && phone !== user.phone) {
        const existingUser = await User.findOne({
          where: {
            phone,
            id: { [Op.ne]: userId }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: '该手机号已被使用'
          });
        }
      }

      // 更新用户信息
      await user.update({
        realName: realName || user.realName,
        email: email || user.email,
        phone: phone || user.phone
      });

      return res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新用户信息失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/user/change-password:
   *   post:
   *     summary: 修改密码
   *     tags: [用户个人中心]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 description: 当前密码
   *               newPassword:
   *                 type: string
   *                 description: 新密码
   *     responses:
   *       200:
   *         description: 密码修改成功
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码和新密码不能为空'
        });
      }

      // 验证新密码强度
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码长度不能少于6位'
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '当前密码不正确'
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await user.update({
        password: hashedPassword
      });

      return res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error: any) {
      console.error('修改密码失败:', error);
      return res.status(500).json({
        success: false,
        message: '修改密码失败',
        error: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/user/upload-avatar:
   *   post:
   *     summary: 上传头像
   *     tags: [用户个人中心]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               avatar:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: 头像上传成功
   */
  static async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传头像文件'
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 生成头像URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // 注意：User模型当前没有avatar字段，这里暂时注释掉
      // 删除旧头像文件（如果存在）
      // if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      //   const oldAvatarPath = path.join(__dirname, '../../public', user.avatar);
      //   if (fs.existsSync(oldAvatarPath)) {
      //     fs.unlinkSync(oldAvatarPath);
      //   }
      // }

      // 更新用户头像 - User模型需要添加avatar字段
      // await user.update({
      //   avatar: avatarUrl
      // });

      return res.json({
        success: true,
        message: '头像上传成功',
        data: {
          avatar: avatarUrl
        }
      });
    } catch (error: any) {
      console.error('上传头像失败:', error);
      return res.status(500).json({
        success: false,
        message: '上传头像失败',
        error: error.message
      });
    }
  }
}

