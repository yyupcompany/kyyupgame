# 家长端页面完整测试清单

## 🎯 测试目标
确保家长端所有8个菜单页面100%可用，无bug

---

## 📋 测试清单

### 1. 我的首页 (`/parent-center/dashboard`)

**页面功能**:
- [ ] 欢迎信息显示
- [ ] 统计卡片显示（我的孩子、测评记录、活动报名、未读消息）
- [ ] 最近活动列表
- [ ] 最新通知列表
- [ ] 孩子成长概览
- [ ] "查看更多"按钮跳转
- [ ] "管理孩子"按钮跳转

**API调用**:
- `GET /api/parent/dashboard-stats`
- `GET /api/parent/recent-activities`
- `GET /api/parent/notifications`
- `GET /api/parent/children`

**预期问题**:
- Dashboard可能调用了admin的API
- 需要家长专用的dashboard API

---

### 2. 我的孩子 (`/parent-center/children`)

**页面功能**:
- [ ] 孩子列表展示
- [ ] 添加孩子按钮
- [ ] 编辑孩子信息
- [ ] 查看孩子成长
- [ ] 删除孩子（需确认）

**API调用**:
- `GET /api/parent/children`
- `POST /api/parent/children`
- `PUT /api/parent/children/:id`
- `DELETE /api/parent/children/:id`

---

### 3. 发育测评 (`/parent-center/assessment`)

**页面功能**:
- [ ] 测评历史记录列表
- [ ] "开始新测评"按钮 → /parent-center/assessment/start
- [ ] 查看测评报告按钮
- [ ] 分享测评报告

**子页面测试**:

#### 3.1 开始测评 (`/parent-center/assessment/start`)
- [ ] 表单显示（姓名、年龄、性别、电话）
- [ ] 表单验证（必填、手机号格式）
- [ ] "开始测评"按钮提交
- [ ] 跳转到测评进行页

#### 3.2 测评进行中 (`/parent-center/assessment/doing/:recordId`)
- [ ] 进度条显示
- [ ] 题目标题显示
- [ ] 维度标签显示
- [ ] **音频播放器显示**
- [ ] **音频自动播放**
- [ ] 播放/暂停按钮
- [ ] 重播按钮
- [ ] **图片显示**
- [ ] 图片点击预览
- [ ] 选项单选框
- [ ] 答案选择后启用"下一题"按钮
- [ ] "上一题"按钮
- [ ] 最后一题显示"完成测评"
- [ ] 完成后跳转到报告页

#### 3.3 测评报告 (`/parent-center/assessment/report/:recordId`)
- [ ] 发育商（DQ）显示
- [ ] 各维度得分雷达图
- [ ] AI成长建议
- [ ] 分享按钮
- [ ] 下载按钮
- [ ] 返回按钮

#### 3.4 成长轨迹 (`/parent-center/assessment/growth-trajectory`)
- [ ] 多次测评的成长曲线
- [ ] 发育商变化趋势图
- [ ] 各维度对比

---

### 4. 脑开发游戏 (`/parent-center/games`)

**页面功能**:
- [ ] 游戏列表展示
- [ ] 游戏卡片（图标、名称、简介）
- [ ] "开始游戏"按钮
- [ ] 游戏分类筛选

**子页面测试**:

#### 4.1 游戏记录 (`/parent-center/games/records`)
- [ ] 游戏历史记录
- [ ] 得分显示
- [ ] 游戏时长
- [ ] 查看详情

#### 4.2 我的成就 (`/parent-center/games/achievements`)
- [ ] 成就徽章展示
- [ ] 解锁/未解锁状态
- [ ] 成就进度条
- [ ] 成就说明

---

### 5. 成长报告 (`/parent-center/child-growth`)

**页面功能**:
- [ ] 选择孩子下拉框
- [ ] 成长数据图表
- [ ] 身高体重曲线
- [ ] 发育里程碑
- [ ] 导出报告按钮

---

### 6. 活动报名 (`/parent-center/activities`)

**页面功能**:
- [ ] 活动列表展示
- [ ] 活动海报/封面
- [ ] 活动时间、地点
- [ ] 报名状态（已报名/未报名）
- [ ] "立即报名"按钮
- [ ] 取消报名按钮
- [ ] 查看活动详情

---

### 7. AI育儿助手 (`/parent-center/ai-assistant`)

**页面功能**:
- [ ] AI对话界面
- [ ] 消息输入框
- [ ] 发送按钮
- [ ] 消息历史记录
- [ ] 快捷问题按钮
- [ ] 清空对话按钮

---

### 8. 分享统计 (`/parent-center/share-stats`)

**页面功能**:
- [ ] 总分享次数
- [ ] 总播放次数
- [ ] 触达人数
- [ ] 互动率
- [ ] 分享记录列表
- [ ] 转发次数、播放次数
- [ ] "查看详情"按钮
- [ ] "刷新数据"按钮

---

## 🐛 已知问题记录

### 问题1: Dashboard显示业务中心概览
- **位置**: `/parent-center/dashboard`
- **现象**: 显示admin的业务中心数据
- **原因**: Dashboard页面可能调用了通用API
- **状态**: ⏳ 待修复

### 问题2: 侧边栏菜单无法点击
- **位置**: 侧边栏菜单项
- **现象**: 点击无反应
- **状态**: ⏳ 待验证

---

## ✅ 测试通过标准

- [ ] 所有页面正常加载，无404
- [ ] 所有按钮可点击，有反馈
- [ ] 所有API调用成功
- [ ] 图片正常显示
- [ ] 音频正常播放
- [ ] 无JavaScript错误
- [ ] 无403权限错误
- [ ] 数据正常展示
- [ ] 交互逻辑正确
- [ ] 无UI错位或样式问题

---

**测试开始时间**: 2025-10-31
**测试人员**: AI Assistant
**测试环境**: http://localhost:5173
**测试账号**: test_parent / admin123

