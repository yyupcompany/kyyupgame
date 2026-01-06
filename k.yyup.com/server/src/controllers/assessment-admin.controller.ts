import { Request, Response } from 'express';
import { AssessmentConfig } from '../models/assessment-config.model';
import { AssessmentQuestion } from '../models/assessment-question.model';
import { PhysicalTrainingItem } from '../models/physical-training-item.model';
import { AssessmentRecord } from '../models/assessment-record.model';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { RefactoredMultimodalService } from '../services/ai/refactored-multimodal.service';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

const multimodalService = new RefactoredMultimodalService();

// 图片上传目录
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/assessment-images');

// 确保目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * 下载图片到本地并裁剪水印
 */
async function downloadImage(imageUrl: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempFilePath = path.join(UPLOADS_DIR, `temp_${filename}`);
    const finalFilePath = path.join(UPLOADS_DIR, filename);
    const file = fs.createWriteStream(tempFilePath);
    
    const protocol = imageUrl.startsWith('https:') ? https : http;
    
    protocol.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', async () => {
        file.close();
        
        try {
          // 使用 sharp 裁剪图片，去除水印
          await sharp(tempFilePath)
            .extract({
              left: 37,      // 左边裁剪37像素
              top: 37,       // 顶部裁剪37像素
              width: 950,    // 宽度950像素
              height: 950    // 高度950像素（去除底部水印）
            })
            .resize(1024, 1024, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .jpeg({ quality: 85, progressive: true }) // 压缩为JPEG，质量85%
            .toFile(finalFilePath);
          
          // 删除临时文件
          fs.unlinkSync(tempFilePath);
          
          const relativePath = `/uploads/assessment-images/${filename}`;
          resolve(relativePath);
        } catch (error) {
          console.error('裁剪图片失败:', error);
          // 如果裁剪失败，使用原图
          fs.renameSync(tempFilePath, finalFilePath);
          const relativePath = `/uploads/assessment-images/${filename}`;
          resolve(relativePath);
        }
      });
    }).on('error', (err) => {
      fs.unlink(tempFilePath, () => {});
      reject(err);
    });
  });
}

/**
 * 生成题目配图
 * 使用 AIBridge 统一接口，确保用量统计
 */
export const generateQuestionImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { prompt, questionId } = req.body;
    
    if (!prompt) {
      throw ApiError.badRequest('缺少必填参数：prompt');
    }
    
    if (!userId) {
      throw ApiError.unauthorized('用户未登录');
    }
    
    // 使用 RefactoredMultimodalService，通过 AIBridge 调用，自动统计用量
    const result = await multimodalService.generateImage(userId, {
      model: 'doubao-seedream-3-0-t2i-250415', // 指定豆包文生图模型
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
      responseFormat: 'url'
    });
    
    if (!result || !result.data || result.data.length === 0) {
      throw ApiError.badRequest('图片生成失败');
    }
    
    const imageUrl = result.data[0].url;
    
    // 下载图片到本地（使用规范的文件命名）
    const filename = `q${questionId || 'new'}_${Date.now()}.png`;
    const localImageUrl = await downloadImage(imageUrl, filename);
    
    ApiResponse.success(res, {
      imageUrl: localImageUrl,
      originalUrl: imageUrl,
      prompt,
      modelUsed: result.modelUsed,
      selectionReason: result.selectionReason
    }, '图片生成成功');
    
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

// ... (其余现有的控制器代码保持不变)

/**
 * 获取测评配置列表
 */
