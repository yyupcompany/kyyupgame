/**
 * 订单模型
 * 支持活动报名支付
 */

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface OrderAttributes {
  id: number;
  orderNo: string; // 订单号
  userId: number; // 用户ID
  activityId: number; // 活动ID
  registrationId?: number; // 报名ID
  groupBuyId?: number; // 团购ID
  collectActivityId?: number; // 积攒活动ID
  type: 'registration' | 'group_buy' | 'collect_reward'; // 订单类型
  originalAmount: number; // 原价
  discountAmount: number; // 折扣金额
  finalAmount: number; // 最终金额
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'; // 订单状态
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'offline'; // 支付方式
  paymentTime?: Date; // 支付时间
  refundAmount?: number; // 退款金额
  refundTime?: Date; // 退款时间
  refundReason?: string; // 退款原因
  remark?: string; // 备注
  offlinePaymentContact?: string; // 线下支付联系方式
  offlinePaymentLocation?: string; // 线下支付地点
  offlinePaymentDeadline?: Date; // 线下支付截止时间
  offlineConfirmStaffId?: number; // 线下确认员工ID
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'paymentTime' | 'refundAmount' | 'refundTime' | 'refundReason' | 'remark' | 'offlinePaymentContact' | 'offlinePaymentLocation' | 'offlinePaymentDeadline' | 'offlineConfirmStaffId' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public activityId!: number;
  public registrationId?: number;
  public groupBuyId?: number;
  public collectActivityId?: number;
  public type!: 'registration' | 'group_buy' | 'collect_reward';
  public originalAmount!: number;
  public discountAmount!: number;
  public finalAmount!: number;
  public status!: 'pending' | 'paid' | 'cancelled' | 'refunded';
  public paymentMethod!: 'wechat' | 'alipay' | 'bank' | 'offline';
  public paymentTime?: Date;
  public refundAmount?: number;
  public refundTime?: Date;
  public refundReason?: string;
  public remark?: string;
  public offlinePaymentContact?: string;
  public offlinePaymentLocation?: string;
  public offlinePaymentDeadline?: Date;
  public offlineConfirmStaffId?: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // 实例方法
  public isPaid(): boolean {
    return this.status === 'paid';
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public canCancel(): boolean {
    return this.status === 'pending';
  }

  public canRefund(): boolean {
    return this.status === 'paid' && !this.refundAmount;
  }

  public getSaveAmount(): number {
    return this.originalAmount - this.finalAmount;
  }

  public getPaymentDescription(): string {
    switch (this.type) {
      case 'registration':
        return '活动报名';
      case 'group_buy':
        return '团购参团';
      case 'collect_reward':
        return '积攒奖励';
      default:
        return '未知订单';
    }
  }

  public isOfflinePayment(): boolean {
    return this.paymentMethod === 'offline';
  }

  public isOfflinePaymentExpired(): boolean {
    if (!this.isOfflinePayment() || !this.offlinePaymentDeadline) {
      return false;
    }
    return new Date() > this.offlinePaymentDeadline;
  }

  public canConfirmOfflinePayment(): boolean {
    return this.isOfflinePayment() && this.status === 'pending' && !this.isOfflinePaymentExpired();
  }

  // 静态初始化方法
  public static initModel(sequelize: Sequelize): typeof Order {
    Order.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNo: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        comment: '订单号',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '用户ID',
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'activities',
          key: 'id',
        },
        comment: '活动ID',
      },
      registrationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'activity_registrations',
          key: 'id',
        },
        comment: '报名ID',
      },
      groupBuyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'group_buys',
          key: 'id',
        },
        comment: '团购ID',
      },
      collectActivityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'collect_activities',
          key: 'id',
        },
        comment: '积攒活动ID',
      },
      type: {
        type: DataTypes.ENUM('registration', 'group_buy', 'collect_reward'),
        allowNull: false,
        defaultValue: 'registration',
        comment: '订单类型',
      },
      originalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '原价',
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '折扣金额',
      },
      finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '最终金额',
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '订单状态',
      },
      paymentMethod: {
        type: DataTypes.ENUM('wechat', 'alipay', 'bank', 'offline'),
        allowNull: false,
        defaultValue: 'wechat',
        comment: '支付方式',
      },
      paymentTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '支付时间',
      },
      refundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '退款金额',
      },
      refundTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '退款时间',
      },
      refundReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '退款原因',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      offlinePaymentContact: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '线下支付联系方式',
      },
      offlinePaymentLocation: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '线下支付地点',
      },
      offlinePaymentDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '线下支付截止时间',
      },
      offlineConfirmStaffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '线下确认员工ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      indexes: [
        {
          fields: ['orderNo'],
          unique: true,
        },
        {
          fields: ['userId'],
        },
        {
          fields: ['activityId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['type'],
        },
        {
          fields: ['paymentMethod'],
        },
      ],
    });
    
    return Order;
  }
}

export default Order;