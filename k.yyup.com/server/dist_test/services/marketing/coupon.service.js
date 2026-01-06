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
exports.CouponService = void 0;
var sequelize_1 = require("sequelize");
var coupon_model_1 = require("../../models/coupon.model");
/**
 * 优惠券服务实现
 * @description 实现优惠券管理相关的业务逻辑
 */
var CouponService = /** @class */ (function () {
    function CouponService() {
    }
    /**
     * 创建优惠券
     * @param data 优惠券创建数据
     * @returns 创建的优惠券实例
     */
    CouponService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var coupon, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, coupon_model_1.Coupon.create(data)];
                    case 1:
                        coupon = _a.sent();
                        return [2 /*return*/, coupon];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建优惠券失败:', error_1);
                        throw new Error('创建优惠券失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找优惠券
     * @param id 优惠券ID
     * @returns 优惠券实例或null
     */
    CouponService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var coupon, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, coupon_model_1.Coupon.findByPk(id)];
                    case 1:
                        coupon = _a.sent();
                        return [2 /*return*/, coupon];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询优惠券失败:', error_2);
                        throw new Error('查询优惠券失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的优惠券
     * @param options 查询选项
     * @returns 优惠券数组
     */
    CouponService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var coupons, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, coupon_model_1.Coupon.findAll(options)];
                    case 1:
                        coupons = _a.sent();
                        return [2 /*return*/, coupons];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询优惠券列表失败:', error_3);
                        throw new Error('查询优惠券列表失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新优惠券信息
     * @param id 优惠券ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    CouponService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, coupon_model_1.Coupon.update(data, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('更新优惠券失败:', error_4);
                        throw new Error('更新优惠券失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除优惠券
     * @param id 优惠券ID
     * @returns 是否删除成功
     */
    CouponService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, coupon_model_1.Coupon.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error('删除优惠券失败:', error_5);
                        throw new Error('删除优惠券失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发放优惠券给用户
     * @param couponId 优惠券ID
     * @param userId 用户ID
     * @returns 是否发放成功
     */
    CouponService.prototype.issue = function (couponId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: 实现优惠券发放逻辑
                    // 1. 检查优惠券是否存在且有效
                    // 2. 检查用户是否已领取过该优惠券
                    // 3. 创建用户优惠券关联记录
                    // 4. 更新优惠券发放数量
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('发放优惠券失败:', error);
                    throw new Error('发放优惠券失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 验证优惠券是否有效
     * @param couponCode 优惠券码
     * @param userId 用户ID
     * @returns 是否有效
     */
    CouponService.prototype.verify = function (couponCode, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: 实现优惠券验证逻辑
                    // 1. 根据couponCode查找优惠券
                    // 2. 检查优惠券是否过期
                    // 3. 检查优惠券是否已使用
                    // 4. 检查用户是否有权使用该优惠券
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('验证优惠券失败:', error);
                    throw new Error('验证优惠券失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 使用优惠券
     * @param couponCode 优惠券码
     * @param userId 用户ID
     * @returns 是否使用成功
     */
    CouponService.prototype.use = function (couponCode, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: 实现优惠券使用逻辑
                    // 1. 验证优惠券是否有效
                    // 2. 标记优惠券为已使用状态
                    // 3. 记录使用时间和用户
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('使用优惠券失败:', error);
                    throw new Error('使用优惠券失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取优惠券统计信息
     * @param kindergartenId 幼儿园ID
     * @returns 统计信息
     */
    CouponService.prototype.getStats = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, total, used, expired, active, redemptionRate, error_6;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 5, , 6]);
                        now = new Date();
                        return [4 /*yield*/, coupon_model_1.Coupon.count({
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 1:
                        total = _e.sent();
                        return [4 /*yield*/, coupon_model_1.Coupon.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: 'used'
                                }
                            })];
                    case 2:
                        used = _e.sent();
                        return [4 /*yield*/, coupon_model_1.Coupon.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    endDate: (_a = {}, _a[sequelize_1.Op.lt] = now, _a),
                                    status: (_b = {}, _b[sequelize_1.Op.ne] = 'used', _b)
                                }
                            })];
                    case 3:
                        expired = _e.sent();
                        return [4 /*yield*/, coupon_model_1.Coupon.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    startDate: (_c = {}, _c[sequelize_1.Op.lte] = now, _c),
                                    endDate: (_d = {}, _d[sequelize_1.Op.gt] = now, _d),
                                    status: 'active'
                                }
                            })];
                    case 4:
                        active = _e.sent();
                        redemptionRate = total > 0 ? (used / total) * 100 : 0;
                        return [2 /*return*/, {
                                total: total,
                                used: used,
                                expired: expired,
                                active: active,
                                redemptionRate: redemptionRate
                            }];
                    case 5:
                        error_6 = _e.sent();
                        console.error('获取优惠券统计失败:', error_6);
                        throw new Error('获取优惠券统计失败');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return CouponService;
}());
exports.CouponService = CouponService;
exports["default"] = new CouponService();
