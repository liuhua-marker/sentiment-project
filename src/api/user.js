import request from '@/utils/request'
export function login(data) {
  return request({
    url: 'yuqing-auth/jwt/token',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: 'yuqing-auth/jwt/userinfo',
    method: 'get'
  })
}

// 验证码
export function createImg() {
  return request({
    url: '/yuqing-auth/jwt/createImg',
    responseType: 'blob',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function userMenu() {
  return request({
    url: 'yuqing-system/user/getUserMenus',
    method: 'get'
  })
}

export function getUsers(data) {
  return request({
    url: 'yuqing-system/user/list',
    method: 'post',
    data
  })
}

export function getUser(id) {
  return request({
    url: `yuqing-system/user/info/${id}`,
    method: 'get'
  })
}

export function addUser(data) {
  return request({
    url: 'yuqing-system/user/save',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `yuqing-system/user/update`,
    method: 'put',
    data
  })
}
export function updateStatus(data) {
  return request({
    url: `/yuqing-system/user/updateStatus`,
    method: 'put',
    data
  })
}
export function deleteUser(data) {
  return request({
    url: `yuqing-system/user/delete`,
    method: 'delete',
    data
  })
}
