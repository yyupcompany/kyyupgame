const fs = require('fs');
const path = require('path');

console.log('🔧 修复训练模型初始化函数...');

const trainingModels = [
  'training-activity.model.ts',
  'training-plan.model.ts',
  'training-record.model.ts',
  'training-achievement.model.ts'
];

trainingModels.forEach(modelFile => {
  const filePath = path.join(__dirname, 'src', 'models', modelFile);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const modelName = modelFile.replace('.model.ts', '');
  const ModelClassName = modelName.split('-').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');

  const initFunctionName = `init${ModelClassName}Model`;

  // 检查是否已经有导出的初始化函数
  if (content.includes(`export const ${initFunctionName}`)) {
    console.log(`✅ ${modelFile} 已经有导出函数，跳过`);
    return;
  }

  // 检查是否有 initModel 方法
  if (!content.includes('initModel')) {
    console.log(`❌ ${modelFile} 没有 initModel 方法，跳过`);
    return;
  }

  // 在文件末尾添加导出函数
  const exportFunction = `\n\n// 导出初始化函数以供init.ts使用\nexport const ${initFunctionName} = (sequelize) => {\n  ${ModelClassName}.initModel(sequelize);\n};`;

  const updatedContent = content + exportFunction;

  fs.writeFileSync(filePath, updatedContent);
  console.log(`✅ 修复 ${modelFile}，添加了 ${initFunctionName} 函数`);
});

console.log('🎉 训练模型修复完成！');