/**
 * 报名申请服务
 */
import { Transaction, Op } from 'sequelize';
import { sequelize } from '../../init';
import { EnrollmentApplication, ApplicationStatus } from '../../models/enrollment-application.model';
import { EnrollmentApplicationMaterial } from '../../models/enrollment-application-material.model';
import { FileStorage } from '../../models/file-storage.model';
import { Parent } from '../../models/parent.model';
import { User } from '../../models/user.model';
import { EnrollmentPlan } from '../../models/enrollment-plan.model';
import { ApiError } from '../../utils/apiError';

// 分页工具函数
const getPagination = (page: number, size: number) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data: any[], count: number, page: number, limit: number) => {
  const totalItems = count;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    data,
    totalPages,
    currentPage,
  };
};

/**
 * 报名申请服务类
 */
export class EnrollmentApplicationService {
  /**
   * 创建报名申请
   * @param applicationData 报名申请数据
   * @param userId 当前用户ID
   * @returns 创建的报名申请
   */
  async createApplication(applicationData: any, userId: number): Promise<EnrollmentApplication> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查家长是否存在
      const parent = await Parent.findByPk(applicationData.parentId);
      if (!parent) {
        throw new ApiError(404, '家长不存在');
      }
      
      // 检查招生计划是否存在
      const plan = await EnrollmentPlan.findByPk(applicationData.planId);
      if (!plan) {
        throw new ApiError(404, '招生计划不存在');
      }
      
      // 创建报名申请
      const application = await EnrollmentApplication.create({
        ...applicationData,
        status: ApplicationStatus.PENDING,
        applyDate: new Date(),
        createdBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return application;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取报名申请详情
   * @param id 报名申请ID
   * @returns 报名申请详情
   */
  async getApplicationById(id: number): Promise<EnrollmentApplication> {
    const application = await EnrollmentApplication.findByPk(id, {
      include: [
        {
          model: Parent,
          as: 'parent',
          attributes: ['id', 'name', 'phone', 'email'],
        },
        {
          model: EnrollmentPlan,
          as: 'plan',
          attributes: ['id', 'name', 'year', 'term', 'status'],
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'username', 'name'],
        },
        {
          model: EnrollmentApplicationMaterial,
          as: 'materials',
          include: [
            {
              model: FileStorage,
              as: 'file',
              attributes: ['id', 'filename', 'url', 'size', 'type'],
            },
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'username', 'name'],
            },
            {
              model: User,
              as: 'verifier',
              attributes: ['id', 'username', 'name'],
            },
          ],
        },
      ],
    });
    
    if (!application) {
      throw new ApiError(404, '报名申请不存在');
    }
    
