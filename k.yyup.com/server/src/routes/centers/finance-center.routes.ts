/**
 * 财务中心路由
 * 提供幼儿园财务管理相关的API接口，包括收费项目、缴费记录、财务报表等功能
 * 支持多维度财务数据统计和分析，为幼儿园管理者提供全面的财务决策支持
 */

import { Router } from 'express';
import { FinanceCenterController } from '../../controllers/centers/finance-center.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     FeeItem:
 *       type: object
 *       description: 收费项目信息
 *       properties:
 *         id:
 *           type: string
 *           description: 收费项目ID
 *           example: "1"
 *         name:
 *           type: string
 *           description: 收费项目名称
 *           example: "学费"
 *         category:
 *           type: string
 *           description: 收费类别
 *           enum: [学费, 杂费, 餐费, 住宿费, 活动费, 材料费, 其他]
 *           example: "学费"
 *         amount:
 *           type: number
 *           description: 收费金额（元）
 *           minimum: 0
 *           example: 3000.00
 *         period:
 *           type: string
 *           description: 收费周期
 *           enum: [月度, 季度, 半年, 年度, 一次性]
 *           example: "月度"
 *         isRequired:
 *           type: boolean
 *           description: 是否必缴项目
 *           example: true
 *         description:
 *           type: string
 *           description: 项目描述
 *           example: "基础教育费用"
 *         status:
 *           type: string
 *           description: 项目状态
 *           enum: [active, inactive]
 *           example: "active"
 *       required:
 *         - id
 *         - name
 *         - category
 *         - amount
 *         - period
 *         - isRequired
 *         - status

 *     PaymentRecord:
 *       type: object
 *       description: 缴费记录信息
 *       properties:
 *         id:
 *           type: string
 *           description: 缴费记录ID
 *           example: "1"
 *         billId:
 *           type: string
 *           description: 缴费单ID
 *           example: "1"
 *         billNo:
 *           type: string
 *           description: 缴费单号
 *           example: "FEE-2025-001"
 *         studentName:
 *           type: string
 *           description: 学生姓名
 *           example: "张三"
 *         className:
 *           type: string
 *           description: 班级名称
 *           example: "大班A组"
 *         feeItems:
 *           type: array
 *           description: 缴费项目列表
 *           items:
 *             type: string
 *           example: ["学费", "餐费"]
 *         paymentAmount:
 *           type: number
 *           description: 缴费金额（元）
 *           minimum: 0
 *           example: 3500.00
 *         paymentDate:
 *           type: string
 *           format: date
 *           description: 缴费日期
 *           example: "2025-01-15"
 *         paymentMethod:
 *           type: string
 *           description: 支付方式
 *           enum: [现金, 银行转账, 支付宝, 微信支付, 刷卡]
 *           example: "支付宝"
 *         transactionNo:
 *           type: string
 *           description: 交易号
 *           example: "202501152000123456789"
 *         receiptNo:
 *           type: string
 *           description: 收据号
 *           example: "RCP-2025-001"
 *         payerName:
 *           type: string
 *           description: 缴费人姓名
 *           example: "张父"
 *         payerPhone:
 *           type: string
 *           description: 缴费人电话
 *           example: "13800138000"
 *         status:
 *           type: string
 *           description: 缴费状态
 *           enum: [pending, processing, success, failed, refunded]
 *           example: "success"
 *         remarks:
 *           type: string
 *           description: 备注信息
 *           example: "正常缴费"
 *       required:
 *         - id
 *         - billId
 *         - studentName
 *         - paymentAmount
 *         - paymentDate
 *         - paymentMethod
 *         - status

 *     FinancialReport:
 *       type: object
 *       description: 财务报表数据
 *       properties:
 *         monthlyIncome:
 *           type: object
 *           description: 月度收入分析
 *           properties:
 *             current:
 *               type: number
 *               description: 当月收入
 *               example: 150000
 *             previous:
 *               type: number
 *               description: 上月收入
 *               example: 135000
 *             growth:
 *               type: number
 *               description: 增长率（%）
 *               example: 11.1
 *         feeCollection:
 *           type: object
 *           description: 收费完成率分析
 *           properties:
 *             collected:
 *               type: number
 *               description: 已收缴比例
 *               example: 85.5
 *             pending:
 *               type: number
 *               description: 待收缴比例
 *               example: 14.5
 *         categoryBreakdown:
 *           type: array
 *           description: 费用类别分析
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 费用类别
 *                 example: "学费"
 *               amount:
 *                 type: number
 *                 description: 收费金额
 *                 example: 120000
 *               percentage:
 *                 type: number
 *                 description: 占总收入比例
 *                 example: 80.0
 *       required:
 *         - monthlyIncome
 *         - feeCollection
 *         - categoryBreakdown

 *     EnrollmentFinanceData:
 *       type: object
 *       description: 招生财务联动数据
 *       properties:
 *         enrollmentFees:
 *           type: object
 *           description: 招生费用统计
 *           properties:
 *             registrationFee:
 *               type: number
 *               description: 报名费收入
 *               example: 5000
 *             depositFee:
 *               type: number
 *               description: 押金收入
 *               example: 30000
 *             totalCollected:
 *               type: number
 *               description: 总计收入
 *               example: 35000
 *         newStudentPayments:
 *           type: array
 *           description: 新生缴费记录
 *           items:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *                 example: "小明"
 *               enrollmentDate:
 *                 type: string
 *                 format: date
 *                 description: 报名日期
 *                 example: "2025-01-10"
 *               feesCollected:
 *                 type: number
 *                 description: 已收费用
 *                 example: 3500
 *               status:
 *                 type: string
 *                 description: 缴费状态
 *                 enum: [completed, partial, pending]
 *                 example: "completed"
 *       required:
 *         - enrollmentFees
 *         - newStudentPayments

 *     TodayPaymentSummary:
 *       type: object
 *       description: 今日缴费汇总
 *       properties:
 *         todayAmount:
 *           type: number
 *           description: 今日缴费总额
 *           example: 25500
 *         todayCount:
 *           type: number
 *           description: 今日缴费笔数
 *           example: 15
 *         payments:
 *           type: array
 *           description: 今日缴费记录
 *           items:
 *             $ref: '#/components/schemas/PaymentRecord'
 *       required:
 *         - todayAmount
 *         - todayCount
 *         - payments

 */

/**
 * @swagger
 * /api/centers/finance/fee-items:
 *   get:
 *     summary: 获取收费项目列表
 *     description: |
 *       获取幼儿园所有收费项目列表，支持按类别和状态筛选。
 *
 *       **业务场景**：
 *       - 财务人员查看所有可收费项目
 *       - 为学生生成缴费单时选择收费项目
 *       - 管理员配置收费标准
 *
 *       **权限要求**：需要财务管理权限
 *
 *       **筛选条件**：
 *       - `category`: 按收费类别筛选（学费、杂费、餐费等）
 *       - `status`: 按状态筛选（active/inactive）
 *
 *       **返回结果**：按类别和名称排序的收费项目列表
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [学费, 杂费, 餐费, 住宿费, 活动费, 材料费, 其他]
 *         description: 收费类别筛选
 *         example: "学费"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           default: "active"
 *         description: 项目状态筛选
 *         example: "active"
 *     responses:
 *       200:
 *         description: 收费项目列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeeItem'
 *                 message:
 *                   type: string
 *                   example: "获取收费项目成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "1"
 *                       name: "学费"
 *                       category: "学费"
 *                       amount: 3000
 *                       period: "月度"
 *                       isRequired: true
 *                       description: "基础教育费用"
 *                       status: "active"
 *                     - id: "2"
 *                       name: "餐费"
 *                       category: "餐费"
 *                       amount: 500
 *                       period: "月度"
 *                       isRequired: true
 *                       description: "每日餐食费用"
 *                       status: "active"
 *                   message: "获取收费项目成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "权限不足"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "获取收费项目失败"
 *                 error:
 *                   type: string
 *                   example: "数据库连接错误"
 */
