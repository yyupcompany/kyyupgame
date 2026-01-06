#!/bin/bash
# 代理环境变量设置脚本
# 用于在启动项目时设置代理配置

echo "🔧 设置代理环境变量..."

# 设置HTTP代理
export HTTP_PROXY="http://127.0.0.1:10809"
export HTTPS_PROXY="http://127.0.0.1:10809"

# 设置npm代理
export npm_config_proxy="http://127.0.0.1:10809"
export npm_config_https_proxy="http://127.0.0.1:10809"

# 设置Git代理
export GIT_HTTP_PROXY="http://127.0.0.1:10809"
export GIT_HTTPS_PROXY="http://127.0.0.1:10809"

# 设置Node.js代理
export NODE_TLS_REJECT_UNAUTHORIZED=0

# 设置不使用代理的地址
export NO_PROXY="localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site"
export npm_config_noproxy="localhost,127.0.0.1,::1,k.yyup.cc,sealoshzh.site"

echo "✅ 代理环境变量设置完成"
echo "📋 当前代理配置:"
echo "   HTTP_PROXY=$HTTP_PROXY"
echo "   HTTPS_PROXY=$HTTPS_PROXY"
echo "   NO_PROXY=$NO_PROXY"
echo ""
