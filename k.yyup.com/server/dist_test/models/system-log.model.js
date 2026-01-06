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
exports.SystemLog = exports.SystemLogStatus = exports.LogCategory = exports.SystemLogType = exports.OperationType = exports.LogLevel = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["DEBUG"] = "debug";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
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
var SystemLogType;
(function (SystemLogType) {
    SystemLogType["OPERATION"] = "operation";
    SystemLogType["SYSTEM"] = "system";
    SystemLogType["ERROR"] = "error";
})(SystemLogType = exports.SystemLogType || (exports.SystemLogType = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory["USER"] = "user";
    LogCategory["SYSTEM"] = "system";
    LogCategory["DATABASE"] = "database";
    LogCategory["SECURITY"] = "security";
})(LogCategory = exports.LogCategory || (exports.LogCategory = {}));
var SystemLogStatus;
(function (SystemLogStatus) {
    SystemLogStatus["SUCCESS"] = "success";
    SystemLogStatus["FAILURE"] = "failure";
})(SystemLogStatus = exports.SystemLogStatus || (exports.SystemLogStatus = {}));
var SystemLog = /** @class */ (function (_super) {
    __extends(SystemLog, _super);
    function SystemLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SystemLog.initModel = function (sequelize) {
        SystemLog.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            level: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(LogLevel)),
                allowNull: false,
                defaultValue: LogLevel.INFO,
                comment: '日志级别'
            },
            operationType: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(OperationType)),
                allowNull: false,
                field: 'operation_type',
                comment: '操作类型'
            },
            moduleName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                field: 'module_name',
                comment: '模块名称'
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '日志消息'
            },
            details: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                comment: '详细信息（JSON格式）'
            },
            ipAddress: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'ip_address',
                comment: 'IP地址'
            },
            userAgent: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'user_agent',
                comment: '用户代理信息'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'user_id',
                comment: '用户ID'
            },
            type: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(SystemLogType)),
                allowNull: true,
                comment: '日志类型'
            },
            category: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(LogCategory)),
                allowNull: true,
                comment: '日志分类'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(SystemLogStatus)),
                allowNull: true,
                comment: '日志状态'
            },
            username: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '用户名'
            },
            action: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '操作动作'
            },
            method: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                comment: '请求方法'
            },
            requestMethod: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                field: 'request_method',
                comment: '请求方法'
            },
            requestUrl: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'request_url',
                comment: '请求URL'
            },
            path: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '请求路径'
            },
            responseStatus: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'response_status',
                comment: '响应状态码'
            },
            statusCode: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'status_code',
                comment: '状态码'
            },
            executionTime: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'execution_time',
                comment: '执行时间（毫秒）'
            },
            duration: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '持续时间（毫秒）'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                comment: '创建时间'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                comment: '更新时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'system_logs',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    SystemLog.initAssociations = function () {
        SystemLog.belongsTo(user_model_1.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };
    return SystemLog;
}(sequelize_1.Model));
exports.SystemLog = SystemLog;
exports["default"] = SystemLog;
