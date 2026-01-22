/**
 * 课程音频生成服务
 * 负责在课程生成过程中自动生成TTS语音和配置音效
 */

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { volcengineTTSService } from '../volcengine/tts.service';
import AIModelConfig from '../../models/ai-model-config.model';
import { saveToOSS } from '../storage/oss-upload.service';
import crypto from 'crypto';

// ==================== 类型定义 ====================

/**
 * 课程音频配置
 */
export interface CurriculumAudioConfig {
  voice: 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx';
  speed: number;
  autoPlayWelcome: boolean;
  enableClickEffects: boolean;
  enableTransitionEffects: boolean;
}

/**
 * 生成的音频资源
 */
export interface GeneratedAudioAssets {
  welcomeAudio: {
    url: string;
    text: string;
    duration?: number;
  };
  introAudio: {
    url: string;
    text: string;
    duration?: number;
  };
  activityAudios: Map<string, {
    url: string;
    text: string;
    duration?: number;
  }>;
  totalDuration: number;
}

/**
 * 活动音频请求
 */
export interface ActivityAudioRequest {
  activityId: string;
  title: string;
  instruction?: string;
  question?: string;
}

/**
 * 课程音频元数据（用于A2UI组件）
 */
export interface ComponentAudioMetadata {
  ttsUrl?: string;
  clickEffect?: 'click' | 'success' | 'error' | 'complete' | 'star';
  hoverEffect?: boolean;
  autoPlay?: boolean;
  playDelay?: number;
}

// ==================== 课程音频生成服务 ====================

class CurriculumAudioService {
  private readonly DEFAULT_VOICE = 'nova'; // 活泼女声，适合儿童
  private readonly DEFAULT_SPEED = 0.9;    // 稍慢，适合儿童理解
  private readonly MAX_TEXT_LENGTH = 500;  // 单次TTS最大文本长度

  /**
   * 为课程生成所有音频内容
   * @param title 课程标题
   * @param description 课程描述
   * @param activities 活动列表
   * @param config 音频配置
   * @param taskId 任务ID（用于缓存）
   */
  async generateCourseAudio(
    title: string,
    description: string,
    activities: ActivityAudioRequest[],
    config?: Partial<CurriculumAudioConfig>,
    taskId?: string
  ): Promise<GeneratedAudioAssets> {
    console.log('🎵 [课程音频] 开始生成课程音频...');

    const finalConfig: CurriculumAudioConfig = {
      voice: config?.voice || this.DEFAULT_VOICE,
      speed: config?.speed || this.DEFAULT_SPEED,
      autoPlayWelcome: config?.autoPlayWelcome ?? true,
      enableClickEffects: config?.enableClickEffects ?? true,
      enableTransitionEffects: config?.enableTransitionEffects ?? true
    };

    // 1. 生成欢迎语音
    const welcomeText = this.generateWelcomeText(title);
    console.log(`🎙️ [课程音频] 生成欢迎语音: "${welcomeText}"`);
    const welcomeAudio = await this.generateAndCacheAudio(
      `welcome_${taskId || Date.now()}`,
      welcomeText,
      finalConfig.voice,
      finalConfig.speed
    );

    // 2. 生成课程介绍语音
    const introText = this.generateIntroText(title, description);
    console.log(`🎙️ [课程音频] 生成介绍语音: "${introText}"`);
    const introAudio = await this.generateAndCacheAudio(
      `intro_${taskId || Date.now()}`,
      introText,
      finalConfig.voice,
      finalConfig.speed
    );

    // 3. 并行生成所有活动语音
    const activityAudios = new Map<string, { url: string; text: string; duration?: number }>();
    const audioPromises = activities.map(async (activity) => {
      const activityText = this.generateActivityText(activity);
      console.log(`🎙️ [课程音频] 生成活动语音 [${activity.activityId}]: "${activityText}"`);

      const audio = await this.generateAndCacheAudio(
        `activity_${activity.activityId}_${taskId || Date.now()}`,
        activityText,
        finalConfig.voice,
        finalConfig.speed
      );

      return { id: activity.activityId, audio };
    });

    const activityResults = await Promise.all(audioPromises);
    activityResults.forEach(({ id, audio }) => {
      activityAudios.set(id, audio);
    });

    const totalDuration = welcomeAudio.duration + introAudio.duration +
      Array.from(activityAudios.values()).reduce((sum, a) => sum + (a.duration || 0), 0);

    console.log(`✅ [课程音频] 音频生成完成，总时长: ${totalDuration}秒`);

    return {
      welcomeAudio,
      introAudio,
      activityAudios,
      totalDuration
    };
  }

  /**
   * 生成欢迎语文本
   */
  private generateWelcomeText(title: string): string {
    return `你好，小朋友，欢迎来到${title || '课程'}！准备好开始学习了吗？`;
  }

