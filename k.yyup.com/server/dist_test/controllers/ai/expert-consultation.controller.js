"use strict";
/**
 * AI专家咨询控制器
 * 处理专家咨询相关的API请求
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var expert_consultation_service_1 = __importDefault(require("../../services/ai/expert-consultation.service"));
/**
 * AI专家咨询控制器类
 */
var ExpertConsultationController = /** @class */ (function () {
    function ExpertConsultationController() {
    }
    /**
     * 启动专家咨询
     */
    ExpertConsultationController.prototype.startConsultation = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, query, context, preferences, request, session, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.userId;
                        _b = req.body, query = _b.query, context = _b.context, preferences = _b.preferences;
                        // 验证必要参数
                        if (!userId) {
                            res.status(401).json({
                                code: 401,
                                message: '用户未认证',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (!query || !query.trim()) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供咨询问题',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        // 验证问题长度
                        if (query.trim().length < 10) {
                            res.status(400).json({
                                code: 400,
                                message: '咨询问题至少需要10个字符',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (query.trim().length > 2000) {
                            res.status(400).json({
                                code: 400,
                                message: '咨询问题不能超过2000个字符',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        request = {
                            userId: userId,
                            query: query.trim(),
                            context: context,
                            preferences: preferences
                        };
                        return [4 /*yield*/, expert_consultation_service_1["default"].startConsultation(request)];
                    case 1:
                        session = _c.sent();
                        res.json({
                            code: 200,
                            message: '专家咨询会话已创建，即将开始多智能体专家分析',
                            data: session
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('启动专家咨询失败:', error_1);
                        res.status(500).json({
                            code: 500,
                            message: error_1 instanceof Error ? error_1.message : '启动咨询失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取下一个专家发言
     */
    ExpertConsultationController.prototype.getNextExpertSpeech = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, speech, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].getNextExpertSpeech(sessionId)];
                    case 1:
                        speech = _a.sent();
                        res.json({
                            code: 200,
                            message: '获取专家发言成功',
                            data: speech
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取专家发言失败:', error_2);
                        // 处理特定错误
                        if (error_2 instanceof Error) {
                            if (error_2.message === 'All experts have spoken') {
                                res.status(400).json({
                                    code: 400,
                                    message: '所有专家已发言完毕',
                                    data: null
                                });
                                return [2 /*return*/];
                            }
                            if (error_2.message === 'Session not found') {
                                res.status(404).json({
                                    code: 404,
                                    message: '会话不存在',
                                    data: null
                                });
                                return [2 /*return*/];
                            }
                        }
                        res.status(500).json({
                            code: 500,
                            message: error_2 instanceof Error ? error_2.message : '获取专家发言失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 流式获取专家发言
     */
    ExpertConsultationController.prototype.getExpertSpeechStream = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, expertIndex, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        expertIndex = req.query.expertIndex;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (expertIndex === undefined || expertIndex === null) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少专家索引',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        // 设置SSE响应头
                        res.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Cache-Control'
                        });
                        // 发送连接确认
                        res.write("data: ".concat(JSON.stringify({
                            type: 'connected',
                            message: '专家发言流式连接已建立'
                        }), "\n\n"));
                        // 调用服务获取流式专家发言
                        return [4 /*yield*/, expert_consultation_service_1["default"].getExpertSpeechStream(sessionId, parseInt(expertIndex), function (data) {
                                // 流式数据回调
                                res.write("data: ".concat(JSON.stringify(data), "\n\n"));
                            })];
                    case 1:
                        // 调用服务获取流式专家发言
                        _a.sent();
                        // 发送完成信号
                        res.write("data: ".concat(JSON.stringify({
                            type: 'complete',
                            message: '专家发言完成'
                        }), "\n\n"));
                        res.end();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('流式获取专家发言失败:', error_3);
                        // 发送错误信息
                        res.write("data: ".concat(JSON.stringify({
                            type: 'error',
                            message: error_3 instanceof Error ? error_3.message : '流式获取专家发言失败'
                        }), "\n\n"));
                        res.end();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取咨询进度
     */
    ExpertConsultationController.prototype.getConsultationProgress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, progress, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].getConsultationProgress(sessionId)];
                    case 1:
                        progress = _a.sent();
                        res.json({
                            code: 200,
                            message: '获取咨询进度成功',
                            data: progress
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取咨询进度失败:', error_4);
                        if (error_4 instanceof Error && error_4.message === 'Session not found') {
                            res.status(404).json({
                                code: 404,
                                message: '会话不存在',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        res.status(500).json({
                            code: 500,
                            message: error_4 instanceof Error ? error_4.message : '获取咨询进度失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取咨询汇总
     */
    ExpertConsultationController.prototype.getConsultationSummary = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, summary, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].getConsultationSummary(sessionId)];
                    case 1:
                        summary = _a.sent();
                        res.json({
                            code: 200,
                            message: '获取咨询汇总成功',
                            data: summary
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('获取咨询汇总失败:', error_5);
                        if (error_5 instanceof Error) {
                            if (error_5.message === 'Session not found') {
                                res.status(404).json({
                                    code: 404,
                                    message: '会话不存在',
                                    data: null
                                });
                                return [2 /*return*/];
                            }
                            if (error_5.message === 'Consultation not completed') {
                                res.status(400).json({
                                    code: 400,
                                    message: '咨询尚未完成',
                                    data: null
                                });
                                return [2 /*return*/];
                            }
                        }
                        res.status(500).json({
                            code: 500,
                            message: error_5 instanceof Error ? error_5.message : '获取咨询汇总失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成行动计划
     */
    ExpertConsultationController.prototype.generateActionPlan = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, actionPlan, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].generateActionPlan(sessionId)];
                    case 1:
                        actionPlan = _a.sent();
                        res.json({
                            code: 200,
                            message: '生成行动计划成功',
                            data: actionPlan
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('生成行动计划失败:', error_6);
                        if (error_6 instanceof Error && error_6.message === 'Session not found') {
                            res.status(404).json({
                                code: 404,
                                message: '会话不存在',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        res.status(500).json({
                            code: 500,
                            message: error_6 instanceof Error ? error_6.message : '生成行动计划失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取咨询会话详情
     */
    ExpertConsultationController.prototype.getConsultationSession = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, session, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = req.params.sessionId;
                        if (!sessionId) {
                            res.status(400).json({
                                code: 400,
                                message: '缺少会话ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].getConsultationSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            res.status(404).json({
                                code: 404,
                                message: '会话不存在',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            code: 200,
                            message: '获取会话详情成功',
                            data: session
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('获取会话详情失败:', error_7);
                        res.status(500).json({
                            code: 500,
                            message: error_7 instanceof Error ? error_7.message : '获取会话详情失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户咨询历史
     */
    ExpertConsultationController.prototype.getUserConsultations = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, limit, consultations, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        limit = parseInt(req.query.limit) || 10;
                        if (!userId) {
                            res.status(401).json({
                                code: 401,
                                message: '用户未认证',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, expert_consultation_service_1["default"].getUserConsultations(userId, limit)];
                    case 1:
                        consultations = _b.sent();
                        res.json({
                            code: 200,
                            message: '获取咨询历史成功',
                            data: {
                                consultations: consultations,
                                total: consultations.length
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        console.error('获取咨询历史失败:', error_8);
                        res.status(500).json({
                            code: 500,
                            message: error_8 instanceof Error ? error_8.message : '获取咨询历史失败',
                            data: null
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取专家类型列表
     */
    ExpertConsultationController.prototype.getExpertTypes = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var expertTypes;
            return __generator(this, function (_a) {
                try {
                    expertTypes = [
                        { type: 'planner', name: '招生策划专家', description: '擅长活动策划和品牌营销' },
                        { type: 'psychologist', name: '心理学专家', description: '专注儿童心理发展和家长需求分析' },
                        { type: 'investor', name: '投资分析专家', description: '精通财务规划和成本控制' },
                        { type: 'director', name: '园长管理专家', description: '拥有丰富的园所运营管理经验' },
                        { type: 'teacher', name: '执行教师专家', description: '熟悉一线教学和活动执行' },
                        { type: 'parent', name: '家长体验专家', description: '从用户角度评估活动吸引力' }
                    ];
                    res.json({
                        code: 200,
                        message: '获取专家类型成功',
                        data: expertTypes
                    });
                }
                catch (error) {
                    console.error('获取专家类型失败:', error);
                    res.status(500).json({
                        code: 500,
                        message: error instanceof Error ? error.message : '获取专家类型失败',
                        data: null
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    return ExpertConsultationController;
}());
// 导出控制器实例
exports["default"] = new ExpertConsultationController();
