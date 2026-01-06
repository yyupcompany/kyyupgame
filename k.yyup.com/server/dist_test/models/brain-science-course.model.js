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
exports.initBrainScienceCourseModel = exports.BrainScienceCourse = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
// 脑科学课程模型类
var BrainScienceCourse = /** @class */ (function (_super) {
    __extends(BrainScienceCourse, _super);
    function BrainScienceCourse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    BrainScienceCourse.associate = function () {
        // 与用户表的关联（创建者）
        BrainScienceCourse.belongsTo(user_model_1.User, {
            foreignKey: 'created_by',
            as: 'creator',
            constraints: false
        });
        // 与课程计划表的关联（一对多）
        // 注意：这里需要延迟导入以避免循环依赖
        try {
            var CoursePlan = require('./course-plan.model').CoursePlan;
            BrainScienceCourse.hasMany(CoursePlan, {
                foreignKey: 'course_id',
                as: 'coursePlans'
            });
        }
        catch (error) {
            console.warn('⚠️ BrainScienceCourse 与 CoursePlan 关联设置失败（可能是循环依赖）:', error);
        }
    };
    // 实例方法：获取适用年龄范围描述
    BrainScienceCourse.prototype.getAgeRangeDescription = function () {
        if (!this.target_age_min && !this.target_age_max) {
            return '不限年龄';
        }
        if (this.target_age_min && this.target_age_max) {
            return "".concat(this.target_age_min, "-").concat(this.target_age_max, "\u4E2A\u6708");
        }
        if (this.target_age_min) {
            return "".concat(this.target_age_min, "\u4E2A\u6708\u4EE5\u4E0A");
        }
        if (this.target_age_max) {
            return "".concat(this.target_age_max, "\u4E2A\u6708\u4EE5\u4E0B");
        }
        return '不限年龄';
    };
    // 实例方法：获取课程类型描述
    BrainScienceCourse.prototype.getCourseTypeDescription = function () {
        var typeMap = {
            'core': '核心课程',
            'extended': '扩展课程',
            'special': '特色课程'
        };
        return typeMap[this.course_type] || '未知类型';
    };
    // 实例方法：获取难度等级描述
    BrainScienceCourse.prototype.getDifficultyDescription = function () {
        var difficultyMap = {
            1: '入门',
            2: '初级',
            3: '中级',
            4: '高级',
            5: '专家'
        };
        return difficultyMap[this.difficulty_level] || '未知难度';
    };
    // 实例方法：检查是否适合指定年龄
    BrainScienceCourse.prototype.isAgeAppropriate = function (ageInMonths) {
        if (!this.target_age_min && !this.target_age_max) {
            return true; // 不限年龄
        }
        if (this.target_age_min && ageInMonths < this.target_age_min) {
            return false;
        }
        if (this.target_age_max && ageInMonths > this.target_age_max) {
            return false;
        }
        return true;
    };
    return BrainScienceCourse;
}(sequelize_1.Model));
exports.BrainScienceCourse = BrainScienceCourse;
// 初始化模型函数
var initBrainScienceCourseModel = function (sequelizeInstance) {
    BrainScienceCourse.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '课程ID'
        },
        course_name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '课程名称'
        },
        course_description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '课程描述'
        },
        course_type: {
            type: sequelize_1.DataTypes.ENUM('core', 'extended', 'special'),
            defaultValue: 'core',
            comment: '课程类型：核心课程、扩展课程、特色课程'
        },
        target_age_min: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '适用最小年龄（月）'
        },
        target_age_max: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '适用最大年龄（月）'
        },
        duration_minutes: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '课程时长（分钟）'
        },
        frequency_per_week: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 1,
            comment: '每周频次'
        },
        objectives: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '课程目标（JSON格式）'
        },
        materials: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '所需材料（JSON格式）'
        },
        difficulty_level: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 1,
            comment: '难度等级（1-5）'
        },
        prerequisites: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '前置课程要求（JSON格式）'
        },
        is_active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true,
            comment: '是否启用'
        },
        created_by: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
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
        modelName: 'BrainScienceCourse',
        tableName: 'brain_science_courses',
        timestamps: true,
        underscored: true,
        comment: '脑科学课程表'
    });
};
exports.initBrainScienceCourseModel = initBrainScienceCourseModel;
exports["default"] = BrainScienceCourse;
