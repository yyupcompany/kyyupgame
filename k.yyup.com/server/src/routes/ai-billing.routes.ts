import express, { Request, Response } from 'express';
import { aiBillingRecordService } from '../services/ai/ai-billing-record.service';
import { verifyToken } from '../middlewares/auth.middleware';
import { BillingStatus } from '../models/ai-billing-record.model';

const router = express.Router();

/**
 * 获取用户账单
 * GET /api/ai-billing/user/:userId/bill?cycle=2025-01
*/
router.get('/user/:userId/bill', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { cycle } = req.query;

    const bill = await aiBillingRecordService.getUserBill(
      Number(userId),
      cycle as string | undefined
    );

    res.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    console.error('[AI计费API] 获取用户账单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户账单失败',
      error: error.message,
    });
  }
});

/**
 * 获取当前用户账单
 * GET /api/ai-billing/my-bill?cycle=2025-01
*/
router.get('/my-bill', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { cycle } = req.query;

    const bill = await aiBillingRecordService.getUserBill(
      userId,
      cycle as string | undefined
    );

    res.json({
      success: true,
      data: bill,
    });
  } catch (error: any) {
    console.error('[AI计费API] 获取当前用户账单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取账单失败',
      error: error.message,
    });
  }
});

/**
 * 导出账单CSV
 * GET /api/ai-billing/user/:userId/export?cycle=2025-01
*/
router.get('/user/:userId/export', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { cycle, format } = req.query;

    if (format === 'csv') {
      const csv = await aiBillingRecordService.exportUserBillCSV(
        Number(userId),
        cycle as string
      );

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="bill_${userId}_${cycle || 'current'}.csv"`
      );
      res.send(csv);
    } else {
      res.status(400).json({
        success: false,
        message: '不支持的导出格式',
      });
    }
  } catch (error: any) {
    console.error('[AI计费API] 导出账单失败:', error);
    res.status(500).json({
      success: false,
      message: '导出账单失败',
      error: error.message,
    });
  }
});

/**
 * 获取计费统计
 * GET /api/ai-billing/statistics?startDate=2025-01-01&endDate=2025-01-31&period=monthly
*/
router.get('/statistics', verifyToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, period } = req.query;

    // 根据period参数计算日期范围
    let start: Date;
    let end: Date = new Date();

    if (period) {
      const now = new Date();
      switch (period) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarterly':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          start = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        case 'yearly':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    } else {
      start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      end = endDate ? new Date(endDate as string) : new Date();
    }

    const stats = await aiBillingRecordService.getBillingStatistics(start, end);

    res.json({
      success: true,
      data: {
        ...stats,
        period: period || 'custom',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[AI计费API] 获取计费统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message,
    });
  }
});

/**
 * 更新计费状态
 * PUT /api/ai-billing/record/:billingId/status
*/
router.put('/record/:billingId/status', verifyToken, async (req: Request, res: Response) => {
  try {
    const { billingId } = req.params;
    const { status, paymentTime } = req.body;

    if (!Object.values(BillingStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: '无效的计费状态',
      });
      return;
    }

    const success = await aiBillingRecordService.updateBillingStatus(
      Number(billingId),
      status as BillingStatus,
      paymentTime ? new Date(paymentTime) : undefined
    );

    if (success) {
      res.json({
        success: true,
        message: '计费状态更新成功',
      });
    } else {
      res.status(404).json({
        success: false,
        message: '计费记录不存在',
      });
    }
  } catch (error: any) {
    console.error('[AI计费API] 更新计费状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新计费状态失败',
      error: error.message,
    });
  }
});

/**
 * 批量更新计费状态
 * PUT /api/ai-billing/records/batch-status
*/
router.put('/records/batch-status', verifyToken, async (req: Request, res: Response) => {
  try {
    const { billingIds, status } = req.body;

    if (!Array.isArray(billingIds) || billingIds.length === 0) {
      res.status(400).json({
        success: false,
        message: '请提供计费记录ID列表',
      });
      return;
    }

    if (!Object.values(BillingStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: '无效的计费状态',
      });
      return;
    }

    const affectedCount = await aiBillingRecordService.batchUpdateBillingStatus(
      billingIds.map(Number),
      status as BillingStatus
    );

    res.json({
      success: true,
      message: `成功更新${affectedCount}条记录`,
      data: {
        affectedCount,
      },
    });
  } catch (error: any) {
    console.error('[AI计费API] 批量更新计费状态失败:', error);
    res.status(500).json({
      success: false,
      message: '批量更新失败',
      error: error.message,
    });
  }
});

/**
 * 获取用户计费趋势（按天/周/月）
 * GET /api/ai-billing/user/:userId/trend?period=monthly&months=6
*/
router.get('/user/:userId/trend', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { period = 'monthly', months = 6 } = req.query;

    // TODO: 实现趋势统计逻辑
    // 这里返回模拟数据，实际应从数据库聚合计算

    const mockTrendData = {
      period,
      data: Array.from({ length: Number(months) }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (Number(months) - 1 - i));
        return {
          date: date.toISOString().slice(0, 7),
          totalCost: Math.random() * 100,
          totalCalls: Math.floor(Math.random() * 1000),
        };
      }),
    };

    res.json({
      success: true,
      data: mockTrendData,
    });
  } catch (error: any) {
    console.error('[AI计费API] 获取计费趋势失败:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败',
      error: error.message,
    });
  }
});

export default router;

