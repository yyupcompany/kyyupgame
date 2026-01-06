# API 前缀修复报告

生成时间: 2026/1/5 02:12:03
扫描目录: /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src

## 统计摘要

- **总文件数**: 1581
- **包含问题的文件数**: 60
- **总问题数**: 294
- **已修复文件数**: 60
- **跳过的文件数**: 0

## 修复模式统计

- **Pattern 7**: 50 个问题
- **Pattern 2**: 71 个问题
- **Pattern 8**: 26 个问题
- **Pattern 9**: 21 个问题
- **Pattern 10**: 12 个问题
- **Pattern 5**: 9 个问题
- **Pattern 3**: 33 个问题
- **Pattern 4**: 24 个问题
- **Pattern 11**: 7 个问题
- **Pattern 13**: 7 个问题
- **Pattern 14**: 5 个问题
- **Pattern 0**: 23 个问题
- **Pattern 6**: 3 个问题
- **Pattern 12**: 3 个问题

## 需要修复的文件列表

### 1. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/services/smart-router.service.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 163 | 14 | `'/statistics'` | `'/api/statistics` |

### 2. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/services/light-query.service.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 52 | 37 | `'/statistics'` | `'/api/statistics` |

### 3. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/navigation-backup.ts

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 1168 | 14 | `'/statistics'` | `'/api/statistics` |
| 1222 | 18 | `'/marketing/` | `'/api/marketing/` |
| 1229 | 18 | `'/marketing/` | `'/api/marketing/` |
| 1242 | 14 | `'/marketing/` | `'/api/marketing/` |

### 4. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/timeout-config.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 128 | 49 | `'/statistics'` | `'/api/statistics` |

### 5. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/navigation-refactored.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 281 | 14 | `'/statistics'` | `'/api/statistics` |

### 6. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/complete-role-navigation.ts

**问题数量**: 10

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 237 | 18 | `'/marketing/` | `'/api/marketing/` |
| 239 | 22 | `'/marketing/` | `'/api/marketing/` |
| 686 | 18 | `'/statistics'` | `'/api/statistics` |
| 688 | 22 | `'/statistics` | `'/api/statistics` |
| 688 | 22 | `'/statistics/` | `'/api/statistics/` |
| 988 | 18 | `'/marketing/` | `'/api/marketing/` |
| 990 | 22 | `'/marketing/` | `'/api/marketing/` |
| 1149 | 18 | `'/statistics'` | `'/api/statistics` |
| 1151 | 22 | `'/statistics` | `'/api/statistics` |
| 1151 | 22 | `'/statistics/` | `'/api/statistics/` |

### 7. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/config/roleNavigation.ts

**问题数量**: 6

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 393 | 18 | `'/statistics'` | `'/api/statistics` |
| 395 | 22 | `'/statistics` | `'/api/statistics` |
| 395 | 22 | `'/statistics/` | `'/api/statistics/` |
| 736 | 18 | `'/statistics'` | `'/api/statistics` |
| 738 | 22 | `'/statistics` | `'/api/statistics` |
| 738 | 22 | `'/statistics/` | `'/api/statistics/` |

### 8. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/authentication/user-management-api.test.ts

**问题数量**: 8

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 182 | 52 | `'/users'` | `'/api/users` |
| 283 | 52 | ``/users` | ``/api/users` |
| 283 | 52 | ``/users/` | ``/api/users/` |
| 401 | 53 | `'/users'` | `'/api/users` |
| 506 | 52 | ``/users` | ``/api/users` |
| 506 | 52 | ``/users/` | ``/api/users/` |
| 583 | 55 | ``/users` | ``/api/users` |
| 583 | 55 | ``/users/` | ``/api/users/` |

### 9. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/device-detection.ts

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 207 | 7 | `'/statistics'` | `'/api/statistics` |
| 271 | 28 | `'/statistics'` | `'/api/statistics` |

### 10. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/cachedRequest.ts

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 294 | 22 | `'/users'` | `'/api/users` |
| 324 | 22 | `'/classes'` | `'/api/classes` |
| 334 | 22 | ``/users` | ``/api/users` |
| 334 | 22 | ``/users/` | ``/api/users/` |

