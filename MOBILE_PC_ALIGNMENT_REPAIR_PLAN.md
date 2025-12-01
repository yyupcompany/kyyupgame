# 移动端与PC端对齐修复计划

## 📋 项目概述

基于三个核心目录的对齐校验结果，制定详细的移动端与PC端功能对齐修复计划。

**校验结果总结**：
- **centers/目录对齐度**: 85% - 需补充5个Marketing组件
- **teacher-center/目录对齐度**: 39% - 需补充45个文件
- **parent-center/目录对齐度**: 严重不对齐 - 需补充33个文件
- **API接口对齐度**: 89.5% - 需统一调用方式和参数格式
- **业务逻辑对齐度**: 85% - 核心功能基本一致

## 🎯 修复目标

1. **文件对齐**: 移动端与PC端文件结构完全对齐
2. **功能对齐**: 确保移动端具备PC端所有功能
3. **API对齐**: 统一API调用方式和响应格式
4. **样式对齐**: 统一设计系统、主题和布局
5. **体验对齐**: 确保用户交互体验一致

## 📁 全局架构标准

### 设计系统
- **全局样式**: `src/styles/` - 统一的CSS变量和设计令牌
- **主题系统**: 明亮主题 + 暗黑主题，基于CSS变量
- **组件库**: Element Plus (PC端) + Vant (移动端) + 统一设计令牌

### 布局标准
- **移动端布局**: `src/layouts/MobileLayout.vue`
  - **头部**: `src/layouts/mobile/MobileHeader.vue` - 统一导航栏
  - **中部**: 动态内容区域，基于路由
  - **底部**: `src/layouts/mobile/MobileTabBar.vue` - 统一底部导航

### 代码规范
- **命名规范**: PC端使用PascalCase，移动端使用MobileXXX前缀
- **API调用**: 统一使用`src/api/`模块
- **类型定义**: 统一TypeScript接口
- **错误处理**: 统一的错误处理机制

## 🚀 第一阶段：紧急修复（游戏和核心模块）

### Task 1: Parent-Center游戏模块修复 🔴
**负责模块**: parent-center/games/play/
**目标文件**: 9个游戏文件 + 支持组件
**优先级**: 最高 - 影响用户体验

**需要修复的文件**:
```
移动端缺失:
├── games/play/AnimalObserver.vue (需创建)
├── games/play/ColorSorting.vue (需创建)
├── games/play/DinosaurMemory.vue (需创建)
├── games/play/DollhouseTidy.vue (需创建)
├── games/play/FruitSequence.vue (需创建)
├── games/play/PrincessGarden.vue (需创建)
├── games/play/PrincessMemory.vue (需创建)
├── games/play/RobotFactory.vue (需创建)
└── games/play/SpaceTreasure.vue (需创建)

参考PC端:
└── /src/pages/parent-center/games/play/
```

### Task 2: Teacher-Center创意课程模块修复 🔴
**负责模块**: teacher-center/creative-curriculum/
**目标文件**: 16个组件文件 + 服务支持
**优先级**: 最高 - 核心教学功能

**需要修复的文件**:
```
移动端缺失:
├── creative-curriculum/components/AICurriculumAssistant.vue (需创建)
├── creative-curriculum/components/CodeEditor.vue (需创建)
├── creative-curriculum/components/CodeTypewriter.vue (需创建)
├── creative-curriculum/components/CurriculumPreview.vue (需创建)
├── creative-curriculum/components/CurriculumStatCard.vue (需创建)
├── creative-curriculum/components/ImageCarousel.vue (需创建)
├── creative-curriculum/components/KeyboardShortcuts.vue (需创建)
├── creative-curriculum/components/ProgressPanel.vue (需创建)
├── creative-curriculum/components/ScheduleBuilder.vue (需创建)
├── creative-curriculum/components/TemplateSelector.vue (需创建)
├── creative-curriculum/components/TypingCodeDisplay.vue (需创建)
├── creative-curriculum/components/VideoPlayer.vue (需创建)
├── creative-curriculum/services/ai-curriculum.service.ts (需创建)
├── creative-curriculum/types/curriculum.ts (需创建)
└── creative-curriculum/utils/curriculum-templates.ts (需创建)

参考PC端:
└── /src/pages/teacher-center/creative-curriculum/
```

### Task 3: Teacher-Center客户跟进模块修复 🔴
**负责模块**: teacher-center/customer-tracking/
**目标文件**: 15个业务组件
**优先级**: 最高 - 核心业务流程

