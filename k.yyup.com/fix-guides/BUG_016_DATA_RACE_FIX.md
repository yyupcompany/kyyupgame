# Bug #16 修复指南 - 并发请求可能导致的数据竞态

## 问题描述
多个并发请求可能同时修改同一资源，导致数据不一致。缺少乐观锁或悲观锁机制。

## 严重级别
**高**

## 受影响的文件
- `server/src/controllers/`
- `server/src/services/`
- 具体业务操作的地方

## 问题分析

1. **丢失更新**: 两个请求同时读取数据，后一个覆盖前一个
2. **脏读**: 读取到未提交的数据
3. **库存超卖**: 并发扣减导致库存错误
4. **余额错误**: 并发扣款导致余额不一致

## 修复方案（在具体业务中使用事务）

### 步骤 1: 使用数据库事务

在具体业务操作中使用 Sequelize 事务：

```typescript
// ================================
# 安全的并发操作示例
# ================================

/**
 * 更新用户信息（带事务）
 */
async function updateUser(userId: number, updates: any) {
  const result = await sequelize.transaction(async (t) => {
    // 1. 使用事务锁定行
    const user = await User.findByPk(userId, {
      transaction: t,
      lock: t.LOCK.UPDATE // 悲观锁
    });

    if (!user) {
      throw new NotFoundError('用户');
    }

    // 2. 更新数据
    await user.update(updates, { transaction: t });

    // 3. 返回结果
    return user;
  });

  return result;
}

/**
 * 扣减库存（带事务和版本控制）
 */
async function decreaseStock(productId: number, quantity: number) {
  const result = await sequelize.transaction(async (t) => {
    // 1. 查询并锁定
    const product = await Product.findByPk(productId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!product) {
      throw new NotFoundError('商品');
    }

    // 2. 检查库存
    if (product.stock < quantity) {
      throw new Error('库存不足');
    }

    // 3. 扣减库存
    await product.update({
      stock: product.stock - quantity,
      version: product.version + 1 // 乐观锁版本号
    }, { transaction: t });

    return product;
  });

  return result;
}

/**
 * 转账操作（带事务和回滚）
 */
async function transfer(fromUserId: number, toUserId: number, amount: number) {
  const result = await sequelize.transaction(async (t) => {
    // 1. 锁定转出账户
    const fromUser = await User.findByPk(fromUserId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    // 2. 锁定转入账户
    const toUser = await User.findByPk(toUserId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    // 3. 检查余额
    if (fromUser.balance < amount) {
      throw new Error('余额不足');
    }

    // 4. 执行转账
    await fromUser.update({
      balance: fromUser.balance - amount
    }, { transaction: t });

    await toUser.update({
      balance: toUser.balance + amount
    }, { transaction: t });

    // 5. 记录转账流水
    await TransferLog.create({
      fromUserId,
      toUserId,
      amount,
      status: 'completed'
    }, { transaction: t });

    return { fromUser, toUser };
  });

  return result;
}
```

### 步骤 2: 添加版本号字段（乐观锁）

在需要并发控制的表中添加 version 字段：

**迁移文件**：
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 为需要并发控制的表添加version字段
    await queryInterface.addColumn('users', 'version', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('students', 'version', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('enrollments', 'version', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'version');
    await queryInterface.removeColumn('students', 'version');
    await queryInterface.removeColumn('enrollments', 'version');
  }
};
```

**模型中使用**：
```typescript
// models/user.ts
export class User extends Model {
  declare version: number; // 乐观锁版本号

  // 更新时自动递增版本号
  async increment(options?: any) {
    this.version = (this.version || 0) + 1;
    return super.save(options);
  }
}
```

### 步骤 3: 创建并发控制工具

创建 `server/src/utils/concurrency-control.ts`：

```typescript
import { Transaction } from 'sequelize';

/**
 * 并发操作工具
 */
export class ConcurrencyManager {
  /**
   * 使用事务执行操作（带重试）
   */
  static async withTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>,
    options: {
      maxRetries?: number;
      isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, isolationLevel = 'READ COMMITTED' } = options;
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await sequelize.transaction({
          isolationLevel
        }, async (t) => {
          return await callback(t);
        });

