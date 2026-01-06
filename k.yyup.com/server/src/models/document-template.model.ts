import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 变量配置接口
export interface VariableConfig {
  [key: string]: {
    label: string;
    type: string;
    source: string;
    required: boolean;
    default?: any;
    description?: string;
  };
}

// 文档模板属性接口
export interface DocumentTemplateAttributes {
  id: number;
  code: string;
  name: string;
  category: string;
  subCategory?: string;
  contentType: string;
  templateContent: string;
  variables?: VariableConfig;
  defaultValues?: Record<string, any>;
  frequency?: string;
  priority: string;
  inspectionTypeIds?: number[];
  relatedTemplateIds?: number[];
  isDetailed: boolean;
  lineCount?: number;
  estimatedFillTime?: number;
  isActive: boolean;
  version: string;
  useCount: number;
  lastUsedAt?: Date;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface DocumentTemplateCreationAttributes extends Optional<DocumentTemplateAttributes, 'id' | 'version' | 'isActive' | 'useCount' | 'isDetailed'> {}

// 文档模板模型
class DocumentTemplate extends Model<DocumentTemplateAttributes, DocumentTemplateCreationAttributes> 
  implements DocumentTemplateAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public category!: string;
  public subCategory?: string;
  public contentType!: string;
  public templateContent!: string;
  public variables?: VariableConfig;
  public defaultValues?: Record<string, any>;
  public frequency?: string;
  public priority!: string;
  public inspectionTypeIds?: number[];
  public relatedTemplateIds?: number[];
  public isDetailed!: boolean;
  public lineCount?: number;
  public estimatedFillTime?: number;
  public isActive!: boolean;
  public version!: string;
  public useCount!: number;
  public lastUsedAt?: Date;
  public createdBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 初始化模型
  static initModel(sequelize: Sequelize): typeof DocumentTemplate {
    DocumentTemplate.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          comment: '模板编号',
        },
        name: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '模板名称',
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '分类',
        },
        subCategory: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'sub_category',
          comment: '子分类',
        },
        contentType: {
          type: DataTypes.ENUM('markdown', 'html', 'json'),
          allowNull: false,
          defaultValue: 'markdown',
          field: 'content_type',
          comment: '内容类型',
        },
        templateContent: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
          field: 'template_content',
          comment: '模板内容',
        },
        variables: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '变量配置',
        },
        defaultValues: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'default_values',
          comment: '默认值',
        },
        frequency: {
          type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'as_needed'),
          allowNull: true,
          comment: '使用频率',
        },
        priority: {
          type: DataTypes.ENUM('required', 'recommended', 'optional'),
          allowNull: false,
          defaultValue: 'optional',
          comment: '优先级',
        },
        inspectionTypeIds: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'inspection_type_ids',
          comment: '关联检查类型IDs',
        },
        relatedTemplateIds: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'related_template_ids',
          comment: '相关模板IDs',
        },
        isDetailed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_detailed',
          comment: '是否详细版',
        },
        lineCount: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'line_count',
          comment: '行数',
        },
        estimatedFillTime: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'estimated_fill_time',
          comment: '预计填写时间(分钟)',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active',
          comment: '是否启用',
        },
        version: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: '1.0',
          comment: '版本号',
        },
        useCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'use_count',
          comment: '使用次数',
        },
        lastUsedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_used_at',
          comment: '最后使用时间',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'created_by',
          comment: '创建人ID',
        },
      },
      {
        sequelize,
        tableName: 'document_templates',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['code'], unique: true },
          { fields: ['category'] },
          { fields: ['priority'] },
          { fields: ['is_active'] },
          { fields: ['use_count'] },
        ],
      }
    );

    return DocumentTemplate;
  }
}

export default DocumentTemplate;

