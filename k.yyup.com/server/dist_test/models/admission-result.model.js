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
exports.initAdmissionResultAssociations = exports.initAdmissionResult = exports.AdmissionResult = exports.PaymentStatus = exports.ResultType = exports.AdmissionType = exports.AdmissionStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var enrollment_application_model_1 = require("./enrollment-application.model");
var student_model_1 = require("./student.model");
var kindergarten_model_1 = require("./kindergarten.model");
var class_model_1 = require("./class.model");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var AdmissionStatus;
(function (AdmissionStatus) {
    AdmissionStatus["PENDING"] = "pending";
    AdmissionStatus["ADMITTED"] = "admitted";
    AdmissionStatus["REJECTED"] = "rejected";
    AdmissionStatus["WAITLISTED"] = "waitlisted";
    AdmissionStatus["CONFIRMED"] = "confirmed";
    AdmissionStatus["CANCELED"] = "canceled";
})(AdmissionStatus = exports.AdmissionStatus || (exports.AdmissionStatus = {}));
var AdmissionType;
(function (AdmissionType) {
    AdmissionType["REGULAR"] = "regular";
    AdmissionType["SPECIAL"] = "special";
    AdmissionType["PRIORITY"] = "priority";
    AdmissionType["TRANSFER"] = "transfer";
})(AdmissionType = exports.AdmissionType || (exports.AdmissionType = {}));
var ResultType;
(function (ResultType) {
    ResultType[ResultType["ADMITTED"] = 1] = "ADMITTED";
    ResultType[ResultType["WAITLISTED"] = 2] = "WAITLISTED";
    ResultType[ResultType["REJECTED"] = 3] = "REJECTED";
})(ResultType = exports.ResultType || (exports.ResultType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus[PaymentStatus["UNPAID"] = 0] = "UNPAID";
    PaymentStatus[PaymentStatus["PARTIAL"] = 1] = "PARTIAL";
    PaymentStatus[PaymentStatus["PAID"] = 2] = "PAID";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
var AdmissionResult = /** @class */ (function (_super) {
    __extends(AdmissionResult, _super);
    function AdmissionResult() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AdmissionResult;
}(sequelize_1.Model));
exports.AdmissionResult = AdmissionResult;
var initAdmissionResult = function (sequelize) {
    AdmissionResult.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        applicationId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '申请ID - 外键关联申请表',
            references: { model: 'enrollment_applications', key: 'id' }
        },
        studentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '学生ID - 外键关联学生表',
            references: { model: 'students', key: 'id' }
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID - 外键关联幼儿园表',
            references: { model: 'kindergartens', key: 'id' }
        },
        parentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '家长ID',
            references: { model: 'parent_student_relations', key: 'id' }
        },
        planId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '招生计划ID',
            references: { model: 'enrollment_plans', key: 'id' }
        },
        classId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '班级ID - 外键关联班级表',
            references: { model: 'classes', key: 'id' }
        },
        resultType: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '结果类型 - 1:录取 2:等待 3:拒绝'
        },
        type: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: AdmissionType.REGULAR,
            comment: '录取类型 - regular:常规录取 special:特殊录取 priority:优先录取 transfer:转学录取'
        },
        status: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: AdmissionStatus.PENDING,
            comment: '录取状态 - pending:待录取 admitted:已录取 rejected:已拒绝 waitlisted:候补 confirmed:已确认入学 canceled:已取消'
        },
        admissionDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '录取日期'
        },
        confirmationDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '确认日期'
        },
        notificationDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '通知日期'
        },
        notificationMethod: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '通知方式'
        },
        tuitionFee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '学费'
        },
        tuitionStatus: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '学费状态 - 0:未缴费 1:部分缴费 2:已缴费'
        },
        comments: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注信息'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建人ID',
            references: { model: 'users', key: 'id' }
        },
        updatedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '更新人ID',
            references: { model: 'users', key: 'id' }
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'admission_results',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return AdmissionResult;
};
exports.initAdmissionResult = initAdmissionResult;
var initAdmissionResultAssociations = function () {
    AdmissionResult.belongsTo(enrollment_application_model_1.EnrollmentApplication, { foreignKey: 'applicationId', as: 'application' });
    AdmissionResult.belongsTo(student_model_1.Student, { foreignKey: 'studentId', as: 'student' });
    AdmissionResult.belongsTo(kindergarten_model_1.Kindergarten, { foreignKey: 'kindergartenId', as: 'kindergarten' });
    AdmissionResult.belongsTo(class_model_1.Class, { foreignKey: 'classId', as: 'class' });
    AdmissionResult.belongsTo(user_model_1.User, { foreignKey: 'createdBy', as: 'creator' });
    AdmissionResult.belongsTo(user_model_1.User, { foreignKey: 'updatedBy', as: 'updater' });
    AdmissionResult.belongsTo(enrollment_plan_model_1.EnrollmentPlan, { foreignKey: 'planId', as: 'plan' });
    AdmissionResult.belongsTo(parent_student_relation_model_1.ParentStudentRelation, { foreignKey: 'parentId', as: 'parent' });
};
exports.initAdmissionResultAssociations = initAdmissionResultAssociations;
