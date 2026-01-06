import { Photo, PhotoStatus, PhotoVisibility } from '../models/photo.model';
import { PhotoStudent } from '../models/photo-student.model';
import { StudentFaceLibrary } from '../models/student-face-library.model';
import { Student } from '../models/student.model';
import { ossService } from './oss.service';
import { aliyunFaceService } from './aliyun-face.service';
import { Op } from 'sequelize';

/**
 * 照片服务
 * 支持多租户隔离的照片上传和管理
 */
export class PhotoService {
  /**
   * 上传照片（含压缩优化）- 支持租户隔离
   * @param file 文件Buffer
   * @param options 上传选项
   * @param tenantPhone 租户手机号（用于隔离存储）
   */
  async uploadPhoto(
    file: Buffer,
    options: {
      uploadUserId: number;
      kindergartenId?: number;
      classId?: number;
      activityType?: string;
      activityName?: string;
      shootDate?: string;
      description?: string;
      originalName?: string;
      category?: string;
      tags?: string[];
      caption?: string;
    },
    tenantPhone?: string
  ): Promise<Photo> {
    try {
      console.log('\n' + '='.repeat(80));
      console.log('📸 班级照片上传 - 开始处理');
      console.log('='.repeat(80));
      console.log(`文件名：${options.originalName}`);
      console.log(`文件大小：${(file.length / 1024).toFixed(2)} KB`);
      console.log(`上传人：${options.uploadUserId}`);
      console.log(`租户手机：${tenantPhone || '未指定（使用旧版路径）'}`);
      console.log(`活动类型：${options.activityType || '未指定'}`);
      console.log(`拍摄日期：${options.shootDate || '未指定'}`);

      // 1. 上传到OSS（如果已配置）
      let fileUrl: string;
      let thumbnailUrl: string | null = null;
      let fileSize: number;

      if (ossService.isAvailable()) {
        console.log('\n📤 步骤1/4：上传到阿里云OSS...');

        // 如果提供了租户手机号，使用租户隔离路径
        if (tenantPhone) {
          console.log(`   使用租户隔离路径: rent/${tenantPhone}/photos/...`);
          const uploadResult = await ossService.uploadTenantImage(file, tenantPhone, {
            filename: options.originalName,
            fileType: 'photos',
            subPath: new Date().toISOString().slice(0, 7), // photos/{yyyy-MM}/
            maxWidth: 1920,
            quality: 80,
            generateThumbnail: true,
          });

          fileUrl = uploadResult.url;
          thumbnailUrl = uploadResult.thumbnailUrl || null;
          fileSize = uploadResult.size;
        } else {
          // 向后兼容：使用旧版非隔离路径
          console.warn('⚠️ 未提供租户手机号，使用旧版非隔离路径');
          const uploadResult = await ossService.uploadImage(file, {
            filename: options.originalName,
            directory: `photos/${new Date().toISOString().slice(0, 7)}`, // photos/2025-11/
            maxWidth: 1920,
            quality: 80,
            generateThumbnail: true,
          });

          fileUrl = uploadResult.url;
          thumbnailUrl = uploadResult.thumbnailUrl || null;
          fileSize = uploadResult.size;
        }

        console.log(`✅ OSS上传成功:`);
        console.log(`   原图: ${fileUrl.substring(0, 80)}...`);
        console.log(`   缩略图: ${thumbnailUrl?.substring(0, 80)}...`);
      } else {
        // 降级到本地存储（开发环境）
        console.warn('⚠️ OSS未配置，使用本地存储');
        fileUrl = `/api/oss-proxy/photos/${options.originalName}`;
        thumbnailUrl = `/api/oss-proxy/photos/thumb_${options.originalName}`;
        fileSize = file.length;
      }

      // 2. 创建数据库记录
      console.log('\n💾 步骤2/4：保存到数据库...');
      const photo = await Photo.create({
        fileUrl,
        thumbnailUrl,
        originalName: options.originalName || null,
        fileSize,
        uploadUserId: options.uploadUserId,
        kindergartenId: options.kindergartenId || null,
        classId: options.classId || null,
        activityType: options.activityType || null,
        activityName: options.activityName || null,
        shootDate: options.shootDate ? new Date(options.shootDate) : null,
        description: options.description || null,
        category: options.category || null,
        tags: options.tags || null,
        caption: options.caption || null,
        status: PhotoStatus.PENDING,
        visibility: PhotoVisibility.CLASS,
      });

      console.log(`✅ 照片记录已创建（ID: ${photo.id}）`);

      // 3. 异步触发AI识别（如果阿里云AI已配置）
      console.log('\n🤖 步骤3/4：准备触发AI人脸识别...');
      if (aliyunFaceService.isAvailable()) {
        console.log(`✅ 阿里云人脸识别已配置，启动异步识别任务...`);
        this.triggerFaceRecognition(photo.id, fileUrl).catch((err) =>
          console.error('❌ AI识别失败:', err)
        );
      } else {
        console.warn('⚠️  阿里云人脸识别未配置，跳过AI识别');
      }

      console.log('\n' + '='.repeat(80));
      console.log('✅ 班级照片上传 - 处理完成');
      console.log('='.repeat(80));
      console.log(`照片ID：${photo.id}`);
      console.log(`文件URL：${fileUrl.substring(0, 60)}...`);
      console.log(`AI识别：${aliyunFaceService.isAvailable() ? '已启动（异步）' : '未启用'}`);
      console.log('='.repeat(80) + '\n');

      return photo;
    } catch (error) {
      console.error('\n' + '='.repeat(80));
      console.error('❌ 班级照片上传 - 处理失败');
      console.error('='.repeat(80));
      console.error('错误:', (error as Error).message);
      console.error('='.repeat(80) + '\n');
      throw new Error(`上传照片失败: ${(error as Error).message}`);
    }
  }

