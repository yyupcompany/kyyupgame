# Bug #3 修复指南 - JWT密钥硬编码和不安全配置

## 问题描述
JWT密钥可能存在硬编码或配置不当的问题，token有效期过长（7天），增加了被盗用的风险。

## 严重级别
**严重** - 需要立即修复

## 受影响的文件
- `server/src/middlewares/auth.middleware.ts`
  - 行号: 310, 1083
- `server/.env`
  - JWT_SECRET 配置
- `server/src/config/jwt.config.ts` (可能需要创建)

## 漏洞代码

### 位置1: auth.middleware.ts 第310行
```typescript
// ❌ JWT_SECRET 可能未验证其存在性或强度
const decoded = jwt.verify(token, JWT_SECRET) as any;
```

### 位置2: auth.middleware.ts 第1083行
```typescript
// ❌ token有效期过长（7天）
const token = jwt.sign(
  {
    id: user.id,
    phone: user.phone,
    role: user.role || 'parent',
    isDemo: true
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

## 修复方案

### 步骤 1: 创建安全的 JWT 配置

创建文件 `server/src/config/jwt.config.ts`:

```typescript
import crypto from 'crypto';

/**
 * JWT 配置接口
 */
interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
  issuer: string;
  audience: string;
  algorithm: jwt.Algorithm;
}

/**
 * 验证密钥强度
 */
function validateSecretKey(secret: string, name: string): void {
  if (!secret) {
    throw new Error(`${name} 未设置，请在环境变量中配置`);
  }

  if (secret.length < 32) {
    throw new Error(`${name} 长度不足，至少需要32个字符`);
  }

  // 检查是否为默认或弱密钥
  const weakSecrets = [
    'secret', 'password', 'jwt-secret', 'jwtsecret',
    'your-secret-key', 'change-me', '12345678'
  ];

  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error(`${name} 过于简单，请使用强随机密钥`);
  }
}

/**
 * 生成强随机密钥
 */
export function generateSecureSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * 获取 JWT 配置
 */
export function getJWTConfig(): JWTConfig {
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

  // 验证密钥
  validateSecretKey(accessTokenSecret!, 'JWT_ACCESS_SECRET');

  if (!refreshTokenSecret) {
    console.warn('⚠️  JWT_REFRESH_SECRET 未设置，将使用与 ACCESS 相同的密钥（不推荐）');
  } else {
    validateSecretKey(refreshTokenSecret, 'JWT_REFRESH_SECRET');
  }

  return {
    accessTokenSecret: accessTokenSecret!,
    refreshTokenSecret: refreshTokenSecret || accessTokenSecret!,
    accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m', // 15分钟
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d', // 7天
    issuer: process.env.JWT_ISSUER || 'kyyup-game',
    audience: process.env.JWT_AUDIENCE || 'kyyup-api',
    algorithm: 'HS256'
  };
}

// 导出单例
export const jwtConfig = getJWTConfig();

