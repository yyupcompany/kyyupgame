import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 节点内容数据接口
 */
export interface NodeContentData {
  text?: {
    title: string;
    content: string; // 富文本HTML
    summary: string;
  };
  videos?: Array<{
    id: string;
    url: string;
    title: string;
    duration: number;
    thumbnail: string;
    required: boolean;
  }>;
  images?: Array<{
    id: string;
    url: string;
    title: string;
    description: string;
  }>;
  audios?: Array<{
    id: string;
    url: string;
    title: string;
    duration: number;
  }>;
  documents?: Array<{
    id: string;
    url: string;
    title: string;
    type: string;
  }>;
}

/**
 * 反馈表单配置接口
 */
export interface FeedbackConfig {
  type: 'text' | 'rating' | 'checklist' | 'form';
  required: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
    options?: string[];
    required: boolean;
    placeholder?: string;
    validation?: object;
  }>;
}

/**
 * SOP模板节点属性接口
 */
export interface SOPTemplateNodeAttributes {
  id: number;
  templateId: number;
  nodeOrder: number;
  nodeName: string;
  nodeDescription?: string;
  contentType: 'text' | 'video' | 'image' | 'audio' | 'mixed';
  contentData?: NodeContentData;
  feedbackConfig?: FeedbackConfig;
  durationDays: number;
  isRequired: boolean;
  checklist?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SOP模板节点创建属性接口
 */
export type SOPTemplateNodeCreationAttributes = Optional<
  SOPTemplateNodeAttributes,
  'id' | 'nodeDescription' | 'contentType' | 'contentData' | 'feedbackConfig' | 'durationDays' | 'isRequired' | 'checklist' | 'createdAt' | 'updatedAt'
>;

/**
 * SOP模板节点模型
 * 用于存储SOP模板的各个节点配置
 */
export class SOPTemplateNode extends Model<SOPTemplateNodeAttributes, SOPTemplateNodeCreationAttributes> implements SOPTemplateNodeAttributes {
  public id!: number;
  public templateId!: number;
  public nodeOrder!: number;
  public nodeName!: string;
  public nodeDescription?: string;
  public contentType!: 'text' | 'video' | 'image' | 'audio' | 'mixed';
  public contentData?: NodeContentData;
  public feedbackConfig?: FeedbackConfig;
  public durationDays!: number;
  public isRequired!: boolean;
  public checklist?: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * 初始化模型
   * @param sequelize Sequelize实例
   */
  static initModel(sequelize: Sequelize): void {
    SOPTemplateNode.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '节点ID'
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'template_id',
          comment: '模板ID'
        },
        nodeOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'node_order',
          comment: '节点顺序（1,2,3...）'
        },
        nodeName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'node_name',
          comment: '节点名称'
        },
        nodeDescription: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'node_description',
          comment: '节点描述'
        },
        contentType: {
          type: DataTypes.ENUM('text', 'video', 'image', 'audio', 'mixed'),
          defaultValue: 'mixed',
          field: 'content_type',
          comment: '内容类型'
        },
        contentData: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'content_data',
          comment: '内容数据（文本/视频/图片/音频URL等）'
        },
        feedbackConfig: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'feedback_config',
          comment: '反馈表单配置'
        },
        durationDays: {
          type: DataTypes.INTEGER,
          defaultValue: 7,
          field: 'duration_days',
          comment: '预计完成天数'
        },
        isRequired: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'is_required',
          comment: '是否必需完成'
        },
        checklist: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '检查清单配置'
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
        tableName: 'sop_template_nodes',
        timestamps: true,
        underscored: true,
        comment: 'SOP模板节点表'
      }
    );
  }

  /**
   * 设置模型关联
   */
  static associate(models: any): void {
    // SOPTemplateNode belongsTo SOPTemplate
    SOPTemplateNode.belongsTo(models.SOPTemplate, {
      foreignKey: 'templateId',
      as: 'template',
      onDelete: 'CASCADE'
    });
  }
}

export default SOPTemplateNode;
