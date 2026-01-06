/**
 * 转介绍服务
 */

import { Op } from 'sequelize';
import UserReferralCode from '../models/user-referral-code.model';
import ReferralVisit, { VisitSource } from '../models/referral-visit.model';
import ReferralConversion, { ConversionStatus } from '../models/referral-conversion.model';
import QRCode from 'qrcode';

/**
 * 生成推广码
 */
export function generateReferralCode(userId: number): string {
  // 生成推广码：USER + 6位数字
  return `USER${String(userId).padStart(6, '0')}`;
}

/**
 * 计算奖励金额
 */
export function calculateReward(status: ConversionStatus): number {
  const rewardMap = {
    [ConversionStatus.VISITED]: 0,
    [ConversionStatus.REGISTERED]: 50,
    [ConversionStatus.ENROLLED]: 200,
    [ConversionStatus.PAID]: 500
  };
  return rewardMap[status] || 0;
}

/**
 * 获取或创建用户推广码
 */
export async function getOrCreateUserReferralCode(userId: number) {
  // 查找现有推广码
  let userReferralCode = await UserReferralCode.findOne({
    where: { user_id: userId }
  });

  // 如果不存在，创建新的
  if (!userReferralCode) {
    const referralCode = generateReferralCode(userId);
    
    userReferralCode = await UserReferralCode.create({
      user_id: userId,
      referral_code: referralCode
    });
  }

  return userReferralCode;
}

/**
 * 生成二维码
 */
export async function generateQRCode(referralLink: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(referralLink, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('生成二维码失败');
  }
}

/**
 * 获取用户推广统计
 */
export async function getUserReferralStats(userId: number) {
  // 获取用户推广码
  const userReferralCode = await UserReferralCode.findOne({
    where: { user_id: userId }
  });

  if (!userReferralCode) {
    return {
      visitCount: 0,
      visitorCount: 0,
      enrolledCount: 0,
      totalReward: 0
    };
  }

  const referralCode = userReferralCode.referral_code;

  // 访问次数
  const visitCount = await ReferralVisit.count({
    where: { referral_code: referralCode }
  });

  // 访客人数（去重IP）
  const visits = await ReferralVisit.findAll({
    where: { referral_code: referralCode },
    attributes: ['visitor_ip'],
    group: ['visitor_ip']
  });
  const visitorCount = visits.length;

  // 成功报名数
  const enrolledCount = await ReferralConversion.count({
    where: {
      referral_code: referralCode,
      status: {
        [Op.in]: [ConversionStatus.ENROLLED, ConversionStatus.PAID]
      }
    }
  });

  // 累计奖励
  const conversions = await ReferralConversion.findAll({
    where: { referral_code: referralCode },
    attributes: ['reward']
  });
  const totalReward = conversions.reduce((sum, conv) => sum + Number(conv.reward), 0);

  return {
    visitCount,
    visitorCount,
    enrolledCount,
    totalReward
  };
}

/**
 * 获取用户转介绍记录
 */
export async function getUserReferralRecords(
  userId: number,
  filters: {
    page?: number;
    pageSize?: number;
    visitorName?: string;
    visitorPhone?: string;
    status?: ConversionStatus;
    source?: VisitSource;
    startDate?: string;
    endDate?: string;
  }
) {
  const {
    page = 1,
    pageSize = 20,
    visitorName,
    visitorPhone,
    status,
    startDate,
    endDate
  } = filters;

  // 获取用户推广码
  const userReferralCode = await UserReferralCode.findOne({
    where: { user_id: userId }
  });

  if (!userReferralCode) {
    return {
      items: [],
      total: 0,
      page,
      pageSize
    };
  }

  const referralCode = userReferralCode.referral_code;

  // 构建查询条件
  const where: any = {
    referral_code: referralCode
  };

  if (visitorName) {
    where.visitor_name = { [Op.like]: `%${visitorName}%` };
  }

  if (visitorPhone) {
    where.visitor_phone = { [Op.like]: `%${visitorPhone}%` };
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.created_at[Op.lte] = new Date(endDate);
    }
  }

  // 查询转化记录
  const { count, rows } = await ReferralConversion.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [['created_at', 'DESC']]
  });

  // 格式化数据
  const items = rows.map(record => ({
    id: record.id,
    visitor_name: record.visitor_name,
    visitor_phone: record.visitor_phone,
    visit_time: record.created_at,
    source: 'link', // 默认来源
    status: record.status,
    enrolled_activity: record.enrolled_activity_name,
    enrolled_time: record.enrolled_time,
    reward: Number(record.reward)
  }));

  return {
    items,
    total: count,
    page,
    pageSize
  };
}

/**
 * 记录访问
 */
export async function trackVisit(data: {
  referralCode: string;
  source: VisitSource;
  visitorIp?: string;
  visitorUa?: string;
}) {
  const { referralCode, source, visitorIp, visitorUa } = data;

  // 查找推广码对应的用户
  const userReferralCode = await UserReferralCode.findOne({
    where: { referral_code: referralCode }
  });

  if (!userReferralCode) {
    throw new Error('推广码不存在');
  }

  // 防刷：同一IP 1小时内只记录一次
  if (visitorIp) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVisit = await ReferralVisit.findOne({
      where: {
        referral_code: referralCode,
        visitor_ip: visitorIp,
        visit_time: { [Op.gte]: oneHourAgo }
      }
    });

    if (recentVisit) {
      return { message: '访问已记录' };
    }
  }

  // 创建访问记录
  const visit = await ReferralVisit.create({
    referral_code: referralCode,
    referrer_id: userReferralCode.user_id,
    visitor_ip: visitorIp,
    visitor_ua: visitorUa,
    source
  });

  return visit;
}

/**
 * 记录转化
 */
export async function trackConversion(data: {
  referralCode: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorId?: string;
  status: ConversionStatus;
  enrolledActivityId?: string;
  enrolledActivityName?: string;
}) {
  const {
    referralCode,
    visitorName,
    visitorPhone,
    visitorId,
    status,
    enrolledActivityId,
    enrolledActivityName
  } = data;

  // 查找推广码对应的用户
  const userReferralCode = await UserReferralCode.findOne({
    where: { referral_code: referralCode }
  });

  if (!userReferralCode) {
    throw new Error('推广码不存在');
  }

  // 计算奖励
  const reward = calculateReward(status);

  // 创建转化记录
  const conversion = await ReferralConversion.create({
    referral_code: referralCode,
    referrer_id: userReferralCode.user_id,
    visitor_name: visitorName,
    visitor_phone: visitorPhone,
    visitor_id: visitorId ? Number(visitorId) : undefined,
    status,
    enrolled_activity_id: enrolledActivityId ? Number(enrolledActivityId) : undefined,
    enrolled_activity_name: enrolledActivityName,
    enrolled_time: status === ConversionStatus.ENROLLED || status === ConversionStatus.PAID ? new Date() : undefined,
    reward
  });

  return conversion;
}

