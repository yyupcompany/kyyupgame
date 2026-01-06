/**
 * 页面元素扫描服务
 * 提供实时DOM结构分析和页面状态检测功能
 */

export interface PageElement {
  id?: string;
  tagName: string;
  className?: string;
  text?: string;
  type?: string;
  placeholder?: string;
  href?: string;
  src?: string;
  selector: string;
  role?: string;
  ariaLabel?: string;
  isInteractive: boolean;
  children?: PageElement[];
}

export interface FormField {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  selector: string;
  value?: string;
}

export interface PageState {
  url: string;
  title: string;
  forms: FormField[];
  buttons: PageElement[];
  links: PageElement[];
  inputs: PageElement[];
  interactiveElements: PageElement[];
  mainContent: string;
  notifications: string[];
  loadingStates: string[];
  errors: string[];
}

export interface AvailableAction {
  type: 'click' | 'input' | 'submit' | 'navigate' | 'select';
  element: string;
  selector: string;
  description: string;
  parameters?: Record<string, any>;
}

export class PageElementScannerService {
  private static instance: PageElementScannerService;

  public static getInstance(): PageElementScannerService {
    if (!PageElementScannerService.instance) {
      PageElementScannerService.instance = new PageElementScannerService();
    }
    return PageElementScannerService.instance;
  }

  /**
   * 扫描页面元素结构
   */
  public async scanPageElements(): Promise<PageElement[]> {
    try {
      const elements: PageElement[] = [];
      
      // 扫描主要交互元素
      const interactiveSelectors = [
        'button',
        'input',
        'select',
        'textarea',
        'a[href]',
        '[role="button"]',
        '[role="link"]',
        '[role="menuitem"]',
        '[onclick]',
        '[data-action]',
        '.btn',
        '.button',
        '.link',
        '.nav-item',
        '.menu-item'
      ];

      for (const selector of interactiveSelectors) {
        const nodeList = document.querySelectorAll(selector);
        nodeList.forEach((element, index) => {
          const pageElement = this.elementToPageElement(element as HTMLElement, selector, index);
          if (pageElement) {
            elements.push(pageElement);
          }
        });
      }

      console.log('🔍 页面元素扫描完成:', { 总数: elements.length });
      return elements;
    } catch (error) {
      console.error('❌ 页面元素扫描失败:', error);
      return [];
    }
  }

