#!/bin/bash
# 批量修复PC端页面主题变量问题

echo "🔍 扫描PC端页面的主题变量问题..."

# 需要修复的错误变量映射
declare -A wrong_vars=(
    ["--bg-secondary"]="--bg-page"
    ["--bg-primary"]="--bg-page"
    ["--bg-color"]="--bg-card"
)

# 扫描并修复的文件列表
client_dir="k.yyup.com/client/src/pages"

# 查找所有需要修复的Vue文件
echo "📋 扫描Vue文件..."
find "$client_dir" -name "*.vue" -type f | while read file; do
    needs_fix=false
    
    # 检查文件是否包含错误的设计令牌
    for wrong_var in "${!wrong_vars[@]}"; do
        if grep -q "$wrong_var" "$file" 2>/dev/null; then
            needs_fix=true
            break
        fi
    done
    
    if [ "$needs_fix" = true ]; then
        echo "  🔧 修复: $file"
        
        # 创建临时文件
        temp_file="${file}.tmp"
        
        # 逐个替换错误的变量
        cp "$file" "$temp_file"
        for wrong_var in "${!wrong_vars[@]}"; do
            right_var="${wrong_vars[$wrong_var]}"
            sed -i "s/var($wrong_var)/var($right_var)/g" "$temp_file"
        done
        
        # 移动替换后的文件
        mv "$temp_file" "$file"
    fi
done

echo "✅ 主题变量修复完成！"
echo ""
echo "📊 扫描报告："
echo "  - 扫描目录: $client_dir"
echo "  - 修复的变量数: ${#wrong_vars[@]}"
