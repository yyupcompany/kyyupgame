# 前后端端点对齐检测报告 (2026-01-17)

- 扫描后端文件数: **1374**
- 抽取到后端端点数(去重, 仅字面量): **1069**
- 扫描前端文件数: **1683**
- 抽取到前端 API 调用端点数(去重): **703**

> 说明：这是“静态扫描”结果（基于代码里的路径字面量），可能存在少量误报/漏报（例如路径由变量拼接、或多级 router.use 前缀组合）。但非常适合快速抓出“明显写错的端点/路径”。

## 1) 前端调用存在，但后端未发现的 API 端点（需要对齐）

共 **648** 条：

### 1. `/activities/:param/cancel-checkin`

- 前端引用文件:
  - `client/src/pages/activity/ActivityCheckin.vue`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activities`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 2. `/activities/:param/checkin`

- 前端引用文件:
  - `client/src/pages/activity/ActivityCheckin.vue`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activities`
  - `/activity-checkin-overview`
  - `/teacher-dashboard/activity-checkin-overview`
  - `/activity/:param/statistics`

### 3. `/activities/:param/export`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 4. `/activities/:param/participants`

- 前端引用文件:
  - `client/src/pages/activity/ActivityCheckin.vue`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activities`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 5. `/activities/:param/publish`

- 前端引用文件:
  - `client/src/pages/activity/ActivityPublish.vue`
- 后端可能存在的相近端点候选:
  - `/:param/publish`
  - `/activities/:param`
  - `/activities`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`

### 6. `/activities/:param/results`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activities`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 7. `/activities/:param/scan-checkin`

- 前端引用文件:
  - `client/src/pages/activity/ActivityCheckin.vue`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activities`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 8. `/activities/:param/status`

- 前端引用文件:
  - `client/src/api/activity.ts`
  - `client/src/api/modules/marketing.ts`
  - `client/src/pages/activity/ActivityList.vue`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 9. `/activities/batch`

- 前端引用文件:
  - `client/src/api/activity.ts`
- 后端可能存在的相近端点候选:
  - `/batch`
  - `/system/logs/batch`
  - `/base-info/batch`
  - `/students/batch`
  - `/parents/batch`

### 10. `/activity-center/activities`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activities`
  - `/direct/enrollment-statistics/activities`
  - `/enrollment-statistics/activities`
  - `/principal/activities`
  - `/:param/activities`

### 11. `/activity-center/activities/:param`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activity/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 12. `/activity-center/activities/:param/cancel`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/cancel`
  - `/orders/:param/cancel`
  - `/offline/cancel`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`

### 13. `/activity-center/activities/:param/publish`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/publish`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 14. `/activity-center/analytics`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/analytics`
  - `/analytics/trends`
  - `/analytics/overview`
  - `/predictive-analytics`
  - `/predictive-analytics/refresh`

### 15. `/activity-center/analytics/:param/report`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/report`
  - `/security/csp-report`
  - `/report-error`
  - `/satisfaction-report`
  - `/reports`

### 16. `/activity-center/analytics/participation`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 17. `/activity-center/distribution`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/distribution`
  - `/models/distribution`
  - `/personnel-center/distribution`
  - `/class-distribution`
  - `/cost-distribution`

### 18. `/activity-center/notifications`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/recent-notifications`
  - `/teacher-dashboard/recent-notifications`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 19. `/activity-center/notifications/send`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/send`
  - `/:param/resend`
  - `/send-payment-reminder`
  - `/send-code`
  - `/activity/:param/statistics`

### 20. `/activity-center/notifications/templates`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/templates`
  - `/sop-templates`
  - `/sop-templates/:param`
  - `/sop-templates/:param/duplicate`
  - `/sop-templates/:param/nodes`

### 21. `/activity-center/notifications/templates/:param`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activity/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 22. `/activity-center/overview`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activity/overview`
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`

### 23. `/activity-center/registrations`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/registrations`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 24. `/activity-center/registrations/:param`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activity/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 25. `/activity-center/registrations/:param/approve`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/interactive-links/:param/approve`
  - `/:param/approve`
  - `/approve`
  - `/batch-approve`
  - `/activity/:param/statistics`

### 26. `/activity-center/registrations/batch-approve`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/batch-approve`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 27. `/activity-center/trend`

- 前端引用文件:
  - `client/src/api/activity-center.ts`
- 后端可能存在的相近端点候选:
  - `/activity/trend`
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/personnel-center/trend`

### 28. `/activity-plans/:param/publish`

- 前端引用文件:
  - `client/src/pages/activity/ActivityCreate.vue`
- 后端可能存在的相近端点候选:
  - `/:param/publish`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 29. `/activity-registration-page/:param`

- 前端引用文件:
  - `client/src/api/modules/activity-registration-page.ts`
- 后端可能存在的相近端点候选:
  - `/activities/:param`
  - `/activity/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 30. `/activity-registration-page/:param/stats`

- 前端引用文件:
  - `client/src/api/modules/activity-registration-page.ts`
- 后端可能存在的相近端点候选:
  - `/activity/:param/stats`
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`

### 31. `/activity-registration-page/:param/submit`

- 前端引用文件:
  - `client/src/api/modules/activity-registration-page.ts`
- 后端可能存在的相近端点候选:
  - `/:param/submit`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 32. `/activity-registrations`

- 前端引用文件:
  - `client/src/pages/activity/ActivityRegister.vue`
  - `client/src/pages/activity/ActivityRegistrations.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 33. `/activity-registrations/:param/approve`

- 前端引用文件:
  - `client/src/pages/activity/ActivityRegistrations.vue`
- 后端可能存在的相近端点候选:
  - `/interactive-links/:param/approve`
  - `/:param/approve`
  - `/approve`
  - `/batch-approve`
  - `/activity/:param/statistics`

### 34. `/activity-registrations/:param/reject`

- 前端引用文件:
  - `client/src/pages/activity/ActivityRegistrations.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 35. `/activity-registrations/batch-approve`

- 前端引用文件:
  - `client/src/pages/activity/ActivityRegistrations.vue`
- 后端可能存在的相近端点候选:
  - `/batch-approve`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`

### 36. `/activity-registrations/batch-reject`

- 前端引用文件:
  - `client/src/pages/activity/ActivityRegistrations.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 37. `/activity/benchmarks`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 38. `/activity/historical-data`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 39. `/activity/implement-recommendation`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`
- 后端可能存在的相近端点候选:
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`
  - `/activity`
  - `/activities`

### 40. `/ai-billing/my-bill`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/my-bill`
  - `/ai-billing/statistics`
  - `/ai-billing/bills`

### 41. `/ai-billing/record/:param/status`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 42. `/ai-billing/records/batch-status`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/records/batch-status`
  - `/ai-billing/statistics`
  - `/ai-billing/bills`

### 43. `/ai-billing/user/:param/bill`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/user/:param/bill`
  - `/ai-billing/statistics`
  - `/ai-billing/bills`
  - `/ai/models/:param/billing`
  - `/my-bill`

### 44. `/ai-billing/user/:param/export`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 45. `/ai-billing/user/:param/trend`

- 前端引用文件:
  - `client/src/api/endpoints/ai-billing.ts`
- 后端可能存在的相近端点候选:
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/activity/trend`
  - `/personnel-center/trend`

### 46. `/ai-query/chat`

- 前端引用文件:
  - `client/src/api/modules/ai-query.ts`
- 后端可能存在的相近端点候选:
  - `/chat`
  - `/chat/completions`
  - `/wechat/notify`
  - `/smart-chat`
  - `/unified-chat-stream`

### 47. `/ai-scoring/analyze`

- 前端引用文件:
  - `client/src/pages/centers/components/AIScoringDrawer.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/customers/:param/screenshots/:param/analyze`
  - `/ai/analyze/:param`
  - `/ai/batch-analyze`

### 48. `/ai-scoring/check-availability`

- 前端引用文件:
  - `client/src/pages/centers/components/AIScoringDrawer.vue`
- 后端可能存在的相近端点候选:
  - `/check-availability`

### 49. `/ai-scoring/record-time`

- 前端引用文件:
  - `client/src/pages/centers/components/AIScoringDrawer.vue`
- 后端可能存在的相近端点候选:
  - `/record-time`

### 50. `/ai-shortcuts/:param`

- 前端引用文件:
  - `client/src/api/ai-shortcuts.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 51. `/ai-shortcuts/batch/delete`

- 前端引用文件:
  - `client/src/api/ai-shortcuts.ts`
- 后端可能存在的相近端点候选:
  - `/batch/delete`
  - `/delete`
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`

### 52. `/ai-shortcuts/sort`

- 前端引用文件:
  - `client/src/api/ai-shortcuts.ts`
- 后端可能存在的相近端点候选:
  - `/sort`

### 53. `/ai-stats/models`

- 前端引用文件:
  - `client/src/pages/centers/AICenter.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models`
  - `/models`
  - `/ai/models/:param`
  - `/ai/models/:param/billing`
  - `/models/status`

### 54. `/ai-stats/overview`

- 前端引用文件:
  - `client/src/pages/ai/analytics/index.vue`
  - `client/src/pages/centers/AICenter.vue`
- 后端可能存在的相近端点候选:
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`
  - `/system/overview`

### 55. `/ai-stats/recent-tasks`

- 前端引用文件:
  - `client/src/pages/ai/analytics/index.vue`
  - `client/src/pages/centers/AICenter.vue`
- 后端可能存在的相近端点候选:
  - `/recent-tasks`
  - `/ai-status`

### 56. `/ai/activity-comparison`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 57. `/ai/activity-optimization-recommendations`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 58. `/ai/activity-roi-analysis`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 59. `/ai/activity-trends`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 60. `/ai/analysis`

- 前端引用文件:
  - `client/src/api/modules/ai.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/analysis`
  - `/analysis-history`
  - `/channel-analysis`
  - `/plan/:param/batch-analysis`

### 61. `/ai/batch-assign`

- 前端引用文件:
  - `client/src/components/customer/AIAssignDialog.vue`
- 后端可能存在的相近端点候选:
  - `/batch-assign`
  - `/customer-pool/batch-assign`
  - `/batch-assign-class`
  - `/ai/batch-analyze`

### 62. `/ai/chat`

- 前端引用文件:
  - `client/src/pages/demo/ExpertTeamDemo.vue`
- 后端可能存在的相近端点候选:
  - `/chat`
  - `/chat/completions`
  - `/wechat/notify`
  - `/smart-chat`
  - `/unified-chat-stream`

### 63. `/ai/comprehensive-risk-assessment`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/ai/conversations`

### 64. `/ai/conversations/:param`

- 前端引用文件:
  - `client/src/api/modules/ai.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 65. `/ai/conversations/:param/messages`

- 前端引用文件:
  - `client/src/api/modules/ai.ts`
- 后端可能存在的相近端点候选:
  - `/:param/messages`
  - `/conversations/:param/messages`
  - `/messages`
  - `/sessions/:param/messages`
  - `/ai/conversations`

### 66. `/ai/curriculum/generate`

- 前端引用文件:
  - `client/src/pages/teacher-center/creative-curriculum/services/ai-curriculum.service.ts`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 67. `/ai/curriculum/generate-simple`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/components/services/ai-curriculum.service.ts`

### 68. `/ai/curriculum/generate-stream`

- 前端引用文件:
  - `client/src/pages/teacher-center/creative-curriculum/services/ai-curriculum.service.ts`
- 后端可能存在的相近端点候选:
  - `/generate-stream`
  - `/interactive-curriculum/generate-stream`

### 69. `/ai/customer-lifecycle-analysis`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`

### 70. `/ai/decision-scenario-analysis`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`

### 71. `/ai/deep-activity-analysis`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 72. `/ai/expert/smart-chat`

- 前端引用文件:
  - `client/src/pages/demo/SmartExpertDemo.vue`
  - `client/src/pages/principal/media-center/CopywritingCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/smart-chat`

### 73. `/ai/expert/voice/generate`

- 前端引用文件:
  - `client/src/composables/useExpertVoice.ts`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 74. `/ai/feedback/conversation`

- 前端引用文件:
  - `client/src/services/ai.service.ts`
- 后端可能存在的相近端点候选:
  - `/conversation`
  - `/ai/conversations`
  - `/conversations`
  - `/conversations/:param`
  - `/conversations/:param/messages`

### 75. `/ai/feedback/message`

- 前端引用文件:
  - `client/src/services/ai.service.ts`
- 后端可能存在的相近端点候选:
  - `/:param/messages`
  - `/conversations/:param/messages`
  - `/messages`
  - `/sessions/:param/messages`

### 76. `/ai/feedback/submit`

- 前端引用文件:
  - `client/src/components/ai-assistant/chat/MessageFeedback.vue`
  - `client/src/services/ai.service.ts`
- 后端可能存在的相近端点候选:
  - `/:param/submit`

### 77. `/ai/generate-poster`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/AIPosterGeneratorDialog.vue`
- 后端可能存在的相近端点候选:
  - `/referrals/generate-poster`
  - `/generate-poster`
  - `/ai/generate-script`
  - `/ai/generate-response/:param`

### 78. `/ai/intelligent-communication-queue`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`

### 79. `/ai/memory/memory/search/last-month/:param`

- 前端引用文件:
  - `client/src/api/ai.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 80. `/ai/memory/memory/search/time-range/:param`

- 前端引用文件:
  - `client/src/api/ai.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 81. `/ai/models/:param/test`

- 前端引用文件:
  - `client/src/api/modules/ai.ts`
- 后端可能存在的相近端点候选:
  - `/ai/tts/test`
  - `/test`
  - `/vos-config/test`
  - `/:param/test`
  - `/ai/models/:param/billing`

### 82. `/ai/performance-prediction`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/performance-prediction`

### 83. `/ai/predict-activity-success`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`
- 后端可能存在的相近端点候选:
  - `/ai/predict`

### 84. `/ai/prompts/:param/effectiveness`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/activity-effectiveness`
  - `/ai/predict`

### 85. `/ai/prompts/:param/stats`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 86. `/ai/prompts/optimize-suggestions`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/ai/predict`

### 87. `/ai/prompts/recommendations`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/recommendations`
  - `/recommendations/generate`
  - `/ai/predict`

### 88. `/ai/prompts/search`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/contacts/search`
  - `/search`
  - `/ai/memories/search`
  - `/students/search`
  - `/parents/search`

### 89. `/ai/prompts/trending`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/ai/predict`

### 90. `/ai/prompts/usage`

- 前端引用文件:
  - `client/src/services/prompt-optimization.service.ts`
- 后端可能存在的相近端点候选:
  - `/usage`
  - `/usage/stats`
  - `/my-usage`
  - `/ai/predict`

### 91. `/ai/simulate-decision-outcome`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`

### 92. `/ai/smart-assign`

- 前端引用文件:
  - `client/src/components/customer/AIAssignDialog.vue`
- 后端可能存在的相近端点候选:
  - `/smart-assign`

### 93. `/ai/stats`

- 前端引用文件:
  - `client/src/services/ai-router.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 94. `/ai/strategic-planning-assistant`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/ai/strategy`

### 95. `/ai/text-to-speech`

- 前端引用文件:
  - `client/src/pages/principal/media-center/TextToSpeech.vue`
  - `client/src/pages/principal/media-center/TextToSpeechTimeline.vue`
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`

### 96. `/ai/unified/capabilities`

- 前端引用文件:
  - `client/src/api/ai/function-tools.js`
  - `client/src/api/endpoints/function-tools.ts`
- 后端可能存在的相近端点候选:
  - `/capabilities`
  - `/ai/unified/unified-intelligence`
  - `/models/:param/capabilities/:param`

### 97. `/ai/unified/direct-chat`

- 前端引用文件:
  - `client/src/api/endpoints/function-tools.ts`
- 后端可能存在的相近端点候选:
  - `/direct-chat`
  - `/ai/unified/unified-intelligence`

### 98. `/ai/unified/status`

- 前端引用文件:
  - `client/src/api/ai/function-tools.js`
  - `client/src/api/endpoints/function-tools.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 99. `/ai/unified/unified-chat`

- 前端引用文件:
  - `client/src/api/ai/function-tools.js`
  - `client/src/api/endpoints/function-tools.ts`
- 后端可能存在的相近端点候选:
  - `/unified-chat`
  - `/ai/unified/unified-intelligence`
  - `/unified-chat-stream`
  - `/unified-chat-direct`

### 100. `/analysis/competitors`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 101. `/analysis/current-situation`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 102. `/analysis/market-trends`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 103. `/analysis/resources`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 104. `/analytics/activity-types`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 105. `/analytics/age-groups`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`
  - `/analysis`

### 106. `/analytics/enrollment-trend`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/enrollment-trend`
  - `/enrollment-trends`
  - `/statistics/enrollment-trends`
  - `/analyze`
  - `/analysis-history`

### 107. `/analytics/metrics`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/db-monitor/metrics`
  - `/channels/:param/metrics`
  - `/metrics`
  - `/analyze`
  - `/analysis-history`

### 108. `/analytics/regions`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/regions`
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`

### 109. `/analytics/revenue`

- 前端引用文件:
  - `client/src/pages/analytics/index.vue`
- 后端可能存在的相近端点候选:
  - `/revenue`
  - `/analyze`
  - `/analysis-history`
  - `/analytics/trends`
  - `/analytics`

### 110. `/api1056`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 111. `/api15527`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 112. `/api15765`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 113. `/api16571`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 114. `/api16775`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 115. `/api1681`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 116. `/api16994`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 117. `/api17869`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 118. `/api19046`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 119. `/api19226`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 120. `/api19413`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 121. `/api20544`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 122. `/api20752`

- 前端引用文件:
  - `client/src/api/modules/system.ts`

### 123. `/api2333`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 124. `/api2477`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 125. `/api2501`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 126. `/api2680`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 127. `/api2900`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 128. `/api3105`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 129. `/api3320`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 130. `/api3551`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 131. `/api3587`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 132. `/api3813`

- 前端引用文件:
  - `client/src/api/modules/teacher-checkin.ts`

### 133. `/api4045`

- 前端引用文件:
  - `client/src/api/modules/log.ts`

### 134. `/api4297`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 135. `/api4328`

- 前端引用文件:
  - `client/src/api/modules/log.ts`

### 136. `/api4597`

- 前端引用文件:
  - `client/src/api/modules/log.ts`

### 137. `/api5047`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 138. `/api5745`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 139. `/api6630`

- 前端引用文件:
  - `client/src/api/endpoints/__tests__/usage-center.test.ts`

### 140. `/api6970`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`

