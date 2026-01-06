import { Model, DataTypes, Sequelize } from 'sequelize';

interface AIUsageLogAttributes {
  id?: number;
  userId: number;
  modelId: number;
  tokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AIUsageLog extends Model<AIUsageLogAttributes> implements AIUsageLogAttributes {
  public id!: number;
  public userId!: number;
  public modelId!: number;
  public tokens!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  AIUsageLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      modelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ai_models',
          key: 'id'
        }
      },
      tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用的token数量'
      }
    },
    {
      sequelize,
      modelName: 'ai_usage_logs',
      tableName: 'ai_usage_logs',
      timestamps: true,
      indexes: [
        {
          fields: ['userId', 'createdAt']
        },
        {
          fields: ['modelId']
        }
      ]
    }
  );

  return AIUsageLog;
};