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
    url: '/goods-trials',
    method: 'get',
    params: query
  })
}

export function passTrial(id, data) {
  data.status = 9
  return request({
    url: '/goods-trials/' + id + '/review',
    method: 'put',
    data
  })
}

export function refuseTrial(id, data) {
  data.status = 8
  return request({
    url: '/goods-trials/' + id + '/review',
    method: 'put',
    data
  })
}
