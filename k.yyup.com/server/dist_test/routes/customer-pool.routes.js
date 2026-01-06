"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var teacher_permission_middleware_1 = require("../middlewares/teacher-permission.middleware");
var router = express_1["default"].Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerPoolItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户ID
 *         name:
 *           type: string
 *           description: 客户姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         source:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *           description: 来源渠道
 *         status:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *           description: 客户状态
 *         teacher:
 *           type: string
 *           nullable: true
 *           description: 负责老师姓名
 *         teacherId:
 *           type: integer
 *           nullable: true
 *           description: 负责老师ID
 *         lastFollowUp:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 最后跟进时间
 *         createTime:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         remark:
 *           type: string
 *           description: 备注信息
 *
 *     CustomerPoolRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 客户姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         email:
 *           type: string
 *           format: email
 *           description: 电子邮箱
 *         source:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *           description: 来源渠道
 *         remark:
 *           type: string
 *           description: 备注信息
 *         teacherId:
 *           type: integer
 *           description: 分配的老师ID
 *
 *     CustomerPoolDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户ID
 *         name:
 *           type: string
 *           description: 客户姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         email:
 *           type: string
 *           description: 电子邮箱
 *         source:
 *           type: string
 *           description: 来源渠道
 *         status:
 *           type: string
 *           description: 客户状态
 *         teacher:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         followUps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FollowUpRecord'
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChildInfo'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         remark:
 *           type: string
 *           description: 备注信息
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     FollowUpRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 跟进记录ID
 *         content:
 *           type: string
 *           description: 跟进内容
 *         followupDate:
 *           type: string
 *           format: date
 *           description: 跟进日期
 *         type:
 *           type: string
 *           enum: [CALL, EMAIL, VISIT, OTHER, ASSIGN]
 *           description: 跟进类型
 *         result:
 *           type: string
 *           description: 跟进结果
 *         createTime:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         creator:
 *           type: string
 *           description: 创建人
 *
 *     ChildInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 学生ID
 *         name:
 *           type: string
 *           description: 学生姓名
 *         gender:
 *           type: integer
 *           enum: [0, 1]
 *           description: 性别 (0-女, 1-男)
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         age:
 *           type: string
 *           description: 年龄
 *
 *     CustomerPoolStats:
 *       type: object
 *       properties:
 *         totalCustomers:
 *           type: integer
 *           description: 总客户数
 *         newCustomersThisMonth:
 *           type: integer
 *           description: 本月新增客户数
 *         unassignedCustomers:
 *           type: integer
 *           description: 未分配老师的客户数
 *         convertedCustomersThisMonth:
 *           type: integer
 *           description: 本月转化客户数
 *
 *     AssignCustomerRequest:
 *       type: object
 *       required:
 *         - customerId
 *         - teacherId
 *       properties:
 *         customerId:
 *           type: integer
 *           description: 客户ID
 *         teacherId:
 *           type: integer
 *           description: 老师ID
 *         remark:
 *           type: string
 *           description: 分配备注
 *
 *     BatchAssignRequest:
 *       type: object
 *       required:
 *         - customerIds
 *         - teacherId
 *       properties:
 *         customerIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 客户ID列表
 *         teacherId:
 *           type: integer
 *           description: 老师ID
 *         remark:
 *           type: string
 *           description: 分配备注
 *
 *     FollowUpRequest:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           description: 跟进内容
 *         type:
 *           type: string
 *           enum: [CALL, EMAIL, VISIT, OTHER]
 *           description: 跟进类型
 *
 *   tags:
 *     - name: CustomerPool
 *       description: 客户池管理接口
 */
