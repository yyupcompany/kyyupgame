# TC-025: 系统服务API集成测试

## 📋 测试概述

**测试目标**: 验证移动端系统服务相关API的完整集成，包括通知管理、文件上传、系统配置、日志管理等功能
**测试类型**: API集成测试
**优先级**: 高
**预计执行时间**: 6-10分钟

---

## 🎯 测试场景

### 场景1: 通知服务API集成测试
- **目标**: 验证通知推送和管理功能
- **覆盖功能**: 消息推送、通知列表、已读状态、通知设置

### 场景2: 文件服务API集成测试
- **目标**: 验证文件上传下载和管理功能
- **覆盖功能**: 文件上传、下载链接、文件管理、权限控制

### 场景3: 系统配置API集成测试
- **目标**: 验证系统配置管理功能
- **覆盖功能**: 配置获取、配置更新、配置缓存、默认值管理

### 场景4: 日志服务API集成测试
- **目标**: 验证系统日志记录和查询功能
- **覆盖功能**: 操作日志、错误日志、日志查询、日志分析

### 场景5: 任务调度API集成测试
- **目标**: 验证定时任务和调度功能
- **覆盖功能**: 任务创建、任务执行、任务监控、任务历史

---

## 🔍 详细测试用例

### TC-025-01: 通知服务API集成测试

**测试步骤**:
1. 发送系统通知
2. 获取通知列表
3. 标记通知已读
4. 批量操作通知
5. 配置通知设置

**API端点**: 
- `POST /api/notifications/send`
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `POST /api/notifications/batch-operation`

**严格验证要求**:
```typescript
// 1. 通知发送响应验证
const sendResponse = await sendNotification(notificationData);
const sendFields = ['success', 'data', 'message'];
const sendValidation = validateRequiredFields(sendResponse, sendFields);
expect(sendValidation.valid).toBe(true);

// 2. 通知记录字段验证
const notificationFields = [
  'id', 'title', 'content', 'type', 'priority', 
  'senderId', 'recipientIds', 'sentAt', 'status'
];
const notificationValidation = validateRequiredFields(
  sendResponse.data.notification, 
  notificationFields
);
expect(notificationValidation.valid).toBe(true);

// 3. 字段类型验证
const typeValidation = validateFieldTypes(sendResponse.data.notification, {
  id: 'string',
  title: 'string',
  content: 'string',
  type: 'string',
  priority: 'string',
  senderId: 'string',
  recipientIds: 'array',
  sentAt: 'string',
  status: 'string'
});
expect(typeValidation.valid).toBe(true);

// 4. 枚举值验证
const validTypes = ['SYSTEM', 'ACTIVITY', 'EDUCATION', 'URGENT', 'REMINDER'];
const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const validStatuses = ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'];

expect(validTypes).toContain(sendResponse.data.notification.type);
expect(validPriorities).toContain(sendResponse.data.notification.priority);
expect(validStatuses).toContain(sendResponse.data.notification.status);

// 5. 数组类型验证
expect(Array.isArray(sendResponse.data.notification.recipientIds)).toBe(true);
```

**通知列表验证**:
```typescript
// 1. 列表响应验证
const listResponse = await getNotificationList({ page: 1, pageSize: 20 });
const listFields = ['success', 'data'];
const listValidation = validateRequiredFields(listResponse, listFields);
expect(listValidation.valid).toBe(true);

// 2. 分页结构验证
const paginationFields = ['items', 'total', 'page', 'pageSize', 'unreadCount'];
const paginationValidation = validateRequiredFields(listResponse.data, paginationFields);
expect(paginationValidation.valid).toBe(true);

// 3. 通知项字段验证
if (listResponse.data.items.length > 0) {
  const itemFields = ['id', 'title', 'content', 'type', 'priority', 'isRead', 'createdAt'];
  const itemValidation = validateRequiredFields(listResponse.data.items[0], itemFields);
  expect(itemValidation.valid).toBe(true);

  // 4. 布尔类型验证
  const booleanValidation = validateFieldTypes(listResponse.data.items[0], {
    isRead: 'boolean'
  });
  expect(booleanValidation.valid).toBe(true);

  // 5. 内容长度验证
  const item = listResponse.data.items[0];
  expect(item.title.length).toBeGreaterThan(0);
  expect(item.title.length).toBeLessThanOrEqual(100);
  expect(item.content.length).toBeGreaterThan(0);
  expect(item.content.length).toBeLessThanOrEqual(1000);
}
```