  /**
   * 生成课程介绍文本
   */
  private generateIntroText(title: string, description: string): string {
    // 🔧 安全检查：确保 description 不是 undefined
    const safeDescription = description || '';
    // 描述过长时截取
    const shortDesc = safeDescription.length > 100 ? safeDescription.substring(0, 100) + '...' : safeDescription;
    return `今天我们学习的课程是《${title || '未命名课程'}》。${shortDesc}。让我们一起来探索吧！`;
  }

  /**
   * 生成活动语音文本
   */
  private generateActivityText(activity: ActivityAudioRequest): string {
    const parts: string[] = [];

    // 活动标题
    if (activity.title) {
      parts.push(activity.title);
    }

    // 活动说明 - 🔧 安全检查
    if (activity.instruction) {
      const safeInstruction = activity.instruction || '';
      // 过长说明截取
      const instruction = safeInstruction.length > 150
        ? safeInstruction.substring(0, 150) + '...'
        : safeInstruction;
      parts.push(instruction);
    }

    // 活动问题
    if (activity.question) {
      parts.push(activity.question);
    }

    // 组合并控制长度
    let fullText = parts.join('。');
    if (fullText.length > this.MAX_TEXT_LENGTH) {
      fullText = fullText.substring(0, this.MAX_TEXT_LENGTH) + '...';
    }

    return fullText || '这是一个互动活动';
  }

  /**
   * 生成并缓存音频到OSS
   */
  private async generateAndCacheAudio(
    cacheKey: string,
    text: string,
    voice: string,
    speed: number
  ): Promise<{ url: string; text: string; duration?: number }> {
    try {
      // 生成文件hash作为唯一标识
      const hash = crypto.createHash('md5').update(`${text}_${voice}_${speed}`).digest('hex');
      const filename = `curriculum/audio/${hash.substring(0, 2)}/${hash}.mp3`;

      // 调用TTS服务生成音频
      const response = await unifiedAIBridge.processAudio({
        model: 'tts-1',
        file: text,
        action: 'synthesize',
        voice: voice,
        speed: speed
      });

      if (!response.success || !response.data?.audioData) {
        throw new Error(response.error || 'TTS生成失败');
      }

      const audioBuffer = Buffer.isBuffer(response.data.audioData)
        ? response.data.audioData
        : Buffer.from(response.data.audioData);

      // 上传到OSS
      const ossUrl = await saveToOSS(audioBuffer, `audio/${filename}`, 'audio/mpeg');

      // 估算音频时长（MP3约1KB≈0.01秒，根据语速调整）
      const estimatedDuration = Math.round((audioBuffer.length / 1024) * 0.012 / speed);

      console.log(`✅ [课程音频] 音频已生成并上传: ${filename} (${estimatedDuration}秒)`);

      return {
        url: ossUrl,
        text: text,
        duration: estimatedDuration
      };

    } catch (error) {
      console.error(`❌ [课程音频] 生成音频失败:`, error);
      // 返回空音频URL，前端会静默处理
      return {
        url: '',
        text: text,
        duration: 0
      };
    }
  }

  /**
   * 为A2UI组件生成音频元数据
   */
  generateComponentAudioMetadata(
    componentType: string,
    audioUrl?: string,
    options?: Partial<ComponentAudioMetadata>
  ): ComponentAudioMetadata | undefined {
    if (!audioUrl) return undefined;

    const metadata: ComponentAudioMetadata = {
      ttsUrl: audioUrl,
      ...options
    };

    // 根据组件类型设置默认音效
    switch (componentType) {
      case 'button':
        metadata.clickEffect = options?.clickEffect || 'click';
        break;
      case 'choice-option':
      case 'puzzle-piece':
        metadata.clickEffect = options?.clickEffect || 'click';
        break;
      case 'activity-card':
        metadata.clickEffect = options?.clickEffect || 'star';
        metadata.hoverEffect = true;
        break;
    }

    return metadata;
  }

  /**
   * 批量生成组件音频元数据
   */
  generateBatchAudioMetadata(
    components: Array<{ type: string; id: string; audioUrl?: string }>,
    defaultEffect?: ComponentAudioMetadata['clickEffect']
  ): Map<string, ComponentAudioMetadata> {
    const metadataMap = new Map<string, ComponentAudioMetadata>();

    components.forEach(comp => {
      const metadata = this.generateComponentAudioMetadata(comp.type, comp.audioUrl, {
        clickEffect: defaultEffect
      });
      if (metadata) {
        metadataMap.set(comp.id, metadata);
      }
    });

    return metadataMap;
  }

  /**
   * 生成音效配置对象（用于前端）
   */
  generateEffectsConfig(enableClickEffects: boolean, enableTransitionEffects: boolean): {
    click: boolean;
    transition: boolean;
    success: boolean;
    error: boolean;
    complete: boolean;
  } {
    return {
      click: enableClickEffects,
      transition: enableTransitionEffects,
      success: enableClickEffects,
      error: enableClickEffects,
      complete: enableClickEffects
    };
  }
}

// 导出单例
export const curriculumAudioService = new CurriculumAudioService();
