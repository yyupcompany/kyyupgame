/**
 * VOS配置控制器
 * 处理VOS配置相关的API请求
 */

import { Request, Response } from 'express'
import { ApiResponse } from '../utils/response'
import { vosConfigService } from '../services/vos-config.service'
import { VOSConfig } from '../models/vos-config.model'

class VOSConfigController {
  /**
   * 获取所有VOS配置
   * GET /api/vos-config
   */
  async getAllConfigs(req: Request, res: Response) {
    try {
      const configs = await vosConfigService.getAllConfigs()
      return ApiResponse.success(res, {
        items: configs,
        total: configs.length
      }, '获取VOS配置列表成功')
    } catch (error) {
      console.error('❌ 获取VOS配置列表失败:', error)
      return ApiResponse.error(res, '获取VOS配置列表失败', 'ERROR')
    }
  }

  /**
   * 获取当前激活的VOS配置
   * GET /api/vos-config/active
   */
  async getActiveConfig(req: Request, res: Response) {
    try {
      const activeConfig = await VOSConfig.findOne({
        where: {
          isActive: true,
          status: 'active'
        }
      })

      if (!activeConfig) {
        return ApiResponse.success(res, null, '未找到激活的VOS配置')
      }

      return ApiResponse.success(res, activeConfig, '获取激活的VOS配置成功')
    } catch (error) {
      console.error('❌ 获取激活的VOS配置失败:', error)
      return ApiResponse.error(res, '获取激活的VOS配置失败', 'ERROR')
    }
  }

  /**
   * 创建VOS配置
   * POST /api/vos-config
   */
  async createConfig(req: Request, res: Response) {
    try {
      const config = await vosConfigService.createConfig(req.body)
      return ApiResponse.success(res, config, '创建VOS配置成功')
    } catch (error) {
      console.error('❌ 创建VOS配置失败:', error)
      return ApiResponse.error(res, '创建VOS配置失败', 'ERROR')
    }
  }

  /**
   * 更新VOS配置
   * PUT /api/vos-config/:id
   */
  async updateConfig(req: Request, res: Response) {
    try {
      const { id } = req.params
      const config = await vosConfigService.updateConfig(parseInt(id), req.body)
      return ApiResponse.success(res, config, '更新VOS配置成功')
    } catch (error) {
      console.error('❌ 更新VOS配置失败:', error)
      return ApiResponse.error(res, '更新VOS配置失败', 'ERROR')
    }
  }

  /**
   * 删除VOS配置
   * DELETE /api/vos-config/:id
   */
  async deleteConfig(req: Request, res: Response) {
    try {
      const { id } = req.params
      const config = await VOSConfig.findByPk(id)

      if (!config) {
        return ApiResponse.error(res, 'VOS配置不存在', 'NOT_FOUND')
      }

      await config.destroy()
      return ApiResponse.success(res, null, '删除VOS配置成功')
    } catch (error) {
      console.error('❌ 删除VOS配置失败:', error)
      return ApiResponse.error(res, '删除VOS配置失败', 'ERROR')
    }
  }

  /**
   * 激活VOS配置
   * POST /api/vos-config/:id/activate
   */
  async activateConfig(req: Request, res: Response) {
    try {
      const { id } = req.params
      const config = await VOSConfig.findByPk(id)

      if (!config) {
        return ApiResponse.error(res, 'VOS配置不存在', 'NOT_FOUND')
      }

      // 将所有配置设为非激活状态
      await VOSConfig.update({ isActive: false }, { where: {} })

      // 激活指定配置
      await config.update({
        isActive: true,
        status: 'active'
      })

      return ApiResponse.success(res, config, '激活VOS配置成功')
    } catch (error) {
      console.error('❌ 激活VOS配置失败:', error)
      return ApiResponse.error(res, '激活VOS配置失败', 'ERROR')
    }
  }

  /**
   * 测试VOS连接
   * POST /api/vos-config/test
   */
  async testConnection(req: Request, res: Response) {
    try {
      const success = await vosConfigService.testConnection()
      const config = await vosConfigService.getConfig()

      return ApiResponse.success(res, {
        success,
        status: success ? 'active' : 'inactive',
        config: config ? {
          serverHost: config.serverHost,
          serverPort: config.serverPort,
          protocol: config.protocol
        } : null,
        message: success ? 'VOS连接测试成功' : 'VOS连接测试失败'
      }, success ? 'VOS连接测试成功' : 'VOS连接测试失败')
    } catch (error) {
      console.error('❌ VOS连接测试失败:', error)
      return ApiResponse.error(res, 'VOS连接测试失败', 'ERROR')
    }
  }

  /**
   * 获取VOS连接URL
   * GET /api/vos-config/connection-url
   */
  async getConnectionUrl(req: Request, res: Response) {
    try {
      const url = await vosConfigService.getConnectionUrl()
      return ApiResponse.success(res, { url }, '获取VOS连接URL成功')
    } catch (error) {
      console.error('❌ 获取VOS连接URL失败:', error)
      return ApiResponse.error(res, '获取VOS连接URL失败', 'ERROR')
    }
  }
}

export default new VOSConfigController()

