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
exports.initEnrollmentPlanAssociations = exports.initEnrollmentPlan = exports.EnrollmentPlan = exports.Semester = exports.EnrollmentPlanStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var class_model_1 = require("./class.model");
var kindergarten_model_1 = require("./kindergarten.model");
var enrollment_task_model_1 = require("./enrollment-task.model");
var activity_model_1 = require("./activity.model");
var enrollment_application_model_1 = require("./enrollment-application.model");
var enrollment_plan_class_model_1 = require("./enrollment-plan-class.model");
var enrollment_plan_assignee_model_1 = require("./enrollment-plan-assignee.model");
/**
 * 招生计划状态
 */
var EnrollmentPlanStatus;
(function (EnrollmentPlanStatus) {
    EnrollmentPlanStatus[EnrollmentPlanStatus["DRAFT"] = 0] = "DRAFT";
    EnrollmentPlanStatus[EnrollmentPlanStatus["PENDING"] = 1] = "PENDING";
    EnrollmentPlanStatus[EnrollmentPlanStatus["IN_PROGRESS"] = 2] = "IN_PROGRESS";
    EnrollmentPlanStatus[EnrollmentPlanStatus["FINISHED"] = 3] = "FINISHED";
    EnrollmentPlanStatus[EnrollmentPlanStatus["CANCELLED"] = 4] = "CANCELLED";
})(EnrollmentPlanStatus = exports.EnrollmentPlanStatus || (exports.EnrollmentPlanStatus = {}));
/**
 * 学期
 */
var Semester;
(function (Semester) {
    Semester[Semester["SPRING"] = 1] = "SPRING";
    Semester[Semester["AUTUMN"] = 2] = "AUTUMN";
})(Semester = exports.Semester || (exports.Semester = {}));
/**
 * 招生计划模型
 */
var EnrollmentPlan = /** @class */ (function (_super) {
    __extends(EnrollmentPlan, _super);
    function EnrollmentPlan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 计算招生进度百分比
     * @returns 进度百分比(0-100)
     */
    EnrollmentPlan.prototype.getProgressPercentage = function () {
        if (this.targetCount === 0) {
            return 0;
        }
        // 注意：需要通过关联查询获取申请数量
        // 这里返回0，实际使用时需要在查询时包含applications关联
        return 0;
    };
    EnrollmentPlan.prototype.isEditable = function () {
        return this.status === EnrollmentPlanStatus.DRAFT || this.status === EnrollmentPlanStatus.PENDING;
    };
    EnrollmentPlan.prototype.isExpired = function () {
        var now = new Date();
        return now > this.endDate;
    };
    return EnrollmentPlan;
}(sequelize_1.Model));
exports.EnrollmentPlan = EnrollmentPlan;
var initEnrollmentPlan = function (sequelize) {
    EnrollmentPlan.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '招生计划ID - 主键'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID - 外键关联幼儿园表'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '标题 - 招生计划名称'
        },
        year: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '年份'
        },
        semester: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '学期 - 1:春季 2:秋季'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '计划开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '计划结束日期'
        },
        targetCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'target_count',
            comment: '招生目标人数'
        },
        targetAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'target_amount',
            comment: '招生目标金额'
        },
        ageRange: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            field: 'age_range',
            comment: '招生年龄范围'
        },
        requirements: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '招生要求'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '招生计划描述'
        },
        approvedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'approved_by',
            comment: '审批人ID'
        },
        approvedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'approved_at',
            comment: '审批时间'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注信息'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: EnrollmentPlanStatus.DRAFT,
            comment: '招生状态 - 0:草稿 1:待开始 2:进行中 3:已结束 4:已取消'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'creator_id',
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'updater_id',
            comment: '更新人ID'
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
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'enrollment_plans',
        timestamps: true,
        paranoid: true,
        underscored: true,
        comment: '招生计划表'
    });
    return EnrollmentPlan;
};
exports.initEnrollmentPlan = initEnrollmentPlan;
var initEnrollmentPlanAssociations = function () {
    // 招生计划属于某个幼儿园
    EnrollmentPlan.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    // 一个招生计划可以包含多个招生任务
    EnrollmentPlan.hasMany(enrollment_task_model_1.EnrollmentTask, {
        foreignKey: 'planId',
        as: 'tasks',
        onDelete: 'CASCADE'
    });
    // 一个招生计划可以包含多个活动
    EnrollmentPlan.hasMany(activity_model_1.Activity, {
        foreignKey: 'planId',
        as: 'activities',
        onDelete: 'SET NULL'
    });
    // 一个招生计划可以收到多个报名申请
    EnrollmentPlan.hasMany(enrollment_application_model_1.EnrollmentApplication, {
        foreignKey: 'planId',
        as: 'applications',
        onDelete: 'CASCADE'
    });
    // 招生计划与班级是多对多关系
    EnrollmentPlan.belongsToMany(class_model_1.Class, {
        through: enrollment_plan_class_model_1.EnrollmentPlanClass,
        foreignKey: 'planId',
        otherKey: 'classId',
        as: 'planClasses'
    });
    // 招生计划与负责人是多对多关系
    EnrollmentPlan.belongsToMany(user_model_1.User, {
        through: enrollment_plan_assignee_model_1.EnrollmentPlanAssignee,
        foreignKey: 'planId',
        otherKey: 'assigneeId',
        as: 'assignees'
    });
    // 创建人
    EnrollmentPlan.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
};
exports.initEnrollmentPlanAssociations = initEnrollmentPlanAssociations;
