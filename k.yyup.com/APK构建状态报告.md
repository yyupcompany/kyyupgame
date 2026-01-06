# Flutter APK构建状态报告

## 📊 当前状态

### ✅ 已完成的安装

1. **Genymotion 3.9.0** - Android模拟器
   - 安装位置：`/home/zhgue/localhost:5173/genymotion/`
   - 状态：✅ 安装成功

2. **VirtualBox 7.1.8** - 虚拟化平台
   - 版本：7.1.8_Deepinr168469
   - DKMS模块：✅ 已编译并加载
   - 内核模块：✅ vboxdrv, vboxnetflt, vboxnetadp 已加载
   - 状态：✅ 完全就绪

3. **Java JDK 17** - Android构建工具链
   - 版本：OpenJDK 17.0.12+7-Deepin-1deepin1
   - JAVA_HOME：/usr/lib/jvm/java-17-openjdk-amd64
   - 状态：✅ 安装成功

4. **Flutter 3.24.5** - 移动应用框架
   - 位置：`/home/zhgue/localhost:5173/mobileflutter/flutter/`
   - Android工具链：✅ 已就绪 (Android SDK 28.0.3)
   - 状态：✅ 基本就绪

5. **环境变量配置**
   - 配置文件：~/.bashrc
   - JAVA_HOME：✅ 已配置
   - Flutter PATH：✅ 已配置
   - Genymotion PATH：✅ 已配置
   - 状态：✅ 已配置（需要 `source ~/.bashrc` 生效）

6. **用户权限**
   - vboxusers组：✅ 用户已添加
   - 状态：✅ 已配置（需要重新登录生效）

---

## ❌ 当前问题

### 问题1：Flutter Embedding依赖下载失败

**错误信息**：
```
Could not GET 'https://storage.googleapis.com/download.flutter.io/...'
Got socket exception during request. It might be caused by SSL misconfiguration
Connection reset
```

**原因**：
- Google Storage (storage.googleapis.com) 在国内网络环境下访问受限
- Flutter embedding依赖托管在Google Storage上
- 即使配置了Maven镜像，Flutter特定依赖仍然从Google Storage下载

**影响**：
- 无法完成APK构建
- 构建在下载Flutter embedding时失败

---

## 🔧 解决方案

### 方案1：配置网络代理（推荐）

如果您有可用的HTTP/HTTPS代理：

```bash
# 设置Gradle代理
mkdir -p ~/.gradle
cat > ~/.gradle/gradle.properties << EOF
systemProp.http.proxyHost=your-proxy-host
systemProp.http.proxyPort=your-proxy-port
systemProp.https.proxyHost=your-proxy-host
systemProp.https.proxyPort=your-proxy-port
EOF

# 然后重新构建
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app
../../mobileflutter/flutter/bin/flutter build apk --release
```

### 方案2：使用Flutter中国镜像

```bash
# 设置Flutter中国镜像环境变量
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn

# 添加到 ~/.bashrc 永久生效
echo 'export PUB_HOSTED_URL=https://pub.flutter-io.cn' >> ~/.bashrc
echo 'export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn' >> ~/.bashrc
source ~/.bashrc

# 清理并重新构建
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app
../../mobileflutter/flutter/bin/flutter clean
../../mobileflutter/flutter/bin/flutter pub get
../../mobileflutter/flutter/bin/flutter build apk --release
```

### 方案3：手动下载Flutter Embedding（临时方案）

如果上述方案都不可行，可以尝试手动下载并放置Flutter embedding文件。

---

## 📋 已完成的配置优化

### 1. Gradle镜像配置

**文件：`android/build.gradle`**
```gradle
allprojects {
    repositories {
        // 使用阿里云镜像加速
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        google()
        mavenCentral()
    }
}
```

**文件：`android/settings.gradle`**
```gradle
repositories {
    // 使用阿里云镜像加速
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    google()
    mavenCentral()
    gradlePluginPortal()
}
```

### 2. Gradle Wrapper镜像

