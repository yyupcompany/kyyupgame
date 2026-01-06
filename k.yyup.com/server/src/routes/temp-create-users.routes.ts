import { Router } from 'express';
import bcrypt from 'bcrypt';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 临时创建测试用户API
 * 用于在没有MySQL CLI的情况下创建用户
*/
router.post('/create-test-users', async (req, res) => {
  try {
    console.log('[USER]: 🔐 开始创建测试用户...');

    // 这里使用模拟数据，因为没有数据库连接
    const testUsers = [
      { username: 'admin', password: '123456', role: 'admin', name: '系统管理员' },
      { username: 'teacher', password: '123456', role: 'teacher', name: '测试教师' },
      { username: 'test_parent', password: '123456', role: 'parent', name: '测试家长' }
    ];

    const results = [];
    const hashedPasswords = [];

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      hashedPasswords.push(hashedPassword);
      results.push({
        username: user.username,
        role: user.role,
        name: user.name,
        passwordHash: hashedPassword.substring(0, 20) + '...',
        status: '待同步到数据库'
      });
      console.log(`[USER]: ✅ 准备用户: ${user.username} / ${user.password}`);
    }

    const sqlValues = testUsers.map((u, index) =>
      `('${u.username}', '${hashedPasswords[index]}', '${u.username}@test.com', '${u.name}', '${u.role}', 'active', NOW(), NOW())`
    );

    res.json({
      success: true,
      message: '测试用户配置已生成，请同步到数据库',
      users: results,
      sqlCommands: [
        'INSERT INTO {tenantDb}.users (username, password, email, realName, role, status, createdAt, updatedAt)',
        'VALUES',
        ...sqlValues,
        '',
        '注意：请将 {tenantDb} 替换为实际的租户数据库名，例如: tenant_k001'
      ].join('\n')
    });

  } catch (error: any) {
    console.error('[USER]: ❌ 创建用户失败:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败',
      error: error.message
    });
  }
});

export default router;
