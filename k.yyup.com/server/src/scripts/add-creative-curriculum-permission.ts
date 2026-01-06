/**
 * 添加创意课程生成器权限配置
 * 为教师角色添加创意课程生成器菜单权限
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function addCreativeCurriculumPermission() {
  console.log('🚀 开始添加创意课程生成器权限配置...\n');

  try {
    // 1. 查找教师中心分类
    let teacherCenterCategory = await sequelize.query(
      `SELECT * FROM permissions WHERE code = 'TEACHER_CENTER_CATEGORY' AND type = 'category' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as any[];

    let teacherCenterCategoryId: number;

    if (teacherCenterCategory.length === 0) {
      console.log('📁 创建教师中心分类...');
      const result = await sequelize.query(
        `INSERT INTO permissions (name, chinese_name, code, type, path, icon, sort, status, created_at, updated_at)
         VALUES ('Teacher Center', '教师中心', 'TEACHER_CENTER_CATEGORY', 'category', '#teacher-center', 'briefcase', 50, 1, NOW(), NOW())`,
        { type: QueryTypes.INSERT }
      );
      teacherCenterCategoryId = result[0] as number;
      console.log(`✅ 教师中心分类创建成功，ID: ${teacherCenterCategoryId}\n`);
    } else {
      teacherCenterCategoryId = teacherCenterCategory[0].id;
      console.log(`✅ 教师中心分类已存在，ID: ${teacherCenterCategoryId}\n`);
    }

    // 2. 检查创意课程权限是否已存在
    const existingPermission = await sequelize.query(
      `SELECT * FROM permissions WHERE code = 'TEACHER_CREATIVE_CURRICULUM' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as any[];

    let creativeCurriculumId: number;

    if (existingPermission.length === 0) {
      console.log('📚 创建创意课程生成器权限...');
      const result = await sequelize.query(
        `INSERT INTO permissions (name, chinese_name, code, type, path, component, icon, sort, parent_id, status, created_at, updated_at)
         VALUES ('Creative Curriculum', '创意课程', 'TEACHER_CREATIVE_CURRICULUM', 'menu', '/teacher-center/creative-curriculum', 'pages/teacher-center/creative-curriculum/index.vue', 'star', 70, ?, 1, NOW(), NOW())`,
        { 
          replacements: [teacherCenterCategoryId],
          type: QueryTypes.INSERT 
        }
      );
      creativeCurriculumId = result[0] as number;
      console.log(`✅ 创意课程权限创建成功，ID: ${creativeCurriculumId}\n`);
    } else {
      creativeCurriculumId = existingPermission[0].id;
      console.log(`✅ 创意课程权限已存在，ID: ${creativeCurriculumId}\n`);
    }

    // 3. 查找教师角色
    const teacherRole = await sequelize.query(
      `SELECT * FROM roles WHERE code = 'teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as any[];

    if (teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = teacherRole[0].id;
    console.log(`📋 找到教师角色，ID: ${teacherRoleId}\n`);

    // 4. 为教师角色分配教师中心分类权限
    const existingCategoryPermission = await sequelize.query(
      `SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`,
      {
        replacements: [teacherRoleId, teacherCenterCategoryId],
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (existingCategoryPermission.length === 0) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        {
          replacements: [teacherRoleId, teacherCenterCategoryId],
          type: QueryTypes.INSERT
        }
      );
      console.log(`✅ 为教师角色分配教师中心分类权限`);
    } else {
      console.log(`ℹ️  教师角色已有教师中心分类权限`);
    }

    // 5. 为教师角色分配创意课程权限
    const existingCreativeCurriculumPermission = await sequelize.query(
      `SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1`,
      {
        replacements: [teacherRoleId, creativeCurriculumId],
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (existingCreativeCurriculumPermission.length === 0) {
      await sequelize.query(
        `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        {
          replacements: [teacherRoleId, creativeCurriculumId],
          type: QueryTypes.INSERT
        }
      );
      console.log(`✅ 为教师角色分配创意课程权限`);
    } else {
      console.log(`ℹ️  教师角色已有创意课程权限`);
    }

    console.log('\n🎉 创意课程权限配置完成！');
    console.log('\n📊 权限配置摘要:');
    console.log(`   - 教师中心分类 ID: ${teacherCenterCategoryId}`);
    console.log(`   - 创意课程权限 ID: ${creativeCurriculumId}`);
    console.log(`   - 已分配角色: 教师`);
    console.log('\n✅ 教师现在可以在侧边栏看到"创意课程"菜单项并访问该页面');

  } catch (error) {
    console.error('❌ 添加创意课程权限失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  addCreativeCurriculumPermission()
    .then(() => {
      console.log('\n✅ 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { addCreativeCurriculumPermission };

