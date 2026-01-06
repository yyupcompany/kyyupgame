# Bug #27 修复指南 - Console.log在生产环境的使用

## 问题描述
前端代码中使用`console.log`等调试语句，在生产环境中会暴露敏感信息并影响性能。

## 严重级别
**低**

## 受影响的文件
- `client/src/utils/request.ts`
- 多个组件文件

## 问题分析

1. **性能影响**: 大量console.log影响性能
2. **信息泄露**: 可能暴露敏感信息
3. **用户体验**: 控制台混乱
4. **调试困难**: 无法区分开发和生产日志

## 修复方案（使用条件日志）

### 步骤 1: 创建日志工具

在 `client/src/utils/logger.ts` 创建日志工具：

```typescript
/**
 * 开发环境检测
 */
const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  NONE = 'NONE'
}

/**
 * 当前日志级别
 */
let currentLogLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

/**
 * 设置日志级别
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * 获取日志级别
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * 日志级别优先级
 */
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.NONE]: 4
};

/**
 * 判断是否应该输出日志
 */
function shouldLog(level: LogLevel): boolean {
  return logLevelPriority[level] >= logLevelPriority[currentLogLevel];
}

/**
 * 格式化日志前缀
 */
function formatPrefix(level: LogLevel, context?: string): string {
  const timestamp = new Date().toISOString().substring(11, 23);
  const prefix = context ? `[${context}]` : '';
  return `${timestamp} ${level} ${prefix}`;
}

/**
 * 格式化日志消息
 */
function formatMessage(message: string, ...args: any[]): string {
  if (args.length === 0) {
    return message;
  }

  try {
    return `${message} ${JSON.stringify(args, null, 2)}`;
  } catch (error) {
    return `${message} ${args.join(' ')}`;
  }
}

/**
 * 日志颜色
 */
const logColors = {
  [LogLevel.DEBUG]: '#9E9E9E', // 灰色
  [LogLevel.INFO]: '#2196F3',  // 蓝色
  [LogLevel.WARN]: '#FF9800',  // 橙色
  [LogLevel.ERROR]: '#F44336'  // 红色
};

/**
 * 彩色日志
 */
function colorLog(level: LogLevel, ...args: any[]): void {
  if (typeof console !== 'undefined' && isDevelopment) {
    const color = logColors[level];
    const styles = [
      `color: ${color}`,
      'font-weight: bold',
      'font-size: 12px'
    ].join(';');

    // 第一个参数使用样式
    console.log(`%c${level}`, styles, ...args.slice(1));
  }
}

/**
 * Debug日志
 */
export function debug(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.DEBUG) && isDevelopment) {
    const prefix = formatPrefix(LogLevel.DEBUG);
    console.log(prefix, message, ...args);
  }
}

/**
 * Info日志
 */
export function info(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.INFO)) {
    const prefix = formatPrefix(LogLevel.INFO);
    console.info(prefix, message, ...args);
  }
}

/**
 * Warn日志
 */
export function warn(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.WARN)) {
    const prefix = formatPrefix(LogLevel.WARN);
    console.warn(prefix, message, ...args);
  }
}

/**
 * Error日志
 */
export function error(message: string, ...args: any[]): void {
  if (shouldLog(LogLevel.ERROR)) {
    const prefix = formatPrefix(LogLevel.ERROR);
    console.error(prefix, message, ...args);
  }
}

/**
 * 分组日志
 */
export function group(label: string, collapsed: boolean = false): void {
  if (isDevelopment) {
    if (collapsed) {
      console.groupCollapsed(label);
    } else {
      console.group(label);
    }
  }
}

/**
 * 结束分组
 */
export function groupEnd(): void {
  if (isDevelopment) {
    console.groupEnd();
  }
}

/**
 * 表格日志
 */
export function table(data: any[]): void {
  if (isDevelopment && Array.isArray(data)) {
    console.table(data);
  }
}

/**
 * 追踪日志
 */
export function trace(message?: string): void {
  if (isDevelopment) {
    console.trace(message || 'Trace');
  }
}

/**
 * 计时开始
 */
export function time(label: string): void {
  if (isDevelopment) {
    console.time(label);
  }
}

/**
 * 计时结束
 */
export function timeEnd(label: string): void {
  if (isDevelopment) {
    console.timeEnd(label);
  }
}

/**
 * 上下文日志器
 */
export function createContextLogger(context: string) {
  return {
    debug: (message: string, ...args: any[]) => {
      debug(`[${context}]`, message, ...args);
    },
    info: (message: string, ...args: any[]) => {
      info(`[${context}]`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      warn(`[${context}]`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      error(`[${context}]`, message, ...args);
    },
    group: (label: string, collapsed?: boolean) => {
      group(`[${context}] ${label}`, collapsed);
    }
  };
}

/**
 * 请求日志器
 */
export const requestLogger = createContextLogger('Request');

/**
 * 响应日志器
 */
export const responseLogger = createContextLogger('Response');

/**
 * 错误日志器
 */
export const errorLogger = createContextLogger('Error');

/**
 * 性能日志器
 */
export const performanceLogger = createContextLogger('Performance');

/**
 * 导出日志对象
 */
export const logger = {
  debug,
  info,
  warn,
  error,
  group,
  groupEnd,
  table,
  trace,
  time,
  timeEnd,
  setLogLevel,
  getLogLevel,
  createContextLogger
};

/**
 * 默认导出
 */
export default logger;
```

