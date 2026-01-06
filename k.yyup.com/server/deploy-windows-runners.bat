@echo off
echo === Windows GitHub Team Runners 配置 ===

set ORG_NAME=yyupcompany
set ORG_URL=https://github.com/yyupcompany
set YOUR_TOKEN=BQTHZLMUS2N3DGQM5OZHDHTISYVDU
set WORK_DIR=I:\github-runners\work

echo 组织: %ORG_NAME%
echo 工作目录: %WORK_DIR%
echo Token: %YOUR_TOKEN:~0,20%...
echo.

REM 检查是否在 Windows 环境
if not exist "%WORK_DIR%" (
    echo 错误: 工作目录不存在 %WORK_DIR%
    pause
    exit /b 1
)

echo 找到工作目录: %WORK_DIR%
echo.

REM 配置每个 runner
for /L %%i in (1,1,4) do (
    echo === 处理 runner-%%i ===
    
    set RUNNER_DIR=%WORK_DIR%\runner-%%i
    set CONFIG_SCRIPT=%WORK_DIR%\runner-%%i\_update\config.cmd
    
    if exist "!CONFIG_SCRIPT!" (
        cd /d "%WORK_DIR%\runner-%%i"
        
        REM 移除现有配置
        if exist ".runner" (
            echo 移除现有配置...
            call "_update\config.cmd" remove --token "%YOUR_TOKEN%"
        )
        
        REM 重新配置
        echo 配置 runner-%%i...
        call "_update\config.cmd" --url "%ORG_URL%" --token "%YOUR_TOKEN%" --name "team-runner-%%i" --work "_work" --labels "team,self-hosted,windows,runner-%%i,org-licensed" --runnergroup "Default" --unattended
        
        if errorlevel 1 (
            echo X runner-%%i 配置失败
        ) else (
            echo √ runner-%%i 配置成功
            
            REM 安装并启动服务
            echo 安装 runner-%%i 服务...
            call "_update\svc.cmd" install
            call "_update\svc.cmd" start
            
            if errorlevel 1 (
                echo X runner-%%i 服务启动失败
            ) else (
                echo √ runner-%%i 服务启动成功
            )
        )
    ) else (
        echo X 未找到配置脚本: !CONFIG_SCRIPT!
    )
    
    echo.
    timeout /t 2 /nobreak >nul
)

echo === 验证 Runner 状态 ===
timeout /t 5 /nobreak >nul

for /L %%i in (1,1,4) do (
    set RUNNER_DIR=%WORK_DIR%\runner-%%i
    
    if exist "%WORK_DIR%\runner-%%i\.runner" (
        echo √ runner-%%i: 已配置
        
        REM 检查服务状态
        sc query "actions.runner.yyupcompany.team-runner-%%i" >nul 2>&1
        if errorlevel 1 (
            echo ? runner-%%i: 服务未安装
        ) else (
            echo √ runner-%%i: 服务已安装
        )
    ) else (
        echo X runner-%%i: 未配置
    )
)

echo.
echo === 配置完成 ===
echo 验证地址: https://github.com/%ORG_NAME%/settings/actions/runners
echo.
echo 管理命令:
echo 查看所有服务: sc query type= service state= all ^| findstr "actions.runner"
echo 停止服务: sc stop "actions.runner.yyupcompany.team-runner-1"
echo 启动服务: sc start "actions.runner.yyupcompany.team-runner-1"
echo.

pause