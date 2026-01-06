# GitHub Enterprise Runners 配置指南

## 概述

本指南帮助你将现有的 GitHub 组织级 self-hosted runners 升级为企业级 runners，以支持 GitHub Team 许可证的企业功能。

## 当前配置分析

**现有配置:**
```bash
./config.sh --url https://github.com/yyupcompany --token BQTHZLMLF4YOMY5ZJLBF6LDISXX5O
```

**新配置 (企业级):**
```bash
./config.sh --url https://github.com/enterprises/yyup-enterprise --token <ENTERPRISE_TOKEN>
```

## 准备工作

### 1. 获取企业级 Registration Token

1. 登录 GitHub Enterprise 账户
2. 进入企业设置页面: `https://github.com/enterprises/YOUR_ENTERPRISE/settings`
3. 选择 **Actions** → **Runners**
4. 点击 **New runner**
5. 选择 **Linux x64**
6. 复制显示的 registration token

### 2. 确认企业名称

确认你的 GitHub 企业名称，通常格式为: `https://github.com/enterprises/ENTERPRISE_NAME`

## 快速部署（推荐）

### 方法 1: 使用 Docker Compose（推荐）

```bash
# 1. 进入项目服务端目录
cd /f/kyyup730/lazy-ai-substitute-project/server

# 2. 赋予执行权限
chmod +x deploy-enterprise-runners.sh

# 3. 执行部署脚本
./deploy-enterprise-runners.sh <ENTERPRISE_REGISTRATION_TOKEN> [ENTERPRISE_NAME]

# 示例:
./deploy-enterprise-runners.sh ABCD1234EFGH5678 yyup-enterprise
```

### 方法 2: 使用纯 Docker

```bash
# 1. 赋予执行权限
chmod +x docker-enterprise-runner-setup.sh

# 2. 执行配置脚本
./docker-enterprise-runner-setup.sh <ENTERPRISE_REGISTRATION_TOKEN>
```

### 方法 3: 传统方式（如果不使用 Docker）

```bash
# 1. 赋予执行权限
chmod +x reconfigure-enterprise-runner.sh

# 2. 执行重新配置
./reconfigure-enterprise-runner.sh <OLD_TOKEN> <ENTERPRISE_REGISTRATION_TOKEN>
```

## 企业级配置特点

### 与组织级的区别

| 特性 | 组织级 | 企业级 |
|------|--------|--------|
| URL 格式 | `https://github.com/ORG_NAME` | `https://github.com/enterprises/ENTERPRISE_NAME` |
| 适用范围 | 单个组织 | 整个企业（多个组织） |
| 权限级别 | 组织权限 | 企业权限 |
| 标签建议 | `org,self-hosted` | `enterprise,self-hosted,team-licensed` |

### 企业级配置参数

```yaml
environment:
  - GITHUB_REPOSITORY_URL=https://github.com/enterprises/yyup-enterprise
  - GITHUB_TOKEN=${ENTERPRISE_REGISTRATION_TOKEN}
  - GITHUB_RUNNER_NAME=enterprise-docker-runner-1
  - GITHUB_RUNNER_LABELS=enterprise,docker,self-hosted,linux,team-licensed
  - GITHUB_RUNNER_GROUP=Default
```

## 验证部署

### 1. 检查容器状态

```bash
# 查看所有企业级 runners
docker ps | grep github-enterprise-runner

# 检查健康状态
for i in {1..4}; do
    docker inspect --format='{{.State.Health.Status}}' "github-enterprise-runner-$i"
done
```

### 2. 查看注册日志

```bash
# 查看特定 runner 的注册日志
docker logs github-enterprise-runner-1

# 查看所有 runners 日志
docker-compose -f docker-compose.enterprise-runners.yml logs
```

### 3. GitHub 页面验证

访问: `https://github.com/enterprises/YOUR_ENTERPRISE/settings/actions/runners`

应该能看到 4 个名为 `enterprise-docker-runner-1` 到 `enterprise-docker-runner-4` 的在线 runners。

