/**
 * 截屏工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const captureScreenTool: ToolDefinition = {
  name: 'capture_screen',
  description: '截取当前页面屏幕',
  category: TOOL_CATEGORIES.ACTION,
  parameters: {
    type: 'object',
    properties: {
      fullPage: { type: 'boolean', description: '是否截取整页' }
    }
  },
  handler: async (params: any) => {
    console.log('🔧 执行截屏:', params);
    return { imageUrl: '' };
  }
};

export default captureScreenTool;

