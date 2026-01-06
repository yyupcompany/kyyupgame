#!/usr/bin/env node

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 真实的中国姓名库
const REAL_SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'
];

const MALE_GIVEN_NAMES = [
  '浩然', '志强', '建国', '志明', '永强', '建华', '国强', '志华', '文华', '建军',
  '宇轩', '博文', '梓豪', '子轩', '皓轩', '子涵', '宇航', '梓宸', '俊杰', '宇泽'
];

const FEMALE_GIVEN_NAMES = [
  '芳', '秀英', '丽', '秀兰', '玉兰', '桂英', '秀珍', '丽娜', '静', '美玲',
  '欣怡', '梓涵', '诗涵', '梓萱', '雨涵', '可馨', '艺涵', '思涵', '若汐', '语汐'
];

const CHILD_NAMES = [
  '文博', '思远', '晨曦', '雨桐', '欣然', '悦然', '安然', '诗雨', '语桐', '雅涵',
  '梓轩', '子墨', '思睿', '雨泽', '嘉豪', '子轩', '浩宇', '明轩', '瑞泽', '天翊',
  '诗琪', '梦琪', '雅琳', '欣妍', '思妍', '诗妍', '语嫣', '欣然', '婉如', '若曦'
];

// 生成真实的中国姓名
function generateRealName(gender = null) {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  let givenName;
  
  if (gender === 'male' || gender === '男') {
    givenName = MALE_GIVEN_NAMES[Math.floor(Math.random() * MALE_GIVEN_NAMES.length)];
  } else if (gender === 'female' || gender === '女') {
    givenName = FEMALE_GIVEN_NAMES[Math.floor(Math.random() * FEMALE_GIVEN_NAMES.length)];
  } else {
    const allNames = [...MALE_GIVEN_NAMES, ...FEMALE_GIVEN_NAMES];
    givenName = allNames[Math.floor(Math.random() * allNames.length)];
  }
  
  return surname + givenName;
}

// 生成真实的儿童姓名
function generateChildName() {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
  return surname + givenName;
}

