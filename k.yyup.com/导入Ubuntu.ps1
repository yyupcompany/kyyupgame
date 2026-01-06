# PowerShell脚本 - 从ISO导入Ubuntu到WSL
Write-Host "============================================"
Write-Host "    从ISO导入Ubuntu到WSL"
Write-Host "============================================"
Write-Host

# 设置变量
$isoPath = "G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso"
$wslName = "Ubuntu-24.04"
$installPath = "$env:USERPROFILE\WSL\$wslName"
$tempDir = "C:\WSL-Temp"

# 1. 创建目录
Write-Host "[1/6] 创建必要目录..."
New-Item -ItemType Directory -Force -Path $installPath | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 2. 挂载ISO
Write-Host "[2/6] 挂载ISO文件..."
$mount = Mount-DiskImage -ImagePath $isoPath -PassThru
$driveLetter = ($mount | Get-Volume).DriveLetter

Write-Host "[3/6] ISO挂载到了 ${driveLetter}:"

# 4. 复制文件
Write-Host "[4/6] 复制系统文件..."
Copy-Item "${driveLetter}:\casper\minimal.standard.live.squashfs" -Destination "$tempDir"

# 5. 导入WSL
Write-Host "[5/6] 导入到WSL..."
wsl --import $wslName $installPath "$tempDir\minimal.standard.live.squashfs"

# 6. 清理
Write-Host "[6/6] 清理..."
Dismount-DiskImage -ImagePath $isoPath
Remove-Item -Path $tempDir -Recurse -Force

Write-Host
Write-Host "============================================"
Write-Host "               安装完成！"
Write-Host "============================================"
Write-Host
Write-Host "运行以下命令进入系统："
Write-Host "wsl -d $wslName"
Write-Host

Read-Host "按Enter键继续..."