# 模型初始化顺序指南

## 模型依赖关系

- ActivityArrangement 依赖于: ActivityPlan, User
- ActivityEvaluation 依赖于: 无依赖
- ActivityPlan 依赖于: Kindergarten, User
- ActivityRegistration 依赖于: 无依赖
- ActivityResource 依赖于: User, ActivityArrangement
- ActivityStaff 依赖于: User, ActivityArrangement
- Activity 依赖于: 无依赖
- AdmissionNotification 依赖于: 无依赖
- AdmissionResult 依赖于: models
- Advertisement 依赖于: 无依赖
- AiConversation 依赖于: 无依赖
- AiMemory 依赖于: 无依赖
- AiMessage 依赖于: 无依赖
- AiModelBilling 依赖于: 无依赖
- AiModelConfig 依赖于: 无依赖
- AiModelUsageFixed 依赖于: 无依赖
- AiModelUsage 依赖于: 无依赖
- AiUserPermission 依赖于: 无依赖
- AiUserRelation 依赖于: 无依赖
- Base 依赖于: 无依赖
- ChannelTracking 依赖于: 无依赖
- ClassTeacher 依赖于: 无依赖
- Class 依赖于: 无依赖
- ConversionTracking 依赖于: 无依赖
- Coupon 依赖于: 无依赖
- Dashboard 依赖于: 无依赖
- EnrollmentApplicationMaterial 依赖于: 无依赖
- EnrollmentApplication 依赖于: 无依赖
- EnrollmentConsultationFollowup 依赖于: 无依赖
- EnrollmentConsultation 依赖于: 无依赖
- EnrollmentPlanAssignee 依赖于: User, EnrollmentPlan
- EnrollmentPlanClass 依赖于: Class, EnrollmentPlan
- EnrollmentPlanTracking 依赖于: EnrollmentPlan, User, EnrollmentPlanTracking
- EnrollmentPlan 依赖于: User
- EnrollmentQuota 依赖于: 无依赖
- EnrollmentTask 依赖于: 无依赖
- FileStorage 依赖于: User
- Kindergarten 依赖于: 无依赖
- MarketingCampaign 依赖于: 无依赖
- MessageRecord 依赖于: MessageTemplate, User
- MessageTemplate 依赖于: User
- Notification 依赖于: 无依赖
- OperationLog 依赖于: User
- ParentFollowup 依赖于: 无依赖
- Parent 依赖于: 无依赖
- Permission 依赖于: Permission
- PosterElement 依赖于: PosterTemplate, PosterElement
- PosterGeneration 依赖于: User, PosterTemplate
- PosterTemplate 依赖于: User
- RolePermission 依赖于: 无依赖
- Role 依赖于: Permission
- Student 依赖于: models
- SystemConfig 依赖于: User
- SystemLog 依赖于: 无依赖
- Teacher 依赖于: 无依赖
- UserProfile 依赖于: UserProfile, User
- UserRole 依赖于: 无依赖
- User 依赖于: Role

## 推荐初始化顺序

由于循环依赖，无法自动确定初始化顺序。请参考手动定义的顺序。

## 正确初始化步骤

1. 在项目中使用生成的init.ts文件
2. 确保在app.ts中首先导入初始化脚本
3. 在服务器启动前完成所有模型的初始化
4. 服务器启动后再建立模型之间的关联关系

## 注意事项

- 避免在模型定义中直接使用其他模型类型，可以使用字符串表示模型名称
- 使用静态初始化方法接收sequelize实例，避免直接导入
- 分离模型定义和关联建立，先定义所有模型，再建立关联
