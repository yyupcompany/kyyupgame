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
exports.GameLevel = void 0;
var sequelize_1 = require("sequelize");
var GameLevel = /** @class */ (function (_super) {
    __extends(GameLevel, _super);
    function GameLevel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameLevel.initModel = function (sequelize) {
        GameLevel.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            gameId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            levelNumber: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false
            },
            levelName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true
            },
            difficulty: {
                type: sequelize_1.DataTypes.ENUM('easy', 'medium', 'hard'),
                allowNull: false
            },
            config: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false
            },
            unlockCondition: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            starRequirements: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            rewards: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('active', 'locked'),
                defaultValue: 'active'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        }, {
            sequelize: sequelize,
            tableName: 'game_levels',
            timestamps: false,
            underscored: true
        });
    };
    return GameLevel;
}(sequelize_1.Model));
exports.GameLevel = GameLevel;
