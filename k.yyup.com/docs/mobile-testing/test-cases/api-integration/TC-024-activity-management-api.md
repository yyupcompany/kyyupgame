# TC-024: 活动管理API集成测试

## 📋 测试概述

**测试目标**: 验证移动端活动管理相关API的完整集成，包括活动创建、报名管理、活动执行、评价反馈等功能
**测试类型**: API集成测试
**优先级**: 高
**预计执行时间**: 8-12分钟

---

## 🎯 测试场景

### 场景1: 活动创建API集成测试
- **目标**: 验证活动创建和管理功能
- **覆盖功能**: 活动基本信息、时间安排、参与规则、资源分配

### 场景2: 活动报名API集成测试
- **目标**: 验证活动报名和参与者管理
- **覆盖功能**: 在线报名、名额管理、报名审核、参与者统计

### 场景3: 活动执行API集成测试
- **目标**: 验证活动过程管理功能
- **覆盖功能**: 签到管理、进度跟踪、实时通知、异常处理

### 场景4: 活动评价API集成测试
- **目标**: 验证活动评价和反馈功能
- **覆盖功能**: 评价提交、统计分析、反馈处理、改进建议

### 场景5: 活动统计API集成测试
- **目标**: 验证活动数据分析功能
- **覆盖功能**: 参与统计、效果分析、趋势预测、报告生成

---

## 🔍 详细测试用例

### TC-024-01: 活动创建API集成测试

**测试步骤**:
1. 调用活动创建API接口
2. 验证活动信息完整性
3. 测试活动分类功能
4. 检查时间安排验证
5. 确认资源分配正确

**API端点**: `POST /api/activities`

**严格验证要求**:
```typescript
// 1. 活动创建响应验证
const createResponse = await createActivity(testActivity);
const createFields = ['success', 'data', 'message'];
const createValidation = validateRequiredFields(createResponse, createFields);
expect(createValidation.valid).toBe(true);

// 2. 活动对象字段验证
const activityFields = [
  'id', 'title', 'description', 'category', 'type', 
  'startTime', 'endTime', 'maxParticipants', 'status'
];
const activityValidation = validateRequiredFields(
  createResponse.data.activity, 
  activityFields
);
expect(activityValidation.valid).toBe(true);

// 3. 字段类型验证
const typeValidation = validateFieldTypes(createResponse.data.activity, {
  id: 'string',
  title: 'string',
  description: 'string',
  category: 'string',
  type: 'string',
  startTime: 'string',
  endTime: 'string',
  maxParticipants: 'number',
  status: 'string'
});
expect(typeValidation.valid).toBe(true);

// 4. 枚举值验证
const validTypes = ['INDOOR', 'OUTDOOR', 'ONLINE', 'HYBRID'];
const validCategories = ['EDUCATIONAL', 'RECREATIONAL', 'SPORTS', 'CULTURAL', 'SOCIAL'];
expect(validTypes).toContain(createResponse.data.activity.type);
expect(validCategories).toContain(createResponse.data.activity.category);

// 5. 时间逻辑验证
const startTime = new Date(createResponse.data.activity.startTime);
const endTime = new Date(createResponse.data.activity.endTime);
expect(endTime.getTime()).toBeGreaterThan(startTime.getTime());
```

**测试数据**:
```typescript
const testActivity = {
  title: '测试活动_' + Date.now(),
  description: '这是一个测试活动的详细描述',
  category: 'EDUCATIONAL',
  type: 'INDOOR',
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
  location: '活动中心A教室',
  maxParticipants: 30,
  ageRange: {
    min: 3,
    max: 6
  },
  requirements: ['需要家长陪同', '自备水杯'],
  resources: ['投影仪', '音响设备', '活动道具']
};
```

**预期结果**:
- ✅ 活动创建成功且信息完整
- ✅ 活动编号自动生成
- ✅ 时间安排逻辑正确
- ✅ 参与限制规则生效
- ✅ 资源需求正确记录

### TC-024-02: 活动报名API集成测试

**测试步骤**:
1. 获取活动列表和详情
2. 执行活动报名操作
3. 验证名额管理功能
4. 测试报名审核流程
5. 检查参与者统计

**API端点**: 
- `GET /api/activities`
- `POST /api/activities/:id/register`
- `GET /api/activities/:id/participants`
- `POST /api/activities/:id/approve-registration`

