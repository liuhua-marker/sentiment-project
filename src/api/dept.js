import request from '@/utils/request'

export function queryAllDept(bId) {
  return request({
    url: `yuqing-system/dept/queryAllDept/?orgId=${bId}`,
    method: 'get'
  })
}

export function addDept(data) {
  return request({
    url: 'yuqing-system/dept/save',
    method: 'post',
    data
  })
}

export function getDept(id) {
  return request({
    url: `yuqing-system/dept/info/${id}`,
    method: 'get'
  })
}

export function updateDept(data) {
  return request({
    url: `yuqing-system/dept/update`,
    method: 'put',
    data
  })
}

export function deleteDept(data) {
  return request({
    url: `yuqing-system/dept/delete`,
    method: 'delete',
    data
  })
}
// 部门基本配置表信息详情
export function deptBasicConfig(dept_id) {
  return request({
    url: `/yuqing-configuration/conf_dept_basic_config/${dept_id}`,
    method: 'get'
  })
}
// 部门基本配置表信息详情
export function deptBasicConfigSave(data) {
  return request({
    url: `/yuqing-configuration/conf_dept_basic_config/configuration`,
    method: 'post',
    data
  })
}
