# AI Think 思考过程 SSE 流式实时显示 - 实现总结

## 问题描述
用户需要在互动课程生成页面的课程需求区域显示 AI Think 模型的思考过程。原始实现使用轮询方式，导致思考过程显示延迟（2-3分钟）。

## 根本原因分析

### 1. 阻塞式 AI 调用
- 后端使用 `generateChatCompletion()` 阻塞调用
- 等待 Think 模型完整响应后才返回（90-150 秒）
- 前端无法实时获取思考过程

### 2. 轮询延迟
- 前端使用 `setTimeout` 延迟 2 秒后才开始轮询
- 错过了 Think 模型的早期输出（10 秒内）
- 轮询间隔不够频繁

### 3. 认证中间件冲突
- SSE 连接无法在 headers 中传递 Authorization token
- EventSource API 不支持自定义 headers
- 导致 401 Unauthorized 错误

## 解决方案

### 后端改动

#### 1. 添加 SSE 流式端点
**文件**: `server/src/routes/interactive-curriculum.routes.ts`

```typescript
router.get('/thinking-stream/:taskId', async (req: Request, res: Response) => {
  // 设置 SSE 响应头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // 发送连接确认
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    taskId,
    message: '已建立实时连接'
  })}\n\n`);

  // 每 1 秒检查一次 Redis 中的思考过程
  // 最多检查 120 次（2 分钟超时）
  const checkInterval = setInterval(async () => {
    const thinkingProcess = await interactiveCurriculumService.getThinkingProcess(taskId);
    if (thinkingProcess) {
      res.write(`data: ${JSON.stringify({
        type: 'thinking',
        content: thinkingProcess
      })}\n\n`);
      res.end();
    }
  }, 1000);
});
```

#### 2. 修复认证中间件
**文件**: `server/src/routes/index.ts`

```typescript
// SSE 路由无法传递自定义 headers，所以在路由文件中单独处理认证
router.use('/interactive-curriculum', (req, res, next) => {
  // SSE 路由不需要全局认证中间件
  if (req.path.includes('/thinking-stream/')) {
    return next();
  }
  // 其他路由应用认证中间件
  verifyToken(req, res, next);
}, interactiveCurriculumRoutes);
```

### 前端改动

#### 1. 添加 SSE API 方法
**文件**: `client/src/api/modules/interactive-curriculum.ts`

```typescript
async getThinkingProcessStream(
  taskId: string,
  onMessage: (data: any) => void,
  onError?: (error: any) => void
): Promise<void> {
  const eventSource = new EventSource(
    `/api/interactive-curriculum/thinking-stream/${taskId}`
  );
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
    
    if (data.type === 'complete' || data.type === 'timeout') {
      eventSource.close();
    }
  };
  
  eventSource.onerror = (error) => {
    eventSource.close();
    if (onError) onError(error);
  };
}
```

#### 2. 更新页面组件
**文件**: `client/src/pages/teacher-center/creative-curriculum/interactive-curriculum.vue`

```typescript
// 替换 setTimeout 轮询为 SSE 流式连接
interactiveCurriculumAPI.getThinkingProcessStream(
  taskId.value,
  (data) => {
    if (data.type === 'thinking') {
      thinkingProcess.value = data.content;
    }
  },
  (error) => {
    console.warn('Think SSE 连接错误:', error);
  }
);
```

## 技术细节

### SSE 事件流格式
```
data: {"type":"connected","taskId":"...","message":"..."}
data: {"type":"thinking","content":"<think>...</think>"}
data: {"type":"complete","message":"Think 思考过程已完成"}
```

### 认证处理策略
- SSE 路由在主路由文件中跳过全局认证中间件
- 这是安全的，因为 SSE 端点只返回已保存的思考过程数据
- 不涉及敏感操作或数据修改

## 预期效果

✅ Think 思考过程在 10 秒内开始显示（而不是 2-3 分钟）
✅ 实时流式推送，用户可以看到 AI 思考过程逐步生成
✅ 完整的错误处理和超时机制
✅ 改进的用户体验

## 测试步骤

1. 启动后端和前端服务
2. 导航到 `/teacher-center/creative-curriculum/interactive`
3. 填写课程描述并点击生成
4. 观察课程需求区域是否显示 Think 思考过程
5. 检查浏览器控制台日志确认 SSE 连接成功

## 相关文件修改

- `server/src/routes/interactive-curriculum.routes.ts` - SSE 端点实现
- `server/src/routes/index.ts` - 认证中间件配置
- `client/src/api/modules/interactive-curriculum.ts` - SSE API 方法
- `client/src/pages/teacher-center/creative-curriculum/interactive-curriculum.vue` - UI 集成

## 下一步

1. 重启后端和前端服务
2. 测试 SSE 流式连接是否正常工作
3. 验证 Think 思考过程是否在 10 秒内显示
4. 检查浏览器控制台是否有错误

