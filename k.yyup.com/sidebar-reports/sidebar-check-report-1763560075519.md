# 侧边栏页面控制台错误检查报告

**检查时间**: 2025/11/19 21:47:55

**总耗时**: 1分32秒

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 检查角色 | 3 个 |
| 总页面数 | 44 个 |
| 成功页面 | 11 个 |
| 有错误页面 | 33 个 |
| 总错误数 | 31 个 |
| 总警告数 | 59 个 |
| 健康率 | 25.00% |

## 🎭 分角色统计

### Admin管理员

- **用户名**: admin
- **总页面**: 17 个
- **成功**: 11 个
- **有错误**: 6 个
- **总错误数**: 31 个
- **总警告数**: 59 个
- **耗时**: 1分11秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|
| 仪表板 | 管理首页 | `/dashboard` | ✅ | 0 | 0 |
| 仪表板 | 数据统计 | `/dashboard/data-statistics` | ✅ | 0 | 0 |
| 仪表板 | 校园概览 | `/dashboard/campus-overview` | ✅ | 0 | 0 |
| 班级管理 | 班级列表 | `/class` | ❌ | 5 | 9 |
| 班级管理 | 班级统计 | `/class/statistics` | ❌ | 5 | 1 |
| 学生管理 | 学生列表 | `/student` | ✅ | 0 | 20 |
| 学生管理 | 学生统计 | `/student/statistics` | ❌ | 5 | 1 |
| 教师管理 | 教师列表 | `/teacher` | ✅ | 0 | 20 |
| 教师管理 | 教师统计 | `/teacher/statistics` | ❌ | 5 | 1 |
| 招生管理 | 招生管理 | `/enrollment` | ✅ | 0 | 0 |
| 招生管理 | 客户池 | `/customer-pool` | ✅ | 0 | 1 |
| 活动管理 | 活动列表 | `/activities` | ✅ | 0 | 0 |
| 活动管理 | 活动报名 | `/activity/registration` | ✅ | 0 | 1 |
| 财务管理 | 财务中心 | `/finance` | ✅ | 0 | 3 |
| 财务管理 | 费用管理 | `/finance/fee-management` | ✅ | 0 | 0 |
| 系统管理 | 系统设置 | `/settings` | ❌ | 6 | 2 |
| 系统管理 | 通知中心 | `/notifications` | ❌ | 5 | 0 |

#### ❌ 错误详情

##### 班级列表 (`/class`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-46-43-842Z-Admin管理员-班级列表.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: classes不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取统计数据失败: AxiosError
```

##### 班级统计 (`/class/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-46-47-901Z-Admin管理员-班级统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/classes/undefined/statistics?_t=1763560006249 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载班级统计失败: AxiosError
```

##### 学生统计 (`/student/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-46-55-681Z-Admin管理员-学生统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/api/students/stats?_t=1763560013936 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载学生统计数据失败: AxiosError
```

##### 教师统计 (`/teacher/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-47-03-669Z-Admin管理员-教师统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/api/teachers?page=1&limit=100&_t=1763560021964 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载教师统计数据失败: AxiosError
```

##### 系统设置 (`/settings`)

- **错误数**: 6
- **截图**: sidebar-error-screenshots/2025-11-19T13-47-30-309Z-Admin管理员-系统设置.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/pages/system/settings/index.vue
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

##### 通知中心 (`/notifications`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T13-47-34-206Z-Admin管理员-通知中心.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /api/customer-applications/stats?_t=1763560052531 不存在, detail: undefined, statusCode: 404}
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
- **耗时**: 5秒

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
- **耗时**: 5秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|

