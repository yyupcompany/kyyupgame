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
exports.GameUserSettings = void 0;
var sequelize_1 = require("sequelize");
var GameUserSettings = /** @class */ (function (_super) {
    __extends(GameUserSettings, _super);
    function GameUserSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameUserSettings.initModel = function (sequelize) {
        GameUserSettings.init({
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
            bgmVolume: {
                type: sequelize_1.DataTypes.FLOAT,
                defaultValue: 0.5
            },
            sfxVolume: {
                type: sequelize_1.DataTypes.FLOAT,
                defaultValue: 0.8
            },
            voiceVolume: {
                type: sequelize_1.DataTypes.FLOAT,
                defaultValue: 1.0
            },
            difficultyPreference: {
                type: sequelize_1.DataTypes.ENUM('auto', 'easy', 'medium', 'hard'),
                defaultValue: 'auto'
            },
            animationSpeed: {
                type: sequelize_1.DataTypes.FLOAT,
                defaultValue: 1.0
            },
            showHints: {
                type: sequelize_1.DataTypes.TINYINT,
                defaultValue: 1
            },
            vibrationEnabled: {
                type: sequelize_1.DataTypes.TINYINT,
                defaultValue: 1
            },
            settings: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize: sequelize,
            tableName: 'game_user_settings',
            timestamps: false,
            underscored: true
        });
    };
    return GameUserSettings;
}(sequelize_1.Model));
exports.GameUserSettings = GameUserSettings;
