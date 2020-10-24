import request from '@/utils/request'

// 获取列表信息
export function conforgsourcedistributeconfig(data) {
  return request({
    url: `/yuqing-configuration/configuration/conforgsourcedistributeconfig/list`,
    method: 'POST',
    data
  })
}
// 编辑信息
export function saveOrUpdateDistributeConfig(data) {
  return request({
    url: `/yuqing-configuration/configuration/conforgsourcedistributeconfig/saveOrUpdateDistributeConfig`,
    method: 'post',
    data
  })
}
