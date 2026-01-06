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
 * 媒体内容类型枚举
 */
export enum MediaContentType {
  COPYWRITING = 'copywriting',  // 文案创作
  ARTICLE = 'article',          // 图文创作
  VIDEO = 'video',              // 视频创作
  TTS = 'tts',                  // 文字转语音
}

/**
 * 媒体平台枚举
 */
export enum MediaPlatform {
  WECHAT_MOMENTS = '微信朋友圈',
  WECHAT_OFFICIAL = '微信公众号',
  XIAOHONGSHU = '小红书',
  DOUYIN = '抖音',
  KUAISHOU = '快手',
  WEIBO = '微博',
  BILIBILI = 'B站',
  VIDEO_ACCOUNT = '视频号',
}

/**
 * 内容风格枚举
 */
export enum ContentStyle {
  WARM = 'warm',              // 温馨
  PROFESSIONAL = 'professional', // 专业
  LIVELY = 'lively',          // 活泼
  ELEGANT = 'elegant',        // 优雅
  HUMOROUS = 'humorous',      // 幽默
}

/**
 * 媒体内容模型
 */
export class MediaContent extends Model<
  InferAttributes<MediaContent>,
  InferCreationAttributes<MediaContent>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare type: MediaContentType;
  declare platform: string;
  declare content: string;
  declare preview: string;
  declare keywords: CreationOptional<string[]>;
  declare style: CreationOptional<ContentStyle>;
  declare settings: CreationOptional<Record<string, any>>;
  declare userId: ForeignKey<User['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

/**
 * 初始化媒体内容模型
 */
export function initMediaContent(sequelize: Sequelize): typeof MediaContent {
  MediaContent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '媒体内容ID',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '内容标题',
      },
      type: {
        type: DataTypes.ENUM(...Object.values(MediaContentType)),
        allowNull: false,
        comment: '内容类型',
      },
      platform: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '发布平台',
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        comment: '内容正文',
      },
      preview: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '内容预览',
      },
      keywords: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: '关键词列表',
      },
      style: {
        type: DataTypes.ENUM(...Object.values(ContentStyle)),
        allowNull: true,
        comment: '内容风格',
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: '其他设置',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建用户ID',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '删除时间（软删除）',
        field: 'deletedAt',
      },
    },
    {
      sequelize,
      tableName: 'media_contents',
      timestamps: true,
      paranoid: true,
      underscored: false,
      indexes: [
        {
          fields: ['userId'],
          name: 'idx_media_content_user_id',
        },
        {
          fields: ['type'],
          name: 'idx_media_content_type',
        },
        {
          fields: ['platform'],
          name: 'idx_media_content_platform',
        },
        {
          fields: ['createdAt'],
          name: 'idx_media_content_created_at',
        },
      ],
      comment: '媒体内容表',
    }
  );

  return MediaContent;
}

/**
 * 定义媒体内容关联关系
 */
export function defineMediaContentAssociations(): void {
  MediaContent.belongsTo(User, {
    foreignKey: 'userId',
    as: 'creator',
  });
}

