# API Path Mismatch Analysis Report

Generated: 2026-01-04T16:59:38.052Z

## Summary

- **Total Frontend Endpoints**: 565
- **Unique Frontend Paths**: 565
- **Total Backend Routes**: 2030
- **Unique Backend Paths**: 1224
- **Missing /api Prefix**: 225
- **Potential 404 Risks**: 512
- **Path Format Issues**: 40

## 1. Critical Issues - Frontend Calls Without Backend Routes (404 Risk)

The following API calls will result in 404 errors:

**Found 523 critical issues.** Showing first 50:

### 1. /api/activity-center/overview

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 2. /api/activity-center/distribution

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 3. /api/activity-center/trend

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 4. /api/activity-center/activities

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 5. /activity-center/activities/${id}

- **URL Type**: relative-no-prefix
- **Call Count**: 3
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 6. /activity-center/activities/${id}/publish

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 7. /activity-center/activities/${id}/cancel

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 8. /api/activity-center/registrations

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 9. /activity-center/registrations/${id}

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 10. /activity-center/registrations/${id}/approve

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 11. /api/activity-center/registrations/batch-approve

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 12. /api/activity-center/analytics

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 13. /activity-center/analytics/${id}/report

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 14. /api/activity-center/analytics/participation

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 15. /api/activity-center/notifications

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 16. /api/activity-center/notifications/send

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 17. /api/activity-center/notifications/templates

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 18. /activity-center/notifications/templates/${id}

- **URL Type**: relative-no-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/activity-center.ts`

### 19. /api/ai/unified/unified-chat

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`

### 20. /api/ai/unified/capabilities

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 21. /api/ai/unified/status

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 22. ${this.baseurl}/query

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 23. ${this.baseurl}/stats

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 24. ${this.baseurl}/health

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 25. ${this.baseurl}/test-route

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 26. ${this.baseurl}/test-direct

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 27. ${this.baseurl}/keywords

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 28. ${this.baseurl}/config

- **URL Type**: relative
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 29. ${this.baseurl}/reset

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 30. ${this.baseurl}/export/performance

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 31. ${this.baseurl}/batch-test

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 32. ${this.baseurl}/metrics/realtime

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 33. ${this.baseurl}/metrics/trends

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 34. ${this.baseurl}/optimize

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 35. ${this.baseurl}/suggestions

- **URL Type**: relative
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-assistant-optimized.ts`

### 36. /ai-shortcuts/${id}

- **URL Type**: relative-no-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-shortcuts.ts`

### 37. /api/ai-shortcuts/batch/delete

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-shortcuts.ts`

### 38. /api/ai-shortcuts/sort

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai-shortcuts.ts`

### 39. /api/data/${id}

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/api-rules.ts`

### 40. /api/data

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/api-rules.ts`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/error-handling/TC-041-network-error-handling.test.ts`

### 41. /api/assessment-admin/physical-items/${id}

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/assessment-admin.ts`

### 42. /api/assessment-share/share

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/assessment-share.ts`

### 43. /api/assessment-share/scan

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/assessment-share.ts`

### 44. /api/assessment-share/stats/${recordid}

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/assessment-share.ts`

### 45. /api/assessment-share/rewards

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/assessment-share.ts`

### 46. /auto-image/generate

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/auto-image.ts`

### 47. /auto-image/activity

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/auto-image.ts`

### 48. /auto-image/poster

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/auto-image.ts`

### 49. /auto-image/template

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/auto-image.ts`

