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
exports.initActivityArrangementAssociations = exports.initActivityArrangement = exports.ActivityArrangement = exports.ArrangementStatus = exports.ArrangementActivityType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var activity_plan_model_1 = require("./activity-plan.model");
var activity_evaluation_model_1 = require("./activity-evaluation.model");
var ArrangementActivityType;
(function (ArrangementActivityType) {
    ArrangementActivityType[ArrangementActivityType["INDOOR"] = 1] = "INDOOR";
    ArrangementActivityType[ArrangementActivityType["OUTDOOR"] = 2] = "OUTDOOR";
    ArrangementActivityType[ArrangementActivityType["HOME_SCHOOL"] = 3] = "HOME_SCHOOL";
    ArrangementActivityType[ArrangementActivityType["VISIT"] = 4] = "VISIT";
    ArrangementActivityType[ArrangementActivityType["OTHER"] = 5] = "OTHER";
})(ArrangementActivityType = exports.ArrangementActivityType || (exports.ArrangementActivityType = {}));
var ArrangementStatus;
(function (ArrangementStatus) {
    ArrangementStatus[ArrangementStatus["NOT_STARTED"] = 0] = "NOT_STARTED";
    ArrangementStatus[ArrangementStatus["PREPARING"] = 1] = "PREPARING";
    ArrangementStatus[ArrangementStatus["IN_PROGRESS"] = 2] = "IN_PROGRESS";
    ArrangementStatus[ArrangementStatus["COMPLETED"] = 3] = "COMPLETED";
    ArrangementStatus[ArrangementStatus["CANCELLED"] = 4] = "CANCELLED";
})(ArrangementStatus = exports.ArrangementStatus || (exports.ArrangementStatus = {}));
var ActivityArrangement = /** @class */ (function (_super) {
    __extends(ActivityArrangement, _super);
    function ActivityArrangement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivityArrangement.prototype.isStarted = function () {
        return new Date() >= this.startTime;
    };
    ActivityArrangement.prototype.isEnded = function () {
        return new Date() > this.endTime;
    };
    ActivityArrangement.prototype.getDurationMinutes = function () {
        return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    };
    ActivityArrangement.prototype.isEditable = function () {
        return this.status === ArrangementStatus.NOT_STARTED || this.status === ArrangementStatus.PREPARING;
    };
    return ActivityArrangement;
}(sequelize_1.Model));
exports.ActivityArrangement = ActivityArrangement;
var initActivityArrangement = function (sequelize) {
    ActivityArrangement.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '活动安排ID'
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动计划ID - 外键关联活动计划表'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '活动标题'
        },
        activityType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '活动类型 - 1:室内活动 2:户外活动 3:家园共育 4:参观考察 5:其他'
        },
        location: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '活动地点'
        },
        startTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '开始时间'
        },
        endTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '结束时间'
        },
        participantCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '参与人数'
        },
        targetAge: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '目标年龄段'
        },
        objectives: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动目标'
        },
        contentOutline: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '内容大纲'
        },
        materials: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '所需材料'
        },
        emergencyPlan: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '应急预案'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ArrangementStatus.NOT_STARTED,
            comment: '状态 - 0:未开始 1:筹备中 2:进行中 3:已完成 4:已取消'
        },
        evaluationId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '评价ID - 关联活动评价表'
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
        tableName: 'activity_arrangements',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ActivityArrangement;
};
exports.initActivityArrangement = initActivityArrangement;
var initActivityArrangementAssociations = function () {
    ActivityArrangement.belongsTo(activity_plan_model_1.ActivityPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    ActivityArrangement.belongsTo(activity_evaluation_model_1.ActivityEvaluation, {
        foreignKey: 'evaluationId',
        as: 'evaluation'
    });
    ActivityArrangement.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ActivityArrangement.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initActivityArrangementAssociations = initActivityArrangementAssociations;
