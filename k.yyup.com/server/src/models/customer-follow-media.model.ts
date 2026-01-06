import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';

export interface CustomerFollowMediaAttributes {
  id: number;
  followRecordId: number;
  mediaType: string; // 'image', 'video', 'audio', 'document'
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  uploadedBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerFollowMediaCreationAttributes = Optional<CustomerFollowMediaAttributes, 'id' | 'description'>;

export class CustomerFollowMedia extends Model<CustomerFollowMediaAttributes, CustomerFollowMediaCreationAttributes> implements CustomerFollowMediaAttributes {
  public id!: number;
  public followRecordId!: number;
  public mediaType!: string;
  public fileName!: string;
  public filePath!: string;
  public fileSize!: number;
  public mimeType!: string;
  public description!: string | null;
  public uploadedBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly uploader?: User;

  static initModel(sequelize: Sequelize): void {
    CustomerFollowMedia.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '媒体文件ID'
        },
        followRecordId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'follow_record_id',
          comment: '跟进记录ID',
          references: {
            model: 'customer_follow_records',
            key: 'id'
          }
        },
        mediaType: {
          type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
          allowNull: false,
          field: 'media_type',
          comment: '媒体类型'
        },
        fileName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'file_name',
          comment: '文件名'
        },
        filePath: {
          type: DataTypes.STRING(500),
          allowNull: false,
          field: 'file_path',
          comment: '文件路径'
        },
        fileSize: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'file_size',
          comment: '文件大小(字节)'
        },
        mimeType: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'mime_type',
          comment: 'MIME类型'
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '文件描述'
        },
        uploadedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'uploaded_by',
          comment: '上传者ID',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          comment: '创建时间'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
          comment: '更新时间'
        }
      },
      {
        sequelize,
        tableName: 'customer_follow_media',
        timestamps: true,
        underscored: true,
        comment: '客户跟进媒体文件表'
      }
    );
  }

  static initAssociations(): void {
    CustomerFollowMedia.belongsTo(User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });
  }
}

export default CustomerFollowMedia;
