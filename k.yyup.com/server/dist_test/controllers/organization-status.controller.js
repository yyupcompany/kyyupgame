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
exports.OrganizationStatusController = void 0;
var organization_status_service_1 = require("../services/organization-status.service");
var kindergarten_model_1 = require("../models/kindergarten.model");
/**
 * 机构现状控制器
 */
var OrganizationStatusController = /** @class */ (function () {
    function OrganizationStatusController() {
    }
    /**
     * 获取机构现状数据
     * GET /api/organization-status/:kindergartenId
     */
    OrganizationStatusController.getStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, kindergarten, status_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        kindergartenId = parseInt(req.params.kindergartenId);
                        if (isNaN(kindergartenId)) {
                            return [2 /*return*/, res.status(400).json({
                                    code: 400,
                                    message: '无效的幼儿园ID'
                                })];
                        }
                        return [4 /*yield*/, kindergarten_model_1.Kindergarten.findByPk(kindergartenId)];
                    case 1:
                        kindergarten = _a.sent();
                        if (!kindergarten) {
                            return [2 /*return*/, res.status(404).json({
                                    code: 404,
                                    message: '幼儿园不存在'
                                })];
                        }
                        return [4 /*yield*/, organization_status_service_1.OrganizationStatusService.getOrCreateStatus(kindergartenId)];
                    case 2:
                        status_1 = _a.sent();
                        res.json({
                            code: 200,
                            message: 'success',
                            data: status_1
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('获取机构现状失败:', error_1);
                        res.status(500).json({
                            code: 500,
                            message: '获取机构现状失败',
                            error: error_1.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 刷新机构现状数据
     * POST /api/organization-status/:kindergartenId/refresh
     */
    OrganizationStatusController.refreshStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, kindergarten, status_2, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        kindergartenId = parseInt(req.params.kindergartenId);
                        if (isNaN(kindergartenId)) {
                            return [2 /*return*/, res.status(400).json({
                                    code: 400,
                                    message: '无效的幼儿园ID'
                                })];
                        }
                        return [4 /*yield*/, kindergarten_model_1.Kindergarten.findByPk(kindergartenId)];
                    case 1:
                        kindergarten = _a.sent();
                        if (!kindergarten) {
                            return [2 /*return*/, res.status(404).json({
                                    code: 404,
                                    message: '幼儿园不存在'
                                })];
                        }
                        return [4 /*yield*/, organization_status_service_1.OrganizationStatusService.refreshStatus(kindergartenId)];
                    case 2:
                        status_2 = _a.sent();
                        res.json({
                            code: 200,
                            message: '数据刷新成功',
                            data: status_2
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('刷新机构现状失败:', error_2);
                        res.status(500).json({
                            code: 500,
                            message: '刷新机构现状失败',
                            error: error_2.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取机构现状的AI格式化文本
     * GET /api/organization-status/:kindergartenId/ai-format
     */
    OrganizationStatusController.getAIFormattedStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, status_3, formattedText, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        kindergartenId = parseInt(req.params.kindergartenId);
                        if (isNaN(kindergartenId)) {
                            return [2 /*return*/, res.status(400).json({
                                    code: 400,
                                    message: '无效的幼儿园ID'
                                })];
                        }
                        return [4 /*yield*/, organization_status_service_1.OrganizationStatusService.getOrCreateStatus(kindergartenId)];
                    case 1:
                        status_3 = _a.sent();
                        formattedText = organization_status_service_1.OrganizationStatusService.formatStatusForAI(status_3);
                        res.json({
                            code: 200,
                            message: 'success',
                            data: {
                                text: formattedText,
                                rawData: status_3
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取AI格式化文本失败:', error_3);
                        res.status(500).json({
                            code: 500,
                            message: '获取AI格式化文本失败',
                            error: error_3.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取默认幼儿园的机构现状
     * GET /api/organization-status/default
     */
    OrganizationStatusController.getDefaultStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergarten, status_4, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, kindergarten_model_1.Kindergarten.findOne()];
                    case 1:
                        kindergarten = _a.sent();
                        if (!kindergarten) {
                            return [2 /*return*/, res.status(404).json({
                                    code: 404,
                                    message: '系统中没有幼儿园数据'
                                })];
                        }
                        return [4 /*yield*/, organization_status_service_1.OrganizationStatusService.getOrCreateStatus(kindergarten.id)];
                    case 2:
                        status_4 = _a.sent();
                        res.json({
                            code: 200,
                            message: 'success',
                            data: {
                                kindergarten: {
                                    id: kindergarten.id,
                                    name: kindergarten.name
                                },
                                status: status_4
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('获取默认机构现状失败:', error_4);
                        res.status(500).json({
                            code: 500,
                            message: '获取默认机构现状失败',
                            error: error_4.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return OrganizationStatusController;
}());
exports.OrganizationStatusController = OrganizationStatusController;
