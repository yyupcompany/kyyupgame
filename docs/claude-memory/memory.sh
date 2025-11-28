#!/bin/bash

# Claude 记忆系统 - 纯Shell脚本
# 无需npm依赖，直接使用Node.js运行

COMMAND=$1
shift

case $COMMAND in
    "init")
        echo "🚀 初始化Claude记忆数据库..."
        node memory-cli.js --init
        ;;
    "start"|"")
        echo "🧠 生成Claude启动记忆..."
        node memory-cli.js --start "$@"
        ;;
    "add")
        echo "📝 添加记忆记录..."
        node memory-cli.js --add "$@"
        ;;
    "search")
        echo "🔍 搜索记忆记录..."
        node memory-cli.js --search "$@"
        ;;
    "recent")
        echo "📚 显示最近记录..."
        node memory-cli.js --recent "$@"
        ;;
    "help"|"-h"|"--help")
        cat << 'EOF'
🧠 Claude 记忆系统

用法:
  ./memory.sh [命令] [参数]

命令:
  init                    初始化数据库
  start [数量]            生成启动记忆提示 (默认10条)
  add                     添加新记录
  search [关键词]         搜索记录
  recent [数量]           显示最近记录 (默认10条)
  help                    显示帮助

示例:
  ./memory.sh init                     # 初始化数据库
  ./memory.sh start                    # 生成启动记忆
  ./memory.sh start 5                  # 生成最近5条记忆
  ./memory.sh add                      # 交互式添加记录
  ./memory.sh search "关键词"           # 搜索记录
  ./memory.sh recent                   # 显示最近10条
  ./memory.sh recent 20                # 显示最近20条

纯JavaScript实现，无需安装依赖！
EOF
        ;;
    *)
        echo "❌ 未知命令: $COMMAND"
        echo "使用 './memory.sh help' 查看帮助"
        exit 1
        ;;
esac