### 50. /auto-image/batch

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/auto-image.ts`


_*... and 473 more critical issues*_

## 2. Path Format Issues (Potential Mismatches)

These calls have format differences that may cause issues:

**Found 40 potential mismatches.** Grouped by issue type:

### Template variable format mismatch (${id} vs :id) (19 cases)

1. Frontend: `/api/assessment-admin/configs/${id}` → Backend: `/api/assessment-admin/configs/:id`
2. Frontend: `/api/assessment-admin/questions/${id}` → Backend: `/api/assessment-admin/questions/:id`
3. Frontend: `/api/tasks/${id}` → Backend: `/api/tasks/:id`
4. Frontend: `/api/tasks/${id}/status` → Backend: `/api/tasks/:taskid/status`
5. Frontend: `/api/tasks/${taskid}/attachments` → Backend: `/api/tasks/:taskid/attachments`
6. Frontend: `/api/tasks/${taskid}/attachments/${attachmentid}` → Backend: `/api/tasks/:taskid/attachments/:attachmentid`
7. Frontend: `/api/${operation.type}` → Backend: `/api/:id`
8. Frontend: `/api/${operation.type}` → Backend: `/api/:pageid`
9. Frontend: `/api/${operation.type}` → Backend: `/api/:module`
10. Frontend: `/api/${operation.type}` → Backend: `/api/:sessionid`
   ... and 9 more

### Extra /api prefix in frontend (6 cases)

1. Frontend: `/api/assessment/questions` → Backend: `/assessment/questions`
2. Frontend: `/api/assessment/answer` → Backend: `/assessment/answer`
3. Frontend: `/api/assessment/my-records` → Backend: `/assessment/my-records`
4. Frontend: `/api/assessment/growth-trajectory` → Backend: `/assessment/growth-trajectory`
5. Frontend: `/api/parent-assistant/quick-questions` → Backend: `/parent-assistant/quick-questions`
6. Frontend: `/api/parent-assistant/answer` → Backend: `/parent-assistant/answer`

### Missing /api prefix in frontend (15 cases)

1. Frontend: `/statistics` → Backend: `/api/statistics`
2. Frontend: `/system/settings` → Backend: `/api/system/settings`
3. Frontend: `/system/backups` → Backend: `/api/system/backups`
4. Frontend: `/system/logs` → Backend: `/api/system/logs`
5. Frontend: `/classes` → Backend: `/api/classes`
6. Frontend: `/activities` → Backend: `/api/activities`
7. Frontend: `/tasks` → Backend: `/api/tasks`
8. Frontend: `/roles` → Backend: `/api/roles`
9. Frontend: `/principal/dashboard-stats` → Backend: `/api/principal/dashboard-stats`
10. Frontend: `/schedules` → Backend: `/api/schedules`
   ... and 5 more

## 3. Missing /api Prefix Analysis

**Total endpoints missing /api prefix**: 225

These endpoints use relative URLs without the /api prefix:

1. `/activity-center/activities/${id}`
   - Files: 1
   - Calls: 3
2. `/activity-center/activities/${id}/publish`
   - Files: 1
   - Calls: 1
3. `/activity-center/activities/${id}/cancel`
   - Files: 1
   - Calls: 1
4. `/activity-center/registrations/${id}`
   - Files: 1
   - Calls: 1
5. `/activity-center/registrations/${id}/approve`
   - Files: 1
   - Calls: 1
6. `/activity-center/analytics/${id}/report`
   - Files: 1
   - Calls: 1
7. `/activity-center/notifications/templates/${id}`
   - Files: 1
   - Calls: 2
8. `/ai-shortcuts/${id}`
   - Files: 1
   - Calls: 2
9. `/auto-image/generate`
   - Files: 1
   - Calls: 1
10. `/auto-image/activity`
   - Files: 1
   - Calls: 1
11. `/auto-image/poster`
   - Files: 1
   - Calls: 1
12. `/auto-image/template`
   - Files: 1
   - Calls: 1
13. `/auto-image/batch`
   - Files: 1
   - Calls: 1
14. `/auto-image/status`
   - Files: 1
   - Calls: 1
15. `/data-import/schema/${type}`
   - Files: 1
   - Calls: 1
16. `/ai-billing/user/${userId}/bill`
   - Files: 1
   - Calls: 1
17. `/ai-billing/user/${userId}/export`
   - Files: 1
   - Calls: 1
18. `/ai-billing/record/${billingId}/status`
   - Files: 1
   - Calls: 1
19. `/ai-billing/user/${userId}/trend`
   - Files: 1
   - Calls: 1
20. `/ai/unified/unified-chat`
   - Files: 1
   - Calls: 1
21. `/ai/unified/direct-chat`
   - Files: 1
   - Calls: 1
22. `/inspection/types/${id}`
   - Files: 1
   - Calls: 3
23. `/inspection/plans/${id}`
   - Files: 1
   - Calls: 3
24. `/inspection/plans/${planId}/tasks`
   - Files: 1
   - Calls: 2
25. `/inspection/plans/${planId}/tasks/${taskId}`
   - Files: 1
   - Calls: 2
26. `/script-templates/${id}`
   - Files: 1
   - Calls: 1
27. `/teaching-center/course-progress/class/${classId}/detailed`
   - Files: 1
   - Calls: 1
28. `/teaching-center/outdoor-training/class/${classId}/details`
   - Files: 1
   - Calls: 1
29. `/teaching-center/outdoor-training/records/${recordId}`
   - Files: 1
   - Calls: 1
30. `/teaching-center/external-display/class/${classId}/details`
   - Files: 1
   - Calls: 1

... and 195 more

## 4. AI Unified Endpoints (/api/ai/unified/*)

Special focus on AI-related endpoints:

### 1. ❌ MISSING /api/ai/unified/unified-chat

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`

