import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { clipThumbnail } from './thumbnail'
import * as repository from './project_repository'

const project_data = location.pathname === '/new'
  ? repository.create()
  : (await repository.get(location.pathname.slice(1)))

let playId: number

export const useProject = defineStore(project_data.id, {
  state: () => project_data,
  getters: {
    animation_width(state) {
      return state.second_width / 60
    },
    beat_time(state) {
      return 60 / state.bpm
    },
    beat_width(state) {
      return this.beat_time * state.second_width
    },
    scale_beat_ratio(state) {
      return 4 / state.rhythm[1]
    },
    scale_time(state) {
      return this.beat_time * this.scale_beat_ratio
    },
    scale_width(state) {
      return this.beat_width * this.scale_beat_ratio
    },
    bar_time(state) {
      return this.scale_time * state.rhythm[0]
    },
    bar_width(state) {
      return this.scale_width * state.rhythm[0];
    },
    beat_count(state) {
      const surplus = state.current_time % this.bar_time
      const surplus_scales = surplus < 0 ? surplus + this.bar_time : surplus
      return Math.floor(surplus_scales / this.scale_time) + 1
    },
    width(state) {
      return state.scroll_width + state.min_width
    },
    current_x(state) {
      return state.current_time * state.second_width
    }
  },
  actions: {
    _play() {
      let previous_time = performance.now() / 1000
      let loop = timestamp => {
        const current_time = timestamp / 1000
        this.current_time += current_time - previous_time
        previous_time = current_time
        playId = requestAnimationFrame(loop)
      }
      playId = requestAnimationFrame(loop)
    },
    _pause() {
      cancelAnimationFrame(playId)
    },
    play() {
      this._play()
      this.state = 'playing'
    },
    pause() {
      this._pause()
      this.state = undefined
    },
    prepare() {
      const current_bar = Math.floor(this.current_time / this.bar_time)
      const record_time = current_bar * this.bar_time
      this.current_time = record_time - this.bar_time
      if(this.state === undefined)
        this._play()
      setTimeout(() => {
        this.state = 'recording'
      }, record_time - this.current_time)
      this.state = 'preparing'
    },
    stopRecording() {
      this.state = undefined
    },
    async save(): Promise<void> {
      if(location.pathname === '/new')
        history.replaceState(null, '', this.id)
      this.last_updated = new Date()
      this.thumbnail = await clipThumbnail()
      return repository.save(toRaw(this.$state))
    }
  }
})

setInterval(() => console.log(new Date(), project_data), 10000)
