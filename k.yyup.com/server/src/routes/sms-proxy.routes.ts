/**
* 短信代理路由
* 将租户系统的短信请求代理到统一认证中心
*/

import { Router } from 'express';
import SmsProxyController from '../controllers/sms-proxy.controller';

const router = Router();

/**
* @swagger
* /sms/send-code:
*   post:
*     summary: 发送短信验证码
*     tags: [SMS]
*     description: 发送短信验证码（代理到统一认证中心）
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - phone
*               - type
*             properties:
*               phone:
*                 type: string
*                 description: 手机号
*                 example: "13812345678"
*               type:
*                 type: string
*                 enum: [register, login, group_buy_register]
*                 description: 验证码类型
*                 example: "group_buy_register"
*               scene:
*                 type: string
*                 description: 场景描述
*                 example: "陌生用户拼团注册"
*     responses:
*       200:
*         description: 验证码发送成功
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "验证码已发送"
*                 data:
*                   type: object
*                   properties:
*                     expiresIn:
*                       type: integer
*                       description: 有效期（秒）
*                       example: 300
*                     canResendIn:
*                       type: integer
*                       description: 下次可发送时间（秒）
*                       example: 60
*       400:
*         description: 请求参数错误
*       500:
*         description: 服务器错误
*/
router.post('/send-code', SmsProxyController.sendVerificationCode);

/**
* @swagger
* /sms/verify-code:
*   post:
*     summary: 验证短信验证码
*     tags: [SMS]
*     description: 验证短信验证码（代理到统一认证中心）
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - phone
*               - code
*             properties:
*               phone:
*                 type: string
*                 description: 手机号
*                 example: "13812345678"
*               code:
*                 type: string
*                 description: 验证码
*                 example: "123456"
*               type:
*                 type: string
*                 enum: [register, login, group_buy_register]
*                 description: 验证码类型
*                 example: "group_buy_register"
*     responses:
*       200:
*         description: 验证成功
*       400:
*         description: 验证码错误
*       500:
*         description: 服务器错误
*/
router.post('/verify-code', SmsProxyController.verifyCode);

export default router;
