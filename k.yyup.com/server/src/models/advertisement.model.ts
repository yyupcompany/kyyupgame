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
import { MarketingCampaign } from './marketing-campaign.model';
import { ConversionTracking } from './conversion-tracking.model';

export enum AdType {
    IMAGE = 1,
    VIDEO = 2,
    TEXT = 3,
    BANNER = 4,
    POPUP = 5,
    FEED = 6,
    SEARCH = 7,
    OTHER = 8,
}

export enum AdStatus {
    DRAFT = 0,
    ACTIVE = 1,
    PAUSED = 2,
    ENDED = 3,
    CANCELLED = 4,
}


export class Advertisement extends Model<
  InferAttributes<Advertisement>,
  InferCreationAttributes<Advertisement>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare campaignId: ForeignKey<MarketingCampaign['id']> | null;
  declare title: string;
  declare adType: AdType;
  declare platform: string;
  declare position: string | null;
  declare targetAudience: string | null;
  declare content: string | null;
  declare imageUrl: string | null;
  declare videoUrl: string | null;
  declare landingPage: string | null;
  declare startDate: Date;
  declare endDate: Date;
  declare budget: number | null;
  declare spent: number | null;
  declare impressions: CreationOptional<number>;
  declare clicks: CreationOptional<number>;
  declare ctr: number | null;
  declare conversions: CreationOptional<number>;
  declare conversionRate: number | null;
  declare costPerClick: number | null;
  declare costPerConversion: number | null;
  declare roi: number | null;
  declare status: CreationOptional<AdStatus>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']>;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly kindergarten?: Kindergarten;
  public readonly campaign?: MarketingCampaign;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly conversionTrackings?: ConversionTracking[];

  public calculateMetrics(): void {
    if (this.impressions > 0) {
      this.ctr = (this.clicks / this.impressions) * 100;
    } else {
      this.ctr = 0;
    }

    if (this.clicks > 0) {
      this.conversionRate = (this.conversions / this.clicks) * 100;
      if (this.spent) {
        this.costPerClick = this.spent / this.clicks;
      }
    } else {
      this.conversionRate = 0;
      this.costPerClick = null;
    }

    if (this.conversions > 0 && this.spent) {
      this.costPerConversion = this.spent / this.conversions;
    } else {
        this.costPerConversion = null;
    }
  }
}

export const initAdvertisement = (sequelize: Sequelize) => {
  Advertisement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '广告ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
        references: { model: 'kindergartens', key: 'id' }
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '营销活动ID',
        references: { model: 'marketing_campaigns', key: 'id' }
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '广告标题',
      },
      adType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '广告类型 - 1:图片广告 2:视频广告 3:文字广告 4:横幅广告 5:弹窗广告 6:信息流广告 7:搜索广告 8:其他',
      },
      platform: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '投放平台',
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '广告位置',
      },
      targetAudience: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '目标受众',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '广告内容',
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '图片URL',
      },
      videoUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '视频URL',
      },
      landingPage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '落地页URL',
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
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '广告预算',
      },
      spent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '已花费',
      },
      impressions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '展示次数',
      },
      clicks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '点击次数',
      },
      ctr: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: '点击率(%)',
      },
      conversions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '转化次数',
      },
      conversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: '转化率(%)',
      },
      costPerClick: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '每次点击成本',
      },
      costPerConversion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '每次转化成本',
      },
      roi: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '投资回报率',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: AdStatus.DRAFT,
        comment: '状态 - 0:草稿 1:进行中 2:已暂停 3:已结束 4:已取消',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建人ID',
        references: { model: 'users', key: 'id' }
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
        references: { model: 'users', key: 'id' }
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
      tableName: 'advertisements',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Advertisement;
};

export const initAdvertisementAssociations = () => {
    Advertisement.belongsTo(Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
    Advertisement.belongsTo(MarketingCampaign, { foreignKey: 'campaignId', as: 'campaign' });
    Advertisement.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
    Advertisement.belongsTo(User, { foreignKey: 'updaterId', as: 'updater' });
    Advertisement.hasMany(ConversionTracking, { foreignKey: 'advertisementId', as: 'conversionTrackings' });
};
