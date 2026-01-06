/**
 * 提交表单工具
 */
import { ToolDefinition } from '../types/tool.types';

const submitFormTool: ToolDefinition = {
  name: 'submit_form',
  description: '提交表单',
  parameters: {
    type: 'object',
    properties: {
      formId: { type: 'string', description: '表单ID' }
    },
    required: ['formId']
  },
  async execute(params: any) {
    console.log('🔧 执行提交表单:', params);
    return { success: true };
  }
};

export default submitFormTool;

