import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * SOP模板属性接口
 */
export interface SOPTemplateAttributes {
  id: number;
  name: string;
  type: 'course' | 'sales' | 'activity';
  description?: string;
  icon?: string;
  color?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy?: number;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SOP模板创建属性接口
 */
export type SOPTemplateCreationAttributes = Optional<
  SOPTemplateAttributes,
  'id' | 'description' | 'icon' | 'color' | 'isSystem' | 'isActive' | 'sortOrder' | 'createdBy' | 'createdAt' | 'updatedAt'
>;

/**
 * SOP模板模型
 * 用于存储SOP模板的基本信息
 */
export class SOPTemplate extends Model<SOPTemplateAttributes, SOPTemplateCreationAttributes> implements SOPTemplateAttributes {
  public id!: number;
  public name!: string;
  public type!: 'course' | 'sales' | 'activity';
  public description?: string;
  public icon?: string;
  public color?: string;
  public isSystem!: boolean;
  public isActive!: boolean;
  public sortOrder!: number;
  public createdBy?: number;
  public tenantId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 初始化模型
   * @param sequelize Sequelize实例
   */
  static initModel(sequelize: Sequelize): void {
    SOPTemplate.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '模板ID'
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '模板名称'
        },
        type: {
          type: DataTypes.ENUM('course', 'sales', 'activity'),
          allowNull: false,
          comment: '模板类型：课程/销售/活动'
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '模板描述'
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '图标名称'
        },
        color: {
          type: DataTypes.STRING(20),
          defaultValue: '#409EFF',
          comment: '颜色标识'
        },
        isSystem: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_system',
          comment: '是否系统模板（系统模板不可删除）'
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'is_active',
          comment: '是否启用'
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'sort_order',
          comment: '排序顺序'
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'created_by',
          comment: '创建者ID'
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
        tableName: 'sop_templates',
        timestamps: true,
        underscored: true,
        comment: 'SOP模板表'
      }
    );
  }

  /**
   * 设置模型关联
   */
  static associate(models: any): void {
    // SOPTemplate hasMany SOPTemplateNode
    SOPTemplate.hasMany(models.SOPTemplateNode, {
      foreignKey: 'templateId',
      as: 'nodes',
      onDelete: 'CASCADE'
    });

    // SOPTemplate hasMany SOPInstance
    SOPTemplate.hasMany(models.SOPInstance, {
      foreignKey: 'templateId',
      as: 'instances',
      onDelete: 'RESTRICT'
    });

    // SOPTemplate belongsTo User (创建者)
    SOPTemplate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

export default SOPTemplate;
