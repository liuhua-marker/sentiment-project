import request from '@/utils/request'

// 获取列表信息
export function page(data) {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/list`,
    method: 'POST',
    data
  })
}

// 获取类型列表
export function confwordstype(data) {
  return request({
    url: `/yuqing-configuration/conf_rules_type/list`,
    method: 'POST',
    data
  })
}

// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/update`,
    method: 'PUT',
    data
  })
}
// 导出文件
export function domnLoadFile(solution_id, rule_type_id) {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/export/${solution_id}/${rule_type_id}`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/conf_domain_rules/exportTemplate`,
    responseType: 'blob',
    method: 'GET'
  })
}
