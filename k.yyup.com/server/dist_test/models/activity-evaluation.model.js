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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.initActivityEvaluationAssociations = exports.initActivityEvaluation = exports.ActivityEvaluation = exports.EvaluationStatus = exports.EvaluatorType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var activity_model_1 = require("./activity.model");
var activity_registration_model_1 = require("./activity-registration.model");
var teacher_model_1 = require("./teacher.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var EvaluatorType;
(function (EvaluatorType) {
    EvaluatorType[EvaluatorType["PARENT"] = 1] = "PARENT";
    EvaluatorType[EvaluatorType["TEACHER"] = 2] = "TEACHER";
    EvaluatorType[EvaluatorType["ADMIN"] = 3] = "ADMIN";
})(EvaluatorType = exports.EvaluatorType || (exports.EvaluatorType = {}));
var EvaluationStatus;
(function (EvaluationStatus) {
    EvaluationStatus[EvaluationStatus["PENDING"] = 0] = "PENDING";
    EvaluationStatus[EvaluationStatus["APPROVED"] = 1] = "APPROVED";
    EvaluationStatus[EvaluationStatus["REJECTED"] = 2] = "REJECTED";
})(EvaluationStatus = exports.EvaluationStatus || (exports.EvaluationStatus = {}));
var ActivityEvaluation = /** @class */ (function (_super) {
    __extends(ActivityEvaluation, _super);
    function ActivityEvaluation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivityEvaluation.prototype.reply = function (content, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.replyContent = content;
                        this.replyTime = new Date();
                        this.replyUserId = userId;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ActivityEvaluation.prototype.getImagesArray = function () {
        if (!this.images) {
            return [];
        }
        return this.images.split(',');
    };
    return ActivityEvaluation;
}(sequelize_1.Model));
exports.ActivityEvaluation = ActivityEvaluation;
var initActivityEvaluation = function (sequelize) {
    ActivityEvaluation.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '评价记录ID'
        },
        activityId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动ID'
        },
        registrationId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '报名记录ID'
        },
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '家长ID'
        },
        teacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '教师ID'
        },
        evaluatorType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '评价人类型 - 1:家长 2:教师 3:管理员'
        },
        evaluatorName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '评价人姓名'
        },
        evaluationTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '评价时间'
        },
        overallRating: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '综合评分(1-5)'
        },
        contentRating: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '内容评分(1-5)'
        },
        organizationRating: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '组织评分(1-5)'
        },
        environmentRating: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '环境评分(1-5)'
        },
        serviceRating: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '服务评分(1-5)'
        },
        comment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '评价内容'
        },
        strengths: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '优点'
        },
        weaknesses: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '缺点'
        },
        suggestions: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '建议'
        },
        images: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '评价图片URL, 逗号分隔'
        },
        isPublic: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否公开'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: EvaluationStatus.PENDING,
            comment: '状态 - 0:待审核 1:审核通过 2:审核不通过'
        },
        replyContent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '回复内容'
        },
        replyTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '回复时间'
        },
        replyUserId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '回复人ID'
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
        tableName: 'activity_evaluations',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ActivityEvaluation;
};
exports.initActivityEvaluation = initActivityEvaluation;
var initActivityEvaluationAssociations = function () {
    ActivityEvaluation.belongsTo(activity_model_1.Activity, {
        foreignKey: 'activityId',
        as: 'activity'
    });
    ActivityEvaluation.belongsTo(activity_registration_model_1.ActivityRegistration, {
        foreignKey: 'registrationId',
        as: 'registration'
    });
    ActivityEvaluation.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'parentId',
        as: 'parent'
    });
    ActivityEvaluation.belongsTo(teacher_model_1.Teacher, {
        foreignKey: 'teacherId',
        as: 'teacher'
    });
    ActivityEvaluation.belongsTo(user_model_1.User, {
        foreignKey: 'replyUserId',
        as: 'replyUser'
    });
    ActivityEvaluation.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ActivityEvaluation.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initActivityEvaluationAssociations = initActivityEvaluationAssociations;
