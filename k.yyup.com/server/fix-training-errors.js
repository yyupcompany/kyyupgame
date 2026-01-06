const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复训练中心的TypeScript错误...');

// 1. 修复训练控制器的错误
const controllerPath = path.join(__dirname, 'src/controllers/training.controller.ts');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// 修复 generateTrainingRecommendations 不存在的问题
controllerContent = controllerContent.replace(
  'const recommendations = await TrainingService.generateTrainingRecommendations(',
  'const recommendations = await new TrainingService().generateTrainingRecommendations('
);

// 修复参数类型错误
controllerContent = controllerContent.replace(
  'childId: req.query.childId',
  'childId: parseInt(req.query.childId as string)'
);

controllerContent = controllerContent.replace(
  'childId: req.params.childId',
  'childId: parseInt(req.params.childId)'
);

controllerContent = controllerContent.replace(
  'new Date(req.query.endDate)',
  'new Date(req.query.endDate as string)'
);

controllerContent = controllerContent.replace(
  'performanceData',
  'progressData'
);

// 修复 startTime 字段错误
controllerContent = controllerContent.replace(
  'startTime: startTime,',
  'completionTime: startTime,'
);

// 修复 status 字段错误 - 删除这些不存在的查询条件
controllerContent = controllerContent.replace(
  /where: {\s*childId,\s*status,\s*},/g,
  `where: {
        childId,
      },`
);

controllerContent = controllerContent.replace(
  /where: {\s*childId: req\.params\.childId,\s*status,\s*}/g,
  `where: {
        childId: parseInt(req.params.childId),
      }`
);

// 修复 getTrainingProgress 不存在的问题
controllerContent = controllerContent.replace(
  'const progress = await TrainingService.getTrainingProgress(',
  'const progress = await new TrainingService().getTrainingProgress('
);

// 修复 TrainingRecord 的 activity 字段错误
controllerContent = controllerContent.replace(
  'include: [{ model: TrainingActivity, as: \'activity\' }]',
  'include: [{ model: TrainingActivity, as: \'trainingActivity\' }]'
);

fs.writeFileSync(controllerPath, controllerContent);
console.log('✅ 训练控制器错误修复完成');

// 2. 修复训练服务的错误
const servicePath = path.join(__dirname, 'src/services/training.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

serviceContent = serviceContent.replace(
  '.activity.',
  '.trainingActivity.'
);

fs.writeFileSync(servicePath, serviceContent);
console.log('✅ 训练服务错误修复完成');

console.log('🎉 训练中心TypeScript错误修复完成！');