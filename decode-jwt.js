/**
 * 解码JWT token查看内容
 */
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiMTg2MTExNDExMzMiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzY0NTA3MzE1LCJleHAiOjE3NjUxMTIxMTV9.o-OnuFMEq3pAM0RegnT5Ee1cgg16kngcYrmnMyc8pVk';

try {
  const decoded = jwt.decode(token);
  console.log('JWT Token 内容:');
  console.log(JSON.stringify(decoded, null, 2));

  console.log('\ntenantCode:', decoded.tenantCode);
} catch (error) {
  console.error('解码失败:', error.message);
}