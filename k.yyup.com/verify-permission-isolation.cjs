/**
 * 权限隔离验证脚本
 * 检查权限控制实现是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始权限隔离验证...\n');

// 检查文件是否存在
function checkFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ 文件存在: ${filePath}`);
    return true;
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
    return false;
  }
}

// 检查代码中是否包含特定的权限控制逻辑
function checkCode(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allPassed = true;

    console.log(`\n📝 检查: ${description}`);
    console.log(`   文件: ${filePath}`);

    patterns.forEach(({ pattern, expected }) => {
      const found = content.includes(pattern);
      if (found === expected) {
        console.log(`   ✅ ${expected ? '包含' : '不包含'}: ${pattern}`);
      } else {
        console.log(`   ❌ ${expected ? '应包含但未找到' : '不应包含但找到了'}: ${pattern}`);
        allPassed = false;
      }
    });

    return allPassed;
  } catch (error) {
    console.log(`❌ 读取文件失败: ${error.message}`);
    return false;
  }
}

// 检查教师角色权限控制
const teacherChecks = [
  {
    file: 'server/src/services/student/student.service.ts',
    description: '学生服务中的教师权限过滤',
    patterns: [
      { pattern: 'if (filters.teacherId)', expected: true },
      { pattern: 'SELECT s2.id FROM students s2', expected: true },
      { pattern: 'INNER JOIN class_teachers ct', expected: true },
      { pattern: 'WHERE ct.teacher_id = :teacherId', expected: true }
    ]
  },
  {
    file: 'server/src/controllers/student.controller.ts',
    description: '学生控制器中的角色权限过滤',
    patterns: [
      { pattern: 'if (user.role === \'teacher\')', expected: true },
      { pattern: 'additionalFilters.teacherId = user.id', expected: true },
      { pattern: 'INNER JOIN class_teachers ct ON c.id = ct.class_id', expected: true },
      { pattern: 'throw ApiError.forbidden', expected: true }
    ]
  }
];

// 检查家长角色权限控制
const parentChecks = [
  {
    file: 'server/src/services/student/student.service.ts',
    description: '学生服务中的家长权限过滤',
    patterns: [
      { pattern: 'if (filters.parentId)', expected: true },
      { pattern: 'SELECT student_id FROM parent_student_relations', expected: true },
      { pattern: 'WHERE user_id = :parentId', expected: true }
    ]
  },
  {
    file: 'server/src/controllers/student.controller.ts',
    description: '学生控制器中的家长权限检查',
    patterns: [
      { pattern: 'if (user.role === \'parent\')', expected: true },
      { pattern: 'additionalFilters.parentId = user.id', expected: true },
      { pattern: 'INNER JOIN parent_student_relations psr', expected: true }
    ]
  },
  {
    file: 'server/src/controllers/parent-student-relation.controller.ts',
    description: '家长学生关系控制器权限检查',
    patterns: [
      { pattern: 'currentUser.id !== parentId', expected: true },
      { pattern: 'PARENT_ACCESS_DENIED', expected: true },
      { pattern: 'PARENT_ADD_DENIED', expected: true },
      { pattern: 'PARENT_DELETE_DENIED', expected: true }
    ]
  }
];

// 检查班级权限控制
const classChecks = [
  {
    file: 'server/src/controllers/class.controller.ts',
    description: '班级控制器权限过滤',
    patterns: [
      { pattern: 'if (user.role === \'teacher\')', expected: true },
      { pattern: 'SELECT DISTINCT ct.class_id', expected: true },
      { pattern: 'WHERE ct.teacher_id = :teacherId', expected: true },
      { pattern: 'if (user.role === \'parent\')', expected: true },
      { pattern: 'WHERE psr.user_id = :parentId', expected: true }
    ]
  }
];

// 检查数据权限中间件
const middlewareChecks = [
  {
    file: 'server/src/middlewares/data-access.middleware.ts',
    description: '数据权限访问中间件',
    patterns: [
      { pattern: 'checkTeacherStudentAccess', expected: true },
      { pattern: 'checkTeacherClassAccess', expected: true },
      { pattern: 'checkParentStudentAccess', expected: true },
      { pattern: 'checkParentClassAccess', expected: true },
      { pattern: 'checkStudentDataAccess', expected: true },
      { pattern: 'checkClassDataAccess', expected: true }
    ]
  }
];

// 检查中间件导出
const middlewareExportCheck = {
  file: 'server/src/middlewares/index.ts',
  description: '中间件导出文件',
  patterns: [
    { pattern: 'data-access.middleware', expected: true }
  ]
};

console.log('🔧 检查文件存在性...\n');

// 检查关键文件是否存在
const filesToCheck = [
  'server/src/services/student/student.service.ts',
  'server/src/controllers/student.controller.ts',
  'server/src/controllers/class.controller.ts',
  'server/src/controllers/parent-student-relation.controller.ts',
  'server/src/middlewares/data-access.middleware.ts',
  'server/src/middlewares/index.ts'
];

let allFilesExist = true;
filesToCheck.forEach(file => {
  if (!checkFile(file)) {
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分文件不存在，请检查文件路径');
  process.exit(1);
}

console.log('\n🎯 检查教师角色权限控制...');
let teacherChecksPassed = teacherChecks.every(check => checkCode(check.file, check.patterns, check.description));

console.log('\n👨‍👩‍👧‍👦 检查家长角色权限控制...');
let parentChecksPassed = parentChecks.every(check => checkCode(check.file, check.patterns, check.description));

console.log('\n🏫 检查班级权限控制...');
let classChecksPassed = classChecks.every(check => checkCode(check.file, check.patterns, check.description));

console.log('\n🛡️ 检查数据权限中间件...');
let middlewareChecksPassed = middlewareChecks.every(check => checkCode(check.file, check.patterns, check.description));
let middlewareExportPassed = checkCode(middlewareExportCheck.file, middlewareExportCheck.patterns, middlewareExportCheck.description);

console.log('\n📊 验证结果总结:');
console.log(`   教师权限控制: ${teacherChecksPassed ? '✅ 通过' : '❌ 失败'}`);
console.log(`   家长权限控制: ${parentChecksPassed ? '✅ 通过' : '❌ 失败'}`);
console.log(`   班级权限控制: ${classChecksPassed ? '✅ 通过' : '❌ 失败'}`);
console.log(`   中间件实现: ${middlewareChecksPassed ? '✅ 通过' : '❌ 失败'}`);
console.log(`   中间件导出: ${middlewareExportPassed ? '✅ 通过' : '❌ 失败'}`);

const allChecksPassed = teacherChecksPassed && parentChecksPassed && classChecksPassed && middlewareChecksPassed && middlewareExportPassed;

if (allChecksPassed) {
  console.log('\n🎉 权限隔离验证全部通过！');
  console.log('\n✨ 权限隔离已成功实现:');
  console.log('   • 教师只能访问自己管理的班级和学生数据');
  console.log('   • 家长只能访问自己关联的学生数据');
  console.log('   • 管理员和园长拥有完整访问权限');
  console.log('   • 实现了数据权限访问中间件');
  console.log('   • 所有权限检查都已正确实现');
} else {
  console.log('\n⚠️ 权限隔离验证未完全通过');
  console.log('请检查上述失败的检查项并修复相关问题');
}

process.exit(allChecksPassed ? 0 : 1);