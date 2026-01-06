# 教师客户跟踪SOP系统 - 功能树结构

## 🌲 完整功能树（从侧边栏开始）

```
📱 幼儿园管理系统
│
├─ 🏠 工作台 (/dashboard)
│
├─ 🏫 教师中心 (/teacher-center)
│  │
│  ├─ 📊 教师工作台 (/teacher-center/dashboard)
│  │  └─ 个人工作概览、待办事项、数据统计
│  │
│  ├─ 🔔 通知中心 (/teacher-center/notifications)
│  │  ├─ 通知列表
│  │  └─ 通知详情 (/teacher-center/notifications/:id)
│  │
│  ├─ ✅ 任务中心 (/teacher-center/tasks)
│  │  ├─ 任务列表
│  │  ├─ 创建任务 (/teacher-center/tasks/create)
│  │  └─ 任务详情 (/teacher-center/tasks/:id)
│  │
│  ├─ 📅 活动中心 (/teacher-center/activities)
│  │  └─ 活动管理、活动参与
│  │
│  ├─ 🎓 招生中心 (/teacher-center/enrollment)
│  │  ├─ 招生客户列表
│  │  └─ 客户详情 (/teacher-center/enrollment/customers/:id)
│  │
│  ├─ 📚 教学中心 (/teacher-center/teaching)
│  │  ├─ 课程管理
│  │  ├─ 课程详情 (/teacher-center/teaching/course/:id)
│  │  ├─ 媒体上传 (/teacher-center/teaching/media-upload)
│  │  └─ 课程表 (/teacher-center/teaching/schedule)
│  │
│  └─ 👥 客户跟踪 (/teacher-center/customer-tracking) ⭐ **SOP系统入口**
│     │
│     ├─ 📋 客户列表页面
│     │  ├─ 客户筛选（按阶段、状态、成功概率）
│     │  ├─ 客户搜索
│     │  ├─ 客户卡片展示
│     │  │  ├─ 客户基本信息
│     │  │  ├─ 当前SOP阶段
│     │  │  ├─ 阶段进度条
│     │  │  ├─ 成功概率
│     │  │  └─ 快速操作按钮
│     │  └─ 新建客户按钮
│     │
│     └─ 📱 客户详情页面 (/teacher-center/customer-tracking/:customerId) ⭐ **SOP核心页面**
│        │
│        ├─ 📊 顶部概览区
│        │  ├─ 客户基本信息卡片
│        │  │  ├─ 客户姓名、联系方式
│        │  │  ├─ 孩子信息
│        │  │  ├─ 来源渠道
│        │  │  └─ 创建时间
│        │  │
│        │  ├─ SOP进度卡片
│        │  │  ├─ 当前阶段名称
│        │  │  ├─ 阶段进度百分比
│        │  │  ├─ 已完成任务数/总任务数
│        │  │  └─ 预计完成时间
│        │  │
│        │  └─ 成功概率卡片
│        │     ├─ 成功概率百分比
│        │     ├─ 概率趋势图
│        │     └─ 影响因素分析
│        │
│        ├─ 🎯 SOP阶段流程区（核心功能）
│        │  │
│        │  ├─ 阶段导航条
│        │  │  ├─ 阶段1: 初次接触 ✅
│        │  │  ├─ 阶段2: 需求挖掘 🔄
│        │  │  ├─ 阶段3: 方案呈现 ⏳
│        │  │  ├─ 阶段4: 异议处理 ⏳
│        │  │  ├─ 阶段5: 临门一脚 ⏳
│        │  │  ├─ 阶段6: 成交签约 ⏳
│        │  │  └─ 阶段7: 售后服务 ⏳
│        │  │
│        │  └─ 当前阶段详情面板
│        │     │
│        │     ├─ 📝 阶段信息
│        │     │  ├─ 阶段名称
│        │     │  ├─ 阶段描述
│        │     │  ├─ 预计用时
│        │     │  └─ 成功标志
│        │     │
│        │     ├─ ✅ 任务清单
│        │     │  ├─ 任务1: 自我介绍
│        │     │  │  ├─ 任务标题
│        │     │  │  ├─ 任务描述
│        │     │  │  ├─ 预计时间
│        │     │  │  ├─ 完成状态
│        │     │  │  ├─ 任务指导
│        │     │  │  │  ├─ 执行步骤
│        │     │  │  │  ├─ 实用技巧
│        │     │  │  │  └─ 话术示例
│        │     │  │  └─ 🤖 AI建议按钮
│        │     │  │
│        │     │  ├─ 任务2: 了解基本信息
│        │     │  │  └─ （同上结构）
│        │     │  │
│        │     │  └─ 任务3: 建立信任
│        │     │     └─ （同上结构）
│        │     │
│        │     ├─ 💬 话术模板
│        │     │  ├─ 开场白
│        │     │  ├─ 核心话术
│        │     │  └─ 结束语
│        │     │
│        │     ├─ ❓ 常见问题FAQ
│        │     │  ├─ 问题1
│        │     │  │  ├─ 客户问题
│        │     │  │  ├─ 建议回答
│        │     │  │  └─ 应对技巧
│        │     │  └─ 问题2...
│        │     │
│        │     └─ 🎯 阶段操作
│        │        ├─ 完成当前阶段按钮
│        │        └─ 推进到下一阶段按钮
│        │
│        ├─ 💬 对话记录区
│        │  │
│        │  ├─ 对话时间线
│        │  │  ├─ 对话1
│        │  │  │  ├─ 发言人（教师/客户）
│        │  │  │  ├─ 对话内容
│        │  │  │  ├─ 消息类型（文字/图片/语音/视频）
│        │  │  │  ├─ 情感分析标签
│        │  │  │  └─ 时间戳
│        │  │  └─ 对话2...
│        │  │
│        │  ├─ 对话输入框
│        │  │  ├─ 文字输入
│        │  │  ├─ 表情选择
│        │  │  ├─ 图片上传
│        │  │  └─ 发送按钮
│        │  │
│        │  ├─ 📸 截图上传区
│        │  │  ├─ 上传截图按钮
│        │  │  ├─ 截图预览
│        │  │  └─ 🤖 AI分析截图按钮
│        │  │
│        │  └─ 批量导入对话
│        │     └─ 从聊天记录导入
│        │
│        ├─ 🤖 AI智能建议区
│        │  │
│        │  ├─ 任务级AI建议
│        │  │  ├─ 获取建议按钮
│        │  │  └─ 建议内容展示
│        │  │     ├─ 沟通策略
│        │  │     │  ├─ 策略标题
│        │  │     │  ├─ 策略描述
│        │  │     │  └─ 关键要点
│        │  │     ├─ 推荐话术
│        │  │     │  ├─ 开场白
│        │  │     │  ├─ 核心话术（3-5条）
│        │  │     │  └─ 异议应对
│        │  │     ├─ 下一步行动
│        │  │     │  ├─ 行动标题
│        │  │     │  ├─ 行动描述
│        │  │     │  ├─ 建议时机
│        │  │     │  └─ 实用技巧
│        │  │     └─ 成功概率分析
│        │  │        ├─ 预测概率
│        │  │        └─ 影响因素
│        │  │
│        │  ├─ 全局AI分析
│        │  │  ├─ 获取分析按钮
│        │  │  └─ 分析内容展示
│        │  │     ├─ 客户画像分析
│        │  │     ├─ 当前阶段评估
│        │  │     ├─ 整体策略建议
│        │  │     ├─ 成交概率分析
│        │  │     └─ 下一步行动计划
│        │  │
│        │  └─ AI建议历史
│        │     ├─ 历史记录列表
│        │     ├─ 建议应用状态
│        │     └─ 建议反馈评分
│        │
│        ├─ 📊 数据统计区
│        │  ├─ 沟通频率图表
│        │  ├─ 情感分析图表
│        │  ├─ 阶段进度图表
│        │  └─ 成功概率趋势图
│        │
│        └─ 🔧 操作工具栏
│           ├─ 编辑客户信息
│           ├─ 添加备注
│           ├─ 设置提醒
│           ├─ 导出报告
│           └─ 返回列表
│
└─ 其他中心...
```

