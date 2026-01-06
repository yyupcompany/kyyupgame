# 统一认证中心 SMS 短信服务实现指南

## 📦 步骤1：安装阿里云短信SDK

在统一认证中心项目（`/home/zhgue/kyyupgame/adminyyup/admin.yyup.cc`）中执行：

```bash
cd /home/zhgue/kyyupgame/adminyyup/admin.yyup.cc/server
npm install @alicloud/dysmsapi20170525 --save
```

---

## ⚙️ 步骤2：配置环境变量

编辑 `server/.env` 文件，添加阿里云短信配置：

```env
# 阿里云短信服务配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_SMS_SIGN_NAME=你的签名
ALIYUN_SMS_TEMPLATE_CODE_REGISTER=SMS_123456  # 注册验证码模板
ALIYUN_SMS_TEMPLATE_CODE_LOGIN=SMS_123457     # 登录验证码模板

# Redis配置（验证码缓存）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
```

---

## 📄 步骤3：创建SMS Service服务层

创建文件：`server/src/services/sms.service.ts`

```typescript
/**
 * SMS短信服务
 * 使用阿里云短信服务发送验证码
 */

import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import Redis from 'ioredis';

// 验证码类型枚举
export enum VerificationCodeType {
  REGISTER = 'register',
  LOGIN = 'login',
  GROUP_BUY_REGISTER = 'group_buy_register',
}

// 验证码缓存数据结构
interface CodeCacheData {
  code: string;
  phone: string;
  type: VerificationCodeType;
  createdAt: number;
  expiresAt: number;
}

export class SmsService {
  private client: Dysmsapi20170525;
  private redis: Redis;
  private signName: string;
  private templateCodes: Record<string, string>;

  constructor() {
    // 初始化阿里云短信客户端
    const config = new $OpenApi.Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com',
    });

    this.client = new Dysmsapi20170525(config);
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || '';
    
    this.templateCodes = {
      [VerificationCodeType.REGISTER]: process.env.ALIYUN_SMS_TEMPLATE_CODE_REGISTER || '',
      [VerificationCodeType.LOGIN]: process.env.ALIYUN_SMS_TEMPLATE_CODE_LOGIN || '',
      [VerificationCodeType.GROUP_BUY_REGISTER]: process.env.ALIYUN_SMS_TEMPLATE_CODE_REGISTER || '',
    };

    // 初始化Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(dto: {
    phone: string;
    type: VerificationCodeType;
    scene?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      expiresIn: number;
      canResendIn: number;
    };
  }> {
    const { phone, type } = dto;

    try {
      // 1. 检查发送频率限制（60秒内不能重复发送）
      const canSend = await this.checkRateLimit(phone);
      if (!canSend) {
        return {
          success: false,
          message: '操作太频繁，请60秒后再试',
        };
      }

      // 2. 生成6位数字验证码
      const code = this.generateCode(6, true);

      // 3. 调用阿里云发送短信
      const templateCode = this.templateCodes[type];
      const sendRequest = new $Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.signName,
        templateCode: templateCode,
        templateParam: JSON.stringify({ code }),
      });

      const response = await this.client.sendSms(sendRequest);
      
      if (response.body.code !== 'OK') {
        console.error('[SMS] 发送失败:', response.body);
        return {
          success: false,
          message: '发送失败，请稍后重试',
        };
      }

      // 4. 保存验证码到Redis（5分钟有效期）
      await this.saveCodeToCache(phone, code, type, 300);

      // 5. 记录发送历史（用于频率限制）
      await this.recordSendHistory({
        phone,
        type,
        timestamp: Date.now(),
      });

      return {
        success: true,
        message: '验证码已发送',
        data: {
          expiresIn: 300, // 5分钟
          canResendIn: 60, // 60秒后可重发
        },
      };
    } catch (error: any) {
      console.error('[SMS] 发送异常:', error);
      return {
        success: false,
        message: error.message || '发送失败',
      };
    }
  }

  /**
   * 验证验证码
   */
  async verifyCode(dto: {
    phone: string;
    code: string;
    type: VerificationCodeType;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    const { phone, code, type } = dto;

    try {
      // 从缓存获取验证码
      const cacheData = await this.getCodeFromCache(phone, type);

      if (!cacheData) {
        return {
          success: false,
          message: '验证码已过期或不存在',
        };
      }

      // 验证码比对
      if (cacheData.code !== code) {
        return {
          success: false,
          message: '验证码错误',
        };
      }

      // 验证成功后删除缓存
      await this.deleteCodeFromCache(phone, type);

      return {
        success: true,
        message: '验证成功',
      };
    } catch (error: any) {
      console.error('[SMS] 验证异常:', error);
      return {
        success: false,
        message: '验证失败',
      };
    }
  }

  /**
   * 生成验证码
   */
  private generateCode(length: number = 6, onlyDigits: boolean = true): string {
    const chars = onlyDigits ? '0123456789' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 保存验证码到缓存
   */
  private async saveCodeToCache(
    phone: string,
    code: string,
    type: VerificationCodeType,
    expiresIn: number
  ): Promise<void> {
    const key = `sms:code:${type}:${phone}`;
    const data: CodeCacheData = {
      code,
      phone,
      type,
      createdAt: Date.now(),
      expiresAt: Date.now() + expiresIn * 1000,
    };
    await this.redis.setex(key, expiresIn, JSON.stringify(data));
  }

  /**
   * 从缓存获取验证码
   */
  private async getCodeFromCache(
    phone: string,
    type: VerificationCodeType
  ): Promise<CodeCacheData | null> {
    const key = `sms:code:${type}:${phone}`;
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  /**
   * 删除缓存中的验证码
   */
  private async deleteCodeFromCache(
    phone: string,
    type: VerificationCodeType
  ): Promise<void> {
    const key = `sms:code:${type}:${phone}`;
    await this.redis.del(key);
  }

  /**
   * 检查发送频率限制（60秒内只能发送1次）
   */
  private async checkRateLimit(phone: string): Promise<boolean> {
    const key = `sms:rate:${phone}`;
    const lastSendTime = await this.redis.get(key);
    
    if (lastSendTime) {
      const elapsed = Date.now() - parseInt(lastSendTime);
      if (elapsed < 60000) {
        return false; // 60秒内已发送过
      }
    }
    
    return true;
  }

  /**
   * 记录发送历史
   */
  private async recordSendHistory(record: {
    phone: string;
    type: VerificationCodeType;
    timestamp: number;
  }): Promise<void> {
    const key = `sms:rate:${record.phone}`;
    await this.redis.setex(key, 60, record.timestamp.toString());
  }
}

// 导出单例
export const smsService = new SmsService();
```

