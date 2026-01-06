# TC-031: XSS攻击防护测试

## 测试用例标识
- **用例编号**: TC-031
- **测试组**: 安全性和权限边界测试
- **测试类型**: 安全测试
- **优先级**: 高

## 测试目标
验证移动端应用能够有效防护跨站脚本攻击(XSS)，确保用户输入被正确过滤和转义，防止恶意脚本执行。

## 测试前置条件
1. 应用已正常启动并运行在测试环境
2. 测试账号已准备就绪，具备基本操作权限
3. 测试设备已连接到网络
4. 浏览器开发者工具已准备就绪

## 测试步骤

### 步骤1: 输入框XSS注入测试
1. **登录到移动端应用**
   - 打开应用登录页面
   - 输入有效用户名和密码
   - 点击登录按钮，验证登录成功

2. **导航到包含文本输入的页面**
   - 访问家长中心 -> 智能助手
   - 确保页面完全加载

3. **执行基础XSS注入测试**
   ```
   测试输入1: <script>alert('XSS Test')</script>
   测试输入2: <img src="x" onerror="alert('XSS')">
   测试输入3: <svg onload="alert('XSS')">
   测试输入4: javascript:alert('XSS')
   测试输入5: ';alert('XSS');//
   ```

4. **在智能助手输入框中注入恶意脚本**
   - 逐一输入上述测试字符串
   - 点击发送按钮
   - 观察页面响应和浏览器行为

5. **验证脚本是否被执行**
   - 检查是否出现alert弹窗
   - 查看浏览器控制台是否有错误信息
   - 验证页面DOM是否被恶意修改

### 步骤2: URL参数XSS测试
1. **通过URL参数注入XSS**
   ```
   测试URL1: /mobile/parent?message=<script>alert('XSS')</script>
   测试URL2: /mobile/parent?search=<img src="x" onerror="alert('XSS')">
   测试URL3: /mobile/parent?name=<svg onload="alert('XSS')">
   ```

2. **访问恶意URL**
   - 在浏览器地址栏输入上述URL
   - 观察页面加载和渲染过程

3. **验证XSS防护**
   - 检查URL参数是否被正确显示（未执行）
   - 验证页面内容是否被恶意脚本影响
   - 查看控制台错误日志

### 步骤3: 存储型XSS测试
1. **在数据库存储中注入XSS**
   - 导航到家长中心 -> 表单提交
   - 在表单字段中输入XSS测试字符串
   - 提交表单保存数据

2. **验证存储数据的安全性**
   - 重新访问页面查看已保存数据
   - 确认存储的XSS字符串被正确转义显示
   - 验证脚本未被执行

### 步骤4: DOM型XSS测试
1. **测试动态DOM操作**
   - 访问包含动态内容的页面
   - 通过JavaScript修改DOM内容
   - 验证innerHTML和textContent的区别

2. **测试事件处理器注入**
   ```
   测试输入: <div onclick="alert('XSS')">Click me</div>
   ```

3. **验证事件处理器安全性**
   - 检查恶意事件处理器是否被绑定
   - 验证点击操作是否触发恶意代码

## 预期结果

### 正确行为
1. **输入过滤**: 所有XSS注入尝试应被系统拦截或转义
2. **脚本阻止**: 恶意JavaScript代码不应被执行
3. **安全显示**: 恶意内容应以纯文本形式显示
4. **无弹窗**: 不应出现任何JavaScript alert弹窗
5. **控制台清洁**: 浏览器控制台不应出现脚本执行错误

### 错误处理
1. **输入验证失败**: 系统应返回适当的错误信息
2. **请求拦截**: 包含恶意内容的请求应被拒绝
3. **日志记录**: 所有XSS尝试应被记录到安全日志

## 严格验证要求

### 数据结构验证
```typescript
// 验证API响应结构
validateRequiredFields(response, ['success', 'message', 'data']);
validateFieldTypes(response, {
  success: 'boolean',
  message: 'string',
  data: 'object'
});
```

### XSS防护验证
```typescript
// 验证输入是否被正确转义
const sanitizeInput = (input: string): string => {
  const escapeMap: { [key: string]: string } = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return input.replace(/[<>"'/]/g, (char) => escapeMap[char]);
};
```

### 安全性验证
```typescript
// 验证脚本是否被执行
const verifyScriptNotExecuted = () => {
  // 检查是否有alert弹窗
  expect(window.alert).not.toHaveBeenCalled();

  // 检查DOM是否被修改
  const scripts = document.querySelectorAll('script');
  expect(scripts.length).toBe(0);

  // 检查控制台错误
  expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('XSS'));
};
```

## 测试数据

### XSS攻击向量
```typescript
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src="x" onerror="alert("XSS")">',
  '<svg onload="alert("XSS")">',
  '<iframe src="javascript:alert("XSS")">',
  '<body onload="alert("XSS")">',
  '<input autofocus onfocus="alert("XSS")">',
  '<select onfocus="alert("XSS")" autofocus>',
  '<textarea onfocus="alert("XSS")" autofocus>',
  '<keygen onfocus="alert("XSS")" autofocus>',
  '<video><source onerror="alert("XSS")">',
  '<details open ontoggle="alert("XSS")">',
  '<marquee onstart="alert("XSS")">test</marquee>'
];
```

### 测试账号
```typescript
const testAccounts = [
  { username: 'parent1', password: 'password123', role: 'parent' },
  { username: 'teacher1', password: 'password123', role: 'teacher' }
];
```

## 通过/失败标准

### 通过标准
- [ ] 所有XSS注入尝试都被成功拦截
- [ ] 恶意脚本未在页面中执行
- [ ] 用户输入被正确转义和显示
- [ ] 系统保持稳定，无崩溃或异常
- [ ] 安全日志正确记录XSS尝试
- [ ] 所有API响应符合预期结构

### 失败标准
- [ ] 出现JavaScript alert弹窗
- [ ] DOM被恶意脚本修改
- [ ] 控制台出现脚本执行错误
- [ ] 系统崩溃或响应异常
- [ ] 恶意内容被直接执行未转义

## 测试环境要求

### 浏览器环境
- Chrome Mobile (Android)
- Safari Mobile (iOS)
- Firefox Mobile

### 设备要求
- Android 8.0+
- iOS 12.0+
- 屏幕尺寸: 4.7" - 6.7"

### 网络条件
- 稳定的WiFi连接
- 移动网络 (4G/5G)

## 风险评估

### 高风险
- 脚本注入可能导致用户数据泄露
- 恶意代码可能破坏应用功能

### 缓解措施
- 所有测试在隔离环境进行
- 使用测试账号，避免生产数据风险
- 测试后清理所有测试数据

## 相关文档
- [Web安全防护指南](../../../security/web-protection.md)
- [XSS攻击防护最佳实践](../../../security/xss-prevention.md)
- [输入验证规范](../../../security/input-validation.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |