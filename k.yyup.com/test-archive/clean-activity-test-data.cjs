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

const PARENT_NAMES = [
  '艺涵', '美玲', '梓萱', '语汐', '浩然', '志强', '建华', '俊杰', '宇泽', '梓豪',
  '秀英', '丽娜', '静雅', '欣怡', '梦琪', '雅琳', '思妍', '婉如', '若曦', '晨曦'
];

const CHILD_NAMES = [
  '文博', '思远', '晨曦', '雨桐', '欣然', '悦然', '安然', '诗雨', '语桐', '雅涵',
  '梓轩', '子墨', '思睿', '雨泽', '嘉豪', '子轩', '浩宇', '明轩', '瑞泽', '天翊',
  '诗琪', '梦琪', '雅琳', '欣妍', '思妍', '诗妍', '语嫣', '欣然', '婉如', '若曦'
];

// 生成真实的家长姓名
function generateParentName() {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = PARENT_NAMES[Math.floor(Math.random() * PARENT_NAMES.length)];
  return surname + givenName;
}

// 生成真实的儿童姓名
function generateChildName() {
  const surname = REAL_SURNAMES[Math.floor(Math.random() * REAL_SURNAMES.length)];
  const givenName = CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
  return surname + givenName;
}

async function cleanActivityTestData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧹 清理活动报名中的测试数据...\n');
    
    // 清理测试联系人姓名
    const [testContacts] = await connection.execute(`
      SELECT id, contact_name FROM activity_registrations
      WHERE contact_name LIKE '%测试%' OR contact_name LIKE '%小明%' OR contact_name LIKE '%demo%'
      LIMIT 50
    `);
    
    console.log(`📝 发现 ${testContacts.length} 个测试联系人，正在清理...`);
    
    for (const contact of testContacts) {
      const newName = generateParentName();
      await connection.execute(
        'UPDATE activity_registrations SET contact_name = ? WHERE id = ?',
        [newName, contact.id]
      );
      console.log(`  🔄 ${contact.contact_name} -> ${newName}`);
    }
    
    // 清理测试儿童姓名
    const [testChildren] = await connection.execute(`
      SELECT id, child_name FROM activity_registrations
      WHERE child_name LIKE '%测试%' OR child_name LIKE '%小红%' OR child_name LIKE '%小刚%' OR child_name LIKE '%demo%'
      LIMIT 50
    `);
    
    console.log(`\n👶 发现 ${testChildren.length} 个测试儿童姓名，正在清理...`);
    
    for (const child of testChildren) {
      const newName = generateChildName();
      await connection.execute(
        'UPDATE activity_registrations SET child_name = ? WHERE id = ?',
        [newName, child.id]
      );
      console.log(`  🔄 ${child.child_name} -> ${newName}`);
    }
    
    // 验证清理效果
    const [verification] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN contact_name LIKE '%测试%' OR contact_name LIKE '%小明%' THEN 1 END) as test_contacts,
        COUNT(CASE WHEN child_name LIKE '%测试%' OR child_name LIKE '%小红%' THEN 1 END) as test_children
      FROM activity_registrations
    `);
    
    console.log('\n✅ 清理完成验证:');
    console.log(`  测试联系人残留: ${verification[0].test_contacts} 个`);
    console.log(`  测试儿童姓名残留: ${verification[0].test_children} 个`);
    
    if (verification[0].test_contacts === 0 && verification[0].test_children === 0) {
      console.log('\n🎉 活动报名数据清理完成！所有测试数据已清除。');
    } else {
      console.log('\n⚠️ 仍有部分测试数据需要进一步清理。');
    }
    
  } catch (error) {
    console.error('❌ 清理测试数据时发生错误:', error.message);
  } finally {
    await connection.end();
  }
}

cleanActivityTestData();