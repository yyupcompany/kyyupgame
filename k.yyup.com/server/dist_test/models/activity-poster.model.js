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
exports.initActivityPoster = exports.ActivityPoster = void 0;
var sequelize_1 = require("sequelize");
var ActivityPoster = /** @class */ (function (_super) {
    __extends(ActivityPoster, _super);
    function ActivityPoster() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActivityPoster;
}(sequelize_1.Model));
exports.ActivityPoster = ActivityPoster;
var initActivityPoster = function (sequelize) {
    ActivityPoster.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '关联ID'
        },
        activityId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动ID'
        },
        posterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '海报ID'
        },
        posterType: {
            type: sequelize_1.DataTypes.ENUM('main', 'share', 'detail', 'preview'),
            allowNull: false,
            defaultValue: 'main',
            comment: '海报类型 - main:主海报 share:分享海报 detail:详情海报 preview:预览海报'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否启用'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'activity_posters',
        timestamps: true,
        underscored: true
    });
    return ActivityPoster;
};
exports.initActivityPoster = initActivityPoster;
