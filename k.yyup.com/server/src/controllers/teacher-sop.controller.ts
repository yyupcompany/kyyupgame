import { Request, Response } from 'express';
import { TeacherSOPService } from '../services/teacher-sop.service';
import { AISOPSuggestionService } from '../services/ai-sop-suggestion.service';

export class TeacherSOPController {
  /**
   * 获取所有SOP阶段
   * GET /api/teacher-sop/stages
   */
  static async getAllStages(req: Request, res: Response) {
    try {
      const stages = await TeacherSOPService.getAllStages();
      
      res.json({
        success: true,
        data: stages
      });
    } catch (error: any) {
      console.error('获取SOP阶段失败:', error);
      res.status(500).json({
        success: false,
        message: '获取SOP阶段失败',
        error: error.message
      });
    }
  }

  /**
   * 获取阶段详情
   * GET /api/teacher-sop/stages/:id
   */
  static async getStageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stage = await TeacherSOPService.getStageById(Number(id));
      
      if (!stage) {
        return res.status(404).json({
          success: false,
          message: '阶段不存在'
        });
      }
      
      res.json({
        success: true,
        data: stage
      });
    } catch (error: any) {
      console.error('获取阶段详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取阶段详情失败',
        error: error.message
      });
    }
  }

  /**
   * 获取阶段的所有任务
   * GET /api/teacher-sop/stages/:id/tasks
   */
  static async getTasksByStage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tasks = await TeacherSOPService.getTasksByStage(Number(id));
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error: any) {
      console.error('获取阶段任务失败:', error);
      res.status(500).json({
        success: false,
        message: '获取阶段任务失败',
        error: error.message
      });
    }
  }

  /**
   * 获取客户SOP进度
   * GET /api/teacher-sop/customers/:customerId/progress
   */
  static async getCustomerProgress(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const progress = await TeacherSOPService.getCustomerProgress(
        Number(customerId),
        teacherId
      );
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('获取客户进度失败:', error);
      res.status(500).json({
        success: false,
        message: '获取客户进度失败',
        error: error.message
      });
    }
  }

  /**
   * 更新客户SOP进度
   * PUT /api/teacher-sop/customers/:customerId/progress
   */
  static async updateCustomerProgress(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const progress = await TeacherSOPService.updateCustomerProgress(
        Number(customerId),
        teacherId,
        req.body
      );
      
      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('更新客户进度失败:', error);
      res.status(500).json({
        success: false,
        message: '更新客户进度失败',
        error: error.message
      });
    }
  }

  /**
   * 完成任务
   * POST /api/teacher-sop/customers/:customerId/tasks/:taskId/complete
   */
  static async completeTask(req: Request, res: Response) {
    try {
      const { customerId, taskId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const progress = await TeacherSOPService.completeTask(
        Number(customerId),
        teacherId,
        Number(taskId)
      );
      
      res.json({
        success: true,
        data: progress,
        message: '任务已完成'
      });
    } catch (error: any) {
      console.error('完成任务失败:', error);
      res.status(500).json({
        success: false,
        message: '完成任务失败',
        error: error.message
      });
    }
  }

  /**
   * 推进到下一阶段
   * POST /api/teacher-sop/customers/:customerId/progress/advance
   */
  static async advanceToNextStage(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const progress = await TeacherSOPService.advanceToNextStage(
        Number(customerId),
        teacherId
      );
      
      res.json({
        success: true,
        data: progress,
        message: '已进入下一阶段'
      });
    } catch (error: any) {
      console.error('推进阶段失败:', error);
      res.status(500).json({
        success: false,
        message: '推进阶段失败',
        error: error.message
      });
    }
  }

  /**
   * 获取对话记录
   * GET /api/teacher-sop/customers/:customerId/conversations
   */
  static async getConversations(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const conversations = await TeacherSOPService.getConversations(
        Number(customerId),
        teacherId
      );
      
      res.json({
        success: true,
        data: conversations
      });
    } catch (error: any) {
      console.error('获取对话记录失败:', error);
      res.status(500).json({
        success: false,
        message: '获取对话记录失败',
        error: error.message
      });
    }
  }

  /**
   * 添加对话记录
   * POST /api/teacher-sop/customers/:customerId/conversations
   */
  static async addConversation(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const conversation = await TeacherSOPService.addConversation({
        customerId: Number(customerId),
        teacherId,
        ...req.body
      });
      
      res.json({
        success: true,
        data: conversation,
        message: '对话记录已添加'
      });
    } catch (error: any) {
      console.error('添加对话记录失败:', error);
      res.status(500).json({
        success: false,
        message: '添加对话记录失败',
        error: error.message
      });
    }
  }

  /**
   * 批量添加对话记录
   * POST /api/teacher-sop/customers/:customerId/conversations/batch
   */
  static async addConversationsBatch(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const { conversations } = req.body;
      
      const conversationsWithIds = conversations.map((c: any) => ({
        ...c,
        customerId: Number(customerId),
        teacherId
      }));
      
      const result = await TeacherSOPService.addConversationsBatch(conversationsWithIds);
      
      res.json({
        success: true,
        data: result,
        message: `已添加${result.length}条对话记录`
      });
    } catch (error: any) {
      console.error('批量添加对话记录失败:', error);
      res.status(500).json({
        success: false,
        message: '批量添加对话记录失败',
        error: error.message
      });
    }
  }

  /**
   * 上传截图
   * POST /api/teacher-sop/customers/:customerId/screenshots/upload
   */
  static async uploadScreenshot(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      // TODO: 处理文件上传
      const { imageUrl, conversationId } = req.body;
      
      const screenshot = await TeacherSOPService.uploadScreenshot({
        conversationId,
        customerId: Number(customerId),
        imageUrl,
        uploadedBy: teacherId
      });
      
      res.json({
        success: true,
        data: screenshot,
        message: '截图已上传'
      });
    } catch (error: any) {
      console.error('上传截图失败:', error);
      res.status(500).json({
        success: false,
        message: '上传截图失败',
        error: error.message
      });
    }
  }

  /**
   * 分析截图
   * POST /api/teacher-sop/customers/:customerId/screenshots/:screenshotId/analyze
   */
  static async analyzeScreenshot(req: Request, res: Response) {
    try {
      const { customerId, screenshotId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const analysis = await AISOPSuggestionService.analyzeScreenshot({
        screenshotId: Number(screenshotId),
        customerId: Number(customerId),
        teacherId
      });
      
      res.json({
        success: true,
        data: analysis,
        message: '截图分析完成'
      });
    } catch (error: any) {
      console.error('分析截图失败:', error);
      res.status(500).json({
        success: false,
        message: '分析截图失败',
        error: error.message
      });
    }
  }

  /**
   * 获取任务AI建议
   * POST /api/teacher-sop/customers/:customerId/ai-suggestions/task
   */
  static async getTaskAISuggestion(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const { taskId } = req.body;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const suggestion = await AISOPSuggestionService.getTaskSuggestion({
        customerId: Number(customerId),
        teacherId,
        taskId: Number(taskId)
      });
      
      res.json({
        success: true,
        data: suggestion
      });
    } catch (error: any) {
      console.error('获取AI建议失败:', error);
      res.status(500).json({
        success: false,
        message: '获取AI建议失败',
        error: error.message
      });
    }
  }

  /**
   * 获取全局AI分析
   * POST /api/teacher-sop/customers/:customerId/ai-suggestions/global
   */
  static async getGlobalAIAnalysis(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }
      
      const analysis = await AISOPSuggestionService.getGlobalAnalysis({
        customerId: Number(customerId),
        teacherId
      });
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      console.error('获取全局AI分析失败:', error);
      res.status(500).json({
        success: false,
        message: '获取全局AI分析失败',
        error: error.message
      });
    }
  }
}

