const fs = require('fs');
const path = require('path');

function checkVueComponentSyntax(filePath) {
  try {
    console.log(`🔍 检查Vue组件: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`📄 文件大小: ${content.length} 字符, ${lines.length} 行`);

    // 基本语法检查
    const checks = {
      templateBalance: (content.match(/<template>/g) || []).length === (content.match(/<\/template>/g) || []).length,
      scriptBalance: (content.match(/<script/g) || []).length === (content.match(/<\/script>/g) || []).length,
      styleBalance: (content.match(/<style/g) || []).length === (content.match(/<\/style>/g) || []).length,
      hasExportDefault: content.includes('export default'),
      hasName: content.includes('name:') || content.includes('name :'),
      hasUnclosedBrackets: checkBracketBalance(content),
      hasImportStatements: content.includes('import '),
      hasPossibleErrors: checkForCommonErrors(content)
    };

    console.log('📊 语法检查结果:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅' : '❌'}`);
    });

    // 检查导入的依赖
    const imports = extractImports(content);
    if (imports.length > 0) {
      console.log('📦 导入的依赖:');
      imports.forEach(imp => console.log(`  - ${imp}`));
    }

    // 检查组件依赖
    const components = extractComponents(content);
    if (components.length > 0) {
      console.log('🧩 使用的组件:');
      components.forEach(comp => console.log(`  - ${comp}`));
    }

    // 检查可能的API调用
    const apiCalls = extractApiCalls(content);
    if (apiCalls.length > 0) {
      console.log('🌐 API调用:');
      apiCalls.forEach(api => console.log(`  - ${api}`));
    }

    return checks;

  } catch (error) {
    console.error(`❌ 检查失败: ${error.message}`);
    return false;
  }
}

function checkBracketBalance(content) {
  const brackets = { '(': 0, ')': 0, '{': 0, '}': 0, '[': 0, ']': 0 };

  for (const char of content) {
    if (char in brackets) {
      brackets[char]++;
    } else if (char === ')') brackets['(']--;
    else if (char === '}') brackets['{']--;
    else if (char === ']') brackets['[']--;

    if (brackets['('] < 0 || brackets['{'] < 0 || brackets['['] < 0) {
      return false; // 括号不匹配
    }
  }

  return brackets['('] === 0 && brackets['{'] === 0 && brackets['['] === 0;
}

function checkForCommonErrors(content) {
  const errors = [];

  // 检查常见问题
  if (content.includes('import..from')) errors.push('import语法错误');
  if (content.includes('exportdefault')) errors.push('export default语法错误');
  if (content.includes('v-model=')) errors.push('v-model语法可能有问题');
  if (content.includes('@click=') && !content.includes('()')) errors.push('事件处理器可能缺少参数');
  if (content.includes('data(){') && !content.includes('return {')) errors.push('data函数可能缺少return');

  return errors;
}

function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*)\s+as\s+\w+|\w+)\s+from\s+['"][^'"]+['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[0].trim());
  }

  return imports;
}

function extractComponents(content) {
  const components = [];
  const componentRegex = /<(\w[\w-]*)(?=\s|>)/g;
  let match;

  while ((match = componentRegex.exec(content)) !== null) {
    const tagName = match[1];
    if (!['template', 'script', 'style', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      components.push(tagName);
    }
  }

  return [...new Set(components)]; // 去重
}

function extractApiCalls(content) {
  const apiCalls = [];
  const apiRegex = /(?:fetch\(|axios\.|this\.\$api\.|api\.)\s*([^;]+)/g;
  let match;

  while ((match = apiRegex.exec(content)) !== null) {
    apiCalls.push(match[1].trim());
  }

  return apiCalls;
}

// 检查检查中心组件
console.log('=== 检查检查中心组件 ===');
const inspectionResult = checkVueComponentSyntax('./client/src/pages/centers/InspectionCenter.vue');

console.log('\n=== 检查文档中心组件 ===');
const documentResult = checkVueComponentSyntax('./client/src/pages/centers/DocumentTemplateCenter.vue');

console.log('\n=== 检查其他文档相关组件 ===');
const docComponents = [
  './client/src/pages/centers/DocumentCollaboration.vue',
  './client/src/pages/centers/DocumentEditor.vue',
  './client/src/pages/centers/DocumentInstanceList.vue',
  './client/src/pages/centers/DocumentStatistics.vue'
];

docComponents.forEach(comp => {
  console.log(`\n--- ${path.basename(comp)} ---`);
  checkVueComponentSyntax(comp);
});

console.log('\n🎯 语法检查完成！');