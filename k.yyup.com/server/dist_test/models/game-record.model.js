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
exports.GameRecord = void 0;
var sequelize_1 = require("sequelize");
var GameRecord = /** @class */ (function (_super) {
    __extends(GameRecord, _super);
    function GameRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameRecord.initModel = function (sequelize) {
        GameRecord.init({
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
            gameId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            levelId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            score: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            stars: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            timeSpent: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            accuracy: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true
            },
            mistakes: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            comboMax: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            gameData: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            completedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize: sequelize,
            tableName: 'game_records',
            timestamps: false,
            underscored: true
        });
    };
    return GameRecord;
}(sequelize_1.Model));
exports.GameRecord = GameRecord;
