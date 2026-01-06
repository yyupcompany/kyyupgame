/**
 * 页面导航工具
 */
import { ToolDefinition } from '../types/tool.types';

const navigateToPageTool: ToolDefinition = {
  name: 'navigate_to_page',
  description: '导航到指定页面',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: '页面路径' }
    },
    required: ['path']
  },
  async execute(params: any) {
    console.log('🔧 执行页面导航:', params);
    return { success: true, path: params.path };
  }
};

export default navigateToPageTool;

