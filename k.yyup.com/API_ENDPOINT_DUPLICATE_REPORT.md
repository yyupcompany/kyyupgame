# API端点重复检测报告

**生成时间**: 2025/11/26 23:50:35

## 📊 扫描统计

- **前端文件数量**: 149
- **后端文件数量**: 424
- **前端端点数量**: 1926
- **后端端点数量**: 3151
- **潜在冲突数量**: 255

## 🚨 潜在冲突详情

### 严重冲突 (53个)

#### 1. 完全重复: /tasks

**前端调用位置**:
- `client/src/api/task-center.ts:97`
- `client/src/api/task-center.ts:97`
- `client/src/router/teacher-center-routes.ts:57`
- `client/src/router/optimized-routes.ts:3345`
- `client/src/router/mobile/teacher-center-routes.ts:88`

**后端定义位置**:
- `server/src/routes/websiteAutomation.ts:29`
- `server/src/routes/websiteAutomation.ts:29`
- `server/src/routes/websiteAutomation.ts:29`
- `server/src/routes/websiteAutomation.ts:29`
- `server/src/routes/teacher-dashboard.routes.ts:211`
- `server/src/routes/teacher-dashboard.routes.ts:211`
- `server/src/routes/teacher-dashboard.routes.ts:211`
- `server/src/routes/teacher-dashboard.routes.ts:211`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 2. 完全重复: /tasks/stats

**前端调用位置**:
- `client/src/api/task-center.ts:135`

**后端定义位置**:
- `server/src/routes/teacher-dashboard.routes.ts:348`
- `server/src/routes/teacher-dashboard.routes.ts:348`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 3. 完全重复: /classes

**前端调用位置**:
- `client/src/api/class.ts:175`
- `client/src/api/class.ts:175`

**后端定义位置**:
- `server/src/routes/teacher-attendance.routes.ts:287`
- `server/src/routes/teacher-attendance.routes.ts:287`
- `server/src/routes/personnel-center.routes.ts:1608`
- `server/src/routes/personnel-center.routes.ts:1608`
- `server/src/routes/personnel-center.routes.ts:1608`
- `server/src/routes/personnel-center.routes.ts:1608`
- `server/src/routes/dashboard.routes.ts:1526`
- `server/src/routes/dashboard.routes.ts:1526`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 4. 完全重复: /activities

**前端调用位置**:
- `client/src/api/activity.ts:67`
- `client/src/api/activity.ts:67`
- `client/src/api/modules/marketing.ts:152`
- `client/src/api/modules/marketing.ts:152`
- `client/src/router/teacher-center-routes.ts:94`
- `client/src/router/parent-center-routes.ts:328`
- `client/src/router/optimized-routes.ts:1684`
- `client/src/router/optimized-routes.ts:1684`
- `client/src/router/optimized-routes.ts:1684`
- `client/src/router/optimized-routes.ts:1684`
- `client/src/router/mobile/teacher-center-routes.ts:14`
- `client/src/router/mobile/parent-center-routes.ts:267`

**后端定义位置**:
- `server/src/routes/statistics.routes.ts:39`
- `server/src/routes/statistics.routes.ts:39`
- `server/src/routes/statistics-adapter.routes.ts:183`
- `server/src/routes/statistics-adapter.routes.ts:183`
- `server/src/routes/principal.routes.ts:1394`
- `server/src/routes/principal.routes.ts:1394`
- `server/src/routes/enrollment-statistics.routes.ts:373`
- `server/src/routes/enrollment-statistics.routes.ts:373`
- `server/src/routes/dashboard.routes.ts:1867`
- `server/src/routes/dashboard.routes.ts:1867`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 5. 完全重复: /system/settings

**前端调用位置**:
- `client/src/api/modules/system.ts:814`
- `client/src/api/modules/system.ts:814`

**后端定义位置**:
- `server/src/routes/index.ts:289`
- `server/src/routes/index.ts:289`
- `server/src/routes/index.ts:289`
- `server/src/routes/index.ts:289`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 6. 完全重复: /principal/customer-pool/stats

**前端调用位置**:
- `client/src/api/modules/principal.ts:365`

**后端定义位置**:
- `server/src/routes/dashboard.routes.ts:942`
- `server/src/routes/dashboard.routes.ts:942`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 7. 完全重复: /principal/customer-pool/list

**前端调用位置**:
- `client/src/api/modules/principal.ts:381`

**后端定义位置**:
- `server/src/routes/dashboard.routes.ts:981`
- `server/src/routes/dashboard.routes.ts:981`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 8. 完全重复: /poster-templates

**前端调用位置**:
- `client/src/api/modules/principal.ts:650`
- `client/src/api/modules/principal.ts:650`
- `client/src/router/optimized-routes.ts:1761`

**后端定义位置**:
- `server/src/routes/principal.routes.ts:1524`
- `server/src/routes/principal.routes.ts:1524`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 9. 完全重复: /applications

**前端调用位置**:
- `client/src/api/modules/application.ts:62`
- `client/src/router/mobile/centers-routes.ts:277`

**后端定义位置**:
- `server/src/routes/enrollment-center.routes.ts:117`
- `server/src/routes/enrollment-center.routes.ts:117`
- `server/src/routes/api.ts:255`
- `server/src/routes/api.ts:255`
- `server/src/routes/api.ts:255`
- `server/src/routes/api.ts:255`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 10. 完全重复: /dashboard

**前端调用位置**:
- `client/src/router/teacher-center-routes.ts:8`
- `client/src/router/parent-center-routes.ts:13`
- `client/src/router/optimized-routes.ts:197`
- `client/src/router/optimized-routes.ts:197`
- `client/src/router/optimized-routes.ts:197`
- `client/src/router/optimized-routes.ts:197`
- `client/src/router/optimized-routes.ts:197`
- `client/src/router/mobile/teacher-center-routes.ts:14`
- `client/src/router/mobile/parent-center-routes.ts:17`

**后端定义位置**:
- `server/src/routes/unified-statistics.routes.ts:143`
- `server/src/routes/unified-statistics.routes.ts:143`
- `server/src/routes/teacher-dashboard.routes.ts:5`
- `server/src/routes/teacher-dashboard.routes.ts:5`
- `server/src/routes/statistics.routes.ts:1234`
- `server/src/routes/statistics.routes.ts:1234`
- `server/src/routes/statistics-adapter.routes.ts:115`
- `server/src/routes/statistics-adapter.routes.ts:115`
- `server/src/routes/principal.routes.ts:123`
- `server/src/routes/principal.routes.ts:123`
- `server/src/routes/business-center.routes.ts:219`
- `server/src/routes/business-center.routes.ts:219`
- `server/src/routes/centers/customer-pool-center.routes.ts:265`
- `server/src/routes/centers/customer-pool-center.routes.ts:265`
- `server/src/routes/centers/activity-center.routes.ts:622`
- `server/src/routes/centers/activity-center.routes.ts:622`
- `server/src/routes/ai/analytics.routes.ts:1133`
- `server/src/routes/ai/analytics.routes.ts:1133`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 11. 完全重复: /{id}

**前端调用位置**:
- `client/src/router/teacher-center-routes.ts:0`
- `client/src/router/teacher-center-routes.ts:0`
- `client/src/router/teacher-center-routes.ts:0`
- `client/src/router/teacher-center-routes.ts:0`
- `client/src/router/optimized-routes.ts:0`
- `client/src/router/mobile/teacher-center-routes.ts:0`
- `client/src/router/mobile/teacher-center-routes.ts:0`
- `client/src/router/mobile/teacher-center-routes.ts:0`
- `client/src/router/mobile/teacher-center-routes.ts:0`

**后端定义位置**:
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/voice-config.routes.ts:388`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/users.routes.ts:505`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user.routes.ts:341`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-roles.routes.ts:167`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/user-role.routes.ts:390`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/token-blacklist.routes.ts:167`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/todos.routes.ts:487`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teachers.routes.ts:676`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher.routes.ts:399`
- `server/src/routes/teacher-center-creative-curriculum.routes.ts:332`
- `server/src/routes/teacher-center-creative-curriculum.routes.ts:332`
- `server/src/routes/teacher-center-creative-curriculum.routes.ts:332`
- `server/src/routes/teacher-center-creative-curriculum.routes.ts:332`
- `server/src/routes/teacher-approval.routes.ts:224`
- `server/src/routes/teacher-approval.routes.ts:224`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/task.routes.ts:682`
- `server/src/routes/system-logs.routes.ts:312`
- `server/src/routes/system-logs.routes.ts:312`
- `server/src/routes/system-logs.routes.ts:312`
- `server/src/routes/system-logs.routes.ts:312`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-configs.routes.ts:435`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/system-ai-models.routes.ts:266`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/students.routes.ts:203`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/student.routes.ts:675`
- `server/src/routes/sequelize-meta.routes.ts:167`
- `server/src/routes/sequelize-meta.routes.ts:167`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script.routes.ts:161`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-template.routes.ts:418`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/script-category.routes.ts:566`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/schedules.routes.ts:281`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/roles-backup.routes.ts:167`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role.routes.ts:372`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permissions.routes.ts:167`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/role-permission.routes.ts:274`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-statistics.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-rewards.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-relationships.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/referral-codes.routes.ts:167`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-templates.routes.ts:300`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-template.routes.ts:271`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generations.routes.ts:167`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/poster-generation.routes.ts:165`
- `server/src/routes/photo-album.routes.ts:94`
- `server/src/routes/photo-album.routes.ts:94`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/personal-posters.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permissions-backup.routes.ts:167`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/permission.routes.ts:454`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rules.routes.ts:167`
- `server/src/routes/performance-rule.routes.ts:180`
- `server/src/routes/performance-rule.routes.ts:180`
- `server/src/routes/performance-reports.routes.ts:307`
- `server/src/routes/performance-reports.routes.ts:307`
- `server/src/routes/performance-report.routes.ts:250`
- `server/src/routes/performance-report.routes.ts:250`
- `server/src/routes/performance-report.routes.ts:250`
- `server/src/routes/performance-report.routes.ts:250`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluations.routes.ts:373`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/performance-evaluation.routes.ts:222`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parents.routes.ts:214`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent.routes.ts:341`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relations.routes.ts:585`
- `server/src/routes/parent-student-relation.routes.ts:180`
- `server/src/routes/parent-student-relation.routes.ts:180`
- `server/src/routes/page-guide.routes.ts:0`
- `server/src/routes/page-guide.routes.ts:0`
- `server/src/routes/page-guide.routes.ts:0`
- `server/src/routes/page-guide.routes.ts:0`
- `server/src/routes/page-guide-section.routes.ts:147`
- `server/src/routes/page-guide-section.routes.ts:147`
- `server/src/routes/page-guide-section.routes.ts:147`
- `server/src/routes/page-guide-section.routes.ts:147`
- `server/src/routes/operation-logs.routes.ts:322`
- `server/src/routes/operation-logs.routes.ts:322`
- `server/src/routes/operation-logs.routes.ts:322`
- `server/src/routes/operation-logs.routes.ts:322`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/notifications.routes.ts:389`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/message-templates.routes.ts:275`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaigns.routes.ts:772`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/marketing-campaign.routes.ts:280`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-records.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/like-collect-config.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergartens.routes.ts:167`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/kindergarten.routes.ts:349`
- `server/src/routes/interactive-curriculum.routes.ts:0`
- `server/src/routes/interactive-curriculum.routes.ts:0`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-rectification.routes.ts:150`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/inspection-record.routes.ts:145`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/group.routes.ts:254`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/field-template.routes.ts:667`
- `server/src/routes/example.routes.ts:147`
- `server/src/routes/example.routes.ts:147`
- `server/src/routes/enrollment.routes.ts:513`
- `server/src/routes/enrollment.routes.ts:513`
- `server/src/routes/enrollment.routes.ts:513`
- `server/src/routes/enrollment.routes.ts:513`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-tasks.routes.ts:281`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quotas.routes.ts:580`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-quota.routes.ts:425`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plans.routes.ts:177`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-plan.routes.ts:299`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interviews.routes.ts:167`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-interview.routes.ts:228`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultations.routes.ts:176`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-consultation.routes.ts:674`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-applications.routes.ts:177`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/enrollment-application.routes.ts:276`
- `server/src/routes/document-template.routes.ts:572`
- `server/src/routes/document-template.routes.ts:572`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/document-instance.routes.ts:320`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/customer-pool.routes.ts:547`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/coupons.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-trackings.routes.ts:167`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/conversion-tracking.routes.ts:369`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/classes.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channels.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-trackings.routes.ts:167`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/channel-tracking.routes.ts:225`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/change-log.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/base.routes.ts:167`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-shortcuts.routes.ts:207`
- `server/src/routes/ai-query.routes.ts:346`
- `server/src/routes/ai-query.routes.ts:346`
- `server/src/routes/ai-conversation.routes.ts:128`
- `server/src/routes/ai-conversation.routes.ts:128`
- `server/src/routes/ai-conversation.routes.ts:128`
- `server/src/routes/ai-conversation.routes.ts:128`
- `server/src/routes/ai-analysis.routes.ts:337`
- `server/src/routes/ai-analysis.routes.ts:337`
- `server/src/routes/ai-analysis.routes.ts:337`
- `server/src/routes/ai-analysis.routes.ts:337`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisements.routes.ts:167`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/advertisement.routes.ts:525`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-results.routes.ts:167`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-result.routes.ts:380`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notifications.routes.ts:167`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/admission-notification.routes.ts:340`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-template.routes.ts:128`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registrations.routes.ts:233`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-registration.routes.ts:419`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plans.routes.ts:226`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-plan.routes.ts:361`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluations.routes.ts:224`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-evaluation.routes.ts:534`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activity-checkin.routes.ts:131`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/activities.routes.ts:477`
- `server/src/routes/ai/conversation.routes.ts:244`
- `server/src/routes/ai/conversation.routes.ts:244`
- `server/src/routes/ai/conversation.routes.ts:244`
- `server/src/routes/ai/conversation.routes.ts:244`
- `server/src/routes/ai/conversation.routes.ts:244`
- `server/src/routes/ai/conversation.routes.ts:244`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 12. 完全重复: /enrollment

**前端调用位置**:
- `client/src/router/teacher-center-routes.ts:131`
- `client/src/router/optimized-routes.ts:128`
- `client/src/router/optimized-routes.ts:128`
- `client/src/router/optimized-routes.ts:128`
- `client/src/router/mobile/teacher-center-routes.ts:166`

**后端定义位置**:
- `server/src/routes/statistics.routes.ts:30`
- `server/src/routes/statistics.routes.ts:30`
- `server/src/routes/statistics-adapter.routes.ts:155`
- `server/src/routes/statistics-adapter.routes.ts:155`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 13. 完全重复: /schedule

**前端调用位置**:
- `client/src/router/teacher-center-routes.ts:190`
- `client/src/router/mobile/teacher-center-routes.ts:228`

**后端定义位置**:
- `server/src/routes/principal.routes.ts:456`
- `server/src/routes/principal.routes.ts:456`
- `server/src/routes/principal.routes.ts:456`
- `server/src/routes/principal.routes.ts:456`
- `server/src/routes/dashboard.routes.ts:648`
- `server/src/routes/dashboard.routes.ts:648`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 14. 完全重复: /profile

**前端调用位置**:
- `client/src/router/parent-center-routes.ts:36`
- `client/src/router/optimized-routes.ts:320`
- `client/src/router/optimized-routes.ts:320`
- `client/src/router/mobile/parent-center-routes.ts:40`

**后端定义位置**:
- `server/src/routes/user.routes.ts:302`
- `server/src/routes/user.routes.ts:302`
- `server/src/routes/user-profile.routes.ts:5`
- `server/src/routes/user-profile.routes.ts:5`
- `server/src/routes/user-profile.routes.ts:5`
- `server/src/routes/user-profile.routes.ts:5`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 15. 完全重复: /report/{recordid}

**前端调用位置**:
- `client/src/router/parent-center-routes.ts:0`
- `client/src/router/optimized-routes.ts:0`
- `client/src/router/mobile/parent-center-routes.ts:0`

**后端定义位置**:
- `server/src/routes/assessment.routes.ts:0`
- `server/src/routes/assessment.routes.ts:0`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 16. 完全重复: /growth-trajectory

**前端调用位置**:
- `client/src/router/parent-center-routes.ts:176`
- `client/src/router/optimized-routes.ts:3552`
- `client/src/router/mobile/parent-center-routes.ts:202`

**后端定义位置**:
- `server/src/routes/assessment.routes.ts:1249`
- `server/src/routes/assessment.routes.ts:1249`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 17. 完全重复: /chat

**前端调用位置**:
- `client/src/router/parent-center-routes.ts:400`
- `client/src/router/optimized-routes.ts:2216`
- `client/src/router/mobile/parent-center-routes.ts:350`
- `client/src/router/mobile/centers-routes.ts:169`

**后端定义位置**:
- `server/src/routes/ai-query.routes.ts:132`
- `server/src/routes/ai-query.routes.ts:132`
- `server/src/routes/ai-mock.routes.ts:191`
- `server/src/routes/ai-mock.routes.ts:191`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 18. 完全重复: /feedback

**前端调用位置**:
- `client/src/router/parent-center-routes.ts:422`
- `client/src/router/optimized-routes.ts:1094`
- `client/src/router/mobile/parent-center-routes.ts:383`

**后端定义位置**:
- `server/src/routes/ai-query.routes.ts:286`
- `server/src/routes/ai-query.routes.ts:286`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 19. 完全重复: /login

**前端调用位置**:
- `client/src/router/optimized-routes.ts:225`
- `client/src/router/index.ts:65`

**后端定义位置**:
- `server/src/routes/auth.routes.ts:14`
- `server/src/routes/auth.routes.ts:14`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 20. 完全重复: /register

**前端调用位置**:
- `client/src/router/optimized-routes.ts:251`

**后端定义位置**:
- `server/src/routes/auth-register.routes.ts:7`
- `server/src/routes/auth-register.routes.ts:7`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 21. 完全重复: /messages

**前端调用位置**:
- `client/src/router/optimized-routes.ts:368`

**后端定义位置**:
- `server/src/routes/chat.routes.ts:339`
- `server/src/routes/chat.routes.ts:339`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 22. 完全重复: /finance

**前端调用位置**:
- `client/src/router/optimized-routes.ts:22`

**后端定义位置**:
- `server/src/routes/statistics.routes.ts:714`
- `server/src/routes/statistics.routes.ts:714`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 23. 完全重复: /search

**前端调用位置**:
- `client/src/router/optimized-routes.ts:436`
- `client/src/router/optimized-routes.ts:436`

**后端定义位置**:
- `server/src/routes/teacher.routes.ts:115`
- `server/src/routes/teacher.routes.ts:115`
- `server/src/routes/student.routes.ts:308`
- `server/src/routes/student.routes.ts:308`
- `server/src/routes/quick-query-groups.routes.ts:249`
- `server/src/routes/quick-query-groups.routes.ts:249`
- `server/src/routes/personnel-center.routes.ts:478`
- `server/src/routes/personnel-center.routes.ts:478`
- `server/src/routes/document-template.routes.ts:479`
- `server/src/routes/document-template.routes.ts:479`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 24. 完全重复: /dashboard/data-statistics

**前端调用位置**:
- `client/src/router/optimized-routes.ts:471`

**后端定义位置**:
- `server/src/routes/api.ts:926`
- `server/src/routes/api.ts:926`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 25. 完全重复: /dashboard/schedule

**前端调用位置**:
- `client/src/router/optimized-routes.ts:202`

**后端定义位置**:
- `server/src/routes/api.ts:673`
- `server/src/routes/api.ts:673`
- `server/src/routes/api.ts:673`
- `server/src/routes/api.ts:673`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 26. 完全重复: /dashboard/class-list

**前端调用位置**:
- `client/src/router/optimized-routes.ts:636`

**后端定义位置**:
- `server/src/routes/api.ts:880`
- `server/src/routes/api.ts:880`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 27. 完全重复: /statistics

**前端调用位置**:
- `client/src/router/optimized-routes.ts:183`
- `client/src/router/optimized-routes.ts:183`
- `client/src/router/optimized-routes.ts:183`
- `client/src/router/optimized-routes.ts:183`
- `client/src/router/optimized-routes.ts:183`

**后端定义位置**:
- `server/src/routes/websiteAutomation.ts:616`
- `server/src/routes/websiteAutomation.ts:616`
- `server/src/routes/todos.routes.ts:296`
- `server/src/routes/todos.routes.ts:296`
- `server/src/routes/teacher.routes.ts:257`
- `server/src/routes/teacher.routes.ts:257`
- `server/src/routes/teacher-dashboard.routes.ts:148`
- `server/src/routes/teacher-dashboard.routes.ts:148`
- `server/src/routes/teacher-checkin.routes.ts:623`
- `server/src/routes/teacher-checkin.routes.ts:623`
- `server/src/routes/teacher-attendance.routes.ts:830`
- `server/src/routes/teacher-attendance.routes.ts:830`
- `server/src/routes/system-logs.routes.ts:683`
- `server/src/routes/system-logs.routes.ts:683`
- `server/src/routes/student.routes.ts:434`
- `server/src/routes/student.routes.ts:434`
- `server/src/routes/schedules.routes.ts:122`
- `server/src/routes/schedules.routes.ts:122`
- `server/src/routes/personnel-center.routes.ts:410`
- `server/src/routes/personnel-center.routes.ts:410`
- `server/src/routes/notification-center.routes.ts:350`
- `server/src/routes/notification-center.routes.ts:350`
- `server/src/routes/media-center.routes.ts:181`
- `server/src/routes/media-center.routes.ts:181`
- `server/src/routes/marketing-center.routes.ts:108`
- `server/src/routes/marketing-center.routes.ts:108`
- `server/src/routes/files.routes.ts:300`
- `server/src/routes/files.routes.ts:300`
- `server/src/routes/errors.routes.ts:319`
- `server/src/routes/errors.routes.ts:319`
- `server/src/routes/enrollment-plan.routes.ts:230`
- `server/src/routes/enrollment-plan.routes.ts:230`
- `server/src/routes/enrollment-finance.routes.ts:186`
- `server/src/routes/enrollment-finance.routes.ts:186`
- `server/src/routes/enrollment-consultation.routes.ts:342`
- `server/src/routes/enrollment-consultation.routes.ts:342`
- `server/src/routes/dashboard.routes.ts:274`
- `server/src/routes/dashboard.routes.ts:274`
- `server/src/routes/channel-tracking.routes.ts:587`
- `server/src/routes/channel-tracking.routes.ts:587`
- `server/src/routes/business-center.routes.ts:201`
- `server/src/routes/business-center.routes.ts:201`
- `server/src/routes/ai-query.routes.ts:331`
- `server/src/routes/ai-query.routes.ts:331`
- `server/src/routes/ai-billing.routes.ts:111`
- `server/src/routes/ai-billing.routes.ts:111`
- `server/src/routes/admission-result.routes.ts:357`
- `server/src/routes/admission-result.routes.ts:357`
- `server/src/routes/activity-plans.routes.ts:333`
- `server/src/routes/activity-plans.routes.ts:333`
- `server/src/routes/activity-evaluations.routes.ts:146`
- `server/src/routes/activity-evaluations.routes.ts:146`
- `server/src/routes/activities.routes.ts:309`
- `server/src/routes/activities.routes.ts:309`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 28. 完全重复: /activity

**前端调用位置**:
- `client/src/router/optimized-routes.ts:153`
- `client/src/router/optimized-routes.ts:153`

**后端定义位置**:
- `server/src/routes/session.routes.ts:232`
- `server/src/routes/session.routes.ts:232`
- `server/src/routes/auto-image.routes.ts:171`
- `server/src/routes/auto-image.routes.ts:171`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 29. 完全重复: /performance

**前端调用位置**:
- `client/src/router/optimized-routes.ts:570`

**后端定义位置**:
- `server/src/routes/enrollment-statistics.routes.ts:521`
- `server/src/routes/enrollment-statistics.routes.ts:521`
- `server/src/routes/ai/token-monitor.routes.ts:108`
- `server/src/routes/ai/token-monitor.routes.ts:108`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 30. 完全重复: /reports

**前端调用位置**:
- `client/src/router/optimized-routes.ts:1838`
- `client/src/router/mobile/centers-routes.ts:223`
- `client/src/router/mobile/centers-routes.ts:223`
- `client/src/router/mobile/centers-routes.ts:223`

**后端定义位置**:
- `server/src/routes/finance.routes.ts:291`
- `server/src/routes/finance.routes.ts:291`
- `server/src/routes/centers/finance-center.routes.ts:546`
- `server/src/routes/centers/finance-center.routes.ts:546`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 31. 完全重复: /system

**前端调用位置**:
- `client/src/router/optimized-routes.ts:37`
- `client/src/router/optimized-routes.ts:37`

**后端定义位置**:
- `server/src/routes/system-logs.routes.ts:102`
- `server/src/routes/system-logs.routes.ts:102`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 32. 完全重复: /users

**前端调用位置**:
- `client/src/router/optimized-routes.ts:1865`

**后端定义位置**:
- `server/src/routes/usage-center.routes.ts:157`
- `server/src/routes/usage-center.routes.ts:157`
- `server/src/routes/system.routes.ts:430`
- `server/src/routes/system.routes.ts:430`
- `server/src/routes/system.routes.ts:430`
- `server/src/routes/system.routes.ts:430`
- `server/src/routes/statistics.routes.ts:21`
- `server/src/routes/statistics.routes.ts:21`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 33. 完全重复: /roles

**前端调用位置**:
- `client/src/router/optimized-routes.ts:1876`

**后端定义位置**:
- `server/src/routes/auth-permissions.routes.ts:183`
- `server/src/routes/auth-permissions.routes.ts:183`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 34. 完全重复: /permissions

**前端调用位置**:
- `client/src/router/optimized-routes.ts:1887`
- `client/src/router/mobile/centers-routes.ts:1078`

**后端定义位置**:
- `server/src/routes/document-import.routes.ts:121`
- `server/src/routes/document-import.routes.ts:121`
- `server/src/routes/auth-permissions.routes.ts:111`
- `server/src/routes/auth-permissions.routes.ts:111`
- `server/src/routes/ai/auth.routes.ts:33`
- `server/src/routes/ai/auth.routes.ts:33`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 35. 完全重复: /logs

**前端调用位置**:
- `client/src/router/optimized-routes.ts:1898`
- `client/src/router/mobile/centers-routes.ts:1090`

**后端定义位置**:
- `server/src/routes/system.routes.ts:458`
- `server/src/routes/system.routes.ts:458`
- `server/src/routes/ai-performance.routes.ts:266`
- `server/src/routes/ai-performance.routes.ts:266`
- `server/src/routes/admin.routes.ts:218`
- `server/src/routes/admin.routes.ts:218`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 36. 完全重复: /query

**前端调用位置**:
- `client/src/router/optimized-routes.ts:2036`

**后端定义位置**:
- `server/src/routes/ai-assistant-optimized.routes.ts:116`
- `server/src/routes/ai-assistant-optimized.routes.ts:116`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 37. 完全重复: /analytics

**前端调用位置**:
- `client/src/router/optimized-routes.ts:27`
- `client/src/router/optimized-routes.ts:27`
- `client/src/router/optimized-routes.ts:27`

**后端定义位置**:
- `server/src/routes/enrollment-plan.routes.ts:258`
- `server/src/routes/enrollment-plan.routes.ts:258`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 38. 完全重复: /models

**前端调用位置**:
- `client/src/router/optimized-routes.ts:78`

**后端定义位置**:
- `server/src/routes/unified-ai.routes.ts:116`
- `server/src/routes/unified-ai.routes.ts:116`
- `server/src/routes/ai.ts:45`
- `server/src/routes/ai.ts:45`
- `server/src/routes/ai.ts:45`
- `server/src/routes/ai.ts:45`
- `server/src/routes/ai-stats.routes.ts:150`
- `server/src/routes/ai-stats.routes.ts:150`
- `server/src/routes/ai-performance.routes.ts:192`
- `server/src/routes/ai-performance.routes.ts:192`
- `server/src/routes/activity-planner.ts:113`
- `server/src/routes/activity-planner.ts:113`
- `server/src/routes/ai/video.routes.ts:307`
- `server/src/routes/ai/video.routes.ts:307`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 39. 完全重复: /predictions

**前端调用位置**:
- `client/src/router/optimized-routes.ts:79`

**后端定义位置**:
- `server/src/routes/ai.ts:1146`
- `server/src/routes/ai.ts:1146`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 40. 完全重复: /channels

**前端调用位置**:
- `client/src/router/optimized-routes.ts:3053`

**后端定义位置**:
- `server/src/routes/marketing.routes.ts:131`
- `server/src/routes/marketing.routes.ts:131`
- `server/src/routes/marketing.routes.ts:131`
- `server/src/routes/marketing.routes.ts:131`
- `server/src/routes/marketing-center.routes.ts:171`
- `server/src/routes/marketing-center.routes.ts:171`
- `server/src/routes/enrollment-statistics.routes.ts:317`
- `server/src/routes/enrollment-statistics.routes.ts:317`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 41. 完全重复: /referrals

**前端调用位置**:
- `client/src/router/optimized-routes.ts:3059`

**后端定义位置**:
- `server/src/routes/marketing.routes.ts:222`
- `server/src/routes/marketing.routes.ts:222`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 42. 完全重复: /conversions

**前端调用位置**:
- `client/src/router/optimized-routes.ts:3065`

**后端定义位置**:
- `server/src/routes/enrollment-statistics.routes.ts:453`
- `server/src/routes/enrollment-statistics.routes.ts:453`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 43. 完全重复: /health

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:343`

