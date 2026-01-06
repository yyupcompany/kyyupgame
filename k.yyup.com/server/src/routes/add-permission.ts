/**
 * 临时路由：添加Function Tools权限
 */

import { Router } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

const router = Router();

/**
 * @swagger
 * /api/add-permission/add-function-tools-permission:
 *   post:
 *     summary: 添加Function Tools权限
 *     description: 临时路由，用于添加Function Tools权限到系统
 *     tags:
 *       - 权限管理
 *     responses:
 *       200:
 *         description: 添加成功
 *       500:
 *         description: 服务器错误
 */
router.post('/add-function-tools-permission', async (req, res) => {
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
      return res.json({
        success: true,
        message: 'Function Tools权限已存在',
        data: existingPermission[0]
      });
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
        parent_id,
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
        :parent_id,
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
          description: '智能工具调用系统，支持数据查询、页面导航等多种功能',
          parent_id: 3006  // AI Center的ID
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

    res.json({
      success: true,
      message: 'Function Tools权限添加成功',
      data: newPermission[0]
    });

  } catch (error) {
    console.error('❌ 添加Function Tools权限失败:', error);
    res.status(500).json({
      success: false,
      message: '添加Function Tools权限失败',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
