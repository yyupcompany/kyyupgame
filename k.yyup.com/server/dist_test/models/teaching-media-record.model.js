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
exports.initTeachingMediaRecordModel = exports.TeachingMediaRecord = void 0;
var sequelize_1 = require("sequelize");
var class_model_1 = require("./class.model");
var course_progress_model_1 = require("./course-progress.model");
var file_storage_model_1 = require("./file-storage.model");
var student_model_1 = require("./student.model");
var user_model_1 = require("./user.model");
// 教学媒体记录模型类
var TeachingMediaRecord = /** @class */ (function (_super) {
    __extends(TeachingMediaRecord, _super);
    function TeachingMediaRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 静态关联方法
    TeachingMediaRecord.associate = function () {
        // 与班级表的关联
        TeachingMediaRecord.belongsTo(class_model_1.Class, {
            foreignKey: 'class_id',
            as: 'class'
        });
        // 与课程进度表的关联
        TeachingMediaRecord.belongsTo(course_progress_model_1.CourseProgress, {
            foreignKey: 'course_progress_id',
            as: 'courseProgress'
        });
        // 与文件存储表的关联
        TeachingMediaRecord.belongsTo(file_storage_model_1.FileStorage, {
            foreignKey: 'file_storage_id',
            as: 'fileStorage'
        });
        // 与学生表的关联（可选）
        TeachingMediaRecord.belongsTo(student_model_1.Student, {
            foreignKey: 'student_id',
            as: 'student',
            constraints: false
        });
        // 与用户表的关联（上传者）
        TeachingMediaRecord.belongsTo(user_model_1.User, {
            foreignKey: 'upload_by',
            as: 'uploader'
        });
    };
    // 实例方法：获取媒体类型描述
    TeachingMediaRecord.prototype.getMediaTypeDescription = function () {
        var typeMap = {
            'class_photo': '班级照片',
            'class_video': '班级视频',
            'student_photo': '学员照片',
            'student_video': '学员视频'
        };
        return typeMap[this.media_type] || '未知类型';
    };
    // 实例方法：检查是否为图片
    TeachingMediaRecord.prototype.isImage = function () {
        return this.media_type === 'class_photo' || this.media_type === 'student_photo';
    };
    // 实例方法：检查是否为视频
    TeachingMediaRecord.prototype.isVideo = function () {
        return this.media_type === 'class_video' || this.media_type === 'student_video';
    };
    // 实例方法：检查是否为班级媒体
    TeachingMediaRecord.prototype.isClassMedia = function () {
        return this.media_type === 'class_photo' || this.media_type === 'class_video';
    };
    // 实例方法：检查是否为学员媒体
    TeachingMediaRecord.prototype.isStudentMedia = function () {
        return this.media_type === 'student_photo' || this.media_type === 'student_video';
    };
    // 实例方法：获取文件大小描述
    TeachingMediaRecord.prototype.getFileSizeDescription = function () {
        if (!this.file_size)
            return '未知大小';
        var size = this.file_size;
        if (size < 1024)
            return "".concat(size, " B");
        if (size < 1024 * 1024)
            return "".concat((size / 1024).toFixed(1), " KB");
        if (size < 1024 * 1024 * 1024)
            return "".concat((size / (1024 * 1024)).toFixed(1), " MB");
        return "".concat((size / (1024 * 1024 * 1024)).toFixed(1), " GB");
    };
    // 实例方法：获取视频时长描述
    TeachingMediaRecord.prototype.getDurationDescription = function () {
        if (!this.duration || !this.isVideo())
            return '';
        var minutes = Math.floor(this.duration / 60);
        var seconds = this.duration % 60;
        if (minutes > 0) {
            return "".concat(minutes, "\u5206").concat(seconds, "\u79D2");
        }
        return "".concat(seconds, "\u79D2");
    };
    // 实例方法：获取状态描述
    TeachingMediaRecord.prototype.getStatusDescription = function () {
        var statusMap = {
            'active': '正常',
            'archived': '已归档',
            'deleted': '已删除'
        };
        return statusMap[this.status] || '未知状态';
    };
    // 实例方法：检查是否可以删除
    TeachingMediaRecord.prototype.canDelete = function (userId) {
        // 只有上传者可以删除
        return this.upload_by === userId && this.status === 'active';
    };
    // 实例方法：软删除
    TeachingMediaRecord.prototype.softDelete = function () {
        this.status = 'deleted';
    };
    // 实例方法：归档
    TeachingMediaRecord.prototype.archive = function () {
        this.status = 'archived';
    };
    // 实例方法：恢复状态
    TeachingMediaRecord.prototype.restoreStatus = function () {
        this.status = 'active';
    };
    // 实例方法：设置为精选
    TeachingMediaRecord.prototype.setFeatured = function (featured) {
        if (featured === void 0) { featured = true; }
        this.is_featured = featured;
    };
    // 实例方法：获取缩略图URL或默认图标
    TeachingMediaRecord.prototype.getThumbnailUrl = function () {
        if (this.thumbnail_url)
            return this.thumbnail_url;
        // 返回默认图标
        if (this.isImage())
            return '/default-image-thumbnail.png';
        if (this.isVideo())
            return '/default-video-thumbnail.png';
        return '/default-file-thumbnail.png';
    };
    // 静态方法：根据媒体类型统计数量
    TeachingMediaRecord.countByMediaType = function (classId, courseProgressId) {
        return __awaiter(this, void 0, void 0, function () {
            var counts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeachingMediaRecord.findAll({
                            where: {
                                class_id: classId,
                                course_progress_id: courseProgressId,
                                status: 'active'
                            },
                            attributes: [
                                'media_type',
                                [TeachingMediaRecord.sequelize.fn('COUNT', TeachingMediaRecord.sequelize.col('id')), 'count']
                            ],
                            group: ['media_type'],
                            raw: true
                        })];
                    case 1:
                        counts = _a.sent();
                        result = {
                            class_photo: 0,
                            class_video: 0,
                            student_photo: 0,
                            student_video: 0
                        };
                        counts.forEach(function (count) {
                            result[count.media_type] = parseInt(count.count);
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return TeachingMediaRecord;
}(sequelize_1.Model));
exports.TeachingMediaRecord = TeachingMediaRecord;
// 初始化模型函数
var initTeachingMediaRecordModel = function (sequelizeInstance) {
    TeachingMediaRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '媒体记录ID'
        },
        class_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '班级ID'
        },
        course_progress_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '课程进度ID'
        },
        media_type: {
            type: sequelize_1.DataTypes.ENUM('class_photo', 'class_video', 'student_photo', 'student_video'),
            allowNull: false,
            comment: '媒体类型'
        },
        file_storage_id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '文件存储ID'
        },
        student_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '学员ID（学员媒体时使用）'
        },
        upload_by: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '上传者ID'
        },
        upload_time: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '上传时间'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '媒体描述'
        },
        is_featured: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: '是否为精选媒体'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'archived', 'deleted'),
            defaultValue: 'active',
            comment: '状态'
        },
        file_size: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '文件大小（字节）'
        },
        file_format: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            comment: '文件格式'
        },
        duration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '视频时长（秒）'
        },
        thumbnail_url: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '缩略图URL'
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
        modelName: 'TeachingMediaRecord',
        tableName: 'teaching_media_records',
        timestamps: true,
        underscored: true,
        comment: '教学媒体记录表'
    });
};
exports.initTeachingMediaRecordModel = initTeachingMediaRecordModel;
exports["default"] = TeachingMediaRecord;
