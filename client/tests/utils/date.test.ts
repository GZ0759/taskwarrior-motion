import { describe, it, expect } from 'vitest'
import {
  getTodayStr,
  parseTaskDate,
  taskDateToISO,
  formatDue,
  isOverdue,
} from '@/utils/date'

describe('Date Utilities', () => {
  describe('getTodayStr', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const result = getTodayStr()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('returns actual today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(getTodayStr()).toBe(today)
    })
  })

  describe('parseTaskDate', () => {
    it('parses taskwarrior format YYYYMMDDTHHmmssZ', () => {
      const result = parseTaskDate('20260627T141924Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(5) // June is 5
      expect(result.getDate()).toBe(27)
    })

    it('parses ISO format', () => {
      const result = parseTaskDate('2026-06-27T14:19:24Z')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2026)
    })
  })

  describe('taskDateToISO', () => {
    it('converts taskwarrior format to YYYY-MM-DD', () => {
      expect(taskDateToISO('20260627T141924Z')).toBe('2026-06-27')
    })

    it('handles ISO format', () => {
      expect(taskDateToISO('2026-06-27T14:19:24Z')).toBe('2026-06-27')
    })

    it('handles date-only format', () => {
      expect(taskDateToISO('2026-06-27')).toBe('2026-06-27')
    })
  })

  describe('formatDue', () => {
    it('returns null for null/undefined', () => {
      expect(formatDue(null)).toBeNull()
      expect(formatDue(undefined)).toBeNull()
    })

    it('returns "今天" for today', () => {
      const today = new Date()
      const todayStr =
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0') +
        'T000000Z'
      expect(formatDue(todayStr)).toBe('今天')
    })

    it('returns "明天" for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr =
        tomorrow.getFullYear().toString() +
        (tomorrow.getMonth() + 1).toString().padStart(2, '0') +
        tomorrow.getDate().toString().padStart(2, '0') +
        'T000000Z'
      expect(formatDue(tomorrowStr)).toBe('明天')
    })

    it('returns "逾期X天" for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 3)
      const pastStr =
        past.getFullYear().toString() +
        (past.getMonth() + 1).toString().padStart(2, '0') +
        past.getDate().toString().padStart(2, '0') +
        'T000000Z'
      expect(formatDue(pastStr)).toBe('逾期3天')
    })
  })

  describe('isOverdue', () => {
    it('returns false for null/undefined', () => {
      expect(isOverdue(null)).toBe(false)
      expect(isOverdue(undefined)).toBe(false)
    })

    it('returns true for past dates', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      const pastStr =
        past.getFullYear().toString() +
        (past.getMonth() + 1).toString().padStart(2, '0') +
        past.getDate().toString().padStart(2, '0') +
        'T000000Z'
      expect(isOverdue(pastStr)).toBe(true)
    })

    it('returns false for future dates', () => {
      const future = new Date()
      future.setDate(future.getDate() + 1)
      const futureStr =
        future.getFullYear().toString() +
        (future.getMonth() + 1).toString().padStart(2, '0') +
        future.getDate().toString().padStart(2, '0') +
        'T000000Z'
      expect(isOverdue(futureStr)).toBe(false)
    })
  })
})
