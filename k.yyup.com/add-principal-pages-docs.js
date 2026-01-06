import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lazy_ai_substitute_project'
});

console.log('开始添加园长功能页面的AI知识库文档...');

// 先删除旧的园长相关文档
console.log('删除旧的园长功能页面AI知识库文档...');
await connection.execute(
  "DELETE FROM ai_knowledge_base WHERE category IN ('园长工作台', '园长活动管理', '园长客户池', '园长营销分析', '园长绩效管理', '园长决策支持')"
);

const principalPagesDocs = [
  // 园长工作台文档（基于Dashboard.vue）
  {
    category: '园长工作台',
    document_name: 'principal_dashboard_overview',
    document_description: '园长工作台主页面功能详解',
    document_content: `# 园长工作台概览

## 页面定位
园长工作台是园长角色的核心控制中心，提供全方位的数据统计、业务管理和快速操作入口。

## 核心功能区域

### 1. 页面操作区
- **刷新数据按钮**：实时更新所有统计数据，loading.stats控制加载状态
- **园区概览按钮**：快速跳转到/principal/campus-overview页面
- **PageContainer组件**：流式布局设计，响应式适配

### 2. 数据统计卡片系统
采用stats-grid网格布局展示核心业务指标：

#### 统计卡片特色功能
- **骨架屏加载**：loading.stats时显示精美的骨架屏动画
- **数据更新指示**：stat.isUpdated时显示更新指示器●
- **趋势分析**：支持up/down趋势箭头和数值显示
- **卡片分类**：根据stat.type显示不同主题色彩

#### 卡片内容结构
- **图标系统**：iconComponents动态加载对应图标
- **数值展示**：支持大数值显示和单位标识
- **趋势对比**：较上月变化百分比和箭头指示

### 3. 业务功能卡片网格
采用functions-grid布局的快速导航系统：

#### 功能导航特点
- **卡片式设计**：每个功能模块独立卡片展示
- **点击导航**：navigateTo(func.route)实现页面跳转
- **图标标识**：32px大图标清晰显示功能特征
- **描述信息**：功能标题和详细描述说明

### 4. 招生趋势图表系统
#### 图表控制功能
- **时间范围选择**：支持本周/本月/本年三种周期
- **动态切换**：trendPeriod响应式切换图表数据
- **数据刷新**：loadChartData手动刷新图表

#### 状态管理
- **空状态处理**：EmptyState组件提供友好的无数据提示
- **加载状态**：LoadingState组件显示加载动画
- **错误处理**：完善的图表加载失败处理

### 5. 系统预警功能
#### 预警系统特点
- **条件显示**：systemAlerts.length > 0时才显示预警卡片
- **预警列表**：动态展示系统预警信息
- **操作功能**：clearAlerts一键清除所有预警
- **图标提示**：Warning图标突出预警重要性

## 技术特色
- **响应式设计**：全面支持移动端和桌面端
- **组件化架构**：PageContainer + 各种子组件组合
- **状态管理**：统一的loading和error状态处理
- **动画效果**：骨架屏和加载动画提升用户体验`
  },

  // 园长活动管理文档（基于Activities.vue）
  {
    category: '园长活动管理',
    document_name: 'principal_activities_management',
    document_description: '招生活动管理功能详解',
    document_content: `# 招生活动管理系统

## 页面定位
招生活动管理是园长专用的活动管理界面，专注于招生相关的活动策划、执行和效果跟踪。

## 核心功能模块

### 1. 筛选区域功能
采用filter-card卡片式筛选设计：

#### 筛选条件
- **活动名称**：el-input支持模糊搜索和清除功能
- **活动状态**：el-select下拉选择，statusOptions配置状态选项
- **活动时间**：el-date-picker日期范围选择器
- **操作按钮**：查询和重置功能，Search和Refresh图标

#### 操作功能区
- **新增活动**：createActivity函数创建新活动
- **批量删除**：selectedActivities数组支持多选删除
- **按钮状态**：批量删除按钮根据选择状态动态启用/禁用

### 2. 活动列表管理
#### 空状态处理
- **EmptyState组件**：友好的空数据展示
- **引导操作**：primary-action和secondary-action引导用户
- **建议提示**：suggestions数组提供操作建议

#### 表格功能
- **数据展示**：el-table展示活动详细信息
- **多选功能**：type="selection"支持批量操作
- **状态标签**：getStatusType/getStatusText函数处理状态显示
- **时间管理**：startTime和endTime显示活动时间段

#### 列表字段
- **活动名称**：min-width="150" + show-overflow-tooltip
- **活动状态**：彩色标签区分不同状态
- **时间信息**：开始时间和结束时间
- **操作按钮**：查看、编辑、删除等功能

### 3. 数据管理功能
#### 加载状态
- **loading状态**：v-loading统一控制表格加载
- **数据获取**：loadActivities异步加载活动数据
- **状态响应**：界面状态与数据状态同步

#### 操作处理
- **创建活动**：createActivity打开活动创建界面
- **批量选择**：handleSelectionChange处理多选状态
- **筛选重置**：resetFilter一键重置所有筛选条件

## 页面特色功能
### 1. 响应式筛选
- **inline表单**：el-form inline模式紧凑布局
- **条件联动**：多个筛选条件组合查询
- **状态保持**：筛选条件在页面刷新后保持

### 2. 智能操作
- **按钮状态管理**：根据数据状态动态调整按钮可用性
- **批量操作**：高效的多选批量处理
- **操作反馈**：完善的操作成功/失败提示

### 3. 用户体验优化
- **空状态引导**：EmptyState组件提供清晰的下一步操作指引
- **加载状态**：平滑的加载动画和状态过渡
- **错误处理**：友好的错误提示和恢复建议`
  },

  // 园长客户池文档（基于CustomerPool.vue）
  {
    category: '园长客户池',
    document_name: 'principal_customer_pool_management',
    document_description: '客户池管理功能详解',
    content: `# 客户池管理系统

## 页面定位
客户池管理是园长用于管理和跟进潜在客户的专业工具，提供全面的客户信息管理和转化分析。

## 统计卡片系统

### 四大核心指标
采用stats-grid响应式网格布局：

#### 1. 总客户数统计卡片
- **图标标识**：User图标表示用户群体
- **数值显示**：stats.totalCustomers动态展示总数
- **趋势分析**：较上月+12%的正向增长趋势

#### 2. 本月新增客户卡片
- **图标标识**：Plus图标表示新增概念
- **数值显示**：stats.newCustomersThisMonth本月新增数量
- **增长趋势**：较上月+8%的增长数据

#### 3. 未分配客户预警卡片
- **图标标识**：Warning图标突出需要关注
- **数值显示**：stats.unassignedCustomers未分配客户数
- **状态提示**：warning样式的"待分配"状态标识

#### 4. 本月转化客户卡片
- **图标标识**：Check图标表示转化成功
- **数值显示**：stats.convertedCustomersThisMonth转化数量
- **转化率**：15.2%的转化率数据展示

### 统计卡片设计特色
- **卡片分类**：total/new/unassigned/converted不同主题色彩
- **趋势指示**：positive/warning/negative颜色区分
- **信息层次**：stat-value主数据 + stat-label标签说明

## 搜索和筛选系统

### 搜索功能设计
- **搜索卡片**：el-card包装的search-card样式
- **标题区域**：Search图标 + "筛选条件"标题
- **搜索表单**：统一的search-form布局设计

### 关键词搜索
- **搜索输入框**：placeholder="搜索客户姓名、电话"
- **前缀图标**：Search图标提供视觉引导
- **快捷操作**：clearable清除功能 + @keyup.enter回车搜索
- **样式设计**：search-input专用样式类

### 搜索体验优化
- **即时搜索**：keyup.enter支持快速搜索
- **清除功能**：一键清空搜索内容
- **状态反馈**：搜索过程中的loading状态
- **结果处理**：handleSearch统一处理搜索逻辑

## 页面布局特色

### 响应式设计
- **网格系统**：stats-grid自适应不同屏幕尺寸
- **卡片布局**：统一的卡片式设计语言
- **间距控制**：合理的页面元素间距

### 交互设计
- **视觉层次**：清晰的信息架构和视觉层次
- **操作反馈**：完善的用户操作反馈机制
- **状态管理**：统一的loading和error状态处理

### 功能组织
- **模块化设计**：统计、搜索、操作功能模块化
- **用户路径**：从数据概览到具体操作的清晰路径
- **效率优化**：高频操作的快捷访问设计`
  },

  // 园长营销分析文档（基于MarketingAnalysis.vue）
  {
    category: '园长营销分析',
    document_name: 'principal_marketing_analysis',
    document_description: '营销分析功能详解',
    document_content: `# 营销分析系统

## 页面定位
营销分析是园长专用的营销效果分析工具，提供全面的营销数据分析和业务洞察。

## 页面头部功能

### 操作工具栏
- **page-header组件**：统一的页面头部设计
- **刷新数据**：refreshData功能，loading状态控制
- **导出报告**：exportReport导出营销分析报告
- **按钮设计**：Refresh和Download图标提供视觉提示

## 营销概览统计

### 四大核心指标卡片
采用el-row + el-col响应式布局：

#### 1. 营销活动总数
- **图标标识**：TrendCharts图标表示趋势分析
- **数据展示**：overviewData.totalCampaigns总活动数量
- **卡片样式**：overview-card统一卡片设计

#### 2. 总触达人数
- **图标标识**：User图标表示用户触达
- **数据展示**：overviewData.totalReach总触达人数
- **业务意义**：衡量营销活动的覆盖范围

#### 3. 总转化数
- **图标标识**：Check图标表示转化成功
- **数据展示**：overviewData.totalConversions转化数量
- **效果衡量**：营销活动的直接转化效果

#### 4. 总营收
- **图标标识**：Money图标表示收入
- **数据展示**：formatCurrency格式化的收入数据
- **财务指标**：营销活动带来的直接收益

### 概览卡片设计
- **卡片结构**：card-icon + card-info的信息层次
- **数值突出**：card-value大字体显示核心数据
- **标签说明**：card-label提供数据含义说明

## 图表分析系统

### 营销趋势分析图表
#### 图表配置
- **容器设计**：chart-card卡片包装
- **标题区域**：card-header包含标题和控制组件
- **时间范围**：el-radio-group控制chartTimeRange
- **选项设置**：7d/30d/90d三种时间范围选择

#### 图表特色
- **动态数据**：根据时间范围动态加载数据
- **交互控制**：用户可切换不同时间维度
- **容器引用**：trendChartRef用于图表渲染

### 渠道效果分析
#### 双图表布局
- **渠道分析图**：channelChartRef渠道效果可视化
- **转化分析图**：对应的转化效果分析
- **响应式布局**：el-col :span="12"等宽双列布局

#### 分析维度
- **渠道对比**：不同营销渠道的效果对比
- **转化漏斗**：从触达到转化的完整链路分析
- **数据钻取**：支持深入分析特定渠道数据

## 数据处理功能

### 加载状态管理
- **统一Loading**：v-loading="loading"全页面加载控制
- **异步数据**：所有数据异步加载，避免阻塞用户操作
- **状态同步**：数据状态与界面状态实时同步

### 数据格式化
- **货币格式化**：formatCurrency统一货币显示格式
- **数值处理**：overviewData对象统一管理所有统计数据
- **动态更新**：数据变化时界面自动更新

## 页面特色功能

### 1. 多维度分析
- **时间维度**：支持不同时间范围的趋势分析
- **渠道维度**：多渠道效果对比和分析
- **转化维度**：完整的转化漏斗分析

### 2. 交互体验
- **实时控制**：图表时间范围实时切换
- **数据导出**：一键导出分析报告
- **刷新机制**：手动刷新获取最新数据

### 3. 可视化设计
- **图表丰富**：多种图表类型展示不同维度数据
- **布局合理**：响应式布局适配不同设备
- **信息清晰**：清晰的数据层次和视觉引导`
  },

  // 园长绩效管理文档（基于Performance.vue）
  {
    category: '园长绩效管理',
    document_name: 'principal_performance_management',
    document_description: '招生业绩统计功能详解',
    document_content: `# 招生业绩统计系统

## 页面定位
招生业绩统计是园长专用的绩效分析工具，提供详细的业绩数据统计、排名分析和报表导出功能。

## 工具栏功能

### 时间筛选系统
#### 日期选择器配置
- **时间范围**：el-date-picker type="daterange"双日期选择
- **快捷选项**：dateShortcuts预设常用时间范围
- **格式化**：value-format="YYYY-MM-DD"标准日期格式
- **操作按钮**：筛选和重置功能

#### 快捷时间选项
- **日期快捷方式**：支持最近7天、30天、本月等快速选择
- **筛选操作**：filterData根据时间范围筛选数据
- **重置功能**：resetFilter一键清空所有筛选条件

### 导出工具功能
#### 双导出模式
- **数据导出**：exportData导出Excel格式数据
- **打印报表**：printReport生成PDF打印报表
- **图标设计**：Download和Printer图标区分功能
- **按钮样式**：success和primary主题色区分重要性

## 统计卡片系统

### 响应式卡片布局
- **网格系统**：el-row + el-col响应式布局
- **断点设计**：xs="24" sm="12" md="6"多端适配
- **卡片循环**：v-for遍历statCards动态生成

### 统计卡片结构
#### 卡片内容组织
- **图标区域**：stat-icon展示业务类型图标
- **数值区域**：stat-value突出显示核心数据
- **标签区域**：stat-label说明数据含义
- **主题样式**：stat.type控制卡片主题色彩

#### 数据展示特色
- **动态图标**：component :is="stat.icon"动态图标组件
- **分类显示**：不同业绩类型用不同颜色区分
- **响应式**：自适应不同屏幕尺寸的显示效果

## 图表分析系统

### 业绩排名图表
#### 图表配置功能
- **排名类型选择**：el-select控制rankType排名维度
- **排名选项**：累计招生数/本月招生数/转化率三种类型
- **动态切换**：实时切换排名类型和数据展示

#### 排名列表展示
- **空状态处理**：EmptyState组件提供友好的无数据提示
- **排名展示**：ranking-index显示排名位置
- **特殊标识**：top-three class突出前三名
- **进度条**：el-progress可视化展示相对比例

### 排名数据处理
#### 数据计算功能
- **百分比计算**：calculatePercentage计算相对比例
- **进度颜色**：getProgressColor根据排名设置颜色
- **类型标签**：getRankTypeLabel获取排名类型说明
- **数据格式化**：转化率用%显示，其他用数值

#### 交互功能
- **排名切换**：实时切换不同排名维度
- **数据刷新**：loadRankingData手动刷新排名数据
- **视觉反馈**：loading状态和空状态的平滑切换

## 页面特色功能

### 1. 多维度绩效分析
- **时间维度**：自定义时间范围分析
- **类型维度**：多种业绩指标对比
- **人员维度**：个人业绩排名和对比

### 2. 数据导出功能
- **格式多样**：支持Excel数据导出和PDF报表打印
- **数据完整**：导出包含所有筛选后的数据
- **格式标准**：符合业务需求的标准格式

### 3. 用户体验优化
- **响应式设计**：完美适配移动端和桌面端
- **加载状态**：平滑的数据加载和状态切换
- **空状态引导**：友好的空数据处理和操作建议

### 4. 视觉设计亮点
- **排名突出**：前三名特殊标识和颜色区分
- **进度可视化**：直观的进度条展示相对表现
- **卡片设计**：统一的卡片式设计语言`
  },

  // 园长决策支持文档（基于intelligent-dashboard.vue）
  {
    category: '园长决策支持',
    document_name: 'principal_decision_support_system',
    document_description: '智能决策支持系统功能详解',
    document_content: `# 园长智能决策支持系统

## 系统定位
园长智能决策支持系统是基于AI技术的高级决策工具，为园长提供数据驱动的决策建议和场景分析。

## 决策概览仪表板

### 核心决策指标
采用overview-metric卡片式布局展示四大关键指标：

#### 1. 待决策事项 🎯
- **数据来源**：decisionStats.pendingDecisions
- **业务含义**：当前需要园长决策的事项数量
- **紧急程度**：帮助园长prioritize决策优先级

#### 2. AI准确率 📊
- **数据来源**：decisionStats.aiAccuracy + %显示
- **技术指标**：AI决策建议的历史准确率
- **可信度参考**：评估AI建议的可信程度

#### 3. 平均响应时间 ⚡
- **数据来源**：decisionStats.avgResponseTime + h单位
- **效率指标**：从问题提出到决策完成的平均时间
- **流程优化**：识别决策流程的改进空间

#### 4. 建议采纳率 📈
- **数据来源**：decisionStats.implementationRate + %显示
- **决策质量**：AI建议被实际采纳的比例
- **系统优化**：评估AI决策系统的实用性

## AI决策场景分析

### 场景管理功能
#### 操作控制区
- **刷新分析**：analyzeDecisionScenarios函数，loading状态：analyzingScenarios
- **新增场景**：showCreateScenarioDialog控制创建对话框
- **section-header**：统一的功能区头部设计

### 决策场景卡片系统
#### 场景卡片结构
每个scenario对象包含完整的决策场景信息：

#### 1. 场景头部信息
- **场景标题**：scenario.title决策场景名称
- **紧急程度**：scenario.urgency紧急级别标识
- **颜色标识**：根据urgency显示不同颜色

#### 2. 场景描述区域
- **问题描述**：scenario.description详细说明决策场景
- **影响级别**：scenario.impact影响程度评估
- **样式区分**：不同impact级别用不同颜色标识

### 决策选项分析系统

#### 选项结构设计
每个场景包含多个决策选项（scenario.options）：

#### 选项评估指标
- **选项名称**：option.name决策选项标题
- **评分系统**：option.score满分100分的评估分数
- **选项描述**：option.description详细说明
- **成本分析**：option.cost预估成本（¥符号显示）
- **预期效果**：option.expectedEffect效果百分比
- **风险评估**：option.risk风险级别描述

#### 选项比较功能
- **评分排序**：按score分数高低排列选项
- **多维对比**：成本、效果、风险三维度对比
- **量化分析**：所有指标均提供量化数据支持

## AI推荐系统

### 智能推荐功能
#### 推荐内容结构
- **推荐建议**：scenario.aiRecommendation AI的最终建议
- **推理依据**：scenario.reasoning详细的推理过程
- **依据列表**：ul + li结构展示推理步骤

#### 推荐算法特色
- **数据驱动**：基于历史数据和实时数据分析
- **多因素考虑**：综合成本、效果、风险等多个维度
- **透明推理**：提供完整的推理过程和依据

### 决策支持特色功能

#### 1. 场景化决策
- **情境感知**：根据具体业务场景提供针对性建议
- **动态更新**：实时更新决策场景和选项分析
- **历史追踪**：记录决策历史和效果反馈

#### 2. 智能化分析
- **AI算法支持**：机器学习算法优化决策建议
- **预测性分析**：基于历史数据预测决策效果
- **风险识别**：自动识别和评估决策风险

#### 3. 可视化展示
- **卡片式设计**：清晰的信息层次和视觉组织
- **颜色编码**：不同紧急程度和影响级别用颜色区分
- **指标量化**：所有决策要素均提供量化指标

#### 4. 交互体验
- **响应式布局**：scenarios-grid网格布局适配不同屏幕
- **实时分析**：支持实时场景分析和建议更新
- **操作便捷**：一键刷新分析和创建新场景功能

## 系统技术特色
- **AI集成**：深度集成AI算法提供智能决策支持
- **数据可视化**：丰富的数据可视化和展示方式
- **用户体验**：专为园长决策场景优化的交互设计
- **扩展性**：支持新增决策场景和算法模型`
  }
];

console.log('开始添加基于实际页面内容的园长功能AI知识库文档...');

for (const doc of principalPagesDocs) {
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
console.log('园长功能页面AI知识库文档添加完成！');