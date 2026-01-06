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
exports.ActivityParticipant = exports.ParticipantAccessLevel = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var activity_model_1 = require("./activity.model");
/**
 * 活动参与者访问级别
 */
var ParticipantAccessLevel;
(function (ParticipantAccessLevel) {
    ParticipantAccessLevel[ParticipantAccessLevel["READ_ONLY"] = 1] = "READ_ONLY";
    ParticipantAccessLevel[ParticipantAccessLevel["MANAGE"] = 2] = "MANAGE";
    ParticipantAccessLevel[ParticipantAccessLevel["FULL_ACCESS"] = 3] = "FULL_ACCESS"; // 完全访问：可查看所有数据和分析
})(ParticipantAccessLevel = exports.ParticipantAccessLevel || (exports.ParticipantAccessLevel = {}));
/**
 * 活动参与者表 - 用于教师权限分层
 * 实现教师对活动的不同访问级别控制
 */
var ActivityParticipant = /** @class */ (function (_super) {
    __extends(ActivityParticipant, _super);
    function ActivityParticipant() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivityParticipant.initModel = function (sequelize) {
        ActivityParticipant.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            activityId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'activity_id',
                comment: '活动ID',
                references: {
                    model: 'activities',
                    key: 'id'
                }
            },
            teacherId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'teacher_id',
                comment: '教师ID（用户表中role为teacher的用户）',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            accessLevel: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: ParticipantAccessLevel.READ_ONLY,
                field: 'access_level',
                comment: '访问级别：1-只读，2-管理，3-完全访问'
            },
            assignedBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'assigned_by',
                comment: '分配人ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            assignedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'assigned_at',
                comment: '分配时间'
            },
            canViewRegistrations: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'can_view_registrations',
                comment: '是否可查看报名信息'
            },
            canManageRegistrations: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'can_manage_registrations',
                comment: '是否可管理报名信息'
            },
            canViewAnalytics: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'can_view_analytics',
                comment: '是否可查看数据分析'
            },
            canExportData: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'can_export_data',
                comment: '是否可导出数据'
            },
            remark: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '备注说明'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
                comment: '是否启用'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at'
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'deleted_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'activity_participants',
            timestamps: true,
            paranoid: true,
            underscored: true,
            indexes: [
                {
                    fields: ['activity_id', 'teacher_id'],
                    unique: true,
                    name: 'uk_activity_teacher'
                },
                {
                    fields: ['teacher_id'],
                    name: 'idx_teacher_id'
                },
                {
                    fields: ['activity_id'],
                    name: 'idx_activity_id'
                },
                {
                    fields: ['access_level'],
                    name: 'idx_access_level'
                },
            ]
        });
    };
    ActivityParticipant.initAssociations = function () {
        // 与Activity的关联
        ActivityParticipant.belongsTo(activity_model_1.Activity, {
            foreignKey: 'activityId',
            as: 'activity'
        });
        // 与User（教师）的关联
        ActivityParticipant.belongsTo(user_model_1.User, {
            foreignKey: 'teacherId',
            as: 'teacher'
        });
        // 与User（分配人）的关联
        ActivityParticipant.belongsTo(user_model_1.User, {
            foreignKey: 'assignedBy',
            as: 'assigner'
        });
    };
    /**
     * 检查教师是否有特定活动的访问权限
     */
    ActivityParticipant.checkTeacherAccess = function (teacherId, activityId, requiredLevel) {
        if (requiredLevel === void 0) { requiredLevel = ParticipantAccessLevel.READ_ONLY; }
        return __awaiter(this, void 0, void 0, function () {
            var participant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ActivityParticipant.findOne({
                            where: {
                                teacherId: teacherId,
                                activityId: activityId,
                                isActive: true
                            }
                        })];
                    case 1:
                        participant = _a.sent();
                        if (!participant)
                            return [2 /*return*/, false];
                        return [2 /*return*/, participant.accessLevel >= requiredLevel];
                }
            });
        });
    };
    /**
     * 获取教师可访问的活动列表
     */
    ActivityParticipant.getTeacherAccessibleActivities = function (teacherId, accessLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var whereCondition, participants;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereCondition = {
                            teacherId: teacherId,
                            isActive: true
                        };
                        if (accessLevel) {
                            whereCondition.accessLevel = accessLevel;
                        }
                        return [4 /*yield*/, ActivityParticipant.findAll({
                                where: whereCondition,
                                include: [
                                    {
                                        model: activity_model_1.Activity,
                                        as: 'activity'
                                    },
                                ]
                            })];
                    case 1:
                        participants = _a.sent();
                        return [2 /*return*/, participants.map(function (p) { return p.activity; }).filter(Boolean)];
                }
            });
        });
    };
    /**
     * 分配教师到活动
     */
    ActivityParticipant.assignTeacherToActivity = function (activityId, teacherId, accessLevel, assignedBy, permissions, remark) {
        var _a, _b, _c, _d;
        if (permissions === void 0) { permissions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, ActivityParticipant.create({
                            activityId: activityId,
                            teacherId: teacherId,
                            accessLevel: accessLevel,
                            assignedBy: assignedBy,
                            canViewRegistrations: (_a = permissions.canViewRegistrations) !== null && _a !== void 0 ? _a : true,
                            canManageRegistrations: (_b = permissions.canManageRegistrations) !== null && _b !== void 0 ? _b : (accessLevel >= ParticipantAccessLevel.MANAGE),
                            canViewAnalytics: (_c = permissions.canViewAnalytics) !== null && _c !== void 0 ? _c : (accessLevel >= ParticipantAccessLevel.FULL_ACCESS),
                            canExportData: (_d = permissions.canExportData) !== null && _d !== void 0 ? _d : (accessLevel >= ParticipantAccessLevel.FULL_ACCESS),
                            remark: remark
                        })];
                    case 1: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    return ActivityParticipant;
}(sequelize_1.Model));
exports.ActivityParticipant = ActivityParticipant;
exports["default"] = ActivityParticipant;
