/**
* 短信认证路由
* 验证码注册相关端点
*/

import { Router } from 'express';
import SmsProxyController from '../controllers/sms-proxy.controller';

const router = Router();

/**
* @swagger
* /auth/register-by-code:
*   post:
*     summary: 验证码注册
*     tags: [Authentication]
*     description: 使用短信验证码注册（代理到统一认证中心）
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - name
*               - phone
*               - verificationCode
*             properties:
*               name:
*                 type: string
*                 description: 姓名
*                 example: "张三"
*               phone:
*                 type: string
*                 description: 手机号
*                 example: "13812345678"
*               verificationCode:
*                 type: string
*                 description: 验证码
*                 example: "123456"
*               source:
*                 type: string
*                 description: 来源
*                 example: "group_buy"
*               referenceId:
*                 type: integer
*                 description: 关联ID（如团购ID）
*                 example: 101
*               inviteCode:
*                 type: string
*                 description: 邀请码
*                 example: "ABC123"
*     responses:
*       200:
*         description: 注册成功
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
*                   example: "注册成功"
*                 data:
*                   type: object
*                   properties:
*                     userId:
*                       type: integer
*                       example: 601
*                     token:
*                       type: string
*                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
*                     userInfo:
*                       type: object
*                       properties:
*                         id:
*                           type: integer
*                           example: 601
*                         name:
*                           type: string
*                           example: "张三"
*                         phone:
*                           type: string
*                           example: "138****5678"
*                         role:
*                           type: string
*                           example: "parent"
*                     autoJoinGroup:
*                       type: boolean
*                       example: true
*       400:
*         description: 请求参数错误或验证码错误
*       500:
*         description: 服务器错误
*/
router.post('/register-by-code', SmsProxyController.registerByCode);

export default router;
