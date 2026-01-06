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
exports.initMessageTemplateAssociations = exports.initMessageTemplate = exports.MessageTemplate = exports.TemplateStatus = exports.MessageType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * 消息类型
 */
var MessageType;
(function (MessageType) {
    MessageType["SMS"] = "sms";
    MessageType["EMAIL"] = "email";
    MessageType["WECHAT"] = "wechat";
    MessageType["PUSH"] = "push";
    MessageType["INTERNAL"] = "internal";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * 模板状态
 */
var TemplateStatus;
(function (TemplateStatus) {
    TemplateStatus["ACTIVE"] = "active";
    TemplateStatus["INACTIVE"] = "inactive";
    TemplateStatus["PENDING_REVIEW"] = "pending_review";
    TemplateStatus["REJECTED"] = "rejected";
})(TemplateStatus = exports.TemplateStatus || (exports.TemplateStatus = {}));
var MessageTemplate = /** @class */ (function (_super) {
    __extends(MessageTemplate, _super);
    function MessageTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MessageTemplate;
}(sequelize_1.Model));
exports.MessageTemplate = MessageTemplate;
var initMessageTemplate = function (sequelize) {
    MessageTemplate.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '模板ID'
        },
        templateCode: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '模板编码'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '模板名称'
        },
        messageType: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(MessageType)),
            allowNull: false,
            comment: '消息类型: sms, email, wechat, push, internal'
        },
        titleTemplate: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '标题模板'
        },
        contentTemplate: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '内容模板'
        },
        variables: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '变量(JSON)'
        },
        language: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'zh-CN',
            comment: '语言'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '描述'
        },
        category: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '分类'
        },
        providerTemplateId: {
            type: sequelize_1.DataTypes.STRING(64),
            allowNull: true,
            comment: '供应商模板ID'
        },
        provider: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '供应商'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(TemplateStatus)),
            allowNull: false,
            defaultValue: TemplateStatus.ACTIVE,
            comment: '状态: active, inactive, pending_review, rejected'
        },
        rejectionReason: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '拒绝原因'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '创建者ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '更新者ID'
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
        }
    }, {
        sequelize: sequelize,
        tableName: 'message_templates',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return MessageTemplate;
};
exports.initMessageTemplate = initMessageTemplate;
var initMessageTemplateAssociations = function () {
    MessageTemplate.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    MessageTemplate.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initMessageTemplateAssociations = initMessageTemplateAssociations;
