/**
 * 积攒记录模型
 * 记录用户积攒行为和助力关系
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CollectRecordAttributes {
  id: number;
  collectActivityId: number;
  helperId: number; // 助力者ID
  inviterId: number; // 邀请者ID
  collectTime: Date; // 积攒时间
  ip: string; // 助力者IP
  userAgent: string; // 用户代理
  status: 'active' | 'invalid' | 'cancelled'; // 积攒状态
  rewardClaimed: boolean; // 是否已领取奖励
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectRecordCreationAttributes extends Optional<CollectRecordAttributes, 'id' | 'rewardClaimed' | 'createdAt' | 'updatedAt'> {}

export class CollectRecord extends Model<CollectRecordAttributes, CollectRecordCreationAttributes> implements CollectRecordAttributes {
  public id!: number;
  public collectActivityId!: number;
  public helperId!: number;
  public inviterId!: number;
  public collectTime!: Date;
  public ip!: string;
  public userAgent!: string;
  public status!: 'active' | 'invalid' | 'cancelled';
  public rewardClaimed!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isValid(): boolean {
    return this.status === 'active' && !this.rewardClaimed;
  }

  public canClaimReward(): boolean {
    // 注意：要检查积攒活动是否完成，需要在业务逻辑中查询collectActivity
    return this.isValid();
  }

  public static initModel(sequelize: Sequelize): typeof CollectRecord {
    CollectRecord.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  collectActivityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'collect_activities',
      key: 'id',
    },
  },
  helperId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '助力者用户ID',
  },
  inviterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '邀请者用户ID',
  },
  collectTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '积攒时间',
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: false,
    comment: '助力者IP地址',
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户代理信息',
  },
  status: {
    type: DataTypes.ENUM('active', 'invalid', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
    comment: '积攒状态',
  },
  rewardClaimed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否已领取奖励',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'CollectRecord',
  tableName: 'collect_records',
  timestamps: true,
  indexes: [
    {
      fields: ['collectActivityId'],
    },
    {
      fields: ['helperId'],
    },
    {
      fields: ['inviterId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['collectTime'],
    },
    {
      unique: true,
      fields: ['collectActivityId', 'helperId'],
    },
  ],
});
    
    return CollectRecord;
  }
}

export const initCollectRecord = (sequelize: Sequelize): typeof CollectRecord => {
  return CollectRecord.initModel(sequelize);
};

export const initCollectRecordAssociations = (): void => {
  // 关联将在模型的index.ts文件中设置
};

export default CollectRecord;