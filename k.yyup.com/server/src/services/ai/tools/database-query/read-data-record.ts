/**
 * 读取数据记录工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const readDataRecordTool: ToolDefinition = {
  name: 'read_data_record',
  description: '读取数据库记录',
  category: TOOL_CATEGORIES.QUERY,
  parameters: {
    type: 'object',
    properties: {
      table: { type: 'string', description: '表名' },
      id: { type: 'number', description: '记录ID' }
    },
    required: ['table', 'id']
  },
  handler: async (params: any) => {
    console.log('🔧 执行读取数据记录:', params);
    return { record: null };
  }
};

export default readDataRecordTool;

