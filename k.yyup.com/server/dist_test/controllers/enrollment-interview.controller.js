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
exports.__esModule = true;
exports.getInterviewStats = exports.getInterviews = exports.deleteInterview = exports.updateInterview = exports.getInterviewById = exports.createInterview = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
/**
 * 创建面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var createInterview = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, applicationId, interviewDate, interviewerId, location_1, _b, status_1, notes, _c, durationMinutes, applications, interviewers, result, interviewId, interviews, interview, error_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 5, , 6]);
                userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
                }
                _a = req.body, applicationId = _a.applicationId, interviewDate = _a.interviewDate, interviewerId = _a.interviewerId, location_1 = _a.location, _b = _a.status, status_1 = _b === void 0 ? 'scheduled' : _b, notes = _a.notes, _c = _a.durationMinutes, durationMinutes = _c === void 0 ? 30 : _c;
                // 验证必填字段
                if (!applicationId || !interviewDate || !interviewerId) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '缺少必填字段：applicationId, interviewDate, interviewerId'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM enrollment_applications \n      WHERE id = :applicationId AND deleted_at IS NULL\n    ", {
                        replacements: { applicationId: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                applications = _e.sent();
                if (!applications || applications.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '申请记录不存在'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM users \n      WHERE id = :interviewerId AND status = 'active'\n    ", {
                        replacements: { interviewerId: interviewerId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                interviewers = _e.sent();
                if (!interviewers || interviewers.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '面试官不存在'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      INSERT INTO enrollment_interviews \n      (application_id, interview_date, interviewer_id, location, status, notes, duration_minutes, created_by)\n      VALUES (:applicationId, :interviewDate, :interviewerId, :location, :status, :notes, :durationMinutes, :userId)\n    ", {
                        replacements: {
                            applicationId: applicationId,
                            interviewDate: interviewDate,
                            interviewerId: interviewerId,
                            location: location_1,
                            status: status_1,
                            notes: notes,
                            durationMinutes: durationMinutes,
                            userId: userId
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 3:
                result = _e.sent();
                interviewId = result[0];
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ei.*,\n        ea.student_name,\n        pu.real_name as parent_name,\n        u.real_name as interviewer_name\n      FROM enrollment_interviews ei\n      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users pu ON p.user_id = pu.id\n      LEFT JOIN users u ON ei.interviewer_id = u.id\n      WHERE ei.id = :id\n    ", {
                        replacements: { id: interviewId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                interviews = _e.sent();
                interview = interviews[0];
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: '创建面试记录成功',
                        data: {
                            id: interview.id,
                            applicationId: interview.application_id,
                            interviewDate: interview.interview_date,
                            interviewerId: interview.interviewer_id,
                            location: interview.location,
                            status: interview.status,
                            notes: interview.notes,
                            durationMinutes: interview.duration_minutes,
                            createdBy: interview.created_by,
                            createdAt: interview.created_at,
                            updatedAt: interview.updated_at,
                            interviewer: {
                                id: interview.interviewer_id,
                                name: interview.interviewer_name
                            },
                            application: {
                                id: interview.application_id,
                                studentName: interview.student_name
                            }
                        }
                    })];
            case 5:
                error_1 = _e.sent();
                console.error('创建面试记录失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '创建面试记录失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.createInterview = createInterview;
/**
 * 获取面试记录详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getInterviewById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, interviews, interview, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                if (!id || isNaN(parseInt(id, 10) || 0)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的面试记录ID'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ei.*,\n        ea.student_name,\n        pu.real_name as parent_name,\n        u.real_name as interviewer_name\n      FROM enrollment_interviews ei\n      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users pu ON p.user_id = pu.id\n      LEFT JOIN users u ON ei.interviewer_id = u.id\n      WHERE ei.id = :id AND ei.deleted_at IS NULL\n    ", {
                        replacements: { id: parseInt(id, 10) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                interviews = _a.sent();
                if (!interviews || interviews.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '面试记录不存在'
                        })];
                }
                interview = interviews[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取面试记录详情成功',
                        data: {
                            id: interview.id,
                            applicationId: interview.application_id,
                            interviewDate: interview.interview_date,
                            interviewerId: interview.interviewer_id,
                            location: interview.location,
                            status: interview.status,
                            score: interview.score,
                            feedback: interview.feedback,
                            notes: interview.notes,
                            durationMinutes: interview.duration_minutes,
                            createdBy: interview.created_by,
                            createdAt: interview.created_at,
                            updatedAt: interview.updated_at,
                            interviewer: {
                                id: interview.interviewer_id,
                                name: interview.interviewer_name
                            },
                            application: {
                                id: interview.application_id,
                                studentName: interview.student_name,
                                parentName: interview.parent_name
                            }
                        }
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('获取面试记录详情失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '获取面试记录详情失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getInterviewById = getInterviewById;
/**
 * 更新面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateInterview = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, interviewDate, location_2, status_2, score, feedback, notes, durationMinutes, existingInterviews, updateFields, replacements, updatedInterviews, interview, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
                }
                if (!id || isNaN(parseInt(id, 10) || 0)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的面试记录ID'
                        })];
                }
                _a = req.body, interviewDate = _a.interviewDate, location_2 = _a.location, status_2 = _a.status, score = _a.score, feedback = _a.feedback, notes = _a.notes, durationMinutes = _a.durationMinutes;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM enrollment_interviews \n      WHERE id = :id AND deleted_at IS NULL\n    ", {
                        replacements: { id: parseInt(id, 10) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingInterviews = _c.sent();
                if (!existingInterviews || existingInterviews.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '面试记录不存在'
                        })];
                }
                updateFields = [];
                replacements = { id: parseInt(id, 10) || 0 };
                if (interviewDate !== undefined) {
                    updateFields.push('interview_date = :interviewDate');
                    replacements.interviewDate = interviewDate;
                }
                if (location_2 !== undefined) {
                    updateFields.push('location = :location');
                    replacements.location = location_2;
                }
                if (status_2 !== undefined) {
                    updateFields.push('status = :status');
                    replacements.status = status_2;
                }
                if (score !== undefined) {
                    updateFields.push('score = :score');
                    replacements.score = score;
                }
                if (feedback !== undefined) {
                    updateFields.push('feedback = :feedback');
                    replacements.feedback = feedback;
                }
                if (notes !== undefined) {
                    updateFields.push('notes = :notes');
                    replacements.notes = notes;
                }
                if (durationMinutes !== undefined) {
                    updateFields.push('duration_minutes = :durationMinutes');
                    replacements.durationMinutes = durationMinutes;
                }
                if (updateFields.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '没有提供要更新的字段'
                        })];
                }
                // 执行更新
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE enrollment_interviews \n      SET ".concat(updateFields.join(', '), ", updated_at = NOW()\n      WHERE id = :id\n    "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 执行更新
                _c.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ei.*,\n        ea.student_name,\n        pu.real_name as parent_name,\n        u.real_name as interviewer_name\n      FROM enrollment_interviews ei\n      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users pu ON p.user_id = pu.id\n      LEFT JOIN users u ON ei.interviewer_id = u.id\n      WHERE ei.id = :id\n    ", {
                        replacements: { id: parseInt(id, 10) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                updatedInterviews = _c.sent();
                interview = updatedInterviews[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '更新面试记录成功',
                        data: {
                            id: interview.id,
                            applicationId: interview.application_id,
                            interviewDate: interview.interview_date,
                            interviewerId: interview.interviewer_id,
                            location: interview.location,
                            status: interview.status,
                            score: interview.score,
                            feedback: interview.feedback,
                            notes: interview.notes,
                            durationMinutes: interview.duration_minutes,
                            createdBy: interview.created_by,
                            createdAt: interview.created_at,
                            updatedAt: interview.updated_at,
                            interviewer: {
                                id: interview.interviewer_id,
                                name: interview.interviewer_name
                            },
                            application: {
                                id: interview.application_id,
                                studentName: interview.student_name
                            }
                        }
                    })];
            case 4:
                error_3 = _c.sent();
                console.error('更新面试记录失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: '更新面试记录失败',
                    error: error_3 instanceof Error ? error_3.message : '未知错误'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateInterview = updateInterview;
/**
 * 删除面试记录
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteInterview = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, existingInterviews, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
                }
                if (!id || isNaN(parseInt(id, 10) || 0)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的面试记录ID'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM enrollment_interviews \n      WHERE id = :id AND deleted_at IS NULL\n    ", {
                        replacements: { id: parseInt(id, 10) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingInterviews = _b.sent();
                if (!existingInterviews || existingInterviews.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '面试记录不存在'
                        })];
                }
                // 软删除
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE enrollment_interviews \n      SET deleted_at = NOW(), updated_at = NOW()\n      WHERE id = :id\n    ", {
                        replacements: { id: parseInt(id, 10) || 0 },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 软删除
                _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '删除面试记录成功',
                        data: null
                    })];
            case 3:
                error_4 = _b.sent();
                console.error('删除面试记录失败:', error_4);
                res.status(500).json({
                    success: false,
                    message: '删除面试记录失败',
                    error: error_4 instanceof Error ? error_4.message : '未知错误'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteInterview = deleteInterview;
/**
 * 获取面试记录列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getInterviews = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, status_3, interviewerId, applicationId, startDate, endDate, offset, limit, whereConditions, replacements, whereClause, countResult, total, interviews, items, error_5;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, status_3 = _a.status, interviewerId = _a.interviewerId, applicationId = _a.applicationId, startDate = _a.startDate, endDate = _a.endDate;
                offset = (parseInt(page, 10) || 0 - 1) * parseInt(pageSize, 10) || 0;
                limit = parseInt(pageSize, 10) || 0;
                whereConditions = ['ei.deleted_at IS NULL'];
                replacements = { offset: offset, limit: limit };
                if (status_3) {
                    whereConditions.push('ei.status = :status');
                    replacements.status = status_3;
                }
                if (interviewerId) {
                    whereConditions.push('ei.interviewer_id = :interviewerId');
                    replacements.interviewerId = interviewerId;
                }
                if (applicationId) {
                    whereConditions.push('ei.application_id = :applicationId');
                    replacements.applicationId = applicationId;
                }
                if (startDate) {
                    whereConditions.push('ei.interview_date >= :startDate');
                    replacements.startDate = startDate;
                }
                if (endDate) {
                    whereConditions.push('ei.interview_date <= :endDate');
                    replacements.endDate = endDate;
                }
                whereClause = whereConditions.join(' AND ');
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT COUNT(*) as total\n      FROM enrollment_interviews ei\n      WHERE ".concat(whereClause, "\n    "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                countResult = _d.sent();
                total = parseInt(countResult[0].total, 10) || 0;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ei.*,\n        ea.student_name,\n        pu.real_name as parent_name,\n        u.real_name as interviewer_name\n      FROM enrollment_interviews ei\n      LEFT JOIN enrollment_applications ea ON ei.application_id = ea.id\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users pu ON p.user_id = pu.id\n      LEFT JOIN users u ON ei.interviewer_id = u.id\n      WHERE ".concat(whereClause, "\n      ORDER BY ei.interview_date DESC\n      LIMIT :limit OFFSET :offset\n    "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                interviews = _d.sent();
                items = interviews.map(function (interview) { return ({
                    id: interview.id,
                    applicationId: interview.application_id,
                    interviewDate: interview.interview_date,
                    interviewerId: interview.interviewer_id,
                    location: interview.location,
                    status: interview.status,
                    score: interview.score,
                    feedback: interview.feedback,
                    notes: interview.notes,
                    durationMinutes: interview.duration_minutes,
                    createdBy: interview.created_by,
                    createdAt: interview.created_at,
                    updatedAt: interview.updated_at,
                    interviewer: {
                        id: interview.interviewer_id,
                        name: interview.interviewer_name
                    },
                    application: {
                        id: interview.application_id,
                        studentName: interview.student_name,
                        parentName: interview.parent_name
                    }
                }); });
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取面试记录列表成功',
                        data: {
                            items: items,
                            total: total,
                            page: parseInt(page, 10) || 0,
                            pageSize: parseInt(pageSize, 10) || 0,
                            totalPages: Math.ceil(total / parseInt(pageSize, 10) || 0)
                        }
                    })];
            case 3:
                error_5 = _d.sent();
                console.error('获取面试记录列表失败:', error_5);
                res.status(500).json({
                    success: false,
                    message: '获取面试记录列表失败',
                    error: error_5 instanceof Error ? error_5.message : '未知错误'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getInterviews = getInterviews;
/**
 * 获取面试记录统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getInterviewStats = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var totalStats, monthlyStats, interviewerStats, statusStats, scoreDistribution, stats, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,\n        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,\n        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,\n        SUM(CASE WHEN status = 'rescheduled' THEN 1 ELSE 0 END) as rescheduled,\n        AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as averageScore,\n        AVG(CASE WHEN duration_minutes IS NOT NULL THEN duration_minutes ELSE NULL END) as averageDuration\n      FROM enrollment_interviews \n      WHERE deleted_at IS NULL\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                totalStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        DATE_FORMAT(interview_date, '%Y-%m') as month,\n        COUNT(*) as count,\n        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,\n        AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as averageScore\n      FROM enrollment_interviews \n      WHERE deleted_at IS NULL \n        AND interview_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)\n      GROUP BY DATE_FORMAT(interview_date, '%Y-%m')\n      ORDER BY month DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                monthlyStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ei.interviewer_id as interviewerId,\n        u.real_name as name,\n        COUNT(*) as totalCount,\n        SUM(CASE WHEN ei.status = 'completed' THEN 1 ELSE 0 END) as completedCount,\n        AVG(CASE WHEN ei.score IS NOT NULL THEN ei.score ELSE NULL END) as averageScore\n      FROM enrollment_interviews ei\n      LEFT JOIN users u ON ei.interviewer_id = u.id\n      WHERE ei.deleted_at IS NULL\n      GROUP BY ei.interviewer_id, u.real_name\n      ORDER BY totalCount DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                interviewerStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        status,\n        COUNT(*) as count,\n        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM enrollment_interviews WHERE deleted_at IS NULL), 2) as percentage\n      FROM enrollment_interviews \n      WHERE deleted_at IS NULL\n      GROUP BY status\n      ORDER BY count DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                statusStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        CASE \n          WHEN score >= 90 THEN '\u4F18\u79C0(90-100)'\n          WHEN score >= 80 THEN '\u826F\u597D(80-89)'\n          WHEN score >= 70 THEN '\u4E00\u822C(70-79)'\n          WHEN score >= 60 THEN '\u53CA\u683C(60-69)'\n          ELSE '\u4E0D\u53CA\u683C(<60)'\n        END as scoreRange,\n        COUNT(*) as count\n      FROM enrollment_interviews \n      WHERE deleted_at IS NULL AND score IS NOT NULL\n      GROUP BY \n        CASE \n          WHEN score >= 90 THEN '\u4F18\u79C0(90-100)'\n          WHEN score >= 80 THEN '\u826F\u597D(80-89)'\n          WHEN score >= 70 THEN '\u4E00\u822C(70-79)'\n          WHEN score >= 60 THEN '\u53CA\u683C(60-69)'\n          ELSE '\u4E0D\u53CA\u683C(<60)'\n        END\n      ORDER BY MIN(score) DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 5:
                scoreDistribution = _a.sent();
                stats = totalStats[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取面试统计成功',
                        data: {
                            overview: {
                                total: parseInt(stats.total) || 0,
                                scheduled: parseInt(stats.scheduled) || 0,
                                completed: parseInt(stats.completed) || 0,
                                cancelled: parseInt(stats.cancelled) || 0,
                                rescheduled: parseInt(stats.rescheduled) || 0,
                                averageScore: parseFloat(stats.averageScore) || 0,
                                averageDuration: parseFloat(stats.averageDuration) || 0
                            },
                            byMonth: monthlyStats,
                            byInterviewer: interviewerStats,
                            byStatus: statusStats,
                            scoreDistribution: scoreDistribution
                        }
                    })];
            case 6:
                error_6 = _a.sent();
                console.error('获取面试统计失败:', error_6);
                res.status(500).json({
                    success: false,
                    message: '获取面试统计失败',
                    error: error_6 instanceof Error ? error_6.message : '未知错误'
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getInterviewStats = getInterviewStats;
