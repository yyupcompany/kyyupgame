/**
 * 渲染组件工具
 */
import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';

const renderComponentTool: ToolDefinition = {
  name: 'render_component',
  description: '渲染UI组件，将数据转换为可视化的前端组件（TODO列表、图表、表格等）',
  category: TOOL_CATEGORIES.ACTION,
  parameters: {
    type: 'object',
    properties: {
      component_type: { 
        type: 'string', 
        description: '组件类型: todo-list, chart, table, stat-card',
        enum: ['todo-list', 'chart', 'table', 'stat-card']
      },
      title: { 
        type: 'string', 
        description: '组件标题' 
      },
      data: { 
        type: 'array', 
        description: '组件数据列表' 
      },
      chart_type: { 
        type: 'string', 
        description: '图表类型（当component_type为chart时必填）: bar, line, pie',
        enum: ['bar', 'line', 'pie']
      }
    },
    required: ['component_type', 'data']
  },
  handler: async (params: any) => {
    console.log('📝 [组件渲染工具] 执行渲染组件:', params);
    
    const { component_type, title, data, chart_type } = params;
    
    // 构建组件数据对象
    const componentData: any = {
      type: component_type,
      title: title || '智能组件',
      data: data || []
    };
    
    // 如果是图表组件，添加图表类型
    if (component_type === 'chart' && chart_type) {
      componentData.chart_type = chart_type;
    }
    
    console.log('✅ [组件渲染工具] 组件数据生成成功:', componentData);
    
    return {
      success: true,
      componentData: componentData,
      renderInfo: {
        type: component_type,
        interactive: component_type === 'todo-list',
        animated: true
      }
    };
  }
};

export default renderComponentTool;

