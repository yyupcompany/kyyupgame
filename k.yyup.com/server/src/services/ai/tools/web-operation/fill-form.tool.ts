/**
 * 填充表单工具
 */
import { ToolDefinition } from '../types/tool.types';

const fillFormTool: ToolDefinition = {
  name: 'fill_form',
  description: '填充表单字段',
  parameters: {
    type: 'object',
    properties: {
      formId: { type: 'string', description: '表单ID' },
      fields: { type: 'object', description: '字段值' }
    },
    required: ['formId', 'fields']
  },
  async execute(params: any) {
    console.log('🔧 执行填充表单:', params);
    return { success: true };
  }
};

export default fillFormTool;

