/**
 * 支付服务
 * 集成微信支付、支付宝等支付方式
 */

import { Order } from '../../models/order.model';
import { logger } from '../../utils/logger';
import { generateOrderNo } from '../../utils/code-generator';
import notificationService from '../system/notification.service';
import { NotificationType, NotificationStatus } from '../../models/notification.model';

export interface CreateOrderParams {
  userId: number;
  activityId: number;
  registrationId?: number;
  groupBuyId?: number;
  collectActivityId?: number;
  type: 'registration' | 'group_buy' | 'collect_reward';
  originalAmount: number;
  discountAmount?: number;
  paymentMethod?: 'wechat' | 'alipay' | 'bank' | 'offline';
  offlinePaymentContact?: string;
  offlinePaymentLocation?: string;
  offlinePaymentDeadline?: Date;
  remark?: string;
}

export interface PaymentParams {
  orderId: number;
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'offline';
  returnURL?: string;
  notifyURL?: string;
}

export interface OrderListParams {
  userId?: number;
  activityId?: number;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export class PaymentService {
  /**
   * 创建订单
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      const {
        userId,
        activityId,
        registrationId,
        groupBuyId,
        collectActivityId,
        type,
        originalAmount,
        discountAmount = 0,
        paymentMethod = 'wechat',
        remark
      } = params;

      const finalAmount = originalAmount - discountAmount;

      const order = await Order.create({
        orderNo: generateOrderNo(),
        userId,
        activityId,
        registrationId,
        groupBuyId,
        collectActivityId,
        type,
        originalAmount,
        discountAmount,
        finalAmount,
        status: 'pending',
        paymentMethod,
        offlinePaymentContact: params.offlinePaymentContact,
        offlinePaymentLocation: params.offlinePaymentLocation,
        offlinePaymentDeadline: params.offlinePaymentDeadline ? new Date(params.offlinePaymentDeadline) : undefined,
        remark,
      });

      logger.info('订单创建成功', {
        orderId: order.id,
        orderNo: order.orderNo,
        userId,
        finalAmount: order.finalAmount,
      });

      return order;
    } catch (error) {
      logger.error('创建订单失败', error);
      throw error;
    }
  }

  /**
   * 发起支付
   */
  async initiatePayment(params: PaymentParams): Promise<any> {
    try {
      const { orderId, paymentMethod, returnURL, notifyURL } = params;

      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.status !== 'pending') {
        throw new Error('订单状态不正确，无法支付');
      }

      // 根据支付方式生成支付参数
      let paymentParams: any = {};

      switch (paymentMethod) {
        case 'wechat':
          paymentParams = await this.generateWeChatPaymentParams(order, returnURL, notifyURL);
          break;
        case 'alipay':
          paymentParams = await this.generateAlipayPaymentParams(order, returnURL, notifyURL);
          break;
        case 'bank':
          paymentParams = await this.generateBankPaymentParams(order, returnURL, notifyURL);
          break;
        case 'offline':
          paymentParams = await this.generateOfflinePaymentParams(order);
          break;
        default:
          throw new Error('不支持的支付方式');
      }

      logger.info('发起支付', {
        orderId,
        orderNo: order.orderNo,
        paymentMethod,
        amount: order.finalAmount,
      });

      return paymentParams;
    } catch (error) {
      logger.error('发起支付失败', error);
      throw error;
    }
  }

  /**
   * 生成微信支付参数
   */
  private async generateWeChatPaymentParams(order: Order, returnURL?: string, notifyURL?: string): Promise<any> {
    // TODO: 集成微信支付SDK
    return {
      appId: process.env.WECHAT_APP_ID,
      partnerId: process.env.WECHAT_MCH_ID,
      prepayId: `wx${order.orderNo}`,
      package: 'Sign=WXPay',
      nonceStr: Math.random().toString(36).substr(2, 15),
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      sign: 'mock_sign',
    };
  }

