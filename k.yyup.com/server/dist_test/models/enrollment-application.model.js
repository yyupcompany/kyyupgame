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
exports.initEnrollmentApplicationAssociations = exports.initEnrollmentApplication = exports.EnrollmentApplication = exports.ApplicationStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var student_model_1 = require("./student.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var enrollment_application_material_model_1 = require("./enrollment-application-material.model");
var admission_result_model_1 = require("./admission-result.model");
/**
 * 报名申请状态
 */
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus[ApplicationStatus["PENDING"] = 0] = "PENDING";
    ApplicationStatus[ApplicationStatus["APPROVED"] = 1] = "APPROVED";
    ApplicationStatus[ApplicationStatus["REJECTED"] = 2] = "REJECTED";
})(ApplicationStatus = exports.ApplicationStatus || (exports.ApplicationStatus = {}));
var EnrollmentApplication = /** @class */ (function (_super) {
    __extends(EnrollmentApplication, _super);
    function EnrollmentApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EnrollmentApplication;
}(sequelize_1.Model));
exports.EnrollmentApplication = EnrollmentApplication;
var initEnrollmentApplication = function (sequelize) {
    EnrollmentApplication.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'plan_id',
            comment: '招生计划ID'
        },
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'parent_id',
            comment: '家长ID'
        },
        studentName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            field: 'student_name',
            comment: '学生姓名'
        },
        gender: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: false,
            comment: '性别'
        },
        birthDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            field: 'birth_date',
            comment: '出生日期'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ApplicationStatus.PENDING,
            comment: '状态：0-待审核，1-已通过，2-已拒绝'
        },
        applyDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'apply_date',
            comment: '申请日期'
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            field: 'contact_phone',
            comment: '联系电话'
        },
        applicationSource: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'application_source',
            comment: '申请来源'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'created_by',
            comment: '创建人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize: sequelize,
        tableName: 'enrollment_applications',
        timestamps: true,
        underscored: true
    });
    return EnrollmentApplication;
};
exports.initEnrollmentApplication = initEnrollmentApplication;
var initEnrollmentApplicationAssociations = function () {
    EnrollmentApplication.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    EnrollmentApplication.belongsTo(user_model_1.User, {
        foreignKey: 'reviewerId',
        as: 'reviewer'
    });
    EnrollmentApplication.belongsTo(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'planId',
        as: 'plan'
    });
    EnrollmentApplication.belongsTo(student_model_1.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });
    EnrollmentApplication.belongsTo(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'parentId',
        as: 'parent'
    });
    EnrollmentApplication.hasMany(enrollment_application_material_model_1.EnrollmentApplicationMaterial, {
        foreignKey: 'applicationId',
        as: 'materials'
    });
    EnrollmentApplication.hasOne(admission_result_model_1.AdmissionResult, {
        foreignKey: 'applicationId',
        as: 'admissionResult'
    });
};
exports.initEnrollmentApplicationAssociations = initEnrollmentApplicationAssociations;
