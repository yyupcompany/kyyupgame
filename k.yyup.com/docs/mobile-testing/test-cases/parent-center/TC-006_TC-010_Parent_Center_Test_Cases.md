# 移动端家长中心功能测试用例

## 概述

本文档包含移动端家长中心核心功能的详细测试用例，覆盖家长仪表板、孩子管理、活动报名、成长评估和AI助手交互等关键功能模块。

## 测试环境配置

- **设备环境**: 移动端设备 (Mobile/iOS/Android)
- **用户角色**: 家长 (parent)
- **测试账号**: `test_parent` / `password123`
- **浏览器环境**: Chrome Mobile, Safari Mobile
- **网络环境**: 4G/5G/WiFi

---

## TC-006: 家长仪表板测试

### 测试目标
验证家长仪表板功能的完整性和用户体验，包括数据展示、快捷操作、通知提醒等功能。

### 测试优先级
**高优先级** - 核心功能

### 测试步骤

#### 步骤1: 仪表板页面加载测试
1. 使用家长账号登录: `test_parent` / `password123`
2. 访问家长仪表板: `/mobile/centers/parent-center`
3. 验证页面完整加载

**预期结果:**
- ✅ 页面加载时间 < 3秒
- ✅ 显示家长个性化欢迎信息
- ✅ 所有数据卡片正常加载
- ✅ 无控制台错误和警告
- ✅ 移动端适配良好

**验证代码:**
```javascript
// 页面加载验证
await loginAs('test_parent', 'password123');
await navigateTo('/mobile/centers/parent-center');

const loadTime = performance.now();
expect(loadTime).toBeLessThan(3000);

// 欢迎信息验证
const welcomeElement = document.querySelector('.welcome-message, .greeting');
expect(welcomeElement.textContent).toContain('欢迎');

// 数据卡片存在性验证
const dashboardCards = document.querySelectorAll('.dashboard-card, .stat-card');
expect(dashboardCards.length).toBeGreaterThan(0);
```

#### 步骤2: 孩子信息卡片测试
1. 验证孩子基本信息显示
2. 检查头像和姓名显示
3. 测试点击跳转功能

**预期结果:**
- ✅ 显示孩子真实姓名和头像
- ✅ 显示班级和年级信息
- ✅ 点击卡片跳转到孩子详情页
- ✅ 头像加载正常，支持点击放大

**严格验证要求:**
```javascript
// 孩子信息卡片验证
const childCards = document.querySelectorAll('.child-card, .student-card');
expect(childCards.length).toBeGreaterThan(0);

childCards.forEach((card, index) => {
  // 验证必填字段
  const childName = card.querySelector('.child-name, .student-name');
  const className = card.querySelector('.class-name, .grade-info');
  const avatar = card.querySelector('.avatar, .child-avatar');

  expect(childName).toBeTruthy();
  expect(className).toBeTruthy();
  expect(avatar).toBeTruthy();
  expect(childName.textContent.trim()).not.toBe('');

  // 验证头像
  expect(avatar.src).not.toContain('placeholder');
  expect(avatar.naturalWidth).toBeGreaterThan(0);

  // 验证点击跳转
  card.click();
  await waitForNavigation();
  expect(window.location.pathname).toContain('/child/');
});
```

#### 步骤3: 今日安排模块测试
1. 验证今日课程安排显示
2. 检查活动安排信息
3. 测试时间线展示

**预期结果:**
- ✅ 显示今日课程时间表
- ✅ 标注正在进行的活动
- ✅ 显示活动地点和教师信息
- ✅ 时间线样式清晰美观

**API验证要求:**
```javascript
// 今日安排API响应验证
const scheduleResponse = await getTodayScheduleAPI();

// 1. 验证响应结构
expect(scheduleResponse.success).toBe(true);
expect(scheduleResponse.data).toBeDefined();

// 2. 验证必填字段
const requiredFields = ['activities', 'date', 'currentActivity'];
const validation = validateRequiredFields(scheduleResponse.data, requiredFields);
expect(validation.valid).toBe(true);

// 3. 验证活动数组结构
if (scheduleResponse.data.activities.length > 0) {
  const activityValidation = validateRequiredFields(scheduleResponse.data.activities[0], [
    'id', 'title', 'startTime', 'endTime', 'location', 'teacher'
  ]);
  expect(activityValidation.valid).toBe(true);

  // 4. 验证字段类型
  const typeValidation = validateFieldTypes(scheduleResponse.data.activities[0], {
    id: 'string',
    title: 'string',
    startTime: 'string',
    endTime: 'string',
    location: 'string',
    teacher: 'object'
  });
  expect(typeValidation.valid).toBe(true);
}
```

