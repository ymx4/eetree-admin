import request from '@/utils/request'

export function getGoods(query) {
  return request({
    url: '/goods',
    method: 'get',
    params: query
  })
}

export function getGoodsTrials(query) {
  return request({
    url: '/goodsTrials',
    method: 'get',
    params: query
  })
}

export function updateGoodsTrial(id, data) {
  return request({
    url: '/goodsTrials/' + id,
    method: 'put',
    data
  })
}

export function reviewTrial(id, data) {
  return request({
    url: '/goodsTrials/' + id + '/review',
    method: 'put',
    data
  })
}
