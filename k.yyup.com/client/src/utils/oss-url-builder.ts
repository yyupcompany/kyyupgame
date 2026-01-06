/**
 * OSS URL 构建工具
 * 用于生成阿里云 OSS 资源的完整 URL
 * 支持直接 URL 和签名 URL 两种方式
 */

import { request } from '@/utils/request'

const OSS_CONFIG = {
  bucket: 'systemkarder',
  region: 'oss-cn-guangzhou',
  baseUrl: 'https://systemkarder.oss-cn-guangzhou.aliyuncs.com',
  prefix: 'kindergarten'
};

// 签名 URL 缓存（避免频繁请求后端）
const signedUrlCache = new Map<string, { url: string; expireTime: number }>();

/**
 * 构建 OSS 代理 URL
 * 由于 OSS bucket 是私有的，所有 URL 都通过后端代理获取签名 URL
 * @param path 相对路径 (例如: games/audio/bgm/princess-memory-bgm.mp3)
 * @returns 后端代理 URL（后端会自动重定向到签名 URL）
 */
export function buildOSSUrl(path: string): string {
  // 移除开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // 返回后端代理 URL，后端会自动生成签名 URL 并重定向
  return `/api/oss-proxy/${cleanPath}`;
}

/**
 * 获取签名 URL（用于私有 bucket）
 * 通过后端代理获取签名 URL
 * @param path 相对路径
 * @param expiresIn 过期时间（秒），默认 3600
 * @returns 签名后的 OSS URL
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  const cacheKey = `${path}:${expiresIn}`;
  const cached = signedUrlCache.get(cacheKey);

  // 检查缓存是否有效
  if (cached && cached.expireTime > Date.now()) {
    return cached.url;
  }

  try {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // 调用后端代理 API 获取签名 URL
    const response = await request.get(`/api/oss-proxy/info/${cleanPath}`);

    if (response.success && response.data?.signedUrl) {
      // 缓存签名 URL
      signedUrlCache.set(cacheKey, {
        url: response.data.signedUrl,
        expireTime: Date.now() + (expiresIn - 60) * 1000 // 提前 60 秒过期
      });
      return response.data.signedUrl;
    }
  } catch (error) {
    console.warn('获取签名 URL 失败，使用代理 URL:', error);
  }

  // 降级到代理 URL（后端会自动重定向到签名 URL）
  return buildOSSUrl(path);
}

/**
 * 构建游戏音频 URL
 * @param type 音频类型: 'bgm' | 'sfx' | 'voice'
 * @param fileName 文件名
 * @param gameKey 游戏 key (用于语音)
 * @returns 完整的 OSS URL
 */
export function buildGameAudioUrl(
  type: 'bgm' | 'sfx' | 'voice',
  fileName: string,
  gameKey?: string
): string {
  let path = `games/audio/${type}`;
  
  if (type === 'voice' && gameKey) {
    path += `/${gameKey}`;
  }
  
  path += `/${fileName}`;
  return buildOSSUrl(path);
}

/**
 * 构建游戏图片 URL
 * @param category 图片分类: 'backgrounds' | 'characters' | 'items' | 'scenes' | 'ui' | 'robot-factory'
 * @param fileName 文件名
 * @param subCategory 子分类 (可选)
 * @returns 完整的 OSS URL
 */
export function buildGameImageUrl(
  category: string,
  fileName: string,
  subCategory?: string
): string {
  let path = `games/images/${category}`;
  
  if (subCategory) {
    path += `/${subCategory}`;
  }
  
  path += `/${fileName}`;
  return buildOSSUrl(path);
}

/**
 * 构建 BGM URL
 */
export function buildBGMUrl(fileName: string): string {
  return buildGameAudioUrl('bgm', fileName);
}

/**
 * 构建音效 URL
 */
export function buildSFXUrl(fileName: string): string {
  return buildGameAudioUrl('sfx', fileName);
}

/**
 * 构建语音 URL
 */
export function buildVoiceUrl(fileName: string, gameKey: string): string {
  return buildGameAudioUrl('voice', fileName, gameKey);
}

/**
 * 构建背景图 URL
 */
export function buildBackgroundUrl(fileName: string): string {
  return buildGameImageUrl('backgrounds', fileName);
}

/**
 * 构建角色图 URL
 */
export function buildCharacterUrl(fileName: string): string {
  return buildGameImageUrl('characters', fileName);
}

/**
 * 构建物品图 URL
 */
export function buildItemUrl(fileName: string, subCategory?: string): string {
  return buildGameImageUrl('items', fileName, subCategory);
}

/**
 * 构建场景图 URL
 */
export function buildSceneUrl(fileName: string): string {
  return buildGameImageUrl('scenes', fileName);
}

/**
 * 构建 UI 图 URL
 */
export function buildUIUrl(fileName: string): string {
  return buildGameImageUrl('ui', fileName);
}

/**
 * 构建机器人工厂图 URL
 */
export function buildRobotFactoryUrl(fileName: string, profession?: string): string {
  return buildGameImageUrl('robot-factory', fileName, profession);
}

export default {
  buildOSSUrl,
  buildGameAudioUrl,
  buildGameImageUrl,
  buildBGMUrl,
  buildSFXUrl,
  buildVoiceUrl,
  buildBackgroundUrl,
  buildCharacterUrl,
  buildItemUrl,
  buildSceneUrl,
  buildUIUrl,
  buildRobotFactoryUrl
};

