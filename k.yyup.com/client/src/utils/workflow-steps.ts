/**
 * 🎯 工作流步骤管理系统
 * 提供实时的工作流步骤追踪和用户反馈
 */

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  progress?: number; // 0-100
  details?: string;
  estimatedDuration?: number; // 预计耗时（毫秒）
  actualDuration?: number; // 实际耗时（毫秒）
  error?: string;
}

export interface WorkflowStepQueue {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  totalEstimatedDuration?: number;
  totalActualDuration?: number;
}

export class WorkflowStepManager {
  private queues: Map<string, WorkflowStepQueue> = new Map();
  private listeners: Map<string, ((queue: WorkflowStepQueue) => void)[]> = new Map();

  /**
   * 创建新的工作流队列
   */
  createQueue(
    queueId: string,
    title: string,
    description: string,
    steps: Omit<WorkflowStep, 'status'>[]
  ): WorkflowStepQueue {
    const queue: WorkflowStepQueue = {
      id: queueId,
      title,
      description,
      steps: steps.map(step => ({ ...step, status: 'pending' as const })),
      currentStepIndex: -1,
      status: 'idle',
      totalEstimatedDuration: steps.reduce((sum, step) => sum + (step.estimatedDuration || 5000), 0)
    };

    this.queues.set(queueId, queue);
    this.notifyListeners(queueId, queue);

    console.log(`🎯 创建工作流队列: ${title}`, { steps: steps.length, estimatedDuration: queue.totalEstimatedDuration });
    return queue;
  }
  /**
   * 向工作流追加步骤（支持运行中/未开始）
   * 兼容未提供标题/描述/ID的情况：
   * - title 缺省时优先取 name，再退回 '未命名步骤'
   * - description 缺省时使用 action 或空字符串
   * - id 缺省时自动生成
   */
  addStep(
    queueId: string,
    step: Omit<WorkflowStep, 'status'> & Partial<{ name: string; action: string }>,
    insertIndex?: number
  ): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;
    if (queue.status === 'completed' || queue.status === 'cancelled') return false;

