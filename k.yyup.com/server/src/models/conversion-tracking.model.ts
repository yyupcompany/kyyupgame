import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Kindergarten } from './kindergarten.model';
import { MarketingCampaign } from './marketing-campaign.model';
import { ChannelTracking } from './channel-tracking.model';
import { Advertisement } from './advertisement.model';
import { ParentStudentRelation } from './parent-student-relation.model';

/**
 * 转化类型
 */
export enum ConversionType {
  REGISTER = 1, // 注册
  CONSULT = 2, // 咨询
  APPLY = 3, // 报名
  PAY = 4, // 缴费
  PARTICIPATE = 5, // 活动参与
  SHARE = 6, // 分享
  DOWNLOAD = 7, // 下载资料
  BOOK_TOUR = 8, // 预约参观
  OTHER = 9, // 其他
}

/**
 * 转化状态
 */
export enum ConversionStatus {
  UNPROCESSED = 0, // 未处理
  VALID = 1, // 有效转化
  INVALID = 2, // 无效转化
  PENDING = 3, // 待确认
  ABANDONED = 4, // 已放弃
}

/**
 * 跟进状态
 */
export enum FollowUpStatus {
  NOT_FOLLOWED_UP = 0, // 未跟进
  CONTACTED = 1, // 已联系
  FOLLOWED_UP = 2, // 已回访
  NEEDS_FOLLOW_UP = 3, // 需再次联系
  CONFIRMED_INTENTION = 4, // 已确认意向
  NO_INTENTION = 5, // 无意向
  CONVERTED = 6, // 已转化
  GAVE_UP = 7, // 已放弃
}

export class ConversionTracking extends Model<
  InferAttributes<ConversionTracking>,
  InferCreationAttributes<ConversionTracking>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare parentId: ForeignKey<ParentStudentRelation['id']> | null;
  declare campaignId: ForeignKey<MarketingCampaign['id']> | null;
  declare channelId: ForeignKey<ChannelTracking['id']> | null;
  declare advertisementId: ForeignKey<Advertisement['id']> | null;
  declare conversionType: ConversionType;
  declare conversionSource: string;
  declare conversionEvent: string;
  declare eventValue: number | null;
  declare eventTime: Date;
  declare conversionStatus: CreationOptional<ConversionStatus>;
  declare followUpStatus: CreationOptional<FollowUpStatus>;
  declare isFirstVisit: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public readonly kindergarten?: Kindergarten;
  public readonly parent?: ParentStudentRelation;
  public readonly campaign?: MarketingCampaign;
  public readonly channel?: ChannelTracking;
  public readonly advertisement?: Advertisement;
}

export const initConversionTracking = (sequelize: Sequelize) => {
  ConversionTracking.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '转化跟踪ID',
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
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '家长ID',
        references: {
          model: 'parent_student_relations',
          key: 'id',
        },
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '营销活动ID',
        references: {
          model: 'marketing_campaigns',
          key: 'id',
        },
      },
      channelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '渠道ID',
        references: {
          model: 'channel_trackings',
          key: 'id',
        },
      },
      advertisementId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '广告ID',
        references: {
          model: 'advertisements',
          key: 'id',
        },
      },
      conversionType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '转化类型: 1=注册,2=咨询,3=报名,4=缴费,5=活动参与,6=分享,7=下载资料,8=预约参观,9=其他',
      },
      conversionSource: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '转化来源',
      },
      conversionEvent: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '转化事件',
      },
      eventValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '事件价值',
      },
      eventTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '事件时间',
      },
      conversionStatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: ConversionStatus.UNPROCESSED,
        comment: '转化状态: 0=未处理,1=有效转化,2=无效转化,3=待确认,4=已放弃',
      },
      followUpStatus: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: FollowUpStatus.NOT_FOLLOWED_UP,
        comment: '跟进状态: 0=未跟进,1=已联系,2=已回访,3=需再次联系,4=已确认意向,5=无意向,6=已转化,7=已放弃',
      },
      isFirstVisit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否首次访问',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'conversion_trackings',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ConversionTracking;
};

export const initConversionTrackingAssociations = () => {
  ConversionTracking.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  ConversionTracking.belongsTo(ParentStudentRelation, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  ConversionTracking.belongsTo(MarketingCampaign, {
    foreignKey: 'campaignId',
    as: 'campaign',
  });
  ConversionTracking.belongsTo(ChannelTracking, {
    foreignKey: 'channelId',
    as: 'channel',
  });
  ConversionTracking.belongsTo(Advertisement, {
    foreignKey: 'advertisementId',
    as: 'advertisement',
  });
};
