// 半小时没有操作就自动跳到登录页

// 引入路由
import { removeToken } from '@/utils/auth'
import router from '@/router'

let lastTime = new Date().getTime()
let currentTime = new Date().getTime()
const timeOut = 30 * 60 * 1000// 设置超时时间: 30分钟
const time = 3 * 60 * 1000 // 设置时间: 3分钟

window.onload = function() {
  window.document.onmousedown = function() {
    window.localStorage.setItem('lastTime', new Date().getTime())
  }
}

function checkTimeout() {
  currentTime = new Date().getTime() // 更新当前时间
  lastTime = window.localStorage.getItem('lastTime')

  if (currentTime - lastTime > timeOut) { // 判断是否超时
    // 清除(登陆信息和token)
    removeToken()
    // 跳到登陆页
    if (router.history.current.name === 'Login') return // 当前已经是登陆页时不做跳转
    router.push({
      name: 'Login'
    })
  }
}

export default function() {
  /* 定时器 间隔30秒检测是否长时间未操作页面 */
  window.setInterval(checkTimeout, time)
}