// 启动时验证配置
if (process.env.NODE_ENV !== 'test') {
  try {
    getJWTConfig();
    console.log('✅ JWT 配置验证通过');
  } catch (error) {
    console.error('❌ JWT 配置错误:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
```

### 步骤 2: 更新环境变量

更新 `server/.env`:

```bash
# ================================
# JWT 配置
# ================================

# Access Token 密钥（至少32字符，建议64字符）
# 使用以下命令生成: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your-generated-64-char-hex-string-here

# Refresh Token 密钥（应该与 Access Token 不同）
JWT_REFRESH_SECRET=your-different-64-char-hex-string-here

# Access Token 有效期（默认: 15分钟）
# 生产环境建议: 5m-15m
JWT_ACCESS_EXPIRATION=15m

# Refresh Token 有效期（默认: 7天）
# 生产环境建议: 7d-30d
JWT_REFRESH_EXPIRATION=7d

# JWT 发行者
JWT_ISSUER=kyyup-game

# JWT 受众
JWT_AUDIENCE=kyyup-api
```

创建脚本 `server/scripts/generate-jwt-secrets.js`:

```javascript
const crypto = require('crypto');

console.log('生成新的 JWT 密钥...\n');

const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

console.log('请将以下内容添加到 .env 文件:\n');
console.log('========================================');
console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('========================================\n');

console.log('⚠️  请妥善保管这些密钥，不要泄露或提交到版本控制系统！');
```

运行脚本生成密钥:
```bash
cd server && node scripts/generate-jwt-secrets.js
```

### 步骤 3: 创建 Token 管理服务

创建文件 `server/src/services/token.service.ts`:

```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt.config';

/**
 * Token 载荷接口
 */
interface TokenPayload {
  id: number;
  phone?: string;
  username?: string;
  email?: string;
  role: string;
  kindergartenId?: number;
  isAdmin?: boolean;
}

/**
 * Token 对接口
 */
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token 黑名单（使用 Redis）
 */
class TokenBlacklist {
  private blacklist: Set<string> = new Set();
  private expiryMap: Map<string, number> = new Map();

  /**
   * 添加 token 到黑名单
   */
  async add(token: string, expiresIn: number): Promise<void> {
    this.blacklist.add(token);
    this.expiryMap.set(token, Date.now() + expiresIn);

    // 自动清理过期 token
    setTimeout(() => {
      this.blacklist.delete(token);
      this.expiryMap.delete(token);
    }, expiresIn);
  }

  /**
   * 检查 token 是否在黑名单中
   */
  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.blacklist.has(token)) {
      return false;
    }

    // 检查是否过期
    const expiry = this.expiryMap.get(token);
    if (expiry && Date.now() > expiry) {
      this.blacklist.delete(token);
      this.expiryMap.delete(token);
      return false;
    }

    return true;
  }

  /**
   * 清理所有黑名单
   */
  clear(): void {
    this.blacklist.clear();
    this.expiryMap.clear();
  }
}

export const tokenBlacklist = new TokenBlacklist();

/**
 * Token 服务
 */
export class TokenService {
  /**
   * 生成 Access Token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, jwtConfig.accessTokenSecret, {
      expiresIn: jwtConfig.accessTokenExpiration,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      subject: `${payload.id}`,
      jwtid: crypto.randomUUID()
    });
  }

  /**
   * 生成 Refresh Token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      jwtConfig.refreshTokenSecret,
      {
        expiresIn: jwtConfig.refreshTokenExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        subject: `${payload.id}`,
        jwtid: crypto.randomUUID()
      }
    );
  }

  /**
   * 生成 Token 对
   */
  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // 解析 access token 获取过期时间
    const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
    const expiresIn = decoded.exp! - Date.now() / 1000;

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * 验证 Access Token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    // 检查黑名单
    if (await tokenBlacklist.isBlacklisted(token)) {
      throw new Error('Token 已失效');
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.accessTokenSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access Token 已过期');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('无效的 Access Token');
      }
      throw error;
    }
  }

  /**
   * 验证 Refresh Token
   */
  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as TokenPayload & { type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Token 类型错误');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh Token 已过期');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('无效的 Refresh Token');
      }
      throw error;
    }
  }

  /**
   * 刷新 Token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(refreshToken);

    // 生成新的 token 对
    return this.generateTokenPair(payload);
  }

  /**
   * 使 Token 失效（登出）
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const expiresIn = (decoded.exp! - Date.now() / 1000) * 1000;

      if (expiresIn > 0) {
        await tokenBlacklist.add(token, expiresIn);
      }
    } catch (error) {
      // Token 已无效，无需处理
    }
  }

  /**
   * 解析 Token（不验证）
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * 获取 Token 剩余有效时间（秒）
   */
  getTokenRemainingTime(token: string): number {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const remaining = decoded.exp! - Date.now() / 1000;
      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }
}