### 141. `/api8570`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`

### 142. `/api9843`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`

### 143. `/assessment-admin/physical-items/:param`

- 前端引用文件:
  - `client/src/api/assessment-admin.ts`
- 后端可能存在的相近端点候选:
  - `/assessment-admin/configs/:param`
  - `/assessment-admin/questions/:param`
  - `/assessment/record/:param`
  - `/assessment/report/:param`
  - `/ai/models/:param`

### 144. `/assessment-share/rewards`

- 前端引用文件:
  - `client/src/api/assessment-share.ts`
- 后端可能存在的相近端点候选:
  - `/rewards`
  - `/teacher/rewards`
  - `/assessment-admin/configs`
  - `/assessment-admin/configs/:param`
  - `/assessment-admin/questions`

### 145. `/assessment-share/scan`

- 前端引用文件:
  - `client/src/api/assessment-share.ts`
- 后端可能存在的相近端点候选:
  - `/scan`
  - `/assessment-admin/configs`
  - `/assessment-admin/configs/:param`
  - `/assessment-admin/questions`
  - `/assessment-admin/questions/:param`

### 146. `/assessment-share/share`

- 前端引用文件:
  - `client/src/api/assessment-share.ts`
- 后端可能存在的相近端点候选:
  - `/:param/share`
  - `/share`
  - `/:param/share-hierarchy`
  - `/:param/share/stats`
  - `/assessment-admin/configs`

### 147. `/assessment-share/stats/:param`

- 前端引用文件:
  - `client/src/api/assessment-share.ts`
- 后端可能存在的相近端点候选:
  - `/assessment-admin/configs/:param`
  - `/assessment-admin/questions/:param`
  - `/assessment/record/:param`
  - `/assessment/report/:param`
  - `/ai/models/:param`

### 148. `/auth-permissions/check-permission`

- 前端引用文件:
  - `client/src/api/modules/auth-permissions.ts`
- 后端可能存在的相近端点候选:
  - `/check-permission`

### 149. `/auth-permissions/menu`

- 前端引用文件:
  - `client/src/api/modules/auth-permissions.ts`
- 后端可能存在的相近端点候选:
  - `/menu`

### 150. `/auth-permissions/permissions`

- 前端引用文件:
  - `client/src/api/modules/auth-permissions.ts`
- 后端可能存在的相近端点候选:
  - `/permissions`
  - `/roles/:param/permissions`
  - `/:param/permissions`
  - `/user-permissions`
  - `/permissions/:param/inheritance`

### 151. `/auth-permissions/roles`

- 前端引用文件:
  - `client/src/api/modules/auth-permissions.ts`
- 后端可能存在的相近端点候选:
  - `/roles`
  - `/users/:param/roles`
  - `/roles/:param/permissions`
  - `/roles/:param/permission-history`
  - `/my-roles`

### 152. `/auth/2fa/authenticators`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
- 后端可能存在的相近端点候选:
  - `/authenticators`
  - `/auth/login`

### 153. `/auth/2fa/disable`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
  - `client/src/components/auth/TwoFactorSetup.vue`
- 后端可能存在的相近端点候选:
  - `/disable`
  - `/auth/login`

### 154. `/auth/2fa/setup`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
  - `client/src/components/auth/TwoFactorSetup.vue`
- 后端可能存在的相近端点候选:
  - `/setup`
  - `/auth/login`

### 155. `/auth/2fa/status`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
  - `client/src/components/auth/TwoFactorSetup.vue`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 156. `/auth/2fa/verify`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
  - `client/src/components/auth/TwoFactorSetup.vue`
- 后端可能存在的相近端点候选:
  - `/materials/:param/verify`
  - `/:param/verify`
  - `/verify`
  - `/demo/verify-token`
  - `/verify-code`

### 157. `/auth/2fa/verify-login`

- 前端引用文件:
  - `client/src/api/modules/two-factor.ts`
- 后端可能存在的相近端点候选:
  - `/verify-login`
  - `/auth/login`

### 158. `/auth/bind-tenant`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/bind-tenant`
  - `/auth/login`

### 159. `/auth/check-permission`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/check-permission`
  - `/auth/login`

### 160. `/auth/dynamic-routes`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/dynamic-routes`
  - `/auth/login`

### 161. `/auth/flexible-login`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 162. `/auth/me`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/ReferralCodeDialog.vue`
- 后端可能存在的相近端点候选:
  - `/me`
  - `/auth/login`

### 163. `/auth/permissions`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/permissions`
  - `/roles/:param/permissions`
  - `/:param/permissions`
  - `/user-permissions`
  - `/permissions/:param/inheritance`

### 164. `/auth/register`

- 前端引用文件:
  - `client/src/pages/Register.vue`
- 后端可能存在的相近端点候选:
  - `/register`
  - `/register-by-code`
  - `/register-callback`
  - `/auth/login`

### 165. `/auth/register-by-code`

- 前端引用文件:
  - `client/src/components/group-buy/QuickRegisterModal.vue`
- 后端可能存在的相近端点候选:
  - `/register-by-code`
  - `/auth/login`

### 166. `/auth/register/form-data`

- 前端引用文件:
  - `client/src/pages/Register.vue`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 167. `/auth/role-permission-mapping`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 168. `/auth/roles/:param/permissions`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/permissions`
  - `/roles/:param/permissions`
  - `/:param/permissions`
  - `/user-permissions`
  - `/permissions/:param/inheritance`

### 169. `/auth/unified-config`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 170. `/auth/unified-health`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 171. `/auth/unified-login`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 172. `/auth/user-tenants`

- 前端引用文件:
  - `client/src/api/auth.ts`
- 后端可能存在的相近端点候选:
  - `/auth/login`

### 173. `/auto-image/activity`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/activity`
  - `/by-activity/:param`
  - `/activity/:param/statistics`
  - `/activity/:param/stats`
  - `/activity-effectiveness`

### 174. `/auto-image/batch`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/batch`
  - `/system/logs/batch`
  - `/base-info/batch`
  - `/students/batch`
  - `/parents/batch`

### 175. `/auto-image/generate`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 176. `/auto-image/poster`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/poster`
  - `/:param/poster/generate`
  - `/:param/posters`
  - `/:param/poster/preview`
  - `/posters/upload`

### 177. `/auto-image/status`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 178. `/auto-image/template`

- 前端引用文件:
  - `client/src/api/auto-image.ts`
- 后端可能存在的相近端点候选:
  - `/template`
  - `/sop-templates`
  - `/sop-templates/:param`
  - `/sop-templates/:param/duplicate`
  - `/sop-templates/:param/nodes`

### 179. `/batch-import/customer-preview`

- 前端引用文件:
  - `client/src/components/customer/CustomerBatchImportPreview.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/batch`
  - `/batch-confirm`
  - `/batch/delete`
  - `/batch-assign`

### 180. `/call-center/ai/check-compliance`

- 前端引用文件:
  - `client/src/components/call-center/AIAnalysisPanel.vue`
- 后端可能存在的相近端点候选:
  - `/ai/check-compliance`

### 181. `/call-center/ai/generate-script`

- 前端引用文件:
  - `client/src/components/call-center/AIAnalysisPanel.vue`
- 后端可能存在的相近端点候选:
  - `/ai/generate-script`

### 182. `/call-center/ai/transcribe/:param/start`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/start`
  - `/call/:param/recording/start`
  - `/ai/transcribe/:param/start`
  - `/assessment/start`
  - `/start-permission-watcher`

### 183. `/call-center/ai/transcribe/:param/stop`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/call/:param/recording/stop`
  - `/ai/transcribe/:param/stop`
  - `/tasks/:param/stop`

### 184. `/call-center/ai/tts/test`

- 前端引用文件:
  - `client/src/components/call-center/AIAnalysisPanel.vue`
- 后端可能存在的相近端点候选:
  - `/ai/tts/test`
  - `/test`
  - `/vos-config/test`
  - `/:param/test`
  - `/test-formatter`

### 185. `/call-center/call/:param/dtmf`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`

### 186. `/call-center/contacts/:param`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 187. `/call-center/extensions/:param/reset`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/records/reset`
  - `/extensions/:param/reset`
  - `/reset`
  - `/attendance-center/records/reset`
  - `/reset-stats`

### 188. `/call-center/extensions/:param/status`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 189. `/call-center/recordings/:param`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 190. `/call-center/recordings/:param/transcribe`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/recordings/:param/transcribe`
  - `/ai/transcribe/:param/start`
  - `/ai/transcribe/:param/stop`
  - `/ai/transcribe/:param/result`

### 191. `/call-center/recordings/:param/transcript`

- 前端引用文件:
  - `client/src/api/modules/call-center.ts`
- 后端可能存在的相近端点候选:
  - `/recordings/:param/transcript`

### 192. `/call-center/sip/test`

- 前端引用文件:
  - `client/src/components/call-center/SIPSettingsDialog.vue`
- 后端可能存在的相近端点候选:
  - `/ai/tts/test`
  - `/test`
  - `/vos-config/test`
  - `/:param/test`
  - `/test-formatter`

### 193. `/centers/activity/timeline`

- 前端引用文件:
  - `client/src/pages/centers/ActivityCenter.vue`
- 后端可能存在的相近端点候选:
  - `/timeline`
  - `/customers/:param/timeline`
  - `/plans/timeline`
  - `/centers/activity/overview`
  - `/centers/system/overview`

### 194. `/chat/conversations`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/ai/conversations`
  - `/conversations`
  - `/customers/:param/conversations`
  - `/conversations/:param`
  - `/conversations/:param/messages`

### 195. `/chat/conversations/:param`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 196. `/chat/conversations/:param/messages`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/:param/messages`
  - `/conversations/:param/messages`
  - `/messages`
  - `/sessions/:param/messages`
  - `/chat/completions`

### 197. `/chat/conversations/:param/read`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/:param/read`
  - `/notices/:param/read`
  - `/notices/mark-all-read`
  - `/:param/readers`
  - `/unread/count`

### 198. `/chat/messages`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/:param/messages`
  - `/conversations/:param/messages`
  - `/messages`
  - `/sessions/:param/messages`
  - `/chat/completions`

### 199. `/chat/messages/:param`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 200. `/chat/messages/:param/read`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/:param/read`
  - `/notices/:param/read`
  - `/notices/mark-all-read`
  - `/:param/readers`
  - `/unread/count`

### 201. `/chat/unread-count`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/unread-count`
  - `/chat/completions`

### 202. `/chat/upload`

- 前端引用文件:
  - `client/src/api/modules/chat.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 203. `/class/:param/parents`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/class-contacts/index.vue`
- 后端可能存在的相近端点候选:
  - `/parents`
  - `/students/:param/parents`
  - `/:param/parents`
  - `/personnel-center/parents`
  - `/classes`

### 204. `/contact/submit`

- 前端引用文件:
  - `client/src/pages/Contact.vue`
- 后端可能存在的相近端点候选:
  - `/:param/submit`
  - `/contacts`
  - `/contacts/:param`
  - `/contacts/search`

### 205. `/custom-courses`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/components/ScheduleBuilder.vue`
  - `client/src/pages/teacher-center/creative-curriculum/components/ScheduleBuilder.vue`
  - `client/src/pages/teacher-center/creative-curriculum/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 206. `/custom-courses/:param`

- 前端引用文件:
  - `client/src/pages/teacher-center/creative-curriculum/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-applications/:param`
  - `/customer-pool/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 207. `/customer/apply-insight`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 208. `/customer/execute-recommendation`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 209. `/customer/execute-retention-strategy`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 210. `/customer/optimize-lifecycle-stage`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 211. `/customer/pursue-upsell-opportunity`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 212. `/customer/schedule-communication`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 213. `/customer/schedule-recommendation`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 214. `/customer/send-communication`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-preview`
  - `/customer-applications/:param`
  - `/customers/:param/timeline`
  - `/custom-layout`
  - `/customer-pool/stats`

### 215. `/customer/stage-details/:param`

- 前端引用文件:
  - `client/src/pages/customer/lifecycle/intelligent-management.vue`
- 后端可能存在的相近端点候选:
  - `/customer-applications/:param`
  - `/customer-pool/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 216. `/customers/:param`

- 前端引用文件:
  - `client/src/pages/customer/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-applications/:param`
  - `/customer-pool/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 217. `/customers/:param/follow-up`

- 前端引用文件:
  - `client/src/pages/customer/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-pool/:param/follow-up`
  - `/:param/follow-up`
  - `/customers/:param/timeline`
  - `/customers/:param/progress`
  - `/customers/:param/tasks/:param/complete`

### 218. `/customers/assign`

- 前端引用文件:
  - `client/src/pages/customer/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-pool/assign`
  - `/assign`
  - `/:param/assign`
  - `/customer-pool/batch-assign`
  - `/smart-assign`

### 219. `/customers/list`

- 前端引用文件:
  - `client/src/pages/customer/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-pool/list`
  - `/rules/list`
  - `/list`
  - `/principal/customer-pool/list`
  - `/alerts/rules/list`

### 220. `/customers/stats`

- 前端引用文件:
  - `client/src/pages/customer/CustomerStatistics.vue`
  - `client/src/pages/customer/index.vue`
- 后端可能存在的相近端点候选:
  - `/customer-pool/stats`
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`

### 221. `/dashboard/principal/stats`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 222. `/dashboard/schedule-data`

- 前端引用文件:
  - `client/src/pages/dashboard/Schedule.vue`
- 后端可能存在的相近端点候选:
  - `/schedule-data`
  - `/dashboard/schedule`
  - `/dashboard/stats`
  - `/dashboard/todos`
  - `/dashboard/todos/:param/status`

### 223. `/data`

- 前端引用文件:
  - `client/src/api/api-rules.ts`
- 后端可能存在的相近端点候选:
  - `/data-statistics`
  - `/database`
  - `/protected-data`
  - `/parse-batch-data`
  - `/dashboard/data-statistics`

### 224. `/data-import/check-permission`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/check-permission`
  - `/data-statistics`

### 225. `/data-import/execute`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/execute`
  - `/tasks/:param/execute`
  - `/:param/re-execute`
  - `/execute-single`
  - `/data-statistics`

### 226. `/data-import/history`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/history`
  - `/calls/history`
  - `/user/history`
  - `/tasks/:param/history`
  - `/permission-change-history`

### 227. `/data-import/mapping`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/mapping`
  - `/data-statistics`

### 228. `/data-import/parse`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/parse`
  - `/parse-batch-data`
  - `/data-statistics`

### 229. `/data-import/preview`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/:param/poster/preview`
  - `/preview`
  - `/:param/preview`
  - `/customer-preview`
  - `/data-statistics`

### 230. `/data-import/schema/:param`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 231. `/data-import/supported-types`

- 前端引用文件:
  - `client/src/api/data-import.ts`
- 后端可能存在的相近端点候选:
  - `/supported-types`
  - `/data-statistics`

### 232. `/data/:param`

- 前端引用文件:
  - `client/src/api/api-rules.ts`
  - `client/src/api/fix-api-types.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 233. `/decision/create-scenario`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`

### 234. `/decision/execute`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/execute`
  - `/tasks/:param/execute`
  - `/:param/re-execute`
  - `/execute-single`

### 235. `/document-import/formats`

- 前端引用文件:
  - `client/src/components/ai/DocumentImport.vue`
- 后端可能存在的相近端点候选:
  - `/formats`
  - `/document-analysis`

### 236. `/document-import/history`

- 前端引用文件:
  - `client/src/components/ai/DocumentImport.vue`
- 后端可能存在的相近端点候选:
  - `/history`
  - `/calls/history`
  - `/user/history`
  - `/tasks/:param/history`
  - `/permission-change-history`

### 237. `/document-import/import`

- 前端引用文件:
  - `client/src/components/ai/DocumentImport.vue`
- 后端可能存在的相近端点候选:
  - `/import`
  - `/attendance-center/import`
  - `/notices/important`
  - `/document-analysis`

### 238. `/document-import/permissions`

- 前端引用文件:
  - `client/src/components/ai/DocumentImport.vue`
- 后端可能存在的相近端点候选:
  - `/permissions`
  - `/roles/:param/permissions`
  - `/:param/permissions`
  - `/user-permissions`
  - `/permissions/:param/inheritance`

### 239. `/document-import/preview`

- 前端引用文件:
  - `client/src/components/ai/DocumentImport.vue`
- 后端可能存在的相近端点候选:
  - `/:param/poster/preview`
  - `/preview`
  - `/:param/preview`
  - `/customer-preview`
  - `/document-analysis`

### 240. `/document-instances`

- 前端引用文件:
  - `client/src/pages/centers/DocumentCenter.vue`
  - `client/src/pages/centers/InspectionCenter.vue`
  - `client/src/pages/centers/components/AIScoringDrawer.vue`
- 后端可能存在的相近端点候选:
  - `/document-analysis`

### 241. `/document-instances/:param`

- 前端引用文件:
  - `client/src/pages/centers/DocumentCenter.vue`
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 242. `/document-templates`

- 前端引用文件:
  - `client/src/pages/centers/DocumentCenter.vue`
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/document-analysis`

### 243. `/dynamic-permissions/check-permission`

- 前端引用文件:
  - `client/src/stores/permissions-complex.ts`
  - `client/src/stores/permissions.ts`
- 后端可能存在的相近端点候选:
  - `/check-permission`
  - `/dynamic-routes`

### 244. `/enrollment-ai/ai-status`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/ai-status`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 245. `/enrollment-ai/plan/:param/ai-history`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/ai-history`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 246. `/enrollment-ai/plan/:param/batch-analysis`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/batch-analysis`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 247. `/enrollment-ai/plan/:param/evaluation`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/evaluation`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 248. `/enrollment-ai/plan/:param/export-ai-report`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/export-ai-report`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 249. `/enrollment-ai/plan/:param/forecast`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/forecast`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 250. `/enrollment-ai/plan/:param/optimization`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/optimization`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 251. `/enrollment-ai/plan/:param/simulation`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/simulation`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 252. `/enrollment-ai/plan/:param/smart-planning`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/smart-planning`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 253. `/enrollment-ai/plan/:param/strategy`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/plan/:param/strategy`
  - `/ai/strategy`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 254. `/enrollment-ai/trends`

- 前端引用文件:
  - `client/src/api/modules/enrollment-ai.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment-statistics/trends`
  - `/direct/enrollment-statistics/trends`
  - `/trends`
  - `/analytics/trends`
  - `/enrollment-trends`

### 255. `/enrollment-consultations`

- 前端引用文件:
  - `client/src/pages/parent-center/assessment/Report.vue`
- 后端可能存在的相近端点候选:
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`
  - `/enrollment-statistics/trends`

