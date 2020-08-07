import request from '@/utils/request';

// 获取数据加密列表
export async function listSafeEncryptStorePolicy(payload) {
  const { pageIndex, pageSize, ...res } = payload;
  const url = `smartsafe/SafeEncryptStorePolicyController/listSafeEncryptStorePolicy?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return request(url, {
    method: 'POST',
    body: res,
  });
}

// 新增数据加密
export async function insertSafeEncryptStorePolicy(payload) {
  const url = 'smartsafe/SafeEncryptStorePolicyController/insertSafeEncryptStorePolicy';
  return request(url, {
    method: 'POST',
    body: payload,
  });
}

// 加密存储策略批量更新状态
export async function updateStorePolicyList(payload) {
  console.log(payload);
  const { state, params } = payload;
  const url = `smartsafe/SafeEncryptStorePolicyController/updateStorePolicyList?state=${state}`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}
