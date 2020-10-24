import request from '@/utils/request'

// 获取列表信息
export function page() {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/configuration_list`,
    method: 'POST'
  })
}

// 保存数据配置信息
export function saveData(data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/configuration`,
    method: 'POST',
    data
  })
}
