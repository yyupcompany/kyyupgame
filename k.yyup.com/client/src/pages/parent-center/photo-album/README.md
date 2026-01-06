# 相册中心功能说明

## ✨ 已实现功能

### 1. 双视图模式
- **相册视图**: 以相册为单位展示，显示相册封面、标题、描述和照片数量
- **时间轴视图**: 按时间顺序展示所有照片，支持按日期分组（今天、昨天、月份）

### 2. 核心功能
- ✅ 相册列表展示
- ✅ 照片时间轴展示
- ✅ 相册筛选（下拉选择）
- ✅ 照片上传对话框（包含相册选择、描述、拍摄时间、文件上传）
- ✅ 照片预览（点击查看大图和详细信息）
- ✅ 统计信息展示（总照片数、相册数、收藏照片数）

### 3. 用户体验
- 响应式设计，支持移动端和桌面端
- 美观的卡片布局和时间轴组件
- 图片加载错误时自动使用默认占位图
- 悬停效果和过渡动画

## 📊 当前状态

### 数据源
目前使用 **模拟数据** 展示功能，包含6张示例照片：
- 春游活动（2024-11-15）
- 课堂活动（2024-11-14）
- 运动会、午餐时光（2024-11-10）
- 手工制作、户外游戏（2024-11-08）

### API集成状态
- ✅ `photoAlbumAPI.getAlbums()` - 已对接，查询相册列表
- ✅ `photoAlbumAPI.getAlbumStats()` - 已对接，查询统计信息
- ⏳ `photoAlbumAPI.getPhotos()` - 待实现，目前使用模拟数据
- ⏳ `photoAlbumAPI.uploadPhoto()` - 待实现

## 🔧 技术实现

### 图标尺寸
所有图标已修复为使用具体数值而非CSS变量：
- 页面标题: 32px
- 按钮图标: 16px
- 小图标: 14px
- 预览图标: 24px
- 上传图标: 48px

### 时间轴数据处理
```typescript
// 照片按拍摄时间分组
const timelineData = computed(() => {
  // 按日期分组
  // 排序（最新在前）
  // 智能日期标题（今天、昨天、月份）
})
```

### 文件结构
```
client/src/pages/parent-center/photo-album/
├── index.vue          # 主组件（540+ 行）
└── README.md          # 本文档
```

## 📝 待办事项

### 高优先级
1. **实现真实照片API**
   - 创建 `server/src/controllers/photo.controller.ts`
   - 添加照片查询接口
   - 支持按相册ID、日期范围筛选

2. **实现照片上传功能**
   - 集成阿里云OSS
   - 生成签名URL
   - 支持批量上传

3. **照片数据库查询优化**
   - 数据库中有10张照片，需要正确查询
   - 关联相册信息
   - 处理签名URL生成

### 中优先级
4. 照片收藏功能
5. 照片下载功能
6. 照片分享功能
7. 相册管理（创建、编辑、删除）

### 低优先级
8. 照片标签和分类
9. 人脸识别（已有阿里云Face Body API配置）
10. 照片批量操作

## 🐛 已知问题

### 浏览器控制台警告
以下错误可以安全忽略（Cursor开发工具相关，不影响功能）：
```
POST http://localhost:33405/register-iframe 403 (Forbidden)
[BrowserAutomation] Registered with MCP server: {error: 'Forbidden: Tab ID already registered'}
```

### 数据显示
- 当前相册列表为空（数据库 `photo_albums` 表无数据）
- 时间轴使用模拟数据展示功能
- 统计信息显示全部为0（待真实API对接）

## 🔗 相关文件

### 前端
- API定义: `client/src/api/modules/photo-album.ts`
- 组件: `client/src/pages/parent-center/photo-album/index.vue`
- 图标组件: `client/src/components/icons/UnifiedIcon.vue`

### 后端
- 控制器: `server/src/controllers/photo-album.controller.ts`
- 路由: `server/src/routes/center-fixes.routes.ts`
- OSS服务: `server/src/services/system-oss.service.ts`
- 人脸识别: `server/src/services/aliyun-face.service.ts`

### 数据库
- 相册表: `photo_albums`
- 照片表: `photos`

## 📚 使用指南

### 切换视图
1. 点击顶部"相册视图"按钮 - 查看相册列表
2. 点击顶部"时间轴"按钮 - 查看照片时间线

### 上传照片
1. 点击"上传照片"按钮
2. 选择目标相册（必填）
3. 添加照片描述（可选）
4. 选择拍摄时间（可选）
5. 拖拽或点击选择照片文件
6. 点击"开始上传"

### 查看照片详情
在时间轴视图中，点击任意照片即可查看大图和详细信息

### 筛选照片
使用顶部的"选择相册"下拉菜单，可以按相册筛选时间轴中的照片

