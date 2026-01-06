#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function finalActivityVerification() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🎯 活动管理部分数据模拟完整性最终验证\n');
    
    // ========== 1. 活动基础数据验证 ==========
    console.log('🎭 1. 活动基础数据验证:');
    const [activities] = await connection.execute(`
      SELECT id, title, activity_type, status, capacity, registered_count, 
             CASE activity_type
               WHEN 1 THEN '体育运动'
               WHEN 2 THEN '文艺演出'
               WHEN 3 THEN '教育活动'
               WHEN 4 THEN '节日庆典'
               WHEN 5 THEN '户外活动'
               ELSE '其他'
             END as type_name,
             CASE status
               WHEN 0 THEN '草稿'
               WHEN 1 THEN '待开始'
               WHEN 2 THEN '已发布'
               WHEN 3 THEN '进行中'
               WHEN 4 THEN '已完成'
               WHEN 5 THEN '已取消'
               ELSE '未知'
             END as status_name
      FROM activities 
      ORDER BY created_at DESC
    `);
    
    console.log(`  ✅ 活动总数: ${activities.length} 个`);
    
    const typeDistribution = {};
    const statusDistribution = {};
    
    activities.forEach(activity => {
      typeDistribution[activity.type_name] = (typeDistribution[activity.type_name] || 0) + 1;
      statusDistribution[activity.status_name] = (statusDistribution[activity.status_name] || 0) + 1;
    });
    
    console.log('  📊 活动类型分布:');
    Object.entries(typeDistribution).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count} 个`);
    });
    
    console.log('  📈 活动状态分布:');
    Object.entries(statusDistribution).forEach(([status, count]) => {
      console.log(`    - ${status}: ${count} 个`);
    });
    
    // ========== 2. 活动报名数据验证 ==========
    console.log('\n📝 2. 活动报名数据验证:');
    const [registrations] = await connection.execute(`
      SELECT COUNT(*) as total_count FROM activity_registrations
    `);
    
    console.log(`  ✅ 报名记录总数: ${registrations[0].total_count} 条`);
    
    // 获取报名详细统计
    const [regStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT activity_id) as activities_with_registrations,
        COUNT(DISTINCT parent_id) as unique_parents,
        COUNT(DISTINCT student_id) as unique_students,
        AVG(attendee_count) as avg_attendees
      FROM activity_registrations
    `);
    
    console.log(`  📊 涉及活动数: ${regStats[0].activities_with_registrations} 个`);
    console.log(`  👨‍👩‍👧‍👦 参与家长数: ${regStats[0].unique_parents} 个`);
    console.log(`  👶 参与学生数: ${regStats[0].unique_students} 个`);
    console.log(`  📈 平均参与人数: ${Math.round(regStats[0].avg_attendees)} 人`);
    
    // 获取报名示例
    const [regSamples] = await connection.execute(`
      SELECT ar.contact_name, ar.child_name, ar.attendee_count, a.title as activity_title
      FROM activity_registrations ar
      LEFT JOIN activities a ON ar.activity_id = a.id
      WHERE ar.contact_name IS NOT NULL AND ar.child_name IS NOT NULL
      ORDER BY ar.created_at DESC
      LIMIT 5
    `);
    
    console.log('  🔍 报名数据示例:');
    regSamples.forEach((reg, index) => {
      console.log(`    ${index + 1}. ${reg.contact_name} 为 ${reg.child_name} 报名 "${reg.activity_title}"`);
    });
    
    // ========== 3. 活动评价数据验证 ==========
    console.log('\n⭐ 3. 活动评价数据验证:');
    const [evaluations] = await connection.execute(`
      SELECT COUNT(*) as total_count FROM activity_evaluations
    `);
    
    console.log(`  ✅ 评价记录总数: ${evaluations[0].total_count} 条`);
    
    if (evaluations[0].total_count > 0) {
      const [evalStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT activity_id) as activities_evaluated,
          AVG(overall_rating) as avg_rating,
          COUNT(CASE WHEN comment IS NOT NULL AND comment != '' THEN 1 END) as comments_count
        FROM activity_evaluations
      `);
      
      console.log(`  📊 被评价活动数: ${evalStats[0].activities_evaluated} 个`);
      console.log(`  🌟 平均评分: ${Math.round(evalStats[0].avg_rating * 10) / 10} 分`);
      console.log(`  💬 有评论数: ${evalStats[0].comments_count} 条`);
      
      // 获取评价示例
      const [evalSamples] = await connection.execute(`
        SELECT ae.evaluator_name, ae.overall_rating, ae.comment, a.title as activity_title
        FROM activity_evaluations ae
        LEFT JOIN activities a ON ae.activity_id = a.id
        WHERE ae.comment IS NOT NULL AND ae.comment != ''
        ORDER BY ae.evaluation_time DESC
        LIMIT 3
      `);
      
      console.log('  🔍 评价数据示例:');
      evalSamples.forEach((eval, index) => {
        console.log(`    ${index + 1}. ${eval.evaluator_name} 评价 "${eval.activity_title}": ${eval.overall_rating}分`);
        console.log(`       "${eval.comment.substring(0, 50)}..."`);
      });
    }
    
    // ========== 4. 数据关联性验证 ==========
    console.log('\n🔗 4. 数据关联性验证:');
    
    // 检查活动-报名关联
    const [activityRegLink] = await connection.execute(`
      SELECT a.title, COUNT(ar.id) as reg_count
      FROM activities a
      LEFT JOIN activity_registrations ar ON a.id = ar.activity_id
      GROUP BY a.id, a.title
      HAVING reg_count > 0
      ORDER BY reg_count DESC
      LIMIT 5
    `);
    
    console.log('  📊 活动-报名关联 (前5名):');
    activityRegLink.forEach((link, index) => {
      console.log(`    ${index + 1}. "${link.title}": ${link.reg_count} 个报名`);
    });
    
    // 检查活动-评价关联
    const [activityEvalLink] = await connection.execute(`
      SELECT a.title, COUNT(ae.id) as eval_count
      FROM activities a
      LEFT JOIN activity_evaluations ae ON a.id = ae.activity_id
      GROUP BY a.id, a.title
      HAVING eval_count > 0
      ORDER BY eval_count DESC
      LIMIT 5
    `);
    
    console.log('  ⭐ 活动-评价关联:');
    activityEvalLink.forEach((link, index) => {
      console.log(`    ${index + 1}. "${link.title}": ${link.eval_count} 个评价`);
    });
    
    // ========== 5. 数据质量评估 ==========
    console.log('\n📋 5. 数据质量评估:');
    
    // 检查是否有测试数据
    const [testData] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN title LIKE '%测试%' OR title LIKE '%test%' THEN 1 END) as test_activities,
        COUNT(CASE WHEN description LIKE '%示例%' OR description LIKE '%demo%' THEN 1 END) as demo_descriptions
      FROM activities
    `);
    
    const [testRegistrations] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN contact_name LIKE '%测试%' OR contact_name LIKE '%小明%' THEN 1 END) as test_contacts,
        COUNT(CASE WHEN child_name LIKE '%测试%' OR child_name LIKE '%小红%' THEN 1 END) as test_children
      FROM activity_registrations
    `);
    
    console.log(`  🧹 测试活动数: ${testData[0].test_activities} (应为0)`);
    console.log(`  📝 示例描述数: ${testData[0].demo_descriptions} (应为0)`);
    console.log(`  👤 测试联系人: ${testRegistrations[0].test_contacts} (应为0)`);
    console.log(`  👶 测试儿童名: ${testRegistrations[0].test_children} (应为0)`);
    
    // ========== 6. 最终评估 ==========
    console.log('\n🏆 6. 活动管理数据模拟完整性最终评估:');
    
    const criteria = {
      '基础活动数据': activities.length >= 15,
      '活动类型丰富': Object.keys(typeDistribution).length >= 3,
      '状态分布合理': Object.keys(statusDistribution).length >= 4,
      '报名数据充分': registrations[0].total_count >= 100,
      '评价数据存在': evaluations[0].total_count >= 20,
      '数据关联完整': activityRegLink.length >= 5,
      '数据质量高': (testData[0].test_activities + testData[0].demo_descriptions + 
                     testRegistrations[0].test_contacts + testRegistrations[0].test_children) === 0
    };
    
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const totalCriteria = Object.keys(criteria).length;
    
    Object.entries(criteria).forEach(([criterion, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${criterion}: ${passed ? '通过' : '未通过'}`);
    });
    
    console.log(`\n🎯 总体完整性得分: ${passedCriteria}/${totalCriteria} (${Math.round(passedCriteria/totalCriteria*100)}%)`);
    
    if (passedCriteria === totalCriteria) {
      console.log('\n🎉 恭喜！活动管理部分的数据已经全部模拟完成！');
      console.log('✅ 所有活动管理相关数据都已达到演示标准');
      console.log('✅ 包含完整的活动、报名、评价数据链条');
      console.log('✅ 数据质量高，无测试数据残留');
      console.log('✅ 数据关联性完整，支持完整业务流程演示');
    } else {
      console.log('\n⚠️ 部分数据仍需完善，详见上述评估结果');
    }
    
  } catch (error) {
    console.error('❌ 验证活动数据时发生错误:', error.message);
  } finally {
    await connection.end();
  }
}

finalActivityVerification();