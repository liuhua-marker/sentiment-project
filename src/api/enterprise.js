import request from '@/utils/request'
// 获取列表
export function page(data) {
  return request({
    url: `/yuqing-configuration/configuration/confenterprisefilterlist/list`,
    method: 'post',
    data
  })
}
// 新增
export function save(data) {
  return request({
    url: `/yuqing-configuration/configuration/confenterprisefilterlist/save`,
    method: 'post',
    data
  })
}
// 编辑
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/configuration/confenterprisefilterlist/update`,
    method: 'put',
    data
  })
}
// 删除
export function handleDelete(enterpriseFilterIds) {
  return request({
    url: `/yuqing-configuration/configuration/confenterprisefilterlist/delete`,
    method: 'delete',
    data: enterpriseFilterIds
  })
}
