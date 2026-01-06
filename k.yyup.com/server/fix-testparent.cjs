const { User, Role, UserRole } = require('./dist/models');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('🔧 检查和修复testparent账户...');

    // 查找testparent用户
    let testParent = await User.findOne({
      where: { username: 'testparent' },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    if (!testParent) {
      console.log('❌ 未找到testparent用户，创建新用户...');

      // 创建新用户
      testParent = await User.create({
        username: 'testparent',
        email: 'testparent@example.com',
        phone: '13800138001',
        realName: '测试家长',
        password: await bcrypt.hash('123456', 12),
        status: 'active'
      });

      console.log('✅ testparent用户创建成功');
    } else {
      console.log('✅ 找到testparent用户:');
      console.log(`用户ID: ${testParent.id}`);
      console.log(`用户名: ${testParent.username}`);
      console.log(`邮箱: ${testParent.email}`);
      console.log(`状态: ${testParent.status}`);
      console.log(`角色: ${testParent.Roles?.map(r => r.name).join(', ') || '无'}`);

      // 验证并重置密码
      const isPasswordValid = await bcrypt.compare('123456', testParent.password);
      console.log(`密码验证(123456): ${isPasswordValid ? '✅ 正确' : '❌ 错误'}`);

      if (!isPasswordValid) {
        console.log('🔧 重置密码...');
        const hashedPassword = await bcrypt.hash('123456', 12);
        await testParent.update({ password: hashedPassword });
        console.log('✅ 密码已重置');
      }
    }

    // 确保有家长角色
    let parentRole = await Role.findOne({ where: { name: 'parent' } });
    if (!parentRole) {
      console.log('🔧 创建家长角色...');
      parentRole = await Role.create({
        name: 'parent',
        code: 'parent',
        description: '家长角色',
        status: 'active'
      });
    }

    // 分配家长角色
    const existingUserRole = await UserRole.findOne({
      where: {
        userId: testParent.id,
        roleId: parentRole.id
      }
    });

    if (!existingUserRole) {
      await UserRole.create({
        userId: testParent.id,
        roleId: parentRole.id,
        isPrimary: true
      });
      console.log('✅ 家长角色已分配');
    }

    // 最终验证
    const finalUser = await User.findOne({
      where: { username: 'testparent' },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    console.log('\n🎉 testparent账户设置完成!');
    console.log(`用户名: testparent`);
    console.log(`密码: 123456`);
    console.log(`邮箱: ${finalUser.email}`);
    console.log(`角色: ${finalUser.Roles.map(r => r.name).join(', ')}`);
    console.log(`状态: ${finalUser.status}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    process.exit(1);
  }
})();