    const normalizedId = (step as any).id || `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const normalizedTitle = (step as any).title || (step as any).name || '未命名步骤';
    const normalizedDesc = (step as any).description || (step as any).action || '';

    const newStep: WorkflowStep = {
      id: normalizedId,
      title: normalizedTitle,
      description: normalizedDesc,
      status: 'pending',
      startTime: undefined,
      endTime: undefined,
      progress: undefined,
      estimatedDuration: (step as any).estimatedDuration,
      actualDuration: undefined,
      error: undefined
    };

    if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= queue.steps.length) {
      queue.steps.splice(insertIndex, 0, newStep);
      // 如果在当前步骤之前插入，维护索引不指向错误的步骤
      if (queue.currentStepIndex >= insertIndex) {
        queue.currentStepIndex += 1;
      }
    } else {
      queue.steps.push(newStep);
    }

    // 更新总预计耗时
    const estimated = newStep.estimatedDuration || 5000;
    queue.totalEstimatedDuration = (queue.totalEstimatedDuration || 0) + estimated;

    this.notifyListeners(queueId, queue);
    console.log(`🧩 追加工作流步骤: ${newStep.title}`, { insertIndex, totalSteps: queue.steps.length });
    return true;
  }


  /**
   * 开始工作流
   */
  startQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status === 'running') return false;

    queue.status = 'running';
    queue.startTime = new Date();
    queue.currentStepIndex = -1;

    this.notifyListeners(queueId, queue);
    console.log(`🚀 开始工作流: ${queue.title}`);
    return true;
  }

  /**
   * 开始下一个步骤
   */
  startNextStep(queueId: string): WorkflowStep | null {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status !== 'running') return null;

    // 完成当前步骤
    if (queue.currentStepIndex >= 0) {
      this.completeCurrentStep(queueId);
    }

    // 开始下一个步骤
    queue.currentStepIndex++;
    if (queue.currentStepIndex >= queue.steps.length) {
      this.completeQueue(queueId);
      return null;
    }

    const step = queue.steps[queue.currentStepIndex];
    step.status = 'running';
    step.startTime = new Date();
    step.progress = 0;

    this.notifyListeners(queueId, queue);
    console.log(`🔄 开始步骤: ${step.title}`, step);
    return step;
  }

  /**
   * 更新当前步骤
   */
  updateCurrentStep(
    queueId: string,
    updates: { progress?: number; details?: string; description?: string }
  ): boolean {
    const queue = this.queues.get(queueId);
    if (!queue || queue.currentStepIndex < 0) return false;

    const step = queue.steps[queue.currentStepIndex];
    if (step.status !== 'running') return false;

    if (updates.progress !== undefined) {
      step.progress = Math.max(0, Math.min(100, updates.progress));
    }
    if (updates.details !== undefined) {
      step.details = updates.details;
    }
    if (updates.description !== undefined) {
      step.description = updates.description;
    }

    this.notifyListeners(queueId, queue);
    return true;
  }

  /**
   * 完成当前步骤
   */
  completeCurrentStep(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue || queue.currentStepIndex < 0) return false;

    const step = queue.steps[queue.currentStepIndex];
    step.status = 'completed';
    step.endTime = new Date();
    step.progress = 100;

    if (step.startTime) {
      step.actualDuration = step.endTime.getTime() - step.startTime.getTime();
    }

    this.notifyListeners(queueId, queue);
    console.log(`✅ 完成步骤: ${step.title}`, { duration: step.actualDuration });
    return true;
  }

  /**
   * 步骤失败
   */
  failCurrentStep(queueId: string, error: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue || queue.currentStepIndex < 0) return false;

    const step = queue.steps[queue.currentStepIndex];
    step.status = 'failed';
    step.endTime = new Date();
    step.error = error;

    if (step.startTime) {
      step.actualDuration = step.endTime.getTime() - step.startTime.getTime();
    }

    queue.status = 'failed';
    queue.endTime = new Date();

    this.notifyListeners(queueId, queue);
    console.error(`❌ 步骤失败: ${step.title}`, error);
    return true;
  }

  /**
   * 完成整个工作流
   */
  completeQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    queue.status = 'completed';
    queue.endTime = new Date();

    if (queue.startTime) {
      queue.totalActualDuration = queue.endTime.getTime() - queue.startTime.getTime();
    }

    this.notifyListeners(queueId, queue);
    console.log(`🎉 工作流完成: ${queue.title}`, {
      duration: queue.totalActualDuration,
      steps: queue.steps.length
    });
    return true;
  }

  /**
   * 取消工作流
   */
  cancelQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    queue.status = 'cancelled';
    queue.endTime = new Date();

    // 取消当前运行的步骤
    if (queue.currentStepIndex >= 0) {
      const step = queue.steps[queue.currentStepIndex];
      if (step.status === 'running') {
        step.status = 'skipped';
        step.endTime = new Date();
      }
    }

    this.notifyListeners(queueId, queue);
    console.log(`🚫 工作流已取消: ${queue.title}`);
    return true;
  }

  /**
   * 获取工作流队列
   */
  getQueue(queueId: string): WorkflowStepQueue | undefined {
    return this.queues.get(queueId);
  }

  /**
   * 获取所有活跃的工作流
   */
  getActiveQueues(): WorkflowStepQueue[] {
    return Array.from(this.queues.values()).filter(
      queue => queue.status === 'running'
    );
  }

  /**
   * 计算剩余时间
   */
  getEstimatedRemainingTime(queueId: string): number {
    const queue = this.queues.get(queueId);
    if (!queue || queue.status !== 'running') return 0;

    let remainingTime = 0;
    for (let i = queue.currentStepIndex + 1; i < queue.steps.length; i++) {
      remainingTime += queue.steps[i].estimatedDuration || 5000;
    }

    // 加上当前步骤的剩余时间
    if (queue.currentStepIndex >= 0) {
      const currentStep = queue.steps[queue.currentStepIndex];
      const elapsed = currentStep.startTime ?
        Date.now() - currentStep.startTime.getTime() : 0;
      const estimated = currentStep.estimatedDuration || 5000;
      remainingTime += Math.max(0, estimated - elapsed);
    }

    return remainingTime;
  }

  /**
   * 监听工作流变化
   */
  onQueueChange(queueId: string, callback: (queue: WorkflowStepQueue) => void): () => void {
    if (!this.listeners.has(queueId)) {
      this.listeners.set(queueId, []);
    }
    this.listeners.get(queueId)!.push(callback);

    // 返回取消监听的函数
    return () => {
      const callbacks = this.listeners.get(queueId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(queueId: string, queue: WorkflowStepQueue): void {
    const callbacks = this.listeners.get(queueId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(queue);
        } catch (error) {
          console.error('工作流监听器错误:', error);
        }
      });
    }
  }

  /**
   * 清理已完成的工作流
   */
  cleanup(maxAge: number = 300000): void { // 默认5分钟
    const now = Date.now();
    for (const [queueId, queue] of this.queues.entries()) {
      if (queue.endTime && (now - queue.endTime.getTime()) > maxAge) {
        this.queues.delete(queueId);
        this.listeners.delete(queueId);
        console.log(`🧹 清理过期工作流: ${queue.title}`);
      }
    }
  }
}

// 导出单例实例
export const workflowStepManager = new WorkflowStepManager();

// 预定义的工作流步骤模板
export const WORKFLOW_STEP_TEMPLATES = {
  DATA_IMPORT: [
    {
      id: 'permission',
      title: '权限验证',
      description: '检查用户数据导入权限',
      estimatedDuration: 2000
    },
    {
      id: 'navigation',
      title: '页面导航',
      description: '导航到数据管理页面',
      estimatedDuration: 3000
    },
    {
      id: 'file-parse',
      title: '文件解析',
      description: '解析上传的数据文件',
      estimatedDuration: 8000
    },
    {
      id: 'field-mapping',
      title: '字段映射',
      description: '匹配文档字段与数据库字段',
      estimatedDuration: 5000
    },
    {
      id: 'data-preview',
      title: '数据预览',
      description: '预览待导入的数据',
      estimatedDuration: 3000
    },
    {
      id: 'data-validation',
      title: '数据校验',
      description: '验证数据格式和完整性',
      estimatedDuration: 10000
    },
    {
      id: 'data-import',
      title: '执行导入',
      description: '批量插入数据到数据库',
      estimatedDuration: 15000
    },
    {
      id: 'completion',
      title: '导入完成',
      description: '显示导入结果和统计信息',
      estimatedDuration: 2000
    }
  ]
};
