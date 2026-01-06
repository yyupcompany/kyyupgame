#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 活动数据 - 按照2024年到2025年6月的时间安排
const activityData = [
  // 2024年秋季活动 (9-11月)
  {
    title: '秋季郊游活动',
    activityType: 3, // 亲子活动
    startTime: '2024-10-15 09:00:00',
    endTime: '2024-10-15 15:00:00',
    location: '奥林匹克森林公园',
    capacity: 50,
    fee: 0,
    description: '秋高气爽，带领孩子们走进大自然，感受秋天的美好。',
    registrationStartTime: '2024-09-15 08:00:00',
    registrationEndTime: '2024-10-10 18:00:00',
    status: 0 // 计划中
  },
  {
    title: '万圣节主题活动',
    activityType: 3, // 亲子活动
    startTime: '2024-10-31 14:00:00',
    endTime: '2024-10-31 17:00:00',
    location: '幼儿园多功能厅',
    capacity: 80,
    fee: 0,
    description: '万圣节主题化装舞会，让孩子们体验西方节日文化。',
    registrationStartTime: '2024-10-01 08:00:00',
    registrationEndTime: '2024-10-28 18:00:00',
    status: 4 // 已结束
  },
  {
    title: '感恩节亲子活动',
    activityType: 3, // 亲子活动
    startTime: '2024-11-28 09:30:00',
    endTime: '2024-11-28 11:30:00',
    location: '各班教室',
    capacity: 120,
    fee: 0,
    description: '感恩节主题活动，培养孩子们的感恩之心。',
    registrationStartTime: '2024-11-01 08:00:00',
    registrationEndTime: '2024-11-25 18:00:00',
    status: 4 // 已结束
  },

  // 2024年冬季活动 (12月-2025年2月)
  {
    title: '圣诞节庆祝活动',
    activityType: 3, // 亲子活动
    startTime: '2024-12-24 14:00:00',
    endTime: '2024-12-24 17:00:00',
    location: '幼儿园大厅',
    capacity: 100,
    fee: 0,
    description: '圣诞节主题庆祝活动，圣诞老人送礼物。',
    registrationStartTime: '2024-12-01 08:00:00',
    registrationEndTime: '2024-12-20 18:00:00',
    status: 4 // 已结束
  },
  {
    title: '新年联欢会',
    activityType: 3, // 亲子活动
    startTime: '2024-12-31 15:00:00',
    endTime: '2024-12-31 18:00:00',
    location: '幼儿园操场',
    capacity: 150,
    fee: 0,
    description: '辞旧迎新，全园师生家长共同庆祝新年。',
    registrationStartTime: '2024-12-10 08:00:00',
    registrationEndTime: '2024-12-28 18:00:00',
    status: 4 // 已结束
  },
  {
    title: '冬季运动会',
    activityType: 3, // 亲子活动
    startTime: '2025-01-15 09:00:00',
    endTime: '2025-01-15 12:00:00',
    location: '幼儿园操场',
    capacity: 80,
    fee: 0,
    description: '冬季亲子运动会，增强体质，促进亲子关系。',
    registrationStartTime: '2024-12-20 08:00:00',
    registrationEndTime: '2025-01-10 18:00:00',
    status: 4 // 已结束
  },

  // 2025年春季活动 (3-5月)
  {
    title: '春季亲子运动会',
    activityType: 3, // 亲子活动
    startTime: '2025-03-20 09:00:00',
    endTime: '2025-03-20 12:00:00',
    location: '幼儿园操场',
    capacity: 100,
    fee: 0,
    description: '春暖花开，亲子运动会增进家庭感情。',
    registrationStartTime: '2025-03-01 08:00:00',
    registrationEndTime: '2025-03-18 18:00:00',
    status: 2 // 已满员
  },
  {
    title: '植树节环保活动',
    activityType: 3, // 亲子活动
    startTime: '2025-03-12 09:00:00',
    endTime: '2025-03-12 11:00:00',
    location: '幼儿园花园',
    capacity: 60,
    fee: 0,
    description: '植树节主题活动，培养孩子们的环保意识。',
    registrationStartTime: '2025-02-20 08:00:00',
    registrationEndTime: '2025-03-10 18:00:00',
    status: 4 // 已结束
  },
  {
    title: '母亲节感恩活动',
    activityType: 3, // 亲子活动
    startTime: '2025-05-11 14:00:00',
    endTime: '2025-05-11 16:00:00',
    location: '各班教室',
    capacity: 120,
    fee: 0,
    description: '母亲节主题活动，让孩子们表达对妈妈的爱。',
    registrationStartTime: '2025-04-20 08:00:00',
    registrationEndTime: '2025-05-08 18:00:00',
    status: 4 // 已结束
  },

  // 2025年夏季活动 (6月)
  {
    title: '六一儿童节文艺汇演',
    activityType: 3, // 亲子活动
    startTime: '2025-06-01 09:00:00',
    endTime: '2025-06-01 11:30:00',
    location: '多功能厅',
    capacity: 200,
    fee: 0,
    description: '六一儿童节文艺汇演，展示孩子们的才艺。',
    registrationStartTime: '2025-05-10 08:00:00',
    registrationEndTime: '2025-05-28 18:00:00',
    status: 3 // 进行中
  },
  {
    title: '科学实验周',
    activityType: 6, // 其他
    startTime: '2025-06-10 09:00:00',
    endTime: '2025-06-14 16:00:00',
    location: '科学实验室',
    capacity: 30,
    fee: 0,
    description: '科学实验周，激发孩子们对科学的兴趣。',
    registrationStartTime: '2025-05-20 08:00:00',
    registrationEndTime: '2025-06-08 18:00:00',
    status: 3 // 进行中
  },
  {
    title: '幼儿园开放日',
    activityType: 1, // 开放日
    startTime: '2025-06-20 09:00:00',
    endTime: '2025-06-20 11:00:00',
    location: '幼儿园大厅',
    capacity: 50,
    fee: 0,
    description: '幼儿园开放日，欢迎家长参观了解。',
    registrationStartTime: '2025-06-01 08:00:00',
    registrationEndTime: '2025-06-18 18:00:00',
    status: 0 // 计划中
  },

  // 教育类活动
  {
    title: '幼儿园音乐启蒙课',
    activityType: 6, // 其他
    startTime: '2025-04-15 10:00:00',
    endTime: '2025-04-15 11:00:00',
    location: 'Test Location',
    capacity: 25,
    fee: 0,
    description: '音乐启蒙课程，培养孩子们的音乐素养。',
    registrationStartTime: '2025-04-01 08:00:00',
    registrationEndTime: '2025-04-13 18:00:00',
    status: 0 // 计划中
  }
];

