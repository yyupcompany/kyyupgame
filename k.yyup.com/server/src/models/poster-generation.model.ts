import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { Kindergarten } from './kindergarten.model';
import { PosterTemplate } from './poster-template.model';
import { PosterElement } from './poster-element.model';

export interface PosterGenerationAttributes {
  id: number;
  name: string;
  templateId: number;
  posterUrl: string;
  thumbnailUrl: string | null;
  status: number;
  remark: string | null;
  creatorId: number;
  updaterId: number;
  parameters: string;
  imageUrl: string;
  shareCount: number;
  downloadCount: number;
  viewCount: number;
  kindergartenId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type PosterGenerationCreationAttributes = Optional<PosterGenerationAttributes, 'id' | 'thumbnailUrl' | 'status' | 'remark' | 'parameters' | 'imageUrl' | 'shareCount' | 'downloadCount' | 'viewCount' | 'kindergartenId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class PosterGeneration extends Model<PosterGenerationAttributes, PosterGenerationCreationAttributes> implements PosterGenerationAttributes {
  public id!: number;
  public name!: string;
  public templateId!: number;
  public posterUrl!: string;
  public thumbnailUrl!: string | null;
  public status!: number;
  public remark!: string | null;
  public creatorId!: number;
  public updaterId!: number;
  public parameters!: string;
  public imageUrl!: string;
  public shareCount!: number;
  public downloadCount!: number;
  public viewCount!: number;
  public kindergartenId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly creator?: User;
  public readonly template?: PosterTemplate;
  public readonly elements?: PosterElement[];

  public getStatusText(): string {
    const statusMap: Record<number, string> = {
      0: '已删除',
      1: '正常'
    };
    return statusMap[this.status] || '未知状态';
  }

  public getPosterInfo(): { posterUrl: string; thumbnailUrl: string | null } {
    return {
      posterUrl: this.posterUrl,
      thumbnailUrl: this.thumbnailUrl
    };
  }

  static initModel(sequelize: Sequelize): void {
    PosterGeneration.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '海报名称'
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'template_id',
          comment: '使用的模板ID'
        },
        posterUrl: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'poster_url',
          comment: '生成的海报图片URL'
        },
        thumbnailUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'thumbnail_url',
          comment: '缩略图URL'
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          comment: '状态：0-已删除，1-正常'
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '备注'
        },
        creatorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'creator_id',
          comment: '创建人ID'
        },
        updaterId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'updater_id',
          comment: '更新人ID'
        },
        parameters: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '海报参数（JSON格式）'
        },
        imageUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'image_url',
          comment: '海报图片URL'
        },
        shareCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'share_count',
          comment: '分享次数'
        },
        downloadCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'download_count',
          comment: '下载次数'
        },
        viewCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'view_count',
          comment: '查看次数'
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'kindergarten_id',
          comment: '幼儿园ID'
        },
      },
      {
        sequelize,
        tableName: 'poster_generations',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    this.belongsTo(this.sequelize!.models.User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
    this.belongsTo(this.sequelize!.models.Kindergarten, {
      foreignKey: 'kindergartenId',
      as: 'kindergarten'
    });
    this.belongsTo(this.sequelize!.models.PosterTemplate, {
      foreignKey: 'templateId',
      as: 'template'
    });
    this.hasMany(this.sequelize!.models.PosterElement, {
      foreignKey: 'generationId',
      as: 'elements'
    });
  }
}

export default PosterGeneration;
