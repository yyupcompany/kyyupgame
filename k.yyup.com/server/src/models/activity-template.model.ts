import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 活动模板属性接口
export interface ActivityTemplateAttributes {
  id: number;
  name: string;
  description: string;
  category: string;
  coverImage: string;
  usageCount: number;
  templateData: object; // JSON格式存储模板配置
  status: 'active' | 'inactive';
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// 创建时可选的属性
export interface ActivityTemplateCreationAttributes 
  extends Optional<ActivityTemplateAttributes, 'id' | 'usageCount' | 'status' | 'createdAt' | 'updatedAt'> {}

// 活动模板模型类
export class ActivityTemplate extends Model<ActivityTemplateAttributes, ActivityTemplateCreationAttributes>
  implements ActivityTemplateAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public coverImage!: string;
  public usageCount!: number;
  public templateData!: object;
  public status!: 'active' | 'inactive';
  public createdBy!: number;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化函数，在数据库连接建立后调用
export const initActivityTemplate = (sequelize: Sequelize) => {
  ActivityTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '模板名称',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '模板描述',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '模板分类',
      },
      coverImage: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '封面图片路径',
        field: 'coverImage', // 明确指定数据库字段名
      },
      usageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用次数',
        field: 'usageCount', // 明确指定数据库字段名
      },
      templateData: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '模板配置数据',
        field: 'templateData', // 明确指定数据库字段名
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建者ID',
        field: 'createdBy', // 明确指定数据库字段名
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'createdAt', // 明确指定数据库字段名
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt', // 明确指定数据库字段名
      },
    },
    {
      sequelize,
      tableName: 'activity_templates',
      modelName: 'ActivityTemplate',
      timestamps: true,
      underscored: false, // 禁用下划线转换，使用驼峰命名
      indexes: [
        {
          fields: ['category'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['createdBy'],
        },
      ],
    }
  );
};

export default ActivityTemplate;
