import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lazy_ai_substitute_project'
});

const marketingCenterDocs = [
  {
    category: '营销中心',
    document_name: 'marketing_dashboard',
    document_description: '营销中心仪表板功能说明',
    document_content: `# 营销中心仪表板

## 页面概述
营销中心是营销活动管理和推广的中心枢纽，提供全面的营销数据分析和业务管理功能。

## 核心功能区域

### 1. 营销统计数据展示
- **活跃营销活动数量**：显示当前正在进行的营销活动数量和环比变化
- **本月新客户**：统计本月通过营销活动获得的新客户数量
- **转化率**：显示整体营销转化率和趋势变化
- **营销ROI**：计算营销投资回报率，评估营销效果

### 2. 快速操作
- **创建营销活动**：一键创建新的营销活动
- **活动管理**：快速访问活动列表和编辑功能

## 数据展示方式
- 统计卡片采用大字体数值显示
- 趋势变化用颜色区分（绿色上升，红色下降）
- 实时加载最新数据
- 支持数据刷新和自动更新

## 用户操作指南
1. 查看营销统计数据了解整体表现
2. 通过创建营销活动按钮启动新活动
3. 点击功能模块进入具体管理页面
4. 查看最近活动了解进展情况
5. 监控渠道表现优化推广策略`
  },
  {
    category: '营销中心',
    document_name: 'marketing_modules',
    document_description: '营销功能模块详解',
    document_content: `# 营销功能模块

## 六大核心模块

### 1. 营销活动 📢
- **功能描述**：创建和管理各种营销活动，包括促销、优惠券、推广活动
- **页面路径**：/marketing
- **主要功能**：
  - 活动创建和编辑
  - 活动状态管理
  - 参与人数统计
  - 效果分析

### 2. 推广渠道 📱
- **功能描述**：管理多种推广渠道，包括社交媒体、广告投放、合作伙伴
- **页面路径**：/advertisement
- **主要功能**：
  - 渠道配置管理
  - 投放效果监控
  - 成本控制
  - ROI分析

### 3. 营销分析 📊
- **功能描述**：深入分析营销效果，包括转化率、ROI、客户获取成本
- **页面路径**：/principal/marketing-analysis
- **主要功能**：
  - 数据可视化展示
  - 趋势分析报告
  - 多维度对比
  - 自定义分析

### 4. 营销自动化 🤖
- **功能描述**：设置自动化营销流程，包括邮件营销、客户跟进
- **页面路径**：/marketing/intelligent-engine/marketing-engine
- **主要功能**：
  - 自动化流程设计
  - 触发条件设置
  - 执行效果监控
  - 流程优化建议

### 5. 优惠券管理 🎫
- **功能描述**：创建和管理优惠券，设置使用规则和有效期
- **页面路径**：/centers/marketing/coupons
- **主要功能**：
  - 优惠券创建
  - 使用规则设置
  - 发放统计
  - 使用率分析

### 6. 咨询管理 📝
- **功能描述**：管理客户咨询，跟进咨询状态和处理结果
- **页面路径**：/centers/marketing/consultations
- **主要功能**：
  - 咨询记录管理
  - 处理状态跟进
  - 响应时间统计
  - 转化效果分析

## 模块间协作
- 营销活动与优惠券联动
- 推广渠道数据汇总到营销分析
- 咨询管理与营销自动化结合
- 所有模块数据统一呈现在仪表板`
  },
  {
    category: '营销中心',
    document_name: 'campaign_management',
    document_description: '营销活动管理功能',
    document_content: `# 营销活动管理

## 最近营销活动展示
营销中心展示最近3个营销活动的关键信息，帮助用户快速了解活动进展。

### 活动信息展示
- **活动标题**：清晰显示活动名称
- **活动描述**：简要说明活动内容和目标
- **活动状态**：
  - active（进行中）：蓝色标签
  - completed（已完成）：绿色标签
- **开始日期**：活动启动时间

### 活动统计数据
每个活动显示关键指标：
- **参与人数**：统计活动参与的总人数
- **转化率**：计算从参与到转化的比例

### 活动操作
- **查看按钮**：进入活动详情页面
- **编辑按钮**：修改活动设置和内容

## 创建营销活动
- 点击"创建营销活动"按钮打开创建对话框
- 使用CreateCampaignDialog组件处理活动创建
- 创建成功后自动刷新活动列表

## 活动数据来源
- 通过MarketingCenterService.getRecentCampaigns()获取数据
- 支持指定返回活动数量（默认3个）
- 数据加载失败时显示错误提示

## 响应式设计
- 活动列表采用弹性布局
- 在不同屏幕尺寸下自适应显示
- 操作按钮始终可见和可点击`
  },
  {
    category: '营销中心',
    document_name: 'channel_overview',
    document_description: '营销渠道概览功能',
    document_content: `# 营销渠道概览

## 渠道数据展示
营销中心提供各推广渠道的详细数据分析，帮助评估渠道效果和优化投入。

### 渠道信息结构
每个营销渠道包含以下信息：
- **渠道图标**：可视化标识渠道类型
- **渠道名称**：清晰标识渠道来源
- **渠道状态**：
  - active（活跃）：正常运行状态
  - paused（暂停）：临时停止投放

### 关键指标统计
每个渠道显示三个核心指标：

#### 1. 本月获客数量
- 统计当月通过该渠道获得的新客户数量
- 直观反映渠道的获客能力
- 支持环比分析

#### 2. 转化率
- 计算从访问到转化的比例
- 评估渠道质量的重要指标
- 以百分比形式显示

#### 3. 获客成本
- 计算每获得一个客户的平均成本
- 以人民币形式显示（¥符号）
- 用于ROI计算和成本控制

## 渠道网格布局
- 采用响应式网格布局
- 每个渠道卡片包含完整信息
- 最小宽度250px确保内容可读性
- 自动适应不同屏幕尺寸

## 数据加载机制
- 通过MarketingCenterService.getChannels()获取渠道数据
- 支持实时数据更新
- 加载失败时显示友好错误提示
- 数据异步加载提升用户体验

## 渠道状态管理
- 状态用不同颜色区分
- 活跃状态：蓝色主题
- 暂停状态：橙色警告主题
- 状态变更即时反映在界面上`
  }
];

console.log('开始添加基于实际页面内容的营销中心AI知识库文档...');

for (const doc of marketingCenterDocs) {
  try {
    const [result] = await connection.execute(
      'INSERT INTO ai_knowledge_base (category, document_name, document_description, document_content, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [doc.category, doc.document_name, doc.document_description, doc.document_content]
    );
    
    console.log(`✅ 成功添加文档: ${doc.document_name} (ID: ${result.insertId})`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`⚠️  文档已存在: ${doc.document_name}`);
    } else {
      console.error(`❌ 添加文档失败: ${doc.document_name}`, error.message);
    }
  }
}

await connection.end();
console.log('营销中心AI知识库文档添加完成！');