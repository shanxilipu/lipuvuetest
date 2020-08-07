import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import * as services from '@/services/sensitiveManagement/fieldInquire';

export default {
  namespace: 'fieldInquire',

  state: {
    lists: [],
    pageInfo: {},
    senseLevels: [],
    senseMeasures: [],
  },

  effects: {
    *qryDictionary(_, { all, call, put }) {
      const [result1, result2] = yield all([
        call(services.qryAllSafeSensitiveLevel),
        call(services.qryAllMeasureConfig),
      ]);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldInquire.QuerySensitivityLevelFailed',
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
          id: 'FieldInquire.QuerySensitiveMeasuresFailed',
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

    *qrySensitiveField({ payload }, { call, put }) {
      const response = yield call(services.qrySensitiveField, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldInquire.QueryListFailed',
          defaultMessage: '敏感字段列表查询失败!',
        })}`,
        resultObject,
      } = response;
      if (resultCode === '-1') {
        message.error(resultMsg);
      }
      const { rows: lists, pageInfo } = resultObject;
      yield put({
        type: 'save',
        payload: {
          lists,
          pageInfo,
        },
      });
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