  /**
   * 触发人脸识别（异步）
   */
  private async triggerFaceRecognition(
    photoId: number,
    imageUrl: string
  ): Promise<void> {
    try {
      console.log('\n' + '-'.repeat(80));
      console.log(`🤖 AI人脸识别 - 照片${photoId}`);
      console.log('-'.repeat(80));
      console.log(`图片URL: ${imageUrl.substring(0, 80)}...`);

      // 生成HTTPS签名URL用于AI识别（私有bucket需要签名）
      const ossPath = imageUrl.split('.aliyuncs.com/')[1];
      const signedUrl = ossService.getTemporaryUrl(ossPath, 60);
      console.log(`✅ 生成HTTPS签名URL用于AI识别...`);

      console.log(`🔍 调用阿里云FaceBody SearchFace...`);
      const result = await aliyunFaceService.searchFacesInPhoto(signedUrl);

      console.log(`✅ 人脸搜索完成：检测到${result.length}张脸`);

      // 更新photo表的face_count
      await Photo.update(
        {
          faceCount: result.length,
          aiProcessed: true,
        },
        { where: { id: photoId } }
      );

      console.log(`💾 已更新照片${photoId}的人脸计数：${result.length}`);

      // 自动标记置信度>0.85的人脸
      let autoTagged = 0;
      let lowConfidence = 0;

      for (let i = 0; i < result.length; i++) {
        const face = result[i];
        
        if (face.candidates.length > 0) {
          const topCandidate = face.candidates[0];
          const confidencePercent = (topCandidate.confidence * 100).toFixed(1);
          
          if (topCandidate.confidence > 0.85) {
            await PhotoStudent.create({
              photoId,
              studentId: topCandidate.studentId,
              confidence: topCandidate.confidence,
              faceBox: face.faceBox,
              faceToken: face.faceId,
              isAutoTagged: true,
              isPrimary: i === 0, // 第一个设为主角
            });

            autoTagged++;
            console.log(
              `✅ 自动标记[${i + 1}/${result.length}]: 照片${photoId} → 学生${topCandidate.studentId} (置信度${confidencePercent}%)`
            );
          } else {
            lowConfidence++;
            console.log(
              `⚠️  人脸[${i + 1}/${result.length}]: 学生${topCandidate.studentId} (置信度${confidencePercent}% < 85%, 需人工确认)`
            );
          }
        } else {
          console.log(`⚠️  人脸[${i + 1}/${result.length}]: 未匹配到学生（人脸库中无此人）`);
        }
      }

      // 更新状态
      const taggedCount = await PhotoStudent.count({ where: { photoId } });
      if (taggedCount > 0) {
        await Photo.update(
          { status: PhotoStatus.TAGGED },
          { where: { id: photoId } }
        );
      }

      console.log('\n' + '-'.repeat(80));
      console.log(`✅ 照片${photoId} AI识别完成`);
      console.log('-'.repeat(80));
      console.log(`检测人脸：${result.length}张`);
      console.log(`自动标记：${autoTagged}个学生`);
      console.log(`待确认：${lowConfidence}个（置信度<85%）`);
      console.log(`未识别：${result.length - autoTagged - lowConfidence}个（人脸库无记录）`);
      console.log('-'.repeat(80) + '\n');
    } catch (error) {
      console.error('\n' + '-'.repeat(80));
      console.error(`❌ 照片${photoId} AI识别失败`);
      console.error('-'.repeat(80));
      console.error('错误:', (error as Error).message);
      console.error('-'.repeat(80) + '\n');
    }
  }

