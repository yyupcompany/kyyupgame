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
import { Kindergarten } from './kindergarten.model';

/**
 * 创意课程模型
 * 用于存储教师创建的AI生成课程
 */
export class CreativeCurriculum extends Model<
  InferAttributes<CreativeCurriculum>,
  InferCreationAttributes<CreativeCurriculum>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare creatorId: ForeignKey<User['id']>;
  declare name: string; // 课程名称
  declare description: string | null; // 课程描述
  declare domain: string; // 课程领域 (health, language, social, science, art)
  declare ageGroup: CreationOptional<string>; // 年龄段 (默认 3-6)
  declare htmlCode: string; // HTML代码
  declare cssCode: string; // CSS代码
  declare jsCode: string; // JavaScript代码
  declare schedule: CreationOptional<any>; // 课程表 (JSON格式)
  declare status: CreationOptional<string>; // 状态 (draft, published, archived)
  declare viewCount: CreationOptional<number>; // 浏览次数
  declare useCount: CreationOptional<number>; // 使用次数
  declare tags: CreationOptional<any>; // 标签 (JSON数组)
  declare thumbnail: CreationOptional<string>; // 缩略图URL
  declare isPublic: CreationOptional<boolean>; // 是否公开
  declare remark: string | null; // 备注

  // 互动多媒体课程字段
  declare media: CreationOptional<any>; // 媒体数据 (JSON: {images: [], video: {}})
  declare metadata: CreationOptional<any>; // 元数据 (JSON: {generatedAt, models, status, progress})
  declare courseAnalysis: CreationOptional<any>; // 课程分析结果 (JSON)
  declare curriculumType: CreationOptional<string>; // 课程类型 (standard, interactive)
  
  // 幻灯片课件字段
  declare slides: CreationOptional<any>; // 幻灯片数据 (JSON: 页面数组)
  declare originalPrompt: CreationOptional<string>; // 原始生成提示词
  declare editHistory: CreationOptional<any>; // 编辑历史 (JSON数组)
  declare themeConfig: CreationOptional<any>; // 主题配置 (JSON)
  declare totalScore: CreationOptional<number>; // 课件总分
  declare estimatedDuration: CreationOptional<number>; // 预计时长（分钟）

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly kindergarten?: Kindergarten;
  public readonly creator?: User;

  static initModel(sequelize: Sequelize): typeof CreativeCurriculum {
    CreativeCurriculum.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '课程ID',
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '幼儿园ID',
          references: {
            model: 'kindergartens',
            key: 'id',
          },
        },
        creatorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '创建者ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '课程名称',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '课程描述',
        },
        domain: {
          type: DataTypes.ENUM('health', 'language', 'social', 'science', 'art'),
          allowNull: false,
          comment: '课程领域',
        },
        ageGroup: {
          type: DataTypes.STRING(50),
          defaultValue: '3-6',
          comment: '年龄段',
        },
        htmlCode: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          comment: 'HTML代码',
        },
        cssCode: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          comment: 'CSS代码',
        },
        jsCode: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          comment: 'JavaScript代码',
        },
        schedule: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '课程表',
        },
        status: {
          type: DataTypes.ENUM('draft', 'published', 'archived'),
          defaultValue: 'draft',
          comment: '课程状态',
        },
        viewCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '浏览次数',
        },
        useCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          comment: '使用次数',
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '标签',
        },
        thumbnail: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '缩略图URL',
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: '是否公开',
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '备注',
        },
        media: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '媒体数据 (图片和视频)',
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '元数据 (生成时间、模型、状态、进度)',
        },
        courseAnalysis: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '课程分析结果',
        },
        curriculumType: {
          type: DataTypes.ENUM('standard', 'interactive', 'a2ui', 'slideshow'),
          defaultValue: 'standard',
          comment: '课程类型 (standard=标准, interactive=互动, a2ui=AI搭积木, slideshow=幻灯片)',
        },
        slides: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '幻灯片页面数据 (JSON数组)',
        },
        originalPrompt: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
          comment: '原始AI生成提示词（用于编辑和重新生成）',
        },
        editHistory: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '编辑历史记录 (JSON数组)',
        },
        themeConfig: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '课件主题配置 (颜色、字体等)',
        },
        totalScore: {
          type: DataTypes.INTEGER,
          defaultValue: 100,
          comment: '课件总分',
        },
        estimatedDuration: {
          type: DataTypes.INTEGER,
          defaultValue: 15,
          comment: '预计时长（分钟）',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'creative_curriculums',
        timestamps: true,
        paranoid: true,
        underscored: true, // 自动转换 camelCase 为 snake_case
        indexes: [
          {
            fields: ['kindergartenId'],
          },
          {
            fields: ['creatorId'],
          },
          {
            fields: ['domain'],
          },
          {
            fields: ['status'],
          },
        ],
      }
    );

    return CreativeCurriculum;
  }
}

export default CreativeCurriculum;

