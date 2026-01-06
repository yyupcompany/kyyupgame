/**
 * 模型初始化顺序分析与执行脚本
 * 
 * 该脚本分析模型文件之间的依赖关系，并生成正确的初始化顺序
 * 然后在init.ts中按照该顺序导入和初始化模型
 */

const fs = require('fs');
const path = require('path');

// 模型目录
const modelsDir = path.join(__dirname, 'models');
console.log('扫描模型目录:', modelsDir);

// 读取目录下的所有模型文件
const modelFiles = fs.readdirSync(modelsDir).filter(file => 
  file.endsWith('.model.ts')
);

console.log(`找到 ${modelFiles.length} 个模型文件`);

// 依赖关系图
const dependencyGraph = {};
// 模型名称映射到文件名
const modelToFile = {};

// 分析所有模型文件的依赖关系
modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  console.log(`分析文件: ${file}`);
  
  // 读取文件内容
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 提取模型名称
  const className = file
    .replace('.model.ts', '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  // 保存模型名到文件名的映射
  modelToFile[className] = file;
  
  // 初始化依赖列表
  dependencyGraph[className] = [];
  
  // 分析导入语句，查找依赖
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let importMatch;
  
  while ((importMatch = importRegex.exec(content)) !== null) {
    const imports = importMatch[1].split(',').map(imp => imp.trim());
    const importPath = importMatch[2];
    
    // 只关注从模型目录导入的模型
    if (importPath.includes('./models/') || importPath.includes('../models/')) {
      imports.forEach(importedItem => {
        // 如果导入项是一个模型类
        if (importedItem !== 'sequelize' && importedItem !== 'Sequelize' && 
            importedItem !== 'Model' && importedItem !== 'DataTypes') {
          dependencyGraph[className].push(importedItem);
        }
      });
    }
  }
  
  // 查找belongsTo, hasMany等关联方法调用，这些也暗示了依赖
  const associationRegex = /(belongsTo|hasMany|hasOne|belongsToMany)\(\s*([A-Za-z0-9_]+)/g;
  let associationMatch;
  
  while ((associationMatch = associationRegex.exec(content)) !== null) {
    const associatedModel = associationMatch[2];
    if (!dependencyGraph[className].includes(associatedModel)) {
      dependencyGraph[className].push(associatedModel);
    }
  }
});

console.log('依赖关系分析结果:');
for (const model in dependencyGraph) {
  console.log(`${model} 依赖于: ${dependencyGraph[model].join(', ') || '无依赖'}`);
}

// 拓扑排序函数，用于生成正确的初始化顺序
function topologicalSort(graph) {
  const visited = {};
  const temp = {};
  const order = [];
  
  // 检查是否有循环依赖
  function hasCycle(node, visited, temp) {
    if (temp[node]) return true;
    if (visited[node]) return false;
    
    temp[node] = true;
    
    for (const dependency of graph[node]) {
      if (graph[dependency] && hasCycle(dependency, visited, temp)) {
        return true;
      }
    }
    
    temp[node] = false;
    visited[node] = true;
    return false;
  }
  
  // DFS遍历
  function visit(node) {
    if (visited[node]) return;
    
    temp[node] = true;
    
    // 递归访问所有依赖
    for (const dependency of graph[node]) {
      if (graph[dependency]) {
        visit(dependency);
      }
    }
    
    temp[node] = false;
    visited[node] = true;
    order.unshift(node); // 前置插入确保依赖在前
  }
  
  // 检测循环依赖
  for (const node in graph) {
    if (hasCycle(node, {}, {})) {
      console.error(`检测到循环依赖，从 ${node} 开始`);
      return null;
    }
  }
  
  // 为每个未访问的节点执行DFS
  for (const node in graph) {
    if (!visited[node]) {
      visit(node);
    }
  }
  
  return order;
}

// 生成初始化顺序
const initOrder = topologicalSort(dependencyGraph);

