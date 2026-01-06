/**
 * 幼儿园招生系统数据库模拟数据质量检查脚本
 * 检查数据的真实性、完整性和关联性
 */

const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 检查结果存储
const checkResults = {
  userDataQuality: {},
  dataRelationships: {},
  dataRealism: {},
  statistics: {},
  issues: []
};

/**
 * 检查姓名数据的真实性
 */
async function checkNameRealism(connection) {
  console.log('🔍 检查姓名数据真实性...');
  
  // 检查明显不真实的姓名
  const unrealisticNames = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
    'test', 'Test', 'admin', 'user', 'demo', 'sample',
    '测试', '示例', '样例', '模拟', '假名'
  ];
  
  const results = {
    users: [],
    students: [],
    teachers: [],
    parents: []
  };
  
  // 检查用户表
  for (const name of unrealisticNames) {
    const [users] = await connection.execute(
      'SELECT id, username, real_name FROM users WHERE username LIKE ? OR real_name LIKE ?',
      [`%${name}%`, `%${name}%`]
    );
    results.users.push(...users);
  }
  
  // 检查学生表
  for (const name of unrealisticNames) {
    const [students] = await connection.execute(
      'SELECT id, name FROM students WHERE name LIKE ?',
      [`%${name}%`]
    );
    results.students.push(...students);
  }
  
  // 检查教师表 (通过user_id关联到users表获取real_name)
  for (const name of unrealisticNames) {
    const [teachers] = await connection.execute(
      'SELECT t.id, u.real_name as name FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.real_name LIKE ?',
      [`%${name}%`]
    );
    results.teachers.push(...teachers);
  }
  
  // 检查家长表 (通过user_id关联到users表获取real_name)
  for (const name of unrealisticNames) {
    const [parents] = await connection.execute(
      'SELECT p.id, u.real_name as name FROM parents p JOIN users u ON p.user_id = u.id WHERE u.real_name LIKE ?',
      [`%${name}%`]
    );
    results.parents.push(...parents);
  }
  
  checkResults.dataRealism.names = results;
  
  if (results.users.length + results.students.length + results.teachers.length + results.parents.length > 0) {
    checkResults.issues.push({
      type: 'NAME_REALISM',
      severity: 'MEDIUM',
      message: `发现 ${results.users.length + results.students.length + results.teachers.length + results.parents.length} 个不真实的姓名`
    });
  }
}

/**
 * 检查手机号码格式
 */
async function checkPhoneNumbers(connection) {
  console.log('📱 检查手机号码格式...');
  
  const results = {
    invalidUsers: [],
    invalidTeachers: [],
    invalidParents: []
  };
  
  // 检查用户表手机号
  const [users] = await connection.execute(
    `SELECT id, username, phone FROM users 
     WHERE phone IS NOT NULL AND (
       LENGTH(phone) != 11 OR 
       phone NOT REGEXP '^1[3-9][0-9]{9}$' OR
       phone LIKE '111%' OR phone LIKE '123%' OR phone LIKE '000%'
     )`
  );
  results.invalidUsers = users;
  
  // 检查教师表手机号 (通过user_id关联到users表)
  const [teachers] = await connection.execute(
    `SELECT t.id, u.real_name as name, u.phone FROM teachers t 
     JOIN users u ON t.user_id = u.id
     WHERE u.phone IS NOT NULL AND (
       LENGTH(u.phone) != 11 OR 
       u.phone NOT REGEXP '^1[3-9][0-9]{9}$' OR
       u.phone LIKE '111%' OR u.phone LIKE '123%' OR u.phone LIKE '000%'
     )`
  );
  results.invalidTeachers = teachers;
  
  // 检查家长表手机号 (通过user_id关联到users表)
  const [parents] = await connection.execute(
    `SELECT p.id, u.real_name as name, u.phone FROM parents p 
     JOIN users u ON p.user_id = u.id
     WHERE u.phone IS NOT NULL AND (
       LENGTH(u.phone) != 11 OR 
       u.phone NOT REGEXP '^1[3-9][0-9]{9}$' OR
       u.phone LIKE '111%' OR u.phone LIKE '123%' OR u.phone LIKE '000%'
     )`
  );
  results.invalidParents = parents;
  
  checkResults.dataRealism.phoneNumbers = results;
  
  const totalInvalid = results.invalidUsers.length + results.invalidTeachers.length + results.invalidParents.length;
  if (totalInvalid > 0) {
    checkResults.issues.push({
      type: 'PHONE_FORMAT',
      severity: 'HIGH',
      message: `发现 ${totalInvalid} 个无效手机号码`
    });
  }
}

