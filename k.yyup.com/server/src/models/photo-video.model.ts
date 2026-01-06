import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 视频状态
 */
export enum VideoStatus {
  PENDING = 'pending',       // 待处理
  PROCESSING = 'processing', // 处理中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
}

/**
 * 生成视频Model
 */
export class PhotoVideo extends Model<
  InferAttributes<PhotoVideo>,
  InferCreationAttributes<PhotoVideo>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare studentId: number | null;
  declare videoUrl: string | null;
  declare coverUrl: string | null;

  // 视频信息
  declare title: string | null;
  declare duration: CreationOptional<number>;
  declare photoCount: CreationOptional<number>;
  declare musicName: string | null;

  // 生成参数
  declare dateRangeStart: Date | null;
  declare dateRangeEnd: Date | null;
  declare templateType: string | null;

  // 任务状态
  declare status: CreationOptional<VideoStatus>;
  declare progress: CreationOptional<number>;
  declare errorMessage: string | null;

  // 统计
  declare viewCount: CreationOptional<number>;
  declare downloadCount: CreationOptional<number>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare completedAt: Date | null;
  declare readonly updatedAt: CreationOptional<Date>;

  public static initModel(sequelize: Sequelize): typeof PhotoVideo {
    PhotoVideo.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'user_id',
          comment: '创建用户ID',
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'student_id',
          comment: '关联学生ID',
        },
        videoUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'video_url',
          comment: '视频URL',
        },
        coverUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'cover_url',
          comment: '封面URL',
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '视频标题',
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '时长（秒）',
        },
        photoCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'photo_count',
          comment: '照片数量',
        },
        musicName: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'music_name',
          comment: '配乐名称',
        },
        dateRangeStart: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'date_range_start',
          comment: '照片时间范围开始',
        },
        dateRangeEnd: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'date_range_end',
          comment: '照片时间范围结束',
        },
        templateType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'template_type',
          comment: '模板类型',
        },
        status: {
          type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
          comment: '任务状态',
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '渲染进度(0-100)',
        },
        errorMessage: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'error_message',
          comment: '错误信息',
        },
        viewCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'view_count',
          comment: '观看次数',
        },
        downloadCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'download_count',
          comment: '下载次数',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'completed_at',
          comment: '完成时间',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'photo_videos',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
      }
    );

    return PhotoVideo;
  }
}





