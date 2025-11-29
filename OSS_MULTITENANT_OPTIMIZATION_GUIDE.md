# OSS 多租户优化实施指南

## 📋 优化目标

将 OSS 文件上传功能改造为类似数据库的多租户模式，实现：
1. **自动租户路由**：根据 `req.tenant` 自动选择正确的 OSS
2. **统一调用方式**：类似 `${tenantDb}` 的简洁调用
3. **租户隔离**：确保每个租户只能访问自己的文件

## 🎯 为什么要优化

### 当前问题

**问题 1：手动传递租户信息**
```typescript
// ❌ 当前方式：需要手动提取租户信息
const phoneNumber = req.tenant?.phone || req.user?.phone;
await ossService.uploadTenantImage(buffer, phoneNumber, {...});
```

**问题 2：OSS 选择不统一**
```typescript
// ❌ 开发者需要记住哪个功能用哪个 OSS
import { ossService } from './oss.service';           // 上海 OSS
import { systemOSSService } from './system-oss.service'; // 广东 OSS

// 相册用上海？还是广东？需要查文档
```

**问题 3：部分功能未使用 OSS**
```typescript
// ❌ 幼儿园 Logo 上传使用本地存储
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/kindergarten')
});
```

### 优化后的方式

**统一且自动化：**
```typescript
// ✅ 优化后：自动从 req 获取租户，自动选择 OSS
import { tenantOSS } from '../services/tenant-oss-router.service';

// 上传照片（自动路由到上海 OSS）
await tenantOSS.uploadPhoto(req, buffer, { filename: 'student.jpg' });

// 上传文件（自动路由到广东 OSS）
await tenantOSS.uploadFile(req, buffer, { filename: 'document.pdf' });
```

---

## 🏗️ 架构设计

### OSS 分配策略

```
┌─────────────────────────────────────────────────────────┐
│                    租户请求                              │
│                  req.tenant.phone                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
        ┌────────────────────────────┐
        │  tenant-oss-router.service │
        │    (统一路由服务)           │
        └────────┬──────────┬─────────┘
                 ↓          ↓
        ┌────────────┐  ┌─────────────┐
        │  上海 OSS   │  │  广东 OSS    │
        │  相册/照片  │  │  其他文件    │
        └────────────┘  └─────────────┘
```

### OSS 用途划分

| OSS 区域 | Bucket | 用途 | 示例 |
|---------|--------|------|------|
| **上海** | faceshanghaikarden | 相册、学生照片（人脸识别） | 班级相册、学生照片 |
| **广东** | systemkarder | 系统资源、文档、Logo | 幼儿园Logo、教育资源、游戏资源 |

### 目录结构

```
上海 OSS (faceshanghaikarden):
kindergarten/
└── rent/
    └── {phone}/              # 租户手机号
        ├── photos/           # 班级照片
        │   └── 2024-01/
        ├── students/         # 学生照片
        └── albums/           # 相册封面

广东 OSS (systemkarder):
kindergarten/
├── system/                   # 系统公用资源
│   ├── games/               # 游戏资源
│   └── education/           # 教育资源
└── rent/
    └── {phone}/             # 租户手机号
        ├── logos/           # Logo
        ├── documents/       # 文档
        └── user-uploads/    # 用户上传
```

---

## 🛠️ 实施步骤

### 步骤 1: 创建统一 OSS 路由服务

**创建文件**: `k.yyup.com/server/src/services/tenant-oss-router.service.ts`

