import { isPlatform } from '@awesome-cordova-plugins/core'
import { Calendar } from '@awesome-cordova-plugins/calendar'
import { useCurriculumStore } from '@/stores/curriculum'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

// 学期起始日期（周一），后续可以做成用户可配置
const TERM_START_DATE = new Date('2025-02-24T00:00:00')

function getDateOfWeek(weekNo, weekday) {
	// weekday: 1-7 -> 周一到周日
	const base = new Date(TERM_START_DATE.getTime())
	const daysOffset = (weekNo - 1) * 7 + (weekday - 1)
	base.setDate(base.getDate() + daysOffset)
	return base
}

function parseTimeStringToDate(baseDate, timeStr) {
	// timeStr: 'HH:MM'
	const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10))
	const date = new Date(baseDate.getTime())
	date.setHours(h, m, 0, 0)
	return date
}

function buildEventFromRule(course, rule, classTimeMap) {
	const title = course.teacher ? `${course.name}（${course.teacher}）` : course.name
	const location = rule.location || ''

	const firstWeek = rule.startWeek || 1
	const weekday = rule.weekday || 1

	const baseDate = getDateOfWeek(firstWeek, weekday)
	const startTimeStr = classTimeMap[rule.startClass]
	const endTimeStr = classTimeMap[rule.endClass]

	if (!startTimeStr || !endTimeStr) return null

	const startDate = parseTimeStringToDate(baseDate, startTimeStr)
	const endDate = parseTimeStringToDate(baseDate, endTimeStr)

	const lastWeek = rule.endWeek || firstWeek
	const endDateForRule = getDateOfWeek(lastWeek, weekday)
	endDateForRule.setHours(23, 59, 59, 999)

	// 构造 RRULE
	let rrule = `FREQ=WEEKLY;UNTIL=${formatDateToRRuleUntil(endDateForRule)}`
	if (rule.single || rule.double) {
		// 单双周：间隔 2 周
		rrule = `FREQ=WEEKLY;INTERVAL=2;UNTIL=${formatDateToRRuleUntil(endDateForRule)}`
	}

	const notes = [course.remark, course.lessonplan, course.syllabus]
		.filter(Boolean)
		.join('\n\n')

	return {
		title,
		location,
		notes,
		startDate,
		endDate,
		rrule
	}
}

function pad(num) {
	return num < 10 ? `0${num}` : String(num)
}

function formatDateToRRuleUntil(date) {
	// 返回形如 20250630T235959Z，这里简单使用本地时间近似
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T235959Z`
}

export function useCalendarExport() {
	const curriculumStore = useCurriculumStore()
	const { showToast } = useToast()
	const { confirm } = useConfirm()

	async function ensurePlatformSupported() {
		const isAndroid = isPlatform('android')
		if (!isAndroid) {
			showToast('当前仅支持在 Android 真机上导出到系统日历')
			return false
		}
		return true
	}

	function buildAllEvents() {
		const events = []
		const courses = curriculumStore.courses || []
		const classTimeMap = curriculumStore.classTimeMap || {}

		courses.forEach((course) => {
			(course.scheduleRules || []).forEach((rule) => {
				const e = buildEventFromRule(course, rule, classTimeMap)
				if (e) events.push(e)
			})
		})

		return events
	}

	async function exportCurriculumToCalendar() {
		if (!(await ensurePlatformSupported())) return

		// 确保已加载课程
		if (!curriculumStore.courses.length) {
			await curriculumStore.fetchCourses()
		}

		const events = buildAllEvents()
		if (!events.length) {
			showToast('当前没有可导出的课程')
			return
		}

		const ok = await confirm(`是否将本学期的 ${events.length} 条课程导出到系统日历？`, {
			title: '导出课程表到日历',
			confirmText: '导出',
			cancelText: '取消'
		})

		if (!ok) return

		try {
			await Calendar.hasReadWritePermission().then(async (granted) => {
				if (!granted) {
					await Calendar.requestReadWritePermission()
				}
			})

			// 可选：选择/创建一个日历，这里简单使用默认日历
			for (const e of events) {
				await Calendar.createEvent({
					title: e.title,
					location: e.location,
					notes: e.notes,
					startDate: e.startDate,
					endDate: e.endDate,
					recurrence: 'weekly',
					recurrenceEndDate: e.endDate // 插件暂不直接支持 RRULE 字符串时，用结束日期近似
				})
			}

			showToast('课程表已导出到系统日历（请在日历应用中查看）')
		} catch (err) {
			console.error('[CalendarExport] 导出失败', err)
			showToast('导出失败，请检查日历权限或稍后重试')
		}
	}

	return {
		exportCurriculumToCalendar
	}
}

