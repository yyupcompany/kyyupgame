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
exports.CustomerApplication = exports.CustomerApplicationStatus = void 0;
var sequelize_1 = require("sequelize");
/**
 * 客户申请状态枚举
 */
var CustomerApplicationStatus;
(function (CustomerApplicationStatus) {
    CustomerApplicationStatus["PENDING"] = "pending";
    CustomerApplicationStatus["APPROVED"] = "approved";
    CustomerApplicationStatus["REJECTED"] = "rejected";
})(CustomerApplicationStatus = exports.CustomerApplicationStatus || (exports.CustomerApplicationStatus = {}));
/**
 * 客户申请记录模型
 */
var CustomerApplication = /** @class */ (function (_super) {
    __extends(CustomerApplication, _super);
    function CustomerApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 清理undefined值
     */
    CustomerApplication.cleanUndefinedValues = function (data) {
        var cleanedData = {};
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            if (value === undefined) {
                console.warn("\u26A0\uFE0F CustomerApplication\u6A21\u578B\u6E05\u7406undefined\u503C: ".concat(key, " -> null"));
                cleanedData[key] = null;
            }
            else {
                cleanedData[key] = value;
            }
        });
        console.log('🔍 CustomerApplication模型数据清理完成:', Object.keys(cleanedData).length, '个字段');
        return cleanedData;
    };
    /**
     * 初始化模型
     */
    CustomerApplication.initModel = function (sequelize) {
        CustomerApplication.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            customerId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '客户ID',
                references: {
                    model: 'parents',
                    key: 'id'
                }
            },
            teacherId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '申请教师ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            principalId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '审批园长ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            kindergartenId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '幼儿园ID',
                references: {
                    model: 'kindergartens',
                    key: 'id'
                }
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
                comment: '申请状态：pending-待审批，approved-已同意，rejected-已拒绝'
            },
            applyReason: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '申请理由'
            },
            rejectReason: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '拒绝理由'
            },
            appliedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                comment: '申请时间'
            },
            reviewedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '审批时间'
            },
            notificationId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '关联的通知ID'
            },
            metadata: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                comment: '扩展数据'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: '删除时间（软删除）'
            }
        }, {
            sequelize: sequelize,
            tableName: 'customer_applications',
            timestamps: true,
            paranoid: true,
            underscored: false,
            indexes: [
                { fields: ['customerId'] },
                { fields: ['teacherId'] },
                { fields: ['principalId'] },
                { fields: ['kindergartenId'] },
                { fields: ['status'] },
                { fields: ['appliedAt'] },
                { fields: ['reviewedAt'] },
                { fields: ['teacherId', 'status'] },
                { fields: ['customerId', 'status'] },
            ]
        });
    };
    /**
     * 定义模型关联
     */
    CustomerApplication.associate = function (models) {
        // 关联客户
        CustomerApplication.belongsTo(models.Parent, {
            foreignKey: 'customerId',
            as: 'customer'
        });
        // 关联申请教师
        CustomerApplication.belongsTo(models.User, {
            foreignKey: 'teacherId',
            as: 'teacher'
        });
        // 关联审批园长
        CustomerApplication.belongsTo(models.User, {
            foreignKey: 'principalId',
            as: 'principal'
        });
        // 关联幼儿园
        CustomerApplication.belongsTo(models.Kindergarten, {
            foreignKey: 'kindergartenId',
            as: 'kindergarten'
        });
    };
    return CustomerApplication;
}(sequelize_1.Model));
exports.CustomerApplication = CustomerApplication;
exports["default"] = CustomerApplication;