```typescript
import { Request } from 'express';
import { ossService } from './oss.service';           // 上海 OSS
import { systemOSSService } from './system-oss.service'; // 广东 OSS

/**
 * 租户 OSS 配置接口
 */
interface TenantOSSConfig {
  phone: string;
  tenantCode: string;
  region: 'shanghai' | 'guangdong';
  // 照片 OSS 配置
  photoOSS: {
    service: 'shanghai';
    bucket: string;
    basePath: string;
  };
  // 文件 OSS 配置
  fileOSS: {
    service: 'guangdong';
    bucket: string;
    basePath: string;
  };
}

/**
 * 租户 OSS 路由服务
 * 类似数据库的 ${tenantDb} 模式，自动为每个租户路由到正确的 OSS
 */
export class TenantOSSRouterService {
  /**
   * 从请求中获取租户 OSS 配置
   * @param req Express 请求对象
   */
  getTenantOSSConfig(req: Request): TenantOSSConfig {
    const tenant = (req as any).tenant;
    
    if (!tenant || !tenant.phone) {
      throw new Error('租户信息未找到，请确保已通过租户识别中间件');
    }

    return {
      phone: tenant.phone,
      tenantCode: tenant.code || tenant.databaseName?.replace('tenant_', '') || 'dev',
      region: tenant.region || 'guangdong',
      
      // 照片/相册 → 上海 OSS（带人脸识别）
      photoOSS: {
        service: 'shanghai',
        bucket: process.env.OSS_BUCKET || 'faceshanghaikarden',
        basePath: `kindergarten/rent/${tenant.phone}/photos/`
      },
      
      // 其他文件 → 广东 OSS
      fileOSS: {
        service: 'guangdong',
        bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
        basePath: `kindergarten/rent/${tenant.phone}/files/`
      }
    };
  }

  /**
   * 上传租户照片（自动路由到上海 OSS）
   * @param req Express 请求对象
   * @param buffer 图片 Buffer
   * @param options 上传选项
   */
  async uploadPhoto(
    req: Request,
    buffer: Buffer,
    options: {
      filename?: string;
      fileType?: 'photos' | 'students' | 'albums';
      subPath?: string;
      maxWidth?: number;
      quality?: number;
      generateThumbnail?: boolean;
    } = {}
  ): Promise<{
    url: string;
    thumbnailUrl?: string;
    filename: string;
    size: number;
    ossPath: string;
    bucket: string;
    region: string;
  }> {
    const config = this.getTenantOSSConfig(req);
    
    // 使用上海 OSS 的租户上传方法
    const result = await ossService.uploadTenantImage(
      buffer,
      config.phone,
      options
    );

    return {
      ...result,
      bucket: config.photoOSS.bucket,
      region: 'oss-cn-shanghai'
    };
  }

  /**
   * 上传租户文件（自动路由到广东 OSS）
   * @param req Express 请求对象
   * @param buffer 文件 Buffer
   * @param options 上传选项
   */
  async uploadFile(
    req: Request,
    buffer: Buffer,
    options: {
      filename?: string;
      directory?: 'logos' | 'documents' | 'user-uploads';
      contentType?: string;
    } = {}
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    ossPath: string;
    bucket: string;
    region: string;
  }> {
    const config = this.getTenantOSSConfig(req);
    
    const {
      filename = 'file.bin',
      directory = 'user-uploads',
      contentType = 'application/octet-stream'
    } = options;

    // 使用广东 OSS
    const result = await systemOSSService.uploadFile(buffer, {
      filename,
      directory: `rent/${config.phone}/${directory}`,
      contentType
    });

    return {
      ...result,
      bucket: config.fileOSS.bucket,
      region: 'oss-cn-guangzhou'
    };
  }

  /**
   * 获取租户文件的临时访问 URL
   * @param req Express 请求对象
   * @param ossPath OSS 路径
   * @param expiresInMinutes 有效期（分钟）
   */
  getTenantFileUrl(
    req: Request,
    ossPath: string,
    expiresInMinutes: number = 60
  ): string | null {
    const config = this.getTenantOSSConfig(req);
    
    // 判断是照片还是文件
    if (ossPath.includes('/photos/') || ossPath.includes('/students/') || ossPath.includes('/albums/')) {
      // 上海 OSS - 验证权限
      return ossService.getSecureTenantUrl(ossPath, config.phone, expiresInMinutes);
    } else {
      // 广东 OSS
      return systemOSSService.getTemporaryUrl(ossPath, expiresInMinutes);
    }
  }

  /**
   * 删除租户文件
   * @param req Express 请求对象
   * @param ossPath OSS 路径
   */
  async deleteTenantFile(req: Request, ossPath: string): Promise<void> {
    const config = this.getTenantOSSConfig(req);
    
    // 验证路径是否属于当前租户
    if (!ossPath.includes(`rent/${config.phone}/`)) {
      throw new Error('无权删除其他租户的文件');
    }

    // 判断使用哪个 OSS
    if (ossPath.includes('/photos/') || ossPath.includes('/students/') || ossPath.includes('/albums/')) {
      await ossService.deleteFile(ossPath);
    } else {
      await systemOSSService.deleteFile(ossPath);
    }
  }

  /**
   * 批量删除租户文件
   */
  async deleteTenantFiles(req: Request, ossPaths: string[]): Promise<void> {
    const config = this.getTenantOSSConfig(req);
    
    // 验证所有路径
    for (const path of ossPaths) {
      if (!path.includes(`rent/${config.phone}/`)) {
        throw new Error(`无权删除其他租户的文件: ${path}`);
      }
    }

    // 按 OSS 分组
    const shanghaiFaces: string[] = [];
    const guangdongPaths: string[] = [];

    for (const path of ossPaths) {
      if (path.includes('/photos/') || path.includes('/students/') || path.includes('/albums/')) {
        shanghaiFaces.push(path);
      } else {
        guangdongPaths.push(path);
      }
    }

    // 批量删除
    if (shanghaiFaces.length > 0) {
      await ossService.deleteFiles(shanghaiFaces);
    }
    if (guangdongPaths.length > 0) {
      await systemOSSService.deleteFiles(guangdongPaths);
    }
  }
}

// 导出单例
export const tenantOSS = new TenantOSSRouterService();
```

