# Flutter APK 构建和测试指南

## 📱 APK文件位置

构建完成后，APK文件将位于：
```
mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔧 环境准备

### 1. 安装Java JDK（必需）

```bash
# 安装OpenJDK 17
sudo apt update
sudo apt install -y openjdk-17-jdk

# 验证安装
java -version

# 设置JAVA_HOME环境变量
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. 安装Android SDK（必需）

```bash
# 下载Android命令行工具
cd ~
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip

# 解压
mkdir -p ~/Android/cmdline-tools
unzip commandlinetools-linux-9477386_latest.zip -d ~/Android/cmdline-tools
mv ~/Android/cmdline-tools/cmdline-tools ~/Android/cmdline-tools/latest

# 设置环境变量
echo 'export ANDROID_HOME=$HOME/Android' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
source ~/.bashrc

# 安装必要的Android SDK组件
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# 接受许可证
yes | sdkmanager --licenses
```

### 3. 配置Flutter环境变量

```bash
# 添加Flutter到PATH
echo 'export PATH=$PATH:/home/zhgue/localhost:5173/mobileflutter/flutter/bin' >> ~/.bashrc
source ~/.bashrc

# 验证Flutter
flutter doctor
```

---

## 🏗️ 构建APK

### 方法1：使用构建脚本（推荐）

```bash
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app

# 给脚本添加执行权限
chmod +x scripts/build_release.sh

# 构建APK
./scripts/build_release.sh android apk
```

### 方法2：直接使用Flutter命令

```bash
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app

# 清理项目
flutter clean

# 获取依赖
flutter pub get

# 构建发布版APK
flutter build apk --release --shrink
```

### 方法3：构建调试版APK（用于测试）

```bash
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app

# 构建调试版APK
flutter build apk --debug

# 调试版APK位置
# build/app/outputs/flutter-apk/app-debug.apk
```

---

## 📲 Deepin上的Android模拟器选择

### 🥇 推荐方案1: Genymotion（最佳）

**优点**：
- 性能优秀，接近原生速度
- 支持多种Android版本
- 提供免费个人版
- 完美支持Linux

**安装步骤**：

```bash
# 1. 下载Genymotion
# 访问: https://www.genymotion.com/download/
# 选择 "Genymotion Desktop" - "Linux 64 bits"

# 2. 安装VirtualBox（Genymotion依赖）
sudo apt install virtualbox virtualbox-ext-pack

# 3. 安装Genymotion
chmod +x genymotion-3.x.x-linux_x64.bin
./genymotion-3.x.x-linux_x64.bin

# 4. 启动Genymotion
cd ~/genymotion
./genymotion

# 5. 创建虚拟设备
# - 在Genymotion中点击"+"添加设备
# - 选择Android版本（推荐Android 11或12）
# - 选择设备型号（如Google Pixel 5）
# - 启动虚拟设备
```

**安装APK到Genymotion**：
```bash
# 方法1：拖拽APK文件到模拟器窗口

# 方法2：使用adb命令
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

### 🥈 推荐方案2: Android Studio自带模拟器

**优点**：
- 官方支持，稳定性好
- 与Flutter集成完美
- 支持最新Android版本

**安装步骤**：

```bash
# 1. 下载Android Studio
# 访问: https://developer.android.com/studio
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.1.1.28/android-studio-2023.1.1.28-linux.tar.gz

# 2. 解压
sudo tar -xzf android-studio-*-linux.tar.gz -C /opt/

# 3. 启动Android Studio
/opt/android-studio/bin/studio.sh

# 4. 在Android Studio中：
# - Tools -> AVD Manager
# - Create Virtual Device
# - 选择设备型号和Android版本
# - 启动模拟器
```

**安装APK**：
```bash
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

### 🥉 推荐方案3: Anbox（轻量级）

**优点**：
- 轻量级，资源占用少
- 原生Linux容器技术
- 免费开源

**缺点**：
- 功能相对简单
- 不支持Google Play服务

**安装步骤**：

```bash
# 安装Anbox
sudo apt install anbox

# 启动Anbox
anbox launch --package=org.anbox.appmgr --component=org.anbox.appmgr.AppViewActivity

# 安装APK
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

### 🔧 方案4: Waydroid（新兴方案）

**优点**：
- 基于容器技术，性能好
- 支持Wayland显示协议
- 完整的Android体验

**安装步骤**：

```bash
# 添加仓库
sudo apt install curl ca-certificates
curl https://repo.waydro.id | sudo bash

# 安装Waydroid
sudo apt install waydroid

# 初始化
sudo waydroid init

# 启动Waydroid
waydroid show-full-ui

# 安装APK
waydroid app install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 🎯 推荐配置（按优先级）

### 对于开发测试：
1. **Genymotion** - 最佳性能和兼容性
2. **Android Studio AVD** - 官方支持，功能完整
3. **Waydroid** - 轻量级，适合日常测试

### 对于快速测试：
1. **Anbox** - 启动快，资源占用少
2. **Waydroid** - 性能好，启动较快

---

## 📝 常用ADB命令

```bash
# 查看连接的设备
adb devices

# 安装APK
adb install app-release.apk

# 卸载应用
adb uninstall com.example.teacher_app

# 查看应用日志
adb logcat | grep flutter

# 截图
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# 录屏
adb shell screenrecord /sdcard/demo.mp4
adb pull /sdcard/demo.mp4
```

---

## 🐛 常见问题

### 问题1: Flutter doctor显示Android toolchain错误

**解决方案**：
```bash
# 安装Android SDK
flutter doctor --android-licenses
```

### 问题2: 构建失败 - Gradle错误

**解决方案**：
```bash
cd mobileflutter/teacher_app/android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk
```

### 问题3: 模拟器无法连接

**解决方案**：
```bash
# 重启adb服务
adb kill-server
adb start-server
adb devices
```

### 问题4: APK安装失败

**解决方案**：
```bash
# 卸载旧版本
adb uninstall com.example.teacher_app

# 重新安装
adb install -r app-release.apk
```

---

## 📊 构建产物说明

### APK文件类型：

1. **app-release.apk** - 发布版本
   - 位置: `build/app/outputs/flutter-apk/app-release.apk`
   - 用途: 正式发布
   - 大小: 较小（已优化）

2. **app-debug.apk** - 调试版本
   - 位置: `build/app/outputs/flutter-apk/app-debug.apk`
   - 用途: 开发测试
   - 大小: 较大（包含调试信息）

3. **app-release.aab** - App Bundle
   - 位置: `build/app/outputs/bundle/release/app-release.aab`
   - 用途: Google Play发布
   - 优点: 动态分发，减小下载大小

---

## 🚀 快速开始

```bash
# 1. 安装Java和Android SDK（首次需要）
sudo apt install openjdk-17-jdk

# 2. 配置环境变量
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android
export PATH=$PATH:/home/zhgue/localhost:5173/mobileflutter/flutter/bin

# 3. 构建APK
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app
flutter build apk --release

# 4. 安装Genymotion或Android Studio模拟器

# 5. 安装APK到模拟器
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## 📞 技术支持

如遇到问题，请检查：
1. Flutter版本: `flutter --version`
2. Java版本: `java -version`
3. Android SDK: `sdkmanager --list`
4. 设备连接: `adb devices`

祝您构建顺利！🎉

