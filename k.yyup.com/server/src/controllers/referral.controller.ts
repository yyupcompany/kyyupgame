/**
 * 转介绍控制器
 */

import { Request, Response } from 'express';
import * as referralService from '../services/referral.service';
import { ConversionStatus } from '../models/referral-conversion.model';
import { VisitSource } from '../models/referral-visit.model';

/**
 * 获取我的推广码
 */
export async function getMyReferralCode(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    // 获取或创建推广码
    const userReferralCode = await referralService.getOrCreateUserReferralCode(userId);

    // 生成推广链接
    const referralLink = `${process.env.FRONTEND_URL || 'http://k.yyup.cc'}/register?ref=${userReferralCode.referral_code}`;

    // 如果没有二维码，生成一个
    let qrCodeUrl = userReferralCode.qr_code_url;
    if (!qrCodeUrl) {
      qrCodeUrl = await referralService.generateQRCode(referralLink);
      // 更新到数据库
      await userReferralCode.update({ qr_code_url: qrCodeUrl });
    }

    return res.json({
      success: true,
      data: {
        referral_code: userReferralCode.referral_code,
        referral_link: referralLink,
        qr_code_url: qrCodeUrl,
        poster_url: userReferralCode.poster_url,
        created_at: userReferralCode.created_at
      }
    });
  } catch (error: any) {
    console.error('获取推广码失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '获取推广码失败'
    });
  }
}

/**
 * 获取我的推广统计
 */
export async function getMyReferralStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const stats = await referralService.getUserReferralStats(userId);

    return res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('获取推广统计失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '获取推广统计失败'
    });
  }
}

/**
 * 获取我的转介绍记录
 */
export async function getMyReferralRecords(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const filters = {
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20,
      visitorName: req.query.visitorName as string,
      visitorPhone: req.query.visitorPhone as string,
      status: req.query.status as ConversionStatus,
      source: req.query.source as VisitSource,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const result = await referralService.getUserReferralRecords(userId, filters);

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('获取转介绍记录失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '获取转介绍记录失败'
    });
  }
}

/**
 * 生成推广海报（模板方式）
 */
export async function generatePoster(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    const {
      referral_code,
      qr_code_url,
      kindergartenName,
      referrerName,
      mainTitle,
      subTitle,
      contactPhone,
      features,
      style
    } = req.body;

    // TODO: 实现海报生成逻辑
    // 这里可以使用Canvas或图片处理库生成海报
    // 暂时返回模拟数据
    const posterUrl = 'https://example.com/poster.jpg';

    return res.json({
      success: true,
      data: {
        poster_url: posterUrl
      }
    });
  } catch (error: any) {
    console.error('生成海报失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '生成海报失败'
    });
  }
}

/**
 * 记录访问（公开接口）
 */
export async function trackVisit(req: Request, res: Response) {
  try {
    const { referral_code, source } = req.body;

    if (!referral_code) {
      return res.status(400).json({
        success: false,
        message: '推广码不能为空'
      });
    }

    // 获取访客IP和UA
    const visitorIp = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const visitorUa = req.headers['user-agent'];

    const visit = await referralService.trackVisit({
      referralCode: referral_code,
      source: source || VisitSource.LINK,
      visitorIp,
      visitorUa
    });

    // 检查是否是重复访问
    if ('message' in visit) {
      return res.json({
        success: true,
        data: {
          message: visit.message
        }
      });
    }

    return res.json({
      success: true,
      data: {
        visit_id: visit.id
      }
    });
  } catch (error: any) {
    console.error('记录访问失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '记录访问失败'
    });
  }
}

/**
 * 记录转化
 */
export async function trackConversion(req: Request, res: Response) {
  try {
    const {
      referral_code,
      visitor_name,
      visitor_phone,
      visitor_id,
      status,
      enrolled_activity_id,
      enrolled_activity_name
    } = req.body;

    if (!referral_code) {
      return res.status(400).json({
        success: false,
        message: '推广码不能为空'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '状态不能为空'
      });
    }

    const conversion = await referralService.trackConversion({
      referralCode: referral_code,
      visitorName: visitor_name,
      visitorPhone: visitor_phone,
      visitorId: visitor_id,
      status,
      enrolledActivityId: enrolled_activity_id,
      enrolledActivityName: enrolled_activity_name
    });

    return res.json({
      success: true,
      data: {
        conversion_id: conversion.id,
        reward: conversion.reward
      }
    });
  } catch (error: any) {
    console.error('记录转化失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '记录转化失败'
    });
  }
}