#### 步骤4: 成长数据统计测试
1. 验证成长指标展示
2. 检查数据可视化图表
3. 测试数据更新机制

**预期结果:**
- ✅ 显示身高、体重等成长数据
- ✅ 图表渲染正常，支持触摸交互
- ✅ 数据定期自动更新
- ✅ 显示历史趋势对比

**验证代码:**
```javascript
// 成长数据验证
const growthCards = document.querySelectorAll('.growth-stat, .metric-card');
const growthMetrics = ['身高', '体重', 'BMI'];

growthMetrics.forEach(metric => {
  const card = Array.from(growthCards).find(card =>
    card.textContent.includes(metric)
  );
  expect(card).toBeTruthy();

  // 验证数据值
  const valueElement = card.querySelector('.value, .metric-value');
  expect(valueElement.textContent.trim()).toMatch(/\d+/);
});

// 图表验证
const charts = document.querySelectorAll('.growth-chart, canvas');
expect(charts.length).toBeGreaterThan(0);
```

#### 步骤5: 通知提醒模块测试
1. 验证未读通知数量显示
2. 检查通知列表展示
3. 测试通知操作功能

**预期结果:**
- ✅ 显示未读通知数量角标
- ✅ 通知按时间倒序排列
- ✅ 支持标记已读和删除操作
- ✅ 重要通知突出显示

**严格验证要求:**
```javascript
// 通知API响应验证
const notificationResponse = await getNotificationsAPI({ unread: true });

// 验证通知数据结构
const notificationValidation = validateRequiredFields(notificationResponse.data.notifications[0], [
  'id', 'title', 'content', 'type', 'createdAt', 'read'
]);
expect(notificationValidation.valid).toBe(true);

// 验证通知类型枚举
const validTypes = ['system', 'activity', 'growth', 'assignment'];
expect(validTypes).toContain(notificationResponse.data.notifications[0].type);

// UI验证
const notificationCount = document.querySelector('.notification-count, .badge');
if (notificationResponse.data.unreadCount > 0) {
  expect(notificationCount).toBeTruthy();
  expect(notificationCount.textContent).toBe(notificationResponse.data.unreadCount.toString());
}
```

### 测试数据场景

| 场景类型 | 预期数据展示 | 验证点 |
|---------|-------------|--------|
| 有多个孩子 | 显示所有孩子卡片 | 卡片数量、信息准确性 |
| 有今日活动 | 显示活动时间线 | 时间线准确性、状态标识 |
| 有未读通知 | 显示通知角标 | 角标数量、通知列表 |
| 有成长数据 | 显示成长图表 | 图表渲染、数据准确性 |
| 无特殊安排 | 显示默认空状态 | 空状态文案、引导操作 |

### 元素覆盖清单

- [ ] 仪表板容器 `.parent-dashboard` 或 `.parent-center`
- [ ] 欢迎消息 `.welcome-message` 或 `.greeting`
- [ ] 孩子信息卡片 `.child-card` 或 `.student-card`
- [ ] 今日安排时间线 `.schedule-timeline` 或 `.today-schedule`
- [ ] 成长数据卡片 `.growth-stat` 或 `.metric-card`
- [ ] 通知提醒模块 `.notifications` 或 `.alerts`
- [ ] 快捷操作按钮 `.quick-actions` 或 `.shortcuts`
- [ ] 数据可视化图表 `.chart` 或 `canvas`
- [ ] 加载状态指示器 `.loading` 或 `.spinner`

### 性能要求

- **首次加载时间**: < 3秒
- **数据刷新时间**: < 2秒
- **图表渲染时间**: < 1秒
- **交互响应时间**: < 100ms

---

## TC-007: 孩子管理功能测试

### 测试目标
验证孩子管理功能的完整性，包括孩子信息查看、编辑、添加和删除等操作。

### 测试优先级
**高优先级** - 核心功能

### 测试步骤

#### 步骤1: 孩子列表展示测试
1. 访问孩子管理页面: `/mobile/children`
2. 验证孩子列表展示
3. 测试搜索和筛选功能

**预期结果:**
- ✅ 显示所有关联的孩子信息
- ✅ 支持按姓名搜索
- ✅ 支持按班级筛选
- ✅ 列表加载流畅，无卡顿

