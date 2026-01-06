/**
 * OpenAI兼容控制器
 * 提供与OpenAI API兼容的接口，便于集成第三方应用
 */

import { Request, Response, NextFunction } from 'express';
import textModelService from '../../services/ai/text-model.service';
import multimodalService from '../../services/ai/multimodal.service';
import AIModelConfig, { ModelType } from '../../models/ai-model-config.model';
import { ApiError } from '../../utils/apiError';
import multer from 'multer';
import * as path from 'path';

// 配置文件上传
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB限制
});

/**
 * OpenAI兼容控制器类
 */
export class OpenAICompatibleController {
  /**
   * 列出可用模型
   */
  public listModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const models = await AIModelConfig.findAll({
        where: { status: 'active' }
      });
      
      // 转换为OpenAI格式
      const openaiModels = models.map(model => ({
        id: model.name,
        object: 'model',
        created: Math.floor(model.createdAt.getTime() / 1000),
        owned_by: model.provider,
        permission: [],
        root: model.name,
        parent: null
      }));
      
      res.json({
        object: 'list',
        data: openaiModels
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 获取模型详情
   */
  public getModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { modelId } = req.params;
      
      const model = await AIModelConfig.findOne({
        where: { name: modelId, status: 'active' }
      });
      
      if (!model) {
        return next(ApiError.notFound(`模型 ${modelId} 不存在`));
      }
      
      res.json({
        id: model.name,
        object: 'model',
        created: Math.floor(model.createdAt.getTime() / 1000),
        owned_by: model.provider,
        permission: [],
        root: model.name,
        parent: null
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 聊天完成（兼容OpenAI Chat API）
   */
  public chatCompletions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 1; // 获取用户ID，默认为1
      
      const {
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
        stop,
        stream,
        functions,
        function_call
      } = req.body;
      
      if (!model) {
        return next(ApiError.badRequest('缺少必要参数: model'));
      }
      
      if (!messages || !Array.isArray(messages)) {
        return next(ApiError.badRequest('缺少必要参数: messages 或格式不正确'));
      }
      
      // 如果是流式请求
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const streamResult = await textModelService.streamGenerateText({
          model,
          messages,
          temperature,
          maxTokens: max_tokens,
          topP: top_p,
          frequencyPenalty: frequency_penalty,
          presencePenalty: presence_penalty,
          stop,
          functions,
          functionCall: function_call,
          stream: true
        });
        
        if (streamResult && typeof streamResult.pipe === 'function') {
          streamResult.pipe(res);
        }
        return;
      }

      // 非流式请求
      const result = await textModelService.generateText({
        model,
        messages,
        temperature,
        maxTokens: max_tokens,
        topP: top_p,
        frequencyPenalty: frequency_penalty,
        presencePenalty: presence_penalty,
        stop,
        functions,
        functionCall: function_call,
        stream: false
      });
      
      // 转换为OpenAI格式
      const response = {
        id: result.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: result.model,
        choices: result.choices.map(choice => ({
          index: choice.index,
          message: choice.message,
          finish_reason: choice.finishReason
        })),
        usage: {
          prompt_tokens: result.usage.promptTokens,
          completion_tokens: result.usage.completionTokens,
          total_tokens: result.usage.totalTokens
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 图像生成（兼容OpenAI Image API）
   */
  public generateImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 1; // 获取用户ID，默认为1
      
      const {
        model,
        prompt,
        n,
        size,
        quality,
        style,
        response_format
      } = req.body;
      
      if (!prompt) {
        return next(ApiError.badRequest('缺少必要参数: prompt'));
      }
      
      // 获取默认图像模型（如果未指定）
      let modelName = model;
      if (!modelName) {
        const defaultModel = await AIModelConfig.findOne({
          where: { modelType: ModelType.IMAGE, isDefault: true, status: 'active' }
        });
        
        if (defaultModel) {
          modelName = defaultModel.name;
        } else {
          return next(ApiError.badRequest('未指定模型且找不到默认图像模型'));
        }
      }
      
      const result = await multimodalService.generateImage({
        model: modelName,
        prompt,
        n,
        size,
        quality,
        style,
        responseFormat: response_format
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 语音转文本（兼容OpenAI Audio API）
   */
  public speechToText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 使用multer处理文件上传
    upload.single('file')(req as any, res, async (err) => {
      if (err) {
        return next(ApiError.badRequest(`文件上传失败: ${err.message}`));
      }
      
      try {
        const userId = req.user?.id || 1; // 获取用户ID，默认为1
        
        const file = req.file;
        if (!file) {
          return next(ApiError.badRequest('缺少必要参数: file'));
        }
        
        const {
          model,
          language,
          prompt,
          response_format,
          temperature
        } = req.body;
        
        // 获取默认语音模型（如果未指定）
        let modelName = model;
        if (!modelName) {
          const defaultModel = await AIModelConfig.findOne({
            where: { modelType: ModelType.SPEECH, isDefault: true, status: 'active' }
          });
          
          if (defaultModel) {
            modelName = defaultModel.name;
          } else {
            return next(ApiError.badRequest('未指定模型且找不到默认语音模型'));
          }
        }
        
        const result = await multimodalService.speechToText({
          model: modelName,
          audioBuffer: file.buffer,
          language
        });
        
        res.json(result);
      } catch (error) {
        next(error);
      }
    });
  };
  
  /**
   * 文本转语音（兼容OpenAI Audio API）
   */
  public textToSpeech = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 1; // 获取用户ID，默认为1
      
      const {
        model,
        input,
        voice,
        response_format,
        speed
      } = req.body;
      
      if (!input) {
        return next(ApiError.badRequest('缺少必要参数: input'));
      }
      
      if (!voice) {
        return next(ApiError.badRequest('缺少必要参数: voice'));
      }
      
      // 获取默认语音模型（如果未指定）
      let modelName = model;
      if (!modelName) {
        const defaultModel = await AIModelConfig.findOne({
          where: { modelType: ModelType.SPEECH, isDefault: true, status: 'active' }
        });
        
        if (defaultModel) {
          modelName = defaultModel.name;
        } else {
          return next(ApiError.badRequest('未指定模型且找不到默认语音模型'));
        }
      }
      
      const result = await multimodalService.textToSpeech(input, voice);

      // 设置正确的内容类型
      res.setHeader('Content-Type', 'audio/mpeg');
      // 发送音频数据
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 获取支持的语音列表
   */
  public getSupportedVoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const voices = await multimodalService.getSupportedVoices();

      res.json({
        object: 'list',
        data: voices.map((voice: string) => ({
          id: voice,
          name: voice,
          quality: 'high'
        }))
      });
    } catch (error) {
      next(error);
    }
  };
} 