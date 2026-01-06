"use strict";
/**
 * AI自动配图服务
 * 使用豆包文生图模型为活动、海报、模板等自动生成配图
 */
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.AutoImageGenerationService = void 0;
var ai_model_cache_service_1 = require("../ai-model-cache.service");
var logger_1 = require("../../utils/logger");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var AutoImageGenerationService = /** @class */ (function () {
    function AutoImageGenerationService() {
        this.doubaoImageModel = null;
        this.initializeModel();
        this.initializeUploadsPath();
    }
    /**
     * 初始化豆包文生图模型
     */
    AutoImageGenerationService.prototype.initializeModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelCacheService, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                        _a = this;
                        return [4 /*yield*/, modelCacheService.getModelByName('doubao-seedream-3-0-t2i-250415')];
                    case 1:
                        _a.doubaoImageModel = _b.sent();
                        if (!this.doubaoImageModel) {
                            logger_1.logger.warn('豆包文生图模型未找到或未激活');
                        }
                        else {
                            logger_1.logger.info('豆包文生图模型初始化成功', {
                                modelId: this.doubaoImageModel.id,
                                modelName: this.doubaoImageModel.name
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('初始化豆包文生图模型失败', { error: error_1 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化上传路径
     */
    AutoImageGenerationService.prototype.initializeUploadsPath = function () {
        // 活动模板图片存储路径 - 指向项目根目录的uploads文件夹
        this.uploadsPath = path_1["default"].join(__dirname, '../../../../uploads/activity-templates');
        // 确保目录存在
        if (!fs_1["default"].existsSync(this.uploadsPath)) {
            fs_1["default"].mkdirSync(this.uploadsPath, { recursive: true });
            logger_1.logger.info('创建活动模板图片存储目录', { path: this.uploadsPath });
        }
    };
    /**
     * 生成图像
     */
    AutoImageGenerationService.prototype.generateImage = function (request) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, modelCacheService, _b, rawPrompt, requestBody, aiBridgeService, response, duration, responseData, imageUrl, error_2, duration;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        if (!!this.doubaoImageModel) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.initializeModel()];
                    case 2:
                        _c.sent();
                        if (!!this.doubaoImageModel) return [3 /*break*/, 4];
                        modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                        _b = this;
                        return [4 /*yield*/, modelCacheService.getModelByName('doubao-seedream-3-0-t2i-250415')];
                    case 3:
                        _b.doubaoImageModel = _c.sent();
                        if (!this.doubaoImageModel) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: '豆包文生图模型不可用'
                                }];
                        }
                        _c.label = 4;
                    case 4:
                        rawPrompt = (request.prompt || '').toString();
                        requestBody = {
                            model: this.doubaoImageModel.name,
                            prompt: rawPrompt,
                            n: 1,
                            size: request.size || '1024x1024',
                            response_format: 'url',
                            quality: request.quality || 'standard',
                            style: request.style || 'natural',
                            guidance_scale: 2.5,
                            watermark: request.watermark !== false
                        };
                        logger_1.logger.info('发送图像生成请求', {
                            model: this.doubaoImageModel.name,
                            prompt: rawPrompt,
                            parameters: requestBody
                        });
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./bridge/ai-bridge.service')); })];
                    case 5:
                        aiBridgeService = (_c.sent()).aiBridgeService;
                        return [4 /*yield*/, aiBridgeService.generateImage({
                                model: this.doubaoImageModel.name,
                                prompt: rawPrompt,
                                n: requestBody.n || 1,
                                size: requestBody.size || '1024x1024',
                                quality: requestBody.quality || 'standard',
                                response_format: requestBody.response_format || 'url'
                            }, {
                                endpointUrl: this.doubaoImageModel.endpointUrl,
                                apiKey: this.doubaoImageModel.apiKey
                            })];
                    case 6:
                        response = _c.sent();
                        duration = Date.now() - startTime;
                        // AIBridgeService已处理错误，直接使用响应
                        if (!response || !response.data) {
                            logger_1.logger.error('图片生成失败', {
                                model: this.doubaoImageModel.name,
                                prompt: rawPrompt
                            });
                            return [2 /*return*/, {
                                    success: false,
                                    error: "\u56FE\u7247\u751F\u6210\u5931\u8D25",
                                    metadata: {
                                        prompt: rawPrompt,
                                        model: this.doubaoImageModel.name,
                                        parameters: requestBody,
                                        duration: duration
                                    }
                                }];
                        }
                        responseData = response;
                        if (responseData.data && responseData.data.length > 0) {
                            imageUrl = responseData.data[0].url;
                            logger_1.logger.info('图像生成成功', {
                                imageUrl: imageUrl,
                                usage: {
                                    generated_images: 1,
                                    output_tokens: 0,
                                    total_tokens: 0
                                },
                                duration: duration
                            });
                            return [2 /*return*/, {
                                    success: true,
                                    imageUrl: imageUrl,
                                    usage: {
                                        generated_images: 0,
                                        output_tokens: 0,
                                        total_tokens: 0
                                    },
                                    metadata: {
                                        prompt: rawPrompt,
                                        model: this.doubaoImageModel.name,
                                        parameters: requestBody,
                                        duration: duration
                                    }
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    success: false,
                                    error: '响应中没有找到图像数据',
                                    metadata: {
                                        prompt: rawPrompt,
                                        model: this.doubaoImageModel.name,
                                        parameters: requestBody,
                                        duration: duration
                                    }
                                }];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _c.sent();
                        duration = Date.now() - startTime;
                        logger_1.logger.error('图像生成异常', { error: error_2, duration: duration });
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : '未知错误',
                                metadata: {
                                    prompt: request.prompt,
                                    model: ((_a = this.doubaoImageModel) === null || _a === void 0 ? void 0 : _a.name) || 'unknown',
                                    parameters: {},
                                    duration: duration
                                }
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 智能提示词生成器 - 基于模板数据生成个性化提示词
     */
    AutoImageGenerationService.prototype.generateSmartPrompt = function (templateName, templateDescription, templateData) {
        // 解析模板数据
        var parsedData = {};
        try {
            if (typeof templateData === 'string') {
                parsedData = JSON.parse(templateData);
            }
            else if (typeof templateData === 'object' && templateData !== null) {
                parsedData = templateData;
            }
        }
        catch (error) {
            logger_1.logger.warn('解析模板数据失败，使用默认配置', { templateData: templateData, error: error });
        }
        // 基于模板名称和描述分析活动类型
        var activityType = this.analyzeActivityType(templateName, templateDescription);
        // 根据活动类型选择艺术风格
        var artStyle = this.selectArtStyle(activityType, parsedData);
        // 生成场景化描述
        var sceneDescription = this.generateSceneDescription(templateName, templateDescription, parsedData, activityType);
        // 生成情感和氛围描述
        var emotionalDescription = this.generateEmotionalDescription(activityType, parsedData);
        // 生成视觉细节描述
        var visualDetails = this.generateVisualDetails(activityType, parsedData);
        // 组合完整提示词
        var prompt = "".concat(sceneDescription, "\uFF0C").concat(emotionalDescription, "\uFF0C").concat(visualDetails);
        return {
            prompt: prompt,
            style: artStyle,
            category: this.mapActivityTypeToCategory(activityType)
        };
    };
    /**
     * 分析活动类型
     */
    AutoImageGenerationService.prototype.analyzeActivityType = function (name, description) {
        var text = "".concat(name, " ").concat(description).toLowerCase();
        // 体育运动类
        if (text.includes('运动') || text.includes('体育') || text.includes('跑步') || text.includes('球类') || text.includes('游戏')) {
            return 'sports';
        }
        // 科学实验类
        if (text.includes('科学') || text.includes('实验') || text.includes('探索') || text.includes('发现')) {
            return 'science';
        }
        // 艺术创作类
        if (text.includes('艺术') || text.includes('创作') || text.includes('绘画') || text.includes('手工') || text.includes('音乐') || text.includes('舞蹈')) {
            return 'art';
        }
        // 节日庆典类
        if (text.includes('节日') || text.includes('庆典') || text.includes('庆祝') || text.includes('传统') || text.includes('文化')) {
            return 'festival';
        }
        // 亲子互动类
        if (text.includes('亲子') || text.includes('家长') || text.includes('互动') || text.includes('陪伴')) {
            return 'family';
        }
        // 教育学习类
        if (text.includes('教育') || text.includes('学习') || text.includes('课程') || text.includes('知识')) {
            return 'education';
        }
        // 户外探险类
        if (text.includes('户外') || text.includes('自然') || text.includes('探险') || text.includes('野餐')) {
            return 'outdoor';
        }
        // 默认为综合活动
        return 'general';
    };
    /**
     * 根据活动类型选择艺术风格
     */
    AutoImageGenerationService.prototype.selectArtStyle = function (activityType, templateData) {
        var ageRange = templateData.ageRange || '3-6岁';
        var isYounger = ageRange.includes('3') || ageRange.includes('4'); // 3-4岁偏向卡通
        var isOlder = ageRange.includes('5') || ageRange.includes('6'); // 5-6岁可以更写实
        switch (activityType) {
            case 'sports':
                return isYounger ? 'cartoon' : 'natural'; // 体育活动：年龄小用卡通，年龄大用自然风格
            case 'science':
                return 'realistic'; // 科学实验：写实风格更能展现实验器材
            case 'art':
                return 'artistic'; // 艺术创作：艺术风格
            case 'festival':
                return 'cartoon'; // 节日庆典：卡通风格更有节日氛围
            case 'family':
                return 'natural'; // 亲子活动：自然风格更温馨
            case 'education':
                return isYounger ? 'cartoon' : 'natural'; // 教育活动：根据年龄选择
            case 'outdoor':
                return 'natural'; // 户外活动：自然风格
            default:
                return 'cartoon'; // 默认卡通风格
        }
    };
    /**
     * 生成场景化描述
     */
    AutoImageGenerationService.prototype.generateSceneDescription = function (name, description, templateData, activityType) {
        var ageRange = templateData.ageRange || '3-6岁';
        var maxParticipants = templateData.maxParticipants || 20;
        var activities = templateData.activities || [];
        var sceneTemplates = {
            sports: "".concat(ageRange, "\u7684\u5C0F\u670B\u53CB\u4EEC\u5728\u5BBD\u655E\u5B89\u5168\u7684\u8FD0\u52A8\u573A\u5730\u4E0A\u53C2\u4E0E").concat(name, "\u6D3B\u52A8\uFF0C").concat(maxParticipants, "\u540D\u5B69\u5B50\u5206\u7EC4\u8FDB\u884C\u5404\u79CD\u4F53\u80B2\u9879\u76EE"),
            science: "\u597D\u5947\u7684".concat(ageRange, "\u5C0F\u670B\u53CB\u4EEC\u56F4\u5750\u5728\u5B9E\u9A8C\u684C\u524D\uFF0C\u4E13\u6CE8\u5730\u89C2\u5BDF").concat(name, "\u4E2D\u7684\u79D1\u5B66\u73B0\u8C61\uFF0C\u5B9E\u9A8C\u5668\u6750\u5B89\u5168\u53EF\u7231"),
            art: "\u5145\u6EE1\u521B\u610F\u7684".concat(ageRange, "\u5B69\u5B50\u4EEC\u5728\u660E\u4EAE\u7684\u827A\u672F\u6559\u5BA4\u91CC\u8FDB\u884C").concat(name, "\uFF0C\u6BCF\u4E2A\u4EBA\u90FD\u4E13\u6CE8\u5730\u521B\u4F5C\u7740\u72EC\u7279\u7684\u4F5C\u54C1"),
            festival: "\u8EAB\u7A7F\u8282\u65E5\u670D\u88C5\u7684".concat(ageRange, "\u5C0F\u670B\u53CB\u4EEC\u5728\u88C5\u9970\u7CBE\u7F8E\u7684\u6559\u5BA4\u91CC\u5E86\u795D").concat(name, "\uFF0C\u6574\u4E2A\u7A7A\u95F4\u5145\u6EE1\u8282\u65E5\u7684\u559C\u60A6\u6C1B\u56F4"),
            family: "\u6E29\u99A8\u7684".concat(name, "\u73B0\u573A\uFF0C").concat(ageRange, "\u7684\u5B69\u5B50\u4EEC\u548C\u5BB6\u957F\u4EEC\u4E00\u8D77\u53C2\u4E0E\u4E92\u52A8\u6D3B\u52A8\uFF0C\u5C55\u73B0\u6D53\u6D53\u7684\u4EB2\u60C5"),
            education: "\u5728\u6E29\u99A8\u7684\u5B66\u4E60\u73AF\u5883\u4E2D\uFF0C".concat(ageRange, "\u7684\u5C0F\u670B\u53CB\u4EEC\u6B63\u5728\u53C2\u4E0E").concat(name, "\uFF0C\u901A\u8FC7\u5BD3\u6559\u4E8E\u4E50\u7684\u65B9\u5F0F\u5B66\u4E60\u65B0\u77E5\u8BC6"),
            outdoor: "\u5728\u5B89\u5168\u7F8E\u4E3D\u7684\u6237\u5916\u73AF\u5883\u4E2D\uFF0C".concat(ageRange, "\u7684\u5B69\u5B50\u4EEC\u6B63\u5728\u4EAB\u53D7").concat(name, "\uFF0C\u4E0E\u5927\u81EA\u7136\u4EB2\u5BC6\u63A5\u89E6"),
            general: "\u5728\u6E29\u99A8\u5B89\u5168\u7684\u5E7C\u513F\u56ED\u73AF\u5883\u4E2D\uFF0C".concat(ageRange, "\u7684\u5C0F\u670B\u53CB\u4EEC\u6B63\u5728\u53C2\u4E0E").concat(name, "\u6D3B\u52A8")
        };
        var baseScene = sceneTemplates[activityType] || sceneTemplates.general;
        // 如果有具体的活动安排，添加更多细节
        if (activities.length > 0) {
            var activityNames = activities.slice(0, 3).map(function (act) { return act.name || act; }).join('、');
            baseScene += "\uFF0C\u6D3B\u52A8\u5305\u542B".concat(activityNames, "\u7B49\u7CBE\u5F69\u73AF\u8282");
        }
        return baseScene;
    };
    /**
     * 生成情感和氛围描述
     */
    AutoImageGenerationService.prototype.generateEmotionalDescription = function (activityType, templateData) {
        var objectives = templateData.objectives || [];
        var emotionalTemplates = {
            sports: '孩子们脸上洋溢着运动的快乐，充满活力和团队合作精神，现场气氛热烈而温馨',
            science: '孩子们眼中闪烁着好奇和探索的光芒，专注而兴奋的表情，充满求知欲的学习氛围',
            art: '每个孩子都沉浸在创作的喜悦中，想象力自由飞翔，艺术创作的专注与快乐并存',
            festival: '节日的喜悦写在每个孩子的脸上，传统文化的温暖传承，欢声笑语充满整个空间',
            family: '亲子间的温馨互动，家长和孩子共同参与的幸福时光，爱意满满的温暖氛围',
            education: '孩子们在快乐中学习，在游戏中成长，充满启发性的教育环境',
            outdoor: '与自然和谐相处的快乐，户外活动的自由与活力，健康成长的美好时光',
            general: '孩子们天真可爱的笑容，快乐成长的美好时光，充满爱与关怀的幼儿园氛围'
        };
        var emotional = emotionalTemplates[activityType] || emotionalTemplates.general;
        // 如果有教育目标，融入情感描述
        if (objectives.length > 0) {
            var mainObjective = objectives[0];
            if (typeof mainObjective === 'string') {
                emotional += "\uFF0C\u4F53\u73B0".concat(mainObjective, "\u7684\u6559\u80B2\u4EF7\u503C");
            }
        }
        return emotional;
    };
    /**
     * 生成视觉细节描述
     */
    AutoImageGenerationService.prototype.generateVisualDetails = function (activityType, templateData) {
        var materials = templateData.materials || [];
        var visualTemplates = {
            sports: '运动器材整齐摆放，安全防护措施到位，明亮的运动场地，充满活力的色彩搭配',
            science: '精心准备的实验器材，安全的实验环境，科学仪器的精致细节，启发性的教学道具',
            art: '丰富多彩的艺术用品，创作工具井然有序，作品展示区域，充满创意的装饰元素',
            festival: '精美的节日装饰，传统文化元素，喜庆的色彩搭配，节日氛围的细节布置',
            family: '温馨的家庭式布置，舒适的互动空间，亲子活动的专用道具，温暖的灯光效果',
            education: '寓教于乐的教学用具，启发性的学习环境，知识展示板，互动式的教学设施',
            outdoor: '自然环境的美丽细节，户外活动的安全设施，与自然和谐的活动道具',
            general: '温馨明亮的幼儿园环境，安全友好的活动设施，色彩丰富的装饰元素'
        };
        var visual = visualTemplates[activityType] || visualTemplates.general;
        // 如果有材料清单，添加具体的视觉元素
        if (materials.length > 0) {
            var materialList = materials.slice(0, 3).join('、');
            visual += "\uFF0C\u73B0\u573A\u51C6\u5907\u4E86".concat(materialList, "\u7B49\u4E13\u4E1A\u7528\u5177");
        }
        // 添加通用的质量和安全要求
        visual += '，高质量渲染，柔和自然光线，细节丰富生动，确保内容适合幼儿观看，体现正面积极的教育价值';
        return visual;
    };
    /**
     * 将活动类型映射到API分类
     */
    AutoImageGenerationService.prototype.mapActivityTypeToCategory = function (activityType) {
        var categoryMap = {
            sports: 'activity',
            science: 'education',
            art: 'activity',
            festival: 'activity',
            family: 'activity',
            education: 'education',
            outdoor: 'activity',
            general: 'template'
        };
        return categoryMap[activityType] || 'template';
    };
    /**
     * 优化提示词 - 专为3-6岁幼儿园场景设计（保留原有逻辑作为备用）
     */
    AutoImageGenerationService.prototype.optimizePrompt = function (originalPrompt, category) {
        var optimizedPrompt = originalPrompt;
        // 根据分类添加特定的幼儿园风格描述
        var categoryPrompts = {
            activity: '3-6岁幼儿园孩子们的活动场景，温馨明亮的教室环境，色彩丰富鲜艳，充满童趣，孩子们天真可爱的笑容，安全友好的游戏设施',
            poster: '幼儿园海报设计，卡通可爱风格，色彩鲜艳温馨，适合3-6岁儿童视觉，简洁易懂的图案，充满童真童趣',
            template: '幼儿园模板设计，卡通插画风格，色彩明快温暖，适合学前教育，布局简洁清晰，充满爱心和关怀',
            marketing: '幼儿园宣传风格，温馨家庭氛围，展现专业教育理念，突出儿童成长快乐，家长信赖感',
            education: '学前教育场景，3-6岁孩子们在学习游戏，寓教于乐的环境，启发式教学，培养兴趣和创造力'
        };
        if (category && categoryPrompts[category]) {
            optimizedPrompt = "".concat(originalPrompt, "\uFF0C").concat(categoryPrompts[category]);
        }
        // 添加幼儿园专用的质量提升词和安全要求
        var kindergartenKeywords = [
            '3-6岁幼儿',
            '安全环保',
            '色彩鲜艳温馨',
            '卡通可爱风格',
            '童真童趣',
            '温馨明亮',
            '专业幼教环境',
            '儿童友好设计',
            '快乐成长氛围',
            '家庭般温暖'
        ];
        optimizedPrompt += "\uFF0C".concat(kindergartenKeywords.join('，'), "\uFF0C\u9AD8\u8D28\u91CF\u6E32\u67D3\uFF0C\u67D4\u548C\u81EA\u7136\u5149\u7EBF\uFF0C\u7EC6\u8282\u4E30\u5BCC\u751F\u52A8");
        // 添加安全和适宜性要求
        optimizedPrompt += '，确保内容适合幼儿观看，无任何不当元素，体现正面积极的教育价值';
        return optimizedPrompt;
    };
    /**
     * 根据模板详细数据生成智能提示词
     */
    AutoImageGenerationService.prototype.generateSmartPromptFromTemplateData = function (templateName, templateDescription, templateData) {
        logger_1.logger.info('开始生成智能提示词', {
            templateName: templateName,
            hasActivities: !!(templateData.activities && templateData.activities.length > 0),
            hasMaterials: !!(templateData.materials && templateData.materials.length > 0),
            hasObjectives: !!(templateData.objectives && templateData.objectives.length > 0)
        });
        // 解析模板数据
        var activities = templateData.activities || [];
        var materials = templateData.materials || [];
        var objectives = templateData.objectives || [];
        var ageRange = templateData.ageRange || '3-6岁';
        var requirements = templateData.requirements || [];
        // 基于模板名称和描述分析活动类型
        var activityType = this.analyzeActivityType(templateName, templateDescription);
        // 构建场景描述
        var sceneDescription = "\u5E7C\u513F\u56ED".concat(templateName, "\u6D3B\u52A8\u573A\u666F\uFF0C").concat(ageRange, "\u7684\u53EF\u7231\u5C0F\u670B\u53CB");
        // 添加具体活动环节
        if (activities.length > 0) {
            var activityNames = activities.slice(0, 3).map(function (act) { return act.name || act; }).join('、');
            sceneDescription += "\u6B63\u5728\u8FDB\u884C".concat(activityNames, "\u7B49\u7CBE\u5F69\u6D3B\u52A8");
        }
        // 添加材料和道具
        if (materials.length > 0) {
            var materialList = materials.slice(0, 4).join('、');
            sceneDescription += "\uFF0C\u73B0\u573A\u51C6\u5907\u4E86".concat(materialList, "\u7B49\u4E13\u4E1A\u7528\u5177");
        }
        // 添加场地要求
        if (requirements.length > 0) {
            var locationReq = requirements.find(function (req) {
                return req.includes('场地') || req.includes('教室') || req.includes('室外') || req.includes('室内');
            });
            if (locationReq) {
                sceneDescription += "\uFF0C\u5728".concat(locationReq);
            }
        }
        // 生成情感和氛围描述
        var emotionalDescription = this.generateEmotionalDescription(activityType, templateData);
        // 生成视觉细节描述
        var visualDetails = this.generateVisualDetails(activityType, templateData);
        // 组合完整提示词 - 移除硬编码的卡通风格
        var prompt = "".concat(sceneDescription, "\uFF0C").concat(emotionalDescription, "\uFF0C").concat(visualDetails, "\uFF0C\u8272\u5F69\u9C9C\u8273\u6E29\u99A8\uFF0C\u9002\u5408\u5E7C\u513F\u56ED\u73AF\u5883\uFF0C\u9AD8\u8D28\u91CF\u6E32\u67D3");
        logger_1.logger.info('智能提示词生成完成', {
            prompt: prompt.substring(0, 100) + '...',
            activityType: activityType,
            activitiesCount: activities.length,
            materialsCount: materials.length
        });
        return {
            prompt: prompt,
            style: this.selectArtStyle(activityType, templateData),
            category: this.mapActivityTypeToCategory(activityType)
        };
    };
    /**
     * 为幼儿园活动生成配图
     */
    AutoImageGenerationService.prototype.generateActivityImage = function (activityTitle, activityDescription, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = (activityDescription && activityDescription.trim()) || (activityTitle && activityTitle.trim()) || '';
                return [2 /*return*/, this.generateImage({
                        prompt: prompt,
                        category: 'activity',
                        style: (options === null || options === void 0 ? void 0 : options.style) || 'natural',
                        size: (options === null || options === void 0 ? void 0 : options.size) || '1024x768',
                        quality: (options === null || options === void 0 ? void 0 : options.quality) || 'standard'
                    })];
            });
        });
    };
    /**
     * 为幼儿园海报生成配图
     */
    AutoImageGenerationService.prototype.generatePosterImage = function (posterTitle, posterContent, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = posterContent || posterTitle || '';
                return [2 /*return*/, this.generateImage({
                        prompt: prompt,
                        category: 'poster',
                        style: (options === null || options === void 0 ? void 0 : options.style) || 'natural',
                        size: (options === null || options === void 0 ? void 0 : options.size) || '1024x1024',
                        quality: (options === null || options === void 0 ? void 0 : options.quality) || 'hd'
                    })];
            });
        });
    };
    /**
     * 下载图片并保存到本地
     */
    AutoImageGenerationService.prototype.downloadAndSaveImage = function (imageUrl, filename) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var filePath = path_1["default"].join(_this.uploadsPath, filename);
                        var file = fs_1["default"].createWriteStream(filePath);
                        var protocol = imageUrl.startsWith('https:') ? https_1["default"] : http_1["default"];
                        protocol.get(imageUrl, function (response) {
                            if (response.statusCode !== 200) {
                                reject(new Error("\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ".concat(response.statusCode)));
                                return;
                            }
                            response.pipe(file);
                            file.on('finish', function () {
                                file.close();
                                // 返回相对于uploads根目录的路径，用于生成访问URL
                                var relativePath = "/uploads/activity-templates/".concat(filename);
                                logger_1.logger.info('图片下载保存成功', {
                                    originalUrl: imageUrl,
                                    localPath: filePath,
                                    accessUrl: relativePath
                                });
                                resolve(relativePath);
                            });
                            file.on('error', function (err) {
                                fs_1["default"].unlink(filePath, function () { }); // 删除不完整的文件
                                reject(err);
                            });
                        }).on('error', function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    };
    /**
     * 将中文模板名转换为英文文件名
     */
    AutoImageGenerationService.prototype.convertTemplateNameToEnglish = function (templateName) {
        var nameMap = {
            '节日庆典': 'festival-celebration',
            '科学实验课': 'science-experiment',
            '艺术创作坊': 'art-workshop',
            '亲子运动会': 'parent-child-sports',
            '音乐舞蹈': 'music-dance',
            '户外探索': 'outdoor-exploration',
            '手工制作': 'handicraft',
            '故事时间': 'story-time',
            '体育游戏': 'sports-game',
            '自然观察': 'nature-observation'
        };
        // 如果有对应的英文名，使用英文名
        if (nameMap[templateName]) {
            return nameMap[templateName];
        }
        // 如果没有对应的英文名，使用拼音或简化处理
        // 移除特殊字符，用连字符替换空格
        return templateName
            .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 移除特殊字符，保留中文、字母、数字
            .replace(/\s+/g, '-') // 空格替换为连字符
            .toLowerCase() // 转小写
            .replace(/[\u4e00-\u9fff]/g, 'template'); // 中文字符替换为template
    };
    /**
     * 为幼儿园模板生成配图 - 使用智能提示词生成
     */
    AutoImageGenerationService.prototype.generateTemplateImage = function (templateName, templateDescription, templateData) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, smartPrompt, result, timestamp, randomSuffix, englishName, filename, localImageUrl, downloadError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('开始生成模板配图', {
                            templateName: templateName,
                            templateDescription: templateDescription,
                            hasTemplateData: !!templateData
                        });
                        prompt = '';
                        if (templateData && Object.keys(templateData).length > 0) {
                            smartPrompt = this.generateSmartPromptFromTemplateData(templateName, templateDescription, templateData);
                            prompt = smartPrompt.prompt;
                            logger_1.logger.info('使用智能提示词生成', { prompt: prompt });
                        }
                        else {
                            // 如果没有详细数据，使用基础描述
                            prompt = (templateDescription && templateDescription.trim()) || (templateName && templateName.trim()) || '';
                            logger_1.logger.info('使用基础描述生成', { prompt: prompt });
                        }
                        return [4 /*yield*/, this.generateImage({
                                prompt: prompt,
                                category: 'template',
                                style: 'cartoon',
                                size: '1024x768',
                                quality: 'hd' // 提升质量
                            })];
                    case 1:
                        result = _a.sent();
                        if (!(result.success && result.imageUrl)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        timestamp = Date.now();
                        randomSuffix = Math.round(Math.random() * 1e9);
                        englishName = this.convertTemplateNameToEnglish(templateName);
                        filename = "template-".concat(englishName, "-").concat(timestamp, "-").concat(randomSuffix, ".jpg");
                        logger_1.logger.info('生成文件名', {
                            originalName: templateName,
                            englishName: englishName,
                            filename: filename
                        });
                        return [4 /*yield*/, this.downloadAndSaveImage(result.imageUrl, filename)];
                    case 3:
                        localImageUrl = _a.sent();
                        // 返回本地图片URL
                        return [2 /*return*/, __assign(__assign({}, result), { imageUrl: localImageUrl, metadata: __assign(__assign({}, result.metadata), { originalUrl: result.imageUrl, localPath: localImageUrl }) })];
                    case 4:
                        downloadError_1 = _a.sent();
                        logger_1.logger.error('下载图片到本地失败', {
                            originalUrl: result.imageUrl,
                            error: downloadError_1
                        });
                        // 如果下载失败，仍然返回原始URL
                        return [2 /*return*/, result];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 批量生成图像
     */
    AutoImageGenerationService.prototype.generateBatchImages = function (requests) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, requests_1, request, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, requests_1 = requests;
                        _a.label = 1;
                    case 1:
                        if (!(_i < requests_1.length)) return [3 /*break*/, 7];
                        request = requests_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.generateImage(request)];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        // 避免请求过于频繁
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 4:
                        // 避免请求过于频繁
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        results.push({
                            success: false,
                            error: error_3 instanceof Error ? error_3.message : '批量生成失败'
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 检查服务状态
     */
    AutoImageGenerationService.prototype.checkServiceStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelCacheService, _a, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!!this.doubaoImageModel) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.initializeModel()];
                    case 1:
                        _b.sent();
                        if (!!this.doubaoImageModel) return [3 /*break*/, 3];
                        modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                        _a = this;
                        return [4 /*yield*/, modelCacheService.getModelByName('doubao-seedream-3-0-t2i-250415')];
                    case 2:
                        _a.doubaoImageModel = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!this.doubaoImageModel) {
                            return [2 /*return*/, {
                                    available: false,
                                    error: '豆包文生图模型未配置'
                                }];
                        }
                        return [2 /*return*/, {
                                available: true,
                                model: this.doubaoImageModel.name
                            }];
                    case 4:
                        error_4 = _b.sent();
                        return [2 /*return*/, {
                                available: false,
                                error: error_4 instanceof Error ? error_4.message : '服务检查失败'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AutoImageGenerationService;
}());
exports.AutoImageGenerationService = AutoImageGenerationService;
// 导出服务实例
exports["default"] = new AutoImageGenerationService();
