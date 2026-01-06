/**
 * 并发安全操作工具
 *
 * 提供数据库事务和并发控制功能
 * 防止数据竞态条件和丢失更新问题
 */

import { Transaction, LOCK } from 'sequelize';
import { sequelize } from '../init';

/**
 * 事务配置选项
 */
export interface TransactionOptions {
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
  readOnly?: boolean;
}

/**
 * 事务结果类型
 */
export type TransactionResult<T> = Promise<T>;

/**
 * 并发操作错误
 */
export class ConcurrencyError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

/**
 * 乐观锁冲突错误
 */
export class OptimisticLockError extends ConcurrencyError {
  constructor(message: string = '数据已被其他用户修改，请刷新后重试') {
    super(message, true);
    this.name = 'OptimisticLockError';
  }
}

/**
 * 悲观锁超时错误
 */
export class LockTimeoutError extends ConcurrencyError {
  constructor(message: string = '获取锁超时，请稍后重试') {
    super(message, true);
    this.name = 'LockTimeoutError';
  }
}

/**
 * 执行事务的包装函数
 * 自动处理事务的提交和回滚
 *
 * @param callback 事务内执行的回调函数
 * @param options 事务选项
 * @returns 事务执行结果
 */
export async function withTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>,
  options: TransactionOptions = {}
): TransactionResult<T> {
  // 配置隔离级别
  const isolationLevel = options.isolationLevel || 'REPEATABLE_READ';

  try {
    const result = await sequelize.transaction(
      {
        isolationLevel,
        timeout: options.timeout || 30000, // 默认30秒超时
        readOnly: options.readOnly || false
      },
      async (t) => {
        return await callback(t);
      }
    );

    return result;
  } catch (error: any) {
    // 检测死锁错误
    if (error.parent?.code === 'ER_LOCK_DEADLOCK' || error.parent?.code === 'ER_LOCK_WAIT_TIMEOUT') {
      throw new LockTimeoutError('操作超时，请稍后重试');
    }

    // 检测乐观锁冲突
    if (error.name === 'SequelizeOptimisticLockError') {
      throw new OptimisticLockError();
    }

    throw error;
  }
}

/**
 * 带重试的事务执行
 * 当遇到可重试的错误时自动重试
 *
 * @param callback 事务内执行的回调函数
 * @param options 事务选项
 * @param maxRetries 最大重试次数
 * @returns 事务执行结果
 */
export async function withTransactionRetry<T>(
  callback: (transaction: Transaction) => Promise<T>,
  options: TransactionOptions = {},
  maxRetries: number = 3
): TransactionResult<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback, options);
    } catch (error: any) {
      lastError = error;

      // 如果不是可重试的错误，直接抛出
      if (!(error instanceof ConcurrencyError) || !error.retryable) {
        throw error;
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw error;
      }

      // 指数退避等待
      const delay = Math.min(100 * Math.pow(2, attempt), 1000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // 记录重试日志
      console.warn(`[事务重试] 第 ${attempt + 1} 次尝试`, {
        error: error.message,
        delay
      });
    }
  }

  throw lastError;
}

/**
 * 悲观锁读取
 * 使用 SELECT FOR UPDATE 锁定行
 *
 * @param model Sequelize 模型
 * @param pk 主键值
 * @param transaction 事务对象
 * @returns 锁定的记录
 */
