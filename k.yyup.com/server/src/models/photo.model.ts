import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 照片可见性
 */
export enum PhotoVisibility {
  PUBLIC = 'public',   // 公开
  CLASS = 'class',     // 班级内
  PRIVATE = 'private', // 私密
}

/**
 * 照片状态
 */
export enum PhotoStatus {
  PENDING = 'pending',       // 待处理
  TAGGED = 'tagged',         // 已标记
  PUBLISHED = 'published',   // 已发布
  ARCHIVED = 'archived',     // 已归档
}

/**
 * 照片Model
 */
export class Photo extends Model<InferAttributes<Photo>, InferCreationAttributes<Photo>> {
  declare id: CreationOptional<number>;
  declare fileUrl: string;
  declare thumbnailUrl: string | null;
  declare originalName: string | null;
  declare fileSize: CreationOptional<number>;
  declare width: CreationOptional<number>;
  declare height: CreationOptional<number>;

  // 上传信息
  declare uploadUserId: number;
  declare uploadTime: CreationOptional<Date>;
  declare kindergartenId: number | null;
  declare classId: number | null;

  // 活动信息
  declare activityType: string | null;
  declare activityName: string | null;
  declare shootDate: Date | null;
  declare description: string | null;

  // 分类和标签
  declare category: string | null;
  declare tags: string[] | null;
  declare caption: string | null;

  // AI识别
  declare faceCount: CreationOptional<number>;
  declare aiProcessed: CreationOptional<boolean>;
  declare qualityScore: CreationOptional<number>;

  // 权限与状态
  declare visibility: CreationOptional<PhotoVisibility>;
  declare status: CreationOptional<PhotoStatus>;
  declare isRecommended: CreationOptional<boolean>;
  declare recommendedBy: number | null;
  declare recommendedAt: Date | null;

  // 统计
  declare viewCount: CreationOptional<number>;
  declare downloadCount: CreationOptional<number>;
  declare likeCount: CreationOptional<number>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // 关联
  public readonly students?: any[];
  public readonly uploader?: any;

  public static initModel(sequelize: Sequelize): typeof Photo {
    Photo.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '照片ID',
        },
        fileUrl: {
          type: DataTypes.STRING(500),
          allowNull: false,
          field: 'file_url',
          comment: 'OSS照片URL',
        },
        thumbnailUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'thumbnail_url',
          comment: '缩略图URL',
        },
        originalName: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'original_name',
          comment: '原始文件名',
        },
        fileSize: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          field: 'file_size',
          comment: '文件大小(字节)',
        },
        width: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '图片宽度',
        },
        height: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: '图片高度',
        },
        uploadUserId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          field: 'upload_user_id',
          comment: '上传老师ID',
        },
        uploadTime: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'upload_time',
          comment: '上传时间',
        },
        kindergartenId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'kindergarten_id',
          comment: '幼儿园ID',
        },
        classId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'class_id',
          comment: '班级ID',
        },
        activityType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'activity_type',
          comment: '活动类型',
        },
        activityName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'activity_name',
          comment: '活动名称',
        },
        shootDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'shoot_date',
          comment: '拍摄日期',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '照片描述',
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '照片分类',
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '照片标签（JSON数组）',
        },
        caption: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '照片说明/标题',
        },
        faceCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'face_count',
          comment: '检测到的人脸数量',
        },
        aiProcessed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'ai_processed',
          comment: '是否已AI处理',
        },
        qualityScore: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'quality_score',
          comment: 'AI质量评分(0-100)',
        },
        visibility: {
          type: DataTypes.ENUM('public', 'class', 'private'),
          allowNull: false,
          defaultValue: 'class',
          comment: '可见性',
        },
        status: {
          type: DataTypes.ENUM('pending', 'tagged', 'published', 'archived'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '状态',
        },
        isRecommended: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_recommended',
          comment: '是否推荐展示',
        },
        recommendedBy: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'recommended_by',
          comment: '推荐人ID',
        },
        recommendedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'recommended_at',
          comment: '推荐时间',
        },
        viewCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'view_count',
          comment: '浏览次数',
        },
        downloadCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'download_count',
          comment: '下载次数',
        },
        likeCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'like_count',
          comment: '点赞数',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          comment: '软删除',
        },
      },
      {
        sequelize,
        tableName: 'photos',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored: true,
      }
    );

    return Photo;
  }
}





