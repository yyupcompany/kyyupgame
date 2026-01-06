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
exports.initTeacherAttendanceModel = exports.TeacherAttendance = exports.LeaveType = exports.TeacherAttendanceStatus = void 0;
var sequelize_1 = require("sequelize");
/**
 * 教师考勤状态枚举
 */
var TeacherAttendanceStatus;
(function (TeacherAttendanceStatus) {
    TeacherAttendanceStatus["PRESENT"] = "present";
    TeacherAttendanceStatus["ABSENT"] = "absent";
    TeacherAttendanceStatus["LATE"] = "late";
    TeacherAttendanceStatus["EARLY_LEAVE"] = "early_leave";
    TeacherAttendanceStatus["LEAVE"] = "leave";
})(TeacherAttendanceStatus = exports.TeacherAttendanceStatus || (exports.TeacherAttendanceStatus = {}));
/**
 * 请假类型枚举
 */
var LeaveType;
(function (LeaveType) {
    LeaveType["SICK"] = "sick";
    LeaveType["PERSONAL"] = "personal";
    LeaveType["ANNUAL"] = "annual";
    LeaveType["MATERNITY"] = "maternity";
    LeaveType["OTHER"] = "other";
})(LeaveType = exports.LeaveType || (exports.LeaveType = {}));
/**
 * 教师考勤记录模型
 */
var TeacherAttendance = /** @class */ (function (_super) {
    __extends(TeacherAttendance, _super);
    function TeacherAttendance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TeacherAttendance;
}(sequelize_1.Model));
exports.TeacherAttendance = TeacherAttendance;
/**
 * 初始化教师考勤记录模型
 */
function initTeacherAttendanceModel(sequelize) {
    TeacherAttendance.init({
        // 主键
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '教师考勤记录ID'
        },
        // 关联字段
        teacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'teacher_id',
            comment: '教师ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            comment: '用户ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'kindergarten_id',
            comment: '幼儿园ID'
        },
        // 考勤信息
        attendanceDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            field: 'attendance_date',
            comment: '考勤日期'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('present', 'absent', 'late', 'early_leave', 'leave'),
            allowNull: false,
            defaultValue: 'present',
            comment: '考勤状态'
        },
        // 时间记录
        checkInTime: {
            type: sequelize_1.DataTypes.TIME,
            allowNull: true,
            field: 'check_in_time',
            comment: '签到时间'
        },
        checkOutTime: {
            type: sequelize_1.DataTypes.TIME,
            allowNull: true,
            field: 'check_out_time',
            comment: '签退时间'
        },
        workDuration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'work_duration',
            comment: '工作时长（分钟）'
        },
        // 请假信息
        leaveType: {
            type: sequelize_1.DataTypes.ENUM('sick', 'personal', 'annual', 'maternity', 'other'),
            allowNull: true,
            field: 'leave_type',
            comment: '请假类型'
        },
        leaveReason: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'leave_reason',
            comment: '请假原因'
        },
        leaveStartTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'leave_start_time',
            comment: '请假开始时间'
        },
        leaveEndTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'leave_end_time',
            comment: '请假结束时间'
        },
        // 备注信息
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注说明'
        },
        // 操作信息
        recordedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'recorded_by',
            comment: '记录人ID（自己打卡时为空）'
        },
        recordedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'recorded_at',
            comment: '记录时间'
        },
        updatedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'updated_by',
            comment: '最后修改人ID'
        },
        // 审核信息
        isApproved: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_approved',
            comment: '是否已审核（打卡默认通过，请假需要审核）'
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
        approvalNotes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'approval_notes',
            comment: '审核备注'
        },
        // 软删除
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
            comment: '删除时间'
        },
        // 时间戳
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at',
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at',
            comment: '更新时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'teacher_attendances',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        comment: '教师考勤记录表',
        indexes: [
            {
                name: 'idx_teacher_date',
                fields: ['teacher_id', 'attendance_date']
            },
            {
                name: 'idx_user_date',
                fields: ['user_id', 'attendance_date']
            },
            {
                name: 'idx_kindergarten_date',
                fields: ['kindergarten_id', 'attendance_date']
            },
            {
                name: 'idx_status',
                fields: ['status']
            },
            {
                name: 'idx_date',
                fields: ['attendance_date']
            },
            {
                name: 'uk_teacher_date',
                unique: true,
                fields: ['teacher_id', 'attendance_date']
            },
        ]
    });
    return TeacherAttendance;
}
exports.initTeacherAttendanceModel = initTeacherAttendanceModel;
