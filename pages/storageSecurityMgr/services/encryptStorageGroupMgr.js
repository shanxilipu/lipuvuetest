import request from '@/utils/request';

export function getGroupList(payload = {}) {
  return request('smartsafe/DataSafeEncryptGroupController/listEncryptGroup', {
    method: 'POST',
    body: payload,
  });
}

export function addGroup(payload = {}) {
  return request('smartsafe/DataSafeEncryptGroupController/insertEncryptGroup', {
    method: 'POST',
    body: payload,
  });
}

export function updateGroup(payload = {}) {
  return request('smartsafe/DataSafeEncryptGroupController/updateEncryptGroup', {
    method: 'POST',
    body: payload,
  });
}

export function deleteGroup(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/delEncryptGroup', {
    method: 'POST',
    body: payload,
  });
}

export function getGroupDatasourceList(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/listEncryptGroupDetail', {
    method: 'POST',
    body: payload,
  });
}

export function getUnGroupedDatasource(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/listDatasourceNoGroup', {
    method: 'POST',
    body: payload,
  });
}

export function insertDatasourceIntoGroup(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/insertEncryptGroupDetail', {
    method: 'POST',
    body: payload,
  });
}

export function getCutOverScriptOfDatasource(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/getScriptByDatasource', {
    method: 'POST',
    body: payload,
  });
}

export function deleteDatasourceFromGroup(payload) {
  return request('smartsafe/DataSafeEncryptGroupController/delEncryptGroupDetail', {
    method: 'POST',
    body: payload,
  });
}
