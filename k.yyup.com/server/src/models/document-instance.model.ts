import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

/**
 * 文档实例属性接口
 */
export interface DocumentInstanceAttributes {
  id: number;
  templateId: number;
  inspectionTaskId?: number;
  title: string;
  documentNumber?: string;
  content?: string;
  filledData?: Record<string, any>;
  status: string;
  completionRate: number;
  deadline?: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: number;
  assignedTo?: number;
  reviewedBy?: number;
  reviewers?: number[];
  reviewComments?: string;
  attachments?: any[];
  version: number;
  parentVersionId?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 创建时的可选属性
 */
interface DocumentInstanceCreationAttributes extends Optional<DocumentInstanceAttributes, 'id' | 'version' | 'status' | 'completionRate'> {}

/**
 * 文档实例模型
 */
class DocumentInstance extends Model<DocumentInstanceAttributes, DocumentInstanceCreationAttributes>
  implements DocumentInstanceAttributes {
  public id!: number;
  public templateId!: number;
  public inspectionTaskId?: number;
  public title!: string;
  public documentNumber?: string;
  public content?: string;
  public filledData?: Record<string, any>;
  public status!: string;
  public completionRate!: number;
  public deadline?: Date;
  public submittedAt?: Date;
  public reviewedAt?: Date;
  public startedAt?: Date;
  public completedAt?: Date;
  public createdBy?: number;
  public assignedTo?: number;
  public reviewedBy?: number;
  public reviewers?: number[];
  public reviewComments?: string;
  public attachments?: any[];
  public version!: number;
  public parentVersionId?: number;
  public tags?: string[];
  public metadata?: Record<string, any>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  static initModel(sequelize: Sequelize): typeof DocumentInstance {
    DocumentInstance.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'template_id',
          comment: '关联的模板ID'
        },
        inspectionTaskId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'inspection_task_id',
          comment: '关联的检查任务ID'
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
          comment: '文档标题'
        },
        documentNumber: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: true,
          field: 'document_number',
          comment: '文档编号'
        },
        content: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          comment: '文档内容'
        },
        filledData: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'filled_data',
          comment: '填写的数据（JSON格式）'
        },
        status: {
          type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived'),
          allowNull: false,
          defaultValue: 'draft',
          comment: '状态'
        },
        completionRate: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
          field: 'completion_rate',
          comment: '完成率（0-100）'
        },
        deadline: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '截止时间'
        },
        submittedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'submitted_at',
          comment: '提交时间'
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'reviewed_at',
          comment: '审核时间'
        },
        startedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'started_at',
          comment: '开始填写时间'
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_at',
          comment: '完成时间'
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'created_by',
          comment: '创建人ID'
        },
        assignedTo: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'assigned_to',
          comment: '分配给（负责人ID）'
        },
        reviewedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'reviewed_by',
          comment: '审核人ID'
        },
        reviewers: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '审核人ID列表（JSON格式）'
        },
        reviewComments: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'review_comments',
          comment: '审核意见'
        },
        attachments: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '附件列表（JSON格式）'
        },
        version: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: '版本号'
        },
        parentVersionId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'parent_version_id',
          comment: '父版本ID'
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '标签（JSON数组）'
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '元数据（JSON格式）'
        }
      },
      {
        sequelize,
        tableName: 'document_instances',
        timestamps: true,
        paranoid: true, // 启用软删除
        underscored: true,
        indexes: [
          { fields: ['template_id'] },
          { fields: ['inspection_task_id'] },
          { fields: ['status'] },
          { fields: ['created_by'] },
          { fields: ['assigned_to'] },
          { fields: ['deadline'] },
          { fields: ['document_number'], unique: true }
        ]
      }
    );

    return DocumentInstance;
  }
}

export default DocumentInstance;

