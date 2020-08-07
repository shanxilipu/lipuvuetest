import { queryMsgList } from '@/services/systemManagement/codeManagement';

export default {
  namespace: 'sendCheckRule',
  state: {
    pageIndex: 1,
    pageSize: 10,
    data: [],
  },

  effects: {
    // 验证码发送查询
    *queryCodeSend({ payload }, { call, put }) {
      const { pageIndex, pageSize = 10 } = payload;
      yield put({ type: 'save', payload: { pageIndex, pageSize } });
      const response = yield call(queryMsgList, payload);
      if (response.resultCode === '0') {
        const {
          resultObject: { rows: data, records: total },
        } = response;
        yield put({
          type: 'save',
          payload: {
            data,
            total,
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
  },
};
