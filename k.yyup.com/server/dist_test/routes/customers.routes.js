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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerStats:
 *       type: object
 *       properties:
 *         totalCustomers:
 *           type: integer
 *           description: 总客户数
 *         dealCustomers:
 *           type: integer
 *           description: 成交客户数
 *         intentionCustomers:
 *           type: integer
 *           description: 意向客户数
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户ID
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *         contactPhone:
 *           type: string
 *           description: 联系电话
 *         childName:
 *           type: string
 *           description: 孩子姓名
 *         status:
 *           type: string
 *           description: 客户状态
 *         source:
 *           type: string
 *           description: 客户来源
 *         consultDate:
 *           type: string
 *           description: 咨询时间
 *         nextFollowup:
 *           type: string
 *           description: 下次跟进时间
 *         remark:
 *           type: string
 *           description: 备注
 */
/**
 * @swagger
 * /api/customers/stats:
 *   get:
 *     summary: 获取客户统计数据
 *     tags: [客户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomerStats'
 */
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var totalResult, intentionResult, dealResult, totalCustomers, intentionCustomers, dealCustomers, conversionRate, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log('📊 获取客户统计数据...');
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as total FROM enrollment_consultations WHERE deleted_at IS NULL', { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                totalResult = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as intention FROM enrollment_consultations WHERE deleted_at IS NULL AND intention_level >= 3', { type: sequelize_1.QueryTypes.SELECT })];
            case 2:
                intentionResult = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query('SELECT COUNT(*) as deal FROM enrollment_consultations WHERE deleted_at IS NULL AND followup_status = 5', { type: sequelize_1.QueryTypes.SELECT })];
            case 3:
                dealResult = (_a.sent())[0];
                totalCustomers = totalResult.total || 0;
                intentionCustomers = intentionResult.intention || 0;
                dealCustomers = dealResult.deal || 0;
                conversionRate = totalCustomers > 0 ? ((dealCustomers / totalCustomers) * 100).toFixed(1) : '0.0';
                console.log("\u2705 \u7EDF\u8BA1\u6570\u636E: \u603B\u5BA2\u6237".concat(totalCustomers, ", \u610F\u5411\u5BA2\u6237").concat(intentionCustomers, ", \u6210\u4EA4\u5BA2\u6237").concat(dealCustomers, ", \u8F6C\u5316\u7387").concat(conversionRate, "%"));
                res.json({
                    success: true,
                    data: {
                        totalCustomers: totalCustomers,
                        dealCustomers: dealCustomers,
                        intentionCustomers: intentionCustomers,
                        conversionRate: parseFloat(conversionRate)
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('获取客户统计数据失败:', error_1);
                res.status(500).json({
                    success: false,
                    error: { code: 'SERVER_ERROR', message: error_1.message }
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/customers/list:
 *   get:
 *     summary: 获取客户列表
 *     tags: [客户管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 客户姓名
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: 联系电话
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 客户状态
 *     responses:
 *       200:
 *         description: 成功获取客户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Customer'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 */
router.get('/list', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, _d, name_1, _e, phone, _f, status_1, offset, whereConditions, replacements, whereClause, countResult, listQuery, listResult, total, error_2;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, _d = _a.name, name_1 = _d === void 0 ? '' : _d, _e = _a.phone, phone = _e === void 0 ? '' : _e, _f = _a.status, status_1 = _f === void 0 ? '' : _f;
                offset = (Number(page) - 1) * Number(pageSize);
                console.log("\uD83D\uDCCB \u83B7\u53D6\u5BA2\u6237\u5217\u8868: \u9875\u7801".concat(page, ", \u6BCF\u9875").concat(pageSize, ", \u59D3\u540D\"").concat(name_1, "\", \u7535\u8BDD\"").concat(phone, "\", \u72B6\u6001\"").concat(status_1, "\""));
                whereConditions = ['deleted_at IS NULL'];
                replacements = [];
                if (name_1) {
                    whereConditions.push('parent_name LIKE ?');
                    replacements.push("%".concat(name_1, "%"));
                }
                if (phone) {
                    whereConditions.push('contact_phone LIKE ?');
                    replacements.push("%".concat(phone, "%"));
                }
                if (status_1) {
                    // 根据状态映射到数据库字段
                    if (status_1 === 'intention') {
                        whereConditions.push('intention_level >= 3');
                    }
                    else if (status_1 === 'deal') {
                        whereConditions.push('followup_status = 5');
                    }
                }
                whereClause = whereConditions.join(' AND ');
                return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total FROM enrollment_consultations WHERE ".concat(whereClause), { replacements: replacements, type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                countResult = (_g.sent())[0];
                listQuery = "\n      SELECT \n        id,\n        parent_name as parentName,\n        contact_phone as contactPhone,\n        child_name as childName,\n        CASE \n          WHEN followup_status = 5 THEN '\u6210\u4EA4\u5BA2\u6237'\n          WHEN intention_level >= 3 THEN '\u610F\u5411\u5BA2\u6237'\n          ELSE '\u6F5C\u5728\u5BA2\u6237'\n        END as status,\n        CASE source_channel\n          WHEN 1 THEN '\u7EBF\u4E0A\u63A8\u5E7F'\n          WHEN 2 THEN '\u670B\u53CB\u63A8\u8350'\n          WHEN 3 THEN '\u7535\u8BDD\u54A8\u8BE2'\n          WHEN 4 THEN '\u73B0\u573A\u54A8\u8BE2'\n          ELSE '\u5176\u4ED6'\n        END as source,\n        consult_date as consultDate,\n        next_followup_date as nextFollowup,\n        remark,\n        created_at as createdAt\n      FROM enrollment_consultations \n      WHERE ".concat(whereClause, "\n      ORDER BY created_at DESC\n      LIMIT ? OFFSET ?\n    ");
                return [4 /*yield*/, init_1.sequelize.query(listQuery, {
                        replacements: __spreadArray(__spreadArray([], replacements, true), [Number(pageSize), offset], false),
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                listResult = _g.sent();
                total = countResult.total || 0;
                console.log("\u2705 \u5BA2\u6237\u5217\u8868\u83B7\u53D6\u6210\u529F: \u5171".concat(total, "\u6761\u8BB0\u5F55, \u5F53\u524D\u9875").concat(listResult.length, "\u6761"));
                res.json({
                    success: true,
                    data: {
                        list: listResult,
                        total: total,
                        page: Number(page),
                        pageSize: Number(pageSize)
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _g.sent();
                console.error('获取客户列表失败:', error_2);
                res.status(500).json({
                    success: false,
                    error: { code: 'SERVER_ERROR', message: error_2.message }
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
