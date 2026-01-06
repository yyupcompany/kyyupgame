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
exports.initCoursePlanModel = exports.CoursePlan = void 0;
var sequelize_1 = require("sequelize");
var brain_science_course_model_1 = require("./brain-science-course.model");
var class_model_1 = require("./class.model");
var user_model_1 = require("./user.model");
// 课程计划模型类
var CoursePlan = /** @class */ (function (_super) {
    __extends(CoursePlan, _super);
    function CoursePlan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    CoursePlan.associate = function () {
        // 与脑科学课程表的关联
        CoursePlan.belongsTo(brain_science_course_model_1.BrainScienceCourse, {
            foreignKey: 'course_id',
            as: 'course'
        });
        // 与班级表的关联
        CoursePlan.belongsTo(class_model_1.Class, {
            foreignKey: 'class_id',
            as: 'class'
        });
        // 与用户表的关联（创建者）
        CoursePlan.belongsTo(user_model_1.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });
    };
    // 实例方法：获取计划状态描述
    CoursePlan.prototype.getPlanStatusDescription = function () {
        var statusMap = {
            'draft': '草稿',
            'active': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[this.plan_status] || '未知状态';
    };
    // 实例方法：获取完成进度百分比
    CoursePlan.prototype.getCompletionPercentage = function () {
        if (this.total_sessions === 0)
            return 0;
        return Math.round((this.completed_sessions / this.total_sessions) * 100);
    };
    // 实例方法：获取剩余课时数
    CoursePlan.prototype.getRemainingSessions = function () {
        return Math.max(0, this.total_sessions - this.completed_sessions);
    };
    // 实例方法：检查是否已完成
    CoursePlan.prototype.isCompleted = function () {
        return this.completed_sessions >= this.total_sessions || this.plan_status === 'completed';
    };
    // 实例方法：检查是否达到目标达标率
    CoursePlan.prototype.isTargetAchieved = function () {
        return this.actual_achievement_rate >= this.target_achievement_rate;
    };
    // 实例方法：获取达标率差距
    CoursePlan.prototype.getAchievementGap = function () {
        return this.target_achievement_rate - this.actual_achievement_rate;
    };
    // 实例方法：获取学期描述
    CoursePlan.prototype.getSemesterDescription = function () {
        return "".concat(this.academic_year, "\u5B66\u5E74 ").concat(this.semester);
    };
    // 实例方法：检查计划是否过期
    CoursePlan.prototype.isExpired = function () {
        if (!this.planned_end_date)
            return false;
        return new Date() > this.planned_end_date && this.plan_status !== 'completed';
    };
    // 实例方法：获取计划持续时间（天数）
    CoursePlan.prototype.getPlanDuration = function () {
        if (!this.planned_start_date || !this.planned_end_date)
            return null;
        var diffTime = this.planned_end_date.getTime() - this.planned_start_date.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    return CoursePlan;
}(sequelize_1.Model));
exports.CoursePlan = CoursePlan;
// 初始化模型函数
var initCoursePlanModel = function (sequelizeInstance) {
    CoursePlan.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '课程计划ID'
        },
        course_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '课程ID'
        },
        class_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '班级ID'
        },
        semester: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '学期（如：2024春季）'
        },
        academic_year: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            comment: '学年（如：2024-2025）'
        },
        planned_start_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '计划开始日期'
        },
        planned_end_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '计划结束日期'
        },
        total_sessions: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 16,
            comment: '总课时数'
        },
        completed_sessions: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '已完成课时'
        },
        plan_status: {
            type: sequelize_1.DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
            defaultValue: 'draft',
            comment: '计划状态'
        },
        target_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 80.00,
            comment: '目标达标率（%）'
        },
        actual_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '实际达标率（%）'
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        created_by: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建者ID'
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
        modelName: 'CoursePlan',
        tableName: 'course_plans',
        timestamps: true,
        underscored: true,
        comment: '课程计划表'
    });
};
exports.initCoursePlanModel = initCoursePlanModel;
exports["default"] = CoursePlan;
