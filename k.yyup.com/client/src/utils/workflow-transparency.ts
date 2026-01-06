/**
 * 🎯 工作流透明度管理器
 * 统一管理AI助手在工作流期间的透明度状态
 * 集成工作流步骤队列系统
 */

import { workflowStepManager, WORKFLOW_STEP_TEMPLATES } from './workflow-steps'
import { pageAwarenessService } from '@/services/page-awareness.service'

export interface WorkflowTransparencyOptions {
  duration?: number; // 自动恢复时间（毫秒）
  opacity?: number; // 透明度（0-1）
  showIndicator?: boolean; // 是否显示工作流指示器
  message?: string; // 自定义提示消息
  createStepQueue?: boolean; // 是否创建步骤队列
  stepQueueTitle?: string; // 步骤队列标题
  stepQueueDescription?: string; // 步骤队列描述
  customSteps?: any[]; // 自定义步骤
}

export class WorkflowTransparencyManager {
  private static instance: WorkflowTransparencyManager;
  private aiAssistantRef: any = null;
  private activeWorkflows: Set<string> = new Set();
  private timeoutIds: Map<string, number> = new Map();
  private stepQueueIds: Map<string, string> = new Map(); // 工作流ID -> 步骤队列ID

  private constructor() {}

  static getInstance(): WorkflowTransparencyManager {
    if (!WorkflowTransparencyManager.instance) {
      WorkflowTransparencyManager.instance = new WorkflowTransparencyManager();
    }
    return WorkflowTransparencyManager.instance;
  }

  /**
   * 注册AI助手组件引用
   */
  registerAIAssistant(aiAssistantRef: any) {
    this.aiAssistantRef = aiAssistantRef;
    console.log('🎯 AI助手组件已注册到透明度管理器');
  }

  /**
   * 开始工作流透明状态（集成步骤队列）
   */
  startWorkflow(
    workflowId: string,
    options: WorkflowTransparencyOptions = {}
  ): boolean {
    const {
      duration = 30000, // 默认30秒
      opacity = 0.3,
      showIndicator = true,
      message = '🎯 工作流进行中...',
      createStepQueue = false,
      stepQueueTitle,
      stepQueueDescription,
      customSteps
    } = options;

    console.log(`🎯 开始工作流透明状态: ${workflowId}`, options);

    // 检查AI助手是否可用
    if (!this.aiAssistantRef) {
      console.warn('🎯 AI助手组件未注册，无法设置透明状态');
      return false;
    }

    // 检查是否为全屏模式
    if (!this.aiAssistantRef.isFullscreen?.value) {
      console.log('🎯 AI助手非全屏模式，跳过透明度设置');
      return false;
    }

    // 创建步骤队列（如果需要）
    if (createStepQueue) {
      const steps = customSteps || WORKFLOW_STEP_TEMPLATES.DATA_IMPORT;
      const title = stepQueueTitle || `🎯 ${workflowId}工作流`;
      const description = stepQueueDescription || '正在执行工作流操作，请稍候...';

      const queue = workflowStepManager.createQueue(workflowId, title, description, steps);
      workflowStepManager.startQueue(workflowId);
      this.stepQueueIds.set(workflowId, queue.id);

      console.log(`📋 创建工作流步骤队列: ${title}`, { steps: steps.length });
    }

    // 添加到活跃工作流列表
    this.activeWorkflows.add(workflowId);

    // 🎯 自动抑制页面感知（但不影响用户设置）
    pageAwarenessService.setWorkflowSuppressed(true);

    // 设置透明状态
    if (this.aiAssistantRef.setWorkflowTransparent) {
      this.aiAssistantRef.setWorkflowTransparent(true);
    }

    // 设置自动恢复定时器
    if (duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.endWorkflow(workflowId);
      }, duration);

