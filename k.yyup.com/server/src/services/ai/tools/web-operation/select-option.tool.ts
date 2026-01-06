/**
 * 选择选项工具
 */
import { ToolDefinition } from '../types/tool.types';

const selectOptionTool: ToolDefinition = {
  name: 'select_option',
  description: '在下拉框中选择选项',
  parameters: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: '下拉框选择器' },
      value: { type: 'string', description: '要选择的值' }
    },
    required: ['selector', 'value']
  },
  async execute(params: any) {
    console.log('🔧 执行选择选项:', params);
    return { success: true };
  }
};

export default selectOptionTool;

