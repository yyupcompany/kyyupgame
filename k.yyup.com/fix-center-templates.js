const fs = require('fs');
const path = require('path');

// 需要修复的中心页面文件
const centerFiles = [
  'client/src/pages/centers/AICenter.vue',
  'client/src/pages/centers/SystemCenter.vue',
  'client/src/pages/centers/PersonnelCenter.vue',
  'client/src/pages/centers/ActivityCenter.vue',
  'client/src/pages/centers/EnrollmentCenter.vue'
];

function fixCenterTemplate(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修复缩进问题：将错误的8空格缩进改为6空格
  content = content.replace(/^        <!-- /gm, '      <!-- ');
  content = content.replace(/^        <div class="/gm, '      <div class="');
  content = content.replace(/^        <\/div>/gm, '      </div>');
  
  // 检查并修复多余的 </div> 标签
  const lines = content.split('\n');
  const fixedLines = [];
  let divStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 跟踪div标签
    if (trimmed.startsWith('<div')) {
      divStack.push(i);
      fixedLines.push(line);
    } else if (trimmed === '</div>') {
      if (divStack.length > 0) {
        divStack.pop();
        fixedLines.push(line);
      } else {
        console.log(`在 ${filePath} 第 ${i + 1} 行发现多余的 </div> 标签，已删除`);
        // 跳过这个多余的 </div>
      }
    } else if (trimmed === '</template>') {
      // 在 </template> 之前，确保所有div都已关闭
      fixedLines.push(line);
      break;
    } else {
      fixedLines.push(line);
    }
  }
  
  // 添加剩余的行
  for (let i = fixedLines.length; i < lines.length; i++) {
    fixedLines.push(lines[i]);
  }
  
  const fixedContent = fixedLines.join('\n');
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`已修复: ${filePath}`);
  } else {
    console.log(`无需修复: ${filePath}`);
  }
}

// 修复所有中心页面
centerFiles.forEach(fixCenterTemplate);

console.log('所有中心页面模板修复完成！');