### 步骤 2: 更新request.ts

**修复前：**
```typescript
// ❌ 生产环境也会输出日志
console.log('[请求]', config);
console.error('[错误]', error);
```

**修复后：**
```typescript
import { requestLogger, responseLogger, errorLogger, logger } from './logger';

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 使用条件日志
    requestLogger.debug('发送请求', {
      url: config.url,
      method: config.method,
      data: config.data
    });

    return config;
  },
  (error) => {
    errorLogger.error('请求错误', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    responseLogger.debug('收到响应', {
      url: response.config.url,
      status: response.status
    });

    return response;
  },
  (error) => {
    // 错误总是记录（包括生产环境）
    errorLogger.error('响应错误', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status
    });

    return Promise.reject(error);
  }
);
```

### 步骤 3: 创建全局日志配置

在 `client/src/main.ts` 中配置：

```typescript
import { logger, setLogLevel, LogLevel } from '@/utils/logger';

/**
 * 根据环境设置日志级别
 */
if (import.meta.env.PROD) {
  // 生产环境：只记录错误
  setLogLevel(LogLevel.ERROR);
} else if (import.meta.env.MODE === 'test') {
  // 测试环境：不记录日志
  setLogLevel(LogLevel.NONE);
} else {
  // 开发环境：记录所有日志
  setLogLevel(LogLevel.DEBUG);
}

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
  logger.error('全局错误', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

/**
 * 未处理的Promise拒绝
 */
window.addEventListener('unhandledrejection', (event) => {
  logger.error('未处理的Promise拒绝', {
    reason: event.reason,
    promise: event.promise
  });
});

app.mount('#app');
```

### 步骤 4: 在组件中使用

```vue
<script setup lang="ts">
import { logger, createContextLogger } from '@/utils/logger';

// 创建上下文日志器
const componentLogger = createContextLogger('UserList');

export default {
  data() {
    return {
      users: []
    };
  },

  mounted() {
    componentLogger.info('组件已挂载');
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      componentLogger.debug('开始获取用户列表');

      try {
        const response = await this.$http.get('/users');
        this.users = response.data;

        componentLogger.info('用户列表获取成功', {
          count: this.users.length
        });
      } catch (error) {
        componentLogger.error('用户列表获取失败', error);
      }
    },

    async createUser(userData: any) {
      componentLogger.debug('创建用户', userData);

      try {
        const response = await this.$http.post('/users', userData);

        componentLogger.info('用户创建成功', {
          id: response.data.id,
          username: response.data.username
        });

        return response.data;
      } catch (error) {
        componentLogger.error('用户创建失败', error);
        throw error;
      }
    }
  }
};
</script>
```

### 步骤 5: 性能监控日志

```typescript
import { performanceLogger, time, timeEnd } from '@/utils/logger';

/**
 * 性能监控装饰器
 */
export function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const label = `${target.constructor.name}.${propertyKey}`;
    time(label);

    try {
      const result = await originalMethod.apply(this, args);

      timeEnd(label);

      performanceLogger.debug('性能', {
        method: label,
        duration: performance.now()
      });

      return result;
    } catch (error) {
      timeEnd(label);
      performanceLogger.error('性能', {
        method: label,
        error
      });
      throw error;
    }
  };

  return descriptor;
}

/**
 * 使用示例
 */
class UserService {
  @logPerformance
  async fetchUsers() {
    // 这个方法的执行时间会被记录
    const response = await axios.get('/users');
    return response.data;
  }
}
```

### 步骤 6: 环境变量配置

在 `client/.env` 中添加：

```bash
# ================================
# 日志配置
# ================================

# 日志级别 (DEBUG|INFO|WARN|ERROR|NONE)
VITE_LOG_LEVEL=DEBUG

# 是否启用性能日志
VITE_LOG_PERFORMANCE=true

# 是否启用请求/响应日志
VITE_LOG_REQUEST=true
```

### 步骤 7: Vite配置优化

在 `client/vite.config.ts` 中：

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  // 生产环境移除console
  esbuild: {
    drop: import.meta.env.PROD ? ['console', 'debugger'] : []
  },

  // 保留某些日志
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除console.log，但保留console.error
        drop_console: import.meta.env.PROD,
        drop_debugger: import.meta.env.PROD,
        pure_funcs: import.meta.env.PROD
          ? ['console.log', 'console.info', 'console.debug', 'console.warn']
          : []
      }
    }
  }
});
```

### 步骤 8: 日志上报（可选）

创建 `client/src/utils/log-reporter.ts`：

```typescript
import { errorLogger } from './logger';

