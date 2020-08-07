import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import * as services from '@/services/authorizeManagement/applySysAuthorize';
import * as util from './util';

export default {
  namespace: 'applySysAuthorize',

  state: {
    treeDatasource: [],
    commands: [],
    dataTypeList: [],
    senseLevels: [],
    senseMeasures: [],
    pageInfo: [],
    specialPageInfo: [],
    tableDatasource: [],
    specialTableDatasource: [],
    defaultUser: [],
  },

  effects: {
    *qryDictionary(_, { all, call, put }) {
      const [result1] = yield all([call(services.listAllSafeDatabaseOperation)]);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'ApplySysAuthorize.QueryCommandFailed',
          defaultMessage: '查询操作命令失败!',
        })}`,
        resultObject = [],
      } = result1;
      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      yield put({
        type: 'save',
        payload: {
          commands: resultObject.map(o => {
            return { id: o.id, name: o.executeCommand };
          }),
        },
      });
    },

    *qrySpecialDictionary(_, { all, call, put }) {
      const [result1, result2] = yield all([
        call(services.qryAllSafeSensitiveLevel),
        call(services.qryAllMeasureConfig),
      ]);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'ApplySysAuthorize.QuerySensitivityLevelFailed',
          defaultMessage: '查询敏感级别失败!',
        })}`,
        resultObject = [],
      } = result1;
      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      const {
        resultCode: c1,
        resultMsg: m1 = `${formatMessage({
          id: 'ApplySysAuthorize.QuerySensitiveMeasuresFailed',
          defaultMessage: '查询敏感措施失败!',
        })}`,
        resultObject: o1 = [],
      } = result2;
      if (c1 !== '0') {
        message.error(m1);
        return;
      }
      yield put({
        type: 'save',
        payload: {
          senseLevels: resultObject.map(o => {
            return { id: o.id, name: o.levelName };
          }),
          senseMeasures: o1.map(o => {
            return { id: o.id, name: o.desensitizeName };
          }),
        },
      });
    },

    *listAllSafeAppUser({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          treeDatasource: [],
        },
      });

      const response = yield call(services.listAllSafeAppUser, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'ApplySysAuthorize.QueryDirFailed',
          defaultMessage: '应用系统目录查询失败!',
        })}`,
        resultObject,
      } = response;
      if (resultCode === '-1') {
        message.error(resultMsg);
      }
      const {
        safeAppSystemList = [],
        safeAppUserList = [],
        safeAppsysCatalogList = [],
      } = resultObject;
      const users = safeAppUserList.map(o => {
        return {
          type: 'user',
          key: `${o.id}`,
          title: o.appUserName,
          ...o,
        };
      });
      const systems = safeAppSystemList.map(o => {
        return {
          type: 'system',
          key: `system_${o.id}`,
          title: o.appsysName,
          children: users
            .filter(b => b.appsysId === o.id)
            .map(u => ({ ...u, appSysCode: o.appsysCode })),
          ...o,
        };
      });

      const catalog = safeAppsysCatalogList.map(o => {
        return {
          type: 'catalog',
          key: `catalog_${o.catalogId}`,
          ...o,
        };
      });

      const treeDatasource = util.convertCatalog(catalog, systems);

      yield put({
        type: 'save',
        payload: {
          treeDatasource,
          defaultUser: {
            id: (users[0] && [String(users[0].id)]) || [],
            name: users[0] && users[0].appUserName,
          },
        },
      });
      let selectObj = {};
      if (users.length) {
        const { id, appsysId, appUserName, appUserCode } = users[0];
        const sys = safeAppSystemList.find(o => `${o.id}` === `${appsysId}`) || {};
        selectObj = { id: `${id}`, appsysId, appUserCode, appUserName, appSysCode: sys.appsysCode };
      }
      return selectObj;
    },

    // 查询特殊字段表
    *listSafeAppUserFieldAuth({ payload }, { call, put }) {
      const response = yield call(services.listSafeAppUserFieldAuth, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'ApplySysAuthorize.QueryUserSpecialTableFailed',
          defaultMessage: '用户特殊表权限查询失败!',
        })}`,
        resultObject,
      } = response;
      if (resultCode === '-1') {
        message.error(resultMsg);
      }
      const { pageInfo, rows } = resultObject;
      rows.map((o, key) => {
        o.id = key;
        return o;
      });
      yield put({
        type: 'save',
        payload: {
          specialPageInfo: pageInfo,
          specialTableDatasource: rows,
        },
      });
    },

    // 查询特殊字段详情
    *listFieldsAuthDetailInfo({ payload }, { call }) {
      const response = yield call(services.listFieldsAuthDetailInfo, payload);
      return response || {};
    },

    // 特殊字段展开
    *listSafeAppUserFieldAuthDetail({ payload }, { call }) {
      const response = yield call(services.listSafeAppUserFieldAuthDetail, payload);
      return response || {};
    },

    // 保存特殊字段详情
    *saveSafeAppUserFieldAuth({ payload }, { call }) {
      const response = yield call(services.saveSafeAppUserFieldAuth, payload);
      return response || {};
    },

    // 查询用户权限操作命令表
    *listSingleTableAuthOperation({ payload }, { call }) {
      const response = yield call(services.listSingleTableAuthOperation, payload);
      return response || {};
    },

    // 查询字段详情
    *listSafeAppUserTableAuthOperation({ payload }, { call }) {
      const response = yield call(services.listSafeAppUserTableAuthOperation, payload);
      return response || {};
    },

    // 查询特殊字段详情
    *queryAuthFields({ payload }, { call }) {
      const response = yield call(services.queryAuthFields, payload);
      return response || {};
    },

    // 删除用户权限表
    *multiDeleteSafeAppUserTableAuth({ payload }, { call }) {
      const response = yield call(services.multiDeleteSafeAppUserTableAuth, payload);
      return response || {};
    },

    // 保存更新授权
    *saveOrUpdateUserTableAuth({ payload }, { call }) {
      const response = yield call(services.saveOrUpdateUserTableAuth, payload);
      return response || {};
    },

    // 删除特殊更新字段
    *multiDeleteSafeAppUserFieldAuth({ payload }, { call }) {
      const response = yield call(services.multiDeleteSafeAppUserFieldAuth, payload);
      return response || {};
    },

    // 复制粘贴用户
    *copySafeAppUserTableAuth({ payload }, { call }) {
      const response = yield call(services.copySafeAppUserTableAuth, payload);
      return response || {};
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
