/**
 * OSS路径映射配置
 * 基于实际OSS目录结构定义的路径映射
 */

// OSS基础配置
export const OSS_CONFIG = {
  baseUrl: 'https://systemkarder.oss-cn-guangzhou.aliyuncs.com',
  useOSS: import.meta.env.PROD || import.meta.env.VITE_APP_USE_OSS === 'true'
}

// 游戏图片路径映射
export const GAME_IMAGE_PATHS = {
  // 游戏背景图片
  backgrounds: {
    'robot-factory': '/kindergarten/games/images/robot-factory-bg.jpg',
    'animal-observer': '/kindergarten/games/images/animal-observer-bg.jpg',
    'fruit-memory': '/kindergarten/games/images/backgrounds/fruit-memory/',
    'princess-garden': '/kindergarten/games/images/backgrounds/princess-garden/',
    'space-adventure': '/kindergarten/games/images/backgrounds/space-adventure/'
  },

  // Robot Factory 角色部件
  robotFactory: {
    base: '/kindergarten/games/images/robot-factory/',
    roles: {
      firefighter: '/kindergarten/games/images/robot-factory/firefighter/',
      doctor: '/kindergarten/games/images/robot-factory/doctor/',
      astronaut: '/kindergarten/games/images/robot-factory/astronaut/',
      artist: '/kindergarten/games/images/robot-factory/artist/'
    }
  },

  // 游戏通用素材
  baskets: '/kindergarten/games/images/baskets/',
  cards: {
    professions: '/kindergarten/games/images/cards/professions/',
    cardBack: '/kindergarten/games/images/cards/card-back/',
    cardFront: '/kindergarten/games/images/cards/card-front/'
  }
}

// 活动图片路径映射
export const ACTIVITY_IMAGE_PATHS = {
  // 教育活动图片
  activities: '/kindergarten/education/activities/',

  // 评估图片
  assessment: {
    images: '/kindergarten/education/assessment/images/',
    audio: '/kindergarten/games/audio/'
  },

  // 开发相关图标
  development: {
    icons: '/kindergarten/development/icons/'
  }
}

// 用户相关图片路径映射
export const USER_IMAGE_PATHS = {
  // 头像图片
  avatars: {
    default: '/kindergarten/development/icons/',
    user: '/kindergarten/students/',
    thumbnails: '/kindergarten/students/thumbnails/'
  },

  // 照片
  photos: '/kindergarten/photos/'
}

/**
 * 根据游戏名称获取图片路径
 * @param gameName 游戏名称
 * @param imageName 图片名称
 * @param role 角色（可选）
 * @returns 完整的OSS路径
 */
export function getGameImagePath(gameName: string, imageName: string, role?: string): string {
  const baseUrl = OSS_CONFIG.baseUrl

  // 处理背景图片
  if (GAME_IMAGE_PATHS.backgrounds[gameName as keyof typeof GAME_IMAGE_PATHS.backgrounds]) {
    const bgPath = GAME_IMAGE_PATHS.backgrounds[gameName as keyof typeof GAME_IMAGE_PATHS.backgrounds]
    return baseUrl + bgPath + imageName
  }

  // 处理Robot Factory游戏
  if (gameName === 'robot-factory' && role) {
    const rolePath = GAME_IMAGE_PATHS.robotFactory.roles[role as keyof typeof GAME_IMAGE_PATHS.robotFactory.roles]
    if (rolePath) {
      return baseUrl + rolePath + imageName
    }
  }

  // 处理通用游戏图片
  if (gameName === 'baskets') {
    return baseUrl + GAME_IMAGE_PATHS.baskets + imageName
  }

  if (gameName === 'cards-professions') {
    return baseUrl + GAME_IMAGE_PATHS.cards.professions + imageName
  }

  // 默认路径
  return baseUrl + '/kindergarten/games/images/' + imageName
}

/**
 * 根据活动类型获取图片路径
 * @param activityType 活动类型
 * @param imageName 图片名称
 * @returns 完整的OSS路径
 */
export function getActivityImagePath(activityType: string, imageName: string): string {
  const baseUrl = OSS_CONFIG.baseUrl

  switch (activityType) {
    case 'activities':
      return baseUrl + ACTIVITY_IMAGE_PATHS.activities + imageName
    case 'assessment':
      return baseUrl + ACTIVITY_IMAGE_PATHS.assessment.images + imageName
    case 'development':
      return baseUrl + ACTIVITY_IMAGE_PATHS.development.icons + imageName
    default:
      return baseUrl + ACTIVITY_IMAGE_PATHS.activities + imageName
  }
}

/**
 * 获取用户头像路径
 * @param imageType 图片类型
 * @param imageName 图片名称
 * @returns 完整的OSS路径
 */
export function getUserImagePath(imageType: string, imageName: string): string {
  const baseUrl = OSS_CONFIG.baseUrl

  switch (imageType) {
    case 'avatar':
      return baseUrl + USER_IMAGE_PATHS.avatars.default + imageName
    case 'user':
      return baseUrl + USER_IMAGE_PATHS.avatars.user + imageName
    case 'thumbnail':
      return baseUrl + USER_IMAGE_PATHS.avatars.thumbnails + imageName
    case 'photo':
      return baseUrl + USER_IMAGE_PATHS.photos + imageName
    default:
      return baseUrl + '/kindergarten/development/icons/' + imageName
  }
}

/**
 * 生成完整的OSS URL
 * @param path 相对路径
 * @returns 完整的URL
 */
export function getOSSUrl(path: string): string {
  return OSS_CONFIG.baseUrl + path
}

/**
 * 检查是否使用OSS
 * @returns 是否使用OSS
 */
export function shouldUseOSS(): boolean {
  return OSS_CONFIG.useOSS
}

// 导出默认配置
export default {
  OSS_CONFIG,
  GAME_IMAGE_PATHS,
  ACTIVITY_IMAGE_PATHS,
  USER_IMAGE_PATHS,
  getGameImagePath,
  getActivityImagePath,
  getUserImagePath,
  getOSSUrl,
  shouldUseOSS
}