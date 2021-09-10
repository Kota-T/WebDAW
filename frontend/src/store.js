import { createStore } from 'vuex';

export const store = createStore({
  state(){
    return {
      rhythm         : [4, 4],
      bpm            : 120,
      beat_interval  : 20,
      number_of_bars : 30
    }
  },
  getters: {
    animation_width: state => {
      return state.bpm / 60 * state.beat_interval / 60;
    },
    second_width: (state, getters) => {
      return state.bpm / 60 * state.beat_interval;
    },
    scale_interval: state => {
      return state.beat_interval * 4 / state.rhythm[1];
    },
    bar_width: (state, getters) => {
      return getters.scale_interval * state.rhythm[0];
    },
    ruler_width: (state, getters) => {
      return getters.bar_width * state.number_of_bars;
    },
    getNumberOfBarsFromDuration: state => duration => {
      const beat_per_bar = state.rhythm[0] * 4 / state.rhythm[1];
      const beat_per_second = state.bpm / 60;
      return Math.ceil(duration * beat_per_second / beat_per_bar);
    },
    getTimeOfDistance: state => distance => {
      return  60 / state.bpm * distance / state.beat_interval;
    },
  },
  mutations: {
    rhythm: (state, value) => state.rhythm = value,
    bpm: (state, value) => state.bpm = value,
    beat_interval: (state, value) => state.beat_interval = value,
    number_of_bars: (state, value) => state.number_of_bars = value,
    addNumberOfBars: (state, value) => state.number_of_bars += value
  },
});
