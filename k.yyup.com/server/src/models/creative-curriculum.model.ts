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
          allowNull: false,
          comment: 'HTML代码',
        },
        cssCode: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
          comment: 'CSS代码',
        },
        jsCode: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
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
          type: DataTypes.ENUM('standard', 'interactive'),
          defaultValue: 'standard',
          comment: '课程类型',
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

