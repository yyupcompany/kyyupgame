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
exports.initAdmissionNotificationAssociations = exports.initAdmissionNotification = exports.AdmissionNotification = exports.NotificationStatus = exports.NotificationMethod = void 0;
var sequelize_1 = require("sequelize");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var message_template_model_1 = require("./message-template.model");
var admission_result_model_1 = require("./admission-result.model");
var user_model_1 = require("./user.model");
var NotificationMethod;
(function (NotificationMethod) {
    NotificationMethod["SMS"] = "sms";
    NotificationMethod["EMAIL"] = "email";
    NotificationMethod["SYSTEM"] = "system";
})(NotificationMethod = exports.NotificationMethod || (exports.NotificationMethod = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus[NotificationStatus["DRAFT"] = 0] = "DRAFT";
    NotificationStatus[NotificationStatus["PENDING"] = 1] = "PENDING";
    NotificationStatus[NotificationStatus["SENT"] = 2] = "SENT";
    NotificationStatus[NotificationStatus["DELIVERED"] = 3] = "DELIVERED";
    NotificationStatus[NotificationStatus["READ"] = 4] = "READ";
    NotificationStatus[NotificationStatus["FAILED"] = 5] = "FAILED";
    NotificationStatus[NotificationStatus["CANCELLED"] = 6] = "CANCELLED";
})(NotificationStatus = exports.NotificationStatus || (exports.NotificationStatus = {}));
var AdmissionNotification = /** @class */ (function (_super) {
    __extends(AdmissionNotification, _super);
    function AdmissionNotification() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AdmissionNotification;
}(sequelize_1.Model));
exports.AdmissionNotification = AdmissionNotification;
var initAdmissionNotification = function (sequelize) {
    AdmissionNotification.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        method: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(NotificationMethod)),
            allowNull: false,
            comment: '通知方式'
        },
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '家长关系ID'
        },
        templateId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '消息模板ID'
        },
        admissionId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '录取结果ID'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '通知标题'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '通知内容'
        },
        status: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: NotificationStatus.DRAFT,
            comment: '通知状态 (0:草稿, 1:待发送, 2:已发送, 3:已送达, 4:已读, 5:发送失败, 6:已取消)'
        },
        responseRequired: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否需要回复'
        },
        scheduledTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '预定发送时间'
        },
        sentTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '实际发送时间'
        },
        deliveredTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '送达时间'
        },
        readTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '阅读时间'
        },
        response: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '回复内容'
        },
        errorMessage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '发送失败信息'
        },
        retryCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '重试次数'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建人ID'
        },
        updatedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'admission_notifications',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return AdmissionNotification;
};
exports.initAdmissionNotification = initAdmissionNotification;
var initAdmissionNotificationAssociations = function () {
    AdmissionNotification.belongsTo(admission_result_model_1.AdmissionResult, {
        foreignKey: 'admissionId',
        as: 'admissionResult'
    });
    AdmissionNotification.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'parentId',
        as: 'parentRelation'
    });
    AdmissionNotification.belongsTo(user_model_1.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
    AdmissionNotification.belongsTo(user_model_1.User, {
        foreignKey: 'updatedBy',
        as: 'updater'
    });
    AdmissionNotification.belongsTo(message_template_model_1.MessageTemplate, {
        foreignKey: 'templateId',
        as: 'template'
    });
};
exports.initAdmissionNotificationAssociations = initAdmissionNotificationAssociations;
