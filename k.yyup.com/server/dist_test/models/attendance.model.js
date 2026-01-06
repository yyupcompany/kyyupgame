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
exports.associateAttendance = exports.initAttendanceModel = exports.Attendance = exports.HealthStatus = exports.AttendanceStatus = void 0;
var sequelize_1 = require("sequelize");
/**
 * 考勤状态枚举
 */
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "present";
    AttendanceStatus["ABSENT"] = "absent";
    AttendanceStatus["LATE"] = "late";
    AttendanceStatus["EARLY_LEAVE"] = "early_leave";
    AttendanceStatus["SICK_LEAVE"] = "sick_leave";
    AttendanceStatus["PERSONAL_LEAVE"] = "personal_leave";
    AttendanceStatus["EXCUSED"] = "excused";
})(AttendanceStatus = exports.AttendanceStatus || (exports.AttendanceStatus = {}));
/**
 * 健康状态枚举
 */
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["NORMAL"] = "normal";
    HealthStatus["ABNORMAL"] = "abnormal";
    HealthStatus["QUARANTINE"] = "quarantine";
})(HealthStatus = exports.HealthStatus || (exports.HealthStatus = {}));
/**
 * 学生考勤记录模型
 */
var Attendance = /** @class */ (function (_super) {
    __extends(Attendance, _super);
    function Attendance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Attendance;
}(sequelize_1.Model));
exports.Attendance = Attendance;
/**
 * 初始化考勤记录模型
 */
function initAttendanceModel(sequelize) {
    Attendance.init({
        // 主键
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '考勤记录ID'
        },
        // 关联字段
        studentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'student_id',
            comment: '学生ID'
        },
        classId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'class_id',
            comment: '班级ID'
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
            type: sequelize_1.DataTypes.ENUM('present', 'absent', 'late', 'early_leave', 'sick_leave', 'personal_leave', 'excused'),
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
        // 健康信息
        temperature: {
            type: sequelize_1.DataTypes.DECIMAL(3, 1),
            allowNull: true,
            comment: '体温（℃）'
        },
        healthStatus: {
            type: sequelize_1.DataTypes.ENUM('normal', 'abnormal', 'quarantine'),
            allowNull: false,
            defaultValue: 'normal',
            field: 'health_status',
            comment: '健康状态'
        },
        // 备注信息
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注说明'
        },
        leaveReason: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'leave_reason',
            comment: '请假原因'
        },
        // 操作信息
        recordedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'recorded_by',
            comment: '记录人ID'
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
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at',
            comment: '最后修改时间'
        },
        // 审核信息
        isApproved: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        }
    }, {
        sequelize: sequelize,
        tableName: 'attendances',
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        comment: '学生考勤记录表',
        indexes: [
            {
                name: 'idx_student_date',
                fields: ['student_id', 'attendance_date']
            },
            {
                name: 'idx_class_date',
                fields: ['class_id', 'attendance_date']
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
                name: 'uk_student_date',
                unique: true,
                fields: ['student_id', 'attendance_date']
            },
        ]
    });
    return Attendance;
}
exports.initAttendanceModel = initAttendanceModel;
/**
 * 定义考勤记录模型关联
 * 注意：必须在所有模型初始化完成后调用
 */
function associateAttendance() {
    // 动态导入模型实例，避免循环依赖
    var models = require('./index');
    // 学生关联 (多对一)
    Attendance.belongsTo(models.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });
    // 学生反向关联 (一对多) - 一个学生有多条考勤记录
    models.Student.hasMany(Attendance, {
        foreignKey: 'studentId',
        as: 'attendances'
    });
    // 班级关联
    Attendance.belongsTo(models.Class, {
        foreignKey: 'classId',
        as: 'class'
    });
    // 幼儿园关联
    Attendance.belongsTo(models.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    // 记录人关联
    Attendance.belongsTo(models.User, {
        foreignKey: 'recordedBy',
        as: 'recorder'
    });
    // 修改人关联
    Attendance.belongsTo(models.User, {
        foreignKey: 'updatedBy',
        as: 'updater'
    });
    // 审核人关联
    Attendance.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver'
    });
}
exports.associateAttendance = associateAttendance;
