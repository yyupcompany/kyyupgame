# 文件删除队列机制

## 📋 概述

文件删除队列管理器是一个基于内存的队列系统，用于安全、可靠地删除文件，避免IO锁冲突和并发问题。

---

## 🎯 问题背景

### 为什么需要队列？

在文件删除操作中，可能遇到以下问题：

1. **IO锁冲突** 
   - 文件正在被读取时无法删除
   - 多个进程同时删除同一文件
   - 操作系统文件锁定

2. **并发冲突**
   - 多个请求同时删除同一文件
   - 删除操作相互干扰
   - 竞态条件导致错误

3. **删除失败**
   - EBUSY（文件被占用）
   - EPERM（权限错误）
   - 临时性IO错误

### 传统方案的问题

```typescript
// ❌ 直接删除 - 可能失败
fs.unlinkSync(filePath);

// ❌ 简单重试 - 可能死锁
for (let i = 0; i < 3; i++) {
  try {
    fs.unlinkSync(filePath);
    break;
  } catch (error) {
    // 重试
  }
}

// ❌ 并发删除 - 可能冲突
await Promise.all(files.map(f => fs.promises.unlink(f)));
```

---

## 🔒 队列机制设计

### 核心组件

```
┌─────────────────────────────────────────┐
│         FileDeletionQueue               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌──────────────┐  │
│  │   Queue     │    │    Locks     │  │
│  │  (FIFO)     │    │  (Set<path>) │  │
│  └─────────────┘    └──────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │      Task Processor             │  │
│  │  - 串行处理                      │  │
│  │  - 自动重试                      │  │
│  │  - 指数退避                      │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### 关键特性

| 特性 | 说明 | 实现 |
|------|------|------|
| **队列** | FIFO任务队列 | `queue: DeletionTask[]` |
| **锁** | 文件路径锁 | `locks: Set<string>` |
| **重试** | 自动重试机制 | 最多3次，指数退避 |
| **超时** | 操作超时保护 | 5秒超时 |
| **并发** | 串行化处理 | `processing: boolean` |

---

## 🛠️ API文档

### 1. deleteFile(filePath)

删除单个文件（异步）

**参数**:
- `filePath: string` - 文件路径

**返回**: `Promise<void>`

**示例**:
```typescript
import { fileDeletionQueue } from '@/utils/file-deletion-queue';

// 删除单个文件
await fileDeletionQueue.deleteFile('/path/to/file.txt');
```

**特点**:
- ✅ 自动加入队列
- ✅ 自动重试（最多3次）
- ✅ 文件不存在时不报错

---

### 2. deleteFiles(filePaths)

批量删除文件（异步）

**参数**:
- `filePaths: string[]` - 文件路径数组

**返回**: `Promise<void>`

**示例**:
```typescript
// 批量删除
await fileDeletionQueue.deleteFiles([
  '/path/to/file1.txt',
  '/path/to/file2.txt',
  '/path/to/file3.txt'
]);
```

**特点**:
- ✅ 并发加入队列
- ✅ 串行化执行
- ✅ 一个失败不影响其他

---

### 3. deleteFilesByPattern(directory, pattern)

按模式删除文件（异步）

**参数**:
- `directory: string` - 目录路径
- `pattern: string | RegExp` - 匹配模式

**返回**: `Promise<number>` - 删除的文件数量

**示例**:
```typescript
// 按字符串前缀删除
const count1 = await fileDeletionQueue.deleteFilesByPattern(
  '/uploads/audio',
  'project123_' // 删除所有以project123_开头的文件
);

// 按正则表达式删除
const count2 = await fileDeletionQueue.deleteFilesByPattern(
  '/uploads/audio',
  /\.mp3$/ // 删除所有.mp3文件
);

console.log(`删除了 ${count1} 个文件`);
```

**特点**:
- ✅ 自动扫描目录
- ✅ 灵活的匹配模式
- ✅ 返回删除数量

---

### 4. getStatus()

获取队列状态

**返回**: 
```typescript
{
  queueLength: number;    // 队列中的任务数
  processing: boolean;    // 是否正在处理
  lockedFiles: number;    // 被锁定的文件数
}
```

**示例**:
```typescript
const status = fileDeletionQueue.getStatus();
console.log(`队列长度: ${status.queueLength}`);
console.log(`正在处理: ${status.processing}`);
console.log(`锁定文件: ${status.lockedFiles}`);
```

---

## 🔄 工作流程

### 正常流程

```
1. 用户调用 deleteFile(path)
   ↓
