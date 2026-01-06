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
exports.initAIUserRelationAssociations = exports.initAIUserRelation = exports.AIUserRelation = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * AI用户关联模型
 * 此模型用于将现有幼儿园系统的用户关联到AI系统
 */
var AIUserRelation = /** @class */ (function (_super) {
    __extends(AIUserRelation, _super);
    function AIUserRelation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIUserRelation;
}(sequelize_1.Model));
exports.AIUserRelation = AIUserRelation;
var initAIUserRelation = function (sequelize) {
    AIUserRelation.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        externalUserId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '外部系统用户ID',
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        aiSettings: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: 'AI系统特定设置',
            defaultValue: {}
        },
        lastActivity: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '最后活动时间',
            defaultValue: sequelize_1.DataTypes.NOW
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
        }
    }, {
        sequelize: sequelize,
        tableName: 'ai_user_relations',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'external_user_idx',
                fields: ['external_user_id']
            },
        ]
    });
    return AIUserRelation;
};
exports.initAIUserRelation = initAIUserRelation;
var initAIUserRelationAssociations = function () {
    AIUserRelation.belongsTo(user_model_1.User, {
        foreignKey: 'externalUserId',
        as: 'user'
    });
};
exports.initAIUserRelationAssociations = initAIUserRelationAssociations;
