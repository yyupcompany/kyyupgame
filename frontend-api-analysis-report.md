# 前端 API 调用扫描报告

## 扫描摘要

- **扫描时间**: 2026-01-04T16:52:43.932Z
- **扫描目录**: /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src
- **总文件数**: 1,579
- **包含API调用的文件**: 172
- **总API调用次数**: 724
- **唯一API端点数**: 565

## 关键发现

### 1. 硬编码的 localhost URL（高风险）

发现 **3 个** 硬编码的 `http://localhost:3000` URL，这些会导致生产环境问题：

| 端点 | 类型 | 严重性 | 位置 |
|------|------|--------|------|
| `http://localhost:3000/api/user/profile` | 绝对URL | HIGH | 测试文件 |
| `http://localhost:3000/api/user/delete` | 绝对URL | HIGH | 测试文件 |
| `http://localhost:3000/api/admin/users` | 绝对URL | HIGH | 测试文件 |

**注意**: 这些硬编码URL主要出现在测试文件中，但也有少数出现在业务代码中：
- `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/image.ts` (构建图片URL)
- `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/components/ai/MediaGallery.vue` (媒体文件URL)
- `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/principal/PosterEditor.vue` (海报模板URL)

### 2. 缺失 `/api` 前缀的端点（中风险）

发现 **225 个** API端点可能缺失 `/api` 前缀，这些会导致请求失败。

#### 主要涉及的模块：

1. **活动中心** (`/activity-center/*`)
   - `/activity-center/activities/${id}`
   - `/activity-center/activities/${id}/publish`
   - `/activity-center/registrations/${id}`
   - `/activity-center/analytics/${id}/report`

2. **AI统一智能系统** (`/ai/unified/*`)
   - `/ai/unified/unified-chat`
   - `/ai/unified/direct-chat`
   - `/ai/unified/stream-chat` (已有7次调用)

3. **教学中心** (`/teaching-center/*`)
   - `/teaching-center/course-progress/class/${classId}/detailed`
   - `/teaching-center/championship/${championshipId}/details`
   - `/teaching-center/media/files/${fileId}`

4. **营销中心** (`/marketing/*`)
   - `/marketing/templates/${id}`
   - `/marketing/channels/${id}`
   - `/marketing/referrals/${code}/stats`

5. **其他常用端点**
   - `/activities`
   - `/classes`
   - `/statistics`
   - `/users`
   - `/roles`
   - `/notifications`
   - `/tasks`

### 3. function-tools 相关 API 调用

#### 统一智能系统 API 端点：

| 端点 | 调用次数 | HTTP方法 | 文件数 |
|------|----------|----------|--------|
| `/api/ai/unified/stream-chat` | 7 | POST | 7 |
| `/api/ai/unified/unified-chat` | 2 | POST | 1 |
| `/api/ai/unified/capabilities` | 2 | GET | 2 |
| `/api/ai/unified/status` | 2 | GET | 2 |
| `/api/ai/unified/direct-chat-sse` | 1 | POST | 1 |
| `${apiUrl}/ai/unified/stream-chat` | 2 | POST | 1 |
| `/ai/unified/unified-chat` | 1 | POST | 1 |
| `/ai/unified/direct-chat` | 1 | POST | 1 |

**文件位置**：
- `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js` (已废弃)
- `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts` (新版)

### 4. 最常用的 API 端点（Top 20）

| 排名 | 端点 | 调用次数 | 主要文件 |
|------|------|----------|----------|
| 1 | `/api/ai/unified/stream-chat` | 7 | 媒体中心、AI助手 |
| 2 | `/api/quick-query-groups/overview` | 5 | 快速查询 |
| 3 | `${this.baseURL}${url}` | 5 | 动态URL |
| 4 | `/api/auth/login` | 5 | 认证 |
| 5 | `/statistics` | 4 | 统计 |
| 6 | `/kindergarten/basic-info` | 4 | 幼儿园信息 |
| 7 | `/ai/text-to-speech` | 4 | AI语音 |
| 8 | `tasks/${id}` | 4 | 任务管理 |

## URL 类型分布

| 类型 | 数量 | 占比 |
|------|------|------|
| 相对路径（含/api前缀） | 337 | 59.6% |
| 相对路径（缺失/api前缀） | 225 | 39.8% |
| 绝对路径（localhost） | 3 | 0.5% |

## 建议修复措施

### 高优先级（立即修复）

1. **移除硬编码的 localhost URL**
   - 修改 `utils/image.ts` 使用环境变量
   - 修改 `components/ai/MediaGallery.vue` 使用相对路径
   - 修改 `pages/principal/PosterEditor.vue` 使用相对路径
   - 测试文件可以保留，但应使用配置文件

2. **修复缺失 `/api` 前缀的端点**
   - 批量替换 `/ai/unified/*` 为 `/api/ai/unified/*`
   - 批量替换 `/activity-center/*` 为 `/api/activity-center/*`
   - 批量替换 `/teaching-center/*` 为 `/api/teaching-center/*`
   - 批量替换 `/marketing/*` 为 `/api/marketing/*`

### 中优先级

1. **统一API路径规范**
   - 所有API端点应以 `/api` 开头
   - 使用 `@/utils/request` 进行调用
   - 避免在组件中直接写URL路径

2. **API端点集中管理**
   - 将所有API端点定义在 `/api/endpoints/` 目录
   - 使用TypeScript类型定义
   - 统一错误处理

### 低优先级

1. **代码优化**
   - 减少动态URL拼接
   - 使用API客户端方法
   - 添加API调用日志

## 文件列表

### 包含最多API调用的文件

（完整列表见 JSON 报告）

## 工具使用

运行扫描工具：
```bash
node /persistent/home/zhgue/kyyupgame/frontend-api-scanner.js
```

查看详细JSON报告：
```bash
cat /persistent/home/zhgue/kyyupgame/frontend-api-scan-report.json
```

## 附录

### 端点命名规范建议

✅ **推荐**:
- `/api/ai/unified/stream-chat`
- `/api/activity-center/activities`
- `/api/teaching-center/course-progress`

❌ **不推荐**:
- `/ai/unified/stream-chat` (缺少 `/api` 前缀)
- `http://localhost:3000/api/xxx` (硬编码绝对路径)
- `${apiUrl}/xxx` (动态拼接，难以维护)

### 测试

测试文件可以保留硬编码的localhost URL，但应：
1. 使用配置文件管理测试服务器地址
2. 添加注释说明这是测试专用
3. 确保不会打包到生产环境

---

**报告生成时间**: 2026-01-04
**工具版本**: 1.0.0
