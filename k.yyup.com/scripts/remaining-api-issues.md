# 仍需修复的16个API问题

## 1. /documents - document-center/index.vue
- 后端有: document-template.routes.ts, document-instance.routes.ts, document-statistics.routes.ts
- 建议: GET `/document-template` 或 `/document-instance`

## 2. /inspection-center/tasks - inspection-center/index.vue
- 后端有: inspection.routes.ts, inspection-ai.routes.ts, inspection-record.routes.ts  
- 建议: GET `/inspection` 或 `/inspection-record`

## 3. /permissions/roles - permission-center/index.vue
- 后端有: role-permissions.routes.ts, roles.routes.ts, permissions.routes.ts
- 建议: GET `/roles` 或 `/role-permissions`

## 4. /feedback/my-records - parent-center/feedback/index.vue
- 后端可能在 parent.routes.ts 或需要使用类似的端点
- 建议: GET `/assessment` (feedback is assessment related)

## 5. /parent/promotion/stats - parent-center/promotion-center/index.vue
- 后端有: smart-promotion.routes.ts, referral-statistics.routes.ts
- 建议: GET `/smart-promotion` 或 `/referral-statistics`

## 6. /parent/promotion/activities - parent-center/promotion-center/index.vue
- 后议: GET `/smart-promotion`

## 7. /parent/promotion/rewards - parent-center/promotion-center/index.vue
- 后端有: referral-rewards.routes.ts
- 建议: GET `/referral-rewards`

## 8. /parent/share/overview - parent-center/share-stats/index.vue
- 后端有: assessment-share.routes.ts, referral-relationships.routes.ts
- 建议: GET `/assessment-share` 或 `/referral-relationships`

## 9. /parent/share/records - parent-center/share-stats/index.vue
- 建议: GET `/assessment-share`

## 10. /teacher/appointments - teacher-center/appointment-management/index.vue
- 后端有: enrollment-interviews.routes.ts
- 建议: GET `/enrollment-interviews`

## 11. /teacher/classes - teacher-center/class-contacts/index.vue
- 后端有: classes.routes.ts
- 建议: GET `/classes`

## 12. /teacher/performance/stats - teacher-center/performance-rewards/index.vue
- 后端有: teacher-center-creative-curriculum.routes.ts, principal-performance.routes.ts
- 建议: GET `/principal-performance` 或 `/teacher-center-creative-curriculum`

## 13. /teacher/schedule/weekly - teacher-center/teaching/index.vue
- 后端有: schedules.routes.ts
- 建议: GET `/schedules`

## 14. /notifications - notification-center/index.vue
- 后端有: notifications.routes.ts
- 状态: ✅ 已存在，无需修复

## 15. /system/settings - settings-center/index.vue
- 后端有: system.routes.ts
- 状态: ✅ GET `/system/settings` 已存在

## 16. /system-logs/logs - system-log-center/index.vue (已修复为 /system/logs)
- 状态: ✅ 已修复

