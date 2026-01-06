const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function verifyLoginRoles() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 验证登录页面快捷登录的实际角色');
  console.log('='.repeat(70) + '\n');

  // 登录页面的快捷登录配置
  const credentials = {
    admin: { username: 'admin', password: 'admin123', display: '系统管理员' },
    principal: { username: 'test_admin', password: 'admin123', display: '园长' },
    teacher: { username: 'test_teacher', password: 'admin123', display: '教师' },
    parent: { username: 'test_parent', password: 'admin123', display: '家长' }
  };

  console.log('📋 登录页面快捷登录配置:\n');
  console.log('| 按钮显示 | 用户名 | 密码 | 期望角色 |');
  console.log('|----------|--------|------|----------|');
  Object.entries(credentials).forEach(([role, cred]) => {
    console.log(`| ${cred.display} | ${cred.username} | ${cred.password} | ${role} |`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('🔐 实际登录测试:\n');

  for (const [expectedRole, cred] of Object.entries(credentials)) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: cred.username,
        password: cred.password
      });

      if (response.data.success) {
        const user = response.data.data.user;
        const actualRole = user.role;
        const match = actualRole === expectedRole ? '✅' : '❌';
        
        console.log(`${match} ${cred.display} (${cred.username})`);
        console.log(`   期望角色: ${expectedRole}`);
        console.log(`   实际角色: ${actualRole}`);
        
        if (actualRole !== expectedRole) {
          console.log(`   ⚠️  角色不匹配！`);
        }
        console.log('');
      }
    } catch (error) {
      console.log(`❌ ${cred.display} (${cred.username}) - 登录失败`);
      console.log(`   错误: ${error.message}\n`);
    }
  }

  console.log('=' .repeat(70));
  console.log('📝 问题总结:\n');
  console.log('1. 登录页面有4个快捷登录按钮:');
  console.log('   - 系统管理员 (admin)');
  console.log('   - 园长 (principal)');
  console.log('   - 教师 (teacher)');
  console.log('   - 家长 (parent)\n');
  
  console.log('2. 当前配置问题:');
  console.log('   - "园长"按钮使用 test_admin 账号');
  console.log('   - test_admin 的实际角色是 admin (管理员)');
  console.log('   - 应该使用 principal 账号 (username: principal, password: 123456)\n');
  
  console.log('3. 建议修改:');
  console.log('   principal: { username: "principal", password: "123456" }\n');
  
  console.log('=' .repeat(70));
}

verifyLoginRoles();
