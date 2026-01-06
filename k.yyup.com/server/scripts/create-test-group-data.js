require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function createTestGroupData() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询现有的用户和幼儿园
    const [users] = await sequelize.query(`
      SELECT id, username, real_name, role
      FROM users
      WHERE username IN ('admin', 'principal')
      ORDER BY id
    `);

    const [kindergartens] = await sequelize.query(`
      SELECT id, name, code
      FROM kindergartens
      WHERE deleted_at IS NULL
      ORDER BY id
      LIMIT 3
    `);

    console.log('👥 找到的用户：');
    users.forEach(user => {
      console.log(`  ${user.id}: ${user.username} (${user.real_name || 'N/A'}) - ${user.role}`);
    });
    console.log('');

    console.log('🏫 找到的幼儿园：');
    kindergartens.forEach(kg => {
      console.log(`  ${kg.id}: ${kg.name} (${kg.code})`);
    });
    console.log('');

    // 2. 创建测试集团
    const testGroups = [
      {
        name: '婴婴向上教育集团',
        code: 'YYUP-GROUP-001',
        type: 'EDUCATION',
        brand_name: '婴婴向上',
        description: '专注于幼儿教育的综合性教育集团',
        investor_id: users.find(u => u.username === 'admin')?.id || 1,
        status: 'active'
      },
      {
        name: '智慧童年教育集团',
        code: 'SMART-CHILD-002',
        type: 'EDUCATION',
        brand_name: '智慧童年',
        description: '以科技赋能教育的现代化教育集团',
        investor_id: users.find(u => u.username === 'principal')?.id || 2,
        status: 'active'
      }
    ];

    console.log('🏢 开始创建测试集团...\n');

    for (const groupData of testGroups) {
      // 检查是否已存在
      const [existing] = await sequelize.query(`
        SELECT id FROM \`groups\` WHERE code = '${groupData.code}'
      `);

      if (existing.length > 0) {
        console.log(`  ⏭️  集团已存在: ${groupData.name} (${groupData.code})`);
        continue;
      }

      // 创建集团
      const [, metadata] = await sequelize.query(`
        INSERT INTO \`groups\` (
          name, code, type, brand_name, description,
          investor_id, status, created_at, updated_at
        ) VALUES (
          '${groupData.name}', '${groupData.code}', '${groupData.type}',
          '${groupData.brand_name}', '${groupData.description}',
          ${groupData.investor_id}, '${groupData.status}', NOW(), NOW()
        )
      `);

      const groupId = metadata;
      console.log(`  ✅ 创建集团: ${groupData.name} (${groupData.code}) - ID: ${groupId}`);

      // 3. 将幼儿园关联到集团（如果有幼儿园的话）
      if (kindergartens.length > 0) {
        const kindergartenToAssign = kindergartens[testGroups.indexOf(groupData) % kindergartens.length];

        // 更新幼儿园的group_id
        await sequelize.query(`
          UPDATE kindergartens
          SET group_id = ${groupId}, updated_at = NOW()
          WHERE id = ${kindergartenToAssign.id}
        `);

        console.log(`    📍 关联幼儿园: ${kindergartenToAssign.name} -> ${groupData.name}`);
      }
    }

    // 4. 验证创建结果
    console.log('\n🔍 验证创建结果：\n');

    const [createdGroups] = await sequelize.query(`
      SELECT g.id, g.name, g.code, g.type, g.brand_name, g.status,
             u.username as investor_username, u.real_name as investor_name,
             COUNT(k.id) as kindergarten_count
      FROM \`groups\` g
      LEFT JOIN users u ON g.investor_id = u.id
      LEFT JOIN kindergartens k ON g.id = k.group_id AND k.deleted_at IS NULL
      WHERE g.deleted_at IS NULL
      GROUP BY g.id, g.name, g.code, g.type, g.brand_name, g.status, u.username, u.real_name
      ORDER BY g.id
    `);

    console.log('📋 集团列表：');
    createdGroups.forEach(group => {
      console.log(`  ${group.id}: ${group.name} (${group.code})`);
      console.log(`    类型: ${group.type} | 品牌: ${group.brand_name} | 状态: ${group.status}`);
      console.log(`    投资人: ${group.investor_username} (${group.investor_name || 'N/A'})`);
      console.log(`    园所数量: ${group.kindergarten_count}`);
      console.log('');
    });

    // 5. 创建用户-集团关联（如果需要的话）
    console.log('🔗 创建用户-集团关联...\n');

    for (const user of users) {
      for (const group of createdGroups) {
        // 检查是否已存在关联
        const [existingAssoc] = await sequelize.query(`
          SELECT id FROM \`group_users\`
          WHERE user_id = ${user.id} AND group_id = ${group.id}
        `);

        if (existingAssoc.length === 0) {
          await sequelize.query(`
            INSERT INTO \`group_users\` (user_id, group_id, role, created_at, updated_at)
            VALUES (${user.id}, ${group.id}, 'ADMIN', NOW(), NOW())
          `);
          console.log(`  ✅ 关联用户: ${user.username} -> ${group.name} (ADMIN)`);
        } else {
          console.log(`  ⏭️  关联已存在: ${user.username} -> ${group.name}`);
        }
      }
    }

    console.log('\n🎉 测试集团数据创建完成！');
    console.log('💡 现在可以测试集团管理功能：');
    console.log('  1. 刷新集团管理页面');
    console.log('  2. 查看集团列表');
    console.log('  3. 测试创建、编辑、删除功能');
    console.log('  4. 测试集团升级功能');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

createTestGroupData();
