/**
 * 添加Function Tools页面权限
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function addFunctionToolsPermission() {
  try {
    console.log('🚀 开始添加Function Tools权限...');

    // 检查权限是否已存在
    const existingPermission = await sequelize.query(
      'SELECT * FROM permissions WHERE code = :code',
      {
        replacements: { code: 'AI_FUNCTION_TOOLS' },
        type: QueryTypes.SELECT
      }
    );

    if (existingPermission.length > 0) {
      console.log('✅ Function Tools权限已存在，无需重复添加');
      return;
    }

    // 添加权限记录
    const result = await sequelize.query(
      `INSERT INTO permissions (
        name,
        code,
        path,
        component,
        type,
        status,
        sort,
        icon,
        description,
        created_at,
        updated_at
      ) VALUES (
        :name,
        :code,
        :path,
        :component,
        :type,
        :status,
        :sort,
        :icon,
        :description,
        NOW(),
        NOW()
      )`,
      {
        replacements: {
          name: 'Function Tools',
          code: 'AI_FUNCTION_TOOLS',
          path: '/ai-center/function-tools',
          component: 'pages/ai-center/function-tools.vue',
          type: 'menu',
          status: 1,
          sort: 100,
          icon: 'Tools',
          description: '智能工具调用系统，支持数据查询、页面导航等多种功能'
        },
        type: QueryTypes.INSERT
      }
    );

    console.log('✅ Function Tools权限添加成功:', result);

    // 查询刚添加的权限
    const newPermission = await sequelize.query(
      'SELECT * FROM permissions WHERE code = :code',
      {
        replacements: { code: 'AI_FUNCTION_TOOLS' },
        type: QueryTypes.SELECT
      }
    );

    console.log('📋 新添加的权限记录:', newPermission[0]);

    console.log('🎉 Function Tools权限添加完成！');
    console.log('💡 请重启服务器或清除路由缓存以使更改生效');

  } catch (error) {
    console.error('❌ 添加Function Tools权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  addFunctionToolsPermission()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export default addFunctionToolsPermission;
