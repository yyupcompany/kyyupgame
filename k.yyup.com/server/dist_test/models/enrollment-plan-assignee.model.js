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
exports.initEnrollmentPlanAssigneeAssociations = exports.initEnrollmentPlanAssignee = exports.EnrollmentPlanAssignee = exports.AssigneeRole = void 0;
var sequelize_1 = require("sequelize");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var user_model_1 = require("./user.model");
var AssigneeRole;
(function (AssigneeRole) {
    AssigneeRole["PRIMARY"] = "primary";
    AssigneeRole["SECONDARY"] = "secondary";
})(AssigneeRole = exports.AssigneeRole || (exports.AssigneeRole = {}));
var EnrollmentPlanAssignee = /** @class */ (function (_super) {
    __extends(EnrollmentPlanAssignee, _super);
    function EnrollmentPlanAssignee() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EnrollmentPlanAssignee;
}(sequelize_1.Model));
exports.EnrollmentPlanAssignee = EnrollmentPlanAssignee;
var initEnrollmentPlanAssignee = function (sequelize) {
    EnrollmentPlanAssignee.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '关联ID - 主键'
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '招生计划ID - 外键关联招生计划表',
            references: {
                model: 'enrollment_plans',
                key: 'id'
            }
        },
        assigneeId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '负责人ID - 外键关联用户表',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        role: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(AssigneeRole)),
            allowNull: false,
            defaultValue: AssigneeRole.SECONDARY,
            comment: '负责类型：primary-主负责人, secondary-协助负责人'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注'
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
        tableName: 'enrollment_plan_assignees',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return EnrollmentPlanAssignee;
};
exports.initEnrollmentPlanAssignee = initEnrollmentPlanAssignee;
var initEnrollmentPlanAssigneeAssociations = function () {
    EnrollmentPlanAssignee.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    EnrollmentPlanAssignee.belongsTo(user_model_1.User, {
        foreignKey: 'assigneeId',
        as: 'assignee'
    });
};
exports.initEnrollmentPlanAssigneeAssociations = initEnrollmentPlanAssigneeAssociations;