### 2. ❌ MISSING /api/ai/unified/capabilities

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 3. ❌ MISSING /api/ai/unified/status

- **URL Type**: relative-with-prefix
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/ai/function-tools.js`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 4. ❌ MISSING ${apiurl}/ai/unified/stream-chat

- **URL Type**: relative
- **Call Count**: 2
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 5. ❌ MISSING /api/ai/unified/direct-chat-sse

- **URL Type**: relative-with-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 6. ❌ MISSING /ai/unified/unified-chat

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 7. ❌ MISSING /ai/unified/direct-chat

- **URL Type**: relative-no-prefix
- **Call Count**: 1
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/api/endpoints/function-tools.ts`

### 8. ❌ MISSING /api/ai/unified/stream-chat

- **URL Type**: relative-with-prefix
- **Call Count**: 7
- **Files**: 
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/components/ai-assistant/composables/useMessageHandling.ts`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileArticleCreator.vue`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileCopywritingCreator.vue`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile/centers/new-media-center/components/MobileVideoCreator.vue`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/principal/media-center/ArticleCreator.vue`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/principal/media-center/CopywritingCreator.vue`
  - `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/principal/media-center/VideoCreator.vue`

## 5. Hardcoded Absolute URLs (Production Risk)

**Total absolute URLs found**: 3

### 1. http://localhost:3000/api/user/profile

- **URL Type**: absolute
- **File**: `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/security/TC-032-CSRF-token-validation.test.ts`

### 2. http://localhost:3000/api/user/delete

- **URL Type**: absolute
- **File**: `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/security/TC-032-CSRF-token-validation.test.ts`

### 3. http://localhost:3000/api/admin/users

- **URL Type**: absolute
- **File**: `/persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/tests/mobile/security/TC-032-CSRF-token-validation.test.ts`

## 6. Backend Routes Not Used by Frontend

**Total backend-only routes**: 1211

These backend routes may be unused or only used by other clients (e.g., mobile, external APIs):

Showing first 30:

1. `/api/`
   - Method: GET
   - File: `SequelizeMeta.routes.ts`
   - Full path: `/api/`
2. `/api/statistics`
   - Method: GET
   - File: `activities.routes.ts`
   - Full path: `/api/statistics`
3. `/api/:id`
   - Method: GET
   - File: `activities.routes.ts`
   - Full path: `/api/:id`
4. `/api/:id/share-hierarchy`
   - Method: GET
   - File: `activities.routes.ts`
   - Full path: `/api/:id/share-hierarchy`
5. `/api/:id/registrations`
   - Method: GET
   - File: `activities.routes.ts`
   - Full path: `/api/:id/registrations`
6. `/api/:id/share`
   - Method: POST
   - File: `activities.routes.ts`
   - Full path: `/api/:id/share`
7. `/api/:id/publish`
   - Method: PUT
   - File: `activities.routes.ts`
   - Full path: `/api/:id/publish`
8. `/api/:id/status`
   - Method: PUT
   - File: `activities.routes.ts`
   - Full path: `/api/:id/status`
9. `/api/activity/activities`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activities`
10. `/api/activity/activity-plans`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-plans`
11. `/api/activity/activity-plan`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-plan`
12. `/api/activity/activity-templates`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-templates`
13. `/api/activity/activity-template`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-template`
14. `/api/activity/activity-registrations`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-registrations`
15. `/api/activity/activity-registration`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-registration`
16. `/api/activity/activity-checkins`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-checkins`
17. `/api/activity/activity-checkin`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-checkin`
18. `/api/activity/activity-evaluations`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-evaluations`
19. `/api/activity/activity-evaluation`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-evaluation`
20. `/api/activity/activity-posters`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-posters`
21. `/api/activity/activity-poster`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/activity-poster`
22. `/api/activity/progress`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/progress`
23. `/api/activity/centers/activity`
   - Method: USE
   - File: `activity/index.ts`
   - Full path: `/api/activity/centers/activity`