  /**
   * 手动标记学生
   */
  async tagStudent(
    photoId: number,
    studentId: number,
    options: {
      confirmedBy: number;
      isPrimary?: boolean;
      faceBox?: { x: number; y: number; w: number; h: number };
    }
  ): Promise<PhotoStudent> {
    const photoStudent = await PhotoStudent.create({
      photoId,
      studentId,
      confirmedBy: options.confirmedBy,
      confirmedAt: new Date(),
      isPrimary: options.isPrimary || false,
      faceBox: options.faceBox || null,
      isAutoTagged: false,
    });

    // 更新照片状态
    await Photo.update(
      { status: PhotoStatus.TAGGED },
      { where: { id: photoId } }
    );

    console.log(`✅ 手动标记: 照片${photoId} → 学生${studentId}`);
    return photoStudent;
  }

  /**
   * 全班标记（集体照）
   */
  async tagWholeClass(
    photoId: number,
    classId: number,
    confirmedBy: number
  ): Promise<number> {
    // 获取班级所有学生
    const students = await Student.findAll({
      where: { classId },
      attributes: ['id'],
    });

    let taggedCount = 0;
    for (const student of students) {
      try {
        await PhotoStudent.create({
          photoId,
          studentId: student.id,
          confirmedBy,
          confirmedAt: new Date(),
          isAutoTagged: false,
          isPrimary: false,
        });
        taggedCount++;
      } catch (error) {
        // 如果已存在则跳过
        console.warn(`学生${student.id}已标记，跳过`);
      }
    }

    // 更新照片状态
    await Photo.update(
      { status: PhotoStatus.TAGGED },
      { where: { id: photoId } }
    );

    console.log(`✅ 全班标记: 照片${photoId} → ${taggedCount}个学生`);
    return taggedCount;
  }

