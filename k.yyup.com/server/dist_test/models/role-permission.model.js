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
exports.RolePermission = void 0;
var sequelize_1 = require("sequelize");
var role_model_1 = require("./role.model");
var permission_model_1 = require("./permission.model");
var user_model_1 = require("./user.model");
var RolePermission = /** @class */ (function (_super) {
    __extends(RolePermission, _super);
    function RolePermission() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RolePermission.initModel = function (sequelize) {
        RolePermission.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '主键ID'
            },
            roleId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '角色ID',
                references: {
                    model: 'roles',
                    key: 'id'
                }
            },
            permissionId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '权限ID',
                references: {
                    model: 'permissions',
                    key: 'id'
                }
            },
            grantorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '授权人ID'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize: sequelize,
            tableName: 'role_permissions',
            timestamps: true,
            paranoid: false,
            underscored: true
        });
    };
    RolePermission.initAssociations = function () {
        RolePermission.belongsTo(role_model_1.Role, {
            foreignKey: 'roleId',
            as: 'role'
        });
        RolePermission.belongsTo(permission_model_1.Permission, {
            foreignKey: 'permissionId',
            as: 'permission'
        });
        RolePermission.belongsTo(user_model_1.User, {
            foreignKey: 'grantorId',
            as: 'grantor'
        });
    };
    return RolePermission;
}(sequelize_1.Model));
exports.RolePermission = RolePermission;
