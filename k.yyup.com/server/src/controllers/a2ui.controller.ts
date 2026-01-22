/**
 * A2UI 控制器
 * 处理A2UI协议的消息和事件
 */

import { Request, Response, NextFunction } from 'express';
import { a2uiMessageService } from '../services/a2ui/a2ui-message.service';
import { curriculumA2UIConverter, type CurriculumPlan } from '../services/a2ui/curriculum-a2ui-converter.service';
import redisService from '../services/redis.service';
import { validateComponentTree, sanitizeEventPayload, createSecurityError } from '../utils/a2ui-sanitizer';

/**
 * A2UI控制器类
 */
export class A2UIController {

  /**
   * 开始渲染流程
   * POST /a2ui/begin-rendering
   */
  async beginRendering(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId, initialData, config } = req.body;
      const sessionId = req.body.sessionId || messageId || `session-${Date.now()}`;

      console.log('[A2UI] 开始渲染流程:', { messageId, sessionId });

      let rootComponent = null;
      let error = null;

      // 从initialData中获取课程ID，加载课程数据
      if (initialData?.curriculumId) {
        try {
          // 注意：这里需要根据实际项目导入课程服务
          // const curriculum = await interactiveCurriculumService.getCurriculum(initialData.curriculumId, req.user?.id);

          // 模拟课程数据（实际项目中从数据库获取）
          const mockCurriculum = this.getMockCurriculum(initialData.curriculumId);

          if (mockCurriculum) {
            // 使用转换器生成A2UI组件树
            rootComponent = curriculumA2UIConverter.convertCurriculumToA2UI(mockCurriculum);

            // 保存会话状态到Redis
            await redisService.set(
              `a2ui:session:${sessionId}`,
              JSON.stringify({
                status: 'ready',
                curriculumId: initialData.curriculumId,
                createdAt: Date.now(),
                userId: req.user?.id
              }),
              3600 // 1小时过期
            );

            console.log('[A2UI] 会话创建成功:', sessionId);
          }
        } catch (err) {
          console.error('[A2UI] 加载课程失败:', err);
          error = err;
        }
      }

      // 如果没有课程数据，返回示例组件
      if (!rootComponent) {
        rootComponent = this.createEmptyStateComponent();
      }

      // 验证组件树安全性
      const validation = validateComponentTree(rootComponent);
      if (!validation.valid) {
        console.error('[A2UI] 组件树验证失败:', validation.errors);
        rootComponent = this.createErrorComponent('组件验证失败');
      }

      // 返回渲染初始化响应
      const surfaceUpdate = a2uiMessageService.createSurfaceUpdate(rootComponent, 'full');

