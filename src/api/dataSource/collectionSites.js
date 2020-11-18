import request from '@/utils/request'

// 获取列表信息
export function page(data) {
  return request({
    url: `/yuqing-configuration/confDataSource/page`,
    method: 'POST',
    data
  })
}

// 获取数据源类型
export function list(data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/list`,
    method: 'POST',
    data
  })
}
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confDataSource/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confDataSource/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confDataSource/edit`,
    method: 'PATCH',
    data
  })
}
// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-configuration/confDataSource/export`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function domnLoadModel(data) {
  return request({
    url: `/yuqing-configuration/confDataSource/toTemplateDownload`,
    responseType: 'blob',
    method: 'GET'
  })
}