**严格验证要求:**
```javascript
// 孩子列表API响应验证
const childrenResponse = await getChildrenListAPI();

// 1. 验证响应结构
expect(childrenResponse.success).toBe(true);
expect(childrenResponse.data).toBeDefined();

// 2. 验证分页字段
const paginationValidation = validateRequiredFields(childrenResponse.data, [
  'items', 'total', 'page', 'pageSize'
]);
expect(paginationValidation.valid).toBe(true);

// 3. 验证孩子对象字段
if (childrenResponse.data.items.length > 0) {
  const childValidation = validateRequiredFields(childrenResponse.data.items[0], [
    'id', 'name', 'avatar', 'className', 'grade', 'birthday', 'gender'
  ]);
  expect(childValidation.valid).toBe(true);

  // 4. 验证字段类型
  const typeValidation = validateFieldTypes(childrenResponse.data.items[0], {
    id: 'string',
    name: 'string',
    avatar: 'string',
    className: 'string',
    grade: 'string',
    birthday: 'string',
    gender: 'string'
  });
  expect(typeValidation.valid).toBe(true);
}

// UI验证
const childItems = document.querySelectorAll('.child-item, .student-item');
expect(childItems.length).toBe(childrenResponse.data.items.length);
```

#### 步骤2: 孩子详情查看测试
1. 点击任意孩子卡片
2. 验证详情页面加载
3. 检查信息完整性

**预期结果:**
- ✅ 页面跳转到孩子详情页
- ✅ 显示完整的孩子信息
- ✅ 头像清晰，支持点击放大
- ✅ 信息分组合理，易于阅读

**验证代码:**
```javascript
// 孩子详情API验证
const detailResponse = await getChildDetailAPI(childId);

// 验证详情数据结构
const detailValidation = validateRequiredFields(detailResponse.data, [
  'id', 'name', 'avatar', 'className', 'grade', 'birthday', 'gender',
  'emergencyContact', 'medicalInfo', 'enrollmentDate'
]);
expect(detailValidation.valid).toBe(true);

// 验证嵌套对象
const contactValidation = validateRequiredFields(detailResponse.data.emergencyContact, [
  'name', 'phone', 'relationship'
]);
expect(contactValidation.valid).toBe(true);

// UI验证
const detailSections = ['基本信息', '紧急联系', '健康信息'];
detailSections.forEach(section => {
  const sectionElement = document.querySelector(`section:contains("${section}")`);
  expect(sectionElement).toBeTruthy();
});
```

#### 步骤3: 孩子信息编辑测试
1. 在孩子详情页点击编辑按钮
2. 修改孩子基本信息
3. 保存修改并验证结果

**预期结果:**
- ✅ 进入编辑模式
- ✅ 表单预填充当前信息
- ✅ 保存成功后显示更新确认
- ✅ 列表页显示最新信息

**编辑验证代码:**
```javascript
// 孩子信息编辑API验证
const updateData = {
  name: '更新后的姓名',
  emergencyContact: {
    name: '张三',
    phone: '13800138000',
    relationship: '父亲'
  }
};

const updateResponse = await updateChildAPI(childId, updateData);

// 验证更新响应
expect(updateResponse.success).toBe(true);
expect(updateResponse.message).toContain('更新成功');

// 验证返回数据包含更新信息
const updatedChildValidation = validateRequiredFields(updateResponse.data, Object.keys(updateData));
expect(updatedChildValidation.valid).toBe(true);
```

#### 步骤4: 添加新孩子测试
1. 点击添加孩子按钮
2. 填写孩子基本信息
3. 上传孩子头像
4. 提交表单

**预期结果:**
- ✅ 打开添加孩子表单
- ✅ 表单验证正确工作
- ✅ 头像上传成功
- ✅ 添加成功后跳转到详情页

**表单验证要求:**
```javascript
// 添加孩子表单验证
const formData = {
  name: '',
  birthday: '',
  gender: '',
  className: ''
};

// 验证必填字段
Object.keys(formData).forEach(field => {
  const input = document.querySelector(`input[name="${field}"]`);
  input.value = formData[field];

  const form = document.querySelector('.add-child-form');
  const isValid = form.checkValidity();
  expect(isValid).toBe(false);

  const errorMessage = document.querySelector(`.error-${field}`);
  expect(errorMessage).toBeTruthy();
});
```

#### 步骤5: 孩子删除功能测试
1. 在孩子详情页找到删除按钮
2. 确认删除操作
3. 验证删除结果

**预期结果:**
- ✅ 显示删除确认对话框
- ✅ 删除成功后跳转回列表页
- ✅ 列表页不再显示该孩子
- ✅ 显示删除成功提示

