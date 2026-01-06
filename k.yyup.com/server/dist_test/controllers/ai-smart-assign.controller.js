"use strict";
/**
 * AI智能分配控制器
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
exports.getTeacherCapacity = exports.batchAssign = exports.smartAssign = void 0;
var smart_assign_service_1 = require("../services/ai/smart-assign.service");
/**
 * AI智能分配
 */
var smartAssign = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, customerIds, options, userId, recommendations, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, customerIds = _a.customerIds, options = _a.options;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                // 参数验证
                if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '请提供要分配的客户ID列表'
                        })];
                }
                console.log("\uD83E\uDD16 [AI\u667A\u80FD\u5206\u914D] \u7528\u6237".concat(userId, "\u8BF7\u6C42\u4E3A").concat(customerIds.length, "\u4E2A\u5BA2\u6237\u5206\u914D\u6559\u5E08"));
                return [4 /*yield*/, smart_assign_service_1.smartAssignService.recommendTeacher(customerIds, options || {}, userId)];
            case 1:
                recommendations = _c.sent();
                res.json({
                    success: true,
                    data: {
                        recommendations: recommendations
                    },
                    message: 'AI分配建议生成成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                console.error('❌ [AI智能分配] 失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: error_1.message || 'AI分配失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.smartAssign = smartAssign;
/**
 * 执行批量分配
 */
var batchAssign = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, assignments, note, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, assignments = _a.assignments, note = _a.note;
                // 参数验证
                if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '请提供分配列表'
                        })];
                }
                console.log("\uD83D\uDCDD [\u6279\u91CF\u5206\u914D] \u5F00\u59CB\u6267\u884C".concat(assignments.length, "\u4E2A\u5BA2\u6237\u5206\u914D"));
                return [4 /*yield*/, smart_assign_service_1.smartAssignService.executeAssignment(assignments, note)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    data: result,
                    message: "\u5206\u914D\u5B8C\u6210: \u6210\u529F".concat(result.successCount, "\u4E2A\uFF0C\u5931\u8D25").concat(result.failedCount, "\u4E2A")
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('❌ [批量分配] 失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: error_2.message || '批量分配失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.batchAssign = batchAssign;
/**
 * 获取教师能力分析
 */
var getTeacherCapacity = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var capacityData, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('📊 [教师能力分析] 开始查询');
                return [4 /*yield*/, smart_assign_service_1.smartAssignService.analyzeTeacherCapacity()];
            case 1:
                capacityData = _a.sent();
                res.json({
                    success: true,
                    data: capacityData,
                    message: '教师能力分析完成'
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('❌ [教师能力分析] 失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: error_3.message || '教师能力分析失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherCapacity = getTeacherCapacity;