### 256. `/enrollment-finance/enrollment-approved/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollmentFinance.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 257. `/enrollment-finance/fee-package-templates/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollmentFinance.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 258. `/enrollment-finance/process/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollmentFinance.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 259. `/enrollment-interviews`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/appointment-management/index.vue`
- 后端可能存在的相近端点候选:
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`
  - `/enrollment-statistics/trends`

### 260. `/enrollment-plans`

- 前端引用文件:
  - `client/src/pages/enrollment-plan/PlanForm.vue`
- 后端可能存在的相近端点候选:
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`
  - `/enrollment-statistics/trends`

### 261. `/enrollment-plans/:param`

- 前端引用文件:
  - `client/src/pages/enrollment-plan/PlanEdit.vue`
  - `client/src/pages/enrollment-plan/PlanForm.vue`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 262. `/enrollment-plans/:param/classes`

- 前端引用文件:
  - `client/src/pages/enrollment-plan/PlanEdit.vue`
- 后端可能存在的相近端点候选:
  - `/dashboard/classes`
  - `/classes`
  - `/:param/classes`
  - `/teaching/classes`
  - `/personnel-center/classes`

### 263. `/enrollment-plans/:param/trackings`

- 前端引用文件:
  - `client/src/pages/enrollment-plan/PlanDetail.vue`
- 后端可能存在的相近端点候选:
  - `/:param/trackings`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`
  - `/enrollment-statistics/performance`

### 264. `/enrollment/applications`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/applications`
  - `/applications/:param/status`
  - `/applications/:param`
  - `/teacher/customer-applications`
  - `/principal/customer-applications`

### 265. `/enrollment/applications/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 266. `/enrollment/applications/:param/review`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/:param/review`
  - `/principal/customer-applications/:param/review`
  - `/:param/poster/preview`
  - `/preview`
  - `/customer-preview`

### 267. `/enrollment/applications/:param/reviews`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 268. `/enrollment/applications/attachments/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 269. `/enrollment/applications/batch-review`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/principal/customer-applications/batch-review`
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`

### 270. `/enrollment/applications/upload`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 271. `/enrollment/interviewers`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 272. `/enrollment/interviewers/:param/availability`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/check-availability`
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`

### 273. `/enrollment/interviews`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 274. `/enrollment/interviews/:param`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 275. `/enrollment/interviews/:param/score`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 276. `/enrollment/interviews/scores`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 277. `/enrollment/list`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/rules/list`
  - `/list`
  - `/principal/customer-pool/list`
  - `/customer-pool/list`
  - `/alerts/rules/list`

### 278. `/enrollment/notifications/send`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/:param/send`
  - `/:param/resend`
  - `/send-payment-reminder`
  - `/enrollment/trend`
  - `/send-code`

### 279. `/enrollment/reviews`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 280. `/enrollment/reviews/assign`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/assign`
  - `/:param/assign`
  - `/customer-pool/assign`
  - `/smart-assign`
  - `/batch-assign`

### 281. `/enrollment/reviews/batch`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/batch`
  - `/system/logs/batch`
  - `/base-info/batch`
  - `/students/batch`
  - `/parents/batch`

### 282. `/enrollment/reviews/queue`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/enrollment/trend`
  - `/enrollment/:param`
  - `/enrollment-statistics/channels`
  - `/enrollment-statistics/activities`
  - `/enrollment-statistics/conversions`

### 283. `/enrollment/reviews/statistics`

- 前端引用文件:
  - `client/src/api/modules/enrollment.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 284. `/enterprise-dashboard/overview`

- 前端引用文件:
  - `client/src/pages/dashboard/EnterpriseDashboard.vue`
- 后端可能存在的相近端点候选:
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`
  - `/system/overview`

### 285. `/external/factors`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/external-display`
  - `/external-display/class/:param`

### 286. `/files/:param`

- 前端引用文件:
  - `client/src/api/upload.ts`
  - `client/src/utils/fileUpload.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 287. `/files/cleanup-temp`

- 前端引用文件:
  - `client/src/api/upload.ts`
- 后端可能存在的相近端点候选:
  - `/cleanup-temp`
  - `/files`

### 288. `/files/statistics`

- 前端引用文件:
  - `client/src/api/upload.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 289. `/files/storage-info`

- 前端引用文件:
  - `client/src/api/upload.ts`
- 后端可能存在的相近端点候选:
  - `/storage-info`
  - `/files`

### 290. `/files/upload`

- 前端引用文件:
  - `client/src/api/upload.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 291. `/files/upload-multiple`

- 前端引用文件:
  - `client/src/api/upload.ts`
- 后端可能存在的相近端点候选:
  - `/upload-multiple`
  - `/files`

### 292. `/finance/batch-send-reminder`

- 前端引用文件:
  - `client/src/pages/finance/CollectionReminder.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 293. `/finance/fee-settings`

- 前端引用文件:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 294. `/finance/invoices`

- 前端引用文件:
  - `client/src/pages/finance/InvoiceManagement.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 295. `/finance/invoices/:param/cancel`

- 前端引用文件:
  - `client/src/pages/finance/InvoiceManagement.vue`
- 后端可能存在的相近端点候选:
  - `/:param/cancel`
  - `/orders/:param/cancel`
  - `/offline/cancel`
  - `/finance`
  - `/financial`

### 296. `/finance/invoices/:param/issue`

- 前端引用文件:
  - `client/src/pages/finance/InvoiceManagement.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 297. `/finance/overdue-bills`

- 前端引用文件:
  - `client/src/pages/finance/CollectionReminder.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 298. `/finance/payment-reminder-records`

- 前端引用文件:
  - `client/src/pages/finance/PaymentReminderSettings.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 299. `/finance/payment-reminder-settings`

- 前端引用文件:
  - `client/src/pages/finance/PaymentReminderSettings.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 300. `/finance/payment-reminder-templates`

- 前端引用文件:
  - `client/src/pages/finance/PaymentReminderSettings.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 301. `/finance/payment-reminder-templates/:param`

- 前端引用文件:
  - `client/src/pages/finance/PaymentReminderSettings.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 302. `/finance/payment-reminder-templates/:param/set-default`

- 前端引用文件:
  - `client/src/pages/finance/PaymentReminderSettings.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 303. `/finance/payment-rules`

- 前端引用文件:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 304. `/finance/pending-tasks`

- 前端引用文件:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 305. `/finance/refunds`

- 前端引用文件:
  - `client/src/pages/finance/RefundManagement.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 306. `/finance/refunds/:param/approve`

- 前端引用文件:
  - `client/src/pages/finance/RefundManagement.vue`
- 后端可能存在的相近端点候选:
  - `/interactive-links/:param/approve`
  - `/:param/approve`
  - `/approve`
  - `/batch-approve`
  - `/finance`

### 307. `/finance/refunds/:param/refund`

- 前端引用文件:
  - `client/src/pages/finance/RefundManagement.vue`
- 后端可能存在的相近端点候选:
  - `/refund`
  - `/finance`
  - `/financial`

### 308. `/finance/refunds/:param/reject`

- 前端引用文件:
  - `client/src/pages/finance/RefundManagement.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 309. `/finance/reminder-history/:param`

- 前端引用文件:
  - `client/src/pages/finance/CollectionReminder.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 310. `/finance/reminder-settings`

- 前端引用文件:
  - `client/src/pages/finance/CollectionReminder.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 311. `/finance/report-stats`

- 前端引用文件:
  - `client/src/pages/finance/FinancialReports.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 312. `/finance/reports`

- 前端引用文件:
  - `client/src/pages/finance/FinancialReports.vue`
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 后端可能存在的相近端点候选:
  - `/reports`
  - `/reports/:param`
  - `/training/reports/:param`
  - `/finance`
  - `/financial`

### 313. `/finance/reports/:param`

- 前端引用文件:
  - `client/src/pages/finance/FinancialReports.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 314. `/finance/reports/:param/export`

- 前端引用文件:
  - `client/src/pages/finance/FinancialReports.vue`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 315. `/finance/reports/generate`

- 前端引用文件:
  - `client/src/pages/finance/FinancialReports.vue`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 316. `/finance/send-reminder`

- 前端引用文件:
  - `client/src/pages/finance/CollectionReminder.vue`
- 后端可能存在的相近端点候选:
  - `/finance`
  - `/financial`

### 317. `/finance/today-payments`

- 前端引用文件:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 后端可能存在的相近端点候选:
  - `/today-payments`
  - `/finance`
  - `/financial`

### 318. `/followup/ai-analysis`

- 前端引用文件:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
- 后端可能存在的相近端点候选:
  - `/ai-analysis`
  - `/followups`
  - `/followups/:param`
  - `/follow`

### 319. `/followup/analysis`

- 前端引用文件:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/analysis`
  - `/analysis-history`
  - `/channel-analysis`
  - `/plan/:param/batch-analysis`

### 320. `/followup/generate-pdf`

- 前端引用文件:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
- 后端可能存在的相近端点候选:
  - `/generate-pdf`
  - `/followups`
  - `/followups/:param`
  - `/follow`

### 321. `/games/:param`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/games/:param/:param/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 322. `/games/:param/leaderboard`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/:param/leaderboard`
  - `/games/:param/:param/:param`

### 323. `/games/:param/levels`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/:param/levels`
  - `/games/:param/:param/:param`

### 324. `/games/list`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/rules/list`
  - `/list`
  - `/principal/customer-pool/list`
  - `/customer-pool/list`
  - `/alerts/rules/list`

### 325. `/games/record`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/record`
  - `/record/:param/status`
  - `/records/batch-status`
  - `/record-time`
  - `/records`

### 326. `/games/settings/user`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/user`
  - `/avatar/user`
  - `/settings/user`
  - `/statistics/user`
  - `/users`

### 327. `/games/statistics/user`

- 前端引用文件:
  - `client/src/api/games.ts`
- 后端可能存在的相近端点候选:
  - `/user`
  - `/avatar/user`
  - `/settings/user`
  - `/statistics/user`
  - `/users`

### 328. `/groups/:param`

- 前端引用文件:
  - `client/src/api/modules/group.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 329. `/groups/:param/activities`

- 前端引用文件:
  - `client/src/api/modules/group.ts`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/activities`
  - `/enrollment-statistics/activities`
  - `/principal/activities`
  - `/activities`
  - `/:param/activities`

### 330. `/groups/:param/enrollment`

- 前端引用文件:
  - `client/src/api/modules/group.ts`
- 后端可能存在的相近端点候选:
  - `/:param/enrollment`
  - `/enrollment`
  - `/groups`
  - `/direct/enrollment-statistics/plans`
  - `/direct/enrollment-statistics/channels`

### 331. `/groups/:param/users/:param`

- 前端引用文件:
  - `client/src/api/modules/group.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 332. `/inspection-ai/document-analysis`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/document-analysis`
  - `/inspection-tasks/:param/comments`
  - `/inspection/overview`

### 333. `/inspection-ai/plan-analysis`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/plan-analysis`
  - `/inspection-tasks/:param/comments`
  - `/inspection/overview`

### 334. `/inspection-records`

- 前端引用文件:
  - `client/src/pages/centers/components/InspectionRecordDialog.vue`
- 后端可能存在的相近端点候选:
  - `/inspection-tasks/:param/comments`
  - `/inspection/overview`

### 335. `/inspection-records/plan/:param`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 336. `/inspection-rectifications`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
  - `client/src/pages/centers/components/InspectionRectificationDialog.vue`
- 后端可能存在的相近端点候选:
  - `/inspection-tasks/:param/comments`
  - `/inspection/overview`

### 337. `/inspection-rectifications/:param`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 338. `/inspection-rectifications/:param/complete`

- 前端引用文件:
  - `client/src/pages/centers/components/InspectionRectificationDialog.vue`
- 后端可能存在的相近端点候选:
  - `/:param/complete`
  - `/records/:param/complete`
  - `/instances/:param/complete`
  - `/customers/:param/tasks/:param/complete`
  - `/assessment/:param/complete`

### 339. `/inspection-rectifications/:param/progress`

- 前端引用文件:
  - `client/src/pages/centers/InspectionCenter.vue`
  - `client/src/pages/centers/components/InspectionRectificationDialog.vue`
- 后端可能存在的相近端点候选:
  - `/:param/progress`
  - `/teaching/progress`
  - `/instances/:param/nodes/:param/progress`
  - `/customers/:param/progress`
  - `/progress`

### 340. `/inspection-rectifications/:param/verify`

- 前端引用文件:
  - `client/src/pages/centers/components/InspectionRectificationDialog.vue`
- 后端可能存在的相近端点候选:
  - `/materials/:param/verify`
  - `/:param/verify`
  - `/verify`
  - `/demo/verify-token`
  - `/verify-code`

### 341. `/inspection/plans`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
  - `client/src/pages/centers/InspectionCenter.vue`
  - `client/src/pages/centers/components/InspectionPlanEditDialog.vue`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/plans`
  - `/plans`
  - `/training/plans`
  - `/plans/:param`
  - `/plans/timeline`

### 342. `/inspection/plans/:param`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
  - `client/src/pages/centers/components/InspectionPlanDetailDialog.vue`
  - `client/src/pages/centers/components/InspectionPlanEditDialog.vue`
  - `client/src/pages/centers/components/InspectionTimelineEditor.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 343. `/inspection/plans/:param/tasks`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/plans/:param/tasks`
  - `/tasks`
  - `/stages/:param/tasks`
  - `/teacher-dashboard/tasks`
  - `/inspection-tasks/:param/comments`

### 344. `/inspection/plans/:param/tasks/:param`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 345. `/inspection/plans/generate-yearly`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/plans/generate-yearly`
  - `/inspection/overview`
  - `/inspection-tasks/:param/comments`

### 346. `/inspection/plans/timeline`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/timeline`
  - `/customers/:param/timeline`
  - `/plans/timeline`
  - `/inspection/overview`
  - `/inspection-tasks/:param/comments`

### 347. `/inspection/types`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
  - `client/src/pages/centers/components/InspectionPlanEditDialog.vue`
- 后端可能存在的相近端点候选:
  - `/experts/types`
  - `/types`
  - `/supported-types`
  - `/types/active`
  - `/types/:param`

### 348. `/inspection/types/:param`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 349. `/inspection/types/active`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/calls/active`
  - `/vos-config/active`
  - `/types/active`
  - `/active`
  - `/:param/interactive-links`

### 350. `/inspection/types/batch-delete`

- 前端引用文件:
  - `client/src/api/endpoints/inspection.ts`
- 后端可能存在的相近端点候选:
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`
  - `/teacher-dashboard/tasks/batch-delete`
  - `/inspection/overview`

### 351. `/kindergarten/basic-info`

- 前端引用文件:
  - `client/src/pages/dashboard/EnterpriseDashboard.vue`
  - `client/src/pages/principal/BasicInfo.vue`
  - `client/src/services/kindergarten-info.service.ts`
- 后端可能存在的相近端点候选:
  - `/basic-info`
  - `/kindergarten`
  - `/kindergartens`

### 352. `/kindergartens/1`

- 前端引用文件:
  - `client/src/pages/principal/media-center/ArticleCreator.vue`
  - `client/src/pages/principal/media-center/CopywritingCreator.vue`
- 后端可能存在的相近端点候选:
  - `/kindergarten`
  - `/kindergartens`

### 353. `/marketing-center/campaigns/recent`

- 前端引用文件:
  - `client/src/services/marketing-center.service.ts`
- 后端可能存在的相近端点候选:
  - `/recent`
  - `/campaigns/recent`
  - `/recent-tasks`
  - `/recent-creations`
  - `/recent-notifications`

### 354. `/marketing-center/channels`

- 前端引用文件:
  - `client/src/services/marketing-center.service.ts`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/channels`
  - `/enrollment-statistics/channels`
  - `/channels`
  - `/channels/tags`
  - `/channels/:param`

### 355. `/marketing-center/statistics`

- 前端引用文件:
  - `client/src/services/marketing-center.service.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 356. `/marketing-performance/conversion-funnel`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/conversion-funnel`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 357. `/marketing-performance/export/personal-records`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 358. `/marketing-performance/export/report`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/report`
  - `/security/csp-report`
  - `/report-error`
  - `/satisfaction-report`
  - `/reports`

### 359. `/marketing-performance/generate-referral-code/:param`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 360. `/marketing-performance/leaderboard`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/:param/leaderboard`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 361. `/marketing-performance/personal-contribution`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 362. `/marketing-performance/personal-referral-records`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 363. `/marketing-performance/referral-analytics`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 364. `/marketing-performance/referral-records/:param/remind`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/send-payment-reminder`
  - `/reminder-logs`
  - `/reminder-logs/stats`
  - `/reminder-logs/:param`
  - `/reminder-logs/:param/status`

### 365. `/marketing-performance/referral-rewards`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 366. `/marketing-performance/referral-rewards/:param/approve`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/interactive-links/:param/approve`
  - `/:param/approve`
  - `/approve`
  - `/batch-approve`
  - `/marketing/analysis`

### 367. `/marketing-performance/referral-rewards/batch-approve`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/batch-approve`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 368. `/marketing-performance/referral-stats`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/referral-stats`
  - `/teacher/rewards/referral-stats`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 369. `/marketing-performance/reward-payments`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 370. `/marketing-performance/reward-settings`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 371. `/marketing-performance/reward-settings/history`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/history`
  - `/calls/history`
  - `/user/history`
  - `/tasks/:param/history`
  - `/permission-change-history`

### 372. `/marketing-performance/team-ranking`

- 前端引用文件:
  - `client/src/services/marketing-performance.service.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 373. `/marketing/campaigns`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue`
- 后端可能存在的相近端点候选:
  - `/campaigns/recent`
  - `/marketing/copy`
  - `/marketing/analysis`
  - `/marketing/roi`

### 374. `/marketing/channels`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue`
  - `client/src/pages/marketing/channels/components/ChannelEditDialog.vue`
  - `client/src/pages/marketing/channels/index.vue`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/channels`
  - `/enrollment-statistics/channels`
  - `/channels`
  - `/channels/tags`
  - `/channels/:param`

### 375. `/marketing/channels/:param`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`
  - `client/src/pages/marketing/channels/components/ChannelEditDialog.vue`
  - `client/src/pages/marketing/channels/index.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 376. `/marketing/channels/:param/contacts`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/ContactManageDialog.vue`
