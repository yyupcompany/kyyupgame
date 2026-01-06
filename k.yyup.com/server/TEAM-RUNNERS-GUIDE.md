# GitHub Team 版本 Self-hosted Runners 配置指南

## 概述

本指南专门针对 **GitHub Team 版本**用户，帮助配置组织级 self-hosted runners 以支持 Claude Code Action。

## GitHub Team vs Enterprise 对比

| 特性 | GitHub Team | GitHub Enterprise |
|------|-------------|-------------------|
| 适用范围 | 单个组织 | 多组织企业 |
| Runner 级别 | 组织级 | 企业级 |
| URL 格式 | `https://github.com/ORG_NAME` | `https://github.com/enterprises/ENTERPRISE_NAME` |
| 配置复杂度 | 中等 | 较高 |
| 许可证成本 | 较低 | 较高 |

## 当前配置分析

**你的现有配置:**
```bash
./config.sh --url https://github.com/yyupcompany --token BQTHZLMLF4YOMY5ZJLBF6LDISXX5O
```

**✅ 正确！** 这已经是组织级配置，适合 GitHub Team 版本。

## 快速部署（推荐）

### 第一步：获取组织级 Registration Token

1. 访问组织设置页面: `https://github.com/yyupcompany/settings`
2. 选择 **Actions** → **Runners**
3. 点击 **New self-hosted runner**
4. 选择 **Linux x64**
5. 复制新的 registration token

### 第二步：部署 Team Runners

```bash
# 进入项目服务端目录
cd /f/kyyup730/lazy-ai-substitute-project/server

# 赋予执行权限
chmod +x deploy-team-runners.sh

# 执行部署（使用新 token）
./deploy-team-runners.sh <NEW_TEAM_REGISTRATION_TOKEN> yyupcompany
```

### 第三步：验证部署

```bash
# 赋予执行权限
chmod +x verify-team-setup.sh

# 运行验证
./verify-team-setup.sh yyupcompany
```

## 手动部署方式

### 方法 1: Docker Compose

```bash
# 1. 创建环境变量文件
cat > .env << EOF
TEAM_REGISTRATION_TOKEN=<YOUR_NEW_TOKEN>
EOF

# 2. 启动服务
docker-compose -f docker-compose.team-runners.yml up -d

# 3. 检查状态
docker-compose -f docker-compose.team-runners.yml ps
```

### 方法 2: 传统 Docker 方式

```bash
# 停止现有 runners
docker stop $(docker ps | grep "github.*runner" | awk '{print $1}') || true
docker rm $(docker ps -a | grep "github.*runner" | awk '{print $1}') || true

# 启动新的 Team runners
for i in {1..4}; do
    docker run -d \
        --name "github-team-runner-$i" \
        --restart unless-stopped \
        -e GITHUB_REPOSITORY_URL="https://github.com/yyupcompany" \
        -e GITHUB_TOKEN="<YOUR_TOKEN>" \
        -e GITHUB_RUNNER_NAME="team-docker-runner-$i" \
        -e GITHUB_RUNNER_LABELS="team,docker,self-hosted,linux,runner-$i,org-licensed" \
        -v /var/run/docker.sock:/var/run/docker.sock \
        sumologic/docker-github-actions-runner:latest
    sleep 3
done
```

## Team 版本特色配置

### Runner 标签设置

```yaml
GITHUB_RUNNER_LABELS: "team,docker,self-hosted,linux,org-licensed"
```

**标签说明:**
- `team` - 标识为 Team 版本
- `docker` - 支持 Docker 操作
- `self-hosted` - 自托管标识
- `linux` - Linux 环境
- `org-licensed` - 组织许可证

### 工作流配置

**优化后的工作流文件:**

```yaml
name: Claude Assistant (Team Version)
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned, labeled]
  pull_request_review:
    types: [submitted]

permissions:
  issues: write
  contents: read
  pull-requests: write  # Team 版本权限

jobs:
  claude-response:
    runs-on: [self-hosted, team, org-licensed]  # 使用 Team 标签
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@beta
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          max_turns: "8"  # Team 版本推荐设置
```

## GitHub Secrets 配置

### 必需的 Secrets

1. **CLAUDE_CODE_OAUTH_TOKEN**
   - 从 Claude Code 中生成
   - 用于 Claude API 访问

2. **GITHUB_TOKEN**
   - 系统自动提供
   - 用于 GitHub API 访问

### 配置步骤

1. 访问: `https://github.com/yyupcompany/settings/secrets/actions`
2. 点击 **New repository secret**
3. 添加 `CLAUDE_CODE_OAUTH_TOKEN`
4. 粘贴从 Claude Code 获取的 OAuth token

## 管理和维护

### 日常管理命令

