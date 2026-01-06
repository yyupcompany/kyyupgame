/**
 * 并发任务管理器
 * 用于管理多个异步任务的并发执行、进度跟踪和结果聚合
 */

export interface Task<T> {
  id: string | number;
  name: string;
  execute: () => Promise<T>;
  retryCount?: number;
}

export interface TaskResult<T> {
  id: string | number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: T;
  error?: Error;
  startTime?: number;
  endTime?: number;
  duration?: number;
  retryCount?: number;
}

export interface ProgressInfo {
  total: number;
  completed: number;
  failed: number;
  running: number;
  pending: number;
  progress: number;
}

export interface TaskManagerOptions<T> {
  concurrency?: number;
  retryLimit?: number;
  retryDelay?: number;
  onProgress?: (progress: ProgressInfo) => void;
  onTaskStart?: (task: Task<T>) => void;
  onTaskComplete?: (result: TaskResult<T>) => void;
  onTaskFail?: (result: TaskResult<T>) => void;
  onAllComplete?: (results: TaskResult<T>[]) => void;
}

export class ConcurrentTaskManager<T> {
  private concurrency: number;
  private retryLimit: number;
  private retryDelay: number;
  private tasks: Task<T>[];
  private results: Map<string | number, TaskResult<T>>;
  private running: number = 0;
  private completed: number = 0;
  private failed: number = 0;
  
  private onProgress?: (progress: ProgressInfo) => void;
  private onTaskStart?: (task: Task<T>) => void;
  private onTaskComplete?: (result: TaskResult<T>) => void;
  private onTaskFail?: (result: TaskResult<T>) => void;
  private onAllComplete?: (results: TaskResult<T>[]) => void;
  
  constructor(options: TaskManagerOptions<T> = {}) {
    this.concurrency = options.concurrency || 3;
    this.retryLimit = options.retryLimit || 2;
    this.retryDelay = options.retryDelay || 1000;
    this.tasks = [];
    this.results = new Map();
    
    this.onProgress = options.onProgress;
    this.onTaskStart = options.onTaskStart;
    this.onTaskComplete = options.onTaskComplete;
    this.onTaskFail = options.onTaskFail;
    this.onAllComplete = options.onAllComplete;
  }
  
  /**
   * 添加单个任务
   */
  addTask(task: Task<T>): void {
    this.tasks.push({
      ...task,
      retryCount: 0
    });
    
    this.results.set(task.id, {
      id: task.id,
      name: task.name,
      status: 'pending',
      retryCount: 0
    });
  }
  
  /**
   * 批量添加任务
   */
  addTasks(tasks: Task<T>[]): void {
    tasks.forEach(task => this.addTask(task));
  }
  
  /**
   * 开始执行所有任务
   */
  async executeAll(): Promise<TaskResult<T>[]> {
    const total = this.tasks.length;
    
    if (total === 0) {
      return [];
    }
    
    const executing: Promise<void>[] = [];
    
    for (const task of this.tasks) {
      const promise = this.executeTask(task).then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });
      
      executing.push(promise);
      
      // 控制并发数量
      if (executing.length >= this.concurrency) {
        await Promise.race(executing);
      }
    }
    
    // 等待所有任务完成
    await Promise.all(executing);
    
    const results = Array.from(this.results.values());
    
    // 触发所有完成回调
    if (this.onAllComplete) {
      this.onAllComplete(results);
    }
    
    return results;
  }
  
  /**
   * 执行单个任务（带重试机制）
   */
  private async executeTask(task: Task<T>): Promise<void> {
    const result = this.results.get(task.id)!;
    let attempt = 0;
    
    while (attempt <= this.retryLimit) {
      try {
        // 更新状态为运行中
        result.status = 'running';
        result.startTime = Date.now();
        result.retryCount = attempt;
        this.running++;
        this.notifyProgress();
        
        // 触发任务开始回调
        if (this.onTaskStart && attempt === 0) {
          this.onTaskStart(task);
        }
        
        // 执行任务
        const data = await task.execute();
        
        // 更新结果
        result.status = 'completed';
        result.result = data;
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        this.running--;
        this.completed++;
        
        // 触发任务完成回调
        if (this.onTaskComplete) {
          this.onTaskComplete(result);
        }
        
        this.notifyProgress();
        return;
        
      } catch (error) {
        attempt++;
        
        // 如果还有重试机会，等待后重试
        if (attempt <= this.retryLimit) {
          console.warn(`任务 ${task.name} 执行失败，第 ${attempt} 次重试...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.running--;
          continue;
        }
        
        // 重试次数用尽，记录失败
        result.status = 'failed';
        result.error = error as Error;
        result.endTime = Date.now();
        result.duration = result.endTime - (result.startTime || 0);
        this.running--;
        this.failed++;
        
        console.error(`任务 ${task.name} 执行失败（已重试${this.retryLimit}次）:`, error);
        
        // 触发任务失败回调
        if (this.onTaskFail) {
          this.onTaskFail(result);
        }
        
        this.notifyProgress();
      }
    }
  }
  
  /**
   * 通知进度更新
   */
  private notifyProgress(): void {
    if (this.onProgress) {
      this.onProgress(this.getProgress());
    }
  }
  
  /**
   * 获取当前进度
   */
  getProgress(): ProgressInfo {
    return {
      total: this.tasks.length,
      completed: this.completed,
      failed: this.failed,
      running: this.running,
      pending: this.tasks.length - this.completed - this.failed - this.running,
      progress: this.tasks.length > 0 
        ? Math.round((this.completed + this.failed) / this.tasks.length * 100) 
        : 0
    };
  }
  
  /**
   * 获取所有结果
   */
  getResults(): TaskResult<T>[] {
    return Array.from(this.results.values());
  }
  
  /**
   * 获取成功的结果
   */
  getSuccessResults(): TaskResult<T>[] {
    return this.getResults().filter(r => r.status === 'completed');
  }
  
  /**
   * 获取失败的结果
   */
  getFailedResults(): TaskResult<T>[] {
    return this.getResults().filter(r => r.status === 'failed');
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const successResults = this.getSuccessResults();
    const totalDuration = successResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    const avgDuration = successResults.length > 0 
      ? Math.round(totalDuration / successResults.length) 
      : 0;
    
    return {
      total: this.tasks.length,
      completed: this.completed,
      failed: this.failed,
      running: this.running,
      pending: this.tasks.length - this.completed - this.failed - this.running,
      successRate: this.tasks.length > 0 
        ? Math.round(this.completed / this.tasks.length * 100) 
        : 0,
      avgDuration,
      totalDuration
    };
  }
  
  /**
   * 清空所有任务和结果
   */
  clear(): void {
    this.tasks = [];
    this.results.clear();
    this.running = 0;
    this.completed = 0;
    this.failed = 0;
  }
}

