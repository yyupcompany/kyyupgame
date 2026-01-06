# API 前缀修复报告 (改进版)

生成时间: 2026/1/5 02:13:50
扫描目录: /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src

## 统计摘要

- **总文件数**: 1581
- **包含问题的文件数**: 29
- **总问题数**: 120
- **已修复文件数**: 29
- **排除的文件数**: 90
- **跳过的文件数**: 0

## 改进说明

本版本相比第一版本的改进：

1. **更精确的上下文检测**: 只修复真正的 HTTP API 调用
2. **排除非API文件**: 配置文件、路由文件、布局文件等被自动排除
3. **更严格的模式匹配**: 使用多层次的排除规则

## 修复模式统计

- **Pattern 7**: 4 个问题
- **Pattern 9**: 4 个问题
- **Pattern 5**: 3 个问题
- **Pattern 10**: 2 个问题
- **Pattern 13**: 5 个问题
- **Pattern 14**: 4 个问题
- **Pattern 0**: 23 个问题
- **Pattern 2**: 57 个问题
- **Pattern 3**: 10 个问题
- **Pattern 4**: 7 个问题
- **Pattern 11**: 1 个问题

## 需要修复的文件列表

### 1. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/services/light-query.service.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 52 | 37 | `'/statistics'` | `'/api/statistics` | `const res = await request.get('/statistics', {` |

### 2. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/cachedRequest.ts

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 294 | 22 | `'/users'` | `'/api/users` | `return cachedGet('/users', params, {` |
| 324 | 22 | `'/classes'` | `'/api/classes` | `return cachedGet('/classes', params, {` |
| 334 | 22 | ``/users` | ``/api/users` | `return cachedGet(`/users/${id}`, undefined, {` |
| 334 | 22 | ``/users/` | ``/api/users/` | `return cachedGet(`/users/${id}`, undefined, {` |

### 3. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/script-template.ts

**问题数量**: 9

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 72 | 38 | ``/script-templates` | ``/api/script-templates` | `return request.get<ScriptTemplate>(`/script-templates/${id}`);` |
| 72 | 38 | ``/script-templates/` | ``/api/script-templates/` | `return request.get<ScriptTemplate>(`/script-templates/${id}`);` |
| 79 | 39 | `'/script-templates'` | `'/api/script-templates` | `return request.post<ScriptTemplate>('/script-templates', data);` |
| 86 | 38 | ``/script-templates` | ``/api/script-templates` | `return request.put<ScriptTemplate>(`/script-templates/${id}`, data);` |
| 86 | 38 | ``/script-templates/` | ``/api/script-templates/` | `return request.put<ScriptTemplate>(`/script-templates/${id}`, data);` |
| 93 | 25 | ``/script-templates` | ``/api/script-templates` | `return request.delete(`/script-templates/${id}`);` |
| 93 | 25 | ``/script-templates/` | ``/api/script-templates/` | `return request.delete(`/script-templates/${id}`);` |
| 107 | 42 | `'/script-templates` | `'/api/script-templates` | `return request.post<ScriptMatchResult>('/script-templates/match', params);` |
| 107 | 42 | `'/script-templates/` | `'/api/script-templates/` | `return request.post<ScriptMatchResult>('/script-templates/match', params);` |

### 4. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/teaching-center.ts

