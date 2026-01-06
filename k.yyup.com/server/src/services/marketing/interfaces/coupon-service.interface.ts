import { FindOptions } from 'sequelize';
import { Coupon } from '../../../models/coupon.model';

/**
 * 优惠券统计信息接口
 */
export interface CouponStatistics {
  total: number;
  used: number;
  expired: number;
  active: number;
  redemptionRate: number;
}

/**
 * 优惠券服务接口
 * @description 定义优惠券管理的基础功能和业务逻辑
 */
export interface ICouponService {
  /**
   * 创建优惠券
   * @param data 优惠券创建数据
   * @returns 创建的优惠券实例
   */
  create(data: any): Promise<Coupon>;

  /**
   * 根据ID查找优惠券
   * @param id 优惠券ID
   * @returns 优惠券实例或null
   */
  findById(id: number): Promise<Coupon | null>;

  /**
   * 查询所有符合条件的优惠券
   * @param options 查询选项
   * @returns 优惠券数组
   */
  findAll(options?: FindOptions): Promise<Coupon[]>;

  /**
   * 更新优惠券信息
   * @param id 优惠券ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: Partial<any>): Promise<boolean>;

  /**
   * 删除优惠券
   * @param id 优惠券ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 发放优惠券给用户
   * @param couponId 优惠券ID
   * @param userId 用户ID
   * @returns 是否发放成功
   */
  issue(couponId: number, userId: number): Promise<boolean>;

  /**
   * 验证优惠券是否有效
   * @param couponCode 优惠券码
   * @param userId 用户ID
   * @returns 是否有效
   */
  verify(couponCode: string, userId: number): Promise<boolean>;

  /**
   * 使用优惠券
   * @param couponCode 优惠券码
   * @param userId 用户ID
   * @returns 是否使用成功
   */
  use(couponCode: string, userId: number): Promise<boolean>;

  /**
   * 获取优惠券统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  getStats(kindergartenId: number): Promise<CouponStatistics>;
} 