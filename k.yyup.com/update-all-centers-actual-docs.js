import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lazy_ai_substitute_project'
});

console.log('开始更新所有中心的AI知识库文档（基于实际页面内容）...');

// 先删除旧的文档
console.log('删除旧的中心AI知识库文档...');
await connection.execute(
  "DELETE FROM ai_knowledge_base WHERE category IN ('活动中心', '招生中心', 'AI中心', '系统中心', '任务中心')"
);

const allCenterDocs = [
  // 活动中心文档（基于ActivityCenter.vue）
  {
    category: '活动中心',
    document_name: 'activity_center_overview',
    document_description: '活动中心概览和标签页功能',
    document_content: `# 活动中心概览

## 页面定位
活动中心是活动管理的核心平台，您可以策划各类活动、管理报名登记、跟踪活动进展、分析活动效果。

## 六个标签页结构
1. **概览**：统计数据（总活动数、进行中活动、总报名数、平均评分）+ 快速操作
2. **活动管理**：ActivityList组件，完整的活动CRUD功能
3. **活动模板**：模板库 + AI一键配图 + 模板使用和编辑
4. **海报管理**：PosterTemplates + PosterGenerator + PosterEditor三个子模块
5. **报名管理**：报名统计图表 + 最新报名列表 + 审核功能
6. **数据分析**：活动数据分析 + 日期范围选择 + 可视化图表

## 概览页面核心功能
### 统计卡片（可点击跳转）
- **总活动数**：点击跳转到活动管理标签页
- **进行中活动**：点击跳转到报名管理标签页  
- **总报名数**：点击跳转到数据分析标签页
- **平均评分**：显示活动质量评价

### 快速操作
- 新建活动、活动模板、数据分析、报名管理等快捷入口`
  },
  {
    category: '活动中心',
    document_name: 'activity_templates_ai_features',
    document_description: '活动模板库和AI配图功能',
    document_content: `# 活动模板和AI功能

## AI配图功能
### 一键AI配图
- **批量生成按钮**：点击"一键AI配图"为所有模板生成配图
- **生成状态**：显示"正在生成配图..."加载状态
- **智能匹配**：AI根据模板内容生成合适图片

### 单个模板AI配图
- **AI配图按钮**：每个模板卡片的悬停图片覆盖层
- **实时生成**：点击后立即为该模板生成配图
- **状态跟踪**：template.isGeneratingImage状态管理

## 模板管理功能
### 模板卡片展示
- **模板图片**：带懒加载和错误处理
- **模板信息**：名称、描述、分类、使用次数
- **操作按钮**：📋使用模板、✏️编辑模板

### 集成组件
- **KindergartenImageGenerator**：专业图片生成器
- **图片更新回调**：updateTemplateImage函数自动应用生成的图片`
  },
  {
    category: '活动中心',
    document_name: 'registration_analytics_system',
    document_description: '报名管理和数据分析系统',
    document_content: `# 报名管理和数据分析

## 报名管理功能
### 可视化图表
- **registrationTrendChart**：报名趋势图表
- **activityTypeChart**：活动类型分布图

### 最新报名列表
- **表格展示**：活动名称、参与者、报名时间、状态
- **状态管理**：getRegistrationStatusType/Text函数处理状态显示
- **操作功能**：📄查看报名、⭐审核报名

### 数据操作
- **导出功能**：exportRegistrations导出报名数据
- **刷新功能**：refreshRegistrations手动刷新数据

## 数据分析功能
### 分析工具
- **日期范围选择器**：analyticsDateRange自定义分析时间段
- **多维度分析**：按时间、活动类型、参与度等维度
- **实时图表**：ECharts图表展示分析结果`
  },

  // 招生中心文档（基于EnrollmentCenter.vue）
  {
    category: '招生中心',
    document_name: 'enrollment_center_overview',
    document_description: '招生中心概览和核心功能',
    document_content: `# 招生中心概览

## 页面定位
招生中心是招生管理的核心枢纽，您可以管理招生计划、处理入学申请、跟进咨询转化、分析招生数据。

## 统计卡片系统
采用16列网格系统(cds-grid)展示核心指标：
- **StatCard组件**：统一的统计卡片展示
- **点击交互**：handleStatClick支持卡片点击跳转
- **图标系统**：iconName属性显示对应图标
- **趋势显示**：支持trend和trendText显示数据变化

## 图表分析区域
### 双图表布局
- **招生趋势分析**：enrollmentTrendChart显示最近6个月招生数据
- **来源渠道分析**：sourceChannelChart显示各渠道咨询转化情况
- **ChartContainer组件**：统一的图表容器，支持刷新功能

## 快速操作区域
### 双操作栏设计
- **主要操作**：ActionToolbar组件，quickActions配置
- **次要操作**：secondaryActions配置，右对齐显示
- **响应式布局**：基于16列网格自适应不同屏幕

## 数据加载机制
- **图表加载状态**：chartsLoading统一控制
- **刷新功能**：refreshCharts支持图表数据刷新
- **错误处理**：完善的错误状态处理`
  },

  // AI中心文档（基于AICenter.vue）
  {
    category: 'AI中心',
    document_name: 'ai_center_overview',
    document_description: 'AI中心功能模块和智能服务',
    document_content: `# AI中心概览

## 页面定位
AI中心是人工智能服务的中心枢纽，您可以管理AI模型、查看智能分析、配置自动化工作流。

## 统计卡片系统
- **16列网格布局**：cds-grid响应式统计展示
- **StatCard组件**：统一的AI服务统计卡片
- **点击交互**：handleStatClick跳转到相关功能

## AI功能模块网格
### 六大核心模块
1. **🤖 AI智能查询**：/ai/query - 自然语言查询系统数据
2. **📊 AI数据分析**：/ai/analytics - 机器学习深度分析和预测
3. **🧠 AI模型管理**：/ai/models - 管理和配置AI模型训练部署
4. **⚙️ AI自动化**：/ai/automation/WorkflowAutomation - 智能工作流设置
5. **🔮 AI预测分析**：/ai/predictions - 历史数据趋势预测风险评估
6. **📈 AI性能监控**：/ai/monitoring/AIPerformanceMonitor - 实时监控AI服务性能

### 额外AI工具
7. **🎨 AI图像处理**：/admin/image-replacement - 智能图像替换工具

## 导航机制
- **navigateTo函数**：统一的模块导航处理
- **路径管理**：每个模块都有明确的路由路径
- **模块卡片**：点击式交互设计，直观易用

## 页面特色
- **创建AI模型**：handleCreateModel专门的AI模型创建功能
- **模块化设计**：每个AI功能独立模块化
- **统一UI风格**：module-grid网格布局保持一致性`
  },

  // 系统中心文档（基于SystemCenter.vue）
  {
    category: '系统中心',
    document_name: 'system_center_overview',
    document_description: '系统中心管理和监控功能',
    document_content: `# 系统中心概览

## 页面定位
系统中心是系统管理和维护的中心枢纽，您可以管理系统配置、监控系统状态、处理系统安全。

## 系统统计监控
### 四项核心指标
1. **系统运行时间**：stats.uptime显示系统运行时长，"稳定运行"状态
2. **在线用户数**：stats.onlineUsers显示当前在线用户，支持增长率显示
3. **系统负载**：stats.systemLoad百分比显示，>80%显示为负向趋势
4. **存储使用率**：stats.storageUsage百分比，>85%显示为负向趋势

### 状态指示系统
- **stable状态**：稳定运行的绿色指示
- **positive/negative**：根据数值动态显示趋势颜色
- **实时加载**：loading状态控制数据加载显示

## 系统功能模块
### 六大核心模块
1. **⚙️ 系统配置**：/system/settings - 参数设置、功能开关、环境配置
2. **👥 用户管理**：/system/users - 用户账户、角色权限、访问控制
3. **📊 系统监控**：/system/dashboard - 实时性能、资源使用、服务状态监控
4. **💾 数据备份**：/system/Backup - 备份策略、恢复操作、存储管理
5. **📝 日志管理**：/system/Log - 系统日志、操作记录、错误追踪
6. **🔒 安全设置**：/system/Security - 安全策略、防护规则、访问限制

## 系统检查功能
- **handleSystemCheck**：系统健康检查功能
- **系统检查按钮**：一键触发全面系统检查
- **状态监控**：实时监控系统各项状态指标

## 导航特色
- **模块网格布局**：module-grid统一的模块展示
- **功能描述详细**：每个模块都有清晰的功能说明
- **路径导航清晰**：navigateTo函数统一处理模块跳转`
  },

  // 任务中心文档（基于TaskCenter.vue）
  {
    category: '任务中心',
    document_name: 'task_center_overview',
    document_description: '任务中心管理和骨架屏功能',
    document_content: `# 任务中心概览

## 页面定位
任务中心是任务管理的核心枢纽，您可以创建任务、分配工作、跟踪进度、管理待办事项。

## 骨架屏设计
### 自定义骨架屏模板
- **统计卡片骨架屏**：skeleton-grid-4四列网格布局
- **图表骨架屏**：skeleton-charts双图表占位
- **操作按钮骨架屏**：skeleton-actions-row操作按钮行
- **加载状态控制**：isLoading统一控制骨架屏显示

### 骨架屏组件
- **skeleton-stat-card**：统计卡片骨架结构
- **skeleton-stat-icon/value/label**：统计项目的详细骨架
- **skeleton-chart**：图表区域占位骨架
- **skeleton-button**：按钮操作区域骨架

## 统计和图表系统
### 统计卡片
- **16列网格布局**：cds-grid响应式统计展示
- **StatCard组件**：任务相关统计数据卡片
- **点击交互**：handleStatClick支持统计卡片导航

### 双图表展示
- **任务完成趋势**：taskTrendChart显示最近7天完成情况
- **任务优先级分布**：当前任务优先级统计图表
- **ChartContainer组件**：支持刷新的图表容器

## 任务管理功能
- **新建任务**：handleCreate创建新任务功能
- **任务分配**：支持工作分配和责任人指定
- **进度跟踪**：实时跟踪任务执行进度
- **待办管理**：集成待办事项管理功能

## 页面特色
- **骨架屏优化**：提供完整的加载状态用户体验
- **响应式设计**：完善的移动端和桌面端适配
- **数据刷新**：refreshCharts支持图表数据实时更新`
  }
];

console.log('开始添加基于实际页面内容的AI知识库文档...');

for (const doc of allCenterDocs) {
  try {
    const [result] = await connection.execute(
      'INSERT INTO ai_knowledge_base (category, document_name, document_description, document_content, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [doc.category, doc.document_name, doc.document_description, doc.document_content]
    );
    
    console.log(`✅ 成功添加文档: ${doc.category} - ${doc.document_name} (ID: ${result.insertId})`);
  } catch (error) {
    console.error(`❌ 添加文档失败: ${doc.category} - ${doc.document_name}`, error.message);
  }
}

await connection.end();
console.log('所有中心AI知识库文档更新完成！');