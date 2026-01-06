/**
 * 工具名称映射和本地化
 * 用于将后端工具名称转换为用户友好的显示名称
 */

export interface ToolNameMapping {
  [key: string]: {
    displayName: string;
    description: string;
    category?: string;
  };
}

const toolNameMappings: ToolNameMapping = {
  // 数据库查询工具
  query_past_activities: {
    displayName: '查询历史活动',
    description: '查询历史活动数据，支持按类型、时间范围等条件筛选',
    category: '数据查询'
  },
  get_activity_statistics: {
    displayName: '获取活动统计',
    description: '获取活动统计信息，包括参与人数、成功率等',
    category: '数据查询'
  },
  query_enrollment_history: {
    displayName: '查询招生历史',
    description: '查询历史招生数据',
    category: '数据查询'
  },
  analyze_business_trends: {
    displayName: '分析业务趋势',
    description: '分析业务数据趋势',
    category: '数据分析'
  },
  any_query: {
    displayName: '智能查询',
    description: '智能理解用户查询意图，自动选择最佳查询方式',
    category: '智能查询'
  },

  // 页面操作工具
  navigate_to_page: {
    displayName: '导航到页面',
    description: '导航到指定页面',
    category: '页面操作'
  },
  fill_form: {
    displayName: '填写表单',
    description: '自动填写表单字段',
    category: '页面操作'
  },
  click_button: {
    displayName: '点击按钮',
    description: '点击页面上的按钮',
    category: '页面操作'
  },
  select_option: {
    displayName: '选择选项',
    description: '在下拉框中选择选项',
    category: '页面操作'
  },
  type_text: {
    displayName: '输入文本',
    description: '在输入框中输入文本',
    category: '页面操作'
  },

  // UI显示工具
  render_component: {
    displayName: '渲染组件',
    description: '动态渲染UI组件',
    category: 'UI显示'
  },
  show_chart: {
    displayName: '显示图表',
    description: '显示数据图表',
    category: 'UI显示'
  },
  show_table: {
    displayName: '显示表格',
    description: '显示数据表格',
    category: 'UI显示'
  },

  // 任务管理工具
  analyze_task_complexity: {
    displayName: '任务复杂度分析',
    description: '分析任务复杂度，判断是否需要创建TodoList进行任务分解',
    category: '任务管理'
  },
  create_todo_list: {
    displayName: '创建待办清单',
    description: '创建任务待办清单',
    category: '任务管理'
  },
  update_todo_task: {
    displayName: '更新待办任务',
    description: '更新待办任务状态',
    category: '任务管理'
  },
  get_todo_list: {
    displayName: '获取待办清单',
    description: '获取当前待办清单',
    category: '任务管理'
  },
  delete_todo_task: {
    displayName: '删除待办任务',
    description: '删除指定的待办任务',
    category: '任务管理'
  },

  // 工作流工具
  execute_activity_workflow: {
    displayName: '执行活动工作流',
    description: '执行完整的活动创建工作流',
    category: '工作流'
  },

  // Web操作工具
  web_search: {
    displayName: '网络搜索',
    description: '搜索网络信息',
    category: 'Web操作'
  },
  capture_screen: {
    displayName: '截图',
    description: '捕获屏幕截图',
    category: 'Web操作'
  },
  console_monitor: {
    displayName: '控制台监控',
    description: '监控浏览器控制台',
    category: 'Web操作'
  },
  wait_for_condition: {
    displayName: '等待条件',
    description: '等待特定条件满足',
    category: 'Web操作'
  },

  // 数据库查询工具（新增）
  read_data_record: {
    displayName: '读取数据记录',
    description: '读取数据库中的数据记录',
    category: '数据查询'
  },
  read_records: {
    displayName: '读取记录',
    description: '读取多条数据记录',
    category: '数据查询'
  },
  search_data: {
    displayName: '搜索数据',
    description: '搜索数据库中的数据',
    category: '数据查询'
  },
  get_data: {
    displayName: '获取数据',
    description: '获取指定的数据',
    category: '数据查询'
  },

  // 数据分析工具（新增）
  analyze_data: {
    displayName: '分析数据',
    description: '分析数据并生成洞察',
    category: '数据分析'
  },
  analyze_records: {
    displayName: '分析记录',
    description: '分析多条记录数据',
    category: '数据分析'
  },
  generate_report: {
    displayName: '生成报告',
    description: '生成数据分析报告',
    category: '数据分析'
  },
  create_chart: {
    displayName: '创建图表',
    description: '创建数据可视化图表',
    category: '数据分析'
  },
  statistics: {
    displayName: '统计数据',
    description: '统计数据信息',
    category: '数据分析'
  }
};

