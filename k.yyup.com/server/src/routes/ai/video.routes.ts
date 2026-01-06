/**
 * AI视频生成路由
 * 提供文生视频和图生视频功能
*/

import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import multimodalService from '../../services/ai/refactored-multimodal.service';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary 文本生成视频
* @description 根据文本描述生成AI视频，支持多种风格、时长、分辨率等参数配置。
 * 系统会自动选择最适合的视频生成模型，支持教育内容、动画、写实等多种视频风格。
 * 生成的视频可用于教学课件、活动宣传、故事创作等场景。
*
* @tags AI视频处理
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.prompt.required 视频内容描述，详细说明想要生成的视频场景、人物、动作等
* @param {integer} requestBody.body.duration.optional 视频时长（秒），默认5秒，范围1-30秒
* @param {string} requestBody.body.size.optional 视频分辨率，默认"1280x720"，可选"720p"、"1080p"、"4K"
* @param {integer} requestBody.body.fps.optional 帧率，默认24fps，可选12/24/30/60fps
* @param {string} requestBody.body.quality.optional 视频质量，默认"standard"，可选"standard"、"high"、"premium"
* @param {string} requestBody.body.style.optional 视频风格，默认"realistic"，可选"realistic"、"cartoon"、"anime"、"3d"
* @param {string} requestBody.body.model.optional 指定模型名称，不指定则使用默认模型
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:视频生成成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "videoUrl": "https://example.com/video.mp4",
 *     "taskId": "task_123",
 *     "model": "doubao-video-1",
 *     "duration": 5,
 *     "size": "1280x720",
 *     "tokensUsed": 1500,
 *     "processingTime": 12.5,
 *     "createdAt": "2024-01-01T12:00:00.000Z"
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"success": false, "error": "缺少必要参数: prompt（视频描述）"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:视频生成失败
* @responses {500} {object} schema: {"success": false, "error": "生成失败原因"}
*
* @example {json} 请求示例
 * {
 *   "prompt": "一只可爱的小熊猫在竹林里玩耍，阳光明媚，动画风格",
 *   "duration": 8,
 *   "size": "1280x720",
 *   "fps": 24,
 *   "quality": "high",
 *   "style": "cartoon"
 * }
*/
router.post('/text-to-video', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: '未授权，请先登录' 
      });
    }

    const { prompt, duration, size, fps, quality, style, model } = req.body;

    // 验证必要参数
    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必要参数: prompt（视频描述）' 
      });
    }

    console.log('🎬 [文生视频] 收到请求:', {
      userId,
      prompt: prompt.substring(0, 100) + '...',
      duration,
      size,
      model
    });

    // 调用视频生成服务
    const result = await multimodalService.generateVideo(userId, {
      model,
      prompt,
      duration,
      size,
      fps,
      quality,
      style
    });

    console.log('🎬 [文生视频] 生成成功:', result.videoUrl);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('🎬 [文生视频] 生成失败:', error.message);
    next(error);
  }
});