**安全验证:**
```javascript
// 删除操作API验证
const deleteResponse = await deleteChildAPI(childId);

// 验证删除响应
expect(deleteResponse.success).toBe(true);
expect(deleteResponse.message).toContain('删除成功');

// 验证后续访问返回404
const detailCheckResponse = await getChildDetailAPI(childId);
expect(detailCheckResponse.success).toBe(false);
expect(detailCheckResponse.statusCode).toBe(404);
```

### 测试数据场景

| 操作类型 | 测试数据 | 预期结果 |
|---------|----------|----------|
| 查看列表 | 多个孩子 | 显示所有孩子，支持搜索筛选 |
| 查看详情 | 单个孩子 | 完整信息展示，分组清晰 |
| 编辑信息 | 修改紧急联系人 | 更新成功，实时同步 |
| 添加孩子 | 新生入园信息 | 添加成功，分配学号 |
| 删除孩子 | 转学孩子 | 确认删除，数据清理 |

### 元素覆盖清单

- [ ] 孩子列表容器 `.children-list` 或 `.students-list`
- [ ] 孩子项组件 `.child-item` 或 `.student-item`
- [ ] 搜索输入框 `.search-input` 或 `input[placeholder*="搜索"]`
- [ ] 筛选器 `.filter` 或 `.filter-dropdown`
- [ ] 详情页面 `.child-detail` 或 `.student-detail`
- [ ] 编辑表单 `.edit-form` 或 `.child-form`
- [ ] 添加表单 `.add-child-form`
- [ ] 删除确认对话框 `.delete-confirm` 或 `.confirm-dialog`
- [ ] 头像上传组件 `.avatar-upload`
- [ ] 表单验证提示 `.validation-error`

---

## TC-008: 活动报名功能测试

### 测试目标
验证活动报名功能的完整流程，包括活动浏览、详情查看、报名申请和状态查询。

### 测试优先级
**高优先级** - 核心功能

### 测试步骤

#### 步骤1: 活动列表浏览测试
1. 访问活动页面: `/mobile/activities`
2. 验证活动列表展示
3. 测试筛选和排序功能

**预期结果:**
- ✅ 显示适合的活动列表
- ✅ 按时间倒序排列
- ✅ 支持按类型和状态筛选
- ✅ 显示活动状态标识

**严格验证要求:**
```javascript
// 活动列表API响应验证
const activitiesResponse = await getActivitiesAPI({ type: 'available' });

// 1. 验证响应结构
expect(activitiesResponse.success).toBe(true);
expect(activitiesResponse.data).toBeDefined();

// 2. 验证分页字段
const paginationValidation = validateRequiredFields(activitiesResponse.data, [
  'items', 'total', 'page', 'pageSize'
]);
expect(paginationValidation.valid).toBe(true);

// 3. 验证活动对象字段
if (activitiesResponse.data.items.length > 0) {
  const activityValidation = validateRequiredFields(activitiesResponse.data.items[0], [
    'id', 'title', 'type', 'startTime', 'endTime', 'location',
    'maxParticipants', 'currentParticipants', 'status'
  ]);
  expect(activityValidation.valid).toBe(true);

  // 4. 验证字段类型
  const typeValidation = validateFieldTypes(activitiesResponse.data.items[0], {
    id: 'string',
    title: 'string',
    type: 'string',
    startTime: 'string',
    endTime: 'string',
    location: 'string',
    maxParticipants: 'number',
    currentParticipants: 'number',
    status: 'string'
  });
  expect(typeValidation.valid).toBe(true);

  // 5. 验证状态枚举
  const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  expect(validStatuses).toContain(activitiesResponse.data.items[0].status);
}
```

#### 步骤2: 活动详情查看测试
1. 点击任意活动卡片
2. 验证详情页面加载
3. 检查报名按钮状态

**预期结果:**
- ✅ 显示完整活动信息
- ✅ 活动图片正常加载
- ✅ 报名按钮根据状态显示
- ✅ 活动要求清晰说明

**详情验证代码:**
```javascript
// 活动详情API验证
const detailResponse = await getActivityDetailAPI(activityId);

// 验证详情数据结构
const detailValidation = validateRequiredFields(detailResponse.data, [
  'id', 'title', 'description', 'images', 'schedule', 'requirements',
  'organizer', 'contact', 'enrollmentInfo'
]);
expect(detailValidation.valid).toBe(true);

// 验证嵌套对象
const scheduleValidation = validateRequiredFields(detailResponse.data.schedule, [
  'startTime', 'endTime', 'location', 'agenda'
]);
expect(scheduleValidation.valid).toBe(true);

// 验证报名信息
const enrollmentValidation = validateRequiredFields(detailResponse.data.enrollmentInfo, [
  'deadline', 'requirements', 'cost', 'maxParticipants'
]);
expect(enrollmentValidation.valid).toBe(true);
```

