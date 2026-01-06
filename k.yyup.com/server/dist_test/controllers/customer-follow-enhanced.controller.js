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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.CustomerFollowEnhancedController = void 0;
var customer_follow_enhanced_service_1 = require("../services/customer-follow-enhanced.service");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
// 配置文件上传
var storage = multer_1["default"].diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/customer-follow/');
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1["default"].extname(file.originalname));
    }
});
var upload = (0, multer_1["default"])({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        var allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
        var extname = allowedTypes.test(path_1["default"].extname(file.originalname).toLowerCase());
        var mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('不支持的文件类型'));
        }
    }
});
/**
 * 增强版客户跟进控制器
 */
var CustomerFollowEnhancedController = /** @class */ (function () {
    function CustomerFollowEnhancedController() {
        this.service = new customer_follow_enhanced_service_1.CustomerFollowEnhancedService();
    }
    /**
     * 创建跟进记录
     */
    CustomerFollowEnhancedController.prototype.createFollowRecord = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var teacherId, _b, customerId, stage, subStage, followType, content, customerFeedback, nextFollowDate, followRecord, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!teacherId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证',
                                    error: { code: 'UNAUTHORIZED' }
                                })];
                        }
                        _b = req.body, customerId = _b.customerId, stage = _b.stage, subStage = _b.subStage, followType = _b.followType, content = _b.content, customerFeedback = _b.customerFeedback, nextFollowDate = _b.nextFollowDate;
                        // 验证必需字段
                        if (!customerId || !stage || !subStage || !followType || !content) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '缺少必需字段',
                                    error: { code: 'VALIDATION_ERROR' }
                                })];
                        }
                        return [4 /*yield*/, this.service.createFollowRecord({
                                customerId: parseInt(customerId),
                                teacherId: teacherId,
                                stage: parseInt(stage),
                                subStage: subStage,
                                followType: followType,
                                content: content,
                                customerFeedback: customerFeedback,
                                mediaFiles: req.files,
                                nextFollowDate: nextFollowDate ? new Date(nextFollowDate) : undefined
                            })];
                    case 1:
                        followRecord = _c.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: followRecord,
                                message: '创建跟进记录成功'
                            })];
                    case 2:
                        error_1 = _c.sent();
                        console.error('创建跟进记录错误:', error_1);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '创建跟进记录失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新跟进记录
     */
    CustomerFollowEnhancedController.prototype.updateFollowRecord = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updateData, followRecord, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        updateData = req.body;
                        return [4 /*yield*/, this.service.updateFollowRecord(__assign({ id: parseInt(id) }, updateData))];
                    case 1:
                        followRecord = _a.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: followRecord,
                                message: '更新跟进记录成功'
                            })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('更新跟进记录错误:', error_2);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '更新跟进记录失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户跟进时间线
     */
    CustomerFollowEnhancedController.prototype.getCustomerTimeline = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var customerId, teacherId, timeline, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        customerId = req.params.customerId;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, this.service.getCustomerTimeline(parseInt(customerId), teacherId)];
                    case 1:
                        timeline = _b.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: timeline,
                                message: '获取客户时间线成功'
                            })];
                    case 2:
                        error_3 = _b.sent();
                        console.error('获取客户时间线错误:', error_3);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取客户时间线失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取阶段配置
     */
    CustomerFollowEnhancedController.prototype.getStageConfigurations = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var stages, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.service.getStageConfigurations()];
                    case 1:
                        stages = _a.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: stages,
                                message: '获取阶段配置成功'
                            })];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取阶段配置错误:', error_4);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取阶段配置失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取AI建议
     */
    CustomerFollowEnhancedController.prototype.getAISuggestions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var followRecordId, suggestions, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        followRecordId = req.params.followRecordId;
                        return [4 /*yield*/, this.service.getAISuggestions(parseInt(followRecordId))];
                    case 1:
                        suggestions = _a.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: suggestions,
                                message: '获取AI建议成功'
                            })];
                    case 2:
                        error_5 = _a.sent();
                        console.error('获取AI建议错误:', error_5);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取AI建议失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 完成阶段
     */
    CustomerFollowEnhancedController.prototype.completeStage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var followRecordId, followRecord, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        followRecordId = req.params.followRecordId;
                        return [4 /*yield*/, this.service.updateFollowRecord({
                                id: parseInt(followRecordId),
                                stageStatus: 'completed',
                                completedAt: new Date()
                            })];
                    case 1:
                        followRecord = _a.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: followRecord,
                                message: '完成阶段成功'
                            })];
                    case 2:
                        error_6 = _a.sent();
                        console.error('完成阶段错误:', error_6);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '完成阶段失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 跳过阶段
     */
    CustomerFollowEnhancedController.prototype.skipStage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var followRecordId, reason, followRecord, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        followRecordId = req.params.followRecordId;
                        reason = req.body.reason;
                        return [4 /*yield*/, this.service.updateFollowRecord({
                                id: parseInt(followRecordId),
                                stageStatus: 'skipped',
                                customerFeedback: reason || '阶段已跳过'
                            })];
                    case 1:
                        followRecord = _a.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                data: followRecord,
                                message: '跳过阶段成功'
                            })];
                    case 2:
                        error_7 = _a.sent();
                        console.error('跳过阶段错误:', error_7);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '跳过阶段失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取文件上传中间件
     */
    CustomerFollowEnhancedController.prototype.getUploadMiddleware = function () {
        return upload.array('mediaFiles', 5); // 最多5个文件
    };
    return CustomerFollowEnhancedController;
}());
exports.CustomerFollowEnhancedController = CustomerFollowEnhancedController;
exports["default"] = CustomerFollowEnhancedController;
