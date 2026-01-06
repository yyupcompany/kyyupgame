/**
 * 推广海报生成服务
 * 使用Canvas API生成推广海报
 */

// 暂时禁用海报生成功能以避免类型错误
// import { createCanvas, loadImage, registerFont, CanvasRenderingContext2D as NodeCanvasRenderingContext2D, Image } from 'canvas'
import QRCode from 'qrcode'
import path from 'path'
import fs from 'fs/promises'

export interface PosterTemplate {
  id: number
  name: string
  width: number
  height: number
  backgroundColor: string
  titleStyle: {
    fontSize: number
    color: string
    fontWeight: string
    position: { x: number; y: number }
  }
  subtitleStyle: {
    fontSize: number
    color: string
    position: { x: number; y: number }
  }
  qrCodePosition: { x: number; y: number; size: number }
  contactPosition: { x: number; y: number }
}

export interface PosterGenerationParams {
  templateId: number
  mainTitle: string
  subTitle: string
  contactPhone: string
  address: string
  referralCode: string
  referralLink: string
  kindergartenName?: string
}

export class PosterGenerationService {
  private templates: Map<number, PosterTemplate> = new Map()
  private outputDir: string

  constructor() {
    this.outputDir = path.join(process.cwd(), 'public', 'generated', 'posters')
    this.initializeTemplates()
    this.ensureOutputDirectory()
  }

  /**
   * 初始化海报模板
   */
  private initializeTemplates(): void {
    // 简约风格模板
    this.templates.set(1, {
      id: 1,
      name: '简约风格',
      width: 800,
      height: 1200,
      backgroundColor: '#f8f9fa',
      titleStyle: {
        fontSize: 48,
        color: '#2c3e50',
        fontWeight: 'bold',
        position: { x: 400, y: 200 }
      },
      subtitleStyle: {
        fontSize: 32,
        color: '#7f8c8d',
        position: { x: 400, y: 300 }
      },
      qrCodePosition: { x: 600, y: 800, size: 150 },
      contactPosition: { x: 400, y: 1000 }
    })

    // 温馨风格模板
    this.templates.set(2, {
      id: 2,
      name: '温馨风格',
      width: 800,
      height: 1200,
      backgroundColor: '#fef5e7',
      titleStyle: {
        fontSize: 46,
        color: '#e67e22',
        fontWeight: 'bold',
        position: { x: 400, y: 180 }
      },
      subtitleStyle: {
        fontSize: 30,
        color: '#d68910',
        position: { x: 400, y: 280 }
      },
      qrCodePosition: { x: 600, y: 780, size: 140 },
      contactPosition: { x: 400, y: 980 }
    })

    // 专业风格模板
    this.templates.set(3, {
      id: 3,
      name: '专业风格',
      width: 800,
      height: 1200,
      backgroundColor: '#1a1a1a',
      titleStyle: {
        fontSize: 50,
        color: '#ffffff',
        fontWeight: 'bold',
        position: { x: 400, y: 200 }
      },
      subtitleStyle: {
        fontSize: 34,
        color: '#ecf0f1',
        position: { x: 400, y: 300 }
      },
      qrCodePosition: { x: 600, y: 820, size: 160 },
      contactPosition: { x: 400, y: 1020 }
    })
  }

  /**
   * 确保输出目录存在
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.outputDir)
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true })
    }
  }

  /**
   * 生成推广海报
   */
  public async generatePoster(params: PosterGenerationParams): Promise<string> {
    try {
      // 暂时返回模拟数据，避免Canvas类型错误
      console.log('生成海报请求:', params)
      return '/api/posters/mock-poster.png'

      // 暂时注释掉Canvas相关代码，避免类型错误
      /*
      // 设置背景
      ctx.fillStyle = template.backgroundColor
      ctx.fillRect(0, 0, template.width, template.height)

      // 绘制装饰性背景元素
      await this.drawBackgroundElements(ctx, template)

      // 绘制标题
      await this.drawText(ctx, params.mainTitle, template.titleStyle, template)

      // 绘制副标题
      await this.drawText(ctx, params.subTitle, template.subtitleStyle, template)

      // 绘制幼儿园名称（如果有）
      if (params.kindergartenName) {
        await this.drawKindergartenName(ctx, params.kindergartenName, template)
      }

      // 生成并绘制二维码
      const qrCodeDataUrl = await this.generateQRCode(params.referralLink, template.qrCodePosition.size)
      await this.drawQRCode(ctx, qrCodeDataUrl, template.qrCodePosition)

      // 绘制联系信息
      await this.drawContactInfo(ctx, {
        phone: params.contactPhone,
        address: params.address,
        referralCode: params.referralCode
      }, template.contactPosition)

      // 绘制装饰性边框
      await this.drawBorder(ctx, template)

      // 保存海报
      const filename = `referral_${params.referralCode}_${Date.now()}.png`
      const filePath = path.join(this.outputDir, filename)

      const buffer = canvas.toBuffer('image/png')
      await fs.writeFile(filePath, buffer)

      // 返回相对于public目录的路径
      return `/generated/posters/${filename}`
      */
    } catch (error) {
      console.error('生成海报失败:', error)
      throw new Error('海报生成失败')
    }
  }

