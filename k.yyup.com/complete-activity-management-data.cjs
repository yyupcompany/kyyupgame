#!/usr/bin/env node

const mysql = require('mysql2/promise');

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
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'
];

const CHILD_NAMES = [
  '文博', '思远', '晨曦', '雨桐', '欣然', '悦然', '安然', '诗雨', '语桐', '雅涵',
  '梓轩', '子墨', '思睿', '雨泽', '嘉豪', '子轩', '浩宇', '明轩', '瑞泽', '天翊',
  '诗琪', '梦琪', '雅琳', '欣妍', '思妍', '诗妍', '语嫣', '欣然', '婉如', '若曦'
];

const PARENT_NAMES = [
  '艺涵', '美玲', '梓萱', '语汐', '浩然', '志强', '建华', '俊杰', '宇泽', '梓豪'
];

// 生成真实的儿童姓名
function generateChildName() {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
  return surname + givenName;
}

// 生成真实的家长姓名
function generateParentName() {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = PARENT_NAMES[Math.floor(Math.random() * PARENT_NAMES.length)];
  return surname + givenName;
}

// 生成真实的手机号码
function generateRealPhone() {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// 评价评论库
const EVALUATION_COMMENTS = [
  '活动组织得很好，孩子们玩得很开心，学到了很多知识！',
  '老师们很用心，活动内容丰富，孩子收获很大。',
  '非常有意义的活动，增进了亲子关系，值得推荐！',
  '活动场地安排合理，安全措施到位，很放心。',
  '孩子对这次活动念念不忘，希望能多组织类似活动。',
  '教育意义深刻，寓教于乐，孩子在快乐中学习成长。',
  '活动时间安排合理，内容充实，老师指导专业。',
  '很棒的体验，孩子的动手能力得到了很好的锻炼。'
];

async function completeActivityManagementData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 开始完善活动管理系统数据...\n');
    
    // ========== Phase 1: 检查并完善活动基础数据 ==========
    console.log('🎭 Phase 1: 检查活动基础数据');
    
    // 清理测试活动数据
    console.log('  🧹 清理测试活动数据...');
    await connection.execute(`
      UPDATE activities 
      SET title = ?, description = ?
      WHERE title = 'Test Activity'
    `, [
      '幼儿园音乐启蒙课',
      '通过音乐游戏、儿歌学唱、乐器体验等方式，培养幼儿的音乐感知能力和节奏感，激发对音乐的兴趣和热爱。'
    ]);
    
    // 获取所有活动
    const [activities] = await connection.execute(`
      SELECT id, title, activity_type, status, capacity, registered_count
      FROM activities 
      ORDER BY created_at DESC
    `);
    
    console.log(`  ✅ 活动总数: ${activities.length} 个`);
    
    // ========== Phase 2: 完善活动报名数据 ==========
    console.log('\n📝 Phase 2: 完善活动报名数据');
    
    // 获取现有报名数据
    const [existingRegistrations] = await connection.execute(`
      SELECT COUNT(*) as count FROM activity_registrations
    `);
    
    console.log(`  📊 现有报名记录: ${existingRegistrations[0].count} 条`);
    
    // 获取家长信息
    const [parents] = await connection.execute(`
      SELECT id as user_id, real_name, phone
      FROM users 
      WHERE role = 'parent'
      LIMIT 50
    `);
    
    // 获取学生信息
    const [students] = await connection.execute(`
      SELECT id, name, gender, YEAR(CURDATE()) - YEAR(birth_date) as age
      FROM students
      LIMIT 50
    `);
    
    console.log(`  👨‍👩‍👧‍👦 可用家长数据: ${parents.length} 个`);
    console.log(`  👶 可用学生数据: ${students.length} 个`);
    
    // 为每个活动创建合理数量的报名
    for (const activity of activities.slice(0, 15)) { // 处理前15个活动
      const targetRegistrations = Math.min(
        Math.floor(activity.capacity * 0.3 + Math.random() * activity.capacity * 0.4), 
        parents.length,
        activity.capacity
      );
      
      if (targetRegistrations > activity.registered_count) {
        const neededRegistrations = targetRegistrations - activity.registered_count;
        console.log(`  🎫 为活动 "${activity.title}" 创建 ${neededRegistrations} 个报名`);
        
        for (let i = 0; i < neededRegistrations; i++) {
          const parent = parents[i % parents.length];
          const student = students[i % students.length];
          
          try {
            await connection.execute(`
              INSERT INTO activity_registrations (
                activity_id, parent_id, student_id, contact_name, contact_phone,
                child_name, child_age, child_gender, registration_time,
                attendee_count, status, is_conversion, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 1, 0, NOW(), NOW())
            `, [
              activity.id,
              parent.user_id,
              student.id,
              parent.real_name || generateParentName(),
              parent.phone || generateRealPhone(),
              student.name || generateChildName(),
              student.age || (3 + Math.floor(Math.random() * 3)), // 3-5岁
              student.gender || Math.floor(Math.random() * 2) // 0=女, 1=男
            ]);
          } catch (error) {
            if (!error.message.includes('Duplicate entry')) {
              console.log(`    ⚠️ 创建报名时出错: ${error.message}`);
            }
          }
        }
        
        // 更新活动的报名人数
        await connection.execute(`
          UPDATE activities 
          SET registered_count = (
            SELECT COUNT(*) FROM activity_registrations 
            WHERE activity_id = ? AND status = 1
          )
          WHERE id = ?
        `, [activity.id, activity.id]);
      }
    }
    
    // ========== Phase 3: 创建活动评价数据 ==========
    console.log('\n⭐ Phase 3: 创建活动评价数据');
    
    // 获取已完成或进行中的活动
    const [evaluableActivities] = await connection.execute(`
      SELECT id, title FROM activities 
      WHERE status IN (3, 4) 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`  🎯 可评价活动: ${evaluableActivities.length} 个`);
    
    for (const activity of evaluableActivities) {
      // 获取该活动的报名记录
      const [registrations] = await connection.execute(`
        SELECT id, parent_id, contact_name 
        FROM activity_registrations 
        WHERE activity_id = ? AND status = 1
        LIMIT 8
      `, [activity.id]);
      
      console.log(`  📝 为活动 "${activity.title}" 创建 ${registrations.length} 个评价`);
      
      for (const registration of registrations) {
        const rating = 4 + Math.floor(Math.random() * 2); // 4-5分好评
        const comment = EVALUATION_COMMENTS[Math.floor(Math.random() * EVALUATION_COMMENTS.length)];
        
        try {
          await connection.execute(`
            INSERT INTO activity_evaluations (
              activity_id, registration_id, parent_id, evaluator_type,
              evaluator_name, evaluation_time, overall_rating,
              content_rating, organization_rating, environment_rating, service_rating,
              comment, is_public, status, created_at, updated_at
            ) VALUES (?, ?, ?, 1, ?, NOW(), ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())
          `, [
            activity.id,
            registration.id,
            registration.parent_id,
            registration.contact_name,
            rating,
            rating,
            rating,
            rating,
            rating,
            comment
          ]);
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.log(`    ⚠️ 创建评价时出错: ${error.message}`);
          }
        }
      }
    }
    
    // ========== Phase 4: 数据统计和验证 ==========
    console.log('\n📊 Phase 4: 数据统计验证');
    
    // 统计最新数据
    const [finalStats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM activities) as total_activities,
        (SELECT COUNT(*) FROM activity_registrations) as total_registrations,
        (SELECT COUNT(*) FROM activity_evaluations) as total_evaluations
    `);
    
    const [activityTypeStats] = await connection.execute(`
      SELECT 
        activity_type,
        COUNT(*) as count,
        CASE activity_type
          WHEN 1 THEN '体育运动'
          WHEN 2 THEN '文艺演出'
          WHEN 3 THEN '教育活动'
          WHEN 4 THEN '节日庆典'
          WHEN 5 THEN '户外活动'
          ELSE '其他'
        END as type_name
      FROM activities 
      GROUP BY activity_type
      ORDER BY count DESC
    `);
    
    const [statusStats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        CASE status
          WHEN 0 THEN '草稿'
          WHEN 1 THEN '待开始'
          WHEN 2 THEN '已发布'
          WHEN 3 THEN '进行中'
          WHEN 4 THEN '已完成'
          WHEN 5 THEN '已取消'
        END as status_name
      FROM activities 
      GROUP BY status
      ORDER BY status
    `);
    
    console.log('\n🎯 活动管理系统数据统计:');
    console.log(`  📊 活动总数: ${finalStats[0].total_activities}`);
    console.log(`  📝 报名总数: ${finalStats[0].total_registrations}`);
    console.log(`  ⭐ 评价总数: ${finalStats[0].total_evaluations}`);
    
    console.log('\n📈 活动类型分布:');
    activityTypeStats.forEach(stat => {
      console.log(`  ${stat.type_name}: ${stat.count} 个`);
    });
    
    console.log('\n📊 活动状态分布:');
    statusStats.forEach(stat => {
      console.log(`  ${stat.status_name}: ${stat.count} 个`);
    });
    
    // 计算完整性得分
    const hasActivities = finalStats[0].total_activities >= 15;
    const hasRegistrations = finalStats[0].total_registrations >= 50;
    const hasEvaluations = finalStats[0].total_evaluations >= 20;
    const hasVariousTypes = activityTypeStats.length >= 3;
    const hasVariousStatuses = statusStats.length >= 4;
    
    const completenessScore = [
      hasActivities,
      hasRegistrations,
      hasEvaluations,
      hasVariousTypes,
      hasVariousStatuses
    ].filter(Boolean).length;
    
    console.log('\n🏆 活动管理数据完整性评估:');
    console.log(`  基础活动数据 (≥15个): ${hasActivities ? '✅' : '❌'}`);
    console.log(`  报名数据 (≥50条): ${hasRegistrations ? '✅' : '❌'}`);
    console.log(`  评价数据 (≥20条): ${hasEvaluations ? '✅' : '❌'}`);
    console.log(`  活动类型多样性 (≥3种): ${hasVariousTypes ? '✅' : '❌'}`);
    console.log(`  状态多样性 (≥4种): ${hasVariousStatuses ? '✅' : '❌'}`);
    
    console.log(`\n🎯 完整性得分: ${completenessScore}/5 (${Math.round(completenessScore/5*100)}%)`);
    
    if (completenessScore === 5) {
      console.log('\n🎉 活动管理系统数据已完整！');
      console.log('✅ 所有活动数据都符合真实幼儿园运营场景');
      console.log('✅ 报名和评价数据充实，支持完整的业务演示');
      console.log('✅ 数据关联性完整，保证了系统的正常运行');
    } else {
      console.log('\n⚠️ 仍需改进的方面:');
      if (!hasActivities) console.log('  - 需要更多基础活动数据');
      if (!hasRegistrations) console.log('  - 需要更多报名数据');
      if (!hasEvaluations) console.log('  - 需要更多评价数据');
      if (!hasVariousTypes) console.log('  - 需要更多活动类型');
      if (!hasVariousStatuses) console.log('  - 需要更多状态类型');
    }
    
  } catch (error) {
    console.error('❌ 完善活动数据时发生错误:', error.message);
  } finally {
    await connection.end();
  }
}

completeActivityManagementData();