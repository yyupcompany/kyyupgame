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
exports.initSystemConfigAssociations = exports.initSystemConfig = exports.SystemConfig = exports.ConfigValueType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * 配置值类型
 */
var ConfigValueType;
(function (ConfigValueType) {
    ConfigValueType["STRING"] = "string";
    ConfigValueType["NUMBER"] = "number";
    ConfigValueType["BOOLEAN"] = "boolean";
    ConfigValueType["JSON"] = "json";
})(ConfigValueType = exports.ConfigValueType || (exports.ConfigValueType = {}));
var SystemConfig = /** @class */ (function (_super) {
    __extends(SystemConfig, _super);
    function SystemConfig() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SystemConfig;
}(sequelize_1.Model));
exports.SystemConfig = SystemConfig;
var initSystemConfig = function (sequelize) {
    SystemConfig.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '配置ID'
        },
        groupKey: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '配置分组键名'
        },
        configKey: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '配置项键名'
        },
        configValue: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '配置项值'
        },
        valueType: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '值类型: string, number, boolean, json'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '配置描述'
        },
        isSystem: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否系统配置'
        },
        isReadonly: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否只读配置'
        },
        sortOrder: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '排序顺序'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '更新时间'
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '删除时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'system_configs',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['group_key', 'config_key']
            },
        ]
    });
    return SystemConfig;
};
exports.initSystemConfig = initSystemConfig;
var initSystemConfigAssociations = function () {
    SystemConfig.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    SystemConfig.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initSystemConfigAssociations = initSystemConfigAssociations;
