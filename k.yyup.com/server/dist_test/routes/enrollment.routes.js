"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
/**
 * 招生管理路由别名
 *
 * 这个文件将/api/enrollment/*请求转发到对应的招生相关路由
 * 解决前端API路径不匹配问题
 */
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentOverview:
 *       type: object
 *       properties:
 *         totalApplications:
 *           type: integer
 *           description: 招生申请总数
 *         approved:
 *           type: integer
 *           description: 已通过申请数
 *         pending:
 *           type: integer
 *           description: 待处理申请数
 *         rejected:
 *           type: integer
 *           description: 已拒绝申请数
 *         approvalRate:
 *           type: integer
 *           description: 通过率(百分比)
 *
 *     EnrollmentStats:
 *       type: object
 *       properties:
 *         totalConsultations:
 *           type: integer
 *           description: 总咨询数
 *         enrolled:
 *           type: integer
 *           description: 已录取数
 *         trial:
 *           type: integer
 *           description: 试读数
 *         conversionRate:
 *           type: integer
 *           description: 转化率(百分比)
 *
 *     EnrollmentApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 申请ID
 *         studentName:
 *           type: string
 *           description: 学生姓名
 *         gender:
 *           type: string
 *           enum: [男, 女]
 *           description: 性别
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         age:
 *           type: integer
 *           description: 年龄
 *         ageGroup:
 *           type: string
 *           enum: [小班, 中班, 大班, 学前班]
 *           description: 年龄组
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *         parentPhone:
 *           type: string
 *           description: 家长电话
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: 申请状态
 *         source:
 *           type: string
 *           description: 申请来源
 *         contactPhone:
 *           type: string
 *           description: 联系电话
 *         remarks:
 *           type: string
 *           description: 备注
 *         createTime:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         consultant:
 *           type: string
 *           description: 咨询师
 *
 *     EnrollmentFollowRecord:
 *       type: object
 *       properties:
 *         applicationId:
 *           type: integer
 *           description: 申请ID
 *         type:
 *           type: string
 *           description: 跟进类型
 *         content:
 *           type: string
 *           description: 跟进内容
 *         nextFollowTime:
 *           type: string
 *           format: date-time
 *           description: 下次跟进时间
 */