### 11. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/route-preloader.ts

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 48 | 47 | `'/statistics'` | `'/api/statistics` |
| 342 | 43 | `'/statistics'` | `'/api/statistics` |

### 12. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/permission.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 401 | 3 | `'/statistics'` | `'/api/statistics` |

### 13. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/performance-optimizer.ts

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 387 | 49 | `'/statistics'` | `'/api/statistics` |

### 14. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/utils/predictive-preloader.ts

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 341 | 54 | `'/statistics'` | `'/api/statistics` |
| 550 | 51 | `'/activities` | `'/api/activities` |
| 550 | 51 | `'/activities/` | `'/api/activities/` |
| 551 | 43 | `'/users'` | `'/api/users` |
| 552 | 44 | `'/roles'` | `'/api/roles` |

### 15. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/layouts/OptimizedMainLayout.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 272 | 5 | `'/statistics'` | `'/api/statistics` |

### 16. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/script-template.ts

**问题数量**: 12

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 65 | 6 | `'/script-templates'` | `'/api/script-templates` |
| 72 | 38 | ``/script-templates` | ``/api/script-templates` |
| 72 | 38 | ``/script-templates/` | ``/api/script-templates/` |
| 79 | 39 | `'/script-templates'` | `'/api/script-templates` |
| 86 | 38 | ``/script-templates` | ``/api/script-templates` |
| 86 | 38 | ``/script-templates/` | ``/api/script-templates/` |
| 93 | 25 | ``/script-templates` | ``/api/script-templates` |
| 93 | 25 | ``/script-templates/` | ``/api/script-templates/` |
| 107 | 42 | `'/script-templates` | `'/api/script-templates` |
| 107 | 42 | `'/script-templates/` | `'/api/script-templates/` |
| 119 | 7 | `'/script-templates` | `'/api/script-templates` |
| 119 | 7 | `'/script-templates/` | `'/api/script-templates/` |

### 17. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/teaching-center.ts

**问题数量**: 13

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 20 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 49 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 72 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 89 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 113 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 130 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 156 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 163 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 196 | 27 | ``/teaching-center/` | ``/api/teaching-center/` |
| 272 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 279 | 27 | ``/teaching-center/` | ``/api/teaching-center/` |
| 314 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |
| 351 | 24 | ``/teaching-center/` | ``/api/teaching-center/` |

### 18. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/class.ts

**问题数量**: 8

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 176 | 16 | `'/classes'` | `'/api/classes` |
| 183 | 16 | ``/classes` | ``/api/classes` |
| 183 | 16 | ``/classes/` | ``/api/classes/` |
| 190 | 17 | `'/classes'` | `'/api/classes` |
| 197 | 16 | ``/classes` | ``/api/classes` |
| 197 | 16 | ``/classes/` | ``/api/classes/` |
| 204 | 16 | ``/classes` | ``/api/classes` |
| 204 | 16 | ``/classes/` | ``/api/classes/` |

### 19. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/unified-api.ts

**问题数量**: 7

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 230 | 27 | `'/users'` | `'/api/users` |
| 235 | 28 | `'/users'` | `'/api/users` |
| 240 | 27 | ``/users` | ``/api/users` |
| 240 | 27 | ``/users/` | ``/api/users/` |
| 245 | 30 | ``/users` | ``/api/users` |
| 245 | 30 | ``/users/` | ``/api/users/` |
| 250 | 27 | `'/roles'` | `'/api/roles` |

### 20. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity.ts

**问题数量**: 12

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 68 | 16 | `'/activities'` | `'/api/activities` |
| 75 | 16 | ``/activities` | ``/api/activities` |
| 75 | 16 | ``/activities/` | ``/api/activities/` |
| 82 | 17 | `'/activities'` | `'/api/activities` |
| 89 | 16 | ``/activities` | ``/api/activities` |
| 89 | 16 | ``/activities/` | ``/api/activities/` |
| 96 | 16 | ``/activities` | ``/api/activities` |
| 96 | 16 | ``/activities/` | ``/api/activities/` |
| 104 | 14 | ``/activities` | ``/api/activities` |
| 104 | 14 | ``/activities/` | ``/api/activities/` |
| 111 | 14 | `'/activities` | `'/api/activities` |
| 111 | 14 | `'/activities/` | `'/api/activities/` |

