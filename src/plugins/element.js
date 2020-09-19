import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message
} from 'element-ui'

Vue.use(Button) //按钮组件
Vue.use(Form) //表单组件
Vue.use(FormItem) //表单组件
Vue.use(Input) //表单输入组件
Vue.prototype.$message = Message //挂载弹窗提示组件
