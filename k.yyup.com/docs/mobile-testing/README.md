# 移动端测试用例完整体系

## 概述

本测试体系为幼儿园管理系统移动端教师端和管理中心功能提供全面的测试用例，遵循项目的严格验证规则，确保测试质量和覆盖率要求。

## 测试架构

### 测试分类

#### 教师端测试 (TC-011 到 TC-015)
- **TC-011**: 教师工作台测试
- **TC-012**: 教学活动管理测试
- **TC-013**: 考勤管理测试
- **TC-014**: 任务管理测试
- **TC-015**: 客户跟进测试

#### 管理中心测试 (TC-016 到 TC-020)
- **TC-016**: 活动中心管理测试
- **TC-017**: AI智能中心测试
- **TC-018**: 文档管理中心测试
- **TC-019**: 系统管理测试
- **TC-020**: 财务管理中心测试

## 目录结构

```
docs/mobile-testing/
├── test-cases/
│   ├── teacher-center/          # 教师端测试用例文档
│   │   ├── TC-011-教师工作台测试.md
│   │   ├── TC-012-教学活动管理测试.md
│   │   ├── TC-013-考勤管理测试.md
│   │   ├── TC-014-任务管理测试.md
│   │   └── TC-015-客户跟进测试.md
│   └── centers/                 # 管理中心测试用例文档
│       └── TC-016-活动中心管理测试.md
└── README.md                    # 本文件

client/src/tests/
├── mobile/
│   ├── teacher-center/          # 教师端可执行测试代码
│   │   └── TC-011-教师工作台测试.spec.js
│   └── centers/                 # 管理中心可执行测试代码
│       └── TC-016-活动中心管理测试.spec.js
├── utils/
│   └── validation-helpers.js   # 严格验证工具函数
└── run-mobile-tests.js          # 测试运行脚本
```

## 严格验证规则

### 核心要求

1. **✅ 数据结构验证** - 验证API返回的数据格式和结构完整性
2. **✅ 字段类型验证** - 验证所有字段的数据类型是否正确
3. **✅ 必填字段验证** - 验证所有必填字段是否存在且非空
4. **✅ 控制台错误检测** - 捕获和验证所有控制台错误和异常
5. **✅ 边界条件测试** - 测试极端值和边界情况

### 禁止行为

- ❌ 只使用 `expect(result).toEqual(mockResponse)` 的浅层验证
- ❌ 忽略错误场景和异常情况
- ❌ 使用有头浏览器模式（Playwright必须使用 `headless: true`）

## 验证工具函数

### 核心验证函数

- `validateRequiredFields(data, requiredFields)` - 验证必填字段
- `validateFieldTypes(data, expectedTypes)` - 验证字段类型
- `validateNumberRange(value, min, max)` - 验证数值范围
- `validateDateFormat(dateString, format)` - 验证日期格式
- `validateEnum(value, validValues)` - 验证枚举值
- `strictValidationWrapper(testFunction, options)` - 严格验证包装器

### 使用示例

```javascript
import { validateRequiredFields, validateFieldTypes } from '../utils/validation-helpers';

// API响应验证
const response = await apiCall();
validateRequiredFields(response.data, ['id', 'title', 'status']);
validateFieldTypes(response.data, {
  id: 'number',
  title: 'string',
  status: 'string'
});
```

## 测试用例结构

### 标准测试用例包含

1. **测试概述** - 目标、类型、优先级、预计执行时间
2. **测试环境** - 设备、浏览器、网络、用户角色
3. **前置条件** - 测试前需要满足的条件
4. **测试用例详情** - 具体的测试步骤和预期结果
5. **严格验证要求** - 详细的验证逻辑和断言
6. **API接口测试** - 接口请求/响应示例和验证
7. **性能测试要求** - 性能指标和验证方法
8. **边界条件测试** - 边界情况和异常处理
9. **回归测试检查点** - 确保现有功能不受影响

## 运行测试

### 安装依赖

```bash
cd client
npm install
```

### 运行所有测试

```bash
# 使用测试运行脚本
node src/tests/run-mobile-tests.js

# 或者直接使用Vitest
npm run test src/tests/mobile
```

### 运行特定测试

```bash
# 只运行教师端测试
node src/tests/run-mobile-tests.js --teacher

# 只运行管理中心测试
node src/tests/run-mobile-tests.js --centers

# 生成覆盖率报告
node src/tests/run-mobile-tests.js --coverage
```

### 单个测试文件

```bash
# 运行教师工作台测试
npm run test src/tests/mobile/teacher-center/TC-011-教师工作台测试.spec.js

# 运行活动中心管理测试
npm run test src/tests/mobile/centers/TC-016-活动中心管理测试.spec.js
```

## 覆盖率要求

