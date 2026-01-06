/**
 * AI服务模块索引
 * 导出所有AI相关服务
 */

// 统一AI Bridge服务（推荐使用）
export { unifiedAIBridge, UnifiedAIBridgeService } from '../unified-ai-bridge.service';

// 保留本地Bridge导出以兼容旧代码
export { aiBridgeService } from './bridge/ai-bridge.service';
export * from './bridge/ai-bridge.types';

// 文本模型服务
export { textModelService, MessageRole } from './text-model.service';
export type { Message, TextGenerationOptions, TextGenerationResult } from './text-model.service';

// 模型选择器
export { modelSelectorService } from './model-selector.service';

// 对话服务
export { conversationService } from './conversation.service';
// 别名导出
export { conversationService as aiConversationService } from './conversation.service';

// 消息服务
export { messageService } from './message.service';
export { messageService as aiMessageService } from './message.service';

// 反馈服务
export { feedbackService } from './feedback.service';

// 模型服务
export { modelService } from './model.service';

// 多模态服务
export { multimodalService } from './multimodal.service';

// 专家咨询服务
export { expertConsultationService } from './expert-consultation.service';

// 分析服务
export { aiAnalyticsService } from './ai-analytics.service';

// 智能分配服务
export { smartAssignService } from './smart-assign.service';

// 工具相关
export { toolLoaderService, ToolLoaderService } from './tools/core/tool-loader.service';
export * from './tools/tool-description.util';
export * from './tools/tool-description-generator.service';

// 直接响应服务
export { directResponseService } from './direct-response.service';

// 查询路由服务
export { queryRouterService, ProcessingLevel } from './query-router.service';

// 语义搜索服务
export { semanticSearchService } from './semantic-search.service';

// 复杂度评估服务
export { complexityEvaluatorService } from './complexity-evaluator.service';

// 动态上下文服务
export { dynamicContextService } from './dynamic-context.service';

// 向量索引服务
export { vectorIndexService } from './vector-index.service';

// 工具管理器
export { toolManagerService, Tool } from './tools/core/tool-manager.service';

// 配额服务
export { quotaService } from './quota.service';

// 文档导入服务
export { documentImportService } from './document-import.service';

// 跟进分析服务
export { followupAnalysisService } from './followup-analysis.service';

// PDF报告服务
export { pdfReportService } from './pdf-report.service';

// AI缓存服务
export { aiCacheService } from './ai-cache.service';

