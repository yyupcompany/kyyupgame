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
exports.initEnrollmentApplicationMaterialAssociations = exports.initEnrollmentApplicationMaterial = exports.EnrollmentApplicationMaterial = exports.MaterialStatus = void 0;
var sequelize_1 = require("sequelize");
var enrollment_application_model_1 = require("./enrollment-application.model");
var user_model_1 = require("./user.model");
/**
 * 材料状态枚举
 */
var MaterialStatus;
(function (MaterialStatus) {
    MaterialStatus["PENDING"] = "pending";
    MaterialStatus["SUBMITTED"] = "submitted";
    MaterialStatus["VERIFIED"] = "verified";
    MaterialStatus["REJECTED"] = "rejected";
})(MaterialStatus = exports.MaterialStatus || (exports.MaterialStatus = {}));
/**
 * 招生申请材料模型
 * 记录学生申请时提交的各类材料。
 */
var EnrollmentApplicationMaterial = /** @class */ (function (_super) {
    __extends(EnrollmentApplicationMaterial, _super);
    function EnrollmentApplicationMaterial() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EnrollmentApplicationMaterial;
}(sequelize_1.Model));
exports.EnrollmentApplicationMaterial = EnrollmentApplicationMaterial;
var initEnrollmentApplicationMaterial = function (sequelize) {
    EnrollmentApplicationMaterial.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        applicationId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '申请ID',
            references: {
                model: 'enrollment_applications',
                key: 'id'
            }
        },
        materialType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '材料类型 - 1:身份证 2:户口本 3:出生证明 4:体检报告 5:照片 6:其他'
        },
        materialName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '材料名称'
        },
        fileUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '文件URL'
        },
        fileSize: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '文件大小(字节)'
        },
        fileType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '文件类型(MIME类型)'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(MaterialStatus)),
            defaultValue: MaterialStatus.PENDING,
            allowNull: false,
            comment: '材料状态'
        },
        uploadDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '上传日期'
        },
        uploaderId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '上传者ID'
        },
        isVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否已验证'
        },
        verifierId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '验证人ID',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        verificationTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '验证时间'
        },
        verificationComment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '验证备注'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建者ID'
        },
        updatedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新者ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE
        }
    }, {
        sequelize: sequelize,
        tableName: 'enrollment_application_materials',
        timestamps: true,
        paranoid: true,
        underscored: true,
        comment: '招生申请提交的材料表',
        indexes: [{ fields: ['application_id'] }, { fields: ['material_type'] }]
    });
    return EnrollmentApplicationMaterial;
};
exports.initEnrollmentApplicationMaterial = initEnrollmentApplicationMaterial;
var initEnrollmentApplicationMaterialAssociations = function () {
    EnrollmentApplicationMaterial.belongsTo(enrollment_application_model_1.EnrollmentApplication, {
        foreignKey: 'applicationId',
        as: 'application'
    });
    EnrollmentApplicationMaterial.belongsTo(user_model_1.User, {
        foreignKey: 'verifierId',
        as: 'verifier'
    });
    EnrollmentApplicationMaterial.belongsTo(user_model_1.User, {
        foreignKey: 'uploaderId',
        as: 'uploader'
    });
    EnrollmentApplicationMaterial.belongsTo(user_model_1.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
    EnrollmentApplicationMaterial.belongsTo(user_model_1.User, {
        foreignKey: 'updatedBy',
        as: 'updater'
    });
};
exports.initEnrollmentApplicationMaterialAssociations = initEnrollmentApplicationMaterialAssociations;
