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
exports.initActivityPlanAssociations = exports.initActivityPlan = exports.ActivityPlan = exports.Semester = exports.ActivityPlanType = exports.ActivityPlanStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var activity_arrangement_model_1 = require("./activity-arrangement.model");
var ActivityPlanStatus;
(function (ActivityPlanStatus) {
    ActivityPlanStatus[ActivityPlanStatus["DRAFT"] = 0] = "DRAFT";
    ActivityPlanStatus[ActivityPlanStatus["PENDING"] = 1] = "PENDING";
    ActivityPlanStatus[ActivityPlanStatus["APPROVED"] = 2] = "APPROVED";
    ActivityPlanStatus[ActivityPlanStatus["IN_PROGRESS"] = 3] = "IN_PROGRESS";
    ActivityPlanStatus[ActivityPlanStatus["COMPLETED"] = 4] = "COMPLETED";
    ActivityPlanStatus[ActivityPlanStatus["CANCELLED"] = 5] = "CANCELLED"; // 已取消
})(ActivityPlanStatus = exports.ActivityPlanStatus || (exports.ActivityPlanStatus = {}));
var ActivityPlanType;
(function (ActivityPlanType) {
    ActivityPlanType[ActivityPlanType["REGULAR"] = 1] = "REGULAR";
    ActivityPlanType[ActivityPlanType["ENROLLMENT"] = 2] = "ENROLLMENT";
    ActivityPlanType[ActivityPlanType["FESTIVAL"] = 3] = "FESTIVAL";
    ActivityPlanType[ActivityPlanType["TEACHING"] = 4] = "TEACHING";
    ActivityPlanType[ActivityPlanType["OTHER"] = 5] = "OTHER"; // 其他
})(ActivityPlanType = exports.ActivityPlanType || (exports.ActivityPlanType = {}));
var Semester;
(function (Semester) {
    Semester[Semester["SPRING"] = 1] = "SPRING";
    Semester[Semester["AUTUMN"] = 2] = "AUTUMN";
    Semester[Semester["WINTER_BREAK"] = 3] = "WINTER_BREAK";
    Semester[Semester["SUMMER_BREAK"] = 4] = "SUMMER_BREAK"; // 暑假
})(Semester = exports.Semester || (exports.Semester = {}));
var ActivityPlan = /** @class */ (function (_super) {
    __extends(ActivityPlan, _super);
    function ActivityPlan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivityPlan.prototype.getStatusText = function () {
        var _a;
        var statusMap = (_a = {},
            _a[ActivityPlanStatus.DRAFT] = '草稿',
            _a[ActivityPlanStatus.PENDING] = '待审批',
            _a[ActivityPlanStatus.APPROVED] = '已审批',
            _a[ActivityPlanStatus.IN_PROGRESS] = '进行中',
            _a[ActivityPlanStatus.COMPLETED] = '已完成',
            _a[ActivityPlanStatus.CANCELLED] = '已取消',
            _a);
        return statusMap[this.status] || '未知状态';
    };
    ActivityPlan.prototype.isActive = function () {
        var now = new Date();
        return now >= this.startDate && now <= this.endDate;
    };
    ActivityPlan.prototype.getDuration = function () {
        var start = new Date(this.startDate);
        var end = new Date(this.endDate);
        var diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    return ActivityPlan;
}(sequelize_1.Model));
exports.ActivityPlan = ActivityPlan;
var initActivityPlan = function (sequelize) {
    ActivityPlan.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '活动计划标题'
        },
        year: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '年份'
        },
        semester: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '学期: 1-春季学期, 2-秋季学期, 3-寒假, 4-暑假'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '结束日期'
        },
        planType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '计划类型: 1-常规活动, 2-招生活动, 3-节日活动, 4-教学活动, 5-其他'
        },
        targetCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '活动数量目标'
        },
        participationTarget: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '参与人数目标'
        },
        budget: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '预算金额'
        },
        objectives: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '计划目标'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '计划描述'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ActivityPlanStatus.DRAFT,
            comment: '状态：0-草稿，1-待审批，2-已审批，3-进行中，4-已完成，5-已取消'
        },
        approvedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '审批人ID'
        },
        approvedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '审批时间'
        },
        remark: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'activity_plans',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ActivityPlan;
};
exports.initActivityPlan = initActivityPlan;
var initActivityPlanAssociations = function () {
    ActivityPlan.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ActivityPlan.hasMany(activity_arrangement_model_1.ActivityArrangement, {
        foreignKey: 'planId',
        as: 'arrangements'
    });
};
exports.initActivityPlanAssociations = initActivityPlanAssociations;
