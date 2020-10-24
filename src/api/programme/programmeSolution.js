import request from '@/utils/request'

// 获取列表信息
export function solutionList(data) {
  return request({
    url: `yuqing-configuration/confsolution/configure_solution_list`,
    method: 'POST',
    data
  })
}
// 配置信息
export function configuration(dept_id, solution_id) {
  return request({
    url: `/yuqing-configuration/confsolution/configuration/${dept_id}/${solution_id}`,
    method: 'POST'
  })
}

// 重置方案
export function resetSolution(solutionId) {
  return request({
    url: `/yuqing-configuration/confsolution/resetSolution/${solutionId}`,
    method: 'POST'
  })
}
