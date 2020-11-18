import request from '@/utils/request'

// 获取列表信息
export function page(data) {
  return request({
    url: `/yuqing-configuration/confconfigtype/list`,
    method: 'POST',
    data
  })
}

// 获取配置类别信息
export function list() {
  return request({
    url: `/yuqing-configuration/confconfigtype/classify_list`,
    method: 'POST'
  })
}

// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confconfigtype/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confconfigtype/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confconfigtype/update`,
    method: 'PUT',
    data
  })
}
