"use strict";
/**
 * 安全配置模型
 * 用于存储系统安全配置信息
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
exports.SecurityConfig = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var SecurityConfig = /** @class */ (function (_super) {
    __extends(SecurityConfig, _super);
    function SecurityConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SecurityConfig;
}(sequelize_1.Model));
exports.SecurityConfig = SecurityConfig;
SecurityConfig.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    configKey: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '配置键名'
    },
    configValue: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '配置值（JSON格式）'
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: '配置描述'
    },
    category: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general',
        comment: '配置分类：如password、session、auth等'
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否启用'
    },
    updatedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人员ID'
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
    sequelize: init_1.sequelize,
    tableName: 'security_configs',
    timestamps: true,
    indexes: [
        {
            fields: ['configKey'],
            unique: true
        },
        {
            fields: ['category']
        },
        {
            fields: ['isActive']
        }
    ],
    comment: '安全配置表'
});
exports["default"] = SecurityConfig;
