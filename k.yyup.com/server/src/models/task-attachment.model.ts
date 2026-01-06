import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// 任务附件属性接口
export interface TaskAttachmentAttributes {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  fileUrl?: string;
  fileSize: number;
  fileType?: string;
  fileExtension?: string;
  uploaderId: number;
  uploadTime: Date;
  description?: string;
  status: 'active' | 'deleted';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// 创建任务附件时的可选属性
export interface TaskAttachmentCreationAttributes
  extends Optional<TaskAttachmentAttributes, 'id' | 'fileUrl' | 'fileType' | 'fileExtension' | 'description' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

// 任务附件模型类
export class TaskAttachment extends Model<TaskAttachmentAttributes, TaskAttachmentCreationAttributes>
  implements TaskAttachmentAttributes {
  public id!: number;
  public taskId!: number;
  public fileName!: string;
  public filePath!: string;
  public fileUrl?: string;
  public fileSize!: number;
  public fileType?: string;
  public fileExtension?: string;
  public uploaderId!: number;
  public uploadTime!: Date;
  public description?: string;
  public status!: 'active' | 'deleted';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // 关联定义
  public static associate(models: any): void {
    // 关联到任务
    TaskAttachment.belongsTo(models.Todo, {
      foreignKey: 'taskId',
      as: 'task',
    });

    // 关联到上传者
    TaskAttachment.belongsTo(models.User, {
      foreignKey: 'uploaderId',
      as: 'uploader',
    });
  }

  // 初始化模型
  public static initModel(sequelize: Sequelize): typeof TaskAttachment {
    TaskAttachment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        taskId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'task_id',
          comment: '任务ID',
        },
        fileName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'file_name',
          comment: '文件名',
        },
        filePath: {
          type: DataTypes.STRING(500),
          allowNull: false,
          field: 'file_path',
          comment: '文件路径',
        },
        fileUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'file_url',
          comment: '文件访问URL',
        },
        fileSize: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'file_size',
          comment: '文件大小（字节）',
        },
        fileType: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'file_type',
          comment: '文件MIME类型',
        },
        fileExtension: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: 'file_extension',
          comment: '文件扩展名',
        },
        uploaderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'uploader_id',
          comment: '上传者ID',
        },
        uploadTime: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'upload_time',
          comment: '上传时间',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '附件描述',
        },
        status: {
          type: DataTypes.ENUM('active', 'deleted'),
          allowNull: false,
          defaultValue: 'active',
          comment: '状态',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          comment: '软删除时间',
        },
      },
      {
        sequelize,
        tableName: 'task_attachments',
        timestamps: true,
        paranoid: true,
        underscored: true,
        comment: '任务附件表',
      }
    );

    return TaskAttachment;
  }
}

export default TaskAttachment;

