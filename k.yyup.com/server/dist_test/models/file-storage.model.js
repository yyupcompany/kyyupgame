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
exports.initFileStorageAssociations = exports.initFileStorage = exports.FileStorage = exports.FileStatus = exports.StorageType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * 存储类型
 */
var StorageType;
(function (StorageType) {
    StorageType["LOCAL"] = "local";
    StorageType["S3"] = "s3";
    StorageType["OSS"] = "oss";
    StorageType["COS"] = "cos";
})(StorageType = exports.StorageType || (exports.StorageType = {}));
/**
 * 文件状态
 */
var FileStatus;
(function (FileStatus) {
    FileStatus["ACTIVE"] = "active";
    FileStatus["DELETED"] = "deleted";
    FileStatus["EXPIRED"] = "expired";
})(FileStatus = exports.FileStatus || (exports.FileStatus = {}));
var FileStorage = /** @class */ (function (_super) {
    __extends(FileStorage, _super);
    function FileStorage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FileStorage;
}(sequelize_1.Model));
exports.FileStorage = FileStorage;
var initFileStorage = function (sequelize) {
    FileStorage.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '文件ID'
        },
        fileName: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '文件名称'
        },
        originalName: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '原始文件名'
        },
        filePath: {
            type: sequelize_1.DataTypes.STRING(512),
            allowNull: false,
            comment: '文件路径'
        },
        fileSize: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '文件大小(字节)'
        },
        fileType: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '文件类型'
        },
        storageType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(StorageType)),
            allowNull: false,
            defaultValue: StorageType.LOCAL,
            comment: '存储类型: local, s3, oss, cos'
        },
        bucket: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '存储位置/存储桶'
        },
        accessUrl: {
            type: sequelize_1.DataTypes.STRING(512),
            allowNull: false,
            comment: '文件访问URL'
        },
        isPublic: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否公开可访问'
        },
        uploaderId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '上传者ID'
        },
        uploaderType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '上传者类型'
        },
        module: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '所属模块'
        },
        referenceId: {
            type: sequelize_1.DataTypes.STRING(64),
            allowNull: true,
            comment: '关联ID'
        },
        referenceType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '关联类型'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '元数据(JSON)'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(FileStatus)),
            allowNull: false,
            defaultValue: FileStatus.ACTIVE,
            comment: '状态: active(正常), deleted(已删除), expired(已过期)'
        },
        expireAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '过期时间'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '更新时间'
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '删除时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'file_storages',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return FileStorage;
};
exports.initFileStorage = initFileStorage;
var initFileStorageAssociations = function () {
    FileStorage.belongsTo(user_model_1.User, {
        foreignKey: 'uploaderId',
        as: 'uploader'
    });
};
exports.initFileStorageAssociations = initFileStorageAssociations;
