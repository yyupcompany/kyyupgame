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
exports.UserAchievement = void 0;
var sequelize_1 = require("sequelize");
var UserAchievement = /** @class */ (function (_super) {
    __extends(UserAchievement, _super);
    function UserAchievement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserAchievement.initModel = function (sequelize) {
        UserAchievement.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            childId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            achievementId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            unlockedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            progress: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            isNotified: {
                type: sequelize_1.DataTypes.TINYINT,
                defaultValue: 0
            }
        }, {
            sequelize: sequelize,
            tableName: 'user_achievements',
            timestamps: false,
            underscored: true
        });
    };
    return UserAchievement;
}(sequelize_1.Model));
exports.UserAchievement = UserAchievement;
