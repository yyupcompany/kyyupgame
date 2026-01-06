/**
 * 输入文本工具
 */
import { ToolDefinition } from '../types/tool.types';

const typeTextTool: ToolDefinition = {
  name: 'type_text',
  description: '在输入框中输入文本',
  parameters: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: '输入框选择器' },
      text: { type: 'string', description: '要输入的文本' }
    },
    required: ['selector', 'text']
  },
  async execute(params: any) {
    console.log('🔧 执行输入文本:', params);
    return { success: true };
  }
};

export default typeTextTool;

