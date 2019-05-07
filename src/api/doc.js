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

export function deleteDoc(id) {
  return request({
    url: '/docs/' + id,
    method: 'delete'
  })
}
