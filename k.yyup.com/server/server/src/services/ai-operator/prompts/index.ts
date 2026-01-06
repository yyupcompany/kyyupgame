/**
 * 提示词模板系统入口
 * 统一导出所有提示词模板
 */

// 基础提示词
export * from './base';

// 工具相关提示词
export * from './tools';

// 🆕 思考结构提示词
export * from './thinking';

// 🆕 完成判断提示词
export * from './completion';

// 🆕 Flash模型快速意图分析提示词
export * from './flash';

// 文档生成提示词（在PromptBuilderService中定义）
// 这里不需要导出，保持向后兼容

