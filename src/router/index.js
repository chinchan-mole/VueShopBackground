import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
Vue.use(VueRouter)

const routes = [{
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

//这个Vue实例仅仅只是为了调用element ui的弹窗
const vm = new Vue()

//路由导航守卫
//to表示在即将要跳转去的路径，from表示是从哪个路径跳转来的，next为跳转放行函数，可以带一个形参重定向，如果不带形参则放行本次跳转
router.beforeEach((to, from, next) => {
  //如果要去登录页面————放行
  if (to.path === '/login') return next();
  const token = window.sessionStorage.getItem('token');
  ///不是访问登录页面但没有带token，重定向回登录页面并弹出提示信息
  if (!token) {
    vm.$message.error('请先登录！');
    return next('/login')
  }
  //不是访问登录界面且携带有token，则放行本次跳转
  else next();
})
export default router
