import { Request, Response, NextFunction } from 'express';

/**
 * 响应格式化中间件
 * 统一处理API响应格式
 */

/**
 * 确保数据为数组格式
 * @param data 原始数据
 * @returns 转换后的数组
 */
function ensureArray(data: any): any[] {
  if (data === null || data === undefined) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

/**
 * 响应格式化中间件
 * 拦截响应并格式化
 */
export const responseFormatter = (req, res, next) => {
  // 保存原始的send方法
  const originalSend = res.send;

  // 重写send方法
  res.send = function(body): Response {
    // 解析响应体
    let parsedBody;
    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      // 无法解析为JSON，直接返回原始内容
      return originalSend.call(this, body);
    }

    // 如果是API成功响应且有数据结构
    if (parsedBody && parsedBody.status === 'success' && parsedBody.data) {
      const data = parsedBody.data;
      
      // 处理分页响应
      if (data && typeof data === 'object' && 'list' in data) {
        // 确保list是数组
        parsedBody.data.list = ensureArray(data.list);
      }
      
      // 处理非分页响应中的数组
      else if (data && Array.isArray(data)) {
        // 保持数组结构不变
      }
      
      // 处理单条记录响应
      else if (data && !Array.isArray(data) && typeof data === 'object') {
        // 不做处理，保持对象结构
      }
    }

    // 使用原始send方法发送修改后的响应
    return originalSend.call(this, JSON.stringify(parsedBody));
  };

  next();
}; 