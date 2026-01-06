/**
 * 工具类型定义
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: any) => Promise<any>;
  timeout?: number;
  retryable?: boolean;
  critical?: boolean;
  implementation?: (params: any) => Promise<any>;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  // 状态字段
  status?: string;
  // 缺少必填字段相关
  user_prompt_required?: boolean;
  missing_fields?: any;
  ai_response_template?: string;
  // 用户确认相关
  confirmation_required?: boolean;
  confirmation_data?: any;
  // 下一步操作相关
  nextStep?: string;
  autoSelect?: boolean;
}

export interface ToolContext {
  userId?: number;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export default ToolDefinition;

