import request from '@/utils/request'

export function getDocs(query) {
  return request({
    url: '/docs',
    method: 'get',
    params: query
  })
}

export function updateDoc(id, data) {
  return request({
    url: '/docs/' + id,
    method: 'put',
    data
  })
}

export function moveDocs(src, dest) {
  return request({
    url: '/docs/move',
    method: 'post',
    data: { src, dest }
  })
}

export function deleteDoc(id) {
  return request({
    url: '/docs/' + id,
    method: 'delete'
  })
}

export function docPreview(id) {
  return request({
    url: '/docs/' + id + '/previewKey',
    method: 'get'
  })
}
