import request from '@/utils/request';

export function getKeysList(payload) {
  return request('smartsafe/DataKeyGeneratorController/listKeys', {
    method: 'POST',
    body: payload,
  });
}

export function getSensitiveTablesByDatasource(payload = {}, isGetAllTable) {
  const url = `smartsafe/DataEncryptStoreController/${
    isGetAllTable ? 'searchSensitiveTableInDatasourceAll' : 'searchSensitiveTableInDatasource'
  }`;
  return request(url, {
    method: 'POST',
    body: payload,
  });
}

export function getAlgorithm2Bit(payload = {}) {
  return request('smartsafe/DataKeyGeneratorController/listAlgorithm2Bit', {
    method: 'POST',
    body: payload,
  });
}

export function createKey(payload) {
  return request('smartsafe/DataKeyGeneratorController/createKey', {
    method: 'POST',
    body: payload,
  });
}

export function generateCutOverPlan(payload) {
  return request('smartsafe/DataKeyGeneratorController/modifyKey', {
    method: 'POST',
    body: payload,
  });
}

export function saveCutOverPlan(payload) {
  return request('smartsafe/DataKeyGeneratorController/modifyKeySave', {
    method: 'POST',
    body: payload,
  });
}

export function confirmCutOverFinish(payload) {
  return request('smartsafe/DataKeyGeneratorController/modifyKeyFinish', {
    method: 'POST',
    body: payload,
  });
}

export function isKeyModifySave(payload) {
  return request('smartsafe/DataKeyGeneratorController/iskeyModifySave', {
    method: 'POST',
    body: payload,
  });
}

export function deleteKey(payload) {
  return request('smartsafe/DataKeyGeneratorController/deleteKeys', {
    method: 'POST',
    body: payload,
  });
}

export function getKeysAuthList(payload) {
  return request('smartsafe/DataKeyGeneratorController/listAuth', {
    method: 'POST',
    body: payload,
  });
}

export function getAllPortalUsers(payload = {}) {
  const url = 'smartsafe/UserController/getUserByComAcctId';
  return request(url, {
    method: 'GET',
    body: payload,
  });
}

export function batchAuthUpdate(payload = {}) {
  return request('smartsafe/DataKeyGeneratorController/batchAuthUpdate', {
    method: 'POST',
    body: payload,
  });
}

export function batchEnableOrDisableAuth(ids, checked) {
  const url = `smartsafe/DataKeyGeneratorController/${checked ? 'enableAuth' : 'disableAuth'}`;
  return request(url, {
    method: 'POST',
    body: ids,
  });
}

export function getKeyDownloadRecords(payload = {}) {
  return request('smartsafe/DataKeyAuthLogController/listDataKeyAuthLog', {
    method: 'POST',
    body: payload,
  });
}

export function addAuth(payload) {
  return request('smartsafe/DataKeyGeneratorController/addAuth', {
    method: 'POST',
    body: payload,
  });
}

export function deleteAuth(payload) {
  return request('smartsafe/DataKeyGeneratorController/deleteAuth', {
    method: 'POST',
    body: payload,
  });
}
