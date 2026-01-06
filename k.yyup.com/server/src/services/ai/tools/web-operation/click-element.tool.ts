/**
 * 点击元素工具
 */
import { ToolDefinition } from '../types/tool.types';

const clickElementTool: ToolDefinition = {
  name: 'click_element',
  description: '点击页面元素',
  parameters: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: '元素选择器' }
    },
    required: ['selector']
  },
  async execute(params: any) {
    console.log('🔧 执行点击元素:', params);
    return { success: true };
  }
};

export default clickElementTool;

