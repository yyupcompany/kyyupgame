import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Activity } from './activity.model';
import { User } from './user.model';

export class ActivityResource extends Model<
  InferAttributes<ActivityResource>,
  InferCreationAttributes<ActivityResource>
> {
  declare id: CreationOptional<number>;
  declare activityId: number;
  declare resourceName: string;
  declare resourceType: number;
  declare resourceUrl: string;
  declare fileSize: number | null;
  declare fileType: string | null;
  declare isPublic: CreationOptional<boolean>;
  declare description: string | null;
  declare sortOrder: CreationOptional<number>;
  declare creatorId: number | null;
  declare updaterId: number | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

export const initActivityResource = (sequelize: Sequelize) => {
  ActivityResource.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID - 外键关联活动表',
        references: {
          model: 'activities',
          key: 'id',
        },
      },
      resourceName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '资源名称',
      },
      resourceType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '资源类型 - 1:图片 2:文档 3:视频 4:音频 5:其他',
      },
      resourceUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '资源URL',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '文件大小(字节)',
      },
      fileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '文件类型(MIME类型)',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否公开 - true:公开 false:私有',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '资源描述',
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序顺序',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
        references: {
          model: 'users',
          key: 'id',
        },
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
      tableName: 'activity_resources',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityResource;
}

export const initActivityResourceAssociations = () => {
    ActivityResource.belongsTo(Activity, {
        foreignKey: 'activityId',
        as: 'activity'
    });
    ActivityResource.belongsTo(User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ActivityResource.belongsTo(User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
}
