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
exports.initOperationLogAssociations = exports.initOperationLog = exports.OperationLog = exports.OperationResult = exports.OperationType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * 操作类型
 */
var OperationType;
(function (OperationType) {
    OperationType["CREATE"] = "create";
    OperationType["READ"] = "read";
    OperationType["UPDATE"] = "update";
    OperationType["DELETE"] = "delete";
    OperationType["LOGIN"] = "login";
    OperationType["LOGOUT"] = "logout";
    OperationType["OTHER"] = "other";
})(OperationType = exports.OperationType || (exports.OperationType = {}));
/**
 * 操作结果
 */
var OperationResult;
(function (OperationResult) {
    OperationResult["SUCCESS"] = "success";
    OperationResult["FAILED"] = "failed";
})(OperationResult = exports.OperationResult || (exports.OperationResult = {}));
var OperationLog = /** @class */ (function (_super) {
    __extends(OperationLog, _super);
    function OperationLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OperationLog;
}(sequelize_1.Model));
exports.OperationLog = OperationLog;
var initOperationLog = function (sequelize) {
    OperationLog.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '日志ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '操作用户ID'
        },
        module: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '操作模块'
        },
        action: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '操作行为'
        },
        operationType: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '操作类型: create, read, update, delete, login, logout, other'
        },
        resourceType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '资源类型'
        },
        resourceId: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '资源ID'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '操作描述'
        },
        requestMethod: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            comment: '请求方法: GET, POST, PUT, DELETE等'
        },
        requestUrl: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '请求URL'
        },
        requestParams: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '请求参数'
        },
        requestIp: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '请求IP'
        },
        userAgent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '用户代理'
        },
        deviceInfo: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '设备信息'
        },
        operationResult: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            comment: '操作结果: success, failed'
        },
        resultMessage: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '结果信息'
        },
        executionTime: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '执行时间(ms)'
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
        tableName: 'operation_logs',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return OperationLog;
};
exports.initOperationLog = initOperationLog;
var initOperationLogAssociations = function () {
    OperationLog.belongsTo(user_model_1.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};
exports.initOperationLogAssociations = initOperationLogAssociations;
