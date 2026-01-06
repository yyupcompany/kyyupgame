"use strict";
/**
 * 财务中心控制器
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.FinanceCenterController = void 0;
var sequelize_1 = require("sequelize");
var finance_model_1 = require("../../models/finance.model");
var database_1 = __importDefault(require("../../database"));
var FinanceCenterController = /** @class */ (function () {
    function FinanceCenterController() {
    }
    /**
     * 获取财务概览数据
     */
    FinanceCenterController.getOverview = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var currentDate, currentMonth, lastMonth, nextMonth, currentMonthPayments, lastMonthPayments, monthlyRevenue, lastMonthRevenue, revenueGrowth, pendingBills, pendingAmount, pendingCount, totalBills, paidBills, collectionRate, overdueBills, overdueAmount, overdueCount, clampPercentage, overview, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        currentDate = new Date();
                        currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                        nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAll({
                                where: {
                                    paymentDate: (_a = {},
                                        _a[sequelize_1.Op.gte] = currentMonth,
                                        _a[sequelize_1.Op.lt] = nextMonth,
                                        _a),
                                    status: 'success'
                                }
                            })];
                    case 1:
                        currentMonthPayments = _c.sent();
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAll({
                                where: {
                                    paymentDate: (_b = {},
                                        _b[sequelize_1.Op.gte] = lastMonth,
                                        _b[sequelize_1.Op.lt] = currentMonth,
                                        _b),
                                    status: 'success'
                                }
                            })];
                    case 2:
                        lastMonthPayments = _c.sent();
                        monthlyRevenue = currentMonthPayments.reduce(function (sum, payment) {
                            return sum + parseFloat(payment.paymentAmount.toString());
                        }, 0);
                        lastMonthRevenue = lastMonthPayments.reduce(function (sum, payment) {
                            return sum + parseFloat(payment.paymentAmount.toString());
                        }, 0);
                        revenueGrowth = lastMonthRevenue > 0
                            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
                            : 0;
                        return [4 /*yield*/, finance_model_1.PaymentBill.findAll({
                                where: {
                                    status: ['pending', 'partial']
                                }
                            })];
                    case 3:
                        pendingBills = _c.sent();
                        pendingAmount = pendingBills.reduce(function (sum, bill) {
                            return sum + parseFloat(bill.remainingAmount.toString());
                        }, 0);
                        pendingCount = pendingBills.length;
                        return [4 /*yield*/, finance_model_1.PaymentBill.count()];
                    case 4:
                        totalBills = _c.sent();
                        return [4 /*yield*/, finance_model_1.PaymentBill.count({
                                where: { status: 'paid' }
                            })];
                    case 5:
                        paidBills = _c.sent();
                        collectionRate = totalBills > 0 ? (paidBills / totalBills * 100) : 0;
                        return [4 /*yield*/, finance_model_1.PaymentBill.findAll({
                                where: {
                                    status: 'overdue'
                                }
                            })];
                    case 6:
                        overdueBills = _c.sent();
                        overdueAmount = overdueBills.reduce(function (sum, bill) {
                            return sum + parseFloat(bill.remainingAmount.toString());
                        }, 0);
                        overdueCount = overdueBills.length;
                        clampPercentage = function (value) {
                            return Math.min(100, Math.max(0, value));
                        };
                        overview = {
                            monthlyRevenue: Math.max(0, Math.round(monthlyRevenue)),
                            revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                            pendingAmount: Math.max(0, Math.round(pendingAmount)),
                            pendingCount: Math.max(0, pendingCount),
                            collectionRate: Math.round(clampPercentage(collectionRate) * 10) / 10,
                            paidCount: Math.max(0, paidBills),
                            totalCount: Math.max(0, totalBills),
                            overdueAmount: Math.max(0, Math.round(overdueAmount)),
                            overdueCount: Math.max(0, overdueCount)
                        };
                        res.json({
                            success: true,
                            data: overview,
                            message: '获取财务概览成功'
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _c.sent();
                        console.error('获取财务概览失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取财务概览失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取收费项目列表
     */
    FinanceCenterController.getFeeItems = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category, status_1, whereCondition, feeItems, formattedItems, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, category = _a.category, status_1 = _a.status;
                        whereCondition = {};
                        if (category) {
                            whereCondition.category = category;
                        }
                        if (status_1) {
                            whereCondition.status = status_1;
                        }
                        else {
                            whereCondition.status = 'active'; // 默认只返回活跃的收费项目
                        }
                        return [4 /*yield*/, finance_model_1.FeeItem.findAll({
                                where: whereCondition,
                                order: [['category', 'ASC'], ['name', 'ASC']]
                            })];
                    case 1:
                        feeItems = _b.sent();
                        formattedItems = feeItems.map(function (item) { return ({
                            id: item.id.toString(),
                            name: item.name,
                            category: item.category,
                            amount: parseFloat(item.amount.toString()),
                            period: item.period,
                            isRequired: item.isRequired,
                            description: item.description,
                            status: item.status
                        }); });
                        res.json({
                            success: true,
                            data: formattedItems,
                            message: '获取收费项目成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('获取收费项目失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取收费项目失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取费用套餐模板列表
     */
    FinanceCenterController.getFeePackageTemplates = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, targetGrade, status_2, whereCondition, templates, formattedTemplates, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, targetGrade = _a.targetGrade, status_2 = _a.status;
                        whereCondition = {};
                        if (targetGrade) {
                            whereCondition.targetGrade = targetGrade;
                        }
                        if (status_2) {
                            whereCondition.status = status_2;
                        }
                        else {
                            whereCondition.status = 'active'; // 默认只返回活跃的套餐
                        }
                        return [4 /*yield*/, finance_model_1.FeePackageTemplate.findAll({
                                where: whereCondition,
                                order: [['targetGrade', 'ASC'], ['name', 'ASC']]
                            })];
                    case 1:
                        templates = _b.sent();
                        formattedTemplates = templates.map(function (template) { return ({
                            id: template.id.toString(),
                            name: template.name,
                            description: template.description,
                            items: template.items,
                            totalAmount: parseFloat(template.totalAmount.toString()),
                            discountRate: template.discountRate ? parseFloat(template.discountRate.toString()) : 0,
                            finalAmount: parseFloat(template.finalAmount.toString()),
                            validPeriod: template.validPeriod,
                            targetGrade: template.targetGrade,
                            status: template.status
                        }); });
                        res.json({
                            success: true,
                            data: formattedTemplates,
                            message: '获取费用套餐模板成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('获取费用套餐模板失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '获取费用套餐模板失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缴费记录列表
     */
    FinanceCenterController.getPaymentRecords = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, limit, status_3, studentName, startDate, endDate, offset, whereCondition, billWhereCondition, _d, paymentRecords, total, formattedRecords, error_4;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, status_3 = _a.status, studentName = _a.studentName, startDate = _a.startDate, endDate = _a.endDate;
                        offset = (Number(page) - 1) * Number(limit);
                        whereCondition = {};
                        if (status_3) {
                            whereCondition.status = status_3;
                        }
                        if (startDate && endDate) {
                            whereCondition.paymentDate = (_e = {},
                                _e[sequelize_1.Op.between] = [new Date(startDate), new Date(endDate)],
                                _e);
                        }
                        billWhereCondition = {};
                        if (studentName) {
                            billWhereCondition.studentName = (_f = {},
                                _f[sequelize_1.Op.like] = "%".concat(studentName, "%"),
                                _f);
                        }
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAndCountAll({
                                where: whereCondition,
                                include: [{
                                        model: finance_model_1.PaymentBill,
                                        as: 'bill',
                                        where: billWhereCondition,
                                        required: true
                                    }],
                                order: [['paymentDate', 'DESC']],
                                limit: Number(limit),
                                offset: offset
                            })];
                    case 1:
                        _d = _g.sent(), paymentRecords = _d.rows, total = _d.count;
                        formattedRecords = paymentRecords.map(function (record) {
                            var bill = record.bill;
                            return {
                                id: record.id.toString(),
                                billId: record.billId.toString(),
                                billNo: (bill === null || bill === void 0 ? void 0 : bill.billNo) || '',
                                studentName: (bill === null || bill === void 0 ? void 0 : bill.studentName) || '',
                                className: (bill === null || bill === void 0 ? void 0 : bill.className) || '',
                                feeItems: (bill === null || bill === void 0 ? void 0 : bill.items) ? bill.items.map(function (item) { return item.feeName; }) : [],
                                paymentAmount: parseFloat(record.paymentAmount.toString()),
                                paymentDate: record.paymentDate.toISOString().split('T')[0],
                                paymentMethod: record.paymentMethod,
                                transactionNo: record.transactionNo,
                                receiptNo: record.receiptNo,
                                payerName: record.payerName,
                                payerPhone: record.payerPhone,
                                status: record.status,
                                remarks: record.remarks
                            };
                        });
                        res.json({
                            success: true,
                            data: {
                                records: formattedRecords,
                                pagination: {
                                    page: Number(page),
                                    limit: Number(limit),
                                    total: total,
                                    totalPages: Math.ceil(total / Number(limit))
                                }
                            },
                            message: '获取缴费记录成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _g.sent();
                        console.error('获取缴费记录失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '获取缴费记录失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取财务报表数据
     */
    FinanceCenterController.getFinancialReports = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, startDate, endDate, currentDate, defaultStartDate_1, defaultEndDate_1, prevStartDate, prevEndDate, currentPayments, previousPayments, currentIncome_1, previousIncome, growth, totalBills, paidBills, collectionRate, pendingRate, feeItems, categoryStats, filteredCategoryStats, reports, error_5;
            var _b, _c, _d, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 7, , 8]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        currentDate = new Date();
                        defaultStartDate_1 = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        defaultEndDate_1 = endDate ? new Date(endDate) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                        prevStartDate = new Date(defaultStartDate_1.getFullYear(), defaultStartDate_1.getMonth() - 1, 1);
                        prevEndDate = new Date(defaultStartDate_1.getFullYear(), defaultStartDate_1.getMonth(), 0);
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAll({
                                where: {
                                    paymentDate: (_b = {},
                                        _b[sequelize_1.Op.between] = [defaultStartDate_1, defaultEndDate_1],
                                        _b),
                                    status: 'success'
                                }
                            })];
                    case 1:
                        currentPayments = _f.sent();
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAll({
                                where: {
                                    paymentDate: (_c = {},
                                        _c[sequelize_1.Op.between] = [prevStartDate, prevEndDate],
                                        _c),
                                    status: 'success'
                                }
                            })];
                    case 2:
                        previousPayments = _f.sent();
                        currentIncome_1 = currentPayments.reduce(function (sum, payment) {
                            return sum + parseFloat(payment.paymentAmount.toString());
                        }, 0);
                        previousIncome = previousPayments.reduce(function (sum, payment) {
                            return sum + parseFloat(payment.paymentAmount.toString());
                        }, 0);
                        growth = previousIncome > 0 ? ((currentIncome_1 - previousIncome) / previousIncome * 100) : 0;
                        return [4 /*yield*/, finance_model_1.PaymentBill.count({
                                where: {
                                    createdAt: (_d = {},
                                        _d[sequelize_1.Op.between] = [defaultStartDate_1, defaultEndDate_1],
                                        _d)
                                }
                            })];
                    case 3:
                        totalBills = _f.sent();
                        return [4 /*yield*/, finance_model_1.PaymentBill.count({
                                where: {
                                    status: 'paid',
                                    createdAt: (_e = {},
                                        _e[sequelize_1.Op.between] = [defaultStartDate_1, defaultEndDate_1],
                                        _e)
                                }
                            })];
                    case 4:
                        paidBills = _f.sent();
                        collectionRate = totalBills > 0 ? (paidBills / totalBills * 100) : 0;
                        pendingRate = 100 - collectionRate;
                        return [4 /*yield*/, finance_model_1.FeeItem.findAll({
                                where: { status: 'active' }
                            })];
                    case 5:
                        feeItems = _f.sent();
                        return [4 /*yield*/, Promise.all(feeItems.map(function (feeItem) { return __awaiter(_this, void 0, void 0, function () {
                                var categoryPayments, amount;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, database_1["default"].sequelize.query("\n            SELECT SUM(pr.payment_amount) as total_amount\n            FROM payment_records pr\n            JOIN payment_bills pb ON pr.bill_id = pb.id\n            WHERE pr.payment_date BETWEEN :startDate AND :endDate\n            AND pr.status = 'success'\n            AND JSON_SEARCH(pb.items, 'one', :feeName) IS NOT NULL\n          ", {
                                                replacements: {
                                                    startDate: defaultStartDate_1,
                                                    endDate: defaultEndDate_1,
                                                    feeName: feeItem.name
                                                },
                                                type: sequelize_1.QueryTypes.SELECT
                                            })];
                                        case 1:
                                            categoryPayments = _b.sent();
                                            amount = ((_a = categoryPayments[0]) === null || _a === void 0 ? void 0 : _a.total_amount) || 0;
                                            return [2 /*return*/, {
                                                    category: feeItem.name,
                                                    amount: parseFloat(amount.toString()),
                                                    percentage: currentIncome_1 > 0 ? (parseFloat(amount.toString()) / currentIncome_1 * 100) : 0
                                                }];
                                    }
                                });
                            }); }))];
                    case 6:
                        categoryStats = _f.sent();
                        filteredCategoryStats = categoryStats
                            .filter(function (stat) { return stat.amount > 0; })
                            .sort(function (a, b) { return b.amount - a.amount; });
                        reports = {
                            monthlyIncome: {
                                current: Math.round(currentIncome_1),
                                previous: Math.round(previousIncome),
                                growth: Math.round(growth * 10) / 10
                            },
                            feeCollection: {
                                collected: Math.round(collectionRate * 10) / 10,
                                pending: Math.round(pendingRate * 10) / 10
                            },
                            categoryBreakdown: filteredCategoryStats.map(function (stat) { return ({
                                category: stat.category,
                                amount: Math.round(stat.amount),
                                percentage: Math.round(stat.percentage * 10) / 10
                            }); })
                        };
                        res.json({
                            success: true,
                            data: reports,
                            message: '获取财务报表成功'
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _f.sent();
                        console.error('获取财务报表失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '获取财务报表失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生财务联动数据
     */
    FinanceCenterController.getEnrollmentFinanceData = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, startDate, endDate, currentDate, defaultStartDate, defaultEndDate, enrollmentFeeItems, registrationFee, depositFee, totalCollected, _i, enrollmentFeeItems_1, feeItem, payments, amount, newStudentPayments, formattedPayments, data, error_6;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        _b = req.query, startDate = _b.startDate, endDate = _b.endDate;
                        currentDate = new Date();
                        defaultStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        defaultEndDate = endDate ? new Date(endDate) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                        return [4 /*yield*/, finance_model_1.FeeItem.findAll({
                                where: {
                                    name: (_c = {},
                                        _c[sequelize_1.Op["in"]] = ['报名费', '入园费', '押金', '注册费'],
                                        _c),
                                    status: 'active'
                                }
                            })];
                    case 1:
                        enrollmentFeeItems = _d.sent();
                        registrationFee = 0;
                        depositFee = 0;
                        totalCollected = 0;
                        _i = 0, enrollmentFeeItems_1 = enrollmentFeeItems;
                        _d.label = 2;
                    case 2:
                        if (!(_i < enrollmentFeeItems_1.length)) return [3 /*break*/, 5];
                        feeItem = enrollmentFeeItems_1[_i];
                        return [4 /*yield*/, database_1["default"].sequelize.query("\n          SELECT SUM(pr.payment_amount) as total_amount\n          FROM payment_records pr\n          JOIN payment_bills pb ON pr.bill_id = pb.id\n          WHERE pr.payment_date BETWEEN :startDate AND :endDate\n          AND pr.status = 'success'\n          AND JSON_SEARCH(pb.items, 'one', :feeName) IS NOT NULL\n        ", {
                                replacements: {
                                    startDate: defaultStartDate,
                                    endDate: defaultEndDate,
                                    feeName: feeItem.name
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        payments = _d.sent();
                        amount = parseFloat(((_a = payments[0]) === null || _a === void 0 ? void 0 : _a.total_amount) || '0');
                        totalCollected += amount;
                        if (feeItem.name.includes('报名') || feeItem.name.includes('注册')) {
                            registrationFee += amount;
                        }
                        else if (feeItem.name.includes('押金') || feeItem.name.includes('入园')) {
                            depositFee += amount;
                        }
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, database_1["default"].sequelize.query("\n        SELECT\n          pb.student_name,\n          pb.created_at as enrollment_date,\n          SUM(pr.payment_amount) as fees_collected,\n          CASE\n            WHEN pb.status = 'paid' THEN 'completed'\n            WHEN pb.status = 'partial' THEN 'partial'\n            ELSE 'pending'\n          END as status\n        FROM payment_bills pb\n        JOIN payment_records pr ON pr.bill_id = pb.id\n        WHERE pb.created_at BETWEEN :startDate AND :endDate\n        AND pr.status = 'success'\n        GROUP BY pb.id, pb.student_name, pb.created_at, pb.status\n        ORDER BY pb.created_at DESC\n        LIMIT 10\n      ", {
                            replacements: {
                                startDate: defaultStartDate,
                                endDate: defaultEndDate
                            },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 6:
                        newStudentPayments = _d.sent();
                        formattedPayments = newStudentPayments.map(function (payment) { return ({
                            studentName: payment.student_name,
                            enrollmentDate: new Date(payment.enrollment_date).toISOString().split('T')[0],
                            feesCollected: Math.round(parseFloat(payment.fees_collected)),
                            status: payment.status
                        }); });
                        data = {
                            enrollmentFees: {
                                registrationFee: Math.round(registrationFee),
                                depositFee: Math.round(depositFee),
                                totalCollected: Math.round(totalCollected)
                            },
                            newStudentPayments: formattedPayments
                        };
                        res.json({
                            success: true,
                            data: data,
                            message: '获取招生财务联动数据成功'
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _d.sent();
                        console.error('获取招生财务联动数据失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '获取招生财务联动数据失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日缴费数据
     */
    FinanceCenterController.getTodayPayments = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfDay, endOfDay, todayPayments, todayAmount, todayCount, data, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                        return [4 /*yield*/, finance_model_1.PaymentRecord.findAll({
                                where: {
                                    paymentDate: (_a = {},
                                        _a[sequelize_1.Op.gte] = startOfDay,
                                        _a[sequelize_1.Op.lt] = endOfDay,
                                        _a),
                                    status: 'success'
                                },
                                order: [['paymentDate', 'DESC']],
                                limit: 20
                            })];
                    case 1:
                        todayPayments = _b.sent();
                        todayAmount = todayPayments.reduce(function (sum, payment) {
                            return sum + parseFloat(payment.paymentAmount.toString());
                        }, 0);
                        todayCount = todayPayments.length;
                        data = {
                            todayAmount: todayAmount,
                            todayCount: todayCount,
                            payments: todayPayments
                        };
                        res.json({
                            success: true,
                            data: data,
                            message: '今日缴费数据获取成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        console.error('获取今日缴费数据失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '获取今日缴费数据失败',
                            error: error_7 instanceof Error ? error_7.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FinanceCenterController;
}());
exports.FinanceCenterController = FinanceCenterController;