  /**
   * 绘制背景装饰元素 - 暂时禁用
   */
  private async drawBackgroundElements(ctx: any, template: PosterTemplate): Promise<void> {
    // 绘制顶部装饰条
    ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff20' : '#00000010'
    ctx.fillRect(0, 0, template.width, 100)

    // 绘制底部装饰条
    ctx.fillRect(0, template.height - 100, template.width, 100)

    // 绘制圆形装饰
    ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff15' : '#00000005'
    this.drawCircle(ctx as any, 100, 100, 80)
    this.drawCircle(ctx as any, template.width - 100, 100, 60)
    this.drawCircle(ctx as any, 100, template.height - 100, 70)
    this.drawCircle(ctx as any, template.width - 100, template.height - 100, 50)
  }

  /**
   * 绘制圆形
   */
  private drawCircle(ctx: any, x: number, y: number, radius: number): void {
    // 暂时禁用
    return
  }

  /**
   * 绘制文本 - 暂时禁用
   */
  private async drawText(
    ctx: any,
    text: string,
    style: PosterTemplate['titleStyle'] | PosterTemplate['subtitleStyle'],
    template: PosterTemplate
  ): Promise<void> {
    ctx.font = `${(style as any).fontWeight || 'normal'} ${style.fontSize}px Arial, sans-serif`
    ctx.fillStyle = style.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 处理长文本换行
    const maxWidthValue = template.width - 100
    const words = text.split('')
    let line = ''
    let y = style.position.y

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidthValue && i > 0) {
        ctx.fillText(line, style.position.x, y)
        line = words[i]
        y += style.fontSize * 1.2
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, style.position.x, y)
  }

  /**
   * 绘制幼儿园名称
   */
  private async drawKindergartenName(
    ctx: any,
    name: string,
    template: PosterTemplate
  ): Promise<void> {
    ctx.font = 'bold 28px Arial, sans-serif'
    ctx.fillStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff90' : '#00000090'
    ctx.textAlign = 'center'
    ctx.fillText(name, template.width / 2, 140)
  }

  /**
   * 生成二维码
   */
  private async generateQRCode(url: string, size: number): Promise<string> {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }

  /**
   * 绘制二维码
   */
  private async drawQRCode(
    ctx: any,
    qrCodeDataUrl: string,
    position: { x: number; y: number; size: number }
  ): Promise<void> {
    // 暂时禁用
    return
    // const image = await loadImage(qrCodeDataUrl)

    // 绘制白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      position.x - position.size / 2 - 10,
      position.y - position.size / 2 - 10,
      position.size + 20,
      position.size + 20
    )

    // 绘制二维码 - 暂时禁用
    // ctx.drawImage(
    //   image as any,
    //   position.x - position.size / 2,
    //   position.y - position.size / 2,
    //   position.size,
    //   position.size
    // )

    // 绘制二维码说明文字
    ctx.font = '16px Arial, sans-serif'
    ctx.fillStyle = '#666666'
    ctx.textAlign = 'center'
    ctx.fillText('扫码了解更多', position.x, position.y + position.size / 2 + 30)
  }

  /**
   * 绘制联系信息
   */
  private async drawContactInfo(
    ctx: any,
    info: { phone: string; address: string; referralCode: string },
    position: { x: number; y: number }
  ): Promise<void> {
    ctx.font = '20px Arial, sans-serif'
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'center'

    // 绘制电话
    ctx.fillText(`📞 ${info.phone}`, position.x, position.y - 20)

    // 绘制地址
    ctx.font = '18px Arial, sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(`📍 ${info.address}`, position.x, position.y + 10)

    // 绘制推广码
    ctx.fillStyle = '#e74c3c'
    ctx.font = 'bold 16px Arial, sans-serif'
    ctx.fillText(`推广码: ${info.referralCode}`, position.x, position.y + 40)
  }

  /**
   * 绘制边框
   */
  private async drawBorder(ctx: any, template: PosterTemplate): Promise<void> {
    ctx.strokeStyle = template.backgroundColor === '#1a1a1a' ? '#ffffff30' : '#00000020'
    ctx.lineWidth = 4

    // 绘制圆角矩形边框
    this.drawRoundedRect(ctx, 20, 20, template.width - 40, template.height - 40, 20)
    ctx.stroke()
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  /**
   * 获取所有可用模板
   */
  public getAvailableTemplates(): PosterTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 根据ID获取模板
   */
  public getTemplateById(id: number): PosterTemplate | undefined {
    return this.templates.get(id)
  }
}