import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { randomWord } from '@/utils/utils';
import { queryLogRiskList } from '@/services/auditManagement/riskEventInquire';

export default {
  namespace: 'riskEventInquire',

  state: {
    rows: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    form: {},
  },

  effects: {
    // 风险事件查询
    *search({ payload }, { call, put, select }) {
      const preArg = yield select(({ riskEventInquire: state }) => {
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
      const query = yield select(({ riskEventInquire: state }) => {
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
      const response = yield call(queryLogRiskList, param);
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
