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
exports.Todo = exports.TodoStatus = exports.TodoPriority = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var TodoPriority;
(function (TodoPriority) {
    TodoPriority[TodoPriority["HIGHEST"] = 1] = "HIGHEST";
    TodoPriority[TodoPriority["HIGH"] = 2] = "HIGH";
    TodoPriority[TodoPriority["MEDIUM"] = 3] = "MEDIUM";
    TodoPriority[TodoPriority["LOW"] = 4] = "LOW";
    TodoPriority[TodoPriority["LOWEST"] = 5] = "LOWEST";
})(TodoPriority = exports.TodoPriority || (exports.TodoPriority = {}));
var TodoStatus;
(function (TodoStatus) {
    TodoStatus["PENDING"] = "pending";
    TodoStatus["IN_PROGRESS"] = "in_progress";
    TodoStatus["COMPLETED"] = "completed";
    TodoStatus["CANCELLED"] = "cancelled";
    TodoStatus["OVERDUE"] = "overdue";
})(TodoStatus = exports.TodoStatus || (exports.TodoStatus = {}));
var Todo = /** @class */ (function (_super) {
    __extends(Todo, _super);
    function Todo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 核心修复：添加静态方法来清理数据中的undefined值
    Todo.cleanUndefinedValues = function (data) {
        var cleanedData = {};
        // 遍历所有属性，将undefined转换为null
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            if (value === undefined) {
                console.warn("\u26A0\uFE0F Todo\u6A21\u578B\u6E05\u7406undefined\u503C: ".concat(key, " -> null"));
                cleanedData[key] = null;
            }
            else {
                cleanedData[key] = value;
            }
        });
        console.log('🔍 Todo模型数据清理完成:', Object.keys(cleanedData).length, '个字段');
        return cleanedData;
    };
    Todo.initModel = function (sequelize) {
        Todo.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                comment: '任务标题'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '任务描述'
            },
            priority: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: TodoPriority.MEDIUM,
                comment: '优先级 - 1:最高 2:高 3:中 4:低 5:最低'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(TodoStatus)),
                allowNull: false,
                defaultValue: TodoStatus.PENDING,
                comment: '任务状态'
            },
            dueDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'due_date',
                comment: '截止日期'
            },
            completedDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'completed_date',
                comment: '完成日期'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                comment: '创建用户ID'
            },
            assignedTo: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'assigned_to',
                comment: '分配给用户ID'
            },
            tags: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                comment: '标签列表'
            },
            relatedId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'related_id',
                comment: '关联ID'
            },
            relatedType: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'related_type',
                comment: '关联类型'
            },
            notify: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: '是否通知'
            },
            notifyTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'notify_time',
                comment: '通知时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'todos',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Todo.initAssociations = function () {
        Todo.belongsTo(user_model_1.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Todo.belongsTo(user_model_1.User, {
            foreignKey: 'assignedTo',
            as: 'assignee'
        });
    };
    return Todo;
}(sequelize_1.Model));
exports.Todo = Todo;
exports["default"] = Todo;
