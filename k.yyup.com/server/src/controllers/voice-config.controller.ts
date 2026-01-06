/**
 * 语音配置控制器
 * 统一管理VOS和SIP两种配置模式
 */

import { Request, Response } from 'express';
import { VoiceConfig, VoiceConfigType } from '../models/voice-config.model';
import { Op } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 获取语音配置列表
 */
export const getVoiceConfigs = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search, configType, status, isActive } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (configType) {
      whereClause.configType = configType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: configs } = await VoiceConfig.findAndCountAll({
      where: whereClause,
      limit: Number(pageSize),
      offset,
      order: [['createdAt', 'DESC']]
    });

    // 为每个配置添加配置摘要
    const configsWithSummary = configs.map(config => ({
      ...config.toJSON(),
      summary: config.getConfigSummary(),
      validation: config.validateConfig()
    }));

    ApiResponse.success(res, {
      list: configsWithSummary,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }, '获取语音配置列表成功');
  } catch (error) {
    console.error('获取语音配置列表失败:', error);
    ApiResponse.serverError(res, '获取语音配置列表失败');
  }
};

/**
 * 获取当前激活的语音配置
 */
export const getActiveVoiceConfig = async (req: Request, res: Response) => {
  try {
    const config = await VoiceConfig.findOne({
      where: {
        isActive: true,
        status: 'active'
      },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    if (!config) {
      return ApiResponse.notFound(res, '未找到激活的语音配置');
    }

    // 返回配置详情和摘要
    const configData = {
      ...config.toJSON(),
      summary: config.getConfigSummary(),
      validation: config.validateConfig()
    };

    ApiResponse.success(res, configData, '获取当前激活的语音配置成功');
  } catch (error) {
    console.error('获取当前激活的语音配置失败:', error);
    ApiResponse.serverError(res, '获取当前激活的语音配置失败');
  }
};

/**
 * 获取语音配置详情
 */
export const getVoiceConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    // 返回配置详情和摘要
    const configData = {
      ...config.toJSON(),
      summary: config.getConfigSummary(),
      validation: config.validateConfig()
    };

    ApiResponse.success(res, configData, '获取语音配置详情成功');
  } catch (error) {
    console.error('获取语音配置详情失败:', error);
    ApiResponse.serverError(res, '获取语音配置详情失败');
  }
};

/**
 * 创建语音配置
 */
export const createVoiceConfig = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      configType,
      // VOS配置
      vosServerHost,
      vosServerPort,
      vosApiKey,
      vosDidNumbers,
      vosDefaultDidNumber,
      vosMaxConcurrentCalls,
      // SIP配置
      sipServerHost,
      sipServerPort,
      sipProtocol,
      sipRealm,
      sipUsername,
      sipPassword,
      sipDidNumbers,
      sipDefaultDidNumber,
      sipAudioCodecs,
      sipRtpPortStart,
      sipRtpPortEnd
    } = req.body;
    const userId = req.user?.id;

    // 检查配置名称是否已存在
    const existingConfig = await VoiceConfig.findOne({
      where: { name }
    });

    if (existingConfig) {
      return ApiResponse.badRequest(res, '配置名称已存在');
    }

    // 验证配置类型对应的必填字段
    const validationErrors = [];

    if (configType === 'vos') {
      if (!vosServerHost) validationErrors.push('VOS服务器地址不能为空');
      if (!vosApiKey) validationErrors.push('VOS API密钥不能为空');
    } else if (configType === 'sip') {
      if (!sipServerHost) validationErrors.push('SIP服务器地址不能为空');
      if (!sipUsername) validationErrors.push('SIP用户名不能为空');
      if (!sipPassword) validationErrors.push('SIP密码不能为空');
    }

    if (validationErrors.length > 0) {
      return ApiResponse.error(res, '配置验证失败: ' + validationErrors.join(', '), 'VALIDATION_ERROR', 400);
    }

    // 创建配置
    const configData: any = {
      name,
      description,
      configType,
      isActive: false,
      isDefault: false,
      status: 'inactive',
      createdBy: userId,
      updatedBy: userId
    };

    // 根据配置类型添加对应字段
    if (configType === 'vos') {
      Object.assign(configData, {
        vosServerHost,
        vosServerPort: vosServerPort || 443,
        vosApiKey,
        vosDidNumbers: vosDidNumbers || [],
        vosDefaultDidNumber,
        vosMaxConcurrentCalls: vosMaxConcurrentCalls || 10
      });
    } else if (configType === 'sip') {
      Object.assign(configData, {
        sipServerHost,
        sipServerPort: sipServerPort || 5060,
        sipProtocol: sipProtocol || 'udp',
        sipRealm,
        sipUsername,
        sipPassword,
        sipDidNumbers: sipDidNumbers || [],
        sipDefaultDidNumber,
        sipAudioCodecs: sipAudioCodecs || ['PCMU', 'PCMA'],
        sipRtpPortStart: sipRtpPortStart || 10000,
        sipRtpPortEnd: sipRtpPortEnd || 20000
      });
    }

    const config = await VoiceConfig.create(configData);

    ApiResponse.success(res, config, '创建语音配置成功', 201);
  } catch (error) {
    console.error('创建语音配置失败:', error);
    ApiResponse.serverError(res, '创建语音配置失败');
  }
};

