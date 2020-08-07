import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import {
  listSafeEncryptStorePolicy,
  insertSafeEncryptStorePolicy,
  updateStorePolicyList,
} from './services';
import * as services from '@/services/sensitiveManagement/fieldDefinition';

export default {
  namespace: 'encrypeSaveStrategy',

  state: {
    rows: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    form: {},
    senseLevels: [],
  },

  effects: {
    // 风险事件查询
    *search({ payload }, { call, put, select }) {
      const preArg = yield select(({ encrypeSaveStrategy: state }) => {
        const { form, pageIndex, pageSize } = state;
        return {
          form,
          pageIndex,
          pageSize,
        };
      });
      const { pageSize: getPgeSize, pageIndex: getPgeIndex, ...res } = payload;
      const newPageSize = getPgeSize || preArg.pageSize;
      const newPageIndex = getPgeIndex || preArg.pageIndex;
      const newForm = { ...preArg.form, ...res };
      yield put({
        type: 'save',
        payload: { pageIndex: newPageIndex, pageSize: newPageSize, form: newForm },
      });
      const query = yield select(({ encrypeSaveStrategy: state }) => {
        const { form, pageIndex, pageSize } = state;
        return {
          ...form,
          pageIndex,
          pageSize,
        };
      });
      const keys = Object.keys(query);
      const param = {};
      keys.forEach(item => {
        if (query[item] || `${query[item]}` === '0') {
          param[item] = query[item];
        }
      });
      const response = yield call(listSafeEncryptStorePolicy, param);
      const { resultCode, resultObject = {}, resultMsg = '' } = response;
      if (resultCode === '0') {
        const { rows = [], pageInfo } = resultObject;
        const { total } = pageInfo;
        yield put({
          type: 'save',
          payload: {
            rows,
            total,
          },
        });
      } else {
        message.error(resultMsg);
      }
    },
    // 获取安全等级
    *qryDictionary(_, { call, put }) {
      const response = yield call(services.qryAllSafeSensitiveLevel);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldInquire.QuerySensitivityLevelFailed',
          defaultMessage: '查询敏感级别失败!',
        })}`,
        resultObject = [],
      } = response;
      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      yield put({
        type: 'save',
        payload: {
          senseLevels: resultObject.map(o => {
            return { id: o.id, name: o.levelName };
          }),
        },
      });
    },

    // 新增数据加密
    *insertSafeEncryptStorePolicy({ payload }, { call }) {
      const response = yield call(insertSafeEncryptStorePolicy, payload);
      const { resultCode, resultMsg } = response;
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
      return response;
    },

    // 加密存储策略批量更新状态
    *updateStorePolicyList({ payload }, { call }) {
      const response = yield call(updateStorePolicyList, payload);
      const { resultCode, resultMsg } = response;
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
      return response;
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearState(state) {
      return {
        ...state,
        rows: [],
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        form: {},
        senseLevels: [],
      };
    },
  },
};
