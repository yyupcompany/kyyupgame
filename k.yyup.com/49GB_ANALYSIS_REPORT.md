# 💾 49GB 磁盘空间占用分析报告

**分析时间**: 2025-11-15 07:05:00
**总磁盘使用**: 49GB
**剩余空间**: 30GB

## 📊 主要占用分类

### 🏆 超大目录 (>1GB)

| 目录 | 大小 | 占比 | 说明 |
|------|------|------|------|
| `.cache` | 6.3GB | 12.9% | 应用程序缓存 |
| `.config` | 4.9GB | 10.0% | 配置文件(已清理) |
| `.npm` | 3.0GB | 6.1% | npm包缓存 |
| `kyyupgame` | 4.3GB | 8.8% | 项目文件 |
| `Android` | 1.9GB | 3.9% | Android开发环境 |
| `.Genymobile` | 1.9GB | 3.9% | Android模拟器 |
| `.pub-cache` | 1.1GB | 2.2% | Dart/Flutter缓存 |
| `.gradle` | 660MB | 1.3% | Gradle构建缓存 |

### 🔍 详细分析

#### 1. 📁 缓存文件 (10.4GB)

**`.cache` 目录 (6.3GB)**
- `puppeteer`: 1.8GB - 浏览器自动化缓存
- `ms-playwright`: 1.8GB - Playwright浏览器缓存
- `google-chrome`: 1.1GB - Chrome浏览器缓存
- `uv`: 695MB - Python包管理器缓存
- `deepin`: 221MB - 系统缓存
- `node-gyp`: 111MB - Node.js编译缓存

**`.npm` 目录 (3.0GB)**
- `_cacache`: 2.7GB - npm包缓存
- `_npx`: 334MB - npx包缓存
- 其他包缓存: ~100MB

**`.pub-cache` 目录 (1.1GB)**
- Dart/Flutter包缓存

#### 2. 📁 开发环境 (6.3GB)

**`Android` 目录 (1.9GB)**
- `Android/Sdk`: 1.4GB - Android SDK
- `Android/sdk`: 426MB - 重复的SDK

**`.Genymobile` 目录 (1.9GB)**
- Android模拟器文件和镜像

**`.gradle` 目录 (660MB)**
- Gradle构建缓存

#### 3. 📁 项目文件 (4.3GB)

**`kyyupgame` 项目 (4.3GB)**
- `k.yyup.com`: 3.8GB - 主项目
- `.git/objects/pack`: 166MB - Git历史包
- `server/logs/uncaught-exceptions.log`: 551MB - 异常日志
- 其他项目分支: ~500MB

#### 4. 📁 其他缓存和配置 (7.4GB)

**`.claude`**: 734MB - Claude AI缓存
**`.sdkman`**: 509MB - SDK管理器
**`.vscode`**: 440MB - VS Code扩展
**`.cursor`**: 337MB - Cursor编辑器
**`.iflow`**: 219MB - 未知应用
**Downloads**: 924MB - 下载文件

## 💡 清理建议

### 🚨 立即可清理 (可释放约8-10GB)

1. **浏览器缓存** (~3.7GB)
   ```bash
   rm -rf ~/.cache/puppeteer ~/.cache/ms-playwright ~/.cache/google-chrome
   ```

2. **npm缓存** (3.0GB)
   ```bash
   npm cache clean --force
   ```

3. **项目日志文件** (551MB)
   ```bash
   > /persistent/home/zhgue/kyyupgame/k.yyup.com/server/logs/uncaught-exceptions.log
   ```

4. **重复的Android SDK** (426MB)
   ```bash
   rm -rf /persistent/home/zhgue/Android/sdk
   ```

### ⚠️ 需要评估后清理 (可释放约2-3GB)

1. **Genymobile模拟器** (1.9GB)
   - 如果不使用Android开发可以删除

2. **Gradle缓存** (660MB)
   - `rm -rf ~/.gradle/caches`

3. **下载文件** (924MB)
   - 检查Downloads目录中的大文件

4. **其他缓存**
   - `~/.cache/uv` (695MB)
   - `~/.pub-cache` (1.1GB) - 如果不用Flutter

### 🔄 建议保留

- `.claude` (734MB) - AI助手缓存
- 项目文件 (4.3GB) - 工作项目
- 基础配置文件 - 重要设置

## 🎯 预期清理效果

| 清理项 | 可释放空间 | 风险等级 |
|--------|------------|----------|
| 浏览器缓存 | 3.7GB | 低 |
| npm缓存 | 3.0GB | 低 |
| 项目日志 | 0.5GB | 低 |
| 重复SDK | 0.4GB | 低 |
| **小计** | **7.6GB** | **低** |

| 可选清理 | 可释放空间 | 风险等级 |
|----------|------------|----------|
| Genymobile | 1.9GB | 中 |
| Gradle缓存 | 0.7GB | 低 |
| 其他缓存 | 1.8GB | 低 |
| **小计** | **4.4GB** | **中** |

**总计可释放**: 7.6GB - 12GB
**清理后预计使用**: 37GB - 42GB
**剩余空间**: 37GB - 42GB

## 🛠️ 自动化清理脚本

建议创建定期清理脚本：
- 每周清理浏览器缓存
- 每月清理npm缓存
- 项目构建后自动清理日志

这样可以长期保持磁盘空间在合理范围内。