---

## 🎯 SOP系统访问路径

### 方式1: 从侧边栏进入（推荐）

```
1. 登录系统（教师角色）
2. 点击侧边栏 "👥 客户跟踪"
3. 进入客户列表页面
4. 点击某个客户卡片
5. 进入客户详情页面（SOP核心页面）
```

### 方式2: 从招生中心进入

```
1. 登录系统（教师角色）
2. 点击侧边栏 "🎓 招生中心"
3. 查看招生客户列表
4. 点击客户详情
5. 在详情页面点击"SOP跟踪"按钮
6. 跳转到客户跟踪SOP页面
```

### 方式3: 从工作台快捷入口

```
1. 登录系统（教师角色）
2. 在工作台看到"我的客户"卡片
3. 点击客户卡片
4. 直接进入SOP跟踪页面
```

---

## 📱 页面路由结构

### 主要路由

| 路由路径 | 页面名称 | 组件路径 | 说明 |
|---------|---------|---------|------|
| `/teacher-center/customer-tracking` | 客户跟踪列表 | `pages/teacher-center/customer-tracking/index.vue` | SOP系统入口 |
| `/teacher-center/customer-tracking/:customerId` | 客户SOP详情 | `pages/teacher-center/customer-tracking/detail.vue` | SOP核心页面 |
| `/teacher-center/customer-tracking/:customerId/sop` | SOP流程页面 | `pages/teacher-center/customer-tracking/sop/index.vue` | 完整SOP流程 |

### 子路由（可选）

