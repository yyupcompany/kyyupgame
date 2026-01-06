/**
 * 调试加密解密问题
 */

import crypto from 'crypto';

// 测试加密解密
const plaintext = 'Hello KMS Fallback - 等保3级合规!';
const masterKey = process.env.DB_ENCRYPTION_KEY || 'fallback-master-key';
const key = crypto.scryptSync(masterKey, 'salt', 32);

console.log('=== 调试加密解密 ===');
console.log('原文:', plaintext);
console.log('密钥长度:', key.length, '字节');

// 加密
const iv = crypto.randomBytes(16);
console.log('IV长度:', iv.length, '字节');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
let encrypted = cipher.update(plaintext, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();

const ciphertext = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
console.log('密文长度:', ciphertext.length, '字符');
console.log('密文 (前100字符):', ciphertext.substring(0, 100));

// 解密
const parts = ciphertext.split(':');
console.log('分割后段数:', parts.length);
const [ivHex, authTagHex, encryptedText] = parts;
console.log('IV Hex长度:', ivHex.length, '应该是32');
console.log('AuthTag Hex长度:', authTagHex.length, '应该是32');
console.log('Encrypted长度:', encryptedText.length);

const iv2 = Buffer.from(ivHex, 'hex');
const authTag2 = Buffer.from(authTagHex, 'hex');

console.log('重构IV长度:', iv2.length);
console.log('重构AuthTag长度:', authTag2.length);

const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv2);
decipher.setAuthTag(authTag2);

let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
decrypted += decipher.final('utf8');

console.log('解密结果:', decrypted);
console.log('验证:', plaintext === decrypted ? '成功' : '失败');
