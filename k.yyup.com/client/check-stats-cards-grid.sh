#!/bin/bash

# 检查PC端Vue页面中stats-cards是否有grid布局的脚本

REPORT_FILE="/persistent/home/zhgue/kyyupgame/k.yyup.com/client/STATS_CARDS_LAYOUT_REPORT.md"

echo "# PC端卡片布局检测报告" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 函数：检查单个文件
check_file() {
  local file="$1"
  local has_stats_cards=$(grep -c "stats-cards" "$file" 2>/dev/null || echo "0")
  local has_stat_card=$(grep -c "StatCard" "$file" 2>/dev/null || echo "0")

  if [ "$has_stats_cards" -gt 0 ] || [ "$has_stat_card" -gt 0 ]; then
    # 提取<style>部分
    local style_content=$(sed -n '/<style.*scoped>/,/<\/style>/p' "$file" 2>/dev/null)

    # 检查是否有grid布局
    local has_grid=0
    if echo "$style_content" | grep -q "display:\s*grid"; then
      has_grid=1
    fi

    # 检查stats-cards是否有display属性
    local stats_cards_has_display=0
    if echo "$style_content" | grep -A 20 "\.stats-cards" | grep -q "display:"; then
      stats_cards_has_display=1
    fi

    # 如果有stats-cards但没有grid布局，或者没有display属性
    if [ "$has_stats_cards" -gt 0 ] && [ "$stats_cards_has_display" -eq 0 ]; then
      echo "MISSING_GRID|$file"
    fi
  fi
}

# 导出函数供xargs使用
export -f check_file

echo "## 检测统计" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 统计三个目录的文件数
centers_count=$(find /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | wc -l)
teacher_count=$(find /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/teacher-center -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | wc -l)
parent_count=$(find /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | wc -l)

total_files=$((centers_count + teacher_count + parent_count))

echo "- 总文件数: $total_files" >> "$REPORT_FILE"
echo "- Centers目录: $centers_count" >> "$REPORT_FILE"
echo "- Teacher-Center目录: $teacher_count" >> "$REPORT_FILE"
echo "- Parent-Center目录: $parent_count" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 找出所有包含stats-cards或StatCard的文件
echo "## 详细分析" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 分析Centers目录
echo "### Centers 目录" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/centers
for file in $(find . -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | sort); do
  result=$(check_file "$(pwd)/$file")
  if [[ $result == MISSING_GRID* ]]; then
    filepath=$(echo "$result" | cut -d'|' -f2)
    filename=$(basename "$filepath")
    echo "#### \`${filename}\`" >> "$REPORT_FILE"
    echo "**路径**: \`$file\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # 显示stats-cards相关的样式
    echo "当前样式:" >> "$REPORT_FILE"
    echo '```scss' >> "$REPORT_FILE"
    grep -A 10 "\.stats-cards" "$filepath" | head -15 >> "$REPORT_FILE" 2>&1 || echo "未找到.stats-cards样式"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

# 分析Teacher-Center目录
echo "" >> "$REPORT_FILE"
echo "### Teacher-Center 目录" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/teacher-center
for file in $(find . -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | sort); do
  result=$(check_file "$(pwd)/$file")
  if [[ $result == MISSING_GRID* ]]; then
    filepath=$(echo "$result" | cut -d'|' -f2)
    filename=$(basename "$filepath")
    echo "#### \`${filename}\`" >> "$REPORT_FILE"
    echo "**路径**: \`$file\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # 显示stats-cards相关的样式
    echo "当前样式:" >> "$REPORT_FILE"
    echo '```scss' >> "$REPORT_FILE"
    grep -A 10 "\.stats-cards" "$filepath" | head -15 >> "$REPORT_FILE" 2>&1 || echo "未找到.stats-cards样式"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

# 分析Parent-Center目录
echo "" >> "$REPORT_FILE"
echo "### Parent-Center 目录" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd /persistent/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/parent-center
for file in $(find . -name "*.vue" -type f | grep -v "components/" | grep -v "duplicates-backup" | sort); do
  result=$(check_file "$(pwd)/$file")
  if [[ $result == MISSING_GRID* ]]; then
    filepath=$(echo "$result" | cut -d'|' -f2)
    filename=$(basename "$filepath")
    echo "#### \`${filename}\`" >> "$REPORT_FILE"
    echo "**路径**: \`$file\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # 显示stats-cards相关的样式
    echo "当前样式:" >> "$REPORT_FILE"
    echo '```scss' >> "$REPORT_FILE"
    grep -A 10 "\.stats-cards" "$filepath" | head -15 >> "$REPORT_FILE" 2>&1 || echo "未找到.stats-cards样式"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

echo "" >> "$REPORT_FILE"
echo "## 建议修复方案" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "为所有缺失grid布局的\`.stats-cards\`添加以下样式：" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```scss' >> "$REPORT_FILE"
echo '.stats-cards {' >> "$REPORT_FILE"
echo '  display: grid;' >> "$REPORT_FILE"
echo '  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));' >> "$REPORT_FILE"
echo '  gap: var(--spacing-lg, 16px);' >> "$REPORT_FILE"
echo '  /* 保留原有的 margin-bottom 等属性 */' >> "$REPORT_FILE"
echo '}' >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "报告已生成: $REPORT_FILE"
