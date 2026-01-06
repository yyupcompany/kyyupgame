/**
 * 广告管理相关类型定义
 */

// 广告类型枚举
export enum AdvertisementType {
  BANNER = 'banner',       // 横幅广告
  POPUP = 'popup',         // 弹窗广告
  FEED = 'feed',           // 信息流广告
  VIDEO = 'video',         // 视频广告
  SEARCH = 'search',       // 搜索广告
  SOCIAL = 'social'        // 社交媒体广告
}

// 广告状态枚举
export enum AdvertisementStatus {
  DRAFT = 'draft',         // 草稿
  PENDING = 'pending',     // 待审核
  ACTIVE = 'active',       // 已激活
  PAUSED = 'paused',       // 已暂停
  EXPIRED = 'expired',     // 已过期
  REJECTED = 'rejected'    // 已拒绝
}

// 广告位置枚举
export enum AdvertisementPosition {
  HOME_PAGE = 'home_page',           // 首页
  CATEGORY_PAGE = 'category_page',   // 分类页
  ARTICLE_PAGE = 'article_page',     // 文章页
  SIDEBAR = 'sidebar',               // 侧边栏
  FOOTER = 'footer',                 // 页脚
  APP_STARTUP = 'app_startup'        // 应用启动页
}

// 广告素材类型
export enum MaterialType {
  IMAGE = 'image',         // 图片
  VIDEO = 'video',         // 视频
  TEXT = 'text',           // 纯文本
  HTML = 'html'            // HTML片段
}

// 广告接口
export interface Advertisement {
  id?: number;                       // 广告ID
  name: string;                      // 广告名称
  type: AdvertisementType;           // 广告类型
  status: AdvertisementStatus;       // 广告状态
  position: AdvertisementPosition;   // 广告位置
  materialType: MaterialType;        // 素材类型
  content: string;                   // 广告内容
  link?: string;                     // 广告链接
  startDate: string;                 // 开始日期
  endDate: string;                   // 结束日期
  targetAudience?: TargetAudience;   // 目标受众
  budget?: number;                   // 预算
  bidAmount?: number;                // 出价金额
  dailyBudget?: number;              // 每日预算
  totalImpressions?: number;         // 总展示次数
  totalClicks?: number;              // 总点击次数
  ctr?: number;                      // 点击率
  conversions?: number;              // 转化次数
  conversionRate?: number;           // 转化率
  roi?: number;                      // 投资回报率
  tags?: string[];                   // 标签
  createdAt?: string;                // 创建时间
  updatedAt?: string;                // 更新时间
  createdBy?: number;                // 创建人ID
}

// 目标受众接口
export interface TargetAudience {
  ageRange?: string[];               // 年龄范围
  gender?: 'male' | 'female' | 'all'; // 性别
  location?: string[];               // 地区
  interests?: string[];              // 兴趣爱好
  behaviors?: string[];              // 行为特征
  customSegments?: string[];         // 自定义细分
}

// 广告素材接口
export interface AdvertisementMaterial {
  id?: number;                       // 素材ID
  advertisementId: number;           // 广告ID
  type: MaterialType;                // 素材类型
  url?: string;                      // 素材URL
  content?: string;                  // 素材内容
  width?: number;                    // 宽度
  height?: number;                   // 高度
  duration?: number;                 // 时长（视频用）
  title?: string;                    // 标题
  description?: string;              // 描述
  createdAt?: string;                // 创建时间
  updatedAt?: string;                // 更新时间
}

// 广告统计接口
export interface AdvertisementStatistics {
  advertisementId: number;           // 广告ID
  impressions: number;               // 展示次数
  clicks: number;                    // 点击次数
  ctr: number;                       // 点击率
  averagePosition?: number;          // 平均位置
  conversions?: number;              // 转化次数
  conversionRate?: number;           // 转化率
  cost?: number;                     // 花费
  cpc?: number;                      // 每次点击成本
  cpm?: number;                      // 千次展示成本
  cpa?: number;                      // 每次行动成本
  roi?: number;                      // 投资回报率
  dailyStats?: DailyStatistics[];    // 每日统计
}

// 每日统计接口
export interface DailyStatistics {
  date: string;                      // 日期
  impressions: number;               // 展示次数
  clicks: number;                    // 点击次数
  ctr: number;                       // 点击率
  conversions?: number;              // 转化次数
  conversionRate?: number;           // 转化率
  cost?: number;                     // 花费
}

// 广告查询参数
export interface AdvertisementQueryParams {
  page?: number;                     // 页码
  limit?: number;                    // 每页条数
  name?: string;                     // 广告名称
  type?: AdvertisementType;          // 广告类型
  status?: AdvertisementStatus;      // 广告状态
  position?: AdvertisementPosition;  // 广告位置
  startDateFrom?: string;            // 开始日期起始
  startDateTo?: string;              // 开始日期截止
  endDateFrom?: string;              // 结束日期起始
  endDateTo?: string;                // 结束日期截止
  createdBy?: number;                // 创建人ID
  tags?: string[];                   // 标签
  sortBy?: string;                   // 排序字段
  sortOrder?: 'asc' | 'desc';        // 排序顺序
} 