## 管理和维护

### 日常管理命令

```bash
# 使用便捷脚本
cd /f/kyyup730/github-runners
./enterprise-runners-ctl.sh status    # 查看状态
./enterprise-runners-ctl.sh logs 1    # 查看 Runner-1 日志
./enterprise-runners-ctl.sh restart   # 重启所有
./enterprise-runners-ctl.sh update    # 更新镜像
```

### Docker Compose 命令

```bash
# 启动
docker-compose -f docker-compose.enterprise-runners.yml up -d

# 停止
docker-compose -f docker-compose.enterprise-runners.yml down

# 查看状态
docker-compose -f docker-compose.enterprise-runners.yml ps

# 查看日志
docker-compose -f docker-compose.enterprise-runners.yml logs -f
```

## 工作流配置更新

### 更新现有工作流

将你的 `.github/workflows/claude-code-action.yml` 中的 `runs-on` 更新为:

```yaml
jobs:
  claude-response:
    runs-on: [self-hosted, enterprise, team-licensed]  # 使用企业级标签
    # 或者使用特定 runner
    # runs-on: [self-hosted, runner-1]
```

### 企业级工作流示例

```yaml
name: Enterprise Claude Assistant
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude-response:
    runs-on: [self-hosted, enterprise, team-licensed]
    permissions:
      issues: write
      contents: read
      pull-requests: write  # 企业级额外权限
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@beta
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          max_turns: "10"  # 企业版支持更多轮次
```

## 故障排除

### 常见问题

1. **Token 过期**
   ```bash
   # 获取新 token 并重新部署
   ./deploy-enterprise-runners.sh <NEW_TOKEN>
   ```

2. **容器启动失败**
   ```bash
   # 查看详细日志
   docker logs github-enterprise-runner-1
   
   # 检查权限
   ls -la /var/run/docker.sock
   ```

3. **注册失败**
   - 确认企业名称正确
   - 确认 token 未过期
   - 检查网络连接

### 日志级别调整

编辑 `.env` 文件:
```bash
# 启用详细日志
VERBOSE_LOGGING=true
LOG_LEVEL=DEBUG
```

然后重启服务:
```bash
docker-compose -f docker-compose.enterprise-runners.yml restart
```

## 安全考虑

1. **Token 管理**
   - 定期更换 registration token
   - 不要在代码中硬编码 token
   - 使用环境变量或 secrets

2. **网络安全**
   - 企业级 runners 运行在隔离网络中
   - 定期更新 Docker 镜像
   - 监控 runner 活动日志

3. **权限控制**
   - 只为必要的仓库启用 runners
   - 定期审核 runner 权限
   - 使用最小权限原则

## 备份和恢复

### 备份配置

```bash
# 备份当前配置
cp -r /f/kyyup730/github-runners /f/kyyup730/github-runners-backup-$(date +%Y%m%d)

# 导出 Docker 镜像
docker save sumologic/docker-github-actions-runner > github-runner-image.tar
```

### 恢复步骤

```bash
# 1. 恢复配置目录
cp -r /f/kyyup730/github-runners-backup-YYYYMMDD /f/kyyup730/github-runners

# 2. 重新部署
./deploy-enterprise-runners.sh <TOKEN>
```

## 性能优化

### 缓存配置

```yaml
volumes:
  - ../github-runners/runner-cache-1:/runner-cache  # 持久化缓存
  - ../github-runners/npm-cache:/root/.npm          # NPM 缓存
  - ../github-runners/docker-cache:/var/lib/docker  # Docker 构建缓存
```

### 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

## 支持联系

如果遇到问题：

1. 查看日志: `docker logs github-enterprise-runner-1`
2. 检查 GitHub 企业设置页面
3. 验证 token 有效性
4. 确认网络连接

---

**注意**: 企业级 runners 需要有效的 GitHub Team 或 Enterprise 许可证。确保你的企业账户已正确配置并具有必要的权限。