if (!initOrder) {
  console.error('由于循环依赖，无法确定初始化顺序');
  console.log('建议手动定义基础模型和依赖模型');
  
  // 尽管有循环依赖，我们仍然可以给出一个合理的顺序
  console.log('建议的初始化顺序:');
  
  // 基础模型优先
  const baseModels = ['User', 'Role', 'Permission', 'UserRole', 'RolePermission', 'UserProfile'];
  console.log('1. 基础模型:');
  baseModels.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model} (${modelToFile[model] || '未找到'})`);
  });
  
  // 其他模型按字母顺序
  const otherModels = Object.keys(dependencyGraph)
    .filter(model => !baseModels.includes(model))
    .sort();
  
  console.log('2. 其他模型:');
  otherModels.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model} (${modelToFile[model] || '未找到'})`);
  });
} else {
  console.log('推荐的初始化顺序:');
  initOrder.forEach((model, index) => {
    console.log(`${index + 1}. ${model} (${modelToFile[model] || '未找到'})`);
  });
  
  // 生成init.ts文件内容
  console.log('生成init.ts文件...');
  
  let initContent = `/**
 * 数据库和模型初始化脚本
 * 按特定顺序初始化各个模块，避免循环依赖问题
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  dialect: 'mysql' as const,
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
    freezeTableName: true, // 避免自动复数化
  }
};

// 首先初始化 Sequelize 实例
console.log('=== 开始初始化数据库连接 ===');
console.log(\`数据库连接信息: \${dbConfig.host}:\${dbConfig.port}/\${dbConfig.database}\`);

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    logging: console.log
  }
);

console.log('=== 数据库连接初始化完成 ===');

// 然后手动初始化核心模型
console.log('=== 开始初始化核心模型 ===');

// 从这里开始手动导入和初始化模型，避免循环依赖
`;
  
  // 添加模型导入
  initOrder.forEach(model => {
    if (modelToFile[model]) {
      const importPath = modelToFile[model].replace('.ts', '');
      initContent += `import { ${model} } from './models/${importPath}';\n`;
    }
  });
  
  initContent += `\n// 初始化核心模型\n`;
  
  // 添加模型初始化调用
  initOrder.forEach(model => {
    if (modelToFile[model]) {
      initContent += `console.log('初始化 ${model} 模型...');\n`;
      initContent += `${model}.initModel(sequelize);\n\n`;
    }
  });
  
  initContent += `console.log('=== 核心模型初始化完成 ===');\n\n`;
  
  // 添加导出语句
  initContent += `// 导出初始化好的sequelize实例\n`;
  initContent += `export { sequelize };\n\n`;
  
  initContent += `// 导出已初始化的模型\n`;
  initContent += `export {\n`;
  initOrder.forEach(model => {
    if (modelToFile[model]) {
      initContent += `  ${model},\n`;
    }
  });
  initContent += `};\n\n`;
  
  initContent += `console.log('=== 初始化脚本执行完毕 ===');`;
  
  // 生成新的init.ts文件
  const initPath = path.join(__dirname, 'init.ts');
  fs.writeFileSync(initPath, initContent);
  
  console.log(`已生成新的init.ts文件: ${initPath}`);
  console.log('请在app.ts中正确导入此文件，确保先初始化数据库连接和模型，再启动服务器');
}

// 生成帮助文档
const helpContent = `# 模型初始化顺序指南

## 模型依赖关系

${Object.keys(dependencyGraph).map(model => 
  `- ${model} 依赖于: ${dependencyGraph[model].join(', ') || '无依赖'}`
).join('\n')}

## 推荐初始化顺序

${initOrder ? 
  initOrder.map((model, index) => 
    `${index + 1}. ${model} (${modelToFile[model] || '未找到'})`
  ).join('\n') : 
  '由于循环依赖，无法自动确定初始化顺序。请参考手动定义的顺序。'
}

## 正确初始化步骤

1. 在项目中使用生成的init.ts文件
2. 确保在app.ts中首先导入初始化脚本
3. 在服务器启动前完成所有模型的初始化
4. 服务器启动后再建立模型之间的关联关系

## 注意事项

- 避免在模型定义中直接使用其他模型类型，可以使用字符串表示模型名称
- 使用静态初始化方法接收sequelize实例，避免直接导入
- 分离模型定义和关联建立，先定义所有模型，再建立关联
`;

const helpPath = path.join(__dirname, 'model-init-order.md');
fs.writeFileSync(helpPath, helpContent);
console.log(`已生成模型初始化顺序指南: ${helpPath}`); 