**严格验证要求**:
```typescript
// 1. 报名响应验证
const registerResponse = await registerForActivity(activityId, registrationData);
const registerFields = ['success', 'data', 'message'];
const registerValidation = validateRequiredFields(registerResponse, registerFields);
expect(registerValidation.valid).toBe(true);

// 2. 报名记录字段验证
const registrationFields = ['id', 'activityId', 'participantId', 'status', 'registeredAt'];
const registrationValidation = validateRequiredFields(
  registerResponse.data.registration, 
  registrationFields
);
expect(registrationValidation.valid).toBe(true);

// 3. 报名状态验证
const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLIST'];
expect(validStatuses).toContain(registerResponse.data.registration.status);

// 4. 时间戳验证
const timestampValidation = validateDateFormat(registerResponse.data.registration.registeredAt);
expect(timestampValidation).toBe(true);
```

**名额管理验证**:
```typescript
// 1. 活动详情更新验证
const activityDetail = await getActivityDetail(activityId);
const detailFields = ['currentParticipants', 'availableSlots', 'isFull'];
const detailValidation = validateRequiredFields(activityDetail.data, detailFields);
expect(detailValidation.valid).toBe(true);

// 2. 数值类型验证
const numberValidation = validateFieldTypes(activityDetail.data, {
  currentParticipants: 'number',
  availableSlots: 'number',
  isFull: 'boolean'
});
expect(numberValidation.valid).toBe(true);

// 3. 名额计算验证
const expectedSlots = activityDetail.data.maxParticipants - activityDetail.data.currentParticipants;
expect(activityDetail.data.availableSlots).toBe(expectedSlots);

// 4. 满员状态验证
if (activityDetail.data.currentParticipants >= activityDetail.data.maxParticipants) {
  expect(activityDetail.data.isFull).toBe(true);
}
```

**参与者列表验证**:
```typescript
// 1. 参与者列表响应验证
const participantsResponse = await getActivityParticipants(activityId, { page: 1, pageSize: 20 });
const participantsFields = ['success', 'data'];
const participantsValidation = validateRequiredFields(participantsResponse, participantsFields);
expect(participantsValidation.valid).toBe(true);

// 2. 分页结构验证
const paginationFields = ['items', 'total', 'page', 'pageSize'];
const paginationValidation = validateRequiredFields(participantsResponse.data, paginationFields);
expect(paginationValidation.valid).toBe(true);

// 3. 参与者信息字段验证
if (participantsResponse.data.items.length > 0) {
  const participantFields = ['id', 'name', 'contact', 'registrationStatus', 'registeredAt'];
  const participantValidation = validateRequiredFields(
    participantsResponse.data.items[0], 
    participantFields
  );
  expect(participantValidation.valid).toBe(true);

  // 4. 联系方式验证
  const participant = participantsResponse.data.items[0];
  if (participant.email) {
    expect(participant.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }
  if (participant.phone) {
    expect(participant.phone).toMatch(/^1[3-9]\d{9}$/);
  }
}
```

**预期结果**:
- ✅ 报名功能正常工作
- ✅ 名额管理机制有效
- ✅ 报名审核流程完整
- ✅ 参与者统计准确
- ✅ 等待列表功能正常

### TC-024-03: 活动执行API集成测试

**测试步骤**:
1. 活动签到管理
2. 进度跟踪记录
3. 实时通知发送
4. 异常情况处理
5. 执行状态更新

**API端点**: 
- `POST /api/activities/:id/checkin`
- `POST /api/activities/:id/progress`
- `POST /api/activities/:id/notify`
- `PUT /api/activities/:id/status`

**严格验证要求**:
```typescript
// 1. 签到响应验证
const checkinResponse = await activityCheckin(activityId, checkinData);
const checkinFields = ['success', 'data', 'message'];
const checkinValidation = validateRequiredFields(checkinResponse, checkinFields);
expect(checkinValidation.valid).toBe(true);

// 2. 签到记录字段验证
const checkinRecordFields = ['id', 'activityId', 'participantId', 'checkinTime', 'status'];
const checkinRecordValidation = validateRequiredFields(
  checkinResponse.data.checkinRecord, 
  checkinRecordFields
);
expect(checkinRecordValidation.valid).toBe(true);

// 3. 签到状态验证
const validCheckinStatuses = ['ON_TIME', 'LATE', 'ABSENT'];
expect(validCheckinStatuses).toContain(checkinResponse.data.checkinRecord.status);

// 4. 时间戳验证
const timeValidation = validateDateFormat(checkinResponse.data.checkinRecord.checkinTime);
expect(timeValidation).toBe(true);
```

