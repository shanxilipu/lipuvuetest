import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { randomWord } from '@/utils/utils';
import { search, fetchResult } from '@/services/auditManagement/sensitiveLogInquire';

export default {
  namespace: 'sensitiveLogInquire',

  state: {
    rows: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    form: {},
  },

  effects: {
    // 敏感日志查询
    *search({ payload }, { call, put, select }) {
      const preArg = yield select(({ sensitiveLogInquire: state }) => {
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
      const query = yield select(({ sensitiveLogInquire: state }) => {
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
      const response = yield call(search, param);
      if (!response) {
        return new Promise((resolve, reject) => {
          reject();
        });
      }
      const {
        resultCode,
        resultObject,
        resultMsg = `${formatMessage({ id: 'auditManagement.QueryFailed' })}`,
      } = response;
      if (resultCode === '0' && resultObject) {
        const { rows, pageInfo } = resultObject;
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
      } else if (resultCode !== '0') {
        message.error(resultMsg);
      }
      return response;
    },
    // 异步查询结果
    *fetchResult(no, { call, put }) {
      const response = yield call(fetchResult);
      if (!response) {
        return new Promise((resolve, reject) => {
          reject();
        });
      }
      const { resultCode, resultObject } = response;
      if (resultCode === '0' && resultObject != 1) {
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
      }
      return response;
    },
    *clearState(no, { put }) {
      yield put({
        type: 'save',
        payload: {
          rows: [],
          total: 0,
          pageIndex: 1,
          pageSize: 10,
          form: {},
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