2. 创建删除任务，加入队列
   ↓
3. 检查队列是否在处理
   ↓
4. 启动队列处理器（如果未启动）
   ↓
5. 从队列取出任务
   ↓
6. 检查文件锁
   ├─ 已锁定 → 重新入队，延迟处理
   └─ 未锁定 → 继续
   ↓
7. 加锁（locks.add(path)）
   ↓
8. 检查文件是否存在
   ├─ 不存在 → 视为成功
   └─ 存在 → 继续
   ↓
9. 执行删除操作（带超时）
   ├─ 成功 → resolve()
   └─ 失败 → 重试或reject()
   ↓
10. 解锁（locks.delete(path)）
   ↓
11. 处理下一个任务
```

### 重试流程

```
删除失败
   ↓
检查重试次数
   ├─ < maxRetries → 重新入队
   │   ↓
   │   延迟 = retryDelay × retryCount（指数退避）
   │   ↓
   │   等待延迟后重试
   │
   └─ >= maxRetries → reject(error)
```

---

## 📊 错误处理

### 错误类型

| 错误代码 | 说明 | 处理方式 |
|---------|------|---------|
| `EBUSY` | 文件被占用 | 自动重试 |
| `EPERM` | 权限错误 | 自动重试 |
| `ENOENT` | 文件不存在 | 视为成功 |
| `TIMEOUT` | 操作超时 | 自动重试 |
| 其他 | 未知错误 | 自动重试 |

### 重试策略

```typescript
// 重试配置
maxRetries: 3           // 最多重试3次
retryDelay: 100ms       // 基础延迟100ms

// 指数退避
第1次重试: 100ms × 1 = 100ms
第2次重试: 100ms × 2 = 200ms
第3次重试: 100ms × 3 = 300ms
```

---

## 🎯 使用场景

### 场景1: 清理项目音频文件

```typescript
// video-audio.service.ts
async cleanupProjectAudio(projectId: string): Promise<void> {
  // 使用队列按模式删除
  const count = await fileDeletionQueue.deleteFilesByPattern(
    this.uploadDir,
    `${projectId}_` // 匹配项目ID前缀
  );
  
  console.log(`清理了 ${count} 个文件`);
}
```

### 场景2: 批量清理临时文件

```typescript
// 清理所有临时文件
const tempFiles = [
  '/tmp/upload1.tmp',
  '/tmp/upload2.tmp',
  '/tmp/upload3.tmp'
];

await fileDeletionQueue.deleteFiles(tempFiles);
```

### 场景3: 定时清理过期文件

```typescript
// 每天凌晨清理7天前的文件
cron.schedule('0 0 * * *', async () => {
  const files = getFilesOlderThan(7); // 获取7天前的文件
  await fileDeletionQueue.deleteFiles(files);
});
```

---

## ✅ 优势

### 1. 安全性
- 🔒 避免IO锁冲突
- 🔒 防止并发删除同一文件
- 🔒 自动处理文件占用

### 2. 可靠性
- 🔄 自动重试机制
- 🔄 指数退避策略
- 🔄 超时保护

### 3. 性能
- ⚡ 串行化处理，避免资源竞争
- ⚡ 批量操作支持
- ⚡ 内存队列，无需外部依赖

### 4. 可维护性
- 📊 队列状态监控
- 📊 详细的日志输出
- 📊 清晰的错误信息

---

## 🧪 测试

### 运行测试

```bash
# 运行文件删除队列测试
npm test -- file-deletion-queue.test.ts

# 运行所有后端测试
cd server && npm test
```

### 测试覆盖

- ✅ 单文件删除
- ✅ 批量删除
- ✅ 按模式删除
- ✅ 并发删除
- ✅ 错误处理
- ✅ 重试机制
- ✅ 队列锁机制

---

## 📚 相关文档

- [TTS音频清理策略](./TTS_AUDIO_CLEANUP_STRATEGY.md)
- [视频创作功能](./VIDEO_CREATION_README.md)

---

**最后更新**: 2025-10-03  
**版本**: v1.0.0  
**状态**: ✅ 已实现并测试