/**
 * 日志上报配置
 */
const LOG_REPORT_CONFIG = {
  enabled: import.meta.env.PROD,
  endpoint: '/api/logs',
  batchSize: 10,
  flushInterval: 30000 // 30秒
};

/**
 * 日志队列
 */
const logQueue: any[] = [];

/**
 * 上报日志
 */
async function reportLogs(): Promise<void> {
  if (logQueue.length === 0) return;

  const logs = logQueue.splice(0, LOG_REPORT_CONFIG.batchSize);

  try {
    await fetch(LOG_REPORT_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ logs })
    });
  } catch (error) {
    errorLogger.error('日志上报失败', error);
    // 失败的日志重新加入队列
    logQueue.unshift(...logs);
  }
}

/**
 * 添加日志到队列
 */
export function addLogToQueue(log: any): void {
  if (!LOG_REPORT_CONFIG.enabled) return;

  logQueue.push({
    ...log,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  // 达到批次大小时上报
  if (logQueue.length >= LOG_REPORT_CONFIG.batchSize) {
    reportLogs();
  }
}

/**
 * 定时上报
 */
if (LOG_REPORT_CONFIG.enabled) {
  setInterval(reportLogs, LOG_REPORT_CONFIG.flushInterval);

  // 页面卸载时上报
  window.addEventListener('beforeunload', () => {
    if (logQueue.length > 0) {
      navigator.sendBeacon(
        LOG_REPORT_CONFIG.endpoint,
        JSON.stringify({ logs: logQueue })
      );
    }
  });
}
```

## 本地调试保证

### 开发环境完整日志

```typescript
if (import.meta.env.DEV) {
  setLogLevel(LogLevel.DEBUG);
}

// 开发环境所有日志都输出
logger.debug('调试信息');
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息');
```

- ✅ 开发环境完整日志输出
- ✅ 支持所有console方法
- ✅ 不影响调试

### 生产环境只记录错误

```typescript
if (import.meta.env.PROD) {
  setLogLevel(LogLevel.ERROR);
}

// 生产环境只记录错误
logger.debug('调试信息'); // 不输出
logger.info('普通信息');  // 不输出
logger.warn('警告信息');  // 不输出
logger.error('错误信息'); // 输出
```

### 测试环境禁用日志

```typescript
if (import.meta.env.MODE === 'test') {
  setLogLevel(LogLevel.NONE);
}

// 测试环境不输出日志
logger.error('错误信息'); // 不输出
```

## 验证步骤

### 1. 测试开发环境日志

```bash
# 启动开发服务器
npm run dev

# 检查控制台，应该看到所有级别的日志
```

### 2. 测试生产环境日志

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 检查控制台，应该只看到错误日志
```

### 3. 测试日志级别切换

```javascript
import { setLogLevel, logger } from '@/utils/logger';

// 切换到只记录警告和错误
setLogLevel(LogLevel.WARN);

logger.debug('调试'); // 不输出
logger.info('信息');  // 不输出
logger.warn('警告');  // 输出
logger.error('错误'); // 输出
```

### 4. 测试上下文日志器

```javascript
import { createContextLogger } from '@/utils/logger';

const myLogger = createContextLogger('MyComponent');

myLogger.debug('调试信息');
myLogger.info('普通信息');
myLogger.warn('警告信息');
myLogger.error('错误信息');
```

### 5. 测试性能日志

```javascript
import { time, timeEnd, performanceLogger } from '@/utils/logger';

time('operation');
// 执行操作
timeEnd('operation');
// 应该输出操作耗时
```

## 回滚方案

如果日志系统导致问题：

1. **恢复直接使用console**：
   ```typescript
   console.log('信息');
   console.error('错误');
   ```

2. **禁用日志包装**：
   ```typescript
   export const logger = {
     debug: console.log,
     info: console.info,
     warn: console.warn,
     error: console.error
   };
   ```

3. **修改Vite配置**：
   ```typescript
   esbuild: {
     drop: [] // 不移除任何console
   }
   ```

## 修复完成检查清单

- [ ] 日志工具已创建
- [ ] request.ts已更新
- [ ] 全局日志配置已添加
- [ ] 组件已更新使用新日志
- [ ] 环境变量已配置
- [ ] Vite配置已优化
- [ ] 日志上报已实现（可选）
- [ ] 开发环境日志已测试
- [ ] 生产环境日志已测试
- [ ] 本地调试不受影响

## 风险评估

- **风险级别**: 低
- **影响范围**: 日志输出
- **回滚难度**: 低（恢复console直接调用）
- **本地调试影响**: 无（开发环境完整日志）

---

**修复时间估计**: 3-4 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 5-7 小时