/**
 * 检查邮箱格式
 */
async function checkEmailAddresses(connection) {
  console.log('📧 检查邮箱格式...');
  
  const results = {
    invalidUsers: [],
    invalidTeachers: [],
    invalidParents: []
  };
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // 检查用户表邮箱
  const [users] = await connection.execute(
    `SELECT id, username, email FROM users 
     WHERE email IS NOT NULL AND (
       email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' OR
       email LIKE '%test%' OR email LIKE '%example%' OR email LIKE '%demo%'
     )`
  );
  results.invalidUsers = users;
  
  // 检查教师表邮箱 (通过user_id关联到users表)
  const [teachers] = await connection.execute(
    `SELECT t.id, u.real_name as name, u.email FROM teachers t 
     JOIN users u ON t.user_id = u.id
     WHERE u.email IS NOT NULL AND (
       u.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' OR
       u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
     )`
  );
  results.invalidTeachers = teachers;
  
  // 检查家长表邮箱 (通过user_id关联到users表)
  const [parents] = await connection.execute(
    `SELECT p.id, u.real_name as name, u.email FROM parents p 
     JOIN users u ON p.user_id = u.id
     WHERE u.email IS NOT NULL AND (
       u.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' OR
       u.email LIKE '%test%' OR u.email LIKE '%example%' OR u.email LIKE '%demo%'
     )`
  );
  results.invalidParents = parents;
  
  checkResults.dataRealism.emailAddresses = results;
  
  const totalInvalid = results.invalidUsers.length + results.invalidTeachers.length + results.invalidParents.length;
  if (totalInvalid > 0) {
    checkResults.issues.push({
      type: 'EMAIL_FORMAT',
      severity: 'MEDIUM',
      message: `发现 ${totalInvalid} 个无效邮箱地址`
    });
  }
}

/**
 * 检查数据关联性
 */
async function checkDataRelationships(connection) {
  console.log('🔗 检查数据关联性...');
  
  const results = {};
  
  // 检查学生-家长关联 (直接通过parents表的student_id)
  const [orphanStudents] = await connection.execute(
    `SELECT s.id, s.name FROM students s 
     LEFT JOIN parents p ON s.id = p.student_id 
     WHERE p.student_id IS NULL`
  );
  results.orphanStudents = orphanStudents;
  
  // 检查学生-班级关联
  const [studentsWithoutClass] = await connection.execute(
    `SELECT s.id, s.name FROM students s 
     LEFT JOIN classes c ON s.class_id = c.id 
     WHERE s.class_id IS NOT NULL AND c.id IS NULL`
  );
  results.studentsWithoutClass = studentsWithoutClass;
  
  // 检查班级-教师关联
  const [classesWithoutTeacher] = await connection.execute(
    `SELECT c.id, c.name FROM classes c 
     LEFT JOIN teachers t ON c.head_teacher_id = t.id 
     WHERE c.head_teacher_id IS NOT NULL AND t.id IS NULL`
  );
  results.classesWithoutTeacher = classesWithoutTeacher;
  
  // 检查活动-学生关联
  const [orphanActivityRegistrations] = await connection.execute(
    `SELECT ar.id, ar.student_id, ar.activity_id FROM activity_registrations ar
     LEFT JOIN students s ON ar.student_id = s.id
     LEFT JOIN activities a ON ar.activity_id = a.id
     WHERE s.id IS NULL OR a.id IS NULL`
  );
  results.orphanActivityRegistrations = orphanActivityRegistrations;
  
  // 检查报名申请-学生关联 (通过student_name字段)
  const [orphanEnrollmentApplications] = await connection.execute(
    `SELECT ea.id, ea.student_name FROM enrollment_applications ea
     LEFT JOIN students s ON ea.student_name = s.name
     WHERE s.id IS NULL AND ea.status = 1`
  );
  results.orphanEnrollmentApplications = orphanEnrollmentApplications;
  
  checkResults.dataRelationships = results;
  
  // 添加问题到列表
  if (orphanStudents.length > 0) {
    checkResults.issues.push({
      type: 'ORPHAN_STUDENTS',
      severity: 'HIGH',
      message: `发现 ${orphanStudents.length} 个学生的家长ID无效`
    });
  }
  
  if (studentsWithoutClass.length > 0) {
    checkResults.issues.push({
      type: 'STUDENTS_WITHOUT_CLASS',
      severity: 'HIGH',
      message: `发现 ${studentsWithoutClass.length} 个学生的班级ID无效`
    });
  }
  
  if (classesWithoutTeacher.length > 0) {
    checkResults.issues.push({
      type: 'CLASSES_WITHOUT_TEACHER',
      severity: 'HIGH',
      message: `发现 ${classesWithoutTeacher.length} 个班级的教师ID无效`
    });
  }
  
  if (orphanActivityRegistrations.length > 0) {
    checkResults.issues.push({
      type: 'ORPHAN_ACTIVITY_REGISTRATIONS',
      severity: 'HIGH',
      message: `发现 ${orphanActivityRegistrations.length} 个无效的活动报名记录`
    });
  }
}

