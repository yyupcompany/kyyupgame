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
exports.initAdvertisementAssociations = exports.initAdvertisement = exports.Advertisement = exports.AdStatus = exports.AdType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
var marketing_campaign_model_1 = require("./marketing-campaign.model");
var conversion_tracking_model_1 = require("./conversion-tracking.model");
var AdType;
(function (AdType) {
    AdType[AdType["IMAGE"] = 1] = "IMAGE";
    AdType[AdType["VIDEO"] = 2] = "VIDEO";
    AdType[AdType["TEXT"] = 3] = "TEXT";
    AdType[AdType["BANNER"] = 4] = "BANNER";
    AdType[AdType["POPUP"] = 5] = "POPUP";
    AdType[AdType["FEED"] = 6] = "FEED";
    AdType[AdType["SEARCH"] = 7] = "SEARCH";
    AdType[AdType["OTHER"] = 8] = "OTHER";
})(AdType = exports.AdType || (exports.AdType = {}));
var AdStatus;
(function (AdStatus) {
    AdStatus[AdStatus["DRAFT"] = 0] = "DRAFT";
    AdStatus[AdStatus["ACTIVE"] = 1] = "ACTIVE";
    AdStatus[AdStatus["PAUSED"] = 2] = "PAUSED";
    AdStatus[AdStatus["ENDED"] = 3] = "ENDED";
    AdStatus[AdStatus["CANCELLED"] = 4] = "CANCELLED";
})(AdStatus = exports.AdStatus || (exports.AdStatus = {}));
var Advertisement = /** @class */ (function (_super) {
    __extends(Advertisement, _super);
    function Advertisement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Advertisement.prototype.calculateMetrics = function () {
        if (this.impressions > 0) {
            this.ctr = (this.clicks / this.impressions) * 100;
        }
        else {
            this.ctr = 0;
        }
        if (this.clicks > 0) {
            this.conversionRate = (this.conversions / this.clicks) * 100;
            if (this.spent) {
                this.costPerClick = this.spent / this.clicks;
            }
        }
        else {
            this.conversionRate = 0;
            this.costPerClick = null;
        }
        if (this.conversions > 0 && this.spent) {
            this.costPerConversion = this.spent / this.conversions;
        }
        else {
            this.costPerConversion = null;
        }
    };
    return Advertisement;
}(sequelize_1.Model));
exports.Advertisement = Advertisement;
var initAdvertisement = function (sequelize) {
    Advertisement.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '广告ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID',
            references: { model: 'kindergartens', key: 'id' }
        },
        campaignId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '营销活动ID',
            references: { model: 'marketing_campaigns', key: 'id' }
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '广告标题'
        },
        adType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '广告类型 - 1:图片广告 2:视频广告 3:文字广告 4:横幅广告 5:弹窗广告 6:信息流广告 7:搜索广告 8:其他'
        },
        platform: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '投放平台'
        },
        position: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '广告位置'
        },
        targetAudience: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '目标受众'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '广告内容'
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '图片URL'
        },
        videoUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '视频URL'
        },
        landingPage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '落地页URL'
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
        budget: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '广告预算'
        },
        spent: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '已花费'
        },
        impressions: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '展示次数'
        },
        clicks: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '点击次数'
        },
        ctr: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: '点击率(%)'
        },
        conversions: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '转化次数'
        },
        conversionRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: '转化率(%)'
        },
        costPerClick: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '每次点击成本'
        },
        costPerConversion: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '每次转化成本'
        },
        roi: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '投资回报率'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: AdStatus.DRAFT,
            comment: '状态 - 0:草稿 1:进行中 2:已暂停 3:已结束 4:已取消'
        },
        remark: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建人ID',
            references: { model: 'users', key: 'id' }
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID',
            references: { model: 'users', key: 'id' }
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
        tableName: 'advertisements',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Advertisement;
};
exports.initAdvertisement = initAdvertisement;
var initAdvertisementAssociations = function () {
    Advertisement.belongsTo(kindergarten_model_1.Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
    Advertisement.belongsTo(marketing_campaign_model_1.MarketingCampaign, { foreignKey: 'campaignId', as: 'campaign' });
    Advertisement.belongsTo(user_model_1.User, { foreignKey: 'creatorId', as: 'creator' });
    Advertisement.belongsTo(user_model_1.User, { foreignKey: 'updaterId', as: 'updater' });
    Advertisement.hasMany(conversion_tracking_model_1.ConversionTracking, { foreignKey: 'advertisementId', as: 'conversionTrackings' });
};
exports.initAdvertisementAssociations = initAdvertisementAssociations;