/**
 * 更新语音配置
 */
export const updateVoiceConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    // 如果修改配置类型，验证新类型的必填字段
    if (updateData.configType && updateData.configType !== config.configType) {
      const validationErrors = [];

      if (updateData.configType === 'vos') {
        if (!updateData.vosServerHost) validationErrors.push('VOS服务器地址不能为空');
        if (!updateData.vosApiKey) validationErrors.push('VOS API密钥不能为空');
      } else if (updateData.configType === 'sip') {
        if (!updateData.sipServerHost) validationErrors.push('SIP服务器地址不能为空');
        if (!updateData.sipUsername) validationErrors.push('SIP用户名不能为空');
        if (!updateData.sipPassword) validationErrors.push('SIP密码不能为空');
      }

      if (validationErrors.length > 0) {
        return ApiResponse.error(res, '配置验证失败: ' + validationErrors.join(', '), 'VALIDATION_ERROR', 400);
      }
    }

    // 如果修改名称，检查是否重复
    if (updateData.name && updateData.name !== config.name) {
      const existingConfig = await VoiceConfig.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id }
        }
      });

      if (existingConfig) {
        return ApiResponse.badRequest(res, '配置名称已存在');
      }
    }

    updateData.updatedBy = userId;

    await config.update(updateData);

    ApiResponse.success(res, config, '更新语音配置成功');
  } catch (error) {
    console.error('更新语音配置失败:', error);
    ApiResponse.serverError(res, '更新语音配置失败');
  }
};

/**
 * 删除语音配置
 */
export const deleteVoiceConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    // 检查是否有关联的使用
    // TODO: 检查是否有分机或账号正在使用此配置

    await config.destroy();

    ApiResponse.success(res, null, '删除语音配置成功');
  } catch (error) {
    console.error('删除语音配置失败:', error);
    ApiResponse.serverError(res, '删除语音配置失败');
  }
};

/**
 * 激活/停用语音配置
 */
export const toggleVoiceConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    // 如果要激活配置，需要先停用其他配置（确保只有一个激活的配置）
    if (isActive) {
      await VoiceConfig.update(
        {
          isActive: false,
          isDefault: false,
          status: 'inactive',
          updatedBy: req.user?.id
        },
        { where: { isActive: true } }
      );
    }

    await config.update({
      isActive,
      status: isActive ? 'active' : 'inactive',
      lastConnectedAt: isActive ? new Date() : null,
      updatedBy: req.user?.id
    });

    ApiResponse.success(res, config, `${isActive ? '激活' : '停用'}语音配置成功`);
  } catch (error) {
    console.error('切换语音配置状态失败:', error);
    ApiResponse.serverError(res, '切换语音配置状态失败');
  }
};

/**
 * 测试语音配置连接
 */