      this.timeoutIds.set(workflowId, timeoutId);
    }

    // 发送全局事件
    this.emitWorkflowEvent('workflow-transparency-start', {
      workflowId,
      options,
      activeCount: this.activeWorkflows.size,
      hasStepQueue: createStepQueue
    });

    return true;
  }

  /**
   * 结束工作流透明状态
   */
  endWorkflow(workflowId: string): boolean {
    console.log(`🎯 结束工作流透明状态: ${workflowId}`);

    // 完成步骤队列（如果存在）
    const stepQueueId = this.stepQueueIds.get(workflowId);
    if (stepQueueId) {
      workflowStepManager.completeQueue(stepQueueId);
      this.stepQueueIds.delete(workflowId);
      console.log(`📋 完成工作流步骤队列: ${stepQueueId}`);
    }

    // 从活跃工作流列表中移除
    this.activeWorkflows.delete(workflowId);

    // 清除定时器
    const timeoutId = this.timeoutIds.get(workflowId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(workflowId);
    }

    // 🎯 恢复页面感知（如果没有其他活跃工作流）
    if (this.activeWorkflows.size === 0) {
      pageAwarenessService.setWorkflowSuppressed(false);
      console.log(`🎯 所有工作流结束，页面感知已恢复`);
    }

    // 如果没有其他活跃工作流，恢复正常状态
    if (this.activeWorkflows.size === 0) {
      if (this.aiAssistantRef?.setWorkflowTransparent) {
        this.aiAssistantRef.setWorkflowTransparent(false);
      }
    }

    // 发送全局事件
    this.emitWorkflowEvent('workflow-transparency-end', {
      workflowId,
      activeCount: this.activeWorkflows.size,
      hadStepQueue: !!stepQueueId
    });

    return true;
  }

  /**
   * 结束所有工作流
   */
  endAllWorkflows(): void {
    console.log('🎯 结束所有工作流透明状态');
    
    // 清除所有定时器
    this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutIds.clear();

    // 清空活跃工作流
    this.activeWorkflows.clear();

    // 恢复正常状态
    if (this.aiAssistantRef?.setWorkflowTransparent) {
      this.aiAssistantRef.setWorkflowTransparent(false);
    }

    // 发送全局事件
    this.emitWorkflowEvent('workflow-transparency-end-all', {
      activeCount: 0
    });
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    const stepQueues = Array.from(this.stepQueueIds.entries()).map(([workflowId, queueId]) => ({
      workflowId,
      queueId,
      queue: workflowStepManager.getQueue(queueId)
    }));

    return {
      isTransparent: this.activeWorkflows.size > 0,
      activeWorkflows: Array.from(this.activeWorkflows),
      activeCount: this.activeWorkflows.size,
      isFullscreen: this.aiAssistantRef?.isFullscreen?.value || false,
      hasAIAssistant: !!this.aiAssistantRef,
      stepQueues
    };
  }

  /**
   * 更新工作流步骤
   */
  updateWorkflowStep(
    workflowId: string,
    updates: { progress?: number; details?: string; description?: string }
  ): boolean {
    const stepQueueId = this.stepQueueIds.get(workflowId);
    if (!stepQueueId) return false;

    return workflowStepManager.updateCurrentStep(stepQueueId, updates);
  }

  /**
   * 开始下一个工作流步骤
   */
  startNextWorkflowStep(workflowId: string): any {
    const stepQueueId = this.stepQueueIds.get(workflowId);
    if (!stepQueueId) return null;

    return workflowStepManager.startNextStep(stepQueueId);
  }

  /**
   * 完成当前工作流步骤
   */
  completeCurrentWorkflowStep(workflowId: string): boolean {
    const stepQueueId = this.stepQueueIds.get(workflowId);
    if (!stepQueueId) return false;

    return workflowStepManager.completeCurrentStep(stepQueueId);
  }

  /**
   * 工作流步骤失败
   */
  failCurrentWorkflowStep(workflowId: string, error: string): boolean {
    const stepQueueId = this.stepQueueIds.get(workflowId);
    if (!stepQueueId) return false;

    return workflowStepManager.failCurrentStep(stepQueueId, error);
  }

  /**
   * 发送全局事件
   */
  private emitWorkflowEvent(eventName: string, detail: any) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * 监听工作流事件
   */
  static onWorkflowEvent(
    eventName: 'workflow-transparency-start' | 'workflow-transparency-end' | 'workflow-transparency-end-all',
    callback: (detail: any) => void
  ) {
    window.addEventListener(eventName, (event: any) => {
      callback(event.detail);
    });
  }

  /**
   * 移除工作流事件监听
   */
  static offWorkflowEvent(
    eventName: 'workflow-transparency-start' | 'workflow-transparency-end' | 'workflow-transparency-end-all',
    callback: (detail: any) => void
  ) {
    window.removeEventListener(eventName, callback);
  }
}

