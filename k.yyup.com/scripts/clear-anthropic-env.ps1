# 清除 ANTHROPIC 环境变量脚本
# 用于清除所有 ANTHROPIC 相关的环境变量

Write-Host "🧹 清除 ANTHROPIC 环境变量..." -ForegroundColor Red

# 清除当前会话的环境变量
$env:ANTHROPIC_API_KEY = $null
$env:ANTHROPIC_BASE_URL = $null
$env:ANTHROPIC_AUTH_TOKEN = $null

# 清除用户级别的环境变量
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $null, "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $null, "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "User")

# 清除系统级别的环境变量（需要管理员权限）
try {
    [Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $null, "Machine")
    [Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $null, "Machine")
    [Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $null, "Machine")
    Write-Host "✅ 系统级环境变量也已清除" -ForegroundColor Green
} catch {
    Write-Host "⚠️  无法清除系统级环境变量（需要管理员权限）" -ForegroundColor Yellow
}

Write-Host "✅ ANTHROPIC 环境变量清除完成" -ForegroundColor Green

# 验证清除结果
$anthropicVars = Get-ChildItem Env: | Where-Object { $_.Name -like "*ANTHROPIC*" }
if ($anthropicVars) {
    Write-Host "⚠️  仍有 ANTHROPIC 环境变量存在:" -ForegroundColor Yellow
    $anthropicVars | ForEach-Object { Write-Host "   $($_.Name) = $($_.Value)" -ForegroundColor Yellow }
} else {
    Write-Host "✅ 所有 ANTHROPIC 环境变量已成功清除" -ForegroundColor Green
}
