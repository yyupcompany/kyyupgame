# PowerShell脚本 - 挂载并导入Ubuntu ISO
$isoPath = "G:\迅雷下载\ubuntu-24.04.2-desktop-amd64.iso"
$mountPath = "T:"  # 临时挂载点
$wslName = "Ubuntu-Desktop"
$wslPath = "$env:USERPROFILE\WSL\$wslName"

Write-Host "正在挂载ISO文件..."
Mount-DiskImage -ImagePath $isoPath

Write-Host "创建WSL目录..."
New-Item -ItemType Directory -Force -Path $wslPath

Write-Host "准备导入系统..."
$driveLetter = (Get-DiskImage -ImagePath $isoPath | Get-Volume).DriveLetter
$casperPath = "${driveLetter}:\casper\filesystem.squashfs"

Write-Host "导入Ubuntu系统..."
wsl --import $wslName $wslPath $casperPath

Write-Host "卸载ISO文件..."
Dismount-DiskImage -ImagePath $isoPath

Write-Host "设置为默认发行版..."
wsl --set-default $wslName

Write-Host "完成！"