/**
 * 检查数据完整性
 */
async function checkDataCompleteness(connection) {
  console.log('📊 检查数据完整性...');
  
  const results = {};
  
  // 检查用户表必填字段
  const [incompleteUsers] = await connection.execute(
    `SELECT id, username FROM users 
     WHERE username IS NULL OR username = '' OR 
           real_name IS NULL OR real_name = '' OR
           role IS NULL OR role = ''`
  );
  results.incompleteUsers = incompleteUsers;
  
  // 检查学生表必填字段
  const [incompleteStudents] = await connection.execute(
    `SELECT id, name FROM students 
     WHERE name IS NULL OR name = '' OR 
           gender IS NULL OR 
           birth_date IS NULL`
  );
  results.incompleteStudents = incompleteStudents;
  
  // 检查教师表必填字段 (关联users表检查)
  const [incompleteTeachers] = await connection.execute(
    `SELECT t.id, u.real_name as name FROM teachers t 
     JOIN users u ON t.user_id = u.id
     WHERE u.real_name IS NULL OR u.real_name = '' OR 
           t.position IS NULL OR
           u.phone IS NULL OR u.phone = ''`
  );
  results.incompleteTeachers = incompleteTeachers;
  
  // 检查班级表必填字段
  const [incompleteClasses] = await connection.execute(
    `SELECT id, name FROM classes 
     WHERE name IS NULL OR name = '' OR 
           capacity IS NULL OR capacity <= 0`
  );
  results.incompleteClasses = incompleteClasses;
  
  // 检查活动表必填字段
  const [incompleteActivities] = await connection.execute(
    `SELECT id, title as name FROM activities 
     WHERE title IS NULL OR title = '' OR 
           start_time IS NULL OR 
           end_time IS NULL`
  );
  results.incompleteActivities = incompleteActivities;
  
  checkResults.userDataQuality.completeness = results;
  
  // 添加问题到列表
  const totalIncomplete = incompleteUsers.length + incompleteStudents.length + 
                          incompleteTeachers.length + incompleteClasses.length + 
                          incompleteActivities.length;
  
  if (totalIncomplete > 0) {
    checkResults.issues.push({
      type: 'INCOMPLETE_DATA',
      severity: 'HIGH',
      message: `发现 ${totalIncomplete} 条记录缺少必填字段`
    });
  }
}

/**
 * 检查时间数据逻辑
 */
