import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCourseList, getCurrentTerm, getTermInfo } from '@/api/curriculum'
import { STORAGE_KEYS, getItem, setItem } from '@/utils/storage'

export const useCurriculumStore = defineStore('curriculum', () => {
  // 课程列表
  const courses = ref([])

  // 当前选中的周次，默认第 1 周
  const currentWeek = ref(1)

  // 是否正在从后端加载课程
  const loading = ref(false)

  // 是否已从缓存/后端初始化过
  const initialized = ref(false)

  // 学期信息
  const termInfo = ref(null)

  // 学期开始日期（正式上课的第一天，周一）
  const termStartDate = computed(() => {
    if (!termInfo.value?.events) return null
    const startEvent = termInfo.value.events.find((e) => e.name === '正式上课')
    if (!startEvent) return null
    const startDate = new Date(startEvent.startDate)
    // 获取这一天所在周的周一
    const day = startDate.getDay() // 0=周日, 1=周一, ...
    const diff = day === 0 ? -6 : 1 - day // 计算到周一的天数差
    const monday = new Date(startDate)
    monday.setDate(startDate.getDate() + diff)
    return monday
  })

  // 学期最大周数（期末考试结束日期所在周）
  const maxWeek = computed(() => {
    if (!termInfo.value?.events || !termStartDate.value) return 20
    const endEvent = termInfo.value.events.find((e) => e.name === '期末考试')
    if (!endEvent) return 20
    const endDate = new Date(endEvent.endDate)
    const diffTime = endDate.getTime() - termStartDate.value.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.ceil((diffDays + 1) / 7)
  })

  // 学期事件列表（用于展示）
  const termEvents = computed(() => {
    if (!termInfo.value?.events) return []
    return termInfo.value.events.filter((e) => e.name !== '正式上课')
  })

  // 今天所在的周次
  const todayWeek = computed(() => {
    if (!termStartDate.value) return 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(termStartDate.value)
    start.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const week = Math.floor(diffDays / 7) + 1
    // 限制在有效范围内
    if (week < 1) return 1
    if (week > maxWeek.value) return maxWeek.value
    return week
  })

  // 今天是周几（1-7，周一到周日）
  const todayWeekday = computed(() => {
    const day = new Date().getDay()
    return day === 0 ? 7 : day
  })

  // 每节课对应的时间段展示（可在页面使用）
  const classTimeMap = {
    1: '08:20',
    2: '09:15',
    3: '10:20',
    4: '11:15',
    5: '14:00',
    6: '14:55',
    7: '15:50',
    8: '16:45',
    9: '19:00',
    10: '19:55',
    11: '20:50'
  }

  // 从 localStorage 加载缓存的课程
  function loadFromStorage() {
    const cached = getItem(STORAGE_KEYS.CURRICULUM_COURSES, [])
    const localCourses = getItem(STORAGE_KEYS.CURRICULUM_LOCAL_COURSES, [])

    if (Array.isArray(cached)) {
      courses.value = cached
    }

    // 合并本地添加的课程
    if (Array.isArray(localCourses)) {
      // 将本地课程添加到列表中（如果不存在）
      localCourses.forEach((localCourse) => {
        const exists = courses.value.some((c) => c.id === localCourse.id)
        if (!exists) {
          courses.value.push(localCourse)
        }
      })
    }

    return courses.value.length > 0
  }

  // 从 localStorage 加载学期信息
  function loadTermInfoFromStorage() {
    const cached = getItem(STORAGE_KEYS.CURRICULUM_TERM_INFO, null)
    if (cached && cached.term === currentTerm.value) {
      termInfo.value = cached
      return true
    }
    return false
  }

  // 保存学期信息到 localStorage
  function saveTermInfoToStorage() {
    if (termInfo.value) {
      setItem(STORAGE_KEYS.CURRICULUM_TERM_INFO, termInfo.value)
    }
  }

  // 保存课程到 localStorage
  function saveToStorage() {
    // 分离后端课程和本地课程
    const remoteCourses = courses.value.filter((c) => !c.isLocal)
    const localCourses = courses.value.filter((c) => c.isLocal)

    setItem(STORAGE_KEYS.CURRICULUM_COURSES, remoteCourses)
    setItem(STORAGE_KEYS.CURRICULUM_LOCAL_COURSES, localCourses)
  }

  // 保存本地添加的课程
  function saveLocalCourses() {
    const localCourses = courses.value.filter((c) => c.isLocal)
    setItem(STORAGE_KEYS.CURRICULUM_LOCAL_COURSES, localCourses)
  }

  // 获取本地添加的课程
  function getLocalCourses() {
    return getItem(STORAGE_KEYS.CURRICULUM_LOCAL_COURSES, [])
  }

  // 根据给定周次计算按星期分组的课程安排
  function getWeekSchedule(weekNo) {
    const result = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: []
    }

    if (!weekNo || weekNo < 1) {
      return result
    }

    courses.value.forEach((course) => {
      course.scheduleRules?.forEach((rule, ruleIndex) => {
        const inWeekRange = weekNo >= rule.startWeek && weekNo <= rule.endWeek
        if (!inWeekRange) return

        // 单双周过滤
        const isOddWeek = weekNo % 2 === 1
        if (isOddWeek && !rule.single) return
        if (!isOddWeek && !rule.double) return

        const key = rule.weekday
        if (!result[key]) return

        result[key].push({
          courseId: course.id,
          ruleIndex,
          name: course.name,
          teacher: course.teacher,
          location: rule.location,
          startClass: rule.startClass,
          endClass: rule.endClass,
          startWeek: rule.startWeek,
          endWeek: rule.endWeek,
          weekday: rule.weekday,
          single: rule.single,
          double: rule.double,
          adjust: rule.adjust
        })
      })
    })

    Object.keys(result).forEach((day) => {
      result[day].sort((a, b) => a.startClass - b.startClass)
    })

    return result
  }

  // 仍然保留当前周的计算，方便其他地方直接使用
  const weekSchedule = computed(() => getWeekSchedule(currentWeek.value))

  // 当前学期
  const currentTerm = ref(getCurrentTerm())

  /**
   * 初始化课程表
   * 首先尝试从 localStorage 加载，如果没有缓存则从后端获取
   */
  async function initCourses() {
    if (initialized.value) return

    // 尝试从缓存加载
    const hasCache = loadFromStorage()
    const hasTermInfo = loadTermInfoFromStorage()
    initialized.value = true

    // 如果没有缓存，从后端获取
    if (!hasCache) {
      await fetchCourses({ forceRefresh: true })
    }

    // 如果没有学期信息缓存，从后端获取
    if (!hasTermInfo) {
      await fetchTermInfo()
    }

    // 设置当前周为今天所在的周
    setCurrentWeekToToday()
  }

  /**
   * 设置当前周为今天所在的周
   */
  function setCurrentWeekToToday() {
    currentWeek.value = todayWeek.value
  }

  /**
   * 从后端获取学期信息
   */
  async function fetchTermInfo(term = currentTerm.value) {
    try {
      const resp = await getTermInfo(term)
      if (resp && resp.code === '10000' && resp.data) {
        termInfo.value = resp.data
        saveTermInfoToStorage()
      }
    } catch (error) {
      console.error('获取学期信息失败：', error)
    }
  }

  /**
   * 从后端拉取课程表
   * @param {Object} options - 请求选项
   * @param {string} options.term - 学期代码
   * @param {boolean} options.isRefresh - 是否强制刷新后端数据
   * @param {boolean} options.forceRefresh - 是否强制从后端获取（忽略缓存）
   */
  async function fetchCourses(options = {}) {
    loading.value = true
    try {
      const { term = currentTerm.value, isRefresh = false, forceRefresh = false } = options

      // 如果不是强制刷新且已有缓存，直接返回
      if (!forceRefresh && !isRefresh && courses.value.length > 0) {
        return
      }

      const resp = await getCourseList({ term, isRefresh })

      if (resp && resp.code === '10000' && Array.isArray(resp.data)) {
        // 获取本地添加的课程
        const localCourses = getLocalCourses()

        // 处理后端返回的课程
        const remoteCourses = resp.data.map((item, index) => ({
          id: `remote_${index + 1}`,
          ...item,
          isLocal: false
        }))

        // 合并课程：后端课程 + 本地课程（检查冲突）
        const mergedCourses = [...remoteCourses]

        localCourses.forEach((localCourse) => {
          // 检查是否与后端课程冲突（根据课程名和时间判断）
          const hasConflict = remoteCourses.some((remoteCourse) => {
            // 如果课程名相同，认为是同一门课
            if (remoteCourse.name === localCourse.name) {
              return true
            }
            // 检查时间冲突
            return checkScheduleConflict(remoteCourse, localCourse)
          })

          if (!hasConflict) {
            mergedCourses.push(localCourse)
          }
        })

        courses.value = mergedCourses

        // 更新当前学期
        if (term) {
          currentTerm.value = term
          localStorage.setItem(STORAGE_KEYS.CURRICULUM_TERM, term)
        }

        // 保存到 localStorage
        saveToStorage()
      }
    } catch (error) {
      console.error('获取课程表失败：', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查两门课程是否有时间冲突
   */
  function checkScheduleConflict(course1, course2) {
    if (!course1.scheduleRules || !course2.scheduleRules) return false

    for (const rule1 of course1.scheduleRules) {
      for (const rule2 of course2.scheduleRules) {
        // 检查是否在同一天
        if (rule1.weekday !== rule2.weekday) continue

        // 检查周次是否有交集
        const weekOverlap = rule1.startWeek <= rule2.endWeek && rule1.endWeek >= rule2.startWeek
        if (!weekOverlap) continue

        // 检查节次是否有交集
        const classOverlap =
          rule1.startClass <= rule2.endClass && rule1.endClass >= rule2.startClass
        if (!classOverlap) continue

        // 检查单双周是否有交集
        const oddWeekOverlap = rule1.single && rule2.single
        const evenWeekOverlap = rule1.double && rule2.double
        if (oddWeekOverlap || evenWeekOverlap) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 下拉刷新 - 强制从后端获取最新数据
   */
  async function refreshCourses() {
    await fetchCourses({ isRefresh: true, forceRefresh: true })
  }

  // 预留：在后端创建课程（本地添加）
  async function createCourse(payload) {
    const id = `local_${Date.now().toString(36)}`
    const newCourse = {
      id,
      name: payload.name,
      teacher: payload.teacher || '',
      scheduleRules: payload.scheduleRules || [],
      remark: payload.remark || '',
      lessonplan: payload.lessonplan || '',
      syllabus: payload.syllabus || '',
      rawScheduleRules: payload.rawScheduleRules || '',
      rawAdjust: payload.rawAdjust || '',
      examType: payload.examType || '',
      isLocal: true // 标记为本地添加的课程
    }
    courses.value.push(newCourse)

    // 保存本地课程到 localStorage
    saveLocalCourses()
  }

  // 预留：更新课程
  async function updateCourse(id, patch) {
    const target = courses.value.find((c) => c.id === id)
    if (!target) return
    Object.assign(target, patch)

    // 如果是本地课程，更新 localStorage
    if (target.isLocal) {
      saveLocalCourses()
    }
  }

  // 预留：删除课程
  async function removeCourse(id) {
    const index = courses.value.findIndex((c) => c.id === id)
    if (index !== -1) {
      const course = courses.value[index]
      courses.value.splice(index, 1)

      // 如果是本地课程，更新 localStorage
      if (course.isLocal) {
        saveLocalCourses()
      }
    }
  }

  function setCurrentWeek(week) {
    currentWeek.value = week
  }

  /**
   * 根据周次获取该周每天的日期
   * @param {number} weekNo - 周次
   * @returns {Object} 包含周一到周日日期的对象
   */
  function getWeekDates(weekNo) {
    if (!termStartDate.value || weekNo < 1) {
      return { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '' }
    }

    const result = {}
    const weekStart = new Date(termStartDate.value)
    weekStart.setDate(weekStart.getDate() + (weekNo - 1) * 7)

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      // 格式化为 MM/DD
      const month = date.getMonth() + 1
      const day = date.getDate()
      result[i + 1] = `${month}/${day}`
    }

    return result
  }

  return {
    // state
    courses,
    currentWeek,
    currentTerm,
    loading,
    initialized,
    classTimeMap,
    termInfo,
    // getters
    weekSchedule,
    getWeekSchedule,
    termStartDate,
    maxWeek,
    termEvents,
    todayWeek,
    todayWeekday,
    // actions
    initCourses,
    fetchCourses,
    fetchTermInfo,
    refreshCourses,
    createCourse,
    updateCourse,
    removeCourse,
    setCurrentWeek,
    setCurrentWeekToToday,
    getWeekDates
  }
})