  /**
   * 获取页面表单字段信息
   */
  public async getFormFields(): Promise<FormField[]> {
    try {
      const formFields: FormField[] = [];
      
      // 扫描所有表单元素
      const forms = document.querySelectorAll('form');
      
      forms.forEach((form, formIndex) => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach((input, inputIndex) => {
          const htmlInput = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          
          // 查找关联的label
          let label = '';
          const labelElement = form.querySelector(`label[for="${htmlInput.id}"]`) as HTMLLabelElement;
          if (labelElement) {
            label = labelElement.textContent?.trim() || '';
          } else {
            // 尝试查找父级label
            const parentLabel = htmlInput.closest('label');
            if (parentLabel) {
              label = parentLabel.textContent?.replace(htmlInput.value || '', '').trim() || '';
            }
          }

          const formField: FormField = {
            name: htmlInput.name || `field_${formIndex}_${inputIndex}`,
            type: (htmlInput as HTMLInputElement).type || htmlInput.tagName.toLowerCase(),
            label: label || htmlInput.getAttribute('placeholder') || '',
            placeholder: htmlInput.getAttribute('placeholder') || '',
            required: htmlInput.hasAttribute('required'),
            selector: this.generateSelector(htmlInput),
            value: htmlInput.value || ''
          };

          formFields.push(formField);
        });
      });

      console.log('📋 表单字段扫描完成:', { 字段数: formFields.length });
      return formFields;
    } catch (error) {
      console.error('❌ 表单字段扫描失败:', error);
      return [];
    }
  }

  /**
   * 获取页面可用操作
   */
  public async getAvailableActions(): Promise<AvailableAction[]> {
    try {
      const actions: AvailableAction[] = [];
      
      // 按钮操作
      const buttons = document.querySelectorAll('button, [role="button"], .btn, .button');
      buttons.forEach(button => {
        const text = button.textContent?.trim() || '';
        if (text && !button.hasAttribute('disabled')) {
          actions.push({
            type: 'click',
            element: text,
            selector: this.generateSelector(button as HTMLElement),
            description: `点击按钮: ${text}`
          });
        }
      });

      // 链接操作
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        const text = link.textContent?.trim() || '';
        const href = link.getAttribute('href') || '';
        if (text && href && !href.startsWith('#')) {
          actions.push({
            type: 'navigate',
            element: text,
            selector: this.generateSelector(link as HTMLElement),
            description: `导航到: ${text}`,
            parameters: { href }
          });
        }
      });

      // 输入操作
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const htmlInput = input as HTMLInputElement;
        const label = this.getInputLabel(htmlInput);
        if (label && !htmlInput.hasAttribute('readonly')) {
          actions.push({
            type: htmlInput.tagName.toLowerCase() === 'select' ? 'select' : 'input',
            element: label,
            selector: this.generateSelector(htmlInput),
            description: `输入${label}`,
            parameters: { 
              type: htmlInput.type,
              placeholder: htmlInput.placeholder
            }
          });
        }
      });

      // 表单提交操作
      const forms = document.querySelectorAll('form');
      forms.forEach((form, _index) => {
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          const text = submitButton.textContent?.trim() || submitButton.getAttribute('value') || '提交';
          actions.push({
            type: 'submit',
            element: text,
            selector: this.generateSelector(form),
            description: `提交表单: ${text}`
          });
        }
      });

      console.log('🎯 可用操作扫描完成:', { 操作数: actions.length });
      return actions;
    } catch (error) {
      console.error('❌ 可用操作扫描失败:', error);
      return [];
    }
  }

  /**
   * 获取当前页面状态
   */
  public async getCurrentPageState(): Promise<PageState> {
    try {
      const [forms, buttons, links, inputs, interactiveElements] = await Promise.all([
        this.getFormFields(),
        this.getElementsByType('button'),
        this.getElementsByType('a[href]'),
        this.getElementsByType('input, textarea, select'),
        this.scanPageElements()
      ]);

      const pageState: PageState = {
        url: window.location.href,
        title: document.title,
        forms,
        buttons,
        links,
        inputs,
        interactiveElements,
        mainContent: this.getMainContent(),
        notifications: this.getNotifications(),
        loadingStates: this.getLoadingStates(),
        errors: this.getErrors()
      };

      console.log('📊 页面状态获取完成:', {
        表单: forms.length,
        按钮: buttons.length,
        链接: links.length,
        输入框: inputs.length,
        交互元素: interactiveElements.length
      });

      return pageState;
    } catch (error) {
      console.error('❌ 页面状态获取失败:', error);
      return {
        url: window.location.href,
        title: document.title,
        forms: [],
        buttons: [],
        links: [],
        inputs: [],
        interactiveElements: [],
        mainContent: '',
        notifications: [],
        loadingStates: [],
        errors: []
      };
    }
  }

  /**
   * 检测页面变化
   */
  public detectPageChanges(previousState: PageState, currentState: PageState): {
    hasChanges: boolean;
    changes: string[];
    newElements: string[];
    removedElements: string[];
  } {
    const changes: string[] = [];
    const newElements: string[] = [];
    const removedElements: string[] = [];

    // 检测URL变化
    if (previousState.url !== currentState.url) {
      changes.push(`页面URL变化: ${previousState.url} -> ${currentState.url}`);
    }

    // 检测标题变化
    if (previousState.title !== currentState.title) {
      changes.push(`页面标题变化: ${previousState.title} -> ${currentState.title}`);
    }

    // 检测表单变化
    const previousFormCount = previousState.forms.length;
    const currentFormCount = currentState.forms.length;
    if (previousFormCount !== currentFormCount) {
      changes.push(`表单数量变化: ${previousFormCount} -> ${currentFormCount}`);
    }

    // 检测新的通知或错误
    const newNotifications = currentState.notifications.filter(n => !previousState.notifications.includes(n));
    const newErrors = currentState.errors.filter(e => !previousState.errors.includes(e));
    
    if (newNotifications.length > 0) {
      changes.push(`新通知: ${newNotifications.join(', ')}`);
      newElements.push(...newNotifications);
    }

    if (newErrors.length > 0) {
      changes.push(`新错误: ${newErrors.join(', ')}`);
      newElements.push(...newErrors);
    }

    return {
      hasChanges: changes.length > 0,
      changes,
      newElements,
      removedElements
    };
  }

  // 私有辅助方法

  private elementToPageElement(element: HTMLElement, _selector: string, _index: number): PageElement | null {
    try {
      const tagName = element.tagName.toLowerCase();
      const text = element.textContent?.trim() || '';
      
      return {
        id: element.id || undefined,
        tagName,
        className: element.className || undefined,
        text: text.length > 100 ? text.substring(0, 100) + '...' : text,
        type: (element as HTMLInputElement).type || undefined,
        placeholder: element.getAttribute('placeholder') || undefined,
        href: element.getAttribute('href') || undefined,
        src: element.getAttribute('src') || undefined,
        selector: this.generateSelector(element),
        role: element.getAttribute('role') || undefined,
        ariaLabel: element.getAttribute('aria-label') || undefined,
        isInteractive: this.isInteractiveElement(element)
      };
    } catch (error) {
      console.warn('元素转换失败:', error);
      return null;
    }
  }

  private async getElementsByType(selector: string): Promise<PageElement[]> {
    const elements: PageElement[] = [];
    const nodeList = document.querySelectorAll(selector);
    
    nodeList.forEach((element, index) => {
      const pageElement = this.elementToPageElement(element as HTMLElement, selector, index);
      if (pageElement) {
        elements.push(pageElement);
      }
    });

    return elements;
  }

  private generateSelector(element: HTMLElement): string {
    // 优先使用ID
    if (element.id) {
      return `#${element.id}`;
    }

    // 使用class
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 2);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    // 使用data属性
    const dataAction = element.getAttribute('data-action');
    if (dataAction) {
      return `[data-action="${dataAction}"]`;
    }

    // 使用name属性
    const name = element.getAttribute('name');
    if (name) {
      return `[name="${name}"]`;
    }

    // 使用标签名和文本内容
    const text = element.textContent?.trim();
    if (text && text.length < 50) {
      return `${element.tagName.toLowerCase()}:contains("${text}")`;
    }

    // 最后使用标签名和位置
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
      const index = siblings.indexOf(element);
      return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
    }

    return element.tagName.toLowerCase();
  }

  private getInputLabel(input: HTMLInputElement): string {
    // 查找关联的label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
      if (label) {
        return label.textContent?.trim() || '';
      }
    }

    // 查找父级label
    const parentLabel = input.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.replace(input.value || '', '').trim() || '';
    }

    // 使用placeholder
    if (input.placeholder) {
      return input.placeholder;
    }

    // 使用name属性
    if (input.name) {
      return input.name.replace(/[_-]/g, ' ');
    }

    return '未知字段';
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'tab'];
    
    return (
      interactiveTags.includes(element.tagName.toLowerCase()) ||
      interactiveRoles.includes(element.getAttribute('role') || '') ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('data-action') ||
      element.classList.contains('btn') ||
      element.classList.contains('button') ||
      element.classList.contains('clickable')
    );
  }

  private getMainContent(): string {
    const mainSelectors = ['main', '[role="main"]', '.main-content', '.content', '#content'];
    
    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        return text.length > 500 ? text.substring(0, 500) + '...' : text;
      }
    }

    // 回退到body内容
    const bodyText = document.body.textContent?.trim() || '';
    return bodyText.length > 500 ? bodyText.substring(0, 500) + '...' : bodyText;
  }

  private getNotifications(): string[] {
    const notifications: string[] = [];
    const notificationSelectors = [
      '.notification',
      '.alert',
      '.message',
      '.toast',
      '.el-message',
      '.el-notification',
      '[role="alert"]',
      '.success',
      '.warning',
      '.info'
    ];

    notificationSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
          notifications.push(text);
        }
      });
    });

    return notifications;
  }

  private getLoadingStates(): string[] {
    const loadingStates: string[] = [];
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.el-loading',
      '[data-loading="true"]',
      '.is-loading'
    ];

    loadingSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        loadingStates.push(`检测到${elements.length}个加载状态元素`);
      }
    });

    return loadingStates;
  }

  private getErrors(): string[] {
    const errors: string[] = [];
    const errorSelectors = [
      '.error',
      '.el-form-item__error',
      '.field-error',
      '.has-error',
      '[role="alert"]'
    ];

    errorSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 0 && !text.includes('成功')) {
          errors.push(text);
        }
      });
    });

    return errors;
  }
}

/**
 * 页面元素扫描服务实例
 */
export const pageElementScannerService = PageElementScannerService.getInstance();


