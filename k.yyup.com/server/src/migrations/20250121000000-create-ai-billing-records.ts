import { QueryInterface, DataTypes } from 'sequelize';

/**
 * AI计费记录表迁移
 * 
 * 此表用于独立记录AI服务的计费信息，支持三种计费模式：
 * 1. Token计费 (文本/语言模型)
 * 2. 次数计费 (图片生成)
 * 3. 时长计费 (视频生成，按秒计费)
 */
export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('ai_billing_records', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '计费记录ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      modelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'model_id',
        comment: '模型ID',
        references: {
          model: 'ai_model_config',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      usageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'usage_id',
        comment: '关联的使用记录ID',
        references: {
          model: 'ai_model_usage',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      billingType: {
        type: DataTypes.ENUM('token', 'second', 'count', 'character'),
        allowNull: false,
        field: 'billing_type',
        comment: '计费类型: token-按Token计费, second-按秒计费, count-按次数计费, character-按字符计费',
      },

      // ==================== 通用计量字段 ====================
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '计量数量 (总量，用于快速查询统计)',
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '计量单位 (token/second/count/image/character)',
      },

      // ==================== 详细计量字段 ====================
      // 文本模型专用
      inputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'input_tokens',
        comment: '输入Token数 (仅文本类型)',
      },
      outputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'output_tokens',
        comment: '输出Token数 (仅文本类型)',
      },
      
      // 视频/音频专用
      durationSeconds: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'duration_seconds',
        comment: '时长(秒) (视频/音频类型)',
      },
      
      // 图片专用
      imageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'image_count',
        comment: '图片数量 (图片类型)',
      },
      
      // 语音专用 (TTS通常按字符计费)
      characterCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'character_count',
        comment: '字符数 (TTS语音类型)',
      },

      // ==================== 计费金额 ====================
      inputPrice: {
        type: DataTypes.DECIMAL(12, 8),
        defaultValue: 0,
        field: 'input_price',
        comment: '输入单价 (文本模型的输入Token单价)',
      },
      outputPrice: {
        type: DataTypes.DECIMAL(12, 8),
        defaultValue: 0,
        field: 'output_price',
        comment: '输出单价 (文本模型的输出Token单价)',
      },
      unitPrice: {
        type: DataTypes.DECIMAL(12, 8),
        allowNull: false,
        field: 'unit_price',
        comment: '统一单价 (图片/视频/语音的单价)',
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

      // ==================== 计费状态 ====================
      billingStatus: {
        type: DataTypes.ENUM('pending', 'calculated', 'billed', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
        field: 'billing_status',
        comment: '计费状态: pending-待计费, calculated-已计算, billed-已计费, paid-已支付, failed-失败, refunded-已退款',
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

      // ==================== 其他信息 ====================
      billingCycle: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'billing_cycle',
        comment: '计费周期 (如: 2025-01)',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注信息',
      },

      // ==================== 时间戳 ====================
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
    });

    // 创建索引
    await queryInterface.addIndex('ai_billing_records', ['user_id'], {
      name: 'idx_billing_user_id',
    });

    await queryInterface.addIndex('ai_billing_records', ['model_id'], {
      name: 'idx_billing_model_id',
    });

    await queryInterface.addIndex('ai_billing_records', ['usage_id'], {
      name: 'idx_billing_usage_id',
      unique: true, // 一个使用记录对应一条计费记录
    });

    await queryInterface.addIndex('ai_billing_records', ['billing_status'], {
      name: 'idx_billing_status',
    });

    await queryInterface.addIndex('ai_billing_records', ['billing_time'], {
      name: 'idx_billing_time',
    });

    await queryInterface.addIndex('ai_billing_records', ['billing_cycle'], {
      name: 'idx_billing_cycle',
    });

    await queryInterface.addIndex('ai_billing_records', ['created_at'], {
      name: 'idx_billing_created_at',
    });

    // 复合索引：用户+计费周期（用于账单查询）
    await queryInterface.addIndex('ai_billing_records', ['user_id', 'billing_cycle'], {
      name: 'idx_billing_user_cycle',
    });

    // 复合索引：用户+状态（用于待支付查询）
    await queryInterface.addIndex('ai_billing_records', ['user_id', 'billing_status'], {
      name: 'idx_billing_user_status',
    });

    console.log('✅ ai_billing_records 表创建成功');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('ai_billing_records');
    console.log('✅ ai_billing_records 表删除成功');
  },
};

