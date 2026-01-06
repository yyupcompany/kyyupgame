/**
 * 呼叫中心控制器
 * 使用VOS（Voice Over Service）进行语音通话
 */

import { Request, Response } from 'express'
import { ApiResponse } from '../utils/response'
import { vosConfigService } from '../services/vos-config.service'
import { callCenterRealtimeService } from '../services/call-center-realtime.service'
import { unifiedTenantAIClient, ChatMessage } from '../services/unified-tenant-ai-client.service'
// 静态导入模型（不使用动态导入）
import { User, Parent, Student, Teacher } from '../models/index'
import { EnrollmentConsultation } from '../models/enrollment-consultation.model'
import { sequelize } from '../init'
import { Op, QueryTypes } from 'sequelize'

class CallCenterController {
  /**
   * 获取概览数据
   */
  async getOverview(req: Request, res: Response) {
    try {
      const vosConfig = await vosConfigService.getConfig()

      const overviewData = {
        vosStatus: vosConfig ? 'configured' : 'not_configured',
        vosServer: vosConfig ? `${vosConfig.serverHost}:${vosConfig.serverPort}` : null,
        protocol: vosConfig ? vosConfig.protocol : null
      }

      return ApiResponse.success(res, overviewData, '获取概览数据成功')
    } catch (error) {
      console.error('❌ 获取概览数据失败:', error)
      return ApiResponse.error(res, '获取概览数据失败', 'ERROR')
    }
  }


