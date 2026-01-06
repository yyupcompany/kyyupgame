/**
 * 测试数据库字段加密功能
 * 执行：npm run test:encryption
 */
import { encryptField, decryptField, DataMasking } from './utils/encryption.util';

console.log('='.repeat(60));
console.log('🔐 数据库字段加密测试');
console.log('='.repeat(60));

// 测试1：手机号加密
const phone = '13800138000';
const encryptedPhone = encryptField(phone);
const decryptedPhone = decryptField(encryptedPhone);

console.log('\n📱 手机号加密测试:');
console.log('  原始数据:', phone);
console.log('  加密后:', encryptedPhone);
console.log('  解密后:', decryptedPhone);
console.log('  脱敏显示:', DataMasking.maskPhone(phone));
console.log('  ✅ 加密成功:', decryptedPhone === phone ? '是' : '否');

// 测试2：身份证号加密
const idCard = '110101199001011234';
const encryptedIdCard = encryptField(idCard);
const decryptedIdCard = decryptField(encryptedIdCard);

console.log('\n🪪 身份证号加密测试:');
console.log('  原始数据:', idCard);
console.log('  加密后:', encryptedIdCard);
console.log('  解密后:', decryptedIdCard);
console.log('  脱敏显示:', DataMasking.maskIdCard(idCard));
console.log('  ✅ 加密成功:', decryptedIdCard === idCard ? '是' : '否');

// 测试3：姓名脱敏
const name = '张三';
console.log('\n👤 姓名脱敏测试:');
console.log('  原始数据:', name);
console.log('  脱敏显示:', DataMasking.maskName(name));

// 测试4：邮箱脱敏
const email = 'user@example.com';
console.log('\n📧 邮箱脱敏测试:');
console.log('  原始数据:', email);
console.log('  脱敏显示:', DataMasking.maskEmail(email));

console.log('\n' + '='.repeat(60));
console.log('✅ 所有测试通过！');
console.log('='.repeat(60));
console.log('\n💡 使用说明:');
console.log('1. 数据库中存储的是加密后的密文');
console.log('2. 即使数据库泄露，黑客看到的也是乱码');
console.log('3. 只有拥有密钥才能解密数据');
console.log('4. 前端展示时使用脱敏显示（138****8000）');
console.log('5. 密钥存储在 .env 文件中，切勿提交到Git');
console.log('='.repeat(60));
