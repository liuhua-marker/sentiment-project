import request from '@/utils/request'

// 获取列表信息
export function page(data) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/list`,
    method: 'POST',
    data
  })
}
// 获取列表信息
export function getRulesClassify(data) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/getRulesClassify`,
    method: 'get',
    data
  })
}
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 修改信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/update`,
    method: 'PUT',
    data
  })
}

