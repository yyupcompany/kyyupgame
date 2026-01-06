# Admin Centers 页面完整测试计划

## 📋 测试目标

使用Chrome MCP (Playwright)对所有Admin Centers页面进行全面测试，确保：
- ✅ 无空白页面
- ✅ 无控制台错误
- ✅ 无500错误（API失败）
- ✅ 所有按钮可点击且有响应
- ✅ 所有列表/卡片正常显示
- ✅ 数据初始化完整

---

## 🗂️ 测试范围

### PC端Centers页面（30个页面）

#### 1. 核心导航页面（1个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 1 | index.vue | `/centers/index` | ⭐⭐⭐ |

#### 2. 基础管理页面（4个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 2 | EnrollmentCenter.vue | `/centers/enrollment` | ⭐⭐⭐ |
| 3 | PersonnelCenter.vue | `/centers/personnel` | ⭐⭐⭐ |
| 4 | ActivityCenter.vue | `/centers/activity` | ⭐⭐⭐ |
| 5 | AttendanceCenter.vue | `/centers/attendance` | ⭐⭐⭐ |

#### 3. 业务功能页面（8个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 6 | TaskCenter.vue | `/centers/task` | ⭐⭐⭐ |
| 7 | InspectionCenter.vue | `/centers/inspection` | ⭐⭐ |
| 8 | FinanceCenter.vue | `/centers/finance` | ⭐⭐ |
| 9 | MarketingCenter.vue | `/centers/marketing` | ⭐⭐⭐ |
| 10 | CustomerPoolCenter.vue | `/centers/customer-pool` | ⭐⭐ |
| 11 | BusinessCenter.vue | `/centers/business` | ⭐⭐ |
| 12 | CallCenter.vue | `/centers/call` | ⭐ |
| 13 | UsageCenter.vue | `/centers/usage` | ⭐ |

#### 4. 教学相关页面（4个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 14 | TeachingCenter.vue | `/centers/teaching` | ⭐⭐⭐ |
| 15 | AssessmentCenter.vue | `/centers/assessment` | ⭐⭐ |
| 16 | MediaCenter.vue | `/centers/media` | ⭐⭐ |
| 17 | ActivityCenter.vue | `/centers/activity` | ⭐⭐⭐ |

#### 5. 文档管理页面（6个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 18 | DocumentCenter.vue | `/centers/document-center` | ⭐⭐ |
| 19 | DocumentCollaboration.vue | `/centers/document-collaboration` | ⭐⭐ |
| 20 | DocumentEditor.vue | `/centers/document-editor` | ⭐⭐ |
| 21 | DocumentTemplateCenter.vue | `/centers/document-template` | ⭐ |
| 22 | DocumentInstanceList.vue | `/centers/document-instances` | ⭐ |
| 23 | DocumentStatistics.vue | `/centers/document-statistics` | ⭐ |

#### 6. 系统管理页面（5个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 24 | SystemCenter.vue | `/centers/system` | ⭐⭐⭐ |
| 25 | AICenter.vue | `/centers/ai` | ⭐⭐ |
| 26 | AnalyticsCenter.vue | `/centers/analytics` | ⭐⭐ |

#### 7. 辅助工具页面（4个）
| # | 页面 | 路由 | 优先级 |
|---|------|------|--------|
| 27 | TaskForm.vue | `/centers/task/form` | ⭐⭐ |
| 28 | TemplateDetail.vue | `/centers/template/detail` | ⭐ |
| 29 | marketing/performance.vue | `/centers/marketing/performance` | ⭐ |

---

## 🧪 测试检查清单

### 每个页面的检查项

#### 1. 页面加载检查
- [ ] 页面能够成功加载（非空白）
- [ ] 页面标题正确显示
- [ ] 页面布局完整（无布局错乱）
- [ ] 加载时间在可接受范围内（< 3秒）

#### 2. 控制台错误检查
- [ ] 无JavaScript错误
- [ ] 无网络请求失败（404/500）
- [ ] 无警告信息
- [ ] 无未捕获的Promise错误

#### 3. 数据初始化检查
- [ ] 数据列表正常显示（非空或显示"暂无数据"）
- [ ] 统计卡片有数据或显示0
- [ ] 图表正常渲染（非空白）
- [ ] 分页组件正常显示

#### 4. 按钮功能检查
- [ ] 主操作按钮可点击（新建、创建等）
- [ ] 表格操作按钮可点击（编辑、删除等）
- [ ] 筛选/搜索按钮可点击
- [ ] 导出/下载按钮可点击（如有）

#### 5. 列表组件检查
- [ ] 数据表格正常渲染
- [ ] 列表项内容完整显示
- [ ] 分页器正常工作
- [ ] 空状态提示显示

#### 6. 卡片组件检查
- [ ] 统计卡片正常显示
- [ ] 操作卡片可点击
- [ ] 卡片内容完整
- [ ] 卡片hover效果正常

---

## 🔧 测试工具配置

### Playwright配置
```javascript
// 使用MCP Playwright工具
const config = {
  baseURL: 'http://localhost:5173',
  headless: true,  // 无头模式
  timeout: 10000,   // 10秒超时
  screenshot: 'only-on-failure'  // 失败时截图
}
```

---

## 📝 测试执行步骤