**预期结果**:
- ✅ 通知发送功能正常
- ✅ 通知列表正确分页
- ✅ 已读状态正确管理
- ✅ 批量操作功能完整
- ✅ 通知设置有效应用

### TC-025-02: 文件服务API集成测试

**测试步骤**:
1. 上传测试文件
2. 获取文件信息
3. 生成下载链接
4. 删除文件
5. 管理文件权限

**API端点**: 
- `POST /api/files/upload`
- `GET /api/files/:id`
- `GET /api/files/:id/download-link`
- `DELETE /api/files/:id`

**严格验证要求**:
```typescript
// 1. 文件上传响应验证
const uploadResponse = await uploadFile(fileData);
const uploadFields = ['success', 'data', 'message'];
const uploadValidation = validateRequiredFields(uploadResponse, uploadFields);
expect(uploadValidation.valid).toBe(true);

// 2. 文件信息字段验证
const fileInfoFields = [
  'id', 'originalName', 'fileName', 'fileSize', 'mimeType', 
  'uploadedBy', 'uploadedAt', 'filePath', 'downloadCount'
];
const fileInfoValidation = validateRequiredFields(
  uploadResponse.data.file, 
  fileInfoFields
);
expect(fileInfoValidation.valid).toBe(true);

// 3. 字段类型验证
const fileTypeValidation = validateFieldTypes(uploadResponse.data.file, {
  id: 'string',
  originalName: 'string',
  fileName: 'string',
  fileSize: 'number',
  mimeType: 'string',
  uploadedBy: 'string',
  uploadedAt: 'string',
  filePath: 'string',
  downloadCount: 'number'
});
expect(fileTypeValidation.valid).toBe(true);

// 4. 文件大小验证
expect(uploadResponse.data.file.fileSize).toBeGreaterThan(0);
expect(uploadResponse.data.file.fileSize).toBeLessThanOrEqual(50 * 1024 * 1024); // 50MB limit

// 5. 文件类型验证
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
  'text/plain', 'application/msword', 'application/vnd.ms-excel'
];
expect(allowedMimeTypes).toContain(uploadResponse.data.file.mimeType);
```

**下载链接验证**:
```typescript
// 1. 下载链接响应验证
const downloadLinkResponse = await getDownloadLink(fileId);
const linkFields = ['success', 'data'];
const linkValidation = validateRequiredFields(downloadLinkResponse, linkFields);
expect(linkValidation.valid).toBe(true);

// 2. 链接字段验证
const downloadFields = ['downloadUrl', 'expiresAt', 'accessKey'];
const downloadValidation = validateRequiredFields(
  downloadLinkResponse.data, 
  downloadFields
);
expect(downloadValidation.valid).toBe(true);

// 3. URL格式验证
expect(downloadLinkResponse.data.downloadUrl).toMatch(/^https?:\/\/.+/);

// 4. 过期时间验证
const expiresAt = new Date(downloadLinkResponse.data.expiresAt);
const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
expect(expiresAt.getTime()).toBeLessThanOrEqual(oneHourLater.getTime());

// 5. 访问密钥验证
expect(downloadLinkResponse.data.accessKey).toMatch(/^[A-Za-z0-9-_]{32,}$/);
```

**预期结果**:
- ✅ 文件上传功能正常
- ✅ 文件信息正确记录
- ✅ 下载链接安全有效
- ✅ 文件删除功能完整
- ✅ 权限控制机制生效

### TC-025-03: 系统配置API集成测试

**测试步骤**:
1. 获取系统配置
2. 更新配置项
3. 批量更新配置
4. 重置配置为默认值
5. 验证配置缓存

**API端点**: 
- `GET /api/system/config`
- `PUT /api/system/config/:key`
- `POST /api/system/config/batch-update`
- `POST /api/system/config/reset`

