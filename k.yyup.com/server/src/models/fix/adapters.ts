import { TodoFix, TodoStatus, TodoPriority } from './todo.model.fix';
import { ScheduleFix, ScheduleFrequency, ScheduleStatus } from './schedule.model.fix';
import { NotificationFix, NotificationType, NotificationStatus } from './notification.model.fix';
import { SystemLogFix, LogLevel, LogModule } from './system-log.model.fix';

/**
 * 模型适配器 - 帮助新旧模型之间的数据转换
 */
export class ModelAdapters {
  /**
   * 将原始Todo数据转换为修复模型格式
   */
  static convertToTodoFix(originalTodo: any): Partial<TodoFix> {
    return {
      id: originalTodo.id,
      title: originalTodo.title,
      description: originalTodo.description,
      priority: originalTodo.priority || TodoPriority.MEDIUM,
      status: originalTodo.status || TodoStatus.PENDING,
      dueDate: originalTodo.dueDate,
      userId: originalTodo.userId,
      createdAt: originalTodo.createdAt,
      updatedAt: originalTodo.updatedAt,
      completedAt: originalTodo.completedAt
    };
  }

  /**
   * 将原始Schedule数据转换为修复模型格式
   */
  static convertToScheduleFix(originalSchedule: any): Partial<ScheduleFix> {
    return {
      id: originalSchedule.id,
      title: originalSchedule.title,
      description: originalSchedule.description,
      startTime: originalSchedule.startTime,
      endTime: originalSchedule.endTime,
      location: originalSchedule.location,
      // 适配字段变更
      frequency: originalSchedule.type === 'RECURRING' ? 
        ScheduleFrequency.WEEKLY : ScheduleFrequency.ONCE,
      status: originalSchedule.status ? 
        originalSchedule.status as ScheduleStatus : ScheduleStatus.PENDING,
      userId: originalSchedule.userId,
      createdAt: originalSchedule.createdAt,
      updatedAt: originalSchedule.updatedAt
    };
  }

  /**
   * 将原始Notification数据转换为修复模型格式
   */
  static convertToNotificationFix(originalNotification: any): Partial<NotificationFix> {
    return {
      id: originalNotification.id,
      title: originalNotification.title,
      content: originalNotification.content,
      type: this.mapNotificationType(originalNotification),
      status: this.mapNotificationStatus(originalNotification),
      userId: originalNotification.senderId, // 字段变更适配
      sourceId: originalNotification.id, // 可选关联ID
      sourceType: originalNotification.type, // 可选关联类型
      createdAt: originalNotification.createdAt,
      updatedAt: originalNotification.updatedAt,
      readAt: originalNotification.status === 'SENT' ? new Date() : null
    };
  }

  /**
   * 将原始SystemLog数据转换为修复模型格式
   */
  static convertToSystemLogFix(originalLog: any): Partial<SystemLogFix> {
    return {
      id: originalLog.id,
      level: this.mapLogLevel(originalLog.level),
      module: this.mapLogModule(originalLog.module),
      action: originalLog.action,
      message: originalLog.message,
      details: originalLog.details,
      ipAddress: originalLog.ipAddress,
      userId: originalLog.userId,
      userAgent: originalLog.userAgent,
      duration: originalLog.executionTime,
      createdAt: originalLog.createdAt
    };
  }

  /**
   * 辅助方法：映射通知类型
   */
  private static mapNotificationType(originalNotification: any): NotificationType {
    // 简单映射示例
    if (originalNotification.type?.includes('ACTIVITY')) {
      return NotificationType.ACTIVITY;
    } else if (originalNotification.type?.includes('SCHEDULE')) {
      return NotificationType.SCHEDULE;
    } else if (originalNotification.type?.includes('MESSAGE')) {
      return NotificationType.MESSAGE;
    } else {
      return NotificationType.SYSTEM;
    }
  }

  /**
   * 辅助方法：映射通知状态
   */
  private static mapNotificationStatus(originalNotification: any): NotificationStatus {
    if (originalNotification.status === 'DRAFT') {
      return NotificationStatus.UNREAD;
    } else if (originalNotification.status === 'CANCELLED') {
      return NotificationStatus.DELETED;
    } else {
      return NotificationStatus.READ;
    }
  }

  /**
   * 辅助方法：映射日志级别
   */
  private static mapLogLevel(originalLevel: string): LogLevel {
    if (originalLevel === 'WARNING') return LogLevel.WARN;
    if (originalLevel === 'ERROR') return LogLevel.ERROR;
    if (originalLevel === 'CRITICAL') return LogLevel.CRITICAL;
    return LogLevel.INFO;
  }

  /**
   * 辅助方法：映射日志模块
   */
  private static mapLogModule(originalModule: string): LogModule {
    const moduleMap: {[key: string]: LogModule} = {
      'auth': LogModule.AUTH,
      'user': LogModule.USER,
      'activity': LogModule.ACTIVITY,
      'enrollment': LogModule.ENROLLMENT,
      'marketing': LogModule.MARKETING,
      'system': LogModule.SYSTEM,
      'api': LogModule.API
    };

    const lowerModule = originalModule?.toLowerCase() || '';
    for (const key of Object.keys(moduleMap)) {
      if (lowerModule.includes(key)) {
        return moduleMap[key];
      }
    }

    return LogModule.OTHER;
  }
}

// 导出适配器
export default ModelAdapters; 