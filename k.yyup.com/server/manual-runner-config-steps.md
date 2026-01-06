# 手动配置 GitHub Runners 步骤

## 你的配置信息
- **组织**: yyupcompany
- **URL**: https://github.com/yyupcompany
- **Token**: BQTHZLMUS2N3DGQM5OZHDHTISYVDU

## 逐步操作指南

### 第一步：打开 PowerShell 或 Command Prompt（以管理员身份）

### 第二步：配置 Runner-1
```cmd
cd I:\github-runners\work\runner-1
```

检查是否存在配置文件：
```cmd
dir .runner
```

如果存在 `.runner` 文件，先移除旧配置：
```cmd
_update\config.sh remove --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU
```

重新配置：
```cmd
_update\config.sh --url https://github.com/yyupcompany --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU --name team-runner-1 --work _work --labels team,self-hosted,linux,runner-1,org-licensed --runnergroup Default --unattended
```

启动 runner（后台运行）：
```cmd
nohup _update\run.sh > runner-1.log 2>&1 &
```

### 第三步：配置 Runner-2
```cmd
cd I:\github-runners\work\runner-2
```

移除旧配置（如果有）：
```cmd
_update\config.sh remove --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU
```

重新配置：
```cmd
_update\config.sh --url https://github.com/yyupcompany --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU --name team-runner-2 --work _work --labels team,self-hosted,linux,runner-2,org-licensed --runnergroup Default --unattended
```

启动：
```cmd
nohup _update\run.sh > runner-2.log 2>&1 &
```

### 第四步：配置 Runner-3
```cmd
cd I:\github-runners\work\runner-3
_update\config.sh remove --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU
_update\config.sh --url https://github.com/yyupcompany --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU --name team-runner-3 --work _work --labels team,self-hosted,linux,runner-3,org-licensed --runnergroup Default --unattended
nohup _update\run.sh > runner-3.log 2>&1 &
```

### 第五步：配置 Runner-4
```cmd
cd I:\github-runners\work\runner-4
_update\config.sh remove --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU
_update\config.sh --url https://github.com/yyupcompany --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU --name team-runner-4 --work _work --labels team,self-hosted,linux,runner-4,org-licensed --runnergroup Default --unattended
nohup _update\run.sh > runner-4.log 2>&1 &
```

## 验证配置

### 方法一：检查配置文件
每个 runner 目录应该有 `.runner` 文件：
```cmd
dir I:\github-runners\work\runner-1\.runner
dir I:\github-runners\work\runner-2\.runner
dir I:\github-runners\work\runner-3\.runner
dir I:\github-runners\work\runner-4\.runner
```

### 方法二：访问 GitHub 页面
访问: https://github.com/yyupcompany/settings/actions/runners

应该能看到4个在线的 runners：
- team-runner-1
- team-runner-2
- team-runner-3
- team-runner-4

### 方法三：查看运行日志
```cmd
tail -f I:\github-runners\work\runner-1\runner-1.log
```

## 如果遇到权限问题

如果在 Windows 环境下 `config.sh` 无法执行，尝试通过 WSL：
```cmd
wsl bash -c "cd '/mnt/i/github-runners/work/runner-1' && ./_update/config.sh --url https://github.com/yyupcompany --token BQTHZLMUS2N3DGQM5OZHDHTISYVDU --name team-runner-1 --work _work --labels team,self-hosted,linux,runner-1,org-licensed --runnergroup Default --unattended"
```

## 测试 @claude 功能

配置完成后：
1. 前往你的仓库的任意 Issue
2. 评论 `@claude hello`
3. 观察是否有 GitHub Actions 工作流被触发
4. 检查 Actions 页面的执行日志

## 故障排除

**如果 runners 显示离线：**
1. 检查日志文件中的错误信息
2. 确认 token 没有过期
3. 检查网络连接
4. 重启 runner 进程

**如果 @claude 不响应：**
1. 确认 GitHub Secrets 中配置了 `CLAUDE_CODE_OAUTH_TOKEN`
2. 检查工作流文件语法
3. 查看 Actions 页面的错误日志