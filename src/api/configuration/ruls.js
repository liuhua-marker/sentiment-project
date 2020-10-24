import request from '@/utils/request'

// 获取列表信息
export function confeventlabel(data) {
  return request({
    url: `/yuqing-configuration/configuration/confeventlabel/list`,
    method: 'POST',
    data
  })
}

// 获取方案列表
export function list(data) {
  return request({
    url: `/yuqing-configuration/confsolution/list`,
    method: 'POST',
    data
  })
}
// 生效的方案
export function selectNowSolution(deptId) {
  return request({
    url: `/yuqing-configuration/confsolution/selectNowSolution/${deptId}`,
    method: 'POST'
  })
}
// 获取类型列表
export function confwordstype(data) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/list`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/configuration/confeventlabel/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 修改信息
export function confeventlabeldetail(data) {
  return request({
    url: `/yuqing-configuration/configuration/confeventlabeldetail/list`,
    method: 'post',
    data
  })
}
