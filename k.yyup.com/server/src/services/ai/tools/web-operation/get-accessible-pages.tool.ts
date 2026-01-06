/**
 * 获取可访问页面工具
 */
import { ToolDefinition } from '../types/tool.types';

const getAccessiblePagesTool: ToolDefinition = {
  name: 'get_accessible_pages',
  description: '获取用户可访问的页面列表',
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'number', description: '用户ID' }
    },
    required: ['userId']
  },
  async execute(params: any) {
    console.log('🔧 执行获取可访问页面:', params);
    return { pages: [] };
  }
};

export default getAccessiblePagesTool;

