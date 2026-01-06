# 测评题目配图生成系统

## 概述

本系统使用 AI 文生图技术为测评题目自动生成配图，所有 AI 调用都通过 **AIBridge 统一接口**，确保用量统计和成本追踪。

## 架构设计

### 数据库结构

```sql
-- assessment_questions 表新增字段
ALTER TABLE assessment_questions ADD imageUrl VARCHAR(500) COMMENT '题目配图URL';
ALTER TABLE assessment_questions ADD imagePrompt TEXT COMMENT 'AI生成图片的提示词';
```

### 技术栈

- **AI 模型**：豆包文生图模型 `doubao-seedream-3-0-t2i-250415`
- **服务层**：`RefactoredMultimodalService` （通过 AIBridge 调用）
- **用量统计**：自动记录到 `ai_model_usage` 表
- **图片存储**：`/uploads/assessment-images/`

## 使用方式

### 1. 批量生成图片（推荐）

适用于首次初始化或批量更新题目配图。

```bash
cd /home/zhgue/localhost:5173/server
npx ts-node src/scripts/generate-assessment-images.ts
```

**功能特点**：
- 自动识别需要配图的题目
- 智能生成图片提示词
- 下载图片到本地存储
- 更新数据库记录
- 用量记录到系统管理员（ID=1）

**执行流程**：
1. 扫描所有题目
2. 识别包含"图片"、"观察"等关键词的题目
3. 根据题目维度、年龄段、内容生成详细提示词
4. 调用 AIBridge 文生图 API
5. 下载图片到本地
6. 更新数据库 imageUrl 字段

### 2. Admin 手动生成

适用于单个题目的图片生成或更新。

**操作步骤**：
1. 登录管理后台
2. 进入"测评中心" → "题目管理"
3. 点击"编辑"按钮
4. 在"题目配图"区域：
   - 输入自定义提示词（可选）
   - 点击"AI生成图片"按钮
   - 等待生成完成
5. 保存题目

**用量统计**：记录到当前登录的管理员账号

### 3. API 调用

```typescript
POST /api/assessment-admin/generate-image
Authorization: Bearer <token>

Request Body:
{
  "prompt": "高质量儿童教育插画，3-4岁幼儿，专注力训练场景...",
  "questionId": 123  // 可选
}

Response:
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/assessment-images/question_123_1738305123456.png",
    "originalUrl": "https://...",
    "prompt": "...",
    "modelUsed": "doubao-seedream-3-0-t2i-250415",
    "selectionReason": "用户指定模型: doubao-seedream-3-0-t2i-250415"
  },
  "message": "图片生成成功"
}
```

## 图片提示词生成策略

系统会根据题目内容自动生成详细的图片提示词：

### 基本结构

```
高质量儿童教育插画 + 年龄段 + 维度场景 + 具体内容 + 风格要求
```

### 维度场景映射

| 维度 | 场景描述 |
|------|---------|
| attention | 专注力训练场景，孩子正在仔细观察和比较 |
| memory | 记忆力训练场景，孩子正在回忆和记住 |
| logic | 逻辑思维训练场景，孩子正在分类和推理 |
| language | 语言能力训练场景，孩子正在表达和沟通 |
| motor | 精细动作训练场景，孩子正在动手操作 |
| social | 社交能力训练场景，孩子正在与他人互动 |

### 内容识别

系统会根据题目文本自动识别并添加相应元素：
- **动物题目**：添加大象、小猫、小鸟、小鱼等
- **水果题目**：添加苹果、香蕉、橙子、葡萄等
- **场景题目**：添加公园、滑梯、秋千等

### 风格要求

所有图片统一使用：
- **风格**：卡通风格
- **色彩**：明亮温暖
- **线条**：简洁清晰
- **背景**：简单不复杂
- **氛围**：安全友好，教育性强

## 用量统计

### 统计表：`ai_model_usage`

所有图片生成都会自动记录：

```sql
SELECT 
  u.username,
  COUNT(*) as generation_count,
  SUM(tokens_output) as total_tokens,
  SUM(cost) as total_cost
FROM ai_model_usage mu
JOIN users u ON mu.external_user_id = u.id
WHERE mu.model_id = (
  SELECT id FROM ai_model_config 
  WHERE name = 'doubao-seedream-3-0-t2i-250415'
)
GROUP BY u.id, u.username;
```

### 统计维度

- **用户级别**：每个用户的图片生成次数
- **模型级别**：文生图模型的总调用量
- **时间维度**：按日期统计生成趋势
- **成本追踪**：计算总成本

## 前端展示

### 家长测评页面

题目会自动显示配图（如果有）：

```vue
<!-- 题目配图 -->
<div v-if="currentQuestion.imageUrl" class="question-image">
  <el-image
    :src="currentQuestion.imageUrl"
    fit="contain"
    style="max-width: 100%; max-height: 400px;"
    :preview-src-list="[currentQuestion.imageUrl]"
  />
</div>

<!-- 题目描述 -->
<div v-if="currentQuestion.content.description" class="question-description">
  <el-alert :closable="false" type="info">
    {{ currentQuestion.content.description }}
  </el-alert>
</div>
```

### Admin 管理页面

题目列表显示配图缩略图：

- 有图片：显示 60x60 缩略图，点击可预览
- 无图片：显示占位图标

题目编辑表单：

- **图片预览**：显示当前图片
- **URL 输入**：手动输入图片 URL
- **AI 生成**：点击按钮自动生成
- **提示词输入**：自定义提示词（可选）
- **删除图片**：清空 imageUrl

## 最佳实践

### 1. 提示词编写

**好的提示词**：
```
高质量儿童教育插画，3-4岁幼儿，专注力训练场景，
画面中有大象、小猫、小鸟、小鱼等动物，大小对比明显，
卡通风格，色彩明亮温暖，线条简洁清晰，
背景简单不复杂，适合幼儿视觉感知，
教育性强，安全友好的画面氛围
```

**避免的提示词**：
- 过于抽象："生成一张图片"
- 过于复杂："包含100个元素的复杂场景"
- 风格不统一："写实风格"、"抽象艺术"

### 2. 批量生成策略

- **首次运行**：为所有题目生成配图
- **增量更新**：只为新题目或需要更新的题目生成
- **错误重试**：脚本会跳过失败的题目，可重新运行

### 3. 图片管理

- **文件命名**：`question_{题目ID}_{时间戳}.png`
- **存储位置**：`/uploads/assessment-images/`
- **URL 格式**：`/uploads/assessment-images/question_123_1738305123456.png`
- **访问方式**：通过 Express static 中间件提供

### 4. 性能优化

- **本地存储**：图片下载到本地，加载速度快
- **CDN 支持**：未来可配置 CDN 加速
- **懒加载**：前端使用 Element Plus 的 Image 组件自动懒加载
- **预览功能**：点击图片可放大查看

## 故障排查

### 问题 1：图片生成失败

**可能原因**：
- AI 模型未配置或未激活
- 网络连接问题
- 提示词不合规

**解决方案**：
1. 检查 `ai_model_config` 表中是否有 `doubao-seedream-3-0-t2i-250415` 模型
2. 确认模型状态为 `active`
3. 检查网络连接和 API 配置
4. 修改提示词，避免敏感内容

### 问题 2：图片无法显示

**可能原因**：
- 图片路径错误
- uploads 目录权限问题
- 静态文件服务未配置

**解决方案**：
1. 检查 `/uploads/assessment-images/` 目录是否存在
2. 确认文件权限正确（755）
3. 检查 Express 静态文件中间件配置

### 问题 3：用量未统计

**可能原因**：
- 使用了错误的服务（如 AutoImageGenerationService）
- userId 未传递

**解决方案**：
1. 确保使用 `RefactoredMultimodalService`
2. 传递正确的 userId
3. 检查 `ai_model_usage` 表

## 扩展功能

### 支持更多图片风格

修改生成脚本，添加风格参数：

```typescript
const result = await multimodalService.generateImage(userId, {
  model: 'doubao-seedream-3-0-t2i-250415',
  prompt: imagePrompt,
  style: 'realistic', // 'natural' | 'cartoon' | 'realistic' | 'artistic'
  ...
});
```

### 批量重新生成

为已有图片的题目重新生成：

```typescript
// 修改脚本中的判断逻辑
if (question.imageUrl && !forceRegenerate) {
  console.log(`⏭️  题目 ${question.id} 已有图片，跳过`);
  return;
}
```

### CDN 集成

配置 CDN 前缀：

```typescript
const CDN_PREFIX = process.env.CDN_URL || '';
const publicUrl = CDN_PREFIX + localImageUrl;
```

## 总结

本系统通过 AIBridge 统一接口实现了：
- ✅ 自动化图片生成
- ✅ 完整的用量统计
- ✅ 用户级别追踪
- ✅ 灵活的管理界面
- ✅ 优秀的用户体验

所有图片生成操作都会被记录，方便成本控制和数据分析。





