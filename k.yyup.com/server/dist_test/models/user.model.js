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
exports.User = exports.UserStatus = exports.UserRole = void 0;
var sequelize_1 = require("sequelize");
var parent_model_1 = require("./parent.model");
var teacher_model_1 = require("./teacher.model");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["LOCKED"] = "locked";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    User.initModel = function (sequelize) {
        User.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            username: {
                type: new sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                unique: true,
                comment: '用户名'
            },
            password: {
                type: new sequelize_1.DataTypes.STRING(128),
                allowNull: true,
                comment: '密码'
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                },
                comment: '邮箱'
            },
            role: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(UserRole)),
                allowNull: false,
                defaultValue: UserRole.USER,
                comment: '角色'
            },
            realName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                comment: '真实姓名'
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                comment: '手机号'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(UserStatus)),
                allowNull: false,
                defaultValue: UserStatus.ACTIVE,
                comment: '状态'
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
            tableName: 'users',
            timestamps: true
        });
    };
    User.initAssociations = function () {
        // ✅ 移除重复的User-Role关联定义，该关联已在server/src/models/index.ts的setupAssociations()中定义
        // User.belongsToMany(Role, {
        //   through: UserRoleModel,
        //   foreignKey: 'userId',
        //   otherKey: 'roleId',
        //   as: 'roles',
        // });
        // Add the missing association - temporarily commented out due to model issues
        // User.belongsToMany(EnrollmentPlan, {
        //   through: EnrollmentPlanAssignee,
        //   foreignKey: 'assigneeId',
        //   otherKey: 'planId',
        //   as: 'assignedPlans',
        // });
        // Add Parent association
        User.hasMany(parent_model_1.Parent, { foreignKey: 'userId', as: 'parentRelations' });
        // Add Teacher association
        // 注意：Teacher模型使用了underscored: true，所以数据库中的字段名是user_id
        User.hasOne(teacher_model_1.Teacher, { foreignKey: 'user_id', as: 'teacher' });
    };
    return User;
}(sequelize_1.Model));
exports.User = User;
