/**
 * 事务监控工具
 * 用于监控和优化数据库事务，避免长事务和死锁问题
 */

import {  Sequelize, QueryTypes } from 'sequelize';
import { monitoringConfig } from '../config/database-optimization';

/**
 * 事务信息接口
 */
interface TransactionInfo {
  id: string;
  user: string;
  startTime: Date;
  state: string;
  duration: number; // 单位：秒
  queryInfo: string;
  lockCount: number;
  waitingForLock: boolean;
}

/**
 * 获取当前活跃事务
 * @param sequelize Sequelize 实例
 * @returns 活跃事务列表
 */
export async function getActiveTransactions(sequelize: Sequelize): Promise<TransactionInfo[]> {
  try {
    // MySQL 查询活跃事务
    const transactions = await sequelize.query(`
      SELECT 
        trx.trx_id AS id,
        trx.trx_mysql_thread_id AS threadId,
        trx.trx_started AS startTime,
        trx.trx_state AS state,
        TIMESTAMPDIFF(SECOND, trx.trx_started, NOW()) AS duration,
        p.user AS user,
        p.host AS host,
        p.info AS queryInfo,
        COUNT(l.lock_id) AS lockCount,
        IFNULL(l.lock_wait_timeout > 0, FALSE) AS waitingForLock
      FROM 
        information_schema.innodb_trx trx
      JOIN 
        information_schema.processlist p ON trx.trx_mysql_thread_id = p.id
      LEFT JOIN 
        information_schema.innodb_locks l ON trx.trx_id = l.lock_trx_id
      GROUP BY 
        trx.trx_id
      ORDER BY 
        duration DESC
    `, { type: QueryTypes.SELECT });
    
    return transactions as TransactionInfo[];
  } catch (error) {
    console.error('获取活跃事务失败:', error);
    return [];
  }
}

/**
 * 获取长时间运行事务
 * @param sequelize Sequelize 实例
 * @param thresholdSeconds 阈值（秒）
 * @returns 长时间运行事务列表
 */
export async function getLongRunningTransactions(sequelize: Sequelize, thresholdSeconds = 30): Promise<TransactionInfo[]> {
  try {
    const transactions = await getActiveTransactions(sequelize);
    return transactions.filter(tx => tx.duration > thresholdSeconds);
  } catch (error) {
    console.error('获取长时间运行事务失败:', error);
    return [];
  }
}

/**
 * 获取事务锁等待信息
 * @param sequelize Sequelize 实例
 * @returns 锁等待信息
 */
export async function getTransactionLockWaits(sequelize: Sequelize): Promise<any[]> {
  try {
    // MySQL 查询锁等待信息
    const lockWaits = await sequelize.query(`
      SELECT 
        r.trx_id AS requestingTrxId,
        r.trx_mysql_thread_id AS requestingThreadId,
        r.trx_query AS requestingQuery,
        TIMESTAMPDIFF(SECOND, r.trx_wait_started, NOW()) AS waitTime,
        b.trx_id AS blockingTrxId,
        b.trx_mysql_thread_id AS blockingThreadId,
        TIMESTAMPDIFF(SECOND, b.trx_started, NOW()) AS blockingTrxAge,
        bp.info AS blockingQuery,
        bl.lock_table AS lockTable
      FROM 
        information_schema.innodb_lock_waits w
      JOIN 
        information_schema.innodb_trx r ON w.requesting_trx_id = r.trx_id
      JOIN 
        information_schema.innodb_trx b ON w.blocking_trx_id = b.trx_id
      JOIN 
        information_schema.processlist bp ON b.trx_mysql_thread_id = bp.id
      LEFT JOIN 
        information_schema.innodb_locks bl ON w.blocking_lock_id = bl.lock_id
      ORDER BY 
        waitTime DESC
    `, { type: QueryTypes.SELECT });
    
    return lockWaits;
  } catch (error) {
    console.error('获取事务锁等待信息失败:', error);
    return [];
  }
}

/**
 * 检测死锁
 * @param sequelize Sequelize 实例
 * @returns 最近的死锁信息
 */
export async function getDeadlockInfo(sequelize: Sequelize): Promise<string> {
  try {
    const [result] = await sequelize.query(`SHOW ENGINE INNODB STATUS`, { type: QueryTypes.SELECT }) as any[];
    
    if (!result || !result.Status) {
      return '';
    }
    
    const status = result.Status;
    const deadlockIndex = status.indexOf('LATEST DETECTED DEADLOCK');
    
    if (deadlockIndex === -1) {
      return '';
    }
    
    const endIndex = status.indexOf('------------', deadlockIndex);
    return status.substring(deadlockIndex, endIndex !== -1 ? endIndex : undefined);
  } catch (error) {
    console.error('获取死锁信息失败:', error);
    return '';
  }
}

/**
 * 终止长时间运行事务
 * @param sequelize Sequelize 实例
 * @param threadId 线程ID
 * @returns 是否成功
 */