#### 步骤3: 活动报名流程测试
1. 在可报名活动中点击报名按钮
2. 选择报名的孩子
3. 填写报名表单
4. 确认提交

**预期结果:**
- ✅ 显示孩子选择列表
- ✅ 表单验证正确工作
- ✅ 报名成功后状态更新
- ✅ 显示报名确认信息

**报名流程验证:**
```javascript
// 活动报名API验证
const enrollmentData = {
  activityId: 'activity_123',
  childIds: ['child_1', 'child_2'],
  parentContact: {
    phone: '13800138000',
    email: 'parent@example.com'
  },
  specialRequests: '孩子对花粉过敏'
};

const enrollmentResponse = await enrollActivityAPI(enrollmentData);

// 验证报名响应
expect(enrollmentResponse.success).toBe(true);
expect(enrollmentResponse.message).toContain('报名成功');

// 验证返回数据
const resultValidation = validateRequiredFields(enrollmentResponse.data, [
  'enrollmentId', 'status', 'enrolledChildren', 'paymentInfo'
]);
expect(resultValidation.valid).toBe(true);

// 验证状态
expect(enrollmentResponse.data.status).toBe('pending');
```

#### 步骤4: 报名状态查询测试
1. 访问我的报名页面: `/mobile/enrollments`
2. 验证报名记录展示
3. 测试状态更新机制

**预期结果:**
- ✅ 显示所有报名记录
- ✅ 状态标识清晰（待确认、已确认、已取消）
- ✅ 支持状态筛选
- ✅ 显示活动倒计时

**状态查询验证:**
```javascript
// 报名状态API验证
const statusResponse = await getEnrollmentStatusAPI();

// 验证状态数据结构
if (statusResponse.data.enrollments.length > 0) {
  const enrollmentValidation = validateRequiredFields(statusResponse.data.enrollments[0], [
    'id', 'activityId', 'activityTitle', 'childName', 'status',
    'enrollmentTime', 'confirmationTime'
  ]);
  expect(enrollmentValidation.valid).toBe(true);

  // 验证状态枚举
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  expect(validStatuses).toContain(statusResponse.data.enrollments[0].status);
}
```

#### 步骤5: 报名取消功能测试
1. 在待确认报名中找到取消选项
2. 确认取消操作
3. 验证取消结果

**预期结果:**
- ✅ 显示取消确认对话框
- ✅ 取消成功后状态更新
- ✅ 如有费用，显示退款信息
- ✅ 发送取消通知

### 活动类型测试场景

| 活动类型 | 报名要求 | 验证重点 |
|---------|----------|----------|
| 校内活动 | 所有孩子可报名 | 基础报名流程 |
| 外出活动 | 需家长同意书 | 同意书上传、签名 |
| 付费活动 | 需支付费用 | 支付集成、退款流程 |
| 竞赛活动 | 需技能筛选 | 筛选条件、预选流程 |
| 亲子活动 | 需家长参与 | 家长信息收集、时间协调 |

### 元素覆盖清单

- [ ] 活动列表容器 `.activities-list`
- [ ] 活动卡片 `.activity-card`
- [ ] 活动状态标签 `.activity-status`
- [ ] 筛选器组件 `.activity-filter`
- [ ] 活动详情页 `.activity-detail`
- [ ] 活动图片轮播 `.activity-gallery`
- [ ] 报名按钮 `.enroll-button`
- [ ] 孩子选择器 `.child-selector`
- [ ] 报名表单 `.enrollment-form`
- [ ] 状态指示器 `.status-indicator`
- [ ] 倒计时组件 `.countdown`
- [ ] 取消确认对话框 `.cancel-confirm`

---

## TC-009: 成长评估系统测试

### 测试目标
验证孩子成长评估系统功能，包括评估记录查看、图表展示、历史对比和成长建议。

### 测试优先级
**中优先级** - 重要功能

### 测试步骤

#### 步骤1: 成长记录列表测试
1. 访问成长评估页面: `/mobile/growth`
2. 选择特定孩子
3. 验证评估记录展示

**预期结果:**
- ✅ 显示所有评估记录
- ✅ 按时间倒序排列
- ✅ 显示评估类型和分数
- ✅ 支持按类型筛选

