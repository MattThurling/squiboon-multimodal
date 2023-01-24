import { createApp } from 'vue'
import VueFullScreen from 'vue-fullscreen'

import App from './App.vue'

import './assets/main.css'

let app = createApp(App)

app.use(VueFullScreen)

app.mount('#app')
