/**
 * 返回上一页工具
 */
import { ToolDefinition } from '../types/tool.types';

const navigateBackTool: ToolDefinition = {
  name: 'navigate_back',
  description: '返回上一页',
  parameters: {
    type: 'object',
    properties: {}
  },
  async execute(params: any) {
    console.log('🔧 执行返回上一页');
    return { success: true };
  }
};

export default navigateBackTool;

