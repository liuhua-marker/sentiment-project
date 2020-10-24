import request from '@/utils/request'

// 获取导航栏信息
export function confsolution(data) {
  return request({
    url: `/yuqing-configuration/confsolution/list`,
    method: 'POST',
    data
  })
}
// 获取导航栏信息
export function companytype(data) {
  return request({
    url: `/yuqing-configuration/confcompanytype/list`,
    method: 'POST',
    data
  })
}
// 获取列表信息
export function confconfigitems(solutionId) {
  return request({
    url: `/yuqing-configuration/confconfigitems/info/${solutionId}`,
    method: 'GET'
  })
}
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confconfigitems/save`,
    method: 'POST',
    data
  })
}

// 修改信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confconfigitems/update`,
    method: 'PUT',
    data
  })
}
