# PowerShell 配置文件设置脚本
# 此脚本需要以管理员权限运行

Write-Host "正在设置PowerShell配置文件..." -ForegroundColor Green

# 检查执行策略
$currentPolicy = Get-ExecutionPolicy
Write-Host "当前执行策略: $currentPolicy" -ForegroundColor Yellow

if ($currentPolicy -eq "Restricted") {
    Write-Host "检测到受限制的执行策略，正在设置为RemoteSigned..." -ForegroundColor Yellow
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✅ 执行策略已设置为RemoteSigned" -ForegroundColor Green
    } catch {
        Write-Host "❌ 设置执行策略失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "请以管理员权限运行此脚本" -ForegroundColor Yellow
    }
}

# 检查配置文件是否存在
if (Test-Path $PROFILE) {
    Write-Host "✅ PowerShell配置文件已存在: $PROFILE" -ForegroundColor Green
} else {
    Write-Host "❌ PowerShell配置文件不存在: $PROFILE" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 设置完成！重新启动PowerShell后环境变量将自动加载" -ForegroundColor Green
Write-Host "💡 测试命令: claude --print `"hello world`"" -ForegroundColor Cyan
