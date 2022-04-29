export type EditorState = "preparing" | "recording" | "playing" | undefined
export type MediaType = "audio" | "video" | "midi"
export type CanvasData = {
  id: string
  type: MediaType
  url: string
  start_time: number
  duration: number
  trim_start: number
  trim_end: number
}
export type TrackData = {
  id: string
  type: MediaType
  name: string
  selected: boolean
  params: any
  canvases: CanvasData[]
}
export type AudioTrackParams = {
  gain: number
  pan : number
  mic: boolean
  mute: boolean
  solo: boolean
}
export type ProjectData = {
  id: string
  thumbnail: string
  last_updated: Date
  name: string
  rhythm: [number, number]
  bpm: number
  metronome: boolean
  second_width: number
  current_time: number
  scroll_width: number
  tracks: TrackData[]
}
