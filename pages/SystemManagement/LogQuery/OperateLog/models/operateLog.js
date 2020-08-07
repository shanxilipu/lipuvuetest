import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { queryLogList } from '@/services/systemManagement/operateLog';

export default {
  namespace: 'operateLog',

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
      const preArg = yield select(({ operateLog: state }) => {
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
      const query = yield select(({ operateLog: state }) => {
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
      const response = yield call(queryLogList, param);
      const {
        resultCode,
        resultObject = {},
        msg = `${formatMessage({ id: 'auditManagement.QueryFailed' })}`,
      } = response;
      if (resultCode === '0') {
        const { rows, pageInfo } = resultObject;
        const { total } = pageInfo;
        yield put({
          type: 'save',
          payload: {
            rows,
            total,
          },
        });
      } else {
        message.error(msg);
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