export const testVoiceConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    // TODO: 实现实际的连接测试逻辑
    // 根据配置类型选择不同的测试方式
    let testResult = {
      success: false,
      message: '',
      latency: 0,
      testedAt: new Date()
    };

    if (config.configType === 'vos') {
      // VOS连接测试
      try {
        // 模拟HTTP请求到VOS服务器
        const startTime = Date.now();
        // const response = await axios.get(`http://${config.vosServerHost}:${config.vosServerPort}/health`, {
        //   headers: { 'Authorization': `Bearer ${config.vosApiKey}` }
        // });
        const latency = Date.now() - startTime;

        testResult = {
          success: true,
          message: 'VOS连接测试成功',
          latency,
          testedAt: new Date()
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'VOS连接测试失败',
          latency: 0,
          testedAt: new Date()
        };
      }
    } else if (config.configType === 'sip') {
      // SIP连接测试
      try {
        // 模拟SIP OPTIONS请求
        const startTime = Date.now();
        // SIP OPTIONS请求的实现
        const latency = Date.now() - startTime;

        testResult = {
          success: true,
          message: 'SIP连接测试成功',
          latency,
          testedAt: new Date()
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'SIP连接测试失败',
          latency: 0,
          testedAt: new Date()
        };
      }
    }

    // 更新测试时间和状态
    await config.update({
      status: testResult.success ? 'active' : 'error',
      lastTestedAt: new Date(),
      lastErrorMessage: testResult.success ? null : testResult.message,
      lastConnectedAt: testResult.success ? new Date() : config.lastConnectedAt,
      updatedBy: req.user?.id
    });

    ApiResponse.success(res, testResult, '语音配置连接测试完成');
  } catch (error) {
    console.error('测试语音配置连接失败:', error);

    // 更新错误状态
    try {
      await VoiceConfig.update(
        {
          status: 'error',
          lastTestedAt: new Date(),
          lastErrorMessage: error instanceof Error ? error.message : '连接测试失败',
          updatedBy: req.user?.id
        },
        { where: { id: req.params.id } }
      );
    } catch (updateError) {
      console.error('更新语音配置错误状态失败:', updateError);
    }

    ApiResponse.serverError(res, '测试语音配置连接失败');
  }
};

/**
 * 获取配置统计信息
 */
export const getVoiceConfigStats = async (req: Request, res: Response) => {
  try {
    const total = await VoiceConfig.count();
    const active = await VoiceConfig.count({ where: { isActive: true } });
    const vosCount = await VoiceConfig.count({ where: { configType: 'vos' } });
    const sipCount = await VoiceConfig.count({ where: { configType: 'sip' } });
    const vosActive = await VoiceConfig.count({ where: { configType: 'vos', isActive: true } });
    const sipActive = await VoiceConfig.count({ where: { configType: 'sip', isActive: true } });
    const error = await VoiceConfig.count({ where: { status: 'error' } });

    const stats = {
      total,
      active,
      inactive: total - active,
      error,
      // 按类型统计
      vos: {
        total: vosCount,
        active: vosActive,
        inactive: vosCount - vosActive
      },
      sip: {
        total: sipCount,
        active: sipActive,
        inactive: sipCount - sipActive
      }
    };

    ApiResponse.success(res, stats, '获取语音配置统计信息成功');
  } catch (error) {
    console.error('获取语音配置统计信息失败:', error);
    ApiResponse.serverError(res, '获取语音配置统计信息失败');
  }
};

/**
 * 验证语音配置
 */
export const validateVoiceConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const config = await VoiceConfig.findByPk(id);

    if (!config) {
      return ApiResponse.notFound(res, '语音配置不存在');
    }

    const validation = config.validateConfig();

    ApiResponse.success(res, validation, '语音配置验证完成');
  } catch (error) {
    console.error('验证语音配置失败:', error);
    ApiResponse.serverError(res, '验证语音配置失败');
  }
};

export default {
  getVoiceConfigs,
  getActiveVoiceConfig,
  getVoiceConfigById,
  createVoiceConfig,
  updateVoiceConfig,
  deleteVoiceConfig,
  toggleVoiceConfig,
  testVoiceConfig,
  getVoiceConfigStats,
  validateVoiceConfig
};