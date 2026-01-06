import { DataTypes, Model, Sequelize } from 'sequelize';
import { Activity } from './activity.model';
import { PosterGeneration } from './poster-generation.model';
import { User } from './user.model';

export class ActivityShare extends Model {
  public id!: number;
  public activityId!: number;
  public posterId?: number;
  public shareChannel!: string;
  public shareUrl?: string;
  public sharerId?: number;
  public shareIp?: string;
  public parentSharerId?: number; // 上级分享者ID
  public shareLevel!: number; // 分享层级（1/2/3）
  public createdAt!: Date;

  // 关联关系
  public activity?: Activity;
  public poster?: PosterGeneration;
  public sharer?: User;
  public parentSharer?: User; // 上级分享者
}

export const initActivityShare = (sequelize: Sequelize) => {
  ActivityShare.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '分享记录ID',
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID',
      },
      posterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '分享的海报ID',
      },
      shareChannel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '分享渠道',
      },
      shareUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '分享链接',
      },
      sharerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '分享者ID',
      },
      shareIp: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: '分享者IP',
      },
      parentSharerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '上级分享者ID（用于记录分享层级关系）',
      },
      shareLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '分享层级（1=一级分享，2=二级分享，3=三级分享）',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'activity_shares',
      timestamps: false, // 只需要createdAt
      underscored: true,
    }
  );
  
  return ActivityShare;
};

// 设置关联关系的函数
export const initActivityShareAssociations = () => {
  const { Activity } = require('./activity.model');
  const { PosterGeneration } = require('./poster-generation.model');
  const { User } = require('./user.model');
  
  ActivityShare.belongsTo(Activity, {
    foreignKey: 'activityId',
    as: 'activity'
  });
  
  ActivityShare.belongsTo(PosterGeneration, {
    foreignKey: 'posterId',
    as: 'poster'
  });
  
  ActivityShare.belongsTo(User, {
    foreignKey: 'sharerId',
    as: 'sharer'
  });

  // 上级分享者关联
  ActivityShare.belongsTo(User, {
    foreignKey: 'parentSharerId',
    as: 'parentSharer'
  });
};
