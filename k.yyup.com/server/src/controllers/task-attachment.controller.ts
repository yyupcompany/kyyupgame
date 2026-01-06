import { Request, Response } from 'express';
import { TaskAttachment } from '../models/task-attachment.model';
import { Todo } from '../models/todo.model';
import { User } from '../models/user.model';
import path from 'path';
import fs from 'fs';
import { FileSecurityChecker } from '../utils/file-security';

export class TaskAttachmentController {
  /**
   * 获取任务的所有附件
   */
  public static async getTaskAttachments(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      // 验证任务是否存在
      const task = await Todo.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      // 获取附件列表
      const attachments = await TaskAttachment.findAll({
        where: {
          taskId,
          status: 'active'
        },
        include: [
          {
            model: User,
            as: 'uploader',
            attributes: ['id', 'username', 'realName']
          }
        ],
        order: [['uploadTime', 'DESC']]
      });

      res.json({
        success: true,
        data: attachments
      });
    } catch (error) {
      console.error('获取任务附件失败:', error);
      res.status(500).json({
        success: false,
        message: '获取任务附件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 上传任务附件
   */
  public static async uploadTaskAttachment(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
      }

      // 验证任务是否存在
      const task = await Todo.findByPk(taskId);
      if (!task) {
        // 删除已上传的文件
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      // 获取文件信息
      const fileName = file.originalname;
      const filePath = file.path;
      const fileSize = file.size;
      const fileType = file.mimetype;
      const fileExtension = path.extname(fileName);

      // 🔒 安全检查
      console.log(`🔍 开始安全检查文件: ${fileName}`);
      const securityCheck = await FileSecurityChecker.performSecurityCheck(
        fileName,
        filePath,
        fileType,
        fileSize
      );

      if (!securityCheck.safe) {
        // 删除不安全的文件
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        console.error(`❌ 安全检查失败: ${securityCheck.reason}`);
        return res.status(400).json({
          success: false,
          message: `文件安全检查失败: ${securityCheck.reason}`
        });
      }

      console.log(`✅ 文件安全检查通过: ${fileName}`);

      // 计算文件哈希值（用于去重和完整性验证）
      const fileHash = FileSecurityChecker.calculateFileHash(filePath);

      const fileUrl = `/uploads/tasks/${file.filename}`;

      // 创建附件记录
      const attachment = await TaskAttachment.create({
        taskId: parseInt(taskId),
        fileName,
        filePath,
        fileUrl,
        fileSize,
        fileType,
        fileExtension,
        uploaderId: userId,
        uploadTime: new Date(),
        status: 'active'
      });

      console.log(`✅ 附件上传成功: ID=${attachment.id}, Hash=${fileHash.substring(0, 8)}...`);

      res.json({
        success: true,
        message: '文件上传成功',
        data: {
          id: attachment.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileSize: attachment.fileSize,
          fileType: attachment.fileType,
          uploadTime: attachment.uploadTime
        }
      });
    } catch (error) {
      console.error('上传任务附件失败:', error);

      // 清理上传的文件
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: '上传任务附件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除任务附件
   */
  public static async deleteTaskAttachment(req: Request, res: Response) {
    try {
      const { taskId, attachmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 查找附件
      const attachment = await TaskAttachment.findOne({
        where: {
          id: attachmentId,
          taskId,
          status: 'active'
        }
      });

      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: '附件不存在'
        });
      }

      // 验证权限（只有上传者可以删除）
      if (attachment.uploaderId !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权删除此附件'
        });
      }

      // 软删除附件记录
      attachment.status = 'deleted';
      await attachment.save();

      // 可选：删除物理文件
      // if (fs.existsSync(attachment.filePath)) {
      //   fs.unlinkSync(attachment.filePath);
      // }

      res.json({
        success: true,
        message: '附件已删除'
      });
    } catch (error) {
      console.error('删除任务附件失败:', error);
      res.status(500).json({
        success: false,
        message: '删除任务附件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 下载任务附件
   */
  public static async downloadTaskAttachment(req: Request, res: Response) {
    try {
      const { taskId, attachmentId } = req.params;

      // 查找附件
      const attachment = await TaskAttachment.findOne({
        where: {
          id: attachmentId,
          taskId,
          status: 'active'
        }
      });

      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: '附件不存在'
        });
      }

      // 检查文件是否存在
      if (!fs.existsSync(attachment.filePath)) {
        return res.status(404).json({
          success: false,
          message: '文件不存在'
        });
      }

      // 设置响应头
      res.setHeader('Content-Type', attachment.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.fileName)}"`);
      res.setHeader('Content-Length', attachment.fileSize.toString());

      // 发送文件
      const fileStream = fs.createReadStream(attachment.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('下载任务附件失败:', error);
      res.status(500).json({
        success: false,
        message: '下载任务附件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量上传任务附件
   */
  public static async batchUploadTaskAttachments(req: Request, res: Response) {
    const uploadedFiles: Express.Multer.File[] = [];

    try {
      const { taskId } = req.params;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '未找到上传的文件'
        });
      }

      // 验证任务是否存在
      const task = await Todo.findByPk(taskId);
      if (!task) {
        // 删除所有已上传的文件
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      console.log(`🔍 开始批量安全检查 ${files.length} 个文件`);

      // 🔒 对每个文件进行安全检查
      const securityResults = await Promise.all(
        files.map(async (file) => {
          const securityCheck = await FileSecurityChecker.performSecurityCheck(
            file.originalname,
            file.path,
            file.mimetype,
            file.size
          );
          return { file, securityCheck };
        })
      );

      // 检查是否有不安全的文件
      const unsafeFiles = securityResults.filter(r => !r.securityCheck.safe);
      if (unsafeFiles.length > 0) {
        // 删除所有已上传的文件
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });

        const reasons = unsafeFiles.map(f =>
          `${f.file.originalname}: ${f.securityCheck.reason}`
        ).join('; ');

        console.error(`❌ 批量上传安全检查失败: ${reasons}`);

        return res.status(400).json({
          success: false,
          message: `文件安全检查失败`,
          details: reasons
        });
      }

      console.log(`✅ 所有文件安全检查通过`);

      // 批量创建附件记录
      const attachments = await Promise.all(
        files.map(file => {
          const fileName = file.originalname;
          const filePath = file.path;
          const fileSize = file.size;
          const fileType = file.mimetype;
          const fileExtension = path.extname(fileName);
          const fileUrl = `/uploads/tasks/${file.filename}`;
          const fileHash = FileSecurityChecker.calculateFileHash(filePath);

          uploadedFiles.push(file);

          console.log(`✅ 创建附件记录: ${fileName}, Hash=${fileHash.substring(0, 8)}...`);

          return TaskAttachment.create({
            taskId: parseInt(taskId),
            fileName,
            filePath,
            fileUrl,
            fileSize,
            fileType,
            fileExtension,
            uploaderId: userId,
            uploadTime: new Date(),
            status: 'active'
          });
        })
      );

      console.log(`✅ 批量上传成功: ${attachments.length} 个文件`);

      res.json({
        success: true,
        message: `成功上传 ${attachments.length} 个文件`,
        data: attachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          fileType: att.fileType,
          uploadTime: att.uploadTime
        }))
      });
    } catch (error) {
      console.error('批量上传任务附件失败:', error);

      // 清理所有已上传的文件
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: '批量上传任务附件失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}

export default TaskAttachmentController;

