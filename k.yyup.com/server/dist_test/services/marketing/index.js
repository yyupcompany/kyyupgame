"use strict";
/**
 * 营销组件服务层索引文件
 * 用于导出所有营销相关服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PosterGenerationService = exports.PosterTemplateService = exports.ConversionTrackingService = exports.AdvertisementService = exports.ChannelTrackingService = exports.MarketingCampaignService = exports.CouponService = void 0;
// 导入实现的服务
var coupon_service_1 = __importDefault(require("./coupon.service"));
exports.CouponService = coupon_service_1["default"];
var marketing_campaign_service_1 = __importDefault(require("./marketing-campaign.service"));
exports.MarketingCampaignService = marketing_campaign_service_1["default"];
var channel_tracking_service_1 = __importDefault(require("./channel-tracking.service"));
exports.ChannelTrackingService = channel_tracking_service_1["default"];
var advertisement_service_1 = __importDefault(require("./advertisement.service"));
exports.AdvertisementService = advertisement_service_1["default"];
var conversion_tracking_service_1 = __importDefault(require("./conversion-tracking.service"));
exports.ConversionTrackingService = conversion_tracking_service_1["default"];
var poster_template_service_1 = require("./poster-template.service");
exports.PosterTemplateService = poster_template_service_1.PosterTemplateService;
var poster_generation_service_1 = require("./poster-generation.service");
exports.PosterGenerationService = poster_generation_service_1.PosterGenerationService;
/**
 * 导出所有营销服务
 * @description 随着服务实现，将依次取消注释
 */
exports["default"] = {
    CouponService: coupon_service_1["default"],
    MarketingCampaignService: marketing_campaign_service_1["default"],
    ChannelTrackingService: channel_tracking_service_1["default"],
    AdvertisementService: advertisement_service_1["default"],
    ConversionTrackingService: conversion_tracking_service_1["default"],
    PosterTemplateService: poster_template_service_1.PosterTemplateService,
    PosterGenerationService: poster_generation_service_1.PosterGenerationService
};
/**
 * 开发计划:
 * 1. 优惠券服务 (coupon.service.ts) ✓
 * 2. 营销活动服务 (marketing-campaign.service.ts) ✓
 * 3. 渠道跟踪服务 (channel-tracking.service.ts) ✓
 * 4. 广告投放服务 (advertisement.service.ts) ✓
 * 5. 转化跟踪服务 (conversion-tracking.service.ts) ✓
 * 6. 海报模板服务 (poster-template.service.ts) ✓
 * 7. 海报生成服务 (poster-generation.service.ts) ✓
 */ 
