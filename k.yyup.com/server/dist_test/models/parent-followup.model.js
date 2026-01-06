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
exports.ParentFollowup = void 0;
var sequelize_1 = require("sequelize");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var user_model_1 = require("./user.model");
var ParentFollowup = /** @class */ (function (_super) {
    __extends(ParentFollowup, _super);
    function ParentFollowup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParentFollowup.prototype.needsFollowup = function () {
        if (!this.nextFollowupDate) {
            return false;
        }
        return new Date(this.nextFollowupDate) > new Date();
    };
    ParentFollowup.prototype.daysUntilNextFollowup = function () {
        if (!this.nextFollowupDate) {
            return null;
        }
        var diffTime = new Date(this.nextFollowupDate).getTime() - new Date().getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : null;
    };
    ParentFollowup.initModel = function (sequelize) {
        ParentFollowup.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '跟进记录ID - 主键'
            },
            parentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'parent_id',
                comment: '家长ID - 关联家长学生关系表',
                references: {
                    model: 'parent_student_relations',
                    key: 'id'
                }
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '跟进内容'
            },
            followupDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
                field: 'followup_date',
                comment: '跟进日期'
            },
            followupType: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'followup_type',
                comment: '跟进类型 - 如：电话联系、家访、会议等'
            },
            result: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '跟进结果'
            },
            nextFollowupDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: true,
                field: 'next_followup_date',
                comment: '下次跟进日期'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'created_by',
                comment: '创建人ID - 外键关联用户表',
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
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'deleted_at',
                comment: '删除时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'parent_followups',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    ParentFollowup.initAssociations = function () {
        ParentFollowup.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
            foreignKey: 'parentId',
            as: 'parent',
            onDelete: 'CASCADE'
        });
        ParentFollowup.belongsTo(user_model_1.User, {
            foreignKey: 'createdBy',
            as: 'creator'
        });
    };
    return ParentFollowup;
}(sequelize_1.Model));
exports.ParentFollowup = ParentFollowup;
exports["default"] = ParentFollowup;
