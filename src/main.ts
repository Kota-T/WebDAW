import './styles/style.css'
import './router'
import { createApp } from 'vue'
import App from './App.vue'
import ContextMenu from './components/util/ContextMenu.vue'
import EditableText from './components/util/EditableText.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'

loadFonts()

const app = createApp(App)
  .use(vuetify)
  .use(createPinia())
  .component('context-menu', ContextMenu)
  .component('editable-text', EditableText)
  .directive('scroll-value', (el, binding) => {
    if(binding.value < 0) {
      return
    } else if(binding.arg === 'left') {
      el.scrollLeft = binding.value
    } else {
      el.scrollTop = binding.value
    }
  })
  .mount('#app')

window.onpopstate = e => e.preventDefault()
window.onbeforeunload = e=>{
  e.preventDefault();
  e.returnValue = 'ページを移動すると全てのデータが失われます。';
}
