/**
 * 视频服务
 * 通过统一租户系统调用AI生成视频
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface VideoGenerationParams {
  prompt: string;
  duration?: number;
  size?: string;
  style?: string;
}

export interface VideoResult {
  success: boolean;
  videoUrl?: string;
  videoId?: string;
  duration?: number;
  thumbnailUrl?: string;
  error?: string;
}

class VideoService {
  /**
   * 生成视频
   */
  async generateVideo(params: VideoGenerationParams): Promise<VideoResult> {
    console.log('🎬 [视频服务] 生成视频');

    try {
      const result = await unifiedAIBridge.processVideo({
        prompt: params.prompt,
        duration: params.duration || 10,
        size: params.size || '1280x720',
        style: params.style || 'realistic',
      });

      // 属性可能在顶层或 data 中
      const videoUrl = result.videoUrl || result.data?.videoUrl;
      if (result.success && videoUrl) {
        return {
          success: true,
          videoUrl: videoUrl,
          videoId: result.videoId || result.data?.videoId,
          duration: result.duration || result.data?.duration,
          thumbnailUrl: result.thumbnailUrl || result.data?.thumbnailUrl,
        };
      }

      return { success: false, error: result.error || '视频生成失败' };
    } catch (error: any) {
      console.error('❌ [视频服务] 生成失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量生成视频片段
   */
  async generateSceneVideos(scenes: Array<{
    id: number;
    visualDescription: string;
    duration: number;
  }>): Promise<Array<VideoResult & { sceneId: number }>> {
    console.log('🎬 [视频服务] 批量生成场景视频，数量:', scenes.length);

    const results = await Promise.all(
      scenes.map(async scene => {
        const result = await this.generateVideo({
          prompt: scene.visualDescription,
          duration: scene.duration,
        });
        return { ...result, sceneId: scene.id };
      })
    );

    return results;
  }

  /**
   * 合并视频
   */
  async mergeVideos(videoUrls: string[], options?: {
    outputFilename?: string;
    transition?: string;
  }): Promise<VideoResult> {
    console.log('🔗 [视频服务] 合并视频，数量:', videoUrls.length);

    // 视频合并功能暂未实现
    return { success: false, error: '视频合并功能暂未在统一租户系统中实现' };
  }

  /**
   * 视频转码
   */
  async transcodeVideo(videoUrl: string, options?: {
    format?: string;
    quality?: string;
  }): Promise<VideoResult> {
    console.log('🔄 [视频服务] 视频转码');

    // 视频转码功能暂未实现
    return { success: false, error: '视频转码功能暂未在统一租户系统中实现' };
  }

  /**
   * 根据文本生成视频
   */
  async generateVideoFromText(userId: number, params: {
    prompt: string;
    style?: string;
    duration?: number;
    size?: string;
    fps?: number;
    quality?: string;
  }): Promise<VideoResult & { data?: Array<{ url?: string; taskId?: string }> }> {
    console.log('🎬 [视频服务] 根据文本生成视频');

    const result = await this.generateVideo({
      prompt: params.prompt,
      duration: params.duration || 10,
      style: params.style,
      size: params.size,
    });

    // 返回兼容格式
    return {
      ...result,
      data: result.success ? [{
        url: result.videoUrl,
        taskId: result.videoId,
      }] : [],
    };
  }
}

export const videoService = new VideoService();
export default videoService;

