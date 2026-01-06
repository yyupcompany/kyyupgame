/**
 * 生成Excel报告工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const generateExcelReportTool: ToolDefinition = {
  name: 'generate_excel_report',
  description: '生成Excel报告',
  category: TOOL_CATEGORIES.GENERATION,
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '报告标题' },
      data: { type: 'array', description: '报告数据' }
    },
    required: ['title', 'data']
  },
  handler: async (params: any) => {
    console.log('🔧 执行生成Excel报告:', params);
    return { fileUrl: '' };
  }
};

export default generateExcelReportTool;

