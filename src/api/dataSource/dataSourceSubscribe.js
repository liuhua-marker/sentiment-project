import request from '@/utils/request'

// 获取列表信息
export function confdeptsourcesubscribeconfig(data) {
  return request({
    url: `/yuqing-configuration/confdeptsourcesubscribeconfig/list`,
    method: 'POST',
    data
  })
}
// 队列配置
export function saveOrUpdateSubscribeConfig(data) {
  return request({
    url: `/yuqing-configuration/confdeptsourcesubscribeconfig/saveOrUpdateSubscribeConfig`,
    method: 'POST',
    data
  })
}
// 编辑信息
export function listGroupBySourceType(deptId) {
  return request({
    url: `yuqing-configuration/confdeptsourcesubscribedetail/list_group_by_source_type/${deptId}`,
    method: 'post'
  })
}
// 配置数据源
export function configureDataSource(deptId, data) {
  return request({
    url: `/yuqing-configuration/confdeptsourcesubscribedetail/configure_data_source/${deptId}`,
    method: 'post',
    data
  })
}

// 配置数据源列表
export function confdeptsourcesubscribedetail(data) {
  return request({
    url: `/yuqing-configuration/confdeptsourcesubscribedetail/list`,
    method: 'post',
    data
  })
}

// 配置源数据源
export function configuration(dept_id, data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/configuration/${dept_id}`,
    method: 'post',
    data
  })
}
// 配置源数据源列表
export function configurationList(dept_id) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/configuration_list/?deptId=${dept_id}`,
    method: 'post'
  })
}

