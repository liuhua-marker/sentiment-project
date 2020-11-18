import request from '@/utils/request'

// 获取列表信息
export function page(data) {
  return request({
    url: `/yuqing-configuration/confbasicconfig/list`,
    method: 'POST',
    data
  })
}
// 获取类型列表
export function confwordstype(data) {
  return request({
    url: `/yuqing-configuration/confconfigtype/list`,
    method: 'POST',
    data
  })
}
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confbasicconfig/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confbasicconfig/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confbasicconfig/update`,
    method: 'PUT',
    data
  })
}
