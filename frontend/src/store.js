import { createStore } from 'vuex';

export const store = createStore({
  state(){
    return {
      rhythm           : [4, 4],
      bpm              : 120,
      beat_width       : 20,
      project_duration : 60
    }
  },
  getters: {
    second_width: (state, getters) => {
      return state.bpm / 60 * state.beat_width;
    },
    animation_width: (state, getters) => {
      return getters.second_width / 60;
    },
    scale_width: state => {
      return state.beat_width * 4 / state.rhythm[1];
    },
    bar_width: (state, getters) => {
      return getters.scale_width * state.rhythm[0];
    },
    ruler_width: (state, getters) => {
      return state.project_duration * getters.second_width;
    }
  },
  mutations: {
    rhythm             : (state, value) => state.rhythm = value,
    bpm                : (state, value) => state.bpm = value,
    beat_width         : (state, value) => state.beat_width = value,
    project_duration   : (state, value) => state.project_duration = value,
    addProjectDuration : (state, value) => state.project_duration += value
  },
});
