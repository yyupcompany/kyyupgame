# Docker环境准备

<cite>
**本文档引用的文件**  
- [Dockerfile](file://k.yyup.com/Dockerfile)
- [docker-compose.yml](file://k.yyup.com/docker-compose.yml)
- [nginx.conf](file://k.yyup.com/nginx.conf)
- [start-all.sh](file://k.yyup.com/start-all.sh)
- [entrypoint.sh](file://k.yyup.com/entrypoint.sh)
- [docker/supervisord.conf](file://k.yyup.com/docker/supervisord.conf)
- [docker/health-check.sh](file://k.yyup.com/docker/health-check.sh)
- [Dockerfile.simple](file://k.yyup.com/Dockerfile.simple)
- [docker-compose.simple.yml](file://k.yyup.com/docker-compose.simple.yml)
- [docker-compose.dev.yml](file://k.yyup.com/docker-compose.dev.yml)
</cite>

## 目录
1. [Docker环境准备](#docker环境准备)
2. [Dockerfile多阶段构建策略](#dockerfile多阶段构建策略)
3. [容器启动脚本start.sh分析](#容器启动脚本startsh分析)
4. [Nginx反向代理配置](#nginx反向代理配置)
5. [Docker环境依赖安装](#docker环境依赖安装)
6. [Docker环境验证清单](#docker环境验证清单)

## Dockerfile多阶段构建策略

项目采用多阶段Docker构建策略，通过一个Dockerfile完成前端构建和后端服务的配置。构建过程分为多个阶段，充分利用Docker缓存机制提高构建效率。

构建流程首先使用Node.js 18 Alpine作为基础镜像，安装Nginx、Supervisor和必要的构建工具。然后分步复制package.json文件以利用Docker缓存，先安装前端和后端的依赖，再复制完整的源代码。这种分步复制策略确保了当源代码发生变化时，不会重新安装依赖，从而加快构建速度。

前端构建阶段使用Vite进行生产环境构建，生成静态文件。后端服务采用ts-node直接运行TypeScript代码，无需预编译。构建完成后，配置Nginx作为反向代理服务器，Supervisor作为进程管理器，同时配置健康检查脚本确保服务稳定性。

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L1-L83)

## 容器启动脚本start.sh分析

`start-all.sh`脚本是项目的主要启动脚本，负责管理前后端服务的启动、停止和状态检查。脚本采用模块化设计，包含多个功能函数：

- `check_and_kill_port`: 检查并清理指定端口的占用进程
- `check_dependencies`: 检查并安装前后端依赖
- `start_backend`: 启动后端Express服务
- `start_frontend`: 启动前端Vite开发服务器
- `stop_services`: 停止所有运行的服务
- `show_status`: 显示当前服务状态

脚本支持多种命令模式，包括`start`（启动所有服务）、`frontend`（仅启动前端）、`backend`（仅启动后端）、`stop`（停止服务）、`status`（查看状态）和`restart`（重启服务）。启动时会自动检查依赖、清理端口占用，并记录进程ID以便后续管理。

脚本还实现了优雅的错误处理和日志输出，使用颜色编码区分不同类型的日志信息，提高了可读性和调试效率。

**Section sources**
- [start-all.sh](file://k.yyup.com/start-all.sh#L1-L289)

## Nginx反向代理配置

Nginx配置文件实现了完整的反向代理功能，将前端静态资源服务和后端API请求统一管理。主要配置要点包括：

### 静态资源服务
配置了前端构建文件的根目录，通过`try_files`指令实现单页应用的路由支持。对JS、CSS、图片等静态文件设置了1年的缓存有效期，并添加了`immutable`缓存控制头，优化了前端性能。

### 反向代理配置
将`/api`路径的请求代理到后端服务（localhost:3000），配置了WebSocket升级头以支持实时通信。设置了60秒的连接、发送和读取超时，确保请求的稳定性。

### CORS跨域处理
实现了智能的CORS策略，通过正则表达式匹配允许的源（k.yyup.cc及其子域名），动态设置`Access-Control-Allow-Origin`响应头，既保证了安全性又支持了开发需求。

### 安全配置
启用了HTTPS重定向，强制HTTP请求跳转到HTTPS。配置了严格的安全头，包括HSTS、X-Frame-Options、X-Content-Type-Options等，提升了应用的安全性。

### 其他特性
配置了Gzip压缩以减少传输数据量，设置了详细的访问和错误日志，便于问题排查和性能分析。

**Section sources**
- [nginx.conf](file://k.yyup.com/nginx.conf#L1-L119)

## Docker环境依赖安装

### Docker Engine安装
项目要求Docker Engine 20.10或更高版本。安装步骤如下：

1. **系统准备**：确保系统为Ubuntu 20.04或更高版本
2. **安装依赖**：
```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
```
3. **添加Docker官方GPG密钥**：
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
4. **添加Docker仓库**：
```bash
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
5. **安装Docker Engine**：
```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### Docker Compose安装
项目要求Docker Compose 2.0或更高版本。安装方法：

1. **下载最新版本**：
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
2. **设置执行权限**：
```bash
sudo chmod +x /usr/local/bin/docker-compose
```
3. **验证安装**：
```bash
docker-compose --version
```

### 权限配置
将当前用户添加到docker组，避免每次使用sudo：
```bash
sudo usermod -aG docker $USER
```

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L7-L14)
- [docker-compose.yml](file://k.yyup.com/docker-compose.yml#L1-L42)

## Docker环境验证清单

为确保Docker环境正确配置，建议按照以下清单进行验证：

### 基础环境验证
- [ ] Docker Engine版本是否为20.10或更高
- [ ] Docker Compose版本是否为2.0或更高
- [ ] 当前用户是否已添加到docker组
- [ ] Docker服务是否正常运行

### 构建过程验证
- [ ] 能否成功构建Docker镜像
- [ ] 构建过程中依赖安装是否正常
- [ ] 前端构建是否成功生成dist目录
- [ ] 多阶段构建是否按预期执行

### 服务运行验证
- [ ] 容器能否正常启动
- [ ] Nginx服务是否正常运行
- [ ] 后端API服务是否可访问
- [ ] 健康检查是否通过

### 网络配置验证
- [ ] 端口映射是否正确（80端口暴露）
- [ ] 反向代理配置是否生效
- [ ] 静态资源是否能正常加载
- [ ] API请求是否能正确转发

### 功能完整性验证
- [ ] Supervisor是否能正确管理所有进程
- [ ] 日志文件是否正常生成
- [ ] 文件权限设置是否正确
- [ ] 非root用户运行是否正常

通过以上验证清单，可以确保Docker环境的完整性和稳定性，为项目的顺利运行提供保障。

**Section sources**
- [Dockerfile](file://k.yyup.com/Dockerfile#L73-L74)
- [docker/health-check.sh](file://k.yyup.com/docker/health-check.sh#L1-L25)
- [docker/supervisord.conf](file://k.yyup.com/docker/supervisord.conf#L1-L30)