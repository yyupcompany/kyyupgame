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
exports.initEnrollmentTaskAssociations = exports.initEnrollmentTask = exports.EnrollmentTask = exports.TaskStatus = exports.TaskPriority = exports.EnrollmentTaskType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var teacher_model_1 = require("./teacher.model");
/**
 * 招生任务类型
 */
var EnrollmentTaskType;
(function (EnrollmentTaskType) {
    EnrollmentTaskType[EnrollmentTaskType["ONLINE_PROMOTION"] = 1] = "ONLINE_PROMOTION";
    EnrollmentTaskType[EnrollmentTaskType["OFFLINE_SEMINAR"] = 2] = "OFFLINE_SEMINAR";
    EnrollmentTaskType[EnrollmentTaskType["CONSULTATION_RECEPTION"] = 3] = "CONSULTATION_RECEPTION";
    EnrollmentTaskType[EnrollmentTaskType["ASSESSMENT"] = 4] = "ASSESSMENT";
    EnrollmentTaskType[EnrollmentTaskType["OTHER"] = 5] = "OTHER";
})(EnrollmentTaskType = exports.EnrollmentTaskType || (exports.EnrollmentTaskType = {}));
/**
 * 任务优先级
 */
var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["URGENT"] = 1] = "URGENT";
    TaskPriority[TaskPriority["HIGH"] = 2] = "HIGH";
    TaskPriority[TaskPriority["MEDIUM"] = 3] = "MEDIUM";
    TaskPriority[TaskPriority["LOW"] = 4] = "LOW";
})(TaskPriority = exports.TaskPriority || (exports.TaskPriority = {}));
/**
 * 任务状态
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["NOT_STARTED"] = 0] = "NOT_STARTED";
    TaskStatus[TaskStatus["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    TaskStatus[TaskStatus["COMPLETED"] = 2] = "COMPLETED";
    TaskStatus[TaskStatus["TERMINATED"] = 3] = "TERMINATED";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
var EnrollmentTask = /** @class */ (function (_super) {
    __extends(EnrollmentTask, _super);
    function EnrollmentTask() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EnrollmentTask;
}(sequelize_1.Model));
exports.EnrollmentTask = EnrollmentTask;
var initEnrollmentTask = function (sequelize) {
    EnrollmentTask.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '招生任务ID'
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '招生计划ID',
            references: {
                model: 'enrollment_plans',
                key: 'id'
            }
        },
        teacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '教师ID',
            references: {
                model: 'teachers',
                key: 'id'
            }
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '任务标题'
        },
        taskType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '任务类型 - 1:线上宣传 2:线下宣讲 3:咨询接待 4:考核评估 5:其他'
        },
        targetCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '目标完成人数'
        },
        actualCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '实际完成人数'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '任务开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '任务结束日期'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '任务描述'
        },
        requirement: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '任务要求'
        },
        priority: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: TaskPriority.MEDIUM,
            comment: '优先级 - 1:紧急 2:高 3:中 4:低'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: TaskStatus.NOT_STARTED,
            comment: '任务状态 - 0:未开始 1:进行中 2:已完成 3:已终止'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注'
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
        tableName: 'enrollment_tasks',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return EnrollmentTask;
};
exports.initEnrollmentTask = initEnrollmentTask;
var initEnrollmentTaskAssociations = function () {
    EnrollmentTask.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    EnrollmentTask.belongsTo(teacher_model_1.Teacher, {
        foreignKey: 'teacherId',
        as: 'teacher'
    });
    EnrollmentTask.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    EnrollmentTask.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initEnrollmentTaskAssociations = initEnrollmentTaskAssociations;
