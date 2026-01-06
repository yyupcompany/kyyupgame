import { DataTypes, Model, Sequelize, CreationOptional, ForeignKey } from 'sequelize';
import { Activity } from './activity.model';
import { PosterGeneration } from './poster-generation.model';

export interface ActivityPosterAttributes {
  id: number;
  activityId: number;
  posterId: number;
  posterType: 'main' | 'share' | 'detail' | 'preview';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityPosterCreationAttributes 
  extends Omit<ActivityPosterAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: CreationOptional<number>;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
}

export class ActivityPoster extends Model<ActivityPosterAttributes, ActivityPosterCreationAttributes> 
  implements ActivityPosterAttributes {
  declare id: CreationOptional<number>;
  declare activityId: ForeignKey<Activity['id']>;
  declare posterId: ForeignKey<PosterGeneration['id']>;
  declare posterType: 'main' | 'share' | 'detail' | 'preview';
  declare isActive: boolean;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // 关联关系
  declare activity?: Activity;
  declare poster?: PosterGeneration;
}

export const initActivityPoster = (sequelize: Sequelize) => {
  ActivityPoster.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '关联ID',
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID',
      },
      posterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '海报ID',
      },
      posterType: {
        type: DataTypes.ENUM('main', 'share', 'detail', 'preview'),
        allowNull: false,
        defaultValue: 'main',
        comment: '海报类型 - main:主海报 share:分享海报 detail:详情海报 preview:预览海报',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用',
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
    },
    {
      sequelize,
      tableName: 'activity_posters',
      timestamps: true,
      underscored: true,
    }
  );
  return ActivityPoster;
};
