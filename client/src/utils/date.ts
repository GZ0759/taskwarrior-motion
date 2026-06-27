/**
 * 日期工具函数 — 统一处理 taskwarrior 日期格式
 */

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 * 每次调用都获取当前日期，避免跨午夜问题
 */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 解析 taskwarrior 日期格式 (YYYYMMDDTHHmmssZ) 为 Date 对象
 * @param d - taskwarrior 日期字符串，如 "20260627T141924Z"
 */
export function parseTaskDate(d: string): Date {
  if (d.length >= 16 && d[8] === 'T') {
    const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${d.slice(9, 11)}:${d.slice(11, 13)}:${d.slice(13, 15)}Z`
    return new Date(iso)
  }
  return new Date(d)
}

/**
 * 将 taskwarrior 日期格式转为 YYYY-MM-DD
 * @param d - taskwarrior 日期字符串，如 "20260627T141924Z"
 */
export function taskDateToISO(d: string): string {
  if (d.length >= 8 && d[8] === 'T') {
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
  }
  return d.split('T')[0]
}

/**
 * 格式化日期为中文显示
 * @param d - taskwarrior 日期字符串
 */
export function formatDue(d: string | null | undefined): string | null {
  if (!d) return null
  const dateStr = taskDateToISO(d)
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff < 0) return `逾期${Math.abs(diff)}天`
  if (diff <= 7) return `${diff}天后`
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

/**
 * 判断日期是否已过期
 * @param d - taskwarrior 日期字符串
 */
export function isOverdue(d: string | null | undefined): boolean {
  if (!d) return false
  const dateStr = taskDateToISO(d)
  return new Date(dateStr + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
}
