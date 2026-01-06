# TC-042: API请求失败处理测试

## 📋 测试概述

**测试目的**: 验证移动端应用在API请求失败时的错误处理机制和用户体验  
**测试类型**: 错误处理测试  
**优先级**: 高  
**预计执行时间**: 20分钟  

## 🎯 测试目标

1. **HTTP状态码错误处理**: 验证各种HTTP状态码的错误处理
2. **API响应格式错误**: 验证非标准API响应格式的处理
3. **认证失败处理**: 验证Token过期和权限错误的处理
4. **服务端错误处理**: 验证500、503等服务器错误的处理
5. **并发请求错误**: 验证多个并发请求中部分失败的处理

## 🔧 测试环境设置

### API模拟配置
```typescript
// API错误模拟配置
const apiErrorScenarios = {
  unauthorized: { status: 401, error: 'Unauthorized', message: 'Token已过期' },
  forbidden: { status: 403, error: 'Forbidden', message: '权限不足' },
  notFound: { status: 404, error: 'Not Found', message: '资源不存在' },
  serverError: { status: 500, error: 'Internal Server Error', message: '服务器内部错误' },
  serviceUnavailable: { status: 503, error: 'Service Unavailable', message: '服务暂时不可用' },
  invalidResponse: { status: 200, data: 'invalid json format' },
  emptyResponse: { status: 200, data: null },
  malformedResponse: { status: 200, data: { success: false, error: '未知错误' } }
};
```

### 请求拦截器配置
```javascript
// 在测试环境配置请求拦截器
axios.interceptors.request.use(config => {
  if (config.testScenario) {
    config.testScenario = config.testScenario;
  }
  return config;
});
```

## 📝 详细测试用例

### TC-042-01: HTTP 401 未授权错误处理
**测试步骤**:
1. 使用有效的Token进行登录
2. 模拟Token过期（服务器返回401）
3. 尝试访问需要认证的API：
   - 获取用户信息
   - 访问数据中心
   - 执行受保护操作

**预期结果**:
- ✅ 检测到401错误并清除本地Token
- ✅ 跳转到登录页面
- ✅ 显示"登录已过期，请重新登录"提示
- ✅ 自动清除敏感数据
- ✅ 不在控制台暴露Token信息

**严格验证**:
```typescript
// 验证401错误处理
const authErrorValidation = {
  responseStatus: 401,
  tokenCleared: true,
  redirectToLogin: true,
  userMessage: '登录已过期，请重新登录',
  sensitiveDataCleared: true,
  consoleErrors: ['Token expired'],
  redirectDelay: '<1000ms'
};
```

### TC-042-02: HTTP 403 权限不足错误处理
**测试步骤**:
1. 使用普通用户账号登录
2. 尝试访问管理员功能：
   - 访问系统设置页面
   - 执行管理操作
   - 查看敏感数据

**预期结果**:
- ✅ 显示权限不足错误提示
- ✅ 不显示技术错误详情
- ✅ 返回到有权限的页面
- ✅ 记录权限访问日志

**严格验证**:
```typescript
// 验证403错误处理
const permissionErrorValidation = {
  responseStatus: 403,
  errorMessage: '权限不足',
  redirectToHomePage: true,
  accessLogRecorded: true,
  noTechnicalDetails: true,
  userFriendlyMessage: true
};
```

### TC-042-03: HTTP 404 资源不存在错误处理
**测试步骤**:
1. 尝试访问不存在的资源：
   - 无效的用户ID
   - 不存在的页面URL
   - 已删除的数据记录
   - 过期的API端点

**预期结果**:
- ✅ 显示"资源不存在"友好提示
- ✅ 提供返回首页或搜索的选项
- ✅ 不显示404技术页面
- ✅ 自动跳转到相关页面（如有）

**严格验证**:
```typescript
// 验证404错误处理
const notFoundValidation = {
  responseStatus: 404,
  errorMessage: '访问的资源不存在',
  showSearchOption: true,
  showHomePageLink: true,
  preventTechnical404Page: true,
  autoRedirectToRelevantPage: true
};
```

### TC-042-04: HTTP 500 服务器内部错误处理
**测试步骤**:
1. 模拟服务器返回500错误
2. 测试以下场景：
   - 数据提交时服务器错误
   - 数据获取时服务器错误
   - 文件上传时服务器错误

**预期结果**:
- ✅ 显示"服务器暂时不可用"友好提示
- ✅ 提供重试选项
- ✅ 不暴露服务器错误详情
- ✅ 实现智能重试机制

**严格验证**:
```typescript
// 验证500错误处理
const serverErrorValidation = {
  responseStatus: 500,
  userMessage: '服务器暂时不可用，请稍后重试',
  showRetryButton: true,
  hideTechnicalDetails: true,
  enableSmartRetry: true,
  maxRetryAttempts: 3,
  retryDelay: 'exponential-backoff'
};
```

### TC-042-05: API响应格式异常处理
**测试步骤**:
1. 模拟各种异常响应格式：
   - 无效JSON格式
   - 空响应数据
   - 缺少必要字段的响应
   - 数据类型错误的响应

**预期结果**:
- ✅ 检测到响应格式异常
- ✅ 显示"数据格式错误"提示
- ✅ 不导致应用崩溃
- ✅ 记录格式错误日志

**严格验证**:
```typescript
// 验证响应格式处理
const formatErrorValidation = {
  detectInvalidJson: true,
  handleEmptyResponse: true,
  validateRequiredFields: true,
  validateDataTypes: true,
  preventAppCrash: true,
  logFormatErrors: true,
  userMessage: '数据格式错误，请刷新页面重试'
};
```

