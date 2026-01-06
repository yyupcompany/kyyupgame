"use strict";
// 暂时使用模拟数据，跳过数据库集成
// import { AutomationTask, AutomationTemplate, ExecutionHistory } from '../models/automationModels'
// import { User } from '../models/user.model'
// import { Op } from 'sequelize'
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
exports.getStatistics = exports.findElementByDescription = exports.analyzePageElements = exports.captureScreenshot = exports.createTaskFromTemplate = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getAllTemplates = exports.getTaskHistory = exports.stopTask = exports.executeTask = exports.deleteTask = exports.updateTask = exports.createTask = exports.getAllTasks = void 0;
// 模拟 Op 对象
var Op = {
    or: 'Op.or'
};
// 模拟数据库操作类
var MockExecutionHistoryModel = /** @class */ (function () {
    function MockExecutionHistoryModel() {
    }
    MockExecutionHistoryModel.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var history;
            return __generator(this, function (_a) {
                history = {
                    id: Date.now().toString(),
                    taskId: data.taskId || '',
                    status: data.status || 'running',
                    startTime: data.startTime || new Date(),
                    endTime: data.endTime,
                    logs: data.logs,
                    result: data.result,
                    error: data.error,
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date(),
                    update: function (updateData) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                Object.assign(this, updateData, { updatedAt: new Date() });
                                return [2 /*return*/];
                            });
                        });
                    }
                };
                mockHistory.push(history);
                return [2 /*return*/, history];
            });
        });
    };
    MockExecutionHistoryModel.findOne = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockHistory.find(function (h) {
                        var _a, _b;
                        return h.taskId === ((_a = options.where) === null || _a === void 0 ? void 0 : _a.taskId) &&
                            h.status === ((_b = options.where) === null || _b === void 0 ? void 0 : _b.status);
                    }) || null];
            });
        });
    };
    MockExecutionHistoryModel.findAll = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_b) {
                results = mockHistory;
                if ((_a = options.where) === null || _a === void 0 ? void 0 : _a.taskId) {
                    results = results.filter(function (h) { return h.taskId === options.where.taskId; });
                }
                return [2 /*return*/, results];
            });
        });
    };
    MockExecutionHistoryModel.count = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockHistory.length];
            });
        });
    };
    return MockExecutionHistoryModel;
}());
var MockAutomationTemplateModel = /** @class */ (function () {
    function MockAutomationTemplateModel() {
    }
    MockAutomationTemplateModel.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockTemplates.filter(function (t) {
                        return !options.where ||
                            (options.where.isPublic === undefined || t.isPublic === options.where.isPublic) ||
                            (options.where.userId === undefined || t.userId === options.where.userId);
                    })];
            });
        });
    };
    MockAutomationTemplateModel.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                template = {
                    id: Date.now().toString(),
                    name: data.name || '',
                    description: data.description,
                    category: data.category || 'custom',
                    complexity: data.complexity || 'simple',
                    steps: data.steps || [],
                    parameters: data.parameters || [],
                    config: data.config || {},
                    usageCount: data.usageCount || 0,
                    version: data.version || '1.0.0',
                    status: data.status || 'draft',
                    isPublic: data.isPublic || false,
                    allowParameterization: data.allowParameterization || false,
                    userId: data.userId || '',
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date(),
                    update: function (updateData) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                Object.assign(this, updateData, { updatedAt: new Date() });
                                return [2 /*return*/];
                            });
                        });
                    },
                    destroy: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var index;
                            var _this = this;
                            return __generator(this, function (_a) {
                                index = mockTemplates.findIndex(function (t) { return t.id === _this.id; });
                                if (index > -1)
                                    mockTemplates.splice(index, 1);
                                return [2 /*return*/];
                            });
                        });
                    }
                };
                mockTemplates.push(template);
                return [2 /*return*/, template];
            });
        });
    };
    MockAutomationTemplateModel.findOne = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockTemplates.find(function (t) {
                        var _a, _b;
                        return t.id === ((_a = options.where) === null || _a === void 0 ? void 0 : _a.id) &&
                            (!((_b = options.where) === null || _b === void 0 ? void 0 : _b.userId) || t.userId === options.where.userId);
                    }) || null];
            });
        });
    };
    MockAutomationTemplateModel.findByPk = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockTemplates.find(function (t) { return t.id === id; }) || null];
            });
        });
    };
    MockAutomationTemplateModel.count = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockTemplates.filter(function (t) { var _a; return !((_a = options.where) === null || _a === void 0 ? void 0 : _a.userId) || t.userId === options.where.userId; }).length];
            });
        });
    };
    return MockAutomationTemplateModel;
}());
var MockAutomationTaskModel = /** @class */ (function () {
    function MockAutomationTaskModel() {
    }
    MockAutomationTaskModel.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var task;
            return __generator(this, function (_a) {
                task = {
                    id: Date.now().toString(),
                    name: data.name || '',
                    description: data.description,
                    url: data.url || '',
                    steps: data.steps || [],
                    config: data.config || {},
                    status: data.status || 'pending',
                    progress: data.progress || 0,
                    templateId: data.templateId,
                    userId: data.userId || '',
                    lastExecuted: data.lastExecuted,
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date(),
                    update: function (updateData) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                Object.assign(this, updateData, { updatedAt: new Date() });
                                return [2 /*return*/];
                            });
                        });
                    }
                };
                mockTasks.push(task);
                return [2 /*return*/, task];
            });
        });
    };
    MockAutomationTaskModel.count = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, mockTasks.filter(function (t) { var _a; return !((_a = options.where) === null || _a === void 0 ? void 0 : _a.userId) || t.userId === options.where.userId; }).length];
            });
        });
    };
    MockAutomationTaskModel.findAll = function (options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_b) {
                results = mockTasks;
                if ((_a = options.where) === null || _a === void 0 ? void 0 : _a.userId) {
                    results = results.filter(function (t) { return t.userId === options.where.userId; });
                }
                return [2 /*return*/, results];
            });
        });
    };
    return MockAutomationTaskModel;
}());
// 模拟模型引用
var ExecutionHistory = MockExecutionHistoryModel;
var AutomationTemplate = MockAutomationTemplateModel;
var AutomationTask = MockAutomationTaskModel;
var User = { id: 'mock', username: 'mock', email: 'mock' };
// 内存存储
var mockTasks = [];
var mockTemplates = [];
var mockHistory = [];
/**
 * 网站自动化服务层
 */
