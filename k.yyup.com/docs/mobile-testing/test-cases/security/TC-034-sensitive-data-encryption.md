# TC-034: 敏感数据加密测试

## 测试用例标识
- **用例编号**: TC-034
- **测试组**: 安全性和权限边界测试
- **测试类型**: 安全测试
- **优先级**: 严重

## 测试目标
验证移动端应用的敏感数据加密机制，确保用户个人信息、密码、token等敏感数据在传输和存储过程中都经过适当的加密保护，防止数据泄露和窃取。

## 测试前置条件
1. 应用已正常启动并运行在测试环境
2. 加密机制已配置并启用
3. SSL/TLS证书已正确配置
4. 浏览器开发者工具已准备就绪

## 测试步骤

### 步骤1: 传输层加密验证
1. **检查HTTPS连接**
   - 访问移动端应用
   - 检查浏览器地址栏是否显示安全锁图标
   - 验证URL使用https://协议

2. **验证SSL/TLS证书**
   ```
   点击安全锁图标 -> 查看证书信息
   验证:
   - 证书颁发机构可信
   - 证书未过期
   - 域名匹配
   - 加密算法强度足够
   ```

3. **检查网络请求加密**
   - 打开开发者工具 -> Network标签
   - 检查所有API请求是否使用HTTPS
   - 验证没有HTTP明文传输

4. **测试中间人攻击防护**
   - 尝试使用代理工具拦截请求
   - 验证请求是否被正确加密
   - 检查HSTS头是否正确设置

### 步骤2: 密码加密测试
1. **测试用户密码加密**
   - 导航到登录页面
   - 输入测试用户名和密码
   - 拦截网络请求查看密码传输

2. **验证密码哈希算法**
   ```javascript
   // 检查密码是否使用强哈希算法
   const checkPasswordHash = (password: string) => {
     // 密码不应以明文传输
     expect(password).not.toBe('plaintext-password');

     // 应使用bcrypt、PBKDF2或Argon2等强哈希
     const strongHashPatterns = [
       /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/, // bcrypt
       /^\$argon2id\$v=19\$m=65536,t=3,p=2/, // Argon2
       /^[a-f0-9]{64}:10000:/ // PBKDF2 with SHA256
     ];

     const isStrongHash = strongHashPatterns.some(pattern =>
       pattern.test(password)
     );

     expect(isStrongHash).toBe(true);
   };
   ```

3. **测试密码修改加密**
   - 导航到密码修改页面
   - 输入新密码并提交
   - 验证新密码在网络传输中被加密
   - 检查数据库存储的密码哈希

### 步骤3: 敏感字段加密测试
1. **测试个人信息加密**
   - 导航到家长中心 -> 个人信息
   - 查看手机号、身份证号等敏感字段
   - 检查这些字段在API响应中的加密状态

2. **验证API响应加密**
   ```javascript
   // 检查API响应中的敏感数据
   const checkSensitiveDataEncryption = (response: any) => {
     const sensitiveFields = ['phone', 'idCard', 'email', 'address'];

     for (const field of sensitiveFields) {
       if (response[field]) {
         // 敏感字段应该被加密或脱敏
         expect(response[field]).toMatch(/^\*+[\w\-\*]*$|^[a-f0-9]+$/);
       }
     }
   };
   ```

3. **测试文件上传加密**
   - 上传包含敏感信息的文件
   - 验证文件在传输过程中被加密
   - 检查服务器存储的文件加密状态

### 步骤4: Token和会话加密测试
1. **检查JWT Token加密**
   - 登录应用获取访问令牌
   - 使用jwt.io或类似工具分析Token
   - 验证Token使用强签名算法(RS256/ES256)

2. **验证Token安全性**
   ```javascript
   // 验证JWT Token格式和安全性
   const analyzeJWT = (token: string) => {
     const parts = token.split('.');
     expect(parts.length).toBe(3); // header.payload.signature

     const header = JSON.parse(atob(parts[0]));
     const payload = JSON.parse(atob(parts[1]));

     // 检查签名算法
     expect(header.alg).toMatch(/^(RS256|ES256|EdDSA)$/);

     // 检查过期时间
     expect(payload.exp).toBeGreaterThan(Date.now() / 1000);

     // 不应包含敏感信息
     expect(payload).not.toHaveProperty('password');
     expect(payload).not.toHaveProperty('ssn');
   };
   ```

3. **测试会话加密**
   - 检查Session Cookie的Secure属性
   - 验证HttpOnly和SameSite属性
   - 确认会话数据不被明文存储

### 步骤5: 数据库加密测试
1. **验证数据库字段加密**
   - 连接数据库查看敏感字段存储
   - 确认手机号、邮箱等字段被加密存储
   - 检查加密算法强度

2. **测试数据解密功能**
   - 通过应用查看个人信息页面
   - 验证加密数据能正确解密显示
   - 检查解密权限控制