export async function killLongTransaction(sequelize: Sequelize, threadId: number): Promise<boolean> {
  try {
    // 先检查事务是否仍然活跃
    const [thread] = await sequelize.query(`
      SELECT id FROM information_schema.processlist WHERE id = :threadId
    `, { 
      replacements: { threadId },
      type: QueryTypes.SELECT 
    }) as any[];
    
    if (!thread) {
      return false;
    }
    
    // 终止事务
    await sequelize.query(`KILL :threadId`, { 
      replacements: { threadId },
      type: QueryTypes.RAW 
    });
    
    console.log(`成功终止线程ID为 ${threadId} 的事务`);
    return true;
  } catch (error) {
    console.error(`终止线程ID为 ${threadId} 的事务失败:`, error);
    return false;
  }
}

/**
 * 获取事务统计信息
 * @param sequelize Sequelize 实例
 * @returns 事务统计
 */
export async function getTransactionStats(sequelize: Sequelize): Promise<{
  activeCount: number;
  longRunningCount: number;
  waitingForLockCount: number;
  avgDuration: number;
  maxDuration: number;
}> {
  try {
    const transactions = await getActiveTransactions(sequelize);
    
    if (transactions.length === 0) {
      return {
        activeCount: 0,
        longRunningCount: 0,
        waitingForLockCount: 0,
        avgDuration: 0,
        maxDuration: 0
      };
    }
    
    const longRunningThreshold = monitoringConfig?.transactions?.longRunningThresholdSeconds || 30;
    const longRunning = transactions.filter(tx => tx.duration > longRunningThreshold);
    const waitingForLock = transactions.filter(tx => tx.waitingForLock);
    
    const totalDuration = transactions.reduce((sum, tx) => sum + tx.duration, 0);
    const maxDuration = Math.max(...transactions.map(tx => tx.duration));
    
    return {
      activeCount: transactions.length,
      longRunningCount: longRunning.length,
      waitingForLockCount: waitingForLock.length,
      avgDuration: totalDuration / transactions.length,
      maxDuration
    };
  } catch (error) {
    console.error('获取事务统计信息失败:', error);
    return {
      activeCount: 0,
      longRunningCount: 0,
      waitingForLockCount: 0,
      avgDuration: 0,
      maxDuration: 0
    };
  }
}

/**
 * 获取事务健康状态
 * @param sequelize Sequelize 实例
 * @returns 健康状态和建议
 */
export async function getTransactionHealth(sequelize: Sequelize): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}> {
  try {
    const stats = await getTransactionStats(sequelize);
    const lockWaits = await getTransactionLockWaits(sequelize);
    const deadlockInfo = await getDeadlockInfo(sequelize);
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // 检查长时间运行事务
    if (stats.longRunningCount > 5) {
      status = 'critical';
      issues.push(`存在 ${stats.longRunningCount} 个长时间运行事务`);
      recommendations.push('检查并优化长时间运行的事务，缩短事务持续时间');
    } else if (stats.longRunningCount > 0) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push(`存在 ${stats.longRunningCount} 个长时间运行事务`);
      recommendations.push('监控长时间运行的事务，考虑拆分为多个较小事务');
    }
    
    // 检查锁等待
    if (lockWaits.length > 3) {
      status = 'critical';
      issues.push(`存在 ${lockWaits.length} 个事务正在等待锁`);
      recommendations.push('检查锁等待情况，优化事务逻辑以减少锁争用');
    } else if (lockWaits.length > 0) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push(`存在 ${lockWaits.length} 个事务正在等待锁`);
      recommendations.push('监控锁等待情况，避免长时间锁定资源');
    }
    
    // 检查死锁
    if (deadlockInfo) {
      status = 'critical';
      issues.push('系统最近发生过死锁');
      recommendations.push('分析死锁情况，调整事务中访问资源的顺序');
    }
    
    // 检查平均事务时间
    if (stats.avgDuration > 10) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push(`事务平均持续时间为 ${stats.avgDuration.toFixed(2)} 秒`);
      recommendations.push('考虑缩短事务持续时间，减少事务中的操作数量');
    }
    
    return {
      status,
      issues,
      recommendations
    };
  } catch (error) {
    console.error('获取事务健康状态失败:', error);
    return {
      status: 'warning',
      issues: ['无法获取事务健康状态'],
      recommendations: ['检查数据库监控配置和权限']
    };
  }
}

/**
 * 自动管理事务
 * @param sequelize Sequelize 实例
 */
export async function autoManageTransactions(sequelize: Sequelize): Promise<void> {
  try {
    if (!monitoringConfig.enabled || !monitoringConfig.transactions.autoKillLongTransactions) {
      return;
    }
    
    const longTransactions = await getLongRunningTransactions(
      sequelize, 
      monitoringConfig.transactions.autoKillThresholdSeconds
    );
    
    for (const tx of longTransactions) {
      console.warn(`自动终止超时事务: ID=${tx.id}, 持续时间=${tx.duration}s`);
      await killLongTransaction(sequelize, tx.id as unknown as number);
    }
  } catch (error) {
    console.error('自动管理事务失败:', error);
  }
}

export default {
  getActiveTransactions,
  getLongRunningTransactions,
  getTransactionLockWaits,
  getDeadlockInfo,
  killLongTransaction,
  getTransactionStats,
  getTransactionHealth,
  autoManageTransactions
}; 