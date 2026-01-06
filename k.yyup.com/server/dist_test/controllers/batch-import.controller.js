"use strict";
/**
 * 批量导入控制器
 *
 * 提供批量数据导入的API端点
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
exports.batchImportController = void 0;
var batch_import_service_1 = require("../services/ai/batch-import.service");
var customer_batch_import_service_1 = require("../services/ai/customer-batch-import.service");
var user_context_provider_service_1 = require("../services/ai/user-context-provider.service");
/**
 * 批量导入控制器类
 */
var BatchImportController = /** @class */ (function () {
    function BatchImportController() {
    }
    /**
     * 上传并预览导入文件
     * POST /api/batch-import/preview
     */
    BatchImportController.prototype.previewImport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var entityType, data, userContext, preview, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📤 [批量导入] 收到预览请求');
                        // 检查文件
                        if (!req.file) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请上传文件'
                                })];
                        }
                        entityType = req.body.entityType;
                        if (!entityType) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请指定实体类型'
                                })];
                        }
                        console.log("\uD83D\uDCC4 [\u6279\u91CF\u5BFC\u5165] \u6587\u4EF6: ".concat(req.file.originalname, ", \u5B9E\u4F53\u7C7B\u578B: ").concat(entityType));
                        data = batch_import_service_1.batchImportService.parseFile(req.file.buffer, req.file.originalname);
                        userContext = user_context_provider_service_1.userContextProviderService.extractUserContextFromRequest(req);
                        return [4 /*yield*/, batch_import_service_1.batchImportService.previewImport(entityType, data, userContext)];
                    case 1:
                        preview = _a.sent();
                        res.json({
                            success: true,
                            data: preview
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ [批量导入] 预览失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: error_1.message || '预览导入失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行批量导入
     * POST /api/batch-import/execute
     */
    BatchImportController.prototype.executeImport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, entityType, data, userContext, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('📥 [批量导入] 收到执行请求');
                        _a = req.body, entityType = _a.entityType, data = _a.data;
                        if (!entityType || !data || !Array.isArray(data)) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '参数错误：需要 entityType 和 data 数组'
                                })];
                        }
                        console.log("\uD83D\uDCE5 [\u6279\u91CF\u5BFC\u5165] \u5B9E\u4F53\u7C7B\u578B: ".concat(entityType, ", \u6570\u636E\u884C\u6570: ").concat(data.length));
                        userContext = user_context_provider_service_1.userContextProviderService.extractUserContextFromRequest(req);
                        return [4 /*yield*/, batch_import_service_1.batchImportService.batchImport(entityType, data, userContext)];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: result.success,
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('❌ [批量导入] 执行失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: error_2.message || '批量导入失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 客户预览导入
     * POST /api/batch-import/customer-preview
     */
    BatchImportController.prototype.previewCustomerImport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var preview, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📤 [客户导入预览] 收到预览请求');
                        // 检查文件
                        if (!req.file) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请上传文件'
                                })];
                        }
                        console.log("\uD83D\uDCC4 [\u5BA2\u6237\u5BFC\u5165\u9884\u89C8] \u6587\u4EF6: ".concat(req.file.originalname));
                        return [4 /*yield*/, customer_batch_import_service_1.customerBatchImportService.generatePreview(req.file.buffer, req.file.originalname)];
                    case 1:
                        preview = _a.sent();
                        res.json({
                            success: true,
                            data: preview
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ [客户导入预览] 预览失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: error_3.message || '预览导入失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 下载导入模板
     * GET /api/batch-import/template/:entityType
     */
    BatchImportController.prototype.downloadTemplate = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var entityType, buffer;
            return __generator(this, function (_a) {
                try {
                    entityType = req.params.entityType;
                    console.log("\uD83D\uDCC4 [\u6279\u91CF\u5BFC\u5165] \u4E0B\u8F7D\u6A21\u677F: ".concat(entityType));
                    buffer = batch_import_service_1.batchImportService.generateTemplate(entityType);
                    // 设置响应头
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader('Content-Disposition', "attachment; filename=\"".concat(entityType, "_import_template.xlsx\""));
                    // 发送文件
                    res.send(buffer);
                }
                catch (error) {
                    console.error('❌ [批量导入] 下载模板失败:', error);
                    res.status(500).json({
                        success: false,
                        message: error.message || '下载模板失败'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    return BatchImportController;
}());
// 导出单例
exports.batchImportController = new BatchImportController();
