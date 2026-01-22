import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * SOP节点进度属性接口
 */
export interface SOPNodeProgressAttributes {
  id: number;
  instanceId: number;
  nodeOrder: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  feedbackData?: any; // JSON格式，存储用户反馈数据
  notes?: string;
  attachments?: any; // JSON格式，存储附件信息
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SOP节点进度创建属性接口
 */
export type SOPNodeProgressCreationAttributes = Optional<
  SOPNodeProgressAttributes,
  'id' | 'status' | 'startedAt' | 'completedAt' | 'feedbackData' | 'notes' | 'attachments' | 'createdAt' | 'updatedAt'
>;

/**
 * SOP节点进度模型
 * 记录实例中每个节点的完成进度
 */
export class SOPNodeProgress extends Model<SOPNodeProgressAttributes, SOPNodeProgressCreationAttributes> implements SOPNodeProgressAttributes {
  public id!: number;
  public instanceId!: number;
  public nodeOrder!: number;
  public status!: 'pending' | 'in_progress' | 'completed' | 'skipped';
  public startedAt?: Date;
  public completedAt?: Date;
  public feedbackData?: any;
  public notes?: string;
  public attachments?: any;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 初始化模型
   * @param sequelize Sequelize实例
   */
  static initModel(sequelize: Sequelize): void {
    SOPNodeProgress.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '进度ID'
        },
        instanceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'instance_id',
          comment: '实例ID'
        },
        nodeOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'node_order',
          comment: '节点顺序'
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'skipped'),
          defaultValue: 'pending',
          comment: '节点状态'
        },
        startedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'started_at',
          comment: '开始时间'
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_at',
          comment: '完成时间'
        },
        feedbackData: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'feedback_data',
          comment: '用户反馈数据'
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '备注'
        },
        attachments: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '附件（图片/文档等）'
        },
        createdAt: {
          type: DataTypes.DATE,
          field: 'created_at',
          comment: '创建时间'
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: 'updated_at',
          comment: '更新时间'
        }
      },
      {
        sequelize,
        tableName: 'sop_node_progress',
        timestamps: true,
        underscored: true,
        comment: 'SOP节点进度表'
      }
    );
  }

  /**
   * 设置模型关联
   */
  static associate(models: any): void {
    // SOPNodeProgress belongsTo SOPInstance
    SOPNodeProgress.belongsTo(models.SOPInstance, {
      foreignKey: 'instanceId',
      as: 'instance',
      onDelete: 'CASCADE'
    });
  }
}

export default SOPNodeProgress;