**API验证要求:**
```javascript
// 成长记录API响应验证
const growthResponse = await getGrowthRecordsAPI(childId);

// 1. 验证响应结构
expect(growthResponse.success).toBe(true);
expect(growthResponse.data).toBeDefined();

// 2. 验证数据结构
const validation = validateRequiredFields(growthResponse.data, [
  'records', 'summary', 'chartData'
]);
expect(validation.valid).toBe(true);

// 3. 验证记录对象字段
if (growthResponse.data.records.length > 0) {
  const recordValidation = validateRequiredFields(growthResponse.data.records[0], [
    'id', 'assessmentDate', 'type', 'scores', 'teacher', 'comments'
  ]);
  expect(recordValidation.valid).toBe(true);

  // 4. 验证分数结构
  const scoresValidation = validateRequiredFields(growthResponse.data.records[0].scores, [
    'language', 'cognitive', 'physical', 'social', 'emotional'
  ]);
  expect(scoresValidation.valid).toBe(true);

  // 5. 验证数值范围
  Object.values(growthResponse.data.records[0].scores).forEach(score => {
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
}
```

#### 步骤2: 成长图表展示测试
1. 查看成长趋势图表
2. 验证图表交互功能
3. 测试不同维度切换

**预期结果:**
- ✅ 雷达图正常渲染
- ✅ 支持触摸交互查看详情
- ✅ 可切换不同评估维度
- ✅ 显示历史趋势对比

**图表验证代码:**
```javascript
// 图表数据验证
const chartData = growthResponse.data.chartData;

// 验证图表数据结构
const chartValidation = validateRequiredFields(chartData, [
  'radarData', 'trendData', 'categories'
]);
expect(chartValidation.valid).toBe(true);

// 验证雷达图数据
expect(Array.isArray(chartData.radarData)).toBe(true);
chartData.radarData.forEach(point => {
  expect(point.axis).toBeDefined();
  expect(point.value).toBeGreaterThanOrEqual(0);
  expect(point.value).toBeLessThanOrEqual(100);
});

// UI验证
const chartCanvas = document.querySelector('.growth-chart canvas');
expect(chartCanvas).toBeTruthy();

// 验证图例
const legends = document.querySelectorAll('.chart-legend .legend-item');
expect(legends.length).toBeGreaterThan(0);
```

#### 步骤3: 评估详情查看测试
1. 点击任意评估记录
2. 验证详情页面展示
3. 检查评语和建议

**预期结果:**
- ✅ 显示详细评估分数
- ✅ 展示教师评语
- ✅ 提供改进建议
- ✅ 支持打印或分享

**详情验证:**
```javascript
// 评估详情API验证
const detailResponse = await getAssessmentDetailAPI(assessmentId);

// 验证详情数据
const detailValidation = validateRequiredFields(detailResponse.data, [
  'assessmentId', 'childName', 'assessmentDate', 'teacher',
  'detailedScores', 'comments', 'recommendations', 'nextSteps'
]);
expect(detailValidation.valid).toBe(true);

// 验证教师评语
expect(detailResponse.data.comments.length).toBeGreaterThan(0);
expect(typeof detailResponse.data.comments[0]).toBe('string');
expect(detailResponse.data.comments[0].trim()).length > 10;
```

#### 步骤4: 成长对比功能测试
1. 选择不同时间段进行对比
2. 验证对比结果展示
3. 测试进步分析

**预期结果:**
- ✅ 显示对比数据
- ✅ 突出显示进步项
- ✅ 提供成长建议
- ✅ 生成对比报告

#### 步骤5: 成长建议查看测试
1. 查看AI生成的成长建议
2. 验证建议相关性
3. 测试建议采纳功能

**预期结果:**
- ✅ 建议内容针对性强
- ✅ 包含具体可操作建议
- ✅ 支持标记建议为有用
- ✅ 可查看建议执行效果

### 评估维度测试

| 维度 | 评分标准 | 测试重点 |
|------|----------|----------|
| 语言发展 | 词汇量、表达能力 | 词汇测试、对话评估 |
| 认知发展 | 逻辑思维、解决问题 | 拼图测试、数学题 |
| 身体发展 | 大运动、精细动作 | 跑跳测试、手工评估 |
| 社交发展 | 人际交往、合作能力 | 团体活动观察 |
| 情感发展 | 情绪管理、自我认知 | 情绪识别测试 |

### 元素覆盖清单

- [ ] 成长记录列表 `.growth-records`
- [ ] 评估卡片 `.assessment-card`
- [ ] 雷达图组件 `.radar-chart`
- [ ] 趋势图组件 `.trend-chart`
- [ ] 筛选器 `.assessment-filter`
- [ ] 详情页面 `.assessment-detail`
- [ ] 分数展示 `.score-display`
- [ ] 教师评语 `.teacher-comments`
- [ ] 成长建议 `.growth-suggestions`
- [ ] 对比功能 `.comparison`
- [ ] 打印按钮 `.print-button`
- [ ] 分享按钮 `.share-button`