---

## 🎮 步骤4：创建SMS Controller

创建文件：`server/src/controllers/sms.controller.ts`

```typescript
import { Request, Response } from 'express';
import { smsService, VerificationCodeType } from '../services/sms.service';

export class SmsController {
  /**
   * 发送验证码
   * POST /api/sms/send-code
   */
  static async sendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, type, scene } = req.body;

      // 参数验证
      if (!phone) {
        res.status(400).json({
          success: false,
          message: '手机号不能为空',
        });
        return;
      }

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        res.status(400).json({
          success: false,
          message: '手机号格式不正确',
        });
        return;
      }

      if (!type || !Object.values(VerificationCodeType).includes(type)) {
        res.status(400).json({
          success: false,
          message: '验证码类型不正确',
        });
        return;
      }

      // 调用服务层发送验证码
      const result = await smsService.sendVerificationCode({
        phone,
        type,
        scene,
      });

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      console.error('[SMS Controller] 发送验证码失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '发送失败',
      });
    }
  }

  /**
   * 验证验证码
   * POST /api/sms/verify-code
   */
  static async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, code, type } = req.body;

      // 参数验证
      if (!phone || !code || !type) {
        res.status(400).json({
          success: false,
          message: '参数不完整',
        });
        return;
      }

      // 调用服务层验证
      const result = await smsService.verifyCode({
        phone,
        code,
        type,
      });

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      console.error('[SMS Controller] 验证失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '验证失败',
      });
    }
  }
}
```

---

## 🛣️ 步骤5：创建路由

创建文件：`server/src/routes/sms.routes.ts`

```typescript
import { Router } from 'express';
import { SmsController } from '../controllers/sms.controller';

const router = Router();

/**
 * POST /api/sms/send-code
 * 发送短信验证码
 */
router.post('/send-code', SmsController.sendVerificationCode);

/**
 * POST /api/sms/verify-code
 * 验证短信验证码
 */
router.post('/verify-code', SmsController.verifyCode);

export default router;
```

---

## 🔌 步骤6：注册路由到主应用

编辑 `server/src/routes/index.ts`，添加SMS路由：

```typescript
import smsRoutes from './sms.routes';

// ... 其他路由

// SMS短信服务
router.use('/sms', smsRoutes);
console.log('[SMS] ✅ SMS路由已注册: /api/sms/*');

export default router;
```

