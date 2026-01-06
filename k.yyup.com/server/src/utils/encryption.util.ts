/**
 * 数据库字段加密工具
 * 使用 AES-256-GCM 加密敏感字段
 */
import crypto from 'crypto';

// 加密算法配置
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 初始化向量长度
// const AUTH_TAG_LENGTH = 16; // 认证标签长度（保留用于文档说明）
// const SALT_LENGTH = 32; // 盐值长度（保留用于文档说明）

/**
 * 从环境变量获取加密密钥
 * 如果未配置，使用默认密钥（生产环境必须配置）
 */
function getEncryptionKey(): Buffer {
  const key = process.env.DB_ENCRYPTION_KEY;
  
  if (!key) {
    console.warn('⚠️ 警告: DB_ENCRYPTION_KEY 未配置，使用默认密钥（不安全）');
    // 默认密钥（仅用于开发环境）
    return crypto.scryptSync('kindergarten-default-key', 'salt', 32);
  }
  
  // 将密钥转换为32字节的Buffer
  return crypto.scryptSync(key, 'salt', 32);
}

/**
 * 加密敏感数据
 * @param plaintext 明文
 * @returns 加密后的字符串（格式：iv:authTag:encrypted）
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (!plaintext) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // 格式：iv:authTag:encrypted（便于解密时拆分）
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('❌ 加密失败:', error);
    throw new Error('数据加密失败');
  }
}

/**
 * 解密敏感数据
 * @param encryptedData 加密数据（格式：iv:authTag:encrypted）
 * @returns 解密后的明文
 */
export function decryptField(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) {
    return null;
  }

  try {
    const key = getEncryptionKey();
    
    // 拆分加密数据
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      console.error('❌ 加密数据格式错误:', encryptedData);
      return null;
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ 解密失败:', error);
    return null;
  }
}

/**
 * 批量加密对象中的指定字段
 * @param obj 对象
 * @param fields 需要加密的字段名数组
 * @returns 加密后的对象
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = encryptField(String(result[field])) as any;
    }
  }
  
  return result;
}

/**
 * 批量解密对象中的指定字段
 * @param obj 对象
 * @param fields 需要解密的字段名数组
 * @returns 解密后的对象
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field]) {
      result[field] = decryptField(String(result[field])) as any;
    }
  }
  
  return result;
}

/**
 * 数据脱敏工具
 */
export class DataMasking {
  /**
   * 手机号脱敏：138****8000
   */
  static maskPhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    if (phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  /**
   * 身份证号脱敏：110101********1234
   */
  static maskIdCard(idCard: string | null | undefined): string | null {
    if (!idCard) return null;
    if (idCard.length !== 18) return idCard;
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }

  /**
   * 姓名脱敏：张三 → 张*，欧阳娜娜 → 欧阳**
   */
  static maskName(name: string | null | undefined): string | null {
    if (!name) return null;
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 1);
  }

  /**
   * 邮箱脱敏：user@example.com → u***r@example.com
   */
  static maskEmail(email: string | null | undefined): string | null {
    if (!email) return null;
    const [local, domain] = email.split('@');
    if (!domain) return email;
    if (local.length <= 2) return email;
    return local[0] + '***' + local[local.length - 1] + '@' + domain;
  }
}

/**
 * 生成新的加密密钥（用于初始化或密钥轮换）
 * 执行：node -e "require('./dist/utils/encryption.util.js').generateNewKey()"
 */
export function generateNewKey(): void {
  const key = crypto.randomBytes(32).toString('hex');
  console.log('='.repeat(60));
  console.log('🔑 新的加密密钥已生成（请保存到 .env 文件）:');
  console.log('='.repeat(60));
  console.log(`DB_ENCRYPTION_KEY=${key}`);
  console.log('='.repeat(60));
  console.log('⚠️ 警告：');
  console.log('1. 请立即将密钥保存到 server/.env 文件');
  console.log('2. 切勿将密钥提交到 Git 仓库');
  console.log('3. 生产环境必须使用不同的密钥');
  console.log('4. 定期更换密钥以提高安全性');
  console.log('='.repeat(60));
}
