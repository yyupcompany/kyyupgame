"use strict";
/**
 * 安全扫描日志模型
 * 用于记录安全扫描的执行历史和结果
 */
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
exports.SecurityScanLog = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var SecurityScanLog = /** @class */ (function (_super) {
    __extends(SecurityScanLog, _super);
    function SecurityScanLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SecurityScanLog;
}(sequelize_1.Model));
exports.SecurityScanLog = SecurityScanLog;
SecurityScanLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    scanType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        comment: '扫描类型：如quick、full、custom等'
    },
    targets: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '扫描目标（JSON格式）'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '扫描状态'
    },
    startedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '启动扫描的用户ID'
    },
    startedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: '扫描开始时间'
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '扫描完成时间'
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '扫描耗时（秒）'
    },
    threatsFound: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '发现的威胁数量'
    },
    vulnerabilitiesFound: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '发现的漏洞数量'
    },
    results: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '扫描结果（JSON格式）'
    },
    errorMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '错误信息'
    },
    metadata: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '额外元数据（JSON格式）'
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
    }
}, {
    sequelize: init_1.sequelize,
    tableName: 'security_scan_logs',
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['scanType']
        },
        {
            fields: ['startedBy']
        },
        {
            fields: ['startedAt']
        }
    ],
    comment: '安全扫描日志表'
});
exports["default"] = SecurityScanLog;
