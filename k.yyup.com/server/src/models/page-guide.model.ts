import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

/**
 * 页面说明文档属性接口
 */
export interface PageGuideAttributes {
  id: number;
  pagePath: string;
  pageName: string;
  pageDescription: string;
  category: string;
  importance: number;
  relatedTables: string[];
  contextPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 页面说明文档创建属性接口
 */
export interface PageGuideCreationAttributes extends Optional<PageGuideAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * 页面说明文档模型
 */
class PageGuide extends Model<PageGuideAttributes, PageGuideCreationAttributes> implements PageGuideAttributes {
  public id!: number;
  public pagePath!: string;
  public pageName!: string;
  public pageDescription!: string;
  public category!: string;
  public importance!: number;
  public relatedTables!: string[];
  public contextPrompt!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联属性
  public sections?: any[];
}

/**
 * 页面功能板块属性接口
 */
export interface PageGuideSectionAttributes {
  id: number;
  pageGuideId: number;
  sectionName: string;
  sectionDescription: string;
  sectionPath?: string;
  features: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 页面功能板块创建属性接口
 */
export interface PageGuideSectionCreationAttributes extends Optional<PageGuideSectionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * 页面功能板块模型
 */
class PageGuideSection extends Model<PageGuideSectionAttributes, PageGuideSectionCreationAttributes> implements PageGuideSectionAttributes {
  public id!: number;
  public pageGuideId!: number;
  public sectionName!: string;
  public sectionDescription!: string;
  public sectionPath?: string;
  public features!: string[];
  public sortOrder!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * 初始化页面说明文档模型
 */
export function initPageGuide(sequelize: Sequelize) {
  PageGuide.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pagePath: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: '页面路径，如 /centers/activity',
        field: 'page_path',
      },
      pageName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '页面名称，如 活动中心',
        field: 'page_name',
      },
      pageDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '页面详细描述',
        field: 'page_description',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '页面分类，如 中心页面、管理页面等',
      },
      importance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: '页面重要性，1-10，影响AI介绍的详细程度',
      },
      relatedTables: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '页面相关的数据库表名列表',
        field: 'related_tables',
      },
      contextPrompt: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '发送给AI的上下文提示词',
        field: 'context_prompt',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用',
        field: 'is_active',
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
    },
    {
      sequelize,
      tableName: 'page_guides',
      timestamps: true,
      comment: '页面说明文档表',
      indexes: [
        {
          fields: ['pagePath'],
          unique: true,
        },
        {
          fields: ['category'],
        },
        {
          fields: ['isActive'],
        },
      ],
    }
  );
}

/**
 * 初始化页面功能板块模型
 */
export function initPageGuideSection(sequelize: Sequelize) {
  PageGuideSection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      pageGuideId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: PageGuide,
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: '关联的页面说明文档ID',
        field: 'page_guide_id',
      },
      sectionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '功能板块名称',
        field: 'section_name',
      },
      sectionDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '功能板块描述',
        field: 'section_description',
      },
      sectionPath: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '功能板块对应的路径（如果有）',
        field: 'section_path',
      },
      features: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: '功能特性列表',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序顺序',
        field: 'sort_order',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用',
        field: 'is_active',
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
    },
    {
      sequelize,
      tableName: 'page_guide_sections',
      timestamps: true,
      comment: '页面功能板块表',
      indexes: [
        {
          fields: ['pageGuideId'],
        },
        {
          fields: ['sortOrder'],
        },
        {
          fields: ['isActive'],
        },
      ],
    }
  );
}

/**
 * 初始化页面说明文档模型关联
 */
export function initPageGuideAssociations() {
  // 建立关联关系
  PageGuide.hasMany(PageGuideSection, {
    foreignKey: 'pageGuideId',
    as: 'sections',
    onDelete: 'CASCADE',
  });

  PageGuideSection.belongsTo(PageGuide, {
    foreignKey: 'pageGuideId',
    as: 'pageGuide',
  });
}

export { PageGuide, PageGuideSection };
