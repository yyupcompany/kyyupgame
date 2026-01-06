"use strict";
/**
 * 跟进质量分析控制器
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
exports.__esModule = true;
exports.generatePDFReport = exports.analyzeFollowupQuality = exports.getFollowupAnalysis = void 0;
var followup_analysis_service_1 = require("../services/ai/followup-analysis.service");
var pdf_report_service_1 = require("../services/ai/pdf-report.service");
/**
 * 获取跟进质量统计
 */
var getFollowupAnalysis = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                console.log('📊 [跟进质量分析] 开始查询统计数据');
                return [4 /*yield*/, followup_analysis_service_1.followupAnalysisService.getFollowupStatistics(startDate, endDate)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result,
                    message: '跟进质量统计完成'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('❌ [跟进质量分析] 失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: error_1.message || '跟进质量统计失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFollowupAnalysis = getFollowupAnalysis;
/**
 * AI深度分析跟进质量
 */
var analyzeFollowupQuality = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, teacherIds, analysisType, userId, result, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, teacherIds = _a.teacherIds, analysisType = _a.analysisType;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                console.log('🤖 [AI深度分析] 开始分析跟进质量');
                return [4 /*yield*/, followup_analysis_service_1.followupAnalysisService.analyzeFollowupQuality(teacherIds, analysisType || 'detailed', userId)];
            case 1:
                result = _c.sent();
                res.json({
                    success: true,
                    data: result,
                    message: 'AI深度分析完成'
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                console.error('❌ [AI深度分析] 失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: error_2.message || 'AI深度分析失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.analyzeFollowupQuality = analyzeFollowupQuality;
/**
 * 生成PDF报告
 */
var generatePDFReport = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, teacherIds, mergeAll, includeAIAnalysis, format, userId, result, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, teacherIds = _a.teacherIds, mergeAll = _a.mergeAll, includeAIAnalysis = _a.includeAIAnalysis, format = _a.format;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                // 参数验证
                if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '请提供教师ID列表'
                        })];
                }
                console.log("\uD83D\uDCC4 [PDF\u62A5\u544A\u751F\u6210] \u4E3A".concat(teacherIds.length, "\u4E2A\u6559\u5E08\u751F\u6210\u62A5\u544A"));
                return [4 /*yield*/, pdf_report_service_1.pdfReportService.generateFollowupReports({
                        teacherIds: teacherIds,
                        mergeAll: mergeAll || false,
                        includeAIAnalysis: includeAIAnalysis !== false,
                        format: format || 'detailed'
                    }, userId)];
            case 1:
                result = _c.sent();
                res.json({
                    success: true,
                    data: result,
                    message: 'PDF报告生成成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('❌ [PDF报告生成] 失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: error_3.message || 'PDF报告生成失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.generatePDFReport = generatePDFReport;
