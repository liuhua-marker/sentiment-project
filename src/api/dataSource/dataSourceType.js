import request from '@/utils/request'
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/update`,
    method: 'PUT',
    data
  })
}
