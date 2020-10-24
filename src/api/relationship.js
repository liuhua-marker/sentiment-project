import request from '@/utils/request'

export function page(data) {
  return request({
    url: `/yuqing-configuration/configuration/confdependencyfilterrules/list`,
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: `/yuqing-configuration/configuration/confdependencyfilterrules/save`,
    method: 'post',
    data
  })
}

export function editeQuanIndexFrom(data) {
  return request({
    url: `/yuqing-configuration/configuration/confdependencyfilterrules/update`,
    method: 'put',
    data
  })
}

// 删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/configuration/confdependencyfilterrules/delete`,
    method: 'delete',
    data: ids
  })
}
