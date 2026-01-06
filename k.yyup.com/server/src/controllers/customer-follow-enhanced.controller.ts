import { Request, Response } from 'express';
import { CustomerFollowEnhancedService } from '../services/customer-follow-enhanced.service';
import multer from 'multer';
import path from 'path';

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/customer-follow/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

/**
 * 增强版客户跟进控制器
 */
export class CustomerFollowEnhancedController {
  private service: CustomerFollowEnhancedService;

  constructor() {
    this.service = new CustomerFollowEnhancedService();
  }

  /**
   * 创建跟进记录
   */
  async createFollowRecord(req: Request, res: Response) {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证',
          error: { code: 'UNAUTHORIZED' }
        });
      }

      const {
        customerId,
        stage,
        subStage,
        followType,
        content,
        customerFeedback,
        nextFollowDate
      } = req.body;

      // 验证必需字段
      if (!customerId || !stage || !subStage || !followType || !content) {
        return res.status(400).json({
          success: false,
          message: '缺少必需字段',
          error: { code: 'VALIDATION_ERROR' }
        });
      }

      const followRecord = await this.service.createFollowRecord({
        customerId: parseInt(customerId),
        teacherId,
        stage: parseInt(stage),
        subStage,
        followType,
        content,
        customerFeedback,
        mediaFiles: req.files as Express.Multer.File[],
        nextFollowDate: nextFollowDate ? new Date(nextFollowDate) : undefined
      });

      return res.json({
        success: true,
        data: followRecord,
        message: '创建跟进记录成功'
      });

    } catch (error) {
      console.error('创建跟进记录错误:', error);
      return res.status(500).json({
        success: false,
        message: '创建跟进记录失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 更新跟进记录
   */
  async updateFollowRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const followRecord = await this.service.updateFollowRecord({
        id: parseInt(id),
        ...updateData
      });

      return res.json({
        success: true,
        data: followRecord,
        message: '更新跟进记录成功'
      });

    } catch (error) {
      console.error('更新跟进记录错误:', error);
      return res.status(500).json({
        success: false,
        message: '更新跟进记录失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 获取客户跟进时间线
   */
  async getCustomerTimeline(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;

      const timeline = await this.service.getCustomerTimeline(
        parseInt(customerId),
        teacherId
      );

      return res.json({
        success: true,
        data: timeline,
        message: '获取客户时间线成功'
      });

    } catch (error) {
      console.error('获取客户时间线错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取客户时间线失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 获取阶段配置
   */
  async getStageConfigurations(req: Request, res: Response) {
    try {
      const stages = await this.service.getStageConfigurations();

      return res.json({
        success: true,
        data: stages,
        message: '获取阶段配置成功'
      });

    } catch (error) {
      console.error('获取阶段配置错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取阶段配置失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 获取AI建议
   */
  async getAISuggestions(req: Request, res: Response) {
    try {
      const { followRecordId } = req.params;

      const suggestions = await this.service.getAISuggestions(parseInt(followRecordId));

      return res.json({
        success: true,
        data: suggestions,
        message: '获取AI建议成功'
      });

    } catch (error) {
      console.error('获取AI建议错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取AI建议失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 完成阶段
   */
  async completeStage(req: Request, res: Response) {
    try {
      const { followRecordId } = req.params;

      const followRecord = await this.service.updateFollowRecord({
        id: parseInt(followRecordId),
        stageStatus: 'completed',
        completedAt: new Date()
      });

      return res.json({
        success: true,
        data: followRecord,
        message: '完成阶段成功'
      });

    } catch (error) {
      console.error('完成阶段错误:', error);
      return res.status(500).json({
        success: false,
        message: '完成阶段失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 跳过阶段
   */
  async skipStage(req: Request, res: Response) {
    try {
      const { followRecordId } = req.params;
      const { reason } = req.body;

      const followRecord = await this.service.updateFollowRecord({
        id: parseInt(followRecordId),
        stageStatus: 'skipped',
        customerFeedback: reason || '阶段已跳过'
      });

      return res.json({
        success: true,
        data: followRecord,
        message: '跳过阶段成功'
      });

    } catch (error) {
      console.error('跳过阶段错误:', error);
      return res.status(500).json({
        success: false,
        message: '跳过阶段失败',
        error: { code: 'SERVER_ERROR' }
      });
    }
  }

  /**
   * 获取文件上传中间件
   */
  getUploadMiddleware() {
    return upload.array('mediaFiles', 5); // 最多5个文件
  }
}

export default CustomerFollowEnhancedController;
