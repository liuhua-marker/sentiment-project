import request from '@/utils/request'
// 获取列表
export function page(data) {
  return request({
    url: `/yuqing-configuration/confwordfilterrules/list`,
    method: 'post',
    data
  })
}
// 新增
export function save(data) {
  return request({
    url: `/yuqing-configuration/confwordfilterrules/save`,
    method: 'post',
    data
  })
}
// 编辑
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confwordfilterrules/update`,
    method: 'put',
    data
  })
}
// 删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confwordfilterrules/delete`,
    method: 'delete',
    data: ids
  })
}
