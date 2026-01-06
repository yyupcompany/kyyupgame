/**
 * 通过API修复教师菜单结构
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function fixTeacherMenuViaAPI() {
  try {
    console.log('🔧 开始通过API修复教师菜单结构...\n');

    // 1. 获取admin token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin登录失败');
    }

    const adminToken = loginResponse.data.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Admin登录成功');

    // 2. 获取所有权限，找到TEACHER_权限
    const permissionsResponse = await axios.get(`${API_BASE}/permissions`, {
      headers: authHeaders
    });

    if (!permissionsResponse.data.success) {
      throw new Error('获取权限失败');
    }

    const allPermissions = permissionsResponse.data.data.items || [];
    const teacherPermissions = allPermissions.filter(p =>
      p.code && p.code.startsWith('TEACHER_') && p.code !== 'TEACHER_DASHBOARD_DIRECTORY'
    );

    console.log(`找到 ${teacherPermissions.length} 个TEACHER_权限需要检查`);

    // 3. 找到主分类ID
    const mainCategory = allPermissions.find(p => p.code === 'TEACHER_DASHBOARD_DIRECTORY');
    if (!mainCategory) {
      console.log('❌ 未找到TEACHER_DASHBOARD_DIRECTORY主分类');
      return;
    }

    console.log(`✅ 找到主分类: ${mainCategory.chinese_name || mainCategory.name} (ID: ${mainCategory.id})`);

    // 4. 检查并统计需要修复的权限
    let needFixCount = 0;
    const permissionsToFix = [];

    teacherPermissions.forEach(perm => {
      let needsFix = false;
      let fixReasons = [];

      if (perm.type !== 'menu') {
        needsFix = true;
        fixReasons.push(`type: ${perm.type} -> menu`);
      }

      if (perm.parentId !== mainCategory.id) {
        needsFix = true;
        fixReasons.push(`parentId: ${perm.parentId} -> ${mainCategory.id}`);
      }

      if (needsFix) {
        needFixCount++;
        permissionsToFix.push({
          id: perm.id,
          code: perm.code,
          name: perm.chinese_name || perm.name,
          reasons: fixReasons
        });
      }
    });

    console.log(`\n📋 需要修复的权限数量: ${needFixCount}`);

    if (needFixCount === 0) {
      console.log('✅ 所有TEACHER_权限设置正确，无需修复');
      return;
    }

    // 5. 显示修复详情
    permissionsToFix.forEach(perm => {
      console.log(`  ${perm.code}: ${perm.name}`);
      perm.reasons.forEach(reason => console.log(`    - ${reason}`));
    });

    // 6. 创建一个SQL脚本来执行修复
    console.log('\n📝 生成修复SQL脚本...');

    let sqlScript = `-- 修复教师菜单结构SQL脚本\n-- 生成时间: ${new Date().toISOString()}\n\n`;

    sqlScript += `-- 主分类ID: ${mainCategory.id}\n\n`;

    permissionsToFix.forEach(perm => {
      sqlScript += `-- 修复 ${perm.code} (${perm.name})\n`;

      if (perm.type !== 'menu') {
        sqlScript += `UPDATE permissions SET type = 'menu' WHERE id = ${perm.id};\n`;
      }

      if (perm.parentId !== mainCategory.id) {
        sqlScript += `UPDATE permissions SET parent_id = ${mainCategory.id} WHERE id = ${perm.id};\n`;
      }

      sqlScript += '\n';
    });

    console.log('\n📄 修复SQL脚本:');
    console.log(sqlScript);

    // 保存到文件
    require('fs').writeFileSync('fix-teacher-menu.sql', sqlScript);
    console.log('✅ SQL脚本已保存到 fix-teacher-menu.sql 文件');

    console.log('\n🎉 分析完成！');
    console.log(`📊 统计结果:`);
    console.log(`  - 总TEACHER_权限: ${teacherPermissions.length}`);
    console.log(`  - 需要修复: ${needFixCount}`);
    console.log(`  - 设置正确: ${teacherPermissions.length - needFixCount}`);

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

fixTeacherMenuViaAPI();