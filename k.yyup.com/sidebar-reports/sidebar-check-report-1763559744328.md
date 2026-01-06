# 侧边栏页面控制台错误检查报告

**检查时间**: 2025/11/19 21:42:24

**总耗时**: 2分33秒

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 检查角色 | 3 个 |
| 总页面数 | 44 个 |
| 成功页面 | 13 个 |
| 有错误页面 | 31 个 |
| 总错误数 | 20 个 |
| 总警告数 | 50 个 |
| 健康率 | 29.55% |

## 🎭 分角色统计

### Admin管理员

- **用户名**: admin
- **总页面**: 17 个
- **成功**: 13 个
- **有错误**: 4 个
- **总错误数**: 20 个
- **总警告数**: 50 个
- **耗时**: 1分19秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|
| 仪表板 | 管理首页 | `/dashboard` | ✅ | 0 | 0 |
| 仪表板 | 数据统计 | `/dashboard/data-statistics` | ✅ | 0 | 0 |
| 仪表板 | 校园概览 | `/dashboard/campus-overview` | ✅ | 0 | 0 |
| 班级管理 | 班级列表 | `/class` | ✅ | 0 | 0 |
| 班级管理 | 班级统计 | `/class/statistics` | ✅ | 0 | 0 |
| 学生管理 | 学生列表 | `/student` | ✅ | 0 | 21 |
| 学生管理 | 学生统计 | `/student/statistics` | ❌ | 5 | 1 |
| 教师管理 | 教师列表 | `/teacher` | ✅ | 0 | 20 |
| 教师管理 | 教师统计 | `/teacher/statistics` | ❌ | 5 | 1 |
| 招生管理 | 招生管理 | `/enrollment` | ✅ | 0 | 0 |
| 招生管理 | 客户池 | `/customer-pool` | ✅ | 0 | 1 |
| 活动管理 | 活动列表 | `/activities` | ✅ | 0 | 0 |
| 活动管理 | 活动报名 | `/activity/registration` | ✅ | 0 | 1 |
| 财务管理 | 财务中心 | `/finance` | ✅ | 0 | 3 |
| 财务管理 | 费用管理 | `/finance/fee-management` | ✅ | 0 | 0 |
| 系统管理 | 系统设置 | `/settings` | ❌ | 5 | 2 |
| 系统管理 | 通知中心 | `/notifications` | ❌ | 5 | 0 |

#### ❌ 错误详情

##### 学生统计 (`/student/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-40-30-106Z-Admin管理员-学生统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/api/students/stats?_t=1763559628544 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载学生统计数据失败: AxiosError
```

##### 教师统计 (`/teacher/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-40-38-025Z-Admin管理员-教师统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/api/teachers?page=1&limit=100&_t=1763559636441 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载教师统计数据失败: AxiosError
```

##### 系统设置 (`/settings`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-41-04-996Z-Admin管理员-系统设置.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/pages/system/settings/index.vue
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

##### 通知中心 (`/notifications`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-41-08-908Z-Admin管理员-通知中心.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/customer-applications/stats?_t=1763559667555 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载待审批统计失败: AxiosError
```

### 教师

- **用户名**: teacher
- **总页面**: 10 个
- **成功**: 0 个
- **有错误**: 10 个
- **总错误数**: 0 个
- **总警告数**: 0 个
- **耗时**: 33秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|

### 家长

- **用户名**: parent
- **总页面**: 17 个
- **成功**: 0 个
- **有错误**: 17 个
- **总错误数**: 0 个
- **总警告数**: 0 个
- **耗时**: 31秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|

