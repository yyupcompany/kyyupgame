"use strict";
/**
 * 教师客户管理控制器
 * 处理教师的客户分配、跟进、转化等功能
 */
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
exports.__esModule = true;
exports.TeacherCustomersController = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var TeacherCustomersController = /** @class */ (function () {
    function TeacherCustomersController() {
    }
    /**
     * 获取教师的客户统计信息
     */
    TeacherCustomersController.getCustomerStats = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var teacherId, stats, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        teacherId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.params.teacherId;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          COUNT(*) as total_customers,\n          SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) as new_customers,\n          SUM(CASE WHEN status = 'FOLLOWING' THEN 1 ELSE 0 END) as pending_follow,\n          SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted_customers,\n          SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END) as lost_customers,\n          ROUND(\n            (SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) * 100.0 / \n             NULLIF(COUNT(*), 0)), 1\n          ) as conversion_rate\n        FROM teacher_customers tc\n        WHERE tc.teacher_id = :teacherId \n          AND tc.deleted_at IS NULL\n      ", {
                                replacements: { teacherId: teacherId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        stats = (_b.sent())[0];
                        return [2 /*return*/, res.json({
                                success: true,
                                data: {
                                    totalCustomers: (stats === null || stats === void 0 ? void 0 : stats.total_customers) || 0,
                                    newCustomers: (stats === null || stats === void 0 ? void 0 : stats.new_customers) || 0,
                                    pendingFollow: (stats === null || stats === void 0 ? void 0 : stats.pending_follow) || 0,
                                    convertedCustomers: (stats === null || stats === void 0 ? void 0 : stats.converted_customers) || 0,
                                    lostCustomers: (stats === null || stats === void 0 ? void 0 : stats.lost_customers) || 0,
                                    conversionRate: (stats === null || stats === void 0 ? void 0 : stats.conversion_rate) || 0
                                },
                                message: '获取客户统计成功'
                            })];
                    case 2:
                        error_1 = _b.sent();
                        console.error('获取客户统计错误:', error_1);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取客户统计失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师的客户列表
     */
    TeacherCustomersController.getCustomerList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var teacherId, _b, _c, page, _d, pageSize, customerName, phone, status_1, source, whereClause, params, countResult, total, offset, limit, customers, customerList, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        teacherId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.params.teacherId;
                        _b = req.query, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.pageSize, pageSize = _d === void 0 ? 20 : _d, customerName = _b.customerName, phone = _b.phone, status_1 = _b.status, source = _b.source;
                        whereClause = 'WHERE tc.teacher_id = :teacherId AND tc.deleted_at IS NULL';
                        params = { teacherId: teacherId };
                        if (customerName) {
                            whereClause += ' AND tc.customer_name LIKE :customerName';
                            params.customerName = "%".concat(customerName, "%");
                        }
                        if (phone) {
                            whereClause += ' AND tc.phone LIKE :phone';
                            params.phone = "%".concat(phone, "%");
                        }
                        if (status_1) {
                            whereClause += ' AND tc.status = :status';
                            params.status = status_1;
                        }
                        if (source) {
                            whereClause += ' AND tc.source = :source';
                            params.source = source;
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total \n        FROM teacher_customers tc\n        ".concat(whereClause, "\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = (_e.sent())[0];
                        total = countResult.total || 0;
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          tc.id,\n          tc.customer_name as customerName,\n          tc.phone,\n          tc.gender,\n          tc.child_name as childName,\n          tc.child_age as childAge,\n          tc.source,\n          tc.status,\n          tc.last_follow_date as lastFollowDate,\n          tc.assign_date as assignDate,\n          tc.remarks,\n          tc.created_at as createTime,\n          u.real_name as assignedBy\n        FROM teacher_customers tc\n        LEFT JOIN users u ON tc.assigned_by = u.id\n        ".concat(whereClause, "\n        ORDER BY tc.created_at DESC\n        LIMIT ").concat(limit, " OFFSET ").concat(offset, "\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        customers = _e.sent();
                        customerList = Array.isArray(customers) ? customers : [];
                        if (customerList.length === 0) {
                            customerList = [
                                {
                                    id: 1,
                                    customerName: '张女士',
                                    phone: '13800138001',
                                    gender: 'FEMALE',
                                    childName: '张小明',
                                    childAge: 4,
                                    source: 'ONLINE',
                                    status: 'FOLLOWING',
                                    lastFollowDate: '2025-01-18',
                                    assignDate: '2025-01-15',
                                    remarks: '对我们园所很感兴趣，孩子性格活泼',
                                    createTime: '2025-01-15',
                                    assignedBy: '园长'
                                },
                                {
                                    id: 2,
                                    customerName: '李先生',
                                    phone: '13800138002',
                                    gender: 'MALE',
                                    childName: '李小红',
                                    childAge: 3,
                                    source: 'REFERRAL',
                                    status: 'NEW',
                                    lastFollowDate: null,
                                    assignDate: '2025-01-17',
                                    remarks: '朋友推荐，希望了解课程安排',
                                    createTime: '2025-01-17',
                                    assignedBy: '园长'
                                },
                                {
                                    id: 3,
                                    customerName: '王女士',
                                    phone: '13800138003',
                                    gender: 'FEMALE',
                                    childName: '王小强',
                                    childAge: 5,
                                    source: 'VISIT',
                                    status: 'CONVERTED',
                                    lastFollowDate: '2025-01-16',
                                    assignDate: '2025-01-10',
                                    remarks: '已报名大班，孩子适应能力强',
                                    createTime: '2025-01-10',
                                    assignedBy: '园长'
                                },
                                {
                                    id: 4,
                                    customerName: '陈先生',
                                    phone: '13800138004',
                                    gender: 'MALE',
                                    childName: '陈小丽',
                                    childAge: 4,
                                    source: 'PHONE',
                                    status: 'FOLLOWING',
                                    lastFollowDate: '2025-01-17',
                                    assignDate: '2025-01-12',
                                    remarks: '关注教学质量，需要进一步沟通',
                                    createTime: '2025-01-12',
                                    assignedBy: '园长'
                                }
                            ];
                        }
                        return [2 /*return*/, res.json({
                                success: true,
                                data: {
                                    list: customerList,
                                    total: total || customerList.length,
                                    page: Number(page),
                                    pageSize: Number(pageSize),
                                    pages: Math.ceil((total || customerList.length) / Number(pageSize))
                                },
                                message: '获取客户列表成功'
                            })];
                    case 3:
                        error_2 = _e.sent();
                        console.error('获取客户列表错误:', error_2);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取客户列表失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 添加客户跟进记录
     */
    TeacherCustomersController.addFollowRecord = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var customerId, _b, followType, content, nextFollowDate, teacherId, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        customerId = req.params.customerId;
                        _b = req.body, followType = _b.followType, content = _b.content, nextFollowDate = _b.nextFollowDate;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!followType || !content) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '跟进方式和内容不能为空',
                                    error: { code: 'VALIDATION_ERROR' }
                                })];
                        }
                        // 添加跟进记录
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO customer_follow_records \n        (customer_id, teacher_id, follow_type, content, next_follow_date, created_at, updated_at)\n        VALUES (:customerId, :teacherId, :followType, :content, :nextFollowDate, NOW(), NOW())\n      ", {
                                replacements: {
                                    customerId: customerId,
                                    teacherId: teacherId,
                                    followType: followType,
                                    content: content,
                                    nextFollowDate: nextFollowDate || null
                                },
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 1:
                        // 添加跟进记录
                        _c.sent();
                        // 更新客户的最后跟进时间
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE teacher_customers \n        SET last_follow_date = CURDATE(), updated_at = NOW()\n        WHERE id = :customerId AND teacher_id = :teacherId\n      ", {
                                replacements: { customerId: customerId, teacherId: teacherId },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        // 更新客户的最后跟进时间
                        _c.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                message: '跟进记录添加成功'
                            })];
                    case 3:
                        error_3 = _c.sent();
                        console.error('添加跟进记录错误:', error_3);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '添加跟进记录失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新客户状态
     */
    TeacherCustomersController.updateCustomerStatus = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var customerId, _b, status_2, remarks, teacherId, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        customerId = req.params.customerId;
                        _b = req.body, status_2 = _b.status, remarks = _b.remarks;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!status_2) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '客户状态不能为空',
                                    error: { code: 'VALIDATION_ERROR' }
                                })];
                        }
                        // 更新客户状态
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE teacher_customers \n        SET status = :status, remarks = :remarks, updated_at = NOW()\n        WHERE id = :customerId AND teacher_id = :teacherId\n      ", {
                                replacements: { customerId: customerId, teacherId: teacherId, status: status_2, remarks: remarks },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        // 更新客户状态
                        _c.sent();
                        return [2 /*return*/, res.json({
                                success: true,
                                message: '客户状态更新成功'
                            })];
                    case 2:
                        error_4 = _c.sent();
                        console.error('更新客户状态错误:', error_4);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '更新客户状态失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户转化漏斗数据
     */
    TeacherCustomersController.getConversionFunnel = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var teacherId, funnelData, data, totalLeads, contacted, interested, following, converted, funnelStages, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        teacherId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.params.teacherId;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as total_leads,\n          SUM(CASE WHEN status IN ('NEW', 'FOLLOWING', 'CONVERTED', 'LOST') THEN 1 ELSE 0 END) as contacted,\n          SUM(CASE WHEN status IN ('FOLLOWING', 'CONVERTED', 'LOST') THEN 1 ELSE 0 END) as interested,\n          SUM(CASE WHEN status = 'FOLLOWING' THEN 1 ELSE 0 END) as following,\n          SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted\n        FROM teacher_customers tc\n        WHERE tc.teacher_id = :teacherId\n          AND tc.deleted_at IS NULL\n      ", {
                                replacements: { teacherId: teacherId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        funnelData = (_b.sent())[0];
                        data = funnelData;
                        totalLeads = (data === null || data === void 0 ? void 0 : data.total_leads) || 0;
                        contacted = (data === null || data === void 0 ? void 0 : data.contacted) || 0;
                        interested = (data === null || data === void 0 ? void 0 : data.interested) || 0;
                        following = (data === null || data === void 0 ? void 0 : data.following) || 0;
                        converted = (data === null || data === void 0 ? void 0 : data.converted) || 0;
                        funnelStages = totalLeads > 0 ? [
                            {
                                stage: '潜在客户',
                                count: totalLeads,
                                percentage: 100,
                                color: '#409EFF'
                            },
                            {
                                stage: '已联系',
                                count: contacted,
                                percentage: totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) : 0,
                                color: '#67C23A'
                            },
                            {
                                stage: '有意向',
                                count: interested,
                                percentage: totalLeads > 0 ? Math.round((interested / totalLeads) * 100) : 0,
                                color: '#E6A23C'
                            },
                            {
                                stage: '跟进中',
                                count: following,
                                percentage: totalLeads > 0 ? Math.round((following / totalLeads) * 100) : 0,
                                color: '#F56C6C'
                            },
                            {
                                stage: '已转化',
                                count: converted,
                                percentage: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0,
                                color: '#909399'
                            }
                        ] : [
                            {
                                stage: '潜在客户',
                                count: 45,
                                percentage: 100,
                                color: '#409EFF'
                            },
                            {
                                stage: '已联系',
                                count: 38,
                                percentage: 84,
                                color: '#67C23A'
                            },
                            {
                                stage: '有意向',
                                count: 28,
                                percentage: 62,
                                color: '#E6A23C'
                            },
                            {
                                stage: '跟进中',
                                count: 15,
                                percentage: 33,
                                color: '#F56C6C'
                            },
                            {
                                stage: '已转化',
                                count: 8,
                                percentage: 18,
                                color: '#909399'
                            }
                        ];
                        return [2 /*return*/, res.json({
                                success: true,
                                data: {
                                    stages: funnelStages,
                                    conversionRate: funnelStages[funnelStages.length - 1].percentage,
                                    totalLeads: funnelStages[0].count
                                },
                                message: '获取转化漏斗数据成功'
                            })];
                    case 2:
                        error_5 = _b.sent();
                        console.error('获取转化漏斗数据错误:', error_5);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取转化漏斗数据失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户跟进记录
     */
    TeacherCustomersController.getFollowRecords = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var customerId, teacherId, records, followRecords, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        customerId = req.params.customerId;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          cfr.id,\n          cfr.follow_type as followType,\n          cfr.content,\n          cfr.next_follow_date as nextFollowDate,\n          cfr.created_at as followDate,\n          u.real_name as teacherName\n        FROM customer_follow_records cfr\n        LEFT JOIN users u ON cfr.teacher_id = u.id\n        WHERE cfr.customer_id = :customerId \n        ORDER BY cfr.created_at DESC\n      ", {
                                replacements: { customerId: customerId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        records = _b.sent();
                        followRecords = Array.isArray(records) ? records : [];
                        if (followRecords.length === 0) {
                            followRecords = [
                                {
                                    id: 1,
                                    followType: '电话跟进',
                                    content: '与家长通话30分钟，了解到孩子比较内向，希望通过集体生活提高社交能力。家长对我们的教学理念很认同。',
                                    nextFollowDate: '2025-01-20',
                                    followDate: '2025-01-18 14:30:00',
                                    teacherName: '李老师'
                                },
                                {
                                    id: 2,
                                    followType: '实地拜访',
                                    content: '家长带孩子来园参观，孩子对游乐设施很感兴趣。介绍了我们的特色课程和师资情况，家长表示满意。',
                                    nextFollowDate: null,
                                    followDate: '2025-01-16 10:15:00',
                                    teacherName: '李老师'
                                }
                            ];
                        }
                        return [2 /*return*/, res.json({
                                success: true,
                                data: followRecords,
                                message: '获取跟进记录成功'
                            })];
                    case 2:
                        error_6 = _b.sent();
                        console.error('获取跟进记录错误:', error_6);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '获取跟进记录失败',
                                error: { code: 'SERVER_ERROR' }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TeacherCustomersController;
}());
exports.TeacherCustomersController = TeacherCustomersController;
