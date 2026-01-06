/**
 * 训练控制器方法测试脚本
 * 检查训练控制器的方法是否正确定义并可访问
 */

console.log('🔍 训练控制器方法测试');
console.log('='.repeat(50));

try {
  // 尝试导入训练控制器
  console.log('📦 正在导入训练控制器...');
  const trainingController = require('./server/src/controllers/training.controller.ts');

  console.log('✅ 训练控制器导入成功');
  console.log('控制器类型:', typeof trainingController);
  console.log('控制器构造函数:', trainingController.constructor.name);

  // 检查所有期望的方法
  const expectedMethods = [
    'getRecommendations',
    'createPlan',
    'getPlanById',
    'getPlans',
    'updatePlan',
    'getDailyTasks',
    'getActivities',
    'getActivityById',
    'startActivity',
    'completeActivity',
    'getProgress',
    'getAchievements',
    'getTrainingReport'
  ];

  console.log('\n🔍 检查控制器方法:');
  expectedMethods.forEach(methodName => {
    if (trainingController[methodName] && typeof trainingController[methodName] === 'function') {
      console.log(`✅ ${methodName} - 方法存在且可调用`);
    } else {
      console.log(`❌ ${methodName} - 方法缺失或不可调用`);
      console.log(`   类型: ${typeof trainingController[methodName]}`);
    }
  });

  // 获取所有实际的方法
  console.log('\n📋 控制器所有属性:');
  Object.getOwnPropertyNames(trainingController).forEach(prop => {
    if (typeof trainingController[prop] === 'function') {
      console.log(`  📋 ${prop}()`);
    } else {
      console.log(`  📄 ${prop}: ${typeof trainingController[prop]}`);
    }
  });

  // 测试调用一个简单方法
  console.log('\n🧪 测试方法调用:');
  try {
    console.log('测试 getPlans 方法...');
    console.log('getPlans 方法:', typeof trainingController.getPlans);

    if (trainingController.getPlans) {
      console.log('✅ getPlans 方法可访问');
    } else {
      console.log('❌ getPlans 方法不可访问');
    }
  } catch (error) {
    console.error('❌ 方法调用测试失败:', error.message);
  }

} catch (error) {
  console.error('❌ 训练控制器导入失败:', error.message);
  console.error('详细错误:', error);

  // 尝试检查文件是否存在
  const fs = require('fs');
  const controllerPath = './server/src/controllers/training.controller.ts';

  if (fs.existsSync(controllerPath)) {
    console.log('✅ 控制器文件存在');

    // 尝试读取文件内容
    try {
      const content = fs.readFileSync(controllerPath, 'utf8');
      console.log(`📄 文件大小: ${content.length} 字符`);
      console.log(`📄 文件行数: ${content.split('\n').length} 行`);

      // 检查关键导出
      if (content.includes('export default new TrainingController()')) {
        console.log('✅ 找到默认导出');
      } else {
        console.log('❌ 未找到默认导出');
      }

      if (content.includes('export class TrainingController')) {
        console.log('✅ 找到类定义');
      } else {
        console.log('❌ 未找到类定义');
      }

    } catch (readError) {
      console.error('❌ 读取文件失败:', readError.message);
    }
  } else {
    console.log('❌ 控制器文件不存在');
  }
}

console.log('\n' + '='.repeat(50));
console.log('✨ 测试完成！');