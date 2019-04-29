import request from '@/utils/request'

export function getArticleDrafts(query) {
  return request({
    url: '/articleDrafts',
    method: 'get',
    params: query
  })
}

export function review(id, data) {
  return request({
    url: '/articleDrafts/' + id + '/review',
    method: 'put',
    data
  })
}
