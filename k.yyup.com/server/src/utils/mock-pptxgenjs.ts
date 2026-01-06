/**
 * 模拟pptxgenjs库的实现
 * 用于在真实pptxgenjs库安装之前提供基本功能
 */

export class PptxGenJS {
  private slides: any[] = [];
  private title: string = '';
  private author: string = '';

  constructor() {
    this.slides = [];
  }

  /**
   * 添加幻灯片
   */
  addSlide(): MockSlide {
    const slide = new MockSlide();
    this.slides.push(slide);
    return slide;
  }

  /**
   * 设置演示文稿属性
   */
  setTitle(title: string): void {
    this.title = title;
  }

  setAuthor(author: string): void {
    this.author = author;
  }

  /**
   * 写入文件
   */
  async writeFile(options: { outputType: string }): Promise<Buffer> {
    let content = `PPT演示文稿内容:

标题: ${this.title}
作者: ${this.author}
生成时间: ${new Date().toISOString()}
幻灯片数量: ${this.slides.length}

`;

    this.slides.forEach((slide, index) => {
      content += `=== 幻灯片 ${index + 1} ===\n`;
      content += slide.getContent();
      content += '\n';
    });

    content += '\n---\n注意: 这是模拟生成的PPT演示文稿内容。\n实际实现中应该使用真实的pptxgenjs库生成PowerPoint文档文件。\n';

    return Buffer.from(content, 'utf8');
  }
}

export class MockSlide {
  private elements: any[] = [];

  /**
   * 添加文本
   */
  addText(text: string, options: any = {}): void {
    this.elements.push({
      type: 'text',
      content: text,
      options: {
        x: options.x || 1,
        y: options.y || 1,
        w: options.w || 8,
        h: options.h || 1,
        fontSize: options.fontSize || 18,
        bold: options.bold || false,
        align: options.align || 'left',
        color: options.color || '#000000'
      }
    });
  }

  /**
   * 添加图片
   */
  addImage(options: any): void {
    this.elements.push({
      type: 'image',
      options: {
        path: options.path,
        x: options.x || 1,
        y: options.y || 1,
        w: options.w || 4,
        h: options.h || 3
      }
    });
  }

  /**
   * 添加表格
   */
  addTable(data: any[][], options: any = {}): void {
    this.elements.push({
      type: 'table',
      data: data,
      options: {
        x: options.x || 1,
        y: options.y || 1,
        w: options.w || 8,
        h: options.h || 4,
        fontSize: options.fontSize || 14
      }
    });
  }

  /**
   * 添加形状
   */
  addShape(type: string, options: any = {}): void {
    this.elements.push({
      type: 'shape',
      shapeType: type,
      options: {
        x: options.x || 1,
        y: options.y || 1,
        w: options.w || 2,
        h: options.h || 1,
        fill: options.fill || '#4472C4',
        line: options.line || '#000000'
      }
    });
  }

  /**
   * 获取幻灯片内容（用于模拟输出）
   */
  getContent(): string {
    let content = '';
    
    this.elements.forEach((element, index) => {
      switch (element.type) {
        case 'text':
          content += `文本${index + 1}: ${element.content}\n`;
          content += `  位置: (${element.options.x}, ${element.options.y})\n`;
          content += `  大小: ${element.options.fontSize}pt\n`;
          if (element.options.bold) content += `  样式: 粗体\n`;
          break;
          
        case 'image':
          content += `图片${index + 1}: ${element.options.path}\n`;
          content += `  位置: (${element.options.x}, ${element.options.y})\n`;
          content += `  尺寸: ${element.options.w} x ${element.options.h}\n`;
          break;
          
        case 'table':
          content += `表格${index + 1}:\n`;
          element.data.forEach((row: any[], rowIndex: number) => {
            content += `  行${rowIndex + 1}: ${row.join(' | ')}\n`;
          });
          break;
          
        case 'shape':
          content += `形状${index + 1}: ${element.shapeType}\n`;
          content += `  位置: (${element.options.x}, ${element.options.y})\n`;
          content += `  填充: ${element.options.fill}\n`;
          break;
      }
      content += '\n';
    });

    return content;
  }
}

// 导出默认的模拟实现
export default PptxGenJS;
