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
 * 视频项目状态枚举
 */
export enum VideoProjectStatus {
  DRAFT = 'draft',                    // 草稿
  GENERATING_SCRIPT = 'generating_script',  // 生成脚本中
  GENERATING_AUDIO = 'generating_audio',    // 生成配音中
  GENERATING_VIDEO = 'generating_video',    // 生成视频中
  EDITING = 'editing',                // 剪辑中
  COMPLETED = 'completed',            // 已完成
  FAILED = 'failed',                  // 失败
}

/**
 * 视频平台枚举
 */
export enum VideoPlatform {
  DOUYIN = 'douyin',              // 抖音
  KUAISHOU = 'kuaishou',          // 快手
  WECHAT_VIDEO = 'wechat_video',  // 视频号
  XIAOHONGSHU = 'xiaohongshu',    // 小红书
  BILIBILI = 'bilibili',          // B站
}

/**
 * 视频类型枚举
 */
export enum VideoType {
  ENROLLMENT = 'enrollment',      // 招生宣传
  ACTIVITY = 'activity',          // 活动推广
  COURSE = 'course',              // 课程展示
  ENVIRONMENT = 'environment',    // 环境介绍
  TEACHER = 'teacher',            // 教师风采
  STUDENT = 'student',            // 学生作品
}

/**
 * 视频风格枚举
 */
export enum VideoStyle {
  WARM = 'warm',                  // 温馨
  PROFESSIONAL = 'professional',  // 专业
  LIVELY = 'lively',              // 活泼
  ELEGANT = 'elegant',            // 优雅
}

/**
 * 视频场景接口
 */
export interface VideoScene {
  sceneNumber: number;
  duration: number;
  sceneTitle?: string; // 场景标题
  visualDescription: string; // 详细的画面描述（至少100字）
  narration: string; // 旁白文案
  subtitle?: string; // 字幕文本
  cameraAngle: string; // 镜头角度
  cameraMovement: string; // 镜头运动
  transition: string; // 转场效果
  emotionalTone?: string; // 情感基调
  keyVisualElements?: string[]; // 关键视觉元素
}

/**
 * 视频脚本接口
 */
export interface VideoScript {
  title: string;
  description: string;
  totalDuration: number;
  targetEmotion?: string; // 目标情绪
  coreMessage?: string; // 核心信息
  scenes: VideoScene[];
  bgmSuggestion: string;
  colorTone: string;
  visualStyle?: string; // 视觉风格
  hashtags: string[];
  callToAction?: string; // 行动号召
}

/**
 * 场景音频接口
 */
export interface SceneAudio {
  sceneNumber: number;
  audioPath: string;
  audioUrl: string;
  duration: number;
  narration: string;
}

/**
 * 场景视频接口
 */
export interface SceneVideo {
  sceneNumber: number;
  videoPath: string;
  videoUrl: string;
  duration: number;
  taskId: string;
  thumbnailUrl: string;
}

/**
 * 视频项目模型
 */
export class VideoProject extends Model<
  InferAttributes<VideoProject>,
  InferCreationAttributes<VideoProject>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare title: string;
  declare description: string | null;
  declare platform: VideoPlatform;
  declare videoType: VideoType;
  declare duration: number;
  declare style: VideoStyle;
  declare status: VideoProjectStatus;
  declare topic: string;
  declare keyPoints: string | null;
  declare targetAudience: string;
  declare voiceStyle: string;
  
  // JSON字段
  declare scriptData: VideoScript | null;
  declare audioData: SceneAudio[] | null;
  declare videoData: SceneVideo[] | null;
  declare sceneVideos: string | null;  // 场景视频JSON字符串

  // 最终视频
  declare finalVideoUrl: string | null;
  declare finalVideoPath: string | null;
  declare finalVideoId: string | null;  // VOD视频ID
  declare coverImageUrl: string | null;
  
  // 元数据
  declare metadata: Record<string, any> | null;

  // 错误信息
  declare errorMessage: string | null;

  // 任务进度 (0-100)
  declare progress: CreationOptional<number>;

  // 进度消息
  declare progressMessage: string | null;

  // 完成时间
  declare completedAt: Date | null;

  // 是否已通知用户
  declare notified: CreationOptional<boolean>;

  // 时间戳
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // 关联
  declare user?: User;
}

/**
 * 初始化视频项目模型
 */
export function initVideoProjectModel(sequelize: Sequelize): typeof VideoProject {
  VideoProject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '视频项目ID',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'userId', // 显式指定数据库字段名为驼峰
        comment: '用户ID',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '视频标题',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '视频描述',
      },
      platform: {
        type: DataTypes.ENUM(...Object.values(VideoPlatform)),
        allowNull: false,
        comment: '发布平台',
      },
      videoType: {
        type: DataTypes.ENUM(...Object.values(VideoType)),
        allowNull: false,
        field: 'videoType',
        comment: '视频类型',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: '视频时长（秒）',
      },
      style: {
        type: DataTypes.ENUM(...Object.values(VideoStyle)),
        allowNull: false,
        defaultValue: VideoStyle.WARM,
        comment: '视频风格',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(VideoProjectStatus)),
        allowNull: false,
        defaultValue: VideoProjectStatus.DRAFT,
        comment: '项目状态',
      },
      topic: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '视频主题',
      },
      keyPoints: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'keyPoints',
        comment: '关键信息点',
      },
      targetAudience: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'parents',
        field: 'targetAudience',
        comment: '目标受众',
      },
      voiceStyle: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'alloy',
        field: 'voiceStyle',
        comment: '配音风格',
      },
      scriptData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'scriptData',
        comment: '脚本数据',
      },
      audioData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'audioData',
        comment: '音频数据',
      },
      videoData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'videoData',
        comment: '视频数据',
      },
      sceneVideos: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'sceneVideos',
        comment: '场景视频JSON字符串',
      },
      finalVideoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'finalVideoUrl',
        comment: '最终视频URL',
      },
      finalVideoPath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'finalVideoPath',
        comment: '最终视频路径',
      },
      finalVideoId: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'finalVideoId',
        comment: 'VOD视频ID',
      },
      coverImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'coverImageUrl',
        comment: '封面图URL',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '元数据',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'errorMessage',
        comment: '错误信息',
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'progress',
        comment: '任务进度(0-100)',
      },
      progressMessage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'progressMessage',
        comment: '进度消息',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completedAt',
        comment: '完成时间',
      },
      notified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'notified',
        comment: '是否已通知用户',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'createdAt',
        comment: '创建时间',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt',
        comment: '更新时间',
      },
    },
    {
      sequelize,
      tableName: 'video_projects',
      timestamps: true,
      underscored: false, // 使用驼峰命名，不转换为下划线
      indexes: [
        {
          name: 'idx_user_id',
          fields: ['userId'],
        },
        {
          name: 'idx_status',
          fields: ['status'],
        },
        {
          name: 'idx_created_at',
          fields: ['createdAt'],
        },
      ],
      comment: '视频项目表',
    }
  );

  return VideoProject;
}

export default VideoProject;

