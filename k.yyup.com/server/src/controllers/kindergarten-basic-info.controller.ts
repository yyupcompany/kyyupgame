import { Request, Response } from 'express';
import { Kindergarten } from '../models/index';
import { getSequelize } from '../config/database';
import multer from 'multer';
import { tenantOSS } from '../services/tenant-oss-router.service';

/**
 * 配置文件上传 - 使用内存存储上传到OSS
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

/**
 * 幼儿园基本资料控制器
 */
export class KindergartenBasicInfoController {
  
  /**
   * 获取幼儿园基本资料
   */
  static async getBasicInfo(req: Request, res: Response) {
    try {
      // 使用Kindergarten模型查询，只查询数据库中存在的字段
      const kindergarten = await Kindergarten.findOne({
        where: {
          status: 1
        },
        attributes: [
          'id', 'name', 'code', 'type', 'level', 'address',
          'longitude', 'latitude', 'phone', 'email', 'principal',
          'establishedDate', 'area', 'buildingArea', 'classCount',
          'teacherCount', 'studentCount', 'description', 'features',
          'philosophy', 'feeDescription', 'status', 'logoUrl',
          'coverImages', 'contactPerson', 'consultationPhone'
        ],
        raw: true
      }) as any;

      if (!kindergarten) {
        // 如果没有数据，返回空对象而不是404
        return res.json({
          success: true,
          data: {
            id: null,
            name: '',
            description: '',
            studentCount: 0,
            teacherCount: 0,
            classCount: 0,
            logoUrl: '',
            coverImages: [],
            contactPerson: '',
            consultationPhone: '',
            address: '',
            phone: '',
            email: '',
            principal: '',
            establishedDate: null,
            area: 0,
            buildingArea: 0,
            features: '',
            philosophy: '',
            feeDescription: ''
          },
          message: '暂无幼儿园信息'
        });
      }

      // 处理coverImages字段（JSON字符串转数组）
      let coverImages = [];
      if (kindergarten.coverImages) {
        try {
          coverImages = JSON.parse(kindergarten.coverImages);
        } catch (e) {
          coverImages = [];
        }
      }

      const basicInfo = {
        id: kindergarten.id,
        // 1. 园区介绍
        name: kindergarten.name,
        description: kindergarten.description || '',

        // 2. 幼儿园规模（人数）
        studentCount: kindergarten.studentCount || 0,
        teacherCount: kindergarten.teacherCount || 0,
        classCount: kindergarten.classCount || 0,

        // 3. 园区配图
        logoUrl: kindergarten.logoUrl || '',
        coverImages: coverImages,

        // 4. 联系人
        contactPerson: kindergarten.contactPerson || kindergarten.principal || '',

        // 5. 咨询电话
        consultationPhone: kindergarten.consultationPhone || kindergarten.phone || '',

        // 6. 园区地址
        address: kindergarten.address || '',

        // 其他基础信息
        phone: kindergarten.phone || '',
        email: kindergarten.email || '',
        principal: kindergarten.principal || '',
        establishedDate: kindergarten.establishedDate,
        area: kindergarten.area || 0,
        buildingArea: kindergarten.buildingArea || 0,
        features: kindergarten.features || '',
        philosophy: kindergarten.philosophy || '',
        feeDescription: kindergarten.feeDescription || ''
      };

      res.json({
        success: true,
        data: basicInfo
      });

    } catch (error) {
      console.error('获取幼儿园基本资料失败:', error);
      res.status(500).json({
        success: false,
        message: '获取基本资料失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 更新幼儿园基本资料
   */
  static async updateBasicInfo(req: Request, res: Response) {
    try {
      const {
        // 1. 园区介绍
        name,
        description,

        // 2. 幼儿园规模（人数）
        studentCount,
        teacherCount,
        classCount,

        // 3. 园区配图
        logoUrl,
        coverImages,

        // 4. 联系人
        contactPerson,

        // 5. 咨询电话
        consultationPhone,

        // 6. 园区地址
        address,

        // 其他字段
        phone,
        email,
        principal,
        establishedDate,
        area,
        buildingArea,
        features,
        philosophy,
        feeDescription
      } = req.body;

      // 获取第一个幼儿园
      const kindergarten = await Kindergarten.findOne({
        where: {
          status: 1
        }
      });

      if (!kindergarten) {
        return res.status(404).json({
          success: false,
          message: '未找到幼儿园信息'
        });
      }

      // 处理coverImages（数组转JSON字符串）
      let coverImagesJson = null;
      if (coverImages && Array.isArray(coverImages)) {
        coverImagesJson = JSON.stringify(coverImages);
      }

      // 更新数据
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (studentCount !== undefined) updateData.studentCount = studentCount;
      if (teacherCount !== undefined) updateData.teacherCount = teacherCount;
      if (classCount !== undefined) updateData.classCount = classCount;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (coverImagesJson !== null) updateData.coverImages = coverImagesJson;
      if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
      if (consultationPhone !== undefined) updateData.consultationPhone = consultationPhone;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (principal !== undefined) updateData.principal = principal;
      if (establishedDate !== undefined) updateData.establishedDate = establishedDate;
      if (area !== undefined) updateData.area = area;
      if (buildingArea !== undefined) updateData.buildingArea = buildingArea;
      if (features !== undefined) updateData.features = features;
      if (philosophy !== undefined) updateData.philosophy = philosophy;
      if (feeDescription !== undefined) updateData.feeDescription = feeDescription;

      // 添加更新时间
      updateData.updatedAt = new Date();

      await kindergarten.update(updateData);

      res.json({
        success: true,
        message: '基本资料更新成功',
        data: {
          id: kindergarten.id,
          ...updateData
        }
      });

    } catch (error) {
      console.error('更新幼儿园基本资料失败:', error);
      res.status(500).json({
        success: false,
        message: '更新基本资料失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 上传单张图片（logo）
   */
  static uploadSingle = upload.single('image');

  static async uploadImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
      }

      // 上传到广东OSS的logos目录
      const result = await tenantOSS.uploadFile(req, file.buffer, {
        filename: file.originalname,
        directory: 'logos',
        contentType: file.mimetype
      });

      res.json({
        success: true,
        message: 'Logo上传成功到OSS',
        data: {
          url: result.url,
          filename: result.filename,
          originalName: file.originalname,
          size: result.size,
          ossPath: result.ossPath,
          bucket: result.bucket,
          region: result.region
        }
      });

    } catch (error) {
      console.error('Logo OSS上传失败:', error);
      res.status(500).json({
        success: false,
        message: 'Logo上传失败',
        error: (error as Error).message
      });
    }
  }

  /**
   * 上传多张图片（园区配图）
   */
  static uploadMultiple = upload.array('images', 10); // 最多10张图片

  static async uploadImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
      }

      // 批量上传到广东OSS
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await tenantOSS.uploadFile(req, file.buffer, {
            filename: file.originalname,
            directory: 'logos',
            contentType: file.mimetype
          });

          return {
            success: true,
            url: result.url,
            filename: result.filename,
            originalName: file.originalname,
            size: result.size,
            ossPath: result.ossPath,
            bucket: result.bucket,
            region: result.region
          };
        } catch (error) {
          console.error(`文件 ${file.originalname} 上传失败:`, error);
          return {
            success: false,
            originalName: file.originalname,
            error: (error as Error).message
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      // 统计成功和失败的数量
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      res.json({
        success: successCount > 0,
        message: `批量上传完成：成功${successCount}张，失败${failedCount}张`,
        data: {
          uploaded: results.filter(r => r.success),
          failed: results.filter(r => !r.success),
          totalCount: files.length,
          successCount,
          failedCount
        }
      });

    } catch (error) {
      console.error('批量图片OSS上传失败:', error);
      res.status(500).json({
        success: false,
        message: '批量图片上传失败',
        error: (error as Error).message
      });
    }
  }
}
