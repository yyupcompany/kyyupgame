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
exports.EnrollmentConsultation = void 0;
var sequelize_1 = require("sequelize");
var kindergarten_model_1 = require("./kindergarten.model");
var user_model_1 = require("./user.model");
var enrollment_consultation_followup_model_1 = require("./enrollment-consultation-followup.model");
var EnrollmentConsultation = /** @class */ (function (_super) {
    __extends(EnrollmentConsultation, _super);
    function EnrollmentConsultation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnrollmentConsultation.initModel = function (sequelize) {
        EnrollmentConsultation.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '咨询记录ID'
            },
            kindergartenId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'kindergarten_id',
                comment: '幼儿园ID',
                references: {
                    model: 'kindergartens',
                    key: 'id'
                }
            },
            consultantId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'consultant_id',
                comment: '咨询师ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            parentName: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'parent_name',
                comment: '家长姓名'
            },
            childName: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'child_name',
                comment: '孩子姓名'
            },
            childAge: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'child_age',
                comment: '孩子年龄(月)'
            },
            childGender: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'child_gender',
                comment: '孩子性别 - 1:男 2:女'
            },
            contactPhone: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                field: 'contact_phone',
                comment: '联系电话'
            },
            contactAddress: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                field: 'contact_address',
                comment: '联系地址'
            },
            sourceChannel: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'source_channel',
                comment: '来源渠道 - 1:线上广告 2:线下活动 3:朋友介绍 4:电话咨询 5:自主访问 6:其他'
            },
            sourceDetail: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                field: 'source_detail',
                comment: '来源详情'
            },
            consultContent: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                field: 'consult_content',
                comment: '咨询内容'
            },
            consultMethod: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'consult_method',
                comment: '咨询方式 - 1:电话 2:线下到访 3:线上咨询 4:微信 5:其他'
            },
            consultDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'consult_date',
                comment: '咨询日期'
            },
            intentionLevel: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'intention_level',
                comment: '意向级别 - 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向'
            },
            followupStatus: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                field: 'followup_status',
                comment: '跟进状态 - 1:待跟进 2:跟进中 3:已转化 4:已放弃'
            },
            nextFollowupDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'next_followup_date',
                comment: '下次跟进日期'
            },
            remark: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '备注'
            },
            creatorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'creator_id',
                comment: '创建人ID'
            },
            updaterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'updater_id',
                comment: '更新人ID'
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
                field: 'deleted_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'enrollment_consultations',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    EnrollmentConsultation.initAssociations = function () {
        this.belongsTo(kindergarten_model_1.Kindergarten, {
            foreignKey: 'kindergartenId',
            as: 'kindergarten'
        });
        this.belongsTo(user_model_1.User, {
            foreignKey: 'consultantId',
            as: 'consultant'
        });
        this.belongsTo(user_model_1.User, {
            foreignKey: 'creatorId',
            as: 'creator'
        });
        this.hasMany(enrollment_consultation_followup_model_1.EnrollmentConsultationFollowup, {
            sourceKey: 'id',
            foreignKey: 'consultationId',
            as: 'followups'
        });
    };
    return EnrollmentConsultation;
}(sequelize_1.Model));
exports.EnrollmentConsultation = EnrollmentConsultation;
exports["default"] = EnrollmentConsultation;
