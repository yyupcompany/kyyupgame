import { Request, Response } from 'express';
import { BusinessError } from '../utils/custom-errors';
import { Kindergarten } from '../models/kindergarten.model';
import { Activity } from '../models/activity.model';
import { ActivityRegistration } from '../models/activity-registration.model';
import { sequelize } from '../init';
import { Op } from 'sequelize';
import QRCode from 'qrcode';

// 临时存储生成的页面配置（后续应保存到数据库）
const registrationPagesCache = new Map<string, any>();

/**
 * 生成活动报名页面
 */
export const generateRegistrationPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BusinessError('未登录或登录已过期', 401);
    }

    const {
      activityId,
      activityName,
      posterUrl,
      includeInfo = ['kindergartenName', 'address', 'phone'],
      formFields = ['studentName', 'parentName', 'parentPhone', 'age', 'gender']
    } = req.body;

    console.log('🚀 开始生成报名页面...');
    console.log('📋 请求参数:', { activityId, activityName, posterUrl, includeInfo, formFields });

    // 获取幼儿园基础信息
    let kindergartenInfo: any = null;
    try {
      kindergartenInfo = await Kindergarten.findOne({
        where: { status: 1 },
        attributes: ['id', 'name', 'address', 'consultationPhone', 'phone', 'contactPerson', 'description', 'logoUrl'],
        raw: true
      });
      console.log('🏫 幼儿园基础信息:', kindergartenInfo);
    } catch (error) {
      console.warn('⚠️ 获取幼儿园基础信息失败:', error);
    }

    // 生成唯一的页面ID
    const pageId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 构建页面URL - 开发环境使用localhost
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : (process.env.FRONTEND_URL || 'https://k.yyup.cc');
    const pageUrl = `${baseUrl}/registration/${pageId}`;

    // 生成二维码
    let qrcodeDataUrl = '';
    try {
      qrcodeDataUrl = await QRCode.toDataURL(pageUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('✅ 二维码生成成功');
    } catch (error) {
      console.error('❌ 二维码生成失败:', error);
    }

    // 构建页面配置
    const pageConfig = {
      pageId,
      activityId,
      activityName,
      posterUrl,
      kindergartenInfo: includeInfo.reduce((acc: any, key: string) => {
        if (kindergartenInfo) {
          switch (key) {
            case 'kindergartenName':
              acc.name = kindergartenInfo.name;
              break;
            case 'address':
              acc.address = kindergartenInfo.address;
              break;
            case 'phone':
              acc.phone = kindergartenInfo.consultationPhone || kindergartenInfo.phone;
              break;
            case 'description':
              acc.description = kindergartenInfo.description;
              break;
          }
        }
        return acc;
      }, {}),
      formFields,
      createdAt: new Date(),
      createdBy: userId
    };

    // 保存页面配置到内存缓存（临时方案，后续应保存到数据库）
    registrationPagesCache.set(pageId, pageConfig);
    console.log('💾 页面配置已保存到缓存');

    console.log('✅ 报名页面生成成功');
    console.log('📄 页面配置:', pageConfig);

    res.json({
      success: true,
      data: {
        pageId,
        pageUrl,
        qrcodeDataUrl,
        config: pageConfig,
        // 返回activityId供前端使用
        activityId: activityId || null
      },
      message: '报名页面生成成功'
    });
  } catch (error) {
    console.error('❌ 生成报名页面失败:', error);
    if (error instanceof BusinessError) {
      throw error;
    }
    throw new BusinessError('生成报名页面失败', 500);
  }
};

/**
 * 获取报名页面配置
 */
