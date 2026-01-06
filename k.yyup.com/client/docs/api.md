# API文档

本文档自动生成，包含所有API接口的详细说明。

## 目录

- [activity-center](#activity-center)
- [activity-planner](#activity-planner)
- [activity](#activity)
- [advertisement](#advertisement)
- [function-tools](#function-tools)
- [ai-assistant-optimized](#ai-assistant-optimized)
- [ai-memory](#ai-memory)
- [ai-model-config](#ai-model-config)
- [ai-model](#ai-model)
- [ai-shortcuts](#ai-shortcuts)
- [ai](#ai)
- [api-rules](#api-rules)
- [auth](#auth)
- [auto-image](#auto-image)
- [chat](#chat)
- [class](#class)
- [dashboard](#dashboard)
- [activity](#activity)
- [ai](#ai)
- [auth](#auth)
- [base](#base)
- [business](#business)
- [dashboard](#dashboard)
- [enrollment](#enrollment)
- [file](#file)
- [function-tools](#function-tools)
- [index](#index)
- [marketing](#marketing)
- [statistics](#statistics)
- [system](#system)
- [user](#user)
- [utils](#utils)
- [websiteAutomation](#websiteautomation)
- [endpoints](#endpoints)
- [enrollment-center](#enrollment-center)
- [enrollment-plan](#enrollment-plan)
- [enrollment-quota](#enrollment-quota)
- [example-api](#example-api)
- [expert-consultation](#expert-consultation)
- [fix-api-types](#fix-api-types)
- [index](#index)
- [interceptors](#interceptors)
- [activity-poster](#activity-poster)
- [activity](#activity)
- [advertisement](#advertisement)
- [ai-enrollment](#ai-enrollment)
- [ai-query](#ai-query)
- [ai](#ai)
- [analytics](#analytics)
- [application](#application)
- [attendance](#attendance)
- [auth-permissions](#auth-permissions)
- [auth](#auth)
- [chat](#chat)
- [class](#class)
- [customer](#customer)
- [dashboard](#dashboard)
- [enrollment-ai](#enrollment-ai)
- [enrollment-plan](#enrollment-plan)
- [enrollment](#enrollment)
- [enrollmentFinance](#enrollmentfinance)
- [finance](#finance)
- [log](#log)
- [marketing](#marketing)
- [notification](#notification)
- [parent](#parent)
- [permission](#permission)
- [poster](#poster)
- [principal](#principal)
- [role](#role)
- [script](#script)
- [statistics](#statistics)
- [student](#student)
- [system](#system)
- [teacher](#teacher)
- [user](#user)
- [personnel-center](#personnel-center)
- [security](#security)
- [system](#system)
- [task-center](#task-center)
- [upload](#upload)

---

## activity-center

**文件路径**: `.\src\api\activity-center.ts`

**描述**: 活动中心API接口

### 导出函数

- `getActivityOverview`
- `getActivityDistribution`
- `getActivityTrend`
- `getActivities`
- `getActivityDetail`
- `createActivity`
- `updateActivity`
- `deleteActivity`
- `publishActivity`
- `cancelActivity`
- `getRegistrations`
- `getRegistrationDetail`
- `approveRegistration`
- `batchApproveRegistrations`
- `getActivityAnalytics`
- `getActivityReport`
- `getParticipationAnalysis`
- `getNotifications`
- `sendActivityNotification`
- `getNotificationTemplates`
- `createNotificationTemplate`
- `updateNotificationTemplate`
- `deleteNotificationTemplate`

### 类型定义

- `ActivityOverview`
- `ActivityDistribution`
- `ActivityTrend`
- `Activity`
- `Registration`
- `ActivityAnalytics`
- `Notification`
- `NotificationTemplate`

---

## activity-planner

**文件路径**: `.\src\api\activity-planner.ts`

**描述**: 活动策划API服务

### 导出函数

- `generateActivityPlan`
- `getPlanningStats`
- `getAvailableModels`
- `activityPlannerApi`

### 类型定义

- `ActivityPlanningRequest`
- `ActivityPlanningResult`
- `AIModelInfo`
- `AvailableModels`
- `PlanningStats`

---

## activity

**文件路径**: `.\src\api\activity.ts`

**描述**: 活动状态枚举

### 导出函数

- `activityApi`
- `updateActivityStatus`
- `batchDeleteActivities`
- `uploadActivityCover`

### 类型定义

- `Activity`
- `ActivityCreateParams`
- `ActivityQueryParams`

---

## advertisement

**文件路径**: `.\src\api\advertisement.ts`

**描述**: 广告管理API服务

### 导出函数

- `advertisementApi`

---

## function-tools

**文件路径**: `.\src\api\ai\function-tools.js`

### 导出函数

- `functionToolsApi`

---

## ai-assistant-optimized

**文件路径**: `.\src\api\ai-assistant-optimized.ts`

**描述**: AI助手优化API接口

### 导出函数

- `AIAssistantOptimizedAPI`
- `aiAssistantOptimizedApi`

---

## ai-memory

**文件路径**: `.\src\api\ai-memory.ts`

### 导出函数

- `createMemory`
- `createMemoryWithEmbedding`
- `findSimilarMemories`
- `searchMemories`
- `getConversationMemories`
- `getMemory`
- `updateMemory`
- `deleteMemory`
- `getMemoryStats`
- `archiveToLongTerm`
- `cleanupExpiredMemories`

---

## ai-model-config

**文件路径**: `.\src\api\ai-model-config.ts`

**描述**: 获取所有AI模型列表

### 导出函数

- `AI_MODEL_ENDPOINTS`
- `getAIModels`
- `getDefaultAIModel`
- `getAIModelStats`
- `getAvailableProviders`
- `getProviderModels`
- `getDefaultAIConfig`
- `getModelsByType`
- `getFirstAvailableTextModel`
- `getModelCapabilities`
- `checkModelCapability`
- `getProviderOptions`
- `getModelOptions`
- `initializeAIConfig`

### 类型定义

- `AIModel`
- `AIProvider`
- `AIModelStats`
- `DefaultAIConfig`

---

## ai-model

**文件路径**: `.\src\api\ai-model.ts`

### 导出函数

- `getModels`
- `getModelBilling`
- `createModel`
- `updateModel`
- `deleteModel`
- `setDefaultModel`
- `toggleModelStatus`

---

## ai-shortcuts

**文件路径**: `.\src\api\ai-shortcuts.ts`

**描述**: AI快捷操作数据类型

### 导出函数

- `getAIShortcuts`
- `getUserShortcuts`
- `getAIShortcutById`
- `getShortcutConfig`
- `createAIShortcut`
- `updateAIShortcut`
- `deleteAIShortcut`
- `batchDeleteAIShortcuts`
- `updateSortOrder`
- `CATEGORY_OPTIONS`
- `ROLE_OPTIONS`
- `API_ENDPOINT_OPTIONS`
- `getCategoryLabel`
- `getRoleLabel`
- `getApiEndpointLabel`
- `validatePromptName`
- `generateDefaultSortOrder`

### 类型定义

- `AIShortcut`
- `AIShortcutQuery`
- `AIShortcutForm`
- `AIShortcutListResponse`

---

## ai

**文件路径**: `.\src\api\ai.ts`

**描述**: AI模型信息

### 导出函数

- `aiApi`
- `createMemory`
- `getConversationMemories`
- `deleteMemory`
- `summarizeConversation`
- `createMemoryWithEmbedding`
- `searchSimilarMemories`
- `searchMemoriesByTimeRange`
- `searchLastMonthMemories`

---

## api-rules

**文件路径**: `.\src\api\api-rules.ts`

**描述**: API实现示例

### 导出函数

- `goodApiExample`
- `badApiExample`

---

## auth

**文件路径**: `.\src\api\auth.ts`

**描述**: 用户登录请求参数

### 导出函数

- `authApi`

### 类型定义

- `LoginRequest`
- `User`
- `LoginResponse`
- `ApiResponse`

---

## auto-image

**文件路径**: `.\src\api\auto-image.ts`

**描述**: 自动配图API类

### 导出函数

- `AutoImageApi`
- `autoImageApi`

### 类型定义

- `ImageGenerationRequest`
- `ImageGenerationResult`
- `ActivityImageRequest`
- `PosterImageRequest`
- `TemplateImageRequest`
- `BatchImageRequest`
- `BatchImageResult`
- `ServiceStatus`

---

## chat

**文件路径**: `.\src\api\chat.ts`

**描述**: 获取所有会话列表

### 导出函数

- `chatApi`

---

## class

**文件路径**: `.\src\api\class.ts`

**描述**: 班级管理相关API

### 导出函数

- `getClassList`
- `getClassDetail`
- `createClass`
- `updateClass`
- `deleteClass`
- `getClassStudents`
- `getClassTeachers`
- `assignStudentsToClass`
- `assignTeachersToClass`
- `setHeadTeacher`
- `getClassSchedule`
- `updateClassSchedule`
- `getAvailableClasses`
- `getClassStatistics`
- `classApi`

---

## dashboard

**文件路径**: `.\src\api\dashboard.ts`

**描述**: 数据分析仪表盘API服务

---

## activity

**文件路径**: `.\src\api\endpoints\activity.ts`

**描述**: 活动管理相关API端点

### 导出函数

- `ACTIVITY_ENDPOINTS`
- `ACTIVITY_PLAN_ENDPOINTS`
- `ACTIVITY_REGISTRATION_ENDPOINTS`
- `ACTIVITY_CHECKIN_ENDPOINTS`
- `ACTIVITY_EVALUATION_ENDPOINTS`
- `ACTIVITY_TEMPLATE_ENDPOINTS`

---

## ai

**文件路径**: `.\src\api\endpoints\ai.ts`

**描述**: AI功能相关API端点

### 导出函数

- `AI_ENDPOINTS`
- `AI_MEMORY_ENDPOINTS`
- `AI_MODEL_ENDPOINTS`
- `AI_ANALYSIS_ENDPOINTS`
- `AI_RECOMMENDATION_ENDPOINTS`
- `AI_QUOTA_ENDPOINTS`

---

## auth

**文件路径**: `.\src\api\endpoints\auth.ts`

**描述**: 认证相关API端点

### 导出函数

- `AUTH_ENDPOINTS`

---

## base

**文件路径**: `.\src\api\endpoints\base.ts`

**描述**: 基础API端点配置

### 导出函数

- `API_PREFIX`

### 类型定义

- `ApiResponse`
- `PaginationParams`
- `BaseSearchParams`

---

## business

**文件路径**: `.\src\api\endpoints\business.ts`

**描述**: 业务核心功能相关API端点

### 导出函数

- `KINDERGARTEN_ENDPOINTS`
- `CLASS_ENDPOINTS`
- `TEACHER_ENDPOINTS`
- `STUDENT_ENDPOINTS`
- `PARENT_ENDPOINTS`

---

## dashboard

**文件路径**: `.\src\api\endpoints\dashboard.ts`

**描述**: 仪表盘相关API端点

### 导出函数

- `DASHBOARD_ENDPOINTS`
- `NOTIFICATION_ENDPOINTS`
- `TODO_ENDPOINTS`
- `SCHEDULE_ENDPOINTS`

---

## enrollment

**文件路径**: `.\src\api\endpoints\enrollment.ts`

**描述**: 招生管理相关API端点

### 导出函数

- `ENROLLMENT_PLAN_ENDPOINTS`
- `ENROLLMENT_QUOTA_ENDPOINTS`
- `ENROLLMENT_APPLICATION_ENDPOINTS`
- `ENROLLMENT_CONSULTATION_ENDPOINTS`
- `ENROLLMENT_CHANNEL_ENDPOINTS`
- `ENROLLMENT_ACTIVITY_ENDPOINTS`

---

## file

**文件路径**: `.\src\api\endpoints\file.ts`

**描述**: 文件管理相关API端点

### 导出函数

- `FILE_UPLOAD_ENDPOINTS`
- `FILE_MANAGEMENT_ENDPOINTS`
- `FOLDER_ENDPOINTS`
- `STORAGE_ENDPOINTS`
- `IMAGE_PROCESSING_ENDPOINTS`
- `DOCUMENT_PROCESSING_ENDPOINTS`

---

## function-tools

**文件路径**: `.\src\api\endpoints\function-tools.ts`

### 导出函数

- `callUnifiedIntelligence`
- `callUnifiedIntelligenceStream`
- `getUnifiedSystemStatus`
- `getUnifiedSystemCapabilities`
- `executeFunctionCalls`
- `smartChat`
- `getAvailableTools`
- `executeSingleFunction`
- `queryPastActivities`
- `getActivityStatistics`
- `queryEnrollmentHistory`
- `analyzeBusinessTrends`
- `callDirectChat`
- `callDirectChatSSE`

### 类型定义

- `FunctionCall`
- `FunctionToolResult`
- `AvailableTool`
- `AvailableToolsResponse`
- `SmartChatMessage`
- `SmartChatRequest`
- `SmartChatResponse`

---

## index

**文件路径**: `.\src\api\endpoints\index.ts`

---

## marketing

**文件路径**: `.\src\api\endpoints\marketing.ts`

**描述**: 营销管理相关API端点

### 导出函数

- `MARKETING_CAMPAIGN_ENDPOINTS`
- `CHANNEL_TRACKING_ENDPOINTS`
- `CONVERSION_TRACKING_ENDPOINTS`
- `ADVERTISEMENT_ENDPOINTS`
- `POSTER_ENDPOINTS`
- `POSTER_TEMPLATE_ENDPOINTS`
- `MARKETING_ANALYSIS_ENDPOINTS`
- `MARKETING_AUTOMATION_ENDPOINTS`

---

## statistics

**文件路径**: `.\src\api\endpoints\statistics.ts`

**描述**: 统计分析相关API端点

### 导出函数

- `STATISTICS_ENDPOINTS`
- `ANALYSIS_ENDPOINTS`
- `CUSTOMER_ENDPOINTS`
- `RISK_ENDPOINTS`
- `METRICS_ENDPOINTS`

---

## system

**文件路径**: `.\src\api\endpoints\system.ts`

**描述**: 系统管理相关API端点

### 导出函数

- `SYSTEM_LOG_ENDPOINTS`
- `SYSTEM_SETTINGS_ENDPOINTS`
- `SYSTEM_BACKUP_ENDPOINTS`
- `MESSAGE_TEMPLATE_ENDPOINTS`
- `AI_MODEL_CONFIG_ENDPOINTS`
- `SYSTEM_MONITOR_ENDPOINTS`

---

## user

**文件路径**: `.\src\api\endpoints\user.ts`

**描述**: 用户管理相关API端点

### 导出函数

- `USER_ENDPOINTS`
- `ROLE_ENDPOINTS`
- `PERMISSION_ENDPOINTS`

---

## utils

**文件路径**: `.\src\api\endpoints\utils.ts`

**描述**: 通用工具相关API端点

### 导出函数

- `UTILS_ENDPOINTS`
- `IMPORT_EXPORT_ENDPOINTS`
- `REPORT_ENDPOINTS`

---

## websiteAutomation

**文件路径**: `.\src\api\endpoints\websiteAutomation.ts`

**描述**: 网站自动化API接口

### 导出函数

- `taskApi`
- `templateApi`
- `webOperationApi`
- `statisticsApi`
- `websiteAutomationApi`

### 类型定义

- `AutomationTask`
- `AutomationTemplate`
- `ExecutionHistory`
- `ScreenshotResult`
- `ElementAnalysisResult`
- `SmartSearchResult`
- `AutomationStatistics`

---

## endpoints

**文件路径**: `.\src\api\endpoints.ts`

### 导出函数

- `ENROLLMENT_ENDPOINTS`
- `PRINCIPAL_ENDPOINTS`
- `AUTH_ENDPOINTS`
- `USER_ENDPOINTS`
- `ROLE_ENDPOINTS`
- `PERMISSION_ENDPOINTS`
- `DASHBOARD_ENDPOINTS`
- `KINDERGARTEN_ENDPOINTS`
- `CLASS_ENDPOINTS`
- `TEACHER_ENDPOINTS`
- `STUDENT_ENDPOINTS`
- `PARENT_ENDPOINTS`
- `NOTIFICATION_ENDPOINTS_10`
- `SCHEDULE_ENDPOINTS`
- `TODO_ENDPOINTS`
- `FILE_ENDPOINTS_12`
- `SYSTEM_TEST_ENDPOINTS`
- `SYSTEM_BACKUP_ENDPOINTS`
- `OPERATION_LOG_ENDPOINTS`
- `ADVERTISEMENT_ENDPOINTS_2`
- `MARKETING_CAMPAIGN_ENDPOINTS_3`
- `CHANNEL_TRACKING_ENDPOINTS_4`
- `CONVERSION_TRACKING_ENDPOINTS_5`
- `ADMISSION_RESULT_ENDPOINTS_6`
- `ADMISSION_NOTIFICATION_ENDPOINTS_7`
- `POSTER_TEMPLATE_ENDPOINTS_8`
- `POSTER_GENERATION_ENDPOINTS_9`
- `PERFORMANCE_RULE_ENDPOINTS`
- `PERFORMANCE_ENDPOINTS`
- `SYSTEM_CONFIG_ENDPOINTS`
- `SYSTEM_AI_MODEL_ENDPOINTS`
- `ENROLLMENT_TASK_ENDPOINTS`
- `MESSAGE_TEMPLATE_ENDPOINTS_11`
- `CHAT_ENDPOINTS`
- `EXAMPLE_ENDPOINTS`
- `ERROR_ENDPOINTS`
- `ADVERTISEMENT_ENDPOINTS`
- `PRINCIPAL_PERFORMANCE_ENDPOINTS`
- `MARKETING_CAMPAIGN_ENDPOINTS`
- `CHANNEL_TRACKING_ENDPOINTS`
- `CONVERSION_TRACKING_ENDPOINTS`
- `ADMISSION_RESULT_ENDPOINTS`
- `ADMISSION_NOTIFICATION_ENDPOINTS`
- `POSTER_TEMPLATE_ENDPOINTS`
- `POSTER_GENERATION_ENDPOINTS`
- `SYSTEM_ENDPOINTS`
- `SYSTEM_USER_ENDPOINTS`
- `SYSTEM_ROLE_ENDPOINTS`
- `SYSTEM_PERMISSION_ENDPOINTS`
- `SYSTEM_SETTINGS_ENDPOINTS`
- `SYSTEM_LOG_ENDPOINTS`
- `UPLOAD_ENDPOINTS`
- `AI_MEMORY_ENDPOINTS`
- `AI_ENDPOINTS`
- `ACTIVITY_PLANNER_ENDPOINTS`
- `MARKETING_AUTOMATION_ENDPOINTS`
- `CUSTOMER_LIFECYCLE_ENDPOINTS`
- `ACTIVITY_ANALYTICS_ENDPOINTS`
- `DECISION_SUPPORT_ENDPOINTS`
- `EXPERT_CONSULTATION_ENDPOINTS`
- `SMART_EXPERT_ENDPOINTS`
- `ATTENDANCE_ENDPOINTS`
- `ENROLLMENT_STATISTICS_ENDPOINTS`
- `STATISTICS_ENDPOINTS`
- `ANALYSIS_ENDPOINTS`
- `CUSTOMER_ENDPOINTS`
- `RISK_ENDPOINTS`
- `METRICS_ENDPOINTS`
- `MARKETING_ENDPOINTS`
- `BACKUP_ENDPOINTS`
- `ENROLLMENT_FOLLOW_ENDPOINTS`
- `NOTIFICATION_ENDPOINTS`
- `MESSAGE_TEMPLATE_ENDPOINTS`
- `FILE_ENDPOINTS`

---

## enrollment-center

**文件路径**: `.\src\api\enrollment-center.ts`

**描述**: 获取招生中心概览数据

### 导出函数

- `EnrollmentCenterAPI`
- `getEnrollmentOverview`
- `getEnrollmentPlans`
- `getEnrollmentPlanDetail`
- `createEnrollmentPlan`
- `updateEnrollmentPlan`
- `deleteEnrollmentPlan`
- `getEnrollmentApplications`
- `getEnrollmentApplicationDetail`
- `updateApplicationStatus`
- `getEnrollmentConsultations`
- `getConsultationStatistics`
- `getAnalyticsTrends`
- `getAnalyticsFunnel`
- `getAnalyticsRegions`
- `getAnalyticsMetrics`
- `aiPredict`
- `aiStrategy`
- `aiCapacityAnalysis`

### 类型定义

- `OverviewStatistics`
- `OverviewCharts`
- `OverviewData`
- `EnrollmentPlan`
- `PlanQuery`
- `CreatePlanData`
- `EnrollmentApplication`
- `ApplicationQuery`
- `ConsultationStatistics`
- `AnalyticsMetrics`
- `AIPrediction`
- `AIStrategy`

---

## enrollment-plan

**文件路径**: `.\src\api\enrollment-plan.ts`

**描述**: 招生计划API服务

### 导出函数

- `getEnrollmentPlans`
- `getEnrollmentPlan`
- `createEnrollmentPlan`
- `updateEnrollmentPlan`
- `deleteEnrollmentPlan`
- `getEnrollmentPlanStatistics`
- `getEnrollmentPlanQuotas`
- `updateEnrollmentPlanQuotas`
- `getQuotaUsageHistory`
- `publishEnrollmentPlan`
- `cancelEnrollmentPlan`
- `completeEnrollmentPlan`
- `getEnrollmentAnalytics`
- `getEnrollmentPlanOverview`
- `exportEnrollmentPlanData`
- `setEnrollmentPlanClasses`
- `setEnrollmentPlanAssignees`
- `getEnrollmentPlanTrackings`
- `addEnrollmentPlanTracking`
- `updateEnrollmentPlanStatus`
- `getEnrollmentPlanClasses`
- `getAllEnrollmentPlanStatistics`
- `copyEnrollmentPlan`
- `exportEnrollmentPlans`
- `mockEnrollmentPlans`
- `enrollmentPlanApi`

---

## enrollment-quota

**文件路径**: `.\src\api\enrollment-quota.ts`

### 导出函数

- `getEnrollmentQuotas`
- `getEnrollmentQuota`
- `createEnrollmentQuota`
- `batchCreateEnrollmentQuotas`
- `updateEnrollmentQuota`
- `deleteEnrollmentQuota`
- `batchAdjustEnrollmentQuota`
- `getQuotasByPlanId`
- `allocateEnrollmentQuota`
- `getEnrollmentQuotaStatistics`
- `allocateQuotaByAge`
- `exportEnrollmentQuotas`
- `getQuotaAdjustmentHistory`
- `mockEnrollmentQuotas`

---

## example-api

**文件路径**: `.\src\api\example-api.ts`

**描述**: 示例数据项类型定义

### 导出函数

- `exampleApi`

### 类型定义

- `ExampleItem`
- `CreateExampleItemParams`
- `UpdateExampleItemParams`
- `QueryExampleItemsParams`

---

## expert-consultation

**文件路径**: `.\src\api\expert-consultation.ts`

**描述**: AI专家咨询API服务

### 导出函数

- `startConsultation`
- `getNextExpertSpeech`
- `getConsultationProgress`
- `getConsultationSummary`
- `generateActionPlan`
- `getConsultationSession`
- `expertConsultationApi`

### 类型定义

- `ConsultationRequest`
- `ConsultationPreferences`
- `ExpertSpeech`
- `ConsultationSession`
- `ConsultationProgress`
- `ConsultationSummary`
- `ActionPlan`
- `ActionItem`
- `BudgetEstimate`

---

## fix-api-types

**文件路径**: `.\src\api\fix-api-types.ts`

### 导出函数

- `convertToSystemApiResponse`
- `wrapApiFunction`
- `getData`

### 类型定义

- `ApiResponse`

---

## index

**文件路径**: `.\src\api\index.ts`

### 导出函数

- `ApiError`
- `API_CONFIG`

### 类型定义

- `ApiResponse`
- `PaginationParams`
- `PaginationResponse`

---

## interceptors

**文件路径**: `.\src\api\interceptors.ts`

---

## activity-poster

**文件路径**: `.\src\api\modules\activity-poster.ts`

**描述**: 为活动生成海报

### 导出函数

- `generateActivityPoster`
- `getActivityPosters`
- `previewActivityPoster`
- `publishActivity`
- `shareActivity`
- `getActivityShareStats`
- `incrementActivityViews`
- `generateActivityQRCode`
- `openShareWindow`
- `generateWeChatShareUrl`
- `generateWeiboShareUrl`
- `generateQQShareUrl`
- `formatShareData`
- `getShareChannelIcon`
- `getShareChannelName`

### 类型定义

- `ActivityPosterData`
- `PosterGenerateData`
- `ShareData`
- `PublishData`
- `ShareStats`
- `ActivityShareResponse`

---

## activity

**文件路径**: `.\src\api\modules\activity.ts`

**描述**: 活动基础信息接口

### 导出函数

- `getActivityList`
- `getActivityDetail`
- `getActivityStatistics`
- `getActivityPlans`
- `getActivityPlanDetail`
- `createActivityPlan`
- `updateActivityPlan`
- `deleteActivityPlan`
- `getActivityPlansByCategory`
- `getActivityPlanRegistrations`
- `getActivityRegistrations`
- `getRegistrationDetail`
- `createRegistration`
- `updateRegistration`
- `deleteRegistration`
- `getRegistrationsByActivity`
- `getRegistrationsByStudent`
- `getActivityCheckins`
- `getCheckinDetail`
- `batchCreateCheckins`
- `getActivityEvaluations`
- `getEvaluationDetail`
- `createEvaluation`
- `updateEvaluation`
- `deleteEvaluation`
- `createActivity`
- `updateActivity`
- `deleteActivity`
- `getActivityRegistrationsOld`
- `updateActivityStatus`

### 类型定义

- `Activity`
- `ActivityParams`
- `ActivityQueryParams`
- `ActivityRegistration`
- `RegistrationParams`
- `ActivityCheckin`
- `ActivityEvaluation`
- `ActivityStatistics`

---

## advertisement

**文件路径**: `.\src\api\modules\advertisement.ts`

**描述**: 广告类型

### 导出函数

- `advertisementApi`
- `getAdvertisements`
- `getAdvertisement`
- `createAdvertisement`
- `updateAdvertisement`
- `deleteAdvertisement`

### 类型定义

- `Advertisement`
- `AdvertisementQueryParams`
- `CreateAdvertisementRequest`
- `AdvertisementStats`

---

## ai-enrollment

**文件路径**: `.\src\api\modules\ai-enrollment.ts`

**描述**: AI招生预测相关接口

### 导出函数

- `aiEnrollmentApi`
- `funnelAnalyticsApi`
- `personalizedStrategyApi`
- `automatedFollowUpApi`
- `aiAnalyticsApi`

### 类型定义

- `CurrentPricing`
- `MarketConditions`
- `DemandForecast`
- `CompetitorPricing`
- `PredictionMetric`
- `InfluencingFactor`
- `ForecastScenario`
- `StrategicRecommendation`
- `EnrollmentForecast`
- `CompetitorAnalysis`
- `PricingRecommendation`
- `FunnelInsight`
- `ConversionOptimization`
- `ABTest`
- `TestRecommendation`
- `CustomerSegment`
- `MarketingChannel`
- `MessagingStrategy`
- `PricingStrategy`
- `PersonalizedStrategy`
- `PersonalizedContent`
- `LeadStage`
- `FollowUpAction`
- `CommunicationChannel`
- `AutomatedFollowUp`
- `AutomationRule`
- `ChurnRisk`

---

## ai-query

**文件路径**: `.\src\api\modules\ai-query.ts`

**描述**: AI查询API模块

### 导出函数

- `AI_QUERY_ENDPOINTS`
- `aiQueryApi`

### 类型定义

- `AIQueryRequest`
- `AIQueryResponse`
- `AIQueryLog`
- `AIQueryTemplate`
- `AIQueryFeedback`
- `AIQuerySuggestion`
- `AIQueryStatistics`
- `PaginationParams`
- `QueryHistoryParams`

---

## ai

**文件路径**: `.\src\api\modules\ai.ts`

**描述**: AI助手类型

### 导出函数

- `aiApi`
- `getAIConversations`
- `createAIConversation`
- `sendAIMessage`
- `getAIModelConfigs`

### 类型定义

- `AIMessage`
- `AIConversation`
- `AIModelConfig`
- `AIAnalysisResult`

---

## analytics

**文件路径**: `.\src\api\modules\analytics.ts`

**描述**: 分析中心API服务

### 类型定义

- `OverviewStats`
- `TrendData`
- `FinancialData`
- `EnrollmentData`
- `TeacherPerformance`

---

## application

**文件路径**: `.\src\api\modules\application.ts`

**描述**: 申请状态枚举

### 导出函数

- `getApplicationList`
- `getApplicationDetail`
- `reviewApplication`
- `batchReviewApplications`
- `getApplicationHistory`
- `sendAdmissionNotice`
- `uploadApplicationAttachments`

### 类型定义

- `Application`
- `ApplicationQueryParams`
- `ApplicationReviewParams`

---

## attendance

**文件路径**: `.\src\api\modules\attendance.ts`

**描述**: 考勤管理API

### 导出函数

- `getStudentAttendance`
- `getClassAttendance`
- `createAttendanceRecord`
- `updateAttendanceRecord`
- `getAttendanceStatistics`

---

## auth-permissions

**文件路径**: `.\src\api\modules\auth-permissions.ts`

**描述**: 权限相关API模块

### 导出函数

- `getUserPermissions`
- `getUserMenu`
- `checkPermission`
- `getUserRoles`

### 类型定义

- `Permission`
- `MenuItem`
- `Role`
- `PermissionCheckResult`

---

## auth

**文件路径**: `.\src\api\modules\auth.ts`

**描述**: 用户登录请求参数

### 导出函数

- `authApi`
- `login`
- `logout`
- `getUserInfo`
- `refreshToken`

### 类型定义

- `LoginRequest`
- `LoginResponse`

---

## chat

**文件路径**: `.\src\api\modules\chat.ts`

**描述**: 聊天消息类型

### 导出函数

- `chatApi`
- `getChatConversations`
- `createChatConversation`
- `getChatMessages`
- `sendChatMessage`

### 类型定义

- `ChatMessage`
- `ChatConversation`
- `ChatQueryParams`
- `SendMessageRequest`
- `CreateConversationRequest`

---

## class

**文件路径**: `.\src\api\modules\class.ts`

**描述**: API响应类型

### 导出函数

- `getClassList`
- `getClassDetail`
- `createClass`
- `updateClass`
- `deleteClass`
- `updateClassStatus`
- `assignTeachers`
- `getClassStudents`
- `addStudentsToClass`
- `removeStudentFromClass`
- `transferStudents`
- `getClassStatistics`
- `getAvailableClassrooms`
- `exportClassData`
- `getStudentAttendance`

### 类型定义

- `Class`
- `ClassStudentBrief`

---

## customer

**文件路径**: `.\src\api\modules\customer.ts`

**描述**: 客户类型

### 导出函数

- `customerApi`
- `getCustomers`
- `getCustomer`
- `createCustomer`
- `updateCustomer`
- `deleteCustomer`

### 类型定义

- `Customer`
- `CustomerQueryParams`
- `CreateCustomerRequest`

---

## dashboard

**文件路径**: `.\src\api\modules\dashboard.ts`

**描述**: 仪表盘统计数据接口 - 对齐后端API响应

### 导出函数

- `getDashboardStats`
- `getDashboardOverview`
- `getTodos`
- `getSchedules`
- `getClassesOverview`
- `getEnrollmentTrends`
- `getActivityData`
- `getChannelAnalysis`
- `getConversionFunnel`
- `getRecentActivities`

### 类型定义

- `DashboardStats`
- `DashboardOverview`
- `RecentActivity`
- `Todo`
- `Schedule`
- `ClassOverview`
- `EnrollmentTrendPoint`
- `EnrollmentTrend`
- `ActivityData`
- `ChannelAnalysis`
- `ConversionFunnel`

---

## enrollment-ai

**文件路径**: `.\src\api\modules\enrollment-ai.ts`

**描述**: AI招生功能API接口

### 导出函数

- `enrollmentAIApi`

### 类型定义

- `SmartPlanningParams`
- `ForecastParams`
- `StrategyParams`
- `SimulationParams`

---

## enrollment-plan

**文件路径**: `.\src\api\modules\enrollment-plan.ts`

**描述**: 招生计划状态枚举

### 导出函数

- `adaptEnrollmentPlan`
- `adaptEnrollmentPlanList`
- `createEnrollmentPlan`
- `updateEnrollmentPlan`
- `deleteEnrollmentPlan`
- `createEnrollmentQuota`
- `batchCreateEnrollmentQuotas`
- `updateEnrollmentQuota`
- `deleteEnrollmentQuota`
- `getEnrollmentAnalytics`
- `updateEnrollmentPlanStatus`
- `exportEnrollmentPlanData`
- `backendStatusMap`
- `enrollmentPlanApi`

### 类型定义

- `BackendEnrollmentPlanResponse`
- `EnrollmentAnalytics`

---

## enrollment

**文件路径**: `.\src\api\modules\enrollment.ts`

**描述**: 招生申请状态

### 导出函数

- `enrollmentApi`
- `getEnrollmentApplications`
- `getEnrollmentApplication`
- `createEnrollmentApplication`
- `updateEnrollmentApplication`
- `deleteEnrollmentApplication`
- `reviewEnrollmentApplication`

### 类型定义

- `EnrollmentApplication`
- `EnrollmentApplicationQueryParams`
- `CreateEnrollmentApplicationRequest`

---

## enrollmentFinance

**文件路径**: `.\src\api\modules\enrollmentFinance.ts`

### 类型定义

- `EnrollmentFinanceLinkage`
- `FeePackageTemplate`
- `EnrollmentPaymentProcess`

---

## finance

**文件路径**: `.\src\api\modules\finance.ts`

### 类型定义

- `FinanceOverview`
- `FeeItem`
- `FeePackage`
- `PaymentBill`
- `PaymentRecord`
- `RefundApplication`
- `FinancialReport`

---

## log

**文件路径**: `.\src\api\modules\log.ts`

**描述**: API响应类型

### 导出函数

- `getSystemLogList`
- `getSystemLogDetail`
- `deleteSystemLog`
- `batchDeleteSystemLogs`
- `clearSystemLogs`
- `exportSystemLogs`
- `getLogs`
- `getLogDetail`
- `deleteLog`
- `batchDeleteLogs`
- `clearLogs`
- `exportLogs`

### 类型定义

- `SystemLog`
- `SystemLogQueryParams`
- `SystemLogType`
- `LogQueryParams`
- `ClearLogParams`

---

## marketing

**文件路径**: `.\src\api\modules\marketing.ts`

**描述**: 营销活动状态枚举

### 导出函数

- `getMarketingActivityList`
- `getMarketingActivityDetail`
- `createMarketingActivity`
- `updateMarketingActivity`
- `deleteMarketingActivity`
- `updateMarketingActivityStatus`
- `updateMarketingActivityResults`
- `getMarketingChannelList`
- `createMarketingChannel`
- `updateMarketingChannel`
- `deleteMarketingChannel`
- `getMarketingAnalytics`
- `exportMarketingActivityData`
- `exportMarketingAnalyticsReport`

### 类型定义

- `MarketingActivity`
- `MarketingActivityCreateParams`
- `MarketingActivityQueryParams`
- `MarketingChannel`
- `MarketingAnalytics`

---

## notification

**文件路径**: `.\src\api\modules\notification.ts`

**描述**: 通知状态枚举

### 导出函数

- `getNotificationList`
- `getNotificationDetail`
- `createNotification`
- `updateNotification`
- `deleteNotification`
- `sendNotification`
- `getNotificationReadStatus`
- `cancelNotification`
- `uploadNotificationAttachments`

### 类型定义

- `Notification`
- `NotificationCreateParams`
- `NotificationQueryParams`

---

## parent

**文件路径**: `.\src\api\modules\parent.ts`

**描述**: API响应类型

### 导出函数

- `transformParentData`
- `transformFollowUpRecord`

### 类型定义

- `ApiResponseType`
- `ParentData`
- `Parent`
- `FollowUpRecord`
- `ParentListParams`

---

## permission

**文件路径**: `.\src\api\modules\permission.ts`

### 导出函数

- `getPermissionList`
- `getPermissionDetail`
- `createPermission`
- `updatePermission`
- `deletePermission`
- `batchDeletePermission`
- `searchPermission`
- `exportPermission`
- `importPermission`

---

## poster

**文件路径**: `.\src\api\modules\poster.ts`

### 导出函数

- `transformPosterTemplate`

### 类型定义

- `PosterTemplateData`
- `PosterTemplate`
- `PosterTemplateQueryParams`
- `CreatePosterTemplateRequest`

---

## principal

**文件路径**: `.\src\api\modules\principal.ts`

**描述**: 园长仪表盘统计数据接口

### 导出函数

- `getPrincipalDashboardStats`
- `getCampusOverview`
- `getApprovalList`
- `handleApproval`
- `getImportantNotices`
- `publishNotice`
- `getPrincipalSchedule`
- `createPrincipalSchedule`
- `getEnrollmentTrend`
- `getCustomerPoolStats`
- `getCustomerPoolList`
- `assignCustomerTeacher`
- `batchAssignCustomerTeacher`
- `deleteCustomer`
- `exportCustomerData`
- `getPerformanceStats`
- `getPerformanceRankings`
- `getPerformanceDetails`
- `exportPerformanceData`
- `getCommissionRules`
- `saveCommissionRules`
- `getPerformanceGoals`
- `savePerformanceGoals`
- `simulateCommission`
- `getCustomerDetail`
- `addCustomerFollowUp`
- `importCustomerData`
- `getPerformanceRuleList`
- `getPerformanceRuleDetail`
- `createPerformanceRule`
- `updatePerformanceRule`
- `deletePerformanceRule`
- `togglePerformanceRuleStatus`
- `transformPosterTemplate`

### 类型定义

- `PrincipalDashboardStats`
- `CampusOverview`
- `ApprovalItem`
- `PrincipalNotice`
- `CustomerPoolStats`
- `PerformanceStats`
- `PerformanceRanking`
- `PerformanceDetail`
- `CommissionRule`
- `PerformanceGoal`
- `PerformanceRule`
- `PosterTemplate`
- `PosterTemplateQueryParams`
- `PerformanceRuleType`

---

## role

**文件路径**: `.\src\api\modules\role.ts`

### 导出函数

- `getRoleList`
- `getRoleDetail`
- `createRole`
- `updateRole`
- `deleteRole`
- `batchDeleteRole`
- `searchRole`
- `exportRole`
- `importRole`

---

## script

**文件路径**: `.\src\api\modules\script.ts`

**描述**: 话术类型枚举

### 导出函数

- `ScriptAPI`

### 类型定义

- `ScriptCategory`
- `Script`
- `ScriptUsage`
- `ScriptStats`
- `ScriptQuery`
- `CategoryQuery`
- `CreateScriptData`
- `UpdateScriptData`
- `CreateCategoryData`
- `UpdateCategoryData`
- `UseScriptData`
- `ApiResponse`
- `PaginatedResponse`

---

## statistics

**文件路径**: `.\src\api\modules\statistics.ts`

**描述**: 统计时间范围

### 导出函数

- `statisticsApi`
- `getDashboardStatistics`
- `getEnrollmentStatistics`
- `getStudentStatistics`
- `getRevenueStatistics`
- `getActivityStatistics`

### 类型定义

- `StatisticsDataPoint`
- `EnrollmentStatistics`
- `StudentStatistics`
- `RevenueStatistics`
- `ActivityStatistics`
- `DashboardStatistics`
- `StatisticsQueryParams`

---

## student

**文件路径**: `.\src\api\modules\student.ts`

**描述**: API响应类型

### 导出函数

- `getStudentList`
- `getStudentDetail`
- `createStudent`
- `updateStudent`
- `deleteStudent`
- `updateStudentStatus`
- `getAvailableStudents`
- `searchAvailableStudents`

### 类型定义

- `Student`
- `StudentBrief`
- `StudentCreateParams`
- `StudentQueryParams`

---

## system

**文件路径**: `.\src\api\modules\system.ts`

**描述**: 用户状态枚举

### 导出函数

- `getSystemStatus`
- `getSystemHealth`
- `getSystemInfo`
- `getVersionInfo`
- `testDatabaseConnection`
- `sendTestMail`
- `sendTestSms`
- `testStorageConfig`
- `clearSystemCache`
- `getUsers`
- `getUserDetail`
- `getCurrentUser`
- `getUserProfile`
- `createUser`
- `updateUser`
- `deleteUser`
- `updateUserStatus`
- `changeUserPassword`
- `updateUserRoles`
- `getRoles`
- `getRoleDetail`
- `getMyRoles`
- `checkUserRole`
- `createRole`
- `updateRole`
- `deleteRole`
- `updateRoleStatus`
- `getPermissionTree`
- `getPermissionDetail`
- `getUserPagePermissions`
- `checkPageAccess`
- `getRolePagePermissions`
- `updateRolePagePermissions`
- `createPermission`
- `updatePermission`
- `deletePermission`
- `getRolePermissions`
- `assignRolePermissions`
- `getSystemLogs`
- `exportSystemLogs`
- `deleteSystemLog`
- `clearSystemLogs`
- `getSystemStats`
- `getSystemPerformance`
- `getSystemOperationLogs`
- `getSettings`
- `updateSettings`
- `getMessageTemplates`
- `getMessageTemplateStats`
- `createMessageTemplate`
- `updateMessageTemplate`
- `deleteMessageTemplate`
- `updateMessageTemplateStatus`
- `batchDeleteMessageTemplates`
- `getAIModels`
- `getAIModelStats`
- `createAIModel`
- `updateAIModel`
- `deleteAIModel`
- `updateAIModelStatus`
- `testAIModel`
- `batchTestAIModels`
- `batchDeleteAIModels`
- `getSystemStats`
- `getSystemDetailInfo`

### 类型定义

- `PaginationParams`
- `PaginatedResult`
- `User`
- `UserParams`
- `Role`
- `RoleParams`
- `Permission`
- `PermissionParams`
- `SystemInfo`
- `SystemStatus`
- `VersionInfo`
- `TestEmailParams`
- `TestSmsParams`
- `ChangePasswordParams`
- `SystemLog`
- `SystemLogParams`
- `MessageTemplate`
- `MessageTemplateStats`
- `AIModel`
- `AIModelStats`
- `SystemStats`
- `SystemDetailInfo`

---

## teacher

**文件路径**: `.\src\api\modules\teacher.ts`

**描述**: API响应类型

### 导出函数

- `getTeacherList`
- `getTeacherDetail`
- `updateTeacher`
- `deleteTeacher`
- `searchTeachers`
- `getTeacherClasses`
- `getTeacherCustomerStats`
- `getTeacherCustomerList`
- `addCustomerFollowRecord`
- `updateCustomerStatus`
- `getCustomerFollowRecords`

### 类型定义

- `Teacher`
- `TeacherBrief`
- `TeacherCreateParams`
- `TeacherQueryParams`
- `CustomerInfo`
- `CustomerStats`
- `FollowRecord`
- `CustomerQueryParams`
- `FollowRecordParams`

---

## user

**文件路径**: `.\src\api\modules\user.ts`

**描述**: 用户角色枚举

### 导出函数

- `login`
- `logout`
- `changePassword`
- `getUserInfo`
- `updateUserInfo`
- `uploadAvatar`
- `getUserList`
- `getUserDetail`
- `createUser`
- `updateUser`
- `deleteUser`
- `updateUserStatus`
- `resetUserPassword`

### 类型定义

- `UserInfo`
- `LoginParams`
- `LoginResponse`
- `UserInfoResponse`
- `ChangePasswordParams`
- `UserQueryParams`
- `UserParams`

---

## personnel-center

**文件路径**: `.\src\api\personnel-center.ts`

### 导出函数

- `personnelCenterApi`

### 类型定义

- `PersonnelOverview`
- `Student`
- `Parent`
- `Teacher`
- `Class`
- `QueryParams`

---

## security

**文件路径**: `.\src\api\security.ts`

**描述**: 获取安全概览

### 导出函数

- `securityApi`

### 类型定义

- `SecurityOverview`
- `SecurityThreat`
- `SecurityVulnerability`
- `SecurityRecommendation`
- `ThreatQuery`
- `VulnerabilityQuery`
- `ScanRequest`
- `ThreatHandleRequest`

---

## system

**文件路径**: `.\src\api\system.ts`

**描述**: 系统管理API服务

### 导出函数

- `getCampusList`
- `getCampusDetail`
- `createCampus`
- `updateCampus`
- `deleteCampus`
- `getUserList`
- `getUserDetail`
- `createUser`
- `updateUser`
- `deleteUser`
- `getRoleList`
- `getDictData`
- `getSystemConfig`
- `updateSystemConfig`
- `getSystemLogs`
- `clearSystemLogs`
- `systemApi`

---

## task-center

**文件路径**: `.\src\api\task-center.ts`

### 导出函数

- `getTasks`
- `getTask`
- `createTask`
- `updateTask`
- `deleteTask`
- `updateTaskStatus`
- `updateTaskProgress`
- `assignTask`
- `getTaskStatistics`
- `getTaskTrends`
- `getTaskAnalytics`
- `getTaskTemplates`
- `createTaskFromTemplate`
- `batchUpdateTasks`
- `batchDeleteTasks`
- `exportTasks`
- `exportTaskReport`
- `getTaskComments`
- `addTaskComment`
- `updateTaskComment`
- `deleteTaskComment`
- `getTaskAttachments`
- `uploadTaskAttachment`
- `deleteTaskAttachment`
- `getRelatedTasks`
- `linkTasks`
- `unlinkTasks`

### 类型定义

- `Task`
- `TaskStatistics`
- `TaskQuery`
- `CreateTaskData`
- `UpdateTaskData`

---

## upload

**文件路径**: `.\src\api\upload.ts`

**描述**: 上传单个文件

### 导出函数

- `uploadFile`
- `uploadMultipleFiles`
- `uploadImage`
- `uploadAvatar`
- `uploadDocument`
- `getFileList`
- `getFileById`
- `updateFile`
- `deleteFile`
- `getDownloadUrl`
- `downloadFile`
- `getFileStatistics`
- `getStorageInfo`
- `cleanupTempFiles`
- `getPreviewUrl`
- `canPreview`
- `formatFileSize`
- `getFileTypeIcon`
- `validateFileType`
- `validateFileSize`

### 类型定义

- `FileInfo`
- `UploadParams`
- `FileListParams`
- `FileStatistics`
- `StorageInfo`

---