```bash
# 使用便捷脚本
cd /f/kyyup730/github-runners
./team-runners-ctl.sh status      # 查看状态
./team-runners-ctl.sh logs 1      # 查看 Runner-1 日志
./team-runners-ctl.sh restart all # 重启所有
./team-runners-ctl.sh stop        # 停止所有
./team-runners-ctl.sh start       # 启动所有
```

### Docker 直接命令

```bash
# 查看运行状态
docker ps | grep github-team-runner

# 查看特定 runner 日志
docker logs github-team-runner-1

# 重启特定 runner
docker restart github-team-runner-2

# 查看所有 runner 日志
for i in {1..4}; do
    echo "=== Runner-$i 日志 ==="
    docker logs --tail 10 github-team-runner-$i
done
```

## 验证部署

### 在 GitHub 中验证

1. 访问: `https://github.com/yyupcompany/settings/actions/runners`
2. 应该看到 4 个在线的 self-hosted runners:
   - `team-docker-runner-1`
   - `team-docker-runner-2`  
   - `team-docker-runner-3`
   - `team-docker-runner-4`

### 测试 @claude 功能

1. 在任意 Issue 中评论: `@claude hello`
2. 在 Pull Request 中评论: `@claude review this code`
3. 观察 Actions 页面的工作流执行

### 检查工作流执行

访问: `https://github.com/yyupcompany/REPO_NAME/actions`

## 故障排除

### 常见问题

**1. @claude 命令无响应**
```bash
# 检查 runner 状态
./verify-team-setup.sh

# 查看工作流运行历史
# 访问 GitHub Actions 页面

# 检查 Secrets 配置
# 访问组织 Settings → Secrets
```

**2. Runner 注册失败**
```bash
# 查看注册日志
docker logs github-team-runner-1

# 可能原因：
# - Token 过期（重新获取）
# - 网络连接问题
# - 权限不足
```

**3. 容器启动失败**
```bash
# 检查 Docker 日志
docker logs github-team-runner-1

# 检查权限
ls -la /var/run/docker.sock

# 重新部署
./deploy-team-runners.sh <NEW_TOKEN>
```

### 日志分析

**正常注册日志应包含:**
```
√ Connected to GitHub
√ Runner successfully configured
√ Listening for Jobs
```

**异常情况:**
- `ERROR: Runner registration failed` - Token 问题
- `ERROR: Could not connect` - 网络问题
- `ERROR: Access denied` - 权限问题

## 性能优化

### 资源配置

```yaml
# Docker Compose 中添加资源限制
services:
  github-team-runner-1:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### 缓存优化

```yaml
volumes:
  # 持久化缓存目录
  - ../github-runners/team-runner-cache-1:/runner-cache
  - ../github-runners/npm-cache:/root/.npm
  - ../github-runners/pip-cache:/root/.cache/pip
```

## 安全考虑

### Token 管理

1. **定期更换 Token**
   - 建议每3个月更换一次 registration token
   - 使用环境变量存储，不要硬编码

2. **权限最小化**
   - 只给必要的 GitHub permissions
   - 定期审核 runner 访问权限

3. **网络隔离**
   - Runners 运行在隔离的 Docker 网络中
   - 限制不必要的网络访问

### 监控和日志

```bash
# 设置日志轮转
# 在 Docker Compose 中添加
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 升级和维护

### 更新 Runner 镜像

```bash
# 拉取最新镜像
docker pull sumologic/docker-github-actions-runner:latest

# 重新创建容器
docker-compose -f docker-compose.team-runners.yml up -d --force-recreate
```

### 备份配置

```bash
# 备份配置目录
cp -r /f/kyyup730/github-runners /f/kyyup730/github-runners-backup-$(date +%Y%m%d)

# 备份环境变量
cp .env .env.backup-$(date +%Y%m%d)
```

## GitHub Team 版本优势

### 相比免费版本

✅ **无限制的私有仓库 Actions 分钟数**  
✅ **高级协作工具**  
✅ **代码所有者 (CODEOWNERS)**  
✅ **受保护分支**  
✅ **组织级 self-hosted runners**  

### Team 版本限制

⚠️ **不支持企业级策略**  
⚠️ **Runner 作用域限制在组织**  
⚠️ **无企业级安全功能**  

## 支持和帮助

### 获取帮助

1. **查看部署报告**
   ```bash
   ls -la ../github-runners/*verification*.txt
   ```

2. **联系支持**
   - GitHub Team 支持页面
   - Claude Code 文档

3. **社区资源**
   - GitHub Discussions
   - Stack Overflow

---

**🎉 恭喜！** 按照本指南，你的 GitHub Team 版本 self-hosted runners 应该已经成功配置。现在可以在 Issues 和 Pull Requests 中使用 `@claude` 命令了！