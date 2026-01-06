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
exports.initExternalDisplayRecordModel = exports.ExternalDisplayRecord = void 0;
var sequelize_1 = require("sequelize");
var class_model_1 = require("./class.model");
var teacher_model_1 = require("./teacher.model");
// 校外展示记录模型类
var ExternalDisplayRecord = /** @class */ (function (_super) {
    __extends(ExternalDisplayRecord, _super);
    function ExternalDisplayRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    ExternalDisplayRecord.associate = function () {
        // 与班级表的关联
        ExternalDisplayRecord.belongsTo(class_model_1.Class, {
            foreignKey: 'class_id',
            as: 'class'
        });
        // 与教师表的关联
        ExternalDisplayRecord.belongsTo(teacher_model_1.Teacher, {
            foreignKey: 'teacher_id',
            as: 'teacher',
            constraints: false
        });
    };
    // 实例方法：获取展示类型描述
    ExternalDisplayRecord.prototype.getDisplayTypeDescription = function () {
        var typeMap = {
            'competition': '比赛竞技',
            'performance': '表演展示',
            'exhibition': '作品展览',
            'visit': '参观学习',
            'other': '其他活动'
        };
        return typeMap[this.display_type] || '未知类型';
    };
    // 实例方法：获取成就等级描述
    ExternalDisplayRecord.prototype.getAchievementLevelDescription = function () {
        if (!this.achievement_level)
            return '未评级';
        var levelMap = {
            'excellent': '优秀',
            'good': '良好',
            'average': '一般',
            'needs_improvement': '待改进'
        };
        return levelMap[this.achievement_level] || '未知等级';
    };
    // 实例方法：获取学期描述
    ExternalDisplayRecord.prototype.getSemesterDescription = function () {
        return "".concat(this.academic_year, "\u5B66\u5E74 ").concat(this.semester);
    };
    // 实例方法：检查是否有媒体记录
    ExternalDisplayRecord.prototype.hasMediaRecords = function () {
        return this.has_media && this.media_count > 0;
    };
    // 实例方法：获取媒体统计描述
    ExternalDisplayRecord.prototype.getMediaStatsDescription = function () {
        if (!this.has_media || this.media_count === 0) {
            return '无媒体记录';
        }
        return "".concat(this.media_count, "\u4E2A\u5A92\u4F53\u6587\u4EF6");
    };
    // 实例方法：获取费用描述
    ExternalDisplayRecord.prototype.getCostDescription = function () {
        if (!this.expenses)
            return '免费';
        return "\u00A5".concat(this.expenses.toFixed(2));
    };
    // 实例方法：获取达标率描述
    ExternalDisplayRecord.prototype.getAchievementRateDescription = function () {
        return "".concat(this.achievement_rate.toFixed(2), "%");
    };
    // 实例方法：获取反馈描述
    ExternalDisplayRecord.prototype.getFeedbackDescription = function () {
        if (!this.feedback)
            return '暂无反馈';
        return this.feedback;
    };
    // 实例方法：获取参与率描述
    ExternalDisplayRecord.prototype.getParticipationDescription = function (totalStudents) {
        if (totalStudents === 0)
            return '无学生';
        var rate = Math.round((this.participation_count / totalStudents) * 100);
        return "".concat(this.participation_count, "/").concat(totalStudents, " (").concat(rate, "%)");
    };
    // 静态方法：按班级和学期统计外出情况
    ExternalDisplayRecord.getDisplayStats = function (classId, semester, academicYear) {
        return __awaiter(this, void 0, void 0, function () {
            var records, totalDisplays, displaysByType, totalParticipants, totalCost, totalMedia, achievementLevels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ExternalDisplayRecord.findAll({
                            where: {
                                class_id: classId,
                                semester: semester,
                                academic_year: academicYear
                            }
                        })];
                    case 1:
                        records = _a.sent();
                        totalDisplays = records.length;
                        displaysByType = records.reduce(function (acc, record) {
                            acc[record.display_type] = (acc[record.display_type] || 0) + 1;
                            return acc;
                        }, {});
                        totalParticipants = records.reduce(function (sum, record) { return sum + record.participation_count; }, 0);
                        totalCost = records.reduce(function (sum, record) { return sum + (record.expenses || 0); }, 0);
                        totalMedia = records.reduce(function (sum, record) { return sum + record.media_count; }, 0);
                        achievementLevels = records.reduce(function (acc, record) {
                            if (record.achievement_level) {
                                acc[record.achievement_level] = (acc[record.achievement_level] || 0) + 1;
                            }
                            return acc;
                        }, {});
                        return [2 /*return*/, {
                                total_displays: totalDisplays,
                                displays_by_type: displaysByType,
                                total_participants: totalParticipants,
                                average_participants: totalDisplays > 0 ? Math.round(totalParticipants / totalDisplays) : 0,
                                total_cost: totalCost,
                                average_cost: totalDisplays > 0 ? Math.round(totalCost / totalDisplays) : 0,
                                total_media: totalMedia,
                                achievement_levels: achievementLevels,
                                records_with_media: records.filter(function (r) { return r.hasMediaRecords(); }).length,
                                media_coverage_rate: totalDisplays > 0 ? Math.round((records.filter(function (r) { return r.hasMediaRecords(); }).length / totalDisplays) * 100) : 0
                            }];
                }
            });
        });
    };
    // 静态方法：获取累计外出统计
    ExternalDisplayRecord.getCumulativeStats = function (classId) {
        return __awaiter(this, void 0, void 0, function () {
            var allRecords, currentSemesterRecords;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ExternalDisplayRecord.findAll({
                            where: { class_id: classId }
                        })];
                    case 1:
                        allRecords = _a.sent();
                        return [4 /*yield*/, ExternalDisplayRecord.findAll({
                                where: {
                                    class_id: classId,
                                    semester: '2024春季',
                                    academic_year: '2024-2025'
                                }
                            })];
                    case 2:
                        currentSemesterRecords = _a.sent();
                        return [2 /*return*/, {
                                total_all_time: allRecords.length,
                                total_current_semester: currentSemesterRecords.length,
                                total_participants_all_time: allRecords.reduce(function (sum, r) { return sum + r.participation_count; }, 0),
                                total_cost_all_time: allRecords.reduce(function (sum, r) { return sum + (r.expenses || 0); }, 0),
                                first_display_date: allRecords.length > 0 ?
                                    allRecords.sort(function (a, b) { return a.display_date.getTime() - b.display_date.getTime(); })[0].display_date : null,
                                latest_display_date: allRecords.length > 0 ?
                                    allRecords.sort(function (a, b) { return b.display_date.getTime() - a.display_date.getTime(); })[0].display_date : null
                            }];
                }
            });
        });
    };
    return ExternalDisplayRecord;
}(sequelize_1.Model));
exports.ExternalDisplayRecord = ExternalDisplayRecord;
// 初始化模型函数
var initExternalDisplayRecordModel = function (sequelizeInstance) {
    ExternalDisplayRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '校外展示记录ID'
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
        display_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '展示日期'
        },
        display_location: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '展示地点'
        },
        display_type: {
            type: sequelize_1.DataTypes.ENUM('competition', 'performance', 'exhibition', 'visit', 'other'),
            allowNull: false,
            comment: '展示类型'
        },
        participation_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '参与人数'
        },
        achievement_level: {
            type: sequelize_1.DataTypes.ENUM('excellent', 'good', 'average', 'needs_improvement'),
            allowNull: true,
            comment: '成就等级'
        },
        achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '达标率（%）'
        },
        has_media: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否有媒体文件'
        },
        media_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '媒体文件数量'
        },
        display_content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '展示内容'
        },
        feedback: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '反馈'
        },
        awards: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '获得奖项'
        },
        expenses: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '费用'
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        teacher_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '负责教师ID'
        },
        organizer: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '主办方'
        },
        created_by: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
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
        modelName: 'ExternalDisplayRecord',
        tableName: 'external_display_records',
        timestamps: true,
        underscored: true,
        comment: '校外展示记录表'
    });
};
exports.initExternalDisplayRecordModel = initExternalDisplayRecordModel;
exports["default"] = ExternalDisplayRecord;
