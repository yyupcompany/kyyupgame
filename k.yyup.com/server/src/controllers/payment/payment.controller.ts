/**
 * 支付控制器
 * 处理支付相关的HTTP请求
 */

import { Request, Response } from 'express';
import { paymentService } from '../../services/payment/payment.service';
import { successResponse, errorResponse } from '../../utils/response-handler';
import { logger } from '../../utils/logger';
import { getClientIP } from '../../utils/ip';

export class PaymentController {
  /**
   * 创建订单
   * POST /api/payment/order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const {
        activityId,
        registrationId,
        groupBuyId,
        collectActivityId,
        type,
        originalAmount,
        discountAmount,
        paymentMethod,
        offlinePaymentContact,
        offlinePaymentLocation,
        offlinePaymentDeadline,
        remark
      } = req.body;

      // 参数验证
      if (!activityId || !type || !originalAmount) {
        return errorResponse(res, '活动ID、订单类型和订单金额不能为空');
      }

      if (!['registration', 'group_buy', 'collect_reward'].includes(type)) {
        return errorResponse(res, '订单类型无效');
      }

      if (originalAmount <= 0) {
        return errorResponse(res, '订单金额必须大于0');
      }

      // 线下支付特殊验证
      if (paymentMethod === 'offline') {
        if (!offlinePaymentContact && !offlinePaymentLocation) {
          return errorResponse(res, '线下支付必须提供联系方式或支付地点');
        }
      }

      const order = await paymentService.createOrder({
        userId,
        activityId,
        registrationId,
        groupBuyId,
        collectActivityId,
        type,
        originalAmount,
        discountAmount,
        paymentMethod,
        remark,
      });

      logger.info('创建订单成功', {
        userId,
        orderId: order.id,
        orderNo: order.orderNo,
        type,
        finalAmount: order.finalAmount,
      });

      successResponse(res, {
        message: '创建订单成功',
        data: order,
      });
    } catch (error: any) {
      logger.error('创建订单失败', error);
      errorResponse(res, error.message || '创建订单失败');
    }
  }

  /**
   * 发起支付
   * POST /api/payment/pay
   */
  static async initiatePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId, paymentMethod, returnURL, notifyURL } = req.body;

      // 参数验证
      if (!orderId || !paymentMethod) {
        return errorResponse(res, '订单ID和支付方式不能为空');
      }

      if (!['wechat', 'alipay', 'bank'].includes(paymentMethod)) {
        return errorResponse(res, '支付方式无效');
      }

      const paymentParams = await paymentService.initiatePayment({
        orderId,
        paymentMethod,
        returnURL,
        notifyURL,
      });

      logger.info('发起支付成功', {
        userId,
        orderId,
        paymentMethod,
      });

      successResponse(res, {
        message: '发起支付成功',
        data: paymentParams,
      });
    } catch (error: any) {
      logger.error('发起支付失败', error);
      errorResponse(res, error.message || '发起支付失败');
    }
  }

  /**
   * 微信支付回调
   * POST /api/payment/wechat/notify
   */
  static async wechatPaymentNotify(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;
      const orderId = paymentData.out_trade_no ? parseInt(paymentData.out_trade_no.replace('ORDER', '')) : null;

      if (!orderId) {
        logger.error('微信支付回调：无法解析订单ID', paymentData);
        res.status(400).send('FAIL');
        return;
      }

      // TODO: 验证微信支付签名

      await paymentService.handlePaymentSuccess(
        orderId,
        paymentData,
        'wechat'
      );

      logger.info('微信支付回调处理成功', { orderId });
      res.status(200).send('SUCCESS');
    } catch (error: any) {
      logger.error('微信支付回调处理失败', error);
      res.status(500).send('FAIL');
    }
  }

  /**
   * 支付宝回调
   * POST /api/payment/alipay/notify
   */
  static async alipayPaymentNotify(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;
      const orderId = paymentData.out_trade_no ? parseInt(paymentData.out_trade_no) : null;

      if (!orderId) {
        logger.error('支付宝回调：无法解析订单ID', paymentData);
        res.status(400).send('failure');
        return;
      }

      // TODO: 验证支付宝签名

      await paymentService.handlePaymentSuccess(
        orderId,
        paymentData,
        'alipay'
      );

      logger.info('支付宝回调处理成功', { orderId });
      res.status(200).send('success');
    } catch (error: any) {
      logger.error('支付宝回调处理失败', error);
      res.status(500).send('failure');
    }
  }

  /**
   * 银行支付回调
   * POST /api/payment/bank/notify
   */
  static async bankPaymentNotify(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;
      const { orderId, status, amount } = paymentData;

      if (!orderId || !status) {
        logger.error('银行支付回调：缺少必要参数', paymentData);
        return errorResponse(res, '缺少必要参数', 400);
      }

      if (status === 'success') {
        await paymentService.handlePaymentSuccess(
          parseInt(orderId),
          paymentData,
          'bank'
        );
      } else {
        await paymentService.handlePaymentFailure(
          parseInt(orderId),
          paymentData.errorCode || 'UNKNOWN',
          paymentData.errorMessage || '支付失败',
          'bank'
        );
      }

      logger.info('银行支付回调处理成功', { orderId, status });
      successResponse(res, { message: '回调处理成功' });
    } catch (error: any) {
      logger.error('银行支付回调处理失败', error);
      errorResponse(res, error.message || '回调处理失败');
    }
  }

  /**
   * 申请退款
   * POST /api/payment/refund
   */
  static async requestRefund(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId, refundReason } = req.body;

      // 参数验证
      if (!orderId) {
        return errorResponse(res, '订单ID不能为空');
      }

      const order = await paymentService.requestRefund(
        parseInt(orderId),
        refundReason
      );

      logger.info('申请退款成功', {
        userId,
        orderId,
        refundAmount: order.refundAmount,
      });

      successResponse(res, {
        message: '退款申请已提交',
        data: order,
      });
    } catch (error: any) {
      logger.error('申请退款失败', error);
      errorResponse(res, error.message || '申请退款失败');
    }
  }

  /**
   * 获取订单列表
   * GET /api/payment/orders
   */
  static async getOrderList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const {
        activityId,
        status,
        type,
        page = 1,
        pageSize = 20
      } = req.query;

      const result = await paymentService.getOrderList({
        userId,
        activityId: activityId ? parseInt(activityId as string) : undefined,
        status: status as string,
        type: type as string,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      successResponse(res, {
        message: '获取订单列表成功',
        data: result,
      });
    } catch (error: any) {
      logger.error('获取订单列表失败', error);
      errorResponse(res, error.message || '获取订单列表失败');
    }
  }

  /**
   * 获取订单详情
   * GET /api/payment/orders/:orderId
   */
  static async getOrderDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId } = req.params;

      if (!orderId) {
        return errorResponse(res, '订单ID不能为空');
      }

      const order = await paymentService.getOrderDetail(parseInt(orderId));

      // 验证订单归属
      if (order.userId !== userId) {
        return errorResponse(res, '无权访问该订单', 403);
      }

      successResponse(res, {
        message: '获取订单详情成功',
        data: order,
      });
    } catch (error: any) {
      logger.error('获取订单详情失败', error);
      errorResponse(res, error.message || '获取订单详情失败');
    }
  }

  /**
   * 取消订单
   * POST /api/payment/orders/:orderId/cancel
   */
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId } = req.params;

      if (!orderId) {
        return errorResponse(res, '订单ID不能为空');
      }

      // TODO: 实现取消订单逻辑
      // 检查订单状态、更新状态、处理退款等

      logger.info('取消订单', {
        userId,
        orderId: parseInt(orderId),
      });

      successResponse(res, {
        message: '订单已取消',
      });
    } catch (error: any) {
      logger.error('取消订单失败', error);
      errorResponse(res, error.message || '取消订单失败');
    }
  }

  /**
   * 支付结果页面
   * GET /api/payment/result
   */
  static async paymentResult(req: Request, res: Response): Promise<void> {
    try {
      const { orderNo, status } = req.query;

      if (!orderNo) {
        return errorResponse(res, '订单号不能为空');
      }

      // TODO: 根据订单号查询订单状态
      // 返回支付结果页面数据

      successResponse(res, {
        message: '获取支付结果成功',
        data: {
          orderNo,
          status,
          redirectUrl: `${process.env.FRONTEND_URL}/payment/result?orderNo=${orderNo}&status=${status}`,
        },
      });
    } catch (error: any) {
      logger.error('获取支付结果失败', error);
      errorResponse(res, error.message || '获取支付结果失败');
    }
  }

  /**
   * 确认线下支付
   * POST /api/payment/offline/confirm
   */
  static async confirmOfflinePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId, paymentProof } = req.body;

      // 参数验证
      if (!orderId) {
        return errorResponse(res, '订单ID不能为空');
      }

      // 这里应该检查用户是否有权限确认线下支付（比如管理员或财务人员）
      // 暂时使用登录用户ID作为员工ID
      const staffId = userId;

      const order = await paymentService.confirmOfflinePayment(
        parseInt(orderId),
        staffId,
        paymentProof
      );

      logger.info('确认线下支付成功', {
        userId,
        staffId,
        orderId: parseInt(orderId),
      });

      successResponse(res, {
        message: '线下支付确认成功',
        data: order,
      });
    } catch (error: any) {
      logger.error('确认线下支付失败', error);
      errorResponse(res, error.message || '确认线下支付失败');
    }
  }

  /**
   * 取消线下支付订单
   * POST /api/payment/offline/cancel
   */
  static async cancelOfflinePayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { orderId, reason } = req.body;

      // 参数验证
      if (!orderId || !reason) {
        return errorResponse(res, '订单ID和取消原因不能为空');
      }

      await paymentService.cancelOfflinePayment(
        parseInt(orderId),
        reason
      );

      logger.info('取消线下支付订单成功', {
        userId,
        orderId: parseInt(orderId),
        reason,
      });

      successResponse(res, {
        message: '取消线下支付订单成功',
      });
    } catch (error: any) {
      logger.error('取消线下支付订单失败', error);
      errorResponse(res, error.message || '取消线下支付订单失败');
    }
  }

  /**
   * 获取待确认的线下支付订单列表
   * GET /api/payment/offline/pending
   */
  static async getPendingOfflinePayments(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return errorResponse(res, '用户未登录', 401);
      }

      const { page = 1, pageSize = 20 } = req.query;

      const result = await paymentService.getOrderList({
        userId, // 这里应该根据权限过滤，管理员可看所有，用户只看自己的
        status: 'pending',
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
      });

      // 过滤出线下支付的订单
      const offlineOrders = result.items.filter(order => order.paymentMethod === 'offline');

      successResponse(res, {
        message: '获取待确认线下支付订单成功',
        data: {
          ...result,
          items: offlineOrders,
          total: offlineOrders.length,
        },
      });
    } catch (error: any) {
      logger.error('获取待确认线下支付订单失败', error);
      errorResponse(res, error.message || '获取待确认线下支付订单失败');
    }
  }
}

export default PaymentController;