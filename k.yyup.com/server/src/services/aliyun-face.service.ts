/**
 * 阿里云人脸识别服务
 * SDK: @alicloud/facebody20191230
 */
import Client, * as FaceBody from '@alicloud/facebody20191230';
import * as $OpenApi from '@alicloud/openapi-client';
import { Student } from '../models/student.model';
import { StudentFaceLibrary } from '../models/student-face-library.model';

// 阿里云配置
const ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID || '';
const ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
const FACE_DB_NAME = process.env.FACE_DB_NAME || 'kindergarten_students';
const REGION = 'cn-shanghai'; // 人脸识别服务只在上海

interface FaceSearchResult {
  faceId: string;
  faceBox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  candidates: Array<{
    studentId: number;
    name: string;
    confidence: number;
  }>;
}

class AliyunFaceService {
  private client: Client | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * 初始化阿里云客户端
   */
  private initialize() {
    if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
      console.warn('⚠️  阿里云人脸识别未配置（缺少ACCESS_KEY）');
      return;
    }

    const config = new $OpenApi.Config({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      endpoint: `facebody.${REGION}.aliyuncs.com`,
    });

    this.client = new Client(config);
    console.log('✅ 阿里云人脸识别服务已初始化');
  }

  /**
   * 检查服务是否可用
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * 注册学生人脸
   * @param studentId 学生ID
   * @param imageUrl HTTPS签名URL
   * @param metadata 学生元数据（姓名、班级等）
   * @param imageBuffer 可选的图片buffer（用于质量检测）
   */
  async registerStudentFace(
    studentId: number,
    imageUrl: string,
    metadata?: { name?: string; className?: string },
    imageBuffer?: Buffer
  ): Promise<{
    success: boolean;
    faceToken?: string;
    quality?: number;
    message?: string;
  }> {
    if (!this.client) {
      throw new Error('阿里云人脸识别服务未初始化');
    }

    try {
      console.log(`\n🤖 [人脸注册] 学生${studentId}`);
      console.log('-'.repeat(60));

      // 步骤1：人脸检测（检查照片质量）
      console.log('步骤1/3：人脸检测...');
      const detectRequest = new FaceBody.DetectFaceRequest({
        imageURL: imageUrl,
      });

      const detectResponse = await this.client.detectFace(detectRequest);
      const detectData: any = detectResponse.body?.data;

      if (!detectData || !detectData.faceCount || detectData.faceCount === 0) {
        console.log('❌ 未检测到人脸');
        return {
          success: false,
          message: '照片中未检测到人脸，请使用清晰的正面照',
        };
      }

      const qualityScore = detectData.faceProbabilityList?.[0] || 0;
      console.log(`✅ 检测到人脸，质量分: ${(qualityScore * 100).toFixed(0)}`);

      if (qualityScore < 0.6) {
        return {
          success: false,
          message: `照片质量不佳（${(qualityScore * 100).toFixed(0)}分），请使用更清晰的照片`,
        };
      }

      // 步骤2：删除旧的entity（如果存在）
      console.log('步骤2/3：清理旧记录...');
      const entityId = `student_${studentId}`;
      try {
        await this.deleteStudentFace(studentId, entityId);
        console.log('✅ 旧记录已删除');
      } catch (err) {
        console.log('⚠️  无旧记录，跳过删除');
      }

      // 步骤3：创建entity并添加人脸
      console.log('步骤3/3：注册人脸特征...');

      // 3.1 创建entity（不带imageUrl）
      const createEntityRequest = new FaceBody.AddFaceEntityRequest({
        dbName: FACE_DB_NAME,
        entityId: entityId,
        extraData: JSON.stringify({
          studentId,
          name: metadata?.name || '',
          className: metadata?.className || '',
        }),
      });

      await this.client.addFaceEntity(createEntityRequest);
      console.log(`✅ Entity创建成功: ${entityId}`);

      // 3.2 添加人脸特征（带imageUrl）
      const addFaceRequest = new FaceBody.AddFaceRequest({
        dbName: FACE_DB_NAME,
        entityId: entityId,
        imageUrl: imageUrl,
      });

      const addFaceResponse = await this.client.addFace(addFaceRequest);
      const faceId = addFaceResponse.body?.data?.faceId;

      console.log(`✅ 人脸特征添加成功: FaceId=${faceId}`);

      console.log('-'.repeat(60));
      console.log(`✅ 学生${studentId}人脸注册完成！`);
      console.log('-'.repeat(60) + '\n');

      return {
        success: true,
        faceToken: faceId,
        quality: qualityScore,
      };
    } catch (error: any) {
      console.error('❌ 人脸注册失败:', error.message);
      throw error;
    }
  }

  /**
   * 在照片中搜索人脸
   * @param imageUrl HTTPS签名URL
   * @param options 搜索选项
   */
  async searchFacesInPhoto(
    imageUrl: string,
    options: {
      maxFaces?: number;
      maxCandidates?: number;
      matchThreshold?: number; // 0-100
    } = {}
  ): Promise<FaceSearchResult[]> {
    if (!this.client) {
      throw new Error('阿里云人脸识别服务未初始化');
    }

    try {
      const { maxFaces = 10, maxCandidates = 3, matchThreshold = 75 } = options;

      console.log(`🔍 [人脸搜索] ImageURL: ${imageUrl.substring(0, 80)}...`);

      const searchRequest = new FaceBody.SearchFaceRequest({
        dbName: FACE_DB_NAME,
        imageUrl: imageUrl,
        limit: maxCandidates,
        maxFaceNum: maxFaces,
      });

      const response = await this.client.searchFace(searchRequest);
      const responseData: any = response.body?.data;

      if (!responseData || !responseData.matchList) {
        console.log('⚠️  API返回空结果');
        return [];
      }

      console.log(`✅ 搜索完成：检测到${responseData.matchList.length}张人脸`);

      // 解析结果
      const results: FaceSearchResult[] = [];

      for (let i = 0; i < responseData.matchList.length; i++) {
        const match = responseData.matchList[i];
        const location = match.location || {};
        const faceItems = match.faceItems || [];

        // 过滤低置信度的候选
        const candidates = await Promise.all(
          faceItems
            .filter((item: any) => (item.score || 0) >= matchThreshold)
            .map(async (item: any) => {
              // 从entityId解析studentId
              const entityId = item.entityId || '';
              const studentIdMatch = entityId.match(/student_(\d+)/);
              const studentId = studentIdMatch ? parseInt(studentIdMatch[1]) : 0;

              // 查询学生姓名
              let name = '';
              if (studentId) {
                const faceRecord = await StudentFaceLibrary.findOne({
                  where: { studentId },
                  include: [
                    {
                      model: Student,
                      as: 'student',
                      attributes: ['name'],
                    },
                  ],
                });

                name = (faceRecord as any)?.student?.name || '';
              }

              return {
                studentId,
                name,
                confidence: (item.score || 0) / 100, // 转换为0-1
              };
            })
        );

        results.push({
          faceId: match.faceId || `face_${i}`,
          faceBox: {
            x: location.x || 0,
            y: location.y || 0,
            w: location.width || 0,
            h: location.height || 0,
          },
          candidates: candidates.filter((c) => c.studentId > 0),
        });
      }

      return results;
    } catch (error: any) {
      console.error('❌ 人脸搜索失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除学生人脸记录
   */
  async deleteStudentFace(studentId: number, entityId?: string): Promise<void> {
    if (!this.client) {
      return;
    }

    const targetEntityId = entityId || `student_${studentId}`;

    try {
      const deleteRequest = new FaceBody.DeleteFaceEntityRequest({
        dbName: FACE_DB_NAME,
        entityId: targetEntityId,
      });

      await this.client.deleteFaceEntity(deleteRequest);
      console.log(`✅ 已删除人脸记录: ${targetEntityId}`);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        console.log(`⚠️  Entity不存在: ${targetEntityId}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * 创建人脸库（FaceDB）
   */
  async createFaceGroup(dbName?: string): Promise<void> {
    if (!this.client) {
      throw new Error('阿里云人脸识别服务未初始化');
    }

    const targetDbName = dbName || FACE_DB_NAME;

    try {
      const request = new FaceBody.CreateFaceDbRequest({
        name: targetDbName,
      });

      await this.client.createFaceDb(request);
      console.log(`✅ 人脸库创建成功: ${targetDbName}`);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  人脸库已存在: ${targetDbName}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * 对比两张人脸的相似度
   */
  async compareFaces(imageUrl1: string, imageUrl2: string): Promise<number> {
    if (!this.client) {
      throw new Error('阿里云人脸识别服务未初始化');
    }

    try {
      const request = new FaceBody.CompareFaceRequest({
        imageURLA: imageUrl1,
        imageURLB: imageUrl2,
      });

      const response = await this.client.compareFace(request);
      const confidence = response.body?.data?.confidence || 0;

      console.log(`🔍 人脸对比: ${(confidence * 100).toFixed(2)}% 相似`);
      return confidence;
    } catch (error: any) {
      console.error('❌ 人脸对比失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取学生的所有人脸记录
   */
  async getStudentFaces(studentId: number): Promise<any[]> {
    if (!this.client) {
      return [];
    }

    try {
      const entityId = `student_${studentId}`;

      const request = new FaceBody.GetFaceEntityRequest({
        dbName: FACE_DB_NAME,
        entityId: entityId,
      });

      const response = await this.client.getFaceEntity(request);
      const entity: any = response.body?.data;

      if (!entity) {
        return [];
      }

      return [
        {
          entityId: entity.entityId,
          faceCount: entity.faceCount || 0,
          extraData: entity.extraData,
        },
      ];
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return [];
      }
      throw error;
    }
  }
}

// 导出单例
export const aliyunFaceService = new AliyunFaceService();