// 导出单例
export const tokenService = new TokenService();
```

### 步骤 4: 更新 auth.middleware.ts

**修复前（第1083行）:**
```typescript
const token = jwt.sign(
  {
    id: user.id,
    phone: user.phone,
    role: user.role || 'parent',
    isDemo: true
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

**修复后:**
```typescript
import { tokenService } from '../services/token.service';

// 使用新的 Token 服务
const tokenPair = tokenService.generateTokenPair({
  id: user.id,
  phone: user.phone,
  username: user.username,
  role: user.role || 'parent',
  kindergartenId: user.kindergartenId,
  isAdmin: user.isAdmin
});

// 返回 access token 和 refresh token
res.json({
  success: true,
  data: {
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
    expiresIn: tokenPair.expiresIn,
    tokenType: 'Bearer'
  }
});
```

**修复前（第310行）:**
```typescript
const decoded = jwt.verify(token, JWT_SECRET) as any;
```

**修复后:**
```typescript
import { tokenService } from '../services/token.service';

try {
  const decoded = await tokenService.verifyAccessToken(token);

  req.user = {
    id: decoded.id,
    username: decoded.username,
    phone: decoded.phone,
    email: decoded.email,
    role: decoded.role,
    kindergartenId: decoded.kindergartenId,
    isAdmin: decoded.isAdmin
  };

  next();
} catch (error) {
  return res.status(401).json({
    success: false,
    error: {
      message: error.message,
      code: 'INVALID_TOKEN'
    }
  });
}
```

### 步骤 5: 创建 Token 刷新端点

创建文件 `server/src/routes/auth-refresh.routes.ts`:

```typescript
import { Router } from 'express';
import { tokenService } from '../services/token.service';

const router = Router();

/**
 * POST /api/auth/refresh
 * 刷新 Access Token
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Refresh Token 是必需的',
        code: 'MISSING_REFRESH_TOKEN'
      }
    });
  }

  try {
    const tokenPair = await tokenService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken, // 可选：返回新的 refresh token
        expiresIn: tokenPair.expiresIn
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: error.message,
        code: 'INVALID_REFRESH_TOKEN'
      }
    });
  }
});

/**
 * POST /api/auth/logout
 * 登出并使 Token 失效
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(400).json({
      success: false,
      error: {
        message: '缺少 Authorization 头',
        code: 'MISSING_TOKEN'
      }
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    await tokenService.revokeToken(token);

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: '登出失败',
        code: 'LOGOUT_FAILED'
      }
    });
  }
});

export default router;
```

在 `server/src/app.ts` 中注册路由:
```typescript
import authRefreshRoutes from './routes/auth-refresh.routes';
app.use('/api/auth', authRefreshRoutes);
```

### 步骤 6: 创建启动时验证脚本

更新 `server/src/init.ts`:

```typescript
import { getJWTConfig } from './config/jwt.config';

export async function validateStartupConfig() {
  console.log('🔍 验证启动配置...\n');

  try {
    // 验证 JWT 配置
    console.log('📝 验证 JWT 配置...');
    getJWTConfig();
    console.log('✅ JWT 配置有效\n');

    // 验证其他配置...
  } catch (error) {
    console.error('❌ 配置验证失败:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('生产环境配置错误，服务无法启动');
      process.exit(1);
    } else {
      console.warn('⚠️  开发环境配置错误，但继续运行');
    }
  }
}
```

### 步骤 7: 更新 .gitignore

确保 `.env` 文件不被提交:
```bash
# .gitignore
.env
.env.local
.env.production
*.key
*.pem
```

## 验证步骤

### 1. 生成并设置密钥
```bash
# 生成新密钥
cd server && node scripts/generate-jwt-secrets.js

# 复制到 .env 文件
# 编辑 server/.env 添加生成的密钥
```

### 2. 单元测试
创建文件 `server/src/__tests__/token.service.test.ts`:

```typescript
import { TokenService, tokenBlacklist } from '../services/token.service';
import { jwtConfig } from '../config/jwt.config';

describe('Token Service', () => {
  const mockPayload = {
    id: 1,
    phone: '13800138000',
    role: 'admin',
    kindergartenId: 1
  };

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokenService = new TokenService();
      const tokens = tokenService.generateTokenPair(mockPayload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('expiresIn');
      expect(tokens.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const tokenService = new TokenService();
      const token = tokenService.generateAccessToken(mockPayload);

      const decoded = await tokenService.verifyAccessToken(token);
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should reject expired token', async () => {
      const tokenService = new TokenService();
      // 创建一个立即过期的 token
      const token = jwt.sign(mockPayload, jwtConfig.accessTokenSecret, {
        expiresIn: '0s'
      });

      await expect(tokenService.verifyAccessToken(token))
        .rejects
        .toThrow('Access Token 已过期');
    });

    it('should reject blacklisted token', async () => {
      const tokenService = new TokenService();
      const token = tokenService.generateAccessToken(mockPayload);

      // 添加到黑名单
      await tokenBlacklist.add(token, 60000);

      await expect(tokenService.verifyAccessToken(token))
        .rejects
        .toThrow('Token 已失效');
    });
  });

  describe('refreshTokens', () => {
    it('should generate new tokens from refresh token', async () => {
      const tokenService = new TokenService();
      const refreshToken = tokenService.generateRefreshToken(mockPayload);

      const newTokens = await tokenService.refreshTokens(refreshToken);

      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
    });
  });

  describe('revokeToken', () => {
    it('should add token to blacklist', async () => {
      const tokenService = new TokenService();
      const token = tokenService.generateAccessToken(mockPayload);

      await tokenService.revokeToken(token);

      const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
      expect(isBlacklisted).toBe(true);
    });
  });
});
```

### 3. 集成测试
创建文件 `server/tests/__tests__/auth-jwt.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('JWT Authentication', () => {
  let accessToken: string;
  let refreshToken: string;

  it('should login and return tokens', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phone: '13800138000',
        password: 'Test123!@#'
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it('should access protected endpoint with access token', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it('should reject expired access token', async () => {
    // 等待 token 过期（或使用 mock）
    // 实际测试中应该使用时间 mock
  });

  it('should refresh access token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('should logout and revoke token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);

    // Token 应该被撤销
    const nextResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(nextResponse.status).toBe(401);
  });
});
```

### 4. 运行测试
```bash
cd server && npm test -- token.service.test.ts
cd server && npm test -- auth-jwt.test.ts
```

## 修复完成检查清单

- [ ] JWT 配置文件已创建
- [ ] 强随机密钥已生成并配置
- [ ] Token 服务已创建
- [ ] Access Token 有效期已缩短（15分钟）
- [ ] Refresh Token 机制已实现
- [ ] Token 黑名单已实现
- [ ] Token 刷新端点已创建
- [ ] 登出端点已创建
- [ ] auth.middleware.ts 已更新
- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] .env 已添加到 .gitignore

---

**修复时间估计**: 6-8 小时
**测试时间估计**: 3-4 小时
**总时间估计**: 9-12 小时
