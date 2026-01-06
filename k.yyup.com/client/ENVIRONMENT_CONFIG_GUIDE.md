# 环境配置管理系统指南

## 🚨 严格模式标准

本项目已实施**零硬编码**的环境配置管理系统，所有配置通过环境变量动态管理。

## 📋 配置文件结构

### 核心配置文件

| 文件名 | 用途 | 特点 |
|--------|------|------|
| `.env.template` | 环境变量模板系统 | 统一管理所有配置项 |
| `.env.example` | 开发环境参考配置 | 提供标准配置示例 |
| `.env.development` | 开发环境配置 | 移除所有硬编码域名 |
| `.env` | 默认/生产环境配置 | 完全基于环境变量 |
| `.env.production` | 生产环境配置 | 生产专用配置 |

## 🔧 配置项详解

### API 配置系统

```bash
# API代理目标 - 支持IPv4和IPv6
VITE_API_PROXY_TARGET=${API_PROXY_TARGET:-http://127.0.0.1:3000}

# API基础URL - 开发/生产环境自动适配
VITE_API_BASE_URL=${API_BASE_URL:-/api}

# API域名列表 - CORS配置
VITE_API_DOMAINS=${API_DOMAINS}
```

### 应用配置系统

```bash
# 应用URL - 无硬编码
VITE_APP_URL=${APP_URL}
VITE_APP_NAME=${APP_NAME:-幼儿园管理系统}

# 统一租户中心配置
VITE_UNIFIED_TENANT_URL=${UNIFIED_TENANT_URL}
VITE_TENANT_DOMAIN=${TENANT_DOMAIN}
```

### 开发服务器配置

```bash
# 开发服务器 - 灵活端口配置
VITE_DEV_HOST=${DEV_HOST:-0.0.0.0}
VITE_DEV_PORT=${DEV_PORT:-5173}

# HMR配置 - WebSocket支持
VITE_HMR_HOST=${HMR_HOST:-localhost}
VITE_HMR_CLIENT_PORT=${HMR_CLIENT_PORT:-24678}
VITE_HMR_PROTOCOL=${HMR_PROTOCOL:-ws}
```

## 🚀 部署配置示例

### 本地开发环境

```bash
# 复制开发配置
cp .env.example .env.local

# 设置环境变量
export API_PROXY_TARGET=http://127.0.0.1:3000
export APP_URL=http://localhost:5173
export DEV_PORT=5173
```

### 测试环境

```bash
# 环境变量配置
export API_PROXY_TARGET=https://test-api.example.com
export APP_URL=https://test.example.com
export UNIFIED_TENANT_URL=https://test-tenant.example.com
export API_DOMAINS=test.example.com,test-api.example.com
```

### 生产环境

```bash
# 环境变量配置
export API_PROXY_TARGET=https://api.example.com
export APP_URL=https://example.com
export UNIFIED_TENANT_URL=https://tenant.example.com
export API_DOMAINS=example.com,api.example.com,tenant.example.com

# 安全配置
export DEBUG=false
export ENABLE_DEBUG=false
export SOURCEMAP=false
```

## 🛡️ 安全配置

### 生产环境安全

```bash
# 关闭调试模式
VITE_DEBUG=false
VITE_ENABLE_DEBUG=false

# 关闭源码映射
VITE_SOURCEMAP=false

# 启用CSP
VITE_ENABLE_CSP=true
VITE_CSP_NONCE=${CSP_NONCE}
```

### CORS 配置

```bash
# 配置允许的域名
VITE_API_DOMAINS=example.com,api.example.com,cdn.example.com
```

## 🔍 配置验证

### 检查硬编码

```bash
# 检查环境配置文件中的硬编码域名
grep -r "http://" client/.env*
grep -r "https://" client/.env*
grep -r "localhost" client/.env*

# 应该只显示模板变量，不应有硬编码域名
```

### Vite 配置验证

```bash
# 启动开发服务器验证配置
cd client && npm run dev

# 检查代理配置
grep -n "VITE_API_PROXY_TARGET" vite.config.ts
```

## 📝 环境变量最佳实践

### 1. 命名规范

- 使用 `VITE_` 前缀
- 使用大写字母和下划线
- 分组和层次结构命名

### 2. 默认值设置

```bash
# 使用默认值语法
VITE_API_TIMEOUT=${API_TIMEOUT:-15000}
VITE_DEV_PORT=${DEV_PORT:-5173}
```

### 3. 环境隔离

```bash
# 开发环境
VITE_DEBUG=true
VITE_SOURCEMAP=true

# 生产环境
VITE_DEBUG=false
VITE_SOURCEMAP=false
```

## 🔄 配置迁移

### 从硬编码迁移到环境变量

1. **识别硬编码**：
   ```bash
   # 查找所有硬编码域名
   grep -r "k\.yyup\.cc" client/
   grep -r "rent\.yyup\.cc" client/
   ```

2. **创建环境变量**：
   ```bash
   export APP_URL=https://k.yyup.cc
   export UNIFIED_TENANT_URL=https://rent.yyup.cc
   ```

3. **更新配置文件**：
   ```bash
   VITE_APP_URL=${APP_URL}
   VITE_UNIFIED_TENANT_URL=${UNIFIED_TENANT_URL}
   ```

## 🎯 配置测试

### 单元测试

```typescript
// 测试环境配置加载
describe('Environment Config', () => {
  it('should load API proxy target from env', () => {
    expect(process.env.VITE_API_PROXY_TARGET).toBeDefined()
  })

  it('should have default values', () => {
    expect(process.env.VITE_API_TIMEOUT).toBe('15000')
  })
})
```

### 集成测试

```bash
# 测试不同环境配置
NODE_ENV=production npm run build
NODE_ENV=development npm run dev
```

## 📊 配置监控

### 环境变量检查脚本

```bash
#!/bin/bash
# check-env-config.sh

echo "🔍 检查环境配置..."

# 检查必需的环境变量
required_vars=(
  "VITE_API_PROXY_TARGET"
  "VITE_APP_URL"
  "VITE_UNIFIED_TENANT_URL"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ 缺少环境变量: $var"
    exit 1
  fi
done

echo "✅ 环境配置检查通过"
```

## 🚨 故障排除

### 常见问题

1. **API代理失败**
   - 检查 `VITE_API_PROXY_TARGET` 配置
   - 验证网络连接

2. **HMR连接问题**
   - 检查 `VITE_HMR_HOST` 和 `VITE_HMR_CLIENT_PORT`
   - 确保防火墙允许WebSocket连接

3. **CORS错误**
   - 检查 `VITE_API_DOMAINS` 配置
   - 验证后端CORS设置

### 调试命令

```bash
# 显示环境变量
printenv | grep VITE_

# 测试代理配置
curl -H "Host: localhost" http://127.0.0.1:3000/api/health

# 验证配置文件
npm run config:validate
```

## 📚 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js 环境变量最佳实践](https://nodejs.org/api/process.html#process_process_env)
- [Docker 环境变量配置](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables-e--env---env-file)

---

**维护说明**：此配置系统确保零硬编码，所有配置通过环境变量管理。修改配置时请使用环境变量，避免在代码中硬编码任何域名、端口或路径。