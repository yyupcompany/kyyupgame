# 图片资源OSS迁移使用指南

## 概述

本文档介绍如何使用新的图片管理系统和OSS迁移工具，将项目中的本地图片资源统一管理并迁移到阿里云OSS。

## 🎯 目标

- 统一管理所有图片资源
- 支持本地开发和OSS生产环境无缝切换
- 提供便捷的批量迁移工具
- 优化图片加载性能

## 📋 前置要求

1. **阿里云OSS配置**
   - 创建OSS Bucket
   - 获取AccessKey ID和AccessKey Secret
   - 配置跨域访问规则

2. **环境变量配置**
   ```bash
   # 服务端配置
   OSS_REGION=oss-cn-hangzhou
   OSS_ACCESS_KEY_ID=your_access_key_id
   OSS_ACCESS_KEY_SECRET=your_access_key_secret
   OSS_BUCKET=kyyup-oss

   # 客户端配置
   VITE_APP_USE_OSS=true
   VITE_APP_OSS_BASE_URL=https://kyyup-oss.oss-cn-hangzhou.aliyuncs.com
   ```

## 🛠️ 工具介绍

### 1. 图片管理工具类 (`image-loader.ts`)

**位置**: `client/src/utils/image-loader.ts`

**功能特性**:
- ✅ 统一的图片路径管理
- ✅ 自动本地/OSS环境切换
- ✅ 图片缓存和预加载
- ✅ 多种图片格式支持
- ✅ Vue插件集成

**基本用法**:

```typescript
import imageLoader from '@/utils/image-loader'

// 简单使用
const imageUrl = imageLoader.getImageUrl('activity-1.jpg')

// 指定分类
const gameImage = imageLoader.getGameImage('puzzle.png')
const activityImage = imageLoader.getActivityImage('outdoor.jpg')
const avatarImage = imageLoader.getAvatarImage('default.png')

// 高级配置
const imageUrl = imageLoader.getImageUrl({
  id: 'custom-image',
  category: 'game',
  filename: 'custom.png',
  forceOSS: true,
  customUrl: 'https://example.com/image.jpg'
})
```

**Vue组件中使用**:

```vue
<template>
  <el-image :src="gameImageUrl" />
  <img :src="activityImage" alt="活动图片">
</template>

<script setup>
import imageLoader from '@/utils/image-loader'

const gameImageUrl = imageLoader.getGameImage('memory-game.jpg')
const activityImage = imageLoader.getActivityImage('autumn-activity.jpg')
</script>
```

### 2. 批量迁移脚本 (`migrate-to-oss.js`)

**位置**: `server/scripts/migrate-to-oss.js`

**功能特性**:
- ✅ 递归扫描本地图片目录
- ✅ 批量上传到OSS
- ✅ 跳过已存在文件
- ✅ 生成详细的迁移报告
- ✅ 创建图片路径映射文件

**使用方法**:

```bash
# 1. 配置环境变量
export OSS_ACCESS_KEY_ID=your_access_key_id
export OSS_ACCESS_KEY_SECRET=your_access_key_secret
export OSS_BUCKET=kyyup-oss

# 2. 运行迁移脚本
cd server
node scripts/migrate-to-oss.js
```

**支持的目录结构**:
```
src/assets/images/
├── games/          # 游戏图片
├── activities/     # 活动图片
├── avatars/        # 头像图片
├── icons/          # 图标图片
├── backgrounds/    # 背景图片
└── uploads/        # 上传图片
```

## 📝 迁移步骤

### 第一步：安装依赖

```bash
# 安装OSS SDK
npm install ali-oss

# 安装颜色输出工具
npm install colors
```

### 第二步：配置环境变量

**服务端配置** (`.env`):
```bash
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=kyyup-oss
```

**客户端配置** (`.env`):
```bash
VITE_APP_USE_OSS=true
VITE_APP_OSS_BASE_URL=https://kyyup-oss.oss-cn-hangzhou.aliyuncs.com
VITE_APP_LOCAL_BASE_URL=/src/assets/images
VITE_APP_IMAGE_QUALITY=80
```

### 第三步：运行迁移脚本

```bash
cd server
node scripts/migrate-to-oss.js
```

迁移完成后会生成：
- `image-oss-map.json` - 图片路径映射文件
- `oss-migration-report-{timestamp}.json` - 详细迁移报告

### 第四步：更新代码引用

**替换硬编码路径**:

```typescript
// 旧代码
const image = '/src/assets/images/games/puzzle.png'

// 新代码
const image = imageLoader.getGameImage('puzzle.png')
```

**批量替换建议**:
1. 搜索项目中所有 `require('@/assets/images/')` 引用
2. 搜索项目中所有 `/src/assets/images/` 路径
3. 使用对应的 `imageLoader` 方法替换

## 🔧 配置选项

### 图片管理工具配置

```typescript
import { ImageLoaderPlugin } from '@/utils/image-loader'

// Vue应用中全局配置
app.use(ImageLoaderPlugin, {
  useOSS: true,
  ossBaseUrl: 'https://your-bucket.oss-region.aliyuncs.com',
  localBaseUrl: '/src/assets/images',
  quality: 80,
  imageProcess: 'image/resize,w_200,h_200'
})
```

### OSS上传配置

```javascript
const uploadConfig = {
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'kyyup-oss',
  // 自定义上传配置
  timeout: 60000, // 上传超时时间
  retry: 3,       // 重试次数
  partSize: 1024 * 1024, // 分片大小
}
```

## 📊 最佳实践

### 1. 图片命名规范

```
格式：{category}-{name}-{size}.{ext}
示例：
- game-memory-card-256.png
- activity-autumn-outdoor.jpg
- avatar-default-128.png
```

### 2. 目录组织

```
src/assets/images/
├── games/
│   ├── cognitive/
│   ├── motor/
│   └── language/
├── activities/
│   ├── outdoor/
│   ├── indoor/
│   └── festival/
└── ...
```

### 3. 图片优化

- 使用WebP格式减少文件大小
- 提供多种尺寸版本
- 使用OSS图片处理服务

### 4. 缓存策略

```typescript
// 配置合理的缓存时间
const imageConfig = {
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    maxSize: 100 // 最大缓存数量
  }
}
```

## 🐛 常见问题

### Q1: 图片上传失败

**原因**: OSS配置错误或网络问题
**解决**: 检查AccessKey配置和网络连接

### Q2: 本地开发时图片不显示

**原因**: 使用了OSS路径但本地文件不存在
**解决**: 设置 `VITE_APP_USE_OSS=false` 或确保本地有对应文件

### Q3: 图片加载慢

**原因**: 图片过大或OSS响应慢
**解决**: 使用图片压缩和CDN加速

### Q4: 生产环境显示本地路径

**原因**: 环境变量配置错误
**解决**: 检查 `VITE_APP_USE_OSS` 设置

## 📈 性能优化建议

1. **图片懒加载**
2. **WebP格式支持**
3. **响应式图片**
4. **CDN加速**
5. **图片预加载**

## 🔄 版本更新

### v1.0.0 (2025-12-12)
- ✅ 初始版本发布
- ✅ 基础图片管理功能
- ✅ OSS批量迁移工具
- ✅ 环境变量配置支持

---

## 📞 技术支持

如有问题，请联系开发团队或查看项目Wiki页面获取更多信息。