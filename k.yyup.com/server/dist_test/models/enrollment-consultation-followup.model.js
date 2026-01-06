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
exports.EnrollmentConsultationFollowup = void 0;
var sequelize_1 = require("sequelize");
var EnrollmentConsultationFollowup = /** @class */ (function (_super) {
    __extends(EnrollmentConsultationFollowup, _super);
    function EnrollmentConsultationFollowup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnrollmentConsultationFollowup.initModel = function (sequelize) {
        EnrollmentConsultationFollowup.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '跟进记录ID'
            },
            consultationId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'consultation_id',
                comment: '咨询记录ID',
                references: {
                    model: 'enrollment_consultations',
                    key: 'id'
                }
            },
            followupUserId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'followup_user_id',
                comment: '跟进人ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            followupMethod: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'followup_method',
                comment: '跟进方式 - 1:电话 2:微信 3:短信 4:面谈 5:邮件 6:其他'
            },
            followupContent: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                field: 'followup_content',
                comment: '跟进内容'
            },
            followupDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'followup_date',
                comment: '跟进日期'
            },
            intentionLevel: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'intention_level',
                comment: '意向级别 - 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向'
            },
            followupResult: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                field: 'followup_result',
                comment: '跟进结果 - 1:继续跟进 2:成功转化 3:暂无意向 4:放弃跟进'
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
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'enrollment_consultation_followups',
            timestamps: true,
            underscored: true
        });
    };
    EnrollmentConsultationFollowup.initAssociations = function () {
        this.belongsTo(this.sequelize.models.EnrollmentConsultation, {
            foreignKey: 'consultationId',
            as: 'consultation'
        });
        this.belongsTo(this.sequelize.models.User, {
            foreignKey: 'followupUserId',
            as: 'followupUser'
        });
    };
    return EnrollmentConsultationFollowup;
}(sequelize_1.Model));
exports.EnrollmentConsultationFollowup = EnrollmentConsultationFollowup;
exports["default"] = EnrollmentConsultationFollowup;
