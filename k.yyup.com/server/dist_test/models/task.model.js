"use strict";
/**
 * Task模型 - 通用任务模型
 * 这是Todo模型的别名，用于教师任务管理
 */
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
exports.Task = exports.TaskStatus = exports.TaskPriority = void 0;
var sequelize_1 = require("sequelize");
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["HIGH"] = "high";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["LOW"] = "low";
})(TaskPriority = exports.TaskPriority || (exports.TaskPriority = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["OVERDUE"] = "overdue";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
var Task = /** @class */ (function (_super) {
    __extends(Task, _super);
    function Task() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Task.initModel = function (sequelize) {
        Task.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: false,
                comment: '任务标题'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '任务描述'
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('high', 'medium', 'low'),
                allowNull: false,
                defaultValue: 'medium',
                comment: '优先级'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
                allowNull: false,
                defaultValue: 'pending',
                comment: '任务状态'
            },
            due_date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '截止日期'
            },
            creator_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '创建人ID'
            },
            assignee_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '分配人ID'
            },
            progress: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '进度(0-100)'
            },
            type: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                comment: '任务类型'
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'created_at'
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'updated_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'tasks',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        });
    };
    Task.associate = function (models) {
        // Task -> User (creator)
        Task.belongsTo(models.User, {
            foreignKey: 'creator_id',
            as: 'creator'
        });
        // Task -> User (assignee)
        Task.belongsTo(models.User, {
            foreignKey: 'assignee_id',
            as: 'assignee'
        });
    };
    return Task;
}(sequelize_1.Model));
exports.Task = Task;
exports["default"] = Task;