**进度跟踪验证**:
```typescript
// 1. 进度记录响应验证
const progressResponse = await recordActivityProgress(activityId, progressData);
const progressFields = ['success', 'data', 'message'];
const progressValidation = validateRequiredFields(progressResponse, progressFields);
expect(progressValidation.valid).toBe(true);

// 2. 进度记录字段验证
const progressRecordFields = ['id', 'activityId', 'stage', 'completion', 'notes', 'recordedAt'];
const progressRecordValidation = validateRequiredFields(
  progressResponse.data.progressRecord, 
  progressRecordFields
);
expect(progressRecordValidation.valid).toBe(true);

// 3. 完成度范围验证
expect(progressResponse.data.progressRecord.completion).toBeGreaterThanOrEqual(0);
expect(progressResponse.data.progressRecord.completion).toBeLessThanOrEqual(100);

// 4. 阶段验证
const validStages = ['PREPARATION', 'STARTED', 'IN_PROGRESS', 'COMPLETING', 'COMPLETED'];
expect(validStages).toContain(progressResponse.data.progressRecord.stage);
```

**预期结果**:
- ✅ 签到功能正常工作
- ✅ 进度跟踪准确记录
- ✅ 实时通知及时发送
- ✅ 异常处理机制完善
- ✅ 执行状态正确更新

### TC-024-04: 活动评价API集成测试

**测试步骤**:
1. 提交活动评价
2. 获取评价列表
3. 统计评价数据
4. 处理反馈建议
5. 生成评价报告

**API端点**: 
- `POST /api/activities/:id/evaluations`
- `GET /api/activities/:id/evaluations`
- `GET /api/activities/:id/evaluation-stats`

**严格验证要求**:
```typescript
// 1. 评价提交响应验证
const evaluationResponse = await submitEvaluation(activityId, evaluationData);
const evaluationFields = ['success', 'data', 'message'];
const evaluationValidation = validateRequiredFields(evaluationResponse, evaluationFields);
expect(evaluationValidation.valid).toBe(true);

// 2. 评价记录字段验证
const evaluationRecordFields = [
  'id', 'activityId', 'evaluatorId', 'overallRating', 
  'contentRating', 'organizationRating', 'feedback', 'submittedAt'
];
const evaluationRecordValidation = validateRequiredFields(
  evaluationResponse.data.evaluation, 
  evaluationRecordFields
);
expect(evaluationRecordValidation.valid).toBe(true);

// 3. 评分范围验证
expect(evaluationResponse.data.evaluation.overallRating).toBeGreaterThanOrEqual(1);
expect(evaluationResponse.data.evaluation.overallRating).toBeLessThanOrEqual(5);
expect(evaluationResponse.data.evaluation.contentRating).toBeGreaterThanOrEqual(1);
expect(evaluationResponse.data.evaluation.contentRating).toBeLessThanOrEqual(5);
expect(evaluationResponse.data.evaluation.organizationRating).toBeGreaterThanOrEqual(1);
expect(evaluationResponse.data.evaluation.organizationRating).toBeLessThanOrEqual(5);

// 4. 评价文本验证
if (evaluationResponse.data.evaluation.feedback) {
  expect(evaluationResponse.data.evaluation.feedback.length).toBeGreaterThan(0);
  expect(evaluationResponse.data.evaluation.feedback.length).toBeLessThanOrEqual(1000);
}
```

