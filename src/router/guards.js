// 路由守卫配置
import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 学海智航` : '学海智航'

    // 检查是否需要认证
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      // 未登录，重定向到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
      // 已登录用户访问登录/注册页，重定向到首页
      next({ name: 'Home' })
    } else {
      next()
    }
  })

  // 全局后置守卫
  router.afterEach(() => {
    // 页面切换后滚动到顶部
    window.scrollTo(0, 0)
  })
}
