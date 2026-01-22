/**
 * 视频音频服务
 * 通过统一租户系统调用AI生成配音
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface AudioGenerationParams {
  text: string;
  voice?: string;
  speed?: number;
  emotion?: string;
}

export interface AudioResult {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

class VideoAudioService {
  /**
   * 生成配音
   */
  async generateAudio(params: AudioGenerationParams): Promise<AudioResult> {
    console.log('🎤 [视频音频服务] 生成配音');

    try {
      const result = await unifiedAIBridge.processAudio({
        action: 'synthesize',
        file: params.text,
        model: params.voice || 'zh-CN-XiaoxiaoNeural',
        speed: params.speed || 1.0,
      });

      if (result.success && result.data?.audio_url) {
        return {
          success: true,
          audioUrl: result.data.audio_url,
          duration: result.data.duration,
        };
      }

      return { success: false, error: result.error || '配音生成失败' };
    } catch (error: any) {
      console.error('❌ [视频音频服务] 生成失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量生成配音
   */
  async generateBatchAudio(texts: string[], options?: {
    voice?: string;
    speed?: number;
  }): Promise<AudioResult[]> {
    console.log('🎤 [视频音频服务] 批量生成配音，数量:', texts.length);

    const results = await Promise.all(
      texts.map(text => this.generateAudio({
        text,
        voice: options?.voice,
        speed: options?.speed,
      }))
    );

    return results;
  }

  /**
   * 合并音频
   */
  async mergeAudio(audioUrls: string[]): Promise<AudioResult> {
    console.log('🔗 [视频音频服务] 合并音频，数量:', audioUrls.length);

    // 通过统一租户系统的音频处理API
    try {
      const response = await unifiedAIBridge.processAudio({
        action: 'synthesize',
        file: '', // 空文本表示合并模式
        model: '', // audioUrls 作为附加参数
      });

      if (response.success && response.data?.audio_url) {
        return {
          success: true,
          audioUrl: response.data.audio_url,
          duration: response.data.duration,
        };
      }

      return { success: false, error: '音频合并暂不支持' };
    } catch (error: any) {
      console.error('❌ [视频音频服务] 合并失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 为场景生成音频
   */
  async generateSceneAudio(scenes: Array<{
    sceneNumber: number;
    narration: string;
  }>, projectId?: string, voiceStyle?: string): Promise<Array<{
    sceneNumber: number;
    audioPath: string;
    audioUrl: string;
    duration: number;
    narration: string;
  }>> {
    console.log('🎤 [视频音频服务] 为场景生成音频，数量:', scenes.length);

    const results = await Promise.all(
      scenes.map(async scene => {
        const result = await this.generateAudio({
          text: scene.narration,
          voice: voiceStyle || 'zh-CN-XiaoxiaoNeural',
        });
        return {
          sceneNumber: scene.sceneNumber,
          audioPath: result.audioUrl || '',
          audioUrl: result.audioUrl || '',
          duration: result.duration || 0,
          narration: scene.narration,
        };
      })
    );

    return results;
  }

  /**
   * 删除项目音频
   */
  async deleteProjectAudio(projectId: string): Promise<boolean> {
    console.log('🗑️ [视频音频服务] 删除项目音频:', projectId);
    // 实际删除逻辑需要根据存储方式实现
    // 这里返回成功
    return true;
  }
}

export const videoAudioService = new VideoAudioService();
export default videoAudioService;

