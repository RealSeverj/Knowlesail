// 日期处理工具函数

/**
 * 获取当前日期信息
 * @returns {Object} 包含月份、日期、星期几的对象
 */
export function getCurrentDateInfo() {
  const today = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekDay = weekDays[today.getDay()]
  return { month, day, weekDay }
}

/**
 * 格式化课程结束时间
 * @param {Number} endClass - 结束节次
 * @returns {String} 格式化的时间字符串 (HH:MM)
 */
export function formatEndTime(endClass) {
  const classEndTimeMinutes = {
    1: 9 * 60 + 5,
    2: 10 * 60,
    3: 11 * 60 + 5,
    4: 12 * 60,
    5: 14 * 60 + 45,
    6: 15 * 60 + 40,
    7: 16 * 60 + 35,
    8: 17 * 60 + 30,
    9: 19 * 60 + 45,
    10: 20 * 60 + 40,
    11: 21 * 60 + 35
  }

  const m = classEndTimeMinutes[endClass]
  if (!m) return ''
  return `${Math.floor(m / 60)
    .toString()
    .padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}
