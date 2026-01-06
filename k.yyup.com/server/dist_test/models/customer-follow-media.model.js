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
exports.CustomerFollowMedia = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var CustomerFollowMedia = /** @class */ (function (_super) {
    __extends(CustomerFollowMedia, _super);
    function CustomerFollowMedia() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomerFollowMedia.initModel = function (sequelize) {
        CustomerFollowMedia.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '媒体文件ID'
            },
            followRecordId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'follow_record_id',
                comment: '跟进记录ID',
                references: {
                    model: 'customer_follow_records',
                    key: 'id'
                }
            },
            mediaType: {
                type: sequelize_1.DataTypes.ENUM('image', 'video', 'audio', 'document'),
                allowNull: false,
                field: 'media_type',
                comment: '媒体类型'
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
            fileSize: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'file_size',
                comment: '文件大小(字节)'
            },
            mimeType: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                field: 'mime_type',
                comment: 'MIME类型'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '文件描述'
            },
            uploadedBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'uploaded_by',
                comment: '上传者ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                comment: '创建时间'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                comment: '更新时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'customer_follow_media',
            timestamps: true,
            underscored: true,
            comment: '客户跟进媒体文件表'
        });
    };
    CustomerFollowMedia.initAssociations = function () {
        CustomerFollowMedia.belongsTo(user_model_1.User, {
            foreignKey: 'uploadedBy',
            as: 'uploader'
        });
    };
    return CustomerFollowMedia;
}(sequelize_1.Model));
exports.CustomerFollowMedia = CustomerFollowMedia;
exports["default"] = CustomerFollowMedia;
