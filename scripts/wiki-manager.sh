#!/bin/bash

# GitHub Wiki 自动化管理脚本
# 用于同步 MD 文档到 GitHub Wiki

set -e

# 配置
PROJECT_ROOT="/home/zhgue/kyyupgame"
WIKI_DIR="$PROJECT_ROOT/wiki-temp"
DOCS_DIR="$PROJECT_ROOT/docs"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 创建 Wiki 目录结构
create_wiki_structure() {
    log_info "创建 Wiki 目录结构..."

    mkdir -p "$WIKI_DIR"

    # 创建主要页面
    cat > "$WIKI_DIR/Home.md" << 'EOF'
# 欢迎使用幼儿园管理系统 Wiki

## 🚀 快速开始

### 系统概述
本项目是一个现代化的幼儿园管理系统，采用 Vue 3 + Express.js 全栈架构。

### 快速导航
- 📚 [系统架构](Architecture.md) - 了解系统整体架构
- 🚀 [快速开始](Getting-Started.md) - 环境搭建和启动
- 📖 [API 文档](API-Reference.md) - 接口文档
- 🛠️ [开发指南](Development-Guide.md) - 开发规范和流程

### 核心功能
- 👥 **用户管理** - 动态权限系统，RBAC 访问控制
- 🎓 **教育管理** - 学生、教师、班级管理
- 📝 **招生系统** - 完整的招生流程管理
- 🎪 **活动管理** - 活动创建、报名、评估
- 🤖 **AI 集成** - 智能助手和数据分析
- 🏢 **租户系统** - 多租户架构支持

### 技术栈
- **前端**: Vue 3 + TypeScript + Vite + Element Plus
- **后端**: Express.js + TypeScript + Sequelize + MySQL
- **测试**: Vitest + Playwright
- **部署**: Docker + Nginx

### 快速链接
- [GitHub 仓库](https://github.com/your-repo)
- [在线演示](http://localhost:5173)
- [API 文档](http://localhost:3000/api-docs)

---
*最后更新: $(date +%Y-%m-%d)*
EOF

    # 创建架构文档
    cat > "$WIKI_DIR/Architecture.md" << 'EOF'
# 系统架构

## 🏗️ 整体架构

```mermaid
graph TB
    subgraph "前端层"
        A[Vue 3 应用]
        B[Element Plus UI]
        C[Pinia 状态管理]
        D[Vue Router 路由]
    end

    subgraph "API 网关层"
        E[Express.js 服务器]
        F[JWT 认证中间件]
        G[RBAC 权限中间件]
        H[API 验证中间件]
    end

    subgraph "业务层"
        I[用户管理服务]
        J[教育管理服务]
        K[招生管理服务]
        L[活动管理服务]
        M[AI 集成服务]
        N[租户管理服务]
    end

    subgraph "数据层"
        O[MySQL 数据库]
        P[Redis 缓存]
        Q[文件存储 OSS]
    end

    A --> E
    E --> I
    E --> J
    E --> K
    E --> L
    E --> M
    E --> N

    I --> O
    J --> O
    K --> O
    L --> O
    M --> P
    N --> Q
```

## 🎯 核心模块

### 统一租户架构
- **租户管理中心** (`rent.yyup.cc`)
- **租户业务系统** (`k.yyup.cc`)
- **跨租户认证** 和 **数据隔离**

### 动态权限系统
- **三级权限层次**：一级类目 → 二级页面 → 三级组件
- **动态路由**：基于权限的路由生成
- **细粒度控制**：页面级和功能级权限

### AI 集成架构
- **记忆系统**：六维记忆模型
- **智能助手**：多提供商 AI 模型
- **数据分析**：AI 渗透到各业务环节

## 📊 技术指标

- **代码规模**: ~150k 行
- **Vue 组件**: 80+ 个
- **页面数量**: 162+ 个
- **API 端点**: 155+ 个
- **数据模型**: 73+ 个
- **权限记录**: 95+ 个

---
*详细文档请参考 [Development Guide](Development-Guide.md)*
EOF

    # 创建快速开始文档
    cat > "$WIKI_DIR/Getting-Started.md" << 'EOF'
# 快速开始

## 🚀 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **操作系统**: Linux, macOS, Windows
- **内存**: 建议 >= 8GB

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone https://github.com/your-repo.git
cd kyyupgame
```

### 2. 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd client && npm install
cd server && npm install
```

### 3. 数据库设置
```bash
# 配置数据库连接
cp server/.env.example server/.env

# 编辑数据库配置
nano server/.env
```

### 4. 初始化数据库
```bash
# 完整初始化
npm run seed-data:complete

# 检查数据库状态
npm run db:migrate
```

### 5. 启动服务
```bash
# 并发启动前后端（推荐）
npm run start:all

# 或者分别启动
npm run start:frontend  # 前端服务 (端口 5173)
npm run start:backend   # 后端服务 (端口 3000)
```

## 🌐 访问地址

- **前端应用**: http://localhost:5173
- **API 文档**: http://localhost:3000/api-docs
- **API 接口**: http://localhost:3000/api

## 🔧 开发工具

### 代码检查
```bash
npm run lint          # 代码风格检查
npm run typecheck     # TypeScript 类型检查
npm run validate      # 完整验证
```

### 测试
```bash
npm test              # 运行所有测试
npm run test:unit     # 单元测试
npm run test:e2e      # E2E 测试
npm run test:coverage # 测试覆盖率
```

### 构建
```bash
npm run build         # 生产构建
npm run clean         # 清理构建文件
```

## 🆘 常见问题

### 端口占用
```bash
# 检查端口占用
lsof -i :3000
lsof -i :5173

# 清理端口
npm run clean
```

### 数据库连接失败
```bash
# 检查数据库服务
systemctl status mysql

# 重新连接
cd server && npm run db:migrate
```

### 依赖安装失败
```bash
# 清理并重新安装
npm run clean:all
npm run install:all
```

---
*更多问题请查看 [Development Guide](Development-Guide.md)*
EOF

    log_success "Wiki 基础结构创建完成"
}

# 生成侧边栏配置
generate_sidebar() {
    log_info "生成侧边栏配置..."

    cat > "$WIKI_DIR/_Sidebar.md" << 'EOF'
## 📚 导航

### 🏠 主页
- [首页](Home)

### 📖 文档中心
- [系统架构](Architecture)
- [快速开始](Getting-Started)
- [API 文档](API-Reference)
- [开发指南](Development-Guide)

### 🎯 项目管理
- [进度跟踪](Progress-Tracking)
- [任务清单](Task-Lists)
- [里程碑](Milestones)

### 🔧 技术指南
- [前端指南](Frontend-Guide)
- [后端指南](Backend-Guide)
- [数据库设计](Database-Schema)

### 📋 参考资料
- [更新日志](Changelog)
- [常见问题](FAQ)
- [贡献指南](Contributing)
EOF

    log_success "侧边栏配置生成完成"
}

# 生成页脚信息
generate_footer() {
    log_info "生成页脚信息..."

    cat > "$WIKI_DIR/_Footer.md" << 'EOF'
---
**幼儿园管理系统 Wiki**

- 📧 联系我们: [support@example.com](mailto:support@example.com)
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 讨论交流: [GitHub Discussions](https://github.com/your-repo/discussions)

*最后更新: $(date +%Y-%m-%d)*
EOF

    log_success "页脚信息生成完成"
}

# 同步到 Wiki 仓库
sync_to_wiki() {
    log_info "准备同步到 Wiki 仓库..."

    # 检查是否是 Git 仓库
    if [ ! -d "$PROJECT_ROOT/.git" ]; then
        log_error "当前目录不是 Git 仓库"
        return 1
    fi

    # 检查是否有 GitHub 远程仓库
    if ! git remote get-url origin &>/dev/null; then
        log_warning "未找到 GitHub 远程仓库"
        log_info "请在 GitHub 上创建仓库并添加远程仓库："
        log_info "git remote add origin https://github.com/your-username/your-repo.git"
        return 1
    fi

    # 初始化 Wiki 仓库（如果需要）
    if [ ! -d "$PROJECT_ROOT/.git/wiki" ]; then
        log_info "克隆 Wiki 仓库..."
        git clone https://github.com/$(git remote get-url origin | sed 's/\.git$//').wiki.git "$WIKI_DIR-repo" || {
            log_warning "Wiki 仓库尚未初始化，请在 GitHub 上启用 Wiki 功能"
            log_info "步骤：Settings → Features → Enable wikis"
            return 1
        }

        # 复制文件到 Wiki 仓库
        cp -r "$WIKI_DIR"/* "$WIKI_DIR-repo/"

        cd "$WIKI_DIR-repo"
        git add .
        git commit -m "初始化 Wiki 结构
🏠 创建主页和导航
📚 添加系统架构文档
🚀 添加快速开始指南
🛠️ 设置 Wiki 基础结构

🤖 Generated with [Claude Code](https://claude.ai/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

        log_info "请手动推送 Wiki："
        log_info "cd $WIKI_DIR-repo && git push origin master"
    else
        log_success "Wiki 已经存在，文件已准备在 $WIKI_DIR"
    fi
}

# 主函数
main() {
    log_info "开始设置 GitHub Wiki..."

    # 创建 Wiki 目录结构
    create_wiki_structure

    # 生成配置文件
    generate_sidebar
    generate_footer

    # 同步到 Wiki 仓库
    sync_to_wiki

    log_success "GitHub Wiki 设置完成！"
    log_info "Wiki 文件位置：$WIKI_DIR"
    log_info "请检查并手动推送到 GitHub Wiki"

    echo
    log_info "下一步："
    echo "1. 在 GitHub 上启用 Wiki 功能（Settings → Features → Enable wikis）"
    echo "2. 将 $WIKI_DIR 中的内容推送到 Wiki 仓库"
    echo "3. 访问 GitHub Wiki 页面验证结果"
}

# 显示帮助信息
show_help() {
    echo "GitHub Wiki 管理工具"
    echo
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  init     初始化 Wiki 结构"
    echo "  sync     同步到 Wiki 仓库"
    echo "  clean    清理临时文件"
    echo "  help     显示帮助信息"
}

# 清理临时文件
clean_temp() {
    log_info "清理临时文件..."
    rm -rf "$WIKI_DIR"
    log_success "临时文件清理完成"
}

# 处理命令行参数
case "${1:-init}" in
    init)
        main
        ;;
    sync)
        sync_to_wiki
        ;;
    clean)
        clean_temp
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac