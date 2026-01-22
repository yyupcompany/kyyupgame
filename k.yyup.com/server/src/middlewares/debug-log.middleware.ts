/**
 * 调试日志中间件
 * 用于记录API请求和令牌信息，帮助诊断问题
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';

// 定义JWT令牌负载类型
interface JwtPayload {
  [key: string]: any;
  exp?: number;
}

/**
 * API请求调试日志中间件
 */
export const apiDebugLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // 记录请求信息
  console.log(`[API调试] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // 记录请求头
  console.log('[API调试] 请求头:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? '**存在**' : '**不存在**'
  }));
  
  // 如果有认证令牌，记录令牌信息（不包含具体令牌内容）
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        // 解析令牌但不验证签名，只是为了查看内容
        const decodedToken = jwt.decode(token) as JwtPayload;
        if (decodedToken) {
          const expDate = decodedToken.exp 
            ? new Date(decodedToken.exp * 1000).toISOString() 
            : null;
          
          console.log('[API调试] 令牌负载:', JSON.stringify({
            userId: decodedToken.userId,
            username: decodedToken.username,
            type: decodedToken.type,
            exp: expDate
          }));
        }
        
        // 尝试验证令牌，看是否有效
        try {
          jwt.verify(token, JWT_SECRET);
          console.log('[API调试] 令牌验证: 有效');
        } catch (error: any) {
          console.log('[API调试] 令牌验证: 无效', error.message || '未知错误');
        }
      } catch (error: any) {
        console.log('[API调试] 无法解析令牌:', error.message || '未知错误');
      }
    }
  }
  
  // 继续处理请求
  // 在 next() 之后添加一个 hook 来记录 req.user（如果被 verifyToken 设置）
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const reqWithUser = req as any;
    if (reqWithUser.user) {
      console.log('[API调试] req.user:', JSON.stringify({
        id: reqWithUser.user.id,
        username: reqWithUser.user.username,
        role: reqWithUser.user.role,
        kindergartenId: reqWithUser.user.kindergartenId,
        primaryKindergartenId: reqWithUser.user.primaryKindergartenId,
        dataScope: reqWithUser.user.dataScope
      }));
    } else {
      console.log('[API调试] req.user: 未设置');
    }
    return originalJson(data);
  };

  next();
};

export default apiDebugLogger; 