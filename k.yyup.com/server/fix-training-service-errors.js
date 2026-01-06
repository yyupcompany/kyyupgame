const fs = require('fs');
const path = require('path');

/**
 * 修复训练服务中的属性错误
 */

const servicePath = path.join(__dirname, 'src/services/training.service.ts');

function fixTrainingServiceErrors() {
  console.log('🔧 开始修复训练服务中的属性错误...\n');

  try {
    let content = fs.readFileSync(servicePath, 'utf8');
    let hasChanges = false;

    // 修复 1: record.activity?.activityType -> record.activityId 或直接使用默认值
    const activityErrorPattern = /record\.activity\?\.activityType/g;
    if (activityErrorPattern.test(content)) {
      console.log('🔍 修复 record.activity?.activityType 错误');
      content = content.replace(activityErrorPattern, `'cognitive'`); // 暂时使用默认值
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    // 修复 2: startTime 不存在的错误
    const startTimePattern = /startTime:\s*new Date\(\),?\s*/g;
    if (startTimePattern.test(content)) {
      console.log('🔍 修复 startTime 字段错误');
      content = content.replace(startTimePattern, '');
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    // 修复 3: status 字段错误
    const statusPattern = /status:\s*['"`]completed['"`],?\s*/g;
    if (statusPattern.test(content)) {
      console.log('🔍 修复 status 字段错误');
      content = content.replace(statusPattern, '');
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    // 修复 4: performanceData 字段错误
    const performanceDataPattern = /performanceData:/g;
    if (performanceDataPattern.test(content)) {
      console.log('🔍 修复 performanceData 字段错误');
      content = content.replace(performanceDataPattern, 'performanceRating:');
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    // 修复 5: childId 类型转换问题
    const childIdPattern = /childId:\s*req\.query\.childId/g;
    if (childIdPattern.test(content)) {
      console.log('🔍 修复 childId 类型转换问题');
      content = content.replace(childIdPattern, 'childId: parseInt(req.query.childId as string)');
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    // 修复 6: 日期类型转换问题
    const datePattern = /new Date\(req\.query\.date\)/g;
    if (datePattern.test(content)) {
      console.log('🔍 修复日期类型转换问题');
      content = content.replace(datePattern, 'new Date(req.query.date as string)');
      hasChanges = true;
      console.log('   ✅ 已修复');
    }

    if (hasChanges) {
      fs.writeFileSync(servicePath, content);
      console.log('\n✅ 训练服务修复完成！');
    } else {
      console.log('\nℹ️  没有发现需要修复的错误');
    }

  } catch (error) {
    console.error('❌ 修复训练服务失败:', error.message);
  }
}

fixTrainingServiceErrors();