# 移动端测试执行指南

## 概述

本文档提供了完整的移动端测试执行指南，包括认证测试和家长端功能测试的可执行代码和工具。

## 目录结构

```
client/src/tests/mobile/
├── authentication/              # 认证功能测试
│   ├── TC-001_user_login.test.ts
│   ├── TC-002_role_permission_control.test.ts
│   ├── TC-003_device_detection_routing.test.ts
│   ├── TC-004_jwt_token_management.test.ts
│   └── TC-005_security_login_protection.test.ts
├── parent-center/              # 家长端功能测试
│   ├── TC-006_parent_dashboard.test.ts
│   ├── TC-007_child_management.test.ts
│   ├── TC-008_activity_enrollment.test.ts
│   ├── TC-009_growth_assessment.test.ts
│   └── TC-010_ai_assistant.test.ts
├── utils/                      # 测试工具函数
│   ├── validation-helpers.ts
│   └── mobile-interactions.ts
├── config/                     # 测试配置
│   └── vitest.config.ts
├── setup/                      # 全局设置
│   └── mobile-test-setup.ts
└── scripts/                    # 执行脚本
    └── run-mobile-tests.ts
```

## 测试用例清单

### 第1组：认证和权限测试 (TC-001 到 TC-005)

| 测试用例 | 功能描述 | 文件位置 |
|---------|----------|----------|
| TC-001 | 用户登录功能测试 | `authentication/TC-001_user_login.test.ts` |
| TC-002 | 角色权限控制测试 | `authentication/TC-002_role_permission_control.test.ts` |
| TC-003 | 设备检测和路由分离测试 | `authentication/TC-003_device_detection_routing.test.ts` |
| TC-004 | JWT令牌管理测试 | `authentication/TC-004_jwt_token_management.test.ts` |
| TC-005 | 安全登录防护测试 | `authentication/TC-005_security_login_protection.test.ts` |

### 第2组：家长端核心功能测试 (TC-006 到 TC-010)

| 测试用例 | 功能描述 | 文件位置 |
|---------|----------|----------|
| TC-006 | 家长仪表板测试 | `parent-center/TC-006_parent_dashboard.test.ts` |
| TC-007 | 孩子管理功能测试 | `parent-center/TC-007_child_management.test.ts` |
| TC-008 | 活动报名功能测试 | `parent-center/TC-008_activity_enrollment.test.ts` |
| TC-009 | 成长评估系统测试 | `parent-center/TC-009_growth_assessment.test.ts` |
| TC-010 | AI助手交互测试 | `parent-center/TC-010_ai_assistant.test.ts` |

## 执行方式

### 1. 使用测试脚本（推荐）

```bash
# 运行所有移动端测试
npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts

# 只运行认证测试
npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --auth

# 只运行家长端测试
npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --parent

# 运行测试但不生成覆盖率报告
npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --no-coverage

# 监视模式（开发时使用）
npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --watch
```

### 2. 使用Vitest直接运行

```bash
# 运行所有移动端测试
npx vitest run --config client/src/tests/mobile/config/vitest.config.ts

# 运行认证测试
npx vitest run --config client/src/tests/mobile/config/vitest.config.ts "mobile/authentication/**/*.test.ts"

# 运行家长端测试
npx vitest run --config client/src/tests/mobile/config/vitest.config.ts "mobile/parent-center/**/*.test.ts"

# 运行特定测试用例
npx vitest run --config client/src/tests/mobile/config/vitest.config.ts "mobile/authentication/TC-001*.test.ts"
```

### 3. 使用NPM脚本

在`package.json`中添加以下脚本：

```json
{
  "scripts": {
    "test:mobile": "npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts",
    "test:mobile:auth": "npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --auth",
    "test:mobile:parent": "npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --parent",
    "test:mobile:watch": "npx ts-node client/src/tests/mobile/scripts/run-mobile-tests.ts --watch",
    "test:mobile:coverage": "npx vitest run --config client/src/tests/mobile/config/vitest.config.ts --coverage"
  }
}
```

## 严格验证规则

所有测试用例都遵循项目的严格验证规则：

### ✅ 必须包含的验证

1. **数据结构验证** - 验证API返回的数据格式
2. **字段类型验证** - 验证所有字段的数据类型
3. **必填字段验证** - 验证所有必填字段存在
4. **控制台错误检测** - 捕获所有控制台错误和警告

### ❌ 禁止的做法

1. **浅层验证** - 只使用 `expect(result).toEqual(mockResponse)`
2. **忽略错误场景** - 不测试异常情况
3. **跳过字段验证** - 不验证API返回的字段完整性

### ✅ 推荐的验证模式

```typescript
// 1. 验证API调用
expect(mockAPI).toHaveBeenCalledWith(expectedParams);

// 2. 验证响应结构
expect(result.success).toBe(true);
expect(result.data).toBeDefined();

// 3. 验证必填字段
const requiredFields = ['id', 'name', 'email', 'role'];
const validation = validateRequiredFields(result.data, requiredFields);
expect(validation.valid).toBe(true);

// 4. 验证字段类型
const typeValidation = validateFieldTypes(result.data, {
  id: 'string',
  name: 'string',
  email: 'string',
  role: 'string'
});
expect(typeValidation.valid).toBe(true);

// 5. 验证枚举值
expect(validateEnumValue(result.data.role, UserRole)).toBe(true);
```