---

## 🔐 步骤7：创建验证码注册接口

编辑 `server/src/controllers/auth.controller.ts`，添加验证码注册方法：

```typescript
import { smsService } from '../services/sms.service';

export class AuthController {
  // ... 其他方法

  /**
   * 验证码注册
   * POST /api/auth/register-by-code
   */
  static async registerByCode(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, verificationCode, childName, childAge, source, referenceId } = req.body;

      // 1. 验证验证码
      const verifyResult = await smsService.verifyCode({
        phone,
        code: verificationCode,
        type: 'group_buy_register',
      });

      if (!verifyResult.success) {
        res.status(400).json({
          success: false,
          message: verifyResult.message,
        });
        return;
      }

      // 2. 检查手机号是否已注册
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        // 如果已注册，直接登录
        const token = generateToken(existingUser.id);
        res.json({
          success: true,
          message: '登录成功',
          data: {
            token,
            userInfo: existingUser,
          },
        });
        return;
      }

      // 3. 创建新用户
      const newUser = await User.create({
        name,
        phone,
        childName,
        childAge,
        source,
        referenceId,
        role: 'parent', // 默认角色为家长
      });

      // 4. 生成token并返回
      const token = generateToken(newUser.id);
      res.json({
        success: true,
        message: '注册成功',
        data: {
          token,
          userInfo: newUser,
        },
      });
    } catch (error: any) {
      console.error('[Auth] 验证码注册失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '注册失败',
      });
    }
  }
}
```

编辑 `server/src/routes/auth.routes.ts`，添加路由：

```typescript
/**
 * POST /api/auth/register-by-code
 * 验证码注册
 */
router.post('/register-by-code', AuthController.registerByCode);
```

---

## ✅ 步骤8：测试验证

启动统一认证中心服务后，使用以下命令测试：

### 测试1：发送验证码
```bash
curl -X POST http://localhost:4001/api/sms/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13812345678",
    "type": "group_buy_register",
    "scene": "团购快速注册"
  }'
```

预期响应：
```json
{
  "success": true,
  "message": "验证码已发送",
  "data": {
    "expiresIn": 300,
    "canResendIn": 60
  }
}
```

### 测试2：验证验证码
```bash
curl -X POST http://localhost:4001/api/sms/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13812345678",
    "code": "123456",
    "type": "group_buy_register"
  }'
```

### 测试3：验证码注册
```bash
curl -X POST http://localhost:4001/api/auth/register-by-code \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13812345678",
    "verificationCode": "123456",
    "source": "group_buy",
    "referenceId": 1
  }'
```

---

## 📊 完整API端点列表

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/sms/send-code` | POST | 发送验证码 | ✅ 待实现 |
| `/api/sms/verify-code` | POST | 验证验证码 | ✅ 待实现 |
| `/api/auth/register-by-code` | POST | 验证码注册 | ✅ 待实现 |

---

## 🔄 调用流程图

```
租户前端 (k.yyup.cc)
    ↓ POST /api/sms/send-code
租户后端 (k.yyup.cc:3000) [代理层 - 已完成]
    ↓ 转发到统一认证
统一认证中心 (rent.yyup.cc:4001) [SMS服务层 - 待实现]
    ↓ 调用阿里云SDK
阿里云短信服务
    ↓ 发送短信
用户手机
```

---

## ⚠️ 注意事项

1. **阿里云短信模板**：需要提前在阿里云控制台申请短信模板和签名
2. **Redis必需**：验证码缓存依赖Redis，需要先安装并启动Redis
3. **环境变量**：所有配置项必须正确填写到 `.env` 文件
4. **频率限制**：默认60秒内只能发送1次验证码
5. **有效期**：验证码默认5分钟有效期

---

## 📝 实施清单

- [ ] 安装 `@alicloud/dysmsapi20170525` SDK
- [ ] 配置 `.env` 环境变量（阿里云密钥、签名、模板）
- [ ] 创建 `server/src/services/sms.service.ts`
- [ ] 创建 `server/src/controllers/sms.controller.ts`
- [ ] 创建 `server/src/routes/sms.routes.ts`
- [ ] 注册路由到 `server/src/routes/index.ts`
- [ ] 在 `auth.controller.ts` 添加 `registerByCode` 方法
- [ ] 在 `auth.routes.ts` 添加验证码注册路由
- [ ] 启动服务并测试验证码发送
- [ ] 测试验证码验证功能
- [ ] 测试完整注册流程

预计工时：**2.5天**
