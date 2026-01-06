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
exports.__esModule = true;
exports.initCouponAssociations = exports.initCoupon = exports.Coupon = exports.CouponStatus = exports.DiscountType = exports.CouponType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
/**
 * 优惠券类型
 */
var CouponType;
(function (CouponType) {
    CouponType[CouponType["NEW_STUDENT_REGISTRATION"] = 1] = "NEW_STUDENT_REGISTRATION";
    CouponType[CouponType["EVENT_PARTICIPATION"] = 2] = "EVENT_PARTICIPATION";
    CouponType[CouponType["REFERRAL_BONUS"] = 3] = "REFERRAL_BONUS";
    CouponType[CouponType["HOLIDAY_SPECIAL"] = 4] = "HOLIDAY_SPECIAL";
    CouponType[CouponType["BIRTHDAY_COUPON"] = 5] = "BIRTHDAY_COUPON";
    CouponType[CouponType["GENERAL_COUPON"] = 6] = "GENERAL_COUPON";
})(CouponType = exports.CouponType || (exports.CouponType = {}));
/**
 * 优惠方式
 */
var DiscountType;
(function (DiscountType) {
    DiscountType[DiscountType["FIXED_AMOUNT"] = 1] = "FIXED_AMOUNT";
    DiscountType[DiscountType["PERCENTAGE"] = 2] = "PERCENTAGE";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
/**
 * 优惠券状态
 */
var CouponStatus;
(function (CouponStatus) {
    CouponStatus[CouponStatus["DISABLED"] = 0] = "DISABLED";
    CouponStatus[CouponStatus["ACTIVE"] = 1] = "ACTIVE";
    CouponStatus[CouponStatus["PAUSED"] = 2] = "PAUSED";
    CouponStatus[CouponStatus["ENDED"] = 3] = "ENDED";
})(CouponStatus = exports.CouponStatus || (exports.CouponStatus = {}));
var Coupon = /** @class */ (function (_super) {
    __extends(Coupon, _super);
    function Coupon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Coupon;
}(sequelize_1.Model));
exports.Coupon = Coupon;
var initCoupon = function (sequelize) {
    Coupon.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '优惠券ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID',
            references: {
                model: 'kindergartens',
                key: 'id'
            }
        },
        code: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '优惠券代码'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '优惠券名称'
        },
        type: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '优惠券类型 - 1:新生注册券 2:活动参与券 3:老生推荐券 4:节日特惠券 5:生日优惠券 6:通用优惠券'
        },
        discountType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '优惠方式 - 1:固定金额 2:百分比'
        },
        discountValue: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '优惠值'
        },
        minAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
            comment: '最低使用金额'
        },
        maxDiscount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '最大优惠金额'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '生效日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '失效日期'
        },
        totalQuantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '总数量'
        },
        usedQuantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '已使用数量'
        },
        perUserLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '每人限领数量'
        },
        applicableScope: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '适用范围'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '优惠券描述'
        },
        rules: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '使用规则'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: CouponStatus.DISABLED,
            comment: '状态 - 0:未启用 1:已启用 2:已暂停 3:已结束'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'coupons',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Coupon;
};
exports.initCoupon = initCoupon;
var initCouponAssociations = function () {
    Coupon.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    Coupon.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Coupon.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initCouponAssociations = initCouponAssociations;
