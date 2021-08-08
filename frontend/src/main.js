import { createApp } from 'vue';
import App from './App.vue';
import { store } from './store.js';

createApp(App).use(store).mount('#app');

const userAgent = window.navigator.userAgent.toLowerCase();

if(userAgent.indexOf('msie') != -1 ||
   userAgent.indexOf('trident') != -1) {
    console.log('Internet Explorerをお使いですね');
} else if(userAgent.indexOf('edge') != -1) {
    console.log('Edgeをお使いですね');
} else if(userAgent.indexOf('chrome') != -1) {
    console.log('Google Chromeをお使いですね');
} else if(userAgent.indexOf('safari') != -1) {
    console.log('Safariをお使いですね');
    window.isSafari = true;
}
