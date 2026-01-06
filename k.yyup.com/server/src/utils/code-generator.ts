/**
 * 代码生成工具
 * 用于生成团购码、邀请码等
 */

/**
 * 生成团购码
 * 格式: GB + 时间戳后6位 + 随机4位
 */
export function generateGroupCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GB${timestamp}${random}`;
}

/**
 * 生成邀请码
 * 格式: INV + 随机6位
 */
export function generateInviteCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV${random}`;
}

/**
 * 生成积攒码
 * 格式: COLLECT + 随机6位
 */
export function generateCollectCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `COLLECT${random}`;
}

/**
 * 生成订单号
 * 格式: ORD + 时间戳 + 随机4位
 */
export function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD${timestamp}${random}`;
}