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
exports.checkInByPhone = exports.exportCheckinData = exports.getCheckinStats = exports.getCheckins = exports.batchCheckIn = exports.checkIn = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * 活动签到控制器
 * 提供活动签到的创建、查询、统计等功能
 */
/**
 * 签到
 * @param req 请求对象
 * @param res 响应对象
 */
var checkIn = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, id, location_1, resultRows, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未登录或登录已过期' });
                    return [2 /*return*/];
                }
                id = req.params.id;
                location_1 = req.body.location;
                if (!location_1) {
                    res.status(400).json({ success: false, message: '签到地点不能为空' });
                    return [2 /*return*/];
                }
                // 更新报名记录的签到信息
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE activity_registrations \n      SET check_in_time = NOW(), \n          check_in_location = :location,\n          updated_at = NOW(),\n          updater_id = :userId\n      WHERE id = :registrationId AND deleted_at IS NULL\n    ", {
                        replacements: {
                            location: location_1,
                            userId: userId,
                            registrationId: id
                        },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 更新报名记录的签到信息
                _b.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT ar.id, ar.activity_id, ar.contact_name, ar.contact_phone,\n             ar.check_in_time, ar.check_in_location,\n             a.title as activity_title\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.id = :registrationId AND ar.deleted_at IS NULL\n    ", {
                        replacements: { registrationId: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                resultRows = (_b.sent())[0];
                if (!resultRows || resultRows.length === 0) {
                    res.status(404).json({ success: false, message: '签到记录不存在' });
                    return [2 /*return*/];
                }
                result = resultRows[0];
                res.json({
                    success: true,
                    message: '签到成功',
                    data: result
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('签到失败:', error_1);
                res.status(500).json({ success: false, message: '签到失败' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.checkIn = checkIn;
/**
 * 批量签到
 * @param req 请求对象
 * @param res 响应对象
 */
var batchCheckIn = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, registrationIds, location_2, placeholders, results, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未登录或登录已过期' });
                    return [2 /*return*/];
                }
                _a = req.body, registrationIds = _a.registrationIds, location_2 = _a.location;
                if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
                    res.status(400).json({ success: false, message: '报名ID列表不能为空' });
                    return [2 /*return*/];
                }
                if (!location_2) {
                    res.status(400).json({ success: false, message: '签到地点不能为空' });
                    return [2 /*return*/];
                }
                placeholders = registrationIds.map(function () { return '?'; }).join(',');
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE activity_registrations \n      SET check_in_time = NOW(), \n          check_in_location = ?,\n          updated_at = NOW(),\n          updater_id = ?\n      WHERE id IN (".concat(placeholders, ") AND deleted_at IS NULL\n    "), {
                        replacements: __spreadArray([location_2, userId], registrationIds, true),
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _c.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, contact_name, check_in_time\n      FROM activity_registrations \n      WHERE id IN (".concat(placeholders, ") AND deleted_at IS NULL\n    "), {
                        replacements: registrationIds,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                results = _c.sent();
                res.json({
                    success: true,
                    message: '批量签到处理完成',
                    data: {
                        successCount: results.length,
                        failureCount: registrationIds.length - results.length,
                        details: results
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _c.sent();
                console.error('批量签到失败:', error_2);
                res.status(500).json({ success: false, message: '批量签到失败' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.batchCheckIn = batchCheckIn;
/**
 * 获取活动签到列表
 * @param req 请求对象
 * @param res 响应对象
 */
var getCheckins = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, activityId, _b, page, _c, limit, offset, items, totalResultRows, total, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, activityId = _a.activityId, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                if (!activityId) {
                    res.status(400).json({ success: false, message: '活动ID不能为空' });
                    return [2 /*return*/];
                }
                offset = ((Number(page) - 1) || 0) * Number(limit) || 0;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT ar.id, ar.contact_name, ar.contact_phone, ar.child_name,\n             ar.check_in_time, ar.check_in_location, ar.registration_time,\n             a.title as activity_title\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.activity_id = :activityId \n        AND ar.check_in_time IS NOT NULL \n        AND ar.deleted_at IS NULL\n      ORDER BY ar.check_in_time DESC\n      LIMIT :limit OFFSET :offset\n    ", {
                        replacements: {
                            activityId: Number(activityId) || 0,
                            limit: Number(limit) || 0,
                            offset: offset
                        },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                items = (_d.sent())[0];
                ;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT COUNT(*) as total\n      FROM activity_registrations ar\n      WHERE ar.activity_id = :activityId \n        AND ar.check_in_time IS NOT NULL \n        AND ar.deleted_at IS NULL\n    ", {
                        replacements: { activityId: Number(activityId) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                totalResultRows = (_d.sent())[0];
                total = (totalResultRows && totalResultRows.length > 0) ? totalResultRows[0].total : 0;
                res.json({
                    success: true,
                    message: '获取活动签到列表成功',
                    data: {
                        items: items,
                        page: Number(page) || 0,
                        limit: Number(limit) || 0,
                        total: Number(total) || 0,
                        totalPages: Math.ceil(Number(total) || 0 / Number(limit) || 0)
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _d.sent();
                console.error('获取活动签到列表失败:', error_3);
                res.status(500).json({ success: false, message: '获取活动签到列表失败' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCheckins = getCheckins;
/**
 * 获取活动签到统计数据
 * @param req 请求对象
 * @param res 响应对象
 */
var getCheckinStats = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, userId, userRole, teacherActivityRows, activityRows, activity, statsRows, stats, timeDistributionRows, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                activityId = req.params.activityId;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!activityId) {
                    res.status(400).json({ success: false, message: '活动ID不能为空' });
                    return [2 /*return*/];
                }
                if (!(userRole === 'teacher')) return [3 /*break*/, 2];
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT 1 FROM activities a\n        LEFT JOIN activity_staffs ast ON a.id = ast.activity_id\n        LEFT JOIN teachers t ON (ast.teacher_id = t.id OR a.creator_id = t.user_id)\n        WHERE a.id = :activityId AND t.user_id = :userId AND a.deleted_at IS NULL\n      ", {
                        replacements: { activityId: Number(activityId), userId: userId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                teacherActivityRows = (_c.sent())[0];
                if (!teacherActivityRows || teacherActivityRows.length === 0) {
                    res.status(403).json({ success: false, message: '无权限查看此活动的签到统计' });
                    return [2 /*return*/];
                }
                _c.label = 2;
            case 2: return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, title, capacity, registered_count, checked_in_count\n      FROM activities\n      WHERE id = :activityId AND deleted_at IS NULL\n    ", {
                    replacements: { activityId: Number(activityId) },
                    type: sequelize_1.QueryTypes.SELECT
                })];
            case 3:
                activityRows = (_c.sent())[0];
                if (!activityRows || activityRows.length === 0) {
                    res.status(404).json({ success: false, message: '活动不存在' });
                    return [2 /*return*/];
                }
                activity = activityRows[0];
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT\n        COUNT(*) as totalRegistrations,\n        SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) as checkedInCount,\n        SUM(CASE WHEN check_in_time IS NULL THEN 1 ELSE 0 END) as notCheckedInCount,\n        ROUND(\n          SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*),\n          2\n        ) as checkInRate\n      FROM activity_registrations\n      WHERE activity_id = :activityId AND deleted_at IS NULL\n    ", {
                        replacements: { activityId: Number(activityId) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                statsRows = (_c.sent())[0];
                if (!statsRows || statsRows.length === 0) {
                    res.status(500).json({ success: false, message: '查询统计数据失败' });
                    return [2 /*return*/];
                }
                stats = statsRows[0];
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT\n        HOUR(check_in_time) as hour,\n        COUNT(*) as count\n      FROM activity_registrations\n      WHERE activity_id = :activityId AND check_in_time IS NOT NULL AND deleted_at IS NULL\n      GROUP BY HOUR(check_in_time)\n      ORDER BY hour\n    ", {
                        replacements: { activityId: Number(activityId) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 5:
                timeDistributionRows = (_c.sent())[0];
                res.json({
                    success: true,
                    message: '获取活动签到统计数据成功',
                    data: {
                        activity: {
                            id: activity.id,
                            title: activity.title,
                            capacity: activity.capacity,
                            registeredCount: activity.registered_count,
                            checkedInCount: activity.checked_in_count
                        },
                        statistics: {
                            totalRegistrations: parseInt(stats.totalRegistrations) || 0,
                            checkedInCount: parseInt(stats.checkedInCount) || 0,
                            notCheckedInCount: parseInt(stats.notCheckedInCount) || 0,
                            checkInRate: parseFloat(stats.checkInRate) || 0
                        },
                        timeDistribution: timeDistributionRows.map(function (row) { return ({
                            hour: row.hour,
                            count: parseInt(row.count)
                        }); })
                    }
                });
                return [3 /*break*/, 7];
            case 6:
                error_4 = _c.sent();
                console.error('获取活动签到统计数据失败:', error_4);
                res.status(500).json({ success: false, message: '获取活动签到统计数据失败' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getCheckinStats = getCheckinStats;
/**
 * 导出签到数据
 * @param req 请求对象
 * @param res 响应对象
 */
var exportCheckinData = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, data, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                activityId = req.params.activityId;
                if (!activityId) {
                    res.status(400).json({ success: false, message: '活动ID不能为空' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT ar.contact_name, ar.contact_phone, ar.child_name, ar.child_age,\n             ar.registration_time, ar.check_in_time, ar.check_in_location,\n             a.title as activity_title\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.activity_id = :activityId AND ar.deleted_at IS NULL\n      ORDER BY ar.registration_time DESC\n    ", {
                        replacements: { activityId: Number(activityId) || 0 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                data = _a.sent();
                res.json({
                    success: true,
                    message: '导出签到数据成功',
                    data: {
                        fileName: "activity_".concat(activityId, "_checkin_data.xlsx"),
                        records: data,
                        totalCount: data.length
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('导出签到数据失败:', error_5);
                res.status(500).json({ success: false, message: '导出签到数据失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.exportCheckinData = exportCheckinData;
/**
 * 根据手机号签到
 * @param req 请求对象
 * @param res 响应对象
 */
var checkInByPhone = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, activityId, _a, phone, location_3, registrationRows, registration, error_6;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    res.status(401).json({ success: false, message: '未登录或登录已过期' });
                    return [2 /*return*/];
                }
                activityId = req.params.activityId;
                _a = req.body, phone = _a.phone, location_3 = _a.location;
                if (!activityId) {
                    res.status(400).json({ success: false, message: '活动ID不能为空' });
                    return [2 /*return*/];
                }
                if (!phone) {
                    res.status(400).json({ success: false, message: '手机号不能为空' });
                    return [2 /*return*/];
                }
                if (!location_3) {
                    res.status(400).json({ success: false, message: '签到地点不能为空' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, contact_name, contact_phone, check_in_time\n      FROM activity_registrations \n      WHERE activity_id = :activityId \n        AND contact_phone = :phone \n        AND deleted_at IS NULL\n    ", {
                        replacements: { activityId: Number(activityId) || 0, phone: phone },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                registrationRows = (_c.sent())[0];
                if (!registrationRows || registrationRows.length === 0) {
                    res.status(404).json({ success: false, message: '未找到该手机号的报名记录' });
                    return [2 /*return*/];
                }
                registration = registrationRows[0];
                if (registration.check_in_time) {
                    res.status(400).json({ success: false, message: '该报名记录已签到' });
                    return [2 /*return*/];
                }
                // 更新签到信息
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE activity_registrations \n      SET check_in_time = NOW(), \n          check_in_location = :location,\n          updated_at = NOW(),\n          updater_id = :userId\n      WHERE id = :registrationId\n    ", {
                        replacements: {
                            location: location_3,
                            userId: userId,
                            registrationId: registration.id
                        },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 更新签到信息
                _c.sent();
                res.json({
                    success: true,
                    message: '签到成功',
                    data: {
                        id: registration.id,
                        contactName: registration.contact_name,
                        contactPhone: registration.contact_phone,
                        checkInTime: new Date(),
                        checkInLocation: location_3
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _c.sent();
                console.error('根据手机号签到失败:', error_6);
                res.status(500).json({ success: false, message: '根据手机号签到失败' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.checkInByPhone = checkInByPhone;