      res.json({
        success: true,
        data: {
          sessionId,
          surfaceUpdate
        }
      });
    } catch (error) {
      console.error('[A2UI] 开始渲染失败:', error);
      next(error);
    }
  }

  /**
   * 处理客户端事件
   * POST /a2ui/event
   */
  async handleEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, messageId, componentId, eventType, payload } = req.body;

      console.log('[A2UI] 收到事件:', { sessionId, componentId, eventType });

      // 验证和净化负载
      const sanitizedPayload = sanitizeEventPayload(payload || {});

      // 从Redis获取会话状态
      const sessionData = await redisService.get(`a2ui:session:${sessionId}`);
      const session = sessionData ? JSON.parse(sessionData) : null;

      // 生成响应
      const response: any = {
        success: true,
        data: {}
      };

      // 根据事件类型处理
      switch (eventType) {
        case 'question.answer':
          Object.assign(response.data, await this.handleQuestionAnswer(session, componentId, sanitizedPayload));
          break;

        case 'timer.complete':
          Object.assign(response.data, await this.handleTimerComplete(session, sanitizedPayload));
          break;

        case 'game.complete':
          Object.assign(response.data, await this.handleGameComplete(session, componentId, sanitizedPayload));
          break;

        case 'whiteboard.save':
          Object.assign(response.data, await this.handleWhiteboardSave(session, componentId, sanitizedPayload));
          break;

        case 'navigation.step':
          Object.assign(response.data, await this.handleNavigationStep(session, sanitizedPayload));
          break;

        case 'score.update':
          Object.assign(response.data, await this.handleScoreUpdate(session, sanitizedPayload));
          break;

        case 'drag.sort.complete':
          Object.assign(response.data, await this.handleDragSortComplete(session, componentId, sanitizedPayload));
          break;

        case 'puzzle.move':
          Object.assign(response.data, await this.handlePuzzleMove(session, componentId, sanitizedPayload));
          break;

        case 'puzzle.complete':
          Object.assign(response.data, await this.handlePuzzleComplete(session, componentId, sanitizedPayload));
          break;

        case 'button.click':
          Object.assign(response.data, await this.handleButtonClick(session, componentId, sanitizedPayload));
          break;

        case 'star.rating.change':
          Object.assign(response.data, await this.handleStarRatingChange(session, componentId, sanitizedPayload));
          break;

        default:
          console.log('[A2UI] 未处理的事件类型:', eventType);
          response.data.message = '事件已接收';
      }

      res.json(response);
    } catch (error) {
      console.error('[A2UI] 处理事件失败:', error);
      next(error);
    }
  }

  /**
   * 获取会话状态
   * GET /a2ui/session/:sessionId
   */
  async getSessionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      const sessionData = await redisService.get(`a2ui:session:${sessionId}`);
      if (!sessionData) {
        res.status(404).json({
          success: false,
          message: '会话不存在'
        });
        return;
      }

      res.json({
        success: true,
        data: JSON.parse(sessionData)
      });
    } catch (error) {
      console.error('[A2UI] 获取会话状态失败:', error);
      next(error);
    }
  }

  /**
   * 结束会话
   * POST /a2ui/end-session
   */
  async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (sessionId) {
        await redisService.del(`a2ui:session:${sessionId}`);
      }

      res.json({
        success: true,
        message: '会话已结束'
      });
    } catch (error) {
      console.error('[A2UI] 结束会话失败:', error);
      next(error);
    }
  }

  /**
   * 上报错误
   * POST /a2ui/report-error
   */
  async reportError(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, messageId, error } = req.body;

      console.error('[A2UI] 用户上报错误:', {
        sessionId,
        messageId,
        error,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });

      // 可以在这里将错误发送到监控系统
      // await monitoringService.reportError(...)

      res.json({
        success: true,
        message: '问题已收到，感谢反馈'
      });
    } catch (error) {
      console.error('[A2UI] 上报错误失败:', error);
      next(error);
    }
  }

  /**
   * 处理答题事件
   */
  private async handleQuestionAnswer(session: any, componentId: string, payload: any): Promise<object> {
    const { answer, isCorrect, timeSpent } = payload;
    const points = isCorrect ? 10 : 0;
    const newScore = points;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.answered`, value: true, operation: 'set' },
        { path: `${componentId}.userAnswer`, value: answer, operation: 'set' },
        { path: `${componentId}.isCorrect`, value: isCorrect, operation: 'set' },
        { path: `score-board.score`, value: newScore, operation: 'set' }
      ],
      feedback: {
        correct: isCorrect,
        message: isCorrect ? '回答正确！太棒了！' : '再想想哦，答案不对',
        explanation: payload.explanation,
        stars: isCorrect ? 3 : 1
      }
    };
  }

  /**
   * 处理计时器完成事件
   */
  private async handleTimerComplete(session: any, payload: any): Promise<object> {
    return {
      success: true,
      updateData: [
        { path: 'timer.status', value: 'completed', operation: 'set' }
      ],
      message: '时间到！',
      feedback: {
        correct: false,
        message: '时间到了，请加快速度哦！'
      }
    };
  }

  /**
   * 处理游戏完成事件
   */
  private async handleGameComplete(session: any, componentId: string, payload: any): Promise<object> {
    const { score, timeSpent, stars } = payload;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.completed`, value: true, operation: 'set' },
        { path: `${componentId}.score`, value: score, operation: 'set' },
        { path: `score-board.score`, value: score, operation: 'set' }
      ],
      celebration: {
        show: true,
        stars: stars || 3,
        message: `恭喜完成！获得 ${stars || 3} 星评价！`
      }
    };
  }

  /**
   * 处理白板保存事件
   */
  private async handleWhiteboardSave(session: any, componentId: string, payload: any): Promise<object> {
    const { imageData } = payload;

    // 保存白板内容到数据库（实际项目中实现）
    console.log('[A2UI] 白板已保存:', { sessionId: session?.curriculumId, imageSize: imageData?.length });

    return {
      success: true,
      updateData: [
        { path: `${componentId}.saved`, value: true, operation: 'set' },
        { path: `${componentId}.savedAt`, value: new Date().toISOString(), operation: 'set' }
      ],
      message: '作品已保存！'
    };
  }

  /**
   * 处理步骤导航事件
   */
  private async handleNavigationStep(session: any, payload: any): Promise<object> {
    const { currentStep, direction } = payload;

    return {
      success: true,
      updateData: [
        { path: 'step-indicator.currentStep', value: currentStep, operation: 'set' }
      ]
    };
  }

  /**
   * 处理分数更新事件
   */
  private async handleScoreUpdate(session: any, payload: any): Promise<object> {
    const { score, timeBonus, combo } = payload;

    return {
      success: true,
      updateData: [
        { path: 'score-board.score', value: score, operation: 'set' },
        { path: 'score-board.timeBonus', value: timeBonus || 0, operation: 'set' },
        { path: 'score-board.combo', value: combo || 0, operation: 'set' }
      ]
    };
  }

  /**
   * 处理拖拽排序完成事件
   */
  private async handleDragSortComplete(session: any, componentId: string, payload: any): Promise<object> {
    const { userOrder, isCorrect, score } = payload;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.completed`, value: true, operation: 'set' },
        { path: `${componentId}.isCorrect`, value: isCorrect, operation: 'set' },
        { path: `score-board.score`, value: score, operation: 'set' }
      ],
      feedback: {
        correct: isCorrect,
        message: isCorrect ? '排序正确！' : '再试一次哦',
        stars: isCorrect ? 3 : 1
      }
    };
  }

  /**
   * 处理拼图移动事件
   */
  private async handlePuzzleMove(session: any, componentId: string, payload: any): Promise<object> {
    const { moves, isComplete } = payload;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.moves`, value: moves, operation: 'set' },
        { path: `${componentId}.isComplete`, value: isComplete, operation: 'set' }
      ]
    };
  }

  /**
   * 处理拼图完成事件
   */
  private async handlePuzzleComplete(session: any, componentId: string, payload: any): Promise<object> {
    const { moves, timeSpent, score, stars } = payload;
    const baseScore = 100;
    const moveBonus = Math.max(0, 50 - moves * 5);
    const totalScore = baseScore + moveBonus;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.completed`, value: true, operation: 'set' },
        { path: `${componentId}.score`, value: totalScore, operation: 'set' },
        { path: `${componentId}.moves`, value: moves, operation: 'set' },
        { path: `score-board.score`, value: totalScore, operation: 'set' }
      ],
      celebration: {
        show: true,
        stars: stars || Math.max(1, Math.min(5, Math.round(50 / moves))),
        message: `太棒了！拼图完成！得分：${totalScore}`
      }
    };
  }

  /**
   * 处理按钮点击事件
   */
  private async handleButtonClick(session: any, componentId: string, payload: any): Promise<object> {
    const { action } = payload;

    console.log('[A2UI] 按钮点击:', { componentId, action });

    return {
      success: true,
      message: `执行操作: ${action}`
    };
  }

  /**
   * 处理星星评分变化事件
   */
  private async handleStarRatingChange(session: any, componentId: string, payload: any): Promise<object> {
    const { value } = payload;

    return {
      success: true,
      updateData: [
        { path: `${componentId}.value`, value, operation: 'set' }
      ]
    };
  }

  /**
   * 创建空状态组件
   */
  private createEmptyStateComponent() {
    return {
      type: 'empty-state',
      id: 'empty-state',
      props: {
        message: '暂无课程内容',
        description: '请先选择一个课程或创建新课程'
      }
    };
  }

  /**
   * 创建错误组件
   */
  private createErrorComponent(message: string) {
    return {
      type: 'error-tip',
      id: 'error-tip',
      props: {
        message: `渲染错误: ${message}`,
        showClose: true
      }
    };
  }

  /**
   * 获取模拟课程数据（实际项目中从数据库获取）
   */
  private getMockCurriculum(curriculumId: string): CurriculumPlan {
    // 返回示例课程数据
    return {
      id: curriculumId,
      title: '有趣的数字游戏',
      description: '通过互动游戏学习1-10的数字认知',
      ageGroup: '3-5岁',
      duration: 20,
      objectives: [
        '认识数字1-10',
        '理解数字与数量的对应关系',
        '培养数学思维能力'
      ],
      media: {
        images: [
          { url: 'https://example.com/images/numbers-1.jpg', description: '数字卡片' },
          { url: 'https://example.com/images/numbers-2.jpg', description: '数量对应图' }
        ]
      },
      activities: [
        {
          id: 'activity-1',
          type: 'choice',
          title: '数字认知',
          instruction: '请选出正确的数字',
          question: '图片中有几个苹果？',
          options: [
            { id: 'opt-1', text: '3', isCorrect: false },
            { id: 'opt-2', text: '5', isCorrect: true },
            { id: 'opt-3', text: '7', isCorrect: false }
          ],
          timeLimit: 30,
          points: 10
        },
        {
          id: 'activity-2',
          type: 'drag-sort',
          title: '数字排序',
          instruction: '请将数字按从小到大的顺序排列',
          items: [
            { id: 'item-3', text: '3' },
            { id: 'item-1', text: '1' },
            { id: 'item-5', text: '5' },
            { id: 'item-2', text: '2' },
            { id: 'item-4', text: '4' }
          ],
          correctOrder: ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'],
          points: 20
        },
        {
          id: 'activity-3',
          type: 'puzzle',
          title: '数字拼图',
          instruction: '请完成数字拼图',
          imageSrc: 'https://example.com/images/number-puzzle.jpg',
          gridSize: 3,
          timeLimit: 120,
          points: 30
        }
      ]
    };
  }
}

// 导出单例
export const a2uiController = new A2UIController();