---

## TC-010: AI助手交互测试

### 测试目标
验证移动端AI助手功能，包括智能问答、成长建议、活动推荐等交互功能。

### 测试优先级
**中优先级** - 增值功能

### 测试步骤

#### 步骤1: AI助手页面加载测试
1. 访问AI助手页面: `/mobile/ai-assistant`
2. 验证页面组件加载
3. 检查初始化状态

**预期结果:**
- ✅ 页面加载时间 < 3秒
- ✅ AI助手头像和名称显示
- ✅ 聊天界面正常初始化
- ✅ 显示欢迎消息和快捷问题

**验证代码:**
```javascript
// AI助手初始化验证
await navigateTo('/mobile/ai-assistant');

const loadTime = performance.now();
expect(loadTime).toBeLessThan(3000);

// 验证基础组件
const chatContainer = document.querySelector('.chat-container, .ai-chat');
const inputArea = document.querySelector('.input-area, .message-input');
const sendButton = document.querySelector('.send-button, .send-btn');

expect(chatContainer).toBeTruthy();
expect(inputArea).toBeTruthy();
expect(sendButton).toBeTruthy();

// 验证欢迎消息
const welcomeMessage = document.querySelector('.welcome-message, .greeting');
expect(welcomeMessage).toBeTruthy();
expect(welcomeMessage.textContent).toContain('您好');
```

#### 步骤2: 快捷问题交互测试
1. 点击快捷问题按钮
2. 验证问题自动填充
3. 检查AI响应时间

**预期结果:**
- ✅ 快捷问题点击后自动发送
- ✅ AI响应时间 < 5秒
- ✅ 响应内容相关且有用
- ✅ 支持追问和对话继续

**API验证要求:**
```javascript
// AI对话API响应验证
const aiResponse = await sendAIMessage('我的孩子最近不爱吃饭怎么办？');

// 1. 验证响应结构
expect(aiResponse.success).toBe(true);
expect(aiResponse.data).toBeDefined();

// 2. 验证必填字段
const responseValidation = validateRequiredFields(aiResponse.data, [
  'message', 'responseId', 'timestamp', 'suggestions'
]);
expect(responseValidation.valid).toBe(true);

// 3. 验证消息内容
expect(aiResponse.data.message.length).toBeGreaterThan(20);
expect(typeof aiResponse.data.message).toBe('string');

// 4. 验证建议数组
if (aiResponse.data.suggestions.length > 0) {
  expect(Array.isArray(aiResponse.data.suggestions)).toBe(true);
  aiResponse.data.suggestions.forEach(suggestion => {
    expect(suggestion.text).toBeDefined();
    expect(suggestion.text.length).toBeGreaterThan(0);
  });
}
```

#### 步骤3: 自定义问题发送测试
1. 在输入框输入自定义问题
2. 点击发送按钮
3. 验证AI回答质量

**预期结果:**
- ✅ 问题成功发送到聊天界面
- ✅ 显示AI思考中状态
- ✅ 生成有针对性的回答
- ✅ 支持追问和多轮对话

**对话质量验证:**
```javascript
// 对话质量验证函数
function validateAIResponse(question, response) {
  // 验证响应相关性
  expect(response.toLowerCase()).toContain(
    question.toLowerCase().split(' ').slice(0, 2).join(' ')
  );

  // 验证响应长度合理性
  expect(response.length).toBeGreaterThan(50);
  expect(response.length).toBeLessThan(1000);

  // 验证包含实用建议
  const helpfulKeywords = ['建议', '可以', '方法', '注意', '尝试'];
  const containsHelpfulAdvice = helpfulKeywords.some(keyword =>
    response.includes(keyword)
  );
  expect(containsHelpfulAdvice).toBe(true);
}
```

#### 步骤4: 智能推荐功能测试
1. 查看AI推荐的活动
2. 点击推荐项查看详情
3. 验证推荐准确性

**预期结果:**
- ✅ 基于孩子年龄推荐活动
- ✅ 基于兴趣爱好推荐内容
- ✅ 推荐理由清晰说明
- ✅ 支持反馈推荐质量

**推荐API验证:**
```javascript
// AI推荐API响应验证
const recommendationResponse = await getAIRecommendationsAPI(childId);

// 验证推荐数据结构
if (recommendationResponse.data.recommendations.length > 0) {
  const recValidation = validateRequiredFields(recommendationResponse.data.recommendations[0], [
    'id', 'type', 'title', 'description', 'reason', 'matchScore'
  ]);
  expect(recValidation.valid).toBe(true);

  // 验证匹配分数
  expect(recommendationResponse.data.recommendations[0].matchScore).toBeGreaterThanOrEqual(0);
  expect(recommendationResponse.data.recommendations[0].matchScore).toBeLessThanOrEqual(100);
}
```

