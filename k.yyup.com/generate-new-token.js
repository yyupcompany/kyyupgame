/**
 * 生成新的JWT令牌
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key-here-make-it-long-and-secure-for-production-use';

// 生成新的访问令牌（24小时有效）
const accessToken = jwt.sign(
  {
    userId: 121,
    username: 'admin',
    role: 'admin',
    type: 'access'
  },
  JWT_SECRET,
  { 
    expiresIn: '24h',
    issuer: 'kindergarten-system'
  }
);

// 生成新的刷新令牌（7天有效）
const refreshToken = jwt.sign(
  {
    userId: 121,
    username: 'admin',
    type: 'refresh'
  },
  JWT_SECRET,
  { 
    expiresIn: '7d',
    issuer: 'kindergarten-system'
  }
);

console.log('🔑 新的JWT令牌已生成：');
console.log('\n📋 访问令牌 (24小时有效):');
console.log(accessToken);
console.log('\n🔄 刷新令牌 (7天有效):');
console.log(refreshToken);

// 验证令牌
try {
  const decoded = jwt.verify(accessToken, JWT_SECRET);
  console.log('\n✅ 令牌验证成功');
  console.log('令牌信息:', {
    userId: decoded.userId,
    username: decoded.username,
    role: decoded.role,
    过期时间: new Date(decoded.exp * 1000).toLocaleString()
  });
} catch (error) {
  console.error('❌ 令牌验证失败:', error.message);
}

// 输出测试用的Authorization头
console.log('\n🧪 测试用Authorization头:');
console.log(`Authorization: Bearer ${accessToken}`);

export { accessToken, refreshToken };
