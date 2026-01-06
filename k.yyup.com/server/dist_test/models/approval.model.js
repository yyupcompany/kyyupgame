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
exports.Approval = exports.ApprovalUrgency = exports.ApprovalStatus = exports.ApprovalType = void 0;
var sequelize_1 = require("sequelize");
var ApprovalType;
(function (ApprovalType) {
    ApprovalType["LEAVE"] = "LEAVE";
    ApprovalType["EXPENSE"] = "EXPENSE";
    ApprovalType["EVENT"] = "EVENT";
    ApprovalType["PURCHASE"] = "PURCHASE";
    ApprovalType["OTHER"] = "OTHER";
})(ApprovalType = exports.ApprovalType || (exports.ApprovalType = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["WITHDRAWN"] = "WITHDRAWN";
})(ApprovalStatus = exports.ApprovalStatus || (exports.ApprovalStatus = {}));
var ApprovalUrgency;
(function (ApprovalUrgency) {
    ApprovalUrgency["LOW"] = "LOW";
    ApprovalUrgency["MEDIUM"] = "MEDIUM";
    ApprovalUrgency["HIGH"] = "HIGH";
    ApprovalUrgency["URGENT"] = "URGENT";
})(ApprovalUrgency = exports.ApprovalUrgency || (exports.ApprovalUrgency = {}));
var Approval = /** @class */ (function (_super) {
    __extends(Approval, _super);
    function Approval() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Approval;
}(sequelize_1.Model));
exports.Approval = Approval;
exports["default"] = (function (sequelize) {
    Approval.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '审批标题'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '申请描述'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ApprovalType)),
            allowNull: false,
            comment: '审批类型'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ApprovalStatus)),
            allowNull: false,
            defaultValue: ApprovalStatus.PENDING,
            comment: '审批状态'
        },
        urgency: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ApprovalUrgency)),
            allowNull: false,
            defaultValue: ApprovalUrgency.MEDIUM,
            comment: '紧急程度'
        },
        requestAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '申请金额'
        },
        requestData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '申请数据'
        },
        attachments: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '附件列表'
        },
        requestedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: '申请人ID'
        },
        approvedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: '审批人ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'kindergartens',
                key: 'id'
            },
            comment: '幼儿园ID'
        },
        comment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '审批意见'
        },
        approvedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '审批时间'
        },
        requestedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '申请时间'
        },
        deadline: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '处理截止时间'
        },
        relatedType: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '关联对象类型'
        },
        relatedId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '关联对象ID'
        },
        workflow: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '审批流程数据'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '扩展数据'
        }
    }, {
        sequelize: sequelize,
        modelName: 'approvals',
        tableName: 'approvals',
        timestamps: true,
        indexes: [
            {
                fields: ['requestedBy']
            },
            {
                fields: ['approvedBy']
            },
            {
                fields: ['kindergartenId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['type']
            },
            {
                fields: ['urgency']
            },
            {
                fields: ['requestedAt']
            },
            {
                fields: ['deadline']
            },
            {
                fields: ['relatedType', 'relatedId']
            }
        ]
    });
    return Approval;
});
