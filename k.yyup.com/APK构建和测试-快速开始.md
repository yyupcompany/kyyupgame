# APK构建和测试 - 快速开始指南

## 🎯 目标

1. ✅ 构建教师助手应用的APK文件
2. ✅ 在Genymotion模拟器中测试APK

---

## 📋 准备工作清单

### 必需安装的软件

- [ ] **VirtualBox** - Genymotion的运行环境
- [ ] **Genymotion** - Android模拟器（类似雷电模拟器）
- [ ] **Java JDK** - Flutter构建APK所需
- [ ] **Android SDK** - Flutter构建APK所需

### 已有的资源

- ✅ **Flutter** - 已安装在 `mobileflutter/flutter/`
- ✅ **教师助手应用源码** - 位于 `mobileflutter/teacher_app/`
- ✅ **构建脚本** - `mobileflutter/teacher_app/scripts/build_release.sh`

---

## 🚀 快速安装（推荐）

### 方法1：使用自动安装脚本

```bash
# 1. 进入项目目录
cd /home/zhgue/localhost:5173

# 2. 运行自动安装脚本
./install-genymotion.sh

# 脚本会自动完成：
# ✓ 检查CPU虚拟化支持
# ✓ 安装VirtualBox
# ✓ 配置用户权限
# ✓ 安装Genymotion
# ✓ 安装Java JDK（可选）
# ✓ 配置环境变量
```

**注意**：
- Genymotion需要从官网手动下载：https://www.genymotion.com/download/
- 下载后将文件保存到 `~/Downloads/genymotion/`
- 然后运行安装脚本

---

### 方法2：手动安装

#### 步骤1：安装VirtualBox

```bash
sudo apt update
sudo apt install -y virtualbox virtualbox-ext-pack

# 配置用户权限
sudo usermod -aG vboxusers $USER

# 重新登录或重启系统使权限生效
```

#### 步骤2：下载并安装Genymotion

```bash
# 1. 访问官网下载
# https://www.genymotion.com/download/
# 选择: Genymotion Desktop (Free for personal use)
# 平台: Linux 64 bits

# 2. 给安装文件添加执行权限
cd ~/Downloads
chmod +x genymotion-3.*.bin

# 3. 运行安装程序
./genymotion-3.*.bin

# 4. 按照提示完成安装
# - 接受许可协议: 输入 'y'
# - 安装路径: 默认 ~/genymotion (直接回车)
# - 创建桌面快捷方式: 输入 'y'
```

#### 步骤3：安装Java JDK

```bash
sudo apt install -y openjdk-17-jdk

# 配置环境变量
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证安装
java -version
```

---

## 📱 创建Genymotion虚拟设备

### 步骤1：启动Genymotion

```bash
# 方法1：使用桌面快捷方式
# 在应用菜单中找到"Genymotion"图标并点击

# 方法2：使用命令行
~/genymotion/genymotion
```

### 步骤2：登录账号

- 使用注册时的邮箱和密码登录
- 或选择"Personal Use"免费版

### 步骤3：创建虚拟设备

```
1. 点击右上角的 "+" 按钮
2. 选择设备型号：Google Pixel 5
3. 选择Android版本：Android 11.0 (API 30)
4. 设备名称：Teacher_App_Test
5. 点击"Next"开始下载和创建
6. 等待下载完成（约500MB-1GB）
```

### 步骤4：启动虚拟设备

```
1. 在Genymotion主界面选择创建的虚拟设备
2. 点击"Start"按钮
3. 等待虚拟设备启动（首次启动较慢）
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

# 使用本地Flutter
../../mobileflutter/flutter/bin/flutter clean
../../mobileflutter/flutter/bin/flutter pub get
../../mobileflutter/flutter/bin/flutter build apk --release --shrink
```

### 构建完成后

APK文件位置：
```
/home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 📲 安装APK到Genymotion

### 方法1：拖拽安装（最简单）

```
1. 确保Genymotion虚拟设备已启动
2. 打开文件管理器，找到APK文件
3. 直接将APK文件拖拽到虚拟设备窗口
4. 等待安装完成
5. 在应用列表中找到"教师助手"应用
```

### 方法2：使用ADB命令

```bash
# 1. 检查设备连接
adb devices