- 后端可能存在的相近端点候选:
  - `/contacts`
  - `/channels/:param/contacts`
  - `/contacts/:param`
  - `/contacts/search`
  - `/channels/:param/contacts/:param`

### 377. `/marketing/channels/:param/contacts/:param`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/ContactManageDialog.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 378. `/marketing/channels/:param/metrics`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/MetricsDialog.vue`
- 后端可能存在的相近端点候选:
  - `/db-monitor/metrics`
  - `/channels/:param/metrics`
  - `/metrics`
  - `/marketing/copy`
  - `/marketing/analysis`

### 379. `/marketing/channels/:param/tags`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/TagManageDialog.vue`
- 后端可能存在的相近端点候选:
  - `/channels/tags`
  - `/channels/:param/tags`
  - `/channels/:param/tags/:param`
  - `/marketing/copy`
  - `/marketing/analysis`

### 380. `/marketing/channels/:param/tags/:param`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/TagManageDialog.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 381. `/marketing/channels/tags`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/TagManageDialog.vue`
  - `client/src/pages/marketing/channels/index.vue`
- 后端可能存在的相近端点候选:
  - `/channels/tags`
  - `/channels/:param/tags`
  - `/channels/:param/tags/:param`
  - `/marketing/copy`
  - `/marketing/analysis`

### 382. `/marketing/channels/tags/stats`

- 前端引用文件:
  - `client/src/pages/marketing/channels/components/TagManageDialog.vue`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 383. `/marketing/collect-activities`

- 前端引用文件:
  - `client/src/components/marketing/CollectActivityList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/copy`
  - `/marketing/analysis`
  - `/marketing/roi`

### 384. `/marketing/collect-activities/:param/share`

- 前端引用文件:
  - `client/src/components/marketing/CollectActivityList.vue`
- 后端可能存在的相近端点候选:
  - `/:param/share`
  - `/share`
  - `/:param/share-hierarchy`
  - `/:param/share/stats`
  - `/marketing/copy`

### 385. `/marketing/consultations`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue`
- 后端可能存在的相近端点候选:
  - `/consultations`
  - `/consultations/statistics`
  - `/marketing/copy`
  - `/marketing/analysis`
  - `/marketing/roi`

### 386. `/marketing/coupons`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/MarketingCenter-Enhanced.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/copy`
  - `/marketing/analysis`
  - `/marketing/roi`

### 387. `/marketing/group-buy`

- 前端引用文件:
  - `client/src/components/marketing/GroupBuyDialog.vue`
  - `client/src/components/marketing/GroupBuyList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 388. `/marketing/group-buy/:param/join`

- 前端引用文件:
  - `client/src/components/marketing/GroupBuyDialog.vue`
  - `client/src/pages/group-buy/GroupBuyDetail.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 389. `/marketing/group-buy/:param/public`

- 前端引用文件:
  - `client/src/pages/group-buy/GroupBuyDetail.vue`
- 后端可能存在的相近端点候选:
  - `/db-monitor/public-stats`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 390. `/marketing/group-buy/:param/share`

- 前端引用文件:
  - `client/src/components/group-buy/ShareModal.vue`
  - `client/src/components/marketing/GroupBuyList.vue`
- 后端可能存在的相近端点候选:
  - `/:param/share`
  - `/share`
  - `/:param/share-hierarchy`
  - `/:param/share/stats`
  - `/marketing/analysis`

### 391. `/marketing/referrals`

- 前端引用文件:
  - `client/src/components/marketing/ReferralList.vue`
  - `client/src/pages/marketing/referrals/index.vue`
- 后端可能存在的相近端点候选:
  - `/referrals`
  - `/marketing/roi`
  - `/referrals/stats`
  - `/referrals/graph`
  - `/referrals/my-codes`

### 392. `/marketing/referrals/:param`

- 前端引用文件:
  - `client/src/components/marketing/ReferralList.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 393. `/marketing/referrals/:param/pay-reward`

- 前端引用文件:
  - `client/src/components/marketing/ReferralList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 394. `/marketing/referrals/:param/stats`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 395. `/marketing/referrals/:param/track`

- 前端引用文件:
  - `client/src/api/modules/marketing.ts`
- 后端可能存在的相近端点候选:
  - `/referrals/:param/track`
  - `/marketing/roi`
  - `/:param/trackings`
  - `/track-visit`
  - `/track-conversion`

### 396. `/marketing/referrals/batch-cancel`

- 前端引用文件:
  - `client/src/components/marketing/ReferralList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 397. `/marketing/referrals/batch-pay-reward`

- 前端引用文件:
  - `client/src/components/marketing/ReferralList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 398. `/marketing/referrals/generate`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/QrcodeGenerator.vue`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 399. `/marketing/referrals/generate-poster`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/PosterGenerator.vue`
  - `client/src/pages/marketing/referrals/components/ReferralCodeDialog.vue`
- 后端可能存在的相近端点候选:
  - `/referrals/generate-poster`
  - `/generate-poster`
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 400. `/marketing/referrals/my-stats`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/ReferralCodeDialog.vue`
- 后端可能存在的相近端点候选:
  - `/my-stats`
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 401. `/marketing/referrals/poster-templates`

- 前端引用文件:
  - `client/src/pages/marketing/referrals/components/PosterGenerator.vue`
- 后端可能存在的相近端点候选:
  - `/referrals/poster-templates`
  - `/poster-templates`
  - `/marketing/roi`
  - `/marketing/analysis`
  - `/marketing/copy`

### 402. `/marketing/stats/conversions`

- 前端引用文件:
  - `client/src/pages/marketing/conversions/index.vue`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/conversions`
  - `/enrollment-statistics/conversions`
  - `/conversions`
  - `/stats/conversions`
  - `/marketing/analysis`

### 403. `/marketing/stats/conversions/detail`

- 前端引用文件:
  - `client/src/pages/marketing/conversions/components/ConversionDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/user/:param/detail`
  - `/dashboard/class-detail/:param`
  - `/class-detail/:param`
  - `/details`
  - `/performance/details`

### 404. `/marketing/stats/conversions/export`

- 前端引用文件:
  - `client/src/pages/marketing/conversions/index.vue`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 405. `/marketing/stats/conversions/trend`

- 前端引用文件:
  - `client/src/pages/marketing/conversions/components/ConversionDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/activity/trend`
  - `/personnel-center/trend`

### 406. `/marketing/stats/funnel`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/index.vue`
- 后端可能存在的相近端点候选:
  - `/stats/funnel`
  - `/conversion-funnel`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 407. `/marketing/stats/funnel/dimension`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/index.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 408. `/marketing/stats/funnel/dimension/detail`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/DimensionDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/user/:param/detail`
  - `/dashboard/class-detail/:param`
  - `/class-detail/:param`
  - `/details`
  - `/performance/details`

### 409. `/marketing/stats/funnel/dimension/trend`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/DimensionDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/activity/trend`
  - `/personnel-center/trend`

### 410. `/marketing/stats/funnel/dimension/users`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/DimensionDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/users`
  - `/:param/users`
  - `/:param/users/:param`
  - `/create-test-users`
  - `/users/:param/roles`

### 411. `/marketing/stats/funnel/export`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/index.vue`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 412. `/marketing/stats/funnel/stage`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/StageDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/stages`
  - `/stages/:param`
  - `/stages/:param/tasks`
  - `/marketing/analysis`
  - `/marketing/roi`

### 413. `/marketing/stats/funnel/stage/trend`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/StageDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/activity/trend`
  - `/personnel-center/trend`

### 414. `/marketing/stats/funnel/stage/users`

- 前端引用文件:
  - `client/src/pages/marketing/funnel/components/StageDetailDialog.vue`
- 后端可能存在的相近端点候选:
  - `/users`
  - `/:param/users`
  - `/:param/users/:param`
  - `/create-test-users`
  - `/users/:param/roles`

### 415. `/marketing/templates/:param`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 416. `/marketing/templates/:param/apply`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/:param/apply`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 417. `/marketing/templates/:param/archive`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/:param/archive`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 418. `/marketing/templates/:param/duplicate`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/sop-templates/:param/duplicate`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 419. `/marketing/templates/:param/export`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 420. `/marketing/templates/:param/favorites`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 421. `/marketing/templates/:param/publish`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/:param/publish`
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 422. `/marketing/templates/:param/reviews`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 423. `/marketing/templates/:param/reviews/:param`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 424. `/marketing/templates/:param/usage`

- 前端引用文件:
  - `client/src/api/modules/marketing-template.ts`
- 后端可能存在的相近端点候选:
  - `/usage`
  - `/usage/stats`
  - `/my-usage`
  - `/marketing/analysis`
  - `/marketing/roi`

### 425. `/marketing/tiered-rewards`

- 前端引用文件:
  - `client/src/components/marketing/TieredRewardList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 426. `/marketing/tiered-rewards/:param`

- 前端引用文件:
  - `client/src/components/marketing/TieredRewardList.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 427. `/marketing/tiered-rewards/:param/manual-award`

- 前端引用文件:
  - `client/src/components/marketing/TieredRewardList.vue`
- 后端可能存在的相近端点候选:
  - `/marketing/analysis`
  - `/marketing/roi`
  - `/marketing/copy`

### 428. `/marketing/tiered-rewards/:param/toggle`

- 前端引用文件:
  - `client/src/components/marketing/TieredRewardList.vue`
- 后端可能存在的相近端点候选:
  - `/rules/:param/toggle`
  - `/:param/toggle`
  - `/alerts/rules/:param/toggle`
  - `/marketing/analysis`
  - `/marketing/roi`

### 429. `/media-center/content/:param`

- 前端引用文件:
  - `client/src/api/modules/media-center.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 430. `/metrics/baseline`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`
- 后端可能存在的相近端点候选:
  - `/metrics`

### 431. `/mock/customer-pool-list.json`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`

### 432. `/mock/customer-pool-stats.json`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`

### 433. `/notifications`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
  - `client/src/pages/mobile/centers/notification-center/index.vue`
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 后端可能存在的相近端点候选:
  - `/recent-notifications`
  - `/teacher-dashboard/recent-notifications`

### 434. `/notifications/batch`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/batch`
  - `/system/logs/batch`
  - `/base-info/batch`
  - `/students/batch`
  - `/parents/batch`

### 435. `/notifications/categories`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/categories`

### 436. `/operation-logs`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/operations`

### 437. `/operation-logs/:param`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 438. `/operation-logs/batch-delete`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`
  - `/teacher-dashboard/tasks/batch-delete`
  - `/operations`

### 439. `/operation-logs/clean`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/cache/cleanup`
  - `/cleanup-temp`
  - `/cleanup`
  - `/system/cleanup`
  - `/operations`

### 440. `/operation-logs/export`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 441. `/operation-logs/stats`

- 前端引用文件:
  - `client/src/api/operation-logs.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 442. `/organization-status/1/ai-format`

- 前端引用文件:
  - `client/src/components/ai-assistant/composables/useMessageHandling.ts`
- 后端可能存在的相近端点候选:
  - `/:param/ai-format`

### 443. `/oss-diagnostics/diagnose`

- 前端引用文件:
  - `client/src/pages/oss-diagnostics.vue`
- 后端可能存在的相近端点候选:
  - `/diagnose`
  - `/oss-debug`

### 444. `/oss-diagnostics/guide`

- 前端引用文件:
  - `client/src/pages/oss-diagnostics.vue`
- 后端可能存在的相近端点候选:
  - `/guide`
  - `/create-marketing-guides`
  - `/oss-debug`

### 445. `/oss-manager/delete`

- 前端引用文件:
  - `client/src/api/oss-manager.ts`
- 后端可能存在的相近端点候选:
  - `/batch/delete`
  - `/delete`
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`

### 446. `/oss-manager/files`

- 前端引用文件:
  - `client/src/api/oss-manager.ts`
- 后端可能存在的相近端点候选:
  - `/files`

### 447. `/oss-manager/stats`

- 前端引用文件:
  - `client/src/api/oss-manager.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 448. `/oss-manager/structure`

- 前端引用文件:
  - `client/src/api/oss-manager.ts`
- 后端可能存在的相近端点候选:
  - `/structure`

### 449. `/oss-proxy/info/:param`

- 前端引用文件:
  - `client/src/utils/oss-url-builder.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 450. `/page-guides/by-path/:param`

- 前端引用文件:
  - `client/src/services/page-awareness.service.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 451. `/parent-assistant/history`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/ai-assistant/index.vue`
- 后端可能存在的相近端点候选:
  - `/history`
  - `/calls/history`
  - `/user/history`
  - `/tasks/:param/history`
  - `/parent-assistant/answer`

### 452. `/parent-assistant/search`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/ai-assistant/index.vue`
- 后端可能存在的相近端点候选:
  - `/parents/search`
  - `/contacts/search`
  - `/search`
  - `/ai/memories/search`
  - `/students/search`

### 453. `/parent-assistant/statistics`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/ai-assistant/index.vue`
- 后端可能存在的相近端点候选:
  - `/parent-communications/statistics`
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`

### 454. `/parent-permissions/check/:param`

- 前端引用文件:
  - `client/src/api/modules/parent-permission.ts`
- 后端可能存在的相近端点候选:
  - `/parent/:param`
  - `/parents/:param/students/:param`
  - `/parents/:param`
  - `/parent-communications/:param`
  - `/ai/models/:param`

### 455. `/parent/activities`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/activities`
  - `/enrollment-statistics/activities`
  - `/principal/activities`
  - `/activities`
  - `/:param/activities`

### 456. `/parent/activities/:param/enroll`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/plans`
  - `/direct/enrollment-statistics/channels`
  - `/direct/enrollment-statistics/activities`
  - `/direct/enrollment-statistics/conversions`
  - `/direct/enrollment-statistics/performance`

### 457. `/parent/ai-suggestions`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/records/:param/ai-suggestions`
  - `/customers/:param/ai-suggestions/task`
  - `/customers/:param/ai-suggestions/global`
  - `/parents`
  - `/parent/:param`

### 458. `/parent/children`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/children`
  - `/:param([0-9]+)/children`
  - `/parents`
  - `/parent/:param`
  - `/parents/:param/students`

### 459. `/parent/children/:param`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/parent/:param`
  - `/parents/:param/students/:param`
  - `/parents/:param`
  - `/parent-communications/:param`
  - `/ai/models/:param`

### 460. `/parent/children/:param/growth`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/growth-trajectory`
  - `/:param/growth-records`
  - `/assessment/growth-trajectory`
  - `/growth-records`
  - `/growth-records/chart`

### 461. `/parent/notifications`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/recent-notifications`
  - `/teacher-dashboard/recent-notifications`
  - `/parents`
  - `/parent/:param`
  - `/parents/:param/students`

### 462. `/parent/notifications/:param/read`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/:param/read`
  - `/notices/:param/read`
  - `/notices/mark-all-read`
  - `/:param/readers`
  - `/unread/count`

### 463. `/parent/notifications/unread-count`

- 前端引用文件:
  - `client/src/components/layout/ParentSidebar.vue`
- 后端可能存在的相近端点候选:
  - `/unread-count`
  - `/parents`
  - `/parent/:param`
  - `/parents/:param/students`
  - `/parents/:param/students/:param`

### 464. `/parent/stats`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 465. `/parents/children`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 后端可能存在的相近端点候选:
  - `/children`
  - `/:param([0-9]+)/children`
  - `/parents`
  - `/parent/:param`
  - `/parents/:param/students`

### 466. `/parents/stats`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
  - `client/src/pages/parent/ParentStatistics.vue`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 467. `/participant/profiles`

- 前端引用文件:
  - `client/src/pages/activity/analytics/intelligent-analysis.vue`

### 468. `/performance/rules`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/rules`
  - `/:param/rules`
  - `/alerts/rules`
  - `/performance-prediction`
  - `/rules/list`

### 469. `/performance/rules/:param`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 470. `/performance/rules/:param/status`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 471. `/permissions/batch-check`

- 前端引用文件:
  - `client/src/composables/usePagePermissions.ts`
- 后端可能存在的相近端点候选:
  - `/batch-check`
  - `/permissions`
  - `/permissions/:param/inheritance`
  - `/permission-cache-status`
  - `/permission-change-history`

### 472. `/permissions/grant`

- 前端引用文件:
  - `client/src/tests/mobile/security/TC-035-privilege-escalation-protection.test.ts`
- 后端可能存在的相近端点候选:
  - `/permissions`
  - `/permissions/:param/inheritance`
  - `/permission-cache-status`
  - `/permission-change-history`

### 473. `/permissions/page-actions`

- 前端引用文件:
  - `client/src/composables/usePagePermissions.ts`
- 后端可能存在的相近端点候选:
  - `/page-actions`
  - `/permissions`
  - `/permissions/:param/inheritance`
  - `/permission-cache-status`
  - `/permission-change-history`

### 474. `/photos/:param`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/photo-album/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 475. `/photos/:param/favorite`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/photos`
  - `/photo-album/stats/overview`
  - `/photo-album/photos`
  - `/photo-album`
  - `/photo-album/:param`

### 476. `/photos/:param/tag-class`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/photos`
  - `/photo-album/stats/overview`
  - `/photo-album/photos`
  - `/photo-album`
  - `/photo-album/:param`

### 477. `/photos/:param/tag-student`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/photos`
  - `/photo-album/stats/overview`
  - `/photo-album/photos`
  - `/photo-album`
  - `/photo-album/:param`

### 478. `/photos/child/:param/timeline`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/timeline`
  - `/customers/:param/timeline`
  - `/plans/timeline`
  - `/photos`
  - `/photo-album/stats/overview`

### 479. `/photos/class/:param`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/photo-album/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`

### 480. `/photos/statistics`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 481. `/photos/upload`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 482. `/photos/upload-multiple`

- 前端引用文件:
  - `client/src/api/photo.ts`
