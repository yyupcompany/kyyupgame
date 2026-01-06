/**
 * AI中间层模块导出
 */

// 导出基础类型和工具
export * from './base.middleware';

// 导出各个中间层
// import { aiMessageMiddleware } from './message.middleware'; // 暂时注释，等待API更新
import { aiConversationMiddleware } from './conversation.middleware';
// aiMemoryMiddleware removed - replaced by six-dimensional memory system
import { aiModelManagementMiddleware } from './model-management.middleware';
import { aiUserMiddleware } from './user.middleware';
import { aiAnalyticsAndFeedbackMiddleware } from './analytics-feedback.middleware';

// 导出默认实例
export {
  // aiMessageMiddleware, // 暂时注释，等待API更新
  aiConversationMiddleware,
  // aiMemoryMiddleware, // removed - replaced by six-dimensional memory system
  aiModelManagementMiddleware,
  aiUserMiddleware,
  aiAnalyticsAndFeedbackMiddleware
};

// 导出接口类型
export type { IAiModelManagementMiddleware } from './model-management.middleware';
export type { IAiConversationMiddleware } from './conversation.middleware';
// export type { IAiMessageMiddleware } from './message.middleware'; // 暂时注释，等待API更新
// export type { IAiMemoryMiddleware } from './memory.middleware'; // removed
export type { IAiUserMiddleware } from './user.middleware';
export type { IAiAnalyticsAndFeedbackMiddleware } from './analytics-feedback.middleware';

// 未来会添加更多中间层组件
// export { aiMemoryMiddleware } from './memory.middleware'; 