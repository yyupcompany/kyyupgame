import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { User } from './user.model';

/**
 * AI用户特定设置的接口
 * 保持这个接口的独立性，以便在服务层和控制器层中重用
 */
export interface IAIUserSettings {
  theme?: string;
  preferredModel?: string;
  customPrompts?: string[];
  [key: string]: string | string[] | undefined;
}

/**
 * AI用户关联模型
 * 此模型用于将现有幼儿园系统的用户关联到AI系统
 */
export class AIUserRelation extends Model<
  InferAttributes<AIUserRelation>,
  InferCreationAttributes<AIUserRelation>
> {
  declare id: CreationOptional<number>;
  declare externalUserId: number;
  declare aiSettings: IAIUserSettings;
  declare lastActivity: Date;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

export const initAIUserRelation = (sequelize: Sequelize) => {
  AIUserRelation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      externalUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '外部系统用户ID',
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        }
      },
      aiSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'AI系统特定设置',
        defaultValue: {},
      },
      lastActivity: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '最后活动时间',
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'ai_user_relations',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: 'external_user_idx',
          fields: ['external_user_id'],
        },
      ],
    }
  );

  return AIUserRelation;
};

export const initAIUserRelationAssociations = () => {
    AIUserRelation.belongsTo(User, {
        foreignKey: 'externalUserId',
        as: 'user'
    });
}; 