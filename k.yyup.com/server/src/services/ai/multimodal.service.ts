/**
 * 多模态服务
 * 支持图像、音频等多模态AI处理
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';

export interface ImageAnalysisRequest {
  imageUrl?: string;
  imageBase64?: string;
  prompt?: string;
}

export interface ImageAnalysisResponse {
  description: string;
  labels?: string[];
  objects?: any[];
}

export interface AudioTranscribeRequest {
  audioUrl?: string;
  audioBuffer?: Buffer;
  language?: string;
}

export interface AudioTranscribeResponse {
  text: string;
  language?: string;
  duration?: number;
}

class MultimodalService {
  /**
   * 分析图像
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    console.log('🖼️ [多模态服务] 分析图像');

    try {
      const response = await unifiedAIBridge.chat({
        model: 'doubao-vision',
        messages: [
          {
            role: 'user',
            content: request.prompt || '请描述这张图片的内容'
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.data?.content || response.data?.message || '';

      return {
        description: content,
        labels: [],
        objects: []
      };
    } catch (error: any) {
      console.error('❌ [多模态服务] 图像分析失败:', error.message);
      throw error;
    }
  }

  /**
   * 音频转文字
   */
  async transcribeAudio(request: AudioTranscribeRequest): Promise<AudioTranscribeResponse> {
    console.log('🎤 [多模态服务] 音频转文字');

    try {
      const result = await unifiedAIBridge.processAudio({
        action: 'transcribe',
        file: request.audioBuffer,
        model: 'whisper-1'
      });

      return {
        text: result.data?.text || result.text || '',
        language: result.data?.language || result.language,
        duration: result.data?.duration || result.duration
      };
    } catch (error: any) {
      console.error('❌ [多模态服务] 音频转文字失败:', error.message);
      throw error;
    }
  }

  /**
   * 文字转语音
   */
  async textToSpeech(text: string, voice?: string): Promise<Buffer> {
    console.log('🔊 [多模态服务] 文字转语音');

    try {
      const result = await unifiedAIBridge.processAudio({
        action: 'synthesize',
        file: text,
        model: voice || 'alloy'
      });

      if (result.success && result.audioBuffer) {
        return result.audioBuffer;
      }

      throw new Error(result.error || '语音合成失败');
    } catch (error: any) {
      console.error('❌ [多模态服务] 文字转语音失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成图像
   */
  async generateImage(options: any): Promise<any> {
    console.log('🎨 [多模态服务] 生成图像');
    return {
      created: Date.now(),
      data: [{ url: '', b64_json: '' }]
    };
  }

  /**
   * 语音转文字（OpenAI兼容）
   */
  async speechToText(options: any): Promise<any> {
    return this.transcribeAudio(options);
  }

  /**
   * 获取支持的语音列表
   */
  async getSupportedVoices(): Promise<string[]> {
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  }
}

export const multimodalService = new MultimodalService();
export default multimodalService;

