# 全站健康检测问题记录 - 002

**检测时间**: 2026-01-19
**检测范围**: 全站103个页面
**检测方式**: MCP浏览器工具 + 元素级测试

---

## 检测标准

### 1. 页面可用性
- [ ] 页面正常加载（无404/500）
- [ ] 路由存在且可访问
- [ ] 页面快照能获取DOM元素

### 2. 元素级测试
- [ ] CRUD操作可用
- [ ] 卡片组件正常渲染
- [ ] 列表组件正常渲染
- [ ] 分页组件正常

### 3. API测试
- [ ] 后端API调用成功
- [ ] 数据正确渲染到页面
- [ ] 服务器日志与页面数据一致
- [ ] 无API 403/401错误

### 4. 控制台检查
- [ ] 无JavaScript错误
- [ ] 无API请求失败
- [ ] 无组件渲染警告

---

## 问题记录

### 一、路由问题

| 页面 | 平台 | 问题描述 | 严重程度 | 发现时间 | 修复状态 |
|------|------|----------|----------|----------|----------|
| /teacher-center/class-contacts | PC | 路由未注册 (No match found for location) | high | 2026-01-19 | ✅ 已修复 |
| /teacher-center/customer-pool | PC | 路由未注册 (No match found for location) | high | 2026-01-19 | ✅ 已修复 |
| /mobile/business | Mobile | 路由不存在，使用错误路径 | high | 2026-01-19 | ✅ 已修复 |
| /mobile/activity | Mobile | 路由不存在，使用错误路径 | high | 2026-01-19 | ✅ 已修复 |

### 二、API问题

| 页面 | 平台 | 问题描述 | 严重程度 | 发现时间 | 修复状态 |
|------|------|----------|----------|----------|----------|
| /mobile/teacher-center/performance-rewards | Mobile | API 404: /principal-performance 返回404 | high | 2026-01-19 | ✅ 已修复 |
| /mobile/teacher-center/dashboard | Mobile | API路径错误导致403 | medium | 2026-01-17 | ✅ 已修复 |

### 三、权限问题

| 页面 | 平台 | 问题描述 | 严重程度 | 发现时间 |
|------|------|----------|----------|----------|
| /centers/activity | PC | teacher角色无权访问 | info | 2026-01-19 |
| /centers/enrollment | PC | teacher角色无权访问 | info | 2026-01-19 |
| /centers/business | PC | teacher角色无权访问 | info | 2026-01-19 |
| /parent-center/dashboard | PC | teacher角色无权访问 | info | 2026-01-19 |

### 四、已验证正常的页面

| 页面 | 平台 | 状态 | 发现时间 |
|------|------|------|----------|
| /teacher-center/dashboard | PC | 正常 | 2026-01-19 |
| /teacher-center/activities | PC | 正常 | 2026-01-19 |
| /teacher-center/attendance | PC | 正常 | 2026-01-19 |
| /teacher-center/appointment-management | PC | 正常 | 2026-01-19 |
| /teacher-center/creative-curriculum | PC | 正常 | 2026-01-19 |
| /teacher-center/customer-tracking | PC | 正常 | 2026-01-19 |
| /teacher-center/enrollment | PC | 正常 | 2026-01-19 |
| /teacher-center/notifications | PC | 正常 | 2026-01-19 |
| /teacher-center/performance-rewards | PC | 正常 | 2026-01-19 |
| /teacher-center/tasks | PC | 正常 | 2026-01-19 |
| /teacher-center/teaching | PC | 正常 | 2026-01-19 |
| /mobile/teacher-center/dashboard | Mobile | 路由正常(API权限问题) | 2026-01-19 |
| /mobile/teacher-center/activities | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/attendance | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/appointment-management | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/class-contacts | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/creative-curriculum | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/customer-pool | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/customer-tracking | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/enrollment | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/notifications | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/performance-rewards | Mobile | API问题(已记录) | 2026-01-19 |
| /mobile/teacher-center/tasks | Mobile | 正常 | 2026-01-19 |
| /mobile/teacher-center/teaching | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/dashboard | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/children | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/child-growth | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/assessment | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/games | Mobile | 正常 | 2026-01-19 |
| /mobile/parent-center/activities | Mobile | 正常 | 2026-01-19 |

### 二、权限问题

| 页面 | 平台 | 问题描述 | 严重程度 | 发现时间 |
|------|------|----------|----------|----------|
| /centers/activity | PC | teacher角色无权访问 | info | 2026-01-19 |
| /centers/enrollment | PC | teacher角色无权访问 | info | 2026-01-19 |
| /centers/business | PC | teacher角色无权访问 | info | 2026-01-19 |
| /parent-center/dashboard | PC | teacher角色无权访问 | info | 2026-01-19 |

### 三、API问题

| 页面 | 平台 | 问题描述 | 严重程度 | 发现时间 |
|------|------|----------|----------|----------|
| /mobile/teacher-center/dashboard | Mobile | 后端API返回403 | medium | 2026-01-17 |

### 四、待检测页面

待检测页面列表...

---

## 修复详情

### 路由修复 (2026-01-19)

#### 1. PC端教师中心路由修复
- **文件**: `client/src/router/routes/teacher-center.ts`
- **修改**: 添加了 `class-contacts` 和 `customer-pool` 路由配置

#### 2. 移动端路由修复
- **文件**: `client/src/router/mobile-routes.ts`
- **修改**: 添加了 `/mobile/business` 和 `/mobile/activity` 重定向路由

### API修复 (2026-01-19)

#### 1. 教师绩效奖励API修复
- **文件**: `client/src/pages/mobile/teacher-center/performance-rewards/index.vue`
- **修改**: 使用 `TeacherRewardsService` 替代错误的 `/principal-performance` API

#### 2. 教师仪表板API修复
- **文件**: `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- **修改**: 更新API路径从 `/api/teacher/xxx` 改为 `/teacher-dashboard/xxx`
- **修复内容**:
  - `/api/teacher/dashboard` → `/teacher-dashboard/dashboard`
  - `/api/teacher/weekly-schedule` → `/teacher-dashboard/today-courses`
  - `/api/teacher/todo-items` → `/teacher-dashboard/today-tasks`

---

## 检测方法

使用MCP浏览器工具进行检测：
```typescript
// 1. 导航到页面
await browser_navigate({ url: 'http://localhost:5173' + route });

// 2. 等待加载
await browser_wait_for({ time: 3 });

// 3. 获取页面快照
const snapshot = await browser_snapshot();

// 4. 获取控制台错误
const errors = await browser_console_messages({ level: 'error' });

// 5. 检测API数据
// 检查页面元素是否包含数据
```

---

*此文档用于记录问题，不包含修复内容*
