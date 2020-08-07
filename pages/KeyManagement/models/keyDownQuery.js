import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { randomWord } from '@/utils/utils';
import { listAlgorithm2Bit } from '@/services/keyManagement/keyCreatConfig';
import { listDownload } from '@/services/keyManagement/keyDownQuery';

export default {
  namespace: 'keyDownQuery',

  state: {
    rows: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    form: {},

    encryptAlgorithm: [],
  },

  effects: {
    // 风险事件查询
    *search({ payload }, { call, put, select }) {
      const preArg = yield select(({ keyDownQuery: state }) => {
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
      const query = yield select(({ keyDownQuery: state }) => {
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
      const response = yield call(listDownload, param);
      const {
        resultCode,
        resultObject = {},
        resultMsg = `${formatMessage({ id: 'auditManagement.QueryFailed' })}`,
      } = response;
      if (resultCode === '0') {
        const { rows = [], pageInfo } = resultObject;
        const { total } = pageInfo;
        const newRows = rows.map(item => {
          return { ...item, itemKey: `itemId_${randomWord(false, 40)}` };
        });
        yield put({
          type: 'save',
          payload: {
            rows: newRows,
            total,
          },
        });
      } else {
        message.error(resultMsg);
      }
    },
    // 秘钥算法下拉值
    *listAlgorithm2Bit({ payload = {} }, { call, put }) {
      const response = yield call(listAlgorithm2Bit, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'keyManagement.getAlgorithmFailTip' })}`,
      } = response;
      if (resultCode === '-1') {
        message.error(resultMsg);
      } else {
        const { resultObject = {} } = response;
        const keys = Object.keys(resultObject);
        const encryptAlgorithm = keys.map(item => {
          return { id: item, name: item };
        });
        yield put({
          type: 'save',
          payload: {
            encryptAlgorithm,
          },
        });
      }
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
      };
    },
  },
};