  /**
   * 获取孩子的照片时间轴（家长端）
   */
  async getChildPhotoTimeline(
    studentId: number,
    options: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
      activityType?: string;
      onlyFavorite?: boolean;
    } = {}
  ): Promise<{ photos: any[]; total: number; groupedByDate: any }> {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      activityType,
      onlyFavorite = false,
    } = options;

    // 构建查询条件
    const where: any = {
      deletedAt: null,
    };

    if (startDate) where.shootDate = { [Op.gte]: startDate };
    if (endDate) where.shootDate = { ...where.shootDate, [Op.lte]: endDate };
    if (activityType) where.activityType = activityType;

    // 查询照片
    const { count, rows } = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: PhotoStudent,
          as: 'photoStudents',
          where: {
            studentId,
            ...(onlyFavorite ? { isFavorited: true } : {}),
          },
          required: true,
        },
      ],
      order: [['shootDate', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // 为每张照片生成临时签名URL（1小时有效期）
    const photosWithSignedUrls = rows.map((photo: any) => {
      const photoData = photo.toJSON ? photo.toJSON() : photo;
      
      // 从完整URL中提取OSS路径
      const extractOSSPath = (url: string) => {
        if (!url) return null;
        try {
          const urlObj = new URL(url);
          // 路径格式：https://bucket.oss-cn-shanghai.aliyuncs.com/path/to/file.jpg
          // 提取 path/to/file.jpg 部分
          return urlObj.pathname.substring(1); // 去掉开头的 /
        } catch {
          return null;
        }
      };
      
      const fileUrlPath = extractOSSPath(photoData.fileUrl);
      const thumbnailUrlPath = extractOSSPath(photoData.thumbnailUrl);
      
      return {
        ...photoData,
        fileUrl: fileUrlPath ? ossService.getTemporaryUrl(fileUrlPath, 3600) : photoData.fileUrl,
        thumbnailUrl: thumbnailUrlPath ? ossService.getTemporaryUrl(thumbnailUrlPath, 3600) : photoData.thumbnailUrl,
      };
    });
    
    // 按日期分组
    const groupedByDate: Record<string, any[]> = {};
    photosWithSignedUrls.forEach((photo: any) => {
      let date = '未知日期';
      if (photo.shootDate) {
        // shootDate可能是Date对象或字符串
        const shootDate = photo.shootDate;
        if (shootDate instanceof Date) {
          date = shootDate.toISOString().slice(0, 10);
        } else if (typeof shootDate === 'string' && shootDate.length >= 10) {
          date = shootDate.slice(0, 10);
        } else if (shootDate) {
          date = String(shootDate).slice(0, 10);
        }
      }
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(photo);
    });

    return {
      photos: photosWithSignedUrls,
      total: count,
      groupedByDate,
    };
  }

  /**
   * 收藏/取消收藏照片
   */
  async toggleFavorite(
    photoId: number,
    studentId: number,
    isFavorited: boolean
  ): Promise<boolean> {
    const [updated] = await PhotoStudent.update(
      { isFavorited },
      { where: { photoId, studentId } }
    );

    return updated > 0;
  }

  /**
   * 获取教师上传的照片列表（教师端）
   */
  async getTeacherPhotos(
    uploadUserId: number,
    options: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
      activityType?: string;
    } = {}
  ): Promise<{ photos: any[]; total: number; groupedByDate: any }> {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      activityType,
    } = options;

    // 🔧 临时修复：确保关联已设置
    // @ts-ignore
    if (!PhotoStudent.associations.student) {
      PhotoStudent.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student'
      });
    }

    // 构建查询条件
    const where: any = {
      uploadUserId,
      deletedAt: null,
    };

    if (startDate) where.shootDate = { [Op.gte]: startDate };
    if (endDate) where.shootDate = { ...where.shootDate, [Op.lte]: endDate };
    if (activityType) where.activityType = activityType;

    // 查询照片
    const { count, rows } = await Photo.findAndCountAll({
      where,
      include: [
        {
          model: PhotoStudent,
          as: 'photoStudents',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['shootDate', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // 为每张照片生成临时签名URL（1小时有效期）
    const photosWithSignedUrls = rows.map((photo: any) => {
      const photoData = photo.toJSON ? photo.toJSON() : photo;
      
      // 从完整URL中提取OSS路径
      const extractOSSPath = (url: string) => {
        if (!url) return null;
        try {
          const urlObj = new URL(url);
          return urlObj.pathname.substring(1);
        } catch {
          return null;
        }
      };
      
      const fileUrlPath = extractOSSPath(photoData.fileUrl);
      const thumbnailUrlPath = extractOSSPath(photoData.thumbnailUrl);
      
      // 统计识别到的学生数
      const recognizedStudents = photoData.photoStudents?.length || 0;
      const studentNames = photoData.photoStudents?.map((ps: any) => ps.student?.name).filter(Boolean) || [];
      
      return {
        ...photoData,
        fileUrl: fileUrlPath ? ossService.getTemporaryUrl(fileUrlPath, 3600) : photoData.fileUrl,
        thumbnailUrl: thumbnailUrlPath ? ossService.getTemporaryUrl(thumbnailUrlPath, 3600) : photoData.thumbnailUrl,
        recognizedStudents,
        studentNames,
      };
    });
    
    // 按日期分组
    const groupedByDate: Record<string, any[]> = {};
    photosWithSignedUrls.forEach((photo: any) => {
      let date = '未知日期';
      if (photo.shootDate) {
        const shootDate = photo.shootDate;
        if (shootDate instanceof Date) {
          date = shootDate.toISOString().slice(0, 10);
        } else if (typeof shootDate === 'string' && shootDate.length >= 10) {
          date = shootDate.slice(0, 10);
        } else if (shootDate) {
          date = String(shootDate).slice(0, 10);
        }
      }
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(photo);
    });

    return {
      photos: photosWithSignedUrls,
      total: count,
      groupedByDate,
    };
  }

  /**
   * 获取照片详情
   */
  async getPhotoDetail(photoId: number): Promise<Photo | null> {
    return Photo.findByPk(photoId, {
      include: [
        {
          model: PhotoStudent,
          as: 'photoStudents',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
  }

  /**
   * 获取班级照片列表（教师端）
   */
  async getClassPhotos(
    classId: number,
    options: {
      page?: number;
      pageSize?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, pageSize = 20, status, startDate, endDate } = options;

    const where: any = {
      classId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (startDate) where.shootDate = { [Op.gte]: startDate };
    if (endDate) where.shootDate = { ...where.shootDate, [Op.lte]: endDate };

    const { count, rows } = await Photo.findAndCountAll({
      where,
      order: [['shootDate', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return { photos: rows, total: count };
  }

  /**
   * 删除照片
   */
  async deletePhoto(photoId: number): Promise<boolean> {
    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      throw new Error('照片不存在');
    }

    // 软删除
    await photo.destroy();

    // 如果配置了OSS，删除OSS文件
    if (ossService.isAvailable()) {
      try {
        const ossPath = photo.fileUrl.split('.com/')[1];
        await ossService.deleteFile(ossPath);
        if (photo.thumbnailUrl) {
          const thumbPath = photo.thumbnailUrl.split('.com/')[1];
          await ossService.deleteFile(thumbPath);
        }
      } catch (error) {
        console.error('删除OSS文件失败:', error);
      }
    }

    console.log(`✅ 照片删除成功: ${photoId}`);
    return true;
  }

  /**
   * 获取数据统计（园长端）
   */
  async getStatistics(
    kindergartenId?: number
  ): Promise<{
    totalPhotos: number;
    thisMonthUploaded: number;
    totalStorage: string;
    avgQualityScore: number;
  }> {
    const where: any = { deletedAt: null };
    if (kindergartenId) where.kindergartenId = kindergartenId;

    // 总照片数
    const totalPhotos = await Photo.count({ where });

    // 本月新增
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthUploaded = await Photo.count({
      where: {
        ...where,
        createdAt: { [Op.gte]: thisMonthStart },
      },
    });

    // 总存储空间
    const photos = await Photo.findAll({
      where,
      attributes: ['fileSize'],
    });
    const totalBytes = photos.reduce((sum, p) => sum + (p.fileSize || 0), 0);
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

    // 平均质量分
    const avgResult: any = await Photo.findOne({
      where,
      attributes: [
        [Photo.sequelize!.fn('AVG', Photo.sequelize!.col('quality_score')), 'avg'],
      ],
      raw: true,
    });
    const avgQualityScore = Math.round(avgResult?.avg || 0);

    return {
      totalPhotos,
      thisMonthUploaded,
      totalStorage: `${totalGB}GB`,
      avgQualityScore,
    };
  }
}

export const photoService = new PhotoService();

