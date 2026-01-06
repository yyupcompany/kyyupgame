import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';

/**
 * 配置值类型
 */
export enum ConfigValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class SystemConfig extends Model<
  InferAttributes<SystemConfig>,
  InferCreationAttributes<SystemConfig>
> {
  declare id: CreationOptional<number>;
  declare groupKey: string;
  declare configKey: string;
  declare configValue: string;
  declare valueType: ConfigValueType;
  declare description: string;
  declare isSystem: CreationOptional<boolean>;
  declare isReadonly: CreationOptional<boolean>;
  declare sortOrder: CreationOptional<number>;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public readonly creator?: User;
  public readonly updater?: User;
}

export const initSystemConfig = (sequelize: Sequelize) => {
  SystemConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '配置ID',
      },
      groupKey: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '配置分组键名',
      },
      configKey: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '配置项键名',
      },
      configValue: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '配置项值',
      },
      valueType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '值类型: string, number, boolean, json',
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '配置描述',
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否系统配置',
      },
      isReadonly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否只读配置',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序顺序',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '删除时间',
      },
    },
    {
      sequelize,
      tableName: 'system_configs',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['group_key', 'config_key'],
        },
      ],
    }
  );
  return SystemConfig;
};

export const initSystemConfigAssociations = () => {
  SystemConfig.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  SystemConfig.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
