import request from '@/utils/request'

export function getMenus() {
  return request({
    url: `yuqing-system/menu/queryMenu`,
    method: 'get'
  })
}

export function getRoleMenus(id) {
  return request({
    url: `yuqing-system/role/getRoleMenus/${id}`,
    method: 'get'
  })
}

export function getRoles(data) {
  return request({
    url: 'yuqing-system/role/list',
    method: 'post',
    data
  })
}

export function addRole(data) {
  return request({
    url: `yuqing-system/role/save`,
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `yuqing-system/role/update`,
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: `yuqing-system/role/delete`,
    method: 'delete',
    data
  })
}

export async function getBRoles() {
  return request({
    url: 'yuqing-system/role/getRoles',
    method: 'get'
  })
}
