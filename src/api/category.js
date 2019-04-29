import request from '@/utils/request'

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  return request({
    url: '/categories/' + id,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: '/categories/' + id,
    method: 'delete'
  })
}

export function move(srcId, destId, type) {
  const data = { dest: destId, type: type }
  return request({
    url: '/categories/' + srcId + '/move',
    method: 'put',
    data
  })
}
