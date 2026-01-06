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
exports.ParentController = void 0;
var parent_service_1 = require("../services/parent/parent.service");
/**
 * 家长控制器
 * 实现对家长信息的增删改查
 */
var ParentController = /** @class */ (function () {
    function ParentController() {
        var _this = this;
        /**
         * 创建家长
         * @param req 请求对象
         * @param res 响应对象
         * @param next 下一个中间件
         */
        this.create = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentData, parent_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parentData = req.body;
                        return [4 /*yield*/, this.parentService.create(parentData)];
                    case 1:
                        parent_1 = _a.sent();
                        res.status(201).json({ data: parent_1, message: '家长创建成功' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取家长列表（支持分页和搜索）
         * @param req 请求对象
         * @param res 响应对象
         * @param next 下一个中间件
         */
        this.list = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, keyword, studentId, userId, relationship, isPrimaryContact, isLegalGuardian, _d, sortBy, _e, sortOrder, filters, result, error_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, keyword = _a.keyword, studentId = _a.studentId, userId = _a.userId, relationship = _a.relationship, isPrimaryContact = _a.isPrimaryContact, isLegalGuardian = _a.isLegalGuardian, _d = _a.sortBy, sortBy = _d === void 0 ? 'createdAt' : _d, _e = _a.sortOrder, sortOrder = _e === void 0 ? 'DESC' : _e;
                        filters = {
                            page: Number(page),
                            pageSize: Number(pageSize),
                            keyword: keyword,
                            studentId: studentId ? Number(studentId) : undefined,
                            userId: userId ? Number(userId) : undefined,
                            relationship: relationship,
                            isPrimaryContact: isPrimaryContact !== undefined ? Number(isPrimaryContact) : undefined,
                            isLegalGuardian: isLegalGuardian !== undefined ? Number(isLegalGuardian) : undefined,
                            sortBy: sortBy,
                            sortOrder: sortOrder.toUpperCase()
                        };
                        return [4 /*yield*/, this.parentService.list(filters)];
                    case 1:
                        result = _f.sent();
                        res.status(200).json({
                            success: true,
                            data: {
                                list: result.rows,
                                total: result.count,
                                page: filters.page,
                                pageSize: filters.pageSize
                            },
                            message: '获取家长列表成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _f.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 根据ID获取家长
         * @param req 请求对象
         * @param res 响应对象
         * @param next 下一个中间件
         */
        this.detail = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, findOneParentData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parentId = Number(req.params.id);
                        return [4 /*yield*/, this.parentService.detail(parentId)];
                    case 1:
                        findOneParentData = _a.sent();
                        res.status(200).json({ data: findOneParentData, message: '获取家长详情成功' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新家长信息
         * @param req 请求对象
         * @param res 响应对象
         * @param next 下一个中间件
         */
        this.update = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, parentData, updateParentData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parentId = Number(req.params.id);
                        parentData = req.body;
                        return [4 /*yield*/, this.parentService.update(parentId, parentData)];
                    case 1:
                        updateParentData = _a.sent();
                        res.status(200).json({ data: updateParentData, message: '更新成功' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除家长
         * @param req 请求对象
         * @param res 响应对象
         * @param next 下一个中间件
         */
        this["delete"] = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parentId = Number(req.params.id);
                        return [4 /*yield*/, this.parentService["delete"](parentId)];
                    case 1:
                        _a.sent();
                        res.status(200).json({ message: '删除成功' });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.parentService = new parent_service_1.ParentService();
    }
    return ParentController;
}());
exports.ParentController = ParentController;
