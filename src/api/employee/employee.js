import request from '@/utils/request'

// 查询社員情報管理列表
export function listEmployee(query) {
  return request({
    url: '/employee/employee/list',
    method: 'get',
    params: query
  })
}

// 查询社員情報管理详细
export function getEmployee(employeeId) {
  return request({
    url: '/employee/employee/' + employeeId,
    method: 'get'
  })
}

export function getEmployeeBySysUserId(sysUserId) {
  return request({
    url: '/employee/employee/getEmployeeBySysUserId/' + sysUserId,
    method: 'get'
  })
}

// 新增社員情報管理
export function addEmployee(data) {
  return request({
    url: '/employee/employee',
    method: 'post',
    data: data
  })
}

// 修改社員情報管理
export function updateEmployee(data) {
  return request({
    url: '/employee/employee',
    method: 'put',
    data: data
  })
}

// 删除社員情報管理
export function delEmployee(employeeId) {
  return request({
    url: '/employee/employee/' + employeeId,
    method: 'delete'
  })
}

// 删除社員情報管理
export function getCaseHistory(employeeId) {
  return request({
    url: '/employee/employee/getCaseHistory',
    method: 'get',
    params: {
      employeeId: employeeId
    }
  })
}

// 删除社員技能
export function delEmployeeSkill(employeeTechnologyId) {
  return request({
    url: '/employee/employee/skill/' + employeeTechnologyId,
    method: 'delete'
  })
}

// 待機社員情報検索
export function getFreeEmployeeList(queryParams) {
  return request({
    url: '/employee/employee/getFreeEmployeeList',
    method: 'get',
    params: queryParams
  })
}

