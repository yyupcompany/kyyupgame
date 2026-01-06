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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.PosterGenerationService = void 0;
var sequelize_1 = require("sequelize");
var poster_generation_model_1 = require("../../models/poster-generation.model");
var poster_template_model_1 = require("../../models/poster-template.model");
var user_model_1 = require("../../models/user.model");
var logger_1 = require("../../utils/logger");
var poster_template_service_1 = require("./poster-template.service");
/**
 * 海报生成服务实现类
 */
var PosterGenerationService = /** @class */ (function () {
    function PosterGenerationService() {
        this.posterTemplateService = new poster_template_service_1.PosterTemplateService();
    }
    /**
     * 生成海报
     * @param data 海报生成数据
     * @param userId 创建者ID
     * @returns 生成的海报
     */
    PosterGenerationService.prototype.generatePoster = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var template, posterData, poster, imageUrl, thumbnailUrl, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, poster_template_model_1.PosterTemplate.findByPk(data.templateId)];
                    case 1:
                        template = _a.sent();
                        if (!template) {
                            throw new Error('模板不存在');
                        }
                        return [4 /*yield*/, template.increment('usageCount')];
                    case 2:
                        _a.sent();
                        posterData = __assign(__assign({}, data), { parameters: JSON.stringify(data.parameters), creatorId: userId, updaterId: userId, posterUrl: 'placeholder-url-will-be-updated', viewCount: 0, downloadCount: 0, shareCount: 0 });
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.create(posterData)];
                    case 3:
                        poster = _a.sent();
                        return [4 /*yield*/, this.generatePosterImage(poster.id, data.templateId, data.parameters)];
                    case 4:
                        imageUrl = _a.sent();
                        return [4 /*yield*/, this.generateThumbnail(imageUrl)];
                    case 5:
                        thumbnailUrl = _a.sent();
                        return [4 /*yield*/, poster.update({
                                imageUrl: imageUrl,
                                thumbnailUrl: thumbnailUrl,
                                posterUrl: imageUrl
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.getPosterById(poster.id)];
                    case 7:
                        error_1 = _a.sent();
                        logger_1.logger.error('生成海报失败', { error: error_1 });
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取海报详情
     * @param id 海报ID
     * @returns 海报详情
     */
    PosterGenerationService.prototype.getPosterById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var poster, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.findByPk(id, {
                                include: [
                                    { model: poster_template_model_1.PosterTemplate, as: 'template' },
                                    { model: user_model_1.User, as: 'creator', attributes: ['id', 'username', 'name'] }
                                ]
                            })];
                    case 1:
                        poster = _a.sent();
                        if (!poster) {
                            throw new Error('海报不存在');
                        }
                        return [4 /*yield*/, poster.increment('viewCount')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, poster];
                    case 3:
                        error_2 = _a.sent();
                        logger_1.logger.error('获取海报详情失败', { error: error_2, id: id });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新海报
     * @param id 海报ID
     * @param data 更新数据
     * @param userId 更新者ID
     * @returns 更新后的海报
     */
    PosterGenerationService.prototype.updatePoster = function (id, data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var poster, parameters, restData, updateData, imageUrl, thumbnailUrl, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.findByPk(id)];
                    case 1:
                        poster = _a.sent();
                        if (!poster) {
                            throw new Error('海报不存在');
                        }
                        parameters = data.parameters, restData = __rest(data, ["parameters"]);
                        updateData = __assign(__assign({}, restData), { updaterId: userId });
                        if (!parameters) return [3 /*break*/, 4];
                        updateData.parameters = JSON.stringify(parameters);
                        return [4 /*yield*/, this.generatePosterImage(id, poster.templateId, parameters)];
                    case 2:
                        imageUrl = _a.sent();
                        return [4 /*yield*/, this.generateThumbnail(imageUrl)];
                    case 3:
                        thumbnailUrl = _a.sent();
                        updateData.imageUrl = imageUrl;
                        updateData.thumbnailUrl = thumbnailUrl;
                        _a.label = 4;
                    case 4: return [4 /*yield*/, poster.update(updateData)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.getPosterById(id)];
                    case 6:
                        error_3 = _a.sent();
                        logger_1.logger.error('更新海报失败', { error: error_3, id: id });
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除海报
     * @param id 海报ID
     * @returns 删除结果
     */
    PosterGenerationService.prototype.deletePoster = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var poster, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.findByPk(id)];
                    case 1:
                        poster = _a.sent();
                        if (!poster) {
                            throw new Error('海报不存在');
                        }
                        return [4 /*yield*/, poster.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        logger_1.logger.error('删除海报失败', { error: error_4, id: id });
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取海报列表
     * @param query 查询参数
     * @returns 海报列表和总数
     */
    PosterGenerationService.prototype.getPosters = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, name_1, templateId, status_1, kindergartenId, creatorId, startDate, endDate, where;
            var _c, _d;
            return __generator(this, function (_e) {
                try {
                    _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.pageSize, pageSize = _b === void 0 ? 10 : _b, name_1 = query.name, templateId = query.templateId, status_1 = query.status, kindergartenId = query.kindergartenId, creatorId = query.creatorId, startDate = query.startDate, endDate = query.endDate;
                    where = {};
                    if (name_1)
                        where.name = (_c = {}, _c[sequelize_1.Op.like] = "%".concat(name_1, "%"), _c);
                    if (templateId)
                        where.templateId = templateId;
                    if (status_1 !== undefined)
                        where.status = status_1;
                    if (kindergartenId)
                        where.kindergartenId = kindergartenId;
                    if (creatorId)
                        where.creatorId = creatorId;
                    if (startDate && endDate) {
                        where.createdAt = (_d = {}, _d[sequelize_1.Op.between] = [new Date(startDate), new Date(endDate)], _d);
                    }
                    return [2 /*return*/, poster_generation_model_1.PosterGeneration.findAndCountAll({
                            where: where,
                            limit: pageSize,
                            offset: (page - 1) * pageSize,
                            order: [['createdAt', 'DESC']],
                            include: [
                                { model: poster_template_model_1.PosterTemplate, as: 'template' },
                                { model: user_model_1.User, as: 'creator', attributes: ['id', 'username', 'name'] }
                            ]
                        })];
                }
                catch (error) {
                    logger_1.logger.error('获取海报列表失败', { error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 预览海报
     * @param id 模板或海报ID
     * @param params 参数
     * @param isTemplate 是否是模板
     */
    PosterGenerationService.prototype.previewPoster = function (id, params, isTemplate) {
        return __awaiter(this, void 0, void 0, function () {
            var previewUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('Previewing poster', { id: id, isTemplate: isTemplate });
                        return [4 /*yield*/, this.generatePosterImage(isTemplate ? 0 : id, isTemplate ? id : 0, params)];
                    case 1:
                        previewUrl = _a.sent();
                        return [2 /*return*/, { previewUrl: previewUrl }];
                }
            });
        });
    };
    /**
     * 下载海报
     * @param id 海报ID
     * @param userId 用户ID
     */
    PosterGenerationService.prototype.downloadPoster = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var poster;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPosterById(id)];
                    case 1:
                        poster = _a.sent();
                        return [4 /*yield*/, poster.increment('downloadCount')];
                    case 2:
                        _a.sent();
                        logger_1.logger.info("User ".concat(userId, " downloaded poster ").concat(id));
                        return [2 /*return*/, poster.imageUrl];
                }
            });
        });
    };
    /**
     * 分享海报
     * @param id 海报ID
     * @param shareParams 分享参数
     * @param userId 用户ID
     */
    PosterGenerationService.prototype.sharePoster = function (id, shareParams, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var poster;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPosterById(id)];
                    case 1:
                        poster = _a.sent();
                        return [4 /*yield*/, poster.increment('shareCount')];
                    case 2:
                        _a.sent();
                        logger_1.logger.info("User ".concat(userId, " shared poster ").concat(id, " to ").concat(shareParams.channel));
                        // In a real scenario, this would interact with social media APIs
                        return [2 /*return*/, { success: true, link: "https://example.com/shared_poster_".concat(id) }];
                }
            });
        });
    };
    /**
     * 获取海报统计数据
     * @param query 查询参数
     */
    PosterGenerationService.prototype.getPosterStats = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, startDate, endDate, where, totalGenerated, totalViews, totalDownloads, totalShares;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        kindergartenId = query.kindergartenId, startDate = query.startDate, endDate = query.endDate;
                        where = {};
                        if (kindergartenId)
                            where.kindergartenId = kindergartenId;
                        if (startDate && endDate) {
                            where.createdAt = (_a = {}, _a[sequelize_1.Op.between] = [startDate, endDate], _a);
                        }
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.count({ where: where })];
                    case 1:
                        totalGenerated = _b.sent();
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.sum('viewCount', { where: where })];
                    case 2:
                        totalViews = _b.sent();
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.sum('downloadCount', { where: where })];
                    case 3:
                        totalDownloads = _b.sent();
                        return [4 /*yield*/, poster_generation_model_1.PosterGeneration.sum('shareCount', { where: where })];
                    case 4:
                        totalShares = _b.sent();
                        return [2 /*return*/, {
                                totalGenerated: totalGenerated,
                                totalViews: totalViews || 0,
                                totalDownloads: totalDownloads || 0,
                                totalShares: totalShares || 0
                            }];
                }
            });
        });
    };
    PosterGenerationService.prototype.generatePosterImage = function (posterId, templateId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info("Generating poster image for posterId: ".concat(posterId), { templateId: templateId, parameters: parameters });
                // Simulate image generation
                return [2 /*return*/, Promise.resolve("https://example.com/poster_".concat(posterId || templateId, ".png"))];
            });
        });
    };
    PosterGenerationService.prototype.generateThumbnail = function (imageUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info("Generating thumbnail for image: ".concat(imageUrl));
                // Simulate thumbnail generation
                return [2 /*return*/, Promise.resolve(imageUrl.replace('.png', '_thumb.png'))];
            });
        });
    };
    return PosterGenerationService;
}());
exports.PosterGenerationService = PosterGenerationService;
// 导出服务实例
exports["default"] = new PosterGenerationService();
