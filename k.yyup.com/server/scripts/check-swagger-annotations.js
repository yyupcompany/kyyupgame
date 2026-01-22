/**
 * 检查Swagger注释语法问题
 */
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');
const controllersDir = path.join(__dirname, '../src/controllers');

function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.includes('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: [], // 将在循环中单独测试每个文件
};

console.log('开始检查Swagger注释...\n');

const allFiles = [
  ...getAllTsFiles(routesDir),
  ...getAllTsFiles(controllersDir),
];

let errorFiles = [];
let successFiles = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');

  // 只检查包含 @swagger 或 @openapi 注释的文件
  if (!content.includes('@swagger') && !content.includes('@openapi')) {
    continue;
  }

  const testOptions = { ...options, apis: [file] };

  try {
    swaggerJsdoc(testOptions);
    successFiles++;
  } catch (error) {
    const relativePath = path.relative(__dirname, file);
    errorFiles.push({
      file: relativePath,
      error: error.message.substring(0, 100),
      line: error.message.match(/at line (\d+)/)?.[1] || 'unknown'
    });
    console.log(`❌ ${relativePath}`);
    console.log(`   Line ~${error.message.match(/at line (\d+)/)?.[1 || 'unknown']}: ${error.message.substring(0, 80)}...`);
  }
}

console.log(`\n========== 检查结果 ==========`);
console.log(`✅ 正常文件: ${successFiles}`);
console.log(`❌ 问题文件: ${errorFiles.length}`);

if (errorFiles.length > 0) {
  console.log('\n需要修复的文件:');
  errorFiles.forEach((f, i) => {
    console.log(`${i + 1}. ${f.file} (line ${f.line})`);
  });
}

module.exports = { errorFiles };
