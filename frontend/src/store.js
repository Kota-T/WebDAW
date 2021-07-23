import { createStore } from 'vuex';

export const store = createStore({
  state(){
    return {
      rhythm         : [4, 4],
      bpm            : 120,
      beat_interval  : 20,
      number_of_bars : 30,
      animation_fps  : 60
    }
  },
  mutations: {
    rhythm: (state, value) => state.rhythm = value,
    bpm: (state, value) => state.bpm = value,
    beat_interval: (state, value) => state.beat_interval = value,
    number_of_bars: (state, value) => state.number_of_bars = value
  }
});
