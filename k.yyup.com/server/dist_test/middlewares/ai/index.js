"use strict";
/**
 * AI中间层模块导出
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.aiAnalyticsAndFeedbackMiddleware = exports.aiUserMiddleware = exports.aiModelManagementMiddleware = exports.aiConversationMiddleware = void 0;
// 导出基础类型和工具
__exportStar(require("./base.middleware"), exports);
// 导出各个中间层
// import { aiMessageMiddleware } from './message.middleware'; // 暂时注释，等待API更新
var conversation_middleware_1 = require("./conversation.middleware");
exports.aiConversationMiddleware = conversation_middleware_1.aiConversationMiddleware;
// aiMemoryMiddleware removed - replaced by six-dimensional memory system
var model_management_middleware_1 = require("./model-management.middleware");
exports.aiModelManagementMiddleware = model_management_middleware_1.aiModelManagementMiddleware;
var user_middleware_1 = require("./user.middleware");
exports.aiUserMiddleware = user_middleware_1.aiUserMiddleware;
var analytics_feedback_middleware_1 = require("./analytics-feedback.middleware");
exports.aiAnalyticsAndFeedbackMiddleware = analytics_feedback_middleware_1.aiAnalyticsAndFeedbackMiddleware;
// 未来会添加更多中间层组件
// export { aiMemoryMiddleware } from './memory.middleware'; 
