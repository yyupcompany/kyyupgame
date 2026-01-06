# 阿里云OSS配置说明

## 📊 OSS Buckets 架构

### 1. **相册照片存储** (上海节点)
- **Bucket**: `faceshanghaikarden`
- **Region**: `oss-cn-shanghai`
- **用途**: 班级相册、学生照片
- **目录结构**:
  ```
  faceshanghaikarden/kindergarten/
  ├── photos/          # 班级照片
  ├── students/        # 学生照片
  └── test-faces/      # 测试人脸数据
  ```
- **权限**: Private（私有）
- **特点**: 与人脸识别服务在同一region，减少延迟

### 2. **系统资源存储** (广州节点)
- **Bucket**: `systemkarder`
- **Region**: `oss-cn-guangzhou`
- **用途**: 游戏资源、教育内容、开发资源
- **目录结构**:
  ```
  systemkarder/kindergarten/
  ├── system/          # 系统文件
  │   ├── games/      # 游戏资源
  │   ├── education/  # 教育资源
  │   └── development/# 开发资源
  ├── games/
  ├── education/
  └── rent/            # 租户目录
  ```
- **权限**: Private（私有）

## 🔧 环境变量配置

### .env 文件配置

```bash
# ============================================
# 系统OSS配置（游戏、教育资源等）- 广州节点
# ============================================
# 注意：敏感信息已移至 .env.local 文件
SYSTEM_OSS_ACCESS_KEY_ID=${SYSTEM_OSS_ACCESS_KEY_ID}
SYSTEM_OSS_ACCESS_KEY_SECRET=${SYSTEM_OSS_ACCESS_KEY_SECRET}
SYSTEM_OSS_BUCKET=systemkarder
SYSTEM_OSS_REGION=oss-cn-guangzhou
SYSTEM_OSS_CDN_DOMAIN=
SYSTEM_OSS_PATH_PREFIX=kindergarten/

# ============================================
# 照片OSS配置（相册专用）- 上海节点
# ============================================
# 注意：敏感信息已移至 .env.local 文件
OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}
OSS_ACCESS_KEY_SECRET=${OSS_ACCESS_KEY_SECRET}
OSS_BUCKET=faceshanghaikarden
OSS_REGION=oss-cn-shanghai
OSS_PATH_PREFIX=kindergarten/

# ============================================
# 阿里云人脸识别配置 - 上海节点
# ============================================
# 注意：敏感信息已移至 .env.local 文件
ALIYUN_ACCESS_KEY_ID=${ALIYUN_ACCESS_KEY_ID}
ALIYUN_ACCESS_KEY_SECRET=${ALIYUN_ACCESS_KEY_SECRET}
FACE_DB_NAME=kindergarten_students
```

## 🤖 人脸识别配置

### 人脸库信息
- **人脸库名称**: `kindergarten_students`
- **Region**: `cn-shanghai` (人脸识别服务仅支持上海)
- **Endpoint**: `facebody.cn-shanghai.aliyuncs.com`

### 人脸库状态
```bash
# 查询人脸库列表
aliyun facebody ListFaceDbs --profile facebody --region cn-shanghai

# 返回结果
{
  "Data": {
    "DbList": [
      {"Name": "default"},
      {"Name": "kindergarten_students"}  ✅
    ]
  }
}
```

## 📝 代码使用说明

### 相册照片上传
```typescript
// server/src/services/photo.service.ts
import { ossService } from './oss.service';  // 使用上海bucket

// 上传照片到 faceshanghaikarden/kindergarten/photos/
await ossService.uploadImage(file, {
  filename: 'photo.jpg',
  directory: 'photos/2025-11',  // → kindergarten/photos/2025-11/
  maxWidth: 1920,
  quality: 80,
  generateThumbnail: true
});
```

### 系统资源上传
```typescript
// server/src/services/system-oss.service.ts
import { getSystemOSSService } from './system-oss.service';  // 使用广州bucket

const ossService = getSystemOSSService();

// 上传到 systemkarder/kindergarten/system/games/
await ossService.uploadGameAsset(
  fileBuffer,
  'audio',
  'bgm',
  'background-music.mp3'
);
```

## 🔐 安全说明

### Bucket访问权限
- ✅ 两个buckets都是**私有(Private)**
- ✅ 所有图片URL需要**签名(Signed URL)**
- ✅ 签名有效期：60分钟（相册）/ 3600秒（其他）

### 签名URL生成
```typescript
// 照片OSS (上海)
const url = ossService.getTemporaryUrl(ossPath, 60);  // 60分钟

// 系统OSS (广州)
const url = systemOSSService.getTemporaryUrl(ossPath, 3600);  // 1小时
```

## 🚀 验证配置

### 验证上海bucket
```bash
aliyun oss ls oss://faceshanghaikarden/kindergarten/ -d
# 应该显示: photos/, students/, test-faces/
```

### 验证广州bucket
```bash
aliyun oss ls oss://systemkarder/kindergarten/ -d
# 应该显示: system/, games/, education/, rent/
```

### 验证人脸库
```bash
aliyun facebody ListFaceDbs --profile facebody --region cn-shanghai
# 应该包含: kindergarten_students
```

## 📌 注意事项

1. **Region选择**:
   - 相册照片 → 上海 (与人脸识别同region)
   - 系统资源 → 广州 (成本较低)

2. **人脸识别**:
   - 必须使用上海region
   - 照片也存储在上海，减少跨region访问延迟

3. **成本优化**:
   - 照片存储使用ZRS（同城冗余）
   - 系统资源使用LRS（本地冗余）

## 🔄 更新记录

- **2025-11-18**: 修正相册配置，照片从广州bucket迁移到上海bucket
- **2025-11-18**: 配置阿里云CLI并验证所有配置
- **2025-11-18**: 更新.env文件，替换环境变量引用为实际密钥