**后端定义位置**:
- `server/src/routes/unified-ai.routes.ts:417`
- `server/src/routes/unified-ai.routes.ts:417`
- `server/src/routes/system.routes.ts:150`
- `server/src/routes/system.routes.ts:150`
- `server/src/routes/errors.routes.ts:500`
- `server/src/routes/errors.routes.ts:500`
- `server/src/routes/attendance-center.routes.ts:1078`
- `server/src/routes/attendance-center.routes.ts:1078`
- `server/src/routes/api.routes.ts:168`
- `server/src/routes/api.routes.ts:168`
- `server/src/routes/ai-cache.routes.ts:135`
- `server/src/routes/ai-cache.routes.ts:135`
- `server/src/routes/ai-assistant-optimized.routes.ts:540`
- `server/src/routes/ai-assistant-optimized.routes.ts:540`
- `server/src/controllers/voice-config.controller.ts:378`
- `server/src/app.ts:223`
- `server/src/app.ts:223`
- `server/src/server.ts:143`
- `server/src/server.ts:143`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 44. 完全重复: /revenue

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:649`

**后端定义位置**:
- `server/src/routes/statistics.routes.ts:114`
- `server/src/routes/statistics.routes.ts:114`
- `server/src/routes/statistics-adapter.routes.ts:169`
- `server/src/routes/statistics-adapter.routes.ts:169`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 45. 完全重复: /upload

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:771`
- `client/src/router/mobile/centers-routes.ts:771`

**后端定义位置**:
- `server/src/routes/system.routes.ts:859`
- `server/src/routes/system.routes.ts:859`
- `server/src/routes/poster-upload.routes.ts:5`
- `server/src/routes/poster-upload.routes.ts:5`
- `server/src/routes/files.routes.ts:3`
- `server/src/routes/files.routes.ts:3`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 46. 完全重复: /execute

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1222`

**后端定义位置**:
- `server/src/routes/fix-permissions.ts:141`
- `server/src/routes/fix-permissions.ts:141`
- `server/src/routes/data-import.routes.ts:302`
- `server/src/routes/data-import.routes.ts:302`
- `server/src/routes/batch-import.routes.ts:280`
- `server/src/routes/batch-import.routes.ts:280`
- `server/src/routes/ai-query.routes.ts:190`
- `server/src/routes/ai-query.routes.ts:190`
- `server/src/routes/ai/function-tools.routes.ts:59`
- `server/src/routes/ai/function-tools.routes.ts:59`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 47. 完全重复: /categories

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1354`

**后端定义位置**:
- `server/src/routes/poster-templates.routes.ts:212`
- `server/src/routes/poster-templates.routes.ts:212`
- `server/src/routes/poster-template.routes.ts:865`
- `server/src/routes/poster-template.routes.ts:865`
- `server/src/routes/document-template.routes.ts:389`
- `server/src/routes/document-template.routes.ts:389`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 48. 完全重复: /recent

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1600`

**后端定义位置**:
- `server/src/routes/field-template.routes.ts:204`
- `server/src/routes/field-template.routes.ts:204`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 49. 完全重复: /usage

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1654`

**后端定义位置**:
- `server/src/routes/ai/quota.routes.ts:79`
- `server/src/routes/ai/quota.routes.ts:79`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 50. 完全重复: /templates

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:33`

**后端定义位置**:
- `server/src/routes/websiteAutomation.ts:281`
- `server/src/routes/websiteAutomation.ts:281`
- `server/src/routes/websiteAutomation.ts:281`
- `server/src/routes/websiteAutomation.ts:281`
- `server/src/routes/ai-query.routes.ts:301`
- `server/src/routes/ai-query.routes.ts:301`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 51. 完全重复: /download/{id}

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:0`

**后端定义位置**:
- `server/src/routes/files.routes.ts:464`
- `server/src/routes/files.routes.ts:464`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 52. 完全重复: /overview

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1900`

**后端定义位置**:
- `server/src/routes/usage-center.routes.ts:134`
- `server/src/routes/usage-center.routes.ts:134`
- `server/src/routes/statistics.routes.ts:470`
- `server/src/routes/statistics.routes.ts:470`
- `server/src/routes/security.routes.ts:124`
- `server/src/routes/security.routes.ts:124`
- `server/src/routes/quick-query-groups.routes.ts:185`
- `server/src/routes/quick-query-groups.routes.ts:185`
- `server/src/routes/personnel-center.routes.ts:225`
- `server/src/routes/personnel-center.routes.ts:225`
- `server/src/routes/notification-center.routes.ts:553`
- `server/src/routes/notification-center.routes.ts:553`
- `server/src/routes/finance.routes.ts:118`
- `server/src/routes/finance.routes.ts:118`
- `server/src/routes/enterprise-dashboard.routes.ts:119`
- `server/src/routes/enterprise-dashboard.routes.ts:119`
- `server/src/routes/enrollment-center.routes.ts:111`
- `server/src/routes/enrollment-center.routes.ts:111`
- `server/src/routes/document-statistics.routes.ts:122`
- `server/src/routes/document-statistics.routes.ts:122`
- `server/src/routes/dashboard.routes.ts:193`
- `server/src/routes/dashboard.routes.ts:193`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/center-fixes.routes.ts:122`
- `server/src/routes/call-center.routes.ts:124`
- `server/src/routes/call-center.routes.ts:124`
- `server/src/routes/business-center.routes.ts:125`
- `server/src/routes/business-center.routes.ts:125`
- `server/src/routes/attendance-center.routes.ts:124`
- `server/src/routes/attendance-center.routes.ts:124`
- `server/src/routes/ai-stats.routes.ts:114`
- `server/src/routes/ai-stats.routes.ts:114`
- `server/src/routes/ai/analytics.routes.ts:487`
- `server/src/routes/ai/analytics.routes.ts:487`

**建议**: 确定该API的单一数据源，避免前后端重复实现

#### 53. 完全重复: /upgrade

**前端调用位置**:
- `client/src/router/mobile/centers-routes.ts:1948`

**后端定义位置**:
- `server/src/routes/group.routes.ts:963`
- `server/src/routes/group.routes.ts:963`

**建议**: 确定该API的单一数据源，避免前后端重复实现

### 相似端点 (202个)

#### 1. 相似端点 (100.0% 相似)

- **前端**: `tasks`
- **后端**: `tasks`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 2. 相似端点 (90.9% 相似)

- **前端**: `tasks/${id}`
- **后端**: `tasks/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 3. 相似端点 (72.2% 相似)

- **前端**: `tasks/${id}/status`
- **后端**: `tasks/{id}/stop`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 4. 相似端点 (76.2% 相似)

- **前端**: `tasks/${id}/status`
- **后端**: `tasks/{taskid}/status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 5. 相似端点 (72.2% 相似)

- **前端**: `tasks/${id}/status`
- **后端**: `{taskid}/status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 6. 相似端点 (77.8% 相似)

- **前端**: `tasks/${id}/status`
- **后端**: `todos/{id}/status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 7. 相似端点 (100.0% 相似)

- **前端**: `tasks/stats`
- **后端**: `tasks/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 8. 相似端点 (71.4% 相似)

- **前端**: `task-templates`
- **后端**: `fee-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 9. 相似端点 (71.4% 相似)

- **前端**: `tasks/export`
- **后端**: `classes/export`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 10. 相似端点 (73.1% 相似)

- **前端**: `tasks/${taskid}/comments`
- **后端**: `tasks/{taskid}/attachments`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 11. 相似端点 (96.3% 相似)

- **前端**: `tasks/${taskid}/attachments`
- **后端**: `tasks/{taskid}/attachments`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 12. 相似端点 (78.1% 相似)

- **前端**: `tasks/${taskid}/attachments`
- **后端**: `tasks/{taskid}/attachments/batch`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 13. 相似端点 (73.9% 相似)

- **前端**: `tasks/${taskid}/related`
- **后端**: `tasks/{taskid}/status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 14. 相似端点 (70.6% 相似)

- **前端**: `security/overview`
- **后端**: `activity/overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 15. 相似端点 (72.7% 相似)

- **前端**: `security/recommendations/generate`
- **后端**: `recommendations/generate`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 16. 相似端点 (71.4% 相似)

- **前端**: `photos/upload`
- **后端**: `posters/upload`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 17. 相似端点 (70.6% 相似)

- **前端**: `photos/statistics`
- **后端**: `calls/statistics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 18. 相似端点 (71.4% 相似)

- **前端**: `operation-logs`
- **后端**: `operations`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 19. 相似端点 (71.4% 相似)

- **前端**: `games/statistics/user`
- **后端**: `statistics/user`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 20. 相似端点 (75.0% 相似)

- **前端**: `games/${gamekey}/leaderboard`
- **后端**: `{gamekey}/leaderboard`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 21. 相似端点 (70.6% 相似)

- **前端**: `enrollment-center`
- **后端**: `enrollment-trend`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 22. 相似端点 (70.6% 相似)

- **前端**: `enrollment-center`
- **后端**: `enrollment-trends`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 23. 相似端点 (100.0% 相似)

- **前端**: `classes`
- **后端**: `classes`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 24. 相似端点 (92.3% 相似)

- **前端**: `classes/${id}`
- **后端**: `classes/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 25. 相似端点 (73.7% 相似)

- **前端**: `auto-image/generate`
- **后端**: `image/generate`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 26. 相似端点 (100.0% 相似)

- **前端**: `activities`
- **后端**: `activities`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 27. 相似端点 (76.0% 相似)

- **前端**: `activity-center/overview`
- **后端**: `activity-checkin-overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 28. 相似端点 (70.8% 相似)

- **前端**: `activity-center/overview`
- **后端**: `activity/overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 29. 相似端点 (100.0% 相似)

- **前端**: `system/settings`
- **后端**: `system/settings`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 30. 相似端点 (84.6% 相似)

