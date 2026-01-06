/**
 * Vant 4 移动端UI组件库配置
 * 提供完整的企业级移动端解决方案
 */

import { App } from 'vue'

// 基础组件
import {
  // 基础
  Button,
  Cell,
  CellGroup,
  ConfigProvider,
  // 布局
  Col,
  Row,
  // 导航
  NavBar,
  Tabs,
  Tab,
  Tabbar,
  TabbarItem,
  Sidebar,
  SidebarItem,
  // 反馈
  Toast,
  Dialog,
  ActionSheet,
  // 展示
  Card,
  Tag,
  Progress,
  Badge,
  Icon,
  Image as VanImage,
  // 表单
  Form,
  Field,
  Search,
  // 数据展示
  List,
  PullRefresh,
  // 业务组件
  BackTop,
  DropdownMenu,
  DropdownItem,
  ActionBar,
  ActionBarButton,
  ActionBarIcon,
  FloatingPanel,
  // 加载
  Loading,
  Empty
} from 'vant'

// Vant CSS
import 'vant/lib/index.css'

export function setupVant(app: App) {
  // 注册基础组件
  const components = [
    // 基础
    Button,
    Cell,
    CellGroup,
    ConfigProvider,
    // 布局
    Col,
    Row,
    // 导航
    NavBar,
    Tabs,
    Tab,
    Tabbar,
    TabbarItem,
    Sidebar,
    SidebarItem,
    // 反馈
    Toast,
    Dialog,
    ActionSheet,
    // 展示
    Card,
    Tag,
    Progress,
    Badge,
    Icon,
    VanImage,
    // 表单
    Form,
    Field,
    Search,
    // 数据展示
    List,
    PullRefresh,
    // 业务组件
    BackTop,
    DropdownMenu,
    DropdownItem,
    ActionBar,
    ActionBarButton,
    ActionBarIcon,
    FloatingPanel,
    // 加载
    Loading,
    Empty
  ]

  components.forEach((component) => {
    if (component.name) {
      app.component(component.name as string, component)
    }
  })

  // 全局配置
  // Toast 默认配置
  app.config.globalProperties.$toast = Toast
  app.config.globalProperties.$dialog = Dialog
  app.config.globalProperties.$actionSheet = ActionSheet

  // Vant 4不再使用setDefaultOptions，改用其他方式
  // Toast和Dialog默认配置通过调用时传递参数
  console.log('✅ Vant 4组件已注册')
}

export default setupVant
