import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { AutoImageGenerationService } from '../services/ai/auto-image-generation.service';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

/**
 * 下载图片到本地
 */
const downloadImage = (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // 删除失败的文件
      reject(err);
    });
  });
};

/**
 * 生成海报
 */
export const generatePoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    const { templateId, customData, includeBasicInfo = true } = req.body;

    // 获取幼儿园基础信息
    let kindergartenInfo: any = null;
    if (includeBasicInfo) {
      try {
        const Kindergarten = sequelize.models.Kindergarten;
        kindergartenInfo = await Kindergarten.findOne({
          where: { status: 1 },
          attributes: ['name', 'address', 'consultationPhone', 'phone', 'contactPerson', 'logoUrl'],
          raw: true
        });
        console.log('🏫 获取幼儿园基础信息:', kindergartenInfo);
      } catch (error) {
        console.warn('⚠️ 获取幼儿园基础信息失败，使用默认值', error);
      }
    }

    // 根据模板ID和自定义数据生成海报描述
    const templateNames: { [key: number]: string } = {
      1: '节日庆典',
      2: '艺术创作',
      3: '科学实验',
      4: '体育运动'
    };

    const templateName = templateNames[templateId] || '幼儿园活动';

    // 构建海报生成提示词（包含基础信息）
    const kindergartenName = kindergartenInfo?.name || customData?.kindergartenName || '幼儿园';
    const address = kindergartenInfo?.address || customData?.address || '';
    const phone = kindergartenInfo?.consultationPhone || kindergartenInfo?.phone || customData?.phone || '';
    const contactPerson = kindergartenInfo?.contactPerson || customData?.contactPerson || '';

    const posterPrompt = `
创建一张专业的幼儿园${templateName}海报，要求：

**活动信息：**
- 标题：${customData?.title || '幼儿园活动'}
- 副标题：${customData?.subtitle || '快乐成长，精彩童年'}
- 主要内容：${customData?.content || '欢迎参加我们的精彩活动'}

**幼儿园信息：**
- 幼儿园名称：${kindergartenName}
${address ? `- 园区地址：${address}` : ''}
${phone ? `- 咨询电话：${phone}` : ''}
${contactPerson ? `- 联系人：${contactPerson}` : ''}

**设计要求：**
- 设计风格：温馨、活泼、专业
- 色彩：明亮温暖的色调
- 尺寸：适合手机分享的竖版海报 (750x1334像素)
- 包含可爱的卡通元素和装饰
- 文字清晰易读，布局美观
- 幼儿园名称要醒目显示
- 联系方式要清晰可见
`.trim();

    console.log('🎨 开始生成海报');
    console.log('📋 海报提示词:', posterPrompt);
    console.log('🏫 幼儿园信息:', { kindergartenName, address, phone, contactPerson });

    // 使用豆包API生成海报
    const imageGenerationService = new AutoImageGenerationService();
    const result = await imageGenerationService.generateImage({
      prompt: posterPrompt,
      category: 'poster',
      style: 'natural', // 移除硬编码的cartoon风格，改为natural
      size: '1024x1024', // 使用类型定义中支持的尺寸
      quality: 'standard'
    });

    if (!result.success || !result.imageUrl) {
      throw new Error(`图片生成失败: ${result.error || '未获取到图片URL'}`);
    }

    console.log('✅ 海报生成成功，图片URL:', result.imageUrl);

    // 生成本地文件名
    const timestamp = Date.now();
    const filename = `poster_${templateId}_${timestamp}.jpg`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'posters');

    // 确保目录存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localPath = path.join(uploadsDir, filename);

    // 下载图片到本地
    await downloadImage(result.imageUrl, localPath);

    console.log('📁 海报已保存到本地:', localPath);

    // 构建响应数据，确保字段名与前端期望一致
    const poster = {
      id: timestamp,
      templateId,
      title: customData?.title || '生成的海报',
      url: `/uploads/posters/${filename}`, // 前端期望的字段名
      imageUrl: `/uploads/posters/${filename}`, // 兼容性字段
      status: 'completed',
      width: 750,
      height: 1334,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    ApiResponse.success(res, poster, '海报生成成功', 201);
  } catch (error) {
    console.error('❌ 海报生成失败:', error);
    ApiResponse.handleError(res, error, '海报生成失败');
  }
};

/**
 * 获取海报详情
 */
export const getPosterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    // 暂时返回模拟数据
    const poster = {
      id: Number(id) || 0,
      templateId: 1,
      title: '春季招生海报',
      imageUrl: `/posters/poster_${id}.png`,
      status: 'completed',
      width: 750,
      height: 1334,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    ApiResponse.success(res, poster, '获取海报详情成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取海报详情失败');
  }
};

/**
 * 更新海报
 */
export const updatePoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    // 暂时返回模拟数据
    const poster = {
      id: Number(id) || 0,
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    ApiResponse.success(res, poster, '更新海报成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '更新海报失败');
  }
};

/**
 * 删除海报
 */
export const deletePoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    ApiResponse.success(res, null, '删除海报成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '删除海报失败');
  }
};

/**
 * 获取海报列表
 */
export const getPosters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    
    // 暂时返回模拟数据
    const posters = [
      {
        id: 1,
        templateId: 1,
        title: '春季招生海报',
        imageUrl: '/posters/poster_1.png',
        status: 'completed',
        createdAt: new Date()
      },
      {
        id: 2,
        templateId: 2,
        title: '活动宣传海报',
        imageUrl: '/posters/poster_2.png',
        status: 'completed',
        createdAt: new Date()
      }
    ];

    const result = {
      items: posters,
      page: Number(page) || 0,
      pageSize: Number(pageSize) || 0,
      total: posters.length,
      totalPages: Math.ceil(posters.length / Number(pageSize) || 0)
    };

    ApiResponse.success(res, result, '获取海报列表成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取海报列表失败');
  }
};

/**
 * 预览海报
 */
export const previewPoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    // 暂时返回模拟数据
    const previewData = {
      posterId: Number(id) || 0,
      previewUrl: `/api/posters/${id}/preview.png`,
      width: 750,
      height: 1334,
      generatedAt: new Date()
    };

    ApiResponse.success(res, previewData, '生成海报预览成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '生成海报预览失败');
  }
};

/**
 * 下载海报
 */
export const downloadPoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    // 暂时返回下载链接
    const downloadUrl = `/api/posters/${id}/download`;
    
    res.json({
      success: true,
      data: {
        downloadUrl,
        filename: `poster_${id}.png`
      },
      message: '获取下载链接成功'
    });
  } catch (error) {
    ApiResponse.handleError(res, error, '获取下载链接失败');
  }
};

/**
 * 分享海报
 */
export const sharePoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的海报ID');
    }

    // 暂时返回模拟数据
    const shareResult = {
      posterId: Number(id) || 0,
      shareUrl: `https://example.com/posters/share/${id}`,
      qrCode: `/api/posters/${id}/qrcode.png`,
      sharedAt: new Date()
    };

    ApiResponse.success(res, shareResult, '分享海报成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '分享海报失败');
  }
};

/**
 * 获取海报统计
 */
export const getPosterStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 暂时返回模拟数据
    const stats = {
      totalPosters: 25,
      completedPosters: 20,
      pendingPosters: 3,
      failedPosters: 2,
      totalViews: 1250,
      totalShares: 85
    };

    ApiResponse.success(res, stats, '获取海报统计成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取海报统计失败');
  }
}; 