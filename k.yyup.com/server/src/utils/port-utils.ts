import { execSync } from 'child_process';
import { logger } from './logger';

/**
 * 检查指定端口是否被占用
 * @param port 要检查的端口号
 * @returns 如果端口被占用返回true，否则返回false
 */
export const isPortInUse = (port: number): boolean => {
  try {
    // 使用lsof命令检查端口是否被占用
    const result = execSync(`lsof -i:${port} -t`, { encoding: 'utf-8' });
    return result.trim().length > 0;
  } catch (error) {
    // 如果lsof命令执行失败，说明端口可能没有被占用
    return false;
  }
};

/**
 * 获取占用指定端口的进程ID列表
 * @param port 要检查的端口号
 * @returns 占用该端口的进程ID数组
 */
export const getProcessesOnPort = (port: number): number[] => {
  try {
    const result = execSync(`lsof -i:${port} -t`, { encoding: 'utf-8' });
    return result.trim().split('\n')
      .filter(pid => pid.trim().length > 0)
      .map(pid => parseInt(pid.trim(), 10));
  } catch (error) {
    return [];
  }
};

/**
 * 杀死占用指定端口的所有进程
 * @param port 要清理的端口号
 * @returns 被杀死的进程ID数组
 */
export const killProcessesOnPort = (port: number): number[] => {
  try {
    const pids = getProcessesOnPort(port);
    if (pids.length === 0) {
      logger.info(`端口 ${port} 没有被占用`);
      return [];
    }

    // 使用kill命令杀死所有占用该端口的进程
    pids.forEach(pid => {
      try {
        logger.info(`正在杀死占用端口 ${port} 的进程 ${pid}...`);
        execSync(`kill -9 ${pid}`, { encoding: 'utf-8' });
      } catch (error) {
        logger.error(`杀死进程 ${pid} 失败`, error);
      }
    });

    // 验证进程是否已经被杀死
    const remainingPids = getProcessesOnPort(port);
    if (remainingPids.length > 0) {
      logger.warn(`以下进程仍然占用端口 ${port}: ${remainingPids.join(', ')}`);
    } else {
      logger.info(`端口 ${port} 已成功释放`);
    }

    return pids.filter(pid => !remainingPids.includes(pid));
  } catch (error) {
    logger.error(`清理端口 ${port} 失败`, error);
    return [];
  }
};

/**
 * 确保指定端口可用，如果被占用则尝试杀死占用的进程
 * @param port 要确保可用的端口号
 * @returns 如果端口成功释放或原本就未被占用返回true，否则返回false
 */
export const ensurePortAvailable = (port: number): boolean => {
  logger.info(`正在确保端口 ${port} 可用...`);
  
  if (!isPortInUse(port)) {
    logger.info(`端口 ${port} 未被占用，可以使用`);
    return true;
  }
  
  // 杀死占用端口的进程
  const killedPids = killProcessesOnPort(port);
  logger.info(`已杀死 ${killedPids.length} 个占用端口 ${port} 的进程`);
  
  // 再次检查端口是否可用
  if (isPortInUse(port)) {
    logger.error(`无法释放端口 ${port}，请手动终止占用该端口的进程`);
    return false;
  }
  
  return true;
}; 