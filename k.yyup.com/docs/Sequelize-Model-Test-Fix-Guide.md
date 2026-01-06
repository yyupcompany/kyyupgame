# Sequelize 模型测试修复指南

**问题**: 91%的测试套件失败，主要错误是 `TypeError: Cannot convert undefined or null to object` at `this.constructor._attributeManipulation`

**根本原因**: 测试文件直接mock了模型的`init`方法，导致Sequelize内部属性未正确初始化

---

## 🔍 问题分析

### 错误的测试方式

```typescript
// ❌ 错误：直接mock User.init
const mockInit = jest.fn();
User.init = mockInit;

describe('User Model', () => {
  it('应该正确定义User模型', () => {
    User.initModel(mockSequelize);
    expect(mockInit).toHaveBeenCalled(); // 这会导致模型未正确初始化
  });
});
```

**问题**:
1. 直接替换`User.init`会破坏Sequelize的内部初始化流程
2. `_attributeManipulation`等内部属性不会被创建
3. 后续的测试会因为缺少这些属性而失败

---

## ✅ 解决方案

### 方案1: 不要mock模型的init方法

```typescript
// ✅ 正确：让模型正常初始化
import { Sequelize } from 'sequelize';
import { User } from '../../../src/models/user.model';

describe('User Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    // 使用SQLite内存数据库
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false
    });
    
    // 正常初始化模型
    User.initModel(sequelize);
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('应该正确定义User模型', () => {
    // 验证模型属性
    expect(User.rawAttributes.username).toBeDefined();
    expect(User.rawAttributes.email).toBeDefined();
  });
});
```

### 方案2: 使用测试辅助工具

```typescript
// ✅ 使用我们创建的测试辅助工具
import { setupModelTest, teardownModelTest } from '../../utils/model-test-helper';
import { User } from '../../../src/models/user.model';

describe('User Model', () => {
  let sequelize: any;

  beforeAll(async () => {
    sequelize = await setupModelTest({ useRealDatabase: false });
  });

  afterAll(async () => {
    await teardownModelTest(sequelize);
  });

  it('应该有正确的属性', () => {
    expect(User.rawAttributes.username).toBeDefined();
  });
});
```

### 方案3: Mock静态方法而不是init

```typescript
// ✅ 只mock需要的静态方法
describe('User Model', () => {
  beforeEach(() => {
    // Mock查询方法，但不要mock init
    User.findAll = jest.fn().mockResolvedValue([]);
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({});
  });

  it('应该能查询用户', async () => {
    await User.findAll();
    expect(User.findAll).toHaveBeenCalled();
  });
});
```

---

## 🔧 批量修复策略

### 步骤1: 识别需要修复的文件

所有包含以下代码的测试文件都需要修复：

```typescript
const mockInit = jest.fn();
User.init = mockInit;
```

### 步骤2: 修复模式

**模式A: 测试模型定义**
```typescript
// 旧代码
it('应该正确定义User模型', () => {
  User.initModel(mockSequelize);
  expect(mockInit).toHaveBeenCalledWith(...);
});

// 新代码
it('应该正确定义User模型', () => {
  expect(User.rawAttributes.username).toBeDefined();
  expect(User.rawAttributes.username.type).toBeDefined();
  expect(User.rawAttributes.username.allowNull).toBe(false);
});
```

**模式B: 测试模型方法**
```typescript
// 旧代码
const mockInit = jest.fn();
User.init = mockInit;

// 新代码
beforeEach(() => {
  User.findAll = jest.fn().mockResolvedValue([]);
  User.create = jest.fn().mockResolvedValue({});
});
```

---

## 📋 需要修复的文件列表

根据测试结果，以下模型测试文件需要修复：

1. `tests/unit/models/user.model.test.ts`
2. `tests/unit/models/activity.model.test.ts`
3. `tests/unit/models/ai-query-template.model.test.ts`
4. `tests/unit/models/ai-user-permission.model.test.ts`
5. `tests/unit/models/ai-query-log.model.test.ts`
6. `tests/unit/models/ai-model-usage.model.test.ts`
7. 其他所有模型测试文件...