| 路由路径 | 页面名称 | 说明 |
|---------|---------|------|
| `/teacher-center/customer-tracking/:customerId/conversations` | 对话记录 | 独立对话页面 |
| `/teacher-center/customer-tracking/:customerId/ai-analysis` | AI分析 | 独立AI分析页面 |
| `/teacher-center/customer-tracking/:customerId/statistics` | 数据统计 | 独立统计页面 |

---

## 🎨 页面组件结构

### 客户列表页面组件

```
pages/teacher-center/customer-tracking/
├─ index.vue                          # 主页面
└─ components/
   ├─ CustomerList.vue                # 客户列表
   ├─ CustomerCard.vue                # 客户卡片
   ├─ CustomerFilter.vue              # 筛选器
   ├─ CustomerSearch.vue              # 搜索框
   └─ CreateCustomerDialog.vue        # 新建客户对话框
```

### 客户详情页面组件（SOP核心）

```
pages/teacher-center/customer-tracking/
├─ detail.vue                         # 主详情页面
└─ components/
   ├─ CustomerOverview.vue            # 客户概览
   ├─ SOPProgress.vue                 # SOP进度
   ├─ SOPStageFlow.vue                # 阶段流程
   │  ├─ StageNavigation.vue          # 阶段导航
   │  ├─ StageDetail.vue              # 阶段详情
   │  ├─ TaskList.vue                 # 任务清单
   │  ├─ TaskItem.vue                 # 任务项
   │  ├─ ScriptTemplates.vue          # 话术模板
   │  └─ FAQList.vue                  # FAQ列表
   ├─ ConversationTimeline.vue        # 对话时间线
   │  ├─ ConversationItem.vue         # 对话项
   │  └─ ConversationInput.vue        # 对话输入
   ├─ ScreenshotUpload.vue            # 截图上传
   ├─ AISuggestion.vue                # AI建议
   │  ├─ TaskSuggestion.vue           # 任务建议
   │  ├─ GlobalAnalysis.vue           # 全局分析
   │  └─ SuggestionHistory.vue        # 建议历史
   ├─ DataStatistics.vue              # 数据统计
   └─ ActionToolbar.vue               # 操作工具栏
```

---

## 🔑 权限配置

### 需要的权限

```javascript
{
  code: 'TEACHER_CUSTOMER_TRACKING',
  name: '客户跟踪',
  type: 'menu',
  path: '/teacher-center/customer-tracking',
  permission: 'teacher:customer:tracking:view',
  icon: 'UserCheck',
  children: [
    {
      code: 'TEACHER_CUSTOMER_TRACKING_LIST',
      name: '客户列表',
      permission: 'teacher:customer:list'
    },
    {
      code: 'TEACHER_CUSTOMER_TRACKING_DETAIL',
      name: '客户详情',
      permission: 'teacher:customer:detail'
    },
    {
      code: 'TEACHER_CUSTOMER_TRACKING_SOP',
      name: 'SOP跟踪',
      permission: 'teacher:customer:sop:view'
    },
    {
      code: 'TEACHER_CUSTOMER_TRACKING_CONVERSATION',
      name: '对话管理',
      permission: 'teacher:customer:conversation:manage'
    },
    {
      code: 'TEACHER_CUSTOMER_TRACKING_AI',
      name: 'AI建议',
      permission: 'teacher:customer:ai:view'
    }
  ]
}
```

---

## 🎯 核心功能点击流程

### 1. 查看客户SOP进度

```
侧边栏 → 客户跟踪 → 客户列表 → 点击客户卡片 → 查看SOP进度条
```

### 2. 完成SOP任务

```
客户详情 → SOP阶段流程 → 任务清单 → 点击任务 → 查看任务指导 → 标记完成
```

### 3. 获取AI建议

```
客户详情 → 选择任务 → 点击"AI建议"按钮 → 查看AI生成的建议 → 应用建议
```

### 4. 添加对话记录

```
客户详情 → 对话记录区 → 输入对话内容 → 点击发送 → 对话自动添加到时间线
```

### 5. 上传截图分析

```
客户详情 → 截图上传区 → 选择截图 → 上传 → 点击"AI分析" → 查看分析结果
```

### 6. 推进SOP阶段

```
客户详情 → 完成所有任务 → 点击"推进到下一阶段" → 确认 → 进入下一阶段
```

---

## 📝 使用说明

1. **首次访问**: 教师登录后，在侧边栏可以看到"👥 客户跟踪"菜单项
2. **客户管理**: 在客户列表页面可以查看所有跟进中的客户
3. **SOP跟踪**: 点击客户进入详情页面，查看完整的SOP流程
4. **AI辅助**: 在任何阶段都可以获取AI智能建议
5. **进度管理**: 系统自动计算阶段进度和成功概率

---

**创建时间**: 2025-10-06  
**文档版本**: 1.0  
**适用角色**: 教师

