/**
 * 静态资源端点配置
 *
 * 用于统一管理项目中所有静态资源的URL配置
 * 包括占位符图片、空状态图片、默认头像等
 */

// 基础CDN配置
const CDN_BASE = {
  // 国内CDN
  domestic: 'https://fastly.jsdelivr.net',
  // 备用CDN
  fallback: 'https://cdn.jsdelivr.net'
};

// 占位符图片配置
const PLACEHOLDER_CONFIG = {
  // 基础占位符服务
  service: 'https://via.placeholder.com',
  // 默认尺寸
  defaultSize: '100x100',
  // 默认背景色
  backgroundColor: '4facfe',
  // 默认文字颜色
  textColor: 'ffffff',
  // 默认文字
  defaultText: '图片'
};

// 静态资源端点配置
export const ASSETS_ENDPOINTS = {
  // 空状态图片
  empty: {
    // Vant组件库的默认空状态图片
    vantEmpty: `${CDN_BASE.domestic}/npm/@vant/assets/custom-empty-image.png`,
    // 通用空状态图片
    generalEmpty: `${CDN_BASE.domestic}/npm/@vant/assets/custom-empty-image.png`,
    // 数据空状态
    dataEmpty: `${CDN_BASE.domestic}/npm/@vant/assets/custom-empty-image.png`,
    // 网络错误空状态
    networkError: `${CDN_BASE.domestic}/npm/@vant/assets/custom-empty-image.png`
  },

  // 占位符图片生成器
  placeholder: {
    // 生成占位符图片的方法
    generate: (width: number = 100, height: number = 100, text?: string, bgColor?: string) => {
      const size = `${width}x${height}`;
      const background = bgColor || PLACEHOLDER_CONFIG.backgroundColor;
      const textColor = PLACEHOLDER_CONFIG.textColor;
      const displayText = text || PLACEHOLDER_CONFIG.defaultText;

      return `${PLACEHOLDER_CONFIG.service}/${size}/${background}/${textColor}?text=${encodeURIComponent(displayText)}`;
    },

    // 预定义的常用占位符
    avatar: (size: number = 32) => `${PLACEHOLDER_CONFIG.service}/${size}x${size}/4facfe/ffffff?text=头像`,
    userAvatar: () => `${PLACEHOLDER_CONFIG.service}/32x32/43e97b/ffffff?text=用户`,
    teacherAvatar: () => `${PLACEHOLDER_CONFIG.service}/32x32/ff6b6b/ffffff?text=老师`,
    studentAvatar: () => `${PLACEHOLDER_CONFIG.service}/32x32/4ecdc4/ffffff?text=学生`,

    // 活动相关占位符
    activityIcon: (size: number = 100) => `${PLACEHOLDER_CONFIG.service}/${size}x${size}/f368e0/ffffff?text=活动`,
    cyclingIcon: () => `${PLACEHOLDER_CONFIG.service}/100x100/4facfe/ffffff?text=骑车`,
    drawingIcon: () => `${PLACEHOLDER_CONFIG.service}/100x100/43e97b/ffffff?text=画画`,
    sportsIcon: () => `${PLACEHOLDER_CONFIG.service}/100x100/ff6b6b/ffffff?text=运动`,
    readingIcon: () => `${PLACEHOLDER_CONFIG.service}/100x100/a8e6cf/ffffff?text=阅读`,

    // 成长记录占位符
    growthPhoto: (text: string = '成长') => `${PLACEHOLDER_CONFIG.service}/100x100/667eea/ffffff?text=${text}`,
    skillPhoto: () => `${PLACEHOLDER_CONFIG.service}/100x100/764ba2/ffffff?text=技能`,
    healthPhoto: () => `${PLACEHOLDER_CONFIG.service}/100x100/6bcf7f/ffffff?text=健康`,

    // 通用占位符
    loading: () => `${PLACEHOLDER_CONFIG.service}/100x100/e0e0e0/9e9e9e?text=加载中`,
    error: () => `${PLACEHOLDER_CONFIG.service}/100x100/f44336/ffffff?text=错误`,
    noImage: () => `${PLACEHOLDER_CONFIG.service}/100x100/9e9e9e/ffffff?text=无图片`
  },

  // 默认头像配置
  avatars: {
    // 用户默认头像
    userDefault: `${PLACEHOLDER_CONFIG.service}/64x64/4facfe/ffffff?text=用户`,
    // 教师默认头像
    teacherDefault: `${PLACEHOLDER_CONFIG.service}/64x64/ff6b6b/ffffff?text=老师`,
    // 家长默认头像
    parentDefault: `${PLACEHOLDER_CONFIG.service}/64x64/43e97b/ffffff?text=家长`,
    // 学生默认头像
    studentDefault: `${PLACEHOLDER_CONFIG.service}/64x64/4ecdc4/ffffff?text=学生`,
    // 系统默认头像
    systemDefault: `${PLACEHOLDER_CONFIG.service}/64x64/9e9e9e/ffffff?text=系统`
  },

  // 图标资源
  icons: {
    // 活动类型图标
    activity: {
      outdoor: `${PLACEHOLDER_CONFIG.service}/24x24/4facfe/ffffff?text=户外`,
      indoor: `${PLACEHOLDER_CONFIG.service}/24x24/43e97b/ffffff?text=室内`,
      learning: `${PLACEHOLDER_CONFIG.service}/24x24/f368e0/ffffff?text=学习`,
      sports: `${PLACEHOLDER_CONFIG.service}/24x24/ff6b6b/ffffff?text=运动`,
      art: `${PLACEHOLDER_CONFIG.service}/24x24/a8e6cf/ffffff?text=艺术`
    },
    // 成长类型图标
    growth: {
      milestone: `${PLACEHOLDER_CONFIG.service}/24x24/667eea/ffffff?text=里程碑`,
      skill: `${PLACEHOLDER_CONFIG.service}/24x24/764ba2/ffffff?text=技能`,
      health: `${PLACEHOLDER_CONFIG.service}/24x24/6bcf7f/ffffff?text=健康`,
      social: `${PLACEHOLDER_CONFIG.service}/24x24/feca57/ffffff?text=社交`
    }
  }
};

// 导出占位符生成函数的快捷方式
export const { placeholder: placeholderGenerator } = ASSETS_ENDPOINTS;

// 导出常用的快捷方法
export const {
  avatar: getAvatarPlaceholder,
  activityIcon: getActivityPlaceholder,
  growthPhoto: getGrowthPlaceholder
} = ASSETS_ENDPOINTS.placeholder;

// 类型定义
export interface AssetEndpointConfig {
  empty: {
    vantEmpty: string;
    generalEmpty: string;
    dataEmpty: string;
    networkError: string;
  };
  placeholder: {
    generate: (width?: number, height?: number, text?: string, bgColor?: string) => string;
    avatar: (size?: number) => string;
    userAvatar: () => string;
    teacherAvatar: () => string;
    studentAvatar: () => string;
    activityIcon: (size?: number) => string;
    cyclingIcon: () => string;
    drawingIcon: () => string;
    growthPhoto: (text?: string) => string;
    loading: () => string;
    error: () => string;
  };
  avatars: {
    userDefault: string;
    teacherDefault: string;
    parentDefault: string;
    studentDefault: string;
    systemDefault: string;
  };
}

// 默认导出
export default ASSETS_ENDPOINTS;