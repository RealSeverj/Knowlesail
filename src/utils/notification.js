// 统一管理与业务相关的本地通知调度逻辑
// 使用 @capacitor/local-notifications，并基于课程 / 待办 / 日程业务封装

import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

// 简单的权限检查与请求
export async function ensureNotificationPermission() {
	if (!Capacitor.isNativePlatform()) {
		console.warn('[notification] 当前在浏览器环境，无法测试原生本地通知')
		return false
	}

	const perms = await LocalNotifications.checkPermissions()
	if (perms.display === 'granted') return true

	const result = await LocalNotifications.requestPermissions()
	const granted = result.display === 'granted'
	if (!granted) {
		console.warn('[notification] 用户未授予通知权限')
	}
	return granted
}

let idSeed = Date.now() % 2147483647
const nextId = () => {
	idSeed = (idSeed + 1) % 2147483647
	return idSeed || 1
}

// 基础调度：在指定时间点推送一条通知
export async function scheduleNotificationAt({ title, body, at }) {
	const ok = await ensureNotificationPermission()
	if (!ok) return null

	const time = at instanceof Date ? at.getTime() : new Date(at).getTime()
	if (Number.isNaN(time) || time <= Date.now()) {
		console.log('[notification] 忽略一个过去时间的通知:', { title, body, at })
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

	console.log('[notification] 已安排本地通知:', { id, title, body, at: new Date(time) })
	return id
}

// 每天固定时间重复通知（例如每天 8:00）
export async function scheduleDailyNotification({ title, body, hour, minute }) {
	const ok = await ensureNotificationPermission()
	if (!ok) return null

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

	console.log('[notification] 已安排每日重复通知:', { id, title, body, hour, minute })
	return id
}

// ========== 业务级封装：课程 / 待办 / 日程 ==========

// 1. 每节课前 20 分钟提醒
// nextClass: 来自 getNextClass(curriculumStore) 的结果
export async function scheduleNextClassReminder(nextClass) {
	if (!nextClass) return null

	let startTime = null

	if (nextClass.startTime) {
		startTime = nextClass.startTime instanceof Date
			? nextClass.startTime
			: new Date(nextClass.startTime)
	} else if (nextClass.startTimeStr) {
		const now = new Date()
		const [h, m] = nextClass.startTimeStr.split(':').map(Number)
		startTime = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			h || 0,
			m || 0,
			0,
			0,
		)
	}

	if (!startTime || Number.isNaN(startTime.getTime())) {
		console.warn('[notification] 无法解析下一节课的开始时间:', nextClass)
		return null
	}

	const remindTime = new Date(startTime.getTime() - 20 * 60 * 1000)
	if (remindTime.getTime() <= Date.now()) {
		console.log('[notification] 下一节课 20 分钟前的时间已经过去，不安排提醒')
		return null
	}

	const title = '即将上课提醒'
	const body = `20 分钟后是 ${nextClass.name}，地点：${nextClass.location || '请查看课表'}`

	return scheduleNotificationAt({ title, body, at: remindTime })
}

// 2. 待办截止前 1 小时提醒
// nearestTodo: 来自 getNearestTodo(todoStore) 的结果
export async function scheduleNearestTodoReminder(nearestTodo) {
	if (!nearestTodo) return null

	let deadline = null

	if (nearestTodo.deadline) {
		deadline = nearestTodo.deadline instanceof Date
			? nearestTodo.deadline
			: new Date(nearestTodo.deadline)
	} else if (nearestTodo.deadlineStr) {
		// deadlineStr 示例："12/10 18:00"，补全年份
		const now = new Date()
		const match = /^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/.exec(nearestTodo.deadlineStr)
		if (match) {
			const [, month, day, hour, minute] = match.map(Number)
			deadline = new Date(
				now.getFullYear(),
				(month || 1) - 1,
				day || 1,
				hour || 0,
				minute || 0,
				0,
				0,
			)
		}
	}

	if (!deadline || Number.isNaN(deadline.getTime())) {
		console.warn('[notification] 无法解析最近待办的截止时间:', nearestTodo)
		return null
	}

	const remindTime = new Date(deadline.getTime() - 60 * 60 * 1000)
	if (remindTime.getTime() <= Date.now()) {
		console.log('[notification] 最近待办 1 小时前的时间已经过去，不安排提醒')
		return null
	}

	const title = '待办即将截止'
	const body = `待办「${nearestTodo.title}」将在 1 小时后截止，请及时处理。`

	return scheduleNotificationAt({ title, body, at: remindTime })
}

// 3. 每天早上 8 点今日日程报告
export async function scheduleDailyScheduleReminder() {
	const title = '今日日程报告'
	const body = '点击查看今天的学习安排与推荐计划。'

	return scheduleDailyNotification({
		title,
		body,
		hour: 8,
		minute: 0,
	})
}

