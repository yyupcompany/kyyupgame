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
exports.CustomerFollowEnhancedService = void 0;
var customer_follow_record_enhanced_model_1 = require("../models/customer-follow-record-enhanced.model");
var customer_follow_stage_model_1 = require("../models/customer-follow-stage.model");
var customer_follow_media_model_1 = require("../models/customer-follow-media.model");
var customer_follow_ai_service_1 = require("./ai/customer-follow-ai.service");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * 增强版客户跟进服务
 * 提供完整的客户跟进管理功能
 */
var CustomerFollowEnhancedService = /** @class */ (function () {
    function CustomerFollowEnhancedService() {
        this.aiService = new customer_follow_ai_service_1.CustomerFollowAIService();
    }
    /**
     * 创建跟进记录
     */
    CustomerFollowEnhancedService.prototype.createFollowRecord = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, followRecord, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.create({
                                customerId: request.customerId,
                                teacherId: request.teacherId,
                                stage: request.stage,
                                subStage: request.subStage,
                                followType: request.followType,
                                content: request.content,
                                customerFeedback: request.customerFeedback,
                                stageStatus: 'in_progress',
                                nextFollowDate: request.nextFollowDate
                            }, { transaction: transaction })];
                    case 3:
                        followRecord = _a.sent();
                        if (!(request.mediaFiles && request.mediaFiles.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleMediaFiles(followRecord.id, request.mediaFiles, request.teacherId, transaction)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        // 异步生成AI建议
                        this.generateAISuggestions(followRecord.id, request.customerId, request.stage, request.subStage, request.content);
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, followRecord];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新跟进记录
     */
    CustomerFollowEnhancedService.prototype.updateFollowRecord = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var followRecord, updateData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.findByPk(request.id)];
                    case 1:
                        followRecord = _a.sent();
                        if (!followRecord) {
                            throw new Error('跟进记录不存在');
                        }
                        updateData = {};
                        if (request.content !== undefined)
                            updateData.content = request.content;
                        if (request.customerFeedback !== undefined)
                            updateData.customerFeedback = request.customerFeedback;
                        if (request.stageStatus !== undefined)
                            updateData.stageStatus = request.stageStatus;
                        if (request.nextFollowDate !== undefined)
                            updateData.nextFollowDate = request.nextFollowDate;
                        if (request.completedAt !== undefined)
                            updateData.completedAt = request.completedAt;
                        return [4 /*yield*/, followRecord.update(updateData)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, followRecord];
                }
            });
        });
    };
    /**
     * 获取客户的完整跟进时间线
     */
    CustomerFollowEnhancedService.prototype.getCustomerTimeline = function (customerId, teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, replacements, records;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = teacherId
                            ? 'WHERE cfre.customer_id = :customerId AND cfre.teacher_id = :teacherId'
                            : 'WHERE cfre.customer_id = :customerId';
                        replacements = { customerId: customerId };
                        if (teacherId)
                            replacements.teacherId = teacherId;
                        return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        cfre.id,\n        cfre.stage,\n        cfre.sub_stage as subStage,\n        cfre.follow_type as followType,\n        cfre.content,\n        cfre.customer_feedback as customerFeedback,\n        cfre.ai_suggestions as aiSuggestions,\n        cfre.stage_status as stageStatus,\n        cfre.media_files as mediaFiles,\n        cfre.created_at as createdAt,\n        cfre.completed_at as completedAt,\n        u.real_name as teacherName\n      FROM customer_follow_records_enhanced cfre\n      LEFT JOIN users u ON cfre.teacher_id = u.id\n      ".concat(whereClause, "\n      ORDER BY cfre.stage ASC, cfre.created_at ASC\n    "), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (record) { return (__assign(__assign({}, record), { stageName: _this.getStageDisplayName(record.stage), aiSuggestions: record.aiSuggestions ? JSON.parse(record.aiSuggestions) : null, mediaFiles: record.mediaFiles ? JSON.parse(record.mediaFiles) : null })); })];
                }
            });
        });
    };
    /**
     * 获取阶段配置
     */
    CustomerFollowEnhancedService.prototype.getStageConfigurations = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customer_follow_stage_model_1.CustomerFollowStage.findAll({
                            where: { isActive: true },
                            order: [['sortOrder', 'ASC']]
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取AI建议
     */
    CustomerFollowEnhancedService.prototype.getAISuggestions = function (followRecordId) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.findByPk(followRecordId)];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new Error('跟进记录不存在');
                        }
                        if (record.aiSuggestions && !record.needsAISuggestion()) {
                            return [2 /*return*/, record.aiSuggestions];
                        }
                        // 重新生成AI建议
                        return [4 /*yield*/, this.generateAISuggestions(record.id, record.customerId, record.stage, record.subStage, record.content)];
                    case 2:
                        // 重新生成AI建议
                        _a.sent();
                        // 返回更新后的建议
                        return [4 /*yield*/, record.reload()];
                    case 3:
                        // 返回更新后的建议
                        _a.sent();
                        return [2 /*return*/, record.aiSuggestions];
                }
            });
        });
    };
    /**
     * 处理媒体文件上传
     */
    CustomerFollowEnhancedService.prototype.handleMediaFiles = function (followRecordId, files, uploadedBy, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaRecords;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mediaRecords = files.map(function (file) { return ({
                            followRecordId: followRecordId,
                            mediaType: _this.getMediaType(file.mimetype),
                            fileName: file.originalname,
                            filePath: file.path,
                            fileSize: file.size,
                            mimeType: file.mimetype,
                            uploadedBy: uploadedBy
                        }); });
                        return [4 /*yield*/, customer_follow_media_model_1.CustomerFollowMedia.bulkCreate(mediaRecords, { transaction: transaction })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 异步生成AI建议
     */
    CustomerFollowEnhancedService.prototype.generateAISuggestions = function (followRecordId, customerId, stage, subStage, content) {
        return __awaiter(this, void 0, void 0, function () {
            var customerInfo, aiRequest, suggestions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getCustomerInfo(customerId)];
                    case 1:
                        customerInfo = _a.sent();
                        aiRequest = {
                            customerInfo: customerInfo,
                            stage: stage,
                            subStage: subStage,
                            currentContent: content
                        };
                        return [4 /*yield*/, this.aiService.getFollowUpSuggestions(aiRequest)];
                    case 2:
                        suggestions = _a.sent();
                        // 更新记录
                        return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.update({ aiSuggestions: suggestions }, { where: { id: followRecordId } })];
                    case 3:
                        // 更新记录
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('生成AI建议失败:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户信息
     */
    CustomerFollowEnhancedService.prototype.getCustomerInfo = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var customerData, previousInteractions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        customer_name as customerName,\n        child_name as childName,\n        child_age as childAge,\n        phone as contactPhone,\n        source\n      FROM teacher_customers \n      WHERE id = :customerId\n    ", {
                            replacements: { customerId: customerId },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 1:
                        customerData = (_a.sent())[0];
                        if (!customerData) {
                            throw new Error('客户信息不存在');
                        }
                        return [4 /*yield*/, this.getPreviousInteractions(customerId)];
                    case 2:
                        previousInteractions = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, customerData), { currentStage: 1, // 需要根据实际情况计算
                                previousInteractions: previousInteractions })];
                }
            });
        });
    };
    /**
     * 获取历史互动记录
     */
    CustomerFollowEnhancedService.prototype.getPreviousInteractions = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.query("\n      SELECT content, created_at\n      FROM customer_follow_records_enhanced\n      WHERE customer_id = :customerId\n      ORDER BY created_at DESC\n      LIMIT 5\n    ", {
                            replacements: { customerId: customerId },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (record) {
                                return "".concat(record.created_at, ": ").concat(record.content);
                            })];
                }
            });
        });
    };
    /**
     * 获取媒体类型
     */
    CustomerFollowEnhancedService.prototype.getMediaType = function (mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        return 'document';
    };
    /**
     * 获取阶段显示名称
     */
    CustomerFollowEnhancedService.prototype.getStageDisplayName = function (stage) {
        var stageNames = {
            1: '初期接触', 2: '需求挖掘', 3: '方案展示', 4: '实地体验',
            5: '异议处理', 6: '促成决策', 7: '缴费确认', 8: '入园准备'
        };
        return stageNames[stage] || '未知阶段';
    };
    return CustomerFollowEnhancedService;
}());
exports.CustomerFollowEnhancedService = CustomerFollowEnhancedService;
exports["default"] = CustomerFollowEnhancedService;
