# 侧边栏页面控制台错误检查报告

**检查时间**: 2025/11/20 00:03:17

**总耗时**: 2分59秒

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 检查角色 | 3 个 |
| 总页面数 | 44 个 |
| 成功页面 | 15 个 |
| 有错误页面 | 29 个 |
| 总错误数 | 82 个 |
| 总警告数 | 16 个 |
| 健康率 | 34.09% |

## 🎭 分角色统计

### Admin管理员

- **用户名**: admin
- **总页面**: 17 个
- **成功**: 9 个
- **有错误**: 8 个
- **总错误数**: 59 个
- **总警告数**: 11 个
- **耗时**: 1分32秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|
| 仪表板 | 管理首页 | `/dashboard` | ❌ | 9 | 0 |
| 仪表板 | 数据统计 | `/dashboard/data-statistics` | ❌ | 9 | 0 |
| 仪表板 | 校园概览 | `/dashboard/campus-overview` | ✅ | 0 | 0 |
| 班级管理 | 班级列表 | `/class` | ✅ | 0 | 0 |
| 班级管理 | 班级统计 | `/class/statistics` | ❌ | 15 | 0 |
| 学生管理 | 学生列表 | `/student` | ❌ | 5 | 0 |
| 学生管理 | 学生统计 | `/student/statistics` | ❌ | 5 | 2 |
| 教师管理 | 教师列表 | `/teacher` | ✅ | 0 | 0 |
| 教师管理 | 教师统计 | `/teacher/statistics` | ❌ | 5 | 2 |
| 招生管理 | 招生管理 | `/enrollment` | ✅ | 0 | 0 |
| 招生管理 | 客户池 | `/customer-pool` | ✅ | 0 | 1 |
| 活动管理 | 活动列表 | `/activities` | ✅ | 0 | 0 |
| 活动管理 | 活动报名 | `/activity/registration` | ✅ | 0 | 1 |
| 财务管理 | 财务中心 | `/finance` | ✅ | 0 | 3 |
| 财务管理 | 费用管理 | `/finance/fee-management` | ✅ | 0 | 0 |
| 系统管理 | 系统设置 | `/settings` | ❌ | 6 | 2 |
| 系统管理 | 通知中心 | `/notifications` | ❌ | 5 | 0 |

#### ❌ 错误详情

##### 管理首页 (`/dashboard`)

- **错误数**: 9
- **截图**: sidebar-error-screenshots/2025-11-19T16-00-39-949Z-Admin管理员-管理首页.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /dashboard/stats?_t=1763568038134 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取仪表盘数据失败: AxiosError
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /dashboard/todos?page=1&pageSize=5&_t=1763568038135 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
```

##### 数据统计 (`/dashboard/data-statistics`)

- **错误数**: 9
- **截图**: sidebar-error-screenshots/2025-11-19T16-00-43-896Z-Admin管理员-数据统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /dashboard/stats?_t=1763568042085 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取仪表盘数据失败: AxiosError
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /dashboard/todos?page=1&pageSize=5&_t=1763568042085 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
```

##### 班级统计 (`/class/statistics`)

- **错误数**: 15
- **截图**: sidebar-error-screenshots/2025-11-19T16-00-55-775Z-Admin管理员-班级统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /classes/stats?_t=1763568052846 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取统计数据失败: AxiosError
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /teachers?_t=1763568052846 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取教师列表失败: AxiosError
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /classes?page=1&pageSize=10&keyword=&ageGroup=&status=&teacher=&_t=1763568052847 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取班级列表失败: AxiosError
```

##### 学生列表 (`/student`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-01-07-218Z-Admin管理员-学生列表.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /students?params[page]=1&params[pageSize]=10&_t=1763568066002 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载数据失败: AxiosError
```