### 21. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/activity.ts

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 15 | 9 | `'/activities'` | `'/api/activities` |
| 16 | 39 | ``/activities` | ``/api/activities` |
| 16 | 39 | ``/activities/` | ``/api/activities/` |
| 17 | 15 | `'/activities` | `'/api/activities` |
| 17 | 15 | `'/activities/` | `'/api/activities/` |

### 22. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/marketing-template.ts

**问题数量**: 15

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 235 | 22 | ``/marketing/` | ``/api/marketing/` |
| 254 | 22 | ``/marketing/` | ``/api/marketing/` |
| 263 | 22 | ``/marketing/` | ``/api/marketing/` |
| 277 | 23 | ``/marketing/` | ``/api/marketing/` |
| 286 | 24 | ``/marketing/` | ``/api/marketing/` |
| 295 | 24 | ``/marketing/` | ``/api/marketing/` |
| 331 | 23 | ``/marketing/` | ``/api/marketing/` |
| 346 | 22 | ``/marketing/` | ``/api/marketing/` |
| 360 | 22 | ``/marketing/` | ``/api/marketing/` |
| 373 | 23 | ``/marketing/` | ``/api/marketing/` |
| 387 | 22 | ``/marketing/` | ``/api/marketing/` |
| 397 | 22 | ``/marketing/` | ``/api/marketing/` |
| 406 | 23 | ``/marketing/` | ``/api/marketing/` |
| 415 | 22 | ``/marketing/` | ``/api/marketing/` |
| 499 | 10 | ``/marketing/` | ``/api/marketing/` |

### 23. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/system.ts

**问题数量**: 18

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 30 | 10 | `'/users'` | `'/api/users` |
| 31 | 40 | ``/users` | ``/api/users` |
| 31 | 40 | ``/users/` | ``/api/users/` |
| 32 | 12 | `'/users` | `'/api/users` |
| 32 | 12 | `'/users/` | `'/api/users/` |
| 33 | 17 | `'/users` | `'/api/users` |
| 33 | 17 | `'/users/` | `'/api/users/` |
| 34 | 41 | ``/users` | ``/api/users` |
| 34 | 41 | ``/users/` | ``/api/users/` |
| 35 | 50 | ``/users` | ``/api/users` |
| 35 | 50 | ``/users/` | ``/api/users/` |
| 38 | 10 | `'/roles'` | `'/api/roles` |
| 39 | 40 | ``/roles` | ``/api/roles` |
| 39 | 40 | ``/roles/` | ``/api/roles/` |
| 40 | 13 | `'/roles` | `'/api/roles` |
| 40 | 13 | `'/roles/` | `'/api/roles/` |
| 41 | 37 | ``/roles` | ``/api/roles` |
| 41 | 37 | ``/roles/` | ``/api/roles/` |

### 24. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/statistics.ts

**问题数量**: 16

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 105 | 16 | `'/statistics` | `'/api/statistics` |
| 105 | 16 | `'/statistics/` | `'/api/statistics/` |
| 112 | 16 | `'/statistics` | `'/api/statistics` |
| 112 | 16 | `'/statistics/` | `'/api/statistics/` |
| 119 | 16 | `'/statistics` | `'/api/statistics` |
| 119 | 16 | `'/statistics/` | `'/api/statistics/` |
| 126 | 16 | `'/statistics` | `'/api/statistics` |
| 126 | 16 | `'/statistics/` | `'/api/statistics/` |
| 133 | 16 | `'/statistics` | `'/api/statistics` |
| 133 | 16 | `'/statistics/` | `'/api/statistics/` |
| 144 | 17 | `'/statistics` | `'/api/statistics` |
| 144 | 17 | `'/statistics/` | `'/api/statistics/` |
| 151 | 16 | `'/statistics` | `'/api/statistics` |
| 151 | 16 | `'/statistics/` | `'/api/statistics/` |
| 163 | 16 | `'/statistics` | `'/api/statistics` |
| 163 | 16 | `'/statistics/` | `'/api/statistics/` |