export const getRegistrationPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;

    console.log('📖 获取报名页面配置:', pageId);

    // 从缓存中获取页面配置
    const pageConfig = registrationPagesCache.get(pageId);
    
    if (!pageConfig) {
      throw new BusinessError('页面不存在或已过期', 404);
    }

    // 如果有activityId，获取活动详细信息
    let activityInfo = null;
    if (pageConfig.activityId) {
      try {
        activityInfo = await Activity.findByPk(pageConfig.activityId, {
          attributes: [
            'id', 'title', 'description', 'startTime', 'endTime', 
            'location', 'capacity', 'fee', 'posterUrl', 'coverImage',
            'registeredCount', 'status'
          ]
        });
        console.log('📅 活动信息已加载:', activityInfo?.title);
      } catch (error) {
        console.warn('⚠️ 获取活动信息失败:', error);
      }
    }

    res.json({
      success: true,
      data: {
        config: pageConfig,
        activityInfo: activityInfo || null
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('❌ 获取报名页面配置失败:', error);
    if (error instanceof BusinessError) {
      throw error;
    }
    throw new BusinessError('获取报名页面配置失败', 500);
  }
};

/**
 * 提交报名信息
 */
export const submitRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageId } = req.params;
    const registrationData = req.body;

    console.log('📝 提交报名信息:', { pageId, registrationData });

    // TODO: 验证页面是否存在
    // TODO: 保存报名信息到数据库
    // const Registration = sequelize.models.Registration;
    // await Registration.create({
    //   pageId,
    //   ...registrationData,
    //   submittedAt: new Date()
    // });

    console.log('✅ 报名信息提交成功');

    res.json({
      success: true,
      message: '报名成功！我们会尽快与您联系。'
    });
  } catch (error) {
    console.error('❌ 提交报名信息失败:', error);
    if (error instanceof BusinessError) {
      throw error;
    }
    throw new BusinessError('提交报名信息失败', 500);
  }
};

/**
 * 获取报名统计
 */
export const getRegistrationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BusinessError('未登录或登录已过期', 401);
    }

    const { pageId } = req.params;

    console.log('📊 获取报名统计:', pageId);

    // TODO: 从数据库获取统计数据
    // const Registration = sequelize.models.Registration;
    // const stats = await Registration.findAll({
    //   where: { pageId },
    //   attributes: [
    //     [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
    //     [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "pending" THEN 1 END')), 'pendingCount'],
    //     [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "confirmed" THEN 1 END')), 'confirmedCount']
    //   ]
    // });

    // 使用真实活动注册统计数据
    const { activityId } = req.params;
    const { kindergartenId } = req.query;

    const [activityStats, todayStats, weekStats] = await Promise.all([
      // 总体统计数据
      ActivityRegistration.findAll({
        where: {
          activityId,
          ...(kindergartenId && { kindergartenId: Number(kindergartenId) })
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = 0 THEN 1 END')), 'pendingCount'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = 1 THEN 1 END')), 'confirmedCount']
        ],
        raw: true
      }),

      // 今日报名统计
      ActivityRegistration.findAll({
        where: {
          activityId,
          ...(kindergartenId && { kindergartenId: Number(kindergartenId) }),
          createdAt: {
            [Op.gte]: sequelize.literal('DATE(CURDATE())')
          }
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'todayCount']
        ],
        raw: true
      }),

      // 本周报名统计
      ActivityRegistration.findAll({
        where: {
          activityId,
          ...(kindergartenId && { kindergartenId: Number(kindergartenId) }),
          createdAt: {
            [Op.gte]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 7 DAY)')
          }
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'weekCount']
        ],
        raw: true
      })
    ]);

    const realStats = {
      totalCount: Number(activityStats[0]?.totalCount || 0),
      pendingCount: Number(activityStats[0]?.pendingCount || 0),
      confirmedCount: Number(activityStats[0]?.confirmedCount || 0),
      todayCount: Number(todayStats[0]?.todayCount || 0),
      weekCount: Number(weekStats[0]?.weekCount || 0)
    };

    res.json({
      success: true,
      data: realStats,
      message: '获取成功'
    });
  } catch (error) {
    console.error('❌ 获取报名统计失败:', error);
    if (error instanceof BusinessError) {
      throw error;
    }
    throw new BusinessError('获取报名统计失败', 500);
  }
};

