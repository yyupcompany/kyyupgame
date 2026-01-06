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
exports.initActivityRegistrationAssociations = exports.initActivityRegistration = exports.ActivityRegistration = exports.RegistrationStatus = exports.ChildGender = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var activity_model_1 = require("./activity.model");
var student_model_1 = require("./student.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var ChildGender;
(function (ChildGender) {
    ChildGender[ChildGender["MALE"] = 1] = "MALE";
    ChildGender[ChildGender["FEMALE"] = 2] = "FEMALE";
})(ChildGender = exports.ChildGender || (exports.ChildGender = {}));
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus[RegistrationStatus["PENDING"] = 0] = "PENDING";
    RegistrationStatus[RegistrationStatus["CONFIRMED"] = 1] = "CONFIRMED";
    RegistrationStatus[RegistrationStatus["REJECTED"] = 2] = "REJECTED";
    RegistrationStatus[RegistrationStatus["CANCELLED"] = 3] = "CANCELLED";
    RegistrationStatus[RegistrationStatus["CHECKED_IN"] = 4] = "CHECKED_IN";
    RegistrationStatus[RegistrationStatus["NO_SHOW"] = 5] = "NO_SHOW";
})(RegistrationStatus = exports.RegistrationStatus || (exports.RegistrationStatus = {}));
var ActivityRegistration = /** @class */ (function (_super) {
    __extends(ActivityRegistration, _super);
    function ActivityRegistration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivityRegistration.prototype.checkIn = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.status !== RegistrationStatus.CONFIRMED) {
                            throw new Error('只有已确认的报名才能签到');
                        }
                        this.checkInTime = new Date();
                        this.checkInLocation = location;
                        this.status = RegistrationStatus.CHECKED_IN;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ActivityRegistration;
}(sequelize_1.Model));
exports.ActivityRegistration = ActivityRegistration;
var initActivityRegistration = function (sequelize) {
    ActivityRegistration.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '报名记录ID'
        },
        activityId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '活动ID'
        },
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '家长ID'
        },
        studentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '学生ID'
        },
        contactName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '联系人姓名'
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '联系电话'
        },
        childName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '孩子姓名'
        },
        childAge: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '孩子年龄(月)'
        },
        childGender: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '孩子性别 - 1:男 2:女'
        },
        registrationTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '报名时间'
        },
        attendeeCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '参与人数'
        },
        specialNeeds: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '特殊需求'
        },
        source: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '报名来源'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: RegistrationStatus.PENDING,
            comment: '状态 - 0:待审核 1:已确认 2:已拒绝 3:已取消 4:已签到 5:未出席'
        },
        checkInTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '签到时间'
        },
        checkInLocation: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '签到地点'
        },
        feedback: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '活动反馈'
        },
        isConversion: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否转化为报名'
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
        // 新增：客户来源追踪字段
        shareBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '分享者ID（老师或园长）'
        },
        shareType: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '分享类型: teacher/principal/wechat/qrcode'
        },
        sourceType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE/TEACHER_REFERRAL等'
        },
        sourceDetail: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '来源详情（JSON格式）'
        },
        autoAssigned: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否自动分配给老师'
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
        tableName: 'activity_registrations',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ActivityRegistration;
};
exports.initActivityRegistration = initActivityRegistration;
var initActivityRegistrationAssociations = function () {
    ActivityRegistration.belongsTo(activity_model_1.Activity, {
        foreignKey: 'activityId',
        as: 'activity'
    });
    ActivityRegistration.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'parentId',
        as: 'parent'
    });
    ActivityRegistration.belongsTo(student_model_1.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });
    ActivityRegistration.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ActivityRegistration.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initActivityRegistrationAssociations = initActivityRegistrationAssociations;
