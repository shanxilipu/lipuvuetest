import request from '@/utils/request';

export function getStrategyList(payload) {
  return request('smartsafe/DataEncryptStoreController/queryStoreFields', {
    method: 'POST',
    body: payload,
  });
}

export function deleteStrategy(payload) {
  return request('smartsafe/DataEncryptStoreController/delStoreFields', {
    method: 'POST',
    body: payload,
  });
}

export function getSensitiveFieldsByTable(payload) {
  return request('smartsafe/DataEncryptStoreController/searchSensitiveFieldByTable', {
    method: 'POST',
    body: payload,
  });
}

export function getSensitiveGroupedDatasource(payload = {}) {
  return request('smartsafe/DataEncryptStoreController/searchSensitiveEncryptDatasource', {
    method: 'POST',
    body: payload,
  });
}

export function analyseEncryption(payload) {
  return request('smartsafe/DataEncryptStoreController/encryptAnalysis', {
    method: 'POST',
    body: payload,
  });
}

export function getExistFieldsByGroup(payload) {
  return request('smartsafe/DataEncryptStoreController/searchSensitiveFieldByGroup', {
    method: 'POST',
    body: payload,
  });
}

export function getEncryptStoreTask(payload) {
  return request('smartsafe/DataEncryptStoreController/listEncryptStoreTask', {
    method: 'POST',
    body: payload,
  });
}

export function checkTaskFinish(payload) {
  return request('smartsafe/DataEncryptStoreController/checkTaskFinish', {
    method: 'POST',
    body: payload,
  });
}

export function submitInitialTask(payload) {
  return request('smartsafe/DataEncryptStoreController/submitStoreTask', {
    method: 'POST',
    body: payload,
  });
}

export function finishInitialTask(payload) {
  return request('smartsafe/DataEncryptStoreController/finishStoreTask', {
    method: 'POST',
    body: payload,
  });
}

export function saveStrategy(payload) {
  return request('smartsafe/DataEncryptStoreController/saveEncryptStore', {
    method: 'POST',
    body: payload,
  });
}
