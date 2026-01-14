import request from '@/utils/request'

// 查询お客様管理列表
export function listCustomer(query) {
  return request({
    url: '/customer/customer/list',
    method: 'get',
    params: query
  })
}

// お客様名に基づいてお客様情報検索
export function getCustomersByName(query) {
  return request({
    url: '/customer/customer/getCustomersByName',
    method: 'get',
    params: query
  })
}

// 查询お客様管理详细
export function getCustomer(customerId) {
  return request({
    url: '/customer/customer/' + customerId,
    method: 'get'
  })
}

// 新增お客様管理
export function addCustomer(data) {
  return request({
    url: '/customer/customer',
    method: 'post',
    data: data
  })
}

// 修改お客様管理
export function updateCustomer(data) {
  return request({
    url: '/customer/customer',
    method: 'put',
    data: data
  })
}

// 删除お客様管理
export function delCustomer(customerId) {
  return request({
    url: '/customer/customer/' + customerId,
    method: 'delete'
  })
}
