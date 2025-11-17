import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mockResponse from '@/components/Curriculum/response.json'

// 课程数据结构示例：
// {
//   id: string
//   name: string
//   teacher: string
//   scheduleRules: [
//     {
//       location: string
//       startClass: number
//       endClass: number
//       startWeek: number
//       endWeek: number
//       weekday: 1-7
//       single: boolean
//       double: boolean
//       adjust: boolean
//     }
//   ]
//   remark: string
//   lessonplan: string
//   syllabus: string
//   rawScheduleRules: string
//   rawAdjust: string
//   examType: string
// }

export const useCurriculumStore = defineStore('curriculum', () => {
  // 课程列表
  const courses = ref([])

  // 当前选中的周次，默认第 1 周
  const currentWeek = ref(1)

  // 是否正在从后端加载课程
  const loading = ref(false)

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

  // 之后可在这里接入后端 API，例如：
  // import { getCurriculum, createCourse, updateCourse, deleteCourse } from '@/api/curriculum'

  // 预留：从后端拉取课程表
  async function fetchCourses() {
    loading.value = true
    try {
      // TODO: 未来替换为真实 API 调用
      // const resp = await getCurriculum()
      // courses.value = resp.data

      if (mockResponse && Array.isArray(mockResponse.data)) {
        courses.value = mockResponse.data.map((item, index) => ({
          id: String(index + 1),
          ...item
        }))
      }
    } finally {
      loading.value = false
    }
  }

  // 预留：在后端创建课程
  async function createCourse(payload) {
    // const resp = await createCourseApi(payload)
    // courses.value.push(resp.data)
    // 目前先本地模拟
    const id = Date.now().toString(36)
    courses.value.push({
      id,
      name: payload.name,
      teacher: payload.teacher || '',
      scheduleRules: payload.scheduleRules || [],
      remark: payload.remark || '',
      lessonplan: payload.lessonplan || '',
      syllabus: payload.syllabus || '',
      rawScheduleRules: payload.rawScheduleRules || '',
      rawAdjust: payload.rawAdjust || '',
      examType: payload.examType || ''
    })
  }

  // 预留：更新课程
  async function updateCourse(id, patch) {
    // const resp = await updateCourseApi(id, patch)
    const target = courses.value.find((c) => c.id === id)
    if (!target) return
    Object.assign(target, patch)
  }

  // 预留：删除课程
  async function removeCourse(id) {
    // await deleteCourseApi(id)
    const index = courses.value.findIndex((c) => c.id === id)
    if (index !== -1) courses.value.splice(index, 1)
  }

  function setCurrentWeek(week) {
    currentWeek.value = week
  }

  return {
    // state
    courses,
    currentWeek,
    loading,
    classTimeMap,
    // getters
    weekSchedule,
    getWeekSchedule,
    // actions
    fetchCourses,
    createCourse,
    updateCourse,
    removeCourse,
    setCurrentWeek
  }
})
