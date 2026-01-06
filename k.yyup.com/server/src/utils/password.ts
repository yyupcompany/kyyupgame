/**
 * 密码工具函数
 * 用于对密码进行哈希处理和验证
 */
import * as crypto from 'crypto';
// @ts-ignore
import * as bcrypt from 'bcrypt';

// 盐轮数
const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希处理
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 验证密码是否匹配
 * @param password 原始密码
 * @param hashedPassword 哈希后的密码
 * @returns 是否匹配
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  console.log('===== 密码验证开始 =====');
  console.log('输入的明文密码:', password);
  console.log('数据库中的哈希密码:', hashedPassword);

  // 处理空值情况
  if (!password || !hashedPassword) {
    console.log('密码或哈希为空，返回false');
    return false;
  }

  // 检查是否是MD5哈希（32位十六进制字符）
  if (hashedPassword.length === 32 && /^[a-f0-9]{32}$/i.test(hashedPassword)) {
    console.log('检测到MD5哈希格式');
    
    // 尝试不同的编码方式计算MD5哈希
    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
    console.log('计算的MD5哈希(默认):', md5Hash);
    
    const md5HashUtf8 = crypto.createHash('md5').update(password, 'utf8').digest('hex');
    console.log('计算的MD5哈希(utf8):', md5HashUtf8);
    
    const md5HashAscii = crypto.createHash('md5').update(password, 'ascii').digest('hex');
    console.log('计算的MD5哈希(ascii):', md5HashAscii);
    
    const md5HashBinary = crypto.createHash('md5').update(Buffer.from(password, 'binary')).digest('hex');
    console.log('计算的MD5哈希(binary):', md5HashBinary);
    
    // 测试不同编码的匹配结果
    console.log('比较结果(默认):', md5Hash === hashedPassword);
    console.log('比较结果(utf8):', md5HashUtf8 === hashedPassword);
    console.log('比较结果(ascii):', md5HashAscii === hashedPassword);
    console.log('比较结果(binary):', md5HashBinary === hashedPassword);
    
    // 返回任一匹配结果
    const isMatch = 
      md5Hash === hashedPassword || 
      md5HashUtf8 === hashedPassword || 
      md5HashAscii === hashedPassword || 
      md5HashBinary === hashedPassword;
    
    console.log('最终MD5验证结果:', isMatch);
    return isMatch;
  }
  
  console.log('尝试使用bcrypt验证');
  // 否则尝试使用bcrypt验证
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('bcrypt验证结果:', result);
    console.log('===== 密码验证结束 =====');
    return result;
  } catch (error) {
    console.error('密码验证错误:', error);
    console.log('===== 密码验证失败 =====');
    return false;
  }
};

/**
 * 生成随机令牌
 * @param length 令牌长度
 * @returns 随机令牌
 */
export const generateRandomToken = (length: number = 32): string => {
  // 处理负数长度
  if (length < 0) {
    throw new Error('Token length must be non-negative');
  }
  return crypto.randomBytes(length).toString('hex');
};

export default {
  hashPassword,
  verifyPassword,
  generateRandomToken
}; 