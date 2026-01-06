/**
 * 支付路由
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../../middlewares/auth.middleware';
// import { validateRequest } from '../../utils/validation';
import PaymentController from '../../controllers/payment/payment.controller';

const router = express.Router();

// 验证规则
const createOrderValidation = [
  body('activityId')
    .isInt({ min: 1 })
    .withMessage('活动ID必须是正整数'),
  body('type')
    .isIn(['registration', 'group_buy', 'collect_reward'])
    .withMessage('订单类型无效'),
  body('originalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('订单金额必须大于0.01元'),
  body('registrationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('报名ID必须是正整数'),
  body('groupBuyId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('团购ID必须是正整数'),
  body('collectActivityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('积攒活动ID必须是正整数'),
  body('discountAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('折扣金额不能为负数'),
  body('paymentMethod')
    .optional()
    .isIn(['wechat', 'alipay', 'bank'])
    .withMessage('支付方式无效'),
  body('remark')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('备注长度不能超过500字符'),
];

const initiatePaymentValidation = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('订单ID必须是正整数'),
  body('paymentMethod')
    .isIn(['wechat', 'alipay', 'bank'])
    .withMessage('支付方式无效'),
  body('returnURL')
    .optional()
    .isURL()
    .withMessage('回调URL格式无效'),
  body('notifyURL')
    .optional()
    .isURL()
    .withMessage('通知URL格式无效'),
];

const requestRefundValidation = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('订单ID必须是正整数'),
  body('refundReason')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('退款原因长度不能超过500字符'),
];

const getOrderListValidation = [
  query('activityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('活动ID必须是正整数'),
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'cancelled', 'refunded'])
    .withMessage('订单状态无效'),
  query('type')
    .optional()
    .isIn(['registration', 'group_buy', 'collect_reward'])
    .withMessage('订单类型无效'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
];

const orderIdValidation = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('订单ID必须是正整数'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 订单ID
 *         orderNo:
 *           type: string
 *           description: 订单号
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         activityId:
 *           type: integer
 *           description: 活动ID
 *         registrationId:
 *           type: integer
 *           description: 报名ID
 *         groupBuyId:
 *           type: integer
 *           description: 团购ID
 *         collectActivityId:
 *           type: integer
 *           description: 积攒活动ID
 *         type:
 *           type: string
 *           enum: [registration, group_buy, collect_reward]
 *           description: 订单类型
 *         originalAmount:
 *           type: number
 *           description: 原价
 *         discountAmount:
 *           type: number
 *           description: 折扣金额
 *         finalAmount:
 *           type: number
 *           description: 最终金额
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled, refunded]
 *           description: 订单状态
 *         paymentMethod:
 *           type: string
 *           enum: [wechat, alipay, bank]
 *           description: 支付方式
 *         paymentTime:
 *           type: string
 *           format: date-time
 *           description: 支付时间
 *         refundAmount:
 *           type: number
 *           description: 退款金额
 *         refundTime:
 *           type: string
 *           format: date-time
 *           description: 退款时间
 *         refundReason:
 *           type: string
 *           description: 退款原因
 *         remark:
 *           type: string
 *           description: 备注
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

/**
 * @swagger
 * /api/payment/order:
 *   post:
 *     summary: 创建订单
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *               - type
 *               - originalAmount
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               type:
 *                 type: string
 *                 enum: [registration, group_buy, collect_reward]
 *                 description: 订单类型
 *               originalAmount:
 *                 type: number
 *                 description: 原价
 *               registrationId:
 *                 type: integer
 *                 description: 报名ID
 *               groupBuyId:
 *                 type: integer
 *                 description: 团购ID
 *               collectActivityId:
 *                 type: integer
 *                 description: 积攒活动ID
 *               discountAmount:
 *                 type: number
 *                 description: 折扣金额
 *               paymentMethod:
 *                 type: string
 *                 enum: [wechat, alipay, bank]
 *                 description: 支付方式
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/order', authMiddleware, createOrderValidation, PaymentController.createOrder);

/**
 * @swagger
 * /api/payment/pay:
 *   post:
 *     summary: 发起支付
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *               paymentMethod:
 *                 type: string
 *                 enum: [wechat, alipay, bank]
 *                 description: 支付方式
 *               returnURL:
 *                 type: string
 *                 description: 支付完成回调URL
 *               notifyURL:
 *                 type: string
 *                 description: 支付通知URL
 *     responses:
 *       200:
 *         description: 发起支付成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: 支付参数
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/pay', authMiddleware, initiatePaymentValidation, PaymentController.initiatePayment);

/**
 * @swagger
 * /api/payment/wechat/notify:
 *   post:
 *     summary: 微信支付回调
 *     tags: [支付管理]
 *     description: 微信支付服务器回调接口
 *     responses:
 *       200:
 *         description: 处理成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               enum: [SUCCESS, FAIL]
 */
