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
exports.getUsers = void 0;
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var getSequelizeInstance = function () {
    if (!init_1.sequelize) {
        throw new Error('Sequelize实例未初始化，请检查数据库连接');
    }
    return init_1.sequelize;
};
/**
 * 获取用户列表 - 简化版本
 */
var getUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, page, pageSize, limit, offset, countQuery, countResults, total, listQuery, usersResults, usersList, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔍 [DEBUG] getUsers函数开始执行');
                console.log('🔍 [DEBUG] 请求参数:', req.query);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                db = getSequelizeInstance();
                page = req.query.page ? Number(req.query.page) : 1;
                pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
                limit = Math.min(100, Math.max(1, pageSize));
                offset = (page - 1) * limit;
                console.log('🔍 分页参数:', { page: page, pageSize: pageSize, limit: limit, offset: offset });
                countQuery = "SELECT COUNT(*) as total FROM users";
                console.log('🔍 计数查询:', countQuery);
                return [4 /*yield*/, db.query(countQuery, { type: 'SELECT' })];
            case 2:
                countResults = _a.sent();
                total = countResults && Array.isArray(countResults) && countResults.length > 0
                    ? Number(countResults[0].total)
                    : 0;
                console.log('🔍 用户总数:', total);
                listQuery = "\n      SELECT \n        id, username, email, real_name as realName, phone, status, \n        created_at as createdAt, updated_at as updatedAt\n      FROM users\n      ORDER BY created_at DESC\n      LIMIT ? OFFSET ?";
                console.log('🔍 列表查询:', listQuery, '参数:', [limit, offset]);
                return [4 /*yield*/, db.query(listQuery, {
                        replacements: [limit, offset],
                        type: 'SELECT'
                    })];
            case 3:
                usersResults = _a.sent();
                usersList = Array.isArray(usersResults) ? usersResults : [];
                console.log('🔍 查询结果:', {
                    isArray: Array.isArray(usersList),
                    length: usersList.length
                });
                // 返回结果
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        total: total,
                        page: page,
                        pageSize: limit,
                        items: usersList
                    }, '获取用户列表成功')];
            case 4:
                error_1 = _a.sent();
                console.error('❌ 获取用户列表失败:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25: ".concat(error_1.message), 'USER_QUERY_ERROR', 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getUsers = getUsers;