router.get('/fee-items', FinanceCenterController.getFeeItems);

/**
 * @swagger
 * /api/centers/finance/payment-records:
 *   get:
 *     summary: 获取缴费记录列表
 *     description: |
 *       获取幼儿园缴费记录列表，支持多条件筛选和分页查询。
 *
 *       **业务场景**：
 *       - 财务人员查询缴费记录
 *       - 生成缴费报表和统计
 *       - 追查缴费问题和异常
 *
 *       **权限要求**：需要财务管理权限
 *
 *       **查询功能**：
 *       - 支持按缴费状态筛选（待缴费、已缴费、退款等）
 *       - 支持按学生姓名模糊查询
 *       - 支持按时间范围查询
 *       - 支持分页浏览大量数据
 *
 *       **关联数据**：自动关联缴费单信息，显示学生详情
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页记录数
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, success, failed, refunded]
 *         description: 缴费状态筛选
 *         example: "success"
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名模糊查询
 *         example: "张"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *         example: "2025-01-31"
 *     responses:
 *       200:
 *         description: 缴费记录列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PaymentRecord'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: 每页记录数
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 156
 *                         totalPages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 16
 *                 message:
 *                   type: string
 *                   example: "获取缴费记录成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     records:
 *                       - id: "1"
 *                         billId: "1"
 *                         billNo: "FEE-2025-001"
 *                         studentName: "张三"
 *                         className: "大班A组"
 *                         feeItems: ["学费", "餐费"]
 *                         paymentAmount: 3500
 *                         paymentDate: "2025-01-15"
 *                         paymentMethod: "支付宝"
 *                         transactionNo: "202501152000123456789"
 *                         receiptNo: "RCP-2025-001"
 *                         payerName: "张父"
 *                         payerPhone: "13800138000"
 *                         status: "success"
 *                         remarks: "正常缴费"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 156
 *                       totalPages: 16
 *                   message: "获取缴费记录成功"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/payment-records', FinanceCenterController.getPaymentRecords);

/**
 * @swagger
 * /api/centers/finance/reports:
 *   get:
 *     summary: 获取财务报表数据
 *     description: |
 *       获取幼儿园财务报表数据，包括收入分析、收费完成率和费用类别分析。
 *
 *       **业务场景**：
 *       - 园长查看月度财务状况
 *       - 财务人员生成财务报表
 *       - 管理层分析收入结构和趋势
 *
 *       **权限要求**：需要财务管理权限
 *
 *       **报表内容**：
 *       - 月度收入对比（当月vs上月）
 *       - 收费完成率统计
 *       - 费用类别收入分析
 *       - 支持自定义时间范围查询
 *
 *       **数据分析**：
 *       - 自动计算收入增长率
 *       - 统计各费用类别占比
 *       - 识别主要收入来源
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 报表开始日期（不指定则默认为当月1日）
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 报表结束日期（不指定则默认为当月最后一天）
 *         example: "2025-01-31"
 *     responses:
 *       200:
 *         description: 财务报表数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FinancialReport'
 *                 message:
 *                   type: string
 *                   example: "获取财务报表成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     monthlyIncome:
 *                       current: 150000
 *                       previous: 135000
 *                       growth: 11.1
 *                     feeCollection:
 *                       collected: 85.5
 *                       pending: 14.5
 *                     categoryBreakdown:
 *                       - category: "学费"
 *                         amount: 120000
 *                         percentage: 80.0
 *                       - category: "餐费"
 *                         amount: 30000
 *                         percentage: 20.0
 *                   message: "获取财务报表成功"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/reports', FinanceCenterController.getFinancialReports);

/**
 * @swagger
 * /api/centers/finance/enrollment-finance:
 *   get:
 *     summary: 获取招生财务联动数据
 *     description: |
 *       获取招生与财务的联动分析数据，包括报名费、押金收入和新生缴费情况。
 *
 *       **业务场景**：
 *       - 招生部门查看招生带来的财务收益
 *       - 财务部门追踪新生缴费情况
 *       - 管理层分析招生效果和经济收益
 *
 *       **权限要求**：需要招生和财务管理权限
 *
 *       **数据维度**：
 *       - 招生费用统计（报名费、押金等）
 *       - 新生缴费记录和状态
 *       - 招生转化率分析
 *       - 时间趋势分析
 *
 *       **关键指标**：
 *       - 报名费收入统计
 *       - 押金收入统计
 *       - 新生缴费完成率
 *       - 平均新生缴费金额
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 查询开始日期（不指定则默认为当月1日）
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 查询结束日期（不指定则默认为当月最后一天）
 *         example: "2025-01-31"
 *     responses:
 *       200:
 *         description: 招生财务联动数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentFinanceData'
 *                 message:
 *                   type: string
 *                   example: "获取招生财务联动数据成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     enrollmentFees:
 *                       registrationFee: 5000
 *                       depositFee: 30000
 *                       totalCollected: 35000
 *                     newStudentPayments:
 *                       - studentName: "小明"
 *                         enrollmentDate: "2025-01-10"
 *                         feesCollected: 3500
 *                         status: "completed"
 *                       - studentName: "小红"
 *                         enrollmentDate: "2025-01-12"
 *                         feesCollected: 3000
 *                         status: "partial"
 *                   message: "获取招生财务联动数据成功"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/enrollment-finance', FinanceCenterController.getEnrollmentFinanceData);

/**
 * @swagger
 * /api/centers/finance/overview:
 *   get:
 *     summary: 获取财务概览数据
 *     description: |
 *       获取财务中心首页概览数据，包括关键财务指标和趋势分析。
 *
 *       **业务场景**：
 *       - 财务中心仪表板显示
 *       - 快速了解财务状况
 *       - 关键指标实时监控
 *
 *       **权限要求**：需要财务管理权限
 *
 *       **核心指标**：
 *       - 月度收入和增长率
 *       - 待缴费金额和笔数
 *       - 收费完成率统计
 *       - 逾期缴费监控
 *
 *       **数据用途**：
 *       - 财务仪表板展示
 *       - 管理层决策支持
 *       - 财务健康度评估
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 财务概览数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthlyRevenue:
 *                       type: number
 *                       description: 本月收入（元）
 *                       example: 150000
 *                     revenueGrowth:
 *                       type: number
 *                       description: 收入增长率（%）
 *                       example: 11.1
 *                     pendingAmount:
 *                       type: number
 *                       description: 待缴费金额（元）
 *                       example: 25000
 *                     pendingCount:
 *                       type: number
 *                       description: 待缴费笔数
 *                       example: 15
 *                     collectionRate:
 *                       type: number
 *                       description: 收费完成率（%）
 *                       example: 85.5
 *                     paidCount:
 *                       type: number
 *                       description: 已缴费笔数
 *                       example: 85
 *                     totalCount:
 *                       type: number
 *                       description: 总缴费单数
 *                       example: 100
 *                     overdueAmount:
 *                       type: number
 *                       description: 逾期金额（元）
 *                       example: 5000
 *                     overdueCount:
 *                       type: number
 *                       description: 逾期笔数
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: "获取财务概览成功"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */

/**
 * @swagger
 * /api/centers/finance/today-payments:
 *   get:
 *     summary: 获取今日缴费数据
 *     description: |
 *       获取当日缴费汇总数据和详细记录，用于实时监控缴费情况。
 *
 *       **业务场景**：
 *       - 财务人员查看当日缴费情况
 *       - 实时监控缴费进度
 *       - 生成日报数据
 *
 *       **权限要求**：需要财务管理权限
 *
 *       **数据内容**：
 *       - 今日缴费总额和笔数
 *       - 今日缴费详细记录
 *       - 支付方式统计
 *       - 实时数据更新
 *
 *       **使用场景**：
 *       - 财务日报生成
 *       - 收银台监控
 *       - 缴费异常提醒
 *     tags: [财务中心管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 今日缴费数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TodayPaymentSummary'
 *                 message:
 *                   type: string
 *                   example: "今日缴费数据获取成功"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */

export default router;