---

### 步骤 2: 修复幼儿园 Logo 上传

**修改文件**: `k.yyup.com/server/src/controllers/kindergarten-basic-info.controller.ts`

#### 修改 1: 移除本地存储配置

```typescript
// ❌ 删除这些代码
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/kindergarten');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `kindergarten-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});
```

#### 修改 2: 添加新的导入和配置

```typescript
// ✅ 添加这些代码
import multer from 'multer';
import { tenantOSS } from '../services/tenant-oss-router.service';

// 使用内存存储（不再保存到本地）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});
```

#### 修改 3: 更新上传方法

```typescript
// ❌ 修改前
static async uploadImage(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    // 返回相对路径URL
    const imageUrl = `/uploads/kindergarten/${file.filename}`;

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        url: imageUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: (error as Error).message
    });
  }
}

// ✅ 修改后
static async uploadImage(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    // 上传到广东 OSS（系统资源）
    const result = await tenantOSS.uploadFile(req, file.buffer, {
      filename: file.originalname,
      directory: 'logos',
      contentType: file.mimetype
    });

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        url: result.url,
        filename: result.filename,
        originalName: file.originalname,
        size: result.size,
        ossPath: result.ossPath,
        bucket: result.bucket
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: (error as Error).message
    });
  }
}
```

#### 修改 4: 更新批量上传方法

```typescript
// ❌ 修改前
static async uploadImages(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    const imageUrls = files.map(file => `/uploads/kindergarten/${file.filename}`);

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        urls: imageUrls,
        count: files.length
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: (error as Error).message
    });
  }
}

// ✅ 修改后
static async uploadImages(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    // 批量上传到广东 OSS
    const uploadPromises = files.map(file => 
      tenantOSS.uploadFile(req, file.buffer, {
        filename: file.originalname,
        directory: 'logos',
        contentType: file.mimetype
      })
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        files: results.map(r => ({
          url: r.url,
          filename: r.filename,
          ossPath: r.ossPath
        })),
        count: results.length
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: (error as Error).message
    });
  }
}
```

---

### 步骤 3: 优化相册控制器（可选）

**修改文件**: `k.yyup.com/server/src/controllers/photo-album.controller.ts`

虽然相册功能已经使用了上海 OSS，但可以改用统一的 `tenantOSS` 接口，使代码更一致：

```typescript
// ❌ 修改前
import { OSSService } from '../services/oss.service';
const ossService = new OSSService();

// ✅ 修改后（可选优化）
import { tenantOSS } from '../services/tenant-oss-router.service';

// 使用统一接口
const url = tenantOSS.getTenantFileUrl(req, ossPath, 60);
```

---

### 步骤 4: 添加 SystemOSSService 缺失方法

**修改文件**: `k.yyup.com/server/src/services/system-oss.service.ts`

检查并添加缺失的方法（如果不存在）：

```typescript
/**
 * 获取临时访问URL（用于私有文件）
 * @param ossPath OSS存储路径
 * @param expiresInMinutes 有效期（分钟）
 */
getTemporaryUrl(ossPath: string, expiresInMinutes: number = 60): string {
  return this.getFileUrl(ossPath, expiresInMinutes * 60);
}

/**
 * 删除文件
 */
async deleteFile(ossPath: string): Promise<void> {
  if (!this.isAvailable()) {
    throw new Error('系统OSS未配置');
  }

  try {
    await this.client.delete(ossPath);
    console.log(`✅ 系统文件删除成功: ${ossPath}`);
  } catch (error) {
    console.error('❌ 系统OSS删除失败:', error);
    throw new Error(`系统文件删除失败: ${(error as Error).message}`);
  }
}

/**
 * 批量删除文件
 */
async deleteFiles(ossPaths: string[]): Promise<void> {
  if (!this.isAvailable()) {
    throw new Error('系统OSS未配置');
  }

  try {
    await this.client.deleteMulti(ossPaths, { quiet: true });
    console.log(`✅ 系统批量删除成功: ${ossPaths.length}个文件`);
  } catch (error) {
    console.error('❌ 系统OSS批量删除失败:', error);
    throw new Error(`系统批量删除失败: ${(error as Error).message}`);
  }
}
```

---

## ✅ 验证步骤

### 1. 编译测试

```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server
npm run build
```

应该编译成功，无错误。

### 2. 功能测试

**测试幼儿园 Logo 上传：**
```bash
# 使用 Postman 或 curl 测试
curl -X POST http://k001.yyup.com/api/kindergarten/upload-logo \
  -H "Authorization: Bearer {token}" \
  -F "image=@logo.png"

