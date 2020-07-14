import request from '@/utils/request'

export function getTags() {
  return request({
    url: '/tags',
    method: 'get'
  })
}

export function addTag(data) {
  return request({
    url: '/tags',
    method: 'post',
    data
  })
}

export function updateTag(id, data) {
  return request({
    url: '/tags/' + id,
    method: 'put',
    data
  })
}

export function deleteTag(id) {
  return request({
    url: '/tags/' + id,
    method: 'delete'
  })
}
