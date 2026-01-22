import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * SOP实例属性接口
 */
export interface SOPInstanceAttributes {
  id: number;
  templateId: number;
  teacherId: number;
  customerId?: number;
  instanceName?: string;
  currentNodeOrder: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startDate?: Date;
  endDate?: Date;
  customNodes?: any; // JSON格式，存储自定义的节点修改
  notes?: string;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SOP实例创建属性接口
 */
export type SOPInstanceCreationAttributes = Optional<
  SOPInstanceAttributes,
  'id' | 'customerId' | 'instanceName' | 'currentNodeOrder' | 'status' | 'startDate' | 'endDate' | 'customNodes' | 'notes' | 'createdAt' | 'updatedAt'
>;

/**
 * SOP实例模型
 * 教师基于模板创建的具体实例
 */
export class SOPInstance extends Model<SOPInstanceAttributes, SOPInstanceCreationAttributes> implements SOPInstanceAttributes {
  public id!: number;
  public templateId!: number;
  public teacherId!: number;
  public customerId?: number;
  public instanceName?: string;
  public currentNodeOrder!: number;
  public status!: 'in_progress' | 'completed' | 'abandoned';
  public startDate?: Date;
  public endDate?: Date;
  public customNodes?: any;
  public notes?: string;
  public tenantId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 初始化模型
   * @param sequelize Sequelize实例
   */
  static initModel(sequelize: Sequelize): void {
    SOPInstance.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '实例ID'
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'template_id',
          comment: '模板ID'
        },
        teacherId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'teacher_id',
          comment: '教师ID（创建者）'
        },
        customerId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'customer_id',
          comment: '关联客户ID（可选）'
        },
        instanceName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'instance_name',
          comment: '实例名称'
        },
        currentNodeOrder: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
          field: 'current_node_order',
          comment: '当前节点顺序'
        },
        status: {
          type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
          defaultValue: 'in_progress',
          comment: '实例状态'
        },
        startDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'start_date',
          comment: '开始日期'
        },
        endDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'end_date',
          comment: '结束日期'
        },
        customNodes: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'custom_nodes',
          comment: '自定义节点修改（覆盖模板节点）'
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '备注'
        },
        tenantId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'tenant_id',
          comment: '租户ID'
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
        tableName: 'sop_instances',
        timestamps: true,
        underscored: true,
        comment: 'SOP实例表'
      }
    );
  }

  /**
   * 设置模型关联
   */
  static associate(models: any): void {
    // SOPInstance belongsTo SOPTemplate
    SOPInstance.belongsTo(models.SOPTemplate, {
      foreignKey: 'templateId',
      as: 'template',
      onDelete: 'RESTRICT'
    });

    // SOPInstance belongsTo User (teacher)
    SOPInstance.belongsTo(models.User, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });

    // SOPInstance hasMany SOPNodeProgress
    SOPInstance.hasMany(models.SOPNodeProgress, {
      foreignKey: 'instanceId',
      as: 'nodeProgress',
      onDelete: 'CASCADE'
    });
  }
}

export default SOPInstance;