# 2. 安装APK
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk

# 3. 查看安装结果
# Success 表示安装成功
```

---

## 🧪 测试应用

### 基本测试流程

```
1. 在虚拟设备中点击"教师助手"图标启动应用
2. 测试登录功能
3. 测试数据加载
4. 测试页面导航
5. 测试网络请求
```

### 查看应用日志

```bash
# 实时查看应用日志
adb logcat | grep flutter

# 保存日志到文件
adb logcat > ~/Desktop/app_log.txt
```

### 截图和录屏

```bash
# 截图
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ~/Desktop/

# 录屏
adb shell screenrecord /sdcard/demo.mp4
# 按Ctrl+C停止录制
adb pull /sdcard/demo.mp4 ~/Desktop/
```

---

## 📊 完整流程图

```
┌─────────────────────────────────────────────────────────┐
│ 1. 环境准备                                              │
│    ├─ 安装VirtualBox                                    │
│    ├─ 安装Genymotion                                    │
│    ├─ 安装Java JDK                                      │
│    └─ 配置环境变量                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. 创建虚拟设备                                          │
│    ├─ 启动Genymotion                                    │
│    ├─ 登录账号                                          │
│    ├─ 创建虚拟设备（Google Pixel 5, Android 11）        │
│    └─ 启动虚拟设备                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. 构建APK                                              │
│    ├─ 进入项目目录                                       │
│    ├─ 运行构建脚本或Flutter命令                          │
│    └─ 等待构建完成                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. 安装APK                                              │
│    ├─ 拖拽APK到虚拟设备窗口                             │
│    └─ 或使用adb install命令                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. 测试应用                                              │
│    ├─ 启动应用                                          │
│    ├─ 测试各项功能                                       │
│    ├─ 查看日志                                          │
│    └─ 截图/录屏保存测试结果                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🐛 常见问题

### 问题1: Flutter构建失败

**解决方案**：
```bash
# 检查Java是否安装
java -version

# 如果未安装，执行
sudo apt install openjdk-17-jdk
```

### 问题2: Genymotion虚拟设备启动失败

**解决方案**：
```bash
# 检查VirtualBox是否正常
VBoxManage --version

# 重新加载VirtualBox模块
sudo modprobe vboxdrv
```

### 问题3: ADB无法连接设备

**解决方案**：
```bash
# 重启ADB服务
adb kill-server
adb start-server
adb devices
```

---

## 📚 相关文档

1. **Flutter-APK-构建和测试指南.md** - 完整的构建和测试指南
2. **Genymotion-安装和使用指南.md** - Genymotion详细使用说明
3. **install-genymotion.sh** - 自动安装脚本

---

## ✅ 检查清单

安装前：
- [ ] CPU支持虚拟化（Intel VT-x 或 AMD-V）
- [ ] 至少4GB可用内存
- [ ] 至少10GB可用硬盘空间

安装后：
- [ ] VirtualBox已安装并正常运行
- [ ] Genymotion已安装并能启动
- [ ] Java JDK已安装
- [ ] 虚拟设备已创建并能启动
- [ ] ADB可以连接到虚拟设备

构建后：
- [ ] APK文件已生成
- [ ] APK可以成功安装到虚拟设备
- [ ] 应用可以正常启动和运行

---

## 🎯 下一步

完成APK构建和测试后，您可以：

1. **优化应用性能**
   - 分析应用启动时间
   - 优化内存使用
   - 减小APK体积

2. **测试不同场景**
   - 不同Android版本
   - 不同屏幕分辨率
   - 不同网络状态

3. **准备发布**
   - 生成签名APK
   - 构建App Bundle
   - 准备应用商店资料

---

## 📞 获取帮助

如遇到问题，请查看：
1. 详细文档：`Genymotion-安装和使用指南.md`
2. Flutter官方文档：https://flutter.dev/docs
3. Genymotion官方文档：https://docs.genymotion.com/

祝您构建和测试顺利！🎉