**严格验证要求**:
```typescript
// 1. 配置获取响应验证
const configResponse = await getSystemConfig();
const configFields = ['success', 'data'];
const configValidation = validateRequiredFields(configResponse, configFields);
expect(configValidation.valid).toBe(true);

// 2. 配置数据字段验证
const configDataFields = ['general', 'notification', 'fileUpload', 'security', 'cache'];
const configDataValidation = validateRequiredFields(
  configResponse.data.config, 
  configDataFields
);
expect(configDataValidation.valid).toBe(true);

// 3. 对象类型验证
expect(typeof configResponse.data.config.general).toBe('object');
expect(typeof configResponse.data.config.notification).toBe('object');
expect(typeof configResponse.data.config.fileUpload).toBe('object');
expect(typeof configResponse.data.config.security).toBe('object');
expect(typeof configResponse.data.config.cache).toBe('object');

// 4. 通用配置字段验证
const generalFields = ['siteName', 'siteDescription', 'version', 'maintenance'];
const generalValidation = validateRequiredFields(
  configResponse.data.config.general, 
  generalFields
);
expect(generalValidation.valid).toBe(true);

// 5. 文件上传配置验证
const uploadConfigFields = ['maxFileSize', 'allowedTypes', 'storagePath'];
const uploadConfigValidation = validateRequiredFields(
  configResponse.data.config.fileUpload, 
  uploadConfigFields
);
expect(uploadConfigValidation.valid).toBe(true);

// 6. 数值范围验证
expect(configResponse.data.config.fileUpload.maxFileSize).toBeGreaterThan(0);
expect(configResponse.data.config.fileUpload.maxFileSize).toBeLessThanOrEqual(100 * 1024 * 1024);
```

**配置更新验证**:
```typescript
// 1. 配置更新响应验证
const updateResponse = await updateConfig('siteName', '新站点名称');
const updateFields = ['success', 'data', 'message'];
const updateValidation = validateRequiredFields(updateResponse, updateFields);
expect(updateValidation.valid).toBe(true);

// 2. 更新结果验证
expect(updateResponse.data.key).toBe('siteName');
expect(updateResponse.data.oldValue).toBeDefined();
expect(updateResponse.data.newValue).toBe('新站点名称');
expect(updateResponse.data.updatedAt).toBeDefined();

// 3. 时间戳验证
const timestampValidation = validateDateFormat(updateResponse.data.updatedAt);
expect(timestampValidation).toBe(true);

// 4. 配置持久化验证
const updatedConfig = await getSystemConfig();
expect(updatedConfig.data.config.general.siteName).toBe('新站点名称');
```

**预期结果**:
- ✅ 配置获取功能正常
- ✅ 配置更新立即生效
- ✅ 批量更新功能完整
- ✅ 默认值重置有效
- ✅ 配置缓存正确更新

### TC-025-04: 日志服务API集成测试

**测试步骤**:
1. 记录操作日志
2. 查询日志列表
3. 过滤日志数据
4. 分析日志统计
5. 导出日志报告

**API端点**: 
- `POST /api/logs/record`
- `GET /api/logs`
- `GET /api/logs/statistics`
- `POST /api/logs/export`

**严格验证要求**:
```typescript
// 1. 日志记录响应验证
const recordResponse = await recordLog(logData);
const recordFields = ['success', 'data', 'message'];
const recordValidation = validateRequiredFields(recordResponse, recordFields);
expect(recordValidation.valid).toBe(true);

// 2. 日志记录字段验证
const logRecordFields = [
  'id', 'level', 'action', 'resource', 'userId', 
  'ipAddress', 'userAgent', 'timestamp', 'details'
];
const logRecordValidation = validateRequiredFields(
  recordResponse.data.log, 
  logRecordFields
);
expect(logRecordValidation.valid).toBe(true);

// 3. 日志级别验证
const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
expect(validLevels).toContain(recordResponse.data.log.level);

// 4. 字段类型验证
const logTypeValidation = validateFieldTypes(recordResponse.data.log, {
  id: 'string',
  level: 'string',
  action: 'string',
  resource: 'string',
  userId: 'string',
  ipAddress: 'string',
  userAgent: 'string',
  timestamp: 'string',
  details: 'object'
});
expect(logTypeValidation.valid).toBe(true);

// 5. IP地址格式验证
expect(recordResponse.data.log.ipAddress).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
```

