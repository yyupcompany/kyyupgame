/**
 * AI模型相关类型定义
 */

export enum ModelType {
  TEXT = 'text',
  CHAT = 'chat',
  VISION = 'vision',
  AUDIO = 'audio',
  EMBEDDING = 'embedding'
}

export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export interface ModelConfig {
  name: string;
  displayName: string;
  provider: string;
  modelType: ModelType;
  endpointUrl: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  isDefault?: boolean;
}

export const TOOL_CATEGORIES = {
  QUERY: 'query',
  ACTION: 'action',
  ANALYSIS: 'analysis',
  GENERATION: 'generation',
  MANAGEMENT: 'management'
} as const;

export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES];

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  parameters: Record<string, any>;
  handler: Function;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

