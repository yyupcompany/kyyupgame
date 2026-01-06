import express from 'express';
import { Sequelize, QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * components:
 *   schemas:
 *     CustomerStats:
 *       type: object
 *       properties:
 *         totalCustomers:
 *           type: integer
 *           description: 总客户数
 *         dealCustomers:
 *           type: integer
 *           description: 成交客户数
 *         intentionCustomers:
 *           type: integer
 *           description: 意向客户数
 *         conversionRate:
 *           type: number
 *           description: 转化率
*     
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户ID
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *         contactPhone:
 *           type: string
 *           description: 联系电话
 *         childName:
 *           type: string
 *           description: 孩子姓名
 *         status:
 *           type: string
 *           description: 客户状态
 *         source:
 *           type: string
 *           description: 客户来源
 *         consultDate:
 *           type: string
 *           description: 咨询时间
 *         nextFollowup:
 *           type: string
 *           description: 下次跟进时间
 *         remark:
 *           type: string
 *           description: 备注
*/

/**
* @swagger
 * /api/customers/stats:
 *   get:
 *     summary: 获取客户统计数据
 *     tags: [客户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomerStats'
*/
router.get('/stats', verifyToken, async (req, res) => {
  try {
    console.log('[CUSTOMER]: 📊 获取客户统计数据...');
    
    // 获取总客户数
    const [totalResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM enrollment_consultations WHERE deleted_at IS NULL',
      { type: QueryTypes.SELECT }
    );
    
    // 获取高意向客户数 (意向等级 >= 3)
    const [intentionResult] = await sequelize.query(
      'SELECT COUNT(*) as intention FROM enrollment_consultations WHERE deleted_at IS NULL AND intention_level >= 3',
      { type: QueryTypes.SELECT }
    );
    
    // 获取成交客户数 (跟进状态为已成交，假设状态值为5)
    const [dealResult] = await sequelize.query(
      'SELECT COUNT(*) as deal FROM enrollment_consultations WHERE deleted_at IS NULL AND followup_status = 5',
      { type: QueryTypes.SELECT }
    );
    
    const totalCustomers = (totalResult as any).total || 0;
    const intentionCustomers = (intentionResult as any).intention || 0;
    const dealCustomers = (dealResult as any).deal || 0;
    const conversionRate = totalCustomers > 0 ? ((dealCustomers / totalCustomers) * 100).toFixed(1) : '0.0';
    
    console.log(`[CUSTOMER]: ✅ 统计数据: 总客户${totalCustomers}, 意向客户${intentionCustomers}, 成交客户${dealCustomers}, 转化率${conversionRate}%`);
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        dealCustomers,
        intentionCustomers,
        conversionRate: parseFloat(conversionRate)
      }
    });
  } catch (error: any) {
    console.error('[CUSTOMER]: 获取客户统计数据失败:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

/**
* @swagger
 * /api/customers/list:
 *   get:
 *     summary: 获取客户列表
 *     tags: [客户管理]
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
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 客户姓名
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: 联系电话
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 客户状态
 *     responses:
 *       200:
 *         description: 成功获取客户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
*/
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, name = '', phone = '', status = '' } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    
    console.log(`[CUSTOMER]: 📋 获取客户列表: 页码${page}, 每页${pageSize}, 姓名"${name}", 电话"${phone}", 状态"${status}"`);
    
    // 构建查询条件
    let whereConditions = ['deleted_at IS NULL'];
    let replacements: any[] = [];
    
    if (name) {
      whereConditions.push('parent_name LIKE ?');
      replacements.push(`%${name}%`);
    }
    
    if (phone) {
      whereConditions.push('contact_phone LIKE ?');
      replacements.push(`%${phone}%`);
    }
    
    if (status) {
      // 根据状态映射到数据库字段
      if (status === 'intention') {
        whereConditions.push('intention_level >= 3');
      } else if (status === 'deal') {
        whereConditions.push('followup_status = 5');
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // 获取总数
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM enrollment_consultations WHERE ${whereClause}`,
      { replacements, type: QueryTypes.SELECT }
    );
    
    // 获取列表数据
    const listQuery = `
      SELECT 
        id,
        parent_name as parentName,
        contact_phone as contactPhone,
        child_name as childName,
        CASE 
          WHEN followup_status = 5 THEN '成交客户'
          WHEN intention_level >= 3 THEN '意向客户'
          ELSE '潜在客户'
        END as status,
        CASE source_channel
          WHEN 1 THEN '线上推广'
          WHEN 2 THEN '朋友推荐'
          WHEN 3 THEN '电话咨询'
          WHEN 4 THEN '现场咨询'
          ELSE '其他'
        END as source,
        consult_date as consultDate,
        next_followup_date as nextFollowup,
        remark,
        created_at as createdAt
      FROM enrollment_consultations 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const listResult = await sequelize.query(listQuery, {
      replacements: [...replacements, Number(pageSize), offset],
      type: QueryTypes.SELECT
    });
    
    const total = (countResult as any).total || 0;
    
    console.log(`[CUSTOMER]: ✅ 客户列表获取成功: 共${total}条记录, 当前页${listResult.length}条`);
    
    res.json({
      success: true,
      data: {
        list: listResult,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    });
  } catch (error: any) {
    console.error('[CUSTOMER]: 获取客户列表失败:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
