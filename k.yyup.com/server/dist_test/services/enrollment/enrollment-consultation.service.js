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
exports.__esModule = true;
exports.EnrollmentConsultationService = void 0;
var sequelize_1 = require("sequelize");
var enrollment_consultation_model_1 = require("../../models/enrollment-consultation.model");
var enrollment_consultation_followup_model_1 = require("../../models/enrollment-consultation-followup.model");
var user_model_1 = require("../../models/user.model");
var kindergarten_model_1 = require("../../models/kindergarten.model");
var init_1 = require("../../init");
/**
 * 招生咨询服务类
 * 处理招生咨询的创建、查询、更新、删除以及统计分析等操作
 */
var EnrollmentConsultationService = /** @class */ (function () {
    function EnrollmentConsultationService() {
    }
    /**
     * 创建招生咨询
     * @param data 创建招生咨询的数据传输对象
     * @param userId 创建人ID
     * @returns 创建的招生咨询
     */
    EnrollmentConsultationService.prototype.createConsultation = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, kindergarten, consultant, consultation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            kindergarten_model_1.Kindergarten.findByPk(data.kindergartenId),
                            user_model_1.User.findByPk(data.consultantId)
                        ])];
                    case 1:
                        _a = _b.sent(), kindergarten = _a[0], consultant = _a[1];
                        if (!kindergarten) {
                            throw new Error('幼儿园不存在');
                        }
                        if (!consultant) {
                            throw new Error('咨询师不存在');
                        }
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.create({
                                kindergartenId: data.kindergartenId,
                                consultantId: data.consultantId,
                                parentName: data.parentName,
                                childName: data.childName,
                                childAge: data.childAge,
                                childGender: data.childGender,
                                contactPhone: data.contactPhone,
                                contactAddress: data.contactAddress || null,
                                sourceChannel: data.sourceChannel,
                                sourceDetail: data.sourceDetail || null,
                                consultContent: data.consultContent,
                                consultMethod: data.consultMethod,
                                consultDate: new Date(data.consultDate),
                                intentionLevel: data.intentionLevel,
                                followupStatus: data.followupStatus || 1,
                                nextFollowupDate: data.nextFollowupDate ? new Date(data.nextFollowupDate) : null,
                                remark: data.remark || null,
                                creatorId: userId,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })];
                    case 2:
                        consultation = _b.sent();
                        return [2 /*return*/, this.formatConsultationResponse(consultation)];
                }
            });
        });
    };
    /**
     * 获取招生咨询详情
     * @param id 招生咨询ID
     * @returns 招生咨询详情
     */
    EnrollmentConsultationService.prototype.getConsultationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, followupCount, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findByPk(id, {
                            include: [
                                { model: user_model_1.User, as: 'consultant', attributes: ['id', 'name'] },
                                { model: kindergarten_model_1.Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
                            ]
                        })];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('招生咨询不存在');
                        }
                        return [4 /*yield*/, enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.count({
                                where: { consultationId: id }
                            })];
                    case 2:
                        followupCount = _a.sent();
                        response = this.formatConsultationResponse(consultation);
                        response.followupCount = followupCount;
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * 更新招生咨询
     * @param data 更新招生咨询的数据传输对象
     * @param userId 更新人ID
     * @returns 更新后的招生咨询
     */
    EnrollmentConsultationService.prototype.updateConsultation = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, updateData, updatedConsultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findByPk(data.id)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('招生咨询不存在');
                        }
                        updateData = {
                            updaterId: userId
                        };
                        if (data.parentName !== undefined)
                            updateData.parentName = data.parentName;
                        if (data.childName !== undefined)
                            updateData.childName = data.childName;
                        if (data.childAge !== undefined)
                            updateData.childAge = data.childAge;
                        if (data.childGender !== undefined)
                            updateData.childGender = data.childGender;
                        if (data.contactPhone !== undefined)
                            updateData.contactPhone = data.contactPhone;
                        if (data.contactAddress !== undefined)
                            updateData.contactAddress = data.contactAddress;
                        if (data.sourceChannel !== undefined)
                            updateData.sourceChannel = data.sourceChannel;
                        if (data.sourceDetail !== undefined)
                            updateData.sourceDetail = data.sourceDetail;
                        if (data.consultContent !== undefined)
                            updateData.consultContent = data.consultContent;
                        if (data.consultMethod !== undefined)
                            updateData.consultMethod = data.consultMethod;
                        if (data.consultDate !== undefined)
                            updateData.consultDate = new Date(data.consultDate);
                        if (data.intentionLevel !== undefined)
                            updateData.intentionLevel = data.intentionLevel;
                        if (data.followupStatus !== undefined)
                            updateData.followupStatus = data.followupStatus;
                        if (data.nextFollowupDate !== undefined)
                            updateData.nextFollowupDate = data.nextFollowupDate ? new Date(data.nextFollowupDate) : null;
                        if (data.remark !== undefined)
                            updateData.remark = data.remark;
                        // 更新咨询记录
                        return [4 /*yield*/, consultation.update(updateData)];
                    case 2:
                        // 更新咨询记录
                        _a.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findByPk(data.id, {
                                include: [
                                    { model: user_model_1.User, as: 'consultant', attributes: ['id', 'name'] },
                                    { model: kindergarten_model_1.Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
                                ]
                            })];
                    case 3:
                        updatedConsultation = _a.sent();
                        return [2 /*return*/, this.formatConsultationResponse(updatedConsultation)];
                }
            });
        });
    };
    /**
     * 删除招生咨询
     * @param id 咨询ID
     * @returns 是否删除成功
     */
    EnrollmentConsultationService.prototype.deleteConsultation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findByPk(id)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('招生咨询记录不存在');
                        }
                        return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // 删除相关的跟进记录
                                        return [4 /*yield*/, enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup.destroy({
                                                where: { consultationId: id },
                                                transaction: transaction
                                            })];
                                        case 1:
                                            // 删除相关的跟进记录
                                            _a.sent();
                                            // 删除咨询记录
                                            return [4 /*yield*/, consultation.destroy({ transaction: transaction })];
                                        case 2:
                                            // 删除咨询记录
                                            _a.sent();
                                            return [2 /*return*/, true];
                                    }
                                });
                            }); })];
                    case 2: 
                    // 使用事务确保数据一致性
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取招生咨询列表
     * @param params 过滤参数
     * @param userInfo 用户信息（用于角色过滤）
     * @returns 招生咨询列表
     */
    EnrollmentConsultationService.prototype.getConsultationList = function (params, userInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, kindergartenId, consultantId, parentName, childName, contactPhone, sourceChannel, intentionLevel, followupStatus, startDate, endDate, needFollowup, _c, sortBy, _d, sortOrder, where, userId, userRole, _e, count, rows, items;
            var _f, _g, _h, _j, _k, _l, _m;
            var _this = this;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, kindergartenId = params.kindergartenId, consultantId = params.consultantId, parentName = params.parentName, childName = params.childName, contactPhone = params.contactPhone, sourceChannel = params.sourceChannel, intentionLevel = params.intentionLevel, followupStatus = params.followupStatus, startDate = params.startDate, endDate = params.endDate, needFollowup = params.needFollowup, _c = params.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = params.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        where = {};
                        // 🔐 角色权限过滤
                        if (userInfo) {
                            userId = userInfo.id, userRole = userInfo.role;
                            // 老师只能看到自己创建的咨询记录
                            if (userRole === 'teacher') {
                                where.creatorId = userId;
                            }
                            // 园长和管理员可以看到所有数据，不需要额外过滤
                            // admin 和 principal 角色不添加额外的 where 条件
                        }
                        if (kindergartenId !== undefined) {
                            where.kindergartenId = kindergartenId;
                        }
                        if (consultantId !== undefined) {
                            where.consultantId = consultantId;
                        }
                        if (parentName) {
                            where.parentName = (_f = {}, _f[sequelize_1.Op.like] = "%".concat(parentName, "%"), _f);
                        }
                        if (childName) {
                            where.childName = (_g = {}, _g[sequelize_1.Op.like] = "%".concat(childName, "%"), _g);
                        }
                        if (contactPhone) {
                            where.contactPhone = (_h = {}, _h[sequelize_1.Op.like] = "%".concat(contactPhone, "%"), _h);
                        }
                        if (sourceChannel !== undefined) {
                            where.sourceChannel = sourceChannel;
                        }
                        if (intentionLevel !== undefined) {
                            where.intentionLevel = intentionLevel;
                        }
                        if (followupStatus !== undefined) {
                            where.followupStatus = followupStatus;
                        }
                        if (startDate && endDate) {
                            where.consultDate = (_j = {},
                                _j[sequelize_1.Op.between] = [new Date(startDate), new Date(endDate)],
                                _j);
                        }
                        else if (startDate) {
                            where.consultDate = (_k = {},
                                _k[sequelize_1.Op.gte] = new Date(startDate),
                                _k);
                        }
                        else if (endDate) {
                            where.consultDate = (_l = {},
                                _l[sequelize_1.Op.lte] = new Date(endDate),
                                _l);
                        }
                        if (needFollowup === true) {
                            where.followupStatus = (_m = {}, _m[sequelize_1.Op["in"]] = [1, 2], _m); // 待跟进或跟进中
                        }
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAndCountAll({
                                where: where,
                                attributes: [
                                    'id', 'kindergartenId', 'consultantId', 'parentName', 'childName',
                                    'childAge', 'childGender', 'contactPhone', 'contactAddress',
                                    'sourceChannel', 'sourceDetail', 'consultContent', 'consultMethod',
                                    'consultDate', 'intentionLevel', 'followupStatus', 'nextFollowupDate',
                                    'remark', 'creatorId', 'updaterId', 'createdAt', 'updatedAt', 'deletedAt'
                                ],
                                include: [
                                    { model: user_model_1.User, as: 'consultant', attributes: ['id', 'realName'] },
                                    { model: kindergarten_model_1.Kindergarten, as: 'kindergarten', attributes: ['id', 'name'] }
                                ],
                                order: [[sortBy, sortOrder]],
                                limit: pageSize,
                                offset: (page - 1) * pageSize
                            })];
                    case 1:
                        _e = _o.sent(), count = _e.count, rows = _e.rows;
                        items = rows.map(function (consultation) { return _this.formatConsultationResponse(consultation); });
                        return [2 /*return*/, {
                                total: count,
                                items: items,
                                page: page,
                                pageSize: pageSize
                            }];
                }
            });
        });
    };
    /**
     * 获取招生咨询统计
     * @param params 过滤参数
     * @returns 招生咨询统计信息
     */
    EnrollmentConsultationService.prototype.getConsultationStatistics = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, startDate, endDate, where, total, bySourceChannel, byIntentionLevel, byFollowupStatus, byConsultMethod, byDate, convertedCount, conversionRate, sourceChannelMap, intentionLevelMap, followupStatusMap, consultMethodMap;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        kindergartenId = params.kindergartenId, startDate = params.startDate, endDate = params.endDate;
                        where = {};
                        if (kindergartenId !== undefined) {
                            where.kindergartenId = kindergartenId;
                        }
                        if (startDate && endDate) {
                            where.consultDate = (_a = {},
                                _a[sequelize_1.Op.between] = [new Date(startDate), new Date(endDate)],
                                _a);
                        }
                        else if (startDate) {
                            where.consultDate = (_b = {},
                                _b[sequelize_1.Op.gte] = new Date(startDate),
                                _b);
                        }
                        else if (endDate) {
                            where.consultDate = (_c = {},
                                _c[sequelize_1.Op.lte] = new Date(endDate),
                                _c);
                        }
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({ where: where })];
                    case 1:
                        total = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAll({
                                attributes: [
                                    'sourceChannel',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                where: where,
                                group: ['sourceChannel'],
                                order: [[sequelize_1.Sequelize.literal('count'), 'DESC']]
                            })];
                    case 2:
                        bySourceChannel = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAll({
                                attributes: [
                                    'intentionLevel',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                where: where,
                                group: ['intentionLevel'],
                                order: [['intentionLevel', 'ASC']]
                            })];
                    case 3:
                        byIntentionLevel = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAll({
                                attributes: [
                                    'followupStatus',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                where: where,
                                group: ['followupStatus'],
                                order: [['followupStatus', 'ASC']]
                            })];
                    case 4:
                        byFollowupStatus = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAll({
                                attributes: [
                                    'consultMethod',
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                where: where,
                                group: ['consultMethod'],
                                order: [[sequelize_1.Sequelize.literal('count'), 'DESC']]
                            })];
                    case 5:
                        byConsultMethod = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.findAll({
                                attributes: [
                                    [sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('consult_date')), 'date'],
                                    [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                                ],
                                where: where,
                                group: [sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('consult_date'))],
                                order: [[sequelize_1.Sequelize.fn('DATE', sequelize_1.Sequelize.col('consult_date')), 'ASC']]
                            })];
                    case 6:
                        byDate = _d.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: __assign(__assign({}, where), { followupStatus: 3 // 已转化
                                 })
                            })];
                    case 7:
                        convertedCount = _d.sent();
                        conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;
                        sourceChannelMap = {
                            1: '线上广告',
                            2: '线下活动',
                            3: '朋友介绍',
                            4: '电话咨询',
                            5: '自主访问',
                            6: '其他'
                        };
                        intentionLevelMap = {
                            1: '非常有意向',
                            2: '有意向',
                            3: '一般',
                            4: '较低',
                            5: '无意向'
                        };
                        followupStatusMap = {
                            1: '待跟进',
                            2: '跟进中',
                            3: '已转化',
                            4: '已放弃'
                        };
                        consultMethodMap = {
                            1: '电话',
                            2: '线下到访',
                            3: '线上咨询',
                            4: '微信',
                            5: '其他'
                        };
                        // 格式化统计结果
                        return [2 /*return*/, {
                                total: total,
                                bySourceChannel: bySourceChannel.map(function (item) { return ({
                                    channel: item.sourceChannel,
                                    channelName: sourceChannelMap[item.sourceChannel] || '未知',
                                    count: Number(item.get('count')),
                                    percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
                                }); }),
                                byIntentionLevel: byIntentionLevel.map(function (item) { return ({
                                    level: item.intentionLevel,
                                    levelName: intentionLevelMap[item.intentionLevel] || '未知',
                                    count: Number(item.get('count')),
                                    percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
                                }); }),
                                byFollowupStatus: byFollowupStatus.map(function (item) { return ({
                                    status: item.followupStatus,
                                    statusName: followupStatusMap[item.followupStatus] || '未知',
                                    count: Number(item.get('count')),
                                    percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
                                }); }),
                                byConsultMethod: byConsultMethod.map(function (item) { return ({
                                    method: item.consultMethod,
                                    methodName: consultMethodMap[item.consultMethod] || '未知',
                                    count: Number(item.get('count')),
                                    percentage: total > 0 ? (Number(item.get('count')) / total) * 100 : 0
                                }); }),
                                byDate: byDate.map(function (item) { return ({
                                    date: String(item.get('date')),
                                    count: Number(item.get('count'))
                                }); }),
                                conversionRate: conversionRate
                            }];
                }
            });
        });
    };
    /**
     * 格式化招生咨询响应对象
     * @param consultation 招生咨询模型实例
     * @returns 格式化后的响应对象
     */
    EnrollmentConsultationService.prototype.formatConsultationResponse = function (consultation) {
        var consultant = consultation.get('consultant');
        var kindergarten = consultation.get('kindergarten');
        // 获取性别文本
        var genderMap = {
            1: '男',
            2: '女'
        };
        // 获取来源渠道文本
        var sourceChannelMap = {
            1: '线上广告',
            2: '线下活动',
            3: '朋友介绍',
            4: '电话咨询',
            5: '自主访问',
            6: '其他'
        };
        // 获取咨询方式文本
        var consultMethodMap = {
            1: '电话',
            2: '线下到访',
            3: '线上咨询',
            4: '微信',
            5: '其他'
        };
        // 获取意向级别文本
        var intentionLevelMap = {
            1: '非常有意向',
            2: '有意向',
            3: '一般',
            4: '较低',
            5: '无意向'
        };
        // 获取跟进状态文本
        var followupStatusMap = {
            1: '待跟进',
            2: '跟进中',
            3: '已转化',
            4: '已放弃'
        };
        return {
            id: consultation.id,
            kindergartenId: consultation.kindergartenId,
            consultantId: consultation.consultantId,
            parentName: consultation.parentName,
            childName: consultation.childName,
            childAge: consultation.childAge,
            childGender: consultation.childGender,
            childGenderText: genderMap[consultation.childGender] || '未知',
            contactPhone: consultation.contactPhone,
            contactAddress: consultation.contactAddress,
            sourceChannel: consultation.sourceChannel,
            sourceChannelText: sourceChannelMap[consultation.sourceChannel] || '未知',
            sourceDetail: consultation.sourceDetail,
            consultContent: consultation.consultContent,
            consultMethod: consultation.consultMethod,
            consultMethodText: consultMethodMap[consultation.consultMethod] || '未知',
            consultDate: consultation.consultDate.toISOString().split('T')[0],
            intentionLevel: consultation.intentionLevel,
            intentionLevelText: intentionLevelMap[consultation.intentionLevel] || '未知',
            followupStatus: consultation.followupStatus,
            followupStatusText: followupStatusMap[consultation.followupStatus] || '未知',
            nextFollowupDate: consultation.nextFollowupDate ? consultation.nextFollowupDate.toISOString().split('T')[0] : null,
            remark: consultation.remark,
            createdAt: consultation.createdAt.toISOString(),
            updatedAt: consultation.updatedAt.toISOString(),
            consultant: consultant ? {
                id: consultant.id,
                name: consultant.name
            } : undefined,
            kindergarten: kindergarten ? {
                id: kindergarten.id,
                name: kindergarten.name
            } : undefined
        };
    };
    return EnrollmentConsultationService;
}());
exports.EnrollmentConsultationService = EnrollmentConsultationService;
