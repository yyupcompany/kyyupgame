const { User, Role, UserRole } = require('./dist/models');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    // 1. 检查现有角色
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'code']
    });
    console.log('=== 现有角色 ===');
    roles.forEach(role => {
      console.log(`ID: ${role.id}, 名称: ${role.name}, 代码: ${role.code}`);
    });

    // 2. 查找家长角色
    let parentRole = roles.find(role => role.name === 'parent' || role.code === 'parent');

    if (!parentRole) {
      console.log('\n家长角色不存在，创建家长角色...');
      parentRole = await Role.create({
        name: 'parent',
        code: 'parent',
        description: '家长角色',
        status: 'active'
      });
      console.log(`✅ 家长角色创建成功，ID: ${parentRole.id}`);
    } else {
      console.log(`\n✅ 家长角色已存在，ID: ${parentRole.id}`);
    }

    // 3. 查找testparent用户
    let testParent = await User.findOne({
      where: { username: 'testparent' }
    });

    if (!testParent) {
      console.log('\n创建testparent用户...');
      testParent = await User.create({
        username: 'testparent',
        email: 'testparent@example.com',
        phone: '13800138001',
        password: await bcrypt.hash('123456', 12),
        status: 'active'
      });
      console.log(`✅ testparent用户创建成功，ID: ${testParent.id}`);
    } else {
      console.log(`\n✅ testparent用户已存在，ID: ${testParent.id}`);
    }

    // 4. 分配家长角色给testparent
    let userRole = await UserRole.findOne({
      where: {
        userId: testParent.id,
        roleId: parentRole.id
      }
    });

    if (!userRole) {
      await UserRole.create({
        userId: testParent.id,
        roleId: parentRole.id,
        isPrimary: true
      });
      console.log('✅ 家长角色已分配给testparent用户');
    } else {
      console.log('✅ testparent用户已有家长角色');
    }

    // 5. 验证创建结果
    const resultUser = await User.findOne({
      where: { username: 'testparent' },
      include: [{
        model: Role,
        where: { name: 'parent' }
      }]
    });

    if (resultUser && resultUser.Roles.length > 0) {
      console.log('\n🎉 testparent账户设置完成！');
      console.log(`用户名: testparent`);
      console.log(`密码: 123456`);
      console.log(`邮箱: ${resultUser.email}`);
      console.log(`角色: ${resultUser.Roles.map(r => r.name).join(', ')}`);
    } else {
      console.log('\n❌ 用户角色设置失败');
    }

    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error.message);
    process.exit(1);
  }
})();