#### 步骤5: 语音交互测试
1. 点击语音输入按钮
2. 说出问题或指令
3. 验证语音识别和响应

**预期结果:**
- ✅ 语音识别准确率高
- ✅ 支持中文语音输入
- ✅ 识别后自动发送问题
- ✅ AI响应正常处理

**语音功能验证:**
```javascript
// 语音识别功能验证
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();

  // 验证语音配置
  expect(recognition.lang).toBe('zh-CN');
  expect(recognition.continuous).toBe(false);
  expect(recognition.interimResults).toBe(true);

  // 模拟语音识别结果
  const mockResult = {
    results: [{
      0: { transcript: '我的孩子最近表现怎么样' }
    }]
  };

  // 验证识别结果处理
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    expect(transcript.length).toBeGreaterThan(0);
    expect(typeof transcript).toBe('string');
  };
}
```

### AI功能测试场景

| 场景类型 | 输入问题 | 期望响应类型 |
|---------|----------|-------------|
| 教育咨询 | 孩子不爱学习怎么办 | 教育方法和建议 |
| 健康问题 | 孩子挑食怎么办 | 营养建议和食谱 |
| 活动推荐 | 推荐适合的活动 | 个性化活动列表 |
| 成长评估 | 孩子发展是否正常 | 发展阶段分析 |
| 心理辅导 | 孩子情绪不稳定 | 情绪管理建议 |

### 元素覆盖清单

- [ ] AI助手容器 `.ai-assistant`
- [ ] 聊天界面 `.chat-container`
- [ ] 消息列表 `.messages-list`
- [ ] 输入区域 `.input-area`
- [ ] 发送按钮 `.send-button`
- [ ] 快捷问题 `.quick-questions`
- [ ] 语音输入按钮 `.voice-input`
- [ ] AI头像 `.ai-avatar`
- [ ] 打字动画 `.typing-indicator`
- [ ] 推荐卡片 `.recommendation-card`
- [ ] 反馈按钮 `.feedback-button`
- [ ] 历史记录 `.chat-history`

### 性能要求

- **页面加载时间**: < 3秒
- **AI响应时间**: < 5秒
- **语音识别响应**: < 2秒
- **消息发送响应**: < 500ms

### 安全要求

- [ ] 敏感信息过滤
- [ ] 对话内容加密
- [ ] 用户隐私保护
- [ ] 有害内容识别

---

## 测试执行指南

### 环境准备

```bash
# 安装移动端测试依赖
npm install --save-dev @playwright/test

# 启动测试环境
npm run start:all

# 运行移动端家长中心测试
npm run test:mobile:parent
```

### 测试数据准备

```javascript
// 测试用户数据
const testUsers = {
  parent: {
    username: 'test_parent',
    password: 'password123',
    role: 'parent'
  }
};

// 测试孩子数据
const testChildren = [
  {
    id: 'child_1',
    name: '小明',
    grade: '大班',
    className: '大一班'
  }
];
```

### 验证工具函数

```javascript
// 数据验证工具
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '@/utils/data-validation';

// 移动端交互工具
import {
  tapElement,
  swipeElement,
  waitForElement
} from '@/utils/mobile-interactions';

// AI响应质量评估
import {
  evaluateResponseRelevance,
  checkResponseHelpfulness
} from '@/utils/ai-quality';
```

### 持续集成配置

```yaml
# .github/workflows/mobile-test.yml
name: Mobile Parent Center Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm run install:all
      - name: Run mobile tests
        run: npm run test:mobile:parent:ci
```

---

## 验收标准

### 功能验收标准
- [ ] 所有测试用例通过率 100%
- [ ] 无控制台错误和警告
- [ ] 移动端适配响应正常
- [ ] 用户体验流畅自然

### 性能验收标准
- [ ] 页面加载时间 < 3秒
- [ ] API响应时间 < 2秒
- [ ] 交互响应时间 < 100ms
- [ ] 内存使用稳定

### AI功能验收标准
- [ ] AI响应相关性 > 80%
- [ ] 语音识别准确率 > 90%
- [ ] 推荐准确率 > 85%
- [ ] 用户满意度 > 4.0/5.0

---

**文档版本**: v1.0
**最后更新**: 2025-11-24
**状态**: 可执行测试用例