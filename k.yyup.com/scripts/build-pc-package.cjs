#!/usr/bin/env node

/**
 * PC端打包脚本
 * 一键构建前端和后端，生成PC端部署包
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

class PCBuilder {
  constructor() {
    this.rootDir = process.cwd();
    this.distDir = path.join(this.rootDir, 'dist-pc');
    this.packageDir = path.join(this.rootDir, 'package-pc');
    this.startTime = Date.now();

    console.log(chalk.cyan.bold('🏗️  PC端打包构建器'));
    console.log(chalk.gray('='.repeat(50)));
  }

  /**
   * 记录时间
   */
  logTime(label) {
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    console.log(chalk.gray(`⏱️  ${label}: ${minutes}分${remainingSeconds}秒`));
  }

  /**
   * 执行命令并显示输出
   */
  async runCommand(command, cwd, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue(`📦 执行命令: ${command}`));
      console.log(chalk.gray(`📁 目录: ${cwd}`));

      const child = spawn(command, [], {
        shell: true,
        cwd,
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' },
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(chalk.gray(output));
      });

      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(chalk.red(output));
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}\n${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 清理旧文件
   */
  async clean() {
    console.log(chalk.yellow('🧹 清理旧的构建文件...'));

    await fs.remove(this.distDir);
    await fs.remove(this.packageDir);

    // 清理各模块的构建产物
    await fs.remove(path.join(this.rootDir, 'client/dist'));
    await fs.remove(path.join(this.rootDir, 'client/dist-pc'));
    await fs.remove(path.join(this.rootDir, 'server/dist'));

    console.log(chalk.green('✅ 清理完成'));
    this.logTime('清理');
  }

  /**
   * 构建前端
   */
  async buildFrontend() {
    console.log(chalk.blue.bold('🎨 构建前端...'));

    const clientDir = path.join(this.rootDir, 'client');

    try {
      // 安装前端依赖
      console.log(chalk.blue('📦 安装前端依赖...'));
      await this.runCommand('npm install', clientDir);

      // 执行PC端构建
      console.log(chalk.blue('🔨 构建PC端前端...'));
      await this.runCommand('npm run build:prod', clientDir);

      console.log(chalk.green('✅ 前端构建完成'));
      this.logTime('前端构建');

    } catch (error) {
      console.error(chalk.red('❌ 前端构建失败:'), error.message);
      throw error;
    }
  }

  /**
   * 构建后端
   */
  async buildBackend() {
    console.log(chalk.blue.bold('⚙️ 构建后端...'));

    const serverDir = path.join(this.rootDir, 'server');

    try {
      // 安装后端依赖
      console.log(chalk.blue('📦 安装后端依赖...'));
      await this.runCommand('npm install --production', serverDir);

      // 执行后端构建
      console.log(chalk.blue('🔨 构建后端...'));
      await this.runCommand('npm run build:production', serverDir);

      console.log(chalk.green('✅ 后端构建完成'));
      this.logTime('后端构建');

    } catch (error) {
      console.error(chalk.red('❌ 后端构建失败:'), error.message);
      throw error;
    }
  }

  /**
   * 创建生产环境配置
   */
  async createProductionConfig() {
    console.log(chalk.blue.bold('📝 创建生产环境配置...'));

    // 后端生产环境配置
    const serverProdConfig = `# PC端生产环境配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kindergarten_management
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 日志配置
LOG_LEVEL=error
LOG_FILE=./logs/app.log

# CORS配置
CORS_ORIGIN=http://localhost:6000

# API配置
API_PREFIX=/api

# Redis配置（如果使用）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 安全配置
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# OSS配置（阿里云）
OSS_REGION=
OSS_BUCKET=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_ENDPOINT=

# 其他配置
TIMEZONE=Asia/Shanghai
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100`;

    await fs.writeFile(
      path.join(this.rootDir, 'server/.env.production'),
      serverProdConfig
    );

    // 启动脚本
    const startScript = `#!/bin/bash

# PC端启动脚本
echo "🚀 启动幼儿园管理系统PC端"

# 检查Node.js版本
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Node.js版本过低，需要 >= $required_version"
    exit 1
fi

# 设置环境变量
export NODE_ENV=production

# 启动后端服务
echo "📡 启动后端服务..."
cd server
npm run start:production &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端服务（如果需要）
echo "🌐 启动前端静态服务..."
cd ../
npx serve client/dist-pc -l 6000 -s &
FRONTEND_PID=$!

# 显示服务信息
echo ""
echo "🎉 服务启动成功！"
echo "📡 后端API: http://localhost:3000/api"
echo "🌐 前端界面: http://localhost:6000"
echo "📚 API文档: http://localhost:3000/api-docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待中断信号
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# 保持脚本运行
wait`;

    await fs.writeFile(
      path.join(this.rootDir, 'start-pc.sh'),
      startScript
    );

    // Windows启动脚本
    const winStartScript = `@echo off
title 幼儿园管理系统PC端

echo 🚀 启动幼儿园管理系统PC端

:: 检查Node.js版本
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js，请先安装Node.js >= 18.0.0
    pause
    exit /b 1
)

:: 设置环境变量
set NODE_ENV=production

:: 启动后端服务
echo 📡 启动后端服务...
cd server
start "后端服务" cmd /k "npm run start:production"

:: 等待后端启动
timeout /t 5 /nobreak >nul

:: 启动前端服务
echo 🌐 启动前端静态服务...
cd ../
start "前端服务" cmd /k "npx serve client/dist-pc -l 6000 -s"

echo.
echo 🎉 服务启动成功！
echo 📡 后端API: http://localhost:3000/api
echo 🌐 前端界面: http://localhost:6000
echo 📚 API文档: http://localhost:3000/api-docs
echo.
echo 按任意键退出...
pause >nul`;

    await fs.writeFile(
      path.join(this.rootDir, 'start-pc.bat'),
      winStartScript
    );

    // 设置执行权限
    try {
      await fs.chmod(path.join(this.rootDir, 'start-pc.sh'), '755');
    } catch (error) {
      // Windows系统可能不支持chmod
      console.log(chalk.yellow('⚠️  无法设置脚本执行权限（Windows系统）'));
    }

    console.log(chalk.green('✅ 生产环境配置创建完成'));
  }

  /**
   * 创建部署包
   */
  async createPackage() {
    console.log(chalk.blue.bold('📦 创建部署包...'));

    // 创建目录结构
    await fs.ensureDir(this.packageDir);

    // 复制前端构建文件
    console.log(chalk.blue('📁 复制前端文件...'));
    const frontendDist = path.join(this.rootDir, 'client/dist-pc');
    const packageFrontend = path.join(this.packageDir, 'frontend');

    if (await fs.pathExists(frontendDist)) {
      await fs.copy(frontendDist, packageFrontend);
    } else {
      throw new Error('前端构建文件不存在，请先执行前端构建');
    }

    // 复制后端构建文件
    console.log(chalk.blue('📁 复制后端文件...'));
    const backendDist = path.join(this.rootDir, 'server/dist');
    const packageBackend = path.join(this.packageDir, 'backend');

    if (await fs.pathExists(backendDist)) {
      await fs.copy(backendDist, packageBackend);

      // 复制必要的配置文件
      const packageFiles = [
        'server/package.json',
        'server/package-lock.json',
        'server/.env.production'
      ];

      for (const file of packageFiles) {
        const src = path.join(this.rootDir, file);
        const dest = path.join(this.packageDir, path.basename(file));
        if (await fs.pathExists(src)) {
          await fs.copy(src, dest);
        }
      }

      // 复制上传目录（如果存在）
      const uploadDir = path.join(this.rootDir, 'server/uploads');
      if (await fs.pathExists(uploadDir)) {
        await fs.copy(uploadDir, path.join(this.packageDir, 'uploads'));
      }

    } else {
      throw new Error('后端构建文件不存在，请先执行后端构建');
    }

    // 复制启动脚本
    await fs.copy(
      path.join(this.rootDir, 'start-pc.sh'),
      path.join(this.packageDir, 'start.sh')
    );
    await fs.copy(
      path.join(this.rootDir, 'start-pc.bat'),
      path.join(this.packageDir, 'start.bat')
    );

    // 创建README文档
    const readme = `# 幼儿园管理系统 PC端部署包

## 📋 系统要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- 内存 >= 4GB
- 磁盘空间 >= 2GB

## 🚀 快速开始

### 1. 环境准备

\`\`\`bash
# 检查Node.js版本
node --version

# 检查MySQL服务
mysql --version
\`\`\`

### 2. 数据库配置

创建MySQL数据库：
\`\`\`sql
CREATE DATABASE kindergarten_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

修改 \`package.json\` 中的数据库连接配置：
- \`DB_HOST\`: 数据库主机
- \`DB_USER\`: 数据库用户名
- \`DB_PASSWORD\`: 数据库密码
- \`DB_NAME\`: 数据库名称

### 3. 启动服务

#### Linux/macOS:
\`\`\`bash
chmod +x start.sh
./start.sh
\`\`\`

#### Windows:
\`\`\`cmd
start.bat
\`\`\`

### 4. 访问系统

- 前端界面: http://localhost:6000
- 后端API: http://localhost:3000/api
- API文档: http://localhost:3000/api-docs

## 📁 目录结构

\`\`\`
package-pc/
├── frontend/          # 前端静态文件
├── backend/           # 后端服务文件
├── uploads/           # 文件上传目录
├── package.json       # 后端依赖配置
├── start.sh          # Linux/macOS启动脚本
├── start.bat         # Windows启动脚本
└── README.md         # 部署说明文档
\`\`\`

## 🔧 配置说明

主要配置在 \`package.json\` 中的环境变量：
- \`NODE_ENV\`: 运行环境
- \`PORT\`: 后端端口（默认3000）
- \`DB_HOST\`: 数据库主机
- \`DB_USER\`: 数据库用户
- \`DB_PASSWORD\`: 数据库密码
- \`JWT_SECRET\`: JWT密钥

## 🛠️ 故障排除

### 1. 端口占用
\`\`\`bash
# 查看端口占用
lsof -i :3000
lsof -i :6000

# 杀死进程
kill -9 <PID>
\`\`\`

### 2. 数据库连接失败
- 检查MySQL服务是否启动
- 验证数据库用户名和密码
- 确认数据库已创建

### 3. 依赖安装失败
\`\`\`bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
\`\`\`

## 📞 技术支持

如有问题请联系技术支持团队。

构建时间: ${new Date().toLocaleString('zh-CN')}
版本: 1.0.0`;

    await fs.writeFile(path.join(this.packageDir, 'README.md'), readme);

    console.log(chalk.green('✅ 部署包创建完成'));
    this.logTime('创建部署包');
  }

  /**
   * 生成构建报告
   */
  async generateReport() {
    const report = {
      buildTime: new Date().toISOString(),
      version: '1.0.0',
      duration: Date.now() - this.startTime,
      frontend: {
        size: await this.getDirectorySize(path.join(this.rootDir, 'client/dist-pc')),
        files: await this.countFiles(path.join(this.rootDir, 'client/dist-pc'))
      },
      backend: {
        size: await this.getDirectorySize(path.join(this.rootDir, 'server/dist')),
        files: await this.countFiles(path.join(this.rootDir, 'server/dist'))
      },
      package: {
        size: await this.getDirectorySize(this.packageDir),
        files: await this.countFiles(this.packageDir)
      }
    };

    await fs.writeJSON(path.join(this.packageDir, 'build-report.json'), report, { spaces: 2 });

    console.log(chalk.cyan.bold('\n📊 构建报告:'));
    console.log(chalk.gray(`⏱️  总耗时: ${Math.floor(report.duration / 1000)}秒`));
    console.log(chalk.blue(`📦 前端: ${report.frontend.files}个文件, ${this.formatSize(report.frontend.size)}`));
    console.log(chalk.blue(`⚙️  后端: ${report.backend.files}个文件, ${this.formatSize(report.backend.size)}`));
    console.log(chalk.green(`📦 部署包: ${report.package.files}个文件, ${this.formatSize(report.package.size)}`));
  }

  /**
   * 获取目录大小
   */
  async getDirectorySize(dirPath) {
    if (!await fs.pathExists(dirPath)) return 0;

    let totalSize = 0;
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        totalSize += await this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * 统计文件数量
   */
  async countFiles(dirPath) {
    if (!await fs.pathExists(dirPath)) return 0;

    let count = 0;
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        count += await this.countFiles(filePath);
      } else {
        count++;
      }
    }

    return count;
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 执行完整构建流程
   */
  async build() {
    try {
      await this.clean();
      await this.buildFrontend();
      await this.buildBackend();
      await this.createProductionConfig();
      await this.createPackage();
      await this.generateReport();

      console.log(chalk.green.bold('\n🎉 PC端打包完成！'));
      console.log(chalk.cyan(`📦 部署包位置: ${this.packageDir}`));
      console.log(chalk.cyan(`🚀 运行 ./start.sh 或 start.bat 启动服务`));

    } catch (error) {
      console.error(chalk.red.bold('\n❌ 构建失败:'), error.message);
      console.error(chalk.red(error.stack));
      process.exit(1);
    }
  }
}

// 执行构建
if (require.main === module) {
  const builder = new PCBuilder();
  builder.build().catch(error => {
    console.error(chalk.red.bold('❌ 构建失败:'), error.message);
    process.exit(1);
  });
}

module.exports = PCBuilder;