import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * 增强版密码验证函数 - 支持MD5和bcrypt
 * @param password 明文密码
 * @param hash 数据库中存储的哈希密码
 * @returns 验证结果
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.log('===== 密码验证开始 =====');
  console.log('输入的明文密码:', password);
  console.log('数据库中的哈希密码:', hash);
  
  // 判断哈希类型
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    console.log('检测到bcrypt哈希格式');
    try {
      const result = await bcrypt.compare(password, hash);
      console.log('bcrypt验证结果:', result);
      return result;
    } catch (error) {
      console.error('bcrypt验证错误:', error);
      return false;
    }
  } else if (hash.length === 32 || hash.length === 16) {
    // 可能是MD5哈希
    console.log('检测到MD5哈希格式');
    
    // 尝试多种编码格式的MD5
    const md5Default = crypto.createHash('md5').update(password).digest('hex');
    const md5Utf8 = crypto.createHash('md5').update(password, 'utf8').digest('hex');
    const md5Ascii = crypto.createHash('md5').update(password, 'ascii').digest('hex');
    const md5Binary = crypto.createHash('md5').update(password, 'binary').digest('hex');
    
    console.log('计算的MD5哈希(默认):', md5Default);
    console.log('计算的MD5哈希(utf8):', md5Utf8);
    console.log('计算的MD5哈希(ascii):', md5Ascii);
    console.log('计算的MD5哈希(binary):', md5Binary);
    
    console.log('比较结果(默认):', hash === md5Default);
    console.log('比较结果(utf8):', hash === md5Utf8);
    console.log('比较结果(ascii):', hash === md5Ascii);
    console.log('比较结果(binary):', hash === md5Binary);
    
    const result = hash === md5Default || hash === md5Utf8 || hash === md5Ascii || hash === md5Binary;
    console.log('最终MD5验证结果:', result);
    return result;
  }
  
  // 不支持的哈希格式
  console.log('不支持的哈希格式');
  return false;
}

/**
 * 生成密码哈希
 * @param password 明文密码
 * @param type 哈希类型 'bcrypt' 或 'md5'，默认为 'bcrypt'
 * @returns 哈希密码
 */
export async function hashPassword(password: string, type: 'bcrypt' | 'md5' = 'bcrypt'): Promise<string> {
  if (type === 'bcrypt') {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  } else {
    return crypto.createHash('md5').update(password).digest('hex');
  }
}

/**
 * 检查哈希类型
 * @param hash 哈希密码
 * @returns 哈希类型: 'bcrypt', 'md5' 或 'unknown'
 */
export function getHashType(hash: string): 'bcrypt' | 'md5' | 'unknown' {
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    return 'bcrypt';
  } else if (hash.length === 32) {
    return 'md5';
  } else {
    return 'unknown';
  }
} 