**需要修复的文件**:
```
移动端缺失:
├── customer-tracking/components/AISuggestionPanel.vue (需创建)
├── customer-tracking/components/ConversationTimeline.vue (需创建)
├── customer-tracking/components/ConversionFunnel.vue (需创建)
├── customer-tracking/components/CreateCustomerDialog.vue (需创建)
├── customer-tracking/components/CustomerCard.vue (需创建)
├── customer-tracking/components/CustomerInfoCard.vue (需创建)
├── customer-tracking/components/CustomerList.vue (需创建)
├── customer-tracking/components/DataStatistics.vue (需创建)
├── customer-tracking/components/FollowRecord.vue (需创建)
├── customer-tracking/components/ScreenshotUpload.vue (需创建)
├── customer-tracking/components/SOPProgressCard.vue (需创建)
├── customer-tracking/components/SOPStageFlow.vue (需创建)
├── customer-tracking/components/SuccessProbabilityCard.vue (需创建)
├── customer-tracking/components/TaskItem.vue (需创建)
└── customer-tracking/components/TrackingStatCard.vue (需创建)

参考PC端:
└── /src/pages/teacher-center/customer-tracking/
```

### Task 4: Teacher-Center教学管理模块修复 🟡
**负责模块**: teacher-center/teaching/
**目标文件**: 7个教学组件
**优先级**: 高 - 教学核心功能

**需要修复的文件**:
```
移动端缺失:
├── teaching/components/ClassManagement.vue (需创建)
├── teaching/components/MediaUpload.vue (需创建)
├── teaching/components/StudentManagement.vue (需创建)
├── teaching/components/TeachingProgress.vue (需创建)
├── teaching/components/TeachingRecordDialog.vue (需创建)
├── teaching/components/TeachingRecord.vue (需创建)
└── teaching/components/TeachingStatCard.vue (需创建)

参考PC端:
└── /src/pages/teacher-center/teaching/
```

### Task 5: Centers-Marketing组件修复 🟡
**负责模块**: centers/marketing/
**目标文件**: 5个营销组件
**优先级**: 高 - 业务营销功能

**需要修复的文件**:
```
移动端缺失:
├── marketing-center/components/PersonalContributionTab.vue (需创建)
├── marketing-center/components/ReferralRewardsTab.vue (需创建)
├── marketing-center/components/RewardDetailDialog.vue (需创建)
├── marketing-center/components/RewardSettingsTab.vue (需创建)
└── marketing-center/components/TeamRankingTab.vue (需创建)

参考PC端:
└── /src/pages/centers/marketing/components/
```

## 🛠️ 第二阶段：架构统一和样式对齐

### 全局设计系统
1. **创建统一设计令牌**
   - `src/styles/design-tokens.css` - 颜色、字体、间距
   - `src/styles/themes/light.css` - 明亮主题
   - `src/styles/themes/dark.css` - 暗黑主题

2. **统一移动端布局**
   - `src/layouts/MobileLayout.vue` - 主布局
   - `src/layouts/mobile/MobileHeader.vue` - 头部
   - `src/layouts/mobile/MobileTabBar.vue` - 底部

3. **API调用统一**
   - `src/api/unified-api.ts` - 统一API客户端
   - 统一错误处理和响应格式

## 📋 开发流程

### 每个Task开发流程:
1. **分析PC端文件结构** - 理解功能和实现
2. **创建移动端对应文件** - 保持功能一致性
3. **适配移动端交互** - 优化触摸和移动体验
4. **统一样式和主题** - 使用统一设计系统
5. **测试和验证** - 确保功能正常工作

### 质量标准:
- ✅ 功能与PC端完全一致
- ✅ 使用统一设计系统和主题
- ✅ 移动端交互优化
- ✅ 代码规范符合项目标准
- ✅ 响应式设计适配

## 🎯 预期成果

**第一阶段完成后**:
- 移动端与PC端文件对齐度提升至90%+
- 核心业务功能完全对齐
- 游戏模块恢复正常使用

**第二阶段完成后**:
- 实现完全的文件和功能对齐
- 统一的设计系统和用户体验
- 标准化的代码架构

## 📊 成功指标

- **文件对齐度**: 从67%提升至100%
- **功能覆盖率**: 从85%提升至100%
- **代码一致性**: API、样式、架构完全统一
- **用户体验**: 移动端与PC端体验一致

---

**开始执行修复计划，5个Task同步开发！** 🚀