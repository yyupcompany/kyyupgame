/**
 * 提示词构建服务
 * 负责构建系统提示词和用户提示词
 * 支持模板管理、动态生成、压缩优化
 */

import { logger } from '../../../utils/logger';
import {
  baseSystemTemplate,
  directModeTemplate,
  toolCallingRulesTemplate,
  databaseQueryGuideTemplate,
  uiRenderingGuideTemplate,
  navigationGuideTemplate,
  workflowGuideTemplate,
  responseFormatGuideTemplate,
  thinkingStructureTemplate,
  completionJudgmentTemplate
} from '../prompts';

// 导入新的Think优化模板
import { thinkIntentAnalysisTemplate } from '../prompts/thinking/think-intent-analysis.template';
import { correlatedQueryPlanningTemplate } from '../prompts/thinking/correlated-query-planning.template';

// 导入Flash模型快速意图分析模板
import { flashIntentAnalysisTemplate } from '../prompts/flash/flash-intent-analysis.template';

export interface PromptContext {
  userRole?: string;
  memoryContext?: any[];
  pageContext?: any;
  conversationHistory?: any[];
  tools?: any[];
  toolResults?: any[];

  // 🆕 Think优化相关参数
  requiresIntentAnalysis?: boolean;        // 是否启用意图深度分析
  enableCorrelatedQuery?: boolean;         // 是否启用关联查询规划
  userQuery?: string;                      // 用户原始查询
  selectedTools?: any[];                   // Think选择的工具
  enableEnhancedResponse?: boolean;        // 是否启用增强响应格式

  // ⚡ Flash模型快速意图分析参数
  enableFlashIntentAnalysis?: boolean;     // 是否启用Flash快速意图分析
  estimatedToolCount?: number;             // 预估工具数量（来自智能路由器）
  modelSelectionReason?: string;           // 模型选择原因
}

export interface PromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description?: string;
}

export interface PromptStats {
  totalLength: number;
  tokenEstimate: number;
  sections: number;
}

/**
 * 提示词构建服务类
 */
export class PromptBuilderService {
  private static instance: PromptBuilderService;
  private templates: Map<string, PromptTemplate> = new Map();
  private readonly MAX_PROMPT_LENGTH = 8000; // 最大提示词长度
  private readonly CHARS_PER_TOKEN = 4; // 平均每个token的字符数

