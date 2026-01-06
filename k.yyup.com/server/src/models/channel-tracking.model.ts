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
 * 渠道类型
 */
export enum ChannelType {
  SEARCH_ENGINE = 1, // 搜索引擎
  SOCIAL_MEDIA = 2, // 社交媒体
  EMAIL = 3, // 电子邮件
  SMS = 4, // 短信
  OFFLINE_EVENT = 5, // 线下活动
  REFERRAL = 6, // 推荐
  PARTNER = 7, // 合作伙伴
  DIRECT_ACCESS = 8, // 直接访问
  OTHER = 9, // 其他
}

/**
 * 渠道状态
 */
export enum ChannelStatus {
  DISABLED = 0, // 未启用
  ACTIVE = 1, // 活跃中
  PAUSED = 2, // 已暂停
  ENDED = 3, // 已结束
}

export class ChannelTracking extends Model<
  InferAttributes<ChannelTracking>,
  InferCreationAttributes<ChannelTracking>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare channelName: string;
  declare channelType: ChannelType;
  declare utmSource: string | null;
  declare utmMedium: string | null;
  declare utmCampaign: string | null;
  declare utmContent: string | null;
  declare utmTerm: string | null;
  declare startDate: Date;
  declare endDate: Date | null;
  declare description: string | null;
  declare cost: number | null;
  declare visitCount: CreationOptional<number>;
  declare registrationCount: CreationOptional<number>;
  declare leadCount: CreationOptional<number>;
  declare conversionCount: CreationOptional<number>;
  declare conversionRate: number | null;
  declare costPerLead: number | null;
  declare costPerConversion: number | null;
  declare revenue: number | null;
  declare roi: number | null;
  declare status: CreationOptional<ChannelStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public readonly kindergarten?: Kindergarten;
  public readonly creator?: User;
  public readonly updater?: User;
}

export const initChannelTracking = (sequelize: Sequelize) => {
  ChannelTracking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '渠道跟踪ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
        references: {
          model: 'kindergartens',
          key: 'id',
        },
      },
      channelName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '渠道名称',
      },
      channelType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '渠道类型 - 1:搜索引擎 2:社交媒体 3:电子邮件 4:短信 5:线下活动 6:推荐 7:合作伙伴 8:直接访问 9:其他',
      },
      utmSource: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'UTM来源',
      },
      utmMedium: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'UTM媒介',
      },
      utmCampaign: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'UTM活动',
      },
      utmContent: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'UTM内容',
      },
      utmTerm: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'UTM关键词',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '开始日期',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '结束日期',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '渠道描述',
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '渠道成本',
      },
      visitCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '访问次数',
      },
      registrationCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '报名次数',
      },
      leadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '线索数量',
      },
      conversionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '转化数量',
      },
      conversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: '转化率(%)',
      },
      costPerLead: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '每个线索成本',
      },
      costPerConversion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '每次转化成本',
      },
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '产生收入',
      },
      roi: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '投资回报率',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ChannelStatus.DISABLED,
        comment: '状态 - 0:未启用 1:活跃中 2:已暂停 3:已结束',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'channel_trackings',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ChannelTracking;
};

export const initChannelTrackingAssociations = () => {
  ChannelTracking.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  ChannelTracking.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  ChannelTracking.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
