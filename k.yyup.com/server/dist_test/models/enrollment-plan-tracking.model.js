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
exports.EnrollmentPlanTracking = void 0;
var sequelize_1 = require("sequelize");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var user_model_1 = require("./user.model");
var EnrollmentPlanTracking = /** @class */ (function (_super) {
    __extends(EnrollmentPlanTracking, _super);
    function EnrollmentPlanTracking() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnrollmentPlanTracking.initModel = function (sequelize) {
        EnrollmentPlanTracking.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '跟踪ID - 主键'
            },
            planId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'plan_id',
                comment: '招生计划ID - 外键关联招生计划表',
                references: {
                    model: 'enrollment_plans',
                    key: 'id'
                }
            },
            date: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
                comment: '日期'
            },
            count: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '当日招生人数'
            },
            source: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                comment: '来源渠道'
            },
            assigneeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'assignee_id',
                comment: '负责人ID - 外键关联用户表',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            remark: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '备注'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'created_by',
                comment: '创建人ID - 外键关联用户表',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                comment: '创建时间'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                comment: '更新时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'enrollment_plan_trackings',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    EnrollmentPlanTracking.initAssociations = function () {
        EnrollmentPlanTracking.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
            foreignKey: 'planId',
            as: 'plan'
        });
        EnrollmentPlanTracking.belongsTo(user_model_1.User, {
            foreignKey: 'assigneeId',
            as: 'assignee'
        });
        EnrollmentPlanTracking.belongsTo(user_model_1.User, {
            foreignKey: 'createdBy',
            as: 'creator'
        });
    };
    return EnrollmentPlanTracking;
}(sequelize_1.Model));
exports.EnrollmentPlanTracking = EnrollmentPlanTracking;
exports["default"] = EnrollmentPlanTracking;
