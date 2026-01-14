import request from '@/utils/request'

// 查询技術情報管理列表
export function listTechnology(query) {
  return request({
    url: '/technology/technology/list',
    method: 'get',
    params: query
  })
}

// 查询技術全部情報
export function getAllTechnology() {
  return request({
    url: '/technology/technology/getAll',
    method: 'get'
  })
}

// 查询技術情報管理详细
export function getTechnology(technologyId) {
  return request({
    url: '/technology/technology/' + technologyId,
    method: 'get'
  })
}

// 新增技術情報管理
export function addTechnology(data) {
  return request({
    url: '/technology/technology',
    method: 'post',
    data: data
  })
}

// 修改技術情報管理
export function updateTechnology(data) {
  return request({
    url: '/technology/technology',
    method: 'put',
    data: data
  })
}

// 删除技術情報管理
export function delTechnology(technologyId) {
  return request({
    url: '/technology/technology/' + technologyId,
    method: 'delete'
  })
}
