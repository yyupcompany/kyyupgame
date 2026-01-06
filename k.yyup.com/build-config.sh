#!/bin/bash

# 多线程编译配置脚本
# 适用于 50核心 + 60GB内存的高性能服务器

echo "🚀 配置多线程编译环境..."

# 1. 设置 Node.js 内存限制（使用50GB，留10GB给系统）
export NODE_OPTIONS="--max-old-space-size=51200"

# 2. 设置 UV_THREADPOOL_SIZE（Node.js线程池大小，默认4，提升到50）
export UV_THREADPOOL_SIZE=50

# 3. 设置 npm 并发数
export NPM_CONFIG_MAXSOCKETS=50

# 4. 设置 TypeScript 编译器并发数
export TSC_COMPILE_ON_ERROR=true
export TSC_WATCHFILE=useFsEvents

# 5. 设置 Vite 构建并发数
export VITE_CJS_TRACE=true

# 6. 设置 esbuild 并发数（使用所有核心）
export ESBUILD_WORKER_THREADS=50

echo "✅ 环境变量配置完成："
echo "   NODE_OPTIONS: $NODE_OPTIONS"
echo "   UV_THREADPOOL_SIZE: $UV_THREADPOOL_SIZE"
echo "   NPM_CONFIG_MAXSOCKETS: $NPM_CONFIG_MAXSOCKETS"
echo "   ESBUILD_WORKER_THREADS: $ESBUILD_WORKER_THREADS"
echo ""
echo "💡 使用方法："
echo "   source build-config.sh"
echo "   npm run build"

