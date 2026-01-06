"use strict";
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
exports.TaskController = void 0;
var task_service_1 = require("../services/task.service");
var task_comment_service_1 = require("../services/task-comment.service");
var task_template_service_1 = require("../services/task-template.service");
var api_response_handler_1 = require("../utils/api-response-handler");
var TaskController = /** @class */ (function () {
    function TaskController() {
        this.taskService = new task_service_1.TaskService();
        this.commentService = new task_comment_service_1.TaskCommentService();
        this.templateService = new task_template_service_1.TaskTemplateService();
    }
    // ==================== 任务管理 ====================
    /**
     * 获取任务列表
     */
    TaskController.prototype.getTasks = function (req, res) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var _g, _h, page, _j, limit, status_1, priority, type, assignee_id, creator_id, related_type, related_id, keyword, _k, sort_by, _l, sort_order, userId, userRole, filters, result, responseData, error_1;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        _m.trys.push([0, 2, , 3]);
                        _g = req.query, _h = _g.page, page = _h === void 0 ? 1 : _h, _j = _g.limit, limit = _j === void 0 ? 20 : _j, status_1 = _g.status, priority = _g.priority, type = _g.type, assignee_id = _g.assignee_id, creator_id = _g.creator_id, related_type = _g.related_type, related_id = _g.related_id, keyword = _g.keyword, _k = _g.sort_by, sort_by = _k === void 0 ? 'created_at' : _k, _l = _g.sort_order, sort_order = _l === void 0 ? 'DESC' : _l;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        filters = {
                            status: status_1,
                            priority: priority,
                            type: type,
                            assignee_id: assignee_id ? parseInt(assignee_id) : undefined,
                            creator_id: creator_id ? parseInt(creator_id) : undefined,
                            related_type: related_type,
                            related_id: related_id ? parseInt(related_id) : undefined,
                            keyword: keyword
                        };
                        // 如果是教师角色，只显示分配给自己的任务或自己创建的任务
                        if (userRole === 'teacher' && userId) {
                            console.log('[任务API] 检测到教师角色，用户ID:', userId);
                            // 教师只能看到分配给自己的任务或自己创建的任务
                            if (!filters.assignee_id && !filters.creator_id) {
                                // 如果没有指定assignee_id或creator_id，默认显示分配给当前教师的任务
                                filters.assignee_id = userId;
                            }
                            else if (filters.assignee_id && filters.assignee_id !== userId) {
                                // 如果指定了其他人的assignee_id，教师无权查看，返回空结果
                                filters.assignee_id = -1; // 设置一个不存在的ID
                            }
                            else if (filters.creator_id && filters.creator_id !== userId) {
                                // 如果指定了其他人的creator_id，教师无权查看，返回空结果
                                filters.creator_id = -1; // 设置一个不存在的ID
                            }
                        }
                        return [4 /*yield*/, this.taskService.getTasks({
                                page: parseInt(page),
                                limit: parseInt(limit),
                                filters: filters,
                                sortBy: sort_by,
                                sortOrder: sort_order
                            })];
                    case 1:
                        result = _m.sent();
                        responseData = {
                            tasks: result.data || [],
                            total: ((_c = result.pagination) === null || _c === void 0 ? void 0 : _c.total) || 0,
                            page: ((_d = result.pagination) === null || _d === void 0 ? void 0 : _d.page) || parseInt(page),
                            limit: ((_e = result.pagination) === null || _e === void 0 ? void 0 : _e.limit) || parseInt(limit),
                            totalPages: ((_f = result.pagination) === null || _f === void 0 ? void 0 : _f.totalPages) || 0
                        };
                        (0, api_response_handler_1.handleApiResponse)(res, responseData, '获取任务列表成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _m.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '获取任务列表失败', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取任务详情
     */
    TaskController.prototype.getTaskById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, taskId, task, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        taskId = parseInt(id);
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        return [4 /*yield*/, this.taskService.getTaskById(taskId)];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '任务不存在', null, 404)];
                        }
                        (0, api_response_handler_1.handleApiResponse)(res, task, '获取任务详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '获取任务详情失败', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建任务
     */
    TaskController.prototype.createTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var taskData, userId, task, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('🎯 TaskController.createTask 开始');
                        taskData = req.body;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        console.log('📥 接收到的任务数据:', JSON.stringify(taskData, null, 2));
                        console.log('👤 用户ID:', userId);
                        // 暂时允许未登录用户创建任务（用于测试）
                        // 如果没有登录用户，使用传入的creator_id或默认值1
                        if (!taskData.creator_id) {
                            taskData.creator_id = userId || 1;
                        }
                        console.log('📝 处理后的任务数据:', JSON.stringify(taskData, null, 2));
                        console.log('🚀 调用 TaskService.createTask...');
                        return [4 /*yield*/, this.taskService.createTask(taskData)];
                    case 1:
                        task = _b.sent();
                        console.log('✅ TaskService.createTask 返回:', task);
                        (0, api_response_handler_1.handleApiResponse)(res, task, '创建任务成功', null, 201);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('❌ TaskController.createTask 错误:', error_3);
                        (0, api_response_handler_1.handleApiResponse)(res, null, '创建任务失败', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务
     */
    TaskController.prototype.updateTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, taskId, updateData, userId, task, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        taskId = parseInt(id);
                        updateData = req.body;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        return [4 /*yield*/, this.taskService.updateTask(taskId, updateData, userId)];
                    case 1:
                        task = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, task, '更新任务成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '更新任务失败', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除任务
     */
    TaskController.prototype.deleteTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, taskId, userId, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        taskId = parseInt(id);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        return [4 /*yield*/, this.taskService.deleteTask(taskId, userId)];
                    case 1:
                        _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '删除任务成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '删除任务失败', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务状态
     */
    TaskController.prototype.updateTaskStatus = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, status_2, taskId, userId, task, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        status_2 = req.body.status;
                        taskId = parseInt(id);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        return [4 /*yield*/, this.taskService.updateTaskStatus(taskId, status_2, userId)];
                    case 1:
                        task = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, task, '更新任务状态成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '更新任务状态失败', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务进度
     */
    TaskController.prototype.updateTaskProgress = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, progress, taskId, userId, task, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        progress = req.body.progress;
                        taskId = parseInt(id);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        if (progress < 0 || progress > 100) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '进度值必须在0-100之间', null, 400)];
                        }
                        return [4 /*yield*/, this.taskService.updateTaskProgress(taskId, progress, userId)];
                    case 1:
                        task = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, task, '更新任务进度成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '更新任务进度失败', error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 任务评论 ====================
    /**
     * 获取任务评论
     */
    TaskController.prototype.getTaskComments = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, taskId, _a, _b, page, _c, limit, comments, error_8;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        taskId = parseInt(id);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        return [4 /*yield*/, this.commentService.getTaskComments(taskId, {
                                page: parseInt(page),
                                limit: parseInt(limit)
                            })];
                    case 1:
                        comments = _d.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, comments, '获取任务评论成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _d.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '获取任务评论失败', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 添加任务评论
     */
    TaskController.prototype.addTaskComment = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, taskId, commentData, userId, comment, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        taskId = parseInt(id);
                        commentData = req.body;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (isNaN(taskId)) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '无效的任务ID', null, 400)];
                        }
                        if (!userId) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '用户未登录', null, 401)];
                        }
                        commentData.task_id = taskId;
                        commentData.user_id = userId;
                        return [4 /*yield*/, this.commentService.addComment(commentData)];
                    case 1:
                        comment = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, comment, '添加评论成功', null, 201);
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '添加评论失败', error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 任务模板 ====================
    /**
     * 获取任务模板列表
     */
    TaskController.prototype.getTaskTemplates = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, type, category, _b, is_active, filters, templates, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, type = _a.type, category = _a.category, _b = _a.is_active, is_active = _b === void 0 ? '1' : _b;
                        filters = {
                            type: type,
                            category: category,
                            is_active: is_active === '1'
                        };
                        return [4 /*yield*/, this.templateService.getTemplates(filters)];
                    case 1:
                        templates = _c.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, templates, '获取任务模板成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _c.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '获取任务模板失败', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据模板创建任务
     */
    TaskController.prototype.createTaskFromTemplate = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var templateId, customData, userId, task, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        templateId = req.params.templateId;
                        customData = req.body.customData;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, (0, api_response_handler_1.handleApiResponse)(res, null, '用户未登录', null, 401)];
                        }
                        return [4 /*yield*/, this.taskService.createTaskFromTemplate(parseInt(templateId), customData, userId)];
                    case 1:
                        task = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, task, '从模板创建任务成功', null, 201);
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        (0, api_response_handler_1.handleApiResponse)(res, null, '从模板创建任务失败', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 任务统计 ====================
    /**
     * 获取任务统计数据
     */
    TaskController.prototype.getTaskStats = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, user_id, _c, date_range, _d, group_by, userId, dateRange, stats, error_12;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _b = req.query, user_id = _b.user_id, _c = _b.date_range, date_range = _c === void 0 ? '30' : _c, _d = _b.group_by, group_by = _d === void 0 ? 'status' : _d;
                        userId = user_id ? parseInt(user_id) : (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        dateRange = parseInt(date_range);
                        console.log('🔍 [TaskController] getTaskStats 调用参数:', {
                            query: req.query,
                            user: req.user,
                            userId: userId,
                            dateRange: dateRange,
                            groupBy: group_by
                        });
                        return [4 /*yield*/, this.taskService.getTaskStats({
                                userId: userId,
                                dateRange: dateRange,
                                groupBy: group_by
                            })];
                    case 1:
                        stats = _e.sent();
                        console.log('🔍 [TaskController] getTaskStats 返回结果:', stats);
                        (0, api_response_handler_1.handleApiResponse)(res, stats, '获取任务统计成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _e.sent();
                        console.error('❌ [TaskController] getTaskStats 错误:', error_12);
                        (0, api_response_handler_1.handleApiResponse)(res, null, '获取任务统计失败', error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TaskController;
}());
exports.TaskController = TaskController;
