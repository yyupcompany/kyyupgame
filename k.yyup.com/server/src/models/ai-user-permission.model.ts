import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { User } from './user.model';
/**
 * AI用户权限模型
 * 此模型用于管理用户在AI系统中的特定权限
 * 每个文件独立定义自己的类型，不使用共享类型
 */

// 定义模型接口
export interface AIUserPermissionAttributes {
  id: number;
  userId: number;
  permissionKey: PermissionKey;
  permissionValue: PermissionValue;
  createdAt: Date;
  updatedAt: Date;
}

// 定义创建时的属性接口
export type AIUserPermissionCreationAttributes = Optional<AIUserPermissionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// 定义常用权限键
export enum PermissionKey {
  USE_TEXT_MODELS = 'use_text_models',
  USE_IMAGE_MODELS = 'use_image_models',
  USE_SPEECH_MODELS = 'use_speech_models',
  USE_VIDEO_MODELS = 'use_video_models',
  CUSTOM_PROMPTS = 'custom_prompts',
  ADVANCED_SETTINGS = 'advanced_settings',
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics',
  ADMIN_ACCESS = 'admin_access',
  AI_ADMIN = 'ai:admin'
}

// 定义权限值
export enum PermissionValue {
  DENIED = 0,
  ALLOWED = 1,
  ADVANCED = 2
}

/**
 * AI用户权限模型类
 */
export class AIUserPermission extends Model<AIUserPermissionAttributes, AIUserPermissionCreationAttributes> implements AIUserPermissionAttributes {
  public id!: number;
  public userId!: number;
  public permissionKey!: PermissionKey;
  public permissionValue!: PermissionValue;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;

  // 检查用户是否拥有指定权限
  static async checkUserPermission(
    userId: number,
    permissionKey: string,
    requiredLevel: number = PermissionValue.ALLOWED
  ): Promise<boolean> {
    const permission = await AIUserPermission.findOne({
      where: {
        userId,
        permissionKey
      }
    });

    // 如果没有找到权限记录，默认拒绝
    if (!permission) {
      return false;
    }

    // 检查权限值是否大于或等于要求的级别
    return permission.permissionValue >= requiredLevel;
  }

  // 获取用户的所有权限
  static async getUserPermissions(userId: number): Promise<Record<string, number>> {
    const permissions = await AIUserPermission.findAll({
      where: {
        userId
      }
    });

    // 将权限转换为键值对对象
    const permissionMap: Record<string, number> = {};
    permissions.forEach(permission => {
      permissionMap[permission.permissionKey] = permission.permissionValue;
    });

    return permissionMap;
  }

  // 设置用户权限
  static async setPermission(
    userId: number,
    permissionKey: PermissionKey,
    permissionValue: PermissionValue
  ): Promise<AIUserPermission> {
    const [permission] = await AIUserPermission.findOrCreate({
      where: {
        userId,
        permissionKey
      },
      defaults: {
        userId,
        permissionKey,
        permissionValue
      }
    });
    if (permission.permissionValue !== permissionValue) {
      permission.permissionValue = permissionValue;
      await permission.save();
    }
    return permission;
  }
  
  // 批量设置用户权限
  static async setBulkPermissions(
    userId: number,
    permissions: Record<string, number>,
    sequelize: Sequelize
  ): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      for (const [key, value] of Object.entries(permissions)) {
        const [permission, created] = await AIUserPermission.findOrCreate({
          where: {
            userId,
            permissionKey: key as PermissionKey
          },
          defaults: {
            userId,
            permissionKey: key as PermissionKey,
            permissionValue: value as PermissionValue,
          },
          transaction
        });

        if (!created && permission.permissionValue !== value) {
          permission.permissionValue = value as PermissionValue;
          await permission.save({ transaction });
        }
      }
    });
  }

  static initModel(sequelize: Sequelize): void {
    AIUserPermission.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '用户ID',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        permissionKey: {
          type: DataTypes.ENUM(...Object.values(PermissionKey)),
          allowNull: false,
          field: 'permission_key',
          comment: '权限键名',
        },
        permissionValue: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: PermissionValue.DENIED,
          field: 'permission_value',
          comment: '权限值 - 0:拒绝 1:允许 2:高级',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'ai_user_permissions',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: 'user_permission_idx',
            unique: true,
            fields: ['user_id', 'permission_key'],
          },
        ],
      }
    );
  }

  static initAssociations(): void {
    AIUserPermission.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

export default AIUserPermission; 