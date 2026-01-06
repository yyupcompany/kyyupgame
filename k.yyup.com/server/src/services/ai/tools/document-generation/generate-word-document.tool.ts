/**
 * 生成Word文档工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const generateWordDocumentTool: ToolDefinition = {
  name: 'generate_word_document',
  description: '生成Word文档',
  category: TOOL_CATEGORIES.GENERATION,
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '文档标题' },
      content: { type: 'string', description: '文档内容' }
    },
    required: ['title', 'content']
  },
  handler: async (params: any) => {
    console.log('🔧 执行生成Word文档:', params);
    return { fileUrl: '' };
  }
};

export default generateWordDocumentTool;

