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
exports.initChampionshipRecordModel = exports.ChampionshipRecord = void 0;
var sequelize_1 = require("sequelize");
var teacher_model_1 = require("./teacher.model");
// 全员锦标赛记录模型类
var ChampionshipRecord = /** @class */ (function (_super) {
    __extends(ChampionshipRecord, _super);
    function ChampionshipRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    ChampionshipRecord.associate = function () {
        // 与教师表的关联（组织者）
        ChampionshipRecord.belongsTo(teacher_model_1.Teacher, {
            foreignKey: 'organizer_id',
            as: 'organizer',
            constraints: false
        });
    };
    // 实例方法：获取锦标赛类型描述
    ChampionshipRecord.prototype.getChampionshipTypeDescription = function () {
        var typeMap = {
            'brain_science': '脑科学专项锦标赛',
            'comprehensive': '综合能力锦标赛',
            'special': '特色主题锦标赛'
        };
        return typeMap[this.championship_type] || '未知类型';
    };
    // 实例方法：获取完成状态描述
    ChampionshipRecord.prototype.getCompletionStatusDescription = function () {
        var statusMap = {
            'planned': '计划中',
            'in_progress': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[this.completion_status] || '未知状态';
    };
    // 实例方法：获取学期描述
    ChampionshipRecord.prototype.getSemesterDescription = function () {
        return "".concat(this.academic_year, "\u5B66\u5E74 ").concat(this.semester);
    };
    // 实例方法：检查是否已完成
    ChampionshipRecord.prototype.isCompleted = function () {
        return this.completion_status === 'completed';
    };
    // 实例方法：检查是否有媒体记录
    ChampionshipRecord.prototype.hasMediaRecords = function () {
        return this.has_media && this.media_count > 0;
    };
    // 实例方法：获取媒体统计描述
    ChampionshipRecord.prototype.getMediaStatsDescription = function () {
        if (!this.has_media || this.media_count === 0) {
            return '无媒体记录';
        }
        return "".concat(this.media_count, "\u4E2A\u5A92\u4F53\u6587\u4EF6");
    };
    // 实例方法：获取获奖者描述
    ChampionshipRecord.prototype.getWinnersDescription = function () {
        if (!this.winners)
            return '暂无获奖者';
        return this.winners;
    };
    // 实例方法：获取规则描述
    ChampionshipRecord.prototype.getRulesDescription = function () {
        if (!this.championship_rules)
            return '暂无规则';
        return this.championship_rules;
    };
    // 实例方法：获取综合评级
    ChampionshipRecord.prototype.getOverallGrade = function () {
        var rate = this.overall_achievement_rate;
        if (rate >= 90)
            return '优秀';
        if (rate >= 80)
            return '良好';
        if (rate >= 70)
            return '合格';
        if (rate >= 60)
            return '及格';
        return '待改进';
    };
    // 实例方法：获取各项达标率汇总
    ChampionshipRecord.prototype.getAchievementRatesSummary = function () {
        return {
            brain_science: {
                rate: this.brain_science_achievement_rate,
                description: '神童计划达标率'
            },
            course_content: {
                rate: this.course_content_achievement_rate,
                description: '课程内容达标率'
            },
            outdoor_training: {
                rate: this.outdoor_training_achievement_rate,
                description: '户外训练达标率'
            },
            external_display: {
                rate: this.external_display_achievement_rate,
                description: '外出活动达标率'
            },
            overall: {
                rate: this.overall_achievement_rate,
                description: '综合达标率'
            }
        };
    };
    // 静态方法：按学期统计锦标赛情况
    ChampionshipRecord.getChampionshipStats = function (semester, academicYear) {
        return __awaiter(this, void 0, void 0, function () {
            var records, totalChampionships, completedChampionships, totalParticipants, totalMedia, averageAchievementRates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ChampionshipRecord.findAll({
                            where: {
                                semester: semester,
                                academic_year: academicYear
                            }
                        })];
                    case 1:
                        records = _a.sent();
                        totalChampionships = records.length;
                        completedChampionships = records.filter(function (r) { return r.completion_status === 'completed'; }).length;
                        totalParticipants = records.reduce(function (sum, r) { return sum + r.total_participants; }, 0);
                        totalMedia = records.reduce(function (sum, r) { return sum + r.media_count; }, 0);
                        averageAchievementRates = {
                            brain_science: records.length > 0 ?
                                Math.round(records.reduce(function (sum, r) { return sum + r.brain_science_achievement_rate; }, 0) / records.length) : 0,
                            course_content: records.length > 0 ?
                                Math.round(records.reduce(function (sum, r) { return sum + r.course_content_achievement_rate; }, 0) / records.length) : 0,
                            outdoor_training: records.length > 0 ?
                                Math.round(records.reduce(function (sum, r) { return sum + r.outdoor_training_achievement_rate; }, 0) / records.length) : 0,
                            external_display: records.length > 0 ?
                                Math.round(records.reduce(function (sum, r) { return sum + r.external_display_achievement_rate; }, 0) / records.length) : 0,
                            overall: records.length > 0 ?
                                Math.round(records.reduce(function (sum, r) { return sum + r.overall_achievement_rate; }, 0) / records.length) : 0
                        };
                        return [2 /*return*/, {
                                total_championships: totalChampionships,
                                completed_championships: completedChampionships,
                                completion_rate: totalChampionships > 0 ? Math.round((completedChampionships / totalChampionships) * 100) : 0,
                                total_participants: totalParticipants,
                                average_participants_per_championship: totalChampionships > 0 ? Math.round(totalParticipants / totalChampionships) : 0,
                                total_media: totalMedia,
                                average_achievement_rates: averageAchievementRates,
                                championships_with_media: records.filter(function (r) { return r.hasMediaRecords(); }).length,
                                media_coverage_rate: totalChampionships > 0 ?
                                    Math.round((records.filter(function (r) { return r.hasMediaRecords(); }).length / totalChampionships) * 100) : 0
                            }];
                }
            });
        });
    };
    // 静态方法：获取历史锦标赛统计
    ChampionshipRecord.getHistoricalStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allRecords, totalAllTime, completedAllTime, byAcademicYear;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ChampionshipRecord.findAll({
                            order: [['championship_date', 'ASC']]
                        })];
                    case 1:
                        allRecords = _a.sent();
                        totalAllTime = allRecords.length;
                        completedAllTime = allRecords.filter(function (r) { return r.completion_status === 'completed'; }).length;
                        byAcademicYear = allRecords.reduce(function (acc, record) {
                            var year = record.academic_year;
                            if (!acc[year]) {
                                acc[year] = { total: 0, completed: 0, participants: 0 };
                            }
                            acc[year].total++;
                            if (record.completion_status === 'completed') {
                                acc[year].completed++;
                            }
                            acc[year].participants += record.total_participants;
                            return acc;
                        }, {});
                        return [2 /*return*/, {
                                total_all_time: totalAllTime,
                                completed_all_time: completedAllTime,
                                completion_rate_all_time: totalAllTime > 0 ? Math.round((completedAllTime / totalAllTime) * 100) : 0,
                                by_academic_year: byAcademicYear,
                                first_championship_date: allRecords.length > 0 ? allRecords[0].championship_date : null,
                                latest_championship_date: allRecords.length > 0 ? allRecords[allRecords.length - 1].championship_date : null,
                                total_participants_all_time: allRecords.reduce(function (sum, r) { return sum + r.total_participants; }, 0)
                            }];
                }
            });
        });
    };
    return ChampionshipRecord;
}(sequelize_1.Model));
exports.ChampionshipRecord = ChampionshipRecord;
// 初始化模型函数
var initChampionshipRecordModel = function (sequelizeInstance) {
    ChampionshipRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '锦标赛记录ID'
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
        championship_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '锦标赛日期'
        },
        championship_type: {
            type: sequelize_1.DataTypes.ENUM('brain_science', 'comprehensive', 'special'),
            allowNull: false,
            comment: '锦标赛类型'
        },
        championship_name: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '锦标赛名称'
        },
        total_participants: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '参与总人数'
        },
        participating_class_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '参与班级数'
        },
        class_participation_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '班级参与比例（%）'
        },
        student_participation_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '学生参与比例（%）'
        },
        brain_science_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '神童计划达标率（%）'
        },
        course_content_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '课程内容达标率（%）'
        },
        outdoor_training_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '户外训练达标率（%）'
        },
        external_display_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '外出活动达标率（%）'
        },
        overall_achievement_rate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
            comment: '综合达标率（%）'
        },
        completion_status: {
            type: sequelize_1.DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
            defaultValue: 'planned',
            comment: '完成状态'
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
        awards: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '获得奖项'
        },
        winners: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '获奖者'
        },
        championship_rules: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '锦标赛规则'
        },
        summary: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '总结'
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        organizer_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '组织者ID'
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
        modelName: 'ChampionshipRecord',
        tableName: 'championship_records',
        timestamps: true,
        underscored: true,
        comment: '全员锦标赛记录表'
    });
};
exports.initChampionshipRecordModel = initChampionshipRecordModel;
exports["default"] = ChampionshipRecord;
