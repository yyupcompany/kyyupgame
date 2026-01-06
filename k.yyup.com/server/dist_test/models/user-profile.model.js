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
exports.UserProfile = exports.Gender = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var Gender;
(function (Gender) {
    Gender[Gender["UNKNOWN"] = 0] = "UNKNOWN";
    Gender[Gender["MALE"] = 1] = "MALE";
    Gender[Gender["FEMALE"] = 2] = "FEMALE";
})(Gender = exports.Gender || (exports.Gender = {}));
var UserProfile = /** @class */ (function (_super) {
    __extends(UserProfile, _super);
    function UserProfile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserProfile.initModel = function (sequelize) {
        UserProfile.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '用户资料ID'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                comment: '用户ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            avatar: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                comment: '用户头像URL'
            },
            gender: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: true,
                comment: '性别 0:未知 1:男 2:女'
            },
            birthday: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: true,
                comment: '生日'
            },
            address: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                comment: '地址'
            },
            education: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '学历'
            },
            introduction: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '个人介绍'
            },
            tags: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '用户标签，JSON字符串存储'
            },
            contactInfo: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '联系信息，JSON字符串存储'
            },
            extendedInfo: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '扩展信息，JSON字符串存储'
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
            tableName: 'user_profiles',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    UserProfile.initAssociations = function () {
        UserProfile.belongsTo(user_model_1.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };
    return UserProfile;
}(sequelize_1.Model));
exports.UserProfile = UserProfile;
