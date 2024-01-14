export type GoogleEvents = GoogleEvent[]

export interface GoogleEvent {
  kind: string
  etag: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary: string
  creator: Creator
  organizer: Organizer
  start: Start
  end: End
  iCalUID: string
  sequence: number
  reminders: Reminders
  eventType: string
  recurringEventId?: string
  originalStartTime?: OriginalStartTime
  visibility?: string
}

export interface Creator {
  email: string
  self: boolean
}

export interface Organizer {
  email: string
  self: boolean
}

export interface Start {
  dateTime: string
  timeZone: string
}

export interface End {
  dateTime: string
  timeZone: string
}

export interface Reminders {
  useDefault: boolean
  overrides?: Override[]
}

export interface Override {
  method: string
  minutes: number
}

export interface OriginalStartTime {
  dateTime: string
  timeZone: string
}
