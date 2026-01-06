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
exports.initActivityShareAssociations = exports.initActivityShare = exports.ActivityShare = void 0;
var sequelize_1 = require("sequelize");
var ActivityShare = /** @class */ (function (_super) {
    __extends(ActivityShare, _super);
    function ActivityShare() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActivityShare;
}(sequelize_1.Model));
exports.ActivityShare = ActivityShare;
var initActivityShare = function (sequelize) {
    ActivityShare.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '分享记录ID'
        },
        activityId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动ID'
        },
        posterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '分享的海报ID'
        },
        shareChannel: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '分享渠道'
        },
        shareUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '分享链接'
        },
        sharerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '分享者ID'
        },
        shareIp: {
            type: sequelize_1.DataTypes.STRING(45),
            allowNull: true,
            comment: '分享者IP'
        },
        parentSharerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '上级分享者ID（用于记录分享层级关系）'
        },
        shareLevel: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '分享层级（1=一级分享，2=二级分享，3=三级分享）'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'activity_shares',
        timestamps: false,
        underscored: true
    });
    return ActivityShare;
};
exports.initActivityShare = initActivityShare;
// 设置关联关系的函数
var initActivityShareAssociations = function () {
    var Activity = require('./activity.model').Activity;
    var PosterGeneration = require('./poster-generation.model').PosterGeneration;
    var User = require('./user.model').User;
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
exports.initActivityShareAssociations = initActivityShareAssociations;