**问题数量**: 13

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 20 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.get(`/teaching-center/course-progress/class/${classId}/detailed`)` |
| 49 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.get(`/teaching-center/outdoor-training/class/${classId}/details`)` |
| 72 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/outdoor-training/records/${recordId}`, d...` |
| 89 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.get(`/teaching-center/external-display/class/${classId}/details`)` |
| 113 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/external-display/records/${recordId}`, d...` |
| 130 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.get(`/teaching-center/championship/${championshipId}/details`)` |
| 156 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/championship/${championshipId}/status`, ...` |
| 163 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/championship/${championshipId}`, data)` |
| 196 | 27 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.delete(`/teaching-center/media/files/${fileId}`)` |
| 272 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/brain-science-courses/${courseId}`, data)` |
| 279 | 27 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.delete(`/teaching-center/brain-science-courses/${courseId}`)` |
| 314 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.put(`/teaching-center/course-plans/${planId}`, data)` |
| 351 | 24 | ``/teaching-center/` | ``/api/teaching-center/` | `return request.get(`/teaching-center/export/championship/${championshipId}`, {` |

### 5. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/marketing-template.ts

**问题数量**: 15

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 235 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.get(`/marketing/templates/${id}`);` |
| 254 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.put(`/marketing/templates/${id}`, data);` |
| 263 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.del(`/marketing/templates/${id}`);` |
| 277 | 23 | ``/marketing/` | ``/api/marketing/` | `return request.post(`/marketing/templates/${id}/duplicate`, data);` |
| 286 | 24 | ``/marketing/` | ``/api/marketing/` | `return request.patch(`/marketing/templates/${id}/publish`);` |
| 295 | 24 | ``/marketing/` | ``/api/marketing/` | `return request.patch(`/marketing/templates/${id}/archive`);` |
| 331 | 23 | ``/marketing/` | ``/api/marketing/` | `return request.post(`/marketing/templates/${id}/apply`, data);` |
| 346 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.get(`/marketing/templates/${id}/usage`, { params });` |
| 360 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.get(`/marketing/templates/${id}/reviews`, { params });` |
| 373 | 23 | ``/marketing/` | ``/api/marketing/` | `return request.post(`/marketing/templates/${id}/reviews`, data);` |
| 387 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.put(`/marketing/templates/${id}/reviews/${reviewId}`, data);` |
| 397 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.del(`/marketing/templates/${id}/reviews/${reviewId}`);` |
| 406 | 23 | ``/marketing/` | ``/api/marketing/` | `return request.post(`/marketing/templates/${id}/favorites`);` |
| 415 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.del(`/marketing/templates/${id}/favorites`);` |
| 499 | 10 | ``/marketing/` | ``/api/marketing/` | `url: `/marketing/templates/${id}/export`,` |

### 6. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/marketing.ts

**问题数量**: 16

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 173 | 22 | ``/activities` | ``/api/activities` | `return request.get(`/activities/${id}`);` |
| 173 | 22 | ``/activities/` | ``/api/activities/` | `return request.get(`/activities/${id}`);` |
| 192 | 22 | ``/activities` | ``/api/activities` | `return request.put(`/activities/${id}`, data);` |
| 192 | 22 | ``/activities/` | ``/api/activities/` | `return request.put(`/activities/${id}`, data);` |
| 201 | 22 | ``/activities` | ``/api/activities` | `return request.del(`/activities/${id}`);` |
| 201 | 22 | ``/activities/` | ``/api/activities/` | `return request.del(`/activities/${id}`);` |
| 211 | 22 | ``/activities` | ``/api/activities` | `return request.put(`/activities/${id}/status`, { status });` |
| 211 | 22 | ``/activities/` | ``/api/activities/` | `return request.put(`/activities/${id}/status`, { status });` |
| 226 | 24 | ``/activities` | ``/api/activities` | `return request.patch(`/activities/${id}/results`, data);` |
| 226 | 24 | ``/activities/` | ``/api/activities/` | `return request.patch(`/activities/${id}/results`, data);` |
| 264 | 24 | ``/marketing/` | ``/api/marketing/` | `return request.patch(`/marketing/channels/${id}`, data);` |
| 273 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.del(`/marketing/channels/${id}`);` |
| 298 | 10 | ``/activities` | ``/api/activities` | `url: `/activities/${id}/export`,` |
| 298 | 10 | ``/activities/` | ``/api/activities/` | `url: `/activities/${id}/export`,` |
| 433 | 22 | ``/marketing/` | ``/api/marketing/` | `return request.get(`/marketing/referrals/${code}/stats`);` |
| 447 | 23 | ``/marketing/` | ``/api/marketing/` | `return request.post(`/marketing/referrals/${code}/track`, data);` |

### 7. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts

**问题数量**: 10

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 50 | 22 | ``/activity-center/` | ``/api/activity-center/` | `return request.get(`/activity-center/activities/${id}`)` |
| 64 | 22 | ``/activity-center/` | ``/api/activity-center/` | `return request.put(`/activity-center/activities/${id}`, data)` |
| 71 | 25 | ``/activity-center/` | ``/api/activity-center/` | `return request.delete(`/activity-center/activities/${id}`)` |
| 78 | 23 | ``/activity-center/` | ``/api/activity-center/` | `return request.post(`/activity-center/activities/${id}/publish`)` |
| 85 | 23 | ``/activity-center/` | ``/api/activity-center/` | `return request.post(`/activity-center/activities/${id}/cancel`)` |
| 108 | 22 | ``/activity-center/` | ``/api/activity-center/` | `return request.get(`/activity-center/registrations/${id}`)` |
| 115 | 23 | ``/activity-center/` | ``/api/activity-center/` | `return request.post(`/activity-center/registrations/${id}/approve`, data)` |
| 143 | 22 | ``/activity-center/` | ``/api/activity-center/` | `return request.get(`/activity-center/analytics/${id}/report`)` |
| 208 | 22 | ``/activity-center/` | ``/api/activity-center/` | `return request.put(`/activity-center/notifications/templates/${id}`, data)` |
| 215 | 25 | ``/activity-center/` | ``/api/activity-center/` | `return request.delete(`/activity-center/notifications/templates/${id}`)` |

### 8. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/index.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 253 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/channels', params)` |
| 278 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/channels/tags')` |
| 311 | 26 | ``/marketing/` | ``/api/marketing/` | `await request.delete(`/marketing/channels/${row.id}`)` |

### 9. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/ChannelEditDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 199 | 25 | ``/marketing/` | ``/api/marketing/` | `await request.put(`/marketing/channels/${props.channel.id}`, data)` |
| 202 | 26 | `'/marketing/` | `'/api/marketing/` | `await request.post('/marketing/channels', data)` |

### 10. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/ContactManageDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 125 | 35 | ``/marketing/` | ``/api/marketing/` | `const res = await request.get(`/marketing/channels/${props.channel.id}/contac...` |
| 145 | 24 | ``/marketing/` | ``/api/marketing/` | `await request.post(`/marketing/channels/${props.channel.id}/contacts`, newCon...` |
| 170 | 26 | ``/marketing/` | ``/api/marketing/` | `await request.delete(`/marketing/channels/${props.channel.id}/contacts/${cont...` |

### 11. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/MetricsDialog.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 176 | 35 | ``/marketing/` | ``/api/marketing/` | `const res = await request.get(`/marketing/channels/${props.channel.id}/metrics`)` |

### 12. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/TagManageDialog.vue

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 123 | 35 | ``/marketing/` | ``/api/marketing/` | `const res = await request.get(`/marketing/channels/${props.channel.id}/tags`)` |
| 133 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/channels/tags')` |
| 146 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/channels/tags/stats')` |
| 163 | 24 | ``/marketing/` | ``/api/marketing/` | `await request.post(`/marketing/channels/${props.channel.id}/tags`, {` |
| 196 | 26 | ``/marketing/` | ``/api/marketing/` | `await request.delete(`/marketing/channels/${props.channel.id}/tags/${tag.id}`)` |

### 13. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/index.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 292 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel', params)` |
| 318 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/dimension', params)` |
| 529 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/export', params, { res...` |

### 14. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/components/DimensionDetailDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 284 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/dimension/detail', par...` |
| 309 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/dimension/trend', params)` |
| 330 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/dimension/users', params)` |

### 15. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/components/StageDetailDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 250 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/stage', params)` |
| 273 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/stage/trend', params)` |
| 293 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/funnel/stage/users', params)` |

### 16. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/conversions/index.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 344 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/conversions', params)` |
| 612 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/conversions/export', params, ...` |

### 17. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/conversions/components/ConversionDetailDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 206 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/conversions/detail', params)` |
| 231 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/stats/conversions/trend', params)` |

### 18. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/index.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 377 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/referrals', { params });` |
| 404 | 40 | `'/activities'` | `'/api/activities` | `const response = await request.get('/activities', {` |

### 19. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/QrcodeGenerator.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 161 | 40 | `'/activities'` | `'/api/activities` | `const response = await request.get('/activities', {` |
| 210 | 41 | `'/marketing/` | `'/api/marketing/` | `const response = await request.post('/marketing/referrals/generate', {` |

### 20. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/PosterGenerator.vue

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 133 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/referrals/poster-templates');` |
| 155 | 40 | `'/activities'` | `'/api/activities` | `const response = await request.get('/activities', {` |
| 175 | 41 | `'/marketing/` | `'/api/marketing/` | `const response = await request.post('/marketing/referrals/generate-poster', {` |
| 201 | 41 | `'/marketing/` | `'/api/marketing/` | `const response = await request.post('/marketing/referrals/generate-poster', {` |

### 21. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/ReferralCodeDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 346 | 36 | `'/marketing/` | `'/api/marketing/` | `const res = await request.post('/marketing/referrals/generate-poster', {` |
| 397 | 35 | `'/marketing/` | `'/api/marketing/` | `const res = await request.get('/marketing/referrals/my-stats')` |

### 22. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/duplicates-backup/SystemCenter-Enhanced.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 644 | 40 | `'/statistics'` | `'/api/statistics` | `const response = await request.get('/statistics', {` |

### 23. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 566 | 40 | `'/statistics'` | `'/api/statistics` | `const response = await request.get('/statistics', {` |
| 606 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/campaigns')` |
| 619 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/channels')` |
| 632 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/coupons')` |
| 645 | 40 | `'/marketing/` | `'/api/marketing/` | `const response = await request.get('/marketing/consultations')` |

### 24. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 727 | 40 | `'/statistics'` | `'/api/statistics` | `const response = await request.get('/statistics', {` |

### 25. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/teacher-center/class-contacts/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 59 | 45 | `'/classes'` | `'/api/classes` | `const classResponse = await request.get('/classes')` |

### 26. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/permission-center/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 35 | 40 | `'/roles'` | `'/api/roles` | `const response = await request.get('/roles')` |

### 27. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/user-center/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 35 | 40 | `'/users'` | `'/api/users` | `const response = await request.get('/users')` |

### 28. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityRegister.vue

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 325 | 40 | ``/activities` | ``/api/activities` | `const response = await request.get(`/activities/${activityId.value}`)` |
| 325 | 40 | ``/activities/` | ``/api/activities/` | `const response = await request.get(`/activities/${activityId.value}`)` |
| 348 | 40 | ``/users` | ``/api/users` | `const response = await request.get(`/users/${sharerId.value}`)` |
| 348 | 40 | ``/users/` | ``/api/users/` | `const response = await request.get(`/users/${sharerId.value}`)` |

### 29. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/enrollment-plan/PlanEdit.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 | 上下文 |
|------|------|--------|--------|--------|
| 272 | 40 | `'/classes'` | `'/api/classes` | `const response = await request.get('/classes')` |

## 排除的文件（自动跳过）

以下文件路径包含配置、路由或布局，已自动排除：

- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/pagination-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/router.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/upload-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/validation-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/navigation-backup.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/environment.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/animation-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/navigation.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/timeout-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/icon-mapping.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/navigation-refactored.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/ai-experts.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/oss-paths.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/game-config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/complete-role-navigation.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/roleNavigation.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/design-tokens.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/response-handler.config.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/static-menu.ts
- /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/config/vitest.config.ts

... 还有 70 个文件

## 修复说明

### 修复的端点类型

1. **中心类端点**: `/activity-center/*` → `/api/activity-center/*`
2. **中心类端点**: `/teaching-center/*` → `/api/teaching-center/*`
3. **营销端点**: `/marketing/*` → `/api/marketing/*`
4. **资源端点**: `/activities` → `/api/activities`
5. **资源端点**: `/classes` → `/api/classes`
6. **资源端点**: `/statistics` → `/api/statistics`
7. **资源端点**: `/users` → `/api/users`
8. **资源端点**: `/roles` → `/api/roles`
9. **资源端点**: `/script-templates` → `/api/script-templates`

### 排除的内容

- 路由配置文件 (`/config/`, `/router/`)
- 布局组件 (`/layouts/`, `/components/layout/`)
- 路由定义 (`path:`, `route:`, `redirect:`)
- 权限映射 (`PERMISSIONS.`, `NAVIGATION`)
- 导航配置 (`menuItems`, `routeMap`)
- 组件属性 (`@click`, `:to`, `href`)
- 已有 `/api` 前缀的路径
- 完整的外部 URL（如 `https://...`）
- 前端内部路径（如 `/assets/...`）

### 只修复以下上下文中的路径

- HTTP客户端调用: `request.get/post/put/delete`
- Axios调用: `axios.get/post/put/delete`
- Fetch调用: `fetch()`
- 自定义API函数: `cachedGet`, `apiRequest`
- URL配置: `url:`, `endpoint:`, `baseUrl:`

### 建议的后续步骤

1. 审查此报告，确认所有修复都是正确的
2. 检查排除的文件列表，确保没有误判
3. 运行测试套件确保没有破坏任何功能
4. 提交代码前进行代码审查
5. 部署到测试环境进行验证
