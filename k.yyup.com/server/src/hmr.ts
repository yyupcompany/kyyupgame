/**
 * 热模块替换(Hot Module Replacement)支持
 * 该模块提供开发环境下的代码热重载功能，减少重启服务器的需求
 */
import path from 'path';
import chokidar from 'chokidar';
import { Server } from 'http';
import { logger } from './utils/logger';

// 需要排除监听的文件/文件夹
const ignoredPaths = [
  '**/.git/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/logs/**',
  '**/*.log',
  '**/*.js.map'
];

// 清除模块缓存
function clearModuleCache(modulePath: string): void {
  try {
    // 获取绝对路径
    const absolutePath = require.resolve(modulePath);
    
    // 查找此模块是否在缓存中
    if (require.cache[absolutePath]) {
      // 清除模块缓存
      delete require.cache[absolutePath];
      logger.info(`模块缓存已清除: ${modulePath}`);
    }
  } catch (error) {
    logger.error(`清除模块缓存失败: ${modulePath}`, error);
  }
}

/**
 * 创建一个文件监听器来支持热重载
 * @param server HTTP服务器实例
 * @param rootDir 要监听的根目录，通常是项目根目录
 */
export function setupHMR(server: Server, rootDir: string = path.resolve(__dirname, '../')): void {
  if (process.env.NODE_ENV !== 'development') {
    logger.info('HMR仅在开发环境下启用');
    return;
  }

  // 设置监听器
  const watcher = chokidar.watch([
    path.join(rootDir, 'src/**/*.ts')
  ], {
    ignored: ignoredPaths,
    ignoreInitial: true,
  });

  logger.info('HMR监听器已启动，正在监听文件变更...');

  // 监听文件变更
  watcher.on('change', (filePath) => {
    const relativePath = path.relative(rootDir, filePath);
    logger.info(`检测到文件变更: ${relativePath}`);

    try {
      // 尝试清除该模块的缓存
      const modulePath = './' + path.relative(__dirname, filePath).replace(/\.ts$/, '');
      clearModuleCache(modulePath);

      // 对于路由和控制器文件的特殊处理
      if (filePath.includes('/routes/') || filePath.includes('/controllers/')) {
        // 清除express路由缓存
        Object.keys(require.cache).forEach(cachedModule => {
          if (cachedModule.includes('/routes/') || cachedModule.includes('/controllers/')) {
            delete require.cache[cachedModule];
          }
        });
        logger.info('已清除所有路由和控制器的缓存');
      }

      // 对于中间件文件的特殊处理
      if (filePath.includes('/middlewares/')) {
        Object.keys(require.cache).forEach(cachedModule => {
          if (cachedModule.includes('/middlewares/')) {
            delete require.cache[cachedModule];
          }
        });
        logger.info('已清除所有中间件的缓存');
      }

      logger.info('模块热重载完成');
    } catch (error) {
      logger.error('热重载失败', error);
    }
  });

  // 监听新增文件
  watcher.on('add', (filePath) => {
    const relativePath = path.relative(rootDir, filePath);
    logger.info(`检测到新文件: ${relativePath}`);
  });

  // 优雅关闭监听器
  process.on('SIGINT', () => {
    logger.info('正在关闭HMR监听器...');
    watcher.close().then(() => {
      logger.info('HMR监听器已关闭');
      process.exit(0);
    });
  });
} 