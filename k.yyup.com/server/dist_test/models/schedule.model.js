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
exports.Schedule = exports.RepeatType = exports.ScheduleStatus = exports.ScheduleType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var ScheduleType;
(function (ScheduleType) {
    ScheduleType["TASK"] = "task";
    ScheduleType["MEETING"] = "meeting";
    ScheduleType["REMINDER"] = "reminder";
    ScheduleType["EVENT"] = "event";
})(ScheduleType = exports.ScheduleType || (exports.ScheduleType = {}));
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["PENDING"] = "pending";
    ScheduleStatus["IN_PROGRESS"] = "in_progress";
    ScheduleStatus["COMPLETED"] = "completed";
    ScheduleStatus["CANCELLED"] = "cancelled";
})(ScheduleStatus = exports.ScheduleStatus || (exports.ScheduleStatus = {}));
var RepeatType;
(function (RepeatType) {
    RepeatType["NONE"] = "none";
    RepeatType["DAILY"] = "daily";
    RepeatType["WEEKLY"] = "weekly";
    RepeatType["MONTHLY"] = "monthly";
    RepeatType["YEARLY"] = "yearly";
})(RepeatType = exports.RepeatType || (exports.RepeatType = {}));
var Schedule = /** @class */ (function (_super) {
    __extends(Schedule, _super);
    function Schedule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Instance methods
    Schedule.prototype.markAsCompleted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = ScheduleStatus.COMPLETED;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Schedule.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = ScheduleStatus.CANCELLED;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Static methods
    Schedule.initModel = function (sequelize) {
        Schedule.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                comment: '日程标题'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '日程描述'
            },
            type: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScheduleType)),
                allowNull: false,
                defaultValue: ScheduleType.TASK,
                comment: '日程类型'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScheduleStatus)),
                allowNull: false,
                defaultValue: ScheduleStatus.PENDING,
                comment: '日程状态'
            },
            startTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'start_time',
                comment: '开始时间'
            },
            endTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'end_time',
                comment: '结束时间'
            },
            allDay: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_all_day',
                comment: '是否全天'
            },
            location: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '地点'
            },
            repeatType: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(RepeatType)),
                allowNull: false,
                defaultValue: RepeatType.NONE,
                field: 'repeat_type',
                comment: '重复类型'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                comment: '用户ID'
            },
            relatedId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'related_id',
                comment: '关联ID'
            },
            relatedType: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'related_type',
                comment: '关联类型'
            },
            priority: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3,
                comment: '优先级 - 1:最高 2:高 3:中 4:低 5:最低'
            },
            kindergartenId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'kindergarten_id',
                comment: '幼儿园ID'
            },
            metadata: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                comment: '元数据（JSON格式）'
            }
        }, {
            sequelize: sequelize,
            tableName: 'schedules',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Schedule.initAssociations = function () {
        Schedule.belongsTo(user_model_1.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };
    return Schedule;
}(sequelize_1.Model));
exports.Schedule = Schedule;
exports["default"] = Schedule;