##### 学生统计 (`/student/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-01-11-118Z-Admin管理员-学生统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Response error: AxiosError
Error details: {code: UNAUTHORIZED, message: 无效的认证令牌, detail: Object, statusCode: 401}
请求失败，已重试0次: Request failed with status code 401
加载学生统计数据失败: AxiosError
```

##### 教师统计 (`/teacher/statistics`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-01-18-871Z-Admin管理员-教师统计.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Response error: AxiosError
Error details: {code: UNAUTHORIZED, message: 无效的认证令牌, detail: Object, statusCode: 401}
请求失败，已重试0次: Request failed with status code 401
加载教师统计数据失败: AxiosError
```

##### 系统设置 (`/settings`)

- **错误数**: 6
- **截图**: sidebar-error-screenshots/2025-11-19T16-01-45-778Z-Admin管理员-系统设置.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/pages/system/settings/index.vue
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

##### 通知中心 (`/notifications`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-01-49-713Z-Admin管理员-通知中心.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /customer-applications/stats?_t=1763568108371 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载待审批统计失败: AxiosError
```

### 教师

- **用户名**: teacher
- **总页面**: 10 个
- **成功**: 6 个
- **有错误**: 4 个
- **总错误数**: 23 个
- **总警告数**: 5 个
- **耗时**: 46秒

#### 分类别检查结果

| 类别 | 页面名称 | 路径 | 状态 | 错误数 | 警告数 |
|------|----------|------|------|--------|--------|
| 工作台 | 教师工作台 | `/teacher-center/dashboard` | ✅ | 0 | 0 |
| 通知 | 通知中心 | `/teacher-center/notifications` | ❌ | 5 | 0 |
| 任务 | 任务中心 | `/teacher-center/tasks` | ✅ | 0 | 0 |
| 活动 | 活动中心 | `/teacher-center/activities` | ✅ | 0 | 0 |
| 招生 | 招生中心 | `/teacher-center/enrollment` | ✅ | 0 | 0 |
| 招生 | 客户跟踪 | `/teacher-center/customer-tracking` | ✅ | 0 | 0 |
| 教学 | 教学中心 | `/teacher-center/teaching` | ✅ | 0 | 0 |
| 教学 | 创意课程生成器 | `/teacher-center/creative-curriculum` | ❌ | 5 | 0 |
| 管理 | 考勤管理 | `/teacher-center/attendance` | ❌ | 11 | 3 |
| 绩效 | 绩效中心 | `/teacher-center/performance-rewards` | ❌ | 2 | 2 |

#### ❌ 错误详情

##### 通知中心 (`/teacher-center/notifications`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-02-06-278Z-教师-通知中心.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /teacher-dashboard/statistics?_t=1763568123379 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载仪表板数据失败: AxiosError
```

##### 创意课程生成器 (`/teacher-center/creative-curriculum`)

- **错误数**: 5
- **截图**: sidebar-error-screenshots/2025-11-19T16-02-26-997Z-教师-创意课程生成器.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /teacher-center/creative-curriculum?params[page]=1&params[limit]=12&_t=1763568146108 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
❌ 获取课程列表失败: AxiosError
```

##### 考勤管理 (`/teacher-center/attendance`)

- **错误数**: 11
- **截图**: sidebar-error-screenshots/2025-11-19T16-02-35-171Z-教师-考勤管理.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /teacher/customers/list?params[page]=1&params[pageSize]=100&_t=1763568152047 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
加载客户数据失败: AxiosError
Failed to load resource: the server responded with a status of 404 (Not Found)
Response error: AxiosError
Error details: {code: NOT_FOUND, message: 路由 GET /teacher/customers/stats?_t=1763568152048 不存在, detail: undefined, statusCode: 404}
请求失败，已重试0次: Request failed with status code 404
获取客户跟踪统计失败: AxiosError
加载统计数据失败: AxiosError
```

##### 绩效中心 (`/teacher-center/performance-rewards`)

- **错误数**: 2
- **截图**: sidebar-error-screenshots/2025-11-19T16-02-39-090Z-教师-绩效中心.png

**错误信息**:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
TypeError: Failed to fetch dynamically imported module: http://localhost:5173/src/pages/teacher-center/performance-rewards/index.vue
```

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

