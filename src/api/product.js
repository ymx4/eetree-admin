import request from '@/utils/request'

export function getProducts(query) {
  return request({
    url: '/products',
    method: 'get',
    params: query
  })
}

export function addProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

export function updateProduct(id, data) {
  return request({
    url: '/products/' + id,
    method: 'put',
    data
  })
}

export function deleteProduct(id) {
  return request({
    url: '/products/' + id,
    method: 'delete'
  })
}