### 覆盖率阈值

| 组件 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行覆盖率 |
|------|------------|------------|------------|----------|
| 客户端 | ≥85% | ≥80% | ≥85% | ≥85% |
| 服务端 | ≥95% | ≥90% | ≥95% | ≥95% |
| 全局 | ≥90% | ≥85% | ≥90% | ≥90% |

### 查看覆盖率报告

```bash
npm run test:coverage
```

详细报告将生成在 `coverage/lcov-report/index.html`

## 性能要求

### 响应时间要求

- **页面加载时间**: < 3秒
- **数据加载时间**: < 2秒
- **交互响应时间**: < 300ms
- **API响应时间**: < 1秒

### 浏览器要求

- ✅ **必须**: `headless: true` - 所有环境都使用无头模式
- ❌ **禁止**: `headless: false` - 不允许使用有头浏览器
- ❌ **禁止**: `headless: process.env.CI ? true : false` - 不允许条件判断

## 测试环境配置

### Playwright配置

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    headless: true,
    devtools: false,
    viewport: { width: 375, height: 667 }, // 移动端视图
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 13'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] }
    }
  ]
});
```

## 错误处理要求

### 严格错误检测

```javascript
import { strictValidationWrapper } from '../utils/validation-helpers';

it('应该没有控制台错误', async () => {
  await strictValidationWrapper(async () => {
    // 测试代码
    await page.click('.some-button');

    // 验证结果
    const result = await page.$('.result');
    expect(result).toBeTruthy();
  }, {
    timeout: 5000,
    allowConsoleErrors: false,  // 不允许控制台错误
    allowConsoleWarnings: false // 不允许控制台警告
  });
});
```

## 数据验证示例

### API响应严格验证

```javascript
// 验证用户信息API响应
const validateUserResponse = (response) => {
  // 响应结构验证
  validateRequiredFields(response, ['success', 'data', 'message']);
  expect(response.success).toBe(true);

  // 数据结构验证
  validateRequiredFields(response.data, [
    'id', 'username', 'email', 'role', 'status', 'createdAt'
  ]);

  // 字段类型验证
  validateFieldTypes(response.data, {
    id: 'number',
    username: 'string',
    email: 'string',
    role: 'string',
    status: 'string',
    createdAt: 'string'
  });

  // 业务规则验证
  expect(['admin', 'teacher', 'parent', 'student']).toContain(response.data.role);
  expect(['active', 'inactive', 'suspended']).toContain(response.data.status);

  // 日期格式验证
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  expect(dateRegex.test(response.data.createdAt)).toBe(true);
};
```

## 持续集成

### CI/CD集成

```yaml
# .github/workflows/mobile-tests.yml
name: Mobile Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  mobile-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json

    - name: Install dependencies
      run: |
        cd client
        npm ci

    - name: Run mobile tests
      run: |
        cd client
        node src/tests/run-mobile-tests.js --coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./client/coverage/lcov.info
```

## 最佳实践

### 1. 测试设计原则

- **原子性**: 每个测试用例只验证一个功能点
- **独立性**: 测试之间不相互依赖
- **可重复性**: 测试结果应该一致且可重复
- **可读性**: 测试代码和文档清晰易懂

### 2. 数据管理

- **测试数据隔离**: 使用专门的测试数据库
- **数据清理**: 每个测试后清理测试数据
- **Mock数据**: 使用可预测的Mock数据

### 3. 错误处理

- **预期错误**: 测试应该验证预期的错误处理
- **异常场景**: 包含网络错误、数据异常等场景
- **恢复机制**: 测试系统的错误恢复能力

### 4. 维护策略

- **定期更新**: 随功能更新维护测试用例
- **代码审查**: 测试代码也需要代码审查
- **文档同步**: 保持文档和代码同步

## 故障排除

### 常见问题

1. **测试超时**
   ```bash
   # 增加超时时间
   it('测试用例', async () => {
     // 测试代码
   }, { timeout: 10000 });
   ```

2. **控制台错误**
   ```javascript
   // 使用严格验证包装器
   await strictValidationWrapper(async () => {
     // 测试代码
   });
   ```

3. **元素定位失败**
   ```javascript
   // 使用等待机制
   await page.waitForSelector('.selector');
   const element = await page.$('.selector');
   ```

## 贡献指南

### 添加新测试用例

1. 创建测试用例文档
2. 编写可执行测试代码
3. 更新测试运行脚本
4. 验证覆盖率要求

### 提交规范

- 使用语义化提交信息
- 包含测试用例编号
- 描述变更内容

## 联系支持

如有问题或建议，请联系测试团队或提交Issue。

---

**注意**: 本测试体系严格遵循项目的验证规则和测试要求，确保代码质量和系统稳定性。