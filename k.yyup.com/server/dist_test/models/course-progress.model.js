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
exports.initCourseProgressModel = exports.CourseProgress = void 0;
var sequelize_1 = require("sequelize");
var course_plan_model_1 = require("./course-plan.model");
var class_model_1 = require("./class.model");
var teacher_model_1 = require("./teacher.model");
// 课程进度记录模型类
var CourseProgress = /** @class */ (function (_super) {
    __extends(CourseProgress, _super);
    function CourseProgress() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    CourseProgress.associate = function () {
        // 与课程计划表的关联
        CourseProgress.belongsTo(course_plan_model_1.CoursePlan, {
            foreignKey: 'course_plan_id',
            as: 'coursePlan'
        });
        // 与班级表的关联
        CourseProgress.belongsTo(class_model_1.Class, {
            foreignKey: 'class_id',
            as: 'class'
        });
        // 与教师表的关联
        CourseProgress.belongsTo(teacher_model_1.Teacher, {
            foreignKey: 'teacher_id',
            as: 'teacher',
            constraints: false
        });
    };
    // 实例方法：获取完成状态描述
    CourseProgress.prototype.getCompletionStatusDescription = function () {
        var statusMap = {
            'not_started': '未开始',
            'in_progress': '进行中',
            'completed': '已完成'
        };
        return statusMap[this.completion_status] || '未知状态';
    };
    // 实例方法：计算达标率
    CourseProgress.prototype.calculateAchievementRate = function () {
        if (this.attendance_count === 0)
            return 0;
        return Math.round((this.target_achieved_count / this.attendance_count) * 100);
    };
    // 实例方法：检查是否有媒体记录
    CourseProgress.prototype.hasAnyMedia = function () {
        return this.has_class_media || this.has_student_media;
    };
    // 实例方法：获取总媒体数量
    CourseProgress.prototype.getTotalMediaCount = function () {
        return this.class_media_count + this.student_media_count;
    };
    // 实例方法：检查是否需要上传媒体
    CourseProgress.prototype.needsMediaUpload = function () {
        return this.media_upload_required && !this.hasAnyMedia();
    };
    // 实例方法：获取媒体状态描述
    CourseProgress.prototype.getMediaStatusDescription = function () {
        if (!this.media_upload_required) {
            return '无需上传媒体';
        }
        if (this.hasAnyMedia()) {
            return "\u5DF2\u4E0A\u4F20 ".concat(this.getTotalMediaCount(), " \u4E2A\u5A92\u4F53\u6587\u4EF6");
        }
        return '待上传媒体';
    };
    // 实例方法：检查是否可以确认完成
    CourseProgress.prototype.canConfirmCompletion = function () {
        if (this.completion_status !== 'completed')
            return false;
        if (this.media_upload_required && !this.hasAnyMedia())
            return false;
        return true;
    };
    // 实例方法：获取课时标题
    CourseProgress.prototype.getSessionTitle = function () {
        return "\u7B2C".concat(this.session_number, "\u8BFE\u65F6");
    };
    // 实例方法：检查是否已过期（超过7天未上课）
    CourseProgress.prototype.isOverdue = function () {
        if (this.completion_status === 'completed')
            return false;
        if (!this.session_date)
            return false;
        var now = new Date();
        var sessionDate = new Date(this.session_date);
        var diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    };
    // 实例方法：获取出勤率
    CourseProgress.prototype.getAttendanceRate = function (totalStudents) {
        if (totalStudents === 0)
            return 0;
        return Math.round((this.attendance_count / totalStudents) * 100);
    };
    // 实例方法：确认完成课程
    CourseProgress.prototype.confirmCompletion = function (teacherId) {
        this.teacher_confirmed = true;
        this.teacher_id = teacherId;
        this.confirmed_at = new Date();
        this.completion_status = 'completed';
    };
    return CourseProgress;
}(sequelize_1.Model));
exports.CourseProgress = CourseProgress;
// 初始化模型函数
var initCourseProgressModel = function (sequelizeInstance) {
    CourseProgress.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '课程进度ID'
        },
        course_plan_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '课程计划ID'
        },
        class_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '班级ID'
        },
        session_number: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '第几课时'
        },
        session_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '上课日期'
        },
        completion_status: {
            type: sequelize_1.DataTypes.ENUM('not_started', 'in_progress', 'completed'),
            defaultValue: 'not_started',
            comment: '完成状态'
        },
        teacher_confirmed: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '教师确认完成'
        },
        attendance_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '出勤人数'
        },
        target_achieved_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '达标人数'
        },
        achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '达标率（%）'
        },
        has_class_media: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否有班级媒体'
        },
        class_media_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '班级媒体数量'
        },
        has_student_media: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否有学员媒体'
        },
        student_media_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '学员媒体数量'
        },
        media_upload_required: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否要求上传媒体'
        },
        session_content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '课时内容'
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        teacher_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '授课教师ID'
        },
        confirmed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '确认时间'
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '创建时间'
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '更新时间'
        }
    }, {
        sequelize: sequelizeInstance,
        modelName: 'CourseProgress',
        tableName: 'course_progress',
        timestamps: true,
        underscored: true,
        comment: '课程进度记录表'
    });
};
exports.initCourseProgressModel = initCourseProgressModel;
exports["default"] = CourseProgress;
