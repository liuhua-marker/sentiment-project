import request from '@/utils/request'

// 舆情测评类型查询
export function evaluationResultList(data) {
  return request({
    url: `/yuqing-visualize/yuqing_evaluation/evaluation_result_list`,
    method: 'POST'
  })
}
//  获取Ai标注列表
export function getAiMarkList(data) {
  return request({
    url: `/yuqing-visualize/yuqing_evaluation/get_ai_mark_list`,
    method: 'GET'
  })
}

// 获取爬虫标注列表
export function getSpiderMark(data) {
  return request({
    url: `/yuqing-visualize/yuqing_evaluation/get_spider_mark`,
    method: 'GET'
  })
}
// 获取标注极性列表
export function publicSentimentMark(data) {
  return request({
    url: `/yuqing-visualize/yuqing_evaluation/public_sentiment_mark`,
    method: 'POST',
    data
  })
}
