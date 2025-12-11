import { onMounted, nextTick } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { routeScrollPositions } from '@/router'

/**
 * 通用路由滚动记忆：
 * - 在离开当前路由前记录容器的 scrollTop
 * - 在下次进入该路由并挂载完毕后恢复 scrollTop
 *
 * @param {import('vue').Ref<HTMLElement | null>} containerRef - 负责垂直滚动的容器 ref
 */
export function useRouteScroll(containerRef) {
  const route = useRoute()

  // 恢复滚动位置的核心逻辑
  const restore = async () => {
    await nextTick()

    const el = containerRef?.value
    if (!el) return

    const key = route.name || route.fullPath
    const saved = routeScrollPositions.get(key)
    if (typeof saved === 'number') {
      el.scrollTop = saved
    }
  }

  // 挂载后自动尝试一次
  onMounted(restore)

  // 离开当前路由时记录滚动位置
  onBeforeRouteLeave((to, from, next) => {
    const el = containerRef?.value
    if (el) {
      const key = from.name || from.fullPath
      routeScrollPositions.set(key, el.scrollTop)
    }
    next()
  })

  return { restore }
}
