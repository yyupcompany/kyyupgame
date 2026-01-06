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
exports.InspectionPlanController = void 0;
var models_1 = require("../models");
var sequelize_1 = require("sequelize");
/**
 * 检查计划控制器
 */
var InspectionPlanController = /** @class */ (function () {
    function InspectionPlanController() {
    }
    /**
     * 获取检查计划列表
     */
    InspectionPlanController.prototype.getList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, kindergartenId, inspectionTypeId, planYear, status_1, startDate, endDate, where, offset, limit, _d, count, rows, error_1;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, kindergartenId = _a.kindergartenId, inspectionTypeId = _a.inspectionTypeId, planYear = _a.planYear, status_1 = _a.status, startDate = _a.startDate, endDate = _a.endDate;
                        where = {};
                        // 筛选条件
                        if (kindergartenId) {
                            where.kindergartenId = kindergartenId;
                        }
                        if (inspectionTypeId) {
                            where.inspectionTypeId = inspectionTypeId;
                        }
                        if (planYear) {
                            where.planYear = planYear;
                        }
                        if (status_1) {
                            where.status = status_1;
                        }
                        if (startDate && endDate) {
                            where.planDate = (_e = {},
                                _e[sequelize_1.Op.between] = [startDate, endDate],
                                _e);
                        }
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        return [4 /*yield*/, models_1.InspectionPlan.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: models_1.InspectionType,
                                        as: 'inspectionType',
                                        attributes: ['id', 'name', 'category', 'frequency']
                                    },
                                ],
                                offset: offset,
                                limit: limit,
                                order: [['planDate', 'DESC']]
                            })];
                    case 1:
                        _d = _f.sent(), count = _d.count, rows = _d.rows;
                        res.json({
                            success: true,
                            data: {
                                items: rows,
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _f.sent();
                        console.error('获取检查计划列表失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取检查计划列表失败',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取检查计划详情
     */
    InspectionPlanController.prototype.getDetail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionPlan, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, models_1.InspectionPlan.findByPk(id, {
                                include: [
                                    {
                                        model: models_1.InspectionType,
                                        as: 'inspectionType'
                                    },
                                ]
                            })];
                    case 1:
                        inspectionPlan = _a.sent();
                        if (!inspectionPlan) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查计划不存在'
                                })];
                        }
                        res.json({
                            success: true,
                            data: inspectionPlan
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取检查计划详情失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取检查计划详情失败',
                            error: error_2.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建检查计划
     */
    InspectionPlanController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var inspectionPlan, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, models_1.InspectionPlan.create(__assign(__assign({}, req.body), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }))];
                    case 1:
                        inspectionPlan = _b.sent();
                        res.json({
                            success: true,
                            message: '创建成功',
                            data: inspectionPlan
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('创建检查计划失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '创建检查计划失败',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新检查计划
     */
    InspectionPlanController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionPlan, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, models_1.InspectionPlan.findByPk(id)];
                    case 1:
                        inspectionPlan = _a.sent();
                        if (!inspectionPlan) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查计划不存在'
                                })];
                        }
                        return [4 /*yield*/, inspectionPlan.update(req.body)];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '更新成功',
                            data: inspectionPlan
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('更新检查计划失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '更新检查计划失败',
                            error: error_4.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除检查计划
     */
    InspectionPlanController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, inspectionPlan, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, models_1.InspectionPlan.findByPk(id)];
                    case 1:
                        inspectionPlan = _a.sent();
                        if (!inspectionPlan) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '检查计划不存在'
                                })];
                        }
                        return [4 /*yield*/, inspectionPlan.destroy()];
                    case 2:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '删除成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('删除检查计划失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '删除检查计划失败',
                            error: error_5.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取Timeline数据(年度视图)
     */
    InspectionPlanController.prototype.getTimeline = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, kindergartenId, year, plans, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, kindergartenId = _a.kindergartenId, year = _a.year;
                        if (!kindergartenId || !year) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'kindergartenId和year参数必填'
                                })];
                        }
                        return [4 /*yield*/, models_1.InspectionPlan.findAll({
                                where: {
                                    kindergartenId: Number(kindergartenId),
                                    planYear: Number(year)
                                },
                                include: [
                                    {
                                        model: models_1.InspectionType,
                                        as: 'inspectionType',
                                        attributes: ['id', 'name', 'category', 'frequency', 'duration']
                                    },
                                ],
                                order: [['plan_date', 'ASC']]
                            })];
                    case 1:
                        plans = _b.sent();
                        res.json({
                            success: true,
                            data: plans
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('获取Timeline数据失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '获取Timeline数据失败',
                            error: error_6.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 自动生成年度检查计划
     */
    InspectionPlanController.prototype.generateYearlyPlan = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, kindergartenId, year, cityLevel, inspectionTypes, plans, _i, inspectionTypes_1, type, planDate, createdPlans, error_7;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _b = req.body, kindergartenId = _b.kindergartenId, year = _b.year, cityLevel = _b.cityLevel;
                        if (!kindergartenId || !year || !cityLevel) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: 'kindergartenId、year和cityLevel参数必填'
                                })];
                        }
                        return [4 /*yield*/, models_1.InspectionType.findAll({
                                where: (_c = {
                                        isActive: true
                                    },
                                    _c[sequelize_1.Op.or] = [
                                        { cityLevel: cityLevel },
                                        { cityLevel: null }, // 适用所有级别
                                    ],
                                    _c)
                            })];
                    case 1:
                        inspectionTypes = _d.sent();
                        plans = [];
                        for (_i = 0, inspectionTypes_1 = inspectionTypes; _i < inspectionTypes_1.length; _i++) {
                            type = inspectionTypes_1[_i];
                            planDate = new Date(Number(year), 0, 1);
                            plans.push({
                                kindergartenId: Number(kindergartenId),
                                inspectionTypeId: type.id,
                                planYear: Number(year),
                                planDate: planDate,
                                status: 'pending',
                                createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
                            });
                        }
                        return [4 /*yield*/, models_1.InspectionPlan.bulkCreate(plans)];
                    case 2:
                        createdPlans = _d.sent();
                        res.json({
                            success: true,
                            message: "\u6210\u529F\u751F\u6210".concat(createdPlans.length, "\u4E2A\u68C0\u67E5\u8BA1\u5212"),
                            data: createdPlans
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _d.sent();
                        console.error('生成年度检查计划失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '生成年度检查计划失败',
                            error: error_7.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取检查计划的任务列表
     */
    InspectionPlanController.prototype.getTasks = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, _b, page, _c, pageSize, status_2, priority, assignedTo, where, offset, limit, _d, count, rows, error_8;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, status_2 = _a.status, priority = _a.priority, assignedTo = _a.assignedTo;
                        where = {
                            inspectionPlanId: Number(id)
                        };
                        // 筛选条件
                        if (status_2) {
                            where.status = status_2;
                        }
                        if (priority) {
                            where.priority = priority;
                        }
                        if (assignedTo) {
                            where.assignedTo = Number(assignedTo);
                        }
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        return [4 /*yield*/, models_1.InspectionTask.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: models_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                    {
                                        model: models_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                ],
                                offset: offset,
                                limit: limit,
                                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
                            })];
                    case 1:
                        _d = _e.sent(), count = _d.count, rows = _d.rows;
                        res.json({
                            success: true,
                            data: {
                                items: rows,
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _e.sent();
                        console.error('获取检查任务列表失败:', error_8);
                        res.status(500).json({
                            success: false,
                            message: '获取检查任务列表失败',
                            error: error_8.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建检查任务
     */
    InspectionPlanController.prototype.createTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, taskData, task, fullTask, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        taskData = __assign(__assign({}, req.body), { inspectionPlanId: Number(id), createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
                        return [4 /*yield*/, models_1.InspectionTask.create(taskData)];
                    case 1:
                        task = _b.sent();
                        return [4 /*yield*/, models_1.InspectionTask.findByPk(task.id, {
                                include: [
                                    {
                                        model: models_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                    {
                                        model: models_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                ]
                            })];
                    case 2:
                        fullTask = _b.sent();
                        res.json({
                            success: true,
                            message: '创建任务成功',
                            data: fullTask
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _b.sent();
                        console.error('创建检查任务失败:', error_9);
                        res.status(500).json({
                            success: false,
                            message: '创建检查任务失败',
                            error: error_9.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新检查任务
     */
    InspectionPlanController.prototype.updateTask = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, taskId, task, updatedTask, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.params, id = _a.id, taskId = _a.taskId;
                        return [4 /*yield*/, models_1.InspectionTask.findOne({
                                where: {
                                    id: Number(taskId),
                                    inspectionPlanId: Number(id)
                                }
                            })];
                    case 1:
                        task = _b.sent();
                        if (!task) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '任务不存在'
                                })];
                        }
                        return [4 /*yield*/, task.update(req.body)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, models_1.InspectionTask.findByPk(task.id, {
                                include: [
                                    {
                                        model: models_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                    {
                                        model: models_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName', 'email'],
                                        required: false
                                    },
                                ]
                            })];
                    case 3:
                        updatedTask = _b.sent();
                        res.json({
                            success: true,
                            message: '更新任务成功',
                            data: updatedTask
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_10 = _b.sent();
                        console.error('更新检查任务失败:', error_10);
                        res.status(500).json({
                            success: false,
                            message: '更新检查任务失败',
                            error: error_10.message
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除检查任务
     */
    InspectionPlanController.prototype.deleteTask = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, taskId, task, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.params, id = _a.id, taskId = _a.taskId;
                        return [4 /*yield*/, models_1.InspectionTask.findOne({
                                where: {
                                    id: Number(taskId),
                                    inspectionPlanId: Number(id)
                                }
                            })];
                    case 1:
                        task = _b.sent();
                        if (!task) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '任务不存在'
                                })];
                        }
                        return [4 /*yield*/, task.destroy()];
                    case 2:
                        _b.sent();
                        res.json({
                            success: true,
                            message: '删除任务成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _b.sent();
                        console.error('删除检查任务失败:', error_11);
                        res.status(500).json({
                            success: false,
                            message: '删除检查任务失败',
                            error: error_11.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return InspectionPlanController;
}());
exports.InspectionPlanController = InspectionPlanController;
exports["default"] = new InspectionPlanController();
