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
exports.CustomerFollowRecordEnhanced = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var customer_follow_media_model_1 = require("./customer-follow-media.model");
var CustomerFollowRecordEnhanced = /** @class */ (function (_super) {
    __extends(CustomerFollowRecordEnhanced, _super);
    function CustomerFollowRecordEnhanced() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 获取阶段名称
    CustomerFollowRecordEnhanced.prototype.getStageDisplayName = function () {
        var stageNames = {
            1: '初期接触',
            2: '需求挖掘',
            3: '方案展示',
            4: '实地体验',
            5: '异议处理',
            6: '促成决策',
            7: '缴费确认',
            8: '入园准备'
        };
        return stageNames[this.stage] || '未知阶段';
    };
    // 检查是否需要AI建议
    CustomerFollowRecordEnhanced.prototype.needsAISuggestion = function () {
        return !this.aiSuggestions ||
            (this.aiSuggestions && new Date().getTime() - new Date(this.updatedAt).getTime() > 24 * 60 * 60 * 1000);
    };
    CustomerFollowRecordEnhanced.initModel = function (sequelize) {
        CustomerFollowRecordEnhanced.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '跟进记录ID'
            },
            customerId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'customer_id',
                comment: '客户ID'
            },
            teacherId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'teacher_id',
                comment: '教师ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            stage: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '跟进阶段 (1-8)',
                validate: {
                    min: 1,
                    max: 8
                }
            },
            subStage: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'sub_stage',
                comment: '子阶段标识'
            },
            followType: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'follow_type',
                comment: '跟进方式'
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '跟进内容'
            },
            customerFeedback: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'customer_feedback',
                comment: '客户反馈'
            },
            aiSuggestions: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'ai_suggestions',
                comment: 'AI建议内容 JSON格式'
            },
            stageStatus: {
                type: sequelize_1.DataTypes.ENUM('pending', 'in_progress', 'completed', 'skipped'),
                allowNull: false,
                defaultValue: 'pending',
                field: 'stage_status',
                comment: '阶段状态'
            },
            mediaFiles: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'media_files',
                comment: '媒体文件引用 JSON格式'
            },
            nextFollowDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'next_follow_date',
                comment: '下次跟进时间'
            },
            completedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'completed_at',
                comment: '完成时间'
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
            tableName: 'customer_follow_records_enhanced',
            timestamps: true,
            underscored: true,
            comment: '增强版客户跟进记录表'
        });
    };
    CustomerFollowRecordEnhanced.initAssociations = function () {
        CustomerFollowRecordEnhanced.belongsTo(user_model_1.User, {
            foreignKey: 'teacherId',
            as: 'teacher'
        });
        CustomerFollowRecordEnhanced.hasMany(customer_follow_media_model_1.CustomerFollowMedia, {
            sourceKey: 'id',
            foreignKey: 'followRecordId',
            as: 'media'
        });
    };
    return CustomerFollowRecordEnhanced;
}(sequelize_1.Model));
exports.CustomerFollowRecordEnhanced = CustomerFollowRecordEnhanced;
exports["default"] = CustomerFollowRecordEnhanced;