### 阶段1：数据初始化验证（前置条件）
```bash
# 1. 检查数据库连接
cd server && npm run db:migrate

# 2. 运行完整数据初始化
npm run seed-data:complete

# 3. 验证基础数据存在
# - 用户数据（test_admin）
# - 权限数据
# - 基础业务数据（学生、教师、班级等）
```

### 阶段2：启动开发服务器
```bash
# 启动前端
cd client && npm run dev

# 启动后端（另一个终端）
cd server && npm run dev

# 验证服务状态
curl http://localhost:3000/api/health
curl http://localhost:5173
```

### 阶段3：执行自动化测试
使用Playwright MCP工具逐个测试页面：

```javascript
// 伪代码示例
for (const page of pages) {
  // 1. 导航到页面
  await navigate(page.route)

  // 2. 检查页面加载
  await checkPageLoaded()

  // 3. 检查控制台错误
  await checkConsoleErrors()

  // 4. 检查数据初始化
  await checkDataInitialized()

  // 5. 测试按钮功能
  await testButtons()

  // 6. 测试列表/卡片
  await testListsAndCards()

  // 7. 生成测试报告
  await generateReport(page)
}
```

---

## 📊 测试结果记录格式

### 页面测试报告
```json
{
  "pageId": 1,
  "pageName": "EnrollmentCenter.vue",
  "route": "/centers/enrollment",
  "timestamp": "2026-01-06T00:00:00Z",
  "status": "pass", // pass | fail | partial
  "checks": {
    "pageLoaded": true,
    "consoleErrors": 0,
    "networkErrors": 0,
    "dataInitialized": true,
    "buttonsWorking": 5,
    "buttonsTotal": 5,
    "listsDisplayed": 2,
    "listsTotal": 2,
    "cardsDisplayed": 4,
    "cardsTotal": 4
  },
  "issues": [],
  "screenshot": "path/to/screenshot.png"
}
```

---

## 🚨 问题优先级定义

### P0 - 严重问题（阻塞测试）
- 空白页面
- 页面完全无法加载
- 500错误导致功能不可用
- 数据初始化完全失败

### P1 - 重要问题（影响核心功能）
- 控制台错误影响功能
- 主要按钮无响应
- 列表/卡片不显示
- 关键数据缺失

### P2 - 一般问题（不影响核心功能）
- 非关键按钮无响应
- 样式错乱但不影响使用
- 加载速度慢
- 次要数据缺失

### P3 - 优化建议（体验改进）
- 文案错误
- 交互细节优化
- 性能优化建议

---

## 📈 测试覆盖率目标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 页面覆盖率 | 100% (30/30) | 0% |
| 组件覆盖率 | 90% | 0% |
| 功能测试通过率 | 95% | N/A |
| 无控制台错误率 | 100% | N/A |
| 无500错误率 | 100% | N/A |

---

## 🎯 测试执行顺序

### 第1批：核心导航和高优先级页面（10个）
1. index.vue
2. EnrollmentCenter.vue
3. PersonnelCenter.vue
4. TaskCenter.vue
5. TeachingCenter.vue
6. ActivityCenter.vue
7. MarketingCenter.vue
8. SystemCenter.vue
9. AttendanceCenter.vue
10. DocumentCenter.vue

### 第2批：业务功能页面（10个）
11. FinanceCenter.vue
12. CustomerPoolCenter.vue
13. BusinessCenter.vue
14. InspectionCenter.vue
15. AssessmentCenter.vue
16. MediaCenter.vue
17. AICenter.vue
18. AnalyticsCenter.vue
19. CallCenter.vue
20. UsageCenter.vue

### 第3批：文档和辅助页面（10个）
21. DocumentCollaboration.vue
22. DocumentEditor.vue
23. DocumentTemplateCenter.vue
24. DocumentInstanceList.vue
25. DocumentStatistics.vue
26. TaskForm.vue
27. TemplateDetail.vue
28. marketing/performance.vue
29. （其他辅助页面）

---

## 🔄 迭代测试策略

### Round 1：基础加载测试
- 只测试页面能否加载
- 检查明显的空白页面
- 记录所有500错误

### Round 2：数据初始化测试
- 验证所有页面的数据加载
- 检查API调用是否成功
- 确认种子数据正确

### Round 3：功能交互测试
- 测试所有按钮点击
- 验证列表/卡片显示
- 检查表单提交

### Round 4：边界情况测试
- 测试空数据状态
- 测试错误处理
- 测试权限控制

---

## 📤 交付物

1. **测试执行报告** - JSON格式的详细测试结果
2. **问题清单** - 按优先级分类的问题列表
3. **截图集合** - 所有页面的视觉验证截图
4. **控制台日志** - 错误和警告的完整日志
5. **修复建议** - 针对每个问题的具体修复方案

---

## ⏱️ 预估时间

| 阶段 | 预估时间 |
|------|----------|
| 测试计划生成 | ✅ 已完成 |
| 数据初始化验证 | 5分钟 |
| 页面测试执行（30个） | 30-45分钟 |
| 问题修复 | 根据问题数量 |
| 回归测试 | 15分钟 |
| 报告生成 | 5分钟 |

**总计**: 约60-90分钟（不含修复时间）

---

*测试计划版本: v1.0*
*创建时间: 2026-01-06*
*测试工具: Playwright (Chrome MCP)*
