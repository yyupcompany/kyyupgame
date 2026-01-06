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
exports.initActivityAssociations = exports.initActivity = exports.Activity = exports.ActivityStatus = exports.ActivityType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var activity_registration_model_1 = require("./activity-registration.model");
var activity_evaluation_model_1 = require("./activity-evaluation.model");
var ActivityType;
(function (ActivityType) {
    ActivityType[ActivityType["OPEN_DAY"] = 1] = "OPEN_DAY";
    ActivityType[ActivityType["PARENT_MEETING"] = 2] = "PARENT_MEETING";
    ActivityType[ActivityType["FAMILY_ACTIVITY"] = 3] = "FAMILY_ACTIVITY";
    ActivityType[ActivityType["RECRUITMENT_SEMINAR"] = 4] = "RECRUITMENT_SEMINAR";
    ActivityType[ActivityType["CAMPUS_TOUR"] = 5] = "CAMPUS_TOUR";
    ActivityType[ActivityType["OTHER"] = 6] = "OTHER";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus[ActivityStatus["PLANNED"] = 0] = "PLANNED";
    ActivityStatus[ActivityStatus["REGISTRATION_OPEN"] = 1] = "REGISTRATION_OPEN";
    ActivityStatus[ActivityStatus["FULL"] = 2] = "FULL";
    ActivityStatus[ActivityStatus["IN_PROGRESS"] = 3] = "IN_PROGRESS";
    ActivityStatus[ActivityStatus["FINISHED"] = 4] = "FINISHED";
    ActivityStatus[ActivityStatus["CANCELLED"] = 5] = "CANCELLED";
})(ActivityStatus = exports.ActivityStatus || (exports.ActivityStatus = {}));
var Activity = /** @class */ (function (_super) {
    __extends(Activity, _super);
    function Activity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Activity.prototype.isFull = function () {
        return this.registeredCount >= this.capacity;
    };
    return Activity;
}(sequelize_1.Model));
exports.Activity = Activity;
var initActivity = function (sequelize) {
    Activity.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '活动ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID'
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '招生计划ID'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '活动标题'
        },
        activityType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '活动类型 - 1:开放日 2:家长会 3:亲子活动 4:招生宣讲 5:园区参观 6:其他'
        },
        coverImage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '封面图片URL'
        },
        startTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '活动开始时间'
        },
        endTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '活动结束时间'
        },
        location: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '活动地点'
        },
        capacity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动容量/名额'
        },
        registeredCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '已报名人数'
        },
        checkedInCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '已签到人数'
        },
        fee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
            comment: '活动费用'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动描述'
        },
        agenda: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动议程'
        },
        registrationStartTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '报名开始时间'
        },
        registrationEndTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '报名结束时间'
        },
        needsApproval: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '报名是否需要审核'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ActivityStatus.PLANNED,
            comment: '状态 - 0:计划中 1:报名中 2:已满员 3:进行中 4:已结束 5:已取消'
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
        // 新增海报和营销相关字段
        posterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '关联的主海报ID'
        },
        posterUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '主海报URL'
        },
        sharePosterUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '分享海报URL'
        },
        marketingConfig: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '营销配置信息(团购、积分、分享等)'
        },
        publishStatus: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '发布状态 - 0:草稿 1:已发布 2:已暂停'
        },
        shareCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '分享次数'
        },
        viewCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '浏览次数'
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
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'activities',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Activity;
};
exports.initActivity = initActivity;
var initActivityAssociations = function () {
    Activity.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    Activity.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    Activity.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Activity.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    Activity.hasMany(activity_registration_model_1.ActivityRegistration, {
        foreignKey: 'activityId',
        as: 'registrations'
    });
    Activity.hasMany(activity_evaluation_model_1.ActivityEvaluation, {
        foreignKey: 'activityId',
        as: 'evaluations'
    });
};
exports.initActivityAssociations = initActivityAssociations;
