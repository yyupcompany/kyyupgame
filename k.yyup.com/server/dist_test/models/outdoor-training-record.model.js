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
exports.initOutdoorTrainingRecordModel = exports.OutdoorTrainingRecord = void 0;
var sequelize_1 = require("sequelize");
var class_model_1 = require("./class.model");
var teacher_model_1 = require("./teacher.model");
// 户外训练记录模型类
var OutdoorTrainingRecord = /** @class */ (function (_super) {
    __extends(OutdoorTrainingRecord, _super);
    function OutdoorTrainingRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    OutdoorTrainingRecord.associate = function () {
        // 与班级表的关联
        OutdoorTrainingRecord.belongsTo(class_model_1.Class, {
            foreignKey: 'class_id',
            as: 'class'
        });
        // 与教师表的关联
        OutdoorTrainingRecord.belongsTo(teacher_model_1.Teacher, {
            foreignKey: 'teacher_id',
            as: 'teacher',
            constraints: false
        });
    };
    // 实例方法：获取训练类型描述
    OutdoorTrainingRecord.prototype.getTrainingTypeDescription = function () {
        var typeMap = {
            'outdoor_training': '户外训练',
            'departure_display': '离园展示'
        };
        return typeMap[this.training_type] || '未知类型';
    };
    // 实例方法：获取完成状态描述
    OutdoorTrainingRecord.prototype.getCompletionStatusDescription = function () {
        var statusMap = {
            'not_started': '未开始',
            'in_progress': '进行中',
            'completed': '已完成'
        };
        return statusMap[this.completion_status] || '未知状态';
    };
    // 实例方法：计算达标率
    OutdoorTrainingRecord.prototype.calculateAchievementRate = function () {
        if (this.participation_count === 0)
            return 0;
        return Math.round((this.achievement_count / this.participation_count) * 100);
    };
    // 实例方法：获取学期描述
    OutdoorTrainingRecord.prototype.getSemesterDescription = function () {
        return "".concat(this.academic_year, "\u5B66\u5E74 ").concat(this.semester);
    };
    // 实例方法：获取周次描述
    OutdoorTrainingRecord.prototype.getWeekDescription = function () {
        return "\u7B2C".concat(this.week_number, "\u5468");
    };
    // 实例方法：检查是否已完成
    OutdoorTrainingRecord.prototype.isCompleted = function () {
        return this.completion_status === 'completed';
    };
    // 实例方法：检查是否已确认
    OutdoorTrainingRecord.prototype.isConfirmed = function () {
        return this.confirmed_at !== null;
    };
    // 实例方法：获取天气状况描述
    OutdoorTrainingRecord.prototype.getWeatherDescription = function () {
        if (!this.weather_condition)
            return '未记录';
        var weatherMap = {
            'sunny': '晴天',
            'cloudy': '多云',
            'rainy': '雨天',
            'windy': '大风',
            'snowy': '雪天'
        };
        return weatherMap[this.weather_condition] || this.weather_condition;
    };
    // 实例方法：获取媒体状态描述
    OutdoorTrainingRecord.prototype.getMediaStatusDescription = function () {
        if (!this.has_media)
            return '无媒体';
        return "".concat(this.media_count, "\u4E2A\u5A92\u4F53\u6587\u4EF6");
    };
    // 静态方法：按班级和学期统计完成情况
    OutdoorTrainingRecord.getCompletionStats = function (classId, semester, academicYear) {
        return __awaiter(this, void 0, void 0, function () {
            var records, totalWeeks, completedWeeks, outdoorTrainingWeeks, departureDisplayWeeks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, OutdoorTrainingRecord.findAll({
                            where: {
                                class_id: classId,
                                semester: semester,
                                academic_year: academicYear
                            }
                        })];
                    case 1:
                        records = _a.sent();
                        totalWeeks = 16;
                        completedWeeks = records.filter(function (r) { return r.completion_status === 'completed'; }).length;
                        outdoorTrainingWeeks = records.filter(function (r) { return r.training_type === 'outdoor_training' && r.completion_status === 'completed'; }).length;
                        departureDisplayWeeks = records.filter(function (r) { return r.training_type === 'departure_display' && r.completion_status === 'completed'; }).length;
                        return [2 /*return*/, {
                                total_weeks: totalWeeks,
                                completed_weeks: completedWeeks,
                                outdoor_training_weeks: outdoorTrainingWeeks,
                                departure_display_weeks: departureDisplayWeeks,
                                completion_rate: Math.round((completedWeeks / totalWeeks) * 100),
                                outdoor_training_rate: Math.round((outdoorTrainingWeeks / totalWeeks) * 100),
                                departure_display_rate: Math.round((departureDisplayWeeks / totalWeeks) * 100)
                            }];
                }
            });
        });
    };
    return OutdoorTrainingRecord;
}(sequelize_1.Model));
exports.OutdoorTrainingRecord = OutdoorTrainingRecord;
// 初始化模型函数
var initOutdoorTrainingRecordModel = function (sequelizeInstance) {
    OutdoorTrainingRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '户外训练记录ID'
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
        week_number: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '第几周（1-16）'
        },
        training_type: {
            type: sequelize_1.DataTypes.ENUM('outdoor_training', 'departure_display'),
            allowNull: false,
            comment: '训练类型'
        },
        training_date: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '训练日期'
        },
        completion_status: {
            type: sequelize_1.DataTypes.ENUM('not_started', 'in_progress', 'completed'),
            defaultValue: 'not_started',
            comment: '完成状态'
        },
        participation_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '参与人数'
        },
        achievement_count: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: '达标人数'
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
        weather_condition: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '天气状况'
        },
        training_content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '训练内容'
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
        confirmed_by: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '确认人ID'
        },
        confirmed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '确认时间'
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
        modelName: 'OutdoorTrainingRecord',
        tableName: 'outdoor_training_records',
        timestamps: true,
        underscored: true,
        comment: '户外训练记录表'
    });
};
exports.initOutdoorTrainingRecordModel = initOutdoorTrainingRecordModel;
exports["default"] = OutdoorTrainingRecord;