### TC-042-06: 并发请求部分失败处理
**测试步骤**:
1. 同时发起多个API请求
2. 模拟部分请求成功、部分失败
3. 验证应用行为：
   - 页面数据加载状态
   - 错误提示显示
   - 重试机制
   - 用户体验连续性

**预期结果**:
- ✅ 成功的请求正常显示数据
- ✅ 失败的请求显示错误提示
- ✅ 不影响其他功能模块
- ✅ 提供单独重试选项

**严格验证**:
```typescript
// 验证并发请求处理
const concurrentRequestValidation = {
  successfulRequestsProcessed: true,
  failedRequestsHandled: true,
  showErrorIndicators: true,
  preserveWorkingFeatures: true,
  individualRetryOptions: true,
  noGlobalFailureState: true
};
```

### TC-042-07: 网络超时和重试机制
**测试步骤**:
1. 模拟API请求超时
2. 测试自动重试机制：
   - 重试次数限制
   - 重试间隔策略
   - 指数退避算法
   - 最终失败处理

**预期结果**:
- ✅ 自动重试机制启动
- ✅ 重试间隔递增
- ✅ 达到最大重试次数后停止
- ✅ 显示最终错误状态

**严格验证**:
```typescript
// 验证重试机制
const retryMechanismValidation = {
  maxRetries: 3,
  retryDelayStrategy: 'exponential-backoff',
  firstRetryDelay: 1000,
  secondRetryDelay: 2000,
  thirdRetryDelay: 4000,
  showRetryProgress: true,
  allowManualRetry: true
};
```

## 🧪 元素级测试覆盖

### 错误提示组件
```typescript
const errorAlertElements = {
  errorContainer: {
    selector: '[data-testid="error-alert"]',
    required: true,
    visible: true
  },
  errorMessage: {
    selector: '[data-testid="error-message"]',
    required: true,
    maxLength: 200,
    userFriendly: true
  },
  errorIcon: {
    selector: '[data-testid="error-icon"]',
    required: true,
    visible: true
  },
  closeButton: {
    selector: '[data-testid="error-close"]',
    required: true,
    clickable: true
  }
};
```

### 重试按钮组件
```typescript
const retryButtonElements = {
  retryButton: {
    selector: '[data-testid="retry-button"]',
    required: true,
    enabled: true,
    text: '重试'
  },
  retryCount: {
    selector: '[data-testid="retry-count"]',
    required: false,
    format: '第{count}次重试'
  },
  retryProgress: {
    selector: '[data-testid="retry-progress"]',
    required: false,
    type: 'progress-bar'
  }
};
```

### 加载状态组件
```typescript
const loadingElements = {
  globalLoader: {
    selector: '[data-testid="global-loader"]',
    required: true,
    visible: true
  },
  componentLoader: {
    selector: '[data-testid="component-loader"]',
    required: true,
    visible: true
  },
  buttonLoader: {
    selector: '[data-testid="button-loader"]',
    required: false,
    visible: true
  }
};
```

## 📊 性能指标

### 错误响应时间
- 错误检测时间：< 100ms
- 错误提示显示：< 200ms
- 重试响应时间：< 50ms
- 页面恢复时间：< 500ms

### 用户体验指标
- 错误信息可理解性：5/5
- 操作指导明确性：5/5
- 视觉反馈及时性：5/5
- 恢复路径清晰性：5/5

## 🔍 验证清单

### 错误处理验证
- [ ] 401错误正确处理并跳转登录
- [ ] 403错误显示权限不足提示
- [ ] 404错误显示友好提示页面
- [ ] 500错误提供重试机制
- [ ] 响应格式异常不导致崩溃
- [ ] 并发请求部分失败处理正确

### 用户体验验证
- [ ] 错误信息用户友好
- [ ] 提供明确的操作指导
- [ ] 保持应用功能可用性
- [ ] 重试机制直观易用
- [ ] 错误状态视觉清晰

### 技术验证
- [ ] 无控制台错误泄漏
- [ ] 敏感信息正确清理
- [ ] 错误日志完整记录
- [ ] 内存使用正常
- [ ] 网络请求优化

## 🚨 已知问题

### 问题1: 某些API返回非标准状态码
**描述**: 部分API在错误时返回200状态码但包含错误信息  
**影响**: 中等  
**解决方案**: 统一API响应格式标准，实现响应数据验证

### 问题2: 重试机制可能导致请求风暴
**描述**: 多个组件同时重试可能导致请求量激增  
**影响**: 低  
**解决方案**: 实现全局重试管理器，限制并发重试数量

## 📝 测试记录模板

```markdown
## API错误处理测试记录

### 测试环境
- 服务器环境: [开发/测试/生产]
- 模拟错误类型: [错误类型列表]
- 测试账号: [账号角色]

### 测试结果
- TC-042-01 (401错误): [通过/失败] - [备注]
- TC-042-02 (403错误): [通过/失败] - [备注]
- TC-042-03 (404错误): [通过/失败] - [备注]
- TC-042-04 (500错误): [通过/失败] - [备注]
- TC-042-05 (格式错误): [通过/失败] - [备注]
- TC-042-06 (并发请求): [通过/失败] - [备注]
- TC-042-07 (重试机制): [通过/失败] - [备注]

### 发现的问题
1. [问题描述和复现步骤]
2. [问题描述和复现步骤]

### 改进建议
1. [改进建议]
2. [改进建议]
```

## 📚 相关文档

- [移动端测试指南](../README.md)
- [API测试规范](../api-integration/api-standards.md)
- [错误处理设计文档](../../../design/error-handling.md)
- [HTTP状态码处理指南](../api-integration/http-status-codes.md)

---

**测试用例ID**: TC-042  
**创建时间**: 2025-11-24  
**最后更新**: 2025-11-24  
**状态**: 待执行