  /**
   * 发起VOS呼叫
   */
  async makeCallUDP(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id
      const { phoneNumber, customerId, systemPrompt } = req.body

      if (!phoneNumber) {
        return ApiResponse.error(res, '电话号码不能为空', 'VALIDATION_ERROR')
      }

      console.log(`📞 用户 ${userId} 发起VOS呼叫: ${phoneNumber}`)

      // 确保VOS配置已加载
      await vosConfigService.loadConfig()

      // 使用呼叫中心实时服务发起呼叫
      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      await callCenterRealtimeService.startCall(
        callId,
        customerId,
        systemPrompt
      )

      return ApiResponse.success(res, {
        callId,
        phoneNumber,
        status: 'connecting',
        message: '呼叫已发起，等待接通'
      }, 'VOS呼叫发起成功')
    } catch (error) {
      console.error('❌ VOS呼叫失败:', error)
      return ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'VOS呼叫失败',
        'CALL_ERROR'
      )
    }
  }

  /**
   * 获取VOS呼叫状态
   */
  async getCallStatusUDP(req: Request, res: Response) {
    try {
      const { callId } = req.params

      // 从呼叫中心实时服务获取通话状态
      const activeCallCount = callCenterRealtimeService.getActiveCallCount()

      return ApiResponse.success(res, {
        callId,
        status: 'active',
        activeCallCount,
        message: '通话状态查询成功'
      }, '获取通话状态成功')
    } catch (error) {
      console.error('❌ 获取通话状态失败:', error)
      return ApiResponse.error(res, '获取通话状态失败', 'ERROR')
    }
  }

  /**
   * 挂断VOS呼叫
   */
  async hangupCallUDP(req: Request, res: Response) {
    try {
      const { callId } = req.body

      if (!callId) {
        return ApiResponse.error(res, 'callId不能为空', 'VALIDATION_ERROR')
      }

      await callCenterRealtimeService.endCall(callId)

      return ApiResponse.success(res, null, '通话已挂断')
    } catch (error) {
      console.error('❌ 挂断通话失败:', error)
      return ApiResponse.error(
        res,
        error instanceof Error ? error.message : '挂断通话失败',
        'ERROR'
      )
    }
  }

  /**
   * 获取所有活跃的VOS呼叫
   */
  async getActiveCallsUDP(req: Request, res: Response) {
    try {
      const activeCallCount = callCenterRealtimeService.getActiveCallCount()

      return ApiResponse.success(res, {
        total: activeCallCount,
        calls: [],
        message: '获取活跃通话成功'
      }, '获取活跃通话成功')
    } catch (error) {
      console.error('❌ 获取活跃通话失败:', error)
      return ApiResponse.error(res, '获取活跃通话失败', 'ERROR')
    }
  }

  // 其他方法返回"功能开发中"
  async makeCall(req: Request, res: Response) {
    return ApiResponse.error(res, '请使用UDP呼叫接口: POST /api/call-center/call/udp/make', 'DEPRECATED')
  }

  async answerCall(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async hangupCall(req: Request, res: Response) {
    return ApiResponse.error(res, '请使用UDP挂断接口: POST /api/call-center/call/udp/hangup', 'DEPRECATED')
  }

  async holdCall(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async unholdCall(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async transferCall(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async sendDTMF(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getActiveCalls(req: Request, res: Response) {
    return ApiResponse.error(res, '请使用UDP活跃通话接口: GET /api/call-center/calls/udp/active', 'DEPRECATED')
  }

  async getCallHistory(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getCallStatistics(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async startRecording(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async stopRecording(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  /**
   * 获取通话记录列表
   * 从数据库获取通话记录（如果有call_records表）或返回空列表
   */
  async getRecordings(req: Request, res: Response) {
    try {
      const { page = 1, pageSize = 20, phoneNumber, dateRange } = req.query
      const userId = (req as any).user?.id

      // 使用静态导入的sequelize
      if (!sequelize) {
        // 如果没有数据库连接，返回空列表
        return ApiResponse.success(res, {
          list: [],
          total: 0,
          page: Number(page),
          pageSize: Number(pageSize)
        }, '获取通话记录成功（暂无数据）')
      }

      // 尝试查询call_records表（使用参数化查询防止SQL注入）
      try {
        const replacements: any = {
          limit: Number(pageSize),
          offset: (Number(page) - 1) * Number(pageSize)
        }
        
        let whereClause = 'WHERE 1=1'
        if (phoneNumber) {
          whereClause += ' AND callee_number LIKE :phoneNumber'
          replacements.phoneNumber = `%${phoneNumber}%`
        }
        if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
          whereClause += ' AND start_time >= :startDate AND start_time <= :endDate'
          replacements.startDate = dateRange[0]
          replacements.endDate = dateRange[1]
        }

        const [results] = await sequelize.query(`
          SELECT 
            id,
            call_id as callId,
            callee_number as phoneNumber,
            callee_name as contactName,
            direction,
            status,
            start_time as startTime,
            end_time as endTime,
            duration,
            recording_enabled as recordingEnabled
          FROM call_records
          ${whereClause}
          ORDER BY start_time DESC
          LIMIT :limit
          OFFSET :offset
        `, {
          replacements,
          type: QueryTypes.SELECT
        })

        const [countResults] = await sequelize.query(`
          SELECT COUNT(*) as total
          FROM call_records
          ${whereClause}
        `, {
          replacements: {
            phoneNumber: replacements.phoneNumber,
            startDate: replacements.startDate,
            endDate: replacements.endDate
          },
          type: QueryTypes.SELECT
        })

        const total = (countResults as any[])[0]?.total || 0
        const list = (results as any[]).map((r: any) => ({
          id: r.id,
          callId: r.callId,
          phoneNumber: r.phoneNumber,
          contactName: r.contactName,
          type: r.direction === 'outbound' ? 'outbound' : 'inbound',
          status: r.status,
          duration: r.duration || 0,
          callTime: r.startTime,
          recordingEnabled: r.recordingEnabled
        }))

        return ApiResponse.success(res, {
          list,
          total: Number(total),
          page: Number(page),
          pageSize: Number(pageSize)
        }, '获取通话记录成功')
      } catch (tableError: any) {
        // 如果表不存在，返回空列表
        if (tableError.message?.includes('doesn\'t exist') || tableError.message?.includes('Unknown table')) {
          console.warn('⚠️ call_records表不存在，返回空列表')
          return ApiResponse.success(res, {
            list: [],
            total: 0,
            page: Number(page),
            pageSize: Number(pageSize)
          }, '获取通话记录成功（暂无数据）')
        }
        throw tableError
      }
    } catch (error) {
      console.error('❌ 获取通话记录失败:', error)
      return ApiResponse.error(res, '获取通话记录失败', 'ERROR')
    }
  }

  async getRecording(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async deleteRecording(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async downloadRecording(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getTranscript(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async updateTranscript(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async requestTranscription(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async analyzeCall(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async batchAnalyze(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async synthesizeVoice(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getSynthesisStatus(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async startTranscription(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async stopTranscription(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getTranscriptionResult(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async analyzeSentiment(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async generateResponse(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  /**
   * 获取分机列表
   * 从VOS配置或用户数据获取分机信息
   */
  async getExtensions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id
      const kindergartenId = (req as any).user?.kindergartenId

      // 从VOS配置获取分机信息，如果没有则返回空数组
      const vosConfig = await vosConfigService.getConfig()
      
      // 如果没有VOS配置，返回默认分机列表（基于用户）
      if (!vosConfig) {
        return ApiResponse.success(res, [], '获取分机列表成功（无VOS配置）')
      }

      // 从用户表获取可以作为分机的用户（教师）
      const teachers = await Teacher.findAll({
        where: {
          ...(kindergartenId ? { kindergartenId } : {})
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'realName', 'phone'],
          required: true
        }],
        limit: 50
      })

      // 将教师转换为分机格式
      const extensions = teachers.map((t, index) => ({
        id: t.id.toString(),
        extensionNumber: `100${index + 1}`,
        extensionName: (t.user as any)?.realName || `分机${index + 1}`,
        isOnline: true,
        currentStatus: 'online' as const
      }))

      return ApiResponse.success(res, extensions, '获取分机列表成功')
    } catch (error) {
      console.error('❌ 获取分机列表失败:', error)
      return ApiResponse.error(res, '获取分机列表失败', 'ERROR')
    }
  }

  async getExtension(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async updateExtensionStatus(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async resetExtension(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  /**
   * 获取联系人列表
   * 从Parent、Student、Teacher等模型获取联系人数据
   */
  async getContacts(req: Request, res: Response) {
    try {
      const { search, type, page = 1, pageSize = 20 } = req.query
      const userId = (req as any).user?.id
      const kindergartenId = (req as any).user?.kindergartenId

      const contacts: any[] = []
      const searchTerm = search ? `%${search}%` : '%'

      // 根据类型获取不同的联系人
      if (!type || type === 'parent') {
        // 获取老家长（Parent）- Parent没有kindergartenId，需要通过Student关联
        const whereCondition: any = {}
        if (search) {
          whereCondition[Op.or] = [
            { '$user.realName$': { [Op.like]: searchTerm } },
            { '$user.phone$': { [Op.like]: searchTerm } }
          ]
        }
        
        const parents = await Parent.findAll({
          where: whereCondition,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'realName', 'phone', 'email'],
              required: true
            }
          ],
          limit: Number(pageSize),
          offset: (Number(page) - 1) * Number(pageSize)
        })

        contacts.push(...parents.map(p => ({
          id: p.id,
          name: (p.user as any)?.realName || '',
          phone: (p.user as any)?.phone || '',
          email: (p.user as any)?.email || '',
          type: 'parent',
          contactName: (p.user as any)?.realName || '',
          phoneNumber: (p.user as any)?.phone || ''
        })))
      }

      if (!type || type === 'customer') {
        // 获取客户池（从EnrollmentConsultation获取潜在客户）
        const consultations = await EnrollmentConsultation.findAll({
          where: {
            ...(kindergartenId ? { kindergartenId } : {}),
            ...(search ? {
              [Op.or]: [
                { parentName: { [Op.like]: searchTerm } },
                { contactPhone: { [Op.like]: searchTerm } }
              ]
            } : {})
          },
          limit: Number(pageSize),
          offset: (Number(page) - 1) * Number(pageSize),
          order: [['createdAt', 'DESC']]
        })

        contacts.push(...consultations.map(c => ({
          id: c.id,
          name: c.parentName || '',
          phone: c.contactPhone || '',
          email: '',
          type: 'customer',
          contactName: c.parentName || '',
          phoneNumber: c.contactPhone || ''
        })))
      }

      if (!type || type === 'employee') {
        // 获取员工（Teacher）
        const teachers = await Teacher.findAll({
          where: {
            ...(kindergartenId ? { kindergartenId } : {}),
            ...(search ? {
              [Op.or]: [
                { '$user.realName$': { [Op.like]: searchTerm } },
                { '$user.phone$': { [Op.like]: searchTerm } }
              ]
            } : {})
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'realName', 'phone', 'email'],
            required: true
          }],
          limit: Number(pageSize),
          offset: (Number(page) - 1) * Number(pageSize)
        })

        contacts.push(...teachers.map(t => ({
          id: t.id,
          name: (t.user as any)?.realName || '',
          phone: (t.user as any)?.phone || '',
          email: (t.user as any)?.email || '',
          type: 'employee',
          contactName: (t.user as any)?.realName || '',
          phoneNumber: (t.user as any)?.phone || ''
        })))
      }

      return ApiResponse.success(res, {
        list: contacts,
        total: contacts.length,
        page: Number(page),
        pageSize: Number(pageSize)
      }, '获取联系人列表成功')
    } catch (error) {
      console.error('❌ 获取联系人列表失败:', error)
      return ApiResponse.error(res, '获取联系人列表失败', 'ERROR')
    }
  }

  async createContact(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async updateContact(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async deleteContact(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async searchContacts(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  async getRealTimeStatus(req: Request, res: Response) {
    return ApiResponse.error(res, '功能开发中', 'NOT_IMPLEMENTED')
  }

  /**
   * TTS语音合成测试
   * 用于测试呼叫中心的语音合成功能
   */
  async testTTS(req: Request, res: Response) {
    try {
      const { text, voice, speed, format } = req.body

      // 参数验证
      if (!text) {
        return ApiResponse.error(res, '文本内容不能为空', 'VALIDATION_ERROR')
      }

      console.log('🎤 [呼叫中心TTS测试] 开始语音合成')
      console.log(`   文本: ${text}`)
      console.log(`   音色: ${voice || '默认'}`)
      console.log(`   语速: ${speed || 1.0}`)
      console.log(`   格式: ${format || 'mp3'}`)

      // TODO: 实现TTS测试功能
      // 临时返回成功响应
      console.log(`✅ [呼叫中心TTS测试] TTS功能待实现`)

      return ApiResponse.success(res, {
        message: 'TTS功能待实现',
        text,
        voice,
        speed,
        format
      }, 'TTS测试请求已接收')
    } catch (error) {
      console.error('❌ [呼叫中心TTS测试] 语音合成失败:', error)
      return ApiResponse.error(
        res,
        error instanceof Error ? error.message : '语音合成失败',
        'TTS_ERROR'
      )
    }
  }

  /**
   * 获取可用的TTS音色列表
   */
  async getTTSVoices(req: Request, res: Response) {
    try {
      // 返回火山引擎支持的音色列表
      const voices = [
        {
          id: 'zh_female_cancan_mars_bigtts',
          name: '灿灿女声',
          language: 'zh-CN',
          gender: 'female',
          category: '儿童',
          description: '活泼可爱的女声，适合幼儿园场景'
        },
        {
          id: 'zh_female_qingxin_mars_bigtts',
          name: '清新女声',
          language: 'zh-CN',
          gender: 'female',
          category: '儿童',
          description: '清新自然的女声'
        },
        {
          id: 'zh_male_qingsecunzheng_mars_bigtts',
          name: '青涩男声',
          language: 'zh-CN',
          gender: 'male',
          category: '儿童',
          description: '青涩纯真的男声'
        },
        {
          id: 'zh_female_yingyujiaoyu_mars_bigtts',
          name: 'Tina老师',
          language: 'zh-CN',
          gender: 'female',
          category: '教育',
          description: '专业的英语教育音色'
        },
        {
          id: 'zh_female_xinwen_mars_bigtts',
          name: '新闻女声',
          language: 'zh-CN',
          gender: 'female',
          category: '专业',
          description: '专业的新闻播报音色'
        },
        {
          id: 'zh_male_xinwen_mars_bigtts',
          name: '新闻男声',
          language: 'zh-CN',
          gender: 'male',
          category: '专业',
          description: '专业的新闻播报音色'
        }
      ]

      return ApiResponse.success(res, voices, '获取音色列表成功')
    } catch (error) {
      console.error('❌ 获取音色列表失败:', error)
      return ApiResponse.error(res, '获取音色列表失败', 'ERROR')
    }
  }

  /**
   * AI智能对话 - 生成个性化话术
   * 通过统一租户系统的AI Bridge API调用AI服务
   */
  async generateAIScript(req: Request, res: Response) {
    try {
      const { customerInfo, callPurpose, context } = req.body

      // 参数验证
      if (!callPurpose) {
        return ApiResponse.error(res, '呼叫目的不能为空', 'VALIDATION_ERROR')
      }

      console.log('🤖 [AI话术生成] 开始生成话术（通过统一租户系统）')
      console.log(`   呼叫目的: ${callPurpose}`)
      console.log(`   客户信息: ${JSON.stringify(customerInfo || {})}`)

      // 构建系统提示词
      const systemPrompt = `你是一位专业的幼儿园招生顾问，擅长与家长沟通。
你的任务是根据客户信息和呼叫目的，生成专业、亲切、有说服力的话术。

话术要求：
1. 语言亲切自然，符合幼儿园场景
2. 突出幼儿园的优势和特色
3. 关注家长的需求和顾虑
4. 引导家长进行下一步行动
5. 避免使用过于商业化的语言
6. 长度控制在100-200字之间`

      // 构建用户提示词
      let userPrompt = `呼叫目的：${callPurpose}\n\n`

      if (customerInfo) {
        userPrompt += `客户信息：\n`
        if (customerInfo.name) userPrompt += `- 姓名：${customerInfo.name}\n`
        if (customerInfo.childAge) userPrompt += `- 孩子年龄：${customerInfo.childAge}\n`
        if (customerInfo.interests) userPrompt += `- 兴趣爱好：${customerInfo.interests}\n`
        if (customerInfo.concerns) userPrompt += `- 关注点：${customerInfo.concerns}\n`
        userPrompt += `\n`
      }

      if (context) {
        userPrompt += `对话上下文：${context}\n\n`
      }

      userPrompt += `请生成一段专业的话术，直接输出话术内容即可，不需要其他说明。`

      // 获取用户认证token（用于调用统一租户系统）
      const authToken = req.headers.authorization?.replace('Bearer ', '') || ''

      // 通过统一租户系统的AI Bridge API调用AI服务
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]

      const response = await unifiedTenantAIClient.chat({
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      }, authToken)

      if (!response.success) {
        console.error('❌ [AI话术生成] 统一租户AI服务返回错误:', response.error)
        return ApiResponse.error(res, response.error || 'AI服务调用失败', 'AI_ERROR')
      }

      const script = response.data?.content || response.data?.message || ''

      console.log('✅ [AI话术生成] 话术生成成功')
      console.log(`   生成内容: ${script.substring(0, 100)}...`)

      return ApiResponse.success(res, {
        script,
        model: '统一租户AI服务',
        timestamp: new Date().toISOString(),
        usage: response.data?.usage
      }, 'AI话术生成成功')
    } catch (error) {
      console.error('❌ AI话术生成失败:', error)
      return ApiResponse.error(res, 'AI话术生成失败', 'ERROR')
    }
  }

  /**
   * 语音识别(ASR) - 将客户语音转为文字
   * 通过统一租户系统的AI Bridge API调用语音识别服务
   */
  async speechToText(req: Request, res: Response) {
    try {
      const audioFile = req.file

      if (!audioFile) {
        return ApiResponse.error(res, '音频文件不能为空', 'VALIDATION_ERROR')
      }

      console.log('🎤 [语音识别] 开始识别语音（通过统一租户系统）')
      console.log(`   文件大小: ${audioFile.size} bytes`)
      console.log(`   文件类型: ${audioFile.mimetype}`)

      // 获取用户认证token
      const authToken = req.headers.authorization?.replace('Bearer ', '') || ''

      // 通过统一租户系统的AI Bridge API调用语音识别服务
      const result = await unifiedTenantAIClient.processAudio({
        file: audioFile.buffer,
        filename: audioFile.originalname,
        action: 'transcribe',
        language: 'zh',
      }, authToken)

      if (!result.success) {
        console.error('❌ [语音识别] 统一租户AI服务返回错误:', result.error)
        return ApiResponse.error(res, result.error || '语音识别服务调用失败', 'AI_ERROR')
      }

      console.log('✅ [语音识别] 识别成功')
      console.log(`   识别文本: ${result.data?.text}`)

      return ApiResponse.success(res, {
        text: result.data?.text || '',
        duration: result.data?.duration,
        language: result.data?.language || 'zh'
      }, '语音识别成功')
    } catch (error) {
      console.error('❌ 语音识别失败:', error)
      return ApiResponse.error(res, '语音识别失败', 'ERROR')
    }
  }

  /**
   * 合规审查 - 检测敏感词和合规性
   */
  async checkCompliance(req: Request, res: Response) {
    try {
      const { content } = req.body

      if (!content) {
        return ApiResponse.error(res, '审查内容不能为空', 'VALIDATION_ERROR')
      }

      console.log('🔍 [合规审查] 开始审查内容')
      console.log(`   内容长度: ${content.length}`)

      // 敏感词库（示例）
      const sensitiveWords = [
        '保证', '承诺', '最好', '第一', '绝对',
        '包过', '包会', '包学会', '保证考上',
        '虚假', '欺骗', '诱导', '强制'
      ]

      // 检测敏感词
      const detectedWords: string[] = []
      const suggestions: string[] = []

      for (const word of sensitiveWords) {
        if (content.includes(word)) {
          detectedWords.push(word)

          // 提供替换建议
          const replacements: { [key: string]: string } = {
            '保证': '努力',
            '承诺': '致力于',
            '最好': '优质',
            '第一': '领先',
            '绝对': '通常',
            '包过': '帮助通过',
            '包会': '帮助掌握',
            '包学会': '帮助学习',
            '保证考上': '助力考试'
          }

          if (replacements[word]) {
            suggestions.push(`建议将"${word}"替换为"${replacements[word]}"`)
          }
        }
      }

      // 计算合规分数
      const complianceScore = Math.max(0, 100 - detectedWords.length * 10)

      // 判断是否合规
      const isCompliant = detectedWords.length === 0

      console.log('✅ [合规审查] 审查完成')
      console.log(`   合规分数: ${complianceScore}`)
      console.log(`   检测到敏感词: ${detectedWords.length}个`)

      return ApiResponse.success(res, {
        isCompliant,
        complianceScore,
        detectedWords,
        suggestions,
        riskLevel: complianceScore >= 80 ? 'low' : complianceScore >= 60 ? 'medium' : 'high'
      }, '合规审查完成')
    } catch (error) {
      console.error('❌ 合规审查失败:', error)
      return ApiResponse.error(res, '合规审查失败', 'ERROR')
    }
  }
}

export default new CallCenterController()

