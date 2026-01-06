"use strict";
/**
 * PerformanceRule 模型
 * 对应数据库表: performance_rules
 * 自动生成 - 2025-07-20T21:41:47.101Z
 */
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
exports.PerformanceRule = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
// 定义模型类
var PerformanceRule = /** @class */ (function (_super) {
    __extends(PerformanceRule, _super);
    function PerformanceRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PerformanceRule;
}(sequelize_1.Model));
exports.PerformanceRule = PerformanceRule;
// 初始化模型
PerformanceRule.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    calculation_method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    target_value: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    bonus_amount: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    start_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    end_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    kindergarten_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    creator_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    updater_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: init_1.sequelize,
    tableName: 'performance_rules',
    modelName: 'PerformanceRule',
    timestamps: true,
    underscored: true,
    paranoid: true
});
exports["default"] = PerformanceRule;
