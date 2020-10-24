import axios from 'axios'
import {
  // MessageBox,
  Message
  // Notification
} from 'element-ui'
import store from '@/store'
import {
  getToken,
  removeToken
} from '@/utils/auth'
import router from '../router'
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (response.request.responseType === 'blob') {
      return res
    }
    // if the custom code is not 20000, it is judged as an error.
    if (res.code && res.code !== 200) {
      if (res.code === 500) {
        // console.error('Error', res.msg)
        return
      } else if (res.code === 50009) {
        return res
      } else if (res.code === 40001 || res.msg === '用户不存在或账户密码错误!') {
        Message({
          message: res.msg,
          type: 'error',
          showClose: true
        })
        removeToken()
        return
      } else if (res.code === 40101 || res.msg === 'User Token Forbidden or Expired!') {
        Message({
          message: '超时，请重新登录！',
          type: 'error',
          showClose: true,
          duration: 5 * 1000
        })
        removeToken()
        setTimeout(() => {
          router.push({
            // path: `/login?redirect=${router.history.current.path}`
            path: `/login`
          })
        }, 2000)
        return
      } else {
        Message({
          message: res.msg || 'Error',
          type: 'error',
          showClose: true,
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