async function addActivityData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 开始检查activities表结构...\n');
    
    // 检查表结构
    const [columns] = await connection.execute('DESCRIBE activities');
    console.log('📋 activities表结构:');
    columns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 检查当前数据量
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM activities');
    console.log(`\n当前数据量: ${countResult[0].count} 条\n`);
    
    // 清空现有数据
    console.log('🗑️ 清空现有活动数据...');
    await connection.execute('DELETE FROM activities');
    
    // 插入新数据
    console.log('📝 开始插入活动数据...\n');
    
    for (let i = 0; i < activityData.length; i++) {
      const activity = activityData[i];
      
      const insertQuery = `
        INSERT INTO activities (
          kindergarten_id, title, activity_type, start_time, end_time, 
          location, capacity, registered_count, checked_in_count, fee, 
          description, registration_start_time, registration_end_time, 
          needs_approval, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        1, // kindergarten_id - 默认幼儿园ID
        activity.title,
        activity.activityType,
        activity.startTime,
        activity.endTime,
        activity.location,
        activity.capacity,
        Math.floor(Math.random() * (activity.capacity * 0.8)), // 随机报名人数
        Math.floor(Math.random() * (activity.capacity * 0.6)), // 随机签到人数
        activity.fee,
        activity.description,
        activity.registrationStartTime,
        activity.registrationEndTime,
        false, // needs_approval
        activity.status
      ];
      
      await connection.execute(insertQuery, values);
      console.log(`✅ 已添加活动: ${activity.title}`);
    }
    
    // 检查插入结果
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM activities');
    console.log(`\n🎉 成功添加 ${finalCount[0].count} 条活动数据！`);
    
    // 显示部分数据验证
    const [sampleData] = await connection.execute(`
      SELECT id, title, start_time, end_time, location, status 
      FROM activities 
      ORDER BY start_time 
      LIMIT 5
    `);
    
    console.log('\n📊 数据验证 (前5条):');
    sampleData.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.title} - ${row.start_time} 至 ${row.end_time} - ${row.location} - 状态:${row.status}`);
    });
    
  } catch (error) {
    console.error('❌ 添加活动数据时发生错误:', error.message);
  } finally {
    await connection.end();
  }
}

addActivityData();
