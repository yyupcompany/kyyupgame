import { Request, Response } from 'express';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';
import { AiBridgeTextToSpeechParams } from '../services/ai/bridge/ai-bridge.types';
import AIModelConfig from '../models/ai-model-config.model';

/**
 * 文字转语音控制器
 */
export class TextToSpeechController {
  private aiBridgeService = aiBridgeService;

  constructor() {
    // Use the singleton instance
  }

  /**
   * 生成语音
   */
  public generateSpeech = async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, voice = 'nova', speed = 1.0, format = 'mp3' } = req.body;

      // 验证参数
      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
        return;
      }

      if (text.length > 4096) {
        res.status(400).json({
          success: false,
          message: '文本内容不能超过4096个字符'
        });
        return;
      }

      console.log('🔊 [文字转语音] 开始生成语音:', {
        textLength: text.length,
        voice,
        speed,
        format
      });

      // 查询TTS模型配置
      const ttsModel = await AIModelConfig.findOne({
        where: {
          modelType: 'speech',
          status: 'active'
        }
      });

      // 构建请求参数
      const params: AiBridgeTextToSpeechParams = {
        model: ttsModel?.name || 'tts-1',
        input: text,
        voice: voice,
        response_format: format as 'mp3' | 'opus' | 'aac' | 'flac',
        speed: speed
      };

      // 调用AI Bridge服务
      let audioResult;
      if (ttsModel && ttsModel.endpointUrl && ttsModel.apiKey) {
        console.log('🔊 [文字转语音] 使用自定义TTS模型配置');
        audioResult = await this.aiBridgeService.textToSpeech(params, {
          endpointUrl: ttsModel.endpointUrl,
          apiKey: ttsModel.apiKey
        });
      } else {
        console.log('🔊 [文字转语音] 使用默认TTS配置');
        audioResult = await this.aiBridgeService.textToSpeech(params);
      }

      console.log('🔊 [文字转语音] 语音生成成功');

      // 设置响应头 - 支持音频播放和Range请求
      res.setHeader('Content-Type', audioResult.contentType);
      res.setHeader('Content-Length', audioResult.audioData.length.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // 不设置 Content-Disposition，让浏览器可以直接播放
      // 如果需要下载，前端会通过 download 属性处理

      // 返回音频数据
      res.send(audioResult.audioData);
    } catch (error) {
      console.error('🔊 [文字转语音] 生成失败:', error);
      res.status(500).json({
        success: false,
        message: '语音生成失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  /**
   * 获取可用的音色列表
   */
  public getVoices = async (_req: Request, res: Response): Promise<void> => {
    try {
      const voices = [
        {
          id: 'alloy',
          name: '女声-温柔',
          description: '温柔亲切的女声',
          language: 'zh-CN'
        },
        {
          id: 'nova',
          name: '女声-活泼',
          description: '活泼开朗的女声',
          language: 'zh-CN'
        },
        {
          id: 'shimmer',
          name: '女声-专业',
          description: '专业稳重的女声',
          language: 'zh-CN'
        },
        {
          id: 'echo',
          name: '男声-沉稳',
          description: '沉稳大气的男声',
          language: 'zh-CN'
        },
        {
          id: 'fable',
          name: '男声-年轻',
          description: '年轻活力的男声',
          language: 'zh-CN'
        },
        {
          id: 'onyx',
          name: '男声-磁性',
          description: '磁性深沉的男声',
          language: 'zh-CN'
        }
      ];

      res.json({
        success: true,
        data: voices
      });
    } catch (error) {
      console.error('🔊 [文字转语音] 获取音色列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取音色列表失败'
      });
    }
  };

  /**
   * 获取TTS模型配置
   */
  public getConfig = async (_req: Request, res: Response): Promise<void> => {
    try {
      const ttsModel = await AIModelConfig.findOne({
        where: {
          modelType: 'speech',
          status: 'active'
        }
      });

      res.json({
        success: true,
        data: {
          hasConfig: !!ttsModel,
          modelName: ttsModel?.name || 'tts-1',
          maxLength: 4096,
          supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
          speedRange: {
            min: 0.25,
            max: 4.0,
            default: 1.0
          }
        }
      });
    } catch (error) {
      console.error('🔊 [文字转语音] 获取配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取配置失败'
      });
    }
  };
}

export default new TextToSpeechController();

