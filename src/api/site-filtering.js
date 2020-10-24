import request from '@/utils/request'

export function getsitefiltering(data) {
  return request({
    url: `/yuqing-configuration/Confsitesourceurlfilter/list`,
    method: 'post',
    data
  })
}

export function addQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/Confsitesourceurlfilter/save`,
    method: 'post',
    data
  })
}

// 修改
export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/Confsitesourceurlfilter/update`,
    method: 'put',
    data
  })
}
// 删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/Confsitesourceurlfilter/delete`,
    method: 'delete',
    data: ids
  })
}
