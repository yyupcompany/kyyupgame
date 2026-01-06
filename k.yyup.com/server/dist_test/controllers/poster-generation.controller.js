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
exports.getPosterStats = exports.sharePoster = exports.downloadPoster = exports.previewPoster = exports.getPosters = exports.deletePoster = exports.updatePoster = exports.getPosterById = exports.generatePoster = void 0;
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var auto_image_generation_service_1 = require("../services/ai/auto-image-generation.service");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
/**
 * 下载图片到本地
 */
var downloadImage = function (url, filepath) {
    return new Promise(function (resolve, reject) {
        var protocol = url.startsWith('https:') ? https_1["default"] : http_1["default"];
        var file = fs_1["default"].createWriteStream(filepath);
        protocol.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                resolve();
            });
        }).on('error', function (err) {
            fs_1["default"].unlink(filepath, function () { }); // 删除失败的文件
            reject(err);
        });
    });
};
/**
 * 生成海报
 */
var generatePoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, templateId, customData, _b, includeBasicInfo, kindergartenInfo, Kindergarten, error_1, templateNames, templateName, kindergartenName, address, phone, contactPerson, posterPrompt, imageGenerationService, result, timestamp, filename, uploadsDir, localPath, poster, error_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                _a = req.body, templateId = _a.templateId, customData = _a.customData, _b = _a.includeBasicInfo, includeBasicInfo = _b === void 0 ? true : _b;
                kindergartenInfo = null;
                if (!includeBasicInfo) return [3 /*break*/, 4];
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                Kindergarten = init_1.sequelize.models.Kindergarten;
                return [4 /*yield*/, Kindergarten.findOne({
                        where: { status: 1 },
                        attributes: ['name', 'address', 'consultationPhone', 'phone', 'contactPerson', 'logoUrl'],
                        raw: true
                    })];
            case 2:
                kindergartenInfo = _d.sent();
                console.log('🏫 获取幼儿园基础信息:', kindergartenInfo);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _d.sent();
                console.warn('⚠️ 获取幼儿园基础信息失败，使用默认值', error_1);
                return [3 /*break*/, 4];
            case 4:
                templateNames = {
                    1: '节日庆典',
                    2: '艺术创作',
                    3: '科学实验',
                    4: '体育运动'
                };
                templateName = templateNames[templateId] || '幼儿园活动';
                kindergartenName = (kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.name) || (customData === null || customData === void 0 ? void 0 : customData.kindergartenName) || '幼儿园';
                address = (kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.address) || (customData === null || customData === void 0 ? void 0 : customData.address) || '';
                phone = (kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.consultationPhone) || (kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.phone) || (customData === null || customData === void 0 ? void 0 : customData.phone) || '';
                contactPerson = (kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.contactPerson) || (customData === null || customData === void 0 ? void 0 : customData.contactPerson) || '';
                posterPrompt = "\n\u521B\u5EFA\u4E00\u5F20\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED".concat(templateName, "\u6D77\u62A5\uFF0C\u8981\u6C42\uFF1A\n\n**\u6D3B\u52A8\u4FE1\u606F\uFF1A**\n- \u6807\u9898\uFF1A").concat((customData === null || customData === void 0 ? void 0 : customData.title) || '幼儿园活动', "\n- \u526F\u6807\u9898\uFF1A").concat((customData === null || customData === void 0 ? void 0 : customData.subtitle) || '快乐成长，精彩童年', "\n- \u4E3B\u8981\u5185\u5BB9\uFF1A").concat((customData === null || customData === void 0 ? void 0 : customData.content) || '欢迎参加我们的精彩活动', "\n\n**\u5E7C\u513F\u56ED\u4FE1\u606F\uFF1A**\n- \u5E7C\u513F\u56ED\u540D\u79F0\uFF1A").concat(kindergartenName, "\n").concat(address ? "- \u56ED\u533A\u5730\u5740\uFF1A".concat(address) : '', "\n").concat(phone ? "- \u54A8\u8BE2\u7535\u8BDD\uFF1A".concat(phone) : '', "\n").concat(contactPerson ? "- \u8054\u7CFB\u4EBA\uFF1A".concat(contactPerson) : '', "\n\n**\u8BBE\u8BA1\u8981\u6C42\uFF1A**\n- \u8BBE\u8BA1\u98CE\u683C\uFF1A\u6E29\u99A8\u3001\u6D3B\u6CFC\u3001\u4E13\u4E1A\n- \u8272\u5F69\uFF1A\u660E\u4EAE\u6E29\u6696\u7684\u8272\u8C03\n- \u5C3A\u5BF8\uFF1A\u9002\u5408\u624B\u673A\u5206\u4EAB\u7684\u7AD6\u7248\u6D77\u62A5 (750x1334\u50CF\u7D20)\n- \u5305\u542B\u53EF\u7231\u7684\u5361\u901A\u5143\u7D20\u548C\u88C5\u9970\n- \u6587\u5B57\u6E05\u6670\u6613\u8BFB\uFF0C\u5E03\u5C40\u7F8E\u89C2\n- \u5E7C\u513F\u56ED\u540D\u79F0\u8981\u9192\u76EE\u663E\u793A\n- \u8054\u7CFB\u65B9\u5F0F\u8981\u6E05\u6670\u53EF\u89C1\n").trim();
                console.log('🎨 开始生成海报');
                console.log('📋 海报提示词:', posterPrompt);
                console.log('🏫 幼儿园信息:', { kindergartenName: kindergartenName, address: address, phone: phone, contactPerson: contactPerson });
                imageGenerationService = new auto_image_generation_service_1.AutoImageGenerationService();
                return [4 /*yield*/, imageGenerationService.generateImage({
                        prompt: posterPrompt,
                        category: 'poster',
                        style: 'natural',
                        size: '1024x1024',
                        quality: 'standard'
                    })];
            case 5:
                result = _d.sent();
                if (!result.success || !result.imageUrl) {
                    throw new Error("\u56FE\u7247\u751F\u6210\u5931\u8D25: ".concat(result.error || '未获取到图片URL'));
                }
                console.log('✅ 海报生成成功，图片URL:', result.imageUrl);
                timestamp = Date.now();
                filename = "poster_".concat(templateId, "_").concat(timestamp, ".jpg");
                uploadsDir = path_1["default"].join(process.cwd(), 'uploads', 'posters');
                // 确保目录存在
                if (!fs_1["default"].existsSync(uploadsDir)) {
                    fs_1["default"].mkdirSync(uploadsDir, { recursive: true });
                }
                localPath = path_1["default"].join(uploadsDir, filename);
                // 下载图片到本地
                return [4 /*yield*/, downloadImage(result.imageUrl, localPath)];
            case 6:
                // 下载图片到本地
                _d.sent();
                console.log('📁 海报已保存到本地:', localPath);
                poster = {
                    id: timestamp,
                    templateId: templateId,
                    title: (customData === null || customData === void 0 ? void 0 : customData.title) || '生成的海报',
                    url: "/uploads/posters/".concat(filename),
                    imageUrl: "/uploads/posters/".concat(filename),
                    status: 'completed',
                    width: 750,
                    height: 1334,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                apiResponse_1.ApiResponse.success(res, poster, '海报生成成功', 201);
                return [3 /*break*/, 8];
            case 7:
                error_2 = _d.sent();
                console.error('❌ 海报生成失败:', error_2);
                apiResponse_1.ApiResponse.handleError(res, error_2, '海报生成失败');
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.generatePoster = generatePoster;
/**
 * 获取海报详情
 */
var getPosterById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, poster;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            poster = {
                id: Number(id) || 0,
                templateId: 1,
                title: '春季招生海报',
                imageUrl: "/posters/poster_".concat(id, ".png"),
                status: 'completed',
                width: 750,
                height: 1334,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, poster, '获取海报详情成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '获取海报详情失败');
        }
        return [2 /*return*/];
    });
}); };
exports.getPosterById = getPosterById;
/**
 * 更新海报
 */
var updatePoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, poster;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            poster = __assign(__assign({ id: Number(id) || 0 }, req.body), { updatedBy: userId, updatedAt: new Date() });
            apiResponse_1.ApiResponse.success(res, poster, '更新海报成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '更新海报失败');
        }
        return [2 /*return*/];
    });
}); };
exports.updatePoster = updatePoster;
/**
 * 删除海报
 */
var deletePoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            apiResponse_1.ApiResponse.success(res, null, '删除海报成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '删除海报失败');
        }
        return [2 /*return*/];
    });
}); };
exports.deletePoster = deletePoster;
/**
 * 获取海报列表
 */
var getPosters = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, posters, result;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c;
            posters = [
                {
                    id: 1,
                    templateId: 1,
                    title: '春季招生海报',
                    imageUrl: '/posters/poster_1.png',
                    status: 'completed',
                    createdAt: new Date()
                },
                {
                    id: 2,
                    templateId: 2,
                    title: '活动宣传海报',
                    imageUrl: '/posters/poster_2.png',
                    status: 'completed',
                    createdAt: new Date()
                }
            ];
            result = {
                items: posters,
                page: Number(page) || 0,
                pageSize: Number(pageSize) || 0,
                total: posters.length,
                totalPages: Math.ceil(posters.length / Number(pageSize) || 0)
            };
            apiResponse_1.ApiResponse.success(res, result, '获取海报列表成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '获取海报列表失败');
        }
        return [2 /*return*/];
    });
}); };
exports.getPosters = getPosters;
/**
 * 预览海报
 */
var previewPoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, previewData;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            previewData = {
                posterId: Number(id) || 0,
                previewUrl: "/api/posters/".concat(id, "/preview.png"),
                width: 750,
                height: 1334,
                generatedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, previewData, '生成海报预览成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '生成海报预览失败');
        }
        return [2 /*return*/];
    });
}); };
exports.previewPoster = previewPoster;
/**
 * 下载海报
 */
var downloadPoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, downloadUrl;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            downloadUrl = "/api/posters/".concat(id, "/download");
            res.json({
                success: true,
                data: {
                    downloadUrl: downloadUrl,
                    filename: "poster_".concat(id, ".png")
                },
                message: '获取下载链接成功'
            });
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '获取下载链接失败');
        }
        return [2 /*return*/];
    });
}); };
exports.downloadPoster = downloadPoster;
/**
 * 分享海报
 */
var sharePoster = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, shareResult;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的海报ID');
            }
            shareResult = {
                posterId: Number(id) || 0,
                shareUrl: "https://example.com/posters/share/".concat(id),
                qrCode: "/api/posters/".concat(id, "/qrcode.png"),
                sharedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, shareResult, '分享海报成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '分享海报失败');
        }
        return [2 /*return*/];
    });
}); };
exports.sharePoster = sharePoster;
/**
 * 获取海报统计
 */
var getPosterStats = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    return __generator(this, function (_a) {
        try {
            stats = {
                totalPosters: 25,
                completedPosters: 20,
                pendingPosters: 3,
                failedPosters: 2,
                totalViews: 1250,
                totalShares: 85
            };
            apiResponse_1.ApiResponse.success(res, stats, '获取海报统计成功');
        }
        catch (error) {
            apiResponse_1.ApiResponse.handleError(res, error, '获取海报统计失败');
        }
        return [2 /*return*/];
    });
}); };
exports.getPosterStats = getPosterStats;
