"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TaskService = void 0;
var database_service_1 = require("./database.service");
var task_log_service_1 = require("./task-log.service");
var todo_model_1 = require("../models/todo.model");
var user_model_1 = require("../models/user.model");
var sequelize_1 = require("sequelize");
var TaskService = /** @class */ (function () {
    function TaskService() {
        this.db = new database_service_1.DatabaseService();
        this.logService = new task_log_service_1.TaskLogService();
    }
    /**
     * 获取任务列表
     */
    TaskService.prototype.getTasks = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, filters, sortBy, sortOrder, offset, whereConditions, priorityMap, allowedSortFields, safeSortBy, safeSortOrder, _a, count, tasks;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        page = options.page, limit = options.limit, filters = options.filters, sortBy = options.sortBy, sortOrder = options.sortOrder;
                        offset = (page - 1) * limit;
                        whereConditions = {};
                        if (filters.status) {
                            whereConditions.status = filters.status;
                        }
                        if (filters.priority) {
                            priorityMap = {
                                'low': todo_model_1.TodoPriority.LOW,
                                'medium': todo_model_1.TodoPriority.MEDIUM,
                                'high': todo_model_1.TodoPriority.HIGH,
                                'urgent': todo_model_1.TodoPriority.HIGHEST
                            };
                            whereConditions.priority = priorityMap[filters.priority] || todo_model_1.TodoPriority.MEDIUM;
                        }
                        if (filters.assignee_id) {
                            whereConditions.assignedTo = filters.assignee_id;
                        }
                        if (filters.creator_id) {
                            whereConditions.userId = filters.creator_id;
                        }
                        if (filters.related_type) {
                            whereConditions.relatedType = filters.related_type;
                        }
                        if (filters.related_id) {
                            whereConditions.relatedId = filters.related_id;
                        }
                        if (filters.keyword) {
                            whereConditions[sequelize_1.Op.or] = [
                                { title: (_b = {}, _b[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _b) },
                                { description: (_c = {}, _c[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _c) }
                            ];
                        }
                        allowedSortFields = ['id', 'title', 'status', 'priority', 'createdAt', 'updatedAt', 'dueDate'];
                        safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
                        safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
                        return [4 /*yield*/, todo_model_1.Todo.findAndCountAll({
                                where: whereConditions,
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['id', 'username', 'email']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'username', 'email'],
                                        required: false
                                    }
                                ],
                                order: [[safeSortBy, safeSortOrder]],
                                limit: limit,
                                offset: offset,
                                distinct: true
                            })];
                    case 1:
                        _a = _d.sent(), count = _a.count, tasks = _a.rows;
                        return [2 /*return*/, {
                                data: tasks,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: count,
                                    totalPages: Math.ceil(count / limit)
                                }
                            }];
                }
            });
        });
    };
    /**
     * 根据ID获取任务详情
     */
    TaskService.prototype.getTaskById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var task;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, todo_model_1.Todo.findByPk(id, {
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email']
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'assignee',
                                    attributes: ['id', 'username', 'email'],
                                    required: false
                                }
                            ]
                        })];
                    case 1:
                        task = _a.sent();
                        return [2 /*return*/, task];
                }
            });
        });
    };
    /**
     * 创建任务
     */
    TaskService.prototype.createTask = function (taskData) {
        return __awaiter(this, void 0, void 0, function () {
            var title, description, _a, priority, _b, status, creator_id, assignee_id, due_date, related_type, related_id, tags, priorityMap, statusMap, todoData, cleanedTodoData, task;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        title = taskData.title, description = taskData.description, _a = taskData.priority, priority = _a === void 0 ? 'medium' : _a, _b = taskData.status, status = _b === void 0 ? 'pending' : _b, creator_id = taskData.creator_id, assignee_id = taskData.assignee_id, due_date = taskData.due_date, related_type = taskData.related_type, related_id = taskData.related_id, tags = taskData.tags;
                        priorityMap = {
                            'low': todo_model_1.TodoPriority.LOW,
                            'medium': todo_model_1.TodoPriority.MEDIUM,
                            'high': todo_model_1.TodoPriority.HIGH,
                            'urgent': todo_model_1.TodoPriority.HIGHEST
                        };
                        statusMap = {
                            'pending': todo_model_1.TodoStatus.PENDING,
                            'in_progress': todo_model_1.TodoStatus.IN_PROGRESS,
                            'completed': todo_model_1.TodoStatus.COMPLETED,
                            'cancelled': todo_model_1.TodoStatus.CANCELLED
                        };
                        todoData = {
                            title: title || '',
                            description: description || null,
                            priority: priorityMap[priority] || todo_model_1.TodoPriority.MEDIUM,
                            status: statusMap[status] || todo_model_1.TodoStatus.PENDING,
                            userId: creator_id || 1,
                            tags: tags || null,
                            notify: false
                        };
                        // 只有当值存在且不为undefined时才添加可选字段
                        if (assignee_id !== undefined && assignee_id !== null) {
                            todoData.assignedTo = assignee_id;
                        }
                        if (due_date !== undefined && due_date !== null) {
                            todoData.dueDate = due_date;
                        }
                        if (related_type !== undefined && related_type !== null) {
                            todoData.relatedType = related_type;
                        }
                        if (related_id !== undefined && related_id !== null) {
                            todoData.relatedId = related_id;
                        }
                        // 最终检查：将所有剩余的undefined值转换为null
                        Object.keys(todoData).forEach(function (key) {
                            if (todoData[key] === undefined) {
                                console.warn("\u26A0\uFE0F \u53D1\u73B0undefined\u503C\uFF0C\u8F6C\u6362\u4E3Anull: ".concat(key));
                                todoData[key] = null;
                            }
                        });
                        // 详细调试日志
                        console.log('🔍 todoData最终数据:', JSON.stringify(todoData, null, 2));
                        console.log('🔍 todoData字段类型检查:', Object.keys(todoData).reduce(function (acc, key) {
                            acc[key] = typeof todoData[key];
                            return acc;
                        }, {}));
                        cleanedTodoData = todo_model_1.Todo.cleanUndefinedValues(todoData);
                        return [4 /*yield*/, todo_model_1.Todo.create(cleanedTodoData)];
                    case 1:
                        task = _c.sent();
                        // 记录操作日志
                        return [4 /*yield*/, this.logService.logAction(task.id, creator_id || 1, 'create', null, taskData, '创建任务')];
                    case 2:
                        // 记录操作日志
                        _c.sent();
                        return [2 /*return*/, this.getTaskById(task.id)];
                }
            });
        });
    };
    /**
     * 更新任务
     */
    TaskService.prototype.updateTask = function (id, updateData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var originalTask, todoUpdateData, priorityMap, statusMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTaskById(id)];
                    case 1:
                        originalTask = _a.sent();
                        if (!originalTask) {
                            throw new Error('任务不存在');
                        }
                        todoUpdateData = {};
                        if (updateData.title)
                            todoUpdateData.title = updateData.title;
                        if (updateData.description !== undefined)
                            todoUpdateData.description = updateData.description || null;
                        if (updateData.due_date !== undefined)
                            todoUpdateData.dueDate = updateData.due_date || null;
                        if (updateData.assignee_id !== undefined)
                            todoUpdateData.assignedTo = updateData.assignee_id || null;
                        if (updateData.related_type !== undefined)
                            todoUpdateData.relatedType = updateData.related_type || null;
                        if (updateData.related_id !== undefined)
                            todoUpdateData.relatedId = updateData.related_id || null;
                        if (updateData.tags !== undefined)
                            todoUpdateData.tags = updateData.tags || null;
                        if (updateData.priority) {
                            priorityMap = {
                                'low': todo_model_1.TodoPriority.LOW,
                                'medium': todo_model_1.TodoPriority.MEDIUM,
                                'high': todo_model_1.TodoPriority.HIGH,
                                'urgent': todo_model_1.TodoPriority.HIGHEST
                            };
                            todoUpdateData.priority = priorityMap[updateData.priority] || todo_model_1.TodoPriority.MEDIUM;
                        }
                        if (updateData.status) {
                            statusMap = {
                                'pending': todo_model_1.TodoStatus.PENDING,
                                'in_progress': todo_model_1.TodoStatus.IN_PROGRESS,
                                'completed': todo_model_1.TodoStatus.COMPLETED,
                                'cancelled': todo_model_1.TodoStatus.CANCELLED
                            };
                            todoUpdateData.status = statusMap[updateData.status] || todo_model_1.TodoStatus.PENDING;
                            // 如果状态改为完成，设置完成时间
                            if (updateData.status === 'completed') {
                                todoUpdateData.completedDate = new Date();
                            }
                        }
                        return [4 /*yield*/, originalTask.update(todoUpdateData)];
                    case 2:
                        _a.sent();
                        // 记录操作日志
                        return [4 /*yield*/, this.logService.logAction(id, userId, 'update', originalTask, updateData, '更新任务')];
                    case 3:
                        // 记录操作日志
                        _a.sent();
                        return [2 /*return*/, this.getTaskById(id)];
                }
            });
        });
    };
    /**
     * 删除任务
     */
    TaskService.prototype.deleteTask = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var task;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTaskById(id)];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            throw new Error('任务不存在');
                        }
                        // 使用软删除
                        return [4 /*yield*/, task.destroy()];
                    case 2:
                        // 使用软删除
                        _a.sent();
                        // 记录操作日志
                        return [4 /*yield*/, this.logService.logAction(id, userId, 'delete', task, null, '删除任务')];
                    case 3:
                        // 记录操作日志
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务状态
     */
    TaskService.prototype.updateTaskStatus = function (id, status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData;
            return __generator(this, function (_a) {
                updateData = { status: status };
                // 如果状态是完成，设置完成时间
                if (status === 'completed') {
                    updateData.completed_at = new Date();
                }
                return [2 /*return*/, this.updateTask(id, updateData, userId)];
            });
        });
    };
    /**
     * 更新任务进度
     */
    TaskService.prototype.updateTaskProgress = function (id, progress, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData;
            return __generator(this, function (_a) {
                updateData = {};
                // 如果进度达到100%，自动设置为完成状态
                if (progress === 100) {
                    updateData.status = 'completed';
                    updateData.completed_at = new Date();
                }
                return [2 /*return*/, this.updateTask(id, updateData, userId)];
            });
        });
    };
    /**
     * 从模板创建任务
     */
    TaskService.prototype.createTaskFromTemplate = function (templateId, customData, userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var templateQuery, template, templateContent, taskData, task, i, subtask;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        templateQuery = 'SELECT * FROM task_templates WHERE id = ? AND is_active = 1';
                        return [4 /*yield*/, this.db.query(templateQuery, [templateId])];
                    case 1:
                        template = (_c.sent())[0];
                        if (!template) {
                            throw new Error('模板不存在或已禁用');
                        }
                        templateContent = JSON.parse(template.template_content);
                        taskData = __assign({ title: customData.title || template.name, description: customData.description || template.description, type: template.type, priority: customData.priority || template.default_priority, creator_id: userId, assignee_id: customData.assignee_id || userId, reviewer_id: customData.reviewer_id, due_date: customData.due_date, estimated_hours: customData.estimated_hours || template.default_estimated_hours, requirements: (_a = templateContent.requirements) === null || _a === void 0 ? void 0 : _a.join('\n'), acceptance_criteria: (_b = templateContent.acceptance_criteria) === null || _b === void 0 ? void 0 : _b.join('\n'), related_type: customData.related_type, related_id: customData.related_id }, customData);
                        return [4 /*yield*/, this.createTask(taskData)];
                    case 2:
                        task = _c.sent();
                        if (!(templateContent.subtasks && Array.isArray(templateContent.subtasks))) return [3 /*break*/, 6];
                        i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(i < templateContent.subtasks.length)) return [3 /*break*/, 6];
                        subtask = templateContent.subtasks[i];
                        return [4 /*yield*/, this.createSubtask(task.id, {
                                title: subtask.title,
                                description: subtask.description,
                                assignee_id: customData.assignee_id || userId,
                                sort_order: i
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: 
                    // 更新模板使用次数
                    return [4 /*yield*/, this.db.query('UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ?', [templateId])];
                    case 7:
                        // 更新模板使用次数
                        _c.sent();
                        return [2 /*return*/, task];
                }
            });
        });
    };
    /**
     * 创建子任务
     */
    TaskService.prototype.createSubtask = function (parentTaskId, subtaskData) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      INSERT INTO task_subtasks (\n        parent_task_id, title, description, assignee_id, due_date, sort_order\n      ) VALUES (?, ?, ?, ?, ?, ?)\n    ";
                        params = [
                            parentTaskId,
                            subtaskData.title,
                            subtaskData.description,
                            subtaskData.assignee_id,
                            subtaskData.due_date,
                            subtaskData.sort_order || 0
                        ];
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, __assign({ id: result.insertId }, subtaskData)];
                }
            });
        });
    };
    /**
     * 获取任务统计数据
     */
    TaskService.prototype.getTaskStats = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, dateRange, groupBy, whereClause, params, basicStatsQuery, basicStatsResult, stats, completionRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = options.userId, dateRange = options.dateRange, groupBy = options.groupBy;
                        whereClause = 'WHERE 1=1';
                        params = [];
                        if (userId) {
                            whereClause += ' AND (user_id = ? OR assigned_to = ?)';
                            params.push(userId, userId);
                        }
                        if (dateRange > 0) {
                            whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
                            params.push(dateRange);
                        }
                        basicStatsQuery = "\n      SELECT\n        COUNT(*) as total_tasks,\n        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_tasks,\n        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as in_progress_tasks,\n        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks,\n        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_tasks,\n        0 as avg_progress,\n        SUM(CASE WHEN due_date < NOW() AND status != 'COMPLETED' THEN 1 ELSE 0 END) as overdue_tasks\n      FROM todos\n      ".concat(whereClause, "\n    ");
                        console.log('🔍 执行任务统计查询:', basicStatsQuery);
                        console.log('🔍 查询参数:', params);
                        return [4 /*yield*/, this.db.query(basicStatsQuery, params)];
                    case 1:
                        basicStatsResult = _a.sent();
                        console.log('🔍 查询结果:', basicStatsResult);
                        stats = Array.isArray(basicStatsResult) && basicStatsResult.length > 0
                            ? basicStatsResult[0]
                            : {
                                total_tasks: 0,
                                pending_tasks: 0,
                                in_progress_tasks: 0,
                                completed_tasks: 0,
                                cancelled_tasks: 0,
                                overdue_tasks: 0
                            };
                        console.log('🔍 统计数据:', stats);
                        completionRate = stats.total_tasks > 0
                            ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
                            : 0;
                        // 返回格式化的统计数据
                        return [2 /*return*/, {
                                totalTasks: parseInt(stats.total_tasks) || 0,
                                pendingTasks: parseInt(stats.pending_tasks) || 0,
                                inProgressTasks: parseInt(stats.in_progress_tasks) || 0,
                                completedTasks: parseInt(stats.completed_tasks) || 0,
                                cancelledTasks: parseInt(stats.cancelled_tasks) || 0,
                                completionRate: completionRate,
                                overdueRate: stats.total_tasks > 0
                                    ? Math.round((stats.overdue_tasks / stats.total_tasks) * 100)
                                    : 0,
                                avgCompletionTime: 0 // todos表没有这个字段，暂时返回0
                            }];
                }
            });
        });
    };
    return TaskService;
}());
exports.TaskService = TaskService;
