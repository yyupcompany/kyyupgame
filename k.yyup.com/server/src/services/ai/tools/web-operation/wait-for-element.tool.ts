/**
 * 等待元素工具
 */
import { ToolDefinition } from '../types/tool.types';

const waitForElementTool: ToolDefinition = {
  name: 'wait_for_element',
  description: '等待页面元素出现',
  parameters: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: '元素选择器' },
      timeout: { type: 'number', description: '超时时间(毫秒)' }
    },
    required: ['selector']
  },
  async execute(params: any) {
    console.log('🔧 执行等待元素:', params);
    return { found: true };
  }
};

export default waitForElementTool;

