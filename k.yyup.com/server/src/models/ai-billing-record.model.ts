import {
  Model,
  DataTypes,
  Sequelize,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
// 🚀 AI模型已迁移到统一租户中心
// import { AIModelConfig } from './ai-model-config.model';
// import { AIModelUsage } from './ai-model-usage.model';

// 占位符类型定义
type AIModelConfig = any;
type AIModelUsage = any;

/**
 * 计费类型枚举
 */
export enum BillingType {
  TOKEN = 'token',           // 按Token计费 (文本模型)
  SECOND = 'second',         // 按秒计费 (视频)
  COUNT = 'count',           // 按次数计费 (图片)
  CHARACTER = 'character',   // 按字符计费 (TTS)
}

/**
 * 计费状态枚举
 */
export enum BillingStatus {
  PENDING = 'pending',         // 待计费
  CALCULATED = 'calculated',   // 已计算
  BILLED = 'billed',           // 已计费
  PAID = 'paid',               // 已支付
  FAILED = 'failed',           // 失败
  REFUNDED = 'refunded',       // 已退款
}

/**
 * AI计费记录模型
 * 
 * 用于独立记录AI服务的计费信息，支持三种计费模式：
 * 1. Token计费 (文本/语言模型、TTS语音)
 * 2. 次数计费 (图片生成)
 * 3. 时长计费 (视频生成，按秒计费)
 */
export class AIBillingRecord extends Model<
  InferAttributes<AIBillingRecord>,
  InferCreationAttributes<AIBillingRecord>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare modelId: ForeignKey<number>;
  declare usageId: ForeignKey<number>;
  declare billingType: BillingType;

  // 通用计量字段
  declare quantity: number;
  declare unit: string;

  // 详细计量字段
  declare inputTokens: CreationOptional<number>;
  declare outputTokens: CreationOptional<number>;
  declare durationSeconds: CreationOptional<number>;
  declare imageCount: CreationOptional<number>;
  declare characterCount: CreationOptional<number>;

  // 计费金额
  declare inputPrice: CreationOptional<number>;
  declare outputPrice: CreationOptional<number>;
  declare unitPrice: number;
  declare totalCost: number;
  declare currency: CreationOptional<string>;

  // 计费状态
  declare billingStatus: CreationOptional<BillingStatus>;
  declare billingTime: Date | null;
  declare paymentTime: Date | null;

  // 其他信息
  declare billingCycle: string | null;
  declare remark: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare readonly user?: User;
  declare readonly modelConfig?: AIModelConfig;
  declare readonly usage?: AIModelUsage;
}

export const initAIBillingRecord = (sequelize: Sequelize) => {
  AIBillingRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '计费记录ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      modelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'model_id',
        comment: '模型ID',
      },
      usageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'usage_id',
        comment: '关联的使用记录ID',
      },
      billingType: {
        type: DataTypes.ENUM(...Object.values(BillingType)),
        allowNull: false,
        field: 'billing_type',
        comment: '计费类型',
      },

      // 通用计量字段
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '计量数量',
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '计量单位',
      },

      // 详细计量字段
      inputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'input_tokens',
        comment: '输入Token数',
      },
      outputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'output_tokens',
        comment: '输出Token数',
      },
      durationSeconds: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'duration_seconds',
        comment: '时长(秒)',
      },
      imageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'image_count',
        comment: '图片数量',
      },
      characterCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'character_count',
        comment: '字符数',
      },

      // 计费金额
      inputPrice: {
        type: DataTypes.DECIMAL(12, 8),
        defaultValue: 0,
        field: 'input_price',
        comment: '输入单价',
      },
      outputPrice: {
        type: DataTypes.DECIMAL(12, 8),
        defaultValue: 0,
        field: 'output_price',
        comment: '输出单价',
      },
      unitPrice: {
        type: DataTypes.DECIMAL(12, 8),
        allowNull: false,
        field: 'unit_price',
        comment: '统一单价',
      },
      totalCost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        field: 'total_cost',
        comment: '总费用',
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD',
        comment: '货币单位',
      },

      // 计费状态
      billingStatus: {
        type: DataTypes.ENUM(...Object.values(BillingStatus)),
        defaultValue: BillingStatus.PENDING,
        field: 'billing_status',
        comment: '计费状态',
      },
      billingTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'billing_time',
        comment: '计费时间',
      },
      paymentTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'payment_time',
        comment: '支付时间',
      },

      // 其他信息
      billingCycle: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'billing_cycle',
        comment: '计费周期',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注信息',
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'ai_billing_records',
      timestamps: true,
      underscored: true,
      comment: 'AI计费记录表',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['model_id'] },
        { fields: ['usage_id'], unique: true },
        { fields: ['billing_status'] },
        { fields: ['billing_time'] },
        { fields: ['billing_cycle'] },
        { fields: ['created_at'] },
        { fields: ['user_id', 'billing_cycle'] },
        { fields: ['user_id', 'billing_status'] },
      ],
    }
  );

  return AIBillingRecord;
};

export const initAIBillingRecordAssociations = () => {
  // 一条计费记录属于一个用户
  AIBillingRecord.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // 🚀 AI模型已迁移到统一租户中心
  // // 一条计费记录关联一个AI模型配置
  // AIBillingRecord.belongsTo(AIModelConfig, {
  //   foreignKey: 'modelId',
  //   as: 'modelConfig',
  // });

  // // 一条计费记录关联一个使用记录
  // AIBillingRecord.belongsTo(AIModelUsage, {
  //   foreignKey: 'usageId',
  //   as: 'usage',
  // });

  // 反向关联：一个用户有多条计费记录
  User.hasMany(AIBillingRecord, {
    foreignKey: 'userId',
    as: 'billingRecords',
  });

  // 🚀 AI模型已迁移到统一租户中心
  // // 反向关联：一个使用记录有一条计费记录
  // AIModelUsage.hasOne(AIBillingRecord, {
  //   foreignKey: 'usageId',
  //   as: 'billingRecord',
  // });
};

/**
 * 辅助函数：根据使用类型确定计费类型
 */
export function getBillingTypeFromUsageType(usageType: string): BillingType {
  switch (usageType.toLowerCase()) {
    case 'text':
    case 'embedding':
      return BillingType.TOKEN;
    
    case 'image':
      return BillingType.COUNT;
    
    case 'audio':
      return BillingType.CHARACTER; // TTS按字符计费
    
    case 'video':
      return BillingType.SECOND;
    
    default:
      return BillingType.TOKEN; // 默认按Token计费
  }
}

/**
 * 辅助函数：根据计费类型获取计量单位
 */
export function getUnitFromBillingType(billingType: BillingType): string {
  switch (billingType) {
    case BillingType.TOKEN:
      return 'token';
    
    case BillingType.SECOND:
      return 'second';
    
    case BillingType.COUNT:
      return 'count';
    
    case BillingType.CHARACTER:
      return 'character';
    
    default:
      return 'token';
  }
}

