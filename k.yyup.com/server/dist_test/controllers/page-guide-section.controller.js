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
exports.PageGuideSectionController = void 0;
var page_guide_model_1 = require("../models/page-guide.model");
/**
 * 页面功能板块控制器
 */
var PageGuideSectionController = /** @class */ (function () {
    function PageGuideSectionController() {
    }
    /**
     * 创建页面功能板块
     */
    PageGuideSectionController.createPageGuideSection = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pageGuideId, sectionName, sectionDescription, sectionPath, features, sortOrder, isActive, newSection, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, pageGuideId = _a.pageGuideId, sectionName = _a.sectionName, sectionDescription = _a.sectionDescription, sectionPath = _a.sectionPath, features = _a.features, sortOrder = _a.sortOrder, isActive = _a.isActive;
                        if (!pageGuideId || !sectionName || !sectionDescription) {
                            res.status(400).json({
                                success: false,
                                message: '页面说明文档ID、板块名称和板块描述不能为空'
                            });
                            return [2 /*return*/];
                        }
                        console.log('📝 创建页面功能板块:', sectionName);
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.create({
                                pageGuideId: pageGuideId,
                                sectionName: sectionName,
                                sectionDescription: sectionDescription,
                                sectionPath: sectionPath,
                                features: features || [],
                                sortOrder: sortOrder || 0,
                                isActive: isActive !== undefined ? isActive : true
                            })];
                    case 1:
                        newSection = _b.sent();
                        console.log('✅ 页面功能板块创建成功:', sectionName);
                        res.status(201).json({
                            success: true,
                            message: '页面功能板块创建成功',
                            data: newSection
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error('❌ 创建页面功能板块失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '创建页面功能板块失败',
                            error: error_1 instanceof Error ? error_1.message : String(error_1)
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取页面功能板块列表
     */
    PageGuideSectionController.getPageGuideSections = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pageGuideId, whereCondition, sections, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        pageGuideId = req.query.pageGuideId;
                        whereCondition = { isActive: true };
                        if (pageGuideId) {
                            whereCondition.pageGuideId = pageGuideId;
                        }
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.findAll({
                                where: whereCondition,
                                order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
                            })];
                    case 1:
                        sections = _a.sent();
                        res.json({
                            success: true,
                            message: '获取页面功能板块列表成功',
                            data: sections
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ 获取页面功能板块列表失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取页面功能板块列表失败',
                            error: error_2 instanceof Error ? error_2.message : String(error_2)
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新页面功能板块
     */
    PageGuideSectionController.updatePageGuideSection = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, sectionName, sectionDescription, sectionPath, features, sortOrder, isActive, section, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        _a = req.body, sectionName = _a.sectionName, sectionDescription = _a.sectionDescription, sectionPath = _a.sectionPath, features = _a.features, sortOrder = _a.sortOrder, isActive = _a.isActive;
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.findByPk(id)];
                    case 1:
                        section = _b.sent();
                        if (!section) {
                            res.status(404).json({
                                success: false,
                                message: '页面功能板块不存在'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, section.update({
                                sectionName: sectionName || section.sectionName,
                                sectionDescription: sectionDescription || section.sectionDescription,
                                sectionPath: sectionPath !== undefined ? sectionPath : section.sectionPath,
                                features: features || section.features,
                                sortOrder: sortOrder !== undefined ? sortOrder : section.sortOrder,
                                isActive: isActive !== undefined ? isActive : section.isActive
                            })];
                    case 2:
                        _b.sent();
                        console.log('✅ 页面功能板块更新成功:', section.sectionName);
                        res.json({
                            success: true,
                            message: '页面功能板块更新成功',
                            data: section
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        console.error('❌ 更新页面功能板块失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '更新页面功能板块失败',
                            error: error_3 instanceof Error ? error_3.message : String(error_3)
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除页面功能板块
     */
    PageGuideSectionController.deletePageGuideSection = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, section, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.findByPk(id)];
                    case 1:
                        section = _a.sent();
                        if (!section) {
                            res.status(404).json({
                                success: false,
                                message: '页面功能板块不存在'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, section.update({ isActive: false })];
                    case 2:
                        _a.sent();
                        console.log('✅ 页面功能板块删除成功:', section.sectionName);
                        res.json({
                            success: true,
                            message: '页面功能板块删除成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('❌ 删除页面功能板块失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '删除页面功能板块失败',
                            error: error_4 instanceof Error ? error_4.message : String(error_4)
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PageGuideSectionController;
}());
exports.PageGuideSectionController = PageGuideSectionController;
