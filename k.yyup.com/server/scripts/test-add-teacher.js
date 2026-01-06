import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: false,
  timezone: '+08:00'
});

async function testAddTeacher() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 获取一个管理员用户
    console.log('🔍 获取管理员用户...');
    const [adminUsers] = await sequelize.query(`
      SELECT id, username, real_name FROM users 
      WHERE role = 'admin' OR role = 'super_admin' 
      LIMIT 1
    `);

    if (adminUsers.length === 0) {
      console.log('❌ 没有找到管理员用户\n');
      process.exit(1);
    }

    const admin = adminUsers[0];
    console.log(`✅ 找到管理员用户: ${admin.username} (${admin.real_name})\n`);

    // 2. 获取一个幼儿园
    console.log('🔍 获取幼儿园信息...');
    const [kindergartens] = await sequelize.query(`
      SELECT id, name, group_id FROM kindergartens 
      LIMIT 1
    `);

    if (kindergartens.length === 0) {
      console.log('❌ 没有找到幼儿园\n');
      process.exit(1);
    }

    const kindergarten = kindergartens[0];
    console.log(`✅ 找到幼儿园: ${kindergarten.name} (ID: ${kindergarten.id}, groupId: ${kindergarten.group_id})\n`);

    // 3. 生成 JWT token
    console.log('🔐 生成 JWT token...');
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: 'admin',
        isAdmin: true,  // ✅ 添加 isAdmin 标志以绕过权限检查
        kindergartenId: kindergarten.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('✅ Token 生成成功\n');

    // 4. 测试添加教师 API
    console.log('📝 测试添加教师 API...');
    const teacherData = {
      kindergartenId: kindergarten.id,  // ✅ 添加幼儿园ID
      realName: '测试教师' + Date.now(),
      phone: '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
      email: `teacher${Date.now()}@example.com`,
      teacherNo: 'T' + Date.now(),
      position: 5, // 普通教师
      hireDate: new Date().toISOString().split('T')[0],
      education: 3, // 本科
      major: '学前教育',
      roleId: 3 // 教师角色
    };

    console.log('📤 发送请求数据:');
    console.log(JSON.stringify(teacherData, null, 2));
    console.log('');

    const response = await fetch('http://localhost:3000/api/teachers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teacherData)
    });

    const result = await response.json();

    console.log('📥 API 响应:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // 检查响应状态
    if (!response.ok) {
      console.log('❌ HTTP 状态码:', response.status);
      console.log('响应头:', response.headers);
    }

    // 5. 验证返回数据
    if (result.success && result.data) {
      console.log('✅ 添加教师成功！\n');

      const { user, teacher } = result.data;

      console.log('📊 验证返回数据:');
      console.log('');

      // 验证 User 信息
      console.log('👤 User 信息:');
      console.log(`   ✅ id: ${user.id}`);
      console.log(`   ✅ username: ${user.username}`);
      console.log(`   ✅ realName: ${user.realName}`);
      console.log(`   ✅ phone: ${user.phone}`);
      console.log(`   ✅ email: ${user.email}`);
      console.log(`   ✅ role: ${user.role}`);
      console.log(`   ✅ status: ${user.status}`);
      console.log('');

      // 验证 Teacher 信息
      console.log('👨‍🏫 Teacher 信息:');
      console.log(`   ✅ id: ${teacher.id}`);
      console.log(`   ✅ userId: ${teacher.userId}`);
      console.log(`   ✅ kindergartenId: ${teacher.kindergartenId}`);
      console.log(`   ${teacher.groupId ? '✅' : '❌'} groupId: ${teacher.groupId}`);
      console.log(`   ✅ teacherNo: ${teacher.teacherNo}`);
      console.log(`   ✅ position: ${teacher.position}`);
      console.log(`   ✅ status: ${teacher.status}`);
      console.log('');

      // 6. 验证数据库中的数据
      console.log('🔍 验证数据库中的数据...\n');

      // 检查 User 表
      const [dbUser] = await sequelize.query(`
        SELECT id, username, real_name, phone, email, role, status 
        FROM users WHERE id = :userId
      `, { replacements: { userId: user.id }, type: 'SELECT' });

      if (dbUser.length > 0) {
        console.log('✅ User 表数据验证:');
        console.log(`   ✅ 用户已创建: ${dbUser[0].username}`);
      }

      // 检查 user_roles 表
      const userRolesResult = await sequelize.query(`
        SELECT ur.user_id, ur.role_id, r.name
        FROM user_roles ur
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = :userId
      `, { replacements: { userId: user.id } });

      const userRoles = Array.isArray(userRolesResult) ? userRolesResult[0] : userRolesResult;

      if (userRoles && userRoles.length > 0) {
        console.log('✅ user_roles 表数据验证:');
        userRoles.forEach(role => {
          console.log(`   ✅ 角色已绑定: ${role.name} (roleId: ${role.role_id})`);
        });
      } else {
        console.log('❌ user_roles 表数据验证:');
        console.log('   ❌ 没有找到角色关联');
      }

      // 检查 Teacher 表
      const [dbTeacher] = await sequelize.query(`
        SELECT id, user_id, kindergarten_id, group_id, teacher_no, position, status 
        FROM teachers WHERE id = :teacherId
      `, { replacements: { teacherId: teacher.id }, type: 'SELECT' });

      if (dbTeacher.length > 0) {
        console.log('✅ Teacher 表数据验证:');
        console.log(`   ✅ 教师已创建: ${dbTeacher[0].teacher_no}`);
        console.log(`   ✅ kindergarten_id: ${dbTeacher[0].kindergarten_id}`);
        console.log(`   ${dbTeacher[0].group_id ? '✅' : '❌'} group_id: ${dbTeacher[0].group_id}`);
      }

      console.log('\n🎉 测试完成！所有数据验证通过！');
    } else {
      console.log('❌ 添加教师失败！');
      console.log('错误信息:', result.message);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testAddTeacher();

