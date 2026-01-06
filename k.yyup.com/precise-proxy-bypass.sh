#!/bin/bash

# 精准代理绕过配置 - 只包含开发环境必需的域名
# 针对 Claude Code、GitHub、NPM、Docker 的最小化域名白名单

echo "🎯 配置精准代理绕过白名单..."

# 本地地址
LOCAL_ADDRESSES="localhost,127.0.0.1,::1,0.0.0.0"

# Claude API 和 AI 服务域名
CLAUDE_DOMAINS="*.anthropic.com,api.anthropic.com,claude.ai"
CLAUDE_DOMAINS="$CLAUDE_DOMAINS,*.sealos.run,aiproxy.hzh.sealos.run"  # 您当前使用的AI代理服务

# GitHub 必需域名 (Git操作和API访问)
GITHUB_DOMAINS="github.com,*.github.com,api.github.com"
GITHUB_DOMAINS="$GITHUB_DOMAINS,raw.githubusercontent.com,codeload.github.com"
GITHUB_DOMAINS="$GITHUB_DOMAINS,github.io,*.github.io"  # GitHub Pages

# NPM 注册表域名
NPM_DOMAINS="registry.npmjs.org,www.npmjs.com,npmjs.org,*.npmjs.org"

# Docker Hub 必需域名
DOCKER_DOMAINS="hub.docker.com,registry-1.docker.io,registry.docker.io"
DOCKER_DOMAINS="$DOCKER_DOMAINS,auth.docker.io,index.docker.io"
DOCKER_DOMAINS="$DOCKER_DOMAINS,production.cloudflare.docker.com"
DOCKER_DOMAINS="$DOCKER_DOMAINS,dseasb33srnrn.cloudfront.net"  # Docker CDN

# 常用开发服务域名
DEV_SERVICES="*.stackblitz.com,*.codesandbox.io,*.replit.com"
DEV_SERVICES="$DEV_SERVICES,*.vercel.com,*.netlify.com,*.heroku.com"

# VS Code 相关域名 (如果使用)
VSCODE_DOMAINS="*.vscode-cdn.net,marketplace.visualstudio.com"
VSCODE_DOMAINS="$VSCODE_DOMAINS,vscode.dev,*.vscode.dev"

# 其他必要的开发工具域名
OTHER_DEV="*.jsdelivr.net,*.unpkg.com,*.cdnjs.cloudflare.com"  # CDN
OTHER_DEV="$OTHER_DEV,fonts.googleapis.com,fonts.gstatic.com"  # Google Fonts

# 合并所有域名
NO_PROXY_PRECISE="$LOCAL_ADDRESSES,$CLAUDE_DOMAINS,$GITHUB_DOMAINS,$NPM_DOMAINS,$DOCKER_DOMAINS,$DEV_SERVICES,$VSCODE_DOMAINS,$OTHER_DEV"

echo "📝 生成的精准NO_PROXY配置："
echo "包含域名类别："
echo "  🤖 Claude AI: $CLAUDE_DOMAINS"
echo "  🐙 GitHub: $GITHUB_DOMAINS"  
echo "  📦 NPM: $NPM_DOMAINS"
echo "  🐳 Docker: $DOCKER_DOMAINS"
echo "  🛠️  开发服务: $DEV_SERVICES"
echo "  💻 VS Code: $VSCODE_DOMAINS"
echo "  🌐 其他CDN: $OTHER_DEV"

echo ""
echo "🔧 应用配置..."
export NO_PROXY="$NO_PROXY_PRECISE"
export no_proxy="$NO_PROXY_PRECISE"

echo "✅ 精准代理绕过配置完成！"
echo ""
echo "📊 配置统计："
echo "  总域名数量: $(echo $NO_PROXY_PRECISE | tr ',' '\n' | wc -l)"
echo "  配置长度: $(echo $NO_PROXY_PRECISE | wc -c) 字符"

echo ""
echo "📋 如需永久配置，请将以下内容添加到 ~/.bashrc 或 ~/.profile："
echo "export NO_PROXY='$NO_PROXY_PRECISE'"
echo "export no_proxy='$NO_PROXY_PRECISE'"

# 保存到精准配置文件
ENV_FILE="/home/devbox/.precise-proxy-bypass"
echo "export NO_PROXY='$NO_PROXY_PRECISE'" > "$ENV_FILE"
echo "export no_proxy='$NO_PROXY_PRECISE'" >> "$ENV_FILE"

echo ""
echo "📁 精准配置已保存到: $ENV_FILE"
echo "💡 可以使用 source $ENV_FILE 来加载配置"

echo ""
echo "🧪 测试关键域名："
echo "  GitHub: $(echo $NO_PROXY_PRECISE | grep -o 'github.com' && echo '✅' || echo '❌')"
echo "  Claude AI: $(echo $NO_PROXY_PRECISE | grep -o 'anthropic.com' && echo '✅' || echo '❌')"
echo "  NPM: $(echo $NO_PROXY_PRECISE | grep -o 'npmjs.org' && echo '✅' || echo '❌')"
echo "  Docker: $(echo $NO_PROXY_PRECISE | grep -o 'docker.io' && echo '✅' || echo '❌')"
echo "  AI代理: $(echo $NO_PROXY_PRECISE | grep -o 'sealos.run' && echo '✅' || echo '❌')"