- 后端可能存在的相近端点候选:
  - `/upload-multiple`
  - `/photos`
  - `/photo-album/stats/overview`
  - `/photo-album/photos`
  - `/photo-album`

### 483. `/placeholder-audio.mp3`

- 前端引用文件:
  - `client/src/pages/centers/PhotoAlbumCenter.vue`

### 484. `/placeholder-image.svg`

- 前端引用文件:
  - `client/src/pages/centers/PhotoAlbumCenter.vue`

### 485. `/poster-templates/:param`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 486. `/poster-templates/categories`

- 前端引用文件:
  - `client/src/api/modules/poster.ts`
  - `client/src/pages/principal/PosterTemplates.vue`
- 后端可能存在的相近端点候选:
  - `/categories`
  - `/poster-templates`
  - `/posters/upload`
  - `/poster`

### 487. `/poster-templates/statistics`

- 前端引用文件:
  - `client/src/api/modules/poster.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 488. `/poster/save`

- 前端引用文件:
  - `client/src/pages/principal/PosterUpload.vue`
- 后端可能存在的相近端点候选:
  - `/save`
  - `/:param/save`
  - `/interactive-curriculum/:param/save`
  - `/posters/upload`
  - `/poster`

### 489. `/poster/save-draft`

- 前端引用文件:
  - `client/src/pages/principal/PosterUpload.vue`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/poster`
  - `/poster-templates`

### 490. `/principal-performance`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/performance-rewards/index.vue`
- 后端可能存在的相近端点候选:
  - `/principal/dashboard`
  - `/principal/dashboard-stats`
  - `/principal/activities`
  - `/principal/customer-applications`
  - `/principal/customer-applications/:param/review`

### 491. `/principal/approvals`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/approvals`
  - `/principal/activities`
  - `/approvals/:param/:param`
  - `/principal/dashboard`
  - `/principal/dashboard-stats`

### 492. `/principal/approvals/:param/:param`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 493. `/principal/campus/overview`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/principal/dashboard/overview`
  - `/overview`
  - `/campus/overview`
  - `/stats/overview`
  - `/system/overview`

### 494. `/principal/commission/rules`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/rules`
  - `/:param/rules`
  - `/alerts/rules`
  - `/rules/list`
  - `/rules/:param/toggle`

### 495. `/principal/commission/simulate`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/simulate`
  - `/principal/customer-applications`
  - `/principal/customer-applications/:param/review`
  - `/principal/customer-applications/batch-review`
  - `/principal/customer-pool/stats`

### 496. `/principal/customer-pool/:param`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 497. `/principal/customer-pool/:param/follow-up`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/:param/follow-up`
  - `/principal/customer-pool/stats`
  - `/principal/customer-pool/list`
  - `/customer-pool/:param/follow-up`
  - `/principal/customer-applications`

### 498. `/principal/customer-pool/assign`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/assign`
  - `/:param/assign`
  - `/customer-pool/assign`
  - `/principal/customer-pool/stats`
  - `/principal/customer-pool/list`

### 499. `/principal/customer-pool/batch-assign`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/batch-assign`
  - `/customer-pool/batch-assign`
  - `/principal/customer-pool/stats`
  - `/principal/customer-pool/list`
  - `/principal/customer-applications`

### 500. `/principal/customer-pool/import`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/import`
  - `/attendance-center/import`
  - `/principal/customer-pool/stats`
  - `/principal/customer-pool/list`
  - `/principal/customer-applications`

### 501. `/principal/enrollment/trend`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/user/:param/trend`
  - `/trend`
  - `/enrollment/trend`
  - `/activity/trend`
  - `/personnel-center/trend`

### 502. `/principal/notices`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/notices`
  - `/notices/stats`
  - `/notices/important`
  - `/notices/:param/read`
  - `/notices/mark-all-read`

### 503. `/principal/notices/important`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/notices/important`
  - `/principal/dashboard`
  - `/principal/dashboard-stats`
  - `/principal/activities`
  - `/principal/customer-applications`

### 504. `/principal/performance/details`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/details`
  - `/performance/details`
  - `/principal/dashboard`
  - `/principal/dashboard-stats`
  - `/principal/activities`

### 505. `/principal/performance/goals`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/goals`
  - `/principal/dashboard`
  - `/principal/dashboard-stats`
  - `/principal/activities`
  - `/principal/customer-applications`

### 506. `/principal/performance/rankings`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/rankings`
  - `/performance/rankings`
  - `/principal/dashboard`
  - `/principal/dashboard-stats`
  - `/principal/activities`

### 507. `/principal/performance/stats`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/principal/stats`
  - `/principal/customer-pool/stats`
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`

### 508. `/principal/schedule`

- 前端引用文件:
  - `client/src/api/modules/principal.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/schedule`
  - `/schedule`
  - `/delayed-schedules`
  - `/:param/schedules`
  - `/schedules/:param`

### 509. `/quick-query-groups`

- 前端引用文件:
  - `client/src/api/quick-query-groups.ts`
- 后端可能存在的相近端点候选:
  - `/quick-questions`

### 510. `/quick-query-groups/:param`

- 前端引用文件:
  - `client/src/api/quick-query-groups.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 511. `/quick-query-groups/category/:param`

- 前端引用文件:
  - `client/src/api/quick-query-groups.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 512. `/quick-query-groups/overview`

- 前端引用文件:
  - `client/src/api/quick-query-groups.ts`
- 后端可能存在的相近端点候选:
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`
  - `/system/overview`

### 513. `/quick-query-groups/search`

- 前端引用文件:
  - `client/src/api/quick-query-groups.ts`
- 后端可能存在的相近端点候选:
  - `/contacts/search`
  - `/search`
  - `/ai/memories/search`
  - `/students/search`
  - `/parents/search`

### 514. `/risk/implement-mitigation`

- 前端引用文件:
  - `client/src/pages/principal/decision-support/intelligent-dashboard.vue`

### 515. `/script-categories/:param`

- 前端引用文件:
  - `client/src/api/modules/script.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 516. `/script-templates/:param`

- 前端引用文件:
  - `client/src/api/endpoints/script-template.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 517. `/script-templates/batch/delete`

- 前端引用文件:
  - `client/src/api/endpoints/script-template.ts`
- 后端可能存在的相近端点候选:
  - `/batch/delete`
  - `/delete`
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`

### 518. `/scripts/:param`

- 前端引用文件:
  - `client/src/api/modules/script.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 519. `/scripts/:param/use`

- 前端引用文件:
  - `client/src/api/modules/script.ts`
- 后端可能存在的相近端点候选:
  - `/:param/use`
  - `/teacher/rewards/:param/use`

### 520. `/security/config`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/:param/config`
  - `/config`
  - `/configs`
  - `/configs/:param`
  - `/ui-config`

### 521. `/security/overview`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`
  - `/system/overview`

### 522. `/security/recommendations`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/recommendations`
  - `/recommendations/generate`
  - `/security/csp-report`

### 523. `/security/recommendations/generate`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/tenant-token/generate`
  - `/generate`
  - `/:param/poster/generate`
  - `/referrals/generate`
  - `/recommendations/generate`

### 524. `/security/scan`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/scan`
  - `/security/csp-report`

### 525. `/security/threats`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/threats`
  - `/threats/:param/handle`
  - `/security/csp-report`

### 526. `/security/threats/:param/handle`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/threats/:param/handle`
  - `/security/csp-report`

### 527. `/security/vulnerabilities`

- 前端引用文件:
  - `client/src/api/security.ts`
- 后端可能存在的相近端点候选:
  - `/vulnerabilities`
  - `/security/csp-report`

### 528. `/sms/send-code`

- 前端引用文件:
  - `client/src/components/group-buy/QuickRegisterModal.vue`
- 后端可能存在的相近端点候选:
  - `/send-code`

### 529. `/statistics/activities`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/activities`
  - `/enrollment-statistics/activities`
  - `/principal/activities`
  - `/activities`
  - `/:param/activities`

### 530. `/statistics/dashboard`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/principal/dashboard`
  - `/dashboard`
  - `/teacher-dashboard/dashboard`
  - `/dashboard/stats`
  - `/statistics/:param`

### 531. `/statistics/enrollment`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/statistics/enrollment-trends`
  - `/:param/enrollment`
  - `/enrollment`
  - `/direct/enrollment-statistics/plans`
  - `/direct/enrollment-statistics/channels`

### 532. `/statistics/enrollment/drilldown`

- 前端引用文件:
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/statistics/enrollment-trends`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`

### 533. `/statistics/export-drilldown`

- 前端引用文件:
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`
  - `/statistics/quarterly`

### 534. `/statistics/financial`

- 前端引用文件:
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/financial`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`

### 535. `/statistics/realtime`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`
  - `/statistics/quarterly`

### 536. `/statistics/regions`

- 前端引用文件:
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/regions`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`

### 537. `/statistics/reports`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/reports`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`

### 538. `/statistics/revenue`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/revenue`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`
  - `/statistics/monthly`

### 539. `/statistics/students`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
  - `client/src/pages/statistics/index.vue`
- 后端可能存在的相近端点候选:
  - `/students`
  - `/parents/:param/students`
  - `/:param/students`
  - `/teaching/students`
  - `/personnel-center/students`

### 540. `/statistics/teachers`

- 前端引用文件:
  - `client/src/api/modules/statistics.ts`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/personnel-center/teachers`
  - `/statistics/:param`
  - `/statistics/daily`
  - `/statistics/weekly`

### 541. `/students/:param/attendance`

- 前端引用文件:
  - `client/src/pages/class/students/id.vue`
- 后端可能存在的相近端点候选:
  - `/students/:param/assign-class`
  - `/students/:param/parents`
  - `/students/:param`
  - `/students`
  - `/students/search`

### 542. `/students/:param/communications`

- 前端引用文件:
  - `client/src/pages/class/students/id.vue`
- 后端可能存在的相近端点候选:
  - `/:param/communications`
  - `/students/:param/parents`
  - `/students/:param`
  - `/students/:param/assign-class`
  - `/students`

### 543. `/students/:param/health-records`

- 前端引用文件:
  - `client/src/pages/class/students/id.vue`
- 后端可能存在的相近端点候选:
  - `/students/:param/parents`
  - `/students/:param`
  - `/students/:param/assign-class`
  - `/students`
  - `/students/search`

### 544. `/students/:param/learning-records`

- 前端引用文件:
  - `client/src/pages/class/students/id.vue`
- 后端可能存在的相近端点候选:
  - `/students/:param/parents`
  - `/students/:param`
  - `/students/:param/assign-class`
  - `/students`
  - `/students/search`

### 545. `/students/stats`

- 前端引用文件:
  - `client/src/pages/student/StudentStatistics.vue`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 546. `/system-configs`

- 前端引用文件:
  - `client/src/stores/logo.ts`
- 后端可能存在的相近端点候选:
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`
  - `/system/logs/batch`

### 547. `/system-logs/:param`

- 前端引用文件:
  - `client/src/api/modules/log.ts`
- 后端可能存在的相近端点候选:
  - `/system/logs/:param`
  - `/system/:param/:param/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 548. `/system-oss/delete`

- 前端引用文件:
  - `client/src/services/system-oss.service.ts`
- 后端可能存在的相近端点候选:
  - `/batch/delete`
  - `/delete`
  - `/batch-delete`
  - `/types/batch-delete`
  - `/tasks/batch-delete`

### 549. `/system-oss/get-url`

- 前端引用文件:
  - `client/src/services/system-oss.service.ts`
- 后端可能存在的相近端点候选:
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`
  - `/system/logs/batch`

### 550. `/system-oss/upload`

- 前端引用文件:
  - `client/src/services/system-oss.service.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 551. `/system/ai-models/:param`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/system/logs/:param`
  - `/system/:param/:param/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 552. `/system/ai-models/:param/status`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 553. `/system/ai-models/:param/test`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/ai/tts/test`
  - `/test`
  - `/vos-config/test`
  - `/:param/test`
  - `/test-formatter`

### 554. `/system/backup`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/system/backups`
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`

### 555. `/system/detail-info`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/detail-info`
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`

### 556. `/system/health`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/health`
  - `/attendance-center/health`
  - `/stream-health`
  - `/system-info`
  - `/system-status`

### 557. `/system/message-templates/:param`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/system/logs/:param`
  - `/system/:param/:param/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 558. `/system/message-templates/:param/status`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 559. `/system/services`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/SystemCenter-Enhanced.vue`
- 后端可能存在的相近端点候选:
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`
  - `/system/logs/batch`

### 560. `/system/services/:param/restart`

- 前端引用文件:
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/system-info`
  - `/system-status`
  - `/system/logs`
  - `/system/logs/:param`
  - `/system/logs/batch`

### 561. `/system/stats`

- 前端引用文件:
  - `client/src/api/modules/system.ts`
  - `client/src/api/unified-api.ts`
- 后端可能存在的相近端点候选:
  - `/dashboard/stats`
  - `/:param/stats`
  - `/stats`
  - `/:param/share/stats`
  - `/activity/:param/stats`

### 562. `/system/users`

- 前端引用文件:
  - `client/src/pages/centers/duplicates-backup/SystemCenter-Enhanced.vue`
- 后端可能存在的相近端点候选:
  - `/users`
  - `/:param/users`
  - `/:param/users/:param`
  - `/create-test-users`
  - `/users/:param/roles`

### 563. `/task-templates`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/task-comments/:param`

### 564. `/task-templates/:param/create`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/tenants/create`
  - `/dashboard/class-create`
  - `/class-create`
  - `/create-marketing-guides`
  - `/create-remaining-pages`

### 565. `/tasks/:param/assign`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/assign`
  - `/:param/assign`
  - `/customer-pool/assign`
  - `/tasks/:param/attachments`
  - `/tasks/:param/attachments/batch`

### 566. `/tasks/:param/comments`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/comments`
  - `/inspection-tasks/:param/comments`
  - `/tasks/:param/attachments`
  - `/tasks/:param/attachments/batch`
  - `/tasks/:param/attachments/:param`

### 567. `/tasks/:param/comments/:param`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/tasks/:param/attachments/:param`
  - `/tasks/:param`
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`

### 568. `/tasks/:param/link`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/tasks/:param/attachments`
  - `/tasks/:param/attachments/batch`
  - `/tasks/:param/attachments/:param`
  - `/tasks/:param/attachments/:param/download`
  - `/tasks/:param/status`

### 569. `/tasks/:param/progress`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/progress`
  - `/teaching/progress`
  - `/instances/:param/nodes/:param/progress`
  - `/customers/:param/progress`
  - `/progress`

### 570. `/tasks/:param/related`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/semantic/:param/related`
  - `/tasks/:param/attachments`
  - `/tasks/:param/attachments/batch`
  - `/tasks/:param/attachments/:param`
  - `/tasks/:param/attachments/:param/download`

### 571. `/tasks/:param/unlink`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/tasks/:param/attachments`
  - `/tasks/:param/attachments/batch`
  - `/tasks/:param/attachments/:param`
  - `/tasks/:param/attachments/:param/download`
  - `/tasks/:param/status`

### 572. `/tasks/analytics`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/analytics`
  - `/analytics/trends`
  - `/analytics/overview`
  - `/predictive-analytics`
  - `/predictive-analytics/refresh`

### 573. `/tasks/batch`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/tasks/:param/attachments/batch`
  - `/batch`
  - `/system/logs/batch`
  - `/base-info/batch`
  - `/students/batch`

### 574. `/tasks/export`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/:param/export`
  - `/user/:param/export`
  - `/export`
  - `/system/logs/export`
  - `/students/export`

### 575. `/tasks/report`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/report`
  - `/security/csp-report`
  - `/report-error`
  - `/satisfaction-report`
  - `/reports`

### 576. `/tasks/trends`

- 前端引用文件:
  - `client/src/api/task-center.ts`
- 后端可能存在的相近端点候选:
  - `/direct/enrollment-statistics/trends`
  - `/enrollment-statistics/trends`
  - `/trends`
  - `/analytics/trends`
  - `/enrollment-trends`

### 577. `/teacher-dashboard/teaching/records/:param`

- 前端引用文件:
  - `client/src/api/modules/teacher-teaching.ts`
- 后端可能存在的相近端点候选:
  - `/teacher-dashboard/teaching/classes/:param`
  - `/teacher-dashboard/teaching/students/:param`
  - `/teacher-dashboard/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`
  - `/teachers/:param`

### 578. `/teacher/appointments/:param/confirm`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/appointment-management/index.vue`
- 后端可能存在的相近端点候选:
  - `/schedules/:param/confirm`
  - `/:param/confirm`
  - `/offline/confirm`
  - `/batch-confirm`
  - `/confirm-payment`

### 579. `/teacher/courses/:param/records/:param`

- 前端引用文件:
  - `client/src/api/modules/teacher-courses.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 580. `/teacher/courses/:param/status`

- 前端引用文件:
  - `client/src/api/modules/teacher-courses.ts`
- 后端可能存在的相近端点候选:
  - `/teacher-dashboard/tasks/:param/status`
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`

### 581. `/teacher/customers/:param/follow-records`

- 前端引用文件:
  - `client/src/api/modules/teacher.ts`
- 后端可能存在的相近端点候选:
  - `/:param/follow-records`
  - `/teacher/customer-applications`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 582. `/teacher/customers/:param/status`

- 前端引用文件:
  - `client/src/api/modules/teacher.ts`
- 后端可能存在的相近端点候选:
  - `/teacher-dashboard/tasks/:param/status`
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`

### 583. `/teacher/dashboard`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 后端可能存在的相近端点候选:
  - `/teacher-dashboard/dashboard`
  - `/principal/dashboard`
  - `/dashboard`
  - `/teacher-dashboard/statistics`
  - `/teacher-dashboard/activity-statistics`

### 584. `/teacher/notifications/unread-count`

- 前端引用文件:
  - `client/src/components/layout/TeacherSidebar.vue`
- 后端可能存在的相近端点候选:
  - `/unread-count`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`

### 585. `/teacher/todo-items`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 586. `/teacher/weekly-schedule`

- 前端引用文件:
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 587. `/teachers/by-user/:param`

