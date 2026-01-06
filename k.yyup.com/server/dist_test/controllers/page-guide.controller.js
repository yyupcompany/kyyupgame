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
exports.PageGuideController = void 0;
var page_guide_model_1 = require("../models/page-guide.model");
/**
 * 页面说明文档控制器
 */
var PageGuideController = /** @class */ (function () {
    function PageGuideController() {
    }
    /**
     * 根据页面路径获取页面说明文档
     */
    PageGuideController.getPageGuide = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pagePath, decodedPath, pageGuide, allPageGuides, _i, allPageGuides_1, guide, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        pagePath = req.params.pagePath;
                        if (!pagePath) {
                            res.status(400).json({
                                success: false,
                                message: '页面路径不能为空'
                            });
                            return [2 /*return*/];
                        }
                        decodedPath = decodeURIComponent(pagePath);
                        console.log('🔍 查找页面说明文档:', decodedPath);
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({
                                where: {
                                    pagePath: decodedPath,
                                    isActive: true
                                },
                                include: [
                                    {
                                        model: page_guide_model_1.PageGuideSection,
                                        as: 'sections',
                                        where: { isActive: true },
                                        required: false,
                                        order: [['sortOrder', 'ASC']]
                                    }
                                ]
                            })];
                    case 1:
                        pageGuide = _a.sent();
                        if (!!pageGuide) return [3 /*break*/, 3];
                        console.log('🔄 精确匹配失败，尝试动态路径匹配...');
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findAll({
                                where: {
                                    isActive: true
                                },
                                include: [
                                    {
                                        model: page_guide_model_1.PageGuideSection,
                                        as: 'sections',
                                        where: { isActive: true },
                                        required: false,
                                        order: [['sortOrder', 'ASC']]
                                    }
                                ]
                            })];
                    case 2:
                        allPageGuides = _a.sent();
                        // 尝试匹配动态路径
                        for (_i = 0, allPageGuides_1 = allPageGuides; _i < allPageGuides_1.length; _i++) {
                            guide = allPageGuides_1[_i];
                            if (PageGuideController.matchDynamicPath(guide.pagePath, decodedPath)) {
                                pageGuide = guide;
                                console.log('✅ 动态路径匹配成功:', guide.pagePath, '->', decodedPath);
                                break;
                            }
                        }
                        _a.label = 3;
                    case 3:
                        if (!pageGuide) {
                            console.log('ℹ️  未找到页面说明文档，返回空对象:', decodedPath);
                            // 返回空对象而不是404错误，避免前端显示错误提示
                            res.status(200).json({
                                success: true,
                                data: null,
                                message: '该页面暂无说明文档'
                            });
                            return [2 /*return*/];
                        }
                        console.log('✅ 找到页面说明文档:', pageGuide.pageName);
                        res.status(200).json({
                            success: true,
                            data: pageGuide,
                            message: '页面说明文档获取成功'
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ 获取页面说明文档失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取页面说明文档失败'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 匹配动态路径
     * @param pattern 路径模式，如 /activity/detail/:id
     * @param path 实际路径，如 /activity/detail/15
     * @returns 是否匹配
     */
    PageGuideController.matchDynamicPath = function (pattern, path) {
        // 将路径模式转换为正则表达式
        // :id -> ([^/]+)
        // :slug -> ([^/]+)
        // * -> (.*)
        var regexPattern = pattern
            .replace(/:[^/]+/g, '([^/]+)') // 参数占位符
            .replace(/\*/g, '(.*)') // 通配符
            .replace(/\//g, '\\/'); // 转义斜杠
        var regex = new RegExp("^".concat(regexPattern, "$"));
        var isMatch = regex.test(path);
        if (isMatch) {
            console.log("\uD83C\uDFAF \u8DEF\u5F84\u5339\u914D\u6210\u529F: ".concat(pattern, " -> ").concat(path));
        }
        return isMatch;
    };
    /**
     * 获取所有页面说明文档列表
     */
    PageGuideController.getPageGuideList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, category, offset, limit, whereCondition, _d, count, rows, result, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, category = _a.category;
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        whereCondition = { isActive: true };
                        if (category) {
                            whereCondition.category = category;
                        }
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findAndCountAll({
                                where: whereCondition,
                                include: [
                                    {
                                        model: page_guide_model_1.PageGuideSection,
                                        as: 'sections',
                                        where: { isActive: true },
                                        required: false,
                                        order: [['sortOrder', 'ASC']]
                                    }
                                ],
                                order: [['importance', 'DESC'], ['createdAt', 'DESC']],
                                offset: offset,
                                limit: limit
                            })];
                    case 1:
                        _d = _e.sent(), count = _d.count, rows = _d.rows;
                        result = {
                            data: rows,
                            pagination: {
                                total: count,
                                page: Number(page),
                                pageSize: Number(pageSize),
                                totalPages: Math.ceil(count / Number(pageSize))
                            }
                        };
                        res.status(200).json({
                            success: true,
                            data: result,
                            message: '页面说明文档列表获取成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _e.sent();
                        console.error('❌ 获取页面说明文档列表失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取页面说明文档列表失败'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建页面说明文档
     */
    PageGuideController.createPageGuide = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, pagePath, pageName, pageDescription, category, importance, relatedTables, contextPrompt, isActive, existingGuide, newGuide, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = req.body, pagePath = _a.pagePath, pageName = _a.pageName, pageDescription = _a.pageDescription, category = _a.category, importance = _a.importance, relatedTables = _a.relatedTables, contextPrompt = _a.contextPrompt, isActive = _a.isActive;
                        if (!pagePath || !pageName) {
                            res.status(400).json({
                                success: false,
                                message: '页面路径和页面名称不能为空'
                            });
                            return [2 /*return*/];
                        }
                        console.log('📝 创建页面说明文档:', pagePath);
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({
                                where: { pagePath: pagePath }
                            })];
                    case 1:
                        existingGuide = _b.sent();
                        if (!existingGuide) return [3 /*break*/, 3];
                        // 更新现有记录
                        return [4 /*yield*/, existingGuide.update({
                                pageName: pageName,
                                pageDescription: pageDescription,
                                category: category,
                                importance: importance || 5,
                                relatedTables: relatedTables || [],
                                contextPrompt: contextPrompt,
                                isActive: isActive !== undefined ? isActive : true
                            })];
                    case 2:
                        // 更新现有记录
                        _b.sent();
                        console.log('✅ 页面说明文档更新成功:', pagePath);
                        res.json({
                            success: true,
                            message: '页面说明文档更新成功',
                            data: existingGuide
                        });
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, page_guide_model_1.PageGuide.create({
                            pagePath: pagePath,
                            pageName: pageName,
                            pageDescription: pageDescription,
                            category: category,
                            importance: importance || 5,
                            relatedTables: relatedTables || [],
                            contextPrompt: contextPrompt,
                            isActive: isActive !== undefined ? isActive : true
                        })];
                    case 4:
                        newGuide = _b.sent();
                        console.log('✅ 页面说明文档创建成功:', pagePath);
                        res.status(201).json({
                            success: true,
                            message: '页面说明文档创建成功',
                            data: newGuide
                        });
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _b.sent();
                        console.error('❌ 创建页面说明文档失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '创建页面说明文档失败',
                            error: error_3 instanceof Error ? error_3.message : String(error_3)
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新页面说明文档
     */
    PageGuideController.updatePageGuide = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.status(501).json({
                        success: false,
                        message: '页面说明文档更新功能暂未实现'
                    });
                }
                catch (error) {
                    console.error('❌ 更新页面说明文档失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '更新页面说明文档失败'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 删除页面说明文档
     */
    PageGuideController.deletePageGuide = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.status(501).json({
                        success: false,
                        message: '页面说明文档删除功能暂未实现'
                    });
                }
                catch (error) {
                    console.error('❌ 删除页面说明文档失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '删除页面说明文档失败'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 批量创建营销中心页面感知配置（临时方法）
     */
    PageGuideController.createMarketingPageGuides = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var createdGuides, channelsGuide, existingSections, referralsGuide, existingReferralSections, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 17, , 18]);
                        console.log('🚀 开始批量创建营销中心页面感知配置...');
                        createdGuides = [];
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({ where: { pagePath: '/marketing/channels' } })];
                    case 1:
                        channelsGuide = _a.sent();
                        if (!!channelsGuide) return [3 /*break*/, 3];
                        return [4 /*yield*/, page_guide_model_1.PageGuide.create({
                                pagePath: '/marketing/channels',
                                pageName: '营销渠道',
                                pageDescription: '营销渠道管理是营销中心的核心功能之一。在这里您可以管理所有的营销推广渠道，包括线上线下各种渠道的配置、效果监控、成本分析和ROI计算。系统支持渠道分类管理、联系人维护、标签管理和详细的数据分析功能。',
                                category: '营销页面',
                                importance: 9,
                                relatedTables: ["channel_trackings", "conversion_trackings", "marketing_campaigns", "users", "teachers", "parents"],
                                contextPrompt: '用户正在营销渠道页面，专注于渠道管理和效果分析。用户可能需要查看渠道数据、分析ROI、管理渠道配置、优化推广效果等。请根据渠道跟踪和转化数据提供专业的营销建议。',
                                isActive: true
                            })];
                    case 2:
                        channelsGuide = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.log('✅ 营销渠道页面配置已存在，跳过创建');
                        _a.label = 4;
                    case 4: return [4 /*yield*/, page_guide_model_1.PageGuideSection.findAll({ where: { pageGuideId: channelsGuide.id } })];
                    case 5:
                        existingSections = _a.sent();
                        if (!(existingSections.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.bulkCreate([
                                {
                                    pageGuideId: channelsGuide.id,
                                    sectionName: '渠道概览',
                                    sectionDescription: '展示所有营销渠道的整体效果统计，包括访问量、线索数、转化数和ROI等关键指标',
                                    sectionPath: '/marketing/channels',
                                    features: ["渠道统计", "效果对比", "成本分析", "ROI计算", "趋势分析", "渠道排名"],
                                    sortOrder: 1,
                                    isActive: true
                                },
                                {
                                    pageGuideId: channelsGuide.id,
                                    sectionName: '渠道管理',
                                    sectionDescription: '管理各个营销渠道的基本信息、配置参数和状态控制',
                                    sectionPath: '/marketing/channels',
                                    features: ["渠道新建", "信息编辑", "状态管理", "分类设置", "参数配置", "批量操作"],
                                    sortOrder: 2,
                                    isActive: true
                                },
                                {
                                    pageGuideId: channelsGuide.id,
                                    sectionName: '联系人管理',
                                    sectionDescription: '维护各渠道的联系人信息，支持联系人的增删改查和关系管理',
                                    sectionPath: '/marketing/channels',
                                    features: ["联系人添加", "信息维护", "关系绑定", "批量导入", "通讯录管理", "联系记录"],
                                    sortOrder: 3,
                                    isActive: true
                                },
                                {
                                    pageGuideId: channelsGuide.id,
                                    sectionName: '标签管理',
                                    sectionDescription: '为渠道添加标签进行分类管理，支持标签的创建、编辑和批量操作',
                                    sectionPath: '/marketing/channels',
                                    features: ["标签创建", "分类管理", "批量标记", "标签筛选", "智能推荐", "标签统计"],
                                    sortOrder: 4,
                                    isActive: true
                                },
                                {
                                    pageGuideId: channelsGuide.id,
                                    sectionName: '数据分析',
                                    sectionDescription: '深入分析渠道效果数据，提供多维度的数据可视化和报表功能',
                                    sectionPath: '/marketing/channels',
                                    features: ["效果分析", "图表展示", "数据导出", "对比分析", "预测模型", "报表生成"],
                                    sortOrder: 5,
                                    isActive: true
                                }
                            ])];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        console.log('✅ 营销渠道页面功能板块已存在，跳过创建');
                        _a.label = 8;
                    case 8:
                        console.log('✅ 营销渠道页面配置处理完成');
                        createdGuides.push({ name: '营销渠道', id: channelsGuide.id });
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({ where: { pagePath: '/marketing/referrals' } })];
                    case 9:
                        referralsGuide = _a.sent();
                        if (!!referralsGuide) return [3 /*break*/, 11];
                        return [4 /*yield*/, page_guide_model_1.PageGuide.create({
                                pagePath: '/marketing/referrals',
                                pageName: '老带新',
                                pageDescription: '老带新推荐系统是幼儿园获取新生源的重要渠道。通过现有家长的推荐，可以有效降低获客成本，提高转化率。系统提供完整的推荐关系管理、奖励机制设置、效果跟踪和数据分析功能，帮助幼儿园建立可持续的推荐营销体系。',
                                category: '营销页面',
                                importance: 8,
                                relatedTables: ["referral_relationships", "parents", "students", "users", "marketing_campaigns", "enrollment_applications"],
                                contextPrompt: '用户正在老带新页面，专注于推荐营销管理。用户可能需要查看推荐数据、管理推荐关系、设置奖励机制、分析推荐效果等。请结合推荐关系和家长数据提供针对性的建议。',
                                isActive: true
                            })];
                    case 10:
                        referralsGuide = _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        console.log('✅ 老带新页面配置已存在，跳过创建');
                        _a.label = 12;
                    case 12: return [4 /*yield*/, page_guide_model_1.PageGuideSection.findAll({ where: { pageGuideId: referralsGuide.id } })];
                    case 13:
                        existingReferralSections = _a.sent();
                        if (!(existingReferralSections.length === 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, page_guide_model_1.PageGuideSection.bulkCreate([
                                {
                                    pageGuideId: referralsGuide.id,
                                    sectionName: '推荐概览',
                                    sectionDescription: '展示老带新推荐的整体效果，包括推荐数量、成功率、奖励发放等关键指标',
                                    sectionPath: '/marketing/referrals',
                                    features: ["推荐统计", "成功率分析", "奖励统计", "趋势分析", "排行榜", "效果对比"],
                                    sortOrder: 1,
                                    isActive: true
                                },
                                {
                                    pageGuideId: referralsGuide.id,
                                    sectionName: '推荐关系',
                                    sectionDescription: '管理推荐人和被推荐人之间的关系，跟踪推荐状态和进展',
                                    sectionPath: '/marketing/referrals',
                                    features: ["关系建立", "状态跟踪", "进展管理", "关系图谱", "批量导入", "关系验证"],
                                    sortOrder: 2,
                                    isActive: true
                                },
                                {
                                    pageGuideId: referralsGuide.id,
                                    sectionName: '奖励机制',
                                    sectionDescription: '设置和管理推荐奖励规则，包括奖励类型、发放条件和奖励记录',
                                    sectionPath: '/marketing/referrals',
                                    features: ["奖励设置", "规则配置", "发放管理", "记录查询", "统计分析", "自动发放"],
                                    sortOrder: 3,
                                    isActive: true
                                },
                                {
                                    pageGuideId: referralsGuide.id,
                                    sectionName: '效果分析',
                                    sectionDescription: '分析老带新推荐的效果数据，提供多维度的统计和可视化分析',
                                    sectionPath: '/marketing/referrals',
                                    features: ["效果统计", "转化分析", "成本效益", "趋势预测", "对比分析", "报表导出"],
                                    sortOrder: 4,
                                    isActive: true
                                }
                            ])];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        console.log('✅ 老带新页面功能板块已存在，跳过创建');
                        _a.label = 16;
                    case 16:
                        console.log('✅ 老带新页面配置处理完成');
                        createdGuides.push({ name: '老带新', id: referralsGuide.id });
                        res.json({
                            success: true,
                            message: '营销中心页面感知配置创建完成',
                            data: {
                                createdGuides: createdGuides,
                                totalCreated: createdGuides.length
                            }
                        });
                        return [3 /*break*/, 18];
                    case 17:
                        error_4 = _a.sent();
                        console.error('❌ 批量创建页面感知配置失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '批量创建页面感知配置失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 快速创建剩余营销页面配置（临时方法）
     */
    PageGuideController.createRemainingMarketingPages = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var createdGuides, remainingPages, _i, remainingPages_1, pageConfig, existingGuide, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        console.log('🚀 开始创建剩余营销页面配置...');
                        createdGuides = [];
                        remainingPages = [
                            {
                                pagePath: '/marketing/conversions',
                                pageName: '转换统计',
                                pageDescription: '转换统计页面提供全面的营销转换数据分析，帮助了解从线索到最终报名的完整转换过程。通过多维度的数据分析和可视化图表，可以识别转换瓶颈，优化营销策略，提高整体转换效率。',
                                category: '营销页面',
                                importance: 9,
                                relatedTables: ["conversion_trackings", "channel_trackings", "marketing_campaigns", "enrollment_applications", "admission_results"],
                                contextPrompt: '用户正在转换统计页面，专注于营销转换分析。用户可能需要查看转换数据、分析转换漏斗、优化转换路径、提升转换率等。请基于转换数据提供专业的优化建议。'
                            },
                            {
                                pagePath: '/marketing/funnel',
                                pageName: '销售漏斗',
                                pageDescription: '销售漏斗分析是营销效果评估的重要工具，通过可视化展示从初次接触到最终报名的完整客户旅程。帮助识别各阶段的转换率，发现流失原因，优化销售流程，提升整体转换效果。',
                                category: '营销页面',
                                importance: 9,
                                relatedTables: ["channel_trackings", "conversion_trackings", "enrollment_applications", "admission_results", "marketing_campaigns"],
                                contextPrompt: '用户正在销售漏斗页面，专注于销售流程分析。用户可能需要查看漏斗数据、分析转换率、优化销售流程、提升转换效果等。请基于漏斗数据提供销售优化建议。'
                            },
                            {
                                pagePath: '/marketing',
                                pageName: '营销活动',
                                pageDescription: '营销活动管理是营销中心的核心功能，提供完整的活动生命周期管理。从活动策划、创建、执行到效果评估，系统支持多种活动类型和推广方式，帮助幼儿园有效开展各类营销推广活动。',
                                category: '营销页面',
                                importance: 8,
                                relatedTables: ["marketing_campaigns", "activities", "channel_trackings", "conversion_trackings", "enrollment_applications"],
                                contextPrompt: '用户正在营销活动页面，专注于活动管理和推广。用户可能需要创建活动、管理活动、分析活动效果、优化活动策略等。请基于活动数据提供专业的营销活动建议。'
                            },
                            {
                                pagePath: '/advertisement',
                                pageName: '推广渠道',
                                pageDescription: '推广渠道管理专注于广告投放和推广活动的管理。系统支持多种广告形式和投放渠道，提供广告创意管理、投放计划制定、效果监控和成本控制等功能，帮助优化广告投放效果。',
                                category: '营销页面',
                                importance: 7,
                                relatedTables: ["advertisements", "marketing_campaigns", "channel_trackings", "conversion_trackings"],
                                contextPrompt: '用户正在推广渠道页面，专注于广告投放和推广管理。用户可能需要管理广告、制定投放计划、监控投放效果、优化广告策略等。请基于广告数据提供专业的投放建议。'
                            },
                            {
                                pagePath: '/centers/marketing/consultations',
                                pageName: '咨询管理',
                                pageDescription: '咨询管理系统专门处理家长的入园咨询和报名咨询。通过系统化的咨询流程管理、专业的咨询记录和跟进机制，提升咨询转换率，为家长提供优质的咨询服务体验。',
                                category: '营销页面',
                                importance: 8,
                                relatedTables: ["enrollment_consultations", "consultation_records", "parents", "students", "teachers", "enrollment_applications"],
                                contextPrompt: '用户正在咨询管理页面，专注于咨询服务和转换管理。用户可能需要处理咨询记录、跟进咨询进展、分析咨询效果、优化咨询流程等。请基于咨询数据提供专业的咨询服务建议。'
                            }
                        ];
                        _i = 0, remainingPages_1 = remainingPages;
                        _a.label = 1;
                    case 1:
                        if (!(_i < remainingPages_1.length)) return [3 /*break*/, 6];
                        pageConfig = remainingPages_1[_i];
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({ where: { pagePath: pageConfig.pagePath } })];
                    case 2:
                        existingGuide = _a.sent();
                        if (!!existingGuide) return [3 /*break*/, 4];
                        return [4 /*yield*/, page_guide_model_1.PageGuide.create(pageConfig)];
                    case 3:
                        existingGuide = _a.sent();
                        console.log("\u2705 ".concat(pageConfig.pageName, " \u9875\u9762\u914D\u7F6E\u521B\u5EFA\u5B8C\u6210"));
                        createdGuides.push({ name: pageConfig.pageName, id: existingGuide.id });
                        return [3 /*break*/, 5];
                    case 4:
                        console.log("\u2705 ".concat(pageConfig.pageName, " \u9875\u9762\u914D\u7F6E\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\u521B\u5EFA"));
                        createdGuides.push({ name: pageConfig.pageName, id: existingGuide.id, existed: true });
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        res.json({
                            success: true,
                            message: '剩余营销页面感知配置创建完成',
                            data: {
                                createdGuides: createdGuides,
                                totalProcessed: createdGuides.length
                            }
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _a.sent();
                        console.error('❌ 创建剩余页面配置失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '创建剩余页面配置失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return PageGuideController;
}());
exports.PageGuideController = PageGuideController;
