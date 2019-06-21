import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token --['X-Token'] as a custom key.
      // please modify it according to the actual situation.
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
   * If you want to get information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code.
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.status !== 'success') {
      Message({
        message: res.message || 'error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res.message || 'error')
    } else {
      return res
    }
  },
  error => {
    if (error.response) {
      // 401: Illegal token; xxx: Other clients logged in; xxx: Token expired;
      if (error.response.status === 401) {
        // to re-login
        MessageBox.confirm('登录已过期，请重新登录', '退出登录', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
        return Promise.reject(error)
      } else if (error.response.status === 422) {
        let errorMsg = ''
        for (var key in error.response.data.errors) {
          errorMsg = error.response.data.errors[key][0]
        }
        if (errorMsg !== '') {
          Message({
            message: errorMsg,
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject(error)
        }
      } else if (error.response.status === 400) {
        if (error.response.data.message && error.response.data.message !== '') {
          Message({
            message: error.response.data.message,
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject(error)
        }
      }
    }
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
