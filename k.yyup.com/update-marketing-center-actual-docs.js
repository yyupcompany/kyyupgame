import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lazy_ai_substitute_project'
});

// 先删除旧的营销中心文档
console.log('删除旧的营销中心AI知识库文档...');
await connection.execute(
  "DELETE FROM ai_knowledge_base WHERE category = '营销中心'"
);

const marketingCenterDocs = [
  {
    category: '营销中心',
    document_name: 'marketing_center_dashboard',
    document_description: '营销中心主仪表板功能说明',
    document_content: `# 营销中心主仪表板

## 页面概述
营销中心是营销活动管理和推广的中心枢纽，您可以创建营销活动、管理推广渠道、分析营销效果。

## 主要功能区域

### 1. 欢迎区域
- **页面介绍**：欢迎来到营销中心
- **功能说明**：这里是营销活动管理和推广的中心枢纽，您可以创建营销活动、管理推广渠道、分析营销效果
- **快速操作**：创建营销活动按钮，直接打开活动创建对话框

### 2. 营销统计数据展示
显示四个核心营销指标：
- **活跃营销活动**：当前正在进行的营销活动数量及环比变化
- **本月新客户**：通过营销活动获得的新客户数量及趋势
- **转化率**：整体营销转化率百分比及变化趋势
- **营销ROI**：营销投资回报率百分比及效果评估

每个统计卡片都显示：
- 主要数值（大字体显示）
- 环比变化趋势（正向为绿色，负向为红色）
- 对比时间说明

### 3. 营销功能模块
提供6个核心营销功能模块：

#### 📢 营销活动
- **路径**：/marketing
- **功能**：创建和管理各种营销活动，包括促销、优惠券、推广活动

#### 📱 推广渠道  
- **路径**：/advertisement
- **功能**：管理多种推广渠道，包括社交媒体、广告投放、合作伙伴

#### 📊 营销分析
- **路径**：/principal/marketing-analysis
- **功能**：深入分析营销效果，包括转化率、ROI、客户获取成本

#### 🤖 营销自动化
- **路径**：/marketing/intelligent-engine/marketing-engine
- **功能**：设置自动化营销流程，包括邮件营销、客户跟进

#### 🎫 优惠券管理
- **路径**：/centers/marketing/coupons
- **功能**：创建和管理优惠券，设置使用规则和有效期

#### 📝 咨询管理
- **路径**：/centers/marketing/consultations
- **功能**：管理客户咨询，跟进咨询状态和处理结果

## 数据加载机制
- 统计数据通过MarketingCenterService.getStatistics()获取
- 最近活动通过MarketingCenterService.getRecentCampaigns(3)获取
- 渠道数据通过MarketingCenterService.getChannels()获取
- 支持异步加载和错误处理`
  },
  {
    category: '营销中心',
    document_name: 'recent_campaigns_display',
    document_description: '最近营销活动展示功能',
    document_content: `# 最近营销活动展示

## 功能概述
营销中心展示最近3个营销活动的关键信息，帮助用户快速了解活动进展和效果。

## 活动信息展示

### 活动基本信息
每个活动卡片显示：
- **活动标题**：营销活动的完整名称
- **活动描述**：活动内容和目标的简要说明
- **开始日期**：活动启动的具体时间
- **活动状态**：
  - **active（进行中）**：蓝色标签，表示活动正在进行
  - **completed（已完成）**：绿色标签，表示活动已结束

### 关键统计指标
每个活动展示两个核心指标：

#### 参与人数
- 统计活动参与的总人数
- 直接反映活动的吸引力和覆盖面
- 数值显示在活动卡片右侧

#### 转化率
- 计算从参与到实际转化的比例
- 以百分比形式显示
- 评估活动效果的重要指标

## 操作功能

### 查看活动
- **查看按钮**：点击查看活动的详细信息
- 功能：调用viewCampaign(campaign.id)方法
- 当前显示信息提示，具体查看功能开发中

### 编辑活动
- **编辑按钮**：修改活动设置和内容
- 功能：调用editCampaign(campaign.id)方法
- 当前显示信息提示，具体编辑功能开发中

## 活动创建流程

### 创建营销活动
- 点击页面顶部"创建营销活动"按钮
- 打开CreateCampaignDialog组件
- 填写活动信息并保存
- 创建成功后自动刷新活动列表

### 数据更新机制
- 活动创建成功后调用handleCampaignCreated回调
- 自动执行loadRecentCampaigns()重新加载数据
- 确保活动列表实时更新

## 响应式设计
- 活动列表采用弹性布局
- 支持不同屏幕尺寸的自适应显示
- 操作按钮在各种设备上都保持良好的可用性

## 数据获取
- 通过MarketingCenterService.getRecentCampaigns(3)获取数据
- 限制显示最近3个活动，保持页面简洁
- 支持异步加载和错误处理
- 加载失败时显示友好的错误提示`
  },
  {
    category: '营销中心',
    document_name: 'marketing_channels_overview',
    document_description: '营销渠道概览功能详解',
    document_content: `# 营销渠道概览

## 功能概述
营销渠道概览提供各推广渠道的详细数据分析，帮助评估渠道效果和优化营销投入。

## 渠道信息结构

### 渠道基本信息
每个营销渠道卡片包含：
- **渠道图标**：可视化标识渠道类型（emoji图标）
- **渠道名称**：清晰标识渠道来源和类型
- **渠道状态**：当前运营状态标识

### 渠道状态管理
支持两种渠道状态：
- **active（活跃）**：
  - 渠道正常运行状态
  - 用蓝色主题色显示
  - 表示渠道正在投放和获客
- **paused（暂停）**：
  - 渠道临时停止投放状态
  - 用橙色警告色显示
  - 表示渠道暂时停止活动

## 核心数据指标

### 1. 本月获客数量
- **指标说明**：统计当月通过该渠道获得的新客户数量
- **业务价值**：直观反映渠道的获客能力和效果
- **显示方式**：整数形式显示具体人数
- **用途**：用于渠道间获客能力对比

### 2. 转化率
- **指标说明**：计算从访问到最终转化的比例
- **计算方式**：转化客户数 ÷ 总访问量 × 100%
- **显示方式**：百分比形式，保留一位小数
- **重要性**：评估渠道质量的核心指标

### 3. 获客成本
- **指标说明**：计算每获得一个客户的平均投入成本
- **计算方式**：总投入费用 ÷ 获得客户数
- **显示方式**：人民币金额，使用¥符号
- **应用场景**：ROI计算和成本控制决策

## 数据展示设计

### 网格布局
- 采用响应式CSS Grid布局
- 每个渠道卡片最小宽度250px
- 自动适应不同屏幕尺寸
- 卡片间距合理，视觉效果良好

### 卡片结构
每个渠道卡片包含：
1. **卡片头部**：渠道图标 + 渠道名称
2. **数据区域**：三个关键指标的数值展示
3. **状态区域**：渠道当前状态标识

### 数据格式化
- 获客数量：直接显示数字
- 转化率：百分比格式，如"12.5%"
- 获客成本：货币格式，如"¥150"

## 数据管理

### 数据来源
- 通过MarketingCenterService.getChannels()API获取
- 包含所有渠道的完整数据
- 支持实时数据更新

### 错误处理
- API调用失败时显示友好错误提示
- 不影响其他功能模块的正常使用
- 支持数据重试和恢复机制

### 性能优化
- 数据异步加载，提升用户体验
- 与其他数据请求并行处理
- 合理的加载状态显示`
  },
  {
    category: '营销中心',
    document_name: 'marketing_module_navigation',
    document_description: '营销功能模块导航说明',
    document_content: `# 营销功能模块导航

## 模块导航概述
营销中心提供6个核心功能模块，每个模块都有明确的业务定位和页面路径。

## 模块详细介绍

### 1. 营销活动模块 📢
- **页面路径**：/marketing
- **核心功能**：创建和管理各种营销活动，包括促销、优惠券、推广活动
- **业务场景**：
  - 新产品推广活动
  - 节假日促销活动
  - 会员专属活动
  - 品牌宣传活动
- **主要操作**：活动创建、编辑、状态管理、效果统计

### 2. 推广渠道模块 📱
- **页面路径**：/advertisement
- **核心功能**：管理多种推广渠道，包括社交媒体、广告投放、合作伙伴
- **渠道类型**：
  - 社交媒体推广
  - 在线广告投放
  - 合作伙伴渠道
  - 线下推广活动
- **管理功能**：渠道配置、投放监控、效果分析

### 3. 营销分析模块 📊
- **页面路径**：/principal/marketing-analysis
- **核心功能**：深入分析营销效果，包括转化率、ROI、客户获取成本
- **分析维度**：
  - 渠道效果对比
  - 时间趋势分析
  - 客户转化漏斗
  - 成本效益分析
- **报表功能**：数据可视化、自定义报表、导出功能

### 4. 营销自动化模块 🤖
- **页面路径**：/marketing/intelligent-engine/marketing-engine
- **核心功能**：设置自动化营销流程，包括邮件营销、客户跟进
- **自动化场景**：
  - 新客户欢迎流程
  - 客户生日祝福
  - 产品推荐
  - 流失客户挽回
- **智能功能**：触发条件设置、个性化内容、效果追踪

### 5. 优惠券管理模块 🎫
- **页面路径**：/centers/marketing/coupons
- **核心功能**：创建和管理优惠券，设置使用规则和有效期
- **优惠券类型**：
  - 满减券
  - 折扣券
  - 免费体验券
  - 新人专享券
- **管理功能**：发放控制、使用统计、有效期管理

### 6. 咨询管理模块 📝
- **页面路径**：/centers/marketing/consultations
- **核心功能**：管理客户咨询，跟进咨询状态和处理结果
- **咨询渠道**：
  - 在线客服咨询
  - 电话咨询
  - 邮件咨询
  - 表单咨询
- **管理流程**：接收、分配、跟进、反馈、归档

## 导航实现机制

### 页面跳转
- 使用Vue Router进行页面导航
- 调用navigateTo(path)方法进行路由跳转
- 支持错误处理和友好提示

### 错误处理
- 页面无法访问时显示警告信息
- 提示用户稍后再试
- 不影响其他功能的正常使用

### 用户体验
- 模块卡片采用统一的交互设计
- 鼠标悬停有视觉反馈效果
- 点击跳转流畅自然
- 图标和描述清晰易懂

## 模块间协作
- 营销活动与优惠券联动使用
- 推广渠道数据汇总到营销分析
- 咨询管理与营销自动化结合
- 所有模块数据统一在仪表板展示`
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
    console.error(`❌ 添加文档失败: ${doc.document_name}`, error.message);
  }
}

await connection.end();
console.log('营销中心AI知识库文档更新完成！');