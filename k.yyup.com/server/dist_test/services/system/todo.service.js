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
exports.TodoService = void 0;
var todo_model_1 = require("../../models/todo.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var TodoService = /** @class */ (function () {
    function TodoService() {
    }
    /**
     * 创建待办事项
     */
    TodoService.prototype.createTodo = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, init_1.sequelize.query("INSERT INTO todos \n         (title, description, priority, status, due_date, user_id, assigned_to, \n          tags, related_id, related_type, notify, notify_time, created_at, updated_at)\n         VALUES (:title, :description, :priority, :status, :dueDate, :userId, :assignedTo,\n                 :tags, :relatedId, :relatedType, :notify, :notifyTime, NOW(), NOW())", {
                                replacements: {
                                    title: data.title,
                                    description: data.description || null,
                                    priority: data.priority || todo_model_1.TodoPriority.MEDIUM,
                                    status: data.status || todo_model_1.TodoStatus.PENDING,
                                    dueDate: data.dueDate || null,
                                    userId: data.userId,
                                    assignedTo: data.assignedTo || null,
                                    tags: data.tags ? JSON.stringify(data.tags) : null,
                                    relatedId: data.relatedId || null,
                                    relatedType: data.relatedType || null,
                                    notify: data.notify || false,
                                    notifyTime: data.notifyTime || null
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 3:
                        result = (_a.sent())[0];
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.getTodoById(result)];
                    case 5: 
                    // 返回创建的待办事项
                    return [2 /*return*/, _a.sent()];
                    case 6:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取待办事项列表
     */
    TodoService.prototype.getTodos = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, assignedTo, status, priority, keyword, tags, relatedType, dueDateStart, dueDateEnd, _a, page, _b, pageSize, _c, sortBy, _d, sortOrder, conditions, replacements, tagConditions, whereClause, countQuery, offset, dataQuery, _e, countResult, dataResult, countList, count, dataList, rows;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        userId = params.userId, assignedTo = params.assignedTo, status = params.status, priority = params.priority, keyword = params.keyword, tags = params.tags, relatedType = params.relatedType, dueDateStart = params.dueDateStart, dueDateEnd = params.dueDateEnd, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, _c = params.sortBy, sortBy = _c === void 0 ? 'created_at' : _c, _d = params.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        conditions = ['t.deleted_at IS NULL'];
                        replacements = {};
                        if (userId) {
                            conditions.push('(t.user_id = :userId OR t.assigned_to = :userId)');
                            replacements.userId = userId;
                        }
                        if (assignedTo) {
                            conditions.push('t.assigned_to = :assignedTo');
                            replacements.assignedTo = assignedTo;
                        }
                        if (status) {
                            conditions.push('t.status = :status');
                            replacements.status = status;
                        }
                        if (priority) {
                            conditions.push('t.priority = :priority');
                            replacements.priority = priority;
                        }
                        if (keyword) {
                            conditions.push('(t.title LIKE :keyword OR t.description LIKE :keyword)');
                            replacements.keyword = "%".concat(keyword, "%");
                        }
                        if (tags && tags.length > 0) {
                            tagConditions = tags.map(function (_, index) { return "JSON_CONTAINS(t.tags, :tag".concat(index, ")"); });
                            conditions.push("(".concat(tagConditions.join(' OR '), ")"));
                            tags.forEach(function (tag, index) {
                                replacements["tag".concat(index)] = JSON.stringify(tag);
                            });
                        }
                        if (relatedType) {
                            conditions.push('t.related_type = :relatedType');
                            replacements.relatedType = relatedType;
                        }
                        if (dueDateStart) {
                            conditions.push('t.due_date >= :dueDateStart');
                            replacements.dueDateStart = dueDateStart;
                        }
                        if (dueDateEnd) {
                            conditions.push('t.due_date <= :dueDateEnd');
                            replacements.dueDateEnd = dueDateEnd;
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM todos t\n      ".concat(whereClause, "\n    ");
                        offset = (page - 1) * pageSize;
                        dataQuery = "\n      SELECT \n        t.*,\n        creator.id as creator_id,\n        creator.username as creator_username,\n        creator.real_name as creator_real_name,\n        assignee.id as assignee_id,\n        assignee.username as assignee_username,\n        assignee.real_name as assignee_real_name\n      FROM todos t\n      LEFT JOIN users creator ON t.user_id = creator.id\n      LEFT JOIN users assignee ON t.assigned_to = assignee.id\n      ".concat(whereClause, "\n      ORDER BY t.").concat(sortBy, " ").concat(sortOrder, "\n      LIMIT :limit OFFSET :offset\n    ");
                        replacements.limit = pageSize;
                        replacements.offset = offset;
                        return [4 /*yield*/, Promise.all([
                                init_1.sequelize.query(countQuery, {
                                    replacements: replacements,
                                    type: sequelize_1.QueryTypes.SELECT
                                }),
                                init_1.sequelize.query(dataQuery, {
                                    replacements: replacements,
                                    type: sequelize_1.QueryTypes.SELECT
                                })
                            ])];
                    case 1:
                        _e = _f.sent(), countResult = _e[0], dataResult = _e[1];
                        countList = Array.isArray(countResult) ? countResult : [];
                        count = countList.length > 0 ? countList[0].total : 0;
                        dataList = Array.isArray(dataResult) ? dataResult : [];
                        rows = dataList.map(function (item) { return (__assign(__assign({}, item), { tags: item.tags ? (typeof item.tags === 'string'
                                ? (item.tags.startsWith('[') ? JSON.parse(item.tags) : item.tags.split(',').map(function (t) { return t.trim(); }))
                                : Array.isArray(item.tags) ? item.tags : null) : null, user: item.creator_id ? {
                                id: item.creator_id,
                                username: item.creator_username,
                                realName: item.creator_real_name
                            } : null, assignee: item.assignee_id ? {
                                id: item.assignee_id,
                                username: item.assignee_username,
                                realName: item.assignee_real_name
                            } : null })); });
                        return [2 /*return*/, { rows: rows, count: Number(count) }];
                }
            });
        });
    };
    /**
     * 获取待办事项详情
     */
    TodoService.prototype.getTodoById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, resultList, todoData, todo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        t.*,\n        creator.id as creator_id,\n        creator.username as creator_username,\n        creator.real_name as creator_real_name,\n        assignee.id as assignee_id,\n        assignee.username as assignee_username,\n        assignee.real_name as assignee_real_name\n      FROM todos t\n      LEFT JOIN users creator ON t.user_id = creator.id\n      LEFT JOIN users assignee ON t.assigned_to = assignee.id\n      WHERE t.id = :id AND t.deleted_at IS NULL\n    ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        todoData = resultList.length > 0 ? resultList[0] : null;
                        if (!todoData) {
                            throw apiError_1.ApiError.notFound('待办事项不存在');
                        }
                        todo = __assign(__assign({}, todoData), { tags: todoData.tags ? JSON.parse(todoData.tags) : null, user: todoData.creator_id ? {
                                id: todoData.creator_id,
                                username: todoData.creator_username,
                                realName: todoData.creator_real_name
                            } : null, assignee: todoData.assignee_id ? {
                                id: todoData.assignee_id,
                                username: todoData.assignee_username,
                                realName: todoData.assignee_real_name
                            } : null });
                        return [2 /*return*/, todo];
                }
            });
        });
    };
    /**
     * 更新待办事项
     */
    TodoService.prototype.updateTodo = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingTodo, updateFields, replacements, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, this.getTodoById(id)];
                    case 3:
                        existingTodo = _a.sent();
                        updateFields = [];
                        replacements = { id: id };
                        if (data.title !== undefined) {
                            updateFields.push('title = :title');
                            replacements.title = data.title;
                        }
                        if (data.description !== undefined) {
                            updateFields.push('description = :description');
                            replacements.description = data.description;
                        }
                        if (data.priority !== undefined) {
                            updateFields.push('priority = :priority');
                            replacements.priority = data.priority;
                        }
                        if (data.status !== undefined) {
                            updateFields.push('status = :status');
                            replacements.status = data.status;
                            // 如果状态改为完成，设置完成时间
                            if (data.status === todo_model_1.TodoStatus.COMPLETED) {
                                updateFields.push('completed_date = NOW()');
                            }
                        }
                        if (data.dueDate !== undefined) {
                            updateFields.push('due_date = :dueDate');
                            replacements.dueDate = data.dueDate;
                        }
                        if (data.completedDate !== undefined) {
                            updateFields.push('completed_date = :completedDate');
                            replacements.completedDate = data.completedDate;
                        }
                        if (data.assignedTo !== undefined) {
                            updateFields.push('assigned_to = :assignedTo');
                            replacements.assignedTo = data.assignedTo;
                        }
                        if (data.tags !== undefined) {
                            updateFields.push('tags = :tags');
                            replacements.tags = data.tags ? JSON.stringify(data.tags) : null;
                        }
                        if (data.relatedId !== undefined) {
                            updateFields.push('related_id = :relatedId');
                            replacements.relatedId = data.relatedId;
                        }
                        if (data.relatedType !== undefined) {
                            updateFields.push('related_type = :relatedType');
                            replacements.relatedType = data.relatedType;
                        }
                        if (data.notify !== undefined) {
                            updateFields.push('notify = :notify');
                            replacements.notify = data.notify;
                        }
                        if (data.notifyTime !== undefined) {
                            updateFields.push('notify_time = :notifyTime');
                            replacements.notifyTime = data.notifyTime;
                        }
                        updateFields.push('updated_at = NOW()');
                        // 执行更新
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE todos SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 4:
                        // 执行更新
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.getTodoById(id)];
                    case 6: 
                    // 返回更新后的待办事项
                    return [2 /*return*/, _a.sent()];
                    case 7:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_2;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 标记待办事项为完成
     */
    TodoService.prototype.markTodoCompleted = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateTodo(id, {
                            status: todo_model_1.TodoStatus.COMPLETED,
                            completedDate: new Date()
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 删除待办事项
     */
    TodoService.prototype.deleteTodo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        // 检查待办事项是否存在
                        return [4 /*yield*/, this.getTodoById(id)];
                    case 3:
                        // 检查待办事项是否存在
                        _a.sent();
                        // 软删除
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE todos SET deleted_at = NOW() WHERE id = :id", {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 4:
                        // 软删除
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户的待办事项统计
     */
    TodoService.prototype.getTodoStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, resultList, stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,\n        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as inProgress,\n        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,\n        SUM(CASE WHEN (due_date < NOW() AND status != 'COMPLETED') THEN 1 ELSE 0 END) as overdue\n      FROM todos \n      WHERE (user_id = :userId OR assigned_to = :userId) AND deleted_at IS NULL\n    ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        stats = resultList.length > 0 ? resultList[0] : {
                            total: 0,
                            pending: 0,
                            inProgress: 0,
                            completed: 0,
                            overdue: 0
                        };
                        return [2 /*return*/, {
                                total: Number(stats.total),
                                pending: Number(stats.pending),
                                inProgress: Number(stats.inProgress),
                                completed: Number(stats.completed),
                                overdue: Number(stats.overdue)
                            }];
                }
            });
        });
    };
    return TodoService;
}());
exports.TodoService = TodoService;
// 导出服务实例
exports["default"] = new TodoService();
