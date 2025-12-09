// 课程表相关工具函数

// 课程时间映射（转换为分钟数）
export const classTimeMinutes = {
  1: 8 * 60 + 20, 2: 9 * 60 + 15, 3: 10 * 60 + 20, 4: 11 * 60 + 15,
  5: 14 * 60, 6: 14 * 60 + 55, 7: 15 * 60 + 50, 8: 16 * 60 + 45,
  9: 19 * 60, 10: 19 * 60 + 55, 11: 20 * 60 + 50
}

export const classEndTimeMinutes = {
  1: 9 * 60 + 5, 2: 10 * 60, 3: 11 * 60 + 5, 4: 12 * 60,
  5: 14 * 60 + 45, 6: 15 * 60 + 40, 7: 16 * 60 + 35, 8: 17 * 60 + 30,
  9: 19 * 60 + 45, 10: 20 * 60 + 40, 11: 21 * 60 + 35
}

/**
 * 获取今天的下一节课
 * @param {Object} curriculumStore - 课程表store
 * @returns {Object|null} 下一节课信息或null
 */
export function getNextClass(curriculumStore) {
  if (!curriculumStore.initialized) return null

  const today = new Date()
  const currentHour = today.getHours()
  const currentMinute = today.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute

  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay()

  const todaySchedule = curriculumStore.getWeekSchedule(curriculumStore.todayWeek)
  const todayCourses = todaySchedule[todayWeekday] || []

  if (todayCourses.length === 0) return null

  for (const course of todayCourses) {
    const startTime = classTimeMinutes[course.startClass]
    const endTime = classEndTimeMinutes[course.endClass]
    if (currentTimeMinutes < endTime) {
      return {
        ...course,
        startTimeStr: curriculumStore.classTimeMap[course.startClass],
        endTimeStr: formatEndTime(course.endClass),
        isOngoing: currentTimeMinutes >= startTime
      }
    }
  }
  return null
}

/**
 * 格式化课程结束时间
 * @param {Number} endClass - 结束节次
 * @returns {String} 格式化的时间字符串 (HH:MM)
 */
export function formatEndTime(endClass) {
  const m = classEndTimeMinutes[endClass]
  if (!m) return ''
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}