export async function lockForUpdate<M extends any>(
  model: M,
  pk: string | number,
  transaction: Transaction
): Promise<any> {
  return await model.findByPk(pk, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
}

/**
 * 悲观锁读取（多条记录）
 *
 * @param model Sequelize 模型
 * @param where 查询条件
 * @param transaction 事务对象
 * @returns 锁定的记录列表
 */
export async function lockForUpdateAll<M extends any>(
  model: M,
  where: any,
  transaction: Transaction
): Promise<any[]> {
  return await model.findAll({
    where,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
}

/**
 * 乐观锁更新
 * 使用版本号检测冲突
 *
 * @param model Sequelize 模型
 * @param pk 主键值
 * @param updates 更新数据
 * @param currentVersion 当前版本号
 * @param transaction 事务对象
 * @returns 更新后的记录
 */
export async function updateWithOptimisticLock<M extends any>(
  model: M,
  pk: string | number,
  updates: any,
  currentVersion: number,
  transaction: Transaction
): Promise<any> {
  const [affectedCount] = await model.update(
    {
      ...updates,
      version: currentVersion + 1
    },
    {
      where: {
        id: pk,
        version: currentVersion
      },
      transaction
    }
  );

  if (affectedCount === 0) {
    throw new OptimisticLockError();
  }

  return await model.findByPk(pk, { transaction });
}

/**
 * 安全的并发更新工具
 * 封装了常见的并发更新模式
 */
export class ConcurrentUpdateHelper {
  /**
   * 原子递增
   * 安全地增加数值字段
   */
  static async increment(
    model: any,
    pk: string | number,
    field: string,
    amount: number = 1,
    options: { min?: number; max?: number } = {}
  ): Promise<any> {
    return await withTransaction(async (t) => {
      const record = await lockForUpdate(model, pk, t);

      if (!record) {
        throw new Error('记录不存在');
      }

      const currentValue = (record as any)[field] || 0;
      const newValue = currentValue + amount;

      // 检查最小值
      if (options.min !== undefined && newValue < options.min) {
        throw new Error(`值不能小于 ${options.min}`);
      }

      // 检查最大值
      if (options.max !== undefined && newValue > options.max) {
        throw new Error(`值不能大于 ${options.max}`);
      }

      await record.update({ [field]: newValue }, { transaction: t });

      return record;
    });
  }

  /**
   * 原子递减
   * 安全地减少数值字段
   */
  static async decrement(
    model: any,
    pk: string | number,
    field: string,
    amount: number = 1,
    options: { min?: number } = {}
  ): Promise<any> {
    return await this.increment(model, pk, field, -amount, options);
  }

  /**
   * 安全的库存扣减
   * 确保库存不会被扣成负数
   */
  static async decreaseStock(
    productModel: any,
    productId: string | number,
    quantity: number
  ): Promise<any> {
    return await withTransaction(async (t) => {
      const product = await lockForUpdate(productModel, productId, t);

      if (!product) {
        throw new Error('商品不存在');
      }

      const currentStock = (product as any).stock || 0;

      if (currentStock < quantity) {
        throw new Error('库存不足');
      }

      await product.update(
        {
          stock: currentStock - quantity,
          version: ((product as any).version || 0) + 1
        },
        { transaction: t }
      );

      return product;
    });
  }

  /**
   * 安全的余额转移
   * 从一个账户转移到另一个账户
   */
  static async transferBalance(
    userModel: any,
    fromUserId: string | number,
    toUserId: string | number,
    amount: number
  ): Promise<{ fromUser: any; toUser: any }> {
    return await withTransaction(async (t) => {
      // 锁定转出账户
      const fromUser = await lockForUpdate(userModel, fromUserId, t);
      // 锁定转入账户
      const toUser = await lockForUpdate(userModel, toUserId, t);

      if (!fromUser || !toUser) {
        throw new Error('用户不存在');
      }

      const fromBalance = (fromUser as any).balance || 0;

      if (fromBalance < amount) {
        throw new Error('余额不足');
      }

      // 执行转账
      await fromUser.update(
        { balance: fromBalance - amount },
        { transaction: t }
      );

      await toUser.update(
        { balance: ((toUser as any).balance || 0) + amount },
        { transaction: t }
      );

      return { fromUser, toUser };
    });
  }

  /**
   * 安全的唯一字段更新
   * 确保唯一性约束不被违反
   */
  static async updateUniqueField(
    model: any,
    pk: string | number,
    field: string,
    newValue: any
  ): Promise<any> {
    return await withTransaction(async (t) => {
      // 检查新值是否已被使用
      const existing = await model.findOne({
        where: {
          [field]: newValue,
          id: { [sequelize.Op.ne]: pk }
        },
        transaction
      });

      if (existing) {
        throw new Error(`${field} "${newValue}" 已被使用`);
      }

      const record = await model.findByPk(pk, { transaction });

      if (!record) {
        throw new Error('记录不存在');
      }

      await record.update({ [field]: newValue }, { transaction: t });

      return record;
    });
  }
}

/**
 * 导出所有工具
 */
export default {
  withTransaction,
  withTransactionRetry,
  lockForUpdate,
  lockForUpdateAll,
  updateWithOptimisticLock,
  ConcurrentUpdateHelper,
  ConcurrencyError,
  OptimisticLockError,
  LockTimeoutError
};