**评价统计验证**:
```typescript
// 1. 统计响应验证
const statsResponse = await getEvaluationStatistics(activityId);
const statsFields = ['success', 'data'];
const statsValidation = validateRequiredFields(statsResponse, statsFields);
expect(statsValidation.valid).toBe(true);

// 2. 统计数据字段验证
const statisticsFields = [
  'totalEvaluations', 'averageOverallRating', 'averageContentRating', 
  'averageOrganizationRating', 'ratingDistribution'
];
const statisticsValidation = validateRequiredFields(
  statsResponse.data.statistics, 
  statisticsFields
);
expect(statisticsValidation.valid).toBe(true);

// 3. 数值类型验证
const statsTypeValidation = validateFieldTypes(statsResponse.data.statistics, {
  totalEvaluations: 'number',
  averageOverallRating: 'number',
  averageContentRating: 'number',
  averageOrganizationRating: 'number',
  ratingDistribution: 'object'
});
expect(statsTypeValidation.valid).toBe(true);

// 4. 评分分布验证
const distribution = statsResponse.data.statistics.ratingDistribution;
for (let i = 1; i <= 5; i++) {
  expect(distribution[i]).toBeGreaterThanOrEqual(0);
  expect(typeof distribution[i]).toBe('number');
}

// 5. 评分范围验证
expect(statsResponse.data.statistics.averageOverallRating).toBeGreaterThanOrEqual(1);
expect(statsResponse.data.statistics.averageOverallRating).toBeLessThanOrEqual(5);
```

**预期结果**:
- ✅ 评价提交功能正常
- ✅ 评分数据准确统计
- ✅ 反馈建议有效收集
- ✅ 评价报告完整生成
- ✅ 数据分析结果可信

### TC-024-05: 活动统计API集成测试

**测试步骤**:
1. 获取活动总体统计
2. 分析参与趋势
3. 生成效果报告
4. 预测活动趋势
5. 导出统计数据

**API端点**: 
- `GET /api/activities/statistics`
- `GET /api/activities/trends`
- `GET /api/activities/performance`

**严格验证要求**:
```typescript
// 1. 总体统计响应验证
const overallStatsResponse = await getActivityOverallStatistics(dateRange);
const overallFields = ['success', 'data'];
const overallValidation = validateRequiredFields(overallStatsResponse, overallFields);
expect(overallValidation.valid).toBe(true);

// 2. 总体统计字段验证
const overallStatFields = [
  'totalActivities', 'completedActivities', 'ongoingActivities', 
  'totalParticipants', 'averageParticipationRate', 'satisfactionRate'
];
const overallStatValidation = validateRequiredFields(
  overallStatsResponse.data.statistics, 
  overallStatFields
);
expect(overallStatValidation.valid).toBe(true);

// 3. 数值类型验证
const overallTypeValidation = validateFieldTypes(overallStatsResponse.data.statistics, {
  totalActivities: 'number',
  completedActivities: 'number',
  ongoingActivities: 'number',
  totalParticipants: 'number',
  averageParticipationRate: 'number',
  satisfactionRate: 'number'
});
expect(overallTypeValidation.valid).toBe(true);

// 4. 百分比范围验证
expect(overallStatsResponse.data.statistics.averageParticipationRate).toBeGreaterThanOrEqual(0);
expect(overallStatsResponse.data.statistics.averageParticipationRate).toBeLessThanOrEqual(100);
expect(overallStatsResponse.data.statistics.satisfactionRate).toBeGreaterThanOrEqual(0);
expect(overallStatsResponse.data.statistics.satisfactionRate).toBeLessThanOrEqual(100);
```

**趋势分析验证**:
```typescript
// 1. 趋势数据响应验证
const trendsResponse = await getActivityTrends(trendParameters);
const trendsFields = ['success', 'data'];
const trendsValidation = validateRequiredFields(trendsResponse, trendsFields);
expect(trendsValidation.valid).toBe(true);

// 2. 趋势数据字段验证
const trendsDataFields = ['timeRange', 'granularity', 'dataPoints'];
const trendsDataValidation = validateRequiredFields(
  trendsResponse.data.trends, 
  trendsDataFields
);
expect(trendsDataValidation.valid).toBe(true);

// 3. 数据点数组验证
expect(Array.isArray(trendsResponse.data.trends.dataPoints)).toBe(true);
expect(trendsResponse.data.trends.dataPoints.length).toBeGreaterThan(0);

// 4. 数据点字段验证
if (trendsResponse.data.trends.dataPoints.length > 0) {
  const dataPointFields = ['timestamp', 'activityCount', 'participantCount', 'satisfactionScore'];
  const dataPointValidation = validateRequiredFields(
    trendsResponse.data.trends.dataPoints[0], 
    dataPointFields
  );
  expect(dataPointValidation.valid).toBe(true);

  // 5. 数据点类型验证
  const dataPointTypeValidation = validateFieldTypes(
    trendsResponse.data.trends.dataPoints[0], 
    {
      timestamp: 'string',
      activityCount: 'number',
      participantCount: 'number',
      satisfactionScore: 'number'
    }
  );
  expect(dataPointTypeValidation.valid).toBe(true);
}
```

