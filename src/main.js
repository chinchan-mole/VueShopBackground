import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/css/removeEleRequire.css'
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false
//axios的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//将axios引入到Vue的原型中，以便在每个Vue实例/组件中通过this.$axios即可访问axios
Vue.prototype.$axios = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