---

## 🚀 快速修复脚本

可以创建一个脚本来批量修复这些文件：

```bash
#!/bin/bash
# fix-model-tests.sh

# 查找所有包含 "User.init = mockInit" 的文件
grep -r "\.init = mockInit" server/tests/unit/models/ -l | while read file; do
  echo "修复文件: $file"
  # 备份原文件
  cp "$file" "$file.backup"
  
  # 移除 mockInit 相关代码
  sed -i '/const mockInit = jest.fn()/d' "$file"
  sed -i '/User.init = mockInit/d' "$file"
  sed -i '/mockInit.mockClear()/d' "$file"
  
  echo "✅ 已修复: $file"
done
```

---

## 🎯 推荐的测试策略

### 1. 模型定义测试

**目标**: 验证模型的属性、类型、验证规则

```typescript
describe('Model Definition', () => {
  it('应该有正确的属性', () => {
    expect(User.rawAttributes.username).toBeDefined();
    expect(User.rawAttributes.email).toBeDefined();
  });

  it('应该有正确的验证规则', () => {
    expect(User.rawAttributes.email.validate?.isEmail).toBe(true);
  });

  it('应该有正确的默认值', () => {
    expect(User.rawAttributes.role.defaultValue).toBe(UserRole.USER);
  });
});
```

### 2. 模型方法测试

**目标**: 验证CRUD操作

```typescript
describe('Model Methods', () => {
  beforeEach(() => {
    User.findAll = jest.fn().mockResolvedValue([]);
    User.create = jest.fn().mockResolvedValue({});
  });

  it('应该能查询用户', async () => {
    await User.findAll();
    expect(User.findAll).toHaveBeenCalled();
  });

  it('应该能创建用户', async () => {
    await User.create({ username: 'test' });
    expect(User.create).toHaveBeenCalled();
  });
});
```

### 3. 模型关联测试

**目标**: 验证模型之间的关联

```typescript
describe('Model Associations', () => {
  it('应该有roles关联', () => {
    if (User.associations?.roles) {
      expect(User.associations.roles).toBeDefined();
    }
  });
});
```

---

## 🔍 验证修复

修复后，运行测试验证：

```bash
# 运行单个模型测试
npm run test:unit -- tests/unit/models/user.model.test.ts

# 运行所有模型测试
npm run test:unit -- tests/unit/models/

# 检查测试覆盖率
npm run test:coverage
```

---

## 📊 预期结果

修复后应该看到：

```
✅ 模型测试通过率: 从 8.7% → 80%+
✅ 测试用例通过率: 从 60.5% → 85%+
✅ 无 Sequelize 初始化错误
✅ 无 Jest Worker 异常
```

---

## 💡 最佳实践

### DO ✅

1. **使用真实的Sequelize实例** (SQLite内存数据库)
2. **测试模型的rawAttributes** 而不是init调用
3. **Mock静态方法** (findAll, create等)
4. **使用测试辅助工具** 统一测试模式

### DON'T ❌

1. **不要mock模型的init方法**
2. **不要直接替换Sequelize内部方法**
3. **不要在测试中修改模型定义**
4. **不要忽略模型初始化错误**

---

## 🎊 总结

**核心原则**: 让Sequelize正常初始化模型，只mock业务逻辑相关的方法

**修复步骤**:
1. 移除所有 `Model.init = mockInit` 代码
2. 使用 `Model.rawAttributes` 验证模型定义
3. Mock静态方法 (findAll, create等) 而不是init
4. 使用测试辅助工具统一测试模式

**预期收益**:
- 测试通过率提升到80%+
- 消除Sequelize初始化错误
- 更稳定的测试套件
- 更好的测试可维护性

---

**文档创建时间**: 2025-10-05  
**状态**: 待执行  
**优先级**: 🔴 高