async function checkTimeLogic(connection) {
  console.log('⏰ 检查时间数据逻辑...');
  
  const results = {};
  
  // 检查活动时间逻辑
  const [invalidActivityTimes] = await connection.execute(
    `SELECT id, title as name, start_time, end_time FROM activities 
     WHERE start_time >= end_time OR 
           start_time < '2020-01-01' OR 
           end_time > '2030-12-31'`
  );
  results.invalidActivityTimes = invalidActivityTimes;
  
  // 检查学生年龄逻辑
  const [invalidStudentAges] = await connection.execute(
    `SELECT id, name, birth_date, 
            TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age 
     FROM students 
     WHERE TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 0 OR 
           TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) > 10 OR
           birth_date > CURDATE()`
  );
  results.invalidStudentAges = invalidStudentAges;
  
  // 检查报名时间逻辑
  const [invalidEnrollmentTimes] = await connection.execute(
    `SELECT ep.id, ep.title as name, ep.start_date, ep.end_date
     FROM enrollment_plans ep
     WHERE ep.start_date >= ep.end_date OR
           ep.start_date < '2020-01-01'`
  );
  results.invalidEnrollmentTimes = invalidEnrollmentTimes;
  
  checkResults.userDataQuality.timeLogic = results;
  
  // 添加问题到列表
  if (invalidActivityTimes.length > 0) {
    checkResults.issues.push({
      type: 'INVALID_ACTIVITY_TIMES',
      severity: 'HIGH',
      message: `发现 ${invalidActivityTimes.length} 个活动的时间设置不合理`
    });
  }
  
  if (invalidStudentAges.length > 0) {
    checkResults.issues.push({
      type: 'INVALID_STUDENT_AGES',
      severity: 'HIGH',
      message: `发现 ${invalidStudentAges.length} 个学生的年龄不合理`
    });
  }
}

/**
 * 生成统计信息
 */
async function generateStatistics(connection) {
  console.log('📈 生成统计信息...');
  
  const stats = {};
  
  // 基础数据统计
  const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
  stats.userCount = userCount[0].count;
  
  const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
  stats.studentCount = studentCount[0].count;
  
  const [teacherCount] = await connection.execute('SELECT COUNT(*) as count FROM teachers');
  stats.teacherCount = teacherCount[0].count;
  
  const [parentCount] = await connection.execute('SELECT COUNT(*) as count FROM parents');
  stats.parentCount = parentCount[0].count;
  
  const [classCount] = await connection.execute('SELECT COUNT(*) as count FROM classes');
  stats.classCount = classCount[0].count;
  
  const [activityCount] = await connection.execute('SELECT COUNT(*) as count FROM activities');
  stats.activityCount = activityCount[0].count;
  
  // 数据质量统计
  const [usersWithPhone] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE phone IS NOT NULL AND phone != ""');
  stats.usersWithPhoneRate = (usersWithPhone[0].count / stats.userCount * 100).toFixed(2);
  
  const [usersWithEmail] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL AND email != ""');
  stats.usersWithEmailRate = (usersWithEmail[0].count / stats.userCount * 100).toFixed(2);
  
  const [studentsWithParents] = await connection.execute('SELECT COUNT(DISTINCT s.id) as count FROM students s JOIN parents p ON s.id = p.student_id');
  stats.studentsWithParentsRate = stats.studentCount > 0 ? (studentsWithParents[0].count / stats.studentCount * 100).toFixed(2) : 0;
  
  const [studentsInClasses] = await connection.execute('SELECT COUNT(*) as count FROM students WHERE class_id IS NOT NULL');
  stats.studentsInClassesRate = stats.studentCount > 0 ? (studentsInClasses[0].count / stats.studentCount * 100).toFixed(2) : 0;
  
  checkResults.statistics = stats;
}

/**
 * 生成检查报告
 */
