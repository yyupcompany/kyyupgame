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
exports.AIUsageLog = void 0;
var sequelize_1 = require("sequelize");
var AIUsageLog = /** @class */ (function (_super) {
    __extends(AIUsageLog, _super);
    function AIUsageLog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIUsageLog;
}(sequelize_1.Model));
exports.AIUsageLog = AIUsageLog;
exports["default"] = (function (sequelize) {
    AIUsageLog.init({
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
            }
        },
        modelId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ai_models',
                key: 'id'
            }
        },
        tokens: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '使用的token数量'
        }
    }, {
        sequelize: sequelize,
        modelName: 'ai_usage_logs',
        tableName: 'ai_usage_logs',
        timestamps: true,
        indexes: [
            {
                fields: ['userId', 'createdAt']
            },
            {
                fields: ['modelId']
            }
        ]
    });
    return AIUsageLog;
});