- **前端**: `system/stats`
- **后端**: `system-status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 31. 相似端点 (75.0% 相似)

- **前端**: `statistics/enrollment`
- **后端**: `statistics/enrollment-trends`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 32. 相似端点 (73.7% 相似)

- **前端**: `statistics/teachers`
- **后端**: `statistics/table`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 33. 相似端点 (75.0% 相似)

- **前端**: `statistics/activities`
- **后端**: `statistics/activity-data`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 34. 相似端点 (82.6% 相似)

- **前端**: `statistics/activities`
- **后端**: `statistics/{activityid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 35. 相似端点 (72.2% 相似)

- **前端**: `statistics/reports`
- **后端**: `statistics/yearly`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 36. 相似端点 (72.2% 相似)

- **前端**: `statistics/revenue`
- **后端**: `statistics/weekly`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 37. 相似端点 (80.0% 相似)

- **前端**: `principal/customer-pool/export`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 38. 相似端点 (83.3% 相似)

- **前端**: `principal/customer-pool/export`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 39. 相似端点 (71.4% 相似)

- **前端**: `principal/campus/overview`
- **后端**: `principal/dashboard/overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 40. 相似端点 (70.6% 相似)

- **前端**: `principal/notices`
- **后端**: `principal/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 41. 相似端点 (100.0% 相似)

- **前端**: `principal/customer-pool/stats`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 42. 相似端点 (86.2% 相似)

- **前端**: `principal/customer-pool/stats`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 43. 相似端点 (71.0% 相似)

- **前端**: `principal/customer-pool/stats`
- **后端**: `principal/customer-applications`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 44. 相似端点 (86.2% 相似)

- **前端**: `principal/customer-pool/list`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 45. 相似端点 (100.0% 相似)

- **前端**: `principal/customer-pool/list`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 46. 相似端点 (83.3% 相似)

- **前端**: `principal/customer-pool/assign`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 47. 相似端点 (83.3% 相似)

- **前端**: `principal/customer-pool/assign`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 48. 相似端点 (71.0% 相似)

- **前端**: `principal/customer-pool/assign`
- **后端**: `principal/customer-applications`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 49. 相似端点 (72.2% 相似)

- **前端**: `principal/customer-pool/batch-assign`
- **后端**: `customer-pool/batch-assign`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 50. 相似端点 (75.0% 相似)

- **前端**: `principal/customer-pool/batch-assign`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 51. 相似端点 (82.8% 相似)

- **前端**: `principal/customer-pool/${id}`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 52. 相似端点 (86.2% 相似)

- **前端**: `principal/customer-pool/${id}`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 53. 相似端点 (71.8% 相似)

- **前端**: `principal/customer-pool/${id}/follow-up`
- **后端**: `customer-pool/{id}/follow-up`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 54. 相似端点 (80.0% 相似)

- **前端**: `principal/customer-pool/import`
- **后端**: `principal/customer-pool/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 55. 相似端点 (83.3% 相似)

- **前端**: `principal/customer-pool/import`
- **后端**: `principal/customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 56. 相似端点 (76.5% 相似)

- **前端**: `performance/rules`
- **后端**: `performance/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 57. 相似端点 (100.0% 相似)

- **前端**: `poster-templates`
- **后端**: `poster-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 58. 相似端点 (72.7% 相似)

- **前端**: `poster-templates/${id}`
- **后端**: `poster-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 59. 相似端点 (73.3% 相似)

- **前端**: `api/permissions`
- **后端**: `permissions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 60. 相似端点 (74.1% 相似)

- **前端**: `notifications/mark-all-read`
- **后端**: `notices/mark-all-read`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 61. 相似端点 (89.5% 相似)

- **前端**: `marketing/analytics`
- **后端**: `marketing/analysis`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 62. 相似端点 (72.2% 相似)

- **前端**: `marketing/referrals/poster-templates`
- **后端**: `referrals/poster-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 63. 相似端点 (71.4% 相似)

- **前端**: `marketing/referrals/generate-poster`
- **后端**: `referrals/generate-poster`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 64. 相似端点 (94.1% 相似)

- **前端**: `system-logs/batch`
- **后端**: `system/logs/batch`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 65. 相似端点 (94.1% 相似)

- **前端**: `system-logs/clear`
- **后端**: `system/logs/clear`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 66. 相似端点 (94.4% 相似)

- **前端**: `system-logs/export`
- **后端**: `system/logs/export`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 67. 相似端点 (90.9% 相似)

- **前端**: `system-logs`
- **后端**: `system/logs`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 68. 相似端点 (88.2% 相似)

- **前端**: `system-logs/${id}`
- **后端**: `system/logs/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 69. 相似端点 (73.7% 相似)

- **前端**: `kindergartens/${id}`
- **后端**: `{kindergartenid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 70. 相似端点 (72.7% 相似)

- **前端**: `groups/${groupid}/users/${userid}`
- **后端**: `{groupid}/users/{userid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 71. 相似端点 (80.0% 相似)

- **前端**: `field-templates`
- **后端**: `fee-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 72. 相似端点 (75.0% 相似)

- **前端**: `enrollment-finance/stats`
- **后端**: `enrollment-finance`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 73. 相似端点 (72.0% 相似)

- **前端**: `enrollment-finance/config`
- **后端**: `enrollment-finance`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 74. 相似端点 (80.0% 相似)

- **前端**: `enrollment-ai/trends`
- **后端**: `enrollment-trend`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 75. 相似端点 (80.0% 相似)

- **前端**: `enrollment-ai/trends`
- **后端**: `enrollment/trend`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 76. 相似端点 (85.0% 相似)

- **前端**: `enrollment-ai/trends`
- **后端**: `enrollment-trends`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 77. 相似端点 (72.2% 相似)

- **前端**: `chat/conversations`
- **后端**: `stats/conversions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 78. 相似端点 (72.2% 相似)

- **前端**: `chat/conversations`
- **后端**: `conversations`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 79. 相似端点 (75.0% 相似)

- **前端**: `chat/conversations/${id}`
- **后端**: `conversations/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 80. 相似端点 (70.6% 相似)

- **前端**: `chat/unread-count`
- **后端**: `unread-count`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 81. 相似端点 (70.4% 相似)

- **前端**: `business-center/statistics`
- **后端**: `business-center-permissions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 82. 相似端点 (100.0% 相似)

- **前端**: `applications`
- **后端**: `applications`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 83. 相似端点 (70.6% 相似)

- **前端**: `applications`
- **后端**: `applications/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 84. 相似端点 (94.4% 相似)

- **前端**: `applications/${id}`
- **后端**: `applications/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 85. 相似端点 (72.0% 相似)

- **前端**: `applications/${id}/review`
- **后端**: `applications/{id}/status`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 86. 相似端点 (70.6% 相似)

- **前端**: `statistics/trends`
- **后端**: `statistics/user`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 87. 相似端点 (70.6% 相似)

- **前端**: `statistics/trends`
- **后端**: `analytics/trends`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 88. 相似端点 (70.6% 相似)

- **前端**: `statistics/trends`
- **后端**: `statistics/table`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 89. 相似端点 (70.6% 相似)

- **前端**: `statistics/trends`
- **后端**: `statistics/weekly`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 90. 相似端点 (75.0% 相似)

- **前端**: `ai/conversations`
- **后端**: `conversation`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 91. 相似端点 (81.3% 相似)

- **前端**: `ai/conversations`
- **后端**: `conversations`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 92. 相似端点 (81.8% 相似)

- **前端**: `ai/conversations/${id}`
- **后端**: `conversations/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 93. 相似端点 (73.3% 相似)

- **前端**: `ai/models/${id}`
- **后端**: `models/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 94. 相似端点 (72.7% 相似)

- **前端**: `ai/analysis`
- **后端**: `analysis`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 95. 相似端点 (90.9% 相似)

- **前端**: `ai/analysis`
- **后端**: `ai-analysis`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 96. 相似端点 (76.5% 相似)

- **前端**: `ai-query/chat`
- **后端**: `api/ai-query/chat`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 97. 相似端点 (75.0% 相似)

- **前端**: `ai-conversations`
- **后端**: `conversation`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 98. 相似端点 (81.3% 相似)

- **前端**: `ai-conversations`
- **后端**: `conversations`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 99. 相似端点 (80.0% 相似)

- **前端**: `user/change-password`
- **后端**: `{id}/change-password`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 100. 相似端点 (75.0% 相似)

- **前端**: `user/change-password`
- **后端**: `change-password`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 101. 相似端点 (100.0% 相似)

- **前端**: `dashboard`
- **后端**: `dashboard`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 102. 相似端点 (100.0% 相似)

- **前端**: `{id}`
- **后端**: `{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 103. 相似端点 (100.0% 相似)

- **前端**: `enrollment`
- **后端**: `enrollment`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 104. 相似端点 (72.2% 相似)

- **前端**: `customers/{id}`
- **后端**: `customer-pool/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 105. 相似端点 (100.0% 相似)

- **前端**: `schedule`
- **后端**: `schedule`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 106. 相似端点 (88.9% 相似)

- **前端**: `schedule`
- **后端**: `schedules`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 107. 相似端点 (73.7% 相似)

- **前端**: `performance-rewards`
- **后端**: `performance/details`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 108. 相似端点 (100.0% 相似)

- **前端**: `profile`
- **后端**: `profile`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 109. 相似端点 (77.8% 相似)

- **前端**: `follow-up`
- **后端**: `followups`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 110. 相似端点 (88.2% 相似)

- **前端**: `report/{recordid}`
- **后端**: `record/{recordid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 111. 相似端点 (100.0% 相似)

- **前端**: `report/{recordid}`
- **后端**: `report/{recordid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 112. 相似端点 (100.0% 相似)

- **前端**: `growth-trajectory`
- **后端**: `growth-trajectory`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 113. 相似端点 (100.0% 相似)

- **前端**: `chat`
- **后端**: `chat`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 114. 相似端点 (100.0% 相似)

- **前端**: `feedback`
- **后端**: `feedback`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 115. 相似端点 (100.0% 相似)

- **前端**: `login`
- **后端**: `login`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 116. 相似端点 (100.0% 相似)

- **前端**: `register`
- **后端**: `register`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 117. 相似端点 (100.0% 相似)

- **前端**: `messages`
- **后端**: `messages`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 118. 相似端点 (83.3% 相似)

- **前端**: `error`
- **后端**: `errors`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 119. 相似端点 (100.0% 相似)

- **前端**: `finance`
- **后端**: `finance`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 120. 相似端点 (100.0% 相似)

- **前端**: `search`
- **后端**: `search`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 121. 相似端点 (72.0% 相似)

- **前端**: `dashboard/campus-overview`
- **后端**: `dashboard/overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 122. 相似端点 (100.0% 相似)

- **前端**: `dashboard/data-statistics`
- **后端**: `dashboard/data-statistics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 123. 相似端点 (100.0% 相似)

- **前端**: `dashboard/schedule`
- **后端**: `dashboard/schedule`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 124. 相似端点 (78.3% 相似)

- **前端**: `dashboard/schedule/todo`
- **后端**: `dashboard/schedule`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 125. 相似端点 (80.0% 相似)

- **前端**: `dashboard/class-list`
- **后端**: `dashboard/classes`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 126. 相似端点 (77.3% 相似)

- **前端**: `dashboard/class-list`
- **后端**: `dashboard/class-create`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 127. 相似端点 (100.0% 相似)

- **前端**: `dashboard/class-list`
- **后端**: `dashboard/class-list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 128. 相似端点 (84.2% 相似)

- **前端**: `dashboard/classlist`
- **后端**: `dashboard/classes`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 129. 相似端点 (72.7% 相似)

- **前端**: `dashboard/classlist`
- **后端**: `dashboard/class-create`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 130. 相似端点 (95.0% 相似)

- **前端**: `dashboard/classlist`
- **后端**: `dashboard/class-list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 131. 相似端点 (71.4% 相似)

- **前端**: `class`
- **后端**: `classes`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 132. 相似端点 (81.3% 相似)

- **前端**: `class/statistics`
- **后端**: `calls/statistics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 133. 相似端点 (94.1% 相似)

- **前端**: `class/detail/{id}`
- **后端**: `class-detail/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 134. 相似端点 (87.5% 相似)

- **前端**: `student`
- **后端**: `students`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 135. 相似端点 (71.4% 相似)

- **前端**: `student/search`
- **后端**: `students/batch`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 136. 相似端点 (93.3% 相似)

- **前端**: `student/search`
- **后端**: `students/search`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 137. 相似端点 (87.5% 相似)

- **前端**: `teacher`
- **后端**: `teachers`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 138. 相似端点 (70.6% 相似)

- **前端**: `performance/{id}`
- **后端**: `performance/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 139. 相似端点 (100.0% 相似)

- **前端**: `statistics`
- **后端**: `statistics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 140. 相似端点 (85.7% 相似)

- **前端**: `parent`
- **后端**: `parents`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 141. 相似端点 (75.0% 相似)

- **前端**: `followup`
- **后端**: `follow`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 142. 相似端点 (88.9% 相似)

- **前端**: `followup`
- **后端**: `followups`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 143. 相似端点 (75.0% 相似)

- **前端**: `enrollment-plan`
- **后端**: `enrollment-trend`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 144. 相似端点 (72.2% 相似)

- **前端**: `enrollment-plan`
- **后端**: `enrollment-finance`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 145. 相似端点 (70.6% 相似)

- **前端**: `enrollment-plan`
- **后端**: `enrollment-trends`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 146. 相似端点 (90.9% 相似)

- **前端**: `quota/{id}`
- **后端**: `quotas/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 147. 相似端点 (100.0% 相似)

- **前端**: `activity`
- **后端**: `activity`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 148. 相似端点 (94.7% 相似)

- **前端**: `activitystatistics`
- **后端**: `activity-statistics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 149. 相似端点 (91.7% 相似)

- **前端**: `application`
- **后端**: `applications`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 150. 相似端点 (85.7% 相似)

- **前端**: `review`
- **后端**: `preview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 151. 相似端点 (72.2% 相似)

- **前端**: `customer-pool`
- **后端**: `customer-pool/list`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 152. 相似端点 (72.2% 相似)

- **前端**: `customer-pool`
- **后端**: `customer-pool/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 153. 相似端点 (94.4% 相似)

- **前端**: `marketing-analysis`
- **后端**: `marketing/analysis`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 154. 相似端点 (100.0% 相似)

- **前端**: `performance`
- **后端**: `performance`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 155. 相似端点 (70.6% 相似)

- **前端**: `performance-rules`
- **后端**: `performance/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 156. 相似端点 (70.6% 相似)

- **前端**: `performancerules`
- **后端**: `performance/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 157. 相似端点 (93.8% 相似)

- **前端**: `postertemplates`
- **后端**: `poster-templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 158. 相似端点 (71.4% 相似)

- **前端**: `reports`
- **后端**: `records`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 159. 相似端点 (100.0% 相似)

- **前端**: `reports`
- **后端**: `reports`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 160. 相似端点 (85.7% 相似)

- **前端**: `reports`
- **后端**: `report`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 161. 相似端点 (100.0% 相似)

- **前端**: `system`
- **后端**: `system`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 162. 相似端点 (100.0% 相似)

- **前端**: `users`
- **后端**: `users`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 163. 相似端点 (80.0% 相似)

- **前端**: `users`
- **后端**: `user`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 164. 相似端点 (100.0% 相似)

- **前端**: `roles`
- **后端**: `roles`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 165. 相似端点 (100.0% 相似)

- **前端**: `permissions`
- **后端**: `permissions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 166. 相似端点 (100.0% 相似)

- **前端**: `logs`
- **后端**: `logs`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 167. 相似端点 (100.0% 相似)

- **前端**: `query`
- **后端**: `query`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 168. 相似端点 (83.3% 相似)

- **前端**: `model`
- **后端**: `models`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 169. 相似端点 (77.8% 相似)

- **前端**: `analytics`
- **后端**: `analysis`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 170. 相似端点 (100.0% 相似)

- **前端**: `analytics`
- **后端**: `analytics`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 171. 相似端点 (100.0% 相似)

- **前端**: `models`
- **后端**: `models`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 172. 相似端点 (100.0% 相似)

- **前端**: `predictions`
- **后端**: `predictions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 173. 相似端点 (71.4% 相似)

- **前端**: `contact`
- **后端**: `context`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 174. 相似端点 (71.4% 相似)

- **前端**: `contact`
- **后端**: `content`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 175. 相似端点 (87.5% 相似)

- **前端**: `contact`
- **后端**: `contacts`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 176. 相似端点 (100.0% 相似)

- **前端**: `channels`
- **后端**: `channels`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 177. 相似端点 (87.5% 相似)

- **前端**: `channels`
- **后端**: `channel`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 178. 相似端点 (100.0% 相似)

- **前端**: `referrals`
- **后端**: `referrals`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 179. 相似端点 (75.0% 相似)

- **前端**: `conversions`
- **后端**: `conversation`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 180. 相似端点 (100.0% 相似)

- **前端**: `conversions`
- **后端**: `conversions`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 181. 相似端点 (84.6% 相似)

- **前端**: `conversions`
- **后端**: `conversations`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 182. 相似端点 (80.0% 相似)

- **前端**: `task`
- **后端**: `tasks`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 183. 相似端点 (70.6% 相似)

- **前端**: `mobile/enrollment`
- **后端**: `{id}/enrollment`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 184. 相似端点 (100.0% 相似)

- **前端**: `health`
- **后端**: `health`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 185. 相似端点 (88.9% 相似)

- **前端**: `resources`
- **后端**: `resource`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 186. 相似端点 (78.9% 相似)

- **前端**: `statistics/{period}`
- **后端**: `statistics/{planid}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 187. 相似端点 (72.2% 相似)

- **前端**: `performance/{type}`
- **后端**: `performance/stats`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 188. 相似端点 (100.0% 相似)

- **前端**: `revenue`
- **后端**: `revenue`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 189. 相似端点 (100.0% 相似)

- **前端**: `upload`
- **后端**: `upload`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 190. 相似端点 (75.0% 相似)

- **前端**: `assigned`
- **后端**: `assign`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 191. 相似端点 (100.0% 相似)

- **前端**: `execute`
- **后端**: `execute`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 192. 相似端点 (100.0% 相似)

- **前端**: `categories`
- **后端**: `categories`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 193. 相似端点 (76.9% 相似)

- **前端**: `comments/{id}`
- **后端**: `content/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 194. 相似端点 (83.3% 相似)

- **前端**: `shared`
- **后端**: `share`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 195. 相似端点 (100.0% 相似)

- **前端**: `recent`
- **后端**: `recent`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 196. 相似端点 (100.0% 相似)

- **前端**: `usage`
- **后端**: `usage`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 197. 相似端点 (100.0% 相似)

- **前端**: `templates`
- **后端**: `templates`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 198. 相似端点 (88.9% 相似)

- **前端**: `templates`
- **后端**: `template`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 199. 相似端点 (100.0% 相似)

- **前端**: `download/{id}`
- **后端**: `download/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 200. 相似端点 (72.7% 相似)

- **前端**: `share/{id}`
- **后端**: `stages/{id}`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 201. 相似端点 (100.0% 相似)

- **前端**: `overview`
- **后端**: `overview`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

#### 202. 相似端点 (100.0% 相似)

- **前端**: `upgrade`
- **后端**: `upgrade`

**建议**: 检查是否为同一功能的不同实现，考虑统一端点命名

## 📱 前端API端点列表

- `/${ai_model_endpoints.models}/${modelid}/capabilities` - 1个调用位置
- `/${ai_model_endpoints.models}/${modelid}/capabilities/${capability}` - 1个调用位置
- `/${ai_query_endpoints.detail}/${id}` - 1个调用位置
- `/${api_base}/ai/capacity` - 1个调用位置
- `/${api_base}/ai/predict` - 1个调用位置
- `/${api_base}/ai/strategy` - 1个调用位置
- `/${api_base}/analytics/funnel` - 1个调用位置
- `/${api_base}/analytics/metrics` - 1个调用位置
- `/${api_base}/analytics/regions` - 1个调用位置
- `/${api_base}/analytics/trends` - 1个调用位置
- `/${api_base}/applications` - 1个调用位置
- `/${api_base}/applications/${id}` - 1个调用位置
- `/${api_base}/applications/${id}/status` - 1个调用位置
- `/${api_base}/children` - 1个调用位置
- `/${api_base}/classes` - 2个调用位置
- `/${api_base}/classes/${id}` - 3个调用位置
- `/${api_base}/classes/batch` - 2个调用位置
- `/${api_base}/classes/export` - 1个调用位置
- `/${api_base}/comparison/${childid}` - 1个调用位置
- `/${api_base}/consultations` - 1个调用位置
- `/${api_base}/consultations/statistics` - 1个调用位置
- `/${api_base}/distribution` - 1个调用位置
- `/${api_base}/export/${childid}` - 1个调用位置
- `/${api_base}/milestones` - 2个调用位置
- `/${api_base}/milestones/${id}` - 2个调用位置
- `/${api_base}/overview` - 2个调用位置
- `/${api_base}/parents` - 2个调用位置
- `/${api_base}/parents/${id}` - 3个调用位置
- `/${api_base}/parents/batch` - 2个调用位置
- `/${api_base}/parents/export` - 1个调用位置
- `/${api_base}/plans` - 2个调用位置
- `/${api_base}/plans/${id}` - 3个调用位置
- `/${api_base}/records` - 2个调用位置
- `/${api_base}/records/${id}` - 3个调用位置
- `/${api_base}/records/${recordid}/photos` - 1个调用位置
- `/${api_base}/records/${recordid}/photos/${photoid}` - 1个调用位置
- `/${api_base}/records/batch` - 1个调用位置
- `/${api_base}/statistics` - 1个调用位置
- `/${api_base}/stats/${childid}` - 1个调用位置
- `/${api_base}/students` - 2个调用位置
- `/${api_base}/students/${id}` - 3个调用位置
- `/${api_base}/students/batch` - 2个调用位置
- `/${api_base}/students/export` - 1个调用位置
- `/${api_base}/suggestions/${childid}` - 1个调用位置
- `/${api_base}/teachers` - 2个调用位置
- `/${api_base}/teachers/${id}` - 3个调用位置
- `/${api_base}/teachers/batch` - 2个调用位置
- `/${api_base}/teachers/export` - 1个调用位置
- `/${api_base}/trajectory/${childid}` - 1个调用位置
- `/${api_base}/trend` - 1个调用位置
- `/${api_base}/trend/${childid}` - 1个调用位置
- `/${api_prefix}/advertisements` - 4个调用位置
- `/${api_prefix}/advertisements/${id}` - 4个调用位置
- `/${api_prefix}/advertisements/${id}/click` - 1个调用位置
- `/${api_prefix}/advertisements/${id}/duplicate` - 1个调用位置
- `/${api_prefix}/advertisements/${id}/impression` - 1个调用位置
- `/${api_prefix}/advertisements/${id}/statistics` - 1个调用位置
- `/${api_prefix}/advertisements/${id}/status` - 2个调用位置
- `/${api_prefix}/advertisements/active` - 1个调用位置
- `/${api_prefix}/advertisements/batch` - 1个调用位置
- `/${api_prefix}/advertisements/batch-status-update` - 1个调用位置
- `/${api_prefix}/advertisements/materials` - 1个调用位置
- `/${api_prefix}/advertisements/materials/upload` - 1个调用位置
- `/${api_prefix}/advertisements/stats` - 1个调用位置
- `/${api_prefix}/ai/churn-risk-assessment` - 1个调用位置
- `/${api_prefix}/ai/competitor-analysis` - 1个调用位置
- `/${api_prefix}/ai/comprehensive-report` - 1个调用位置
- `/${api_prefix}/ai/customer-segmentation` - 1个调用位置
- `/${api_prefix}/ai/dynamic-pricing` - 1个调用位置
- `/${api_prefix}/ai/enrollment-forecast` - 1个调用位置
- `/${api_prefix}/ai/forecast-accuracy` - 1个调用位置
- `/${api_prefix}/ai/funnel-analysis` - 1个调用位置
- `/${api_prefix}/ai/intelligent-follow-up` - 1个调用位置
- `/${api_prefix}/ai/optimal-contact-time` - 1个调用位置
- `/${api_prefix}/ai/performance-metrics` - 1个调用位置
- `/${api_prefix}/ai/personalized-content` - 1个调用位置
- `/${api_prefix}/ai/personalized-message` - 1个调用位置
- `/${api_prefix}/ai/personalized-strategies` - 1个调用位置
- `/${api_prefix}/customers` - 2个调用位置
- `/${api_prefix}/customers/${id}` - 2个调用位置
- `/${api_prefix}/customers/import` - 1个调用位置
- `/${api_prefix}/customers/stats` - 1个调用位置
- `/${api_prefix}/dashboard/class-analysis` - 1个调用位置
- `/${api_prefix}/dashboard/enrollment-forecast` - 1个调用位置
- `/${api_prefix}/dashboard/influence-factors` - 1个调用位置
- `/${api_prefix}/dashboard/overview` - 1个调用位置
- `/${api_prefix}/dashboard/period-comparison` - 1个调用位置
- `/${api_prefix}/dashboard/statistics` - 2个调用位置
- `/${api_prefix}/dashboard/stats` - 1个调用位置
- `/${api_prefix}/enrollment-plans/${id}/quota-usage-history` - 1个调用位置
- `/${api_prefix}/enrollment/ab-test/${testid}/conclude` - 1个调用位置
- `/${api_prefix}/enrollment/ab-test/active` - 1个调用位置
- `/${api_prefix}/enrollment/ab-test/create` - 1个调用位置
- `/${api_prefix}/enrollment/automation-rules` - 2个调用位置
- `/${api_prefix}/enrollment/automation-rules/${ruleid}` - 1个调用位置
- `/${api_prefix}/enrollment/automation-rules/${ruleid}/toggle` - 1个调用位置
- `/${api_prefix}/enrollment/execute-follow-up` - 1个调用位置
- `/${api_prefix}/enrollment/follow-up-queue` - 1个调用位置
- `/${api_prefix}/enrollment/implement-optimization` - 1个调用位置
- `/${api_prefix}/enrollment/implement-strategy` - 1个调用位置
- `/${api_prefix}/enrollment/quotas/allocate` - 1个调用位置
- `/${api_prefix}/report-schedules` - 1个调用位置
- `/${api_prefix}/report-schedules/${id}` - 1个调用位置
- `/${api_prefix}/report-templates` - 2个调用位置
- `/${api_prefix}/report-templates/${id}` - 2个调用位置
- `/${api_prefix}/reports` - 1个调用位置
- `/${api_prefix}/reports/${id}` - 1个调用位置
- `/${api_prefix}/reports/${id}/download` - 1个调用位置
- `/${api_prefix}/reports/generate` - 1个调用位置
- `/${api_prefix}/system-configs/${key}` - 4个调用位置
- `/${api_prefix}/system/campuses` - 4个调用位置
- `/${api_prefix}/system/campuses/${id}` - 4个调用位置
- `/${api_prefix}/system/dict/data/${type}` - 2个调用位置
- `/${api_prefix}/teacher/customer-pool` - 1个调用位置
- `/${api_prefix}/teacher/customer-pool/${id}` - 1个调用位置
- `/${api_prefix}/teacher/customer-pool/search` - 1个调用位置
- `/${api_prefix}/teacher/customer-pool/stats` - 1个调用位置
- `/${apiurl}/ai/unified/stream-chat` - 2个调用位置
- `/${class_endpoints.base}/available` - 2个调用位置
- `/${class_endpoints.get_by_id(classid)}/head-teacher` - 2个调用位置
- `/${class_endpoints.get_by_id(classid)}/schedule` - 2个调用位置
- `/${class_endpoints.get_by_id(id)}/schedule` - 2个调用位置
- `/${class_endpoints.get_by_id(id)}/statistics` - 1个调用位置
- `/${enrollment_plan_endpoints.base}` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/${planid}/export` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/all-statistics` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/analytics` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/export` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/overview` - 1个调用位置
- `/${enrollment_plan_endpoints.base}/statistics` - 1个调用位置
- `/${enrollment_plan_endpoints.delete(id)}` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/assignees` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/cancel` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/classes` - 2个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/complete` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/copy` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/publish` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/statistics` - 1个调用位置
- `/${enrollment_plan_endpoints.get_by_id(id)}/trackings` - 2个调用位置
- `/${enrollment_plan_endpoints.update(id)}` - 1个调用位置
- `/${enrollment_plan_endpoints.update(id)}/status` - 1个调用位置
- `/${enrollment_quota_endpoints.base}/allocate-by-age/${planid}` - 1个调用位置
- `/${enrollment_quota_endpoints.base}/batch` - 2个调用位置
- `/${enrollment_quota_endpoints.base}/batch-adjust` - 1个调用位置
- `/${enrollment_quota_endpoints.base}/by-plan/${planid}` - 1个调用位置
- `/${enrollment_quota_endpoints.base}/export` - 1个调用位置
- `/${enrollment_quota_endpoints.base}/statistics` - 1个调用位置
- `/${enrollment_quota_endpoints.get_by_id(quotaid)}/adjustment-history` - 1个调用位置
- `/${import.meta.env.vite_api_base_url}${ai_endpoints.send_message(conversationid)}` - 1个调用位置
- `/${parent_endpoints.base}/${parentid}/followups` - 2个调用位置
- `/${poster_template_endpoints.base}/${id}` - 2个调用位置
- `/${system_endpoints.logs}/${id}` - 1个调用位置
- `/${system_endpoints.logs}/clear` - 1个调用位置
- `/${system_endpoints.logs}/export` - 1个调用位置
- `/${system_endpoints.users}/${userid}/roles` - 1个调用位置
- `/${this.baseurl}/batch-test` - 1个调用位置
- `/${this.baseurl}/config` - 2个调用位置
- `/${this.baseurl}/export/performance` - 1个调用位置
- `/${this.baseurl}/health` - 1个调用位置
- `/${this.baseurl}/keywords` - 1个调用位置
- `/${this.baseurl}/metrics/realtime` - 1个调用位置
- `/${this.baseurl}/metrics/trends` - 1个调用位置
- `/${this.baseurl}/optimize` - 1个调用位置
- `/${this.baseurl}/query` - 1个调用位置
- `/${this.baseurl}/reset` - 1个调用位置
- `/${this.baseurl}/stats` - 1个调用位置
- `/${this.baseurl}/suggestions` - 1个调用位置
- `/${this.baseurl}/test-direct` - 1个调用位置
- `/${this.baseurl}/test-route` - 1个调用位置
- `/403` - 1个调用位置
- `/404` - 1个调用位置
- `/about` - 1个调用位置
- `/academic` - 3个调用位置
- `/access` - 1个调用位置
- `/activities` - 12个调用位置
- `/activities/${activityid}/publish` - 1个调用位置
- `/activities/${id}` - 4个调用位置
- `/activities/${id}/export` - 1个调用位置
- `/activities/${id}/results` - 1个调用位置
- `/activities/${id}/status` - 2个调用位置
- `/activities/detail/{id}` - 1个调用位置
- `/activities/registration/{id}` - 1个调用位置
- `/activity` - 2个调用位置
- `/activity-center` - 1个调用位置
- `/activity-center/activities` - 2个调用位置
- `/activity-center/activities/${id}` - 3个调用位置
- `/activity-center/activities/${id}/cancel` - 1个调用位置
- `/activity-center/activities/${id}/publish` - 1个调用位置
- `/activity-center/analytics` - 1个调用位置
- `/activity-center/analytics/${id}/report` - 1个调用位置
- `/activity-center/analytics/participation` - 1个调用位置
- `/activity-center/distribution` - 1个调用位置
- `/activity-center/notifications` - 1个调用位置
- `/activity-center/notifications/send` - 1个调用位置
- `/activity-center/notifications/templates` - 2个调用位置
- `/activity-center/notifications/templates/${id}` - 2个调用位置
- `/activity-center/overview` - 1个调用位置
- `/activity-center/registrations` - 1个调用位置
- `/activity-center/registrations/${id}` - 1个调用位置
- `/activity-center/registrations/${id}/approve` - 1个调用位置
- `/activity-center/registrations/batch-approve` - 1个调用位置
- `/activity-center/trend` - 1个调用位置
- `/activity-registration` - 1个调用位置
- `/activity-registration-page/${pageid}` - 1个调用位置
- `/activity-registration-page/${pageid}/stats` - 1个调用位置
- `/activity-registration-page/${pageid}/submit` - 1个调用位置
- `/activity/index` - 1个调用位置
- `/activitymanagement` - 1个调用位置
- `/activityregistration` - 1个调用位置
- `/activitystatistics` - 1个调用位置
- `/activitytemplate` - 1个调用位置
- `/add` - 1个调用位置
- `/admin/image-replacement` - 1个调用位置
- `/advertisement` - 1个调用位置
- `/advertisements` - 1个调用位置
- `/ai` - 2个调用位置
- `/ai-assistant` - 3个调用位置
- `/ai-billing/my-bill` - 1个调用位置
- `/ai-billing/record/${billingid}/status` - 1个调用位置
- `/ai-billing/records/batch-status` - 1个调用位置
- `/ai-billing/statistics` - 1个调用位置
- `/ai-billing/user/${userid}/bill` - 1个调用位置
- `/ai-billing/user/${userid}/export` - 1个调用位置
- `/ai-billing/user/${userid}/trend` - 1个调用位置
- `/ai-center` - 2个调用位置
- `/ai-conversations` - 2个调用位置
- `/ai-conversations/${conversationid}` - 3个调用位置
- `/ai-conversations/${conversationid}/archive` - 1个调用位置
- `/ai-conversations/${conversationid}/duplicate` - 1个调用位置
- `/ai-conversations/${conversationid}/export` - 1个调用位置
- `/ai-conversations/${conversationid}/messages` - 3个调用位置
- `/ai-conversations/${conversationid}/stats` - 1个调用位置
- `/ai-conversations/${conversationid}/unarchive` - 1个调用位置
- `/ai-conversations/bulk-delete` - 1个调用位置
- `/ai-conversations/import` - 1个调用位置
- `/ai-conversations/merge` - 1个调用位置
- `/ai-conversations/search` - 1个调用位置
- `/ai-model-config` - 1个调用位置
- `/ai-query/capabilities` - 1个调用位置
- `/ai-query/chat` - 1个调用位置
- `/ai-query/schema` - 1个调用位置
- `/ai-query/validate-sql` - 1个调用位置
- `/ai-services` - 1个调用位置
- `/ai-shortcuts/${id}` - 2个调用位置
- `/ai-shortcuts/batch/delete` - 1个调用位置
- `/ai-shortcuts/sort` - 1个调用位置
- `/ai/analysis` - 2个调用位置
- `/ai/conversations` - 2个调用位置
- `/ai/conversations/${conversationid}/messages` - 1个调用位置
- `/ai/conversations/${id}` - 1个调用位置
- `/ai/memory/memory/search/last-month/${params.userid}` - 1个调用位置
- `/ai/memory/memory/search/time-range/${params.userid}` - 1个调用位置
- `/ai/models` - 2个调用位置
- `/ai/models/${id}` - 1个调用位置
- `/ai/models/${id}/test` - 1个调用位置
- `/ai/unified/capabilities` - 2个调用位置
- `/ai/unified/direct-chat` - 1个调用位置
- `/ai/unified/status` - 2个调用位置
- `/ai/unified/unified-chat` - 3个调用位置
- `/ai_chat` - 2个调用位置
- `/aiassistant` - 1个调用位置
- `/analysis/{type}` - 1个调用位置
- `/analytics` - 3个调用位置
- `/analytics-center` - 1个调用位置
- `/analytics/activity-analytics` - 1个调用位置
- `/analytics/advanced-analytics` - 1个调用位置
- `/analytics/customer-analytics` - 1个调用位置
- `/analytics/enrollment-analytics` - 1个调用位置
- `/analytics/intelligent-analysis` - 1个调用位置
- `/api/activities/${activityid}/poster/generate` - 1个调用位置
- `/api/activities/${activityid}/poster/preview` - 1个调用位置
- `/api/activities/${activityid}/posters` - 1个调用位置
- `/api/activities/${activityid}/qrcode` - 1个调用位置
- `/api/activities/${activityid}/share` - 1个调用位置
- `/api/activities/${activityid}/share/stats` - 1个调用位置
- `/api/activities/${activityid}/view` - 1个调用位置
- `/api/ai` - 1个调用位置
- `/api/ai/unified/direct-chat-sse` - 1个调用位置
- `/api/assessment-share/rewards` - 1个调用位置
- `/api/assessment-share/scan` - 1个调用位置
- `/api/assessment-share/share` - 1个调用位置
- `/api/assessment-share/stats/${recordid}` - 1个调用位置
- `/api/assessment/answer` - 1个调用位置
- `/api/assessment/growth-trajectory` - 1个调用位置
- `/api/assessment/my-records` - 1个调用位置
- `/api/assessment/questions` - 1个调用位置
- `/api/auth/bind-tenant` - 1个调用位置
- `/api/auth/flexible-login` - 1个调用位置
- `/api/auth/unified-config` - 1个调用位置
- `/api/auth/unified-health` - 1个调用位置
- `/api/auth/unified-login` - 1个调用位置
- `/api/auth/user-tenants` - 1个调用位置
- `/api/centers/activity/overview` - 1个调用位置
- `/api/centers/analytics/overview` - 1个调用位置
- `/api/centers/dashboard/overview` - 1个调用位置
- `/api/centers/inspection/overview` - 1个调用位置
- `/api/centers/media/overview` - 1个调用位置
- `/api/centers/system/overview` - 1个调用位置
- `/api/centers/teacher/overview` - 1个调用位置
- `/api/data` - 2个调用位置
- `/api/data/${id}` - 5个调用位置
- `/api/files` - 1个调用位置
- `/api/files/${id}` - 2个调用位置
- `/api/files/cleanup-temp` - 1个调用位置
- `/api/files/statistics` - 1个调用位置
- `/api/files/storage-info` - 1个调用位置
- `/api/files/upload` - 1个调用位置
- `/api/files/upload-multiple` - 1个调用位置
- `/api/interactive-curriculum/generate-stream` - 1个调用位置
- `/api/parent/share-analytics` - 1个调用位置
- `/api/parent/share-export` - 1个调用位置
- `/api/parent/share-qrcode/${recordid}` - 1个调用位置
- `/api/parent/share-records` - 2个调用位置
- `/api/parent/share-records/${id}` - 3个调用位置
- `/api/parent/share-stats` - 1个调用位置
- `/api/parent/share-to-social` - 1个调用位置
- `/api/permissions` - 2个调用位置
- `/api/permissions/${id}` - 2个调用位置
- `/api/permissions/batch-delete` - 1个调用位置
- `/api/permissions/export` - 1个调用位置
- `/api/permissions/import` - 1个调用位置
- `/api/permissions/search` - 1个调用位置
- `/api/poster-generation/generate` - 1个调用位置
- `/api/roles` - 2个调用位置
- `/api/roles/${id}` - 2个调用位置
- `/api/roles/batch-delete` - 1个调用位置
- `/api/roles/export` - 1个调用位置
- `/api/roles/import` - 1个调用位置
- `/api/roles/search` - 1个调用位置
- `/api/students/by-class` - 1个调用位置
- `/api/teacher/customers/${customerid}/follow` - 1个调用位置
- `/api/teacher/customers/${customerid}/follow-records` - 1个调用位置
- `/api/teacher/customers/${customerid}/status` - 1个调用位置
- `/api/teacher/customers/list` - 1个调用位置
- `/api/teacher/customers/stats` - 1个调用位置
- `/api/teacher/referrals` - 2个调用位置
- `/api/teacher/rewards` - 1个调用位置
- `/api/teacher/rewards/${id}` - 1个调用位置
- `/api/teacher/rewards/${id}/use` - 1个调用位置
- `/api/teacher/rewards/${rewardid}/referral-leads` - 1个调用位置
- `/api/teacher/rewards/referral-stats` - 1个调用位置
- `/api/teacher/rewards/stats` - 1个调用位置
- `/api/users` - 1个调用位置
- `/api/website-automation/analyze` - 1个调用位置
- `/api/website-automation/find-element` - 1个调用位置
- `/api/website-automation/screenshot` - 1个调用位置
- `/api/website-automation/statistics` - 1个调用位置
- `/api/website-automation/tasks` - 2个调用位置
- `/api/website-automation/tasks/${id}` - 2个调用位置
- `/api/website-automation/tasks/${id}/execute` - 1个调用位置
- `/api/website-automation/tasks/${id}/history` - 1个调用位置
- `/api/website-automation/tasks/${id}/stop` - 1个调用位置
- `/api/website-automation/templates` - 2个调用位置
- `/api/website-automation/templates/${id}` - 2个调用位置
- `/api/website-automation/templates/${templateid}/create-task` - 1个调用位置
- `/application` - 1个调用位置
- `/applications` - 2个调用位置
- `/applications/${applicationid}/attachments` - 1个调用位置
- `/applications/${applicationid}/history` - 1个调用位置
- `/applications/${applicationid}/notice` - 1个调用位置
- `/applications/${id}` - 1个调用位置
- `/applications/${id}/review` - 1个调用位置
- `/applications/batch-review` - 1个调用位置
- `/apply/{id}` - 1个调用位置
- `/appointment-management` - 1个调用位置
- `/assessment` - 3个调用位置
- `/assessment-admin/configs` - 2个调用位置
- `/assessment-admin/configs/${id}` - 2个调用位置
- `/assessment-admin/generate-image` - 1个调用位置
- `/assessment-admin/physical-items` - 2个调用位置
- `/assessment-admin/physical-items/${id}` - 2个调用位置
- `/assessment-admin/questions` - 2个调用位置
- `/assessment-admin/questions/${id}` - 2个调用位置
- `/assessment-admin/stats` - 1个调用位置
- `/assessment-center` - 1个调用位置
- `/assessment/start` - 3个调用位置
- `/assignactivity` - 1个调用位置
- `/assigned` - 1个调用位置
- `/attendance` - 2个调用位置
- `/attendance-center` - 1个调用位置
- `/auth-permissions/check-permission` - 1个调用位置
- `/auth-permissions/menu` - 1个调用位置
- `/auth-permissions/permissions` - 1个调用位置
- `/auth-permissions/roles` - 1个调用位置
- `/auto-image/activity` - 1个调用位置
- `/auto-image/batch` - 1个调用位置
- `/auto-image/generate` - 1个调用位置
- `/auto-image/poster` - 1个调用位置
- `/auto-image/status` - 1个调用位置
- `/auto-image/template` - 1个调用位置
- `/autosave/{id}` - 1个调用位置
- `/backup` - 2个调用位置
- `/backup/backup-management` - 1个调用位置
- `/batch-import/execute` - 1个调用位置
- `/batch-import/preview` - 1个调用位置
- `/batch-import/template/${entitytype}` - 1个调用位置
- `/business-center` - 1个调用位置
- `/business-center/dashboard` - 1个调用位置
- `/business-center/enrollment-progress` - 1个调用位置
- `/business-center/overview` - 1个调用位置
- `/business-center/statistics` - 1个调用位置
- `/business-center/teaching-integration` - 1个调用位置
- `/business-center/timeline` - 1个调用位置
- `/business-center/ui-config` - 1个调用位置
- `/call-center` - 1个调用位置
- `/call-center/ai/transcribe/${callid}/start` - 1个调用位置
- `/call-center/ai/transcribe/${callid}/stop` - 1个调用位置
- `/call-center/call/${callid}/dtmf` - 1个调用位置
- `/call-center/call/hangup` - 1个调用位置
- `/call-center/contacts/${id}` - 2个调用位置
- `/call-center/extensions/${id}/reset` - 1个调用位置
- `/call-center/extensions/${id}/status` - 1个调用位置
- `/call-center/recordings/${id}` - 1个调用位置
- `/call-center/recordings/${id}/transcribe` - 1个调用位置
- `/call-center/recordings/${id}/transcript` - 1个调用位置
- `/campaigns` - 1个调用位置
- `/categories` - 1个调用位置
- `/centers` - 1个调用位置
- `/centers/activity` - 1个调用位置
- `/centers/assessment` - 1个调用位置
- `/centers/attendance` - 1个调用位置
- `/centers/business` - 1个调用位置
- `/centers/call-center` - 1个调用位置
- `/centers/customer` - 1个调用位置
- `/centers/document-center` - 1个调用位置
- `/centers/document-collaboration` - 1个调用位置
- `/centers/document-editor` - 1个调用位置
- `/centers/document-instances` - 1个调用位置
- `/centers/document-statistics` - 1个调用位置
- `/centers/document-template` - 1个调用位置
- `/centers/enrollment` - 1个调用位置
- `/centers/finance` - 1个调用位置
- `/centers/index` - 1个调用位置
- `/centers/inspection` - 1个调用位置
- `/centers/media` - 1个调用位置
- `/centers/personnel` - 1个调用位置
- `/centers/task` - 1个调用位置
- `/centers/task/form` - 1个调用位置
- `/centers/teaching` - 1个调用位置
- `/channels` - 1个调用位置
- `/charts/{type}` - 1个调用位置
- `/chat` - 4个调用位置
- `/chat/conversations` - 2个调用位置
- `/chat/conversations/${conversationid}/messages` - 1个调用位置
- `/chat/conversations/${conversationid}/read` - 1个调用位置
- `/chat/conversations/${id}` - 2个调用位置
- `/chat/messages` - 1个调用位置
- `/chat/messages/${messageid}/read` - 1个调用位置
- `/chat/unread-count` - 1个调用位置
- `/chat/upload` - 1个调用位置
- `/child-growth` - 4个调用位置
- `/childgrowth` - 1个调用位置
- `/children` - 4个调用位置
- `/children/add` - 1个调用位置
- `/children/edit/{id}` - 1个调用位置
- `/children/followup` - 1个调用位置
- `/children/growth/{id}` - 2个调用位置
- `/class` - 1个调用位置
- `/class-contacts` - 1个调用位置
- `/class/analytics/class-analytics` - 1个调用位置
- `/class/detail/{id}` - 1个调用位置
- `/class/optimization/class-optimization` - 1个调用位置
- `/class/smart-management/{id}` - 1个调用位置
- `/class/statistics` - 1个调用位置
- `/class/students/id` - 1个调用位置
- `/class/teachers/id` - 1个调用位置
- `/classes` - 2个调用位置
- `/classes/${id}` - 2个调用位置
- `/collaboration` - 1个调用位置
- `/comments/{id}` - 1个调用位置
- `/communication` - 2个调用位置
- `/communication/smart-hub` - 1个调用位置
- `/completed` - 1个调用位置
- `/compliance` - 1个调用位置
- `/configuration` - 1个调用位置
- `/contact` - 1个调用位置
- `/conversation/nlp-analytics` - 1个调用位置
- `/conversions` - 1个调用位置
- `/course/{id}` - 2个调用位置
- `/create` - 8个调用位置
- `/create/{taskid}` - 1个调用位置
- `/creative-curriculum` - 2个调用位置
- `/curriculum` - 1个调用位置
- `/customer` - 1个调用位置
- `/customer-follow-enhanced/customers/${customerid}/timeline` - 1个调用位置
- `/customer-follow-enhanced/records` - 1个调用位置
- `/customer-follow-enhanced/records/${followrecordid}/ai-suggestions` - 1个调用位置
- `/customer-follow-enhanced/records/${followrecordid}/complete` - 1个调用位置
- `/customer-follow-enhanced/records/${followrecordid}/refresh-ai` - 1个调用位置
- `/customer-follow-enhanced/records/${followrecordid}/skip` - 1个调用位置
- `/customer-follow-enhanced/records/${id}` - 1个调用位置
- `/customer-follow-enhanced/stages` - 1个调用位置
- `/customer-pool` - 3个调用位置
- `/customer-pool-center` - 1个调用位置
- `/customer-tracking` - 3个调用位置
- `/customers` - 1个调用位置
- `/customers/{id}` - 2个调用位置
- `/dashboard` - 9个调用位置
- `/dashboard/activities` - 1个调用位置
- `/dashboard/analytics` - 1个调用位置
- `/dashboard/analytics/enrollment-trends` - 1个调用位置
- `/dashboard/analytics/financial-analysis` - 1个调用位置
- `/dashboard/analytics/student-performance` - 1个调用位置
- `/dashboard/analytics/teacher-effectiveness` - 1个调用位置
- `/dashboard/campus-overview` - 1个调用位置
- `/dashboard/class-list` - 1个调用位置
- `/dashboard/classlist` - 1个调用位置
- `/dashboard/data-statistics` - 1个调用位置
- `/dashboard/important-notices` - 1个调用位置
- `/dashboard/notification-center` - 1个调用位置
- `/dashboard/performance` - 1个调用位置
- `/dashboard/performance/kpi-dashboard` - 1个调用位置
- `/dashboard/performance/performance-overview` - 1个调用位置
- `/dashboard/principal/stats` - 1个调用位置
- `/dashboard/schedule` - 1个调用位置
- `/dashboard/schedule-weekly-view` - 1个调用位置
- `/dashboard/schedule/calendar` - 1个调用位置
- `/dashboard/schedule/todo` - 1个调用位置
- `/data-import/check-permission` - 1个调用位置
- `/data-import/execute` - 1个调用位置
- `/data-import/history` - 1个调用位置
- `/data-import/mapping` - 1个调用位置
- `/data-import/parse` - 1个调用位置
- `/data-import/preview` - 1个调用位置
- `/data-import/schema/${type}` - 1个调用位置
- `/data-import/supported-types` - 1个调用位置
- `/debug/api-test` - 1个调用位置
- `/debug/direct-test` - 1个调用位置
- `/debug/minimal-test` - 1个调用位置
- `/debug/simple-test` - 1个调用位置
- `/decision-support/intelligent-dashboard` - 1个调用位置
- `/deep-learning/prediction-engine` - 1个调用位置
- `/demo` - 2个调用位置
- `/demo/circuit` - 1个调用位置
- `/demo/enhanced` - 1个调用位置
- `/demo/expert-team` - 1个调用位置
- `/demo/kindergarten-ai` - 1个调用位置
- `/demo/markdown` - 1个调用位置
- `/demo/quick-query` - 1个调用位置
- `/demo/smart-expert` - 1个调用位置
- `/detail/{id}` - 10个调用位置
- `/development` - 3个调用位置
- `/development-report` - 1个调用位置
- `/development/teacher-development` - 1个调用位置
- `/document-center` - 1个调用位置
- `/document-collaboration` - 1个调用位置
- `/document-editor` - 1个调用位置
- `/document-instance-list` - 1个调用位置
- `/document-statistics` - 1个调用位置
- `/document-template-center` - 1个调用位置
- `/doing/{recordid}` - 3个调用位置
- `/download/{id}` - 1个调用位置
- `/edit/{id}` - 7个调用位置
- `/employees` - 1个调用位置
- `/enrollment` - 5个调用位置
- `/enrollment-ai/ai-status` - 1个调用位置
- `/enrollment-ai/plan/${planid}/ai-history` - 1个调用位置
- `/enrollment-ai/plan/${planid}/batch-analysis` - 1个调用位置
- `/enrollment-ai/plan/${planid}/evaluation` - 1个调用位置
- `/enrollment-ai/plan/${planid}/export-ai-report` - 1个调用位置
- `/enrollment-ai/plan/${planid}/forecast` - 1个调用位置
- `/enrollment-ai/plan/${planid}/optimization` - 1个调用位置
- `/enrollment-ai/plan/${planid}/simulation` - 1个调用位置
- `/enrollment-ai/plan/${planid}/smart-planning` - 1个调用位置
- `/enrollment-ai/plan/${planid}/strategy` - 1个调用位置
- `/enrollment-ai/trends` - 1个调用位置
- `/enrollment-center` - 2个调用位置
- `/enrollment-finance/batch-generate-semester-bills` - 1个调用位置
- `/enrollment-finance/config` - 1个调用位置
- `/enrollment-finance/confirm-payment-enroll` - 1个调用位置
- `/enrollment-finance/enrollment-approved/${enrollmentid}` - 1个调用位置
- `/enrollment-finance/fee-package-templates` - 2个调用位置
- `/enrollment-finance/fee-package-templates/${id}` - 1个调用位置
- `/enrollment-finance/generate-bill` - 1个调用位置
- `/enrollment-finance/linkages` - 1个调用位置
- `/enrollment-finance/process/${enrollmentid}` - 1个调用位置
- `/enrollment-finance/send-payment-reminder` - 1个调用位置
- `/enrollment-finance/stats` - 1个调用位置
- `/enrollment-plan` - 1个调用位置
- `/enrollment/applications` - 1个调用位置
- `/enrollment/applications/${applicationid}/reviews` - 1个调用位置
- `/enrollment/applications/${id}` - 2个调用位置
- `/enrollment/applications/${id}/review` - 1个调用位置
- `/enrollment/applications/batch-review` - 1个调用位置
- `/enrollment/applications/upload` - 1个调用位置
- `/enrollment/interviewers` - 1个调用位置
- `/enrollment/interviewers/${interviewerid}/availability` - 1个调用位置
- `/enrollment/interviews` - 2个调用位置
- `/enrollment/interviews/${id}` - 1个调用位置
- `/enrollment/interviews/${interviewid}/score` - 1个调用位置
- `/enrollment/interviews/scores` - 1个调用位置
- `/enrollment/list` - 1个调用位置
- `/enrollment/notifications/send` - 1个调用位置
- `/enrollment/reviews` - 1个调用位置
- `/enrollment/reviews/assign` - 1个调用位置
- `/enrollment/reviews/batch` - 1个调用位置
- `/enrollment/reviews/queue` - 1个调用位置
- `/enrollment/reviews/statistics` - 1个调用位置
- `/error` - 1个调用位置
- `/evaluation/activity-evaluation` - 1个调用位置
- `/evaluation/plan-evaluation` - 1个调用位置
- `/evaluation/teacher-evaluation` - 1个调用位置
- `/examples/async-loading-demo` - 1个调用位置
- `/execute` - 1个调用位置
- `/expense` - 1个调用位置
- `/experience/schedule` - 1个调用位置
- `/expert-consultation` - 2个调用位置
- `/expertconsultationpage` - 2个调用位置
- `/favorites` - 1个调用位置
- `/feedback` - 3个调用位置
- `/feedback/parent-feedback` - 1个调用位置
- `/field-templates` - 2个调用位置
- `/field-templates/${id}` - 3个调用位置
- `/field-templates/${id}/apply` - 1个调用位置
- `/field-templates/popular/${entitytype}` - 1个调用位置
- `/field-templates/recent` - 1个调用位置
- `/fill/{id}` - 1个调用位置
- `/finance` - 1个调用位置
- `/finance-center` - 1个调用位置
- `/finance/analytics` - 1个调用位置
- `/finance/analytics/export` - 1个调用位置
- `/finance/budget/adjustments` - 2个调用位置
- `/finance/budget/adjustments/${adjustmentid}/approve` - 1个调用位置
- `/finance/budget/items` - 2个调用位置
- `/finance/budget/items/${budgetid}` - 1个调用位置
- `/finance/budget/overview` - 1个调用位置
- `/finance/expense/records` - 2个调用位置
- `/finance/expense/records/${expenseid}/approve` - 1个调用位置
- `/finance/expense/records/${expenseid}/pay` - 1个调用位置
- `/finance/expense/statistics` - 1个调用位置
- `/finance/expense/suppliers` - 1个调用位置
- `/finance/fee-items` - 1个调用位置
- `/finance/fee-management` - 1个调用位置
- `/finance/forecast` - 1个调用位置
- `/finance/forecast/configs` - 2个调用位置
- `/finance/forecast/configs/${configid}` - 2个调用位置
- `/finance/forecast/generate` - 1个调用位置
- `/finance/forecast/history` - 1个调用位置
- `/finance/forecast/reports` - 1个调用位置
- `/finance/forecast/reports/generate` - 1个调用位置
- `/finance/overview` - 1个调用位置
- `/finance/payment-bills` - 2个调用位置
- `/finance/payment-bills/${billid}/pay` - 1个调用位置
- `/finance/payment-records` - 1个调用位置
- `/finance/payment/bank-transactions` - 1个调用位置
- `/finance/payment/customer-credits` - 1个调用位置
- `/finance/payment/reconcile-bank` - 1个调用位置
- `/finance/payment/records` - 2个调用位置
- `/finance/payment/records/${paymentid}/confirm` - 1个调用位置
- `/finance/payment/statistics` - 1个调用位置
- `/finance/refund-applications` - 1个调用位置
- `/finance/refund-applications/${id}` - 1个调用位置
- `/finance/reports` - 2个调用位置
- `/finance/reports/${reportid}` - 1个调用位置
- `/finance/reports/${reportid}/copy` - 1个调用位置
- `/finance/reports/${reportid}/download` - 1个调用位置
- `/finance/reports/${reportid}/export` - 1个调用位置
- `/finance/reports/${reportid}/regenerate` - 1个调用位置
- `/finance/reports/all` - 1个调用位置
- `/finance/reports/custom` - 1个调用位置
- `/finance/reports/generate` - 1个调用位置
- `/finance/reports/shares/${shareid}` - 1个调用位置
- `/finance/send-reminder` - 1个调用位置
- `/finance/today-payments` - 1个调用位置
- `/follow-up` - 1个调用位置
- `/followup` - 1个调用位置
- `/forecast/enrollment-forecast` - 1个调用位置
- `/funnel` - 1个调用位置
- `/gallery` - 1个调用位置
- `/games` - 3个调用位置
- `/games/${gamekey}` - 1个调用位置
- `/games/${gamekey}/leaderboard` - 1个调用位置
- `/games/${gamekey}/levels` - 1个调用位置
- `/games/achievements` - 2个调用位置
- `/games/list` - 1个调用位置
- `/games/play/animal-observer` - 2个调用位置
- `/games/play/color-sorting` - 2个调用位置
- `/games/play/dinosaur-memory` - 2个调用位置
- `/games/play/dollhouse-tidy` - 2个调用位置
- `/games/play/fruit-sequence` - 2个调用位置
- `/games/play/princess-garden` - 2个调用位置
- `/games/play/princess-memory` - 2个调用位置
- `/games/play/robot-factory` - 2个调用位置
- `/games/play/space-treasure` - 2个调用位置
- `/games/record` - 1个调用位置
- `/games/records` - 2个调用位置
- `/games/settings/user` - 2个调用位置
- `/games/statistics/user` - 1个调用位置
- `/groups/${groupid}/add-kindergarten` - 1个调用位置
- `/groups/${groupid}/remove-kindergarten` - 1个调用位置
- `/groups/${groupid}/users/${userid}` - 1个调用位置
- `/groups/${id}` - 1个调用位置
- `/groups/${id}/activities` - 1个调用位置
- `/groups/${id}/enrollment` - 1个调用位置
- `/groups/upgrade` - 1个调用位置
- `/growth-trajectory` - 3个调用位置
- `/health` - 1个调用位置
- `/help` - 1个调用位置
- `/history/{id}` - 1个调用位置
- `/index` - 28个调用位置
- `/inspection-center` - 1个调用位置
- `/inspection/plans` - 2个调用位置
- `/inspection/plans/${id}` - 3个调用位置
- `/inspection/plans/${planid}/tasks` - 2个调用位置
- `/inspection/plans/${planid}/tasks/${taskid}` - 2个调用位置
- `/inspection/plans/generate-yearly` - 1个调用位置
- `/inspection/plans/timeline` - 1个调用位置
- `/inspection/types` - 2个调用位置
- `/inspection/types/${id}` - 3个调用位置
- `/inspection/types/active` - 1个调用位置
- `/inspection/types/batch-delete` - 1个调用位置
- `/interactive` - 2个调用位置
- `/interview` - 1个调用位置
- `/interviews` - 1个调用位置
- `/kindergarten-rewards` - 3个调用位置
- `/kindergartens/${id}` - 1个调用位置
- `/kindergartens/${id}/classes` - 1个调用位置
- `/kindergartens/${id}/statistics` - 1个调用位置
- `/kindergartens/${id}/students` - 1个调用位置
- `/kindergartens/${id}/teachers` - 1个调用位置
- `/library` - 2个调用位置
- `/login` - 2个调用位置
- `/login-demo` - 1个调用位置
- `/logs` - 2个调用位置
- `/logs/system-logs` - 1个调用位置
- `/logs/{id}` - 1个调用位置
- `/machine-learning/model-training` - 1个调用位置
- `/maintenance` - 1个调用位置
- `/maintenance/maintenance-scheduler` - 1个调用位置
- `/management/plan-management` - 1个调用位置
- `/marketing` - 1个调用位置
- `/marketing-analysis` - 1个调用位置
- `/marketing-center` - 1个调用位置
- `/marketing/analytics` - 1个调用位置
- `/marketing/analytics/export` - 1个调用位置
- `/marketing/channels` - 2个调用位置
- `/marketing/channels/${id}` - 1个调用位置
- `/marketing/referrals/${code}/stats` - 1个调用位置
- `/marketing/referrals/${code}/track` - 1个调用位置
- `/marketing/referrals/generate` - 1个调用位置
- `/marketing/referrals/generate-poster` - 1个调用位置
- `/marketing/referrals/my-codes` - 1个调用位置
- `/marketing/referrals/poster-templates` - 1个调用位置
- `/marketing/templates` - 2个调用位置
- `/marketing/templates/${id}` - 2个调用位置
- `/marketing/templates/${id}/apply` - 1个调用位置
- `/marketing/templates/${id}/archive` - 1个调用位置
- `/marketing/templates/${id}/duplicate` - 1个调用位置
- `/marketing/templates/${id}/export` - 1个调用位置
- `/marketing/templates/${id}/favorites` - 1个调用位置
- `/marketing/templates/${id}/publish` - 1个调用位置
- `/marketing/templates/${id}/reviews` - 2个调用位置
- `/marketing/templates/${id}/reviews/${reviewid}` - 1个调用位置
- `/marketing/templates/${id}/usage` - 1个调用位置
- `/marketing/templates/categories` - 1个调用位置
- `/marketing/templates/features` - 1个调用位置
- `/marketing/templates/import` - 1个调用位置
- `/marketing/templates/my-favorites` - 1个调用位置
- `/marketing/templates/my-templates` - 1个调用位置
- `/marketing/templates/recommendations` - 1个调用位置
- `/marketing/templates/search` - 1个调用位置
- `/marketing/templates/stats` - 1个调用位置
- `/marketing/templates/tags` - 1个调用位置
- `/marketing/templates/upload-preview` - 1个调用位置
- `/marketing/templates/upload-thumbnail` - 1个调用位置
- `/media-center` - 2个调用位置
- `/media-center/content/${id}` - 1个调用位置
- `/media-upload` - 2个调用位置
- `/memory` - 1个调用位置
- `/messages` - 1个调用位置
- `/mobile` - 4个调用位置
- `/mobile/activity-detail/{id}` - 1个调用位置
- `/mobile/activity-plan/{id}` - 1个调用位置
- `/mobile/activity/activity-analytics` - 1个调用位置
- `/mobile/activity/activity-approval` - 1个调用位置
- `/mobile/activity/activity-calendar` - 1个调用位置
- `/mobile/activity/activity-certificate` - 1个调用位置
- `/mobile/activity/activity-checkin` - 1个调用位置
- `/mobile/activity/activity-comments` - 1个调用位置
- `/mobile/activity/activity-create` - 1个调用位置
- `/mobile/activity/activity-detail/{id}` - 1个调用位置
- `/mobile/activity/activity-edit/{id}` - 1个调用位置
- `/mobile/activity/activity-evaluation` - 1个调用位置
- `/mobile/activity/activity-feedback` - 1个调用位置
- `/mobile/activity/activity-index` - 1个调用位置
- `/mobile/activity/activity-list` - 1个调用位置
- `/mobile/activity/activity-participants` - 1个调用位置
- `/mobile/activity/activity-photos` - 1个调用位置
- `/mobile/activity/activity-publish` - 1个调用位置
- `/mobile/activity/activity-register` - 1个调用位置
- `/mobile/activity/activity-registrations` - 1个调用位置
- `/mobile/activity/activity-reports` - 1个调用位置
- `/mobile/activity/activity-search` - 1个调用位置
- `/mobile/activity/activity-statistics` - 1个调用位置
- `/mobile/activity/activity-tags` - 1个调用位置
- `/mobile/activity/activity-template` - 1个调用位置
- `/mobile/ai-chat` - 1个调用位置
- `/mobile/ai/ai-3d` - 1个调用位置
- `/mobile/ai/ai-analytics` - 1个调用位置
- `/mobile/ai/ai-assistant` - 1个调用位置
- `/mobile/ai/ai-automation` - 1个调用位置
- `/mobile/ai/ai-chat` - 1个调用位置
- `/mobile/ai/ai-deep-learning` - 1个调用位置
- `/mobile/ai/ai-document` - 1个调用位置
- `/mobile/ai/ai-evaluation` - 1个调用位置
- `/mobile/ai/ai-expert` - 1个调用位置
- `/mobile/ai/ai-index` - 1个调用位置
- `/mobile/ai/ai-intelligent` - 1个调用位置
- `/mobile/ai/ai-memory` - 1个调用位置
- `/mobile/ai/ai-models` - 1个调用位置
- `/mobile/ai/ai-monitoring` - 1个调用位置
- `/mobile/ai/ai-nlp` - 1个调用位置
- `/mobile/ai/ai-optimizer` - 1个调用位置
- `/mobile/ai/ai-planner` - 1个调用位置
- `/mobile/ai/ai-predictions` - 1个调用位置
- `/mobile/ai/ai-query` - 1个调用位置
- `/mobile/ai/ai-settings` - 1个调用位置
- `/mobile/ai/ai-tools` - 1个调用位置
- `/mobile/ai/ai-training` - 1个调用位置
- `/mobile/ai/ai-visualization` - 1个调用位置
- `/mobile/ai/ai-website-automation` - 1个调用位置
- `/mobile/ai/ai-website-elements` - 1个调用位置
- `/mobile/ai/ai-website-screenshots` - 1个调用位置
- `/mobile/ai/ai-website-tasks` - 1个调用位置
- `/mobile/centers` - 3个调用位置
- `/mobile/centers/activity-center` - 2个调用位置
- `/mobile/centers/ai-billing-center` - 2个调用位置
- `/mobile/centers/ai-center` - 2个调用位置
- `/mobile/centers/analytics-center` - 2个调用位置
- `/mobile/centers/assessment-center` - 2个调用位置
- `/mobile/centers/attendance-center` - 2个调用位置
- `/mobile/centers/business-center` - 2个调用位置
- `/mobile/centers/call-center` - 2个调用位置
- `/mobile/centers/customer-pool-center` - 2个调用位置
- `/mobile/centers/document-center` - 2个调用位置
- `/mobile/centers/document-collaboration` - 1个调用位置
- `/mobile/centers/document-instance-list` - 1个调用位置
- `/mobile/centers/document-template-center/use/{id}` - 1个调用位置
- `/mobile/centers/enrollment-center` - 2个调用位置
- `/mobile/centers/finance-center` - 2个调用位置
- `/mobile/centers/inspection-center` - 2个调用位置
- `/mobile/centers/marketing-center` - 2个调用位置
- `/mobile/centers/media-center` - 1个调用位置
- `/mobile/centers/my-task-center` - 2个调用位置
- `/mobile/centers/notification-center` - 2个调用位置
- `/mobile/centers/permission-center` - 2个调用位置
- `/mobile/centers/personnel-center` - 1个调用位置
- `/mobile/centers/photo-album-center` - 2个调用位置
- `/mobile/centers/principal-center` - 2个调用位置
- `/mobile/centers/schedule-center` - 2个调用位置
- `/mobile/centers/script-center` - 1个调用位置
- `/mobile/centers/script-templates` - 1个调用位置
- `/mobile/centers/settings-center` - 2个调用位置
- `/mobile/centers/student-center` - 2个调用位置
- `/mobile/centers/system-center` - 2个调用位置
- `/mobile/centers/system-log-center` - 1个调用位置
- `/mobile/centers/task-center` - 1个调用位置
- `/mobile/centers/task-form` - 1个调用位置
- `/mobile/centers/teacher-center` - 1个调用位置
- `/mobile/centers/teaching-center` - 2个调用位置
- `/mobile/centers/template-detail/{id}` - 1个调用位置
- `/mobile/centers/usage-center` - 1个调用位置
- `/mobile/centers/user-center` - 2个调用位置
- `/mobile/centers/{center}` - 1个调用位置
- `/mobile/document-instance/{id}` - 1个调用位置
- `/mobile/document-instance/{id}/edit` - 1个调用位置
- `/mobile/enrollment` - 1个调用位置
- `/mobile/enrollment/create` - 1个调用位置
- `/mobile/enrollment/detail` - 1个调用位置
- `/mobile/enrollment/enrollment-application` - 1个调用位置
- `/mobile/enrollment/enrollment-automation` - 1个调用位置
- `/mobile/enrollment/enrollment-funnel` - 1个调用位置
- `/mobile/enrollment/enrollment-interview` - 1个调用位置
- `/mobile/enrollment/enrollment-list` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-analytics` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-create` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-detail/{id}` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-edit/{id}` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-evaluation` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-forecast` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-index` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-list` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-management` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-optimization` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-quota` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-simulation` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-smart-planning` - 1个调用位置
- `/mobile/enrollment/enrollment-plan-statistics` - 1个调用位置
- `/mobile/enrollment/enrollment-review` - 1个调用位置
- `/mobile/enrollment/enrollment-strategy` - 1个调用位置
- `/mobile/finance/approval` - 1个调用位置
- `/mobile/finance/approval/batch-settings` - 1个调用位置
- `/mobile/finance/approval/detail/{id}` - 1个调用位置
- `/mobile/finance/approval/expense/create` - 1个调用位置
- `/mobile/finance/approval/my-applications` - 1个调用位置
- `/mobile/finance/approval/process-config` - 1个调用位置
- `/mobile/finance/approval/statistics` - 1个调用位置
- `/mobile/finance/approval/templates` - 1个调用位置
- `/mobile/finance/audit` - 1个调用位置
- `/mobile/finance/audit/finding/create` - 1个调用位置
- `/mobile/finance/audit/finding/{id}` - 1个调用位置
- `/mobile/finance/audit/finding/{id}/evidence` - 1个调用位置
- `/mobile/finance/audit/finding/{id}/rectification` - 1个调用位置
- `/mobile/finance/audit/plan/create` - 1个调用位置
- `/mobile/finance/audit/plan/{id}` - 1个调用位置
- `/mobile/finance/audit/plan/{id}/edit` - 1个调用位置
- `/mobile/finance/audit/project/create` - 1个调用位置
- `/mobile/finance/audit/project/{id}` - 1个调用位置
- `/mobile/finance/audit/project/{id}/continue` - 1个调用位置
- `/mobile/finance/audit/project/{id}/work-papers` - 1个调用位置
- `/mobile/finance/audit/report/generate` - 1个调用位置
- `/mobile/finance/audit/report/{id}` - 1个调用位置
- `/mobile/finance/audit/report/{id}/share` - 1个调用位置
- `/mobile/finance/audit/risk-assessment` - 1个调用位置
- `/mobile/finance/finance-analytics` - 1个调用位置
- `/mobile/finance/finance-analytics/breakeven-analysis` - 1个调用位置
- `/mobile/finance/finance-analytics/customer-detail/{customerid}` - 1个调用位置
- `/mobile/finance/finance-analytics/department-analysis` - 1个调用位置
- `/mobile/finance/finance-analytics/project-detail/{projectid}` - 1个调用位置
- `/mobile/finance/finance-analytics/ratio-detail` - 1个调用位置
- `/mobile/finance/finance-analytics/trend-analysis` - 1个调用位置
- `/mobile/finance/finance-billing` - 1个调用位置
- `/mobile/finance/finance-budget` - 1个调用位置
- `/mobile/finance/finance-expense` - 1个调用位置
- `/mobile/finance/finance-export` - 1个调用位置
- `/mobile/finance/finance-forecast` - 1个调用位置
- `/mobile/finance/finance-forecast/cashflow-analysis` - 1个调用位置
- `/mobile/finance/finance-forecast/config` - 1个调用位置
- `/mobile/finance/finance-forecast/config-detail/{configid}` - 1个调用位置
- `/mobile/finance/finance-forecast/config-edit/{configid}` - 1个调用位置
- `/mobile/finance/finance-forecast/history-detail/{historyid}` - 1个调用位置
- `/mobile/finance/finance-forecast/model-config` - 1个调用位置
- `/mobile/finance/finance-forecast/report` - 1个调用位置
- `/mobile/finance/finance-forecast/scenario-comparison` - 1个调用位置
- `/mobile/finance/finance-index` - 1个调用位置
- `/mobile/finance/finance-integration` - 1个调用位置
- `/mobile/finance/finance-invoice` - 1个调用位置
- `/mobile/finance/finance-payment` - 1个调用位置
- `/mobile/finance/finance-reports` - 1个调用位置
- `/mobile/finance/finance-reports/edit` - 1个调用位置
- `/mobile/finance/finance-reports/generate` - 1个调用位置
- `/mobile/finance/finance-reports/preview` - 1个调用位置
- `/mobile/finance/finance-reports/schedule` - 1个调用位置
- `/mobile/finance/finance-reports/view` - 1个调用位置
- `/mobile/finance/finance-settings` - 1个调用位置
- `/mobile/finance/tax` - 1个调用位置
- `/mobile/finance/tax/calculator` - 1个调用位置
- `/mobile/finance/tax/calendar` - 1个调用位置
- `/mobile/finance/tax/declaration/batch` - 1个调用位置
- `/mobile/finance/tax/declaration/create` - 1个调用位置
- `/mobile/finance/tax/declaration/{id}` - 1个调用位置
- `/mobile/finance/tax/declare/{id}` - 1个调用位置
- `/mobile/finance/tax/invoice/import` - 1个调用位置
- `/mobile/finance/tax/invoice/scan` - 1个调用位置
- `/mobile/finance/tax/invoice/verify-batch` - 1个调用位置
- `/mobile/finance/tax/invoice/{id}` - 1个调用位置
- `/mobile/finance/tax/planning/create` - 1个调用位置
- `/mobile/finance/tax/planning/{id}` - 1个调用位置
- `/mobile/finance/tax/planning/{id}/analysis` - 1个调用位置
- `/mobile/finance/tax/rate-settings` - 1个调用位置
- `/mobile/finance/tax/type/create` - 1个调用位置
- `/mobile/finance/tax/type/{id}` - 1个调用位置
- `/mobile/finance/tax/type/{id}/edit` - 1个调用位置
- `/mobile/login` - 1个调用位置
- `/mobile/marketing` - 1个调用位置
- `/mobile/marketing/marketing-analytics` - 1个调用位置
- `/mobile/marketing/marketing-analytics/behavior-analysis` - 1个调用位置
- `/mobile/marketing/marketing-analytics/comparison-analysis` - 1个调用位置
- `/mobile/marketing/marketing-analytics/content-analysis` - 1个调用位置
- `/mobile/marketing/marketing-analytics/custom-reports` - 1个调用位置
- `/mobile/marketing/marketing-analytics/dimension-analysis` - 1个调用位置
- `/mobile/marketing/marketing-analytics/heatmap-analysis` - 1个调用位置
- `/mobile/marketing/marketing-analytics/prediction-analysis` - 1个调用位置
- `/mobile/marketing/marketing-automation` - 1个调用位置
- `/mobile/marketing/marketing-automation/abtest/create` - 1个调用位置
- `/mobile/marketing/marketing-automation/abtest/{id}` - 1个调用位置
- `/mobile/marketing/marketing-automation/journey/create` - 1个调用位置
- `/mobile/marketing/marketing-automation/journey/{id}` - 1个调用位置
- `/mobile/marketing/marketing-automation/outreach/create` - 1个调用位置
- `/mobile/marketing/marketing-automation/outreach/{id}` - 1个调用位置
- `/mobile/marketing/marketing-automation/reports` - 1个调用位置
- `/mobile/marketing/marketing-automation/rules/create` - 1个调用位置
- `/mobile/marketing/marketing-automation/rules/{id}` - 1个调用位置
- `/mobile/marketing/marketing-budget` - 1个调用位置
- `/mobile/marketing/marketing-budget/adjust` - 1个调用位置
- `/mobile/marketing/marketing-budget/analytics` - 1个调用位置
- `/mobile/marketing/marketing-budget/create` - 1个调用位置
- `/mobile/marketing/marketing-budget/execution` - 1个调用位置
- `/mobile/marketing/marketing-budget/multi-dimension` - 1个调用位置
- `/mobile/marketing/marketing-budget/optimization` - 1个调用位置
- `/mobile/marketing/marketing-budget/permission` - 1个调用位置
- `/mobile/marketing/marketing-budget/reports` - 1个调用位置
- `/mobile/marketing/marketing-budget/template` - 1个调用位置
- `/mobile/marketing/marketing-budget/version` - 1个调用位置
- `/mobile/marketing/marketing-campaign` - 1个调用位置
- `/mobile/marketing/marketing-campaign/{id}` - 1个调用位置
- `/mobile/marketing/marketing-campaign/{id}/edit` - 1个调用位置
- `/mobile/marketing/marketing-channel` - 1个调用位置
- `/mobile/marketing/marketing-channel/analytics` - 1个调用位置
- `/mobile/marketing/marketing-channel/budget` - 1个调用位置
- `/mobile/marketing/marketing-channel/comparison` - 1个调用位置
- `/mobile/marketing/marketing-channel/config` - 1个调用位置
- `/mobile/marketing/marketing-channel/create` - 1个调用位置
- `/mobile/marketing/marketing-channel/detail/{id}` - 1个调用位置
- `/mobile/marketing/marketing-channel/guide` - 1个调用位置
- `/mobile/marketing/marketing-channel/import` - 1个调用位置
- `/mobile/marketing/marketing-channel/integration` - 1个调用位置
- `/mobile/marketing/marketing-channel/optimization` - 1个调用位置
- `/mobile/marketing/marketing-channel/performance` - 1个调用位置
- `/mobile/marketing/marketing-channel/tracking` - 1个调用位置
- `/mobile/marketing/marketing-channel/types` - 1个调用位置
- `/mobile/marketing/marketing-competitor` - 1个调用位置
- `/mobile/marketing/marketing-competitor/alerts` - 1个调用位置
- `/mobile/marketing/marketing-competitor/comparison` - 1个调用位置
- `/mobile/marketing/marketing-competitor/create` - 1个调用位置
- `/mobile/marketing/marketing-competitor/swot` - 1个调用位置
- `/mobile/marketing/marketing-competitor/{id}` - 1个调用位置
- `/mobile/marketing/marketing-competitor/{id}/edit` - 1个调用位置
- `/mobile/marketing/marketing-content` - 1个调用位置
- `/mobile/marketing/marketing-content/analytics` - 1个调用位置
- `/mobile/marketing/marketing-content/approval` - 1个调用位置
- `/mobile/marketing/marketing-content/create` - 1个调用位置
- `/mobile/marketing/marketing-content/detail/{id}` - 1个调用位置
- `/mobile/marketing/marketing-content/edit/{id}` - 1个调用位置
- `/mobile/marketing/marketing-content/library` - 1个调用位置
- `/mobile/marketing/marketing-content/schedule` - 1个调用位置
- `/mobile/marketing/marketing-content/templates` - 1个调用位置
- `/mobile/marketing/marketing-customer` - 1个调用位置
- `/mobile/marketing/marketing-customer/behavior-tracking` - 1个调用位置
- `/mobile/marketing/marketing-customer/churn-prediction` - 1个调用位置
- `/mobile/marketing/marketing-customer/lifecycle` - 1个调用位置
- `/mobile/marketing/marketing-customer/personas` - 1个调用位置
- `/mobile/marketing/marketing-customer/segment/create` - 1个调用位置
- `/mobile/marketing/marketing-customer/segment/{id}` - 1个调用位置
- `/mobile/marketing/marketing-customer/value-analysis` - 1个调用位置
- `/mobile/marketing/marketing-funnel` - 1个调用位置
- `/mobile/marketing/marketing-funnel/comparison/add` - 1个调用位置
- `/mobile/marketing/marketing-funnel/custom/create` - 1个调用位置
- `/mobile/marketing/marketing-funnel/custom/{id}/edit` - 1个调用位置
- `/mobile/marketing/marketing-funnel/segment/create` - 1个调用位置
- `/mobile/marketing/marketing-index` - 1个调用位置
- `/mobile/marketing/marketing-insights` - 1个调用位置
- `/mobile/marketing/marketing-insights/ai-analysis` - 1个调用位置
- `/mobile/marketing/marketing-insights/consumer-behavior` - 1个调用位置
- `/mobile/marketing/marketing-insights/forecast` - 1个调用位置
- `/mobile/marketing/marketing-insights/industry-dynamics` - 1个调用位置
- `/mobile/marketing/marketing-insights/opportunity-identification` - 1个调用位置
- `/mobile/marketing/marketing-insights/reports` - 1个调用位置
- `/mobile/marketing/marketing-insights/trends` - 1个调用位置
- `/mobile/marketing/marketing-integration` - 1个调用位置
- `/mobile/marketing/marketing-integration/access-control` - 1个调用位置
- `/mobile/marketing/marketing-integration/add-platform` - 1个调用位置
- `/mobile/marketing/marketing-integration/api-docs` - 1个调用位置
- `/mobile/marketing/marketing-integration/api-keys` - 1个调用位置
- `/mobile/marketing/marketing-integration/api-monitor` - 1个调用位置
- `/mobile/marketing/marketing-integration/api-test` - 1个调用位置
- `/mobile/marketing/marketing-integration/conflict-resolution` - 1个调用位置
- `/mobile/marketing/marketing-integration/encryption` - 1个调用位置
- `/mobile/marketing/marketing-integration/logs` - 1个调用位置
- `/mobile/marketing/marketing-integration/monitor` - 1个调用位置
- `/mobile/marketing/marketing-integration/platform/{id}` - 1个调用位置
- `/mobile/marketing/marketing-integration/security-audit` - 1个调用位置
- `/mobile/marketing/marketing-integration/settings` - 1个调用位置
- `/mobile/marketing/marketing-integration/sync-frequency` - 1个调用位置
- `/mobile/marketing/marketing-integration/sync-rules` - 1个调用位置
- `/mobile/marketing/marketing-reports` - 1个调用位置
- `/mobile/marketing/marketing-reports/create` - 1个调用位置
- `/mobile/marketing/marketing-reports/custom` - 1个调用位置
- `/mobile/marketing/marketing-reports/delivery` - 1个调用位置
- `/mobile/marketing/marketing-reports/list` - 1个调用位置
- `/mobile/marketing/marketing-reports/preview/{id}` - 1个调用位置
- `/mobile/marketing/marketing-reports/schedule` - 1个调用位置
- `/mobile/marketing/marketing-reports/scheduled` - 1个调用位置
- `/mobile/marketing/marketing-reports/share/{id}` - 1个调用位置
- `/mobile/marketing/marketing-reports/subscriptions` - 1个调用位置
- `/mobile/marketing/marketing-reports/templates` - 1个调用位置
- `/mobile/marketing/marketing-reports/view/{id}` - 1个调用位置
- `/mobile/marketing/marketing-template` - 1个调用位置
- `/mobile/marketing/marketing-template/{id}` - 1个调用位置
- `/mobile/marketing/marketing-template/{id}/edit` - 1个调用位置
- `/mobile/marketing/promotion-codes` - 1个调用位置
- `/mobile/marketing/promotion-codes/analytics` - 1个调用位置
- `/mobile/marketing/promotion-codes/batch` - 1个调用位置
- `/mobile/marketing/promotion-codes/create` - 1个调用位置
- `/mobile/marketing/promotion-codes/detail/{id}` - 1个调用位置
- `/mobile/marketing/promotion-codes/distribute/{id}` - 1个调用位置
- `/mobile/marketing/promotion-codes/edit/{id}` - 1个调用位置
- `/mobile/marketing/promotion-codes/export` - 1个调用位置
- `/mobile/marketing/promotion-codes/import` - 1个调用位置
- `/mobile/marketing/promotion-codes/rules` - 1个调用位置
- `/mobile/marketing/promotion-codes/templates` - 1个调用位置
- `/mobile/parent-center` - 3个调用位置
- `/mobile/parent-center/activities` - 2个调用位置
- `/mobile/parent-center/activities/{id}` - 1个调用位置
- `/mobile/parent-center/activity-registration` - 1个调用位置
- `/mobile/parent-center/ai-assistant` - 2个调用位置
- `/mobile/parent-center/assessment` - 2个调用位置
- `/mobile/parent-center/assessment/development-assessment` - 1个调用位置
- `/mobile/parent-center/assessment/doing/{recordid}` - 1个调用位置
- `/mobile/parent-center/assessment/growth-trajectory` - 1个调用位置
- `/mobile/parent-center/assessment/report` - 1个调用位置
- `/mobile/parent-center/assessment/start` - 1个调用位置
- `/mobile/parent-center/child-growth` - 2个调用位置
- `/mobile/parent-center/children` - 2个调用位置
- `/mobile/parent-center/children/followup` - 1个调用位置
- `/mobile/parent-center/children/growth` - 1个调用位置
- `/mobile/parent-center/communication` - 2个调用位置
- `/mobile/parent-center/communication/smart-hub` - 1个调用位置
- `/mobile/parent-center/dashboard` - 2个调用位置
- `/mobile/parent-center/feedback` - 2个调用位置
- `/mobile/parent-center/games` - 2个调用位置
- `/mobile/parent-center/games/achievements` - 1个调用位置
- `/mobile/parent-center/games/records` - 1个调用位置
- `/mobile/parent-center/kindergarten-rewards` - 1个调用位置
- `/mobile/parent-center/notifications` - 2个调用位置
- `/mobile/parent-center/notifications/detail` - 1个调用位置
- `/mobile/parent-center/photo-album` - 2个调用位置
- `/mobile/parent-center/profile` - 2个调用位置
- `/mobile/parent-center/promotion-center` - 2个调用位置
- `/mobile/parent-center/share-stats` - 2个调用位置
- `/mobile/teacher-center` - 3个调用位置
- `/mobile/teacher-center/activities` - 2个调用位置
- `/mobile/teacher-center/appointment-management` - 2个调用位置
- `/mobile/teacher-center/attendance` - 2个调用位置
- `/mobile/teacher-center/class-contacts` - 2个调用位置
- `/mobile/teacher-center/creative-curriculum` - 2个调用位置
- `/mobile/teacher-center/customer-pool` - 2个调用位置
- `/mobile/teacher-center/customer-tracking` - 2个调用位置
- `/mobile/teacher-center/dashboard` - 2个调用位置
- `/mobile/teacher-center/enrollment` - 2个调用位置
- `/mobile/teacher-center/notifications` - 2个调用位置
- `/mobile/teacher-center/performance-rewards` - 2个调用位置
- `/mobile/teacher-center/tasks` - 2个调用位置
- `/mobile/teacher-center/tasks/create` - 1个调用位置
- `/mobile/teacher-center/tasks/detail` - 1个调用位置
- `/mobile/teacher-center/tasks/edit` - 1个调用位置
- `/mobile/teacher-center/teaching` - 2个调用位置
- `/mock/customer-pool-list.json` - 1个调用位置
- `/mock/customer-pool-stats.json` - 1个调用位置
- `/model` - 1个调用位置
- `/modelmanagementpage` - 1个调用位置
- `/models` - 1个调用位置
- `/monitoring/aiperformancemonitor` - 1个调用位置
- `/monitoring/{type}` - 1个调用位置
- `/my-docs` - 1个调用位置
- `/my-task-center` - 1个调用位置
- `/my-tasks` - 1个调用位置
- `/new/{templateid}` - 1个调用位置
- `/nlp/text-analysis` - 1个调用位置
- `/notification-center` - 1个调用位置
- `/notifications` - 9个调用位置
- `/notifications/${id}` - 2个调用位置
- `/notifications/${id}/cancel` - 1个调用位置
- `/notifications/${id}/read` - 1个调用位置
- `/notifications/${id}/read-status` - 1个调用位置
- `/notifications/${id}/send` - 1个调用位置
- `/notifications/batch-read` - 1个调用位置
- `/notifications/mark-all-read` - 1个调用位置
- `/notifications/notification-settings` - 1个调用位置
- `/notifications/unread-count` - 2个调用位置
- `/operation-logs` - 1个调用位置
- `/operation-logs/${id}` - 2个调用位置
- `/operation-logs/batch-delete` - 1个调用位置
- `/operation-logs/clean` - 1个调用位置
- `/operation-logs/export` - 1个调用位置
- `/operation-logs/stats` - 1个调用位置
- `/optimization/activity-optimizer` - 1个调用位置
- `/optimization/capacity-optimization` - 1个调用位置
- `/oss-manager/delete` - 1个调用位置
- `/oss-manager/files` - 1个调用位置
- `/oss-manager/stats` - 1个调用位置
- `/oss-manager/structure` - 1个调用位置
- `/overview` - 1个调用位置
- `/parent` - 1个调用位置
- `/parent-center` - 2个调用位置
- `/parent-permissions/${id}/confirm` - 1个调用位置
- `/parent-permissions/${id}/toggle` - 1个调用位置
- `/parent-permissions/batch-confirm` - 1个调用位置
- `/parent-permissions/check/${parentid}` - 1个调用位置
- `/parent-permissions/parent/${parentid}` - 1个调用位置
- `/parent-permissions/pending` - 1个调用位置
- `/parent-permissions/request` - 1个调用位置
- `/parent-permissions/stats` - 1个调用位置
- `/parent/index` - 1个调用位置
- `/performance` - 1个调用位置
- `/performance-rewards` - 2个调用位置
- `/performance-rules` - 1个调用位置
- `/performance/rules` - 2个调用位置
- `/performance/rules/${id}` - 2个调用位置
- `/performance/rules/${id}/status` - 1个调用位置
- `/performance/{id}` - 1个调用位置
- `/performance/{type}` - 1个调用位置
- `/performancerules` - 1个调用位置
- `/permission-center` - 1个调用位置
- `/permissions` - 2个调用位置
- `/personnel` - 1个调用位置
- `/personnel-center` - 2个调用位置
- `/photo-album` - 4个调用位置
- `/photo-album-center` - 1个调用位置
- `/photo-album/${id}` - 1个调用位置
- `/photo-album/photos` - 1个调用位置
- `/photo-album/stats/overview` - 1个调用位置
- `/photos/${photoid}` - 1个调用位置
- `/photos/${photoid}/favorite` - 1个调用位置
- `/photos/${photoid}/tag-class` - 1个调用位置
- `/photos/${photoid}/tag-student` - 1个调用位置
- `/photos/child/${childid}/timeline` - 1个调用位置
- `/photos/class/${classid}` - 1个调用位置
- `/photos/statistics` - 1个调用位置
- `/photos/upload` - 1个调用位置
- `/photos/upload-multiple` - 1个调用位置
- `/plan/activity-planner` - 1个调用位置
- `/poster-editor/{templateid}` - 1个调用位置
- `/poster-generator/{templateid}` - 1个调用位置
- `/poster-templates` - 3个调用位置
- `/poster-templates/${id}` - 2个调用位置
- `/poster-templates/categories` - 1个调用位置
- `/poster-templates/statistics` - 1个调用位置
- `/postereditor` - 1个调用位置
- `/postergenerator` - 1个调用位置
- `/postertemplates` - 1个调用位置
- `/predictions` - 1个调用位置
- `/predictive/maintenance-optimizer` - 2个调用位置
- `/preview/{id}` - 2个调用位置
- `/principal` - 1个调用位置
- `/principal-center` - 1个调用位置
- `/principal/approvals` - 1个调用位置
- `/principal/approvals/${id}/${action.tolowercase()}` - 1个调用位置
- `/principal/campus/overview` - 1个调用位置
- `/principal/commission/rules` - 2个调用位置
- `/principal/commission/simulate` - 1个调用位置
- `/principal/customer-pool/${id}` - 1个调用位置
- `/principal/customer-pool/${id}/follow-up` - 1个调用位置
- `/principal/customer-pool/assign` - 1个调用位置
- `/principal/customer-pool/batch-assign` - 1个调用位置
- `/principal/customer-pool/export` - 1个调用位置
- `/principal/customer-pool/import` - 1个调用位置
- `/principal/customer-pool/list` - 1个调用位置
- `/principal/customer-pool/stats` - 1个调用位置
- `/principal/enrollment/trend` - 1个调用位置
- `/principal/notices` - 1个调用位置
- `/principal/notices/important` - 1个调用位置
- `/principal/performance/details` - 1个调用位置
- `/principal/performance/export` - 1个调用位置
- `/principal/performance/goals` - 2个调用位置
- `/principal/performance/rankings` - 1个调用位置
- `/principal/performance/stats` - 1个调用位置
- `/principal/schedule` - 2个调用位置
- `/profile` - 4个调用位置
- `/profile/settings` - 2个调用位置
- `/promotion-center` - 2个调用位置
- `/publish` - 1个调用位置
- `/quality` - 1个调用位置
- `/query` - 1个调用位置
- `/quick-query-groups` - 1个调用位置
- `/quick-query-groups/${groupid}` - 1个调用位置
- `/quick-query-groups/category/${category}` - 1个调用位置
- `/quick-query-groups/overview` - 1个调用位置
- `/quick-query-groups/search` - 1个调用位置
- `/quota-manage` - 1个调用位置
- `/quota/{id}` - 1个调用位置
- `/recent` - 1个调用位置
- `/recruitment` - 1个调用位置
- `/referrals` - 1个调用位置
- `/register` - 1个调用位置
- `/registration/registration-dashboard` - 1个调用位置
- `/report/{recordid}` - 3个调用位置
- `/reportbuilder` - 1个调用位置
- `/reports` - 4个调用位置
- `/resources` - 1个调用位置
- `/revenue` - 1个调用位置
- `/review` - 1个调用位置
- `/roles` - 1个调用位置
- `/roles/role-management` - 1个调用位置
- `/safety` - 1个调用位置
- `/schedule` - 2个调用位置
- `/schedule-center` - 1个调用位置
- `/schedule/{id}` - 1个调用位置
- `/school-readiness` - 3个调用位置
- `/script` - 1个调用位置
- `/script-categories` - 2个调用位置
- `/script-categories/${id}` - 3个调用位置
- `/script-categories/init-default` - 1个调用位置
- `/script-categories/sort` - 1个调用位置
- `/script-categories/stats` - 1个调用位置
- `/script-center` - 1个调用位置
- `/script-templates` - 1个调用位置
- `/script-templates/${id}` - 1个调用位置
- `/script-templates/batch/delete` - 1个调用位置
- `/scripts` - 2个调用位置
- `/scripts/${id}` - 3个调用位置
- `/scripts/${id}/use` - 1个调用位置
- `/scripts/stats` - 1个调用位置
- `/search` - 2个调用位置
- `/security` - 1个调用位置
- `/security/config` - 2个调用位置
- `/security/overview` - 1个调用位置
- `/security/recommendations` - 1个调用位置
- `/security/recommendations/generate` - 1个调用位置
- `/security/scan` - 1个调用位置
- `/security/threats` - 1个调用位置
- `/security/threats/${threatid}/handle` - 1个调用位置
- `/security/vulnerabilities` - 1个调用位置
- `/settings` - 3个调用位置
- `/settings-center` - 1个调用位置
- `/share-stats` - 2个调用位置
- `/share/{id}` - 1个调用位置
- `/shared` - 1个调用位置
- `/shared-docs` - 1个调用位置
- `/simulation/enrollment-simulation` - 1个调用位置
- `/smart-communication` - 2个调用位置
- `/smart-planning/smart-planning` - 1个调用位置
- `/smart-promotion/content/generate` - 1个调用位置
- `/smart-promotion/incentive/generate` - 1个调用位置
- `/smart-promotion/poster/generate` - 1个调用位置
- `/smart-promotion/reward/calculate` - 1个调用位置
- `/smart-promotion/social-content/generate` - 1个调用位置
- `/smart-promotion/stats` - 1个调用位置
- `/smart-promotion/viral/optimize/${referralcode}` - 1个调用位置
- `/smart-promotion/viral/track/${referralcode}` - 1个调用位置
- `/statistics` - 5个调用位置
- `/statistics/activities` - 1个调用位置
- `/statistics/dashboard` - 2个调用位置
- `/statistics/enrollment` - 2个调用位置
- `/statistics/financial` - 1个调用位置
- `/statistics/realtime` - 1个调用位置
- `/statistics/reports` - 1个调用位置
- `/statistics/revenue` - 2个调用位置
- `/statistics/students` - 2个调用位置
- `/statistics/teachers` - 2个调用位置
- `/statistics/trends` - 1个调用位置
- `/statistics/{period}` - 1个调用位置
- `/strategy/enrollment-strategy` - 1个调用位置
- `/student` - 1个调用位置
- `/student-assessment` - 1个调用位置
- `/student-attendance` - 1个调用位置
- `/student-center` - 1个调用位置
- `/student/analytics/{id}` - 1个调用位置
- `/student/assessment` - 1个调用位置
- `/student/detail/{id}` - 1个调用位置
- `/student/growth/{id}` - 1个调用位置
- `/student/search` - 2个调用位置
- `/student/statistics` - 1个调用位置
- `/submissions/{id}` - 1个调用位置
- `/system` - 2个调用位置
- `/system-center` - 1个调用位置
- `/system-center-unified` - 1个调用位置
- `/system-logs` - 2个调用位置
- `/system-logs/${id}` - 2个调用位置
- `/system-logs/batch` - 1个调用位置
- `/system-logs/clear` - 1个调用位置
- `/system-logs/export` - 2个调用位置
- `/system/ai-models` - 2个调用位置
- `/system/ai-models/${id}` - 2个调用位置
- `/system/ai-models/${id}/status` - 1个调用位置
- `/system/ai-models/${id}/test` - 1个调用位置
- `/system/ai-models/batch-delete` - 1个调用位置
- `/system/ai-models/batch-test` - 1个调用位置
- `/system/ai-models/stats` - 1个调用位置
- `/system/detail-info` - 1个调用位置
- `/system/message-templates` - 2个调用位置
- `/system/message-templates/${id}` - 2个调用位置
- `/system/message-templates/${id}/status` - 1个调用位置
- `/system/message-templates/batch-delete` - 1个调用位置
- `/system/message-templates/stats` - 1个调用位置
- `/system/settings` - 2个调用位置
- `/system/stats` - 1个调用位置
- `/task` - 1个调用位置
- `/task-center` - 1个调用位置
- `/task-form` - 1个调用位置
- `/task-templates` - 1个调用位置
- `/task-templates/${templateid}/create` - 1个调用位置
- `/tasks` - 5个调用位置
- `/tasks/${id}` - 2个调用位置
- `/tasks/${id}/assign` - 1个调用位置
- `/tasks/${id}/progress` - 1个调用位置
- `/tasks/${id}/status` - 1个调用位置
- `/tasks/${taskid}/attachments` - 2个调用位置
- `/tasks/${taskid}/comments` - 2个调用位置
- `/tasks/${taskid}/comments/${commentid}` - 1个调用位置
- `/tasks/${taskid}/link` - 1个调用位置
- `/tasks/${taskid}/related` - 1个调用位置
- `/tasks/analytics` - 1个调用位置
- `/tasks/batch` - 1个调用位置
- `/tasks/export` - 1个调用位置
- `/tasks/report` - 1个调用位置
- `/tasks/stats` - 1个调用位置
- `/tasks/trends` - 1个调用位置
- `/teacher` - 1个调用位置
- `/teacher-attendance` - 1个调用位置
- `/teacher-center` - 2个调用位置
- `/teacher-checkin/approve` - 1个调用位置
- `/teacher-checkin/check-in` - 1个调用位置
- `/teacher-checkin/check-out` - 1个调用位置
- `/teacher-checkin/history` - 1个调用位置
- `/teacher-checkin/leave` - 1个调用位置
- `/teacher-checkin/month` - 1个调用位置
- `/teacher-checkin/statistics` - 1个调用位置
- `/teacher-checkin/today` - 1个调用位置
- `/teacher-dashboard/activity-statistics` - 1个调用位置
- `/teacher-dashboard/tasks/batch-complete` - 1个调用位置
- `/teacher-dashboard/tasks/batch-delete` - 2个调用位置
- `/teacher-dashboard/teaching/records/${id}` - 1个调用位置
- `/teacher/customers/${customerid}/follow` - 1个调用位置
- `/teacher/customers/${customerid}/follow-records` - 1个调用位置
- `/teacher/customers/${customerid}/status` - 1个调用位置
- `/teacher/customers/conversion-funnel` - 1个调用位置
- `/teacher/customers/list` - 2个调用位置
- `/teacher/customers/stats` - 2个调用位置
- `/teacher/index` - 1个调用位置
- `/teaching` - 3个调用位置
- `/teaching-center` - 1个调用位置
- `/teaching-center/brain-science-courses` - 2个调用位置
- `/teaching-center/brain-science-courses/${courseid}` - 2个调用位置
- `/teaching-center/championship` - 2个调用位置
- `/teaching-center/championship/${championshipid}` - 1个调用位置
- `/teaching-center/championship/${championshipid}/details` - 1个调用位置
- `/teaching-center/championship/${championshipid}/status` - 1个调用位置
- `/teaching-center/course-plans` - 2个调用位置
- `/teaching-center/course-plans/${planid}` - 1个调用位置
- `/teaching-center/course-progress` - 1个调用位置
- `/teaching-center/course-progress/class/${classid}/detailed` - 1个调用位置
- `/teaching-center/course-progress/confirm` - 1个调用位置
- `/teaching-center/export/championship/${championshipid}` - 1个调用位置
- `/teaching-center/export/course-progress` - 1个调用位置
- `/teaching-center/export/outdoor-training` - 1个调用位置
- `/teaching-center/external-display` - 1个调用位置
- `/teaching-center/external-display/class/${classid}/details` - 1个调用位置
- `/teaching-center/external-display/records` - 1个调用位置
- `/teaching-center/external-display/records/${recordid}` - 1个调用位置
- `/teaching-center/media/batch-upload` - 1个调用位置
- `/teaching-center/media/files` - 1个调用位置
- `/teaching-center/media/files/${fileid}` - 1个调用位置
- `/teaching-center/media/stats` - 1个调用位置
- `/teaching-center/media/upload` - 1个调用位置
- `/teaching-center/outdoor-training` - 1个调用位置
- `/teaching-center/outdoor-training/class/${classid}/details` - 1个调用位置
- `/teaching-center/outdoor-training/records` - 1个调用位置
- `/teaching-center/outdoor-training/records/${recordid}` - 1个调用位置
- `/template-detail` - 1个调用位置
- `/templates` - 1个调用位置
- `/test/components` - 1个调用位置
- `/test/form-modal-test` - 1个调用位置
- `/test/page-operation-tools` - 1个调用位置
- `/test/simple-form-modal-test` - 1个调用位置
- `/test/student-management` - 1个调用位置
- `/theme-test` - 1个调用位置
- `/training` - 1个调用位置
- `/trends/trend-analysis` - 1个调用位置
- `/upgrade` - 1个调用位置
- `/upload` - 2个调用位置
- `/upload/activity-cover` - 1个调用位置
- `/upload/notification-attachments` - 1个调用位置
- `/usage` - 1个调用位置
- `/usage-center/my-usage` - 2个调用位置
- `/usage-center/overview` - 3个调用位置
- `/usage-center/user/${userid}/detail` - 1个调用位置
- `/usage-center/user/1/detail` - 1个调用位置
- `/usage-center/users` - 2个调用位置
- `/usage-quota/user/${userid}` - 2个调用位置
- `/usage-quota/user/1` - 2个调用位置
- `/usage-quota/warnings` - 2个调用位置
- `/user-center` - 1个调用位置
- `/user/change-password` - 1个调用位置
- `/users` - 1个调用位置
- `/users/user-management` - 1个调用位置
- `/view/{id}` - 1个调用位置
- `/visualization/3d-analytics` - 1个调用位置
- `/voice-config` - 2个调用位置
- `/voice-config/${id}` - 3个调用位置
- `/voice-config/${id}/test` - 1个调用位置
- `/voice-config/${id}/toggle` - 1个调用位置
- `/voice-config/${id}/validate` - 1个调用位置
- `/voice-config/active` - 1个调用位置
- `/voice-config/stats` - 1个调用位置
- `/{id}` - 9个调用位置
- `/{id}/signin` - 2个调用位置
- `/{pathmatch(.*)*}` - 1个调用位置

## 🖥️  后端API端点列表

- `/abnormal` - 2个定义位置
- `/active` - 2个定义位置
- `/activities` - 10个定义位置
- `/activity` - 4个定义位置
- `/activity-checkin-overview` - 2个定义位置
- `/activity-effectiveness` - 2个定义位置
- `/activity-poster-tables` - 2个定义位置
- `/activity-statistics` - 2个定义位置
- `/activity/overview` - 2个定义位置
- `/activity/trend` - 2个定义位置
- `/activity/{activityid}/statistics` - 2个定义位置
- `/activity/{activityid}/stats` - 2个定义位置
- `/add-function-tools-permission` - 2个定义位置
- `/add-to-class` - 2个定义位置
- `/agent/dispatch` - 2个定义位置
- `/ai-analysis` - 2个定义位置
- `/ai-status` - 2个定义位置
- `/ai/analyze/{callid}` - 2个定义位置
- `/ai/batch-analyze` - 2个定义位置
- `/ai/check-compliance` - 2个定义位置
- `/ai/generate-response/{callid}` - 2个定义位置
- `/ai/generate-script` - 2个定义位置
- `/ai/memories/search` - 2个定义位置
- `/ai/predict` - 2个定义位置
- `/ai/sentiment/{callid}` - 2个定义位置
- `/ai/speech-to-text` - 2个定义位置
- `/ai/strategy` - 2个定义位置
- `/ai/synthesize` - 2个定义位置
- `/ai/synthesize/{taskid}/status` - 2个定义位置
- `/ai/transcribe/{callid}/result` - 2个定义位置
- `/ai/transcribe/{callid}/start` - 2个定义位置
- `/ai/transcribe/{callid}/stop` - 2个定义位置
- `/ai/tts/test` - 2个定义位置
- `/ai/tts/voices` - 2个定义位置
- `/alerts` - 4个定义位置
- `/all` - 2个定义位置
- `/all-routes` - 2个定义位置
- `/allocate` - 2个定义位置
- `/analysis` - 2个定义位置
- `/analysis-history` - 2个定义位置
- `/analytics` - 2个定义位置
- `/analytics/overview` - 2个定义位置
- `/analytics/trends` - 2个定义位置
- `/analyze` - 6个定义位置
- `/answer` - 4个定义位置
- `/api-stats` - 2个定义位置
- `/api/ai-query/chat` - 1个定义位置
- `/api/direct/enrollment-statistics/activities` - 2个定义位置
- `/api/direct/enrollment-statistics/channels` - 2个定义位置
- `/api/direct/enrollment-statistics/conversions` - 2个定义位置
- `/api/direct/enrollment-statistics/performance` - 2个定义位置
- `/api/direct/enrollment-statistics/plans` - 2个定义位置
- `/api/direct/enrollment-statistics/trends` - 2个定义位置
- `/api/enrollment-statistics/activities` - 2个定义位置
- `/api/enrollment-statistics/channels` - 2个定义位置
- `/api/enrollment-statistics/conversions` - 2个定义位置
- `/api/enrollment-statistics/performance` - 2个定义位置
- `/api/enrollment-statistics/trends` - 2个定义位置
- `/api/health` - 2个定义位置
- `/api/logs/error` - 2个定义位置
- `/api/organization-status/1/ai-format` - 1个定义位置
- `/api/test-formatter` - 2个定义位置
- `/api/test/simple-login` - 2个定义位置
- `/api/v3/chat/completions` - 2个定义位置
- `/applications` - 6个定义位置
- `/applications/{id}` - 4个定义位置
- `/applications/{id}/status` - 4个定义位置
- `/approvals` - 2个定义位置
- `/approvals/{id}/{action}` - 2个定义位置
- `/approve` - 2个定义位置
- `/assign` - 2个定义位置
- `/assign-class` - 2个定义位置
- `/assign-role-permissions` - 2个定义位置
- `/auto-settings` - 4个定义位置
- `/available` - 2个定义位置
- `/available-tools` - 2个定义位置
- `/avatar/student/{studentid}` - 2个定义位置
- `/avatar/teacher/{teacherid}` - 2个定义位置
- `/avatar/user` - 2个定义位置
- `/base-info/batch` - 2个定义位置
- `/basic-info` - 4个定义位置
- `/batch` - 6个定义位置
- `/batch-adjust` - 2个定义位置
- `/batch-approve` - 2个定义位置
- `/batch-assign` - 4个定义位置
- `/batch-assign-class` - 2个定义位置
- `/batch-check` - 4个定义位置
- `/batch-confirm` - 4个定义位置
- `/batch-delete` - 2个定义位置
- `/batch-generate-bills` - 2个定义位置
- `/batch-read` - 2个定义位置
- `/batch/delete` - 4个定义位置
- `/business-center-permissions` - 2个定义位置
- `/by-activity/{activityid}` - 6个定义位置
- `/by-application/{applicationid}` - 2个定义位置
- `/by-category/{category}` - 2个定义位置
- `/by-channel/{channelid}` - 2个定义位置
- `/by-class` - 2个定义位置
- `/by-class/{classid}` - 4个定义位置
- `/by-date/{date}` - 2个定义位置
- `/by-page/{pagepath}` - 2个定义位置
- `/by-parent/{parentid}` - 2个定义位置
- `/by-path/{pagepath}` - 2个定义位置
- `/by-plan/{planid}` - 4个定义位置
- `/by-rating/{rating}` - 2个定义位置
- `/by-result/{resultid}` - 2个定义位置
- `/by-role/{roleid}` - 2个定义位置
- `/by-source/{source}` - 2个定义位置
- `/by-status/{status}` - 10个定义位置
- `/by-student/{studentid}` - 2个定义位置
- `/by-type/{type}` - 4个定义位置
- `/by-user/{userid}` - 4个定义位置
- `/cache/cleanup` - 2个定义位置
- `/cache/clear` - 8个定义位置
- `/cache/stats` - 4个定义位置
- `/calculate-completeness` - 2个定义位置
- `/calculate-reward` - 2个定义位置
- `/calendar/{year}/{month}` - 2个定义位置
- `/call` - 2个定义位置
- `/call/hangup` - 2个定义位置
- `/call/make` - 2个定义位置
- `/call/{callid}/recording/start` - 2个定义位置
- `/call/{callid}/recording/stop` - 2个定义位置
- `/call/{callid}/status` - 2个定义位置
- `/calls/active` - 4个定义位置
- `/calls/history` - 2个定义位置
- `/calls/statistics` - 2个定义位置
- `/campaigns/recent` - 2个定义位置
- `/campus-overview` - 2个定义位置
- `/campus/overview` - 6个定义位置
- `/categories` - 6个定义位置
- `/categories/code/{code}` - 2个定义位置
- `/categories/{parentid}/children` - 2个定义位置
- `/category/{category}` - 4个定义位置
- `/championship` - 4个定义位置
- `/championship/{championshipid}` - 2个定义位置
- `/championship/{championshipid}/status` - 2个定义位置
- `/change-password` - 2个定义位置
- `/channel` - 2个定义位置
- `/channel-analysis` - 2个定义位置
- `/channels` - 8个定义位置
- `/channels/tags` - 2个定义位置
- `/channels/{id}` - 4个定义位置
- `/channels/{id}/contacts` - 4个定义位置
- `/channels/{id}/contacts/{contactid}` - 2个定义位置
- `/channels/{id}/metrics` - 2个定义位置
- `/channels/{id}/tags` - 4个定义位置
- `/channels/{id}/tags/{tagid}` - 2个定义位置
- `/charts` - 2个定义位置
- `/chat` - 4个定义位置
- `/chat/completions` - 2个定义位置
- `/chat/stream` - 2个定义位置
- `/check` - 2个定义位置
- `/check-availability` - 2个定义位置
- `/check-conflicts` - 2个定义位置
- `/check-in` - 2个定义位置
- `/check-out` - 2个定义位置
- `/check-page` - 2个定义位置
- `/check-permission` - 6个定义位置
- `/check-upgrade` - 2个定义位置
- `/check/{pagepath}` - 2个定义位置
- `/check/{parentid}` - 2个定义位置
- `/check/{rolecode}` - 2个定义位置
- `/class-create` - 2个定义位置
- `/class-detail/{id}` - 2个定义位置
- `/class-distribution` - 2个定义位置
- `/class-list` - 2个定义位置
- `/class-progress/{classid}/{courseplanid}` - 2个定义位置
- `/classes` - 8个定义位置
- `/classes/batch` - 4个定义位置
- `/classes/export` - 2个定义位置
- `/classes/search` - 2个定义位置
- `/classes/{id}` - 6个定义位置
- `/cleanup` - 8个定义位置
- `/cleanup-temp` - 2个定义位置
- `/clock-in` - 2个定义位置
- `/comparison` - 2个定义位置
- `/complete-poster` - 2个定义位置
- `/completeness` - 2个定义位置
- `/completion-rate` - 2个定义位置
- `/compress` - 2个定义位置
- `/config` - 10个定义位置
- `/configs` - 8个定义位置
- `/configs/{id}` - 4个定义位置
- `/configure` - 2个定义位置
- `/confirm-completion/{progressid}` - 2个定义位置
- `/confirm-payment` - 2个定义位置
- `/consultations` - 2个定义位置
- `/consultations/statistics` - 2个定义位置
- `/contacts` - 4个定义位置
- `/contacts/search` - 2个定义位置
- `/contacts/{id}` - 4个定义位置
- `/content` - 4个定义位置
- `/content/{id}` - 6个定义位置
- `/context` - 2个定义位置
- `/continue` - 2个定义位置
- `/conversation` - 2个定义位置
- `/conversations` - 4个定义位置
- `/conversations/{id}` - 6个定义位置
- `/conversations/{id}/messages` - 4个定义位置
- `/conversion-funnel` - 4个定义位置
- `/conversions` - 2个定义位置
- `/core/{userid}` - 4个定义位置
- `/count` - 1个定义位置
- `/course-progress` - 2个定义位置
- `/create-marketing-guides` - 2个定义位置
- `/create-remaining-pages` - 2个定义位置
- `/create-test-users` - 2个定义位置
- `/critical` - 2个定义位置
- `/custom-layout` - 2个定义位置
- `/customer-applications/{id}` - 2个定义位置
- `/customer-pool/assign` - 2个定义位置
- `/customer-pool/batch-assign` - 2个定义位置
- `/customer-pool/list` - 2个定义位置
- `/customer-pool/stats` - 2个定义位置
- `/customer-pool/{id}` - 4个定义位置
- `/customer-pool/{id}/follow-up` - 2个定义位置
- `/customer-preview` - 2个定义位置
- `/customers/{customerid}/ai-suggestions/global` - 2个定义位置
- `/customers/{customerid}/ai-suggestions/task` - 2个定义位置
- `/customers/{customerid}/conversations` - 4个定义位置
- `/customers/{customerid}/conversations/batch` - 2个定义位置
- `/customers/{customerid}/progress` - 4个定义位置
- `/customers/{customerid}/progress/advance` - 2个定义位置
- `/customers/{customerid}/screenshots/upload` - 2个定义位置
- `/customers/{customerid}/screenshots/{screenshotid}/analyze` - 2个定义位置
- `/customers/{customerid}/tasks/{taskid}/complete` - 2个定义位置
- `/customers/{customerid}/timeline` - 2个定义位置
- `/dashboard` - 18个定义位置
- `/dashboard/class-create` - 2个定义位置
- `/dashboard/class-detail/{id}` - 2个定义位置
- `/dashboard/class-list` - 2个定义位置
- `/dashboard/classes` - 2个定义位置
- `/dashboard/custom-layout` - 2个定义位置
- `/dashboard/data-statistics` - 2个定义位置
- `/dashboard/overview` - 2个定义位置
- `/dashboard/schedule` - 4个定义位置
- `/dashboard/stats` - 2个定义位置
- `/dashboard/todos` - 4个定义位置
- `/dashboard/todos/{id}` - 2个定义位置
- `/dashboard/todos/{id}/status` - 2个定义位置
- `/data-statistics` - 2个定义位置
- `/database` - 4个定义位置
- `/db-monitor/indexes` - 2个定义位置
- `/db-monitor/metrics` - 2个定义位置
- `/db-monitor/queries` - 2个定义位置
- `/db-monitor/tables` - 2个定义位置
- `/deep-oss-debug` - 2个定义位置
- `/default` - 4个定义位置
- `/delete` - 2个定义位置
- `/description` - 2个定义位置
- `/detail-info` - 2个定义位置
- `/details` - 2个定义位置
- `/development/{subtype}/{filename}` - 2个定义位置
- `/diagnose` - 2个定义位置
- `/direct-chat` - 2个定义位置
- `/distribution` - 2个定义位置
- `/docs` - 2个定义位置
- `/document-analysis` - 2个定义位置
- `/download/{filename}` - 2个定义位置
- `/download/{id}` - 2个定义位置
- `/dynamic-routes` - 2个定义位置
- `/education/{category}/{subtype}/{filename}` - 2个定义位置
- `/enrollment` - 4个定义位置
- `/enrollment-finance` - 4个定义位置
- `/enrollment-progress` - 2个定义位置
- `/enrollment-trend` - 4个定义位置
- `/enrollment-trends` - 4个定义位置
- `/enrollment/trend` - 2个定义位置
- `/environment` - 4个定义位置
- `/episodic` - 4个定义位置
- `/errors` - 2个定义位置
- `/execute` - 10个定义位置
- `/execute-single` - 2个定义位置
- `/experts/types` - 2个定义位置
- `/export` - 16个定义位置
- `/extensions` - 2个定义位置
- `/extensions/{id}` - 2个定义位置
- `/extensions/{id}/reset` - 2个定义位置
- `/extensions/{id}/status` - 2个定义位置
- `/external-display` - 4个定义位置
- `/external-display/class/{classid}` - 2个定义位置
- `/fee-items` - 4个定义位置
- `/fee-package-templates` - 4个定义位置
- `/fee-templates` - 2个定义位置
- `/feedback` - 2个定义位置
- `/field-config` - 2个定义位置
- `/files` - 2个定义位置
- `/finance` - 2个定义位置
- `/financial` - 2个定义位置
- `/find-element` - 2个定义位置
- `/fix-ai-memories` - 2个定义位置
- `/fix-business-center-paths` - 2个定义位置
- `/follow` - 2个定义位置
- `/followups` - 4个定义位置
- `/followups/{id}` - 2个定义位置
- `/force-refresh-cache` - 2个定义位置
- `/formats` - 2个定义位置
- `/game-backgrounds` - 4个定义位置
- `/game-backgrounds/{gamekey}` - 4个定义位置
- `/games/{type}/{subtype}/{filename}` - 2个定义位置
- `/generate` - 14个定义位置
- `/generate-activity-image` - 2个定义位置
- `/generate-bill` - 2个定义位置
- `/generate-content` - 2个定义位置
- `/generate-image` - 2个定义位置
- `/generate-pdf` - 2个定义位置
- `/generate-poster` - 4个定义位置
- `/generate-stream` - 4个定义位置
- `/goals` - 2个定义位置
- `/growth-trajectory` - 2个定义位置
- `/guide` - 2个定义位置
- `/health` - 19个定义位置
- `/history` - 14个定义位置
- `/host` - 4个定义位置
- `/image-generation-status` - 2个定义位置
- `/image-to-video` - 2个定义位置
- `/image/generate` - 2个定义位置
- `/import` - 6个定义位置
- `/info` - 4个定义位置
- `/info/*` - 2个定义位置
- `/init-default` - 2个定义位置
- `/inputtokens` - 1个定义位置
- `/inspection-tasks/{taskid}/comments` - 4个定义位置
- `/inspection/overview` - 2个定义位置
- `/keywords` - 2个定义位置
- `/kickout-others` - 2个定义位置
- `/kickout/{userid}` - 2个定义位置
- `/kindergarten` - 2个定义位置
- `/knowledge` - 2个定义位置
- `/knowledge/search` - 2个定义位置
- `/knowledge/{entryid}/validate` - 2个定义位置
- `/leave` - 2个定义位置
- `/linkages` - 2个定义位置
- `/list` - 14个定义位置
- `/login` - 2个定义位置
- `/logout` - 2个定义位置
- `/logs` - 6个定义位置
- `/map-user` - 2个定义位置
- `/mapping` - 2个定义位置
- `/mark-all-read` - 2个定义位置
- `/marketing/analysis` - 4个定义位置
- `/marketing/copy` - 2个定义位置
- `/marketing/roi` - 2个定义位置
- `/match` - 2个定义位置
- `/materials/{materialid}` - 2个定义位置
- `/materials/{materialid}/verify` - 2个定义位置
- `/me` - 4个定义位置
- `/media` - 4个定义位置
- `/media/overview` - 2个定义位置
- `/memories` - 4个定义位置
- `/menu` - 2个定义位置
- `/messages` - 2个定义位置
- `/metrics` - 2个定义位置
- `/migration-info` - 2个定义位置
- `/missing-fields` - 2个定义位置
- `/models` - 14个定义位置
- `/models/batch` - 2个定义位置
- `/models/default` - 4个定义位置
- `/models/distribution` - 2个定义位置
- `/models/stats` - 2个定义位置
- `/models/status` - 2个定义位置
- `/models/{id}` - 8个定义位置
- `/models/{id}/billing` - 4个定义位置
- `/models/{id}/capabilities/{capability}` - 2个定义位置
- `/models/{id}/limits` - 2个定义位置
- `/month` - 2个定义位置
- `/my` - 6个定义位置
- `/my-bill` - 2个定义位置
- `/my-code` - 2个定义位置
- `/my-pages` - 2个定义位置
- `/my-records` - 4个定义位置
- `/my-roles` - 2个定义位置
- `/my-stats` - 2个定义位置
- `/my-usage` - 2个定义位置
- `/notices` - 2个定义位置
- `/notices/important` - 4个定义位置
- `/notices/mark-all-read` - 2个定义位置
- `/notices/stats` - 2个定义位置
- `/notices/{id}` - 2个定义位置
- `/notices/{id}/read` - 2个定义位置
- `/online` - 2个定义位置
- `/operations` - 2个定义位置
- `/optimize-strategy` - 2个定义位置
- `/oss-debug` - 2个定义位置
- `/oss-simple-test` - 2个定义位置
- `/outdoor-training` - 4个定义位置
- `/outdoor-training/class/{classid}` - 2个定义位置
- `/outputtokens` - 1个定义位置
- `/overview` - 54个定义位置
- `/page-actions` - 2个定义位置
- `/parent/{parentid}` - 2个定义位置
- `/parents` - 6个定义位置
- `/parents/batch` - 4个定义位置
- `/parents/export` - 2个定义位置
- `/parents/search` - 2个定义位置
- `/parents/{id}` - 6个定义位置
- `/parents/{id}/students` - 4个定义位置
- `/parents/{parentid}/add-child` - 2个定义位置
- `/parents/{parentid}/students/{studentid}` - 2个定义位置
- `/parse` - 2个定义位置
- `/parse-batch-data` - 2个定义位置
- `/payment-records` - 4个定义位置
- `/pending` - 4个定义位置
- `/performance` - 4个定义位置
- `/performance-prediction` - 2个定义位置
- `/performance/details` - 2个定义位置
- `/performance/rankings` - 2个定义位置
- `/performance/stats` - 2个定义位置
- `/permission-cache-status` - 2个定义位置
- `/permission-change-history` - 4个定义位置
- `/permissions` - 6个定义位置
- `/permissions/{permissionid}/inheritance` - 2个定义位置
- `/personalized-incentive` - 2个定义位置
- `/photos` - 2个定义位置
- `/physical-items` - 2个定义位置
- `/plan-analysis` - 2个定义位置
- `/plan/{id}/ai-history` - 2个定义位置
- `/plan/{id}/batch-analysis` - 2个定义位置
- `/plan/{id}/evaluation` - 2个定义位置
- `/plan/{id}/export-ai-report` - 2个定义位置
- `/plan/{id}/forecast` - 2个定义位置
- `/plan/{id}/optimization` - 2个定义位置
- `/plan/{id}/simulation` - 2个定义位置
- `/plan/{id}/smart-planning` - 2个定义位置
- `/plan/{id}/strategy` - 2个定义位置
- `/plan/{planid}` - 4个定义位置
- `/plans` - 10个定义位置
- `/plans/generate-yearly` - 2个定义位置
- `/plans/timeline` - 2个定义位置
- `/plans/{id}` - 12个定义位置
- `/plans/{id}/tasks` - 4个定义位置
- `/plans/{id}/tasks/{taskid}` - 4个定义位置
- `/popular/{entitytype}` - 2个定义位置
- `/poster` - 2个定义位置
- `/poster-templates` - 2个定义位置
- `/posters/upload` - 2个定义位置
- `/predictions` - 2个定义位置
- `/predictive-analytics` - 2个定义位置
- `/predictive-analytics/export` - 2个定义位置
- `/predictive-analytics/refresh` - 2个定义位置
- `/preview` - 6个定义位置
- `/principal/activities` - 4个定义位置
- `/principal/customer-applications` - 2个定义位置
- `/principal/customer-applications/batch-review` - 2个定义位置
- `/principal/customer-applications/{id}/review` - 2个定义位置
- `/principal/customer-pool/list` - 2个定义位置
- `/principal/customer-pool/stats` - 2个定义位置
- `/principal/dashboard-stats` - 4个定义位置
- `/principal/dashboard/overview` - 2个定义位置
- `/principal/stats` - 2个定义位置
- `/procedural` - 2个定义位置
- `/procedural/{procedurename}` - 2个定义位置
- `/process/{id}` - 2个定义位置
- `/profile` - 6个定义位置
- `/progress/{taskid}` - 2个定义位置
- `/projects` - 4个定义位置
- `/projects/{projectid}` - 4个定义位置
- `/projects/{projectid}/audio` - 2个定义位置
- `/projects/{projectid}/check-video-status` - 2个定义位置
- `/projects/{projectid}/merge` - 2个定义位置
- `/projects/{projectid}/notified` - 2个定义位置
- `/projects/{projectid}/scenes` - 2个定义位置
- `/projects/{projectid}/script` - 2个定义位置
- `/projects/{projectid}/status` - 2个定义位置
- `/query` - 2个定义位置
- `/questions` - 6个定义位置
- `/questions/{id}` - 4个定义位置
- `/quick-questions` - 2个定义位置
- `/quotas` - 4个定义位置
- `/quotas/{id}` - 4个定义位置
- `/rankings` - 2个定义位置
- `/real-time/system-status` - 2个定义位置
- `/realtime/status` - 2个定义位置
- `/recent` - 2个定义位置
- `/recent-creations` - 2个定义位置
- `/recent-notifications` - 2个定义位置
- `/recent-tasks` - 2个定义位置
- `/recommend` - 2个定义位置
- `/recommendations` - 2个定义位置
- `/recommendations/generate` - 2个定义位置
- `/record` - 2个定义位置
- `/record-time` - 2个定义位置
- `/record/{billingid}/status` - 2个定义位置
- `/record/{recordid}` - 2个定义位置
- `/recordings` - 2个定义位置
- `/recordings/{id}` - 4个定义位置
- `/recordings/{id}/download` - 2个定义位置
- `/recordings/{id}/transcribe` - 2个定义位置
- `/recordings/{id}/transcript` - 4个定义位置
- `/records` - 8个定义位置
- `/records/batch-status` - 2个定义位置
- `/records/reset` - 2个定义位置
- `/records/{followrecordid}/ai-suggestions` - 2个定义位置
- `/records/{followrecordid}/complete` - 2个定义位置
- `/records/{followrecordid}/skip` - 2个定义位置
- `/records/{id}` - 8个定义位置
- `/referrals` - 2个定义位置
- `/referrals/generate` - 2个定义位置
- `/referrals/generate-poster` - 2个定义位置
- `/referrals/graph` - 2个定义位置
- `/referrals/my-codes` - 2个定义位置
- `/referrals/poster-templates` - 2个定义位置
- `/referrals/stats` - 2个定义位置
- `/referrals/{code}/stats` - 2个定义位置
- `/referrals/{code}/track` - 2个定义位置
- `/refresh` - 4个定义位置
- `/refresh-permission-cache` - 2个定义位置
- `/regions` - 4个定义位置
- `/register` - 2个定义位置
- `/register/check-email` - 2个定义位置
- `/register/check-username` - 2个定义位置
- `/register/form-data` - 2个定义位置
- `/registration/{id}` - 2个定义位置
- `/reminder-logs` - 4个定义位置
- `/reminder-logs/stats` - 2个定义位置
- `/reminder-logs/{id}` - 2个定义位置
- `/reminder-logs/{id}/status` - 2个定义位置
- `/report` - 6个定义位置
- `/report/{recordid}` - 2个定义位置
- `/reports` - 4个定义位置
- `/request` - 2个定义位置
- `/reset` - 4个定义位置
- `/reset-stats` - 2个定义位置
- `/resource` - 2个定义位置
- `/resource/search` - 2个定义位置
- `/resource/{resourceid}/access` - 2个定义位置
- `/restore` - 2个定义位置
- `/retrieve` - 2个定义位置
- `/revenue` - 4个定义位置
- `/rewards` - 2个定义位置
- `/risk-assessment` - 2个定义位置
- `/role/{roleid}` - 4个定义位置
- `/roles` - 2个定义位置
- `/roles/{roleid}/permission-history` - 2个定义位置
- `/roles/{roleid}/permissions` - 6个定义位置
- `/rollback` - 2个定义位置
- `/satisfaction-report` - 2个定义位置
- `/save` - 4个定义位置
- `/scan` - 4个定义位置
- `/schedule` - 6个定义位置
- `/schedule-data` - 2个定义位置
- `/schedules` - 2个定义位置
- `/schema/{type}` - 2个定义位置
- `/screenshot` - 2个定义位置
- `/search` - 10个定义位置
- `/semantic` - 2个定义位置
- `/semantic/search` - 2个定义位置
- `/semantic/{conceptid}/related` - 2个定义位置
- `/send-payment-reminder` - 2个定义位置
- `/sessions` - 4个定义位置
- `/sessions/{sessionid}/messages` - 2个定义位置
- `/settings/user` - 4个定义位置
- `/share` - 2个定义位置
- `/simulate` - 2个定义位置
- `/smart-assign` - 2个定义位置
- `/smart-chat` - 4个定义位置
- `/social-media-content` - 2个定义位置
- `/sort` - 4个定义位置
- `/speech/synthesize` - 2个定义位置
- `/stages` - 4个定义位置
- `/stages/{id}` - 2个定义位置
- `/stages/{id}/tasks` - 2个定义位置
- `/start` - 6个定义位置
- `/start-permission-watcher` - 2个定义位置
- `/statistics` - 54个定义位置
- `/statistics/activity-data` - 2个定义位置
- `/statistics/by-age` - 2个定义位置
- `/statistics/by-class` - 2个定义位置
- `/statistics/daily` - 2个定义位置
- `/statistics/enrollment-trends` - 2个定义位置
- `/statistics/monthly` - 2个定义位置
- `/statistics/quarterly` - 2个定义位置
- `/statistics/table` - 2个定义位置
- `/statistics/user` - 2个定义位置
- `/statistics/weekly` - 2个定义位置
- `/statistics/yearly` - 2个定义位置
- `/statistics/{activityid}` - 2个定义位置
- `/statistics/{planid}` - 2个定义位置
- `/stats` - 64个定义位置
- `/stats/category` - 2个定义位置
- `/stats/conversions` - 2个定义位置
- `/stats/funnel` - 2个定义位置
- `/stats/overview` - 2个定义位置
- `/stats/{kindergartenid}` - 2个定义位置
- `/stats/{recordid}` - 2个定义位置
- `/status` - 12个定义位置
- `/storage-info` - 2个定义位置
- `/stream-chat` - 2个定义位置
- `/stream-health` - 2个定义位置
- `/stream/{sessionid}` - 2个定义位置
- `/structure` - 2个定义位置
- `/students` - 8个定义位置
- `/students/batch` - 4个定义位置
- `/students/export` - 2个定义位置
- `/students/search` - 2个定义位置
- `/students/{classid}` - 2个定义位置
- `/students/{id}` - 6个定义位置
- `/students/{id}/parents` - 2个定义位置
- `/students/{studentid}/assign-class` - 2个定义位置
- `/suggestions` - 4个定义位置
- `/supported-types` - 2个定义位置
- `/system` - 2个定义位置
- `/system-info` - 2个定义位置
- `/system-status` - 2个定义位置
- `/system/backups` - 2个定义位置
- `/system/cleanup` - 2个定义位置
- `/system/logs` - 2个定义位置
- `/system/logs/batch` - 2个定义位置
- `/system/logs/clear` - 2个定义位置
- `/system/logs/export` - 2个定义位置
- `/system/logs/{id}` - 4个定义位置
- `/system/overview` - 2个定义位置
- `/system/settings` - 4个定义位置
- `/system/{category}/{subtype}/{filename}` - 2个定义位置
- `/tables` - 2个定义位置
- `/tables/{tablename}` - 2个定义位置
- `/tables/{tablename}/indexes` - 2个定义位置
- `/tables/{tablename}/relations` - 2个定义位置
- `/task-comments/{commentid}` - 2个定义位置
- `/tasks` - 8个定义位置
- `/tasks/batch-complete` - 2个定义位置
- `/tasks/batch-delete` - 2个定义位置
- `/tasks/stats` - 2个定义位置
- `/tasks/{id}` - 6个定义位置
- `/tasks/{id}/execute` - 2个定义位置
- `/tasks/{id}/history` - 2个定义位置
- `/tasks/{id}/stop` - 2个定义位置
- `/tasks/{taskid}/attachments` - 4个定义位置
- `/tasks/{taskid}/attachments/batch` - 2个定义位置
- `/tasks/{taskid}/attachments/{attachmentid}` - 2个定义位置
- `/tasks/{taskid}/attachments/{attachmentid}/download` - 2个定义位置
- `/tasks/{taskid}/status` - 2个定义位置
- `/teacher-capacity` - 2个定义位置
- `/teacher/customer-applications` - 4个定义位置
- `/teacher/overview` - 2个定义位置
- `/teachers` - 4个定义位置
- `/teachers/batch` - 4个定义位置
- `/teachers/export` - 2个定义位置
- `/teachers/search` - 2个定义位置
- `/teachers/{id}` - 6个定义位置
- `/teachers/{teacherid}/assign-class` - 2个定义位置
- `/teaching-integration` - 2个定义位置
- `/teaching/classes` - 2个定义位置
- `/teaching/classes/{id}` - 2个定义位置
- `/teaching/progress` - 2个定义位置
- `/teaching/progress/{id}` - 2个定义位置
- `/teaching/records` - 4个定义位置
- `/teaching/stats` - 2个定义位置
- `/teaching/students` - 2个定义位置
- `/teaching/students/{id}` - 2个定义位置
- `/template` - 2个定义位置
- `/template-ranking` - 2个定义位置
- `/template/{entitytype}` - 2个定义位置
- `/templates` - 6个定义位置
- `/templates/{id}` - 4个定义位置
- `/templates/{templateid}/create-task` - 2个定义位置
- `/tenant/{phone}/{filetype}/{filename}` - 2个定义位置
- `/test` - 6个定义位置
- `/test-direct` - 2个定义位置
- `/test-oss-url` - 2个定义位置
- `/test-route` - 2个定义位置
- `/test/database` - 2个定义位置
- `/test/email` - 4个定义位置
- `/test/sms` - 2个定义位置
- `/text-to-video` - 2个定义位置
- `/thinking-sse` - 2个定义位置
- `/thinking-stream/{sessionid}` - 2个定义位置
- `/thinking-stream/{taskid}` - 2个定义位置
- `/thinking/{taskid}` - 2个定义位置
- `/threats` - 2个定义位置
- `/threats/{id}/handle` - 2个定义位置
- `/timeline` - 4个定义位置
- `/today` - 2个定义位置
- `/today-courses` - 2个定义位置
- `/today-payments` - 2个定义位置
- `/today-tasks` - 2个定义位置
- `/todos` - 4个定义位置
- `/todos/{id}` - 2个定义位置
- `/todos/{id}/status` - 2个定义位置
- `/toggle` - 2个定义位置
- `/tool/{toolname}` - 2个定义位置
- `/totalcalls` - 1个定义位置
- `/totalcost` - 2个定义位置
- `/track-conversion` - 2个定义位置
- `/track-visit` - 2个定义位置
- `/trend` - 4个定义位置
- `/trends` - 8个定义位置
- `/types` - 4个定义位置
- `/types/active` - 2个定义位置
- `/types/batch-delete` - 2个定义位置
- `/types/{id}` - 6个定义位置
- `/ui-config` - 2个定义位置
- `/unfinished` - 2个定义位置
- `/unified-chat` - 2个定义位置
- `/unified-chat-direct` - 2个定义位置
- `/unified-chat-stream` - 2个定义位置
- `/unified-intelligence` - 2个定义位置
- `/unread-count` - 2个定义位置
- `/unread/count` - 2个定义位置
- `/update-doubao-params` - 2个定义位置
- `/upgrade` - 2个定义位置
- `/upload` - 6个定义位置
- `/upload-avatar` - 2个定义位置
- `/upload-image` - 2个定义位置
- `/upload-images` - 2个定义位置
- `/upload-multiple` - 2个定义位置
- `/usage` - 2个定义位置
- `/usage/stats` - 2个定义位置
- `/user` - 2个定义位置
- `/user-agent` - 4个定义位置
- `/user-permissions` - 2个定义位置
- `/user-stats` - 2个定义位置
- `/user/history` - 2个定义位置
- `/user/{userid}` - 6个定义位置
- `/user/{userid}/bill` - 2个定义位置
- `/user/{userid}/detail` - 2个定义位置
- `/user/{userid}/export` - 2个定义位置
- `/user/{userid}/trend` - 2个定义位置
- `/users` - 8个定义位置
- `/users/{userid}/primary-role` - 2个定义位置
- `/users/{userid}/role-history` - 2个定义位置
- `/users/{userid}/roles` - 6个定义位置
- `/users/{userid}/roles/{roleid}/validity` - 2个定义位置
- `/validate` - 2个定义位置
- `/validate/{filename}` - 2个定义位置
- `/version` - 4个定义位置
- `/viral-spread` - 2个定义位置
- `/voices` - 2个定义位置
- `/vos-config/test` - 2个定义位置
- `/vulnerabilities` - 2个定义位置
- `/warmup` - 2个定义位置
- `/warmup-cache` - 2个定义位置
- `/warnings` - 2个定义位置
- `/{activityid}/export` - 2个定义位置
- `/{activityid}/phone` - 2个定义位置
- `/{activityid}/poster/generate` - 2个定义位置
- `/{activityid}/poster/preview` - 2个定义位置
- `/{activityid}/posters` - 2个定义位置
- `/{activityid}/publish` - 2个定义位置
- `/{activityid}/share` - 2个定义位置
- `/{activityid}/share/stats` - 2个定义位置
- `/{activityid}/stats` - 2个定义位置
- `/{applicationid}/materials` - 4个定义位置
- `/{customerid}/follow` - 2个定义位置
- `/{customerid}/follow-records` - 2个定义位置
- `/{customerid}/status` - 2个定义位置
- `/{filename}` - 2个定义位置
- `/{gamekey}` - 2个定义位置
- `/{gamekey}/leaderboard` - 2个定义位置
- `/{gamekey}/levels` - 2个定义位置
- `/{groupid}` - 2个定义位置
- `/{groupid}/users` - 4个定义位置
- `/{groupid}/users/{userid}` - 4个定义位置
- `/{id}` - 608个定义位置
- `/{id}/absent` - 2个定义位置
- `/{id}/activities` - 2个定义位置
- `/{id}/add-kindergarten` - 2个定义位置
- `/{id}/adjust` - 2个定义位置
- `/{id}/apply` - 2个定义位置
- `/{id}/approve` - 2个定义位置
- `/{id}/assign` - 2个定义位置
- `/{id}/assignees` - 2个定义位置
- `/{id}/cancel` - 4个定义位置
- `/{id}/change-password` - 2个定义位置
- `/{id}/check-in` - 2个定义位置
- `/{id}/children` - 2个定义位置
- `/{id}/classes` - 4个定义位置
- `/{id}/comments` - 4个定义位置
- `/{id}/communications` - 2个定义位置
- `/{id}/complete` - 4个定义位置
- `/{id}/config` - 2个定义位置
- `/{id}/confirm` - 2个定义位置
- `/{id}/convert` - 2个定义位置
- `/{id}/delivered` - 2个定义位置
- `/{id}/documents` - 4个定义位置
- `/{id}/download` - 4个定义位置
- `/{id}/elements` - 2个定义位置
- `/{id}/elements/{elementid}` - 4个定义位置
- `/{id}/end` - 2个定义位置
- `/{id}/enrollment` - 2个定义位置
- `/{id}/export` - 8个定义位置
- `/{id}/feedback` - 2个定义位置
- `/{id}/follow-up` - 2个定义位置
- `/{id}/follow-ups` - 2个定义位置
- `/{id}/growth-records` - 2个定义位置
- `/{id}/interview` - 2个定义位置
- `/{id}/launch` - 4个定义位置
- `/{id}/messages` - 4个定义位置
- `/{id}/parents` - 2个定义位置
- `/{id}/pause` - 6个定义位置
- `/{id}/payment` - 4个定义位置
- `/{id}/performance` - 2个定义位置
- `/{id}/preview` - 4个定义位置
- `/{id}/progress` - 4个定义位置
- `/{id}/publish` - 4个定义位置
- `/{id}/re-execute` - 2个定义位置
- `/{id}/read` - 4个定义位置
- `/{id}/registrations` - 2个定义位置
- `/{id}/remove-from-class` - 2个定义位置
- `/{id}/remove-kindergarten` - 2个定义位置
- `/{id}/reply` - 2个定义位置
- `/{id}/resend` - 2个定义位置
- `/{id}/response` - 2个定义位置
- `/{id}/resume` - 2个定义位置
- `/{id}/review` - 8个定义位置
- `/{id}/roi` - 2个定义位置
- `/{id}/rules` - 2个定义位置
- `/{id}/save` - 2个定义位置
- `/{id}/send` - 2个定义位置
- `/{id}/share` - 4个定义位置
- `/{id}/share-hierarchy` - 2个定义位置
- `/{id}/statistics` - 8个定义位置
- `/{id}/stats` - 4个定义位置
- `/{id}/status` - 12个定义位置
- `/{id}/students` - 4个定义位置
- `/{id}/submit` - 2个定义位置
- `/{id}/test` - 2个定义位置
- `/{id}/toggle` - 6个定义位置
- `/{id}/trackings` - 4个定义位置
- `/{id}/use` - 4个定义位置
- `/{id}/validate` - 2个定义位置
- `/{id}/verify` - 2个定义位置
- `/{id}/versions` - 4个定义位置
- `/{kindergartenid}` - 2个定义位置
- `/{kindergartenid}/ai-format` - 2个定义位置
- `/{kindergartenid}/refresh` - 2个定义位置
- `/{messageid}` - 2个定义位置
- `/{messageid}/metadata` - 2个定义位置
- `/{modelid}/billing` - 2个定义位置
- `/{module}` - 2个定义位置
- `/{name}` - 4个定义位置
- `/{notificationid}/export` - 2个定义位置
- `/{notificationid}/readers` - 2个定义位置
- `/{pageid}` - 2个定义位置
- `/{pageid}/stats` - 2个定义位置
- `/{pageid}/submit` - 2个定义位置
- `/{parentid}/students/{studentid}` - 2个定义位置
- `/{recordid}/complete` - 2个定义位置
- `/{sessionid}` - 2个定义位置
- `/{sessionid}/action-plan` - 2个定义位置
- `/{sessionid}/end` - 2个定义位置
- `/{sessionid}/next` - 2个定义位置
- `/{sessionid}/progress` - 2个定义位置
- `/{sessionid}/status` - 4个定义位置
- `/{sessionid}/stream-speech` - 2个定义位置
- `/{sessionid}/summary` - 2个定义位置
- `/{taskid}` - 2个定义位置
- `/{taskid}/status` - 2个定义位置
- `/{token}` - 2个定义位置
- `/{userid}/permissions` - 4个定义位置
- `/{userid}/settings` - 4个定义位置

## 💡 修复建议

1. **严重冲突**: 前后端完全相同的端点，需要明确职责分工
2. **相似端点**: 功能重叠的端点，建议合并或明确区分
3. **命名规范**: 建立统一的API命名规范
4. **文档同步**: 确保前后端API文档保持同步
5. **代码审查**: 建立API设计的代码审查流程

