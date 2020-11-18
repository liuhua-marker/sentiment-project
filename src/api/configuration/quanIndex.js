import request from '@/utils/request'

// 获取方案列表
export function list(data) {
  return request({
    url: `/yuqing-configuration/confsolution/list`,
    method: 'POST',
    data
  })
}

// 获取信号列表
export function signal(data) {
  return request({
    url: `/yuqing-configuration/confsignal/list`,
    method: 'POST',
    data
  })
}

// 获取类型列表
export function confwordstype(data) {
  return request({
    url: `/yuqing-configuration/confwordstype/list`,
    method: 'POST',
    data
  })
}
// 新增信息
export function save(data) {
  return request({
    url: `/yuqing-configuration/confnegativewords/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confnegativewords/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/confnegativewords/update`,
    method: 'PUT',
    data
  })
}
// 导出文件
export function domnLoadFile(solution_id, words_type_id) {
  return request({
    url: `/yuqing-configuration/confnegativewords/export/${solution_id}/${words_type_id}`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/confnegativewords/exportTemplate`,
    responseType: 'blob',
    method: 'GET'
  })
}