3. **验证密钥管理**
   - 检查加密密钥是否安全存储
   - 验证密钥轮换机制
   - 确认密钥访问权限控制

## 预期结果

### 正确行为
1. **传输加密**: 所有网络通信使用HTTPS/TLS
2. **存储加密**: 敏感数据在数据库中加密存储
3. **Token安全**: JWT使用强签名算法
4. **会话保护**: Cookie设置适当的安全属性
5. **密钥管理**: 加密密钥安全存储和管理

### 安全要求
1. **强加密算法**: 使用AES-256、RSA-2048等强算法
2. **密钥安全**: 密钥不在代码中硬编码
3. **证书有效**: SSL/TLS证书有效且可信

## 严格验证要求

### 加密强度验证
```typescript
// 验证加密算法强度
const validateEncryptionStrength = (algorithm: string, keyLength: number) => {
  const strongAlgorithms = {
    symmetric: ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'],
    asymmetric: ['RSA-2048', 'RSA-4096', 'ECDSA-P256', 'ECDSA-P384'],
    hash: ['SHA-256', 'SHA-384', 'SHA-512', 'SHA3-256']
  };

  const isStrongSymmetric = strongAlgorithms.symmetric.includes(algorithm);
  const isStrongAsymmetric = strongAlgorithms.asymmetric.includes(algorithm);

  expect(isStrongSymmetric || isStrongAsymmetric).toBe(true);

  if (algorithm.startsWith('AES-')) {
    expect(keyLength).toBeGreaterThanOrEqual(256);
  } else if (algorithm.startsWith('RSA-')) {
    expect(keyLength).toBeGreaterThanOrEqual(2048);
  }
};
```

### 数据脱敏验证
```typescript
// 验证敏感数据脱敏
const validateDataMasking = (data: any, sensitiveFields: string[]) => {
  for (const field of sensitiveFields) {
    if (data[field]) {
      // 脱敏后的数据应该包含掩码字符
      expect(data[field]).toMatch(/[*]/);

      // 保留部分可识别信息
      if (field === 'phone') {
        expect(data[field]).toMatch(/^\d{3}\*{4}\d{4}$/);
      } else if (field === 'email') {
        expect(data[field]).toMatch(/^[a-zA-Z0-9._%+-]+@\*+\.\w+$/);
      }
    }
  }
};
```

### SSL/TLS验证
```typescript
// 验证SSL/TLS配置
const validateSSLConfig = async () => {
  const response = await fetch(window.location.href);

  // 检查HSTS头
  const hsts = response.headers.get('Strict-Transport-Security');
  expect(hsts).toBeTruthy();
  expect(hsts).toContain('max-age=');
  expect(hsts).toContain('includeSubDomains');

  // 检查其他安全头
  expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
};
```

## 测试数据

### 敏感数据示例
```typescript
const sensitiveTestData = {
  personalInfo: {
    name: '张三',
    phone: '13812345678',
    email: 'zhangsan@example.com',
    idCard: '110101199001011234',
    address: '北京市朝阳区某某街道123号'
  },
  financialInfo: {
    bankCard: '6222021234567890123',
    bankName: '中国工商银行',
    accountNumber: 'ACC123456789'
  }
};
```

### 加密算法测试用例
```typescript
const encryptionTestCases = [
  {
    type: 'symmetric',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    expected: 'strong'
  },
  {
    type: 'asymmetric',
    algorithm: 'RSA-2048',
    keySize: 2048,
    expected: 'strong'
  },
  {
    type: 'hash',
    algorithm: 'SHA-256',
    keySize: 256,
    expected: 'strong'
  }
];
```

## 通过/失败标准

### 通过标准
- [ ] 所有网络请求使用HTTPS
- [ ] 密码使用强哈希算法
- [ ] 敏感字段在传输和存储中加密
- [ ] JWT使用强签名算法
- [ ] Cookie设置安全属性
- [ ] SSL/TLS证书有效且配置正确
- [ ] 加密密钥安全管理

### 失败标准
- [ ] 发现HTTP明文传输
- [ ] 密码使用弱哈希或明文存储
- [ ] 敏感数据未加密
- [ ] JWT使用弱签名算法
- [ ] Cookie安全属性缺失
- [ ] SSL/TLS配置不当

## 测试环境要求

### 网络环境
- 支持HTTPS的测试环境
- 有效的SSL/TLS证书
- 网络监控工具

### 加密工具
- SSL/TLS分析工具
- JWT解析工具
- 数据库访问权限
- 网络抓包工具

## 风险评估

### 严重风险
- 敏感数据泄露
- 用户隐私被侵犯
- 身份盗用和金融损失

### 缓解措施
- 在安全的测试环境执行
- 使用虚拟或脱敏数据
- 严格控制测试数据访问

## 相关文档
- [数据加密最佳实践](../../../security/data-encryption.md)
- [移动端安全指南](../../../security/mobile-security.md)
- [密码安全策略](../../../security/password-security.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |