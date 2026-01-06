/**
 * JWT 工具函数
 * 用于生成和验证 JWT 令牌
 */
import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE, TOKEN_TYPES, getDynamicTokenExpire } from '../config/jwt.config';

/**
 * 生成 JWT 令牌
 * @param payload 令牌载荷
 * @returns JWT 令牌
 */
export const generateToken = (payload: any): string => {
  const expiresIn = payload.isRefreshToken ? REFRESH_TOKEN_EXPIRE : TOKEN_EXPIRE;
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn });
};

/**
 * 生成动态会话超时的 JWT 令牌
 * @param payload 令牌载荷
 * @returns JWT 令牌
 */
export const generateDynamicToken = async (payload: any): Promise<string> => {
  let expiresIn: string;

  if (payload.isRefreshToken) {
    expiresIn = REFRESH_TOKEN_EXPIRE;
  } else {
    // 获取动态会话超时时间
    expiresIn = await getDynamicTokenExpire();
  }

  console.log(`🔑 生成动态JWT token，过期时间: ${expiresIn}`);
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

/**
 * 验证 JWT 令牌
 * @param token JWT 令牌
 * @returns 解码后的载荷
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * 从 HTTP 请求头中提取 JWT 令牌
 * @param authHeader 认证头
 * @returns JWT 令牌或 null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader
}; 