  private constructor() {
    this.initializeDefaultTemplates();
    logger.info('✅ [提示词构建] 提示词构建服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): PromptBuilderService {
    if (!PromptBuilderService.instance) {
      PromptBuilderService.instance = new PromptBuilderService();
    }
    return PromptBuilderService.instance;
  }

  /**
   * 初始化默认模板
   */
  private initializeDefaultTemplates(): void {
    // 🎯 注册基础提示词模板
    this.registerTemplate(baseSystemTemplate);
    this.registerTemplate(directModeTemplate);
    
    // 🔧 注册工具相关提示词模板
    this.registerTemplate(toolCallingRulesTemplate);
    this.registerTemplate(databaseQueryGuideTemplate);
    this.registerTemplate(uiRenderingGuideTemplate);
    this.registerTemplate(navigationGuideTemplate);
    this.registerTemplate(workflowGuideTemplate);
    this.registerTemplate(responseFormatGuideTemplate);
    
    // 🆕 注册思考和完成判断提示词模板
    this.registerTemplate(thinkingStructureTemplate);
    this.registerTemplate(completionJudgmentTemplate);

    // 🧠 注册Think优化提示词模板
    this.registerTemplate(thinkIntentAnalysisTemplate);
    this.registerTemplate(correlatedQueryPlanningTemplate);

    // ⚡ 注册Flash模型快速意图分析模板
    this.registerTemplate(flashIntentAnalysisTemplate);

    // 📄 注册文档生成提示词模板
    this.registerTemplate({
      name: 'document_generation_system',
      template: `你是专业的文档生成助手，专门负责根据用户需求生成各类办公文档。

## 📄 文档生成能力
1. **Excel报表** - 学生名单、教师统计、活动数据、招生报告
2. **Word文档** - 活动总结、教学报告、通知公告、工作计划
3. **PDF报告** - 正式报告、证书、通知书、分析报告
4. **PPT演示** - 活动介绍、教学展示、工作汇报、培训材料

## 🔧 工作流程
1. **数据获取** - 调用{{dataQueryTool}}获取所需数据
2. **模板选择** - 根据文档类型选择合适模板
3. **内容生成** - 基于数据和模板生成文档内容
4. **格式优化** - 确保文档格式专业美观
5. **文件输出** - 生成可下载的文档文件

## 📊 当前上下文
- 用户角色: {{userRole}}
- 数据来源: {{dataSource}}
- 文档类型: {{documentType}}
- 模板风格: {{templateStyle}}`,
      variables: ['userRole', 'dataSource', 'documentType', 'templateStyle', 'dataQueryTool'],
      description: '文档生成系统提示词模板'
    });

    // Excel报表生成提示词模板
    this.registerTemplate({
      name: 'excel_generation_prompt',
      template: `请根据以下数据生成Excel报表：

## 📊 数据内容
{{dataContent}}

## 📋 报表要求
- 报表类型: {{reportType}}
- 包含图表: {{includeCharts}}
- 数据范围: {{dateRange}}
- 特殊要求: {{specialRequirements}}

## 🎯 输出格式
请生成包含以下内容的Excel文件：
1. 数据表格（清晰的列标题和数据行）
2. 统计汇总（总计、平均值、百分比等）
3. 图表展示（如果需要）
4. 格式美化（颜色、边框、字体等）

请确保数据准确、格式专业、易于阅读。`,
      variables: ['dataContent', 'reportType', 'includeCharts', 'dateRange', 'specialRequirements'],
      description: 'Excel报表生成提示词模板'
    });

    // Word文档生成提示词模板
    this.registerTemplate({
      name: 'word_generation_prompt',
      template: `请根据以下信息生成Word文档：

## 📝 文档信息
- 文档类型: {{documentType}}
- 标题: {{documentTitle}}
- 内容来源: {{contentSource}}

## 📊 相关数据
{{relatedData}}

## 📋 文档结构要求
1. **标题页** - 包含文档标题、日期、制作单位
2. **目录** - 自动生成章节目录
3. **正文内容** - 结构清晰、逻辑合理
4. **数据表格** - 如有数据需要展示
5. **总结建议** - 基于数据的分析和建议

## 🎨 格式要求
- 使用标准公文格式
- 标题层次清晰
- 表格美观规范
- 页眉页脚完整`,
      variables: ['documentType', 'documentTitle', 'contentSource', 'relatedData'],
      description: 'Word文档生成提示词模板'
    });

    // PPT演示文稿生成提示词模板
    this.registerTemplate({
      name: 'ppt_generation_prompt',
      template: `请根据以下内容生成PPT演示文稿：

## 🎯 演示主题
{{presentationTheme}}

## 📊 演示数据
{{presentationData}}

## 🎨 设计要求
- 目标受众: {{targetAudience}}
- 演示时长: {{duration}}
- 设计风格: {{designStyle}}

## 📋 幻灯片结构
1. **封面页** - 主题、副标题、日期
2. **目录页** - 演示内容概览
3. **内容页** - 主要内容展示（{{slideCount}}页）
4. **数据页** - 图表和统计信息
5. **总结页** - 要点总结和行动建议
6. **感谢页** - 联系方式和致谢

## 🎨 视觉要求
- 色彩搭配协调
- 字体大小适中
- 图表清晰美观
- 布局简洁专业`,
      variables: ['presentationTheme', 'presentationData', 'targetAudience', 'duration', 'designStyle', 'slideCount'],
      description: 'PPT演示文稿生成提示词模板'
    });

    // PDF报告生成提示词模板
    this.registerTemplate({
      name: 'pdf_generation_prompt',
      template: `请根据以下信息生成PDF报告：

## 📄 报告信息
- 报告类型: {{reportType}}
- 报告标题: {{reportTitle}}
- 报告日期: {{reportDate}}
- 制作单位: {{organization}}

## 📊 报告数据
{{reportData}}

## 📋 报告结构要求
1. **封面页** - 报告标题、制作单位、日期、版本
2. **目录页** - 章节目录和页码
3. **摘要** - 报告要点概述
4. **正文内容** - 详细分析和数据展示
5. **图表分析** - 数据可视化展示
6. **结论建议** - 基于数据的结论和建议
7. **附录** - 详细数据表格

## 🎨 格式要求
- 正式报告格式
- 统一的页眉页脚
- 专业的图表样式
- 清晰的章节层次
- 适当的页边距和字体`,
      variables: ['reportType', 'reportTitle', 'reportDate', 'organization', 'reportData'],
      description: 'PDF报告生成提示词模板'
    });

    logger.info('✅ [提示词构建] 所有提示词模板已初始化');
    logger.info(`📊 [提示词构建] 共注册 ${this.templates.size} 个模板`);
  }

  /**
   * 注册模板
   */
  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.name, template);
    logger.info(`✅ [提示词构建] 注册模板: ${template.name}`);
  }

  /**
   * 获取模板
   */
  getTemplate(name: string): PromptTemplate | null {
    return this.templates.get(name) || null;
  }

  /**
   * 使用模板构建提示词
   */
  buildFromTemplate(templateName: string, variables: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      logger.warn(`⚠️ [提示词构建] 模板未找到: ${templateName}`);
      return '';
    }

    let prompt = template.template;

    // 替换变量
    template.variables.forEach(varName => {
      const value = variables[varName] || '';
      prompt = prompt.replace(new RegExp(`{{${varName}}}`, 'g'), String(value));
    });

    return prompt;
  }

  /**
   * 渲染模板（buildFromTemplate的别名）
   */
  private renderTemplate(templateName: string, variables: Record<string, any>): string {
    return this.buildFromTemplate(templateName, variables);
  }

  /**
   * 构建系统提示词
   */
  buildSystemPrompt(context: PromptContext): string {
    const {
      userRole = 'user',
      memoryContext,
      pageContext,
      tools,
      // 🆕 Think优化相关参数
      requiresIntentAnalysis,
      enableCorrelatedQuery,
      userQuery,
      selectedTools,
      enableEnhancedResponse,

      // ⚡ Flash模型快速意图分析参数
      enableFlashIntentAnalysis,
      estimatedToolCount,
      modelSelectionReason
    } = context;

    let prompt = this.getBaseSystemPrompt(userRole);

    // ⚡ Flash模型快速意图分析（最高优先级，在所有分析前）
    if (enableFlashIntentAnalysis && userQuery) {
      prompt += this.renderTemplate('flash_intent_analysis', {
        userQuery
      });

      // 如果有模型选择原因，也添加进来
      if (modelSelectionReason || estimatedToolCount !== undefined) {
        prompt += '\n\n### 📊 智能路由器分析\n';
        if (estimatedToolCount !== undefined) {
          prompt += `- **预估工具数量**: ${estimatedToolCount}个\n`;
        }
        if (modelSelectionReason) {
          prompt += `- **模型选择原因**: ${modelSelectionReason}\n`;
        }
        prompt += '\n';
      }

      prompt += '\n\n';
    }

    // 🆕 第一阶段：Think意图深度分析（在工具选择前）
    if (requiresIntentAnalysis && userQuery) {
      prompt += this.renderTemplate('think_intent_analysis', {
        userQuery
      });
      prompt += '\n\n';
    }

    // 添加记忆上下文
    if (memoryContext && memoryContext.length > 0) {
      prompt += this.buildMemorySection(memoryContext);
    }

    // 添加页面上下文
    if (pageContext) {
      prompt += this.buildPageContextSection(pageContext);
    }

    // 添加工具说明
    if (tools && tools.length > 0) {
      prompt += this.buildToolsSection(tools);
    }

    // 🆕 第二阶段：关联查询规划（在工具选择后，详细API说明前）
    if (enableCorrelatedQuery && userQuery && selectedTools) {
      prompt += this.renderTemplate('correlated_query_planning', {
        userQuery,
        selectedTools: JSON.stringify(selectedTools, null, 2)
      });
      prompt += '\n\n';
    }

    // 🆕 启用增强响应格式
    if (enableEnhancedResponse) {
      prompt += this.renderTemplate('response_format_guide', {});
      prompt += '\n\n';
    }

    return prompt;
  }

  /**
   * 构建智能代理模式完整提示词
   * @param userRole 用户角色
   * @param organizationStatus 机构现状文本
   * @param toolSelectionTree 工具选择决策树
   * @param userPagesList 用户可访问的页面列表（可选）
   */
  buildAgentModePrompt(userRole: string, organizationStatus: string, toolSelectionTree: string, userPagesList?: string): string {
    const currentDate = new Date().toISOString().split('T')[0];

    logger.info(`🚀 [提示词构建] 开始构建智能代理模式提示词，用户角色: ${userRole}`);

    // 1. 基础系统提示词
    const basePrompt = this.buildFromTemplate('base_system', {
      currentDate,
      userRole
    });

    // 2. 添加机构现状
    let prompt = basePrompt + '\n\n' + organizationStatus;

    // 3. 添加工具调用规则
    const toolRules = this.getTemplate('tool_calling_rules');
    if (toolRules) {
      prompt += '\n\n' + toolRules.template;
      logger.info('✅ [提示词构建] 已添加工具调用规则');
    } else {
      logger.warn('⚠️ [提示词构建] 未找到工具调用规则模板');
    }
    
    // 3.5 思考结构规范已移除 - 使用think参数自然思考
    
    // 4. 添加工具选择决策树
    prompt += '\n\n' + toolSelectionTree;
    
    // 5. 添加数据查询指南
    const dbGuide = this.getTemplate('database_query_guide');
    if (dbGuide) {
      prompt += '\n\n' + this.buildFromTemplate('database_query_guide', {
        toolSelectionTree
      });
    }
    
    // 6. 添加UI渲染指南
    const uiGuide = this.getTemplate('ui_rendering_guide');
    if (uiGuide) {
      prompt += '\n\n' + uiGuide.template;
      logger.info('🎨 [提示词构建] 已注入UI渲染指南模板 (ui_rendering_guide)');
    } else {
      logger.warn('⚠️ [提示词构建] 未找到UI渲染指南模板 (ui_rendering_guide)');
    }
    
    // 7. 添加页面导航指南（支持动态页面列表）
    const navGuide = this.getTemplate('navigation_guide');
    if (navGuide) {
      const navGuideContent = userPagesList 
        ? this.buildFromTemplate('navigation_guide', { userPagesList })
        : navGuide.template;
      prompt += '\n\n' + navGuideContent;
    }
    
    // 8. 添加工作流指南
    const workflowGuide = this.getTemplate('workflow_guide');
    if (workflowGuide) {
      prompt += '\n\n' + workflowGuide.template;
    }
    
    // 9. 添加响应格式指南
    const responseGuide = this.getTemplate('response_format_guide');
    if (responseGuide) {
      prompt += '\n\n' + responseGuide.template;
    }
    
    // 10. 🆕 添加任务完成判断规则
    const completionJudgment = this.getTemplate('completion_judgment');
    if (completionJudgment) {
      prompt += '\n\n' + completionJudgment.template;
      logger.info('✅ [提示词构建] 已添加任务完成判断规则');
    } else {
      logger.warn('⚠️ [提示词构建] 未找到任务完成判断模板');
    }
    
    return prompt;
  }

  /**
   * 构建直连模式完整提示词
   * @param organizationStatus 机构现状文本
   * @param toolSelectionTree 工具选择决策树
   */
  buildDirectModePrompt(organizationStatus: string, toolSelectionTree: string): string {
    return this.buildFromTemplate('direct_mode_system', {
      organizationStatus,
      toolSelectionTree
    });
  }
  
  /**
   * 获取基础系统提示词
   */
  private getBaseSystemPrompt(userRole: string): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `你是YY-AI智能助手，专业的幼儿园管理AI助手。

## 📋 基本信息
- 当前日期: ${currentDate}
- 用户角色: ${userRole}
- 系统: 幼儿园管理系统

## 🎯 核心能力
1. **智能对话** - 理解用户意图，提供准确回答
2. **数据查询** - 查询学生、教师、活动等信息
3. **业务操作** - 协助完成招生、活动管理等任务
4. **数据分析** - 提供统计分析和可视化
5. **导航引导** - 引导用户到正确的页面

## 💡 交互原则
1. **准确性** - 基于真实数据回答，不编造信息
2. **简洁性** - 回答简洁明了，避免冗长
3. **友好性** - 语气友好，易于理解
4. **主动性** - 主动提供建议和帮助
5. **安全性** - 遵守权限规则，保护数据安全

## 🔧 工具使用规则

### 基本原则
- 当需要查询数据时，使用数据库查询工具
- 当需要导航时，使用导航工具
- 当需要分析时，使用数据分析工具
- 优先使用工具获取准确信息，而不是猜测

### 🎨 渲染组件使用规则（极其重要！）

**规则1：render_component工具调用条件极其严格**
仅当用户使用以下**明确且强烈**的关键词时，才调用此工具：
- "生成组件"、"创建组件"、"渲染组件"、"做成组件"
- "Vue组件"、"React组件"、"动态表格"、"交互式组件"
- "组件化展示"、"制作界面"、"生成前端页面"
- ⚠️ **必须包含"组件"这个关键词**

**绝对禁止的调用场景**：
- ❌ "用表格展示"、"显示表格"、"做成表格" → 使用Markdown表格
- ❌ "用图表展示"、"生成图表"、"制作图表" → 使用文字描述 + 数据格式
- ❌ "查询数据"、"统计信息"、"查看详情" → 直接回答
- ❌ "明细列表"、"详细数据"、"数据展示" → 使用Markdown格式
- ❌ "每个活动的明细列表" → 明确禁止调用！

**规则2：render_component工具的职责**
- ✅ **只负责**：将已有数据渲染为前端UI组件
- ❌ **不负责**：查询数据、获取数据、处理数据
- ✅ **必须**：数据由其他工具（如any_query、read_data_record）提供
- ❌ **不能**：直接操作数据库或API

**规则3：用户没有明确要求时的正确做法**
如果用户只是查询数据，99%的情况下：
- ✅ 使用 Markdown 表格格式展示数据
- ✅ 使用 Markdown 列表格式展示结果
- ✅ 使用文本格式直接回答
- ❌ **绝对不要**调用render_component工具

**核心原则：99.9%的情况不要调用render_component工具！**

**示例对比**：
- 用户："帮我生成一个Vue组件来展示学生数据" → 调用 render_component
- 用户："查询所有学生" → 使用 Markdown 表格格式回复，不调用 render_component

### ⚠️ 工具调用顺序规则（重要！）

**并发执行规则**:
- 如果多个工具**没有依赖关系**，可以在一轮中同时调用多个工具
- 系统会**并发执行**这些工具，提升响应速度

**顺序执行规则**:
- 如果工具B需要使用工具A的结果，**必须分两轮调用**:
  1. 第一轮: 只调用工具A
  2. 第二轮: 使用工具A的结果调用工具B

**示例**:

✅ **正确 - 并发执行**（无依赖）:
用户: "查询学生列表和教师列表"
第1轮: 同时调用 [read_data_record(students), read_data_record(teachers)]
→ 两个工具并发执行，快速返回结果

✅ **正确 - 顺序执行**（有依赖）:
用户: "查询学生数据，然后生成Excel报表"
第1轮: 调用 read_data_record(students)
第2轮: 使用第1轮的数据调用 generate_excel(data)
→ 确保数据正确传递

❌ **错误 - 依赖关系但并发执行**:
用户: "查询学生数据，然后生成Excel报表"
第1轮: 同时调用 [read_data_record(students), generate_excel(data)]
→ generate_excel无法获取数据，执行失败

### 🎯 如何判断是否有依赖关系

**有依赖关系的场景**:
- "查询...然后生成报表" - 报表依赖查询结果
- "获取数据...然后分析" - 分析依赖数据
- "创建...然后通知" - 通知依赖创建结果
- "查询...然后导航" - 导航依赖查询结果

**无依赖关系的场景**:
- "查询学生和教师" - 两个独立查询
- "统计班级和活动" - 两个独立统计
- "查看学生信息和班级信息" - 两个独立查看

### 💡 Thinking内容要求（简洁模式）

在调用工具时，在reasoning_content中用**一句话**（10-30个字）说明:
- **为什么调用这个工具**

示例:
- "需要查询户外活动数据，使用read_data_record工具"
- "用户要求导航到学生管理页面"
- "统计班级人数，调用any_query工具"

`;
  }
  
  /**
   * 构建记忆上下文部分
   */
  private buildMemorySection(memoryContext: any[]): string {
    let section = '\n## 📚 相关记忆上下文\n';
    section += '基于用户的历史记忆，以下是相关的上下文信息：\n\n';
    
    memoryContext.forEach((memory: any, index: number) => {
      section += `${index + 1}. ${memory.content}\n`;
    });
    
    section += '\n请参考这些记忆信息，为用户提供更加个性化和连贯的服务。\n';
    
    return section;
  }
  
  /**
   * 构建页面上下文部分
   */
  private buildPageContextSection(pageContext: any): string {
    let section = '\n## 🖥️ 当前页面上下文\n';
    
    if (pageContext.currentPage) {
      section += `当前页面: ${pageContext.currentPage}\n`;
    }
    
    if (pageContext.availableActions && pageContext.availableActions.length > 0) {
      section += '\n可用操作:\n';
      pageContext.availableActions.forEach((action: any, index: number) => {
        section += `${index + 1}. ${action.description} (${action.type})\n`;
      });
    }
    
    return section + '\n';
  }
  
  /**
   * 构建工具说明部分
   */
  private buildToolsSection(tools: any[]): string {
    let section = '\n## 🔧 可用工具\n';
    section += '你可以使用以下工具来完成任务：\n\n';
    
    tools.forEach((tool: any, index: number) => {
      section += `${index + 1}. **${tool.name}**: ${tool.description}\n`;
      if (tool.parameters) {
        section += `   参数: ${JSON.stringify(tool.parameters)}\n`;
      }
    });
    
    section += '\n使用工具时，请按照工具的参数要求正确调用。\n';
    
    return section;
  }
  
  /**
   * 构建用户提示词
   */
  buildUserPrompt(content: string, context?: PromptContext): string {
    let prompt = content;
    
    // 如果有对话历史，添加上下文
    if (context?.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-5); // 最近5条
      let historyText = '\n\n## 对话历史\n';
      
      recentHistory.forEach((msg: any) => {
        historyText += `${msg.role}: ${msg.content}\n`;
      });
      
      prompt = historyText + '\n## 当前问题\n' + prompt;
    }
    
    return prompt;
  }
  
  /**
   * 构建工具调用提示词
   */
  buildToolCallPrompt(toolName: string, parameters: any): string {
    return `请使用工具 "${toolName}" 完成任务。

工具参数:
${JSON.stringify(parameters, null, 2)}

请根据工具执行结果，为用户提供清晰的回答。`;
  }
  
  /**
   * 构建多轮对话提示词
   */
  buildMultiRoundPrompt(
    originalQuery: string,
    previousResults: any[],
    currentStep: number,
    totalSteps: number
  ): string {
    let prompt = `## 多轮任务执行\n\n`;
    prompt += `原始请求: ${originalQuery}\n`;
    prompt += `当前步骤: ${currentStep}/${totalSteps}\n\n`;
    
    if (previousResults.length > 0) {
      prompt += `## 已完成步骤\n`;
      previousResults.forEach((result: any, index: number) => {
        prompt += `步骤 ${index + 1}: ${result.description}\n`;
        prompt += `结果: ${JSON.stringify(result.data).substring(0, 200)}...\n\n`;
      });
    }
    
    prompt += `请继续执行下一步操作。`;
    
    return prompt;
  }
  
  /**
   * 构建错误处理提示词
   */
  buildErrorPrompt(error: Error, context?: any): string {
    return `执行过程中遇到错误: ${error.message}

请分析错误原因，并提供解决方案或替代方案。

${context ? `上下文信息: ${JSON.stringify(context)}` : ''}`;
  }
  
  /**
   * 构建总结提示词
   */
  buildSummaryPrompt(results: any[]): string {
    let prompt = `请根据以下执行结果，为用户提供清晰的总结：\n\n`;
    
    results.forEach((result: any, index: number) => {
      prompt += `${index + 1}. ${result.description}\n`;
      prompt += `   状态: ${result.success ? '成功' : '失败'}\n`;
      if (result.data) {
        prompt += `   数据: ${JSON.stringify(result.data).substring(0, 100)}...\n`;
      }
      prompt += '\n';
    });
    
    prompt += `请用简洁的语言总结执行结果，并提供必要的建议。`;
    
    return prompt;
  }
  
  /**
   * 格式化记忆内容
   */
  formatMemoryContent(memory: any): string {
    if (typeof memory === 'string') {
      return memory;
    }
    
    if (memory.content) {
      return memory.content;
    }
    
    return JSON.stringify(memory);
  }
  
  /**
   * 清理提示词（移除多余空行和空格）
   */
  cleanPrompt(prompt: string): string {
    return prompt
      .replace(/\n{3,}/g, '\n\n') // 多个空行替换为两个
      .replace(/[ \t]+$/gm, '') // 移除行尾空格
      .trim();
  }

  /**
   * 🔧 第二阶段优化：智能压缩提示词
   * 保留核心信息，移除冗余内容，支持分层压缩
   */
  compressPrompt(prompt: string, maxLength?: number, compressionLevel: 'light' | 'medium' | 'aggressive' = 'medium'): string {
    const targetLength = maxLength || this.MAX_PROMPT_LENGTH;

    if (prompt.length <= targetLength) {
      return prompt;
    }

    logger.warn(`⚠️ [提示词构建] 提示词过长 (${prompt.length}字符)，开始${compressionLevel}级压缩`);

    // 🔧 第二阶段优化：分层压缩策略
    let compressed = prompt;

    // 第一层：基础清理
    compressed = this.cleanPrompt(compressed);

    // 第二层：根据压缩级别进行不同策略的压缩
    if (compressionLevel === 'light') {
      compressed = this.lightCompression(compressed);
    } else if (compressionLevel === 'medium') {
      compressed = this.mediumCompression(compressed);
    } else if (compressionLevel === 'aggressive') {
      compressed = this.aggressiveCompression(compressed);
    }

    // 第三层：如果还是太长，智能截断
    if (compressed.length > targetLength) {
      compressed = this.intelligentTruncate(compressed, targetLength);
    }

    const compressionRatio = ((prompt.length - compressed.length) / prompt.length * 100).toFixed(1);
    logger.info(`✅ [提示词构建] ${compressionLevel}级压缩完成: ${prompt.length} → ${compressed.length} 字符 (压缩率: ${compressionRatio}%)`);

    return compressed;
  }

  /**
   * 🔧 第二阶段优化：轻度压缩
   * 保留所有核心信息，只移除明显的冗余
   */
  private lightCompression(prompt: string): string {
    return prompt
      // 移除多余的空行
      .replace(/\n{3,}/g, '\n\n')
      // 移除行尾空格
      .replace(/[ \t]+$/gm, '')
      // 移除重复的空格
      .replace(/ +/g, ' ')
      // 移除不必要的装饰性符号
      .replace(/[🔧💡⚠️✅❌📊🎯]+/g, '')
      .trim();
  }

  /**
   * 🔧 第二阶段优化：中度压缩
   * 移除示例和部分说明，保留核心规则
   */
  private mediumCompression(prompt: string): string {
    let compressed = this.lightCompression(prompt);

    // 移除示例内容，但保留示例标记
    compressed = compressed
      .replace(/例如：[\s\S]*?(?=\n\n|\n[0-9]|\n#|$)/g, '例如：[示例已压缩]\n')
      .replace(/示例：[\s\S]*?(?=\n\n|\n[0-9]|\n#|$)/g, '示例：[示例已压缩]\n')
      // 移除详细的注意事项
      .replace(/注意：[^\n]+/g, '')
      // 移除过长的描述
      .replace(/描述：[\s\S]{100,}?(?=\n\n|\n[0-9]|\n#|$)/g, (match) => {
        return match.substring(0, 50) + '...[描述已压缩]\n';
      });

    return compressed;
  }

  /**
   * 🔧 第二阶段优化：激进压缩
   * 保留最重要的规则，移除大部分说明和示例
   */
  private aggressiveCompression(prompt: string): string {
    let compressed = this.mediumCompression(prompt);

    // 保留章节标题，但简化内容
    compressed = compressed
      // 简化工具描述
      .replace(/## 🔧 (.+?)工具特定指南[\s\S]*?(?=## 🔧|$)/g, (match, toolName) => {
        return `## 🔧 ${toolName}工具指南\n[规则已压缩]\n`;
      })
      // 移除过长的列表
      .replace(/(\n[-*] .+){10,}/g, (match) => {
        const items = match.trim().split('\n');
        return '\n' + items.slice(0, 5).join('\n') + '\n[其他选项已压缩]\n';
      })
      // 移除重复的规则说明
      .replace(/(\n.*?规则.*?\n){2,}/g, '\n[规则已合并压缩]\n');

    return compressed;
  }

  /**
   * 🔧 第二阶段优化：智能截断
   * 在重要位置截断，保留完整的内容块
   */
  private intelligentTruncate(prompt: string, targetLength: number): string {
    if (prompt.length <= targetLength) {
      return prompt;
    }

    // 寻找合适的截断点（章节标题）
    const sections = prompt.split(/(?=##\s)/);
    let result = '';

    for (const section of sections) {
      if (result.length + section.length <= targetLength - 50) {
        result += section;
      } else {
        break;
      }
    }

    if (result.length === 0) {
      // 如果没有找到合适的章节，按段落截断
      const paragraphs = prompt.split('\n\n');
      for (const paragraph of paragraphs) {
        if (result.length + paragraph.length <= targetLength - 50) {
          result += paragraph + '\n\n';
        } else {
          break;
        }
      }
    }

    return result + '\n\n[内容因长度限制被截断]';
  }

  /**
   * 估算token数量
   */
  estimateTokens(prompt: string): number {
    return Math.ceil(prompt.length / this.CHARS_PER_TOKEN);
  }

  /**
   * 获取提示词统计
   */
  getPromptStats(prompt: string): PromptStats {
    const sections = prompt.split(/##/).length - 1;

    return {
      totalLength: prompt.length,
      tokenEstimate: this.estimateTokens(prompt),
      sections
    };
  }

  /**
   * 优化提示词
   */
  optimizePrompt(prompt: string, options: {
    maxLength?: number;
    preserveSections?: string[];
  } = {}): string {
    let optimized = prompt;

    // 1. 清理
    optimized = this.cleanPrompt(optimized);

    // 2. 如果指定了要保留的部分，提取并重组
    if (options.preserveSections && options.preserveSections.length > 0) {
      const sections: string[] = [];

      options.preserveSections.forEach(sectionName => {
        const regex = new RegExp(`## ${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
        const match = optimized.match(regex);
        if (match) {
          sections.push(match[0]);
        }
      });

      if (sections.length > 0) {
        optimized = sections.join('\n\n');
      }
    }

    // 3. 压缩到指定长度
    if (options.maxLength) {
      optimized = this.compressPrompt(optimized, options.maxLength);
    }

    return optimized;
  }

  /**
   * 合并多个提示词
   */
  mergePrompts(prompts: string[], separator: string = '\n\n'): string {
    return prompts
      .filter(p => p && p.trim().length > 0)
      .join(separator);
  }

  /**
   * 验证提示词
   */
  validatePrompt(prompt: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查长度
    if (prompt.length === 0) {
      errors.push('提示词为空');
    }

    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      warnings.push(`提示词过长 (${prompt.length}字符)，建议压缩`);
    }

    // 检查token估算
    const tokens = this.estimateTokens(prompt);
    if (tokens > 2000) {
      warnings.push(`估算token数量过多 (${tokens})，可能影响性能`);
    }

    // 检查是否包含变量占位符
    const unreplacedVars = prompt.match(/{{[^}]+}}/g);
    if (unreplacedVars) {
      warnings.push(`包含未替换的变量: ${unreplacedVars.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 删除模板
   */
  deleteTemplate(name: string): boolean {
    const deleted = this.templates.delete(name);
    if (deleted) {
      logger.info(`🗑️ [提示词构建] 删除模板: ${name}`);
    }
    return deleted;
  }

  /**
   * 获取服务统计
   */
  getStats(): {
    totalTemplates: number;
    templates: string[];
  } {
    return {
      totalTemplates: this.templates.size,
      templates: Array.from(this.templates.keys())
    };
  }
}

// 导出单例
export const promptBuilderService = PromptBuilderService.getInstance();