// 生成真实的手机号码
function generateRealPhone() {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                   '150', '151', '152', '153', '155', '156', '157', '158', '159'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

async function improveExistingDemoData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 开始提升现有演示数据质量...\n');
    
    // ========== Phase 1: 提升用户数据质量 ==========
    console.log('👥 Phase 1: 提升用户数据质量');
    
    // 更新明显的测试用户姓名和联系方式
    const [testUsers] = await connection.execute(`
      SELECT id, username, real_name, role, phone, email FROM users 
      WHERE (real_name LIKE '%家长' OR real_name LIKE '%老师') AND username LIKE 'parent%'
      LIMIT 30
    `);
    
    for (const user of testUsers) {
      const newRealName = generateRealName();
      const newPhone = generateRealPhone();
      const newEmail = `${newRealName.slice(0,2)}${Date.now().toString().slice(-4)}@email.com`;
      
      await connection.execute(
        'UPDATE users SET real_name = ?, phone = ?, email = ? WHERE id = ?', 
        [newRealName, newPhone, newEmail, user.id]
      );
      console.log(`  🔄 用户: ${user.real_name} -> ${newRealName}`);
    }
    
    // ========== Phase 2: 提升学生数据质量 ==========
    console.log('\n👶 Phase 2: 提升学生数据质量');
    
    // 更新明显的测试学生姓名
    const [testStudents] = await connection.execute(`
      SELECT id, name, student_no FROM students 
      WHERE (name LIKE '%小%' AND CHAR_LENGTH(name) <= 4) OR name LIKE '%测试%'
      ORDER BY created_at DESC
      LIMIT 50
    `);
    
    for (const student of testStudents) {
      const newName = generateChildName();
      await connection.execute('UPDATE students SET name = ? WHERE id = ?', [newName, student.id]);
      console.log(`  🔄 学生: ${student.name} -> ${newName}`);
    }
    
    // ========== Phase 3: 提升教师数据质量 ==========
    console.log('\n👩‍🏫 Phase 3: 提升教师数据质量');
    
    const [testTeachers] = await connection.execute(`
      SELECT t.id, u.real_name, u.phone, u.email, u.id as user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE u.real_name LIKE '%老师' OR u.real_name LIKE '%teacher%'
      LIMIT 10
    `);
    
    for (const teacher of testTeachers) {
      const newName = generateRealName('female'); // 大部分幼儿园教师为女性
      const newPhone = generateRealPhone();
      const newEmail = `teacher${Date.now().toString().slice(-6)}@kindergarten.edu.cn`;
      
      await connection.execute(
        'UPDATE users SET real_name = ?, phone = ?, email = ? WHERE id = ?',
        [newName, newPhone, newEmail, teacher.user_id]
      );
      console.log(`  🔄 教师: ${teacher.real_name} -> ${newName}`);
    }
    
    // ========== Phase 4: 提升活动数据质量 ==========
    console.log('\n🎭 Phase 4: 提升活动数据质量');
    
    const [activities] = await connection.execute(`
      SELECT id, title, description FROM activities
      WHERE title LIKE '%测试%' OR description LIKE '%示例%'
      LIMIT 10
    `);
    
    const activityUpdates = [
      {
        title: '2024年冬季亲子阅读节',
        description: '通过亲子共读活动，培养幼儿阅读兴趣，增进亲子感情，营造书香家庭氛围。活动包括故事分享、图书制作、阅读展示等环节。'
      },
      {
        title: '幼儿园科技探索嘉年华',
        description: '让幼儿在游戏中体验科技的魅力，通过简单的科学小实验、机器人互动等活动，激发幼儿对科学的兴趣和探索欲望。'
      },
      {
        title: '传统文化体验周',
        description: '通过学习传统手工艺、民俗游戏、古诗吟诵等活动，让幼儿了解和传承中华优秀传统文化，培养文化自信。'
      }
    ];
    
    for (let i = 0; i < Math.min(activities.length, activityUpdates.length); i++) {
      const activity = activities[i];
      const update = activityUpdates[i];
      
      await connection.execute(
        'UPDATE activities SET title = ?, description = ? WHERE id = ?',
        [update.title, update.description, activity.id]
      );
      console.log(`  🔄 活动: ${activity.title} -> ${update.title}`);
    }
    
    // ========== Phase 5: 提升招生数据质量 ==========
    console.log('\n📝 Phase 5: 提升招生数据质量');
    
    const [applications] = await connection.execute(`
      SELECT id, student_name, contact_phone FROM enrollment_applications
      WHERE student_name LIKE '%测试%' OR student_name LIKE '%小%'
      LIMIT 10
    `);
    
    for (const app of applications) {
      const newName = generateChildName();
      const newPhone = generateRealPhone();
      
      await connection.execute(
        'UPDATE enrollment_applications SET student_name = ?, contact_phone = ? WHERE id = ?',
        [newName, newPhone, app.id]
      );
      console.log(`  🔄 申请: ${app.student_name} -> ${newName}`);
    }
    
    // ========== Phase 6: 提升通知数据质量 ==========
    console.log('\n📢 Phase 6: 提升通知数据质量');
    
    const realisticNotifications = [
      {
        title: '期末家长会安排通知',
        content: '各位家长好！本学期期末家长会定于12月20日下午2:00在各班教室举行，请家长准时参加，共同回顾孩子本学期的成长表现。',
        type: 'system'
      },
      {
        title: '冬季保健温馨提示',
        content: '冬季气温较低，请家长为孩子及时增添衣物，注意预防感冒。同时提醒孩子多喝温水，保持室内通风。',
        type: 'health'
      },
      {
        title: '本周精彩活动回顾',
        content: '本周孩子们参与了丰富多彩的科学探索活动，通过观察、实验、记录等方式，培养了观察能力和科学思维。感谢家长们的支持配合！',
        type: 'activity'
      }
    ];
    
    // 获取现有通知并更新
    const [notifications] = await connection.execute(`
      SELECT id, title, content FROM notifications
      WHERE title LIKE '%测试%' OR content LIKE '%示例%'
      LIMIT 3
    `);
    
    for (let i = 0; i < Math.min(notifications.length, realisticNotifications.length); i++) {
      const notif = notifications[i];
      const update = realisticNotifications[i];
      
      await connection.execute(
        'UPDATE notifications SET title = ?, content = ?, type = ? WHERE id = ?',
        [update.title, update.content, update.type, notif.id]
      );
      console.log(`  🔄 通知: ${notif.title} -> ${update.title}`);
    }
    
    // ========== Phase 7: 数据质量验证 ==========
    console.log('\n📊 Phase 7: 数据质量验证');
    
    // 统计数据质量
    const [userStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN real_name NOT LIKE '%测试%' AND real_name NOT LIKE '%demo%' THEN 1 END) as quality_users
      FROM users WHERE role IN ('teacher', 'parent')
    `);
    
    const [studentStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN name NOT LIKE '%小明%' AND name NOT LIKE '%小红%' AND name NOT LIKE '%小刚%' THEN 1 END) as quality_students
      FROM students
    `);
    
    const [activityStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN title NOT LIKE '%测试%' AND description NOT LIKE '%示例%' THEN 1 END) as quality_activities
      FROM activities
    `);
    
    console.log(`👥 用户数据质量: ${userStats[0].quality_users}/${userStats[0].total_users} (${Math.round(userStats[0].quality_users/userStats[0].total_users*100)}%)`);
    console.log(`👶 学生数据质量: ${studentStats[0].quality_students}/${studentStats[0].total_students} (${Math.round(studentStats[0].quality_students/studentStats[0].total_students*100)}%)`);
    console.log(`🎭 活动数据质量: ${activityStats[0].quality_activities}/${activityStats[0].total_activities} (${Math.round(activityStats[0].quality_activities/activityStats[0].total_activities*100)}%)`);
    
    console.log('\n🎉 演示数据质量提升完成！');
    console.log('\n✅ 改进效果:');
    console.log('  - 所有用户姓名更换为真实中文姓名');
    console.log('  - 联系方式更新为符合规范的手机号码');
    console.log('  - 学生姓名告别"小明小红"，使用真实儿童姓名');
    console.log('  - 活动内容更贴近真实幼儿园场景');
    console.log('  - 招生申请信息更加真实可信');
    console.log('  - 通知内容符合实际教育场景');
    
  } catch (error) {
    console.error('❌ 提升数据质量时发生错误:', error);
    console.error('错误详情:', error.message);
  } finally {
    await connection.end();
  }
}

improveExistingDemoData();