### 25. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/modules/marketing.ts

**问题数量**: 16

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 173 | 22 | ``/activities` | ``/api/activities` |
| 173 | 22 | ``/activities/` | ``/api/activities/` |
| 192 | 22 | ``/activities` | ``/api/activities` |
| 192 | 22 | ``/activities/` | ``/api/activities/` |
| 201 | 22 | ``/activities` | ``/api/activities` |
| 201 | 22 | ``/activities/` | ``/api/activities/` |
| 211 | 22 | ``/activities` | ``/api/activities` |
| 211 | 22 | ``/activities/` | ``/api/activities/` |
| 226 | 24 | ``/activities` | ``/api/activities` |
| 226 | 24 | ``/activities/` | ``/api/activities/` |
| 264 | 24 | ``/marketing/` | ``/api/marketing/` |
| 273 | 22 | ``/marketing/` | ``/api/marketing/` |
| 298 | 10 | ``/activities` | ``/api/activities` |
| 298 | 10 | ``/activities/` | ``/api/activities/` |
| 433 | 22 | ``/marketing/` | ``/api/marketing/` |
| 447 | 23 | ``/marketing/` | ``/api/marketing/` |

### 26. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts

**问题数量**: 10

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 50 | 22 | ``/activity-center/` | ``/api/activity-center/` |
| 64 | 22 | ``/activity-center/` | ``/api/activity-center/` |
| 71 | 25 | ``/activity-center/` | ``/api/activity-center/` |
| 78 | 23 | ``/activity-center/` | ``/api/activity-center/` |
| 85 | 23 | ``/activity-center/` | ``/api/activity-center/` |
| 108 | 22 | ``/activity-center/` | ``/api/activity-center/` |
| 115 | 23 | ``/activity-center/` | ``/api/activity-center/` |
| 143 | 22 | ``/activity-center/` | ``/api/activity-center/` |
| 208 | 22 | ``/activity-center/` | ``/api/activity-center/` |
| 215 | 25 | ``/activity-center/` | ``/api/activity-center/` |

### 27. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/index.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 253 | 35 | `'/marketing/` | `'/api/marketing/` |
| 278 | 35 | `'/marketing/` | `'/api/marketing/` |
| 311 | 26 | ``/marketing/` | ``/api/marketing/` |

### 28. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/ChannelEditDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 199 | 25 | ``/marketing/` | ``/api/marketing/` |
| 202 | 26 | `'/marketing/` | `'/api/marketing/` |

### 29. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/ContactManageDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 125 | 35 | ``/marketing/` | ``/api/marketing/` |
| 145 | 24 | ``/marketing/` | ``/api/marketing/` |
| 170 | 26 | ``/marketing/` | ``/api/marketing/` |

### 30. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/MetricsDialog.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 176 | 35 | ``/marketing/` | ``/api/marketing/` |

### 31. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/channels/components/TagManageDialog.vue

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 123 | 35 | ``/marketing/` | ``/api/marketing/` |
| 133 | 35 | `'/marketing/` | `'/api/marketing/` |
| 146 | 35 | `'/marketing/` | `'/api/marketing/` |
| 163 | 24 | ``/marketing/` | ``/api/marketing/` |
| 196 | 26 | ``/marketing/` | ``/api/marketing/` |

### 32. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/index.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 292 | 35 | `'/marketing/` | `'/api/marketing/` |
| 318 | 35 | `'/marketing/` | `'/api/marketing/` |
| 529 | 35 | `'/marketing/` | `'/api/marketing/` |

### 33. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/components/DimensionDetailDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 284 | 35 | `'/marketing/` | `'/api/marketing/` |
| 309 | 35 | `'/marketing/` | `'/api/marketing/` |
| 330 | 35 | `'/marketing/` | `'/api/marketing/` |

### 34. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/funnel/components/StageDetailDialog.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 250 | 35 | `'/marketing/` | `'/api/marketing/` |
| 273 | 35 | `'/marketing/` | `'/api/marketing/` |
| 293 | 35 | `'/marketing/` | `'/api/marketing/` |

