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
