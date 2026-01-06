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
exports.Role = exports.RoleStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var permission_model_1 = require("./permission.model");
var user_role_model_1 = require("./user-role.model");
var role_permission_model_1 = require("./role-permission.model");
var RoleStatus;
(function (RoleStatus) {
    RoleStatus[RoleStatus["ENABLED"] = 1] = "ENABLED";
    RoleStatus[RoleStatus["DISABLED"] = 0] = "DISABLED";
})(RoleStatus = exports.RoleStatus || (exports.RoleStatus = {}));
var Role = /** @class */ (function (_super) {
    __extends(Role, _super);
    function Role() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Role.initModel = function (sequelize) {
        Role.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '角色名称'
            },
            code: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '角色编码'
            },
            description: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                comment: '角色描述'
            },
            status: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: RoleStatus.ENABLED,
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
            tableName: 'roles',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Role.initAssociations = function () {
        Role.belongsToMany(user_model_1.User, {
            through: user_role_model_1.UserRole,
            foreignKey: 'roleId',
            otherKey: 'userId',
            as: 'users'
        });
        Role.belongsToMany(permission_model_1.Permission, {
            through: role_permission_model_1.RolePermission,
            foreignKey: 'roleId',
            otherKey: 'permissionId',
            as: 'permissions'
        });
    };
    return Role;
}(sequelize_1.Model));
exports.Role = Role;
