#!/usr/bin/env node

/**
 * 初始化SOP数据脚本
 * 用于检查和初始化教师客户跟踪SOP系统的基础数据
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
const envPath = path.join(__dirname, '../server/.env');
console.log('📁 加载环境变量文件:', envPath);
dotenv.config({ path: envPath });

// 打印数据库配置
console.log('🔧 数据库配置:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('');

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkAndInitSOPData() {
  try {
    console.log('🔍 检查数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查sop_stages表是否存在
    console.log('\n🔍 检查sop_stages表...');
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'sop_stages'");
    
    if (tables.length === 0) {
      console.log('❌ sop_stages表不存在，需要运行迁移');
      console.log('请运行: cd server && npx sequelize-cli db:migrate');
      process.exit(1);
    }
    
    console.log('✅ sop_stages表存在');

    // 检查是否有SOP阶段数据
    console.log('\n🔍 检查SOP阶段数据...');
    const [stages] = await sequelize.query('SELECT COUNT(*) as count FROM sop_stages');
    const stageCount = stages[0].count;
    
    if (stageCount === 0) {
      console.log('❌ 没有SOP阶段数据，开始初始化...');
      await initSOPStages();
      await initSOPTasks();
      console.log('✅ SOP数据初始化完成');
    } else {
      console.log(`✅ 已有 ${stageCount} 个SOP阶段`);
    }

    // 显示SOP阶段列表
    console.log('\n📊 SOP阶段列表:');
    const [stageList] = await sequelize.query(
      'SELECT id, name, order_num, description FROM sop_stages ORDER BY order_num'
    );
    stageList.forEach(stage => {
      console.log(`  ${stage.order_num}. ${stage.name} (ID: ${stage.id})`);
      console.log(`     ${stage.description}`);
    });

    // 检查SOP任务数据
    console.log('\n🔍 检查SOP任务数据...');
    const [tasks] = await sequelize.query('SELECT COUNT(*) as count FROM sop_tasks');
    console.log(`✅ 共有 ${tasks[0].count} 个SOP任务`);

    console.log('\n🎉 SOP数据检查完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function initSOPStages() {
  const stages = [
    {
      name: '初次接触',
      order_num: 1,
      description: '与客户建立初步联系，了解基本需求',
      key_points: JSON.stringify(['建立信任', '了解基本信息', '初步介绍']),
      expected_duration: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '需求挖掘',
      order_num: 2,
      description: '深入了解客户需求和期望',
      key_points: JSON.stringify(['教育理念', '课程需求', '预算范围']),
      expected_duration: 5,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '方案呈现',
      order_num: 3,
      description: '展示幼儿园特色和课程方案',
      key_points: JSON.stringify(['课程介绍', '师资展示', '环境参观']),
      expected_duration: 7,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '异议处理',
      order_num: 4,
      description: '解答客户疑虑，处理异议',
      key_points: JSON.stringify(['价格说明', '政策解释', '案例分享']),
      expected_duration: 5,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '促成签约',
      order_num: 5,
      description: '推动客户做出决策，完成签约',
      key_points: JSON.stringify(['优惠政策', '签约流程', '入园准备']),
      expected_duration: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '入园准备',
      order_num: 6,
      description: '协助客户完成入园前的各项准备',
      key_points: JSON.stringify(['体检安排', '物品准备', '适应计划']),
      expected_duration: 7,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: '持续跟进',
      order_num: 7,
      description: '入园后的持续关怀和服务',
      key_points: JSON.stringify(['适应情况', '家长反馈', '增值服务']),
      expected_duration: 30,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await sequelize.query(
    `INSERT INTO sop_stages (name, order_num, description, key_points, expected_duration, is_active, created_at, updated_at) 
     VALUES ${stages.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`,
    {
      replacements: stages.flatMap(s => [
        s.name, s.order_num, s.description, s.key_points, 
        s.expected_duration, s.is_active, s.created_at, s.updated_at
      ])
    }
  );
  
  console.log('✅ 已插入7个SOP阶段');
}

async function initSOPTasks() {
  // 获取阶段ID
  const [stages] = await sequelize.query('SELECT id, order_num FROM sop_stages ORDER BY order_num');
  
  const tasks = [
    // 第1阶段：初次接触
    { stage_id: stages[0].id, name: '电话/微信初次沟通', description: '通过电话或微信与客户建立联系', order_num: 1, is_required: true, estimated_time: 30 },
    { stage_id: stages[0].id, name: '了解客户基本信息', description: '收集客户姓名、联系方式、孩子年龄等基本信息', order_num: 2, is_required: true, estimated_time: 15 },
    { stage_id: stages[0].id, name: '简要介绍幼儿园', description: '简单介绍幼儿园的基本情况和特色', order_num: 3, is_required: true, estimated_time: 20 },
    
    // 第2阶段：需求挖掘
    { stage_id: stages[1].id, name: '深入了解教育理念', description: '了解家长的教育理念和期望', order_num: 1, is_required: true, estimated_time: 30 },
    { stage_id: stages[1].id, name: '询问课程偏好', description: '了解家长对课程类型的偏好', order_num: 2, is_required: true, estimated_time: 20 },
    { stage_id: stages[1].id, name: '确认预算范围', description: '了解家长的预算范围', order_num: 3, is_required: false, estimated_time: 15 },
    
    // 第3阶段：方案呈现
    { stage_id: stages[2].id, name: '详细介绍课程体系', description: '详细介绍幼儿园的课程体系和特色', order_num: 1, is_required: true, estimated_time: 45 },
    { stage_id: stages[2].id, name: '展示师资力量', description: '介绍教师团队的资质和经验', order_num: 2, is_required: true, estimated_time: 20 },
    { stage_id: stages[2].id, name: '安排实地参观', description: '邀请家长到园参观环境和设施', order_num: 3, is_required: true, estimated_time: 60 },
    
    // 第4阶段：异议处理
    { stage_id: stages[3].id, name: '解答价格疑问', description: '详细说明收费标准和性价比', order_num: 1, is_required: true, estimated_time: 30 },
    { stage_id: stages[3].id, name: '解释政策规定', description: '解释相关政策和规定', order_num: 2, is_required: false, estimated_time: 20 },
    { stage_id: stages[3].id, name: '分享成功案例', description: '分享其他家长的成功案例', order_num: 3, is_required: false, estimated_time: 25 },
    
    // 第5阶段：促成签约
    { stage_id: stages[4].id, name: '介绍优惠政策', description: '介绍当前的优惠政策和活动', order_num: 1, is_required: true, estimated_time: 20 },
    { stage_id: stages[4].id, name: '说明签约流程', description: '详细说明签约的流程和所需材料', order_num: 2, is_required: true, estimated_time: 30 },
    { stage_id: stages[4].id, name: '完成签约手续', description: '协助家长完成签约手续', order_num: 3, is_required: true, estimated_time: 45 },
    
    // 第6阶段：入园准备
    { stage_id: stages[5].id, name: '安排入园体检', description: '协助安排孩子的入园体检', order_num: 1, is_required: true, estimated_time: 30 },
    { stage_id: stages[5].id, name: '准备入园物品', description: '指导家长准备入园所需物品', order_num: 2, is_required: true, estimated_time: 20 },
    { stage_id: stages[5].id, name: '制定适应计划', description: '与家长共同制定孩子的适应计划', order_num: 3, is_required: true, estimated_time: 40 },
    
    // 第7阶段：持续跟进
    { stage_id: stages[6].id, name: '了解适应情况', description: '定期了解孩子的适应情况', order_num: 1, is_required: true, estimated_time: 30 },
    { stage_id: stages[6].id, name: '收集家长反馈', description: '收集家长对幼儿园的反馈和建议', order_num: 2, is_required: true, estimated_time: 20 },
    { stage_id: stages[6].id, name: '介绍增值服务', description: '介绍幼儿园的增值服务项目', order_num: 3, is_required: false, estimated_time: 25 }
  ];

  await sequelize.query(
    `INSERT INTO sop_tasks (stage_id, name, description, order_num, is_required, estimated_time, is_active, created_at, updated_at) 
     VALUES ${tasks.map(() => '(?, ?, ?, ?, ?, ?, true, NOW(), NOW())').join(', ')}`,
    {
      replacements: tasks.flatMap(t => [
        t.stage_id, t.name, t.description, t.order_num, t.is_required, t.estimated_time
      ])
    }
  );
  
  console.log(`✅ 已插入${tasks.length}个SOP任务`);
}

// 运行脚本
checkAndInitSOPData();