### 35. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/conversions/index.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 344 | 35 | `'/marketing/` | `'/api/marketing/` |
| 612 | 35 | `'/marketing/` | `'/api/marketing/` |

### 36. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/conversions/components/ConversionDetailDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 206 | 35 | `'/marketing/` | `'/api/marketing/` |
| 231 | 35 | `'/marketing/` | `'/api/marketing/` |

### 37. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/index.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 377 | 40 | `'/marketing/` | `'/api/marketing/` |
| 404 | 40 | `'/activities'` | `'/api/activities` |

### 38. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/QrcodeGenerator.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 161 | 40 | `'/activities'` | `'/api/activities` |
| 210 | 41 | `'/marketing/` | `'/api/marketing/` |

### 39. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/PosterGenerator.vue

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 133 | 40 | `'/marketing/` | `'/api/marketing/` |
| 155 | 40 | `'/activities'` | `'/api/activities` |
| 175 | 41 | `'/marketing/` | `'/api/marketing/` |
| 201 | 41 | `'/marketing/` | `'/api/marketing/` |

### 40. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/marketing/referrals/components/ReferralCodeDialog.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 346 | 36 | `'/marketing/` | `'/api/marketing/` |
| 397 | 35 | `'/marketing/` | `'/api/marketing/` |

### 41. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/duplicates-backup/MarketingCenter-Original.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 69 | 57 | `'/marketing/` | `'/api/marketing/` |

### 42. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/duplicates-backup/SystemCenter-Enhanced.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 644 | 40 | `'/statistics'` | `'/api/statistics` |

### 43. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue

**问题数量**: 5

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 566 | 40 | `'/statistics'` | `'/api/statistics` |
| 606 | 40 | `'/marketing/` | `'/api/marketing/` |
| 619 | 40 | `'/marketing/` | `'/api/marketing/` |
| 632 | 40 | `'/marketing/` | `'/api/marketing/` |
| 645 | 40 | `'/marketing/` | `'/api/marketing/` |

### 44. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 727 | 40 | `'/statistics'` | `'/api/statistics` |

### 45. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/teacher-center/class-contacts/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 59 | 45 | `'/classes'` | `'/api/classes` |

### 46. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/permission-center/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 35 | 40 | `'/roles'` | `'/api/roles` |

### 47. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/user-center/index.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 35 | 40 | `'/users'` | `'/api/users` |

### 48. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityDetail.vue

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 375 | 32 | ``/activities` | ``/api/activities` |
| 375 | 32 | ``/activities/` | ``/api/activities/` |

### 49. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityPublish.vue

**问题数量**: 3

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 162 | 32 | `'/activities'` | `'/api/activities` |
| 198 | 32 | ``/activities` | ``/api/activities` |
| 198 | 32 | ``/activities/` | ``/api/activities/` |

### 50. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityRegistrations.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 181 | 32 | `'/activities'` | `'/api/activities` |

### 51. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityCheckin.vue

**问题数量**: 9

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 200 | 32 | `'/activities'` | `'/api/activities` |
| 218 | 32 | ``/activities` | ``/api/activities` |
| 218 | 32 | ``/activities/` | ``/api/activities/` |
| 248 | 33 | ``/activities` | ``/api/activities` |
| 248 | 33 | ``/activities/` | ``/api/activities/` |
| 266 | 32 | ``/activities` | ``/api/activities` |
| 266 | 32 | ``/activities/` | ``/api/activities/` |
| 293 | 33 | ``/activities` | ``/api/activities` |
| 293 | 33 | ``/activities/` | ``/api/activities/` |

### 52. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityRegister.vue

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 325 | 40 | ``/activities` | ``/api/activities` |
| 325 | 40 | ``/activities/` | ``/api/activities/` |
| 348 | 40 | ``/users` | ``/api/users` |
| 348 | 40 | ``/users/` | ``/api/users/` |

### 53. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/activity/ActivityList.vue

**问题数量**: 6

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 331 | 38 | ``/activities` | ``/api/activities` |
| 331 | 38 | ``/activities/` | ``/api/activities/` |
| 366 | 52 | ``/activities` | ``/api/activities` |
| 366 | 52 | ``/activities/` | ``/api/activities/` |
| 419 | 38 | ``/activities` | ``/api/activities` |
| 419 | 38 | ``/activities/` | ``/api/activities/` |