export const getConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    const { count, rows } = await AssessmentConfig.findAndCountAll({
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['minAge', 'ASC']]
    });
    
    ApiResponse.success(res, {
      items: rows,
      total: count,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    }, '获取配置列表成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 创建测评配置
 */
export const createConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, description, minAge, maxAge, dimensions, status } = req.body;
    
    if (!name || !minAge || !maxAge || !dimensions) {
      throw ApiError.badRequest('缺少必填字段');
    }
    
    const config = await AssessmentConfig.create({
      name,
      description,
      minAge: parseInt(minAge),
      maxAge: parseInt(maxAge),
      dimensions: typeof dimensions === 'string' ? dimensions : JSON.stringify(dimensions),
      status: status || 'active',
      creatorId: userId
    });
    
    ApiResponse.success(res, config, '创建配置成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 更新测评配置
 */
export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = req.body;
    
    const config = await AssessmentConfig.findByPk(id);
    if (!config) {
      throw ApiError.notFound('配置不存在');
    }
    
    if (updateData.dimensions && typeof updateData.dimensions !== 'string') {
      updateData.dimensions = JSON.stringify(updateData.dimensions);
    }
    
    await config.update(updateData);
    
    ApiResponse.success(res, config, '更新配置成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取题目列表
 */
export const getAdminQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, configId, dimension, ageGroup, status } = req.query;
    const where: any = {};
    if (configId) where.configId = parseInt(configId as string);
    if (dimension) where.dimension = dimension;
    if (ageGroup) where.ageGroup = ageGroup;
    if (status) where.status = status;
    
    const { count, rows } = await AssessmentQuestion.findAndCountAll({
      where,
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: [{ association: 'config' }]
    });
    
    ApiResponse.success(res, {
      items: rows,
      total: count,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    }, '获取题目列表成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 创建题目
 */
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { configId, dimension, ageGroup, questionType, title, content, gameConfig, imageUrl, imagePrompt, difficulty, score, sortOrder, status } = req.body;
    
    if (!configId || !dimension || !ageGroup || !questionType || !title || !content) {
      throw ApiError.badRequest('缺少必填字段');
    }
    
    const question = await AssessmentQuestion.create({
      configId: parseInt(configId),
      dimension,
      ageGroup,
      questionType,
      title,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      gameConfig: gameConfig ? (typeof gameConfig === 'string' ? gameConfig : JSON.stringify(gameConfig)) : null,
      imageUrl: imageUrl || null,
      imagePrompt: imagePrompt || null,
      difficulty: difficulty || 1,
      score: score || 10,
      sortOrder: sortOrder || 0,
      status: status || 'active',
      creatorId: userId
    });
    
    ApiResponse.success(res, question, '创建题目成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 更新题目
 */
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = req.body;
    
    const question = await AssessmentQuestion.findByPk(id);
    if (!question) {
      throw ApiError.notFound('题目不存在');
    }
    
    // 处理JSON字段
    if (updateData.content && typeof updateData.content !== 'string') {
      updateData.content = JSON.stringify(updateData.content);
    }
    if (updateData.gameConfig && typeof updateData.gameConfig !== 'string') {
      updateData.gameConfig = JSON.stringify(updateData.gameConfig);
    }
    
    await question.update(updateData);
    
    ApiResponse.success(res, question, '更新题目成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 删除题目
 */
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const question = await AssessmentQuestion.findByPk(id);
    if (!question) {
      throw ApiError.notFound('题目不存在');
    }
    
    await question.destroy();
    
    ApiResponse.success(res, null, '删除题目成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取体能训练项目列表
 */
export const getPhysicalItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    const { count, rows } = await PhysicalTrainingItem.findAndCountAll({
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['sortOrder', 'ASC']]
    });
    
    ApiResponse.success(res, {
      items: rows,
      total: count,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    }, '获取项目列表成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取统计数据
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalRecords = await AssessmentRecord.count();
    const completedRecords = await AssessmentRecord.count({ where: { status: 'completed' } });
    const inProgressRecords = await AssessmentRecord.count({ where: { status: 'in_progress' } });
    const completionRate = totalRecords > 0 ? ((completedRecords / totalRecords) * 100).toFixed(2) : '0.00';
    
    ApiResponse.success(res, {
      totalRecords,
      completedRecords,
      inProgressRecords,
      completionRate: parseFloat(completionRate)
    }, '获取统计数据成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};
