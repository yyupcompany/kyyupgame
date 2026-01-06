/**
 * 重构的多模态服务
 * 通过统一租户系统调用AI多模态功能
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface ImageGenerationParams {
  model?: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  responseFormat?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  data?: {
    url?: string;
    urls?: string[];
    revised_prompt?: string;
    length?: number;
  };
  error?: string;
  modelUsed?: string;
  selectionReason?: string;
}

export class RefactoredMultimodalService {
  /**
   * 生成图片
   */
  async generateImage(userId: number, params: ImageGenerationParams): Promise<ImageGenerationResult> {
    console.log('🎨 [多模态服务] 生成图片请求');

    try {
	      const result = await aiBridgeService.generateImage({
	        prompt: params.prompt,
	        size: params.size || '1024x1024',
	        style: params.style,
	        quality: params.quality,
	        model: params.model,
	        n: params.n || 1,
	      });

	      if (result.success) {
	        // 处理 data 可能是数组或单个对象的情况
	        const imageData = Array.isArray(result.data) ? result.data[0] : result.data;
	        const urls = result.urls || (result.url ? [result.url] : (imageData?.url ? [imageData.url] : []));
	        const modelUsed = params.model || 'default';
	        const selectionReason = params.model ? '使用调用方指定模型' : '使用系统默认模型';

	        return {
	          success: true,
	          data: {
	            url: result.url || urls[0],
	            urls,
	            revised_prompt: result.revised_prompt || imageData?.revised_prompt,
	            length: urls.length,
	          },
	          modelUsed,
	          selectionReason,
	        };
	      }

      return { success: false, error: result.error || '图片生成失败' };
    } catch (error: any) {
      console.error('❌ [多模态服务] 生成图片失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 分析图片
   */
  async analyzeImage(userId: number, params: {
    imageUrl: string;
    prompt?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('🔍 [多模态服务] 分析图片请求');

    try {
      const prompt = `请分析以下图片: ${params.imageUrl}\n${params.prompt || '请描述这张图片的内容'}`;
      const result = await aiBridgeService.analyze(prompt, {
        type: 'image',
        context: params.imageUrl,
      });

      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ [多模态服务] 分析图片失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 语音转文字
   */
	  async speechToText(userId: number, params: {
	    audioUrl?: string;
	    audioBuffer?: Buffer;
	  }): Promise<{
	    success: boolean;
	    data?: { text: string; language?: string; duration?: number };
	    error?: string;
	  }> {
    console.log('🎤 [多模态服务] 语音转文字请求');

    try {
	      const audioSource = params.audioBuffer || params.audioUrl;
	      if (!audioSource) {
	        return {
	          success: false,
	          error: '缺少音频数据，无法进行语音识别',
	        };
	      }

	      const result = await aiBridgeService.speechToText({
	        file: audioSource,
	        audio: audioSource,  // 兼容旧接口
	      });

	      return {
	        success: true,
	        data: {
	          text: result.text,
	          language: result.language,
	          duration: result.duration,
	        },
	      };
    } catch (error: any) {
      console.error('❌ [多模态服务] 语音转文字失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 文字转语音
   */
	  async textToSpeech(userId: number, params: {
	    text: string;
	    voice?: string;
	    speed?: number;
	  }): Promise<{
	    success: boolean;
	    data?: { audioBuffer: Buffer; contentType: string };
	    error?: string;
	  }> {
    console.log('🔊 [多模态服务] 文字转语音请求');

    try {
	      if (!params.text || !params.text.trim()) {
	        return {
	          success: false,
	          error: '文本内容不能为空',
	        };
	      }

	      const result = await aiBridgeService.textToSpeech({
	        input: params.text,
	        text: params.text,  // 兼容旧接口
	        voice: params.voice,
	        model: undefined,
	        speed: params.speed,
	      });

	      if (!result.success) {
	        return { success: false, error: result.error || '文字转语音失败' };
	      }

	      const audioBuffer = result.audioBuffer;
	      const contentType = result.contentType || 'audio/mpeg';

	      if (!audioBuffer) {
	        return {
	          success: false,
	          error: '语音合成成功但未返回音频数据',
	        };
	      }

	      return {
	        success: true,
	        data: {
	          audioBuffer,
	          contentType,
	        },
	      };
    } catch (error: any) {
      console.error('❌ [多模态服务] 文字转语音失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 文本生成视频
   */
  async generateVideo(userId: number, params: {
    model?: string;
    prompt: string;
    duration?: number;
    size?: string;
    fps?: number;
    quality?: string;
    style?: string;
  }): Promise<{ videoUrl: string; videoId?: string; duration?: number }> {
    console.log('🎬 [多模态服务] 文本生成视频请求');

    try {
      const result = await aiBridgeService.generateVideo({
        model: params.model,
        prompt: params.prompt,
        duration: params.duration,
        size: params.size,
        style: params.style,
      });

      if (!result.success) {
        throw new Error(result.error || '视频生成失败');
      }

      // 属性可能在顶层或 data 中
      return {
        videoUrl: result.videoUrl || result.data?.videoUrl || '',
        videoId: result.videoId || result.data?.videoId,
        duration: result.duration || result.data?.duration || params.duration || 5
      };
    } catch (error: any) {
      console.error('❌ [多模态服务] 文本生成视频失败:', error.message);
      throw error;
    }
  }
}

export const refactoredMultimodalService = new RefactoredMultimodalService();
export default refactoredMultimodalService;

