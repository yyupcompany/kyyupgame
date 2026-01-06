# PowerShell脚本 - 从ISO提取并导入WSL
$ErrorActionPreference = "Stop"

# 配置
$isoPath = "G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso"
$tempDir = "C:\WSL-Temp"
$wslName = "Ubuntu-24.04"
$wslInstallPath = "$env:USERPROFILE\WSL\$wslName"

Write-Host "=== Ubuntu WSL导入工具 ==="
Write-Host "ISO文件: $isoPath"
Write-Host "临时目录: $tempDir"
Write-Host "WSL名称: $wslName"
Write-Host "安装位置: $wslInstallPath"
Write-Host

# 创建临时目录
Write-Host "1. 创建临时目录..."
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $wslInstallPath | Out-Null

# 挂载ISO
Write-Host "2. 挂载ISO文件..."
$mount = Mount-DiskImage -ImagePath $isoPath -PassThru
$driveLetter = ($mount | Get-Volume).DriveLetter

Write-Host "3. ISO挂载到了 ${driveLetter}:"
Write-Host "4. 正在复制和准备文件..."

# 复制squashfs文件
$squashfsPath = "${driveLetter}:\casper\minimal.standard.live.squashfs"
$targetPath = "$tempDir\rootfs.tar"

# 使用7-Zip解压squashfs（如果有的话）
if (Test-Path "C:\Program Files\7-Zip\7z.exe") {
    Write-Host "使用7-Zip解压squashfs文件..."
    & "C:\Program Files\7-Zip\7z.exe" x $squashfsPath -o"$tempDir\rootfs"
} else {
    Write-Host "未找到7-Zip，请安装后重试"
    Write-Host "下载地址：https://7-zip.org/"
    exit 1
}

# 导入WSL
Write-Host "5. 导入到WSL..."
wsl --import $wslName $wslInstallPath "$tempDir\rootfs.tar"

# 清理
Write-Host "6. 清理临时文件..."
Dismount-DiskImage -ImagePath $isoPath
Remove-Item -Path $tempDir -Recurse -Force

Write-Host
Write-Host "=== 完成！ ==="
Write-Host "请运行以下命令进入系统："
Write-Host "wsl -d $wslName"