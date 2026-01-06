@echo off
REM Claude Code 快速启动脚本
REM 避免每次重新安装

echo 检查Claude Code是否已安装...

REM 检查Claude命令是否可用
where claude >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Claude已安装，直接启动...
    claude %*
    goto :end
)

REM 检查npm全局目录中是否有Claude
if exist "C:\Users\15098\AppData\Roaming\npm\claude.cmd" (
    echo ✅ 找到Claude文件，直接运行...
    "C:\Users\15098\AppData\Roaming\npm\claude.cmd" %*
    goto :end
)

REM 如果都没有，则快速安装
echo ⚠️  Claude未找到，正在快速安装...
npm install -g @anthropic-ai/claude-code --silent
if %errorlevel% == 0 (
    echo ✅ 安装完成，启动Claude...
    claude %*
) else (
    echo ❌ 安装失败，请检查网络连接
)

:end
pause