    return application;
  }
  
  /**
   * 更新报名申请
   * @param id 报名申请ID
   * @param applicationData 报名申请数据
   * @param userId 当前用户ID
   * @returns 更新后的报名申请
   */
  async updateApplication(id: number, applicationData: any, userId: number): Promise<EnrollmentApplication> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查报名申请是否存在
      const application = await EnrollmentApplication.findByPk(id);
      if (!application) {
        throw new ApiError(404, '报名申请不存在');
      }
      
      // 如果更改了家长，检查家长是否存在
      if (applicationData.parentId && applicationData.parentId !== application.parentId) {
        const parent = await Parent.findByPk(applicationData.parentId);
        if (!parent) {
          throw new ApiError(404, '家长不存在');
        }
      }
      
      // 如果更改了招生计划，检查招生计划是否存在
      if (applicationData.planId && applicationData.planId !== application.planId) {
        const plan = await EnrollmentPlan.findByPk(applicationData.planId);
        if (!plan) {
          throw new ApiError(404, '招生计划不存在');
        }
      }
      
      // 更新报名申请
      await application.update({
        ...applicationData,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getApplicationById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 删除报名申请
   * @param id 报名申请ID
   * @returns 是否删除成功
   */
  async deleteApplication(id: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查报名申请是否存在
      const application = await EnrollmentApplication.findByPk(id);
      if (!application) {
        throw new ApiError(404, '报名申请不存在');
      }
      
      // 删除报名申请材料
      await EnrollmentApplicationMaterial.destroy({
        where: { applicationId: id },
        transaction,
      });
      
      // 删除报名申请
      await application.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取报名申请列表
   * @param filters 过滤条件
   * @param page 页码
   * @param size 每页大小
   * @returns 报名申请列表
   */
  async getApplications(filters: any, page: number, size: number): Promise<any> {
    const { limit, offset } = getPagination(page, size);
    
    const condition: any = {};
    
    // 添加过滤条件
    if (filters.studentName) {
      condition.studentName = { [Op.like]: `%${filters.studentName}%` };
    }
    
    if (filters.status) {
      condition.status = filters.status;
    }
    
    if (filters.planId) {
      condition.planId = filters.planId;
    }
    
    if (filters.parentId) {
      condition.parentId = filters.parentId;
    }
    
    if (filters.applyDateStart && filters.applyDateEnd) {
      condition.applyDate = {
        [Op.between]: [filters.applyDateStart, filters.applyDateEnd],
      };
    } else if (filters.applyDateStart) {
      condition.applyDate = { [Op.gte]: filters.applyDateStart };
    } else if (filters.applyDateEnd) {
      condition.applyDate = { [Op.lte]: filters.applyDateEnd };
    }
    
    // 查询报名申请列表
    const { count, rows } = await EnrollmentApplication.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['applyDate', 'DESC']],
      include: [
        {
          model: Parent,
          as: 'parent',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: EnrollmentPlan,
          as: 'plan',
          attributes: ['id', 'name', 'year', 'term'],
        },
      ],
    });
    
    return getPagingData(rows, count, page, limit);
  }
  
  /**
   * 审核报名申请
   * @param id 报名申请ID
   * @param reviewData 审核数据
   * @param userId 当前用户ID
   * @returns 审核后的报名申请
   */
  async reviewApplication(id: number, reviewData: any, userId: number): Promise<EnrollmentApplication> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查报名申请是否存在
      const application = await EnrollmentApplication.findByPk(id);
      if (!application) {
        throw new ApiError(404, '报名申请不存在');
      }
      
      // 检查当前状态是否可以审核
      if (application.status !== ApplicationStatus.PENDING && application.status !== ApplicationStatus.REVIEWING) {
        throw new ApiError(400, `当前状态(${application.status})不允许审核`);
      }
      
      // 更新报名申请状态
      await application.update({
        status: reviewData.status,
        reviewDate: new Date(),
        reviewerId: userId,
        reviewComments: reviewData.comments,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return this.getApplicationById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 添加报名申请材料
   * @param applicationId 报名申请ID
   * @param materialData 材料数据
   * @param userId 当前用户ID
   * @returns 添加的材料
   */
  async addApplicationMaterial(applicationId: number, materialData: any, userId: number): Promise<EnrollmentApplicationMaterial> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查报名申请是否存在
      const application = await EnrollmentApplication.findByPk(applicationId);
      if (!application) {
        throw new ApiError(404, '报名申请不存在');
      }
      
      // 检查文件是否存在
      const file = await FileStorage.findByPk(materialData.fileId);
      if (!file) {
        throw new ApiError(404, '文件不存在');
      }
      
      // 创建报名申请材料
      const material = await EnrollmentApplicationMaterial.create({
        applicationId,
        materialType: materialData.materialType,
        materialName: materialData.materialName,
        fileId: materialData.fileId,
        uploadDate: new Date(),
        uploaderId: userId,
        status: 'pending',
        createdBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return material;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 验证报名申请材料
   * @param materialId 材料ID
   * @param verifyData 验证数据
   * @param userId 当前用户ID
   * @returns 验证后的材料
   */
  async verifyMaterial(materialId: number, verifyData: any, userId: number): Promise<EnrollmentApplicationMaterial> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查材料是否存在
      const material = await EnrollmentApplicationMaterial.findByPk(materialId);
      if (!material) {
        throw new ApiError(404, '材料不存在');
      }
      
      // 更新材料状态
      await material.update({
        status: verifyData.status,
        verifyDate: new Date(),
        verifierId: userId,
        verifyComments: verifyData.comments,
        updatedBy: userId,
      }, { transaction });
      
      await transaction.commit();
      
      return material;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 删除报名申请材料
   * @param materialId 材料ID
   * @returns 是否删除成功
   */
  async deleteMaterial(materialId: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查材料是否存在
      const material = await EnrollmentApplicationMaterial.findByPk(materialId);
      if (!material) {
        throw new ApiError(404, '材料不存在');
      }
      
      // 删除材料
      await material.destroy({ transaction });
      
      await transaction.commit();
      
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * 获取报名申请材料列表
   * @param applicationId 报名申请ID
   * @returns 材料列表
   */
  async getMaterials(applicationId: number): Promise<EnrollmentApplicationMaterial[]> {
    // 检查报名申请是否存在
    const application = await EnrollmentApplication.findByPk(applicationId);
    if (!application) {
      throw new ApiError(404, '报名申请不存在');
    }
    
    // 查询材料列表
    const materials = await EnrollmentApplicationMaterial.findAll({
      where: { applicationId },
      include: [
        {
          model: FileStorage,
          as: 'file',
          attributes: ['id', 'filename', 'url', 'size', 'type'],
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'name'],
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'name'],
        },
      ],
    });
    
    return materials;
  }
}

// 导出服务实例
export default new EnrollmentApplicationService(); 