**日志查询验证**:
```typescript
// 1. 查询响应验证
const queryResponse = await queryLogs(queryParams);
const queryFields = ['success', 'data'];
const queryValidation = validateRequiredFields(queryResponse, queryFields);
expect(queryValidation.valid).toBe(true);

// 2. 查询结果字段验证
const resultFields = ['logs', 'total', 'page', 'pageSize', 'filters'];
const resultValidation = validateRequiredFields(queryResponse.data, resultFields);
expect(resultValidation.valid).toBe(true);

// 3. 日志数组验证
expect(Array.isArray(queryResponse.data.logs)).toBe(true);

// 4. 日志项字段验证
if (queryResponse.data.logs.length > 0) {
  const logFields = ['id', 'level', 'action', 'timestamp', 'userId'];
  const logValidation = validateRequiredFields(queryResponse.data.logs[0], logFields);
  expect(logValidation.valid).toBe(true);

  // 5. 过滤功能验证
  if (queryParams.level) {
    queryResponse.data.logs.forEach(log => {
      expect(log.level).toBe(queryParams.level);
    });
  }
}
```

**预期结果**:
- ✅ 日志记录功能正常
- ✅ 日志查询准确高效
- ✅ 过滤功能完整有效
- ✅ 统计分析结果可信
- ✅ 日志导出功能完整

### TC-025-05: 任务调度API集成测试

**测试步骤**:
1. 创建定时任务
2. 执行任务调度
3. 监控任务状态
4. 获取任务历史
5. 取消计划任务

**API端点**: 
- `POST /api/tasks/create`
- `GET /api/tasks`
- `POST /api/tasks/:id/execute`
- `GET /api/tasks/:id/history`

**严格验证要求**:
```typescript
// 1. 任务创建响应验证
const createResponse = await createTask(taskData);
const createFields = ['success', 'data', 'message'];
const createValidation = validateRequiredFields(createResponse, createFields);
expect(createValidation.valid).toBe(true);

// 2. 任务对象字段验证
const taskFields = [
  'id', 'name', 'description', 'type', 'schedule', 
  'status', 'createdBy', 'createdAt', 'nextRunTime'
];
const taskValidation = validateRequiredFields(createResponse.data.task, taskFields);
expect(taskValidation.valid).toBe(true);

// 3. 任务类型验证
const validTypes = ['BACKUP', 'CLEANUP', 'REPORT', 'NOTIFICATION', 'DATA_SYNC'];
const validStatuses = ['ACTIVE', 'INACTIVE', 'RUNNING', 'COMPLETED', 'FAILED'];
expect(validTypes).toContain(createResponse.data.task.type);
expect(validStatuses).toContain(createResponse.data.task.status);

// 4. 调度配置验证
const scheduleFields = ['type', 'expression', 'timezone'];
const scheduleValidation = validateRequiredFields(
  createResponse.data.task.schedule, 
  scheduleFields
);
expect(scheduleValidation.valid).toBe(true);

// 5. Cron表达式验证
if (createResponse.data.task.schedule.type === 'CRON') {
  expect(createResponse.data.task.schedule.expression).toMatch(/^(\*|[0-5]?\d|\*\/\d+) (\*|[01]?\d|2[0-3]|\*\/\d+) (\*|[12]?\d|3[01]|\*\/\d+) (\*|[01]?\d|\*\/\d+) (\*|[0-6]|\*\/\d+)$/);
}
```

**任务执行验证**:
```typescript
// 1. 任务执行响应验证
const executeResponse = await executeTask(taskId);
const executeFields = ['success', 'data', 'message'];
const executeValidation = validateRequiredFields(executeResponse, executeFields);
expect(executeValidation.valid).toBe(true);

// 2. 执行记录字段验证
const executionFields = ['executionId', 'taskId', 'status', 'startTime', 'result'];
const executionValidation = validateRequiredFields(
  executeResponse.data.execution, 
  executionFields
);
expect(executionValidation.valid).toBe(true);

// 3. 执行状态验证
const validExecutionStatuses = ['STARTED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'];
expect(validExecutionStatuses).toContain(executeResponse.data.execution.status);

// 4. 时间戳验证
const startTimeValidation = validateDateFormat(executeResponse.data.execution.startTime);
expect(startTimeValidation).toBe(true);

// 5. 执行结果验证
if (executeResponse.data.execution.status === 'COMPLETED') {
  expect(executeResponse.data.execution.result).toBeDefined();
  expect(executeResponse.data.execution.endTime).toBeDefined();
  expect(executeResponse.data.execution.duration).toBeGreaterThan(0);
}
```

