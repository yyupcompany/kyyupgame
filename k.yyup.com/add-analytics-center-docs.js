import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lazy_ai_substitute_project'
});

console.log('开始添加分析中心的AI知识库文档...');

// 先删除旧的分析中心文档
console.log('删除旧的分析中心AI知识库文档...');
await connection.execute(
  "DELETE FROM ai_knowledge_base WHERE category = '分析中心'"
);

const analyticsCenterDocs = [
  {
    category: '分析中心',
    document_name: 'analytics_center_overview',
    document_description: '数据分析中心功能概览',
    document_content: `# 数据分析中心概览

## 页面定位
数据分析中心是数据分析和报表的中心枢纽，提供全面的业务数据分析、趋势预测和智能洞察。

## 页面头部功能

### 欢迎区域设计
- **页面标题**：TrendCharts图标 + "欢迎来到数据分析中心"
- **功能描述**：提供全面的业务数据分析、趋势预测和智能洞察
- **视觉设计**：welcome-section统一的欢迎区域样式

### 操作工具栏
#### 刷新数据功能
- **刷新按钮**：handleRefresh函数，loading状态控制
- **图标设计**：Refresh图标提供视觉提示
- **状态管理**：:loading="loading"显示加载状态

#### 报表导出功能
- **导出下拉菜单**：el-dropdown组件实现多格式导出
- **支持格式**：Excel (.xlsx)、PDF (.pdf)、CSV (.csv)
- **导出处理**：exportReport(format)函数处理不同格式
- **用户体验**：ArrowDown图标指示下拉功能

## 选项卡系统

### 标签页架构
- **选项卡容器**：el-tabs组件，activeTab控制当前选项
- **标签切换**：handleTabClick处理标签页切换事件
- **样式设计**：center-tabs专用样式类

### 概览标签页功能
#### 核心统计数据展示
采用四个StatCard统计卡片展示关键指标：

#### 1. 数据总量统计
- **数据指标**：formatNumber(stats.totalRecords)格式化显示
- **图标标识**：database图标表示数据库
- **趋势分析**：stats.dataGrowth显示数据增长趋势
- **交互功能**：clickable点击跳转到数据详情

#### 2. 报表数量统计
- **数据指标**：stats.totalReports报表总数
- **图标标识**：document图标表示报表文档
- **增长统计**：stats.reportGrowth新增报表数量
- **导航功能**：点击跳转到报表详情页面

#### 3. 分析维度统计
- **数据指标**：stats.analysisDimensions可用分析维度
- **图标标识**：grid图标表示多维度分析
- **维度增长**：stats.dimensionGrowth新增分析维度
- **功能导航**：点击查看维度详情

#### 4. 数据质量统计
- **质量指标**：stats.dataQuality + '%'百分比显示
- **图标标识**：shield-check图标表示质量保障
- **质量提升**：stats.qualityImprovement质量改进数据
- **质量监控**：点击查看质量详情报告

## 分析功能模块

### 功能网格布局
采用features-grid网格布局展示六大分析功能：

#### 1. 招生分析模块 👥
- **功能图标**：UserFilled图标，primary主题色
- **分析内容**：学生招生数据统计与趋势分析
- **核心指标**：报名转化率、渠道效果等关键指标
- **导航路径**：navigateToFeature('enrollment')

#### 2. 财务分析模块 💰
- **功能图标**：Money图标，success主题色  
- **分析内容**：收入支出分析、成本控制统计
- **报告类型**：详细的财务状况报告
- **导航路径**：navigateToFeature('financial')

#### 3. 绩效分析模块 🏆
- **功能图标**：Trophy图标，info主题色
- **分析内容**：教师绩效评估、学生成长跟踪
- **分析范围**：全方位的绩效数据分析
- **导航路径**：navigateToFeature('performance')

#### 4. 活动分析模块 📅
- **功能图标**：Calendar图标，warning主题色
- **分析内容**：活动参与度统计、效果评估
- **优化目标**：帮助优化活动策划和执行
- **导航路径**：navigateToFeature('activity')

#### 5. 营销分析模块 📢
- **功能图标**：Promotion图标，danger主题色
- **分析内容**：营销活动效果分析、客户转化统计
- **业务目标**：提升营销ROI
- **导航路径**：navigateToFeature('marketing')

#### 6. 运营分析模块 ⚙️
- **功能图标**：Operation图标，primary主题色
- **分析内容**：系统运营数据分析、用户行为统计
- **优化方向**：优化运营策略
- **导航路径**：navigateToFeature('operations')

## 页面技术特色

### 1. 数据可视化
- **统计卡片**：StatCard组件统一的数据展示
- **趋势显示**：支持增长趋势和百分比显示
- **格式化处理**：formatNumber函数处理大数值显示

### 2. 交互体验
- **点击导航**：统计卡片和功能卡片都支持点击跳转
- **加载状态**：v-loading统一的加载状态管理
- **状态反馈**：操作过程中的实时状态反馈

### 3. 响应式设计
- **网格布局**：features-grid和stats-overview响应式网格
- **卡片设计**：统一的卡片式设计语言
- **主题色彩**：不同功能模块用不同主题色区分

### 4. 功能组织
- **模块化设计**：六大分析功能模块化组织
- **层次清晰**：从概览到具体功能的清晰信息层次
- **导航便捷**：便捷的功能导航和页面跳转机制`
  },
  {
    category: '分析中心',
    document_name: 'analytics_export_system',
    document_description: '数据导出和报表系统功能',
    document_content: `# 数据导出和报表系统

## 导出功能概述
分析中心提供多格式的数据导出功能，支持不同业务场景的报表需求。

## 导出格式支持

### 1. Excel格式导出 (.xlsx)
- **适用场景**：详细数据分析、数据处理、图表制作
- **数据完整性**：保持原始数据格式和精度
- **后续处理**：支持Excel中的进一步数据分析

### 2. PDF格式导出 (.pdf)
- **适用场景**：正式报告、打印文档、存档备份
- **格式固定**：保持报告的版面和格式不变
- **分享便利**：便于跨平台分享和查看

### 3. CSV格式导出 (.csv)
- **适用场景**：系统集成、数据导入、批量处理
- **兼容性强**：几乎所有系统都支持CSV格式
- **轻量级**：文件体积小，传输便捷

## 导出功能实现

### 下拉菜单设计
- **触发方式**：el-dropdown trigger="click"点击触发
- **菜单样式**：el-dropdown-menu统一的下拉菜单设计
- **选项组织**：el-dropdown-item包装每个导出选项

### 导出处理逻辑
- **统一接口**：exportReport(format)函数处理所有格式
- **格式参数**：'xlsx', 'pdf', 'csv'字符串标识不同格式
- **异步处理**：支持大数据量的异步导出处理

## 数据处理特色

### 1. 数据格式化
- **数值格式化**：formatNumber函数处理大数值显示
- **百分比处理**：自动添加%符号显示百分比数据
- **趋势数据**：增长趋势数据的格式化处理

### 2. 状态管理
- **加载状态**：loading状态控制数据加载显示
- **错误处理**：完善的数据导出错误处理机制
- **成功反馈**：导出成功后的用户反馈提示

### 3. 用户体验
- **操作便捷**：一键选择导出格式
- **状态可视**：导出过程中的状态可视化
- **格式说明**：清晰的格式选择说明

## 导航和跳转功能

### 详情页面导航
- **数据详情**：navigateToDetail('data')跳转到数据详情
- **报表详情**：navigateToDetail('reports')跳转到报表管理
- **维度详情**：navigateToDetail('dimensions')跳转到维度设置
- **质量详情**：navigateToDetail('quality')跳转到质量监控

### 功能模块导航
- **招生分析**：navigateToFeature('enrollment')
- **财务分析**：navigateToFeature('financial')
- **绩效分析**：navigateToFeature('performance')
- **活动分析**：navigateToFeature('activity')
- **营销分析**：navigateToFeature('marketing')
- **运营分析**：navigateToFeature('operations')

## 技术实现特点

### 1. 组件化设计
- **StatCard组件**：统一的统计数据展示组件
- **功能卡片**：feature-card统一的功能模块卡片
- **下拉菜单**：el-dropdown组件实现导出选择

### 2. 响应式布局
- **网格系统**：stats-overview和features-grid响应式网格
- **卡片适配**：不同屏幕尺寸下的卡片自适应
- **交互优化**：移动端和桌面端的交互优化

### 3. 数据驱动
- **动态数据**：stats对象驱动的动态数据展示
- **实时更新**：handleRefresh支持数据实时更新
- **状态同步**：数据状态与界面状态的实时同步`
  }
];

console.log('开始添加基于实际页面内容的分析中心AI知识库文档...');

for (const doc of analyticsCenterDocs) {
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
console.log('分析中心AI知识库文档添加完成！');