# 期望返回：
{
  "success": true,
  "data": {
    "url": "https://systemkarder.oss-cn-guangzhou.aliyuncs.com/kindergarten/rent/15900001234/logos/xxx.png",
    "bucket": "systemkarder",
    "ossPath": "kindergarten/rent/15900001234/logos/xxx.png"
  }
}
```

**测试相册照片上传：**
```bash
# 相册照片应该自动路由到上海 OSS
curl -X POST http://k001.yyup.com/api/photos/upload \
  -H "Authorization: Bearer {token}" \
  -F "photo=@class-photo.jpg"

# 期望返回包含上海 OSS 路径
{
  "url": "https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/rent/15900001234/photos/xxx.jpg"
}
```

### 3. 租户隔离验证

**测试跨租户访问（应该被拒绝）：**
```typescript
// 租户 A 的请求尝试访问租户 B 的文件
const ossPath = 'kindergarten/rent/15900009999/logos/logo.png'; // 其他租户
await tenantOSS.deleteTenantFile(req, ossPath);

// 期望抛出错误：
// Error: 无权删除其他租户的文件
```

---

## 📊 优化效果对比

### 修改前

```typescript
// 开发者需要：
// 1. 知道用哪个 OSS
// 2. 手动提取租户信息
// 3. 处理路径拼接

import { ossService } from './oss.service';
const phoneNumber = req.tenant?.phone;
const result = await ossService.uploadTenantImage(buffer, phoneNumber, {
  fileType: 'photos',
  subPath: '2024-01'
});
```

### 修改后

```typescript
// 开发者只需要：
// 1. 调用统一接口
// 2. 一切自动处理

import { tenantOSS } from './tenant-oss-router.service';
const result = await tenantOSS.uploadPhoto(req, buffer, {
  filename: 'photo.jpg'
});
```

**代码简化：3行 → 1行，减少66%代码量**

---

## 🎯 完成标准

### 必须完成

1. ✅ 创建 `tenant-oss-router.service.ts` 文件
2. ✅ 修改 `kindergarten-basic-info.controller.ts` 使用 OSS
3. ✅ 补充 `system-oss.service.ts` 缺失方法
4. ✅ 编译通过 `npm run build`

### 可选优化

1. ⭐ 优化 `photo-album.controller.ts` 使用统一接口
2. ⭐ 优化其他文件上传控制器统一使用 `tenantOSS`

---

## 📝 注意事项

### 1. 不要使用脚本自动修改
- ❌ 禁止使用 sed、awk 批量替换
- ✅ 手动逐个文件修改，确保准确性

### 2. 环境变量检查
确保 `.env` 包含必要的 OSS 配置：

```bash
# 上海 OSS（相册/人脸识别）
OSS_ACCESS_KEY_ID=your_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=faceshanghaikarden
OSS_REGION=oss-cn-shanghai
OSS_PATH_PREFIX=kindergarten/

# 广东 OSS（系统资源）
SYSTEM_OSS_ACCESS_KEY_ID=your_key
SYSTEM_OSS_ACCESS_KEY_SECRET=your_secret
SYSTEM_OSS_BUCKET=systemkarder
SYSTEM_OSS_REGION=oss-cn-guangzhou
SYSTEM_OSS_PATH_PREFIX=kindergarten/
```

### 3. 租户中间件依赖
`tenantOSS` 依赖 `req.tenant` 对象，确保路由已应用 `tenant-resolver.middleware.ts`

### 4. 向后兼容
旧的调用方式仍然可用，新代码优先使用 `tenantOSS`

---

## 🚀 后续扩展

优化完成后，未来可以轻松扩展：

### 1. 支持更多 OSS 区域
```typescript
// 轻松添加新区域
if (tenant.region === 'beijing') {
  return {
    service: 'beijing',
    bucket: 'beijing-kindergarten',
    ...
  };
}
```

### 2. 支持 CDN 加速
```typescript
// 自动切换 CDN
if (process.env.USE_CDN === 'true') {
  return `${CDN_DOMAIN}/${ossPath}`;
}
```

### 3. 支持文件加密
```typescript
// 敏感文件自动加密
if (fileType === 'sensitive') {
  await uploadWithEncryption(buffer);
}
```

---

**祝优化顺利！🎉**

如有问题，请查看：
- OSS 服务源码：`k.yyup.com/server/src/services/oss.service.ts`
- 系统 OSS 源码：`k.yyup.com/server/src/services/system-oss.service.ts`
- 租户中间件：`k.yyup.com/server/src/middlewares/tenant-resolver.middleware.ts`