/**
 * 获取用户的所有任务
 */
function getAllTasks(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var tasks;
        return __generator(this, function (_a) {
            try {
                // 初始化一些示例数据
                if (mockTasks.length === 0) {
                    initializeMockData();
                }
                tasks = mockTasks.filter(function (task) { return task.userId === userId; });
                return [2 /*return*/, tasks];
            }
            catch (error) {
                throw new Error('获取任务列表失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.getAllTasks = getAllTasks;
// 初始化模拟数据
function initializeMockData() {
    mockTasks = [
        {
            id: '1',
            name: '网站登录测试',
            description: '自动登录到测试网站',
            url: 'https://example.com/login',
            steps: [
                {
                    id: '1',
                    action: 'navigate',
                    url: 'https://example.com/login',
                    description: '打开登录页面'
                },
                {
                    id: '2',
                    action: 'input',
                    selector: '#username',
                    text: 'testuser',
                    description: '输入用户名'
                }
            ],
            config: { timeout: 60, retries: 3 },
            status: 'pending',
            progress: 0,
            userId: '1',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    mockTemplates = [
        {
            id: '1',
            name: '网站登录模板',
            description: '通用的网站登录流程模板',
            category: 'web',
            complexity: 'simple',
            steps: [],
            parameters: [],
            config: {},
            usageCount: 25,
            version: '1.0.0',
            status: 'published',
            isPublic: true,
            allowParameterization: true,
            userId: '1',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
}
/**
 * 创建新任务
 */
function createTask(userId, taskData) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            try {
                if (mockTasks.length === 0) {
                    initializeMockData();
                }
                task = {
                    id: Date.now().toString(),
                    name: taskData.name || '未命名任务',
                    description: taskData.description,
                    url: taskData.url,
                    steps: taskData.steps || [],
                    config: taskData.config || {},
                    status: 'pending',
                    progress: 0,
                    userId: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                mockTasks.push(task);
                return [2 /*return*/, task];
            }
            catch (error) {
                throw new Error('创建任务失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.createTask = createTask;
/**
 * 更新任务
 */
function updateTask(taskId, userId, taskData) {
    return __awaiter(this, void 0, void 0, function () {
        var taskIndex;
        return __generator(this, function (_a) {
            try {
                taskIndex = mockTasks.findIndex(function (t) { return t.id === taskId && t.userId === userId; });
                if (taskIndex === -1) {
                    throw new Error('任务不存在或无权限访问');
                }
                mockTasks[taskIndex] = __assign(__assign(__assign({}, mockTasks[taskIndex]), taskData), { updatedAt: new Date() });
                return [2 /*return*/, mockTasks[taskIndex]];
            }
            catch (error) {
                throw new Error('更新任务失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.updateTask = updateTask;
/**
 * 删除任务
 */
function deleteTask(taskId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var taskIndex;
        return __generator(this, function (_a) {
            try {
                taskIndex = mockTasks.findIndex(function (t) { return t.id === taskId && t.userId === userId; });
                if (taskIndex === -1) {
                    throw new Error('任务不存在或无权限访问');
                }
                // 从模拟数据中删除任务
                mockTasks.splice(taskIndex, 1);
                return [2 /*return*/, { success: true }];
            }
            catch (error) {
                throw new Error('删除任务失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.deleteTask = deleteTask;
/**
 * 执行任务
 */
function executeTask(taskId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var task_1, execution_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    task_1 = mockTasks.find(function (t) { return t.id === taskId && t.userId === userId; });
                    if (!task_1) {
                        throw new Error('任务不存在或无权限访问');
                    }
                    if (!task_1.update) return [3 /*break*/, 2];
                    return [4 /*yield*/, task_1.update({
                            status: 'running',
                            lastExecuted: new Date(),
                            updatedAt: new Date()
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, ExecutionHistory.create({
                        taskId: taskId,
                        status: 'running',
                        startTime: new Date(),
                        logs: JSON.stringify([{
                                timestamp: new Date().toISOString(),
                                level: 'info',
                                message: '任务开始执行'
                            }]),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                    // 模拟任务执行
                ];
                case 3:
                    execution_1 = _a.sent();
                    // 模拟任务执行
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var steps, executionLogs, i, step, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 9, , 14]);
                                    steps = task_1.steps || [];
                                    executionLogs = [];
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < steps.length)) return [3 /*break*/, 4];
                                    step = steps[i];
                                    executionLogs.push({
                                        timestamp: new Date().toISOString(),
                                        level: 'info',
                                        message: "\u6267\u884C\u6B65\u9AA4 ".concat(i + 1, ": ").concat(step.name || step.action),
                                        stepIndex: i,
                                        stepData: step
                                    });
                                    // 模拟步骤执行时间
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                                case 2:
                                    // 模拟步骤执行时间
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    if (!execution_1.update) return [3 /*break*/, 6];
                                    return [4 /*yield*/, execution_1.update({
                                            status: 'completed',
                                            endTime: new Date(),
                                            logs: JSON.stringify(executionLogs),
                                            result: JSON.stringify({
                                                success: true,
                                                stepsCompleted: steps.length,
                                                executionTime: Date.now() - execution_1.startTime.getTime()
                                            }),
                                            updatedAt: new Date()
                                        })];
                                case 5:
                                    _a.sent();
                                    _a.label = 6;
                                case 6:
                                    if (!task_1.update) return [3 /*break*/, 8];
                                    return [4 /*yield*/, task_1.update({
                                            status: 'completed',
                                            progress: 100,
                                            updatedAt: new Date()
                                        })];
                                case 7:
                                    _a.sent();
                                    _a.label = 8;
                                case 8: return [3 /*break*/, 14];
                                case 9:
                                    error_2 = _a.sent();
                                    if (!execution_1.update) return [3 /*break*/, 11];
                                    return [4 /*yield*/, execution_1.update({
                                            status: 'failed',
                                            endTime: new Date(),
                                            error: error_2.message,
                                            updatedAt: new Date()
                                        })];
                                case 10:
                                    _a.sent();
                                    _a.label = 11;
                                case 11:
                                    if (!task_1.update) return [3 /*break*/, 13];
                                    return [4 /*yield*/, task_1.update({
                                            status: 'failed',
                                            updatedAt: new Date()
                                        })];
                                case 12:
                                    _a.sent();
                                    _a.label = 13;
                                case 13: return [3 /*break*/, 14];
                                case 14: return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                    return [2 /*return*/, {
                            executionId: execution_1.id,
                            status: 'started',
                            message: '任务已开始执行'
                        }];
                case 4:
                    error_1 = _a.sent();
                    throw new Error('执行任务失败: ' + error_1.message);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.executeTask = executeTask;
/**
 * 停止任务执行
 */
function stopTask(taskId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var task, latestExecution, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    task = mockTasks.find(function (t) { return t.id === taskId && t.userId === userId; });
                    if (!task) {
                        throw new Error('任务不存在或无权限访问');
                    }
                    if (!task.update) return [3 /*break*/, 2];
                    return [4 /*yield*/, task.update({
                            status: 'stopped',
                            updatedAt: new Date()
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, ExecutionHistory.findOne({
                        where: { taskId: taskId, status: 'running' },
                        order: [['createdAt', 'DESC']]
                    })];
                case 3:
                    latestExecution = _a.sent();
                    if (!(latestExecution && latestExecution.update)) return [3 /*break*/, 5];
                    return [4 /*yield*/, latestExecution.update({
                            status: 'stopped',
                            endTime: new Date(),
                            updatedAt: new Date()
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    throw new Error('停止任务失败: ' + error_3.message);
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.stopTask = stopTask;
/**
 * 获取任务执行历史
 */
function getTaskHistory(taskId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var task, history_1, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    task = mockTasks.find(function (t) { return t.id === taskId && t.userId === userId; });
                    if (!task) {
                        throw new Error('任务不存在或无权限访问');
                    }
                    return [4 /*yield*/, ExecutionHistory.findAll({
                            where: { taskId: taskId },
                            order: [['createdAt', 'DESC']]
                        })];
                case 1:
                    history_1 = _a.sent();
                    return [2 /*return*/, history_1];
                case 2:
                    error_4 = _a.sent();
                    throw new Error('获取执行历史失败: ' + error_4.message);
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getTaskHistory = getTaskHistory;
/**
 * 获取所有模板
 */
function getAllTemplates(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var where, templates, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    where = userId ? (_a = {},
                        _a[Op.or] = [
                            { userId: userId },
                            { isPublic: true }
                        ],
                        _a) :
                        { isPublic: true };
                    return [4 /*yield*/, AutomationTemplate.findAll({
                            where: where,
                            include: userId ? [{
                                    model: User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email']
                                }] : [],
                            order: [['usageCount', 'DESC'], ['updatedAt', 'DESC']]
                        })];
                case 1:
                    templates = _b.sent();
                    return [2 /*return*/, templates];
                case 2:
                    error_5 = _b.sent();
                    throw new Error('获取模板列表失败: ' + error_5.message);
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getAllTemplates = getAllTemplates;
/**
 * 创建模板
 */
function createTemplate(userId, templateData) {
    return __awaiter(this, void 0, void 0, function () {
        var template, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, AutomationTemplate.create(__assign(__assign({}, templateData), { userId: userId, usageCount: 0, isPublic: false, createdAt: new Date(), updatedAt: new Date() }))];
                case 1:
                    template = _a.sent();
                    return [2 /*return*/, template];
                case 2:
                    error_6 = _a.sent();
                    throw new Error('创建模板失败: ' + error_6.message);
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.createTemplate = createTemplate;
/**
 * 更新模板
 */
function updateTemplate(templateId, userId, templateData) {
    return __awaiter(this, void 0, void 0, function () {
        var template, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, AutomationTemplate.findOne({
                            where: { id: templateId, userId: userId }
                        })];
                case 1:
                    template = _a.sent();
                    if (!template) {
                        throw new Error('模板不存在或无权限访问');
                    }
                    if (!template.update) return [3 /*break*/, 3];
                    return [4 /*yield*/, template.update(__assign(__assign({}, templateData), { updatedAt: new Date() }))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, template];
                case 4:
                    error_7 = _a.sent();
                    throw new Error('更新模板失败: ' + error_7.message);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.updateTemplate = updateTemplate;
/**
 * 删除模板
 */
function deleteTemplate(templateId, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var template, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, AutomationTemplate.findOne({
                            where: { id: templateId, userId: userId }
                        })];
                case 1:
                    template = _a.sent();
                    if (!template) {
                        throw new Error('模板不存在或无权限访问');
                    }
                    if (!template.destroy) return [3 /*break*/, 3];
                    return [4 /*yield*/, template.destroy()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_8 = _a.sent();
                    throw new Error('删除模板失败: ' + error_8.message);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.deleteTemplate = deleteTemplate;
/**
 * 基于模板创建任务
 */
function createTaskFromTemplate(templateId, userId, parameters) {
    var _a;
    if (parameters === void 0) { parameters = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var template, steps, task, error_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, AutomationTemplate.findByPk(templateId)];
                case 1:
                    template = _b.sent();
                    if (!template) {
                        throw new Error('模板不存在');
                    }
                    if (!template.update) return [3 /*break*/, 3];
                    return [4 /*yield*/, template.update({
                            usageCount: template.usageCount + 1,
                            updatedAt: new Date()
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    steps = JSON.parse(JSON.stringify(template.steps));
                    if (template.allowParameterization && parameters) {
                        steps = steps.map(function (step) {
                            var processedStep = __assign({}, step);
                            // 替换参数占位符
                            Object.keys(parameters).forEach(function (key) {
                                var placeholder = "{{".concat(key, "}}");
                                if (processedStep.url) {
                                    processedStep.url = processedStep.url.replace(placeholder, parameters[key]);
                                }
                                if (processedStep.text) {
                                    processedStep.text = processedStep.text.replace(placeholder, parameters[key]);
                                }
                                if (processedStep.selector) {
                                    processedStep.selector = processedStep.selector.replace(placeholder, parameters[key]);
                                }
                            });
                            return processedStep;
                        });
                    }
                    return [4 /*yield*/, AutomationTask.create({
                            name: "".concat(template.name, " - ").concat(new Date().toLocaleString()),
                            description: "\u57FA\u4E8E\u6A21\u677F\"".concat(template.name, "\"\u521B\u5EFA\u7684\u4EFB\u52A1"),
                            url: ((_a = template.steps[0]) === null || _a === void 0 ? void 0 : _a.url) || '',
                            steps: steps,
                            config: template.config,
                            templateId: template.id,
                            userId: userId,
                            status: 'pending',
                            progress: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                case 4:
                    task = _b.sent();
                    return [2 /*return*/, task];
                case 5:
                    error_9 = _b.sent();
                    throw new Error('基于模板创建任务失败: ' + error_9.message);
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.createTaskFromTemplate = createTaskFromTemplate;
/**
 * 网页截图
 */
function captureScreenshot(url, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // 这里应该集成实际的截图API，如Playwright、Puppeteer等
                // 目前返回模拟数据
                return [2 /*return*/, {
                        url: url,
                        screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                        timestamp: new Date().toISOString(),
                        dimensions: options.dimensions || { width: 1920, height: 1080 },
                        metadata: {
                            fullPage: options.fullPage || false,
                            deviceType: options.deviceType || 'desktop'
                        }
                    }];
            }
            catch (error) {
                throw new Error('截图失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.captureScreenshot = captureScreenshot;
/**
 * 分析网页元素
 */
function analyzePageElements(url, screenshot, config) {
    if (config === void 0) { config = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var mockElements;
        return __generator(this, function (_a) {
            try {
                mockElements = [
                    {
                        type: 'button',
                        text: '登录',
                        selector: '#login-btn',
                        bbox: { x: 100, y: 50, width: 80, height: 32 },
                        confidence: 0.95,
                        properties: { role: 'button', type: 'submit' }
                    },
                    {
                        type: 'input',
                        text: '',
                        selector: 'input[name="username"]',
                        bbox: { x: 100, y: 100, width: 200, height: 32 },
                        confidence: 0.90,
                        properties: { type: 'text', placeholder: '用户名' }
                    },
                    {
                        type: 'input',
                        text: '',
                        selector: 'input[type="password"]',
                        bbox: { x: 100, y: 140, width: 200, height: 32 },
                        confidence: 0.92,
                        properties: { type: 'password', placeholder: '密码' }
                    }
                ];
                return [2 /*return*/, {
                        url: url,
                        elements: mockElements,
                        structure: {
                            forms: mockElements.filter(function (el) { return el.type === 'form'; }).length,
                            buttons: mockElements.filter(function (el) { return el.type === 'button'; }).length,
                            inputs: mockElements.filter(function (el) { return el.type === 'input'; }).length,
                            links: mockElements.filter(function (el) { return el.type === 'link'; }).length
                        },
                        confidence: 0.89,
                        timestamp: new Date().toISOString(),
                        config: config
                    }];
            }
            catch (error) {
                throw new Error('页面分析失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.analyzePageElements = analyzePageElements;
/**
 * 智能元素查找
 */
function findElementByDescription(url, description, screenshot) {
    return __awaiter(this, void 0, void 0, function () {
        var keywords, mockResults;
        return __generator(this, function (_a) {
            try {
                keywords = description.toLowerCase();
                mockResults = [];
                if (keywords.includes('登录') || keywords.includes('login')) {
                    mockResults = [
                        {
                            selector: 'button:contains("登录")',
                            description: '包含"登录"文本的按钮',
                            confidence: 0.95,
                            reasoning: '基于文本内容匹配找到登录按钮'
                        },
                        {
                            selector: '#login-btn',
                            description: 'ID为login-btn的元素',
                            confidence: 0.90,
                            reasoning: 'ID命名符合登录按钮的常见模式'
                        }
                    ];
                }
                else if (keywords.includes('用户名') || keywords.includes('username')) {
                    mockResults = [
                        {
                            selector: 'input[name="username"]',
                            description: 'name属性为username的输入框',
                            confidence: 0.95,
                            reasoning: '标准的用户名输入框命名'
                        },
                        {
                            selector: '#username',
                            description: 'ID为username的输入框',
                            confidence: 0.88,
                            reasoning: 'ID命名符合用户名输入框的常见模式'
                        }
                    ];
                }
                else {
                    mockResults = [
                        {
                            selector: '*',
                            description: '未找到匹配元素',
                            confidence: 0.1,
                            reasoning: '请尝试更具体的描述'
                        }
                    ];
                }
                return [2 /*return*/, {
                        url: url,
                        description: description,
                        results: mockResults,
                        timestamp: new Date().toISOString()
                    }];
            }
            catch (error) {
                throw new Error('智能元素查找失败: ' + error.message);
            }
            return [2 /*return*/];
        });
    });
}
exports.findElementByDescription = findElementByDescription;
/**
 * 获取统计数据
 */
function getStatistics(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, taskCount, templateCount, executionCount, recentExecutions, tasksByStatus, error_10;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, Promise.all([
                            AutomationTask.count({ where: { userId: userId } }),
                            AutomationTemplate.count({ where: { userId: userId } }),
                            ExecutionHistory.count({
                                include: [{
                                        model: AutomationTask,
                                        as: 'task',
                                        where: { userId: userId }
                                    }]
                            })
                        ])];
                case 1:
                    _a = _b.sent(), taskCount = _a[0], templateCount = _a[1], executionCount = _a[2];
                    return [4 /*yield*/, ExecutionHistory.findAll({
                            include: [{
                                    model: AutomationTask,
                                    as: 'task',
                                    where: { userId: userId },
                                    attributes: ['id', 'name']
                                }],
                            order: [['createdAt', 'DESC']],
                            limit: 10
                        })];
                case 2:
                    recentExecutions = _b.sent();
                    return [4 /*yield*/, AutomationTask.findAll({
                            where: { userId: userId },
                            attributes: ['status'],
                            group: ['status'],
                            raw: true
                        })];
                case 3:
                    tasksByStatus = _b.sent();
                    return [2 /*return*/, {
                            summary: {
                                totalTasks: taskCount,
                                totalTemplates: templateCount,
                                totalExecutions: executionCount,
                                recentExecutions: recentExecutions.length
                            },
                            tasksByStatus: tasksByStatus.reduce(function (acc, item) {
                                acc[item.status] = acc[item.status] ? acc[item.status] + 1 : 1;
                                return acc;
                            }, {}),
                            recentActivity: recentExecutions.map(function (exec) { return ({
                                id: exec.id,
                                taskName: 'Mock Task',
                                status: exec.status,
                                startTime: exec.startTime,
                                endTime: exec.endTime
                            }); }),
                            timestamp: new Date().toISOString()
                        }];
                case 4:
                    error_10 = _b.sent();
                    throw new Error('获取统计数据失败: ' + error_10.message);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getStatistics = getStatistics;
