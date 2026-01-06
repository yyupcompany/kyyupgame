import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
import { Kindergarten } from './kindergarten.model';
import { ParentStudentRelation } from './parent-student-relation.model';

/**
 * 优惠券类型
 */
export enum CouponType {
  NEW_STUDENT_REGISTRATION = 1, // 新生注册券
  EVENT_PARTICIPATION = 2, // 活动参与券
  REFERRAL_BONUS = 3, // 老生推荐券
  HOLIDAY_SPECIAL = 4, // 节日特惠券
  BIRTHDAY_COUPON = 5, // 生日优惠券
  GENERAL_COUPON = 6, // 通用优惠券
}

/**
 * 优惠方式
 */
export enum DiscountType {
  FIXED_AMOUNT = 1, // 固定金额
  PERCENTAGE = 2, // 百分比
}

/**
 * 优惠券状态
 */
export enum CouponStatus {
  DISABLED = 0, // 未启用
  ACTIVE = 1, // 已启用
  PAUSED = 2, // 已暂停
  ENDED = 3, // 已结束
}


export class Coupon extends Model<
  InferAttributes<Coupon>,
  InferCreationAttributes<Coupon>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  declare code: string;
  declare name: string;
  declare type: CouponType;
  declare discountType: DiscountType;
  declare discountValue: number;
  declare minAmount: CreationOptional<number>;
  declare maxDiscount: number | null;
  declare startDate: Date;
  declare endDate: Date;
  declare totalQuantity: number;
  declare usedQuantity: CreationOptional<number>;
  declare perUserLimit: CreationOptional<number>;
  declare applicableScope: string | null;
  declare description: string | null;
  declare rules: string | null;
  declare status: CreationOptional<CouponStatus>;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public readonly kindergarten?: Kindergarten;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly parentRelations?: ParentStudentRelation[];
}

export const initCoupon = (sequelize: Sequelize) => {
  Coupon.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '优惠券ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
        references: {
          model: 'kindergartens',
          key: 'id',
        },
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '优惠券代码',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '优惠券名称',
      },
      type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '优惠券类型 - 1:新生注册券 2:活动参与券 3:老生推荐券 4:节日特惠券 5:生日优惠券 6:通用优惠券',
      },
      discountType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '优惠方式 - 1:固定金额 2:百分比',
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '优惠值',
      },
      minAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: '最低使用金额',
      },
      maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '最大优惠金额',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '生效日期',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '失效日期',
      },
      totalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '总数量',
      },
      usedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已使用数量',
      },
      perUserLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '每人限领数量',
      },
      applicableScope: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '适用范围',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '优惠券描述',
      },
      rules: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '使用规则',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: CouponStatus.DISABLED,
        comment: '状态 - 0:未启用 1:已启用 2:已暂停 3:已结束',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'coupons',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Coupon;
};

export const initCouponAssociations = () => {
  Coupon.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
  Coupon.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  Coupon.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
