import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { PosterElement } from './poster-element.model';

export interface PosterTemplateAttributes {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  width: number;
  height: number;
  background: string | null;
  thumbnail: string | null;
  kindergartenId: number | null;
  status: number;
  usageCount: number;
  remark: string | null;
  creatorId: number | null;
  updaterId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type PosterTemplateCreationAttributes = Optional<PosterTemplateAttributes, 'id' | 'description' | 'category' | 'background' | 'thumbnail' | 'kindergartenId' | 'status' | 'usageCount' | 'remark' | 'creatorId' | 'updaterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class PosterTemplate extends Model<PosterTemplateAttributes, PosterTemplateCreationAttributes> implements PosterTemplateAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public category!: string | null;
  public width!: number;
  public height!: number;
  public background!: string | null;
  public thumbnail!: string | null;
  public kindergartenId!: number | null;
  public status!: number;
  public usageCount!: number;
  public remark!: string | null;
  public creatorId!: number | null;
  public updaterId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly creator?: User;
  public readonly elements?: PosterElement[];

  public async incrementUsageCount(): Promise<void> {
    this.usageCount += 1;
    await this.save();
  }

  public getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  public getBackgroundInfo(): { type: 'color' | 'image' | null; value: string | null } {
    if (!this.background) {
      return { type: null, value: null };
    }
    if (this.background.startsWith('#') || this.background.startsWith('rgb')) {
      return { type: 'color', value: this.background };
    }
    return { type: 'image', value: this.background };
  }

  static initModel(sequelize: Sequelize): void {
    PosterTemplate.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '模板名称'
        },
        description: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '模板描述'
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '模板分类'
        },
        width: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 750,
          comment: '模板宽度（像素）'
        },
        height: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1334,
          comment: '模板高度（像素）'
        },
        background: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '背景图片URL或颜色值'
        },
        thumbnail: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '缩略图URL'
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'kindergarten_id',
          comment: '幼儿园ID（为空表示系统模板）'
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          comment: '状态：0-禁用，1-启用'
        },
        usageCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'usage_count',
          comment: '使用次数'
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '备注'
        },
        creatorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'creator_id',
          comment: '创建人ID'
        },
        updaterId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'updater_id',
          comment: '更新人ID'
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
          field: 'deleted_at',
        }
      },
      {
        sequelize,
        tableName: 'poster_templates',
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
    this.hasMany(this.sequelize!.models.PosterElement, {
      foreignKey: 'templateId',
      as: 'elements'
    });
  }
}

export default PosterTemplate;
