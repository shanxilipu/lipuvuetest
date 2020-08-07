import request from '@/utils/request';

// 获取数据源
export function getDatabases(payload) {
  return request('smartsafe/DatasourceController/listDatabase', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取数据源下的表
export function getTablesOrViews(payload) {
  return request('smartsafe/DatasourceController/listComponent', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取数据源下的函数或存储过程
export function getFunctionsOrProcedures(payload) {
  return request('smartsafe/DatasourceController/listFunction', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取表或视图下的字段
export function getFields(payload) {
  return request('smartsafe/DatasourceController/listFields', {
    method: 'GET',
    body: { ...payload },
  });
}

// 获取数据源类型
export function getDatasourceTypes(payload) {
  return request('smartsafe/DatasourceController/getDatasourceTypes', {
    method: 'GET',
    body: { ...payload },
  });
}
