import request from '@/utils/request'

export function getArticles(query) {
  return request({
    url: '/articles',
    method: 'get',
    params: query
  })
}

export function updateArticle(id, data) {
  return request({
    url: '/articles/' + id,
    method: 'put',
    data
  })
}

export function deleteArticle(id) {
  return request({
    url: '/articles/' + id,
    method: 'delete'
  })
}
