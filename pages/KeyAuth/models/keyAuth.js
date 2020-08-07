import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import {
  listAuth,
  listKeys,
  deleteAuth,
  batchDeleteAuth,
  reverseState,
  reverseAuth,
  listSystemTree,
  enableAuth,
  listGroupAuthTarget,
} from '../services/keyAuth';
import { listAllSafeAppsysTree, listAlgorithm2Bit } from '@/services/keyManagement/keyCreatConfig';
import { listAllSafeAppUser } from '@/services/authorizeManagement/applySysAuthorize';

// 授权类型
export const AUTH_TYPE_LIST = [
  {
    name: formatMessage({ id: 'keyAuth.authTypeFull', defaultMessage: '全部密钥授权' }),
    value: 'FULL',
  },
  {
    name: formatMessage({ id: 'keyAuth.authTypeSingle', defaultMessage: '指定密钥授权' }),
    value: 'SINGLE',
  },
];

// 授权级别
export const AUTH_LEVEL_LIST = [
  {
    name: formatMessage({ id: 'keyAuth.authLevelSystem', defaultMessage: '系统级' }),
    value: 'SYSTEM',
  },
  {
    name: formatMessage({ id: 'keyAuth.authLevelUser', defaultMessage: '用户级' }),
    value: 'USER',
  },
];

// 授权状态
export const AUTH_STATE_LIST = [
  {
    name: formatMessage({ id: 'applySysUserManagement.Enable', defaultMessage: '启用' }),
    value: 'A',
  },
  {
    name: formatMessage({ id: 'applySysUserManagement.Disable', defaultMessage: '停用' }),
    value: 'X',
  },
  {
    name: formatMessage({ id: 'keyAuth.someStart', defaultMessage: '部分启用' }),
    value: 'AX',
  },
];

export const EMPTY_LIST = [
  {
    name: formatMessage({ id: 'keyAuth.allSelection', defaultMessage: '全部' }),
    value: '',
  },
];

export default {
  namespace: 'keyAuth',

  state: {},

  effects: {
    *listAuth({ payload }, { call }) {
      const res = yield call(listAuth, payload);
      if (res && res.resultCode === '0') {
        const { rows } = res.resultObject;
        rows.forEach(item => {
          item.appCode =
            item.authLevel === AUTH_LEVEL_LIST[0].value ? item.appSystemCode : item.appUserCode;
          item.appName =
            item.authLevel === AUTH_LEVEL_LIST[0].value ? item.appSystemName : item.appUserName;
        });
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.listAuthTips', defaultMessage: '获取授权列表失败' })
      );
    },
    *listGroupAuthTarget({ payload }, { call }) {
      const res = yield call(listGroupAuthTarget, payload);
      if (res && res.resultCode === '0') {
        const { rows } = res.resultObject;
        rows.forEach((item, index) => {
          item.id = `${index}`;
          item.appCode =
            item.authLevel === AUTH_LEVEL_LIST[0].value ? item.toSysCode : item.toUserCode;
          item.appName =
            item.authLevel === AUTH_LEVEL_LIST[0].value ? item.toSysName : item.toUserName;
        });
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({
            id: 'keyAuth.listAuthGroupTips',
            defaultMessage: '获取密钥权限组列表失败',
          })
      );
    },
    *listSystemTree({ payload }, { call }) {
      const res = yield call(listSystemTree, payload);
      if (res && res.resultCode === '0') {
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.authTreeTips', defaultMessage: '获取授权目录树失败' })
      );
    },
    *listAllSafeAppsysTree({ payload }, { call }) {
      const res = yield call(listAllSafeAppsysTree, payload);
      if (res && res.resultCode === '0') {
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.sysTreeTips', defaultMessage: '获取系统授权目录树失败' })
      );
    },
    *getUsersTree({ payload }, { call }) {
      const { queryCode } = payload;
      const res = yield call(listAllSafeAppUser, queryCode);
      const innerRes = (res && res.resultObject) || {};
      if (res && res.resultCode === '0') {
        const { safeAppSystemList = [], safeAppUserList = [] } = innerRes;
        const users = safeAppUserList.map(o => {
          return {
            ...o,
            type: 'user',
            key: `${o.appUserCode}`,
            title: o.appUserName,
            checkable: true,
            userCode: o.appUserCode,
            userName: o.appUserName,
            userId: o.id,
          };
        });
        return safeAppSystemList.map(o => ({
          ...o,
          type: 'system',
          key: `system_${o.id}`,
          title: o.appsysName,
          checkable: false,
          children: users
            .filter(b => b.appsysId === o.id)
            .map(u => ({ ...u, appSysCode: o.appsysCode })),
        }));
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.userTreeTips', defaultMessage: '获取用户授权目录树失败' })
      );
    },
    *listKeys({ payload }, { call }) {
      const res = yield call(listKeys, payload);
      if (res && res.resultCode === '0') {
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.listKeysTips', defaultMessage: '获取密钥列表失败' })
      );
    },
    *listAlgorithm2Bit({ payload }, { call, put }) {
      const res = yield call(listAlgorithm2Bit, payload);
      if (res && res.resultCode === '0') {
        const list = Object.keys(res.resultObject).map(key => ({
          name: key,
          value: key,
        }));
        yield put({
          type: 'save',
          payload: {
            encryList: list,
          },
        });
        return true;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.getEncryTips', defaultMessage: '获取算法列表失败' })
      );
    },
    *reverseState({ payload }, { call }) {
      const res = yield call(reverseState, payload);
      if (res && res.resultCode === '0') {
        return res.resultObject;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.switchStateTips', defaultMessage: '切换状态失败' })
      );
    },
    *reverseAuth({ payload }, { call }) {
      const res = yield call(reverseAuth, payload);
      if (res && res.resultCode === '0') {
        return true;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.switchStateTips', defaultMessage: '切换状态失败' })
      );
    },
    *deleteAuth({ payload }, { call }) {
      const res = yield call(deleteAuth, payload);
      if (res && res.resultCode === '0') {
        return true;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.deleteKeyTips', defaultMessage: '删除密钥失败' })
      );
    },
    *batchDeleteAuth({ payload }, { call }) {
      const res = yield call(batchDeleteAuth, payload);
      if (res && res.resultCode === '0') {
        return true;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.deleteAuthTips', defaultMessage: '删除授权失败' })
      );
    },
    *enableAuth({ payload }, { call }) {
      const res = yield call(enableAuth, payload);
      if (res && res.resultCode === '0') {
        return true;
      }
      message.error(
        (res && res.resultMsg) ||
          formatMessage({ id: 'keyAuth.saveTips', defaultMessage: '保存授权失败' })
      );
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {};
    },
  },
};
