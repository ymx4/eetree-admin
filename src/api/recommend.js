import request from '@/utils/request'

export function getRecommends(query) {
  return request({
    url: '/recommends',
    method: 'get',
    params: query
  })
}

export function addRecommend(data) {
  return request({
    url: '/recommends',
    method: 'post',
    data
  })
}

export function updateRecommend(id, data) {
  return request({
    url: '/recommends/' + id,
    method: 'put',
    data
  })
}

export function deleteRecommend(id) {
  return request({
    url: '/recommends/' + id,
    method: 'delete'
  })
}
