import { Request, Response } from 'express';
import axios from 'axios';

/**
 * 文本润色控制器
 */
export class TextPolishController {
  
  /**
   * 润色幼儿园介绍文本
   */
  static async polishDescription(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '请提供需要润色的文本'
        });
      }

      // 调用AI服务进行文本润色
      const prompt = `请帮我润色以下幼儿园介绍文本，使其更加专业、生动、有吸引力。要求：
1. 保持原文的核心信息和特色
2. 使用更加优美、专业的语言
3. 突出幼儿园的教育理念和优势
4. 字数控制在200-300字之间
5. 语气温暖、亲切、专业

原文：
${text}

请直接返回润色后的文本，不要添加任何解释或说明。`;

      // 调用AI API
      const aiResponse = await axios.post(
        'http://localhost:3000/api/ai-query/chat',
        {
          message: prompt,
          userId: (req.user as any)?.id || 1,
          sessionId: `polish-${Date.now()}`
        },
        {
          headers: {
            'Authorization': req.headers.authorization || '',
            'Content-Type': 'application/json'
          }
        }
      );

      if (aiResponse.data.success && aiResponse.data.data.response) {
        const polishedText = aiResponse.data.data.response.trim();
        
        res.json({
          success: true,
          data: {
            originalText: text,
            polishedText: polishedText
          }
        });
      } else {
        throw new Error('AI服务返回异常');
      }

    } catch (error) {
      console.error('文本润色失败:', error);
      res.status(500).json({
        success: false,
        message: '文本润色失败',
        error: (error as Error).message
      });
    }
  }
}

