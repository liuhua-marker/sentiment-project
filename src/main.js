import Vue from 'vue'


import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css
// import 'lib-flexible/flexible'
import 'amfe-flexible'

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import VueParticles from 'vue-particles'
import './utils/error-log' // error log

import * as filters from './filters' // global filters
import echarts from 'echarts'
// import Astrict from '@/utils/astrict'

import WebSocket from './utils/WebSocket.js'
Vue.prototype.WebSocket = WebSocket

Vue.prototype.$echarts = echarts

// 拖拽组件
import VueDraggableResizable from 'vue-draggable-resizable'

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

Vue.component('vue-draggable-resizable', VueDraggableResizable)

import VueDraggableResizableGorkys from 'vue-draggable-resizable-gorkys'
import './utils/rem'

// optionally import default styles

Vue.component('vue-draggable-resizable-gorkys', VueDraggableResizableGorkys)
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
// import { mockXHR } from '../mock'
// if (process.env.NODE_ENV === 'production') {
//   mockXHR()
// }

Vue.use(VueParticles)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