  /**
   * 生成支付宝参数
   */
  private async generateAlipayPaymentParams(order: Order, returnURL?: string, notifyURL?: string): Promise<any> {
    // TODO: 集成支付宝SDK
    return {
      app_id: process.env.ALIPAY_APP_ID,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: Math.floor(Date.now() / 1000).toString(),
      version: '1.0',
      notify_url: notifyURL || `${process.env.API_URL}/api/payment/alipay/notify`,
      return_url: returnURL || `${process.env.FRONTEND_URL}/payment/result`,
      biz_content: JSON.stringify({
        out_trade_no: order.orderNo,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: (order.finalAmount * 100).toString(), // 支付宝金额单位为分
        subject: `订单${order.orderNo}`,
        body: order.getPaymentDescription(),
      }),
    };
  }

  /**
   * 生成银行支付参数
   */
  private async generateBankPaymentParams(order: Order, returnURL?: string, notifyURL?: string): Promise<any> {
    // TODO: 集成银行支付网关
    return {
      orderNo: order.orderNo,
      amount: order.finalAmount,
      currency: 'CNY',
      description: order.getPaymentDescription(),
      returnURL: returnURL || `${process.env.FRONTEND_URL}/payment/result`,
      notifyURL: notifyURL || `${process.env.API_URL}/api/payment/bank/notify`,
    };
  }

  /**
   * 生成线下支付参数
   */
  private async generateOfflinePaymentParams(order: Order): Promise<any> {
    return {
      orderNo: order.orderNo,
      amount: order.finalAmount,
      currency: 'CNY',
      description: order.getPaymentDescription(),
      paymentMethod: 'offline',
      offlinePaymentInfo: {
        contact: order.offlinePaymentContact || '请联系园区财务部门',
        location: order.offlinePaymentLocation || '幼儿园财务办公室',
        deadline: order.offlinePaymentDeadline,
        instructions: '请在线下支付截止时间前完成支付，支付完成后请联系工作人员确认'
      }
    };
  }

  /**
   * 确认线下支付
   */
  async confirmOfflinePayment(orderId: number, staffId: number, paymentProof?: string): Promise<Order> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (!order.canConfirmOfflinePayment()) {
        throw new Error('订单状态不支持线下支付确认');
      }

      // 更新订单状态
      await Order.update(
        {
          status: 'paid',
          paymentTime: new Date(),
          offlineConfirmStaffId: staffId,
          remark: paymentProof ? `线下支付确认，凭证：${paymentProof}` : '线下支付确认',
        },
        {
          where: { id: orderId },
        }
      );

      const updatedOrder = await Order.findByPk(orderId);

      if (!updatedOrder) {
        throw new Error('订单更新失败');
      }

      // 发送支付成功通知
      // await createNotification({
      //   userId: order.userId,
      //   type: 'payment_success',
      //   title: '线下支付确认成功',
      //   content: `您的订单 ${order.orderNo} 线下支付已确认，金额：¥${order.finalAmount}`,
      //   data: {
      //     orderId,
      //     orderNo: order.orderNo,
      //     amount: order.finalAmount,
      //     paymentMethod: 'offline',
      //   },
      // });

      // 触发后续业务逻辑
      await this.triggerPostPaymentActions(updatedOrder);

      logger.info('线下支付确认成功', {
        orderId,
        orderNo: order.orderNo,
        userId: order.userId,
        staffId,
        amount: order.finalAmount,
      });

