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
exports.initEnrollmentQuotaAssociations = exports.initEnrollmentQuota = exports.EnrollmentQuota = void 0;
var sequelize_1 = require("sequelize");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var class_model_1 = require("./class.model");
var EnrollmentQuota = /** @class */ (function (_super) {
    __extends(EnrollmentQuota, _super);
    function EnrollmentQuota() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EnrollmentQuota;
}(sequelize_1.Model));
exports.EnrollmentQuota = EnrollmentQuota;
var initEnrollmentQuota = function (sequelize) {
    EnrollmentQuota.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '招生配额ID - 主键'
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '招生计划ID - 外键关联招生计划表',
            references: {
                model: 'enrollment_plans',
                key: 'id'
            }
        },
        classId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '班级ID - 外键关联班级表',
            references: {
                model: 'classes',
                key: 'id'
            }
        },
        totalQuota: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '总配额'
        },
        usedQuota: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: '已使用配额'
        },
        reservedQuota: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            comment: '预留配额'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '更新时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'enrollment_quotas',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return EnrollmentQuota;
};
exports.initEnrollmentQuota = initEnrollmentQuota;
var initEnrollmentQuotaAssociations = function () {
    EnrollmentQuota.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    EnrollmentQuota.belongsTo(class_model_1.Class, { foreignKey: 'classId', as: 'class' });
};
exports.initEnrollmentQuotaAssociations = initEnrollmentQuotaAssociations;
