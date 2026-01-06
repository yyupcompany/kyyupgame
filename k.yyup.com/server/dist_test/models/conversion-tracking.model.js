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
exports.initConversionTrackingAssociations = exports.initConversionTracking = exports.ConversionTracking = exports.FollowUpStatus = exports.ConversionStatus = exports.ConversionType = void 0;
var sequelize_1 = require("sequelize");
var kindergarten_model_1 = require("./kindergarten.model");
var marketing_campaign_model_1 = require("./marketing-campaign.model");
var channel_tracking_model_1 = require("./channel-tracking.model");
var advertisement_model_1 = require("./advertisement.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
/**
 * 转化类型
 */
var ConversionType;
(function (ConversionType) {
    ConversionType[ConversionType["REGISTER"] = 1] = "REGISTER";
    ConversionType[ConversionType["CONSULT"] = 2] = "CONSULT";
    ConversionType[ConversionType["APPLY"] = 3] = "APPLY";
    ConversionType[ConversionType["PAY"] = 4] = "PAY";
    ConversionType[ConversionType["PARTICIPATE"] = 5] = "PARTICIPATE";
    ConversionType[ConversionType["SHARE"] = 6] = "SHARE";
    ConversionType[ConversionType["DOWNLOAD"] = 7] = "DOWNLOAD";
    ConversionType[ConversionType["BOOK_TOUR"] = 8] = "BOOK_TOUR";
    ConversionType[ConversionType["OTHER"] = 9] = "OTHER";
})(ConversionType = exports.ConversionType || (exports.ConversionType = {}));
/**
 * 转化状态
 */
var ConversionStatus;
(function (ConversionStatus) {
    ConversionStatus[ConversionStatus["UNPROCESSED"] = 0] = "UNPROCESSED";
    ConversionStatus[ConversionStatus["VALID"] = 1] = "VALID";
    ConversionStatus[ConversionStatus["INVALID"] = 2] = "INVALID";
    ConversionStatus[ConversionStatus["PENDING"] = 3] = "PENDING";
    ConversionStatus[ConversionStatus["ABANDONED"] = 4] = "ABANDONED";
})(ConversionStatus = exports.ConversionStatus || (exports.ConversionStatus = {}));
/**
 * 跟进状态
 */
var FollowUpStatus;
(function (FollowUpStatus) {
    FollowUpStatus[FollowUpStatus["NOT_FOLLOWED_UP"] = 0] = "NOT_FOLLOWED_UP";
    FollowUpStatus[FollowUpStatus["CONTACTED"] = 1] = "CONTACTED";
    FollowUpStatus[FollowUpStatus["FOLLOWED_UP"] = 2] = "FOLLOWED_UP";
    FollowUpStatus[FollowUpStatus["NEEDS_FOLLOW_UP"] = 3] = "NEEDS_FOLLOW_UP";
    FollowUpStatus[FollowUpStatus["CONFIRMED_INTENTION"] = 4] = "CONFIRMED_INTENTION";
    FollowUpStatus[FollowUpStatus["NO_INTENTION"] = 5] = "NO_INTENTION";
    FollowUpStatus[FollowUpStatus["CONVERTED"] = 6] = "CONVERTED";
    FollowUpStatus[FollowUpStatus["GAVE_UP"] = 7] = "GAVE_UP";
})(FollowUpStatus = exports.FollowUpStatus || (exports.FollowUpStatus = {}));
var ConversionTracking = /** @class */ (function (_super) {
    __extends(ConversionTracking, _super);
    function ConversionTracking() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConversionTracking;
}(sequelize_1.Model));
exports.ConversionTracking = ConversionTracking;
var initConversionTracking = function (sequelize) {
    ConversionTracking.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '转化跟踪ID'
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
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '家长ID',
            references: {
                model: 'parent_student_relations',
                key: 'id'
            }
        },
        campaignId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '营销活动ID',
            references: {
                model: 'marketing_campaigns',
                key: 'id'
            }
        },
        channelId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '渠道ID',
            references: {
                model: 'channel_trackings',
                key: 'id'
            }
        },
        advertisementId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '广告ID',
            references: {
                model: 'advertisements',
                key: 'id'
            }
        },
        conversionType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '转化类型: 1=注册,2=咨询,3=报名,4=缴费,5=活动参与,6=分享,7=下载资料,8=预约参观,9=其他'
        },
        conversionSource: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '转化来源'
        },
        conversionEvent: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '转化事件'
        },
        eventValue: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '事件价值'
        },
        eventTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '事件时间'
        },
        conversionStatus: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ConversionStatus.UNPROCESSED,
            comment: '转化状态: 0=未处理,1=有效转化,2=无效转化,3=待确认,4=已放弃'
        },
        followUpStatus: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: FollowUpStatus.NOT_FOLLOWED_UP,
            comment: '跟进状态: 0=未跟进,1=已联系,2=已回访,3=需再次联系,4=已确认意向,5=无意向,6=已转化,7=已放弃'
        },
        isFirstVisit: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否首次访问'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize: sequelize,
        tableName: 'conversion_trackings',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ConversionTracking;
};
exports.initConversionTracking = initConversionTracking;
var initConversionTrackingAssociations = function () {
    ConversionTracking.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    ConversionTracking.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'parentId',
        as: 'parent'
    });
    ConversionTracking.belongsTo(marketing_campaign_model_1.MarketingCampaign, {
        foreignKey: 'campaignId',
        as: 'campaign'
    });
    ConversionTracking.belongsTo(channel_tracking_model_1.ChannelTracking, {
        foreignKey: 'channelId',
        as: 'channel'
    });
    ConversionTracking.belongsTo(advertisement_model_1.Advertisement, {
        foreignKey: 'advertisementId',
        as: 'advertisement'
    });
};
exports.initConversionTrackingAssociations = initConversionTrackingAssociations;
