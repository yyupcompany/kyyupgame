/**
 * 营销组件服务层索引文件
 * 用于导出所有营销相关服务
 */

// 导入实现的服务
import CouponService from './coupon.service';
import MarketingCampaignService from './marketing-campaign.service';
import ChannelTrackingService from './channel-tracking.service';
import AdvertisementService from './advertisement.service';
import ConversionTrackingService from './conversion-tracking.service';
import { PosterTemplateService } from './poster-template.service';
import { PosterGenerationService } from './poster-generation.service';

// 导出已实现的服务
export { 
  CouponService, 
  MarketingCampaignService, 
  ChannelTrackingService, 
  AdvertisementService, 
  ConversionTrackingService,
  PosterTemplateService,
  PosterGenerationService
};

/**
 * 导出所有营销服务
 * @description 随着服务实现，将依次取消注释
 */
export default {
  CouponService,
  MarketingCampaignService,
  ChannelTrackingService,
  AdvertisementService,
  ConversionTrackingService,
  PosterTemplateService,
  PosterGenerationService
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