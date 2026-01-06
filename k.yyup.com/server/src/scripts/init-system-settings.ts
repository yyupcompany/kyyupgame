/**
 * 初始化系统设置默认数据
 */
import { SystemConfig, ConfigValueType } from '../models/system-config.model';
import { sequelize } from '../init';

interface DefaultSetting {
  groupKey: string;
  configKey: string;
  configValue: string;
  valueType: ConfigValueType;
  description: string;
  isSystem: boolean;
  isReadonly: boolean;
  sortOrder: number;
}

const defaultSettings: DefaultSetting[] = [
  // 基本设置
  {
    groupKey: 'basic',
    configKey: 'siteName',
    configValue: '幼儿园管理系统',
    valueType: ConfigValueType.STRING,
    description: '站点名称',
    isSystem: true,
    isReadonly: false,
    sortOrder: 1
  },
  {
    groupKey: 'basic',
    configKey: 'version',
    configValue: '1.0.0',
    valueType: ConfigValueType.STRING,
    description: '系统版本',
    isSystem: true,
    isReadonly: true,
    sortOrder: 2
  },
  {
    groupKey: 'basic',
    configKey: 'timezone',
    configValue: 'Asia/Shanghai',
    valueType: ConfigValueType.STRING,
    description: '系统时区',
    isSystem: true,
    isReadonly: false,
    sortOrder: 3
  },
  {
    groupKey: 'basic',
    configKey: 'language',
    configValue: 'zh-CN',
    valueType: ConfigValueType.STRING,
    description: '系统语言',
    isSystem: true,
    isReadonly: false,
    sortOrder: 4
  },
  {
    groupKey: 'basic',
    configKey: 'maintenanceMode',
    configValue: 'false',
    valueType: ConfigValueType.BOOLEAN,
    description: '维护模式',
    isSystem: true,
    isReadonly: false,
    sortOrder: 5
  },

  // 安全设置
  {
    groupKey: 'security',
    configKey: 'sessionTimeout',
    configValue: '1440',
    valueType: ConfigValueType.NUMBER,
    description: '会话超时时间（分钟）',
    isSystem: true,
    isReadonly: false,
    sortOrder: 1
  },
  {
    groupKey: 'security',
    configKey: 'passwordComplexity',
    configValue: JSON.stringify({
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }),
    valueType: ConfigValueType.JSON,
    description: '密码复杂度要求',
    isSystem: true,
    isReadonly: false,
    sortOrder: 2
  },
  {
    groupKey: 'security',
    configKey: 'minPasswordLength',
    configValue: '8',
    valueType: ConfigValueType.NUMBER,
    description: '最短密码长度',
    isSystem: true,
    isReadonly: false,
    sortOrder: 3
  },

  // 邮件设置
  {
    groupKey: 'email',
    configKey: 'emailNotifications',
    configValue: 'true',
    valueType: ConfigValueType.BOOLEAN,
    description: '邮件通知开关',
    isSystem: true,
    isReadonly: false,
    sortOrder: 1
  },
  {
    groupKey: 'email',
    configKey: 'smsNotifications',
    configValue: 'false',
    valueType: ConfigValueType.BOOLEAN,
    description: '短信通知开关',
    isSystem: true,
    isReadonly: false,
    sortOrder: 2
  },

  // 存储设置
  {
    groupKey: 'storage',
    configKey: 'maxFileSize',
    configValue: '10MB',
    valueType: ConfigValueType.STRING,
    description: '最大文件上传大小',
    isSystem: true,
    isReadonly: false,
    sortOrder: 1
  }
];

/**
 * 初始化系统设置
 */
export async function initSystemSettings(): Promise<void> {
  try {
    console.log('🔧 开始初始化系统设置...');

    // 检查数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 批量插入默认设置（如果不存在）
    for (const setting of defaultSettings) {
      const existing = await SystemConfig.findOne({
        where: {
          groupKey: setting.groupKey,
          configKey: setting.configKey
        }
      });

      if (!existing) {
        await SystemConfig.create({
          ...setting,
          creatorId: 1 // 假设管理员用户ID为1
        });
        console.log(`✅ 创建设置: ${setting.groupKey}.${setting.configKey} = ${setting.configValue}`);
      } else {
        console.log(`⏭️  设置已存在: ${setting.groupKey}.${setting.configKey}`);
      }
    }

    console.log('🎉 系统设置初始化完成！');
  } catch (error) {
    console.error('❌ 系统设置初始化失败:', error);
    throw error;
  }
}

/**
 * 获取系统设置值
 */
export async function getSystemSetting(groupKey: string, configKey: string): Promise<any> {
  try {
    const setting = await SystemConfig.findOne({
      where: {
        groupKey,
        configKey
      }
    });

    if (!setting) {
      return null;
    }

    // 根据值类型转换返回值
    switch (setting.valueType) {
      case 'number':
        return Number(setting.configValue);
      case 'boolean':
        return setting.configValue === 'true';
      case 'json':
        return JSON.parse(setting.configValue);
      default:
        return setting.configValue;
    }
  } catch (error) {
    console.error(`获取系统设置失败: ${groupKey}.${configKey}`, error);
    return null;
  }
}

/**
 * 设置系统设置值
 */
export async function setSystemSetting(
  groupKey: string, 
  configKey: string, 
  value: any, 
  updaterId?: number
): Promise<boolean> {
  try {
    const setting = await SystemConfig.findOne({
      where: {
        groupKey,
        configKey
      }
    });

    if (!setting) {
      console.error(`系统设置不存在: ${groupKey}.${configKey}`);
      return false;
    }

    // 根据值类型转换存储值
    let configValue: string;
    switch (setting.valueType) {
      case 'json':
        configValue = JSON.stringify(value);
        break;
      default:
        configValue = String(value);
    }

    await setting.update({
      configValue,
      updaterId
    });

    console.log(`✅ 更新设置: ${groupKey}.${configKey} = ${configValue}`);
    return true;
  } catch (error) {
    console.error(`设置系统设置失败: ${groupKey}.${configKey}`, error);
    return false;
  }
}

/**
 * 获取分组的所有设置
 */
export async function getSystemSettingsByGroup(groupKey: string): Promise<Record<string, any>> {
  try {
    const settings = await SystemConfig.findAll({
      where: {
        groupKey
      },
      order: [['sortOrder', 'ASC']]
    });

    const result: Record<string, any> = {};
    for (const setting of settings) {
      // 根据值类型转换返回值
      switch (setting.valueType) {
        case 'number':
          result[setting.configKey] = Number(setting.configValue);
          break;
        case 'boolean':
          result[setting.configKey] = setting.configValue === 'true';
          break;
        case 'json':
          result[setting.configKey] = JSON.parse(setting.configValue);
          break;
        default:
          result[setting.configKey] = setting.configValue;
      }
    }

    return result;
  } catch (error) {
    console.error(`获取分组设置失败: ${groupKey}`, error);
    return {};
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initSystemSettings()
    .then(() => {
      console.log('系统设置初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('系统设置初始化失败:', error);
      process.exit(1);
    });
}
