import { computed, reactive, ref, toRaw, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { clipThumbnail } from './thumbnail'
import * as repository from './project_repository'

const project_data = location.pathname === '/new'
  ? repository.create()
  : (await repository.get(location.pathname.slice(1)))

export const useProject = defineStore(project_data.id, () => {
  const $state = reactive(project_data)
  const {
    name,
    rhythm,
    bpm,
    metronome,
    second_width,
    current_time,
    scroll_width,
    tracks
  } = toRefs($state)

  const state = ref()
  const min_width = ref(1000)

  const animation_width = computed(() => second_width.value / 60)
  const beat_time = computed(() => 60 / bpm.value)
  const beat_width = computed(() => beat_time.value * second_width.value)
  const scale_beat_ratio = computed(() => 4 / rhythm.value[1])
  const scale_time = computed(() => beat_time.value * scale_beat_ratio.value)
  const scale_width = computed(() => beat_width.value * scale_beat_ratio.value)
  const bar_time = computed(() => scale_time.value * rhythm.value[0])
  const bar_width = computed(() => scale_width.value * rhythm.value[0])
  const beat_count = computed(() => {
    const surplus = current_time.value % bar_time.value
    const surplus_scales = surplus < 0 ? surplus + bar_time.value : surplus
    return Math.floor(surplus_scales / scale_time.value) + 1
  })
  const width = computed(() => scroll_width.value + min_width.value)
  const current_x = computed({
    get: () => current_time.value * second_width.value,
    set: _x => current_time.value = _x / second_width.value
  })

  let playId: number

  function _play() {
    let previous_timestamp = performance.now()
    let loop = timestamp => {
      current_time.value += (timestamp - previous_timestamp) / 1000
      previous_timestamp = timestamp
      playId = requestAnimationFrame(loop)
    }
    playId = requestAnimationFrame(loop)
  }

  function _prepare() {
    const start_bar = Math.floor(current_time.value / bar_time.value) - 1
    current_time.value = start_bar * bar_time.value
  }

  function play() {
    state.value = 'playing'
    _play()
  }

  let timeoutId: number

  function prepare() {
    _prepare()
    if(state.value === undefined)
      _play()
    timeoutId = setTimeout(() => state.value = 'recording', bar_time.value * 1000)
    state.value = 'preparing'
  }

  function pause() {
    state.value = undefined
    clearTimeout(timeoutId)
    cancelAnimationFrame(playId)
  }

  async function save(): Promise<void> {
    if(location.pathname === '/new')
      history.replaceState(null, '', $state.id)
    $state.last_updated = new Date()
    $state.thumbnail = await clipThumbnail()
    return repository.save(toRaw($state))
  }

  return {
    name,
    rhythm,
    bpm,
    metronome,
    second_width,
    current_time,
    scroll_width,
    tracks,
    state,
    min_width,
    animation_width,
    beat_time,
    beat_width,
    scale_beat_ratio,
    scale_time,
    scale_width,
    bar_time,
    bar_width,
    beat_count,
    width,
    current_x,
    play,
    pause,
    prepare,
    save
  }
})
