/**
 * 字段模板数据模型
 * 
 * 用于保存用户常用的字段组合，方便快速填写
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 字段模板属性接口
 */
interface FieldTemplateAttributes {
  id: number;
  name: string;
  description?: string;
  entity_type: string;
  field_values: Record<string, any>;
  user_id: number;
  is_public: boolean;
  usage_count: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * 字段模板创建属性接口
 */
interface FieldTemplateCreationAttributes extends Optional<FieldTemplateAttributes, 'id' | 'description' | 'is_public' | 'usage_count' | 'created_at' | 'updated_at'> {}

/**
 * 字段模板模型类
 */
class FieldTemplate extends Model<FieldTemplateAttributes, FieldTemplateCreationAttributes> implements FieldTemplateAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public entity_type!: string;
  public field_values!: Record<string, any>;
  public user_id!: number;
  public is_public!: boolean;
  public usage_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

/**
 * 初始化字段模板模型
 */
export function initFieldTemplate(sequelize: Sequelize) {
  FieldTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '模板ID'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '模板名称'
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '模板描述'
      },
      entity_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '实体类型（students, teachers, classes等）'
      },
      field_values: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '字段值JSON对象'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建用户ID'
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否公开（公开模板所有用户可见）'
      },
      usage_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
        comment: '创建时间'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        comment: '更新时间'
      }
    },
    {
      sequelize,
      tableName: 'field_templates',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'idx_user_id',
          fields: ['user_id']
        },
        {
          name: 'idx_entity_type',
          fields: ['entity_type']
        },
        {
          name: 'idx_is_public',
          fields: ['is_public']
        }
      ],
      comment: '字段模板表'
    }
  );
}

export default FieldTemplate;