router.post('/wechat/notify', PaymentController.wechatPaymentNotify);

/**
 * @swagger
 * /api/payment/alipay/notify:
 *   post:
 *     summary: 支付宝回调
 *     tags: [支付管理]
 *     description: 支付宝服务器回调接口
 *     responses:
 *       200:
 *         description: 处理成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               enum: [success, failure]
 */
router.post('/alipay/notify', PaymentController.alipayPaymentNotify);

/**
 * @swagger
 * /api/payment/bank/notify:
 *   post:
 *     summary: 银行支付回调
 *     tags: [支付管理]
 *     description: 银行支付网关回调接口
 *     responses:
 *       200:
 *         description: 处理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/bank/notify', PaymentController.bankPaymentNotify);

/**
 * @swagger
 * /api/payment/refund:
 *   post:
 *     summary: 申请退款
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *               refundReason:
 *                 type: string
 *                 description: 退款原因
 *     responses:
 *       200:
 *         description: 退款申请成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/refund', authMiddleware, requestRefundValidation, PaymentController.requestRefund);

/**
 * @swagger
 * /api/payment/orders:
 *   get:
 *     summary: 获取订单列表
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, cancelled, refunded]
 *         description: 订单状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [registration, group_buy, collect_reward]
 *         description: 订单类型
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         description: 未授权
 */
router.get('/orders', authMiddleware, getOrderListValidation, PaymentController.getOrderList);

/**
 * @swagger
 * /api/payment/orders/{orderId}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权访问
 *       404:
 *         description: 订单不存在
 */
router.get('/orders/:orderId', authMiddleware, orderIdValidation, PaymentController.getOrderDetail);

/**
 * @swagger
 * /api/payment/orders/{orderId}/cancel:
 *   post:
 *     summary: 取消订单
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 取消成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 */
router.post('/orders/:orderId/cancel', authMiddleware, orderIdValidation, PaymentController.cancelOrder);

/**
 * @swagger
 * /api/payment/result:
 *   get:
 *     summary: 支付结果页面
 *     tags: [支付管理]
 *     parameters:
 *       - in: query
 *         name: orderNo
 *         required: true
 *         schema:
 *           type: string
 *         description: 订单号
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 支付状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderNo:
 *                       type: string
 *                     status:
 *                       type: string
 *                     redirectUrl:
 *                       type: string
 */
router.get('/result', PaymentController.paymentResult);

/**
 * @swagger
 * /api/payment/offline/confirm:
 *   post:
 *     summary: 确认线下支付
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *               paymentProof:
 *                 type: string
 *                 description: 支付凭证
 *     responses:
 *       200:
 *         description: 确认成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/offline/confirm', authMiddleware, PaymentController.confirmOfflinePayment);

/**
 * @swagger
 * /api/payment/offline/cancel:
 *   post:
 *     summary: 取消线下支付订单
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - reason
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: 订单ID
 *               reason:
 *                 type: string
 *                 description: 取消原因
 *     responses:
 *       200:
 *         description: 取消成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/offline/cancel', authMiddleware, PaymentController.cancelOfflinePayment);

/**
 * @swagger
 * /api/payment/offline/pending:
 *   get:
 *     summary: 获取待确认的线下支付订单列表
 *     tags: [支付管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/offline/pending', authMiddleware, PaymentController.getPendingOfflinePayments);

export default router;