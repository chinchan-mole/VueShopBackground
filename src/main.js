import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 树形结构
import Zktable from 'vue-table-with-tree-grid'
// 网页文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 引入NProgress进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/css/removeEleRequire.css'
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 拦截器解释request表示请求时的拦截器，respons表示完成请求的拦截器 每个拦截器有一个use方法，内置一个形参config请求/返回体对象，拦截器的主要作用处理该对象，处理结束后必须return该对象
axios.interceptors.request.use(config => {
  NProgress.start()
  // 同时利用axios的路由拦截器为请求头挂载令牌验证字段
  const token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 将axios引入到Vue的原型中，以便在每个Vue实例/组件中通过this.$axios即可访问axios
Vue.prototype.$axios = axios
Vue.use(Zktable)
Vue.use(VueQuillEditor /* { default global options } */)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