        return result;
      } catch (error: any) {
        lastError = error;

        // 如果是死锁错误，重试
        if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_LOCK_DEADLOCK') {
          console.log(`⚠️  死锁检测到，重试 ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }

        // 其他错误直接抛出
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * 使用乐观锁更新
   */
  static async updateWithOptimisticLock(
    model: any,
    id: number,
    updates: any,
    currentVersion: number
  ) {
    const [affectedCount] = await model.update(
      {
        ...updates,
        version: currentVersion + 1
      },
      {
        where: {
          id,
          version: currentVersion // 只匹配当前版本
        }
      }
    );

    if (affectedCount === 0) {
      throw new Error('数据已被其他用户修改，请刷新后重试');
    }

    return model.findByPk(id);
  }
}
```

### 步骤 4: 在控制器中使用

```typescript
import { ConcurrencyManager } from '../../utils/concurrency-control';

// 用户控制器
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await ConcurrencyManager.withTransaction(async (t) => {
      const user = await User.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!user) {
        throw new NotFoundError('用户');
      }

      await user.update(updates, { transaction: t });

      return user;
    });

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.message.includes('已被其他用户修改')) {
      return res.status(409).json({
        success: false,
        error: {
          message: '数据已被修改，请刷新后重试',
          code: 'CONFLICT'
        }
      });
    }
    throw error;
  }
}
```

### 步骤 5: 添加幂等性保护

对于需要幂等性的操作（如创建订单）：

```typescript
import crypto from 'crypto';

/**
 * 生成幂等性键
 */
function generateIdempotencyKey(data: any): string {
  const str = JSON.stringify(data);
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * 幂等性中间件
 */
export function idempotencyCheck(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-idempotency-key'];

  if (!key) {
    return next(); // 不检查
  }

  // 检查是否已处理过此请求
  IdempotencyRecord.findOne({
    where: { key }
  }).then(record => {
    if (record) {
      // 返回之前的结果
      return res.json(JSON.parse(record.response));
    }
    next();
  });
}
```

## 本地调试保证

### 事务不会影响调试

- ✅ 事务只在需要时启用
- ✅ 开发环境可以关闭重试
- ✅ 不影响正常业务流程

### 可配置的并发控制

```typescript
// 在.env中配置
const ENABLE_CONCURRENCY_CONTROL = process.env.ENABLE_CONCURRENCY_CONTROL !== 'false';
const MAX_RETRIES = parseInt(process.env.MAX_TRANSACTION_RETRIES || '3', 10);

if (ENABLE_CONCURRENCY_CONTROL) {
  // 使用并发控制
} else {
  // 跳过并发控制（开发调试）
}
```

## 验证步骤

### 1. 单元测试
```typescript
describe('并发控制', () => {
  it('应该防止并发更新丢失', async () => {
    const userId = 1;

    // 并发更新
    const p1 = updateUser(userId, { name: 'User1' });
    const p2 = updateUser(userId, { name: 'User2' });

    const [user1, user2] = await Promise.all([p1, p2]);

    // 应该有一个失败或返回正确的版本
    expect(user1.version).not.toBe(user2.version);
  });

  it('应该检测版本冲突', async () => {
    const productId = 1;
    const product = await Product.findByPk(productId);

    // 模拟并发更新
    try {
      await ConcurrencyManager.updateWithOptimisticLock(
        Product,
        productId,
        { stock: product.stock - 1 },
        product.version
      );

      // 再次更新相同版本（应该失败）
      await ConcurrencyManager.updateWithOptimisticLock(
        Product,
        productId,
        { stock: product.stock - 1 },
        product.version
      );

      fail('应该抛出版本冲突错误');
    } catch (error) {
      expect(error.message).toContain('已被其他用户修改');
    }
  });
});
```

### 2. 手动测试

使用并发测试工具：
```javascript
// 并发发送10个更新请求
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(
    fetch('/api/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `User${i}` })
    })
  );
}

const results = await Promise.all(promises);
// 确保只有一个成功，其他返回409冲突
```

## 回滚方案

如果并发控制导致问题：

1. **关闭并发控制**：
   ```bash
   export ENABLE_CONCURRENCY_CONTROL=false
   ```

2. **降低隔离级别**：
   ```typescript
   isolationLevel: 'READ UNCOMMITTED' // 更宽松
   ```

3. **移除锁**：在查询中移除 `lock: t.LOCK.UPDATE`

## 修复完成检查清单

- [ ] 事务使用已添加到关键操作
- [ ] 版本号字段已添加（迁移）
- [ ] 并发控制工具已创建
- [ ] 控制器已更新使用事务
- [ ] 幂等性保护已添加（可选）
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 并发测试已通过
- [ ] 本地调试正常工作

## 风险评估

- **风险级别**: 中
- **影响范围**: 具体业务逻辑
- **回滚难度**: 低（通过环境变量控制）
- **本地调试影响**: 可选（可配置关闭）

---

**修复时间估计**: 6-8 小时
**测试时间估计**: 4-6 小时
**总时间估计**: 10-14 小时