24. `/api/:activityid/stats`
   - Method: GET
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/:activityId/stats`
25. `/api/:activityid/export`
   - Method: GET
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/:activityId/export`
26. `/api/by-activity/:activityid`
   - Method: GET
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/by-activity/:activityId`
27. `/api/registration/:id`
   - Method: POST
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/registration/:id`
28. `/api/batch`
   - Method: POST
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/batch`
29. `/api/:activityid/phone`
   - Method: POST
   - File: `activity-checkin.routes.ts`
   - Full path: `/api/:activityId/phone`
30. `/api/by-rating/:rating`
   - Method: GET
   - File: `activity-evaluation.routes.ts`
   - Full path: `/api/by-rating/:rating`

... and 1181 more

## 7. Recommendations

### 🔴 Priority 1: Fix Critical 404 Risks

**Problem**: 523 frontend API calls have no matching backend route. These will cause runtime errors.

**Action**: Review and implement missing backend routes or fix frontend endpoint paths.

### 🔴 Priority 2: Standardize API Prefix

**Problem**: 225 endpoints are missing the /api prefix. This will cause calls to fail in production.

**Action**: Ensure all frontend API calls use consistent /api prefix or configure axios baseURL properly.

### 🟡 Priority 3: Fix Template Variable Format

**Problem**: 0 endpoints have template variable format mismatches.

**Action**: Standardize on either ${id} (frontend) or :id (backend) format across the codebase.

### 🔴 Priority 4: Remove Absolute URLs

**Problem**: 3 endpoints use absolute URLs. These will break in production.

**Action**: Replace hardcoded URLs with relative paths and use environment variables for API base URL.

### 🔴 Priority 5: Implement Missing AI Endpoints

**Problem**: 8 /api/ai/unified/* endpoints called by frontend are not implemented in backend.

**Action**: Implement the missing AI unified endpoints in the backend router.

### 🟢 Priority 6: Review Unused Backend Routes

**Problem**: 1211 backend routes are not called by frontend.

**Action**: Determine if these are deprecated, used by other clients, or genuinely unused.

### 🟡 Priority 7: Enable API Path Validation

**Problem**: Implement automated tests to catch API path mismatches during development.

**Action**: Add integration tests that verify frontend API calls match backend routes.

## 8. Quick Reference Statistics

| Metric | Count |
|--------|-------|
| Total Frontend API Calls | 724 |
| Unique Frontend Endpoints | 565 |
| Missing /api Prefix | 225 |
| Absolute URLs | 3 |
| Total Backend Routes | 2030 |
| Critical 404 Risks | 523 |
| Path Format Issues | 40 |
| Backend-Only Routes | 1211 |

## Appendix A: Sample Frontend Endpoints by Type

### Endpoints WITH /api prefix (Correct)
1. `/api/activity-center/overview`
2. `/api/activity-center/distribution`
3. `/api/activity-center/trend`
4. `/api/activity-center/activities`
5. `/api/activity-center/registrations`
6. `/api/activity-center/registrations/batch-approve`
7. `/api/activity-center/analytics`
8. `/api/activity-center/analytics/participation`
9. `/api/activity-center/notifications`
10. `/api/activity-center/notifications/send`
11. `/api/activity-center/notifications/templates`
12. `/api/ai/unified/unified-chat`
13. `/api/ai/unified/capabilities`
14. `/api/ai/unified/status`
15. `/api/ai-shortcuts/batch/delete`
16. `/api/ai-shortcuts/sort`
17. `/api/data/${id}`
18. `/api/data`
19. `/api/assessment-admin/configs`
20. `/api/assessment-admin/configs/${id}`

### Endpoints WITHOUT /api prefix (Issue)
1. `/activity-center/activities/${id}`
2. `/activity-center/activities/${id}/publish`
3. `/activity-center/activities/${id}/cancel`
4. `/activity-center/registrations/${id}`
5. `/activity-center/registrations/${id}/approve`
6. `/activity-center/analytics/${id}/report`
7. `/activity-center/notifications/templates/${id}`
8. `/ai-shortcuts/${id}`
9. `/auto-image/generate`
10. `/auto-image/activity`
11. `/auto-image/poster`
12. `/auto-image/template`
13. `/auto-image/batch`
14. `/auto-image/status`
15. `/data-import/schema/${type}`
16. `/ai-billing/user/${userId}/bill`
17. `/ai-billing/user/${userId}/export`
18. `/ai-billing/record/${billingId}/status`
19. `/ai-billing/user/${userId}/trend`
20. `/ai/unified/unified-chat`
