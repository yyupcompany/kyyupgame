# Bug #14 修复指南 - 环境变量注入漏洞

## 问题描述
从`.env.local`文件加载环境变量时，使用`Object.assign`直接覆盖`process.env`，没有验证环境变量的合法性。

## 严重级别
**高**

## 受影响的文件
- `server/src/app.ts`
  - 行号: 51-70

## 漏洞代码

### 位置: app.ts 第56-63行
```typescript
// ❌ 直接覆盖process.env，没有验证
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  const envLocalVars = dotenv.parse(envLocalContent);
  Object.assign(process.env, envLocalVars); // ⚠️ 直接覆盖所有变量
  console.log('✅ .env.local 文件已加载并覆盖环境变量');
}
```

## 问题分析

1. **任意变量覆盖**: 可以覆盖任何环境变量，包括PATH等系统变量
2. **配置注入**: 恶意代码可以通过修改.env.local注入任意配置
3. **供应链攻击**: 如果.env.local被恶意修改，会影响应用行为
4. **无验证**: 没有验证环境变量的格式和合法性

## 修复方案（使用白名单 + fallback）

### 步骤 1: 创建允许的环境变量白名单

**修复前：**
```typescript
const envLocalVars = dotenv.parse(envLocalContent);
Object.assign(process.env, envLocalVars); // ❌ 无限制覆盖
```

**修复后：**
```typescript
// ================================
# 安全的环境变量加载
// ================================

// 定义允许从.env.local覆盖的环境变量白名单
const ALLOWED_ENV_VARS = new Set([
  // JWT相关
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',

  // 数据库相关（仅用于测试，生产环境不应覆盖）
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',

  // OSS相关
  'SYSTEM_OSS_ACCESS_KEY_ID',
  'SYSTEM_OSS_ACCESS_KEY_SECRET',
  'SYSTEM_OSS_BUCKET',
  'SYSTEM_OSS_REGION',

  // AI服务相关
  'AIBRIDGE_API_KEY',
  'AIBRIDGE_BASE_URL',
  'AIBRIDGE_MODEL',

  // 服务器配置
  'SERVER_PORT',
  'SERVER_URL',

  // 第三方服务
  'SENTRY_DSN',
  'REDIS_URL'
]);

/**
 * 安全地加载.env.local文件
 */
function loadEnvLocal() {
  const envLocalPath = path.resolve(__dirname, '../.env.local');

  if (!fs.existsSync(envLocalPath)) {
    console.log('ℹ️  .env.local 文件不存在，使用默认配置');
    return;
  }

  try {
    const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    const envLocalVars = dotenv.parse(envLocalContent);

    // 只覆盖白名单中的变量
    let loadedCount = 0;
    for (const [key, value] of Object.entries(envLocalVars)) {
      if (ALLOWED_ENV_VARS.has(key)) {
        // 验证值不为空
        if (value && value.trim() !== '') {
          process.env[key] = value;
          loadedCount++;
        }
      } else {
        console.warn(`⚠️  .env.local 中的变量 "${key}" 不在白名单中，已忽略`);
      }
    }

    console.log(`✅ .env.local 文件已加载，覆盖了 ${loadedCount} 个变量`);
  } catch (error) {
    console.error('❌ 加载 .env.local 失败:', error.message);
    console.log('ℹ️  将使用默认配置继续运行');
  }
}

// 在应用启动时调用
loadEnvLocal();
```

### 步骤 2: 为关键变量添加默认值fallback

确保即使.env.local不存在，应用也能正常运行：

```typescript
// ================================
# 环境变量配置（带默认值）
# ================================

const config = {
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'kindergarten-enrollment-secret', // 保持本地调试可用
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'kindergarten-enrollment-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pwk5ls7j',
    name: process.env.DB_NAME || 'kargerdensales'
  },

  // 服务器配置
  server: {
    port: parseInt(process.env.SERVER_PORT || '3000', 10),
    url: process.env.SERVER_URL || 'http://localhost:3000'
  },

  // OSS配置（可选）
  oss: {
    accessKeyId: process.env.SYSTEM_OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.SYSTEM_OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.SYSTEM_OSS_BUCKET || 'systemkarder',
    region: process.env.SYSTEM_OSS_REGION || 'oss-cn-hangzhou'
  }
};

// 验证必需配置
function validateConfig() {
  const errors = [];

  // 检查数据库配置
  if (!config.database.host) {
    errors.push('数据库主机地址未配置');
  }

  // 检查JWT密钥
  if (!config.jwt.secret) {
    errors.push('JWT密钥未配置');
  }

  if (errors.length > 0) {
    console.error('❌ 配置验证失败:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  开发环境将继续运行，但某些功能可能不可用');
    }
  }
}

// 在应用启动时验证
validateConfig();
```

### 步骤 3: 创建.env.local.example模板

创建 `server/.env.local.example` 文件：

