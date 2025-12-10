import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const isGranted = ref(false)
const errorMessage = ref('')

let idSeed = Date.now() % 2147483647
const nextId = () => {
  idSeed = (idSeed + 1) % 2147483647
  return idSeed || 1
}

export function useLocalNotifications() {
  async function requestPermission() {
    if (!Capacitor.isNativePlatform()) {
      errorMessage.value = '当前在浏览器环境，无法测试原生本地通知，请在 Android 真机或模拟器上测试。'
      console.warn(errorMessage.value)
      return false
    }

    const perms = await LocalNotifications.checkPermissions()
    if (perms.display === 'granted') {
      isGranted.value = true
      return true
    }

    const result = await LocalNotifications.requestPermissions()
    if (result.display === 'granted') {
      isGranted.value = true
      errorMessage.value = ''
      return true
    } else {
      errorMessage.value = '用户未授予通知权限'
      console.warn(errorMessage.value)
      return false
    }
  }

  // 通用：在指定时间点安排一条通知（单次）
  async function scheduleNotificationAt({ title, body, at }) {
    if (!(await requestPermission())) return null
    const now = Date.now()
    const time = at instanceof Date ? at.getTime() : new Date(at).getTime()
    if (Number.isNaN(time) || time <= now) {
      console.log('忽略一个过去时间的通知:', title, body, at)
      return null
    }

    const id = nextId()

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: {
            at: new Date(time),
          },
        },
      ],
    })

    console.log('已安排本地通知:', { id, title, body, at: new Date(time) })
    return id
  }

  // 通用：每天固定时间重复通知（例如每天 8:00）
  async function scheduleDailyAt({ title, body, hour, minute }) {
    if (!(await requestPermission())) return null

    const id = nextId()

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: {
            every: 'day',
            on: {
              hour,
              minute,
            },
          },
        },
      ],
    })

    console.log('已安排每日重复通知:', { id, title, body, hour, minute })
    return id
  }

  // 兼容之前的“几秒后”测试接口（可留可删）
  async function scheduleNotificationInSeconds(seconds = 5) {
    const at = new Date(Date.now() + seconds * 1000)
    return scheduleNotificationAt({
      title: '本地提醒',
      body: `这是 ${seconds} 秒后触发的本地通知`,
      at,
    })
  }

  return {
    isGranted,
    errorMessage,
    requestPermission,
    scheduleNotificationAt,
    scheduleDailyAt,
    scheduleNotificationInSeconds,
  }
}