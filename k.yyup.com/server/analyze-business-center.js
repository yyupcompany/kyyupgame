const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function analyzeBusinessCenter() {
  try {
    console.log('🔍 分析业务中心的架构...\n');

    // 查询业务中心相关的所有权限和子功能
    const [businessPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%业务%' OR chinese_name LIKE '%业务%' OR path LIKE '%business%' OR resource LIKE '%business%')
      ORDER BY sort
    `);

    console.log('📊 业务中心权限分析:');
    console.log('=======================');
    console.log(`业务中心相关权限: ${businessPermissions.length} 个\n`);

    // 查询业务中心的子权限（通过parent_id关联）
    const [allChildPermissions] = await sequelize.query(`
      SELECT p1.id, p1.name, p1.chinese_name, p1.path, p1.component, p1.parent_id, p1.sort, p1.description, p1.resource, p1.action,
             p2.chinese_name as parent_name, p2.path as parent_path
      FROM permissions p1
      LEFT JOIN permissions p2 ON p1.parent_id = p2.id
      WHERE p1.status = 1
      AND p1.parent_id IS NOT NULL AND p1.parent_id != 0
      ORDER BY p2.sort, p1.sort
    `);

    // 查询所有与招生相关的权限
    const [enrollmentPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%招生%' OR chinese_name LIKE '%招生%' OR path LIKE '%enrollment%' OR resource LIKE '%enrollment%')
      ORDER BY sort
    `);

    // 查询所有与活动相关的权限
    const [activityPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%活动%' OR chinese_name LIKE '%活动%' OR path LIKE '%activity%' OR resource LIKE '%activity%')
      ORDER BY sort
    `);

    // 查询所有与教学相关的权限
    const [teachingPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%教学%' OR name LIKE '%教师%' OR name LIKE '%课程%' OR name LIKE '%考勤%' OR name LIKE '%检查%'
           OR chinese_name LIKE '%教学%' OR chinese_name LIKE '%教师%' OR chinese_name LIKE '%课程%' OR chinese_name LIKE '%考勤%' OR chinese_name LIKE '%检查%'
           OR path LIKE '%teaching%' OR path LIKE '%personnel%' OR path LIKE '%attendance%' OR path LIKE '%inspection%'
           OR resource LIKE '%teaching%' OR resource LIKE '%personnel%' OR resource LIKE '%attendance%' OR resource LIKE '%inspection%')
      ORDER BY sort
    `);

    // 查询所有与财务相关的权限
    const [financePermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%财务%' OR name LIKE '%收费%' OR name LIKE '%费用%'
           OR chinese_name LIKE '%财务%' OR chinese_name LIKE '%收费%' OR chinese_name LIKE '%费用%'
           OR path LIKE '%finance%' OR path LIKE '%payment%'
           OR resource LIKE '%finance%' OR resource LIKE '%payment%')
      ORDER BY sort
    `);

    // 查询所有与营销相关的权限
    const [marketingPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, path, component, parent_id, sort, description, resource, action
      FROM permissions
      WHERE status = 1
      AND (name LIKE '%营销%' OR name LIKE '%客户%' OR name LIKE '%话术%' OR name LIKE '%呼叫%' OR name LIKE '%广告%'
           OR chinese_name LIKE '%营销%' OR chinese_name LIKE '%客户%' OR chinese_name LIKE '%话术%' OR chinese_name LIKE '%呼叫%' OR chinese_name LIKE '%广告%'
           OR path LIKE '%marketing%' OR path LIKE '%customer-pool%' OR path LIKE '%script%' OR path LIKE '%call-center%' OR path LIKE '%advertisement%'
           OR resource LIKE '%marketing%' OR resource LIKE '%customer-pool%' OR resource LIKE '%script%' OR resource LIKE '%call-center%' OR resource LIKE '%advertisement%')
      ORDER BY sort
    `);

    console.log('📈 各业务域权限统计:');
    console.log('==================');
    console.log(`招生相关: ${enrollmentPermissions.length} 个`);
    console.log(`活动相关: ${activityPermissions.length} 个`);
    console.log(`教学相关: ${teachingPermissions.length} 个`);
    console.log(`财务相关: ${financePermissions.length} 个`);
    console.log(`营销相关: ${marketingPermissions.length} 个`);

    // 分析业务中心的timeline功能
    console.log('\n📅 业务中心Timeline功能分析:');
    console.log('==============================');

    // 查询timeline相关的数据库表（如果存在）
    try {
      const [timelineTables] = await sequelize.query(`
        SHOW TABLES LIKE '%timeline%' OR LIKE '%business%' OR LIKE '%workflow%'
      `);

      console.log('发现的业务相关表:');
      timelineTables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });

      // 如果有timeline表，查看其结构
      if (timelineTables.length > 0) {
        const tableName = Object.values(timelineTables[0])[0];
        try {
          const [tableStructure] = await sequelize.query(`DESCRIBE ${tableName}`);
          console.log(`\n表 ${tableName} 结构:`);
          tableStructure.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
          });

          const [timelineData] = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 5`);
          if (timelineData.length > 0) {
            console.log(`\n${tableName} 示例数据:`);
            timelineData.forEach((row, index) => {
              console.log(`  ${index + 1}. ${JSON.stringify(row)}`);
            });
          }
        } catch (e) {
          console.log(`无法查看表 ${tableName} 的详细数据`);
        }
      }
    } catch (error) {
      console.log('没有找到timeline相关的表，继续分析权限关系...');
    }

    // 分析权限的业务域关联
    console.log('\n🔗 权限与业务域关联分析:');
    console.log('======================');

    const businessDomains = {
      '招生域': {
        centers: ['招生中心'],
        permissions: enrollmentPermissions,
        description: '招生流程管理、申请审核、录取通知'
      },
      '教学域': {
        centers: ['教学中心', '教师中心', '人事中心', '考勤中心', '检查中心'],
        permissions: teachingPermissions,
        description: '教学计划、教师管理、课程安排、考勤检查'
      },
      '活动域': {
        centers: ['活动中心'],
        permissions: activityPermissions,
        description: '活动策划、报名管理、活动执行、效果评估'
      },
      '财务域': {
        centers: ['财务中心'],
        permissions: financePermissions,
        description: '收费管理、费用设置、财务报表、发票管理'
      },
      '营销域': {
        centers: ['营销中心', '客户池中心', '话术中心', '呼叫中心', '新媒体中心'],
        permissions: marketingPermissions,
        description: '客户开发、营销活动、话术管理、客户跟进'
      }
    };

    Object.keys(businessDomains).forEach(domain => {
      const data = businessDomains[domain];
      console.log(`\n🏢 ${domain}:`);
      console.log(`   涉及中心: ${data.centers.join(', ')}`);
      console.log(`   权限数量: ${data.permissions.length} 个`);
      console.log(`   功能描述: ${data.description}`);

      console.log(`   主要权限:`);
      data.permissions.slice(0, 5).forEach(perm => {
        console.log(`     - ${perm.chinese_name || perm.name} (${perm.path})`);
      });
      if (data.permissions.length > 5) {
        console.log(`     ... 还有 ${data.permissions.length - 5} 个权限`);
      }
    });

    // 建议的业务驱动的层级结构
    console.log('\n💡 业务驱动的层级结构建议:');
    console.log('===============================');

    console.log(`
