# Genymotion 安装和使用指南（Deepin系统）

## 📋 目录
1. [环境准备](#环境准备)
2. [安装VirtualBox](#安装virtualbox)
3. [安装Genymotion](#安装genymotion)
4. [创建虚拟设备](#创建虚拟设备)
5. [安装APK](#安装apk)
6. [常用操作](#常用操作)
7. [问题排查](#问题排查)

---

## 🔧 环境准备

### 系统要求
- **操作系统**: Deepin 25 (已满足 ✅)
- **内存**: 至少4GB RAM（推荐8GB）
- **硬盘**: 至少10GB可用空间
- **CPU**: 支持虚拟化技术（Intel VT-x 或 AMD-V）

### 检查CPU虚拟化支持

```bash
# 检查CPU是否支持虚拟化
egrep -c '(vmx|svm)' /proc/cpuinfo

# 如果输出大于0，说明支持虚拟化
# 如果输出为0，需要在BIOS中开启虚拟化
```

---

## 📦 安装VirtualBox

Genymotion依赖VirtualBox运行，必须先安装。

### 方法1：使用APT安装（推荐）

```bash
# 更新软件源
sudo apt update

# 安装VirtualBox
sudo apt install -y virtualbox virtualbox-ext-pack

# 验证安装
virtualbox --help
VBoxManage --version
```

### 方法2：从官网下载最新版

```bash
# 添加VirtualBox官方源
wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -
echo "deb [arch=amd64] https://download.virtualbox.org/virtualbox/debian $(lsb_release -cs) contrib" | sudo tee /etc/apt/sources.list.d/virtualbox.list

# 更新并安装
sudo apt update
sudo apt install -y virtualbox-7.0

# 安装扩展包
wget https://download.virtualbox.org/virtualbox/7.0.14/Oracle_VM_VirtualBox_Extension_Pack-7.0.14.vbox-extpack
sudo VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-7.0.14.vbox-extpack
```

### 配置用户权限

```bash
# 将当前用户添加到vboxusers组
sudo usermod -aG vboxusers $USER

# 重新登录或重启系统使权限生效
# 或者执行：
newgrp vboxusers
```

---

## 🚀 安装Genymotion

### 步骤1：下载Genymotion

访问官网下载页面：
- **官网**: https://www.genymotion.com/download/
- **选择**: Genymotion Desktop (Free for personal use)
- **平台**: Linux 64 bits

或使用命令行下载：

```bash
# 创建下载目录
mkdir -p ~/Downloads/genymotion
cd ~/Downloads/genymotion

# 下载Genymotion（替换为最新版本链接）
# 注意：需要先在官网注册账号才能下载
# 下载后的文件名类似：genymotion-3.7.1-linux_x64.bin

# 如果已经下载，跳过此步骤
```

### 步骤2：安装Genymotion

```bash
# 进入下载目录
cd ~/Downloads/genymotion

# 给安装文件添加执行权限
chmod +x genymotion-3.*.bin

# 运行安装程序
./genymotion-3.*.bin

# 安装过程中的选项：
# 1. 接受许可协议：输入 'y'
# 2. 安装路径：默认 ~/genymotion （直接回车）
# 3. 创建桌面快捷方式：输入 'y'
```

### 步骤3：配置环境变量（可选）

```bash
# 添加Genymotion到PATH
echo 'export PATH=$PATH:$HOME/genymotion' >> ~/.bashrc
source ~/.bashrc
```

---

## 🎮 启动Genymotion

### 方法1：使用桌面快捷方式
- 在应用菜单中找到"Genymotion"图标
- 双击启动

### 方法2：使用命令行

```bash
# 启动Genymotion
~/genymotion/genymotion

# 或者如果已添加到PATH
genymotion
```

### 首次启动配置

1. **登录账号**
   - 使用注册时的邮箱和密码登录
   - 或选择"Personal Use"免费版

2. **配置VirtualBox路径**
   - Genymotion会自动检测VirtualBox
   - 如果未检测到，手动指定：`/usr/bin/VBoxManage`

---

## 📱 创建虚拟设备

### 步骤1：添加新设备

```bash
# 在Genymotion主界面：
# 1. 点击右上角的 "+" 按钮
# 2. 或点击 "Add" -> "New virtual device"
```

### 步骤2：选择设备型号

**推荐配置**：

| 设备型号 | Android版本 | 屏幕分辨率 | 用途 |
|---------|------------|-----------|------|
| Google Pixel 5 | Android 11.0 | 1080x2340 | 通用测试 |
| Samsung Galaxy S10 | Android 10.0 | 1440x3040 | 高分辨率测试 |
| Google Pixel 3 | Android 9.0 | 1080x2160 | 兼容性测试 |

**选择建议**：
- **开发测试**: Google Pixel 5 (Android 11)
- **兼容性测试**: Google Pixel 3 (Android 9)
- **性能测试**: Samsung Galaxy S10 (Android 10)

### 步骤3：配置虚拟设备

```
设备名称: Teacher_App_Test
Android版本: 11.0 (API 30)
设备型号: Google Pixel 5
```

点击"Next"开始下载和创建虚拟设备。

### 步骤4：启动虚拟设备

```bash
# 在Genymotion主界面：
# 1. 选择创建的虚拟设备
# 2. 点击 "Start" 按钮
# 3. 等待虚拟设备启动（首次启动较慢）
```

---

## 📲 安装APK到Genymotion

### 方法1：拖拽安装（最简单）

```bash
# 1. 启动Genymotion虚拟设备
# 2. 直接将APK文件拖拽到虚拟设备窗口
# 3. 等待安装完成
# 4. 在应用列表中找到"教师助手"应用
```

### 方法2：使用ADB命令

```bash
# 1. 确保虚拟设备已启动

# 2. 检查设备连接
adb devices
# 应该显示类似：
# 192.168.56.101:5555    device

# 3. 安装APK
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk

# 4. 查看安装结果
# Success 表示安装成功
```

### 方法3：使用Genymotion Shell

```bash
# 在Genymotion虚拟设备窗口：
# 1. 点击右侧工具栏的 "File transfer" 图标
# 2. 选择APK文件
# 3. 点击 "Open" 开始安装
```

---

## 🛠️ 常用操作

### 1. 设备控制

```bash
# 旋转屏幕
# 点击虚拟设备右侧工具栏的旋转图标

# 调整音量
# 使用虚拟设备右侧的音量控制按钮

# 返回主屏幕
# 点击虚拟设备底部的Home按钮

# 返回上一页
# 点击虚拟设备底部的Back按钮

# 打开最近应用
# 点击虚拟设备底部的Recent按钮
```

### 2. 截图和录屏

```bash
# 截图
# 方法1：点击虚拟设备右侧工具栏的相机图标
# 方法2：使用ADB命令
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ~/Desktop/

# 录屏
# 方法1：点击虚拟设备右侧工具栏的录制图标
# 方法2：使用ADB命令
adb shell screenrecord /sdcard/demo.mp4
# 按Ctrl+C停止录制
adb pull /sdcard/demo.mp4 ~/Desktop/
```

### 3. 文件传输

```bash
# 从电脑传文件到虚拟设备
adb push ~/Desktop/test.txt /sdcard/Download/

# 从虚拟设备传文件到电脑
adb pull /sdcard/Download/test.txt ~/Desktop/

# 或使用拖拽方式
# 直接将文件拖拽到虚拟设备窗口
```

### 4. 查看应用日志

```bash
# 实时查看应用日志
adb logcat | grep flutter

# 查看特定应用的日志
adb logcat | grep "com.example.teacher_app"

# 清除日志
adb logcat -c

# 保存日志到文件
adb logcat > ~/Desktop/app_log.txt
```

### 5. 卸载应用

```bash
# 使用ADB卸载
adb uninstall com.example.teacher_app

# 或在虚拟设备中：
# 1. 长按应用图标
# 2. 拖拽到"卸载"区域
# 3. 确认卸载
```

---

## 🔍 高级功能

### 1. GPS位置模拟

```bash
# 在Genymotion虚拟设备窗口：
# 1. 点击右侧工具栏的GPS图标
# 2. 输入经纬度或搜索地址
# 3. 点击"Set location"
```

### 2. 电池状态模拟

```bash
# 在Genymotion虚拟设备窗口：
# 1. 点击右侧工具栏的电池图标
# 2. 调整电量百分比
# 3. 选择充电状态
```

### 3. 网络状态模拟

```bash
# 在Genymotion虚拟设备窗口：
# 1. 点击右侧工具栏的网络图标
# 2. 选择网络类型（WiFi/4G/3G/2G）
# 3. 调整网络速度
```

### 4. 相机功能

```bash
# 在Genymotion虚拟设备窗口：
# 1. 点击右侧工具栏的相机图标
# 2. 选择使用电脑摄像头或虚拟相机
```

---

## 🐛 问题排查

### 问题1: VirtualBox未检测到

**症状**: Genymotion提示找不到VirtualBox

**解决方案**:
```bash
# 检查VirtualBox是否安装
which VBoxManage

# 如果未安装，重新安装
sudo apt install virtualbox

# 在Genymotion中手动指定VirtualBox路径
# Settings -> VirtualBox -> VirtualBox path: /usr/bin/VBoxManage
```

### 问题2: 虚拟设备启动失败

**症状**: 点击Start后虚拟设备无法启动

**解决方案**:
```bash
# 1. 检查CPU虚拟化是否开启
egrep -c '(vmx|svm)' /proc/cpuinfo

# 2. 检查VirtualBox内核模块
lsmod | grep vbox

# 3. 重新加载VirtualBox模块
sudo modprobe vboxdrv
sudo modprobe vboxnetflt

# 4. 重启VirtualBox服务
sudo systemctl restart vboxdrv
```

### 问题3: ADB无法连接设备

**症状**: `adb devices` 显示设备offline或未显示

**解决方案**:
```bash
# 1. 重启ADB服务
adb kill-server
adb start-server

# 2. 检查设备IP
# 在Genymotion虚拟设备窗口查看IP地址

# 3. 手动连接设备
adb connect 192.168.56.101:5555

# 4. 验证连接
adb devices
```

### 问题4: APK安装失败

**症状**: 拖拽APK后提示安装失败

**解决方案**:
```bash
# 1. 卸载旧版本
adb uninstall com.example.teacher_app

# 2. 使用ADB强制安装
adb install -r /path/to/app-release.apk

# 3. 检查APK签名
# 确保APK已正确签名

# 4. 查看详细错误信息
adb logcat | grep PackageManager
```

### 问题5: 虚拟设备运行缓慢

**解决方案**:
```bash
# 1. 增加虚拟设备内存
# 在Genymotion中：Settings -> Virtual device -> RAM: 2048MB

# 2. 增加CPU核心数
# Settings -> Virtual device -> Processors: 2

# 3. 启用硬件加速
# Settings -> VirtualBox -> Enable VT-x/AMD-V

# 4. 关闭不必要的后台应用
```

---

## 📊 性能优化建议

### 虚拟设备配置

```
推荐配置：
- RAM: 2048MB - 4096MB
- CPU核心: 2-4个
- 分辨率: 1080x1920 (Full HD)
- Android版本: 11.0 (API 30)
```

### 系统优化

```bash
# 1. 关闭不必要的系统服务
# 2. 增加虚拟内存
sudo swapon --show
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. 清理系统缓存
sudo apt clean
sudo apt autoclean
```

---

## 🎯 测试教师助手应用

### 完整测试流程

```bash
# 1. 启动Genymotion虚拟设备
~/genymotion/genymotion

# 2. 等待虚拟设备完全启动

# 3. 安装APK
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk

# 4. 启动应用
# 在虚拟设备中点击"教师助手"图标

# 5. 查看日志
adb logcat | grep flutter

# 6. 测试功能
# - 登录功能
# - 数据加载
# - 页面导航
# - 网络请求

# 7. 截图保存测试结果
adb shell screencap /sdcard/test_result.png
adb pull /sdcard/test_result.png ~/Desktop/
```

---

## 📞 获取帮助

### 官方资源
- **官网**: https://www.genymotion.com/
- **文档**: https://docs.genymotion.com/
- **论坛**: https://forum.genymotion.com/

### 常用命令速查

```bash
# Genymotion
~/genymotion/genymotion              # 启动Genymotion
~/genymotion/player --vm-name XXX    # 启动指定虚拟设备

# ADB
adb devices                          # 查看连接的设备
adb install app.apk                  # 安装APK
adb uninstall com.package.name       # 卸载应用
adb logcat                           # 查看日志
adb shell                            # 进入设备Shell

# VirtualBox
VBoxManage list vms                  # 列出所有虚拟机
VBoxManage startvm "VM_NAME"         # 启动虚拟机
VBoxManage controlvm "VM_NAME" poweroff  # 关闭虚拟机
```

---

## ✅ 安装检查清单

- [ ] VirtualBox已安装并正常运行
- [ ] 用户已添加到vboxusers组
- [ ] Genymotion已下载并安装
- [ ] Genymotion账号已注册并登录
- [ ] 虚拟设备已创建并能正常启动
- [ ] ADB可以连接到虚拟设备
- [ ] APK可以成功安装到虚拟设备

---

祝您使用愉快！🎉