### 54. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/dashboard/ClassCreate.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 841 | 46 | `'/classes'` | `'/api/classes` |

### 55. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/statistics/index.vue

**问题数量**: 28

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 597 | 11 | `'/statistics` | `'/api/statistics` |
| 597 | 11 | `'/statistics/` | `'/api/statistics/` |
| 598 | 11 | `'/statistics` | `'/api/statistics` |
| 598 | 11 | `'/statistics/` | `'/api/statistics/` |
| 599 | 11 | `'/statistics` | `'/api/statistics` |
| 599 | 11 | `'/statistics/` | `'/api/statistics/` |
| 600 | 11 | `'/statistics` | `'/api/statistics` |
| 600 | 11 | `'/statistics/` | `'/api/statistics/` |
| 601 | 11 | `'/statistics` | `'/api/statistics` |
| 601 | 11 | `'/statistics/` | `'/api/statistics/` |
| 665 | 32 | `'/statistics` | `'/api/statistics` |
| 665 | 32 | `'/statistics/` | `'/api/statistics/` |
| 689 | 32 | `'/statistics` | `'/api/statistics` |
| 689 | 32 | `'/statistics/` | `'/api/statistics/` |
| 808 | 32 | `'/statistics` | `'/api/statistics` |
| 808 | 32 | `'/statistics/` | `'/api/statistics/` |
| 831 | 32 | `'/statistics` | `'/api/statistics` |
| 831 | 32 | `'/statistics/` | `'/api/statistics/` |
| 979 | 32 | `'/statistics` | `'/api/statistics` |
| 979 | 32 | `'/statistics/` | `'/api/statistics/` |
| 1309 | 30 | `'/statistics` | `'/api/statistics` |
| 1309 | 30 | `'/statistics/` | `'/api/statistics/` |
| 1323 | 30 | `'/statistics` | `'/api/statistics` |
| 1323 | 30 | `'/statistics/` | `'/api/statistics/` |
| 1420 | 33 | `'/statistics` | `'/api/statistics` |
| 1420 | 33 | `'/statistics/` | `'/api/statistics/` |
| 1537 | 33 | `'/statistics` | `'/api/statistics` |
| 1537 | 33 | `'/statistics/` | `'/api/statistics/` |

### 56. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/enrollment-plan/PlanEdit.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 272 | 40 | `'/classes'` | `'/api/classes` |

### 57. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/enrollment-plan/PlanForm.vue

**问题数量**: 1

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 573 | 53 | `'/users'` | `'/api/users` |

### 58. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/stores/ai-assistant.ts

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 154 | 7 | `'/statistics'` | `'/api/statistics` |
| 190 | 7 | `'/marketing/` | `'/api/marketing/` |
| 191 | 7 | `'/marketing/` | `'/api/marketing/` |
| 192 | 7 | `'/marketing/` | `'/api/marketing/` |

### 59. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/router/router-config.ts

**问题数量**: 2

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 26 | 5 | `'/statistics'` | `'/api/statistics` |
| 60 | 5 | `'/statistics'` | `'/api/statistics` |

### 60. /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/components/layout/Header.vue

**问题数量**: 4

| 行号 | 列号 | 原内容 | 修复后 |
|------|------|--------|--------|
| 311 | 5 | `'/marketing/` | `'/api/marketing/` |
| 312 | 5 | `'/marketing/` | `'/api/marketing/` |
| 313 | 5 | `'/marketing/` | `'/api/marketing/` |
| 329 | 5 | `'/statistics'` | `'/api/statistics` |

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

- 已有 `/api` 前缀的路径
- 完整的外部 URL（如 `https://...`）
- 路由路径（如 `router.push('/xxx')`）
- 前端内部路径（如 `/assets/...`）

### 建议的后续步骤

1. 审查此报告，确认所有修复都是正确的
2. 运行测试套件确保没有破坏任何功能
3. 提交代码前进行代码审查
4. 部署到测试环境进行验证
