import { v4 as uuidv4 } from 'uuid'
import { MediaType, TrackData } from './type.d'

export function create(track_type: MediaType): TrackData {
  return {
    id: uuidv4(),
    type: track_type,
    name: "新規トラック",
    gain: 0.5,
    pan: 0,
    mic: false,
    mute: false,
    solo: false,
    canvases: []
  }
}