/**
* @summary 图片生成视频
* @description 基于静态图片生成动态视频，为图片添加动态效果和运动。
 * 支持将静态教学图片、儿童画作、照片等转换为生动的视频内容，
 * 适用于制作动态教学素材、儿童故事视频、产品展示等场景。
*
 * 核心功能：
 * - 智能动态效果生成：自动识别图片内容并添加合适的动态效果
 * - 运动轨迹优化：生成自然的运动轨迹和过渡效果
 * - 背景动画：为静态图片添加背景动态效果
 * - 风格保持：保持原始图片的风格和色彩特征
*
* @tags AI视频处理
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 请求体
* @param {string} requestBody.body.imageUrl.required 源图片URL地址，支持JPG、PNG、WebP格式
* @param {string} requestBody.body.prompt.optional 动态效果描述，说明想要的运动方式和效果，默认自动生成
* @param {integer} requestBody.body.duration.optional 视频时长（秒），默认5秒，范围1-20秒
* @param {string} requestBody.body.size.optional 视频分辨率，默认与原图分辨率匹配
* @param {integer} requestBody.body.fps.optional 帧率，默认24fps，可选12/24/30fps
* @param {string} requestBody.body.quality.optional 视频质量，默认"standard"，可选"standard"、"high"
* @param {string} requestBody.body.style.optional 动态风格，默认"natural"，可选"natural"、"cinematic"、"smooth"
* @param {string} requestBody.body.model.optional 指定模型名称，不指定则使用默认模型
*
* @responses {200} {object} 成功响应
* @responses {200} {object} description:视频生成成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": {
 *     "videoUrl": "https://example.com/video.mp4",
 *     "taskId": "task_456",
 *     "model": "doubao-img2video-1",
 *     "sourceImage": "https://example.com/image.jpg",
 *     "duration": 5,
 *     "size": "1280x720",
 *     "motionType": "natural",
 *     "tokensUsed": 1200,
 *     "processingTime": 8.7,
 *     "createdAt": "2024-01-01T12:00:00.000Z"
 *   }
 * }
*
* @responses {400} {object} 参数错误
* @responses {400} {object} description:请求参数错误
* @responses {400} {object} schema: {"success": false, "error": "缺少必要参数: imageUrl（图片URL）"}
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:视频生成失败
* @responses {500} {object} schema: {"success": false, "error": "生成失败原因"}
*
* @example {json} 请求示例
 * {
 *   "imageUrl": "https://example.com/classroom-photo.jpg",
 *   "prompt": "让孩子们的微笑更加生动，添加自然的光线变化",
 *   "duration": 6,
 *   "quality": "high",
 *   "style": "natural"
 * }
*
* @example {json} 简化请求示例
 * {
 *   "imageUrl": "https://example.com/artwork.jpg"
 * }
*/
router.post('/image-to-video', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: '未授权，请先登录' 
      });
    }

    const { prompt, imageUrl, duration, size, fps, quality, style, model } = req.body;

    // 验证必要参数
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必要参数: imageUrl（图片URL）' 
      });
    }

    console.log('🎬 [图生视频] 收到请求:', {
      userId,
      imageUrl,
      prompt: prompt?.substring(0, 100),
      duration,
      size,
      model
    });

    // 调用视频生成服务
    const result = await multimodalService.generateVideo(userId, {
      model,
      prompt: prompt || '基于这张图片生成动态视频',
      duration,
      size,
      fps,
      quality,
      style
    });

    console.log('🎬 [图生视频] 生成成功:', result.videoUrl);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('🎬 [图生视频] 生成失败:', error.message);
    next(error);
  }
});

/**
* @summary 获取视频生成模型列表
* @description 获取当前系统中所有可用的AI视频生成模型信息，
 * 包括模型名称、描述、使用限制、费用等详细信息。用户可以根据需求选择合适的模型。
*
 * 模型信息包含：
 * - 基础信息：模型ID、显示名称、描述
 * - 技术规格：最大Token数、适用场景
 * - 成本信息：每千Token的费用
 * - 状态信息：是否为默认模型、是否活跃
*
* @tags AI视频处理
* @security [{"bearerAuth": []}]
* @responses {200} {object} 成功响应
* @responses {200} {object} description:获取模型列表成功
* @responses {200} {object} schema: {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "doubao-video-1",
 *       "name": "doubao-video-1",
 *       "displayName": "豆包视频生成模型",
 *       "description": "高质量通用视频生成模型，适用于各种场景",
 *       "isDefault": true,
 *       "maxTokens": 5000,
 *       "costPer1kTokens": 0.05,
 *       "supportedStyles": ["realistic", "cartoon", "anime"],
 *       "maxDuration": 30,
 *       "supportedSizes": ["720p", "1080p", "4K"]
 *     }
 *   ]
 * }
*
* @responses {401} {object} 认证错误
* @responses {401} {object} description:未授权访问
* @responses {401} {object} schema: {"success": false, "error": "未授权，请先登录"}
*
* @responses {500} {object} 服务器错误
* @responses {500} {object} description:获取模型列表失败
* @responses {500} {object} schema: {"success": false, "error": "获取失败原因"}
*
* @example {json} 响应示例
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "doubao-video-1",
 *       "name": "doubao-video-1",
 *       "displayName": "豆包视频生成模型",
 *       "description": "高质量通用视频生成模型，适用于各种场景",
 *       "isDefault": true,
 *       "maxTokens": 5000,
 *       "costPer1kTokens": 0.05
 *     },
 *     {
 *       "id": "doubao-img2video-1",
 *       "name": "doubao-img2video-1",
 *       "displayName": "豆包图片视频生成模型",
 *       "description": "专门用于图片转视频的模型",
 *       "isDefault": false,
 *       "maxTokens": 3000,
 *       "costPer1kTokens": 0.03
 *     }
 *   ]
 * }
*/
router.get('/models', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AIModelConfigModule = await import('../../models/ai-model-config.model');
    const AIModelConfig = AIModelConfigModule.default;

    const models = await AIModelConfig.findAll({
      where: {
        modelType: 'video',
        status: 'active'
      },
      attributes: ['id', 'name', 'displayName', 'description', 'isDefault', 'maxTokens', 'costPer1kTokens']
    });

    res.json({
      success: true,
      data: models
    });

  } catch (error: any) {
    console.error('🎬 [视频模型列表] 获取失败:', error.message);
    next(error);
  }
});

export default router;

