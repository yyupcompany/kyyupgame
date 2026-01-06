#!/usr/bin/env ts-node

/**
 * 修复自动生成文件的编译问题
 * 处理模型导入、字段映射、路由引用等问题
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

class GeneratedFilesFixer {
  private routesDir = path.join(__dirname, '../routes');
  private modelsDir = path.join(__dirname, '../models');

  /**
   * 修复所有生成的文件
   */
  async fixAllFiles(): Promise<void> {
    console.log('🔧 开始修复自动生成的文件...');

    // 1. 修复模型文件的字段定义问题
    await this.fixModelFiles();

    // 2. 修复路由文件的模型引用问题
    await this.fixRouteFiles();

    // 3. 修复 route-model-mapper 的导入问题
    await this.fixRouteModelMapper();

    console.log('✅ 文件修复完成');
  }

  /**
   * 修复模型文件的字段定义问题
   */
  private async fixModelFiles(): Promise<void> {
    console.log('📝 修复模型文件字段定义...');
    
    const modelFiles = await glob('**/*.model.ts', { 
      cwd: this.modelsDir,
      absolute: true 
    });

    const problematicFiles = [
      'aimemorie.model.ts',
      'changelog.model.ts', 
      'referralcode.model.ts',
      'referralrelationship.model.ts',
      'referralreward.model.ts',
      'sequelizemeta.model.ts'
    ];

    for (const file of modelFiles) {
      const fileName = path.basename(file);
      if (problematicFiles.includes(fileName)) {
        await this.fixSpecificModelFile(file, fileName);
      }
    }
  }

  /**
   * 修复特定模型文件的问题
   */
  private async fixSpecificModelFile(filePath: string, fileName: string): Promise<void> {
    try {
      let content = await fs.promises.readFile(filePath, 'utf-8');
      
      // 修复 SequelizeMeta 模型 - 没有 id 字段
      if (fileName === 'sequelizemeta.model.ts') {
        console.log(`🔧 修复 ${fileName} - 移除不存在的字段`);
        
        // 替换错误的 Optional 类型定义
        content = content.replace(
          /export interface SequelizeMetaCreationAttributes extends Optional<SequelizeMetaAttributes, 'id' \| 'created_at' \| 'updated_at'>/,
          'export interface SequelizeMetaCreationAttributes extends SequelizeMetaAttributes'
        );
        
        // 更新字段定义，移除 id, created_at, updated_at 字段
        const fixedFields = `  name: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },`;

        content = content.replace(
          /{\s*id:[\s\S]*?},\s*name:[\s\S]*?},/,
          fixedFields
        );

        // 移除时间戳字段定义
        content = content.replace(/createdAt:[\s\S]*?},\s*/g, '');
        content = content.replace(/updatedAt:[\s\S]*?},\s*/g, '');
        
        // 移除类中的时间戳属性
        content = content.replace(/public readonly createdAt.*?\n/g, '');
        content = content.replace(/public readonly updatedAt.*?\n/g, '');
        
        // 修复 Sequelize 初始化配置
        content = content.replace(
          /timestamps: true,\s*underscored: true,\s*paranoid: true,/,
          'timestamps: false,'
        );
      }

      // 修复其他模型的字段映射问题
      if (fileName.includes('referral') || fileName === 'aimemorie.model.ts' || fileName === 'changelog.model.ts') {
        console.log(`🔧 修复 ${fileName} - 字段名称对齐`);
        
        // 标准化字段名称
        content = content.replace(/created_at/g, 'createdAt');
        content = content.replace(/updated_at/g, 'updatedAt');
        
        // 修复 Optional 类型引用中的字段名
        content = content.replace(
          /'id' \| 'created_at' \| 'updated_at'/g,
          "'id' | 'createdAt' | 'updatedAt'"
        );
      }

      await fs.promises.writeFile(filePath, content, 'utf-8');
      console.log(`✅ 已修复 ${fileName}`);
      
    } catch (error) {
      console.error(`❌ 修复 ${fileName} 失败:`, error);
    }
  }

  /**
   * 修复路由文件的模型引用问题
   */
  private async fixRouteFiles(): Promise<void> {
    console.log('🛣️ 修复路由文件模型引用...');
    
    const routeFiles = await glob('**/*.routes.ts', { 
      cwd: this.routesDir,
      absolute: true 
    });

    for (const file of routeFiles) {
      await this.fixRouteFileImports(file);
    }
  }

  /**
   * 修复单个路由文件的导入问题
   */
  private async fixRouteFileImports(filePath: string): Promise<void> {
    try {
      let content = await fs.promises.readFile(filePath, 'utf-8');
      
      // 映射表：正确的模型文件名对应关系
      const modelFileMapping: Record<string, string> = {
        'activityarrangement.model': 'activity-arrangement.model',
        'activityevaluation.model': 'activity-evaluation.model', 
        'activityplan.model': 'activity-plan.model',
        'activityregistration.model': 'activity-registration.model',
        'activityresource.model': 'activity-resource.model',
        'activitystaff.model': 'activity-staff.model',
        'admissionnotification.model': 'admission-notification.model',
        'admissionresult.model': 'admission-result.model',
        'aiconversation.model': 'ai-conversation.model',
        'aifeedback.model': 'ai-feedback.model',
        'aimemorie.model': 'ai-memory.model',
        'aimessage.model': 'ai-message.model',
        'aimodelbilling.model': 'ai-model-billing.model',
        'aimodelconfig.model': 'ai-model-config.model',
        'aimodelusage.model': 'ai-model-usage.model',
        'aiuserpermission.model': 'ai-user-permission.model',
        'aiuserrelation.model': 'ai-user-relation.model',
        'classteacher.model': 'class-teacher.model',
        'conversiontracking.model': 'conversion-tracking.model',
        'enrollmentapplication.model': 'enrollment-application.model',
        'enrollmentapplicationmaterial.model': 'enrollment-application-material.model',
        'enrollmentconsultation.model': 'enrollment-consultation.model',
        'enrollmentconsultationfollowup.model': 'enrollment-consultation-followup.model',
        'enrollmentinterview.model': 'enrollment-interview.model',
        'enrollmentplan.model': 'enrollment-plan.model',
        'enrollmentplanassignee.model': 'enrollment-plan-assignee.model',
        'enrollmentplanclass.model': 'enrollment-plan-class.model',
        'enrollmentplantracking.model': 'enrollment-plan-tracking.model',
        'enrollmentquota.model': 'enrollment-quota.model',
        'enrollmenttask.model': 'enrollment-task.model',
        'filestorage.model': 'file-storage.model',
        'likecollectconfig.model': 'like-collect-config.model',
        'likecollectrecord.model': 'like-collect-record.model',
        'marketingcampaign.model': 'marketing-campaign.model',
        'messagerecord.model': 'message-record.model',
        'messagetemplate.model': 'message-template.model',
        'operationlog.model': 'operation-log.model',
        'parentfollowup.model': 'parent-followup.model',
        'parentstudentrelation.model': 'parent-student-relation.model',
        'performancerule.model': 'performance-rule.model',
        'permissionbackup.model': 'permission-backup.model',
        'personalposter.model': 'personal-poster.model',
        'posterelement.model': 'poster-element.model',
        'postergeneration.model': 'poster-generation.model',
        'postertemplate.model': 'poster-template.model',
        'referralcode.model': 'referral-code.model',
        'referralrelationship.model': 'referral-relationship.model',
        'referralreward.model': 'referral-reward.model',
        'referralstatistic.model': 'referral-statistic.model',
        'rolebackup.model': 'role-backup.model',
        'rolepermission.model': 'role-permission.model',
        'sequelizemeta.model': 'sequelize-meta.model',
        'systemconfig.model': 'system-config.model',
        'systemlog.model': 'system-log.model',
        'tokenblacklist.model': 'token-blacklist.model',
        'userprofile.model': 'user-profile.model',
        'userrole.model': 'user-role.model'
      };

      // 修复模型导入路径
      for (const [wrongName, correctName] of Object.entries(modelFileMapping)) {
        const wrongImport = `../models/${wrongName}`;
        const correctImport = `../models/${correctName}`;
        content = content.replace(new RegExp(wrongImport, 'g'), correctImport);
      }

      // 特殊处理：SequelizeMeta 路由不需要 id 参数
      if (path.basename(filePath) === 'SequelizeMeta.routes.ts') {
        // 移除所有 /:id 相关的路由和操作
        content = content.replace(/router\.(get|put|delete)\('\/.*?:id.*?[\s\S]*?}\);/g, '');
        
        // 只保留 GET / 和 POST / 路由
        const basicRoutes = `
/**
 * @swagger
 * /api/SequelizeMeta:
 *   get:
 *     summary: 获取数据库迁移记录列表
 *     tags: [SequelizeMeta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', async (req, res) => {
  try {
    const list = await SequelizeMeta.findAll();
    return ApiResponse.success(res, { list }, '获取迁移记录列表成功');
  } catch (error) {
    console.error('获取迁移记录列表失败:', error);
    return ApiResponse.error(res, '获取迁移记录列表失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
`;
        
        // 替换路由定义部分
        content = content.replace(
          /router\.get\('\/'\, async.*?export default router;/s,
          basicRoutes
        );
      }

      await fs.promises.writeFile(filePath, content, 'utf-8');
      
    } catch (error) {
      console.error(`❌ 修复路由文件 ${path.basename(filePath)} 失败:`, error);
    }
  }

  /**
   * 修复 route-model-mapper 的导入问题
   */
  private async fixRouteModelMapper(): Promise<void> {
    console.log('🗺️ 修复 RouteModelMapper 导入问题...');
    
    const mapperPath = path.join(__dirname, '../utils/route-model-mapper.ts');
    
    try {
      let content = await fs.promises.readFile(mapperPath, 'utf-8');
      
      // 移除 .default 引用，因为模型都是命名导出
      content = content.replace(/\|\| m\.default/g, '');
      content = content.replace(/m\.(\w+) \|\| m\.default/g, 'm.$1');
      
      await fs.promises.writeFile(mapperPath, content, 'utf-8');
      console.log('✅ 已修复 RouteModelMapper 导入问题');
      
    } catch (error) {
      console.error('❌ 修复 RouteModelMapper 失败:', error);
    }
  }
}

async function main() {
  const fixer = new GeneratedFilesFixer();
  await fixer.fixAllFiles();
}

if (require.main === module) {
  main().catch(console.error);
}

export default GeneratedFilesFixer;