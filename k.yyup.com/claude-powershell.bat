@echo off
REM Claude PowerShell 启动脚本
REM 启动PowerShell（环境变量已移除）

echo 启动PowerShell...

REM 环境变量已被移除，请根据需要手动设置：
REM set "ANTHROPIC_API_KEY=your-api-key-here"
REM set "ANTHROPIC_BASE_URL=your-base-url-here"
REM set "ANTHROPIC_AUTH_TOKEN=your-auth-token-here"

echo 🚀 启动PowerShell...

REM 启动PowerShell
powershell -NoExit -Command "Write-Host '✅ PowerShell 已启动' -ForegroundColor Green; Write-Host '💡 如需使用 Claude Code，请手动设置环境变量' -ForegroundColor Cyan"