- 前端引用文件:
  - `client/src/stores/user.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 588. `/teaching-center/brain-science-courses`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 589. `/teaching-center/brain-science-courses/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 590. `/teaching-center/championship`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/championship`
  - `/championship/:param`
  - `/championship/:param/status`
  - `/teachers`
  - `/teacher-capacity`

### 591. `/teaching-center/championship/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 592. `/teaching-center/championship/:param/details`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/details`
  - `/performance/details`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 593. `/teaching-center/championship/:param/status`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teacher-dashboard/tasks/:param/status`
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`

### 594. `/teaching-center/course-plans`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 595. `/teaching-center/course-plans/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 596. `/teaching-center/course-progress`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/course-progress`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`

### 597. `/teaching-center/course-progress/class/:param/detailed`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 598. `/teaching-center/course-progress/confirm`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/schedules/:param/confirm`
  - `/:param/confirm`
  - `/offline/confirm`
  - `/batch-confirm`
  - `/confirm-payment`

### 599. `/teaching-center/export/championship/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 600. `/teaching-center/export/course-progress`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/course-progress`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`

### 601. `/teaching-center/export/outdoor-training`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/outdoor-training`
  - `/outdoor-training/class/:param`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 602. `/teaching-center/external-display`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/external-display`
  - `/external-display/class/:param`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 603. `/teaching-center/external-display/class/:param/details`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/details`
  - `/performance/details`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 604. `/teaching-center/external-display/records`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teaching/records`
  - `/teacher-dashboard/teaching/records`
  - `/records`
  - `/:param/records`
  - `/attendance-center/records`

### 605. `/teaching-center/external-display/records/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 606. `/teaching-center/media/batch-upload`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`
  - `/teacher/my-assignments`

### 607. `/teaching-center/media/files`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/files`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`
  - `/teacher/my-courses`

### 608. `/teaching-center/media/files/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 609. `/teaching-center/media/stats`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teaching/stats`
  - `/teacher-dashboard/tasks/stats`
  - `/teacher-dashboard/teaching/stats`
  - `/teacher/rewards/stats`
  - `/dashboard/stats`

### 610. `/teaching-center/media/upload`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/posters/upload`
  - `/upload`
  - `/customers/:param/screenshots/upload`
  - `/upload-multiple`
  - `/upload-image`

### 611. `/teaching-center/outdoor-training`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/outdoor-training`
  - `/outdoor-training/class/:param`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 612. `/teaching-center/outdoor-training/class/:param/details`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/details`
  - `/performance/details`
  - `/teachers`
  - `/teacher-capacity`
  - `/teaching-integration`

### 613. `/teaching-center/outdoor-training/records`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teaching/records`
  - `/teacher-dashboard/teaching/records`
  - `/records`
  - `/:param/records`
  - `/attendance-center/records`

### 614. `/teaching-center/outdoor-training/records/:param`

- 前端引用文件:
  - `client/src/api/endpoints/teaching-center.ts`
- 后端可能存在的相近端点候选:
  - `/teachers/:param`
  - `/teaching/classes/:param`
  - `/teaching/students/:param`
  - `/teaching/progress/:param`
  - `/teacher-dashboard/tasks/:param`

### 615. `/text-polish/description`

- 前端引用文件:
  - `client/src/pages/principal/BasicInfo.vue`
- 后端可能存在的相近端点候选:
  - `/description`
  - `/text-to-video`

### 616. `/upload/activity-cover`

- 前端引用文件:
  - `client/src/api/activity.ts`
- 后端可能存在的相近端点候选:
  - `/upload`
  - `/upload-multiple`
  - `/upload-image`
  - `/upload-images`
  - `/upload-avatar`

### 617. `/usage-center/my-usage`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/my-usage`
  - `/usage/stats`
  - `/usage`

### 618. `/usage-center/overview`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/overview`
  - `/campus/overview`
  - `/principal/dashboard/overview`
  - `/stats/overview`
  - `/system/overview`

### 619. `/usage-center/user/:param/detail`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/user/:param/detail`
  - `/dashboard/class-detail/:param`
  - `/class-detail/:param`
  - `/details`
  - `/performance/details`

### 620. `/usage-center/users`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/users`
  - `/:param/users`
  - `/:param/users/:param`
  - `/create-test-users`
  - `/users/:param/roles`

### 621. `/usage-quota/user/:param`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 622. `/usage-quota/warnings`

- 前端引用文件:
  - `client/src/api/endpoints/usage-center.ts`
- 后端可能存在的相近端点候选:
  - `/warnings`
  - `/usage/stats`
  - `/usage`

### 623. `/user/change-password`

- 前端引用文件:
  - `client/src/api/endpoints/user-profile.ts`
- 后端可能存在的相近端点候选:
  - `/change-password`
  - `/:param/change-password`
  - `/user/:param/bill`
  - `/user/:param/export`
  - `/user/:param/trend`

### 624. `/user/profile`

- 前端引用文件:
  - `client/src/tests/mobile/security/TC-035-privilege-escalation-protection.test.ts`
- 后端可能存在的相近端点候选:
  - `/profile`
  - `/user/:param/bill`
  - `/user/:param/export`
  - `/user/:param/trend`
  - `/user/history`

### 625. `/users/search`

- 前端引用文件:
  - `client/src/components/marketing/ReferralDialog.vue`
- 后端可能存在的相近端点候选:
  - `/contacts/search`
  - `/search`
  - `/ai/memories/search`
  - `/students/search`
  - `/parents/search`

### 626. `/v1/ai/feedback`

- 前端引用文件:
  - `client/src/pages/mobile/parent-center/feedback/index.vue`
- 后端可能存在的相近端点候选:
  - `/:param/feedback`
  - `/feedback`

### 627. `/video-creation/projects`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects`
  - `/projects/:param/script`
  - `/projects/:param/audio`
  - `/projects/:param`
  - `/projects/:param/scenes`

### 628. `/video-creation/projects/:param`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 629. `/video-creation/projects/:param/audio`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/audio`

### 630. `/video-creation/projects/:param/check-video-status`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/check-video-status`

### 631. `/video-creation/projects/:param/merge`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/merge`

### 632. `/video-creation/projects/:param/notified`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/notified`

### 633. `/video-creation/projects/:param/scenes`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/scenes`

### 634. `/video-creation/projects/:param/script`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/projects/:param/script`
  - `/recordings/:param/transcript`
  - `/ai/generate-script`
  - `/description`

### 635. `/video-creation/projects/:param/status`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/:param/status`
  - `/models/status`
  - `/record/:param/status`
  - `/dashboard/todos/:param/status`
  - `/applications/:param/status`

### 636. `/video-creation/unfinished`

- 前端引用文件:
  - `client/src/pages/principal/media-center/VideoCreatorTimeline.vue`
- 后端可能存在的相近端点候选:
  - `/unfinished`

### 637. `/website-automation/analyze`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/analyze`
  - `/customers/:param/screenshots/:param/analyze`
  - `/ai/analyze/:param`
  - `/ai/batch-analyze`

### 638. `/website-automation/find-element`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/find-element`

### 639. `/website-automation/screenshot`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/screenshot`
  - `/customers/:param/screenshots/upload`
  - `/customers/:param/screenshots/:param/analyze`

### 640. `/website-automation/statistics`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/statistics`
  - `/activity/:param/statistics`
  - `/:param/statistics`
  - `/calls/statistics`
  - `/consultations/statistics`

### 641. `/website-automation/tasks`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/plans/:param/tasks`
  - `/tasks`
  - `/stages/:param/tasks`
  - `/teacher-dashboard/tasks`
  - `/recent-tasks`

### 642. `/website-automation/tasks/:param`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 643. `/website-automation/tasks/:param/execute`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/execute`
  - `/tasks/:param/execute`
  - `/:param/re-execute`
  - `/execute-single`

### 644. `/website-automation/tasks/:param/history`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/history`
  - `/calls/history`
  - `/user/history`
  - `/tasks/:param/history`
  - `/permission-change-history`

### 645. `/website-automation/tasks/:param/stop`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/call/:param/recording/stop`
  - `/ai/transcribe/:param/stop`
  - `/tasks/:param/stop`

### 646. `/website-automation/templates`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/templates`
  - `/sop-templates`
  - `/sop-templates/:param`
  - `/sop-templates/:param/duplicate`
  - `/sop-templates/:param/nodes`

### 647. `/website-automation/templates/:param`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/ai/models/:param`
  - `/:param`
  - `/session/:param`
  - `/registration/:param`
  - `/by-activity/:param`

### 648. `/website-automation/templates/:param/create-task`

- 前端引用文件:
  - `client/src/api/endpoints/websiteAutomation.ts`
- 后端可能存在的相近端点候选:
  - `/templates/:param/create-task`

## 2) 前端 router.push 跳转存在，但前端路由表未定义的路径（典型白屏来源）

共 **287** 条：

### 1. `/:param`

- 触发位置:
  - `client/src/pages/principal/Dashboard.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/experience/schedule`
  - `/application`

### 2. `/activity/create`

- 触发位置:
  - `client/src/components/centers/activity/ActivityManagement.vue`
  - `client/src/pages/activity/ActivityList.vue`
  - `client/src/pages/activity/index.vue`
  - `client/src/pages/centers/ActivityCenter.vue`
- 前端路由表相近候选:
  - `/activity`
  - `/activities`

### 3. `/activity/detail/:param`

- 触发位置:
  - `client/src/components/centers/activity/ActivityManagement.vue`
  - `client/src/components/centers/activity/NotificationManagement.vue`
  - `client/src/pages/Search.vue`
  - `client/src/pages/activity/ActivityList.vue`
  - `client/src/pages/activity/ActivityPublish.vue`
  - `client/src/pages/activity/evaluation/ActivityEvaluation.vue`
  - `client/src/pages/activity/index.vue`
  - `client/src/pages/class/detail/ClassDetail.vue`
  - `client/src/pages/parent-center/profile/index.vue`
  - `client/src/pages/parent/ParentDetail.vue`
  - `client/src/pages/parent/ParentList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/activities`

### 4. `/activity/edit/:param`

- 触发位置:
  - `client/src/components/centers/activity/ActivityManagement.vue`
  - `client/src/pages/activity/ActivityDetail.vue`
  - `client/src/pages/activity/ActivityList.vue`
  - `client/src/pages/activity/detail/_id.vue`
  - `client/src/pages/activity/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/activities`

### 5. `/activity/evaluation/create`

- 触发位置:
  - `client/src/pages/activity/evaluation/ActivityEvaluation.vue`
- 前端路由表相近候选:
  - `/activity`
  - `/activities`

### 6. `/activity/participants/:param`

- 触发位置:
  - `client/src/pages/activity/ActivityList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/activities`

### 7. `/activity/plan/create`

- 触发位置:
  - `client/src/pages/activity/plan/ActivityPlanner.vue`
- 前端路由表相近候选:
  - `/activity`
  - `/activities`

### 8. `/activity/plan/edit/:param`

- 触发位置:
  - `client/src/pages/activity/plan/ActivityPlanner.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/activities`

### 9. `/activity/registrations/:param`

- 触发位置:
  - `client/src/components/centers/activity/ActivityManagement.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/activity`
  - `/activities`

### 10. `/ai/AIAssistantPage`

- 触发位置:
  - `client/src/components/layout/OptimizedHeaderActions.vue`

### 11. `/analytics/detail/:param`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/AnalyticsCenter-Enhanced.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/analytics`

### 12. `/analytics/report-builder`

- 触发位置:
  - `client/src/pages/analytics/index.vue`
  - `client/src/pages/principal/PrincipalReports.vue`
- 前端路由表相近候选:
  - `/analytics`

### 13. `/application/detail/:param`

- 触发位置:
  - `client/src/pages/application/ApplicationList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/application`

### 14. `/application/list`

- 触发位置:
  - `client/src/pages/application/ApplicationDetail.vue`
- 前端路由表相近候选:
  - `/application`
  - `/dashboard/class-list`

### 15. `/application/review/:param`

- 触发位置:
  - `client/src/pages/application/ApplicationList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/application`

### 16. `/assessment-analytics/records`

- 触发位置:
  - `client/src/pages/assessment-analytics/overview.vue`

### 17. `/centers/activity`

- 触发位置:
  - `client/src/pages/activity/ActivityCreate.vue`
  - `client/src/pages/activity/ActivityTimeline.vue`
  - `client/src/pages/dashboard/CampusOverview.vue`
- 前端路由表相近候选:
  - `/activity`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/centers`

### 18. `/centers/activity-center`

- 触发位置:
  - `client/src/pages/principal/PosterUpload.vue`
- 前端路由表相近候选:
  - `/centers`

### 19. `/centers/customer-pool`

- 触发位置:
  - `client/src/pages/customer/create/index.vue`
  - `client/src/pages/customer/edit/[id].vue`
- 前端路由表相近候选:
  - `/centers`

### 20. `/centers/task`

- 触发位置:
  - `client/src/pages/application/review/ApplicationReview.vue`
  - `client/src/pages/centers/TaskForm.vue`
- 前端路由表相近候选:
  - `/centers`

### 21. `/centers/task/form`

- 触发位置:
  - `client/src/pages/centers/TaskCenter.vue`
- 前端路由表相近候选:
  - `/dashboard/analytics/student-performance`
  - `/dashboard/performance/kpi-dashboard`
  - `/dashboard/performance/performance-overview`
  - `/dashboard/performance`
  - `/test/simple-form-modal-test`

### 22. `/chat`

- 触发位置:
  - `client/src/pages/Messages.vue`
- 前端路由表相近候选:
  - `/mobile/ai-chat`

### 23. `/class/analytics/:param`

- 触发位置:
  - `client/src/pages/class/detail/ClassDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/class`

### 24. `/class/detail/:param`

- 触发位置:
  - `client/src/pages/Search.vue`
  - `client/src/pages/class/ClassStatistics.vue`
  - `client/src/pages/class/analytics/ClassAnalytics.vue`
  - `client/src/pages/class/index.vue`
  - `client/src/pages/teacher/TeacherDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/class`

### 25. `/class/edit/:param`

- 触发位置:
  - `client/src/pages/class/detail/ClassDetail.vue`
  - `client/src/pages/class/detail/[id].vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/class`

### 26. `/classes`

- 触发位置:
  - `client/src/pages/dashboard/ClassCreate.vue`
- 前端路由表相近候选:
  - `/class`

### 27. `/classes/:param`

- 触发位置:
  - `client/src/pages/class/teachers/id.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/class`

### 28. `/customer/analytics`

- 触发位置:
  - `client/src/pages/customer/CustomerStatistics.vue`
- 前端路由表相近候选:
  - `/analytics`
  - `/dashboard/analytics`
  - `/dashboard/analytics/enrollment-trends`
  - `/dashboard/analytics/financial-analysis`
  - `/dashboard/analytics/student-performance`

### 29. `/customer/create`

- 触发位置:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
  - `client/src/pages/customer/CustomerStatistics.vue`
- 前端路由表相近候选:
  - `/customer`

### 30. `/customer/detail/:param`

- 触发位置:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
  - `client/src/pages/customer/CustomerSearch.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/customer`

### 31. `/customer/edit/:param`

- 触发位置:
  - `client/src/pages/centers/CustomerPoolCenter.vue`
  - `client/src/pages/customer/CustomerSearch.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/customer`

### 32. `/customer/search`

- 触发位置:
  - `client/src/pages/customer/detail/CustomerDetail.vue`
- 前端路由表相近候选:
  - `/search`
  - `/customer`

### 33. `/customer/statistics`

- 触发位置:
  - `client/src/pages/customer/detail/CustomerDetail.vue`
- 前端路由表相近候选:
  - `/statistics`
  - `/dashboard/data-statistics`
  - `/customer`

### 34. `/customers/:param`

- 触发位置:
  - `client/src/pages/customer/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/customer`

### 35. `/dashboard/class`

- 触发位置:
  - `client/src/pages/dashboard/ClassDetail.vue`
- 前端路由表相近候选:
  - `/class`
  - `/dashboard/class-list`
  - `/dashboard/campus-overview`
  - `/dashboard`
  - `/dashboard/data-statistics`

### 36. `/dashboard/class/:param`

- 触发位置:
  - `client/src/pages/dashboard/ClassList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/dashboard/class-list`
  - `/dashboard/campus-overview`
  - `/dashboard`

### 37. `/dashboard/class/:param/edit`

- 触发位置:
  - `client/src/pages/dashboard/ClassDetail.vue`
  - `client/src/pages/dashboard/ClassList.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/dashboard/campus-overview`
  - `/dashboard`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`

### 38. `/dashboard/class/:param/students`

- 触发位置:
  - `client/src/pages/dashboard/ClassDetail.vue`
  - `client/src/pages/dashboard/ClassList.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/dashboard/campus-overview`
  - `/dashboard`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`

### 39. `/dashboard/class/:param/teachers`

- 触发位置:
  - `client/src/pages/dashboard/ClassDetail.vue`
  - `client/src/pages/dashboard/ClassList.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/dashboard/campus-overview`
  - `/dashboard`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`

### 40. `/dashboard/class/create`

- 触发位置:
  - `client/src/pages/dashboard/ClassList.vue`
- 前端路由表相近候选:
  - `/dashboard/campus-overview`
  - `/dashboard/class-list`
  - `/dashboard`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`

### 41. `/dashboard/enterprise`

- 触发位置:
  - `client/src/components/layout/OptimizedHeaderActions.vue`
- 前端路由表相近候选:
  - `/dashboard`
  - `/dashboard/campus-overview`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`
  - `/dashboard/schedule`

### 42. `/dashboard/notices/create`

- 触发位置:
  - `client/src/pages/dashboard/ImportantNotices.vue`
- 前端路由表相近候选:
  - `/dashboard/notification-center`
  - `/dashboard`
  - `/dashboard/campus-overview`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`

### 43. `/dashboard/notices/edit/:param`

- 触发位置:
  - `client/src/pages/dashboard/ImportantNotices.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/dashboard/notification-center`
  - `/dashboard`
  - `/dashboard/campus-overview`

### 44. `/detail/:param`

- 触发位置:
  - `client/src/pages/StandardTemplate.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 45. `/document-instances/:param`

