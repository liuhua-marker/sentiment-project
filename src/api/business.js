import request from '@/utils/request'

export function getBusinesss(data) {
  return request({
    url: 'yuqing-system/business/list',
    method: 'post',
    data
  })
}

export function getBusiness(id) {
  return request({
    url: `yuqing-system/business/info/${id}`,
    method: 'get'
  })
}

export function addBusiness(data) {
  return request({
    url: 'yuqing-system/business/save',
    method: 'post',
    data
  })
}

export function updateBusiness(data) {
  return request({
    url: `yuqing-system/business/update`,
    method: 'put',
    data
  })
}

export function deleteBusiness(data) {
  return request({
    url: `yuqing-system/business/delete`,
    method: 'delete',
    data
  })
}

export function getChild(parentId) {
  return request({
    url: `yuqing-system/business/getChild/${parentId}`,
    method: 'get'
  })
}
// 机构基本配置表信息详情
export function orgBasicConfig(org_id) {
  return request({
    url: `/yuqing-configuration/conf_org_basic_config/${org_id}`,
    method: 'get'
  })
}
// 保存机构基本配置表信息
export function orgBasicConfigSave(data) {
  return request({
    url: `/yuqing-configuration/conf_org_basic_config/configuration`,
    method: 'post',
    data
  })
}
