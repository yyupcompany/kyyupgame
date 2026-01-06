/**
* 园长开通教师账号路由
* 
* 功能：
* - 园长为本园开通教师账号
* - 批量导入教师
* - 查询本园教师列表
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import * as controller from '../controllers/principal-teacher-register.controller';

const router = Router();

// 全局认证中间件
router.use(verifyToken);

/**
* @swagger
* /api/principal/teachers/register:
*   post:
*     tags: [园长教师管理]
*     summary: 园长开通教师账号
*     description: 为本园创建教师账号
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - realName
*               - phone
*             properties:
*               realName:
*                 type: string
*                 description: 教师姓名
*               phone:
*                 type: string
*                 description: 手机号
*               email:
*                 type: string
*                 description: 邮箱
*               gender:
*                 type: string
*                 description: 性别
*               idCard:
*                 type: string
*                 description: 身份证号
*               education:
*                 type: string
*                 description: 学历
*               specialty:
*                 type: string
*                 description: 专业
*     responses:
*       200:
*         description: 创建成功
*       403:
*         description: 权限不足
*/
router.post('/register', controller.createTeacherByPrincipal);

export default router;