- 触发位置:
  - `client/src/pages/centers/DocumentInstanceList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 46. `/document-instances/:param/edit`

- 触发位置:
  - `client/src/pages/centers/DocumentInstanceList.vue`

### 47. `/document-template-center`

- 触发位置:
  - `client/src/pages/centers/DocumentInstanceList.vue`

### 48. `/enrollment-application`

- 触发位置:
  - `client/src/pages/enrollment-plan/PlanDetail.vue`
- 前端路由表相近候选:
  - `/enrollment-plan`
  - `/enrollment`

### 49. `/enrollment-plan/PlanList`

- 触发位置:
  - `client/src/pages/enrollment-plan/QuotaManage.vue`
- 前端路由表相近候选:
  - `/enrollment-plan`
  - `/enrollment`

### 50. `/enrollment-plan/create`

- 触发位置:
  - `client/src/pages/centers/EnrollmentCenter.vue`
  - `client/src/pages/enrollment-plan/PlanList.vue`
- 前端路由表相近候选:
  - `/enrollment-plan`
  - `/enrollment`

### 51. `/enrollment-plan/detail/:param`

- 触发位置:
  - `client/src/pages/enrollment-plan/PlanList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/enrollment-plan`
  - `/enrollment`

### 52. `/enrollment-plan/edit/:param`

- 触发位置:
  - `client/src/pages/enrollment-plan/PlanDetail.vue`
  - `client/src/pages/enrollment-plan/PlanList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/enrollment-plan`
  - `/enrollment`

### 53. `/enrollment-plan/list`

- 触发位置:
  - `client/src/pages/enrollment-plan/QuotaManagement.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/enrollment-plan`
  - `/enrollment`

### 54. `/enrollment-plan/quota/:param`

- 触发位置:
  - `client/src/pages/enrollment-plan/PlanDetail.vue`
  - `client/src/pages/enrollment-plan/PlanList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/enrollment-plan`
  - `/enrollment`

### 55. `/enrollment-statistics`

- 触发位置:
  - `client/src/pages/enrollment-plan/PlanDetail.vue`
- 前端路由表相近候选:
  - `/enrollment-plan`
  - `/enrollment`

### 56. `/enrollment/:param`

- 触发位置:
  - `client/src/pages/enrollment/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/enrollment-plan`
  - `/enrollment`

### 57. `/enrollment/applications`

- 触发位置:
  - `client/src/pages/analytics/index.vue`
- 前端路由表相近候选:
  - `/enrollment-plan`
  - `/enrollment`

### 58. `/enrollment/edit/:param`

- 触发位置:
  - `client/src/pages/enrollment/EnrollmentDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/enrollment-plan`
  - `/enrollment`

### 59. `/experience/:param/participants`

- 触发位置:
  - `client/src/pages/experience/ExperienceSchedule.vue`
- 前端路由表相近候选:
  - `/experience/schedule`

### 60. `/experience/create`

- 触发位置:
  - `client/src/pages/experience/ExperienceSchedule.vue`
- 前端路由表相近候选:
  - `/experience/schedule`

### 61. `/experience/edit/:param`

- 触发位置:
  - `client/src/pages/experience/ExperienceSchedule.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/experience/schedule`

### 62. `/finance/collection-reminder`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue`
- 前端路由表相近候选:
  - `/finance`

### 63. `/finance/enrollment-finance-linkage`

- 触发位置:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 前端路由表相近候选:
  - `/finance`

### 64. `/finance/fee-config`

- 触发位置:
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 前端路由表相近候选:
  - `/finance`

### 65. `/finance/financial-reports`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue`
- 前端路由表相近候选:
  - `/finance`

### 66. `/finance/payment-management`

- 触发位置:
  - `client/src/pages/centers/FinanceCenter.vue`
  - `client/src/pages/finance/workbench/UniversalFinanceWorkbench.vue`
- 前端路由表相近候选:
  - `/finance`

### 67. `/finance/payment-records`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue`
- 前端路由表相近候选:
  - `/finance`

### 68. `/finance/quick-payment`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue`
- 前端路由表相近候选:
  - `/finance`

### 69. `/finance/refund-management`

- 触发位置:
  - `client/src/pages/centers/duplicates-backup/FinanceCenter-Original.vue`
- 前端路由表相近候选:
  - `/finance`

### 70. `/finance/transactions`

- 触发位置:
  - `client/src/pages/Finance.vue`
- 前端路由表相近候选:
  - `/finance`

### 71. `/group/create`

- 触发位置:
  - `client/src/pages/group/group-list.vue`
- 前端路由表相近候选:
  - `/group`

### 72. `/group/detail/:param`

- 触发位置:
  - `client/src/pages/group/group-upgrade.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/group`

### 73. `/group/edit/:param`

- 触发位置:
  - `client/src/pages/group/group-detail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/group`

### 74. `/group/list`

- 触发位置:
  - `client/src/pages/group/group-form.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/group`

### 75. `/inspection-center/templates/:param`

- 触发位置:
  - `client/src/pages/centers/DocumentTemplateCenter.vue`
  - `client/src/pages/centers/TemplateDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 76. `/inspection-center/templates/:param/use`

- 触发位置:
  - `client/src/pages/centers/DocumentTemplateCenter.vue`
  - `client/src/pages/centers/TemplateDetail.vue`

### 77. `/kindergarten/detail/:param`

- 触发位置:
  - `client/src/pages/group/group-list.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 78. `/kindergarten/edit/:param`

- 触发位置:
  - `client/src/pages/group/group-list.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 79. `/marketing/consultations`

- 触发位置:
  - `client/src/pages/marketing.vue`
- 前端路由表相近候选:
  - `/marketing`

### 80. `/marketing/coupons`

- 触发位置:
  - `client/src/pages/marketing.vue`
- 前端路由表相近候选:
  - `/marketing`

### 81. `/marketing/intelligent-engine/marketing-engine`

- 触发位置:
  - `client/src/pages/marketing.vue`
- 前端路由表相近候选:
  - `/marketing`

### 82. `/media/:param`

- 触发位置:
  - `client/src/pages/centers/PhotoAlbumCenter.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 83. `/media/album/create`

- 触发位置:
  - `client/src/pages/centers/PhotoAlbumCenter.vue`

### 84. `/media/edit/:param`

- 触发位置:
  - `client/src/pages/centers/PhotoAlbumCenter.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 85. `/mobile/about`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/about`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 86. `/mobile/activity/activity-checkin`

- 触发位置:
  - `client/src/pages/mobile/activity/activity-detail/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 87. `/mobile/activity/activity-create`

- 触发位置:
  - `client/src/pages/mobile/activity/activity-index/index.vue`
  - `client/src/pages/mobile/activity/activity-template/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 88. `/mobile/activity/activity-detail/:param`

- 触发位置:
  - `client/src/pages/mobile/activity/activity-calendar/index.vue`
  - `client/src/pages/mobile/activity/activity-list/index.vue`
  - `client/src/pages/mobile/activity/activity-publish/index.vue`
  - `client/src/pages/mobile/activity/activity-search/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 89. `/mobile/activity/activity-index`

- 触发位置:
  - `client/src/pages/mobile/activity/activity-create/index.vue`
  - `client/src/pages/mobile/activity/activity-publish/index.vue`
  - `client/src/pages/mobile/activity/activity-register/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 90. `/mobile/activity/activity-register`

- 触发位置:
  - `client/src/pages/mobile/activity/activity-detail/index.vue`
  - `client/src/pages/mobile/activity/activity-index/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 91. `/mobile/activity/detail/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 92. `/mobile/analytics-hub`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/PrincipalDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 93. `/mobile/business-hub`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/PrincipalDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 94. `/mobile/centers`

- 触发位置:
  - `client/src/components/mobile/layouts/BaseMobileLayout.vue`
  - `client/src/components/mobile/layouts/MobileCenterLayout.vue`
  - `client/src/components/mobile/layouts/MobileSubPageLayout.vue`
  - `client/src/components/mobile/layouts/UnifiedMobileLayout.vue`
  - `client/src/pages/device-select/index.vue`
  - `client/src/pages/mobile/error/index.vue`
- 前端路由表相近候选:
  - `/centers`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 95. `/mobile/centers/ai-center`

- 触发位置:
  - `client/src/components/mobile/layouts/FixedHeader.vue`
  - `client/src/components/mobile/layouts/UnifiedMobileLayout.vue`
- 前端路由表相近候选:
  - `/ai-center`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 96. `/mobile/centers/document-collaboration`

- 触发位置:
  - `client/src/pages/mobile/centers/document-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 97. `/mobile/centers/document-instance-list`

- 触发位置:
  - `client/src/pages/mobile/centers/document-template-center/use.vue`
  - `client/src/pages/mobile/document-instance/detail/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 98. `/mobile/centers/document-template-center`

- 触发位置:
  - `client/src/pages/mobile/centers/document-instance-list/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 99. `/mobile/centers/document-template-center/use/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/document-template-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 100. `/mobile/centers/my-task-center`

- 触发位置:
  - `client/src/pages/mobile/centers/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 101. `/mobile/centers/notification-center`

- 触发位置:
  - `client/src/components/mobile/layouts/FixedHeader.vue`
  - `client/src/components/mobile/layouts/UnifiedMobileLayout.vue`
  - `client/src/pages/mobile/centers/index.vue`
- 前端路由表相近候选:
  - `/dashboard/notification-center`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 102. `/mobile/centers/photo-album-center`

- 触发位置:
  - `client/src/pages/mobile/centers/media-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 103. `/mobile/centers/student-center/detail`

- 触发位置:
  - `client/src/pages/mobile/centers/student-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/ai-chat`

### 104. `/mobile/centers/task`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/PrincipalDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 105. `/mobile/centers/task-center`

- 触发位置:
  - `client/src/pages/mobile/centers/task-form/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 106. `/mobile/centers/task-form`

- 触发位置:
  - `client/src/pages/mobile/centers/task-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 107. `/mobile/centers/template-detail/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/document-center/index.vue`
  - `client/src/pages/mobile/centers/document-template-center/index.vue`
  - `client/src/pages/mobile/centers/template-detail/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 108. `/mobile/centers/user-center`

- 触发位置:
  - `client/src/components/mobile/layouts/FixedHeader.vue`
  - `client/src/pages/mobile/centers/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 109. `/mobile/customer-pool`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/PrincipalDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 110. `/mobile/document-instance/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/document-instance-list/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 111. `/mobile/document-instance/:param/edit`

- 触发位置:
  - `client/src/pages/mobile/centers/document-instance-list/index.vue`
  - `client/src/pages/mobile/document-instance/detail/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 112. `/mobile/document-instance/detail/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/document-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 113. `/mobile/document-instance/edit/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/document-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 114. `/mobile/finance/collection-reminder`

- 触发位置:
  - `client/src/pages/mobile/centers/finance-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 115. `/mobile/finance/payment-bills`

- 触发位置:
  - `client/src/pages/mobile/centers/finance-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 116. `/mobile/finance/payment-management`

- 触发位置:
  - `client/src/pages/mobile/centers/finance-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 117. `/mobile/finance/payment-records`

- 触发位置:
  - `client/src/pages/mobile/centers/finance-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 118. `/mobile/interactive/play/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher/MyCourses.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 119. `/mobile/messages/new`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/components/tabs/ParentsInfoTab.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 120. `/mobile/notification/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/communication/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 121. `/mobile/parent-center`

- 触发位置:
  - `client/src/pages/mobile/error/index.vue`
  - `client/src/pages/mobile/parent-center/assessment/Layout.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 122. `/mobile/parent-center/activities`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/ParentDashboard.vue`
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/activities`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 123. `/mobile/parent-center/activities/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/notification-center/NotificationCenter.vue`
  - `client/src/pages/mobile/parent-center/activities/index.vue`
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 124. `/mobile/parent-center/activity-detail`

- 触发位置:
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/ai-chat`

### 125. `/mobile/parent-center/activity-registration`

- 触发位置:
  - `client/src/pages/mobile/parent-center/activities/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 126. `/mobile/parent-center/add-child`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 127. `/mobile/parent-center/add-follow-up`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 128. `/mobile/parent-center/ai-assistant`

- 触发位置:
  - `client/src/components/mobile/layouts/MobileHeader.vue`
  - `client/src/pages/mobile/centers/ai-center/index.vue`
  - `client/src/pages/mobile/components/dashboard/ParentDashboard.vue`
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 129. `/mobile/parent-center/assessment`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/GrowthTrajectory.vue`
  - `client/src/pages/mobile/parent-center/assessment/Report.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 130. `/mobile/parent-center/assessment/doing/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/development-assessment.vue`
  - `client/src/pages/mobile/parent-center/assessment/start.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 131. `/mobile/parent-center/assessment/growth-trajectory`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/development-assessment.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 132. `/mobile/parent-center/assessment/progress/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 133. `/mobile/parent-center/assessment/records`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 134. `/mobile/parent-center/assessment/report/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/development-assessment.vue`
  - `client/src/pages/mobile/parent-center/assessment/doing.vue`
  - `client/src/pages/mobile/parent-center/assessment/growth-trajectory.vue`
  - `client/src/pages/mobile/parent-center/assessment/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 135. `/mobile/parent-center/assessment/start`

- 触发位置:
  - `client/src/pages/mobile/parent-center/assessment/development-assessment.vue`
  - `client/src/pages/mobile/parent-center/assessment/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 136. `/mobile/parent-center/assign-activity`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 137. `/mobile/parent-center/child-growth`

- 触发位置:
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 138. `/mobile/parent-center/children`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/ParentDashboard.vue`
  - `client/src/pages/mobile/parent-center/children/followup.vue`
  - `client/src/pages/mobile/parent-center/children/growth.vue`
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 139. `/mobile/parent-center/children/add`

- 触发位置:
  - `client/src/pages/mobile/parent-center/children/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 140. `/mobile/parent-center/children/edit/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/children/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 141. `/mobile/parent-center/children/growth/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 142. `/mobile/parent-center/communication/smart-hub`

- 触发位置:
  - `client/src/pages/mobile/parent-center/communication/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 143. `/mobile/parent-center/edit-child/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 144. `/mobile/parent-center/edit-profile`

- 触发位置:
  - `client/src/pages/mobile/parent-center/profile/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 145. `/mobile/parent-center/games`

- 触发位置:
  - `client/src/pages/mobile/parent-center/games/play/AnimalObserver.vue`
  - `client/src/pages/mobile/parent-center/games/play/ColorSorting.vue`
  - `client/src/pages/mobile/parent-center/games/play/DinosaurMemory.vue`
  - `client/src/pages/mobile/parent-center/games/play/DollhouseTidy.vue`
  - `client/src/pages/mobile/parent-center/games/play/FruitSequence.vue`
  - `client/src/pages/mobile/parent-center/games/play/PrincessGarden.vue`
  - `client/src/pages/mobile/parent-center/games/play/PrincessMemory.vue`
  - `client/src/pages/mobile/parent-center/games/play/RobotFactory.vue`
  - `client/src/pages/mobile/parent-center/games/play/SpaceTreasure.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 146. `/mobile/parent-center/games/play/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/games/index.vue`
  - `client/src/pages/mobile/parent-center/games/records.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 147. `/mobile/parent-center/growth`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/ParentDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 148. `/mobile/parent-center/notification-detail`

- 触发位置:
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 149. `/mobile/parent-center/notifications`

- 触发位置:
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
  - `client/src/pages/mobile/parent-center/index.vue`
- 前端路由表相近候选:
  - `/notifications`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 150. `/mobile/parent-center/notifications/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 151. `/mobile/parent-center/notifications/detail`

- 触发位置:
  - `client/src/pages/mobile/parent-center/notifications/detail.vue`
  - `client/src/pages/mobile/parent-center/notifications/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/ai-chat`

### 152. `/mobile/parent-center/parent-detail/:param`

- 触发位置:
  - `client/src/pages/mobile/parent-center/children/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 153. `/mobile/parent-center/photo-album`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/ParentDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 154. `/mobile/student/:param/contact-history`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/components/tabs/ParentsInfoTab.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 155. `/mobile/student/attendance/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 156. `/mobile/student/detail/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 157. `/mobile/student/edit/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/detail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 158. `/mobile/student/grades/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/student-management/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 159. `/mobile/teacher-center`

- 触发位置:
  - `client/src/pages/mobile/error/index.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 160. `/mobile/teacher-center/activities`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/TeacherDashboard.vue`
