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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Notification = exports.NotificationStatus = exports.NotificationType = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "system";
    NotificationType["MESSAGE"] = "message";
    NotificationType["ACTIVITY"] = "activity";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["DRAFT"] = "draft";
    NotificationStatus["PUBLISHED"] = "published";
    NotificationStatus["CANCELLED"] = "cancelled";
    NotificationStatus["UNREAD"] = "unread";
    NotificationStatus["READ"] = "read";
    NotificationStatus["DELETED"] = "deleted";
})(NotificationStatus = exports.NotificationStatus || (exports.NotificationStatus = {}));
var Notification = /** @class */ (function (_super) {
    __extends(Notification, _super);
    function Notification() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Instance methods
    Notification.prototype.markAsRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = NotificationStatus.READ;
                        this.readAt = new Date();
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Notification.prototype.markAsDeleted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = NotificationStatus.DELETED;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Static methods
    Notification.initModel = function (sequelize) {
        Notification.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                comment: '通知标题'
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '通知内容'
            },
            type: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(NotificationType)),
                allowNull: false,
                defaultValue: NotificationType.SYSTEM,
                comment: '通知类型'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(NotificationStatus)),
                allowNull: false,
                defaultValue: NotificationStatus.UNREAD,
                comment: '通知状态'
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                comment: '接收用户ID'
            },
            sourceId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'source_id',
                comment: '关联的源数据ID'
            },
            sourceType: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'source_type',
                comment: '关联的源数据类型'
            },
            readAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'read_at',
                comment: '读取时间'
            },
            totalCount: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'total_count',
                allowNull: false,
                defaultValue: 0,
                comment: '通知总接收人数'
            },
            readCount: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'read_count',
                allowNull: false,
                defaultValue: 0,
                comment: '已读人数'
            },
            cancelledAt: {
                type: sequelize_1.DataTypes.DATE,
                field: 'cancelled_at',
                allowNull: true,
                comment: '取消时间'
            },
            cancelledBy: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'cancelled_by',
                allowNull: true,
                comment: '取消人ID'
            },
            cancelReason: {
                type: sequelize_1.DataTypes.STRING(255),
                field: 'cancel_reason',
                allowNull: true,
                comment: '取消原因'
            },
            sendAt: {
                type: sequelize_1.DataTypes.DATE,
                field: 'send_at',
                allowNull: true,
                comment: '发送时间'
            },
            senderId: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'sender_id',
                allowNull: true,
                comment: '发送人ID'
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
            tableName: 'notifications',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    Notification.initAssociations = function () {
        Notification.belongsTo(user_model_1.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        Notification.belongsTo(user_model_1.User, {
            foreignKey: 'sender_id',
            as: 'sender'
        });
        Notification.belongsTo(user_model_1.User, {
            foreignKey: 'cancelled_by',
            as: 'cancellingUser'
        });
    };
    return Notification;
}(sequelize_1.Model));
exports.Notification = Notification;
exports["default"] = Notification;
