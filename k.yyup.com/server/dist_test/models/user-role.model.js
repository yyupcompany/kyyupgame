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
exports.UserRole = exports.IsPrimaryRole = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var role_model_1 = require("./role.model");
var IsPrimaryRole;
(function (IsPrimaryRole) {
    IsPrimaryRole[IsPrimaryRole["NO"] = 0] = "NO";
    IsPrimaryRole[IsPrimaryRole["YES"] = 1] = "YES";
})(IsPrimaryRole = exports.IsPrimaryRole || (exports.IsPrimaryRole = {}));
var UserRole = /** @class */ (function (_super) {
    __extends(UserRole, _super);
    function UserRole() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserRole.initModel = function (sequelize) {
        UserRole.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '主键ID'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '用户ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
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
            isPrimary: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: IsPrimaryRole.NO,
                comment: '是否主角色：0-否，1-是'
            },
            startTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '授权开始时间'
            },
            endTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '授权结束时间'
            },
            grantorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '授权人ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
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
            tableName: 'user_roles',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    UserRole.initAssociations = function () {
        UserRole.belongsTo(user_model_1.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        UserRole.belongsTo(role_model_1.Role, {
            foreignKey: 'roleId',
            as: 'role'
        });
        UserRole.belongsTo(user_model_1.User, {
            foreignKey: 'grantorId',
            as: 'grantor'
        });
    };
    return UserRole;
}(sequelize_1.Model));
exports.UserRole = UserRole;
