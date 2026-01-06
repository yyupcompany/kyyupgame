# 严格测试验证规则

## 📋 核心原则

在编写或修复API测试用例时，**必须**实施严格的数据验证，确保：
1. ✅ **数据结构验证** - 验证API返回的数据格式与前端期望一致
2. ✅ **字段类型验证** - 验证所有字段的数据类型正确
3. ✅ **必填字段验证** - 验证所有必填字段存在
4. ✅ **控制台错误检测** - 捕获所有控制台错误、警告

---

## 🚫 禁止的做法

### ❌ 错误示例：浅层验证

```typescript
it('should get dashboard stats', async () => {
  const mockResponse = {
    success: true,
    data: { userCount: 150 }
  };
  
  mockedRequest.mockResolvedValue(mockResponse);
  const result = await getDashboardStats();
  
  // ❌ 只验证API调用，不验证数据结构
  expect(mockedRequest).toHaveBeenCalledWith('/dashboard/stats');
  expect(result).toEqual(mockResponse);  // ❌ 浅层验证
});
```

**问题**：
- 没有验证数据结构
- 没有验证字段类型
- 没有验证必填字段
- 无法捕获数据格式变化

---

## ✅ 必须的做法

### ✅ 正确示例：严格验证

```typescript
it('should get dashboard stats', async () => {
  const mockResponse = {
    success: true,
    data: {
      userCount: 150,
      kindergartenCount: 5,
      studentCount: 1200,
      enrollmentCount: 300,
      activityCount: 45,
      teacherCount: 80,
      classCount: 40
    }
  };
  
  mockedRequest.mockResolvedValue(mockResponse);
  const result = await getDashboardStats();
  
  // 1. ✅ 验证API调用
  expect(mockedRequest).toHaveBeenCalledWith('/dashboard/stats');
  
  // 2. ✅ 验证响应结构
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  
  // 3. ✅ 验证必填字段
  const requiredFields = [
    'userCount', 'kindergartenCount', 'studentCount', 
    'enrollmentCount', 'activityCount', 'teacherCount', 'classCount'
  ];
  const validation = validateRequiredFields(result.data, requiredFields);
  expect(validation.valid).toBe(true);
  if (!validation.valid) {
    throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // 4. ✅ 验证字段类型
  const typeValidation = validateFieldTypes(result.data, {
    userCount: 'number',
    kindergartenCount: 'number',
    studentCount: 'number',
    enrollmentCount: 'number',
    activityCount: 'number',
    teacherCount: 'number',
    classCount: 'number'
  });
  expect(typeValidation.valid).toBe(true);
  if (!typeValidation.valid) {
    throw new Error(`Type validation errors: ${typeValidation.errors.join(', ')}`);
  }
});
```

---

## 📐 验证模式

### 模式1: 单个对象响应

**适用于**: getUserDetail, getTeacherDetail, getClassDetail等

```typescript
it('should get user detail', async () => {
  const result = await getUserDetail('123');
  
  // ✅ 验证响应结构
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  
  // ✅ 验证必填字段
  const validation = validateRequiredFields(result.data, ['id', 'name', 'email', 'role']);
  expect(validation.valid).toBe(true);
  
  // ✅ 验证字段类型
  const typeValidation = validateFieldTypes(result.data, {
    id: 'string',
    name: 'string',
    email: 'string',
    role: 'string'
  });
  expect(typeValidation.valid).toBe(true);
  
  // ✅ 验证枚举值（如果有）
  expect(validateEnumValue(result.data.role, UserRole)).toBe(true);
});
```

### 模式2: 列表响应

**适用于**: getUserList, getTeacherList, getClassList等

```typescript
it('should get user list', async () => {
  const result = await getUserList({ page: 1, pageSize: 10 });
  
  // ✅ 验证列表结构
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(Array.isArray(result.data.items)).toBe(true);
  
  // ✅ 验证分页字段
  const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
  expect(paginationValidation.valid).toBe(true);
  
  // ✅ 验证列表项
  if (result.data.items.length > 0) {
    const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'email']);
    expect(itemValidation.valid).toBe(true);
    
    const itemTypeValidation = validateFieldTypes(result.data.items[0], {
      id: 'string',
      name: 'string',
      email: 'string'
    });
    expect(itemTypeValidation.valid).toBe(true);
  }
});
```

### 模式3: 统计数据/卡片数据

**适用于**: getDashboardStats, getClassStats等

```typescript
it('should get dashboard stats', async () => {
  const result = await getDashboardStats();
  
  // ✅ 验证统计字段
  const validation = validateRequiredFields(result.data, [
    'totalStudents', 'totalTeachers', 'totalClasses', 'enrollmentRate'
  ]);
  expect(validation.valid).toBe(true);
  
  // ✅ 验证数值类型
  const typeValidation = validateFieldTypes(result.data, {
    totalStudents: 'number',
    totalTeachers: 'number',
    totalClasses: 'number',
    enrollmentRate: 'number'
  });
  expect(typeValidation.valid).toBe(true);
  
  // ✅ 验证数值范围
  expect(result.data.totalStudents).toBeGreaterThanOrEqual(0);
  expect(result.data.enrollmentRate).toBeGreaterThanOrEqual(0);
  expect(result.data.enrollmentRate).toBeLessThanOrEqual(100);
});
```

### 模式4: 图表数据

**适用于**: getEnrollmentTrends, getActivityData等

