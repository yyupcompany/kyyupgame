"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.websiteAutomationController = exports.WebsiteAutomationController = void 0;
var websiteAutomationService = __importStar(require("../services/websiteAutomationService"));
var api_1 = require("../types/api");
var errorHandler_1 = require("../utils/errorHandler");
/**
 * 网站自动化控制器
 */
var WebsiteAutomationController = /** @class */ (function () {
    function WebsiteAutomationController() {
    }
    /**
     * 获取所有任务
     */
    WebsiteAutomationController.prototype.getAllTasks = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, tasks, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.getAllTasks(userId)];
                    case 1:
                        tasks = _c.sent();
                        res.json(api_1.ApiResponse.success(tasks));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_1, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建新任务
     */
    WebsiteAutomationController.prototype.createTask = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, taskData, task, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        taskData = req.body;
                        return [4 /*yield*/, websiteAutomationService.createTask(userId, taskData)];
                    case 1:
                        task = _c.sent();
                        res.status(201).json(api_1.ApiResponse.success(task, '任务创建成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_2, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务
     */
    WebsiteAutomationController.prototype.updateTask = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, taskData, task, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        taskData = req.body;
                        return [4 /*yield*/, websiteAutomationService.updateTask(id, userId, taskData)];
                    case 1:
                        task = _c.sent();
                        res.json(api_1.ApiResponse.success(task, '任务更新成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_3, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除任务
     */
    WebsiteAutomationController.prototype.deleteTask = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.deleteTask(id, userId)];
                    case 1:
                        _c.sent();
                        res.json(api_1.ApiResponse.success(null, '任务删除成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_4, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行任务
     */
    WebsiteAutomationController.prototype.executeTask = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, result, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.executeTask(id, userId)];
                    case 1:
                        result = _c.sent();
                        res.json(api_1.ApiResponse.success(result, '任务执行成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_5, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 停止任务执行
     */
    WebsiteAutomationController.prototype.stopTask = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.stopTask(id, userId)];
                    case 1:
                        _c.sent();
                        res.json(api_1.ApiResponse.success(null, '任务已停止'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_6, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取任务执行历史
     */
    WebsiteAutomationController.prototype.getTaskHistory = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, history_1, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.getTaskHistory(id, userId)];
                    case 1:
                        history_1 = _c.sent();
                        res.json(api_1.ApiResponse.success(history_1));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_7, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有任务模板
     */
    WebsiteAutomationController.prototype.getAllTemplates = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, templates, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        return [4 /*yield*/, websiteAutomationService.getAllTemplates(userId)];
                    case 1:
                        templates = _c.sent();
                        res.json(api_1.ApiResponse.success(templates));
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_8, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建任务模板
     */
    WebsiteAutomationController.prototype.createTemplate = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, templateData, template, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        templateData = req.body;
                        return [4 /*yield*/, websiteAutomationService.createTemplate(userId, templateData)];
                    case 1:
                        template = _c.sent();
                        res.status(201).json(api_1.ApiResponse.success(template, '模板创建成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_9, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务模板
     */
    WebsiteAutomationController.prototype.updateTemplate = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, templateData, template, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        templateData = req.body;
                        return [4 /*yield*/, websiteAutomationService.updateTemplate(id, userId, templateData)];
                    case 1:
                        template = _c.sent();
                        res.json(api_1.ApiResponse.success(template, '模板更新成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_10, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除任务模板
     */
    WebsiteAutomationController.prototype.deleteTemplate = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, error_11;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.deleteTemplate(id, userId)];
                    case 1:
                        _c.sent();
                        res.json(api_1.ApiResponse.success(null, '模板删除成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_11, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 基于模板创建任务
     */
    WebsiteAutomationController.prototype.createTaskFromTemplate = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var templateId, userId, parameters, task, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        templateId = req.params.templateId;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        parameters = req.body.parameters;
                        return [4 /*yield*/, websiteAutomationService.createTaskFromTemplate(templateId, userId, parameters)];
                    case 1:
                        task = _c.sent();
                        res.status(201).json(api_1.ApiResponse.success(task, '基于模板创建任务成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_12, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 网页截图
     */
    WebsiteAutomationController.prototype.captureScreenshot = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, url, options, userId, screenshot, error_13;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _c = req.body, url = _c.url, options = _c.options;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.captureScreenshot(url, options)];
                    case 1:
                        screenshot = _d.sent();
                        res.json(api_1.ApiResponse.success(screenshot, '截图成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _d.sent();
                        errorHandler_1.ErrorHandler.handleError(error_13, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分析网页元素
     */
    WebsiteAutomationController.prototype.analyzePageElements = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, url, screenshot, config, userId, analysis, error_14;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _c = req.body, url = _c.url, screenshot = _c.screenshot, config = _c.config;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.analyzePageElements(url, screenshot, config)];
                    case 1:
                        analysis = _d.sent();
                        res.json(api_1.ApiResponse.success(analysis, '页面分析成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _d.sent();
                        errorHandler_1.ErrorHandler.handleError(error_14, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 智能元素查找
     */
    WebsiteAutomationController.prototype.findElementByDescription = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, url, description, screenshot, userId, elements, error_15;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _c = req.body, url = _c.url, description = _c.description, screenshot = _c.screenshot;
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.findElementByDescription(url, description, screenshot)];
                    case 1:
                        elements = _d.sent();
                        res.json(api_1.ApiResponse.success(elements, '元素查找成功'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _d.sent();
                        errorHandler_1.ErrorHandler.handleError(error_15, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取网站自动化统计数据
     */
    WebsiteAutomationController.prototype.getStatistics = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, stats, error_16;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json(api_1.ApiResponse.error('用户未认证'))];
                        }
                        return [4 /*yield*/, websiteAutomationService.getStatistics(userId)];
                    case 1:
                        stats = _c.sent();
                        res.json(api_1.ApiResponse.success(stats));
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _c.sent();
                        errorHandler_1.ErrorHandler.handleError(error_16, res);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WebsiteAutomationController;
}());
exports.WebsiteAutomationController = WebsiteAutomationController;
exports.websiteAutomationController = new WebsiteAutomationController();
