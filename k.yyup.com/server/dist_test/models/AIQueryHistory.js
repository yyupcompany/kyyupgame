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
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var AIQueryHistory = /** @class */ (function (_super) {
    __extends(AIQueryHistory, _super);
    function AIQueryHistory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AIQueryHistory;
}(sequelize_1.Model));
AIQueryHistory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    queryText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '查询内容'
    },
    queryHash: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false,
        comment: '查询内容的MD5哈希值，用于快速匹配重复查询'
    },
    queryType: {
        type: sequelize_1.DataTypes.ENUM('data_query', 'ai_response'),
        allowNull: false,
        comment: '查询类型：数据查询或AI问答'
    },
    responseData: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '查询结果数据（JSON格式）'
    },
    responseText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'AI回答文本（用于非数据查询）'
    },
    generatedSQL: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '生成的SQL语句'
    },
    executionTime: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '执行时间（毫秒）'
    },
    modelUsed: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '使用的AI模型名称'
    },
    sessionId: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '会话ID'
    },
    cacheHit: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否命中缓存'
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
    tableName: 'ai_query_histories',
    sequelize: init_1.sequelize,
    paranoid: false,
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['queryHash']
        },
        {
            fields: ['userId', 'queryHash']
        },
        {
            fields: ['createdAt']
        },
        {
            fields: ['queryType']
        }
    ]
});
exports["default"] = AIQueryHistory;
