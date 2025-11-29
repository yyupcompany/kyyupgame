# Node.js环境配置

<cite>
**本文档引用的文件**  
- [package.json](file://k.yyup.com/package.json)
- [unified-tenant-system/package.json](file://unified-tenant-system/package.json)
- [.env](file://k.yyup.com/.env)
- [.env.development](file://k.yyup.com/.env.development)
- [.env.production](file://k.yyup.com/.env.production)
- [.npmrc](file://k.yyup.com/.npmrc)
- [Dockerfile](file://k.yyup.com/Dockerfile)
- [unified-tenant-system/Dockerfile](file://unified-tenant-system/Dockerfile)
- [docker-compose.yml](file://k.yyup.com/docker-compose.yml)
- [unified-tenant-system/docker-compose.yml](file://unified-tenant-system/docker-compose.yml)
</cite>

## 目录
1. [Node.js版本要求](#nodejs版本要求)
2. [Node.js安装与多版本管理](#nodejs安装与多版本管理)
3. [包管理器配置](#包管理器配置)
4. [环境变量配置](#环境变量配置)
5. [开发环境配置最佳实践](#开发环境配置最佳实践)
6. [常见问题解决方案](#常见问题解决方案)

## Node.js版本要求

根据项目Dockerfile配置，k.yyupgame项目使用Node.js 18作为基础运行环境。虽然文档建议使用v16+版本，但实际生产环境已升级至Node.js 18，建议开发者使用Node.js 18或更高版本以确保与生产环境的一致性。

项目采用现代Node.js特性（如ES模块），package.json中"type": "module"的配置表明项目使用ES6模块系统，这需要Node.js 14+版本支持，推荐使用LTS版本以获得最佳兼容性和稳定性。

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L1-L2)
- [package.json](file://k.yyup.com/package.json#L2)

## Node.js安装与多版本管理

### Node.js LTS版本安装步骤

1. **通过官方安装程序安装**：
   - 访问[Node.js官方网站](https://nodejs.org)
   - 下载LTS版本（长期支持版本）
   - 运行安装程序并按照向导完成安装

2. **通过包管理器安装**：
   - **Windows**：使用Chocolatey `choco install nodejs`
   - **macOS**：使用Homebrew `brew install node`
   - **Linux**：使用系统包管理器，如Ubuntu `sudo apt-get install nodejs npm`

### 使用nvm进行多版本管理

nvm（Node Version Manager）是管理多个Node.js版本的最佳工具：

```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 或者在Windows上使用nvm-windows
# 下载nvm-setup.exe并安装

# 安装特定版本的Node.js
nvm install 16
nvm install 18
nvm install 20

# 使用特定版本
nvm use 18

# 设置默认版本
nvm alias default 18

# 查看已安装版本
nvm list
```

项目建议设置Node.js 18为默认版本，以匹配Docker环境中的配置。

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L1-L2)

## 包管理器配置

### npm配置优化

项目包含.npmrc配置文件，提供了性能优化设置：

```ini
# 设置国内镜像源加速安装
registry=https://registry.npmmirror.com/

# 最大并发网络请求数
maxsockets=50

# 启用并行安装
prefer-offline=false

# 重试配置
fetch-retries=3
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000

# 日志级别
loglevel=error

# 缓存配置
cache-min=3600

# 并发安装数量
concurrent-installs=50
```

这些配置显著提升了在大型项目中的依赖安装速度，特别是在网络环境较差的情况下。

### yarn安装与配置

虽然项目主要使用npm，但也可以使用yarn：

```bash
# 全局安装yarn
npm install -g yarn

# 初始化yarn项目
yarn init

# 安装依赖
yarn install

# 添加依赖
yarn add package-name
```

**Section sources**
- [.npmrc](file://k.yyup.com/.npmrc#L1-L23)

## 环境变量配置

### 环境变量文件结构

项目采用标准的环境变量配置模式，包含多个环境的配置文件：

- `.env`：默认环境变量
- `.env.development`：开发环境变量
- `.env.production`：生产环境变量

### 环境变量示例

```bash
# .env - 默认配置
PUBLIC_BUILDER_KEY=b43bda84b6fe433783752fd226949fa0

# .env.development - 开发环境
JWT_SECRET=your_secret_key
JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://k.yyup.cc
VITE_WS_URL=wss://tphezdvikvva.sealoshzh.site
VITE_APP_URL=https://k.yyup.cc

# .env.production - 生产环境
VITE_API_BASE_URL=https://k.yyup.cc
VITE_WS_URL=wss://k.yyup.cc
VITE_APP_URL=https://k.yyup.cc
```

### 环境变量最佳实践

1. **敏感信息保护**：
   - 永远不要将敏感信息（如数据库密码、API密钥）提交到版本控制
   - 使用环境变量而不是硬编码
   - 对于开发环境，可以使用占位符或示例值

2. **跨平台兼容性**：
   - 使用dotenv库确保环境变量在不同操作系统上的一致性
   - 避免使用操作系统特定的路径分隔符
   - 在package.json脚本中使用cross-env确保跨平台兼容

3. **环境隔离**：
   - 为不同环境（开发、测试、生产）使用不同的配置
   - 使用NODE_ENV变量控制应用行为
   - 在构建过程中根据环境变量生成不同的配置

**Section sources**
- [.env](file://k.yyup.com/.env#L1-L3)
- [.env.development](file://k.yyup.com/.env.development#L1-L7)
- [.env.production](file://k.yyup.com/.env.production#L1-L5)

## 开发环境配置最佳实践

### 验证Node.js和npm安装

安装完成后，验证环境是否正确配置：

```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查Node.js安装路径
which node

# 测试Node.js运行
node -e "console.log('Node.js is working!')"

# 测试npm功能
npm list -g --depth=0
```

### 项目初始化步骤

```bash
# 1. 克隆项目
git clone https://github.com/yyupcompany/k.yyup.com.git

# 2. 进入项目目录
cd k.yyup.com

# 3. 使用nvm切换到推荐的Node.js版本
nvm use 18

# 4. 安装依赖
npm run install:all

# 5. 启动开发服务器
npm run dev
```

### Docker环境配置

项目提供Docker支持，确保环境一致性：

```bash
# 构建并启动容器
docker-compose up --build

# 在后台运行
docker-compose up -d

# 查看容器状态
docker-compose ps
```

Dockerfile显示项目使用node:18-alpine作为基础镜像，确保了开发、测试和生产环境的一致性。

```mermaid
graph TD
A[开发者本地环境] --> B[Node.js 18]
C[Docker容器环境] --> B[Node.js 18]
D[生产服务器环境] --> B[Node.js 18]
B --> E[一致的运行时环境]
```

**Diagram sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L1-L2)
- [docker-compose.yml](file://k.yyup.com/docker-compose.yml#L3-L5)

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L1-L83)
- [docker-compose.yml](file://k.yyup.com/docker-compose.yml#L1-L42)

## 常见问题解决方案

### 权限错误

在Linux/macOS系统上安装全局包时可能遇到权限错误：

```bash
# 错误示例
npm ERR! Error: EACCES: permission denied

# 解决方案1：使用nvm（推荐）
# nvm自动处理权限问题

# 解决方案2：更改npm默认目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# 将~/.npm-global/bin添加到PATH

# 解决方案3：使用sudo（不推荐）
sudo npm install -g package-name
```

### 网络代理配置

在受限网络环境中，需要配置npm代理：

```bash
# 设置HTTP代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 如果需要认证
npm config set proxy http://username:password@proxy.company.com:8080

# 取消代理设置
npm config delete proxy
npm config delete https-proxy
```

### 国内镜像加速

对于中国开发者，配置国内镜像源可显著提升下载速度：

```bash
# 设置淘宝镜像源
npm config set registry https://registry.npmmirror.com/

# 临时使用
npm install -registry https://registry.npmmirror.com/

# 恢复官方源
npm config set registry https://registry.npmjs.org/
```

项目已通过.npmrc文件预配置了国内镜像源，无需额外设置。

### 依赖安装问题

当遇到依赖安装问题时：

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 或使用npm ci（推荐用于CI/CD）
npm ci
```

**Section sources**
- [.npmrc](file://k.yyup.com/.npmrc#L1-L23)