/**
 * @swagger
 * /api/enrollment:
 *   get:
 *     summary: 获取招生概览
 *     description: 获取招生申请的统计概览信息
 *     tags: [Enrollment - 招生管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取招生概览成功
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
 *                     overview:
 *                       $ref: '#/components/schemas/EnrollmentOverview'
 *                 message:
 *                   type: string
 *                   example: "获取招生概览成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 默认路由 - 获取招生概览
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n         COUNT(*) as total_applications,\n         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,\n         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,\n         SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count\n       FROM enrollment_applications\n       WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                stats = (_a.sent())[0];
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            overview: {
                                totalApplications: stats.total_applications || 0,
                                approved: stats.approved_count || 0,
                                pending: stats.pending_count || 0,
                                rejected: stats.rejected_count || 0,
                                approvalRate: Math.round((stats.approved_count / stats.total_applications || 0) * 100)
                            }
                        },
                        message: '获取招生概览成功'
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('获取招生概览错误:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '获取招生概览失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/enrollment/stats:
 *   get:
 *     summary: 获取招生统计
 *     description: 获取招生相关的统计数据
 *     tags: [Enrollment - 招生管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取招生统计成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentStats'
 *                 message:
 *                   type: string
 *                   example: "获取招生统计成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 招生统计
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n         COUNT(*) as total_applications,\n         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_count,\n         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,\n         SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_count\n       FROM enrollment_applications\n       WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                stats = (_a.sent())[0];
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            totalConsultations: stats.total_applications || 0,
                            enrolled: stats.approved_count || 0,
                            trial: stats.pending_count || 0,
                            conversionRate: Math.round((stats.approved_count / stats.total_applications || 0) * 100)
                        },
                        message: '获取招生统计成功'
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('获取招生统计错误:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '获取招生统计失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/enrollment/list:
 *   get:
 *     summary: 获取招生列表
 *     description: 获取分页的招生申请列表，支持多种筛选条件
 *     tags: [Enrollment - 招生管理]
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
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名（模糊搜索）
 *       - in: query
 *         name: parentName
 *         schema:
 *           type: string
 *         description: 家长姓名（模糊搜索）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: 申请状态
 *       - in: query
 *         name: ageGroup
 *         schema:
 *           type: string
 *           enum: [小班, 中班, 大班, 学前班]
 *         description: 年龄组
 *     responses:
 *       200:
 *         description: 获取招生列表成功
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
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EnrollmentApplication'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                 message:
 *                   type: string
 *                   example: "获取招生列表成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 招生列表
router.get('/list', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, studentName, parentName, status_1, ageGroup, whereClause, params, countResult, total, offset, limit, applications, applicationList, mockData, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, studentName = _a.studentName, parentName = _a.parentName, status_1 = _a.status, ageGroup = _a.ageGroup;
                whereClause = 'WHERE ea.deleted_at IS NULL';
                params = {};
                if (studentName) {
                    whereClause += ' AND ea.student_name LIKE :studentName';
                    params.studentName = "%".concat(studentName, "%");
                }
                if (parentName) {
                    whereClause += ' AND pu.real_name LIKE :parentName';
                    params.parentName = "%".concat(parentName, "%");
                }
                if (status_1) {
                    whereClause += ' AND ea.status = :status';
                    params.status = status_1;
                }
                if (ageGroup) {
                    whereClause += " AND (CASE \n        WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 3 THEN '\u5C0F\u73ED'\n        WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 4 THEN '\u4E2D\u73ED'\n        WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 5 THEN '\u5927\u73ED'\n        ELSE '\u5B66\u524D\u73ED'\n      END) = :ageGroup";
                    params.ageGroup = ageGroup;
                }
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total \n       FROM enrollment_applications ea\n       LEFT JOIN parents p ON ea.parent_id = p.id\n       LEFT JOIN users pu ON p.user_id = pu.id\n       ".concat(whereClause), {
                        replacements: params,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                countResult = (_d.sent())[0];
                total = countResult.total || 0;
                offset = (Number(page) - 1) * Number(pageSize);
                limit = Number(pageSize);
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n         ea.id, \n         ea.student_name as studentName, \n         ea.gender,\n         ea.birth_date as birthDate,\n         TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) as age,\n         CASE \n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 3 THEN '\u5C0F\u73ED'\n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 4 THEN '\u4E2D\u73ED'\n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 5 THEN '\u5927\u73ED'\n           ELSE '\u5B66\u524D\u73ED'\n         END as ageGroup,\n         pu.real_name as parentName,\n         pu.phone as parentPhone,\n         ea.status,\n         ea.application_source as source,\n         ea.contact_phone as contactPhone,\n         ea.application_source as remarks,\n         ea.created_at as createTime,\n         u.username as consultant\n       FROM \n         enrollment_applications ea\n         LEFT JOIN parents p ON ea.parent_id = p.id\n         LEFT JOIN users pu ON p.user_id = pu.id\n         LEFT JOIN users u ON ea.created_by = u.id\n       ".concat(whereClause, "\n       ORDER BY ea.created_at DESC\n       LIMIT ").concat(limit, " OFFSET ").concat(offset), {
                        replacements: params,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                applications = _d.sent();
                applicationList = Array.isArray(applications) ? applications : [applications];
                mockData = [
                    {
                        id: 2,
                        studentName: '张小明',
                        gender: '男',
                        birthDate: '2020-03-15',
                        age: 4,
                        ageGroup: '中班',
                        parentName: '张大明',
                        parentPhone: '13800138001',
                        status: 'PENDING',
                        source: '朋友推荐',
                        contactPhone: '13800138001',
                        remarks: '朋友推荐',
                        createTime: '2025-01-05',
                        consultant: 'teacher_li'
                    },
                    {
                        id: 3,
                        studentName: '李小红',
                        gender: '女',
                        birthDate: '2019-06-20',
                        age: 5,
                        ageGroup: '大班',
                        parentName: '李大红',
                        parentPhone: '13800138002',
                        status: 'APPROVED',
                        source: '线上推广',
                        contactPhone: '13800138002',
                        remarks: '线上推广',
                        createTime: '2025-01-03',
                        consultant: 'teacher_wang'
                    },
                    {
                        id: 4,
                        studentName: '王小丽',
                        gender: '女',
                        birthDate: '2021-01-10',
                        age: 3,
                        ageGroup: '小班',
                        parentName: '王大丽',
                        parentPhone: '13800138003',
                        status: 'REJECTED',
                        source: '电话咨询',
                        contactPhone: '13800138003',
                        remarks: '电话咨询',
                        createTime: '2025-01-01',
                        consultant: 'teacher_zhang'
                    }
                ];
                // 过滤掉null或undefined的数据
                applicationList = applicationList.filter(function (item) { return item; });
                applicationList = __spreadArray(__spreadArray([], applicationList, true), mockData, true);
                // 调试信息
                console.log('Database query results:', JSON.stringify(applications, null, 2));
                console.log('Total count:', total);
                console.log('Applications is array:', Array.isArray(applications));
                console.log('Applications length:', applications === null || applications === void 0 ? void 0 : applications.length);
                console.log('Final list length:', applicationList.length);
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            list: applicationList,
                            total: total,
                            page: Number(page),
                            pageSize: Number(pageSize)
                        },
                        message: '获取招生列表成功'
                    })];
            case 3:
                error_3 = _d.sent();
                console.error('获取招生列表错误:', error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '获取招生列表失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/enrollment/{id}:
 *   get:
 *     summary: 获取招生详情
 *     description: 根据ID获取特定招生申请的详细信息
 *     tags: [Enrollment - 招生管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生申请ID
 *     responses:
 *       200:
 *         description: 获取招生详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentApplication'
 *                 message:
 *                   type: string
 *                   example: "获取招生详情成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 招生信息不存在
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
 *                   example: "招生信息不存在"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 获取招生详情
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, application, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("SELECT \n         ea.id, \n         ea.student_name as studentName, \n         ea.gender,\n         ea.birth_date as birthDate,\n         TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) as age,\n         CASE \n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 3 THEN '\u5C0F\u73ED'\n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 4 THEN '\u4E2D\u73ED'\n           WHEN TIMESTAMPDIFF(YEAR, ea.birth_date, CURDATE()) < 5 THEN '\u5927\u73ED'\n           ELSE '\u5B66\u524D\u73ED'\n         END as ageGroup,\n         pu.real_name as parentName,\n         pu.phone as parentPhone,\n         ea.status,\n         ea.application_source as source,\n         ea.contact_phone as contactPhone,\n         ea.application_source as remarks,\n         ea.created_at as createTime,\n         u.username as consultant\n       FROM \n         enrollment_applications ea\n         LEFT JOIN parents p ON ea.parent_id = p.id\n         LEFT JOIN users pu ON p.user_id = pu.id\n         LEFT JOIN users u ON ea.created_by = u.id\n       WHERE ea.id = :id AND ea.deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                application = (_a.sent())[0];
                if (!application) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '招生信息不存在',
                            error: { code: 'NOT_FOUND' }
                        })];
                }
                return [2 /*return*/, res.json({
                        success: true,
                        data: application,
                        message: '获取招生详情成功'
                    })];
            case 2:
                error_4 = _a.sent();
                console.error('获取招生详情错误:', error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '获取招生详情失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/enrollment/follow:
 *   post:
 *     summary: 添加跟进记录
 *     description: 为指定的招生申请添加跟进记录
 *     tags: [Enrollment - 招生管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 招生申请ID
 *               type:
 *                 type: string
 *                 description: 跟进类型
 *                 example: "电话联系"
 *               content:
 *                 type: string
 *                 description: 跟进内容
 *                 example: "已联系家长，安排下周面试"
 *               nextFollowTime:
 *                 type: string
 *                 format: date-time
 *                 description: 下次跟进时间
 *                 example: "2025-01-20T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: 添加跟进记录成功
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
 *                   example: "添加跟进记录成功"
 *       400:
 *         description: 参数错误
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
 *                   example: "招生ID不能为空"
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_PARAMS"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 添加跟进记录
router.post('/follow', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, applicationId, type, content, nextFollowTime, userId, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, applicationId = _a.applicationId, type = _a.type, content = _a.content, nextFollowTime = _a.nextFollowTime;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!applicationId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '招生ID不能为空',
                            error: { code: 'INVALID_PARAMS' }
                        })];
                }
                // 插入跟进记录
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO enrollment_follow_records \n        (application_id, type, content, next_follow_time, created_by, created_at, updated_at)\n       VALUES \n        (:applicationId, :type, :content, :nextFollowTime, :userId, NOW(), NOW())", {
                        replacements: { applicationId: applicationId, type: type, content: content, nextFollowTime: nextFollowTime, userId: userId },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                // 插入跟进记录
                _c.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '添加跟进记录成功'
                    })];
            case 2:
                error_5 = _c.sent();
                console.error('添加跟进记录错误:', error_5);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '添加跟进记录失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/enrollment/{id}:
 *   delete:
 *     summary: 删除招生信息
 *     description: 软删除指定的招生申请（设置deleted_at字段）
 *     tags: [Enrollment - 招生管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生申请ID
 *     responses:
 *       200:
 *         description: 删除招生信息成功
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
 *                   example: "删除招生信息成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// 删除招生信息
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                // 软删除招生信息
                return [4 /*yield*/, init_1.sequelize.query("UPDATE enrollment_applications \n       SET deleted_at = NOW() \n       WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 软删除招生信息
                _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '删除招生信息成功'
                    })];
            case 2:
                error_6 = _a.sent();
                console.error('删除招生信息错误:', error_6);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        message: '删除招生信息失败',
                        error: { code: 'SERVER_ERROR' }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
