import { queryList, updateValidCode } from '@/services/systemManagement/codeManagement';

export default {
  namespace: 'tempConfigRule',
  state: {
    pageIndex: 1,
    pageSize: 10,
    rows: [],
  },

  effects: {
    // 验证码管理模板配置查询
    *setCodeTemplateList({ payload }, { call, put }) {
      const { pageIndex = 1, pageSize = 10 } = payload;
      yield put({ type: 'save', payload: { isLoading: true, pageIndex, pageSize } });
      const response = yield call(queryList, payload);
      if (response.resultCode === '0') {
        const {
          resultObject: { rows = [], records: total },
        } = response;
        yield put({
          type: 'save',
          payload: {
            rows: rows.filter(o => `${o.validType}` === '3'),
            total,
            isLoading: false,
          },
        });
      }
    },

    // 验证码管理模板配置修改
    *updateCodeTemplate({ payload }, { call, put }) {
      const { pageIndex = 1, pageSize = 10 } = payload;
      yield put({ type: 'save', payload: { isLoading: true, pageIndex, pageSize } });
      const response = yield call(updateValidCode, payload);
      if (response.resultCode === '0') {
        yield put({
          type: 'save',
          payload: { ...response.resultObject, isLoading: false },
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
  },
};
