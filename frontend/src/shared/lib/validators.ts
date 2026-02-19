export const MAX_NOTE_LENGTH = 250

export const sanitizeText = (value: string) =>
  value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()

export const limitLength = (value: string, max: number) =>
  value.length > max ? value.slice(0, max) : value

export const normalizeReference = (value: string) =>
  sanitizeText(value).toUpperCase().replace(/[^A-Z0-9-]/g, '')

export const isValidReference = (value: string) =>
  /^[A-Z0-9-]{4,20}$/.test(value)
