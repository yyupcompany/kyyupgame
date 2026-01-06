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
exports.associateAttendanceChangeLog = exports.initAttendanceChangeLogModel = exports.AttendanceChangeLog = exports.ChangeType = void 0;
var sequelize_1 = require("sequelize");
/**
 * 修改类型枚举
 */
var ChangeType;
(function (ChangeType) {
    ChangeType["CREATE"] = "create";
    ChangeType["UPDATE"] = "update";
    ChangeType["DELETE"] = "delete";
    ChangeType["RESET"] = "reset";
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
/**
 * 考勤修改日志模型
 */
var AttendanceChangeLog = /** @class */ (function (_super) {
    __extends(AttendanceChangeLog, _super);
    function AttendanceChangeLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AttendanceChangeLog;
}(sequelize_1.Model));
exports.AttendanceChangeLog = AttendanceChangeLog;
/**
 * 初始化考勤修改日志模型
 */
function initAttendanceChangeLogModel(sequelize) {
    AttendanceChangeLog.init({
        // 主键
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '日志ID'
        },
        // 关联字段
        attendanceId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'attendance_id',
            comment: '考勤记录ID'
        },
        // 修改信息
        changeType: {
            type: sequelize_1.DataTypes.ENUM('create', 'update', 'delete', 'reset'),
            allowNull: false,
            field: 'change_type',
            comment: '修改类型'
        },
        oldStatus: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'old_status',
            comment: '修改前状态'
        },
        newStatus: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'new_status',
            comment: '修改后状态'
        },
        oldData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            field: 'old_data',
            comment: '修改前完整数据'
        },
        newData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            field: 'new_data',
            comment: '修改后完整数据'
        },
        // 操作信息
        changedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'changed_by',
            comment: '修改人ID'
        },
        changedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'changed_at',
            comment: '修改时间'
        },
        changeReason: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'change_reason',
            comment: '修改原因'
        },
        // 审核信息
        requiresApproval: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'requires_approval',
            comment: '是否需要审核'
        },
        isApproved: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            field: 'is_approved',
            comment: '是否已审核'
        },
        approvedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'approved_by',
            comment: '审核人ID'
        },
        approvedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'approved_at',
            comment: '审核时间'
        },
        // 时间戳
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at',
            comment: '创建时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'attendance_change_logs',
        timestamps: false,
        underscored: true,
        comment: '考勤修改日志表',
        indexes: [
            {
                name: 'idx_attendance',
                fields: ['attendance_id']
            },
            {
                name: 'idx_changed_by',
                fields: ['changed_by']
            },
            {
                name: 'idx_changed_at',
                fields: ['changed_at']
            },
        ]
    });
    return AttendanceChangeLog;
}
exports.initAttendanceChangeLogModel = initAttendanceChangeLogModel;
/**
 * 定义考勤修改日志模型关联
 * 注意：必须在所有模型初始化完成后调用
 */
function associateAttendanceChangeLog() {
    // 动态导入模型实例，避免循环依赖
    var models = require('./index');
    // 考勤记录关联
    AttendanceChangeLog.belongsTo(models.Attendance, {
        foreignKey: 'attendanceId',
        as: 'attendance'
    });
    // 修改人关联
    AttendanceChangeLog.belongsTo(models.User, {
        foreignKey: 'changedBy',
        as: 'changer'
    });
    // 审核人关联
    AttendanceChangeLog.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver'
    });
}
exports.associateAttendanceChangeLog = associateAttendanceChangeLog;
