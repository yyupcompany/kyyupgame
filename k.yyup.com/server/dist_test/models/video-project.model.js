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
exports.initVideoProjectModel = exports.VideoProject = exports.VideoStyle = exports.VideoType = exports.VideoPlatform = exports.VideoProjectStatus = void 0;
var sequelize_1 = require("sequelize");
/**
 * 视频项目状态枚举
 */
var VideoProjectStatus;
(function (VideoProjectStatus) {
    VideoProjectStatus["DRAFT"] = "draft";
    VideoProjectStatus["GENERATING_SCRIPT"] = "generating_script";
    VideoProjectStatus["GENERATING_AUDIO"] = "generating_audio";
    VideoProjectStatus["GENERATING_VIDEO"] = "generating_video";
    VideoProjectStatus["EDITING"] = "editing";
    VideoProjectStatus["COMPLETED"] = "completed";
    VideoProjectStatus["FAILED"] = "failed";
})(VideoProjectStatus = exports.VideoProjectStatus || (exports.VideoProjectStatus = {}));
/**
 * 视频平台枚举
 */
var VideoPlatform;
(function (VideoPlatform) {
    VideoPlatform["DOUYIN"] = "douyin";
    VideoPlatform["KUAISHOU"] = "kuaishou";
    VideoPlatform["WECHAT_VIDEO"] = "wechat_video";
    VideoPlatform["XIAOHONGSHU"] = "xiaohongshu";
    VideoPlatform["BILIBILI"] = "bilibili";
})(VideoPlatform = exports.VideoPlatform || (exports.VideoPlatform = {}));
/**
 * 视频类型枚举
 */
var VideoType;
(function (VideoType) {
    VideoType["ENROLLMENT"] = "enrollment";
    VideoType["ACTIVITY"] = "activity";
    VideoType["COURSE"] = "course";
    VideoType["ENVIRONMENT"] = "environment";
    VideoType["TEACHER"] = "teacher";
    VideoType["STUDENT"] = "student";
})(VideoType = exports.VideoType || (exports.VideoType = {}));
/**
 * 视频风格枚举
 */
var VideoStyle;
(function (VideoStyle) {
    VideoStyle["WARM"] = "warm";
    VideoStyle["PROFESSIONAL"] = "professional";
    VideoStyle["LIVELY"] = "lively";
    VideoStyle["ELEGANT"] = "elegant";
})(VideoStyle = exports.VideoStyle || (exports.VideoStyle = {}));
/**
 * 视频项目模型
 */
var VideoProject = /** @class */ (function (_super) {
    __extends(VideoProject, _super);
    function VideoProject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VideoProject;
}(sequelize_1.Model));
exports.VideoProject = VideoProject;
/**
 * 初始化视频项目模型
 */
function initVideoProjectModel(sequelize) {
    VideoProject.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '视频项目ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'userId',
            comment: '用户ID',
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '视频标题'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '视频描述'
        },
        platform: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(VideoPlatform)),
            allowNull: false,
            comment: '发布平台'
        },
        videoType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(VideoType)),
            allowNull: false,
            field: 'videoType',
            comment: '视频类型'
        },
        duration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30,
            comment: '视频时长（秒）'
        },
        style: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(VideoStyle)),
            allowNull: false,
            defaultValue: VideoStyle.WARM,
            comment: '视频风格'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(VideoProjectStatus)),
            allowNull: false,
            defaultValue: VideoProjectStatus.DRAFT,
            comment: '项目状态'
        },
        topic: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '视频主题'
        },
        keyPoints: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'keyPoints',
            comment: '关键信息点'
        },
        targetAudience: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'parents',
            field: 'targetAudience',
            comment: '目标受众'
        },
        voiceStyle: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'alloy',
            field: 'voiceStyle',
            comment: '配音风格'
        },
        scriptData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            field: 'scriptData',
            comment: '脚本数据'
        },
        audioData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            field: 'audioData',
            comment: '音频数据'
        },
        videoData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            field: 'videoData',
            comment: '视频数据'
        },
        sceneVideos: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'sceneVideos',
            comment: '场景视频JSON字符串'
        },
        finalVideoUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'finalVideoUrl',
            comment: '最终视频URL'
        },
        finalVideoPath: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'finalVideoPath',
            comment: '最终视频路径'
        },
        finalVideoId: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            field: 'finalVideoId',
            comment: 'VOD视频ID'
        },
        coverImageUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'coverImageUrl',
            comment: '封面图URL'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '元数据'
        },
        errorMessage: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'errorMessage',
            comment: '错误信息'
        },
        progress: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'progress',
            comment: '任务进度(0-100)'
        },
        progressMessage: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'progressMessage',
            comment: '进度消息'
        },
        completedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'completedAt',
            comment: '完成时间'
        },
        notified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'notified',
            comment: '是否已通知用户'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'createdAt',
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updatedAt',
            comment: '更新时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'video_projects',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                name: 'idx_user_id',
                fields: ['userId']
            },
            {
                name: 'idx_status',
                fields: ['status']
            },
            {
                name: 'idx_created_at',
                fields: ['createdAt']
            },
        ],
        comment: '视频项目表'
    });
    return VideoProject;
}
exports.initVideoProjectModel = initVideoProjectModel;
exports["default"] = VideoProject;
