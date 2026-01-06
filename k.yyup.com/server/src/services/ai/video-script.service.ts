/**
 * 视频脚本服务
 * 通过统一租户系统调用AI生成视频脚本
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { VideoScript } from '../../models/video-project.model';

export interface ScriptGenerationParams {
  topic: string;
  platform?: string;
  duration?: number;
  style?: string;
  keyPoints?: string[];
  targetAudience?: string;
}

class VideoScriptService {
  /**
   * 生成视频脚本
   */
  async generateScript(params: ScriptGenerationParams, userId?: number): Promise<VideoScript> {
    console.log('📝 [视频脚本服务] 生成脚本:', params.topic);

    const prompt = `
你是一个专业的视频脚本创作专家。请根据以下要求创作视频脚本：

主题: ${params.topic}
平台: ${params.platform || '通用'}
目标时长: ${params.duration || 60}秒
风格: ${params.style || '专业'}
目标受众: ${params.targetAudience || '通用'}
${params.keyPoints?.length ? `关键点: ${params.keyPoints.join(', ')}` : ''}

请返回JSON格式的脚本，包含scenes数组，每个scene包含:
- id: 场景编号
- text: 旁白文本
- duration: 场景时长(秒)
- visualDescription: 画面描述
- voiceStyle: 语音风格

只返回JSON，不要其他内容。
`;

    try {
      const response = await unifiedAIBridge.chat({
        model: 'default',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.data?.content || response.data?.message || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const script = JSON.parse(jsonMatch[0]);
        return this.formatScript(script, params);
      }

      // 返回默认脚本
      return this.formatScript({
        scenes: [{
          sceneNumber: 1,
          narration: `关于${params.topic}的视频脚本`,
          duration: params.duration || 60,
          visualPrompt: '默认场景',
        }],
      }, params);
    } catch (error: any) {
      console.error('❌ [视频脚本服务] 生成失败:', error.message);
      throw error;
    }
  }

  /**
   * 优化脚本
   */
  async optimizeScript(script: VideoScript, feedback?: string): Promise<VideoScript> {
    console.log('✨ [视频脚本服务] 优化脚本');
    
    const prompt = `
请优化以下视频脚本:
${JSON.stringify(script, null, 2)}

${feedback ? `用户反馈: ${feedback}` : ''}

请返回优化后的JSON格式脚本。
`;

    try {
      const response = await unifiedAIBridge.chat({
        model: 'default',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const content = response.data?.content || response.data?.message || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return script;
    } catch (error: any) {
      console.error('❌ [视频脚本服务] 优化失败:', error.message);
      return script;
    }
  }

  /**
   * 格式化脚本以匹配模型要求
   */
  private formatScript(data: any, params: ScriptGenerationParams): VideoScript {
    return {
      title: data.title || params.topic,
      description: data.description || `关于${params.topic}的视频`,
      totalDuration: data.totalDuration || params.duration || 60,
      scenes: (data.scenes || []).map((scene: any, index: number) => ({
        sceneNumber: scene.sceneNumber || scene.id || index + 1,
        narration: scene.narration || scene.text || '',
        visualPrompt: scene.visualPrompt || scene.visualDescription || '',
        duration: scene.duration || 10,
        emotion: scene.emotion || 'neutral',
        cameraMovement: scene.cameraMovement,
        transition: scene.transition,
      })),
      bgmSuggestion: data.bgmSuggestion || '轻松愉快的背景音乐',
      colorTone: data.colorTone || '明亮温暖',
      hashtags: data.hashtags || [],
      targetEmotion: data.targetEmotion,
      coreMessage: data.coreMessage,
      visualStyle: data.visualStyle || params.style,
      callToAction: data.callToAction,
    };
  }
}

export const videoScriptService = new VideoScriptService();
export default videoScriptService;

