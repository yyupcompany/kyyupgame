#!/bin/bash

# Shell命令安全执行脚本 - 避免引号语法错误
# 使用方法: ./safe-shell.sh "您的命令内容"

if [ $# -eq 0 ]; then
    echo "使用方法: $0 \"您的命令内容\""
    echo "示例: $0 \"echo Hello World\""
    exit 1
fi

# 自动将中文引号转换为英文引号
COMMAND="$1"
COMMAND=${COMMAND//'【'/\'}
COMMAND=${COMMAND//】\'/\'}
COMMAND=${COMMAND//'（'/\'}
COMMAND=${COMMAND//'）\'/\'}

echo "执行命令: $COMMAND"
eval "$COMMAND"