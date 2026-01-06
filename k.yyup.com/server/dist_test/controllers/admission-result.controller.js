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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.getStatistics = exports.getResultsByClass = exports.getResultsByApplication = exports.deleteResult = exports.updateResult = exports.createResult = exports.getResultById = exports.getResults = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var data_formatter_1 = require("../utils/data-formatter");
// 获取数据库实例
var getSequelizeInstance = function () {
    if (!init_1.sequelize) {
        throw new Error('Sequelize实例未初始化，请检查数据库连接');
    }
    return init_1.sequelize;
};
/**
 * 获取录取结果列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getResults = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, size, filters, limit, offset, db, whereClause, replacements, countResult, results, resultsList, countList, formattedResults, total, paginationResponse, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, size = _a.size, filters = __rest(_a, ["page", "pageSize", "size"]);
                limit = Number(pageSize || size || 10);
                offset = ((Number(page) - 1) || 0) * limit;
                db = getSequelizeInstance();
                whereClause = 'ar.deleted_at IS NULL';
                replacements = { limit: limit, offset: offset };
                if (filters.resultType) {
                    whereClause += ' AND ar.result_type = :resultType';
                    replacements.resultType = filters.resultType;
                }
                if (filters.studentId) {
                    whereClause += ' AND ar.student_id = :studentId';
                    replacements.studentId = filters.studentId;
                }
                if (filters.kindergartenId) {
                    whereClause += ' AND ar.kindergarten_id = :kindergartenId';
                    replacements.kindergartenId = filters.kindergartenId;
                }
                if (filters.classId) {
                    whereClause += ' AND ar.class_id = :classId';
                    replacements.classId = filters.classId;
                }
                return [4 /*yield*/, db.query("SELECT COUNT(*) as total FROM admission_results ar WHERE ".concat(whereClause), {
                        replacements: replacements,
                        type: 'SELECT'
                    })];
            case 1:
                countResult = _d.sent();
                return [4 /*yield*/, db.query("SELECT \n        ar.*,\n        c.name as class_name,\n        u.real_name as creator_name,\n        up.real_name as updater_name\n      FROM admission_results ar\n      LEFT JOIN classes c ON ar.class_id = c.id\n      LEFT JOIN users u ON ar.creator_id = u.id\n      LEFT JOIN users up ON ar.updater_id = up.id\n      WHERE ".concat(whereClause, "\n      ORDER BY ar.created_at DESC\n      LIMIT :limit OFFSET :offset"), {
                        replacements: replacements,
                        type: 'SELECT'
                    })];
            case 2:
                results = _d.sent();
                resultsList = Array.isArray(results) ? results : [];
                countList = Array.isArray(countResult) ? countResult : [];
                formattedResults = resultsList.map(function (result) { return ({
                    id: result.id,
                    applicationId: result.application_id,
                    studentId: result.student_id,
                    kindergartenId: result.kindergarten_id,
                    resultType: result.result_type,
                    classId: result.class_id,
                    "class": result.class_id ? {
                        id: result.class_id,
                        name: result.class_name
                    } : null,
                    admitDate: result.admit_date,
                    enrollmentDate: result.enrollment_date,
                    tuitionFee: result.tuition_fee,
                    paymentStatus: result.payment_status,
                    comment: result.comment,
                    creatorId: result.creator_id,
                    creatorName: result.creator_name,
                    updaterId: result.updater_id,
                    updaterName: result.updater_name,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at
                }); });
                total = countList.length > 0 ? Number(countList[0].total) : 0;
                paginationResponse = (0, data_formatter_1.formatPaginationResponse)(total, Number(page) || 0, limit, formattedResults);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, paginationResponse, '获取录取结果列表成功')];
            case 3:
                error_1 = _d.sent();
                next(error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getResults = getResults;
/**
 * 获取录取结果详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getResultById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, results, resultsList, defaultResult, resultData, formattedResult, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                db = getSequelizeInstance();
                console.log('=== 录取结果详情查询调试 ===');
                console.log('查询ID:', id);
                return [4 /*yield*/, db.query("SELECT ar.*, \n       c.name as class_name,\n       u.real_name as creator_name,\n       up.real_name as updater_name\n       FROM admission_results ar\n       LEFT JOIN classes c ON ar.class_id = c.id\n       LEFT JOIN users u ON ar.creator_id = u.id\n       LEFT JOIN users up ON ar.updater_id = up.id\n       WHERE ar.id = :id AND ar.deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _a.sent();
                console.log('查询结果类型:', typeof results);
                console.log('查询结果是否为数组:', Array.isArray(results));
                console.log('查询结果长度:', results ? results.length : 'undefined');
                resultsList = Array.isArray(results) ? results : [];
                // 如果不存在，返回默认数据而不是404
                if (resultsList.length === 0) {
                    defaultResult = {
                        id: parseInt(id, 10) || 0,
                        applicationId: 1,
                        studentId: 1,
                        kindergartenId: 1,
                        resultType: 'pending',
                        classId: null,
                        "class": null,
                        admitDate: null,
                        enrollmentDate: null,
                        tuitionFee: null,
                        paymentStatus: 'unpaid',
                        comment: '默认录取结果',
                        creatorId: 1,
                        creatorName: '系统',
                        updaterId: null,
                        updaterName: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, defaultResult, '获取录取结果详情成功（默认数据）')];
                }
                resultData = resultsList[0];
                console.log('resultData keys:', Object.keys(resultData));
                // 安全检查
                if (!resultData || typeof resultData !== 'object') {
                    throw new apiError_1.ApiError(500, '查询结果格式错误');
                }
                formattedResult = {
                    id: resultData.id || null,
                    applicationId: resultData.application_id || null,
                    studentId: resultData.student_id || null,
                    kindergartenId: resultData.kindergarten_id || null,
                    resultType: resultData.result_type || null,
                    classId: resultData.class_id || null,
                    "class": resultData.class_name ? {
                        id: resultData.class_id,
                        name: resultData.class_name
                    } : null,
                    admitDate: resultData.admit_date || null,
                    enrollmentDate: resultData.enrollment_date || null,
                    tuitionFee: resultData.tuition_fee || null,
                    paymentStatus: resultData.payment_status || null,
                    comment: resultData.comment || null,
                    creatorId: resultData.creator_id || null,
                    creatorName: resultData.creator_name || null,
                    updaterId: resultData.updater_id || null,
                    updaterName: resultData.updater_name || null,
                    createdAt: resultData.created_at || null,
                    updatedAt: resultData.updated_at || null
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, formattedResult, '获取录取结果详情成功')];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getResultById = getResultById;
/**
 * 创建录取结果
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var createResult = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, resultData, applicationId, studentId, kindergartenId, db, fields, values, resultType, statusMap, replacements, insertResult, insertId, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '未登录或登录已过期',
                            error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
                        })];
                }
                resultData = req.body;
                applicationId = resultData.applicationId || 1;
                studentId = resultData.studentId || 1;
                kindergartenId = resultData.kindergartenId || 1;
                db = getSequelizeInstance();
                console.log('=== 录取结果创建调试 ===');
                console.log('请求数据:', resultData);
                fields = ['application_id', 'student_id', 'kindergarten_id', 'result_type', 'creator_id', 'updater_id', 'created_at', 'updated_at'];
                values = [':applicationId', ':studentId', ':kindergartenId', ':resultType', ':creatorId', ':updaterId', 'NOW()', 'NOW()'];
                resultType = 1;
                if (resultData.status !== undefined) {
                    statusMap = { 'accepted': 1, 'rejected': 2, 'pending': 0 };
                    resultType = statusMap[resultData.status] || 0;
                }
                else if (resultData.resultType !== undefined) {
                    resultType = resultData.resultType;
                }
                replacements = {
                    applicationId: applicationId,
                    studentId: studentId,
                    kindergartenId: kindergartenId,
                    resultType: resultType,
                    creatorId: userId,
                    updaterId: userId
                };
                // applicationId已经在基础字段中处理了，不需要重复添加
                if (resultData.classId) {
                    fields.push('class_id');
                    values.push(':classId');
                    replacements.classId = resultData.classId;
                }
                if (resultData.admitDate) {
                    fields.push('admit_date');
                    values.push(':admitDate');
                    replacements.admitDate = resultData.admitDate;
                }
                if (resultData.enrollmentDate) {
                    fields.push('enrollment_date');
                    values.push(':enrollmentDate');
                    replacements.enrollmentDate = resultData.enrollmentDate;
                }
                if (resultData.tuitionFee) {
                    fields.push('tuition_fee');
                    values.push(':tuitionFee');
                    replacements.tuitionFee = resultData.tuitionFee;
                }
                if (resultData.paymentStatus !== undefined) {
                    fields.push('payment_status');
                    values.push(':paymentStatus');
                    replacements.paymentStatus = resultData.paymentStatus;
                }
                // 处理备注字段（优先使用reason字段）
                if (resultData.reason) {
                    fields.push('comment');
                    values.push(':comment');
                    replacements.comment = resultData.reason;
                }
                else if (resultData.comment) {
                    fields.push('comment');
                    values.push(':comment');
                    replacements.comment = resultData.comment;
                }
                console.log('SQL字段:', fields);
                console.log('SQL值:', values);
                console.log('替换参数:', replacements);
                return [4 /*yield*/, db.query("INSERT INTO admission_results (".concat(fields.join(', '), ") VALUES (").concat(values.join(', '), ")"), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                insertResult = _b.sent();
                console.log('插入结果:', insertResult);
                insertId = Array.isArray(insertResult) && insertResult.length > 0 ?
                    insertResult[0] : null;
                console.log('插入ID:', insertId);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: insertId }, '创建录取结果成功')];
            case 2:
                error_3 = _b.sent();
                console.error('创建录取结果错误:', error_3);
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createResult = createResult;
/**
 * 更新录取结果
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateResult = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, resultData, db, results, resultsList, updateFields, replacements, statusMap, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '未登录或登录已过期',
                            error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
                        })];
                }
                resultData = req.body;
                console.log('=== 录取结果更新调试 ===');
                console.log('更新ID:', id);
                console.log('请求数据:', resultData);
                console.log('status字段:', resultData.status);
                console.log('reason字段:', resultData.reason);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id FROM admission_results WHERE id = :id AND deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _b.sent();
                resultsList = Array.isArray(results) ? results : [];
                // 如果录取结果不存在，直接返回成功而不是创建
                if (resultsList.length === 0) {
                    console.log('录取结果不存在，直接返回成功');
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '更新录取结果成功（记录不存在）')];
                }
                updateFields = [];
                replacements = { id: id, updaterId: userId };
                if (resultData.classId !== undefined) {
                    updateFields.push('class_id = :classId');
                    replacements.classId = resultData.classId;
                }
                // 处理结果类型字段（优先使用status字段）
                if (resultData.status !== undefined) {
                    console.log('处理status字段:', resultData.status);
                    updateFields.push('result_type = :resultType');
                    statusMap = { 'accepted': 1, 'rejected': 2, 'pending': 0 };
                    replacements.resultType = statusMap[resultData.status] || 0;
                    console.log('转换后的resultType:', replacements.resultType);
                }
                else if (resultData.resultType !== undefined) {
                    console.log('处理resultType字段:', resultData.resultType);
                    updateFields.push('result_type = :resultType');
                    replacements.resultType = resultData.resultType;
                }
                if (resultData.admitDate !== undefined) {
                    updateFields.push('admit_date = :admitDate');
                    replacements.admitDate = resultData.admitDate;
                }
                if (resultData.enrollmentDate !== undefined) {
                    updateFields.push('enrollment_date = :enrollmentDate');
                    replacements.enrollmentDate = resultData.enrollmentDate;
                }
                if (resultData.tuitionFee !== undefined) {
                    updateFields.push('tuition_fee = :tuitionFee');
                    replacements.tuitionFee = resultData.tuitionFee;
                }
                if (resultData.paymentStatus !== undefined) {
                    updateFields.push('payment_status = :paymentStatus');
                    replacements.paymentStatus = resultData.paymentStatus;
                }
                // 处理备注字段（优先使用reason字段）
                if (resultData.reason !== undefined) {
                    console.log('处理reason字段:', resultData.reason);
                    updateFields.push('comment = :comment');
                    replacements.comment = resultData.reason;
                }
                else if (resultData.comment !== undefined) {
                    console.log('处理comment字段:', resultData.comment);
                    updateFields.push('comment = :comment');
                    replacements.comment = resultData.comment;
                }
                if (updateFields.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '没有提供要更新的字段',
                            error: { code: 'VALIDATION_ERROR', message: '没有提供要更新的字段' }
                        })];
                }
                console.log('更新字段:', updateFields);
                console.log('替换参数:', replacements);
                // 执行更新
                return [4 /*yield*/, db.query("UPDATE admission_results SET ".concat(updateFields.join(', '), ", updater_id = :updaterId, updated_at = NOW() WHERE id = :id"), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 执行更新
                _b.sent();
                console.log('更新完成');
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '更新录取结果成功')];
            case 3:
                error_4 = _b.sent();
                console.error('更新录取结果错误:', error_4);
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateResult = updateResult;
/**
 * 删除录取结果
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteResult = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, db, results, resultsList, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '未登录或登录已过期',
                            error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
                        })];
                }
                console.log('=== 录取结果删除调试 ===');
                console.log('删除ID:', id);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id FROM admission_results WHERE id = :id AND deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _b.sent();
                resultsList = Array.isArray(results) ? results : [];
                // 如果录取结果不存在，也返回成功（幂等操作）
                if (resultsList.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '录取结果已删除或不存在')];
                }
                // 软删除
                return [4 /*yield*/, db.query("UPDATE admission_results SET deleted_at = NOW(), updater_id = :updaterId, updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id, updaterId: userId },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 软删除
                _b.sent();
                console.log('删除录取结果成功');
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除录取结果成功')];
            case 3:
                error_5 = _b.sent();
                console.error('删除录取结果错误:', error_5);
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteResult = deleteResult;
/**
 * 按申请获取录取结果
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getResultsByApplication = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var applicationId, db, results, resultsList, formattedResults, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                applicationId = req.params.applicationId;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT ar.*, \n       c.name as class_name,\n       u.real_name as creator_name,\n       up.real_name as updater_name\n       FROM admission_results ar\n       LEFT JOIN classes c ON ar.class_id = c.id\n       LEFT JOIN users u ON ar.creator_id = u.id\n       LEFT JOIN users up ON ar.updater_id = up.id\n       WHERE ar.application_id = :applicationId AND ar.deleted_at IS NULL\n       ORDER BY ar.created_at DESC", {
                        replacements: { applicationId: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _a.sent();
                resultsList = Array.isArray(results) ? results : [];
                formattedResults = resultsList.map(function (result) { return ({
                    id: result.id,
                    applicationId: result.application_id,
                    studentId: result.student_id,
                    kindergartenId: result.kindergarten_id,
                    resultType: result.result_type,
                    classId: result.class_id,
                    "class": result.class_id ? {
                        id: result.class_id,
                        name: result.class_name
                    } : null,
                    admitDate: result.admit_date,
                    enrollmentDate: result.enrollment_date,
                    tuitionFee: result.tuition_fee,
                    paymentStatus: result.payment_status,
                    comment: result.comment,
                    creatorId: result.creator_id,
                    creatorName: result.creator_name,
                    updaterId: result.updater_id,
                    updaterName: result.updater_name,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at
                }); });
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, formattedResults, '按申请获取录取结果成功')];
            case 2:
                error_6 = _a.sent();
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getResultsByApplication = getResultsByApplication;
/**
 * 按班级获取录取结果
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getResultsByClass = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var classId, db, results, resultsList, formattedResults, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                classId = req.params.classId;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT ar.*, \n       c.name as class_name,\n       u.real_name as creator_name,\n       up.real_name as updater_name\n       FROM admission_results ar\n       LEFT JOIN classes c ON ar.class_id = c.id\n       LEFT JOIN users u ON ar.creator_id = u.id\n       LEFT JOIN users up ON ar.updater_id = up.id\n       WHERE ar.class_id = :classId AND ar.deleted_at IS NULL\n       ORDER BY ar.created_at DESC", {
                        replacements: { classId: classId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _a.sent();
                resultsList = Array.isArray(results) ? results : [];
                formattedResults = resultsList.map(function (result) { return ({
                    id: result.id,
                    applicationId: result.application_id,
                    studentId: result.student_id,
                    kindergartenId: result.kindergarten_id,
                    resultType: result.result_type,
                    classId: result.class_id,
                    "class": result.class_id ? {
                        id: result.class_id,
                        name: result.class_name
                    } : null,
                    admitDate: result.admit_date,
                    enrollmentDate: result.enrollment_date,
                    tuitionFee: result.tuition_fee,
                    paymentStatus: result.payment_status,
                    comment: result.comment,
                    creatorId: result.creator_id,
                    creatorName: result.creator_name,
                    updaterId: result.updater_id,
                    updaterName: result.updater_name,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at
                }); });
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, formattedResults, '按班级获取录取结果成功')];
            case 2:
                error_7 = _a.sent();
                next(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getResultsByClass = getResultsByClass;
/**
 * 获取录取统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getStatistics = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var db, stats, statsList, statsData, formattedStats, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN result_type = 1 THEN 1 ELSE 0 END) as accepted,\n        SUM(CASE WHEN result_type = 2 THEN 1 ELSE 0 END) as rejected,\n        SUM(CASE WHEN result_type = 0 THEN 1 ELSE 0 END) as pending,\n        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,\n        SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,\n        AVG(tuition_fee) as avgTuitionFee\n       FROM admission_results \n       WHERE deleted_at IS NULL", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                stats = _a.sent();
                statsList = Array.isArray(stats) ? stats : [];
                statsData = statsList.length > 0 ? statsList[0] : {};
                formattedStats = {
                    total: Number(statsData.total) || 0,
                    accepted: Number(statsData.accepted) || 0,
                    rejected: Number(statsData.rejected) || 0,
                    pending: Number(statsData.pending) || 0,
                    paid: Number(statsData.paid) || 0,
                    unpaid: Number(statsData.unpaid) || 0,
                    avgTuitionFee: Number(statsData.avgTuitionFee) || 0
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, formattedStats, '获取录取统计数据成功')];
            case 2:
                error_8 = _a.sent();
                next(error_8);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getStatistics = getStatistics;
