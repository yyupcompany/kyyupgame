/**
 * 直接测试加密解密函数
 */
import crypto from 'crypto';

const plaintext = 'Hello KMS Fallback - 等保3级合规!';
const masterKey = 'fallback-master-key';

// 模拟fallbackEncrypt
function fallbackEncrypt(keyAlias: string, plaintext: string): string {
  const key = crypto.scryptSync(masterKey, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// 模拟fallbackDecrypt
function fallbackDecrypt(ciphertext: string): string {
  const parts = ciphertext.split(':');
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const key = crypto.scryptSync(masterKey, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

console.log('=== 直接测试加密解密函数 ===');
console.log('原文:', plaintext);

const encrypted = fallbackEncrypt('alias/jwt-signing-key', plaintext);
console.log('密文长度:', encrypted.length);

const decrypted = fallbackDecrypt(encrypted);
console.log('解密结果:', decrypted);
console.log('验证:', plaintext === decrypted ? '成功' : '失败');
