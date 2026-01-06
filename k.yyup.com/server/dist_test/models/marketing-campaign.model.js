"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.initMarketingCampaignAssociations = exports.initMarketingCampaign = exports.MarketingCampaign = exports.CampaignStatus = exports.CampaignType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
var advertisement_model_1 = require("./advertisement.model");
var conversion_tracking_model_1 = require("./conversion-tracking.model");
/**
 * 营销活动类型
 */
var CampaignType;
(function (CampaignType) {
    CampaignType[CampaignType["REGISTRATION_PROMOTION"] = 1] = "REGISTRATION_PROMOTION";
    CampaignType[CampaignType["REFERRAL_BONUS"] = 2] = "REFERRAL_BONUS";
    CampaignType[CampaignType["LIMITED_TIME_DISCOUNT"] = 3] = "LIMITED_TIME_DISCOUNT";
    CampaignType[CampaignType["HOLIDAY_SPECIAL"] = 4] = "HOLIDAY_SPECIAL";
    CampaignType[CampaignType["GROUP_BUY"] = 5] = "GROUP_BUY";
    CampaignType[CampaignType["SHARE_FOR_GIFT"] = 6] = "SHARE_FOR_GIFT";
    CampaignType[CampaignType["TRIAL_CLASS_PROMOTION"] = 8] = "TRIAL_CLASS_PROMOTION";
    CampaignType[CampaignType["OTHER"] = 9] = "OTHER";
})(CampaignType = exports.CampaignType || (exports.CampaignType = {}));
/**
 * 营销活动状态
 */
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus[CampaignStatus["DRAFT"] = 0] = "DRAFT";
    CampaignStatus[CampaignStatus["ONGOING"] = 1] = "ONGOING";
    CampaignStatus[CampaignStatus["PAUSED"] = 2] = "PAUSED";
    CampaignStatus[CampaignStatus["ENDED"] = 3] = "ENDED";
    CampaignStatus[CampaignStatus["CANCELLED"] = 4] = "CANCELLED";
})(CampaignStatus = exports.CampaignStatus || (exports.CampaignStatus = {}));
var MarketingCampaign = /** @class */ (function (_super) {
    __extends(MarketingCampaign, _super);
    function MarketingCampaign() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MarketingCampaign;
}(sequelize_1.Model));
exports.MarketingCampaign = MarketingCampaign;
var initMarketingCampaign = function (sequelize) {
    MarketingCampaign.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '营销活动ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID',
            references: {
                model: 'kindergartens',
                key: 'id'
            }
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '活动标题'
        },
        campaignType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '活动类型 - 1:注册促销 2:推荐奖励 3:限时折扣 4:节日特惠 5:团购活动 6:分享有礼 8:体验课推广 9:其他活动'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '结束日期'
        },
        targetAudience: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '目标受众'
        },
        budget: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '预算金额'
        },
        objective: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '活动目标'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动描述'
        },
        rules: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动规则'
        },
        rewards: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动奖励'
        },
        coverImage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '封面图片'
        },
        bannerImage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '横幅图片'
        },
        participantCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '参与人数'
        },
        conversionCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '转化次数'
        },
        viewCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '浏览次数'
        },
        totalRevenue: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '总收入'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: CampaignStatus.DRAFT,
            comment: '状态 - 0:草稿 1:进行中 2:已暂停 3:已结束 4:已取消'
        },
        remark: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'marketing_campaigns',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return MarketingCampaign;
};
exports.initMarketingCampaign = initMarketingCampaign;
var initMarketingCampaignAssociations = function () {
    MarketingCampaign.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    MarketingCampaign.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    MarketingCampaign.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    MarketingCampaign.hasMany(advertisement_model_1.Advertisement, {
        foreignKey: 'campaignId',
        as: 'advertisements'
    });
    MarketingCampaign.hasMany(conversion_tracking_model_1.ConversionTracking, {
        foreignKey: 'campaignId',
        as: 'conversions'
    });
};
exports.initMarketingCampaignAssociations = initMarketingCampaignAssociations;