**预期结果**:
- ✅ 总体统计数据准确
- ✅ 趋势分析结果可信
- ✅ 效果评估完整
- ✅ 预测模型有效
- ✅ 报告导出功能正常

---

## 🚨 错误场景测试

### 场景1: 活动时间冲突
- **模拟**: 创建时间重叠的活动
- **验证**: 时间冲突检测机制
- **预期**: 返回400状态码和时间冲突详情

### 场景2: 报名名额已满
- **模拟**: 在满员活动上继续报名
- **验证**: 名额限制检查
- **预期**: 返回400状态码和等待名单选项

### 场景3: 重复评价提交
- **模拟**: 同一用户多次评价同一活动
- **验证**: 重复提交防护机制
- **预期**: 返回400状态码和重复评价提示

### 场景4: 无效的活动状态
- **模拟**: 在已结束活动中执行操作
- **验证**: 状态有效性检查
- **预期**: 返回400状态码和状态错误信息

---

## 🔧 技术要求

### API请求格式
```typescript
// 活动创建请求
interface CreateActivityRequest {
  title: string;
  description: string;
  category: 'EDUCATIONAL' | 'RECREATIONAL' | 'SPORTS' | 'CULTURAL' | 'SOCIAL';
  type: 'INDOOR' | 'OUTDOOR' | 'ONLINE' | 'HYBRID';
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  ageRange: {
    min: number;
    max: number;
  };
  requirements: string[];
  resources: string[];
}

// 活动报名请求
interface RegisterActivityRequest {
  participantId: string;
  participantType: 'STUDENT' | 'TEACHER' | 'PARENT';
  additionalInfo?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}
```

### 响应格式验证
```typescript
// 活动列表响应
interface ActivityListResponse {
  success: boolean;
  data: {
    items: Activity[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 评价统计响应
interface EvaluationStatsResponse {
  success: boolean;
  data: {
    statistics: {
      totalEvaluations: number;
      averageOverallRating: number;
      averageContentRating: number;
      averageOrganizationRating: number;
      ratingDistribution: Record<number, number>;
    };
  };
}
```

---

## 📊 测试数据

### 活动分类数据
```typescript
const activityCategories = {
  EDUCATIONAL: {
    description: '教育活动',
    typicalDuration: 60,
    participantRange: { min: 10, max: 30 }
  },
  RECREATIONAL: {
    description: '娱乐活动',
    typicalDuration: 90,
    participantRange: { min: 15, max: 50 }
  },
  SPORTS: {
    description: '体育活动',
    typicalDuration: 120,
    participantRange: { min: 20, max: 100 }
  }
};
```

---

## ✅ 验收标准

1. ✅ 所有活动管理API端点正常响应
2. ✅ 数据结构验证通过率100%
3. ✅ 字段类型验证通过率100%
4. ✅ 业务逻辑验证正确
5. ✅ 时间冲突检测有效
6. ✅ 名额管理机制完善
7. ✅ 评价统计准确可靠
8. ✅ 趋势分析结果可信

---

## 📝 测试报告模板

```typescript
interface ActivityManagementAPITestReport {
  testId: 'TC-024';
  testDate: string;
  testEnvironment: string;
  results: {
    activityCreation: TestResult;
    activityRegistration: TestResult;
    activityExecution: TestResult;
    activityEvaluation: TestResult;
    activityStatistics: TestResult;
    errorHandling: TestResult;
  };
  performance: {
    creationResponseTime: number;
    registrationResponseTime: number;
    evaluationResponseTime: number;
    statisticsGenerationTime: number;
  };
  businessLogic: {
    timeConflictDetection: boolean;
    capacityManagement: boolean;
    registrationWorkflow: boolean;
    evaluationAccuracy: boolean;
  };
  dataValidation: {
    activityDataValidation: boolean;
    registrationDataValidation: boolean;
    evaluationDataValidation: boolean;
    statisticalDataValidation: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 创建测试活动、用户、参与者数据
2. **权限准备**: 准备不同角色的测试账户
3. **时间设置**: 确保测试时间符合活动要求
4. **执行顺序**: 按照活动生命周期顺序执行
5. **状态验证**: 每个操作后验证活动状态
6. **数据清理**: 测试完成后清理测试数据

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行