import request from '@/utils/request'

export function getProjects(query) {
  return request({
    url: '/projects',
    method: 'get',
    params: query
  })
}

export function getDrafts(query) {
  return request({
    url: '/project-drafts',
    method: 'get',
    params: query
  })
}

export function updateProject(id, data) {
  return request({
    url: '/projects/' + id,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: '/projects/' + id,
    method: 'delete'
  })
}

export function projectTop(id, data) {
  return request({
    url: '/projects/' + id + '/top',
    method: 'put',
    data
  })
}

export function projectUnTop(id) {
  return request({
    url: '/projects/' + id + '/untop',
    method: 'put'
  })
}

export function reviewProject(id, data) {
  return request({
    url: '/project-drafts/' + id + '/review',
    method: 'put',
    data
  })
}
