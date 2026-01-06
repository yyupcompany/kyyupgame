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
exports.TaskAttachment = void 0;
var sequelize_1 = require("sequelize");
// 任务附件模型类
var TaskAttachment = /** @class */ (function (_super) {
    __extends(TaskAttachment, _super);
    function TaskAttachment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 关联定义
    TaskAttachment.associate = function (models) {
        // 关联到任务
        TaskAttachment.belongsTo(models.Todo, {
            foreignKey: 'taskId',
            as: 'task'
        });
        // 关联到上传者
        TaskAttachment.belongsTo(models.User, {
            foreignKey: 'uploaderId',
            as: 'uploader'
        });
    };
    // 初始化模型
    TaskAttachment.initModel = function (sequelize) {
        TaskAttachment.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            taskId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'task_id',
                comment: '任务ID'
            },
            fileName: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                field: 'file_name',
                comment: '文件名'
            },
            filePath: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: false,
                field: 'file_path',
                comment: '文件路径'
            },
            fileUrl: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                field: 'file_url',
                comment: '文件访问URL'
            },
            fileSize: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'file_size',
                comment: '文件大小（字节）'
            },
            fileType: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                field: 'file_type',
                comment: '文件MIME类型'
            },
            fileExtension: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                field: 'file_extension',
                comment: '文件扩展名'
            },
            uploaderId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'uploader_id',
                comment: '上传者ID'
            },
            uploadTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
                field: 'upload_time',
                comment: '上传时间'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '附件描述'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM('active', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
                comment: '状态'
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
                field: 'deleted_at',
                comment: '软删除时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'task_attachments',
            timestamps: true,
            paranoid: true,
            underscored: true,
            comment: '任务附件表'
        });
        return TaskAttachment;
    };
    return TaskAttachment;
}(sequelize_1.Model));
exports.TaskAttachment = TaskAttachment;
exports["default"] = TaskAttachment;
