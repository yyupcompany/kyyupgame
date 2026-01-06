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
exports.TaskStatus = exports.TaskPriority = void 0;
var sequelize_1 = require("sequelize");
// 任务优先级枚举
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority = exports.TaskPriority || (exports.TaskPriority = {}));
// 任务状态枚举
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
// 检查任务模型
var InspectionTask = /** @class */ (function (_super) {
    __extends(InspectionTask, _super);
    function InspectionTask() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 初始化模型
    InspectionTask.initModel = function (sequelize) {
        InspectionTask.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            inspectionPlanId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'inspection_plan_id',
                comment: '检查计划ID'
            },
            parentTaskId: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'parent_task_id',
                comment: '父任务ID(支持树状结构)'
            },
            title: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: false,
                comment: '任务标题'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                comment: '任务描述'
            },
            assignedTo: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'assigned_to',
                comment: '分配给(用户ID)'
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(TaskPriority)),
                defaultValue: TaskPriority.MEDIUM,
                comment: '优先级'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(TaskStatus)),
                defaultValue: TaskStatus.PENDING,
                comment: '状态'
            },
            progress: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
                comment: '进度(0-100)',
                validate: {
                    min: 0,
                    max: 100
                }
            },
            startDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                field: 'start_date',
                comment: '开始日期'
            },
            dueDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                field: 'due_date',
                comment: '截止日期'
            },
            completedDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                field: 'completed_date',
                comment: '完成日期'
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'sort_order',
                defaultValue: 0,
                comment: '排序'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'created_by',
                comment: '创建人ID'
            }
        }, {
            sequelize: sequelize,
            tableName: 'inspection_tasks',
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ['inspection_plan_id'] },
                { fields: ['parent_task_id'] },
                { fields: ['assigned_to'] },
                { fields: ['status'] },
                { fields: ['due_date'] },
            ]
        });
    };
    return InspectionTask;
}(sequelize_1.Model));
exports["default"] = InspectionTask;