/**
 * 获取工具的显示名称
 * @param toolName 工具名称
 * @returns 显示名称
 */
export function getToolDisplayName(toolName: string): string {
  const mapping = toolNameMappings[toolName];
  if (mapping) {
    return mapping.displayName;
  }
  
  // 如果没有映射，尝试将下划线转换为空格并首字母大写
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 本地化工具描述
 * @param toolName 工具名称
 * @returns 本地化描述
 */
export function localizeToolDescription(toolName: string): string {
  const mapping = toolNameMappings[toolName];
  if (mapping) {
    return mapping.description;
  }
  
  return `执行 ${getToolDisplayName(toolName)}`;
}

/**
 * 获取工具分类
 * @param toolName 工具名称
 * @returns 工具分类
 */
export function getToolCategory(toolName: string): string {
  const mapping = toolNameMappings[toolName];
  return mapping?.category || '其他';
}

/**
 * 获取所有工具映射
 * @returns 工具映射对象
 */
export function getAllToolMappings(): ToolNameMapping {
  return toolNameMappings;
}

/**
 * 按分类获取工具
 * @param category 分类名称
 * @returns 该分类下的工具列表
 */
export function getToolsByCategory(category: string): string[] {
  return Object.entries(toolNameMappings)
    .filter(([_, mapping]) => mapping.category === category)
    .map(([toolName, _]) => toolName);
}

/**
 * 获取所有分类
 * @returns 分类列表
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  Object.values(toolNameMappings).forEach(mapping => {
    if (mapping.category) {
      categories.add(mapping.category);
    }
  });
  return Array.from(categories);
}

/**
 * 提取 Think 内容的摘要（第一行或前80个字符）
 * 用于在 UI 中显示简洁的思考过程
 * @param thinkContent Think 内容
 * @returns 摘要
 */
export function extractThinkSummary(thinkContent: string): string {
  if (!thinkContent) return ''

  // 移除工具调用相关的信息
  let cleaned = thinkContent
    .replace(/正在调用工具.*?(?=\n|$)/g, '')
    .replace(/工具调用.*?(?=\n|$)/g, '')
    .replace(/调用.*?工具.*?(?=\n|$)/g, '')
    .replace(/执行.*?工具.*?(?=\n|$)/g, '')
    .replace(/any_query|read_data_record|query_data|search_data/g, '')
    .trim()

  // 获取第一行
  const lines = cleaned.split('\n').filter(line => line.trim())
  if (lines.length === 0) return ''

  const firstLine = lines[0].trim()

  // 只显示30个字符以内的摘要（更简洁）
  if (firstLine.length > 30) {
    return firstLine.substring(0, 30) + '...'
  }

  return firstLine
}

/**
 * 清理 Think 内容中的工具调用信息
 * 用于在展开 Think 内容时显示清晰的思考过程
 * @param thinkContent Think 内容
 * @returns 清理后的内容
 */
export function cleanThinkContent(thinkContent: string): string {
  if (!thinkContent) return ''

  // 移除工具调用相关的行
  const lines = thinkContent.split('\n')
  const cleaned = lines
    .filter(line => {
      const trimmed = line.trim()
      // 过滤掉包含工具调用信息的行
      return !trimmed.includes('正在调用工具') &&
             !trimmed.includes('工具调用') &&
             !trimmed.includes('调用工具') &&
             !trimmed.includes('执行工具') &&
             !trimmed.includes('any_query') &&
             !trimmed.includes('read_data_record') &&
             !trimmed.includes('query_data') &&
             !trimmed.includes('search_data') &&
             !trimmed.match(/^[a-z_]+\(/) // 过滤函数调用
    })
    .join('\n')
    .trim()

  return cleaned
}

