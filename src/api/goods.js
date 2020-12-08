import request from '@/utils/request'

export function getGoods(query) {
  return request({
    url: '/project-goods',
    method: 'get',
    params: query
  })
}

export function updateGoods(id, data) {
  return request({
    url: '/project-goods/' + id,
    method: 'put',
    data
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

export function goodsPromote(id, data) {
  return request({
    url: '/project-goods/' + id + '/promote',
    method: 'put',
    data
  })
}

export function goodsUnPromote(id) {
  return request({
    url: '/project-goods/' + id + '/unpromote',
    method: 'put'
  })
}
