import { AssessmentRecord } from '../../models/assessment-record.model';
import { User } from '../../models/user.model';
import { Op } from 'sequelize';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';

/**
 * 测评报告分享跟踪服务
 */
export class AssessmentShareService {
  /**
   * 记录分享行为
   */
  async recordShare(data: {
    recordId: number;
    userId?: number;
    shareChannel: 'wechat' | 'moments' | 'link' | 'qrcode';
    sharePlatform?: string;
  }): Promise<void> {
    try {
      // 先尝试更新，如果不存在则插入
      const result = await sequelize.query(`
        INSERT INTO assessment_share_logs (
          record_id, user_id, share_channel, share_platform, share_count, scan_count, conversion_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, 0, 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          share_count = share_count + 1,
          updated_at = NOW()
      `, {
        replacements: [
          data.recordId,
          data.userId || null,
          data.shareChannel,
          data.sharePlatform || null
        ],
        type: QueryTypes.INSERT
      }).catch(async (error: any) => {
        // 如果表不存在，创建记录（第一次分享）
        if (error.message?.includes("doesn't exist") || error.message?.includes("Table")) {
          // 表不存在，暂时跳过记录
          console.warn('分享日志表不存在，跳过记录');
          return [null, 0] as [any, number];
        }
        throw error;
      });
    } catch (error) {
      console.error('记录分享失败:', error);
      // 不抛出错误，避免影响用户体验
    }
  }

  /**
   * 记录扫描行为（通过分享链接/二维码访问）
   */
  async recordScan(data: {
    recordId: number;
    scannerId?: number;
    scannerPhone?: string;
    source: 'qrcode' | 'link';
    referrerUserId?: number;
  }): Promise<void> {
    try {
      await sequelize.query(`
        INSERT INTO assessment_scan_logs (
          record_id, scanner_id, scanner_phone, source, referrer_user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, {
        replacements: [
          data.recordId,
          data.scannerId || null,
          data.scannerPhone || null,
          data.source,
          data.referrerUserId || null
        ],
        type: QueryTypes.INSERT
      }).catch((error: any) => {
        // 表不存在时跳过
        if (error.message?.includes("doesn't exist") || error.message?.includes("Table")) {
          console.warn('扫描日志表不存在，跳过记录');
          return;
        }
        throw error;
      });

      // 更新分享统计
      if (data.referrerUserId) {
        await sequelize.query(`
          UPDATE assessment_share_logs
          SET scan_count = scan_count + 1,
              conversion_count = conversion_count + 1,
              updated_at = NOW()
          WHERE record_id = ? AND user_id = ?
        `, {
          replacements: [data.recordId, data.referrerUserId],
          type: QueryTypes.UPDATE
        }).catch(() => {
          // 表不存在时跳过
        });
      }
    } catch (error) {
      console.error('记录扫描失败:', error);
      // 不抛出错误，避免影响用户体验
    }
  }

  /**
   * 获取分享统计
   */
  async getShareStats(recordId: number, userId?: number): Promise<{
    shareCount: number;
    scanCount: number;
    conversionCount: number;
    rewardPoints: number;
    recentScans: Array<{
      scannerName: string;
      scanTime: Date;
      completed: boolean;
    }>;
  }> {
    try {
      const [stats] = await sequelize.query(`
        SELECT 
          COALESCE(SUM(share_count), 0) as share_count,
          COALESCE(SUM(scan_count), 0) as scan_count,
          COALESCE(SUM(conversion_count), 0) as conversion_count
        FROM assessment_share_logs
        WHERE record_id = ? ${userId ? 'AND user_id = ?' : ''}
      `, {
        replacements: userId ? [recordId, userId] : [recordId],
        type: QueryTypes.SELECT
      }).catch(() => {
        // 表不存在时返回默认值
        return [{ share_count: 0, scan_count: 0, conversion_count: 0 }];
      }) as any[];

      const [recentScans] = await sequelize.query(`
        SELECT 
          asl.scanner_id,
          asl.scanner_phone,
          asl.created_at,
          ar.status as completed
        FROM assessment_scan_logs asl
        LEFT JOIN assessment_records ar ON ar.id = asl.record_id
        WHERE asl.record_id = ? ${userId ? 'AND asl.referrer_user_id = ?' : ''}
        ORDER BY asl.created_at DESC
        LIMIT 10
      `, {
        replacements: userId ? [recordId, userId] : [recordId],
        type: QueryTypes.SELECT
      }).catch(() => {
        // 表不存在时返回空数组
        return [];
      }) as any[];

      // 计算奖励积分（每个完成测评的转化 = 10积分）
      const rewardPoints = (stats?.[0]?.conversion_count || 0) * 10;

      return {
        shareCount: stats?.[0]?.share_count || 0,
        scanCount: stats?.[0]?.scan_count || 0,
        conversionCount: stats?.[0]?.conversion_count || 0,
        rewardPoints,
        recentScans: recentScans.map(scan => ({
          scannerName: scan.scanner_phone || '匿名用户',
          scanTime: scan.created_at,
          completed: scan.completed === 'completed'
        }))
      };
    } catch (error) {
      console.error('获取分享统计失败:', error);
      return {
        shareCount: 0,
        scanCount: 0,
        conversionCount: 0,
        rewardPoints: 0,
        recentScans: []
      };
    }
  }

  /**
   * 获取用户分享奖励
   */
  async getUserShareRewards(userId: number): Promise<{
    totalShares: number;
    totalScans: number;
    totalConversions: number;
    totalRewardPoints: number;
    availableRewards: Array<{
      name: string;
      points: number;
      description: string;
    }>;
  }> {
    try {
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT asl.record_id) as total_shares,
          COALESCE(SUM(asl.scan_count), 0) as total_scans,
          COALESCE(SUM(asl.conversion_count), 0) as total_conversions
        FROM assessment_share_logs asl
        WHERE asl.user_id = ?
      `, {
        replacements: [userId],
        type: QueryTypes.SELECT
      }).catch(() => {
        // 表不存在时返回默认值
        return [{ total_shares: 0, total_scans: 0, total_conversions: 0 }];
      }) as any[];

      const totalRewardPoints = (stats?.[0]?.total_conversions || 0) * 10;

      // 可兑换奖励
      const availableRewards = [
        {
          name: '体验课优惠券',
          points: 50,
          description: '价值50元的体验课优惠券'
        },
        {
          name: '月度测评免费',
          points: 30,
          description: '免费进行一次月度测评'
        },
        {
          name: '课程资料包',
          points: 20,
          description: '获取专业课程资料包'
        }
      ];

      return {
        totalShares: stats?.[0]?.total_shares || 0,
        totalScans: stats?.[0]?.total_scans || 0,
        totalConversions: stats?.[0]?.total_conversions || 0,
        totalRewardPoints,
        availableRewards
      };
    } catch (error) {
      console.error('获取分享奖励失败:', error);
      // 返回默认值
      return {
        totalShares: 0,
        totalScans: 0,
        totalConversions: 0,
        totalRewardPoints: 0,
        availableRewards: []
      };
    }
  }
}

export default new AssessmentShareService();