- 前端路由表相近候选:
  - `/activities`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 161. `/mobile/teacher-center/activities/detail/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/components/ActivityReminderCard.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 162. `/mobile/teacher-center/class-detail`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 163. `/mobile/teacher-center/course/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 164. `/mobile/teacher-center/course/create`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 165. `/mobile/teacher-center/creative-curriculum`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/TeacherDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 166. `/mobile/teacher-center/creative-curriculum/edit/${generatedCourse.value`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/create.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 167. `/mobile/teacher-center/creative-curriculum/edit/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/preview.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 168. `/mobile/teacher-center/creative-curriculum/lesson/${generatedCourse.value`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/create.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 169. `/mobile/teacher-center/creative-curriculum/lesson/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/preview.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 170. `/mobile/teacher-center/creative-curriculum/preview/${generatedCourse.value`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/creative-curriculum/create.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 171. `/mobile/teacher-center/customer-detail/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/customer-tracking/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 172. `/mobile/teacher-center/customer-pool`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/TeacherDashboard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 173. `/mobile/teacher-center/customer-sop/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/customer-tracking/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 174. `/mobile/teacher-center/dashboard`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/attendance/index.vue`
- 前端路由表相近候选:
  - `/dashboard`
  - `/dashboard/campus-overview`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`
  - `/dashboard/schedule`

### 175. `/mobile/teacher-center/notification-detail`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 176. `/mobile/teacher-center/notifications`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/components/ActivityReminderCard.vue`
- 前端路由表相近候选:
  - `/notifications`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 177. `/mobile/teacher-center/schedule`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/experience/schedule`
  - `/dashboard/schedule`
  - `/dashboard/schedule/calendar`
  - `/dashboard/schedule/todo`
  - `/dashboard/schedule-weekly-view`

### 178. `/mobile/teacher-center/task-detail`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 179. `/mobile/teacher-center/task-edit`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/task-detail/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 180. `/mobile/teacher-center/tasks`

- 触发位置:
  - `client/src/pages/mobile/components/dashboard/TeacherDashboard.vue`
  - `client/src/pages/mobile/teacher-center/components/TaskOverviewCard.vue`
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 181. `/mobile/teacher-center/tasks/create`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/tasks/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 182. `/mobile/teacher-center/tasks/detail`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/tasks/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/ai-chat`

### 183. `/mobile/teacher-center/tasks/detail/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/components/TaskOverviewCard.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 184. `/mobile/teacher-center/tasks/edit`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/tasks/detail.vue`
  - `client/src/pages/mobile/teacher-center/tasks/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 185. `/mobile/teacher-center/teaching`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/components/ClassOverviewCard.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 186. `/mobile/teacher-center/teaching/class/:param`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/components/ClassOverviewCard.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile`
  - `/mobile/login`
  - `/mobile/ai-chat`

### 187. `/mobile/teacher-center/todo-detail`

- 触发位置:
  - `client/src/pages/mobile/teacher-center/dashboard/index.vue`
- 前端路由表相近候选:
  - `/mobile`
  - `/mobile/login`
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/mobile/ai-chat`

### 188. `/notices`

- 触发位置:
  - `client/src/pages/principal/Dashboard.vue`
- 前端路由表相近候选:
  - `/dashboard/important-notices`

### 189. `/parent-center/activities`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/activities`
  - `/parent-center`
  - `/parent`

### 190. `/parent-center/activities/:param`

- 触发位置:
  - `client/src/pages/parent-center/activities/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 191. `/parent-center/activity-detail`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 192. `/parent-center/activity-registration`

- 触发位置:
  - `client/src/pages/parent-center/activities/index.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 193. `/parent-center/ai-assistant`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 194. `/parent-center/assessment/academic`

- 触发位置:
  - `client/src/pages/parent-center/assessment/Layout.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 195. `/parent-center/assessment/development`

- 触发位置:
  - `client/src/pages/parent-center/assessment/Layout.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 196. `/parent-center/assessment/doing/:param`

- 触发位置:
  - `client/src/pages/parent-center/assessment/Academic.vue`
  - `client/src/pages/parent-center/assessment/DevelopmentAssessment.vue`
  - `client/src/pages/parent-center/assessment/SchoolReadiness.vue`
  - `client/src/pages/parent-center/assessment/Start.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 197. `/parent-center/assessment/growth-trajectory`

- 触发位置:
  - `client/src/pages/parent-center/assessment/DevelopmentAssessment.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 198. `/parent-center/assessment/report/:param`

- 触发位置:
  - `client/src/pages/parent-center/assessment/Academic.vue`
  - `client/src/pages/parent-center/assessment/DevelopmentAssessment.vue`
  - `client/src/pages/parent-center/assessment/Doing.vue`
  - `client/src/pages/parent-center/assessment/GrowthTrajectory.vue`
  - `client/src/pages/parent-center/assessment/SchoolReadiness.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 199. `/parent-center/assessment/school-readiness`

- 触发位置:
  - `client/src/pages/parent-center/assessment/Layout.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 200. `/parent-center/assessment/start`

- 触发位置:
  - `client/src/pages/parent-center/assessment/DevelopmentAssessment.vue`
  - `client/src/pages/parent-center/assessment/index.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 201. `/parent-center/child-growth`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 202. `/parent-center/children`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
  - `client/src/pages/parent-center/children/Growth.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 203. `/parent-center/communication/smart-hub`

- 触发位置:
  - `client/src/components/layout/ParentSidebar.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 204. `/parent-center/games`

- 触发位置:
  - `client/src/pages/parent-center/games/play/AnimalObserver.vue`
  - `client/src/pages/parent-center/games/play/ColorSorting.vue`
  - `client/src/pages/parent-center/games/play/DinosaurMemory.vue`
  - `client/src/pages/parent-center/games/play/DollhouseTidy.vue`
  - `client/src/pages/parent-center/games/play/FruitSequence.vue`
  - `client/src/pages/parent-center/games/play/PrincessGarden.vue`
  - `client/src/pages/parent-center/games/play/PrincessMemory.vue`
  - `client/src/pages/parent-center/games/play/RobotFactory.vue`
  - `client/src/pages/parent-center/games/play/SpaceTreasure.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 205. `/parent-center/games/play/:param`

- 触发位置:
  - `client/src/pages/parent-center/games/index.vue`
  - `client/src/pages/parent-center/games/records.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 206. `/parent-center/notification-detail`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 207. `/parent-center/notifications`

- 触发位置:
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/notifications`
  - `/parent-center`
  - `/parent`

### 208. `/parent-center/profile`

- 触发位置:
  - `client/src/components/layout/ParentSidebar.vue`
  - `client/src/layouts/MainLayout.vue`
  - `client/src/pages/parent-center/ParentCenterDashboard.vue`
- 前端路由表相近候选:
  - `/profile`
  - `/profile/settings`
  - `/parent-center`
  - `/parent`

### 209. `/parent/add`

- 触发位置:
  - `client/src/pages/parent/ParentStatistics.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 210. `/parent/assign-activity/:param`

- 触发位置:
  - `client/src/pages/parent-center/profile/index.vue`
  - `client/src/pages/parent/ParentDetail.vue`
  - `client/src/pages/parent/ParentList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 211. `/parent/child/create`

- 触发位置:
  - `client/src/pages/parent-center/children/index.vue`
  - `client/src/pages/parent/ChildrenList.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 212. `/parent/child/edit/:param`

- 触发位置:
  - `client/src/pages/parent-center/children/index.vue`
  - `client/src/pages/parent/ChildrenList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 213. `/parent/child/growth/:param`

- 触发位置:
  - `client/src/pages/parent/ChildrenList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 214. `/parent/children`

- 触发位置:
  - `client/src/pages/parent/edit/ParentEdit.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 215. `/parent/communication/smart-hub`

- 触发位置:
  - `client/src/pages/mobile/parent-center/feedback/index.vue`
  - `client/src/pages/parent-center/feedback/ParentFeedback.vue`
  - `client/src/pages/parent/ParentStatistics.vue`
  - `client/src/pages/parent/edit/ParentEdit.vue`
  - `client/src/pages/parent/feedback/ParentFeedback.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 216. `/parent/create`

- 触发位置:
  - `client/src/pages/parent/ParentList.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 217. `/parent/detail/:param`

- 触发位置:
  - `client/src/pages/Search.vue`
  - `client/src/pages/parent-center/children/FollowUp.vue`
  - `client/src/pages/parent-center/children/index.vue`
  - `client/src/pages/parent/AssignActivity.vue`
  - `client/src/pages/parent/ChildrenList.vue`
  - `client/src/pages/parent/FollowUp.vue`
  - `client/src/pages/parent/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 218. `/parent/edit/:param`

- 触发位置:
  - `client/src/pages/parent-center/profile/index.vue`
  - `client/src/pages/parent/ParentDetail.vue`
  - `client/src/pages/parent/ParentList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/parent-center`
  - `/parent`

### 219. `/parent/follow-up/create`

- 触发位置:
  - `client/src/pages/parent-center/profile/index.vue`
  - `client/src/pages/parent/ParentDetail.vue`
  - `client/src/pages/parent/ParentList.vue`
- 前端路由表相近候选:
  - `/parent-center`
  - `/parent`

### 220. `/parent/list`

- 触发位置:
  - `client/src/pages/parent-center/children/FollowUp.vue`
  - `client/src/pages/parent/FollowUp.vue`
  - `client/src/pages/parent/ParentEdit.vue`
- 前端路由表相近候选:
  - `/dashboard/class-list`
  - `/parent-center`
  - `/parent`

### 221. `/principal/activities/create`

- 触发位置:
  - `client/src/pages/principal/Activities.vue`
- 前端路由表相近候选:
  - `/principal`

### 222. `/principal/activities/detail/:param`

- 触发位置:
  - `client/src/pages/principal/Activities.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/principal`

### 223. `/principal/activities/edit/:param`

- 触发位置:
  - `client/src/pages/principal/Activities.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/principal`

### 224. `/principal/customer-pool/:param`

- 触发位置:
  - `client/src/pages/principal/CustomerPool.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/principal`

### 225. `/principal/marketing-analysis`

- 触发位置:
  - `client/src/pages/principal/PosterTemplates.vue`
- 前端路由表相近候选:
  - `/principal`

### 226. `/principal/poster-editor`

- 触发位置:
  - `client/src/pages/principal/PosterModeSelection.vue`
  - `client/src/pages/principal/PosterTemplates.vue`
- 前端路由表相近候选:
  - `/principal`

### 227. `/principal/poster-editor/:param`

- 触发位置:
  - `client/src/pages/principal/PosterTemplates.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/principal`

### 228. `/principal/poster-generator/:param`

- 触发位置:
  - `client/src/pages/principal/PosterTemplates.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/principal`

### 229. `/principal/poster-mode-selection`

- 触发位置:
  - `client/src/pages/principal/PosterEditor.vue`
- 前端路由表相近候选:
  - `/principal`

### 230. `/principal/poster-upload`

- 触发位置:
  - `client/src/pages/principal/PosterModeSelection.vue`
- 前端路由表相近候选:
  - `/principal`

### 231. `/schedule`

- 触发位置:
  - `client/src/pages/principal/Dashboard.vue`
- 前端路由表相近候选:
  - `/experience/schedule`
  - `/dashboard/schedule`
  - `/dashboard/schedule/calendar`
  - `/dashboard/schedule/todo`
  - `/dashboard/schedule-weekly-view`

### 232. `/settings/base-info`

- 触发位置:
  - `client/src/pages/centers/DocumentTemplateCenter.vue`
- 前端路由表相近候选:
  - `/settings`

### 233. `/student/add`

- 触发位置:
  - `client/src/pages/class/detail/ClassDetail.vue`
- 前端路由表相近候选:
  - `/student`

### 234. `/student/analytics`

- 触发位置:
  - `client/src/pages/student/StudentStatistics.vue`
- 前端路由表相近候选:
  - `/analytics`
  - `/dashboard/analytics`
  - `/dashboard/analytics/enrollment-trends`
  - `/dashboard/analytics/financial-analysis`
  - `/dashboard/analytics/student-performance`

### 235. `/student/detail/:param`

- 触发位置:
  - `client/src/pages/Search.vue`
  - `client/src/pages/class/detail/ClassDetail.vue`
  - `client/src/pages/class/detail/[id].vue`
  - `client/src/pages/student/StudentSearch.vue`
  - `client/src/pages/student/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/student`

### 236. `/student/edit/:param`

- 触发位置:
  - `client/src/pages/class/detail/ClassDetail.vue`
  - `client/src/pages/student/StudentSearch.vue`
  - `client/src/pages/student/detail/StudentDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/student`

### 237. `/student/growth/:param`

- 触发位置:
  - `client/src/pages/student/detail/StudentDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/student`

### 238. `/students`

- 触发位置:
  - `client/src/pages/class/students/id.vue`
- 前端路由表相近候选:
  - `/student`

### 239. `/students/:param`

- 触发位置:
  - `client/src/pages/class/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/student`

### 240. `/system/backup`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
- 前端路由表相近候选:
  - `/system`

### 241. `/system/log`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
- 前端路由表相近候选:
  - `/system`

### 242. `/system/logs`

- 触发位置:
  - `client/src/pages/system/backup/BackupManagement.vue`
- 前端路由表相近候选:
  - `/system`

### 243. `/system/message-template`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
- 前端路由表相近候选:
  - `/system`

### 244. `/system/message-templates/:param`

- 触发位置:
  - `client/src/pages/system/MessageTemplate.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/system`

### 245. `/system/permissions`

- 触发位置:
  - `client/src/pages/system/roles/RoleManagement.vue`
- 前端路由表相近候选:
  - `/system`

### 246. `/system/role`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
- 前端路由表相近候选:
  - `/system`

### 247. `/system/roles`

- 触发位置:
  - `client/src/pages/system/permissions.vue`
- 前端路由表相近候选:
  - `/system`

### 248. `/system/settings`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
  - `client/src/pages/system/backup/BackupManagement.vue`
  - `client/src/pages/system/roles/RoleManagement.vue`
- 前端路由表相近候选:
  - `/profile/settings`
  - `/settings`
  - `/system`

### 249. `/system/user`

- 触发位置:
  - `client/src/pages/system/Dashboard.vue`
  - `client/src/pages/system/backup/BackupManagement.vue`
  - `client/src/pages/system/roles/RoleManagement.vue`
- 前端路由表相近候选:
  - `/system`

### 250. `/system/users`

- 触发位置:
  - `client/src/pages/system/permissions.vue`
- 前端路由表相近候选:
  - `/system`

### 251. `/teacher-center/creative-curriculum`

- 触发位置:
  - `client/src/pages/teacher-center/creative-curriculum/interactive-curriculum.vue`
  - `client/src/pages/teacher-center/teaching/TeacherCoursesPage.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 252. `/teacher-center/creative-curriculum-interactive`

- 触发位置:
  - `client/src/pages/teacher-center/creative-curriculum/index.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 253. `/teacher-center/creative-curriculum/play/:param`

- 触发位置:
  - `client/src/pages/teacher-center/teaching/TeacherCoursesPage.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 254. `/teacher-center/creative-curriculum/preview/:param`

- 触发位置:
  - `client/src/pages/teacher-center/teaching/TeacherCoursesPage.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 255. `/teacher-center/customer-tracking`

- 触发位置:
  - `client/src/pages/teacher-center/customer-tracking/detail-simple.vue`
  - `client/src/pages/teacher-center/customer-tracking/detail.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 256. `/teacher-center/customer-tracking/:param`

- 触发位置:
  - `client/src/pages/teacher-center/customer-tracking/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 257. `/teacher-center/dashboard`

- 触发位置:
  - `client/src/components/layout/TeacherSidebar.vue`
- 前端路由表相近候选:
  - `/dashboard`
  - `/dashboard/campus-overview`
  - `/dashboard/data-statistics`
  - `/dashboard/important-notices`
  - `/dashboard/schedule`

### 258. `/teacher-center/notifications`

- 触发位置:
  - `client/src/components/layout/TeacherSidebar.vue`
- 前端路由表相近候选:
  - `/notifications`
  - `/teacher-center`
  - `/teacher`

### 259. `/teacher-center/profile`

- 触发位置:
  - `client/src/layouts/MainLayout.vue`
- 前端路由表相近候选:
  - `/profile`
  - `/profile/settings`
  - `/teacher-center`
  - `/teacher`

### 260. `/teacher-center/student-assessment/detail/:param`

- 触发位置:
  - `client/src/pages/teacher-center/student-assessment/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 261. `/teacher-center/teaching`

- 触发位置:
  - `client/src/pages/mobile/centers/teaching-center/index.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 262. `/teacher-center/teaching/course/:param`

- 触发位置:
  - `client/src/pages/mobile/centers/teaching-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 263. `/teacher/add`

- 触发位置:
  - `client/src/pages/teacher/TeacherList.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 264. `/teacher/create`

- 触发位置:
  - `client/src/pages/teacher/TeacherStatistics.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 265. `/teacher/detail/:param`

- 触发位置:
  - `client/src/pages/Search.vue`
  - `client/src/pages/teacher/TeacherList.vue`
  - `client/src/pages/teacher/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 266. `/teacher/edit/:param`

- 触发位置:
  - `client/src/pages/teacher/TeacherDetail.vue`
  - `client/src/pages/teacher/TeacherList.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`
  - `/teacher-center`
  - `/teacher`

### 267. `/teacher/evaluation`

- 触发位置:
  - `client/src/pages/teacher/development/TeacherDevelopment.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 268. `/teacher/performance`

- 触发位置:
  - `client/src/pages/teacher/development/TeacherDevelopment.vue`
  - `client/src/pages/teacher/evaluation/TeacherEvaluation.vue`
- 前端路由表相近候选:
  - `/dashboard/performance`
  - `/dashboard/analytics/student-performance`
  - `/dashboard/performance/kpi-dashboard`
  - `/dashboard/performance/performance-overview`
  - `/teacher-center`

### 269. `/teacher/statistics`

- 触发位置:
  - `client/src/pages/teacher/evaluation/TeacherEvaluation.vue`
- 前端路由表相近候选:
  - `/statistics`
  - `/dashboard/data-statistics`
  - `/teacher-center`
  - `/teacher`

### 270. `/teachers`

- 触发位置:
  - `client/src/pages/class/teachers/id.vue`
- 前端路由表相近候选:
  - `/teacher-center`
  - `/teacher`

### 271. `/training-center`

- 触发位置:
  - `client/src/pages/training-center/AchievementDetail.vue`

### 272. `/training-center/activities`

- 触发位置:
  - `client/src/pages/training-center/activities.vue`
  - `client/src/pages/training-center/index.vue`
- 前端路由表相近候选:
  - `/activities`

### 273. `/training-center/activities/:param`

- 触发位置:
  - `client/src/pages/training-center/index.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 274. `/training-center/activity-detail/:param`

- 触发位置:
  - `client/src/pages/training-center/PlanDetail.vue`
  - `client/src/pages/training-center/RecordDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 275. `/training-center/activity-start/:param`

- 触发位置:
  - `client/src/pages/training-center/ActivityDetail.vue`
  - `client/src/pages/training-center/PlanDetail.vue`
  - `client/src/pages/training-center/RecordDetail.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 276. `/training-center/activity/:param/start`

- 触发位置:
  - `client/src/pages/training-center/activities.vue`

### 277. `/training-center/plan-detail/:param`

- 触发位置:
  - `client/src/pages/training-center/PlanEdit.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 278. `/training-center/plans`

- 触发位置:
  - `client/src/pages/training-center/PlanCreate.vue`
  - `client/src/pages/training-center/PlanEdit.vue`

### 279. `/training-center/plans/:param`

- 触发位置:
  - `client/src/pages/training-center/plans.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 280. `/training-center/plans/:param/edit`

- 触发位置:
  - `client/src/pages/training-center/plans.vue`

### 281. `/training-center/record-result/:param`

- 触发位置:
  - `client/src/pages/training-center/ActivityStart.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 282. `/training-center/records`

- 触发位置:
  - `client/src/pages/training-center/ActivityDetail.vue`

### 283. `/usage/:param`

- 触发位置:
  - `client/src/pages/centers/UsageCenter.vue`
- 前端路由表相近候选:
  - `/mobile/activity-plan/:param`
  - `/mobile/activity-detail/:param`

### 284. `/usage/alerts`

- 触发位置:
  - `client/src/pages/centers/UsageCenter.vue`

### 285. `/usage/optimization`

- 触发位置:
  - `client/src/pages/centers/UsageCenter.vue`

### 286. `/usage/recharge`

- 触发位置:
  - `client/src/pages/centers/UsageCenter.vue`

### 287. `/usage/reports`

- 触发位置:
  - `client/src/pages/centers/UsageCenter.vue`
