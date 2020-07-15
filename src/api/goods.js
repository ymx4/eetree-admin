import request from '@/utils/request'

export function getGoods(query) {
  return request({
    url: '/project-goods',
    method: 'get',
    params: query
  })
}

export function getGoodsTrials(query) {
  return request({
    url: '/goods-trials',
    method: 'get',
    params: query
  })
}

export function updateGoodsTrial(id, data) {
  return request({
    url: '/goods-trials/' + id,
    method: 'put',
    data
  })
}

export function reviewTrial(id, data) {
  return request({
    url: '/goods-trials/' + id + '/review',
    method: 'put',
    data
  })
}