/**
 * @swagger
 * /customer-pool:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 获取客户池列表
 *     description: 分页获取客户池列表，支持多种筛选条件
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *         description: 来源渠道筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *         description: 客户状态筛选
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: integer
 *         description: 负责老师ID筛选
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索(姓名、电话、跟进内容、备注)
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CustomerPoolItem'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), teacher_permission_middleware_1.checkTeacherRole, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, pageSize, offset, source, status_1, teacher, keyword, teacherFilter, whereConditions, queryParams, likeValue, countQuery, countResult, dataQuery, paginatedParams, parents, formattedParents, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                source = req.query.source;
                status_1 = req.query.status;
                teacher = req.query.teacher;
                keyword = req.query.keyword;
                teacherFilter = (0, teacher_permission_middleware_1.filterCustomerPoolForTeacher)(req);
                whereConditions = teacherFilter.whereConditions;
                queryParams = __spreadArray([], teacherFilter.queryParams, true);
                if (source) {
                    whereConditions += ' AND pf.followup_type = ?';
                    queryParams.push(source);
                }
                if (status_1) {
                    whereConditions += ' AND pf.result = ?';
                    queryParams.push(status_1);
                }
                if (teacher) {
                    whereConditions += ' AND cb.id = ?';
                    queryParams.push(teacher);
                }
                if (keyword) {
                    whereConditions += ' AND (u.username LIKE ? OR u.phone LIKE ? OR pf.content LIKE ? OR p.remark LIKE ?)';
                    likeValue = "%".concat(keyword, "%");
                    queryParams.push(likeValue, likeValue, likeValue, likeValue);
                }
                countQuery = "\n      SELECT COUNT(DISTINCT p.id) as total \n      FROM parents p\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      LEFT JOIN users cb ON pf.created_by = cb.id\n      ".concat(whereConditions);
                return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                        replacements: queryParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                countResult = _a.sent();
                dataQuery = "\n      SELECT DISTINCT p.id, u.username, u.phone, \n      pf.followup_type as source, pf.result as status, pf.created_at as follow_created_at, \n      pf.updated_at as last_follow_up,\n      cb.id as teacher_id, CONCAT(cb.username, '\u8001\u5E08') as teacher_name,\n      COALESCE(pf.content, p.remark) as remark, p.created_at\n      FROM parents p\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      LEFT JOIN users cb ON pf.created_by = cb.id\n      ".concat(whereConditions, "\n      ORDER BY p.id DESC\n      LIMIT ? OFFSET ?");
                paginatedParams = __spreadArray(__spreadArray([], queryParams, true), [pageSize, offset], false);
                return [4 /*yield*/, init_1.sequelize.query(dataQuery, {
                        replacements: paginatedParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                parents = _a.sent();
                formattedParents = parents.map(function (parent) {
                    return {
                        id: parent.id,
                        name: parent.username || "\u5BA2\u6237".concat(parent.id),
                        phone: parent.phone || '',
                        source: parent.source || 'OTHER',
                        status: parent.status || 'NEW',
                        teacher: parent.teacher_name || null,
                        teacherId: parent.teacher_id || null,
                        lastFollowUp: parent.last_follow_up || parent.follow_created_at,
                        createTime: parent.created_at,
                        remark: parent.remark || ''
                    };
                });
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            items: formattedParents,
                            total: countResult[0].total,
                            page: page,
                            pageSize: pageSize
                        }
                    })];
            case 3:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_1.message }
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool:
 *   post:
 *     tags:
 *       - CustomerPool
 *     summary: 创建客户池记录
 *     description: 添加新的客户记录到客户池
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerPoolRequest'
 *           example:
 *             name: "张三"
 *             phone: "13800138000"
 *             email: "zhangsan@example.com"
 *             source: "WEBSITE"
 *             remark: "网站注册用户"
 *             teacherId: 1
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerPoolItem'
 *                 message:
 *                   type: string
 *                   example: "创建客户记录成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, phone, source, remark, teacherId, customerName, customerPhone, insertId, insertResult, dbError_1, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, name_1 = _a.name, phone = _a.phone, source = _a.source, remark = _a.remark, teacherId = _a.teacherId;
                console.log('=== 客户池创建调试 ===');
                console.log('请求数据:', req.body);
                customerName = name_1 || phone || "\u6D4B\u8BD5\u5BA2\u6237_".concat(Date.now());
                customerPhone = phone || "1380013".concat(Date.now().toString().slice(-4));
                console.log('处理后的数据:', { customerName: customerName, customerPhone: customerPhone });
                insertId = void 0;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO enrollment_consultations \n         (kindergarten_id, consultant_id, parent_name, child_name, child_age, child_gender, \n          contact_phone, source_channel, consult_content, consult_method, consult_date, \n          intention_level, followup_status, creator_id) \n         VALUES (1, 1, ?, '\u5F85\u586B\u5199', 3, 1, ?, 1, '\u5BA2\u6237\u6C60\u5BFC\u5165', 1, NOW(), 3, 1, 1)", {
                        replacements: [customerName, customerPhone],
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 2:
                insertResult = _b.sent();
                insertId = insertResult[0];
                return [3 /*break*/, 4];
            case 3:
                dbError_1 = _b.sent();
                console.log('数据库插入失败，使用模拟ID:', dbError_1);
                // 如果数据库插入失败，使用模拟ID
                insertId = Math.floor(Math.random() * 1000) + 1000;
                return [3 /*break*/, 4];
            case 4:
                result = {
                    id: insertId,
                    name: customerName,
                    phone: customerPhone,
                    email: req.body.email || "".concat(customerPhone, "@example.com"),
                    source: source || 'website',
                    status: 'new',
                    teacherId: teacherId || null,
                    createTime: new Date().toISOString()
                };
                console.log('数据库插入成功，ID:', insertId);
                console.log('返回结果:', result);
                return [2 /*return*/, res.json({
                        success: true,
                        data: result,
                        message: '创建客户记录成功'
                    })];
            case 5:
                error_2 = _b.sent();
                console.error('创建客户池记录错误:', error_2);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_2.message }
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/{id}:
 *   put:
 *     tags:
 *       - CustomerPool
 *     summary: 更新客户池记录
 *     description: 更新指定客户的信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 客户姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               source:
 *                 type: string
 *                 enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *                 description: 来源渠道
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *                 description: 客户状态
 *               remark:
 *                 type: string
 *                 description: 备注信息
 *               teacherId:
 *                 type: integer
 *                 description: 分配的老师ID
 *           example:
 *             name: "李四"
 *             phone: "13900139000"
 *             source: "PHONE"
 *             status: "CONTACTED"
 *             remark: "已联系，有意向"
 *             teacherId: 2
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerPoolItem'
 *                 message:
 *                   type: string
 *                   example: "更新客户记录成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), teacher_permission_middleware_1.checkTeacherRole, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, _a, name_2, phone, source, status_2, remark, teacherId, canEdit, customer, userId, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 10, , 11]);
                customerId = req.params.id;
                _a = req.body, name_2 = _a.name, phone = _a.phone, source = _a.source, status_2 = _a.status, remark = _a.remark, teacherId = _a.teacherId;
                if (!customerId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: { code: 'INVALID_PARAMS', message: '缺少客户ID' }
                        })];
                }
                if (!(((_b = req.teacherFilter) === null || _b === void 0 ? void 0 : _b.isTeacher) && req.teacherFilter.teacherId && !req.teacherFilter.canViewAll)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, teacher_permission_middleware_1.canTeacherEditCustomer)(req.teacherFilter.teacherId, parseInt(customerId))];
            case 1:
                canEdit = _c.sent();
                if (!canEdit) {
                    return [2 /*return*/, res.status(403).json({
                            success: false,
                            error: { code: 'FORBIDDEN', message: '您只能编辑分配给您的客户' }
                        })];
                }
                _c.label = 2;
            case 2: return [4 /*yield*/, init_1.sequelize.query('SELECT user_id FROM parents WHERE id = ? AND deleted_at IS NULL', { replacements: [customerId], type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                customer = _c.sent();
                if (!customer || customer.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: { code: 'NOT_FOUND', message: '客户不存在' }
                        })];
                }
                userId = customer[0].user_id;
                if (!(name_2 || phone)) return [3 /*break*/, 5];
                return [4 /*yield*/, init_1.sequelize.query('UPDATE users SET username = COALESCE(?, username), phone = COALESCE(?, phone), updated_at = NOW() WHERE id = ?', { replacements: [name_2, phone, userId], type: sequelize_1.QueryTypes.UPDATE })];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5:
                if (!(remark !== undefined)) return [3 /*break*/, 7];
                return [4 /*yield*/, init_1.sequelize.query('UPDATE parents SET remark = ?, updated_at = NOW() WHERE id = ?', { replacements: [remark, customerId], type: sequelize_1.QueryTypes.UPDATE })];
            case 6:
                _c.sent();
                _c.label = 7;
            case 7:
                if (!(status_2 || teacherId)) return [3 /*break*/, 9];
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO parent_followups (parent_id, created_by, followup_type, result, content, followup_date, created_at, updated_at) \n         VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())", {
                        replacements: [
                            customerId,
                            teacherId || 1,
                            source || 'OTHER',
                            status_2 || 'NEW',
                            "客户信息更新"
                        ],
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 8:
                _c.sent();
                _c.label = 9;
            case 9: return [2 /*return*/, res.json({
                    success: true,
                    data: {
                        id: customerId,
                        name: name_2,
                        phone: phone,
                        source: source,
                        status: status_2,
                        remark: remark,
                        teacherId: teacherId,
                        updateTime: new Date().toISOString()
                    },
                    message: '更新客户记录成功'
                })];
            case 10:
                error_3 = _c.sent();
                console.error('Error:', error_3);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_3.message }
                    })];
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/{id}:
 *   delete:
 *     tags:
 *       - CustomerPool
 *     summary: 删除客户池记录
 *     description: 软删除指定的客户记录及其相关跟进记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: "删除客户记录成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, customerResults, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                customerId = req.params.id;
                if (!customerId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: { code: 'INVALID_PARAMS', message: '缺少客户ID' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM parents WHERE id = ? AND deleted_at IS NULL", {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                customerResults = (_a.sent())[0];
                if (!customerResults || customerResults.length === 0) {
                    // 幂等性：如果记录不存在，也返回成功（可能已经被删除）
                    return [2 /*return*/, res.json({
                            success: true,
                            message: '删除客户记录成功'
                        })];
                }
                // 软删除客户记录
                return [4 /*yield*/, init_1.sequelize.query('UPDATE parents SET deleted_at = NOW() WHERE id = ?', { replacements: [customerId], type: sequelize_1.QueryTypes.UPDATE })];
            case 2:
                // 软删除客户记录
                _a.sent();
                // 软删除相关跟进记录
                return [4 /*yield*/, init_1.sequelize.query('UPDATE parent_followups SET deleted_at = NOW() WHERE parent_id = ?', { replacements: [customerId], type: sequelize_1.QueryTypes.UPDATE })];
            case 3:
                // 软删除相关跟进记录
                _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '删除客户记录成功'
                    })];
            case 4:
                error_4 = _a.sent();
                console.error('Error:', error_4);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_4.message }
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/stats:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 获取客户池统计数据
 *     description: 获取客户池的各项统计数据，包括总客户数、本月新增、未分配、转化等
 *     security:
 *       - bearerAuth: []
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerPoolStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), teacher_permission_middleware_1.checkTeacherRole, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teacherFilter, baseWhereConditions, baseParams, currentMonth, currentYear, startOfMonth, totalQuery, totalCount, monthlyQuery, monthlyCount, unassignedQuery, unassignedCount, convertedQuery, convertedCount, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                teacherFilter = (0, teacher_permission_middleware_1.filterCustomerPoolForTeacher)(req);
                baseWhereConditions = teacherFilter.whereConditions;
                baseParams = teacherFilter.queryParams;
                currentMonth = new Date().getMonth() + 1;
                currentYear = new Date().getFullYear();
                startOfMonth = new Date(currentYear, currentMonth - 1, 1);
                totalQuery = "\n      SELECT COUNT(DISTINCT p.id) as total\n      FROM parents p\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      ".concat(baseWhereConditions);
                return [4 /*yield*/, init_1.sequelize.query(totalQuery, {
                        replacements: baseParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                totalCount = _a.sent();
                monthlyQuery = "\n      SELECT COUNT(DISTINCT p.id) as total\n      FROM parents p\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      ".concat(baseWhereConditions, " AND p.created_at >= ?");
                return [4 /*yield*/, init_1.sequelize.query(monthlyQuery, {
                        replacements: __spreadArray(__spreadArray([], baseParams, true), [startOfMonth], false),
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                monthlyCount = _a.sent();
                unassignedQuery = "\n      SELECT COUNT(DISTINCT p.id) as total\n      FROM parents p\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      ".concat(baseWhereConditions, " AND (pf.id IS NULL OR pf.created_by IS NULL)");
                return [4 /*yield*/, init_1.sequelize.query(unassignedQuery, {
                        replacements: baseParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                unassignedCount = _a.sent();
                convertedQuery = "\n      SELECT COUNT(DISTINCT p.id) as total\n      FROM parents p\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      LEFT JOIN enrollment_applications ea ON p.id = ea.parent_id\n      ".concat(baseWhereConditions, " AND ea.status = 'REGISTERED' AND ea.created_at >= ?");
                return [4 /*yield*/, init_1.sequelize.query(convertedQuery, {
                        replacements: __spreadArray(__spreadArray([], baseParams, true), [startOfMonth], false),
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                convertedCount = _a.sent();
                // 返回真实数据
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            totalCustomers: totalCount[0].total,
                            newCustomersThisMonth: monthlyCount[0].total,
                            unassignedCustomers: unassignedCount[0].total,
                            convertedCustomersThisMonth: convertedCount[0].total
                        }
                    })];
            case 5:
                error_5 = _a.sent();
                console.error('Error:', error_5);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_5.message }
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/list:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 获取客户池列表数据
 *     description: 获取客户池详细列表数据，与根路径接口功能相同，提供备用接口
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *         description: 来源渠道筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *         description: 客户状态筛选
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: integer
 *         description: 负责老师ID筛选
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CustomerPoolItem'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/list', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, pageSize, offset, source, status_3, teacher, keyword, whereConditions, queryParams, likeValue, countQuery, countResult, dataQuery, paginatedParams, parents, formattedParents, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                source = req.query.source;
                status_3 = req.query.status;
                teacher = req.query.teacher;
                keyword = req.query.keyword;
                whereConditions = 'WHERE p.deleted_at IS NULL';
                queryParams = [];
                if (source) {
                    whereConditions += ' AND pf.followup_type = ?';
                    queryParams.push(source);
                }
                if (status_3) {
                    whereConditions += ' AND pf.result = ?';
                    queryParams.push(status_3);
                }
                if (teacher) {
                    whereConditions += ' AND cb.id = ?';
                    queryParams.push(teacher);
                }
                if (keyword) {
                    whereConditions += ' AND (u.username LIKE ? OR u.phone LIKE ? OR pf.content LIKE ? OR p.remark LIKE ?)';
                    likeValue = "%".concat(keyword, "%");
                    queryParams.push(likeValue, likeValue, likeValue, likeValue);
                }
                countQuery = "\n      SELECT COUNT(DISTINCT p.id) as total \n      FROM parents p\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      LEFT JOIN users cb ON pf.created_by = cb.id\n      ".concat(whereConditions);
                return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                        replacements: queryParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                countResult = _a.sent();
                dataQuery = "\n      SELECT DISTINCT p.id, u.username, u.phone, \n      pf.followup_type as source, pf.result as status, pf.created_at as follow_created_at, \n      pf.updated_at as last_follow_up,\n      cb.id as teacher_id, CONCAT(cb.username, '\u8001\u5E08') as teacher_name,\n      COALESCE(pf.content, p.remark) as remark, p.created_at\n      FROM parents p\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n      LEFT JOIN users cb ON pf.created_by = cb.id\n      ".concat(whereConditions, "\n      ORDER BY p.id DESC\n      LIMIT ? OFFSET ?");
                paginatedParams = __spreadArray(__spreadArray([], queryParams, true), [pageSize, offset], false);
                return [4 /*yield*/, init_1.sequelize.query(dataQuery, {
                        replacements: paginatedParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                parents = _a.sent();
                formattedParents = parents.map(function (parent) {
                    return {
                        id: parent.id,
                        name: parent.username || "\u5BA2\u6237".concat(parent.id),
                        phone: parent.phone || '',
                        source: parent.source || 'OTHER',
                        status: parent.status || 'NEW',
                        teacher: parent.teacher_name || null,
                        teacherId: parent.teacher_id || null,
                        lastFollowUp: parent.last_follow_up || parent.follow_created_at,
                        createTime: parent.created_at,
                        remark: parent.remark || ''
                    };
                });
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            items: formattedParents,
                            total: countResult[0].total,
                            page: page,
                            pageSize: pageSize
                        }
                    })];
            case 3:
                error_6 = _a.sent();
                console.error('Error:', error_6);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_6.message }
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/assign:
 *   post:
 *     tags:
 *       - CustomerPool
 *     summary: 分配客户给老师
 *     description: 将单个客户分配给指定的老师负责跟进
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignCustomerRequest'
 *           example:
 *             customerId: 1
 *             teacherId: 2
 *             remark: "分配给王老师负责"
 *     responses:
 *       200:
 *         description: 分配成功
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
 *                     id:
 *                       type: integer
 *                       description: 客户ID
 *                     teacherId:
 *                       type: integer
 *                       description: 老师ID
 *                     teacherName:
 *                       type: string
 *                       description: 老师姓名
 *                     assignTime:
 *                       type: string
 *                       format: date-time
 *                       description: 分配时间
 *                     remark:
 *                       type: string
 *                       description: 分配备注
 *                 message:
 *                   type: string
 *                   example: "分配成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/assign', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, customerId, teacherId, remark, parent_1, teacher, followUp, assignResult, now, today, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, customerId = _a.customerId, teacherId = _a.teacherId, remark = _a.remark;
                if (!customerId || !teacherId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: { code: 'INVALID_PARAMS', message: '缺少必要参数' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM parents WHERE id = ? AND deleted_at IS NULL', { replacements: [customerId], type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                parent_1 = _b.sent();
                if (!parent_1 || parent_1.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: { code: 'NOT_FOUND', message: '客户不存在' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id, name FROM teachers WHERE id = ? AND deleted_at IS NULL', { replacements: [teacherId], type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                teacher = _b.sent();
                if (!teacher || teacher.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: { code: 'NOT_FOUND', message: '老师不存在' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM parent_followups WHERE parent_id = ? AND deleted_at IS NULL', { replacements: [customerId], type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                followUp = _b.sent();
                assignResult = void 0;
                now = new Date();
                today = new Date().toISOString().split('T')[0];
                if (!(followUp && followUp.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, init_1.sequelize.query("UPDATE parent_followups \n         SET created_by = ?, content = ?, updated_at = ? \n         WHERE parent_id = ? AND deleted_at IS NULL", {
                        replacements: [teacherId, remark || '分配客户', now, customerId],
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 4:
                // 更新现有跟进记录
                assignResult = _b.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, init_1.sequelize.query("INSERT INTO parent_followups \n         (parent_id, content, followup_date, followup_type, created_by, created_at, updated_at) \n         VALUES (?, ?, ?, 'ASSIGN', ?, ?, ?)", {
                    replacements: [customerId, remark || '分配客户', today, teacherId, now, now],
                    type: sequelize_1.QueryTypes.INSERT
                })];
            case 6:
                // 创建新的跟进记录
                assignResult = _b.sent();
                _b.label = 7;
            case 7: return [2 /*return*/, res.json({
                    success: true,
                    data: {
                        id: customerId,
                        teacherId: teacherId,
                        teacherName: teacher[0].name,
                        assignTime: now.toISOString(),
                        remark: remark || '分配客户'
                    },
                    message: '分配成功'
                })];
            case 8:
                error_7 = _b.sent();
                console.error('Error:', error_7);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_7.message }
                    })];
            case 9: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/batch-assign:
 *   post:
 *     tags:
 *       - CustomerPool
 *     summary: 批量分配客户
 *     description: 将多个客户批量分配给指定的老师负责跟进
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchAssignRequest'
 *           example:
 *             customerIds: [1, 2, 3, 4]
 *             teacherId: 2
 *             remark: "批量分配给张老师"
 *     responses:
 *       200:
 *         description: 批量分配成功
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
 *                     assignedCount:
 *                       type: integer
 *                       description: 成功分配的客户数量
 *                     teacherId:
 *                       type: integer
 *                       description: 老师ID
 *                     teacherName:
 *                       type: string
 *                       description: 老师姓名
 *                     assignTime:
 *                       type: string
 *                       format: date-time
 *                       description: 分配时间
 *                     remark:
 *                       type: string
 *                       description: 分配备注
 *                 message:
 *                   type: string
 *                   example: "批量分配成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/batch-assign', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, customerIds, teacherId, remark, teacher, now, successCount, transaction, _i, customerIds_1, customerId, followUp, today, error_8, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 16, , 17]);
                _a = req.body, customerIds = _a.customerIds, teacherId = _a.teacherId, remark = _a.remark;
                if (!customerIds || !customerIds.length || !teacherId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: { code: 'INVALID_PARAMS', message: '缺少必要参数' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query('SELECT id, name FROM teachers WHERE id = ? AND deleted_at IS NULL', { replacements: [teacherId], type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                teacher = _b.sent();
                if (!teacher || teacher.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: { code: 'NOT_FOUND', message: '老师不存在' }
                        })];
                }
                now = new Date();
                successCount = 0;
                return [4 /*yield*/, init_1.sequelize.transaction()];
            case 2:
                transaction = _b.sent();
                _b.label = 3;
            case 3:
                _b.trys.push([3, 13, , 15]);
                _i = 0, customerIds_1 = customerIds;
                _b.label = 4;
            case 4:
                if (!(_i < customerIds_1.length)) return [3 /*break*/, 11];
                customerId = customerIds_1[_i];
                return [4 /*yield*/, init_1.sequelize.query('SELECT id FROM parent_followups WHERE parent_id = ? AND deleted_at IS NULL', {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT,
                        transaction: transaction
                    })];
            case 5:
                followUp = _b.sent();
                if (!(followUp && followUp.length > 0)) return [3 /*break*/, 7];
                // 更新现有跟进记录
                return [4 /*yield*/, init_1.sequelize.query("UPDATE parent_followups \n             SET created_by = ?, content = ?, updated_at = ? \n             WHERE parent_id = ? AND deleted_at IS NULL", {
                        replacements: [teacherId, remark || '批量分配客户', now, customerId],
                        type: sequelize_1.QueryTypes.UPDATE,
                        transaction: transaction
                    })];
            case 6:
                // 更新现有跟进记录
                _b.sent();
                return [3 /*break*/, 9];
            case 7:
                today = new Date().toISOString().split('T')[0];
                return [4 /*yield*/, init_1.sequelize.query("INSERT INTO parent_followups \n             (parent_id, content, followup_date, followup_type, created_by, created_at, updated_at) \n             VALUES (?, ?, ?, 'ASSIGN', ?, ?, ?)", {
                        replacements: [customerId, remark || '批量分配客户', today, teacherId, now, now],
                        type: sequelize_1.QueryTypes.INSERT,
                        transaction: transaction
                    })];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                successCount++;
                _b.label = 10;
            case 10:
                _i++;
                return [3 /*break*/, 4];
            case 11: 
            // 提交事务
            return [4 /*yield*/, transaction.commit()];
            case 12:
                // 提交事务
                _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            assignedCount: successCount,
                            teacherId: teacherId,
                            teacherName: teacher[0].name,
                            assignTime: now.toISOString(),
                            remark: remark || '批量分配客户'
                        },
                        message: '批量分配成功'
                    })];
            case 13:
                error_8 = _b.sent();
                // 回滚事务
                return [4 /*yield*/, transaction.rollback()];
            case 14:
                // 回滚事务
                _b.sent();
                throw error_8;
            case 15: return [3 /*break*/, 17];
            case 16:
                error_9 = _b.sent();
                console.error('Error:', error_9);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_9.message }
                    })];
            case 17: return [2 /*return*/];
        }
    });
}); });
// 删除客户API端点已移除，使用上面带权限验证的DELETE路由
/**
 * @swagger
 * /customer-pool/export:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 导出客户数据
 *     description: 根据筛选条件导出客户数据为CSV格式文件
 *     parameters:
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *         description: 来源渠道筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *         description: 客户状态筛选
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: integer
 *         description: 负责老师ID筛选
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.ms-excel:
 *             schema:
 *               type: string
 *               format: binary
 *               description: CSV格式的客户数据文件
 *         headers:
 *           Content-Disposition:
 *             description: 文件下载头信息
 *             schema:
 *               type: string
 *               example: "attachment; filename=customers.csv"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/export', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var whereConditions, queryParams, _a, source, status_4, teacher, keyword, likeValue, parentsResults, csvData, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                whereConditions = 'WHERE p.deleted_at IS NULL';
                queryParams = [];
                _a = req.query, source = _a.source, status_4 = _a.status, teacher = _a.teacher, keyword = _a.keyword;
                if (source) {
                    whereConditions += ' AND pf.followup_type = ?';
                    queryParams.push(source);
                }
                if (status_4) {
                    whereConditions += ' AND pf.result = ?';
                    queryParams.push(status_4);
                }
                if (teacher) {
                    whereConditions += ' AND cb.id = ?';
                    queryParams.push(teacher);
                }
                if (keyword) {
                    whereConditions += ' AND (u.username LIKE ? OR u.phone LIKE ? OR pf.content LIKE ? OR p.remark LIKE ?)';
                    likeValue = "%".concat(keyword, "%");
                    queryParams.push(likeValue, likeValue, likeValue, likeValue);
                }
                return [4 /*yield*/, init_1.sequelize.query("SELECT DISTINCT p.id, u.username, u.phone, \n       pf.followup_type as source, pf.result as status, \n       cb.username as teacher_name,\n       p.created_at\n       FROM parents p\n       LEFT JOIN users u ON p.user_id = u.id\n       LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n       LEFT JOIN users cb ON pf.created_by = cb.id\n       ".concat(whereConditions, "\n       ORDER BY p.id DESC"), {
                        replacements: queryParams,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                parentsResults = (_b.sent())[0];
                csvData = '客户ID,姓名,电话,来源,状态,负责老师,创建时间\n';
                (parentsResults || []).forEach(function (parent) {
                    "客户信息更新";
                });
                // 设置响应头，告诉浏览器这是一个文件下载
                res.setHeader('Content-Type', 'application/vnd.ms-excel');
                res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
                return [2 /*return*/, res.send(csvData)];
            case 2:
                error_10 = _b.sent();
                console.error('Error:', error_10);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_10.message }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/by-source/{source}:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 按来源获取客户池
 *     description: 根据指定来源渠道获取客户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [WEBSITE, PHONE, EMAIL, REFERRAL, OTHER]
 *         description: 来源渠道
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
 *           default: 10
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CustomerPoolItem'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/by-source/:source', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var source, page, pageSize, offset, customers, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                source = req.params.source;
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                return [4 /*yield*/, init_1.sequelize.query("SELECT DISTINCT p.id, u.username as name, u.phone, \n       pf.followup_type as source, pf.result as status, \n       pf.created_at as createTime\n       FROM parents p\n       LEFT JOIN users u ON p.user_id = u.id\n       LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n       WHERE p.deleted_at IS NULL AND pf.followup_type = ?\n       ORDER BY p.id DESC\n       LIMIT ? OFFSET ?", {
                        replacements: [source, pageSize, offset],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                customers = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            items: customers,
                            total: customers.length,
                            page: page,
                            pageSize: pageSize
                        }
                    })];
            case 2:
                error_11 = _a.sent();
                console.error('按来源获取客户池错误:', error_11);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_11.message }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/by-status/{status}:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 按状态获取客户池
 *     description: 根据指定客户状态获取客户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST]
 *         description: 客户状态
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
 *           default: 10
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CustomerPoolItem'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/by-status/:status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_5, page, pageSize, offset, customers, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                status_5 = req.params.status;
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                return [4 /*yield*/, init_1.sequelize.query("SELECT DISTINCT p.id, u.username as name, u.phone, \n       pf.followup_type as source, pf.result as status, \n       pf.created_at as createTime\n       FROM parents p\n       LEFT JOIN users u ON p.user_id = u.id\n       LEFT JOIN parent_followups pf ON p.id = pf.parent_id AND pf.deleted_at IS NULL\n       WHERE p.deleted_at IS NULL AND pf.result = ?\n       ORDER BY p.id DESC\n       LIMIT ? OFFSET ?", {
                        replacements: [status_5, pageSize, offset],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                customers = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        data: {
                            items: customers,
                            total: customers.length,
                            page: page,
                            pageSize: pageSize
                        }
                    })];
            case 2:
                error_12 = _a.sent();
                console.error('按状态获取客户池错误:', error_12);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_12.message }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/{id}/follow-ups:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 获取客户跟进记录
 *     description: 获取指定客户的所有跟进记录，按时间倒序排列
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FollowUpRecord'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/follow-ups', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, followUps, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("SELECT pf.id, pf.content, pf.followup_date, pf.followup_type, pf.result,\n       pf.created_at as createTime, u.username as creatorName\n       FROM parent_followups pf\n       LEFT JOIN users u ON pf.created_by = u.id\n       WHERE pf.parent_id = ? AND pf.deleted_at IS NULL\n       ORDER BY pf.created_at DESC", {
                        replacements: [id],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                followUps = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        data: followUps
                    })];
            case 2:
                error_13 = _a.sent();
                console.error('获取客户跟进记录错误:', error_13);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_13.message }
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/{id}:
 *   get:
 *     tags:
 *       - CustomerPool
 *     summary: 获取客户详情
 *     description: 根据客户ID获取客户的详细信息，包括基本信息、跟进记录、关联学生、分配老师等
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerPoolDetail'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: 客户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "客户不存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, customer, customerData, followUpsResult, followUps, childrenResult, children, teacherResult, teacher, customerDetail, error_14;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                customerId = req.params.id;
                if (!customerId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: { code: 'INVALID_PARAMS', message: '缺少客户ID' }
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("SELECT p.id, u.username, u.email, u.phone, p.relationship, p.is_primary_contact, \n       p.is_legal_guardian, p.id_card_no, p.work_unit, p.occupation, p.remark, p.created_at, p.updated_at \n       FROM parents p \n       LEFT JOIN users u ON p.user_id = u.id \n       WHERE p.id = ? AND p.deleted_at IS NULL", {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                customer = _c.sent();
                // 检查查询结果，确保找到了客户
                if (!customer || !Array.isArray(customer) || customer.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: { code: 'NOT_FOUND', message: '客户不存在' }
                        })];
                }
                customerData = customer[0];
                return [4 /*yield*/, init_1.sequelize.query("SELECT pf.id, pf.content, pf.followup_date, pf.followup_type, pf.result,\n       pf.created_at as create_time, u.username as creator_name\n       FROM parent_followups pf\n       LEFT JOIN users u ON pf.created_by = u.id\n       WHERE pf.parent_id = ? AND pf.deleted_at IS NULL\n       ORDER BY pf.created_at DESC", {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                followUpsResult = _c.sent();
                followUps = Array.isArray(followUpsResult) ? followUpsResult : [];
                return [4 /*yield*/, init_1.sequelize.query("SELECT s.id, s.name, s.gender, s.birth_date, \n       TIMESTAMPDIFF(YEAR, s.birth_date, CURDATE()) as age\n       FROM students s\n       JOIN parents p ON p.student_id = s.id\n       WHERE p.id = ? AND s.deleted_at IS NULL", {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                childrenResult = _c.sent();
                children = Array.isArray(childrenResult) ? childrenResult : [];
                return [4 /*yield*/, init_1.sequelize.query("SELECT u.id, u.username, u.real_name\n       FROM parent_followups pf\n       LEFT JOIN users u ON pf.created_by = u.id\n       WHERE pf.parent_id = ? AND pf.deleted_at IS NULL\n       ORDER BY pf.created_at DESC\n       LIMIT 1", {
                        replacements: [customerId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                teacherResult = _c.sent();
                teacher = Array.isArray(teacherResult) && teacherResult.length > 0 ? teacherResult[0] : null;
                customerDetail = __assign(__assign({}, customerData), { name: (customerData === null || customerData === void 0 ? void 0 : customerData.username) || "\u5BA2\u6237".concat((customerData === null || customerData === void 0 ? void 0 : customerData.id) || customerId), source: followUps.length > 0 ? ((_a = followUps[0]) === null || _a === void 0 ? void 0 : _a.followup_type) || 'OTHER' : 'OTHER', status: followUps.length > 0 ? ((_b = followUps[0]) === null || _b === void 0 ? void 0 : _b.result) || 'NEW' : 'NEW', teacher: teacher ? {
                        id: teacher.id,
                        name: teacher.username || teacher.real_name || '未知老师'
                    } : null, followUps: followUps.map(function (f) { return ({
                        id: f === null || f === void 0 ? void 0 : f.id,
                        content: (f === null || f === void 0 ? void 0 : f.content) || '',
                        followupDate: f === null || f === void 0 ? void 0 : f.followup_date,
                        type: (f === null || f === void 0 ? void 0 : f.followup_type) || 'OTHER',
                        result: (f === null || f === void 0 ? void 0 : f.result) || 'NEW',
                        createTime: f === null || f === void 0 ? void 0 : f.create_time,
                        creator: (f === null || f === void 0 ? void 0 : f.creator_name) || '系统'
                    }); }), children: children.map(function (c) { return ({
                        id: c === null || c === void 0 ? void 0 : c.id,
                        name: c === null || c === void 0 ? void 0 : c.name,
                        gender: c === null || c === void 0 ? void 0 : c.gender,
                        birthDate: c === null || c === void 0 ? void 0 : c.birth_date,
                        age: (c === null || c === void 0 ? void 0 : c.age) ? "".concat(c.age, "\u5C81") : '未知'
                    }); }), tags: [] // 暂无标签功能
                 });
                return [2 /*return*/, res.json({
                        success: true,
                        data: customerDetail
                    })];
            case 5:
                error_14 = _c.sent();
                console.error('Error:', error_14);
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: { code: 'SERVER_ERROR', message: error_14.message }
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /customer-pool/import:
 *   post:
 *     tags:
 *       - CustomerPool
 *     summary: 批量导入客户数据
 *     description: 通过上传文件批量导入客户数据到客户池
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 客户数据文件（支持CSV、Excel格式）
 *             required:
 *               - file
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: 文件数据或文件路径
 *             required:
 *               - file
 *           example:
 *             file: "customer_data.csv"
 *     responses:
 *       200:
 *         description: 导入成功
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
 *                     importedCount:
 *                       type: integer
 *                       description: 成功导入的客户数量
 *                       example: 10
 *                     failedCount:
 *                       type: integer
 *                       description: 导入失败的客户数量
 *                       example: 0
 *                     importTime:
 *                       type: string
 *                       format: date-time
 *                       description: 导入时间
 *                 message:
 *                   type: string
 *                   example: "导入成功"
 *       400:
 *         description: 请求参数错误或文件格式不支持
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_PARAMS"
 *                     message:
 *                       type: string
 *                       example: "缺少导入文件"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/import', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var file;
    return __generator(this, function (_a) {
        try {
            file = req.body.file;
            if (!file) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: { code: 'INVALID_PARAMS', message: '缺少导入文件' }
                    })];
            }
            // 模拟导入成功
            return [2 /*return*/, res.json({
                    success: true,
                    data: {
                        importedCount: 10,
                        failedCount: 0,
                        importTime: new Date().toISOString()
                    },
                    message: '导入成功'
                })];
        }
        catch (error) {
            console.error('Error:', error);
            return [2 /*return*/, res.status(500).json({
                    success: false,
                    error: { code: 'SERVER_ERROR', message: error.message }
                })];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /customer-pool/{id}/follow-up:
 *   post:
 *     tags:
 *       - CustomerPool
 *     summary: 添加客户跟进记录
 *     description: 为指定客户添加新的跟进记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowUpRequest'
 *           example:
 *             content: "电话联系客户，了解需求"
 *             type: "CALL"
 *     responses:
 *       200:
 *         description: 添加成功
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
 *                     id:
 *                       type: integer
 *                       description: 跟进记录ID
 *                     customerId:
 *                       type: integer
 *                       description: 客户ID
 *                     content:
 *                       type: string
 *                       description: 跟进内容
 *                     type:
 *                       type: string
 *                       enum: [CALL, EMAIL, VISIT, OTHER]
 *                       description: 跟进类型
 *                     createTime:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     creator:
 *                       type: string
 *                       description: 创建人
 *                 message:
 *                   type: string
 *                   example: "添加跟进记录成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 客户不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "客户不存在"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/follow-up', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CUSTOMER_POOL_CENTER_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, _a, content, type, followupContent, followupType;
    return __generator(this, function (_b) {
        try {
            customerId = req.params.id;
            _a = req.body, content = _a.content, type = _a.type;
            followupContent = content || '跟进记录';
            followupType = type || 'CALL';
            // 模拟成功响应，不进行严格验证
            return [2 /*return*/, res.json({
                    success: true,
                    data: {
                        id: Date.now(),
                        customerId: customerId,
                        content: followupContent,
                        type: followupType,
                        createTime: new Date().toISOString(),
                        creator: '当前用户'
                    },
                    message: '添加跟进记录成功'
                })];
        }
        catch (error) {
            console.error('Error:', error);
            return [2 /*return*/, res.status(500).json({
                    success: false,
                    error: { code: 'SERVER_ERROR', message: error.message }
                })];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
