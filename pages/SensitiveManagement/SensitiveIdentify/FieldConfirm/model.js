import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import * as services from '@/services/sensitiveManagement/fieldMeasure';

export default {
  namespace: 'fieldConfirm',

  state: {
    rows: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    form: {},
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

    *qrySensitiveField({ payload }, { call, put, select }) {
      const preArg = yield select(({ fieldConfirm: state }) => {
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
      const query = yield select(({ fieldConfirm: state }) => {
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
        if (item === 'otherFilter') {
          if (query.otherFilter.indexOf('isCovert') > -1) {
            param.isCovert = '1';
          }
          if (query.otherFilter.indexOf('isNewest') > -1) {
            param.isNewest = '1';
          }
          if (query.otherFilter.indexOf('isSensitive') > -1) {
            param.isSensitive = '1';
          }
        } else if (
          (item === 'levelIds' || item === 'desensitizeIds') &&
          (query[item] || `${query[item]}` === '0')
        ) {
          param[item] = [query[item]];
        } else if (query[item] || `${query[item]}` === '0') {
          param[item] = query[item];
        }
      });
      const response = yield call(services.qrySensitiveField, param);
      const {
        resultCode,
        resultObject = {},
        resultMsg = `${formatMessage({
          id: 'FieldConfirm.QueryListFailed',
          defaultMessage: '待确认敏感字段列表查询失败！',
        })}`,
      } = response;
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

    *deleteUnConfirmSensitiveField({ payload }, { call }) {
      const response = yield call(services.deleteUnConfirmSensitiveField, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldConfirm.DeletePendingSensitiveFieldsFailed',
          defaultMessage: '删除待确认敏感字段失败！',
        })}`,
      } = response;
      if (resultCode === '-1') {
        message.error(resultMsg);
      }
      return response;
    },

    *saveUnConfirmSensitiveField({ payload }, { call }) {
      const response = yield call(services.saveUnConfirmSensitiveField, payload);
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldConfirm.SavePendingSensitiveFieldsFailed',
          defaultMessage: '保存待确认敏感字段失败！',
        })}`,
      } = response;
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
      return response;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
    clearState() {
      return {
        rows: [],
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        form: {},
        senseLevels: [],
        senseMeasures: [],
      };
    },
  },
};
