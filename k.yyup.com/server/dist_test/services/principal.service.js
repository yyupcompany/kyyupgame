"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.PrincipalService = void 0;
var base_service_1 = require("./base.service");
var database_1 = __importDefault(require("../database"));
var PrincipalService = /** @class */ (function (_super) {
    __extends(PrincipalService, _super);
    function PrincipalService() {
        return _super.call(this) || this;
    }
    /**
     * 获取园区概览
     */
    PrincipalService.prototype.getCampusOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, classroomCount, occupiedClassroomCount, totalStudents, totalTeachers, recentActivities, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                database_1["default"].classes.count(),
                                database_1["default"].classes.count({ where: { status: 'active' } }),
                                database_1["default"].students.count(),
                                database_1["default"].teachers.count(),
                                database_1["default"].activities.findAll({
                                    limit: 5,
                                    order: [['createdAt', 'DESC']],
                                    attributes: ['id', 'title', 'startTime', 'endTime', 'location', 'description']
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), classroomCount = _a[0], occupiedClassroomCount = _a[1], totalStudents = _a[2], totalTeachers = _a[3], recentActivities = _a[4];
                        return [2 /*return*/, {
                                id: "1",
                                name: "阳光幼儿园",
                                address: "北京市海淀区中关村大街1号",
                                area: 5000,
                                classroomCount: classroomCount,
                                occupiedClassroomCount: occupiedClassroomCount,
                                outdoorPlaygroundArea: 2000,
                                indoorPlaygroundArea: 800,
                                establishedYear: 2010,
                                principalName: "王园长",
                                contactPhone: "010-88888888",
                                email: "principal@example.com",
                                description: "阳光幼儿园是一所综合性幼儿园，致力于为3-6岁儿童提供优质的学前教育。",
                                images: [
                                    "/images/campus/1.jpg",
                                    "/images/campus/2.jpg",
                                    "/images/campus/3.jpg"
                                ],
                                facilities: [
                                    {
                                        id: "1",
                                        name: "室内游泳池",
                                        status: "正常"
                                    },
                                    {
                                        id: "2",
                                        name: "多功能厅",
                                        status: "正常"
                                    },
                                    {
                                        id: "3",
                                        name: "图书室",
                                        status: "正常"
                                    }
                                ],
                                events: recentActivities.map(function (activity) { return ({
                                    id: activity.id.toString(),
                                    title: activity.title,
                                    startTime: activity.startTime,
                                    endTime: activity.endTime,
                                    location: activity.location || '待定',
                                    description: activity.description
                                }); })
                            }];
                    case 2:
                        error_1 = _b.sent();
                        this.logger.error('获取园区概览失败:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取待审批列表
     */
    PrincipalService.prototype.getApprovalList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var where, approvals, items, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        where = {};
                        if (params.status) {
                            where.status = params.status;
                        }
                        if (params.type) {
                            where.type = params.type;
                        }
                        return [4 /*yield*/, database_1["default"].approvals.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: database_1["default"].users,
                                        as: 'requester',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                    {
                                        model: database_1["default"].users,
                                        as: 'approver',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                order: [['requestedAt', 'DESC']],
                                limit: params.pageSize,
                                offset: (params.page - 1) * params.pageSize
                            })];
                    case 1:
                        approvals = _a.sent();
                        items = approvals.rows.map(function (approval) {
                            var _a, _b;
                            return ({
                                id: approval.id.toString(),
                                title: approval.title,
                                type: approval.type,
                                requestBy: ((_a = approval.requester) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = approval.requester) === null || _b === void 0 ? void 0 : _b.username) || '未知用户',
                                requestTime: approval.requestedAt,
                                status: approval.status,
                                urgency: approval.urgency,
                                description: approval.description || '',
                                deadline: approval.deadline,
                                requestAmount: approval.requestAmount
                            });
                        });
                        return [2 /*return*/, {
                                items: items,
                                total: approvals.count
                            }];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('获取待审批列表失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理审批
     */
    PrincipalService.prototype.handleApproval = function (id, action, userId, comment) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var approval, newStatus, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, database_1["default"].approvals.findByPk(id, {
                                include: [
                                    {
                                        model: database_1["default"].users,
                                        as: 'requester',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ]
                            })];
                    case 1:
                        approval = _c.sent();
                        if (!approval) {
                            throw new Error('审批记录不存在');
                        }
                        if (approval.status !== 'PENDING') {
                            throw new Error('该审批已经处理过了');
                        }
                        newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
                        return [4 /*yield*/, approval.update({
                                status: newStatus,
                                approvedBy: userId,
                                approvedAt: new Date(),
                                comment: comment || null
                            })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, {
                                id: approval.id.toString(),
                                title: approval.title,
                                type: approval.type,
                                requestBy: ((_a = approval.requester) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = approval.requester) === null || _b === void 0 ? void 0 : _b.username) || '未知用户',
                                requestTime: approval.requestedAt,
                                status: newStatus,
                                urgency: approval.urgency,
                                description: approval.description || '',
                                approvedBy: userId,
                                approvedAt: new Date().toISOString(),
                                comment: comment
                            }];
                    case 3:
                        error_3 = _c.sent();
                        this.logger.error('处理审批失败:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取重要通知
     */
    PrincipalService.prototype.getImportantNotices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var notices, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, database_1["default"].notifications.findAll({
                                where: {
                                    status: 'published'
                                },
                                order: [['createdAt', 'DESC']],
                                limit: 10,
                                attributes: ['id', 'title', 'content', 'createdAt']
                            })];
                    case 1:
                        notices = _a.sent();
                        return [2 /*return*/, notices.map(function (notice) { return ({
                                id: notice.id.toString(),
                                title: notice.title,
                                content: notice.content,
                                publishTime: notice.createdAt,
                                expireTime: null,
                                importance: 'HIGH',
                                readCount: 0,
                                totalCount: 24 // 可以后续实现总人数统计
                            }); })];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('获取重要通知失败:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发布通知
     */
    PrincipalService.prototype.publishNotice = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var notice, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, database_1["default"].notifications.create({
                                title: data.title,
                                content: data.content,
                                senderId: data.publisherId,
                                status: 'published',
                                type: 'system',
                                userId: 0 // Required field, using placeholder
                            })];
                    case 1:
                        notice = _a.sent();
                        return [2 /*return*/, {
                                id: notice.id.toString(),
                                title: notice.title,
                                content: notice.content,
                                publishTime: notice.createdAt,
                                expireTime: null,
                                importance: 'HIGH',
                                readCount: 0,
                                totalCount: 24 // 可以根据recipientType计算
                            }];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error('发布通知失败:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取园长工作安排
     */
    PrincipalService.prototype.getPrincipalSchedule = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var schedules, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, database_1["default"].schedules.findAll({
                                where: {
                                    userId: userId,
                                    startTime: (_a = {},
                                        _a[database_1["default"].Sequelize.Op.gte] = new Date(),
                                        _a)
                                },
                                order: [['startTime', 'ASC']],
                                limit: 20
                            })];
                    case 1:
                        schedules = _b.sent();
                        return [2 /*return*/, schedules.map(function (schedule) { return ({
                                id: schedule.id.toString(),
                                title: schedule.title,
                                startTime: schedule.startTime,
                                endTime: schedule.endTime,
                                location: schedule.location,
                                description: schedule.description
                            }); })];
                    case 2:
                        error_6 = _b.sent();
                        this.logger.error('获取园长工作安排失败:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建园长日程安排
     */
    PrincipalService.prototype.createPrincipalSchedule = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var schedule, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, database_1["default"].schedules.create({
                                title: data.title,
                                startTime: new Date(data.startTime),
                                endTime: new Date(data.endTime),
                                location: data.location,
                                description: data.description,
                                userId: data.userId,
                                type: 'task',
                                status: 'pending'
                            })];
                    case 1:
                        schedule = _a.sent();
                        return [2 /*return*/, {
                                id: schedule.id.toString(),
                                title: schedule.title,
                                startTime: schedule.startTime,
                                endTime: schedule.endTime,
                                location: schedule.location,
                                description: schedule.description
                            }];
                    case 2:
                        error_7 = _a.sent();
                        this.logger.error('创建园长日程安排失败:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取仪表板统计
     */
    PrincipalService.prototype.getDashboardStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, totalStudents, totalTeachers, totalClasses, activeActivities, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                database_1["default"].students.count(),
                                database_1["default"].teachers.count(),
                                database_1["default"].classes.count(),
                                database_1["default"].activities.count({ where: { status: 1 } })
                            ])];
                    case 1:
                        _a = _b.sent(), totalStudents = _a[0], totalTeachers = _a[1], totalClasses = _a[2], activeActivities = _a[3];
                        return [2 /*return*/, {
                                totalStudents: totalStudents,
                                totalTeachers: totalTeachers,
                                totalClasses: totalClasses,
                                activeActivities: activeActivities,
                                statistics: {
                                    attendance: 95.2,
                                    satisfaction: 4.8,
                                    enrollment: 89.3
                                }
                            }];
                    case 2:
                        error_8 = _b.sent();
                        this.logger.error('获取仪表板统计失败:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动列表
     */
    PrincipalService.prototype.getActivities = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var where, _a, count, rows, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        where = {};
                        if (params.status) {
                            where.status = params.status === 'active' ? 1 : 0;
                        }
                        return [4 /*yield*/, database_1["default"].activities.findAndCountAll({
                                where: where,
                                order: [['createdAt', 'DESC']],
                                offset: (params.page - 1) * params.pageSize,
                                limit: params.pageSize,
                                attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'registeredCount', 'status', 'createdAt']
                            })];
                    case 1:
                        _a = _b.sent(), count = _a.count, rows = _a.rows;
                        return [2 /*return*/, {
                                total: count,
                                list: rows.map(function (activity) { return ({
                                    id: activity.id.toString(),
                                    title: activity.title,
                                    description: activity.description,
                                    startTime: activity.startTime,
                                    endTime: activity.endTime,
                                    location: activity.location,
                                    capacity: activity.capacity,
                                    registeredCount: activity.registeredCount,
                                    status: activity.status === 1 ? 'active' : 'inactive',
                                    createdAt: activity.createdAt
                                }); }),
                                page: params.page,
                                pageSize: params.pageSize
                            }];
                    case 2:
                        error_9 = _b.sent();
                        this.logger.error('获取活动列表失败:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生趋势数据
     */
    PrincipalService.prototype.getEnrollmentTrend = function (period) {
        return __awaiter(this, void 0, void 0, function () {
            var trendData;
            return __generator(this, function (_a) {
                try {
                    trendData = {
                        week: [
                            { period: '2024-01-01', value: 12 },
                            { period: '2024-01-08', value: 15 },
                            { period: '2024-01-15', value: 18 },
                            { period: '2024-01-22', value: 14 },
                            { period: '2024-01-29', value: 20 }
                        ],
                        month: [
                            { period: '2024-01', value: 65 },
                            { period: '2024-02', value: 72 },
                            { period: '2024-03', value: 58 },
                            { period: '2024-04', value: 80 },
                            { period: '2024-05', value: 75 }
                        ],
                        year: [
                            { period: '2021', value: 450 },
                            { period: '2022', value: 520 },
                            { period: '2023', value: 680 },
                            { period: '2024', value: 750 }
                        ]
                    };
                    return [2 /*return*/, trendData[period] || trendData.month];
                }
                catch (error) {
                    this.logger.error('获取招生趋势数据失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取客户池统计数据
     */
    PrincipalService.prototype.getCustomerPoolStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟数据，实际应该从数据库查询
                    return [2 /*return*/, {
                            totalCustomers: 1250,
                            newCustomersThisMonth: 85,
                            unassignedCustomers: 28,
                            convertedCustomersThisMonth: 42
                        }];
                }
                catch (error) {
                    this.logger.error('获取客户池统计数据失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取客户池列表
     */
    PrincipalService.prototype.getCustomerPoolList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                try {
                    items = [
                        {
                            id: 1,
                            name: '王小明',
                            phone: '13800138001',
                            source: '网络推广',
                            status: 'new',
                            teacher: '李老师',
                            createdAt: '2024-01-15',
                            lastFollowUp: '2024-01-20'
                        },
                        {
                            id: 2,
                            name: '张小红',
                            phone: '13800138002',
                            source: '朋友推荐',
                            status: 'contacted',
                            teacher: '王老师',
                            createdAt: '2024-01-12',
                            lastFollowUp: '2024-01-18'
                        }
                    ];
                    return [2 /*return*/, {
                            items: items,
                            total: 2,
                            page: parseInt(params.page || '1'),
                            pageSize: parseInt(params.pageSize || '10')
                        }];
                }
                catch (error) {
                    this.logger.error('获取客户池列表失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取绩效统计数据
     */
    PrincipalService.prototype.getPerformanceStats = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟数据，实际应该从数据库查询
                    return [2 /*return*/, {
                            totalEnrollments: 156,
                            monthlyEnrollments: 28,
                            avgConversionRate: 18.5,
                            totalCommission: 45600,
                            enrollmentTrend: [
                                { period: '2024-01', value: 25 },
                                { period: '2024-02', value: 30 },
                                { period: '2024-03', value: 28 },
                                { period: '2024-04', value: 35 },
                                { period: '2024-05', value: 32 }
                            ]
                        }];
                }
                catch (error) {
                    this.logger.error('获取绩效统计数据失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取绩效排名数据
     */
    PrincipalService.prototype.getPerformanceRankings = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟数据，实际应该从数据库查询
                    return [2 /*return*/, [
                            { id: 1, name: '李老师', value: 45 },
                            { id: 2, name: '王老师', value: 38 },
                            { id: 3, name: '张老师', value: 32 },
                            { id: 4, name: '陈老师', value: 28 },
                            { id: 5, name: '刘老师', value: 25 }
                        ]];
                }
                catch (error) {
                    this.logger.error('获取绩效排名数据失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取绩效详情数据
     */
    PrincipalService.prototype.getPerformanceDetails = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                try {
                    items = [
                        {
                            id: 1,
                            name: '李老师',
                            leads: 120,
                            followups: 85,
                            visits: 45,
                            applications: 28,
                            enrollments: 18,
                            commission: 8500
                        },
                        {
                            id: 2,
                            name: '王老师',
                            leads: 98,
                            followups: 72,
                            visits: 38,
                            applications: 22,
                            enrollments: 15,
                            commission: 7200
                        }
                    ];
                    return [2 /*return*/, {
                            items: items,
                            total: 2,
                            page: parseInt(params.page || '1'),
                            pageSize: parseInt(params.pageSize || '10')
                        }];
                }
                catch (error) {
                    this.logger.error('获取绩效详情数据失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取客户详情
     */
    PrincipalService.prototype.getCustomerDetail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟数据，实际应该从数据库查询
                    return [2 /*return*/, {
                            id: id,
                            name: '王小明',
                            phone: '13800138001',
                            email: 'wangxiaoming@example.com',
                            source: '网络推广',
                            status: 'contacted',
                            teacher: '李老师',
                            createdAt: '2024-01-15',
                            lastFollowUp: '2024-01-20',
                            followUps: [
                                {
                                    id: 1,
                                    content: '已电话联系，家长有意向',
                                    type: 'phone',
                                    createdAt: '2024-01-20'
                                }
                            ]
                        }];
                }
                catch (error) {
                    this.logger.error('获取客户详情失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 分配客户给教师
     */
    PrincipalService.prototype.assignCustomerTeacher = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟处理，实际应该更新数据库
                    return [2 /*return*/, {
                            id: data.customerId,
                            teacherId: data.teacherId,
                            remark: data.remark,
                            assignedAt: new Date().toISOString()
                        }];
                }
                catch (error) {
                    this.logger.error('分配客户给教师失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 批量分配客户给教师
     */
    PrincipalService.prototype.batchAssignCustomerTeacher = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟处理，实际应该批量更新数据库
                    return [2 /*return*/, {
                            customerIds: data.customerIds,
                            teacherId: data.teacherId,
                            remark: data.remark,
                            assignedCount: data.customerIds.length,
                            assignedAt: new Date().toISOString()
                        }];
                }
                catch (error) {
                    this.logger.error('批量分配客户给教师失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 删除客户
     */
    PrincipalService.prototype.deleteCustomer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟处理，实际应该删除数据库记录
                    return [2 /*return*/, {
                            id: id,
                            deletedAt: new Date().toISOString()
                        }];
                }
                catch (error) {
                    this.logger.error('删除客户失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 添加客户跟进记录
     */
    PrincipalService.prototype.addCustomerFollowUp = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 模拟处理，实际应该添加到数据库
                    return [2 /*return*/, {
                            id: Math.floor(Math.random() * 1000),
                            customerId: id,
                            content: data.content,
                            type: data.type,
                            createdAt: new Date().toISOString()
                        }];
                }
                catch (error) {
                    this.logger.error('添加客户跟进记录失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    return PrincipalService;
}(base_service_1.BaseService));
exports.PrincipalService = PrincipalService;
