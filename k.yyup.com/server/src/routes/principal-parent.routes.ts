/**
* 园长开通家长账号路由
* 
* 功能：
* - 园长为本园学生开通家长账号
* - 批量导入家长
* - 查询本园家长列表
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as controller from '../controllers/principal-parent-register.controller';

const router = Router();

// 全局认证中间件
router.use(verifyToken);

/**
* @swagger
* /api/principal/parents/register:
*   post:
*     tags: [园长家长管理]
*     summary: 园长开通家长账号
*     description: 为本园学生创建家长账号
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - studentId
*               - realName
*               - phone
*             properties:
*               studentId:
*                 type: integer
*                 description: 学生ID
*               realName:
*                 type: string
*                 description: 家长姓名
*               phone:
*                 type: string
*                 description: 手机号
*               email:
*                 type: string
*                 description: 邮箱
*               relationship:
*                 type: string
*                 description: 与学生关系
*               isPrimaryContact:
*                 type: integer
*                 description: 是否主要联系人
*               isLegalGuardian:
*                 type: integer
*                 description: 是否法定监护人
*     responses:
*       200:
*         description: 创建成功
*       403:
*         description: 权限不足
*/
router.post('/register', controller.createParentByPrincipal);

export default router;
