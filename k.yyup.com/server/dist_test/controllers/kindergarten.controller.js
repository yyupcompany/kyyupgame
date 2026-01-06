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
exports.KindergartenController = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
// 直接使用sequelize实例
/**
 * 幼儿园控制器
 */
var KindergartenController = /** @class */ (function () {
    function KindergartenController() {
    }
    /**
     * 创建幼儿园
     * @param req 请求对象
     * @param res 响应对象
     */
    KindergartenController.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, _a, name_1, address, phone, principal, systemGroups, systemGroup, validatedData, result, kindergartenId, kindergartens, kindergartensList, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, , 9]);
                        console.log('🏫 创建幼儿园API被调用');
                        console.log('用户信息:', req.user);
                        console.log('请求数据:', req.body);
                        _a = req.body, name_1 = _a.name, address = _a.address, phone = _a.phone, principal = _a.principal;
                        if (!name_1 || !address || !phone || !principal) {
                            throw apiError_1.ApiError.badRequest('缺少必要字段：name, address, phone, principal');
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id, name, code FROM `groups` WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1", {
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 3:
                        systemGroups = _b.sent();
                        if (!systemGroups || systemGroups.length === 0) {
                            throw apiError_1.ApiError.badRequest('系统中没有集团，请先创建集团');
                        }
                        systemGroup = systemGroups[0];
                        console.log('🏢 系统集团:', systemGroup);
                        validatedData = {
                            name: name_1,
                            code: req.body.code || "KG_".concat(Date.now()),
                            type: req.body.type || 1,
                            level: req.body.level || 1,
                            address: address,
                            longitude: req.body.longitude || 116.4074,
                            latitude: req.body.latitude || 39.9042,
                            phone: phone,
                            email: req.body.email || "".concat(Date.now(), "@example.com"),
                            principal: principal,
                            establishedDate: req.body.establishedDate || new Date(),
                            area: req.body.area || 1000,
                            buildingArea: req.body.buildingArea || 800,
                            classCount: req.body.classCount || 0,
                            teacherCount: req.body.teacherCount || 0,
                            studentCount: req.body.studentCount || 0,
                            description: req.body.description || '',
                            features: req.body.features || '',
                            philosophy: req.body.philosophy || '',
                            feeDescription: req.body.feeDescription || '',
                            status: req.body.status || 1,
                            groupId: systemGroup.id,
                            isGroupHeadquarters: req.body.isGroupHeadquarters || 0,
                            groupRole: req.body.groupRole || 4,
                            joinGroupDate: new Date() // 加入集团日期为当前时间
                        };
                        return [4 /*yield*/, init_1.sequelize.query("INSERT INTO kindergartens\n         (name, code, type, level, address, longitude, latitude, phone, email, principal,\n          established_date, area, building_area, status, group_id, is_group_headquarters,\n          group_role, join_group_date, creator_id, created_at, updated_at)\n         VALUES\n         (:name, :code, :type, :level, :address, :longitude, :latitude, :phone, :email, :principal,\n          :establishedDate, :area, :buildingArea, 1, :groupId, :isGroupHeadquarters,\n          :groupRole, :joinGroupDate, :creatorId, NOW(), NOW())", {
                                replacements: {
                                    name: validatedData.name,
                                    code: validatedData.code,
                                    type: validatedData.type,
                                    level: validatedData.level,
                                    address: validatedData.address,
                                    longitude: validatedData.longitude,
                                    latitude: validatedData.latitude,
                                    phone: validatedData.phone,
                                    email: validatedData.email,
                                    principal: validatedData.principal,
                                    establishedDate: validatedData.establishedDate,
                                    area: validatedData.area,
                                    buildingArea: validatedData.buildingArea,
                                    groupId: validatedData.groupId,
                                    isGroupHeadquarters: validatedData.isGroupHeadquarters,
                                    groupRole: validatedData.groupRole,
                                    joinGroupDate: validatedData.joinGroupDate,
                                    creatorId: req.user.id
                                },
                                type: 'INSERT',
                                transaction: transaction
                            })];
                    case 4:
                        result = _b.sent();
                        kindergartenId = Array.isArray(result) && result.length > 0 ?
                            result[0].insertId || result[0] : null;
                        return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM kindergartens WHERE id = :id", {
                                replacements: { id: kindergartenId },
                                type: 'SELECT',
                                transaction: transaction
                            })];
                    case 5:
                        kindergartens = _b.sent();
                        kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _b.sent();
                        apiResponse_1.ApiResponse.success(res, kindergartensList[0] || null, '幼儿园创建成功');
                        return [3 /*break*/, 9];
                    case 7:
                        error_1 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _b.sent();
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        throw apiError_1.ApiError.serverError('创建幼儿园失败', 'KINDERGARTEN_CREATE_ERROR');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取幼儿园列表
     * @param req 请求对象
     * @param res 响应对象
     */
    KindergartenController.list = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, keyword, groupId, status_1, type, pageNum, pageSizeNum, offset, limit, whereClause, replacements, countResult, countList, rows, rowsList, formattedRows, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        console.log('🔍 幼儿园列表API被调用');
                        console.log('用户信息:', req.user);
                        console.log('查询参数:', req.query);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, keyword = _a.keyword, groupId = _a.groupId, status_1 = _a.status, type = _a.type;
                        pageNum = Math.max(1, Number(page) || 1);
                        pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10));
                        offset = Math.max(0, (pageNum - 1) * pageSizeNum);
                        limit = pageSizeNum;
                        whereClause = 'WHERE 1=1';
                        replacements = {};
                        // ✅ 添加 group_id 过滤 - 数据隔离
                        if (groupId) {
                            whereClause += ' AND group_id = :groupId';
                            replacements.groupId = Number(groupId);
                            console.log('✅ 添加集团过滤:', groupId);
                        }
                        // 添加关键词过滤
                        if (keyword) {
                            whereClause += ' AND (name LIKE :keyword OR code LIKE :keyword)';
                            replacements.keyword = "%".concat(String(keyword), "%");
                        }
                        // 添加状态过滤
                        if (status_1 !== undefined && status_1 !== '') {
                            whereClause += ' AND status = :status';
                            replacements.status = Number(status_1);
                        }
                        // 添加类型过滤
                        if (type !== undefined && type !== '') {
                            whereClause += ' AND type = :type';
                            replacements.type = Number(type);
                        }
                        // 查询总数
                        console.log('🔍 开始查询总数...');
                        console.log('SQL:', "SELECT COUNT(*) as total FROM kindergartens ".concat(whereClause));
                        console.log('参数:', replacements);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total FROM kindergartens ".concat(whereClause), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _d.sent();
                        countList = Array.isArray(countResult) ? countResult : [];
                        console.log('✅ 查询总数成功:', countList[0]);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM kindergartens\n         ".concat(whereClause, "\n         ORDER BY created_at DESC\n         LIMIT :limit OFFSET :offset"), {
                                replacements: __assign(__assign({}, replacements), { limit: limit, offset: offset }),
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        rows = _d.sent();
                        rowsList = Array.isArray(rows) ? rows : [];
                        formattedRows = rowsList.map(function (row) {
                            var rowData = row;
                            return {
                                id: rowData.id,
                                name: rowData.name,
                                code: rowData.code,
                                type: rowData.type,
                                level: rowData.level,
                                address: rowData.address,
                                longitude: rowData.longitude,
                                latitude: rowData.latitude,
                                phone: rowData.phone,
                                email: rowData.email,
                                principal: rowData.principal,
                                establishedDate: rowData.established_date,
                                area: rowData.area,
                                buildingArea: rowData.building_area,
                                classCount: rowData.class_count,
                                teacherCount: rowData.teacher_count,
                                studentCount: rowData.student_count,
                                description: rowData.description,
                                features: rowData.features,
                                philosophy: rowData.philosophy,
                                feeDescription: rowData.fee_description,
                                status: rowData.status,
                                createdAt: rowData.created_at,
                                updatedAt: rowData.updated_at,
                                deletedAt: rowData.deleted_at
                            };
                        });
                        apiResponse_1.ApiResponse.success(res, {
                            total: countList.length > 0 ? countList[0].total : 0,
                            items: formattedRows,
                            page: Number(page) || 0,
                            pageSize: Number(pageSize) || 0
                        }, '获取幼儿园列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _d.sent();
                        if (error_2 instanceof apiError_1.ApiError) {
                            throw error_2;
                        }
                        throw apiError_1.ApiError.serverError('获取幼儿园列表失败', 'KINDERGARTEN_LIST_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取幼儿园详情
     * @param req 请求对象
     * @param res 响应对象
     */
    KindergartenController.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, groupId, whereClause, replacements, kindergartens, kindergartensList, row, formattedKindergarten, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        groupId = req.query.groupId;
                        if (!id || isNaN(Number(id) || 0)) {
                            throw apiError_1.ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
                        }
                        whereClause = 'WHERE id = :id';
                        replacements = { id: Number(id) || 0 };
                        // ✅ 添加 group_id 验证 - 数据隔离
                        if (groupId) {
                            whereClause += ' AND group_id = :groupId';
                            replacements.groupId = Number(groupId);
                            console.log('✅ 验证集团权限:', groupId);
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM kindergartens ".concat(whereClause), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        kindergartens = _a.sent();
                        kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
                        if (kindergartensList.length === 0) {
                            throw apiError_1.ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
                        }
                        row = kindergartensList[0];
                        formattedKindergarten = {
                            id: row.id,
                            name: row.name,
                            code: row.code,
                            type: row.type,
                            level: row.level,
                            address: row.address,
                            longitude: row.longitude,
                            latitude: row.latitude,
                            phone: row.phone,
                            email: row.email,
                            principal: row.principal,
                            establishedDate: row.established_date,
                            area: row.area,
                            buildingArea: row.building_area,
                            classCount: row.class_count,
                            teacherCount: row.teacher_count,
                            studentCount: row.student_count,
                            description: row.description,
                            features: row.features,
                            philosophy: row.philosophy,
                            feeDescription: row.fee_description,
                            status: row.status,
                            createdAt: row.created_at,
                            updatedAt: row.updated_at,
                            deletedAt: row.deleted_at
                        };
                        apiResponse_1.ApiResponse.success(res, formattedKindergarten, '获取幼儿园详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof apiError_1.ApiError) {
                            throw error_3;
                        }
                        throw apiError_1.ApiError.serverError('获取幼儿园详情失败', 'KINDERGARTEN_DETAIL_ERROR');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新幼儿园信息
     * @param req 请求对象
     * @param res 响应对象
     */
    KindergartenController.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, id, groupId, validatedData, whereClause, replacements, existingKindergartens, existingList, kindergarten, existingWithCode, codeList, updateFields, _i, _a, _b, key, value, dbKey, updatedKindergartens, updatedList, row, formattedKindergarten, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 15, , 17]);
                        id = req.params.id;
                        groupId = req.query.groupId;
                        validatedData = req.body;
                        if (!(!id || isNaN(Number(id) || 0))) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _c.sent();
                        throw apiError_1.ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
                    case 4:
                        whereClause = 'WHERE id = :id';
                        replacements = { id: Number(id) || 0 };
                        // ✅ 添加 group_id 验证 - 数据隔离
                        if (groupId) {
                            whereClause += ' AND group_id = :groupId';
                            replacements.groupId = Number(groupId);
                            console.log('✅ 验证集团权限:', groupId);
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM kindergartens ".concat(whereClause), {
                                replacements: replacements,
                                type: 'SELECT',
                                transaction: transaction
                            })];
                    case 5:
                        existingKindergartens = _c.sent();
                        existingList = Array.isArray(existingKindergartens) ? existingKindergartens : [];
                        if (!(existingList.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, transaction.rollback()];
                    case 6:
                        _c.sent();
                        throw apiError_1.ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
                    case 7:
                        kindergarten = existingList[0];
                        if (!(validatedData.code && validatedData.code !== kindergarten.code)) return [3 /*break*/, 10];
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM kindergartens WHERE code = :code AND id != :id", {
                                replacements: { code: validatedData.code, id: Number(id) || 0 },
                                type: 'SELECT',
                                transaction: transaction
                            })];
                    case 8:
                        existingWithCode = _c.sent();
                        codeList = Array.isArray(existingWithCode) ? existingWithCode : [];
                        if (!(codeList.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, transaction.rollback()];
                    case 9:
                        _c.sent();
                        throw apiError_1.ApiError.badRequest('幼儿园编码已存在', 'KINDERGARTEN_CODE_EXISTS');
                    case 10:
                        updateFields = [];
                        // ✅ 重用 replacements 对象，而不是重新声明
                        replacements.id = Number(id) || 0;
                        for (_i = 0, _a = Object.entries(validatedData); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (value !== undefined) {
                                dbKey = key.replace(/[A-Z]/g, function (letter) { return "_".concat(letter.toLowerCase()); });
                                updateFields.push("".concat(dbKey, " = :").concat(key));
                                replacements[key] = value;
                            }
                        }
                        if (!(updateFields.length > 0)) return [3 /*break*/, 12];
                        updateFields.push('updated_at = NOW()');
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE kindergartens SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                                replacements: replacements,
                                transaction: transaction
                            })];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12: return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM kindergartens WHERE id = :id", {
                            replacements: { id: Number(id) || 0 },
                            type: 'SELECT',
                            transaction: transaction
                        })];
                    case 13:
                        updatedKindergartens = _c.sent();
                        updatedList = Array.isArray(updatedKindergartens) ? updatedKindergartens : [];
                        row = updatedList[0];
                        formattedKindergarten = {
                            id: row.id,
                            name: row.name,
                            code: row.code,
                            type: row.type,
                            level: row.level,
                            address: row.address,
                            longitude: row.longitude,
                            latitude: row.latitude,
                            phone: row.phone,
                            email: row.email,
                            principal: row.principal,
                            establishedDate: row.established_date,
                            area: row.area,
                            buildingArea: row.building_area,
                            classCount: row.class_count,
                            teacherCount: row.teacher_count,
                            studentCount: row.student_count,
                            description: row.description,
                            features: row.features,
                            philosophy: row.philosophy,
                            feeDescription: row.fee_description,
                            status: row.status,
                            createdAt: row.created_at,
                            updatedAt: row.updated_at,
                            deletedAt: row.deleted_at
                        };
                        return [4 /*yield*/, transaction.commit()];
                    case 14:
                        _c.sent();
                        apiResponse_1.ApiResponse.success(res, formattedKindergarten, '幼儿园更新成功');
                        return [3 /*break*/, 17];
                    case 15:
                        error_4 = _c.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 16:
                        _c.sent();
                        if (error_4 instanceof apiError_1.ApiError) {
                            throw error_4;
                        }
                        throw apiError_1.ApiError.serverError('更新幼儿园失败', 'KINDERGARTEN_UPDATE_ERROR');
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除幼儿园
     * @param req 请求对象
     * @param res 响应对象
     */
    KindergartenController["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, isTransactionFinished, id, groupId, whereClause, replacements, kindergartens, kindergartensList, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        isTransactionFinished = false;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 13]);
                        id = req.params.id;
                        groupId = req.query.groupId;
                        if (!(!id || isNaN(Number(id) || 0))) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _a.sent();
                        isTransactionFinished = true;
                        throw apiError_1.ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
                    case 4:
                        whereClause = 'WHERE id = :id';
                        replacements = { id: Number(id) || 0 };
                        // ✅ 添加 group_id 验证 - 数据隔离
                        if (groupId) {
                            whereClause += ' AND group_id = :groupId';
                            replacements.groupId = Number(groupId);
                            console.log('✅ 验证集团权限:', groupId);
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM kindergartens ".concat(whereClause), {
                                replacements: replacements,
                                type: 'SELECT',
                                transaction: transaction
                            })];
                    case 5:
                        kindergartens = _a.sent();
                        kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
                        if (!(kindergartensList.length === 0)) return [3 /*break*/, 7];
                        // 幼儿园不存在，但删除操作仍然成功（幂等性）
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        // 幼儿园不存在，但删除操作仍然成功（幂等性）
                        _a.sent();
                        isTransactionFinished = true;
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { message: '删除幼儿园成功' })];
                    case 7: 
                    // 删除幼儿园
                    return [4 /*yield*/, init_1.sequelize.query("DELETE FROM kindergartens ".concat(whereClause), {
                            replacements: replacements,
                            transaction: transaction
                        })];
                    case 8:
                        // 删除幼儿园
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 9:
                        _a.sent();
                        isTransactionFinished = true;
                        apiResponse_1.ApiResponse.success(res, { message: '删除幼儿园成功' });
                        return [3 /*break*/, 13];
                    case 10:
                        error_5 = _a.sent();
                        if (!!isTransactionFinished) return [3 /*break*/, 12];
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if (error_5 instanceof apiError_1.ApiError) {
                            throw error_5;
                        }
                        throw apiError_1.ApiError.serverError('删除幼儿园失败', 'KINDERGARTEN_DELETE_ERROR');
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return KindergartenController;
}());
exports.KindergartenController = KindergartenController;
exports["default"] = KindergartenController;