**预期结果**:
- ✅ 任务创建功能正常
- ✅ 调度配置正确解析
- ✅ 任务执行状态准确
- ✅ 执行历史完整记录
- ✅ 任务取消功能有效

---

## 🚨 错误场景测试

### 场景1: 文件大小超限
- **模拟**: 上传超过限制的文件
- **验证**: 文件大小检查机制
- **预期**: 返回400状态码和大小限制错误

### 场景2: 无效的配置值
- **模拟**: 提交无效格式的配置值
- **验证**: 配置值验证规则
- **预期**: 返回400状态码和验证错误详情

### 场景3: 不支持的文件类型
- **模拟**: 上传不允许的文件类型
- **验证**: 文件类型检查机制
- **预期**: 返回400状态码和类型限制错误

### 场景4: 权限不足操作
- **模拟**: 无权限用户访问系统配置
- **验证**: 权限控制机制
- **预期**: 返回403状态码和权限错误信息

---

## 🔧 技术要求

### API请求格式
```typescript
// 通知发送请求
interface SendNotificationRequest {
  title: string;
  content: string;
  type: 'SYSTEM' | 'ACTIVITY' | 'EDUCATION' | 'URGENT' | 'REMINDER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  recipientIds: string[];
  scheduledAt?: string;
  data?: any;
}

// 文件上传请求
interface UploadFileRequest {
  file: File;
  category?: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO';
  isPublic?: boolean;
  expirationDate?: string;
}
```

### 响应格式验证
```typescript
// 通知列表响应
interface NotificationListResponse {
  success: boolean;
  data: {
    items: Notification[];
    total: number;
    page: number;
    pageSize: number;
    unreadCount: number;
  };
}

// 系统配置响应
interface SystemConfigResponse {
  success: boolean;
  data: {
    config: {
      general: GeneralConfig;
      notification: NotificationConfig;
      fileUpload: FileUploadConfig;
      security: SecurityConfig;
      cache: CacheConfig;
    };
  };
}
```

---

## 📊 测试数据

### 系统配置模板
```typescript
const systemConfigTemplate = {
  general: {
    siteName: '幼儿园管理系统',
    siteDescription: '专业的幼儿园综合管理平台',
    version: '1.0.0',
    maintenance: false
  },
  notification: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    maxRetries: 3
  },
  fileUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    storagePath: '/uploads'
  }
};
```

---

## ✅ 验收标准

1. ✅ 所有系统服务API端点正常响应
2. ✅ 数据结构验证通过率100%
3. ✅ 字段类型验证通过率100%
4. ✅ 文件上传下载功能正常
5. ✅ 通知推送机制有效
6. ✅ 配置管理功能完整
7. ✅ 日志记录查询准确
8. ✅ 任务调度执行可靠

---

## 📝 测试报告模板

```typescript
interface SystemServicesAPITestReport {
  testId: 'TC-025';
  testDate: string;
  testEnvironment: string;
  results: {
    notificationService: TestResult;
    fileService: TestResult;
    systemConfig: TestResult;
    logService: TestResult;
    taskScheduler: TestResult;
    errorHandling: TestResult;
  };
  performance: {
    notificationDeliveryTime: number;
    fileUploadSpeed: number;
    configUpdateLatency: number;
    logQueryPerformance: number;
    taskExecutionTime: number;
  };
  reliability: {
    notificationSuccessRate: number;
    fileUploadSuccessRate: number;
    configPersistence: boolean;
    logIntegrity: boolean;
    taskReliability: number;
  };
  security: {
    fileAccessControl: boolean;
    configAccessControl: boolean;
    logDataPrivacy: boolean;
    taskExecutionSecurity: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 配置文件上传路径、通知服务等
2. **权限准备**: 创建不同权限级别的测试账户
3. **文件准备**: 准备各种类型和大小的测试文件
4. **配置备份**: 测试前备份系统配置
5. **执行顺序**: 按照服务依赖关系执行测试
6. **清理工作**: 测试后清理临时文件和测试数据

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行