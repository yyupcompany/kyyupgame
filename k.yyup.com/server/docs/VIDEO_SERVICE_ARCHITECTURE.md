# 视频服务架构说明

## 📐 架构设计

### 设计原则

采用 **Facade（门面）模式** + **职责分离** 的架构设计：

- `ai-bridge.service.ts` - 统一的AI服务入口（门面）
- `video.service.ts` - 专业的视频生成服务（实现）

### 架构优势

1. **保持 ai-bridge.service 简洁**
   - 避免文件过大
   - 只作为统一入口，委托给专业服务

2. **职责分离**
   - ai-bridge：路由和协调
   - video.service：视频生成的具体逻辑

3. **易于维护和扩展**
   - 视频相关的复杂逻辑都在 video.service 中
   - 新增视频功能只需修改 video.service

4. **符合单一职责原则**
   - 每个服务专注于自己的领域

## 🔄 调用流程

```
前端请求
    ↓
video.controller.ts
    ↓
ai-bridge.service.generateVideo()  ← 统一入口
    ↓
video.service.generateVideo()      ← 委托调用
    ↓
├─ generateVideoFromText()         ← 文生视频
└─ generateVideoFromImage()        ← 图生视频
    ↓
返回统一格式的响应
```

## 📁 文件结构

```
server/src/
├── controllers/
│   └── ai/
│       └── video.controller.ts          # 视频生成控制器
├── services/
│   └── ai/
│       ├── bridge/
│       │   ├── ai-bridge.service.ts     # AI统一入口（门面）
│       │   └── ai-bridge.types.ts       # 统一的类型定义
│       └── video.service.ts             # 视频生成专业服务
└── routes/
    └── ai/
        └── video.routes.ts              # 视频生成路由
```

## 🔧 核心方法

### ai-bridge.service.ts

```typescript
/**
 * 视频生成（委托给专业的 video.service）
 */
public async generateVideo(
  params: AiBridgeVideoGenerationParams,
  customConfig?: { endpointUrl: string; apiKey: string }
): Promise<AiBridgeVideoGenerationResponse> {
  // 动态导入避免循环依赖
  const { videoService } = await import('../video.service');
  
  // 委托给专业服务
  return await videoService.generateVideo(params, customConfig);
}
```

### video.service.ts

```typescript
/**
 * 统一的视频生成方法（供 ai-bridge.service 调用）
 */
async generateVideo(
  params: AiBridgeVideoGenerationParams,
  customConfig?: { endpointUrl: string; apiKey: string }
): Promise<AiBridgeVideoGenerationResponse> {
  // 根据参数决定使用哪种生成方式
  if (params.image_url) {
    return await this.generateVideoFromImage(0, options);
  } else {
    return await this.generateVideoFromText(0, options);
  }
}
```

## 📊 接口定义

### AiBridgeVideoGenerationParams

```typescript
interface AiBridgeVideoGenerationParams {
  model: string;           // 模型名称
  prompt: string;          // 提示词
  image_url?: string;      // 首帧图片URL（图生视频）
  duration?: number;       // 视频时长（秒）
  size?: string;           // 分辨率（如 "1280x720"）
  fps?: number;            // 帧率
  quality?: string;        // 质量
  style?: string;          // 风格
}
```

### AiBridgeVideoGenerationResponse

```typescript
interface AiBridgeVideoGenerationResponse {
  created: number;         // 创建时间戳
  data: {
    url?: string;          // 视频URL
    task_id?: string;      // 任务ID
    status?: string;       // 状态
  }[];
  model?: string;          // 使用的模型
}
```

## 🎯 使用示例

### 控制器中的使用

```typescript
import { aiBridgeService } from '../../services/ai/bridge/ai-bridge.service';

// 文生视频
const result = await aiBridgeService.generateVideo({
  model: 'doubao-seedance-1-0-pro-250528',
  prompt: '一个可爱的小朋友在幼儿园里快乐地玩耍',
  duration: 5,
  size: '1280x720',
  fps: 30
});

// 图生视频
const result = await aiBridgeService.generateVideo({
  model: 'doubao-seedance-1-0-pro-250528',
  prompt: '基于这张图片生成动态视频',
  image_url: 'https://example.com/image.jpg',
  duration: 5
});
```

## 🔍 技术细节

### 避免循环依赖

使用动态导入避免循环依赖：

```typescript
// ai-bridge.service.ts 中
const { videoService } = await import('../video.service');
```

### 参数转换

video.service 内部会将 ai-bridge 的参数格式转换为内部格式：

```typescript
const options: VideoGenerationOptions = {
  model: params.model,
  prompt: params.prompt,
  imageUrl: params.image_url,  // 注意：下划线转驼峰
  duration: params.duration,
  // ...
};
```

### 模型选择

video.service 会自动从数据库中选择最佳模型：

1. 如果指定了模型名称，使用指定的模型
2. 否则选择默认模型
3. 如果没有默认模型，选择第一个可用模型

## 📈 扩展性

### 添加新的视频功能

只需在 `video.service.ts` 中添加新方法：

```typescript
// video.service.ts
async generateVideoWithMusic(options: VideoWithMusicOptions) {
  // 实现逻辑
}
```

### 添加新的AI服务

在 `ai-bridge.service.ts` 中添加委托方法：

```typescript
// ai-bridge.service.ts
public async generateMusic(params: MusicParams) {
  const { musicService } = await import('../music.service');
  return await musicService.generate(params);
}
```

## ✅ 测试验证

运行集成测试：

```bash
cd server
npm run build
node scripts/test-video-service-integration.js
```

测试内容：
- ✅ video.service 方法完整性
- ✅ ai-bridge.service 集成正确性
- ✅ 参数格式兼容性
- ✅ 架构设计合理性
- ✅ 数据库配置完整性

## 📝 维护建议

1. **保持 ai-bridge.service 简洁**
   - 只作为入口，不包含复杂逻辑
   - 委托给专业服务处理

2. **video.service 专注视频**
   - 所有视频相关的逻辑都在这里
   - 包括模型选择、参数转换、API调用

3. **统一的类型定义**
   - 使用 ai-bridge.types.ts 中的类型
   - 保持接口一致性

4. **错误处理**
   - 在 video.service 中处理具体错误
   - ai-bridge 只需要传递错误

## 🎉 总结

这个架构设计实现了：

- ✅ 统一的AI服务入口
- ✅ 职责清晰分离
- ✅ 易于维护和扩展
- ✅ 避免文件过大
- ✅ 符合设计原则

**最佳实践**：
- ai-bridge 作为门面，保持简洁
- 专业服务处理具体逻辑
- 使用委托模式连接两者

