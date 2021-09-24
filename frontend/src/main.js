import { createApp } from 'vue';
import App from './App.vue';
import ContextMenu from './components/util/ContextMenu.vue';
import InputElement from './components/util/InputElement.vue';
import { store } from './store.js';

createApp(App)
.component('ContextMenu', ContextMenu)
.component('InputElement', InputElement)
.use(store)
.mount('#app');
