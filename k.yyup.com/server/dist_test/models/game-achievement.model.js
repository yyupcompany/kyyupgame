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
exports.GameAchievement = void 0;
var sequelize_1 = require("sequelize");
var GameAchievement = /** @class */ (function (_super) {
    __extends(GameAchievement, _super);
    function GameAchievement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameAchievement.initModel = function (sequelize) {
        GameAchievement.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            achievementKey: {
                type: sequelize_1.DataTypes.STRING(50),
                unique: true,
                allowNull: false
            },
            achievementName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            iconUrl: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true
            },
            category: {
                type: sequelize_1.DataTypes.ENUM('beginner', 'advanced', 'master', 'special'),
                allowNull: false
            },
            condition: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false
            },
            reward: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize: sequelize,
            tableName: 'game_achievements',
            timestamps: false,
            underscored: true
        });
    };
    return GameAchievement;
}(sequelize_1.Model));
exports.GameAchievement = GameAchievement;
