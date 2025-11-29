# 租户OSS路由服务使用示例

## 📋 概述

`tenantOSS` 服务提供了统一的租户OSS路由功能，自动根据文件类型选择正确的OSS存储：
- **照片/相册** → 上海OSS（faceshanghaikarden）- 带人脸识别
- **其他文件** → 广东OSS（systemkarder） - 系统资源

## 🚀 快速开始

### 1. 导入服务

```typescript
import { tenantOSS } from '../services/tenant-oss-router.service';
```

### 2. 使用示例

#### 上传照片（自动路由到上海OSS）

```typescript
// 上传班级照片
const photoResult = await tenantOSS.uploadPhoto(req, imageBuffer, {
  filename: 'class-photo.jpg',
  fileType: 'photos',
  subPath: '2024-01',
  generateThumbnail: true
});

console.log('照片上传成功:', photoResult);
// {
//   url: "https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/15900001234/photos/2024-01/xxx.jpg",
//   thumbnailUrl: "https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/15900001234/photos/2024-01/thumbnails/xxx_thumb.jpg",
//   bucket: "faceshanghaikarden",
//   region: "oss-cn-shanghai"
// }
```

#### 上传文件（自动路由到广东OSS）

```typescript
// 上传Logo文件
const logoResult = await tenantOSS.uploadFile(req, fileBuffer, {
  filename: 'kindergarten-logo.png',
  directory: 'logos',
  contentType: 'image/png'
});

console.log('Logo上传成功:', logoResult);
// {
//   url: "https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/rent/15900001234/files/logos/xxx.png",
//   bucket: "systemkarder",
//   region: "oss-cn-guangzhou"
// }

// 上传文档
const docResult = await tenantOSS.uploadFile(req, docBuffer, {
  filename: 'school-regulations.pdf',
  directory: 'documents',
  contentType: 'application/pdf'
});
```

#### 获取临时访问URL

```typescript
// 获取照片临时URL（带权限验证）
const photoUrl = tenantOSS.getTenantFileUrl(req,
  'kindergarten/rent/15900001234/photos/2024-01/class-photo.jpg',
  60 // 60分钟有效期
);

// 获取文档临时URL
const docUrl = tenantOSS.getTenantFileUrl(req,
  'kindergarten/rent/15900001234/files/documents/regulations.pdf',
  30 // 30分钟有效期
);
```

#### 删除文件

```typescript
// 删除单个文件
await tenantOSS.deleteTenantFile(req,
  'kindergarten/rent/15900001234/photos/2024-01/old-photo.jpg'
);

// 批量删除文件
await tenantOSS.deleteTenantFiles(req, [
  'kindergarten/rent/15900001234/photos/2024-01/photo1.jpg',
  'kindergarten/rent/15900001234/files/logos/old-logo.png',
  'kindergarten/rent/15900001234/files/documents/old-doc.pdf'
]);
```

## 🏗️ 目录结构

### 上海OSS (faceshanghaikarden) - 照片/相册
```
kindergarten/
└── rent/
    └── {phone}/              # 租户手机号
        ├── photos/           # 班级照片
        │   └── 2024-01/     # 按月份分组
        ├── students/         # 学生照片
        └── albums/           # 相册封面
```

### 广东OSS (systemkarder) - 其他文件
```
kindergarten/
└── rent/
    └── {phone}/              # 租户手机号
        ├── files/
        │   ├── logos/       # Logo文件
        │   ├── documents/   # 文档
        │   └── user-uploads/ # 用户上传
```

## 🔒 安全特性

### 1. 租户隔离
- 每个租户只能访问自己的文件
- 自动验证文件路径权限
- 防止跨租户数据泄露

### 2. 权限验证
```typescript
// ❌ 尝试访问其他租户文件会被拒绝
try {
  await tenantOSS.deleteTenantFile(req,
    'kindergarten/rent/15900009999/files/their-file.pdf' // 其他租户
  );
} catch (error) {
  console.error('访问被拒绝:', error.message);
  // "无权删除其他租户的文件"
}
```

### 3. 自动路由
- 开发者无需手动选择OSS
- 根据文件类型自动选择存储位置
- 简化代码，减少错误

## 🎯 优势对比

### 使用前（手动方式）
```typescript
// ❌ 复杂的旧方式
import { ossService } from './oss.service';
import { systemOSSService } from './system-oss.service';

const phoneNumber = req.tenant?.phone;

// 需要手动选择OSS
if (isPhoto) {
  const result = await ossService.uploadTenantImage(buffer, phoneNumber, {
    filename: 'photo.jpg',
    fileType: 'photos'
  });
} else {
  const result = await systemOSSService.uploadFile(buffer, {
    filename: 'file.pdf',
    directory: `rent/${phoneNumber}/documents`
  });
}
```

### 使用后（统一方式）
```typescript
// ✅ 简化的新方式
import { tenantOSS } from './tenant-oss-router.service';

// 自动路由，无需手动选择OSS
const photoResult = await tenantOSS.uploadPhoto(req, buffer, {
  filename: 'photo.jpg'
});

const fileResult = await tenantOSS.uploadFile(req, buffer, {
  filename: 'file.pdf',
  directory: 'documents'
});
```

## 🔧 配置要求

### 环境变量
```bash
# 上海OSS（照片/相册）
OSS_ACCESS_KEY_ID=your_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=faceshanghaikarden
OSS_REGION=oss-cn-shanghai

# 广东OSS（系统资源）
SYSTEM_OSS_ACCESS_KEY_ID=your_key
SYSTEM_OSS_ACCESS_KEY_SECRET=your_secret
SYSTEM_OSS_BUCKET=systemkarder
SYSTEM_OSS_REGION=oss-cn-guangzhou
```

### 租户中间件
确保请求经过租户识别中间件，`req.tenant` 对象包含：
```typescript
{
  phone: string,      // 租户手机号
  code: string,       // 租户代码
  region: string      // 租户区域
}
```

## 📊 实际应用场景

### 1. 幼儿园Logo上传
```typescript
// 自动上传到广东OSS的logos目录
const result = await tenantOSS.uploadFile(req, logoBuffer, {
  filename: 'kindergarten-logo.png',
  directory: 'logos'
});
```

### 2. 班级相册管理
```typescript
// 自动上传到上海OSS的photos目录
const result = await tenantOSS.uploadPhoto(req, photoBuffer, {
  filename: 'class-photo.jpg',
  fileType: 'photos',
  subPath: new Date().toISOString().slice(0, 7), // 按月份分组
  generateThumbnail: true
});
```

### 3. 教育资源上传
```typescript
// 自动上传到广东OSS的documents目录
const result = await tenantOSS.uploadFile(req, docBuffer, {
  filename: 'teaching-plan.pdf',
  directory: 'documents'
});
```

## 🚀 注意事项

1. **租户依赖**: 使用前确保 `req.tenant` 已正确设置
2. **文件大小**: 建议单文件不超过10MB
3. **权限检查**: 所有操作都会验证租户权限
4. **自动压缩**: 照片上传时会自动压缩优化
5. **缩略图**: 照片可选择生成缩略图

---

通过统一的 `tenantOSS` 服务，开发者可以更简洁、安全地处理多租户文件存储，无需关心底层的OSS选择和权限验证。