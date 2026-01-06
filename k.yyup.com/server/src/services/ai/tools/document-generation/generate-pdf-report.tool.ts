/**
 * 生成PDF报告工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const generatePdfReportTool: ToolDefinition = {
  name: 'generate_pdf_report',
  description: '生成PDF报告',
  category: TOOL_CATEGORIES.GENERATION,
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '报告标题' },
      content: { type: 'object', description: '报告内容' }
    },
    required: ['title', 'content']
  },
  handler: async (params: any) => {
    console.log('🔧 执行生成PDF报告:', params);
    return { fileUrl: '' };
  }
};

export default generatePdfReportTool;

