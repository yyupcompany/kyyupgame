import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';

/**
 * 存储类型
 */
export enum StorageType {
  LOCAL = 'local',
  S3 = 's3',
  OSS = 'oss',
  COS = 'cos',
}

/**
 * 文件状态
 */
export enum FileStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  EXPIRED = 'expired',
}

export class FileStorage extends Model<
  InferAttributes<FileStorage>,
  InferCreationAttributes<FileStorage>
> {
  declare id: CreationOptional<number>;
  declare fileName: string;
  declare originalName: string;
  declare filePath: string;
  declare fileSize: number;
  declare fileType: string;
  declare storageType: CreationOptional<StorageType>;
  declare bucket: string | null;
  declare accessUrl: string;
  declare isPublic: CreationOptional<boolean>;
  declare uploaderId: ForeignKey<User['id']> | null;
  declare uploaderType: string | null;
  declare module: string | null;
  declare referenceId: string | null;
  declare referenceType: string | null;
  declare metadata: any | null;
  declare status: CreationOptional<FileStatus>;
  declare expireAt: Date | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly uploader?: User;
}

export const initFileStorage = (sequelize: Sequelize) => {
  FileStorage.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '文件ID',
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '文件名称',
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '原始文件名',
      },
      filePath: {
        type: DataTypes.STRING(512),
        allowNull: false,
        comment: '文件路径',
      },
      fileSize: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: '文件大小(字节)',
      },
      fileType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '文件类型',
      },
      storageType: {
        type: DataTypes.ENUM(...Object.values(StorageType)),
        allowNull: false,
        defaultValue: StorageType.LOCAL,
        comment: '存储类型: local, s3, oss, cos',
      },
      bucket: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '存储位置/存储桶',
      },
      accessUrl: {
        type: DataTypes.STRING(512),
        allowNull: false,
        comment: '文件访问URL',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否公开可访问',
      },
      uploaderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '上传者ID',
      },
      uploaderType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '上传者类型',
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '所属模块',
      },
      referenceId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '关联ID',
      },
      referenceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '关联类型',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '元数据(JSON)',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(FileStatus)),
        allowNull: false,
        defaultValue: FileStatus.ACTIVE,
        comment: '状态: active(正常), deleted(已删除), expired(已过期)',
      },
      expireAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '过期时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '更新时间',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '删除时间',
      },
    },
    {
      sequelize,
      tableName: 'file_storages',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return FileStorage;
};

export const initFileStorageAssociations = () => {
  FileStorage.belongsTo(User, {
    foreignKey: 'uploaderId',
    as: 'uploader',
  });
};
