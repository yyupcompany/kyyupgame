/**
 * 文件删除队列管理器
 * 使用内存队列和互斥锁，避免文件删除时的IO锁冲突
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 删除任务接口
 */
interface DeletionTask {
  id: string;
  filePath: string;
  retryCount: number;
  maxRetries: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

/**
 * 文件删除队列管理器
 */
export class FileDeletionQueue {
  private queue: DeletionTask[] = [];
  private processing: boolean = false;
  private locks: Set<string> = new Set(); // 文件路径锁
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 100; // 重试延迟（毫秒）

  /**
   * 添加文件删除任务到队列
   * @param filePath - 要删除的文件路径
   * @returns Promise<void>
   */
  async deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const taskId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const task: DeletionTask = {
        id: taskId,
        filePath: path.resolve(filePath),
        retryCount: 0,
        maxRetries: this.maxRetries,
        resolve,
        reject,
      };

      this.queue.push(task);
      console.log(`📋 [文件删除队列] 添加任务: ${path.basename(filePath)} (队列长度: ${this.queue.length})`);

      // 如果队列没有在处理，启动处理
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * 批量删除文件
   * @param filePaths - 要删除的文件路径数组
   * @returns Promise<void>
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    const tasks = filePaths.map(filePath => this.deleteFile(filePath));
    await Promise.all(tasks);
  }

  /**
   * 删除目录下匹配模式的所有文件
   * @param directory - 目录路径
   * @param pattern - 文件名匹配模式（正则表达式或字符串前缀）
   * @returns Promise<number> - 删除的文件数量
   */
  async deleteFilesByPattern(directory: string, pattern: string | RegExp): Promise<number> {
    try {
      if (!fs.existsSync(directory)) {
        console.log(`📁 [文件删除队列] 目录不存在: ${directory}`);
        return 0;
      }

      const files = fs.readdirSync(directory);
      const matchedFiles: string[] = [];

      for (const file of files) {
        const matches = typeof pattern === 'string' 
          ? file.startsWith(pattern)
          : pattern.test(file);

        if (matches) {
          matchedFiles.push(path.join(directory, file));
        }
      }

      if (matchedFiles.length === 0) {
        console.log(`📁 [文件删除队列] 没有匹配的文件: ${pattern}`);
        return 0;
      }

      console.log(`📁 [文件删除队列] 找到 ${matchedFiles.length} 个匹配文件`);
      await this.deleteFiles(matchedFiles);

      return matchedFiles.length;
    } catch (error: any) {
      console.error(`❌ [文件删除队列] 批量删除失败:`, error.message);
      throw error;
    }
  }

  /**
   * 处理删除队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;
    console.log(`🔄 [文件删除队列] 开始处理队列 (${this.queue.length} 个任务)`);

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      await this.executeTask(task);
    }

    this.processing = false;
    console.log(`✅ [文件删除队列] 队列处理完成`);
  }

  /**
   * 执行删除任务
   */
  private async executeTask(task: DeletionTask): Promise<void> {
    const { filePath, id } = task;

    // 检查文件锁
    if (this.locks.has(filePath)) {
      console.log(`🔒 [文件删除队列] 文件被锁定，重新入队: ${path.basename(filePath)}`);
      this.queue.push(task);
      await this.sleep(this.retryDelay);
      return;
    }

    // 加锁
    this.locks.add(filePath);

    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️ [文件删除队列] 文件不存在，跳过: ${path.basename(filePath)}`);
        task.resolve();
        return;
      }

      // 尝试删除文件
      await this.tryDeleteFile(filePath);
      
      console.log(`✅ [文件删除队列] 删除成功: ${path.basename(filePath)}`);
      task.resolve();

    } catch (error: any) {
      console.error(`❌ [文件删除队列] 删除失败: ${path.basename(filePath)}`, error.message);

      // 重试逻辑
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        console.log(`🔄 [文件删除队列] 重试 ${task.retryCount}/${task.maxRetries}: ${path.basename(filePath)}`);
        
        // 重新入队
        this.queue.push(task);
        await this.sleep(this.retryDelay * task.retryCount); // 指数退避
      } else {
        console.error(`❌ [文件删除队列] 达到最大重试次数，放弃: ${path.basename(filePath)}`);
        task.reject(new Error(`文件删除失败: ${error.message}`));
      }
    } finally {
      // 解锁
      this.locks.delete(filePath);
    }
  }

  /**
   * 尝试删除文件（带超时）
   */
  private async tryDeleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        reject(new Error('删除操作超时'));
      }, 5000); // 5秒超时

      try {
        // 同步删除（更可靠）
        fs.unlinkSync(filePath);
        clearTimeout(timeout);
        resolve();
      } catch (error: any) {
        clearTimeout(timeout);
        
        // 特殊处理EBUSY错误（文件被占用）
        if (error.code === 'EBUSY' || error.code === 'EPERM') {
          reject(new Error(`文件被占用: ${error.code}`));
        } else if (error.code === 'ENOENT') {
          // 文件不存在，视为成功
          resolve();
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    queueLength: number;
    processing: boolean;
    lockedFiles: number;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lockedFiles: this.locks.size,
    };
  }

  /**
   * 清空队列（不推荐使用，除非紧急情况）
   */
  clearQueue(): void {
    console.warn(`⚠️ [文件删除队列] 清空队列 (${this.queue.length} 个任务被取消)`);
    
    // 拒绝所有待处理任务
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task.reject(new Error('队列被清空'));
      }
    }

    this.locks.clear();
    this.processing = false;
  }
}

// 创建全局单例
export const fileDeletionQueue = new FileDeletionQueue();