// 导出单例实例
export const workflowTransparency = WorkflowTransparencyManager.getInstance();

// 便捷方法
export const startWorkflowTransparency = (
  workflowId: string, 
  options?: WorkflowTransparencyOptions
) => {
  return workflowTransparency.startWorkflow(workflowId, options);
};

export const endWorkflowTransparency = (workflowId: string) => {
  return workflowTransparency.endWorkflow(workflowId);
};

export const endAllWorkflowTransparency = () => {
  workflowTransparency.endAllWorkflows();
};

// 数据导入工作流专用方法
export const startDataImportWorkflow = (step: string = 'general') => {
  return startWorkflowTransparency(`data-import-${step}`, {
    duration: 60000, // 数据导入可能需要更长时间
    message: '📊 数据导入工作流进行中...',
    createStepQueue: true,
    stepQueueTitle: '📊 数据导入工作流',
    stepQueueDescription: '正在执行数据导入操作，请稍候...'
  });
};

export const endDataImportWorkflow = (step: string = 'general') => {
  return endWorkflowTransparency(`data-import-${step}`);
};

// 数据导入步骤的便捷方法
export const dataImportSteps = {
  startPermissionCheck: (step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, { details: '正在验证用户权限...' });
  },

  startNavigation: (targetPage: string, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `正在导航到${targetPage}页面...`,
      progress: 50
    });
  },

  startFileParsing: (fileName: string, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `正在解析文件: ${fileName}...`,
      progress: 10
    });
  },

  updateFileParsingProgress: (progress: number, details?: string, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.updateWorkflowStep(workflowId, {
      progress,
      details: details || `文件解析进度: ${progress}%`
    });
  },

  startFieldMapping: (fieldCount: number, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `正在分析${fieldCount}个字段的映射关系...`,
      progress: 20
    });
  },

  startDataPreview: (recordCount: number, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `正在生成${recordCount}条记录的预览...`,
      progress: 30
    });
  },

  startDataValidation: (step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: '正在校验数据格式和完整性...',
      progress: 0
    });
  },

  updateValidationProgress: (progress: number, details?: string, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.updateWorkflowStep(workflowId, {
      progress,
      details: details || `数据校验进度: ${progress}%`
    });
  },

  startDataImport: (totalRecords: number, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `正在导入${totalRecords}条记录到数据库...`,
      progress: 0
    });
  },

  updateImportProgress: (imported: number, total: number, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    const progress = Math.round((imported / total) * 100);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `已导入${imported}/${total}条记录...`,
      progress
    });
  },

  completeImport: (successCount: number, failCount: number, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.completeCurrentWorkflowStep(workflowId);
    workflowTransparency.startNextWorkflowStep(workflowId);
    workflowTransparency.updateWorkflowStep(workflowId, {
      details: `导入完成！成功${successCount}条，失败${failCount}条`,
      progress: 100
    });

    // 2秒后自动完成整个工作流
    setTimeout(() => {
      endDataImportWorkflow(step);
    }, 2000);
  },

  fail: (error: string, step: string = 'general') => {
    const workflowId = `data-import-${step}`;
    workflowTransparency.failCurrentWorkflowStep(workflowId, error);
  }
};

// Vue 3 组合式API 支持
export const useWorkflowTransparency = () => {
  return {
    startWorkflow: startWorkflowTransparency,
    endWorkflow: endWorkflowTransparency,
    endAllWorkflows: endAllWorkflowTransparency,
    startDataImportWorkflow,
    endDataImportWorkflow,
    getStatus: () => workflowTransparency.getStatus(),
    onWorkflowEvent: WorkflowTransparencyManager.onWorkflowEvent,
    offWorkflowEvent: WorkflowTransparencyManager.offWorkflowEvent
  };
};
