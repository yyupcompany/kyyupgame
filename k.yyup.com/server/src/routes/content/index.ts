/**
 * 内容模块路由聚合文件
 * 统一管理所有媒体、文档、内容相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有内容相关路由
import mediaCenterRoutes from '../media-center.routes';
import photoAlbumRoutes from '../photo-album.routes';
import posterGenerationRoutes from '../poster-generation.routes';
import posterTemplateRoutes from '../poster-template.routes';
import posterUploadRoutes from '../poster-upload.routes';
import personalPostersRoutes from '../personal-posters.routes';
import documentImportRoutes from '../document-import.routes';
import documentInstanceRoutes from '../document-instance.routes';
import documentTemplateRoutes from '../document-template.routes';
import documentStatisticsRoutes from '../document-statistics.routes';
import pageGuideRoutes from '../page-guide.routes';
import pageGuideSectionRoutes from '../page-guide-section.routes';
import videoCreationRoutes from '../video-creation.routes';
import textPolishRoutes from '../text-polish.routes';
import textToSpeechRoutes from '../text-to-speech.routes';
import autoImageRoutes from '../auto-image.routes';

/**
 * 内容模块路由配置
 */
const contentModuleRoutes = (router: Router) => {
  // 🔹 媒体中心
  router.use('/media-center', mediaCenterRoutes);

  // 🔹 相册
  router.use('/photo-album', photoAlbumRoutes);

  // 🔹 海报管理
  router.use('/poster-generations', posterGenerationRoutes);
  router.use('/poster-generation', posterGenerationRoutes); // 别名
  router.use('/posters', posterGenerationRoutes); // 别名
  router.use('/poster-templates', posterTemplateRoutes);
  router.use('/poster-template', posterTemplateRoutes); // 别名
  router.use('/poster-upload', posterUploadRoutes);
  router.use('/personal-posters', personalPostersRoutes);

  // 🔹 文档管理
  router.use('/document-import', documentImportRoutes);
  router.use('/document-instances', documentInstanceRoutes);
  router.use('/document-templates', documentTemplateRoutes);
  router.use('/document-statistics', documentStatisticsRoutes);

  // 🔹 页面指南
  router.use('/page-guides', pageGuideRoutes);
  router.use('/page-guide-sections', pageGuideSectionRoutes);

  // 🔹 视频和文本处理
  router.use('/video-creation', videoCreationRoutes);
  router.use('/text-polish', textPolishRoutes);
  router.use('/text-to-speech', textToSpeechRoutes);

  // 🔹 自动配图
  router.use('/auto-image', autoImageRoutes);

  console.log('✅ 内容模块路由已注册 (16+ 个路由)');
};

export default contentModuleRoutes;

