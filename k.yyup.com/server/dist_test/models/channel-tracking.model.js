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
exports.initChannelTrackingAssociations = exports.initChannelTracking = exports.ChannelTracking = exports.ChannelStatus = exports.ChannelType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
/**
 * 渠道类型
 */
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["SEARCH_ENGINE"] = 1] = "SEARCH_ENGINE";
    ChannelType[ChannelType["SOCIAL_MEDIA"] = 2] = "SOCIAL_MEDIA";
    ChannelType[ChannelType["EMAIL"] = 3] = "EMAIL";
    ChannelType[ChannelType["SMS"] = 4] = "SMS";
    ChannelType[ChannelType["OFFLINE_EVENT"] = 5] = "OFFLINE_EVENT";
    ChannelType[ChannelType["REFERRAL"] = 6] = "REFERRAL";
    ChannelType[ChannelType["PARTNER"] = 7] = "PARTNER";
    ChannelType[ChannelType["DIRECT_ACCESS"] = 8] = "DIRECT_ACCESS";
    ChannelType[ChannelType["OTHER"] = 9] = "OTHER";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
/**
 * 渠道状态
 */
var ChannelStatus;
(function (ChannelStatus) {
    ChannelStatus[ChannelStatus["DISABLED"] = 0] = "DISABLED";
    ChannelStatus[ChannelStatus["ACTIVE"] = 1] = "ACTIVE";
    ChannelStatus[ChannelStatus["PAUSED"] = 2] = "PAUSED";
    ChannelStatus[ChannelStatus["ENDED"] = 3] = "ENDED";
})(ChannelStatus = exports.ChannelStatus || (exports.ChannelStatus = {}));
var ChannelTracking = /** @class */ (function (_super) {
    __extends(ChannelTracking, _super);
    function ChannelTracking() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ChannelTracking;
}(sequelize_1.Model));
exports.ChannelTracking = ChannelTracking;
var initChannelTracking = function (sequelize) {
    ChannelTracking.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '渠道跟踪ID'
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
        channelName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '渠道名称'
        },
        channelType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '渠道类型 - 1:搜索引擎 2:社交媒体 3:电子邮件 4:短信 5:线下活动 6:推荐 7:合作伙伴 8:直接访问 9:其他'
        },
        utmSource: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'UTM来源'
        },
        utmMedium: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'UTM媒介'
        },
        utmCampaign: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'UTM活动'
        },
        utmContent: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'UTM内容'
        },
        utmTerm: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'UTM关键词'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '结束日期'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '渠道描述'
        },
        cost: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '渠道成本'
        },
        visitCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '访问次数'
        },
        registrationCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '报名次数'
        },
        leadCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '线索数量'
        },
        conversionCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '转化数量'
        },
        conversionRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: '转化率(%)'
        },
        costPerLead: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '每个线索成本'
        },
        costPerConversion: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '每次转化成本'
        },
        revenue: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '产生收入'
        },
        roi: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '投资回报率'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ChannelStatus.DISABLED,
            comment: '状态 - 0:未启用 1:活跃中 2:已暂停 3:已结束'
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
        tableName: 'channel_trackings',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ChannelTracking;
};
exports.initChannelTracking = initChannelTracking;
var initChannelTrackingAssociations = function () {
    ChannelTracking.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    ChannelTracking.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ChannelTracking.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initChannelTrackingAssociations = initChannelTrackingAssociations;
