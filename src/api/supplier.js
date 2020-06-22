import request from '@/utils/request'

export function getSuppliers(query) {
  return request({
    url: '/suppliers',
    method: 'get',
    params: query
  })
}

export function addSupplier(data) {
  return request({
    url: '/suppliers',
    method: 'post',
    data
  })
}

export function updateSupplier(id, data) {
  return request({
    url: '/suppliers/' + id,
    method: 'put',
    data
  })
}

export function deleteSupplier(id) {
  return request({
    url: '/suppliers/' + id,
    method: 'delete'
  })
}