## 测试环境配置

### 环境变量

```bash
# 测试环境
NODE_ENV=development
VITEST_ENVIRONMENT=jsdom
MOCK_API=true

# 移动端环境
TEST_MOBILE=true
TEST_VIEWPORT_WIDTH=375
TEST_VIEWPORT_HEIGHT=812
```

### 设备配置

测试支持以下设备类型：

- **iPhone**: 375x812, DPR=2
- **Android**: 375x812, DPR=2
- **iPad**: 768x1024, DPR=2
- **Desktop**: 1920x1080, DPR=1

## 测试报告

执行完成后，会生成以下报告文件：

- `test-results/mobile-test-report.json` - JSON格式详细报告
- `test-results/mobile-test-report.html` - 可视化HTML报告
- `test-results/coverage/` - 覆盖率报告目录

## 测试数据

### 预配置测试账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 家长 | test_parent | password123 | 移动端家长功能 |
| 教师 | test_teacher | password123 | 移动端教师功能 |
| 管理员 | test_admin | password123 | 所有功能 |

### Mock API响应

所有API调用都被Mock，提供一致的测试数据：

```typescript
// 示例：登录API响应
{
  success: true,
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: "parent_123",
      username: "test_parent",
      role: "parent"
    },
    permissions: ["mobile:centers:read", "mobile:parent:read"]
  }
}
```

## 性能要求

### 响应时间要求

- **页面加载**: < 3秒
- **API响应**: < 2秒
- **用户交互**: < 100ms
- **AI响应**: < 5秒

### 覆盖率要求

- **整体覆盖率**: ≥ 90%
- **认证模块**: ≥ 95%
- **家长端模块**: ≥ 85%

## 故障排除

### 常见问题

1. **测试失败：DOM元素未找到**
   ```bash
   # 检查测试环境是否正确设置
   npm run test:mobile -- --reporter=verbose
   ```

2. **API调用Mock失败**
   ```bash
   # 清除mock缓存
   npx vitest run --config client/src/tests/mobile/config/vitest.config.ts --no-cache
   ```

3. **覆盖率不达标**
   ```bash
   # 生成详细覆盖率报告
   npx vitest run --config client/src/tests/mobile/config/vitest.config.ts --coverage --reporter=verbose
   ```

4. **性能测试超时**
   ```bash
   # 增加测试超时时间
   export VITEST_TEST_TIMEOUT=60000
   ```

### 调试技巧

1. **使用浏览器开发者工具**
   ```typescript
   // 在测试中添加断点
   debugger;
   ```

2. **查看DOM快照**
   ```typescript
   // 打印当前DOM
   console.log(document.documentElement.outerHTML);
   ```

3. **监控网络请求**
   ```typescript
   // 监控API调用
   vi.spyOn(mockAPI, 'login');
   expect(mockAPI.login).toHaveBeenCalled();
   ```

## 持续集成

### GitHub Actions配置

```yaml
name: Mobile Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run mobile tests
      run: npm run test:mobile

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./test-results/coverage/lcov.info
```

## 最佳实践

### 1. 测试组织

- 按功能模块组织测试文件
- 使用描述性的测试名称
- 保持测试用例独立和可重复

### 2. Mock策略

- Mock所有外部依赖
- 提供一致的测试数据
- 验证Mock调用次数和参数

### 3. 断言策略

- 使用具体而有意义的断言
- 验证关键业务逻辑
- 包含边界条件测试

### 4. 性能测试

- 监控页面加载时间
- 验证用户交互响应
- 检查内存使用情况

## 扩展指南

### 添加新测试用例

1. 在相应目录创建测试文件
2. 遵循命名规范：`TC-XXX_feature_name.test.ts`
3. 包含完整的功能测试
4. 添加严格的验证规则
5. 更新测试文档

### 自定义验证函数

```typescript
// 在 utils/validation-helpers.ts 中添加
export function validateCustomField(data: any, fieldName: string, validator: Function) {
  const field = data[fieldName];
  return {
    valid: validator(field),
    fieldName,
    value: field
  };
}
```

### 移动端交互测试

```typescript
// 使用预定义的移动端交互函数
import { tapElement, swipeElement, longPress } from '../utils/mobile-interactions';

// 测试触摸交互
await tapElement('.mobile-button');

// 测试滑动操作
await swipeElement('.carousel', 'left', 100);

// 测试长按操作
await longPress('.context-menu-trigger', 1000);
```

---

## 联系和支持

如果遇到问题或有改进建议，请：

1. 查看本文档的故障排除部分
2. 检查测试日志和报告
3. 联系开发团队获取支持

**文档版本**: v1.0
**最后更新**: 2025-11-24
**维护团队**: 前端测试组