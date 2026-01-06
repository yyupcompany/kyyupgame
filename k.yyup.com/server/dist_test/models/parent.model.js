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
exports.Parent = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var Parent = /** @class */ (function (_super) {
    __extends(Parent, _super);
    function Parent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Parent.initModel = function (sequelize) {
        Parent.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                comment: '关联的用户ID'
            },
            studentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'students',
                    key: 'id'
                },
                comment: '关联的学生ID'
            },
            relationship: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                comment: '与学生的关系'
            },
            isPrimaryContact: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                comment: '是否为主要联系人'
            },
            isLegalGuardian: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 0,
                comment: '是否为法定监护人'
            },
            idCardNo: {
                type: sequelize_1.DataTypes.STRING(18),
                allowNull: true,
                comment: '身份证号'
            },
            workUnit: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                comment: '工作单位'
            },
            occupation: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                comment: '职业'
            },
            education: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                comment: '学历'
            },
            address: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                comment: '家庭住址'
            },
            remark: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '备注'
            },
            creatorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '创建人ID'
            },
            updaterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '更新人ID'
            },
            // 🎯 新增教师权限相关字段
            assignedTeacherId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'assigned_teacher_id',
                comment: '分配的教师ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            isPublic: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_public',
                comment: '是否为公开客户（所有教师可见）'
            },
            followStatus: {
                type: sequelize_1.DataTypes.ENUM('待跟进', '跟进中', '已转化', '已放弃'),
                allowNull: false,
                defaultValue: '待跟进',
                field: 'follow_status',
                comment: '跟进状态'
            },
            priority: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3,
                comment: '客户优先级：1-高，2-中，3-低'
            },
            lastFollowupAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'last_followup_at',
                comment: '最后跟进时间'
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
            tableName: 'parents',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Parent.initAssociations = function () {
        Parent.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
        // 注释掉直接的belongsTo关联，使用多对多关系
        // Parent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    };
    return Parent;
}(sequelize_1.Model));
exports.Parent = Parent;
exports["default"] = Parent;