      return updatedOrder;
    } catch (error) {
      logger.error('确认线下支付失败', error);
      throw error;
    }
  }

  /**
   * 取消线下支付订单
   */
  async cancelOfflinePayment(orderId: number, reason: string): Promise<void> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (!order.isOfflinePayment()) {
        throw new Error('非线下支付订单');
      }

      if (order.status !== 'pending') {
        throw new Error('订单状态不支持取消');
      }

      await Order.update(
        {
          status: 'cancelled',
          remark: `线下支付取消：${reason}`,
        },
        {
          where: { id: orderId },
        }
      );

      logger.info('取消线下支付订单成功', {
        orderId,
        orderNo: order.orderNo,
        reason,
      });
    } catch (error) {
      logger.error('取消线下支付订单失败', error);
      throw error;
    }
  }

  /**
   * 处理支付成功回调
   */
  async handlePaymentSuccess(orderId: number, paymentData: any, paymentMethod: string): Promise<void> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.status === 'paid') {
        logger.warn('订单已支付', {
          orderId,
          orderNo: order.orderNo,
        });
        return;
      }

      // 验证支付金额
      const paidAmount = this.extractPaidAmount(paymentData, paymentMethod);
      if (Math.abs(paidAmount - order.finalAmount) > 0.01) {
        throw new Error('支付金额不匹配');
      }

      // 更新订单状态
      await Order.update(
        {
          status: 'paid',
          paymentTime: new Date(),
        },
        {
          where: { id: orderId },
        }
      );

      // 发送支付成功通知
      // await createNotification({
      //   userId: order.userId,
      //   type: 'payment_success',
      //   title: '支付成功',
      //   content: `您的订单 ${order.orderNo} 支付成功，金额：¥${order.finalAmount}`,
      //   data: {
      //     orderId,
      //     orderNo: order.orderNo,
      //     amount: order.finalAmount,
      //   },
      // });

      // 触发后续业务逻辑
      await this.triggerPostPaymentActions(order);

      logger.info('支付成功', {
        orderId,
        orderNo: order.orderNo,
        userId: order.userId,
        amount: order.finalAmount,
        paymentMethod,
      });
    } catch (error) {
      logger.error('处理支付成功回调失败', error);
      throw error;
    }
  }

  /**
   * 处理支付失败回调
   */
  async handlePaymentFailure(orderId: number, errorCode: string, errorMessage: string, paymentMethod: string): Promise<void> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 更新订单状态为取消
      await Order.update(
        {
          status: 'cancelled',
          remark: `支付失败：${errorMessage}(${errorCode})`,
        },
        {
          where: { id: orderId },
        }
      );

      // 发送支付失败通知
      await notificationService.createNotification({
        userId: order.userId,
        type: NotificationType.MESSAGE,
        title: '支付失败',
        content: `您的订单 ${order.orderNo} 支付失败，原因：${errorMessage}`,
        status: NotificationStatus.UNREAD,
      });

      logger.error('支付失败', {
        orderId,
        orderNo: order.orderNo,
        userId: order.userId,
        errorCode,
        errorMessage,
        paymentMethod,
      });
    } catch (error) {
      logger.error('处理支付失败回调失败', error);
    }
  }

  /**
   * 申请退款
   */
  async requestRefund(orderId: number, refundReason?: string): Promise<Order> {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (!order.canRefund()) {
        throw new Error('订单状态不正确，无法退款');
      }

      // 根据支付方式申请退款
      let refundSuccess = false;
      let refundAmount = order.finalAmount;

      switch (order.paymentMethod) {
        case 'wechat':
          refundSuccess = await this.requestWeChatRefund(order, refundAmount, refundReason);
          break;
        case 'alipay':
          refundSuccess = await this.requestAlipayRefund(order, refundAmount, refundReason);
          break;
        case 'bank':
          refundSuccess = await this.requestBankRefund(order, refundAmount, refundReason);
          break;
        default:
          throw new Error('不支持的退款方式');
      }

      if (refundSuccess) {
        // 更新订单状态
        await Order.update(
          {
            status: 'refunded',
            refundAmount,
            refundTime: new Date(),
            refundReason,
          },
          {
            where: { id: orderId },
          }
        );

        // 发送退款成功通知
        // await createNotification({
        //   userId: order.userId,
        //   type: 'refund_success',
        //   title: '退款成功',
        //   content: `您的订单 ${order.orderNo} 退款成功，金额：¥${refundAmount}`,
        //   data: {
        //     orderId,
        //     orderNo: order.orderNo,
        //     refundAmount,
        //   },
        // });

        logger.info('退款成功', {
          orderId,
          orderNo: order.orderNo,
          refundAmount,
          refundReason,
        });
      }

      return order;
    } catch (error) {
      logger.error('申请退款失败', error);
      throw error;
    }
  }

  /**
   * 微信支付退款
   */
  private async requestWeChatRefund(order: Order, amount: number, reason?: string): Promise<boolean> {
    // TODO: 集成微信支付退款API
    logger.info('微信支付退款', {
      orderNo: order.orderNo,
      amount,
      reason,
    });
    return true; // 模拟成功
  }

  /**
   * 支付宝退款
   */
  private async requestAlipayRefund(order: Order, amount: number, reason?: string): Promise<boolean> {
    // TODO: 集成支付宝退款API
    logger.info('支付宝退款', {
      orderNo: order.orderNo,
      amount,
      reason,
    });
    return true; // 模拟成功
  }

  /**
   * 银行支付退款
   */
  private async requestBankRefund(order: Order, amount: number, reason?: string): Promise<boolean> {
    // TODO: 集成银行支付网关退款API
    logger.info('银行支付退款', {
      orderNo: order.orderNo,
      amount,
      reason,
    });
    return true; // 模拟成功
  }

  /**
   * 从支付数据中提取实际支付金额
   */
  private extractPaidAmount(paymentData: any, paymentMethod: string): number {
    switch (paymentMethod) {
      case 'wechat':
        return paymentData.total_fee / 100 || 0; // 微信支付金额单位为分
      case 'alipay':
        return parseFloat(paymentData.total_amount) || 0; // 支付宝金额单位为元
      case 'bank':
        return paymentData.amount || 0;
      default:
        return 0;
    }
  }

  /**
   * 触发支付后的业务逻辑
   */
  private async triggerPostPaymentActions(order: Order): Promise<void> {
    try {
      // 根据订单类型触发不同的业务逻辑
      switch (order.type) {
        case 'registration':
          await this.handleRegistrationPaymentSuccess(order);
          break;
        case 'group_buy':
          await this.handleGroupBuyPaymentSuccess(order);
          break;
        case 'collect_reward':
          await this.handleCollectRewardPaymentSuccess(order);
          break;
      }
    } catch (error) {
      logger.error('触发支付后业务逻辑失败', error);
    }
  }

  /**
   * 处理报名支付成功
   */
  private async handleRegistrationPaymentSuccess(order: Order): Promise<void> {
    // TODO: 更新报名状态为已支付
    if (order.registrationId) {
      logger.info('更新报名支付状态', {
        registrationId: order.registrationId,
        orderNo: order.orderNo,
      });
    }
  }

  /**
   * 处理团购支付成功
   */
  private async handleGroupBuyPaymentSuccess(order: Order): Promise<void> {
    // TODO: 更新团购成员支付状态
    if (order.groupBuyId) {
      logger.info('更新团购成员支付状态', {
        groupBuyId: order.groupBuyId,
        orderNo: order.orderNo,
        userId: order.userId,
      });
    }
  }

  /**
   * 处理积攒奖励支付成功
   */
  private async handleCollectRewardPaymentSuccess(order: Order): Promise<void> {
    // TODO: 处理积攒奖励逻辑
    logger.info('处理积攒奖励', {
      collectActivityId: order.collectActivityId,
      orderNo: order.orderNo,
      userId: order.userId,
    });
  }

  /**
   * 获取订单列表
   */
  async getOrderList(params: OrderListParams): Promise<{
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const { userId, activityId, status, type, page = 1, pageSize = 20 } = params;

      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (activityId) {
        where.activityId = activityId;
      }

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      const { rows, count } = await Order.findAndCountAll({
        where,
        include: [
          {
            model: require('../../models/activity.model').default,
            attributes: ['id', 'title'],
          },
          {
            model: require('../../models/user.model').default,
            attributes: ['id', 'name', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      return {
        items: rows,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('获取订单列表失败', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: number): Promise<Order> {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: require('../../models/activity.model').default,
            attributes: ['id', 'title', 'description'],
          },
          {
            model: require('../../models/user.model').default,
            attributes: ['id', 'name', 'phone', 'avatar'],
          },
        ],
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      return order;
    } catch (error) {
      logger.error('获取订单详情失败', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;