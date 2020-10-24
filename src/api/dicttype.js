import request from '@/utils/request'

export function getDictTypes(data) {
  return request({
    url: 'yuqing-system/dicttype/list',
    method: 'post',
    data
  })
}

export function getDictType(id) {
  return request({
    url: `yuqing-system/dicttype/info/${id}`,
    method: 'get'
  })
}

export function addDictType(data) {
  return request({
    url: 'yuqing-system/dicttype/save',
    method: 'post',
    data
  })
}

export function updateDictType(data) {
  return request({
    url: `yuqing-system/dicttype/update`,
    method: 'put',
    data
  })
}

export function deleteDictType(data) {
  return request({
    url: `yuqing-system/dicttype/delete`,
    method: 'delete',
    data
  })
}

export function getDicts(typeCode) {
  return request({
    url: `yuqing-system/dict/getAllDictByTypeCode/${typeCode}`,
    method: 'get'
  })
}

export function getDictByTypeCode(typeCode) {
  return request({
    url: `yuqing-system/dict/getDictByTypeCode/${typeCode}`,
    method: 'get'
  })
}

export function getByDictCode(typeCode) {
  return request({
    url: `yuqing-system/dict/getByDictCode/${typeCode}`,
    method: 'get'
  })
}

export function addDict(data) {
  return request({
    url: 'yuqing-system/dict/save',
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: `yuqing-system/dict/update`,
    method: 'put',
    data
  })
}

export function deleteDict(data) {
  return request({
    url: `yuqing-system/dict/delete`,
    method: 'delete',
    data
  })
}
