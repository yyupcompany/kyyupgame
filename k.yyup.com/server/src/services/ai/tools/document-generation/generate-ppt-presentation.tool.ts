/**
 * 生成PPT演示文稿工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const generatePptPresentationTool: ToolDefinition = {
  name: 'generate_ppt_presentation',
  description: '生成PPT演示文稿',
  category: TOOL_CATEGORIES.GENERATION,
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '演示文稿标题' },
      slides: { type: 'array', description: '幻灯片内容' }
    },
    required: ['title', 'slides']
  },
  handler: async (params: any) => {
    console.log('🔧 执行生成PPT演示文稿:', params);
    return { fileUrl: '' };
  }
};

export default generatePptPresentationTool;

