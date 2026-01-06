@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    GitHub Team Runners Token 更新
echo ==========================================

set "ORG_NAME=yyupcompany"
set "ORG_URL=https://github.com/yyupcompany"
set "YOUR_TOKEN=BQTHZLMUS2N3DGQM5OZHDHTISYVDU"
set "WORK_DIR=I:\github-runners\work"

echo 组织: %ORG_NAME%
echo 工作目录: %WORK_DIR%
echo Token: %YOUR_TOKEN:~0,20%...
echo.

REM 检查工作目录
if not exist "%WORK_DIR%" (
    echo 错误: 工作目录不存在 %WORK_DIR%
    pause
    exit /b 1
)

echo 找到工作目录: %WORK_DIR%
echo.

REM 处理每个 runner
for /L %%i in (1,1,4) do (
    echo === 处理 runner-%%i ===
    
    set "RUNNER_DIR=%WORK_DIR%\runner-%%i"
    
    if exist "!RUNNER_DIR!" (
        cd /d "!RUNNER_DIR!"
        
        REM 检查配置脚本
        if exist "_update\config.sh" (
            echo 使用 WSL 配置 runner-%%i...
            
            REM 移除现有配置
            if exist ".runner" (
                echo 移除现有配置...
                wsl bash -c "cd '/mnt/i/github-runners/work/runner-%%i' && ./_update/config.sh remove --token '%YOUR_TOKEN%'" 2>nul
            )
            
            REM 重新配置
            echo 重新配置 runner-%%i...
            wsl bash -c "cd '/mnt/i/github-runners/work/runner-%%i' && ./_update/config.sh --url '%ORG_URL%' --token '%YOUR_TOKEN%' --name 'team-runner-%%i' --work '_work' --labels 'team,self-hosted,linux,runner-%%i,org-licensed' --runnergroup 'Default' --unattended"
            
            if !errorlevel! equ 0 (
                echo ✅ runner-%%i 配置成功
                
                REM 启动 runner (后台运行)
                echo 启动 runner-%%i...
                start /b "" wsl bash -c "cd '/mnt/i/github-runners/work/runner-%%i' && nohup ./_update/run.sh > runner-%%i.log 2>&1 &"
                echo ✅ runner-%%i 已启动
            ) else (
                echo ❌ runner-%%i 配置失败
            )
            
        ) else if exist "_update\config.cmd" (
            echo 使用 Windows 原生配置 runner-%%i...
            
            REM 移除现有配置
            if exist ".runner" (
                echo 移除现有配置...
                call "_update\config.cmd" remove --token "%YOUR_TOKEN%" 2>nul
            )
            
            REM 重新配置
            echo 重新配置 runner-%%i...
            call "_update\config.cmd" --url "%ORG_URL%" --token "%YOUR_TOKEN%" --name "team-runner-%%i" --work "_work" --labels "team,self-hosted,windows,runner-%%i,org-licensed" --runnergroup "Default" --unattended
            
            if !errorlevel! equ 0 (
                echo ✅ runner-%%i 配置成功
                
                REM 安装服务
                echo 安装 runner-%%i 服务...
                call "_update\svc.cmd" install
                if !errorlevel! equ 0 (
                    call "_update\svc.cmd" start
                    echo ✅ runner-%%i 服务已启动
                ) else (
                    echo ❌ runner-%%i 服务安装失败
                )
            ) else (
                echo ❌ runner-%%i 配置失败
            )
            
        ) else (
            echo ❌ 未找到配置脚本
        )
        
    ) else (
        echo ❌ Runner 目录不存在: !RUNNER_DIR!
    )
    
    echo.
    timeout /t 2 /nobreak >nul
)

echo.
echo === 验证配置 ===
timeout /t 5 /nobreak >nul

for /L %%i in (1,1,4) do (
    set "RUNNER_DIR=%WORK_DIR%\runner-%%i"
    
    if exist "!RUNNER_DIR!\.runner" (
        echo ✅ runner-%%i: 已配置
    ) else (
        echo ❌ runner-%%i: 未配置
    )
)

echo.
echo ==========================================
echo   配置完成!
echo ==========================================
echo 验证地址: https://github.com/%ORG_NAME%/settings/actions/runners
echo.
echo 应该可以看到4个在线的 "team-runner-1" 到 "team-runner-4"
echo.
echo 现在可以在 GitHub Issues/PRs 中使用 @claude 命令了！
echo ==========================================
echo.

pause