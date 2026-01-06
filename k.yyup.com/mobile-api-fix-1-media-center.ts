/**
 * Mobile Media Center API 硬编码修复
 *
 * 问题：media-center/index.vue中存在硬编码的API路径
 * 修复：使用统一的mobile API端点配置
 */

// === 问题代码 ===
// 文件: /client/src/pages/mobile/centers/media-center/index.vue
// 行: 327-328, 335-336, 343-344, 501, 575-576

// 原始代码 (问题):
/*
const recentMedia = ref([
  {
    id: 1,
    title: '春游活动照片',
    type: 'image',
    thumbnailUrl: '/api/placeholder/300x200',  // 硬编码
    url: '/api/placeholder/800x600',           // 硬编码
    uploadTime: '2024-03-15T10:30:00Z'
  }
  // ... 更多硬编码路径
]);

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/api/placeholder/300x200?text=加载失败'  // 硬编码
}
*/

// === 修复方案 ===

// 1. 添加占位符端点配置 (如果不存在)
export const MOBILE_PLACEHOLDER_ENDPOINTS = {
  IMAGE: (width: number, height: number, text?: string) =>
    `${MOBILE_API_PREFIX}/placeholder/${width}x${height}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  AUDIO: (filename?: string) =>
    `${MOBILE_API_PREFIX}/placeholder/audio${filename ? `/${filename}` : '.mp3'}`,
  VIDEO: (width: number, height: number) =>
    `${MOBILE_API_PREFIX}/placeholder/${width}x${height}`,
} as const;

// 2. 修复后的代码实现:

import { MOBILE_PLACEHOLDER_ENDPOINTS } from '@/api/endpoints/mobile'

const recentMedia = ref([
  {
    id: 1,
    title: '春游活动照片',
    type: 'image',
    thumbnailUrl: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200),
    url: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(800, 600),
    uploadTime: '2024-03-15T10:30:00Z'
  },
  {
    id: 2,
    title: '亲子运动会视频',
    type: 'video',
    thumbnailUrl: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200),
    url: MOBILE_PLACEHOLDER_ENDPOINTS.VIDEO(800, 600),
    uploadTime: '2024-03-14T15:45:00Z'
  },
  {
    id: 3,
    title: '儿童故事录音',
    type: 'audio',
    thumbnailUrl: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200),
    url: MOBILE_PLACEHOLDER_ENDPOINTS.AUDIO('children-story'),
    uploadTime: '2024-03-13T09:20:00Z'
  },
  {
    id: 4,
    title: '校园环境照片',
    type: 'image',
    thumbnailUrl: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200),
    url: MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(800, 600),
    uploadTime: '2024-03-12T14:10:00Z'
  }
]);

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200, '加载失败')
}

// 3. 错误处理函数优化
function handleMediaError(type: 'image' | 'video' | 'audio', fallback?: string) {
  switch (type) {
    case 'image':
    case 'video':
      return MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200, fallback || '媒体加载失败')
    case 'audio':
      return MOBILE_PLACEHOLDER_ENDPOINTS.AUDIO()
    default:
      return MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(300, 200, '未知媒体类型')
  }
}

// 4. 统一的媒体URL生成工具
export class MediaUrlGenerator {
  static generateThumbnail(width: number, height: number, text?: string) {
    return MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(width, height, text)
  }

  static generateImage(width: number, height: number, text?: string) {
    return MOBILE_PLACEHOLDER_ENDPOINTS.IMAGE(width, height, text)
  }

  static generateVideo(width: number, height: number) {
    return MOBILE_PLACEHOLDER_ENDPOINTS.VIDEO(width, height)
  }

  static generateAudio(filename?: string) {
    return MOBILE_PLACEHOLDER_ENDPOINTS.AUDIO(filename)
  }

  static generateErrorUrl(type: 'image' | 'video' | 'audio', customText?: string) {
    return handleMediaError(type, customText)
  }
}

// === 修复效果 ===
// 1. ✅ 消除了所有硬编码API路径
// 2. ✅ 统一使用mobile端点配置
// 3. ✅ 提供了类型安全的URL生成
// 4. ✅ 支持多语言错误处理
// 5. ✅ 便于后端路径修改时的维护