```typescript
it('should get enrollment trends', async () => {
  const result = await getEnrollmentTrends();
  
  // ✅ 验证trends数组
  expect(Array.isArray(result.data.trends)).toBe(true);
  expect(result.data.trends.length).toBeGreaterThan(0);
  
  // ✅ 验证每个数据点
  result.data.trends.forEach((trend: any) => {
    const validation = validateRequiredFields(trend, ['date', 'count']);
    expect(validation.valid).toBe(true);
    
    const typeValidation = validateFieldTypes(trend, {
      date: 'string',
      count: 'number'
    });
    expect(typeValidation.valid).toBe(true);
  });
});
```

---

## 🔧 必需的导入

每个测试文件**必须**包含以下导入：

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat
} from '../../../utils/data-validation';
```

---

## 🎯 必需的钩子

每个测试套件**必须**包含：

```typescript
describe('API Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 必须：检查控制台错误
  afterEach(() => {
    expectNoConsoleErrors();
  });
  
  // 测试用例...
});
```

---

## 📋 验证清单

编写或修复每个测试用例时，必须确保：

### 基础验证（必须）
- [ ] 导入了验证工具
- [ ] 添加了 `afterEach(() => expectNoConsoleErrors())`
- [ ] 验证了API调用参数
- [ ] 验证了响应结构 (success, data)

### 数据验证（必须）
- [ ] 验证了必填字段存在
- [ ] 验证了字段类型正确
- [ ] 验证了数组字段是数组类型
- [ ] 验证了对象字段是对象类型

### 高级验证（推荐）
- [ ] 验证了枚举值有效性
- [ ] 验证了日期格式正确
- [ ] 验证了数值范围合理
- [ ] 验证了列表分页字段

---

## 🚨 强制规则

### 规则1: 禁止浅层验证

❌ **禁止**只使用 `expect(result).toEqual(mockResponse)`

✅ **必须**添加结构验证、字段验证、类型验证

### 规则2: 列表必须验证分页

对于所有列表响应，**必须**验证：
- `items` 数组存在且为数组类型
- `total` 字段存在且为数字类型
- `page` 字段存在且为数字类型
- `pageSize` 字段存在且为数字类型

### 规则3: 对象必须验证必填字段

对于所有对象响应，**必须**：
- 列出所有必填字段
- 使用 `validateRequiredFields` 验证
- 使用 `validateFieldTypes` 验证类型

### 规则4: 统计数据必须验证范围

对于统计数据，**必须**：
- 验证数值类型
- 验证数值 >= 0
- 验证百分比在 0-100 之间

### 规则5: 图表数据必须验证数组

对于图表数据，**必须**：
- 验证数组类型
- 验证数组长度 > 0
- 验证每个数据点的结构

---

## 📊 验证覆盖率要求

### 最低要求
- 每个测试文件至少 **50%** 的测试用例有严格验证
- 所有列表响应 **100%** 验证分页字段
- 所有对象响应 **100%** 验证必填字段

### 推荐目标
- 每个测试文件至少 **80%** 的测试用例有严格验证
- 所有响应 **100%** 验证数据结构
- 所有字段 **100%** 验证类型

---

## 🔍 验证工具API

### validateRequiredFields

```typescript
const validation = validateRequiredFields<T>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] }
```

### validateFieldTypes

```typescript
const typeValidation = validateFieldTypes<T>(
  data: any,
  fieldTypes: Partial<Record<keyof T, string>>
): { valid: boolean; errors: string[] }
```

### validateEnumValue

```typescript
const isValid = validateEnumValue<T>(
  value: any,
  enumObject: T
): boolean
```

### validateDateFormat

```typescript
const isValid = validateDateFormat(
  dateString: string
): boolean
```

---

## 📚 参考文档

项目中的验证指南文档：
1. `client/tests/STRICT_VALIDATION_GUIDE.md` - 完整验证指南
2. `client/tests/STRICT_VALIDATION_PATTERNS.md` - 验证模式速查表
3. `client/tests/STRICT_VALIDATION_STATUS.md` - 当前进度报告

---

## ✅ 示例：完整的测试文件

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUserList, getUserDetail } from '@/api/modules/user';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import { 
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn()
  }
}));

import { request } from '@/utils/request';
const mockRequest = request as any;

describe('User API - Strict Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    expectNoConsoleErrors();
  });
  
  it('should get user list with strict validation', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [
          { id: '1', name: 'User 1', email: 'user1@example.com', role: 'ADMIN' }
        ],
        total: 1,
        page: 1,
        pageSize: 10
      }
    };
    
    mockRequest.get.mockResolvedValue(mockResponse);
    const result = await getUserList({ page: 1, pageSize: 10 });
    
    // 1. 验证API调用
    expect(mockRequest.get).toHaveBeenCalledWith('/users', { params: { page: 1, pageSize: 10 } });
    
    // 2. 验证响应结构
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data.items)).toBe(true);
    
    // 3. 验证分页字段
    const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
    expect(paginationValidation.valid).toBe(true);
    
    // 4. 验证列表项
    if (result.data.items.length > 0) {
      const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'email', 'role']);
      expect(itemValidation.valid).toBe(true);
      
      const itemTypeValidation = validateFieldTypes(result.data.items[0], {
        id: 'string',
        name: 'string',
        email: 'string',
        role: 'string'
      });
      expect(itemTypeValidation.valid).toBe(true);
    }
  });
});
```

---

**最后更新**: 当前会话
**状态**: 强制执行 - 所有新的和修复的测试用例必须遵循此规则