**文件：`android/gradle/wrapper/gradle-wrapper.properties`**
```properties
# 使用腾讯云镜像加速
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.3-all.zip
```

---

## 🚀 下一步操作建议

### 立即可以做的：

1. **配置Flutter中国镜像**（最简单）
   ```bash
   export PUB_HOSTED_URL=https://pub.flutter-io.cn
   export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
   cd /home/zhgue/localhost:5173/mobileflutter/teacher_app
   ../../mobileflutter/flutter/bin/flutter clean
   ../../mobileflutter/flutter/bin/flutter build apk --release
   ```

2. **启动Genymotion并创建虚拟设备**
   ```bash
   # 启动Genymotion
   /home/zhgue/localhost:5173/genymotion/genymotion
   
   # 在Genymotion中：
   # 1. 登录账号
   # 2. 点击 "+" 创建新虚拟设备
   # 3. 选择设备型号（推荐：Google Pixel 5）
   # 4. 选择Android版本（推荐：Android 11.0）
   # 5. 下载并启动虚拟设备
   ```

3. **验证环境**
   ```bash
   source ~/.bashrc
   java -version
   flutter --version
   genymotion --version
   ```

---

## 📱 Genymotion使用指南

### 启动Genymotion

```bash
/home/zhgue/localhost:5173/genymotion/genymotion
```

### 创建虚拟设备

1. 打开Genymotion
2. 点击右上角 "+" 按钮
3. 登录Genymotion账号（如果还没有，需要注册）
4. 选择设备模板：
   - **推荐**：Google Pixel 5
   - **Android版本**：Android 11.0 (API 30)
   - **RAM**：2048MB - 4096MB
   - **CPU**：2-4核心

5. 点击"Next"下载设备镜像
6. 下载完成后，设备会出现在设备列表中
7. 双击设备启动

### 安装APK到Genymotion

**方法1：拖拽安装**（最简单）
- 直接将APK文件拖拽到Genymotion虚拟设备窗口

**方法2：使用ADB**
```bash
# 确认设备连接
adb devices

# 安装APK
adb install /home/zhgue/localhost:5173/mobileflutter/teacher_app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 📊 系统要求检查

| 组件 | 要求 | 当前状态 | 备注 |
|------|------|----------|------|
| Java JDK | >= 17 | ✅ 17.0.12 | 满足要求 |
| VirtualBox | >= 6.0 | ✅ 7.1.8 | 满足要求 |
| Flutter | >= 3.0 | ✅ 3.24.5 | 满足要求 |
| Android SDK | >= 28 | ✅ 28.0.3 | 满足要求 |
| 内存 | >= 8GB | ❓ 未检查 | 建议检查 |
| 磁盘空间 | >= 10GB | ❓ 未检查 | 建议检查 |
| CPU虚拟化 | 必需 | ✅ 已启用 | VirtualBox正常运行 |

---

## 🔍 故障排查

### 如果Genymotion无法启动虚拟设备

```bash
# 检查VirtualBox内核模块
lsmod | grep vbox

# 如果没有输出，加载模块
sudo modprobe vboxdrv
sudo modprobe vboxnetflt
sudo modprobe vboxnetadp

# 检查用户权限
groups | grep vboxusers

# 如果没有，添加用户到组并重新登录
sudo usermod -aG vboxusers $USER
```

### 如果Flutter构建失败

```bash
# 清理构建缓存
cd /home/zhgue/localhost:5173/mobileflutter/teacher_app
../../mobileflutter/flutter/bin/flutter clean

# 重新获取依赖
../../mobileflutter/flutter/bin/flutter pub get

# 检查Flutter环境
../../mobileflutter/flutter/bin/flutter doctor -v
```

---

## 📞 需要帮助？

如果遇到问题，请提供以下信息：

1. 错误信息的完整输出
2. 运行 `flutter doctor -v` 的输出
3. 运行 `VBoxManage --version` 的输出
4. 运行 `java -version` 的输出
5. 网络环境（是否有代理可用）

---

**最后更新**：2025-10-07
**状态**：环境已就绪，等待网络配置完成APK构建

