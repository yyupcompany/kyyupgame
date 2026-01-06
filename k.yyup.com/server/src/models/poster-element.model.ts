import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { PosterTemplate } from './poster-template.model';
import { PosterGeneration } from './poster-generation.model';

export interface PosterElementAttributes {
  id: number;
  type: string;
  content: string;
  style: string;
  position: string;
  width: number;
  height: number;
  zIndex: number;
  templateId: number | null;
  generationId: number | null;
  remark: string | null;
  creatorId: number | null;
  updaterId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type PosterElementCreationAttributes = Optional<PosterElementAttributes, 'id' | 'templateId' | 'generationId' | 'remark' | 'creatorId' | 'updaterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class PosterElement extends Model<PosterElementAttributes, PosterElementCreationAttributes> implements PosterElementAttributes {
  public id!: number;
  public type!: string;
  public content!: string;
  public style!: string;
  public position!: string;
  public width!: number;
  public height!: number;
  public zIndex!: number;
  public templateId!: number | null;
  public generationId!: number | null;
  public remark!: string | null;
  public creatorId!: number | null;
  public updaterId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly template?: PosterTemplate;
  public readonly generation?: PosterGeneration;

  public getPosition(): { x: number; y: number } {
    try {
      const pos = JSON.parse(this.position);
      return { x: pos.x || 0, y: pos.y || 0 };
    } catch (e) {
      return { x: 0, y: 0 };
    }
  }

  public getStyle(): Record<string, any> {
    try {
      return JSON.parse(this.style);
    } catch (e) {
      return {};
    }
  }

  public getContent(): Record<string, any> {
    try {
      return JSON.parse(this.content);
    } catch (e) {
      return {};
    }
  }

  static initModel(sequelize: Sequelize): void {
    PosterElement.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '元素类型：text-文本，image-图片，shape-形状等'
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '元素内容（JSON格式）'
        },
        style: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '元素样式（JSON格式）'
        },
        position: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '元素位置（JSON格式：{x,y}）'
        },
        width: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '元素宽度（像素）'
        },
        height: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '元素高度（像素）'
        },
        zIndex: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'z_index',
          comment: '元素层级'
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'template_id',
          comment: '所属模板ID'
        },
        generationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'generation_id',
          comment: '所属生成记录ID'
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
          comment: '创建者ID'
        },
        updaterId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'updater_id',
          comment: '更新者ID'
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
        tableName: 'poster_elements',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    this.belongsTo(this.sequelize!.models.PosterTemplate, {
      foreignKey: 'templateId',
      as: 'template'
    });
    this.belongsTo(this.sequelize!.models.PosterGeneration, {
      foreignKey: 'generationId',
      as: 'generation'
    });
  }
}

export default PosterElement;
