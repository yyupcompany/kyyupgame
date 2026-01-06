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
import { Advertisement } from './advertisement.model';
import { ConversionTracking } from './conversion-tracking.model';

/**
 * 营销活动类型
 */
export enum CampaignType {
  REGISTRATION_PROMOTION = 1, // 注册促销
  REFERRAL_BONUS = 2, // 推荐奖励
  LIMITED_TIME_DISCOUNT = 3, // 限时折扣
  HOLIDAY_SPECIAL = 4, // 节日特惠
  GROUP_BUY = 5, // 团购活动
  SHARE_FOR_GIFT = 6, // 分享有礼
  TRIAL_CLASS_PROMOTION = 8, // 体验课推广
  OTHER = 9, // 其他活动
}

/**
 * 营销活动状态
 */
export enum CampaignStatus {
  DRAFT = 0, // 草稿
  ONGOING = 1, // 进行中
  PAUSED = 2, // 已暂停
  ENDED = 3, // 已结束
  CANCELLED = 4, // 已取消
}

export class MarketingCampaign extends Model<
  InferAttributes<MarketingCampaign>,
  InferCreationAttributes<MarketingCampaign>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare title: string;
  declare campaignType: CampaignType;
  declare startDate: Date;
  declare endDate: Date;
  declare targetAudience: string | null;
  declare budget: number | null;
  declare objective: string | null;
  declare description: string | null;
  declare rules: string | null;
  declare rewards: string | null;
  declare coverImage: string | null;
  declare bannerImage: string | null;
  declare participantCount: CreationOptional<number>;
  declare conversionCount: CreationOptional<number>;
  declare viewCount: CreationOptional<number>;
  declare totalRevenue: number | null;
  declare status: CreationOptional<CampaignStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public readonly kindergarten?: Kindergarten;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly advertisements?: Advertisement[];
  public readonly conversions?: ConversionTracking[];
}

export const initMarketingCampaign = (sequelize: Sequelize) => {
  MarketingCampaign.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '营销活动ID',
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
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '活动标题',
      },
      campaignType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '活动类型 - 1:注册促销 2:推荐奖励 3:限时折扣 4:节日特惠 5:团购活动 6:分享有礼 8:体验课推广 9:其他活动',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '开始日期',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '结束日期',
      },
      targetAudience: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '目标受众',
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '预算金额',
      },
      objective: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '活动目标',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动描述',
      },
      rules: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动规则',
      },
      rewards: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动奖励',
      },
      coverImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图片',
      },
      bannerImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '横幅图片',
      },
      participantCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '参与人数',
      },
      conversionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '转化次数',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '浏览次数',
      },
      totalRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '总收入',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: CampaignStatus.DRAFT,
        comment: '状态 - 0:草稿 1:进行中 2:已暂停 3:已结束 4:已取消',
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
      tableName: 'marketing_campaigns',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return MarketingCampaign;
};

export const initMarketingCampaignAssociations = () => {
  MarketingCampaign.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  MarketingCampaign.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  MarketingCampaign.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
  MarketingCampaign.hasMany(Advertisement, {
    foreignKey: 'campaignId',
    as: 'advertisements',
  });
  MarketingCampaign.hasMany(ConversionTracking, {
    foreignKey: 'campaignId',
    as: 'conversions',
  });
};