function generateReport() {
  console.log('\n📋 生成数据质量检查报告...');
  
  const report = `
# 幼儿园招生系统数据质量检查报告

## 📊 数据统计概览
- 用户总数: ${checkResults.statistics.userCount}
- 学生总数: ${checkResults.statistics.studentCount}
- 教师总数: ${checkResults.statistics.teacherCount}
- 家长总数: ${checkResults.statistics.parentCount}
- 班级总数: ${checkResults.statistics.classCount}
- 活动总数: ${checkResults.statistics.activityCount}

## 📈 数据完整性指标
- 用户手机号填写率: ${checkResults.statistics.usersWithPhoneRate}%
- 用户邮箱填写率: ${checkResults.statistics.usersWithEmailRate}%
- 学生家长关联率: ${checkResults.statistics.studentsWithParentsRate}%
- 学生班级关联率: ${checkResults.statistics.studentsInClassesRate}%

## ⚠️ 发现的问题 (${checkResults.issues.length}项)

${checkResults.issues.map(issue => `### ${issue.severity} - ${issue.type}
${issue.message}
`).join('\n')}

## 🔍 详细检查结果

### 姓名真实性检查
- 不真实用户姓名: ${checkResults.dataRealism.names?.users?.length || 0}个
- 不真实学生姓名: ${checkResults.dataRealism.names?.students?.length || 0}个
- 不真实教师姓名: ${checkResults.dataRealism.names?.teachers?.length || 0}个
- 不真实家长姓名: ${checkResults.dataRealism.names?.parents?.length || 0}个

### 手机号码格式检查
- 无效用户手机号: ${checkResults.dataRealism.phoneNumbers?.invalidUsers?.length || 0}个
- 无效教师手机号: ${checkResults.dataRealism.phoneNumbers?.invalidTeachers?.length || 0}个
- 无效家长手机号: ${checkResults.dataRealism.phoneNumbers?.invalidParents?.length || 0}个

### 邮箱格式检查
- 无效用户邮箱: ${checkResults.dataRealism.emailAddresses?.invalidUsers?.length || 0}个
- 无效教师邮箱: ${checkResults.dataRealism.emailAddresses?.invalidTeachers?.length || 0}个
- 无效家长邮箱: ${checkResults.dataRealism.emailAddresses?.invalidParents?.length || 0}个

### 数据关联性检查
- 孤立学生记录: ${checkResults.dataRelationships?.orphanStudents?.length || 0}个
- 无效班级关联: ${checkResults.dataRelationships?.studentsWithoutClass?.length || 0}个
- 无效教师关联: ${checkResults.dataRelationships?.classesWithoutTeacher?.length || 0}个
- 无效活动报名: ${checkResults.dataRelationships?.orphanActivityRegistrations?.length || 0}个

### 数据完整性检查
- 不完整用户记录: ${checkResults.userDataQuality.completeness?.incompleteUsers?.length || 0}个
- 不完整学生记录: ${checkResults.userDataQuality.completeness?.incompleteStudents?.length || 0}个
- 不完整教师记录: ${checkResults.userDataQuality.completeness?.incompleteTeachers?.length || 0}个
- 不完整班级记录: ${checkResults.userDataQuality.completeness?.incompleteClasses?.length || 0}个
- 不完整活动记录: ${checkResults.userDataQuality.completeness?.incompleteActivities?.length || 0}个

### 时间逻辑检查
- 无效活动时间: ${checkResults.userDataQuality.timeLogic?.invalidActivityTimes?.length || 0}个
- 无效学生年龄: ${checkResults.userDataQuality.timeLogic?.invalidStudentAges?.length || 0}个
- 无效报名时间: ${checkResults.userDataQuality.timeLogic?.invalidEnrollmentTimes?.length || 0}个

## 💡 改进建议

1. **姓名数据优化**: 替换明显不真实的姓名为符合中文命名习惯的姓名
2. **联系方式规范**: 修正手机号码和邮箱格式，使用真实可信的格式
3. **数据关联修复**: 修复孤立记录，确保外键引用的完整性
4. **必填字段补全**: 为缺少必填字段的记录补充合理数据
5. **时间逻辑修正**: 调整不合理的时间设置，确保业务逻辑正确

---
报告生成时间: ${new Date().toLocaleString('zh-CN')}
`;

  return report;
}

/**
 * 主函数
 */
async function main() {
  let connection;
  
  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 执行各项检查
    await checkNameRealism(connection);
    await checkPhoneNumbers(connection);
    await checkEmailAddresses(connection);
    await checkDataRelationships(connection);
    await checkDataCompleteness(connection);
    await checkTimeLogic(connection);
    await generateStatistics(connection);
    
    // 生成报告
    const report = generateReport();
    
    // 保存报告到文件
    const fs = require('fs').promises;
    await fs.writeFile('/home/devbox/project/database-quality-report.md', report, 'utf8');
    
    console.log('\n✅ 检查完成！');
    console.log(`📄 报告已保存到: /home/devbox/project/database-quality-report.md`);
    console.log(`⚠️  发现 ${checkResults.issues.length} 个问题需要处理`);
    
    // 输出问题摘要
    if (checkResults.issues.length > 0) {
      console.log('\n🚨 主要问题摘要:');
      checkResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkResults
};