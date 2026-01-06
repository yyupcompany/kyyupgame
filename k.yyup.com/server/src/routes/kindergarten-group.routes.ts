/**
* 幼儿园集团管理路由
* 
* 功能：
* - 总园长开通新分园
* - 管理分园列表
* - 为分园分配园长
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as controller from '../controllers/kindergarten-group.controller';

const router = Router();

// 全局认证中间件
router.use(verifyToken);

/**
* @swagger
* /api/kindergartens/branches:
*   post:
*     tags: [幼儿园集团管理]
*     summary: 总园长开通新分园
*     description: 创建新分园并分配园长账号
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - name
*               - address
*               - phone
*               - principalName
*               - principalPhone
*             properties:
*               name:
*                 type: string
*                 description: 分园名称
*               address:
*                 type: string
*                 description: 分园地址
*               phone:
*                 type: string
*                 description: 联系电话
*               principalName:
*                 type: string
*                 description: 园长姓名
*               principalPhone:
*                 type: string
*                 description: 园长手机号
*               initialPassword:
*                 type: string
*                 description: 园长初始密码（可选）
*               initialClassCount:
*                 type: integer
*                 description: 初始班级数量（可选）
*     responses:
*       200:
*         description: 创建成功
*       403:
*         description: 权限不足
*/
router.post('/branches', controller.createBranchKindergarten);

export default router;
