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
exports.GameConfig = void 0;
var sequelize_1 = require("sequelize");
var GameConfig = /** @class */ (function (_super) {
    __extends(GameConfig, _super);
    function GameConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameConfig.initModel = function (sequelize) {
        GameConfig.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            gameKey: {
                type: sequelize_1.DataTypes.STRING(50),
                unique: true,
                allowNull: false
            },
            gameName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false
            },
            gameType: {
                type: sequelize_1.DataTypes.ENUM('attention', 'memory', 'logic'),
                allowNull: false
            },
            themeType: {
                type: sequelize_1.DataTypes.ENUM('girl', 'boy', 'neutral'),
                allowNull: false
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            minAge: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            maxAge: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            difficultyLevels: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            resources: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'active'
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize: sequelize,
            tableName: 'game_configs',
            timestamps: true,
            underscored: true
        });
    };
    return GameConfig;
}(sequelize_1.Model));
exports.GameConfig = GameConfig;
