import request from '@/utils/request';

// 获取授权列表
export function listAuth(payload) {
  return request('smartsafe/KeyGeneratorController/listAuth', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 获取权限组密钥列表
export function listGroupAuthTarget(payload) {
  return request('smartsafe/KeyGeneratorController/listGroupAuthTarget', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 获取密钥列表
export function listKeys(payload) {
  return request('smartsafe/KeyGeneratorController/listKeys', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 删除授权
export function deleteAuth(payload) {
  return request('smartsafe/KeyGeneratorController/deleteAuth', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 删除授权
export function batchDeleteAuth(payload) {
  return request('smartsafe/KeyGeneratorController/batchDeleteAuth', {
    method: 'POST',
    body: payload,
  });
}

// 启用/停用密钥
export function reverseState(payload) {
  return request('smartsafe/KeyGeneratorController/reverseState', {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 启用/停用授权
export function reverseAuth(payload) {
  return request('smartsafe/KeyGeneratorController/batchChangeState', {
    method: 'POST',
    body: payload,
  });
}

// 获取授权目录树
export function listSystemTree(payload) {
  return request(`smartsafe/KeyGeneratorController/listSystemTree?keyword=${payload.keyword}`, {
    method: 'POST',
    body: {
      ...payload,
    },
  });
}

// 保存授权
export function enableAuth(payload) {
  return request('smartsafe/KeyGeneratorController/enableAuth', {
    method: 'POST',
    body: payload,
  });
}
