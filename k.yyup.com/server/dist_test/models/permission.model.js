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
exports.Permission = exports.PermissionStatus = exports.PermissionType = void 0;
var sequelize_1 = require("sequelize");
var role_model_1 = require("./role.model");
var role_permission_model_1 = require("./role-permission.model");
var PermissionType;
(function (PermissionType) {
    PermissionType["MENU"] = "menu";
    PermissionType["BUTTON"] = "button";
})(PermissionType = exports.PermissionType || (exports.PermissionType = {}));
var PermissionStatus;
(function (PermissionStatus) {
    PermissionStatus[PermissionStatus["ENABLED"] = 1] = "ENABLED";
    PermissionStatus[PermissionStatus["DISABLED"] = 0] = "DISABLED";
})(PermissionStatus = exports.PermissionStatus || (exports.PermissionStatus = {}));
var Permission = /** @class */ (function (_super) {
    __extends(Permission, _super);
    function Permission() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Permission.initModel = function (sequelize) {
        Permission.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                comment: '权限名称'
            },
            chineseName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '中文名称',
                field: 'chinese_name'
            },
            code: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '权限编码'
            },
            type: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                comment: '权限类型(menu, button)'
            },
            parentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '父权限ID'
            },
            path: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: false,
                comment: '路由路径'
            },
            component: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                comment: '组件路径'
            },
            permission: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                comment: '权限标识'
            },
            icon: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                comment: '图标'
            },
            sort: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '排序'
            },
            status: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: PermissionStatus.ENABLED,
                comment: '状态(1:启用 0:禁用)'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize: sequelize,
            tableName: 'permissions',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Permission.initAssociations = function () {
        Permission.belongsTo(Permission, {
            foreignKey: 'parentId',
            as: 'parent'
        });
        Permission.hasMany(Permission, {
            foreignKey: 'parentId',
            as: 'children'
        });
        Permission.belongsToMany(role_model_1.Role, {
            through: role_permission_model_1.RolePermission,
            foreignKey: 'permissionId',
            otherKey: 'roleId',
            as: 'roles'
        });
    };
    return Permission;
}(sequelize_1.Model));
exports.Permission = Permission;
