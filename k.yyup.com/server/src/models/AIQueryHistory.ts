import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface AIQueryHistoryAttributes {
  id: number;
  userId: number;
  queryText: string;
  queryHash: string;
  queryType: 'data_query' | 'ai_response';
  responseData?: any;
  responseText?: string;
  generatedSQL?: string;
  executionTime?: number;
  modelUsed?: string;
  sessionId?: string;
  cacheHit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AIQueryHistoryCreationAttributes extends Optional<AIQueryHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AIQueryHistory extends Model<AIQueryHistoryAttributes, AIQueryHistoryCreationAttributes> implements AIQueryHistoryAttributes {
  public id!: number;
  public userId!: number;
  public queryText!: string;
  public queryHash!: string;
  public queryType!: 'data_query' | 'ai_response';
  public responseData?: any;
  public responseText?: string;
  public generatedSQL?: string;
  public executionTime?: number;
  public modelUsed?: string;
  public sessionId?: string;
  public cacheHit!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIQueryHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    queryText: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '查询内容'
    },
    queryHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '查询内容的MD5哈希值，用于快速匹配重复查询'
    },
    queryType: {
      type: DataTypes.ENUM('data_query', 'ai_response'),
      allowNull: false,
      comment: '查询类型：数据查询或AI问答'
    },
    responseData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '查询结果数据（JSON格式）'
    },
    responseText: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'AI回答文本（用于非数据查询）'
    },
    generatedSQL: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '生成的SQL语句'
    },
    executionTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '执行时间（毫秒）'
    },
    modelUsed: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '使用的AI模型名称'
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '会话ID'
    },
    cacheHit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否命中缓存'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'ai_query_histories',
    sequelize,
    paranoid: false,
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['queryHash']
      },
      {
        fields: ['userId', 'queryHash']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['queryType']
      }
    ]
  }
);

export default AIQueryHistory;