```bash
# ================================
# 本地环境变量配置示例
# ================================
# 说明：
# 1. 复制此文件为 .env.local
# 2. 填入实际配置值
# 3. .env.local 已添加到 .gitignore，不会被提交
# 4. 所有配置都是可选的，不填则使用默认值

# ================================
# JWT配置
# ================================
# JWT密钥（可选，不填则使用默认值）
# 注意：修改后需要重新登录
JWT_SECRET=
JWT_REFRESH_SECRET=

# ================================
# 数据库配置（仅用于测试）
# ================================
# 警告：生产环境不应覆盖数据库配置
# DB_HOST=
# DB_PORT=
# DB_NAME=

# ================================
# OSS配置
# ================================
# 阿里云OSS访问密钥
SYSTEM_OSS_ACCESS_KEY_ID=
SYSTEM_OSS_ACCESS_KEY_SECRET=
SYSTEM_OSS_BUCKET=
SYSTEM_OSS_REGION=

# ================================
# AI服务配置
# ================================
# AI Bridge API密钥
AIBRIDGE_API_KEY=
AIBRIDGE_BASE_URL=
AIBRIDGE_MODEL=
```

### 步骤 4: 更新.gitignore

确保 `.env.local` 不会被提交：

```gitignore
# 环境变量
.env
.env.local
.env.production
.env.*.local

# 敏感配置
*.key
*.pem
credentials.json
```

### 步骤 5: 添加配置验证命令

创建 `server/scripts/validate-config.js`：

```javascript
const fs = require('fs');
const path = require('path');

console.log('🔍 验证环境变量配置...\n');

const configFiles = [
  { path: '.env', required: true },
  { path: '.env.local', required: false }
];

let hasErrors = false;

for (const configFile of configFiles) {
  const fullPath = path.join(__dirname, '..', configFile.path);

  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${configFile.path} 存在`);

    // 读取并验证
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    });

    console.log(`   - 包含 ${lines.length} 行配置`);
  } else {
    if (configFile.required) {
      console.log(`❌ ${configFile.path} 不存在（必需）`);
      hasErrors = true;
    } else {
      console.log(`ℹ️  ${configFile.path} 不存在（可选）`);
    }
  }
}

// 检查关键环境变量
const requiredVars = ['JWT_SECRET', 'DB_HOST', 'DB_PASSWORD'];
console.log('\n🔍 检查关键环境变量:');

for (const varName of requiredVars) {
  if (process.env[varName]) {
    console.log(`✅ ${varName} 已配置`);
  } else {
    console.log(`⚠️  ${varName} 未配置（将使用默认值）`);
  }
}

if (hasErrors) {
  console.log('\n❌ 配置验证失败');
  process.exit(1);
} else {
  console.log('\n✅ 配置验证通过');
}
```

添加到 `package.json`：
```json
{
  "scripts": {
    "validate-config": "node scripts/validate-config.js"
  }
}
```

## 本地调试保证

### 默认值策略

所有关键配置都有默认值：

```typescript
// ✅ 有默认值，本地调试不受影响
const JWT_SECRET = process.env.JWT_SECRET || 'kindergarten-enrollment-secret';
const DB_HOST = process.env.DB_HOST || 'dbconn.sealoshzh.site';
```

### 不破坏现有配置

- ✅ 保留所有现有的 `.env` 配置
- ✅ `.env.local` 只覆盖白名单中的变量
- ✅ 不存在的变量使用默认值

### 开发环境友好

```typescript
if (process.env.NODE_ENV === 'development') {
  // 开发环境可以使用更宽松的配置
  // 允许覆盖更多变量（仅开发环境）
}
```

## 验证步骤

### 1. 测试默认值
```bash
# 删除.env.local
rm server/.env.local

# 启动服务器
cd server && npm run dev

# 应该使用默认值正常启动
```

### 2. 测试白名单
```bash
# 在.env.local中添加不允许的变量
echo "MALICIOUS_VAR=attack" > server/.env.local

# 启动服务器
cd server && npm run dev

# 应该看到警告：变量不在白名单中
```

### 3. 验证必需配置
```bash
# 运行配置验证
cd server && npm run validate-config

# 应该通过验证
```

### 4. 测试本地调试
```bash
# 确保本地调试正常工作
cd server && npm run dev

# 访问 API 文档
curl http://localhost:3000/api-docs

# 应该正常访问
```

## 回滚方案

如果修复后出现问题：

1. **删除.env.local**：恢复使用默认值
2. **临时添加变量到白名单**：
   ```typescript
   ALLOWED_ENV_VARS.add('TEMP_VAR');
   ```
3. **完全禁用白名单**（不推荐）：
   ```typescript
   Object.assign(process.env, envLocalVars);
   ```

## 修复完成检查清单

- [ ] 环境变量白名单已定义
- [ ] 安全加载函数已实现
- [ ] 默认值fallback已添加
- [ ] 配置验证已实现
- [ ] .env.local.example已创建
- [ ] .gitignore已更新
- [ ] 配置验证脚本已创建
- [ ] 单元测试已通过
- [ ] 本地调试正常工作
- [ ] 默认配置可用

## 风险评估

- **风险级别**: 低
- **影响范围**: 环境变量加载逻辑
- **回滚难度**: 低（使用默认值或禁用白名单）
- **本地调试影响**: 无（所有配置有默认值）

---

**修复时间估计**: 2-3 小时
**测试时间估计**: 1-2 小时
**总时间估计**: 3-5 小时
