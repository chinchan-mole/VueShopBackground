import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  MenuItem,
  Submenu,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  Popconfirm,
  Calendar,
  Tag,
  MessageBox,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane,
  Step,
  Steps,
  CheckboxGroup,
  Checkbox,
  Upload,
  Image,
  Notification,
  Timeline,
  TimelineItem
} from 'element-ui'

// 注册按钮组件
Vue.use(Button)
// 表单组件
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 布局组件
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
// 挂载弹窗提示组件
Vue.prototype.$message = Message
Vue.prototype.$messagebox = MessageBox
// 侧边栏
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
// 面包屑导航
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
// 卡片面板
Vue.use(Card)
// layer布局ue.use(Table)
Vue.use(Row)
Vue.use(Col)
// 表格
Vue.use(Table)
Vue.use(TableColumn)
// 开关
Vue.use(Switch)
// 文字提示
Vue.use(Tooltip)
// 分页
Vue.use(Pagination)
// 对话框
Vue.use(Dialog)
// 气泡确认
Vue.use(Popconfirm)
// 日历
Vue.use(Calendar)
// 标签
Vue.use(Tag)
// 树形结构
Vue.use(Tree)
// 下拉选择菜单
Vue.use(Select)
Vue.use(Option)
// 级联选择
Vue.use(Cascader)
// 警告提示
Vue.use(Alert)
// 页签
Vue.use(Tabs)
Vue.use(TabPane)
// 步骤条
Vue.use(Step)
Vue.use(Steps)
// 多选框组
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
// 上传组件
Vue.use(Upload)
// 图片
Vue.use(Image)
// 通知
Vue.prototype.$notify = Notification
// 时间线
Vue.use(Timeline)
Vue.use(TimelineItem)
