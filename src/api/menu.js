import request from '@/utils/request'

export function queryAllMenu() {
  return request({
    url: `yuqing-system/menu/queryAllMenu`,
    method: 'get'
  })
}

export function addMenu(data) {
  return request({
    url: 'yuqing-system/menu/save',
    method: 'post',
    data
  })
}

export function getMenu(id) {
  return request({
    url: `yuqing-system/menu/info/${id}`,
    method: 'get'
  })
}

export function updateMenu(data) {
  return request({
    url: `yuqing-system/menu/update`,
    method: 'put',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: `yuqing-system/menu/delete`,
    method: 'delete',
    data
  })
}