📊 业务管理中心 (Business Center)
├── 🎓 招生域 (Enrollment Domain)
│   ├── 招生计划管理
│   ├── 潜在客户跟踪
│   ├── 申请审核流程
│   ├── 面试安排系统
│   └── 录取通知管理
│
├── 👥 教学域 (Teaching Domain)
│   ├── 教师档案管理
│   ├── 课程计划制定
│   ├── 教学活动安排
│   ├── 学生考勤记录
│   ├── 教学质量检查
│   └── 学生成长记录
│
├── 🎯 活动域 (Activity Domain)
│   ├── 活动策划管理
│   ├── 活动报名系统
│   ├── 活动执行跟踪
│   ├── 活动效果评估
│   └── 活动照片管理
│
├── 💰 财务域 (Finance Domain)
│   ├── 收费项目设置
│   ├── 收费记录管理
│   ├── 发票开具系统
│   ├── 财务统计分析
│   └── 收费催缴管理
│
├── 📢 营销域 (Marketing Domain)
│   ├── 潜在客户管理
│   ├── 营销活动策划
│   ├── 客户跟进记录
│   ├── 营销话术管理
│   └── 营销效果分析
│
└── 🤖 AI辅助域 (AI Assistant Domain)
    ├── 智能客户分析
    ├── 营销建议生成
    ├── 教学方案推荐
    └── 数据趋势预测
    `);

    // 业务中心的实际功能分析
    console.log('\n🎯 业务中心作为核心驱动器的优势:');
    console.log('======================================');
    console.log('✅ 业务流程可视化 - 可以看到完整的业务进展');
    console.log('✅ 跨域协同 - 不同业务域可以协同工作');
    console.log('✅ 数据驱动 - 所有业务数据集中展示和分析');
    console.log('✅ 决策支持 - 为管理者提供全局业务视角');
    console.log('✅ 流程优化 - 发现和解决业务流程瓶颈');

    console.log('\n🔍 业务驱动的架构特点:');
    console.log('======================');
    console.log('📋 以业务流程为中心，而非功能模块为中心');
    console.log('🔄 强调业务数据的流转和协作');
    console.log('📊 重视业务结果和效率指标');
    console.log('🎯 关注用户体验和业务满意度');
    console.log('🚀 支持业务流程的持续优化');

  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

analyzeBusinessCenter();