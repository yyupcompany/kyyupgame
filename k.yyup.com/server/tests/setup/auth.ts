/**
 * 认证测试工具
 * 
 * 功能：
 * - 创建测试用户
 * - 生成测试Token
 * - 模拟认证状态
 * - 权限测试支持
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getTestDbPool } from './database';

// JWT密钥（测试环境）
const TEST_JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key';

/**
 * 用户创建参数接口
 */
export interface CreateTestUserParams {
  username: string;
  email: string;
  password?: string;
  role?: string;
  permissions?: string[];
  name?: string;
  phone?: string;
  status?: string;
}

/**
 * 创建测试用户
 */
export async function createTestUser(params: CreateTestUserParams): Promise<any> {
  const {
    username,
    email,
    password = 'test-password',
    role = 'user',
    permissions = [],
    name = username,
    phone = null,
    status = 'active'
  } = params;

  const pool = getTestDbPool();
  const client = await pool.connect();

  try {
    // 生成密码哈希
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入用户
    const result = await client.query(`
      INSERT INTO users (username, email, password_hash, role, permissions, name, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, role, permissions, name, phone, status, created_at
    `, [username, email, passwordHash, role, permissions, name, phone, status]);

    const user = result.rows[0];
    console.log(`✅ 创建测试用户: ${username} (ID: ${user.id})`);
    
    return user;

  } catch (error) {
    console.error(`❌ 创建测试用户失败: ${username}`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 创建测试Token
 */
export async function createTestToken(userId: number, expiresIn: string = '24h'): Promise<string> {
  const pool = getTestDbPool();
  const client = await pool.connect();

  try {
    // 获取用户信息
    const result = await client.query(`
      SELECT id, username, email, role, permissions
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      throw new Error(`用户不存在: ID ${userId}`);
    }

    const user = result.rows[0];

    // 生成JWT Token
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    };

    const token = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn });
    
    console.log(`✅ 为用户 ${user.username} 生成测试Token`);
    return token;

  } catch (error) {
    console.error(`❌ 生成测试Token失败: 用户ID ${userId}`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 验证测试Token
 */
export function verifyTestToken(token: string): any {
  try {
    const decoded = jwt.verify(token, TEST_JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('无效的测试Token');
  }
}

/**
 * 创建具有特定权限的测试用户
 */
export async function createUserWithPermissions(
  username: string,
  permissions: string[]
): Promise<{ user: any; token: string }> {
  const user = await createTestUser({
    username,
    email: `${username}@test.com`,
    permissions,
    role: permissions.includes('*') ? 'admin' : 'user'
  });

  const token = await createTestToken(user.id);

  return { user, token };
}

/**
 * 创建管理员测试用户
 */
export async function createAdminUser(username: string = 'test-admin'): Promise<{ user: any; token: string }> {
  return createUserWithPermissions(username, ['*']);
}

/**
 * 创建教师测试用户
 */
export async function createTeacherUser(username: string = 'test-teacher'): Promise<{ user: any; token: string }> {
  return createUserWithPermissions(username, [
    'students:read',
    'students:write',
    'classes:read',
    'activities:read',
    'activities:write'
  ]);
}

/**
 * 创建家长测试用户
 */
export async function createParentUser(username: string = 'test-parent'): Promise<{ user: any; token: string }> {
  return createUserWithPermissions(username, [
    'students:read:own',
    'activities:read',
    'classes:read:own'
  ]);
}

/**
 * 创建受限用户（只读权限）
 */
export async function createReadOnlyUser(username: string = 'test-readonly'): Promise<{ user: any; token: string }> {
  return createUserWithPermissions(username, [
    'dashboard:read',
    'students:read',
    'teachers:read',
    'classes:read'
  ]);
}

/**
 * 删除测试用户
 */
export async function deleteTestUser(userId: number): Promise<void> {
  const pool = getTestDbPool();
  const client = await pool.connect();

  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log(`✅ 删除测试用户: ID ${userId}`);
  } catch (error) {
    console.error(`❌ 删除测试用户失败: ID ${userId}`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 清理所有测试用户
 */
export async function cleanupTestUsers(): Promise<void> {
  const pool = getTestDbPool();
  const client = await pool.connect();

  try {
    // 删除所有测试用户（保留系统默认用户）
    await client.query(`
      DELETE FROM users 
      WHERE username LIKE 'test-%' 
         OR email LIKE '%@test.com'
    `);
    
    console.log('✅ 清理所有测试用户完成');
  } catch (error) {
    console.error('❌ 清理测试用户失败', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 模拟用户登录
 */
export async function simulateLogin(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  const pool = getTestDbPool();
  const client = await pool.connect();

  try {
    // 查找用户
    const result = await client.query(`
      SELECT id, username, email, password_hash, role, permissions, name, status
      FROM users
      WHERE username = $1
    `, [username]);

    if (result.rows.length === 0) {
      return { success: false, message: '用户不存在' };
    }

    const user = result.rows[0];

    // 检查用户状态
    if (user.status !== 'active') {
      return { success: false, message: '用户已被禁用' };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, message: '密码错误' };
    }

    // 生成Token
    const token = await createTestToken(user.id);

    // 返回用户信息（不包含密码）
    const { password_hash, ...userInfo } = user;

    return {
      success: true,
      token,
      user: userInfo
    };

  } catch (error) {
    console.error('模拟登录失败', error);
    return { success: false, message: '登录失败' };
  } finally {
    client.release();
  }
}

/**
 * 检查用户权限
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // 管理员权限
  if (userPermissions.includes('*')) {
    return true;
  }

  // 精确匹配
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // 通配符匹配
  const permissionParts = requiredPermission.split(':');
  for (const userPerm of userPermissions) {
    if (userPerm.endsWith('*')) {
      const userPermPrefix = userPerm.slice(0, -1);
      if (requiredPermission.startsWith(userPermPrefix)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 创建权限测试场景
 */
export interface PermissionTestScenario {
  name: string;
  user: any;
  token: string;
  permissions: string[];
  shouldAllow: string[];
  shouldDeny: string[];
}

/**
 * 生成权限测试场景
 */
export async function createPermissionTestScenarios(): Promise<PermissionTestScenario[]> {
  const scenarios: PermissionTestScenario[] = [];

  // 管理员场景
  const { user: adminUser, token: adminToken } = await createAdminUser('test-admin-perm');
  scenarios.push({
    name: '管理员权限测试',
    user: adminUser,
    token: adminToken,
    permissions: ['*'],
    shouldAllow: ['users:create', 'users:delete', 'system:config', 'ai:admin'],
    shouldDeny: []
  });

  // 教师场景
  const { user: teacherUser, token: teacherToken } = await createTeacherUser('test-teacher-perm');
  scenarios.push({
    name: '教师权限测试',
    user: teacherUser,
    token: teacherToken,
    permissions: ['students:read', 'students:write', 'classes:read', 'activities:read', 'activities:write'],
    shouldAllow: ['students:read', 'students:write', 'classes:read'],
    shouldDeny: ['users:create', 'users:delete', 'system:config']
  });

  // 只读用户场景
  const { user: readOnlyUser, token: readOnlyToken } = await createReadOnlyUser('test-readonly-perm');
  scenarios.push({
    name: '只读用户权限测试',
    user: readOnlyUser,
    token: readOnlyToken,
    permissions: ['dashboard:read', 'students:read', 'teachers:read', 'classes:read'],
    shouldAllow: ['students:read', 'teachers:read', 'classes:read'],
    shouldDeny: ['students:write', 'users:create', 'activities:write']
  });

  return scenarios;
}
