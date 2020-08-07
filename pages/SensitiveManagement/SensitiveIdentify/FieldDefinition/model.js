import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import * as services from '@/services/sensitiveManagement/fieldDefinition';

export default {
  namespace: 'fieldDefinition',

  state: {
    senseLevels: [],
    senseMeasures: [],
    tableDatasource: [
      // {
      //   fieldCode: 'aqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
      //   state: true,
      //   levelId: 1,
      //   desensitizeId: 2,
      // },
      // { fieldCode: 'b', state: false, levelId: 1, desensitizeId: 2 },
      // { fieldCode: 'c', state: true, levelId: 1, desensitizeId: 2 },
      // { fieldCode: 'd', state: false, levelId: 1, desensitizeId: 2 },
      // { fieldCode: 'e', state: false, levelId: 1, desensitizeId: 2 },
    ],
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

    *getTableSensitiveFieldList({ payload }, { call, put }) {
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldDefinition.GetTableFieldsFailed',
          defaultMessage: '获取表敏感字段失败!',
        })}`,
        resultObject,
      } = yield call(services.getTableSensitiveFieldList, payload);
      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      const tableDatasource = (resultObject || []).map(o => {
        const { id: objectFieldId, code: fieldCode, sensitiveFieldDto } = o;
        const {
          id,
          datasourceId,
          tableId: dataobjectId,
          status: state,
          levelId,
          desensitizeId,
          defineType = '1',
        } = sensitiveFieldDto || {};
        return {
          id,
          datasourceId,
          dataobjectId,
          objectFieldId,
          defineType,
          fieldCode,
          state,
          levelId,
          desensitizeId,
        };
      });

      yield put({
        type: 'save',
        payload: {
          tableDatasource,
        },
      });
    },

    *saveOrUpdateSensitiveField({ payload }, { call }) {
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldDefinition.SaveTableFieldsFailed',
          defaultMessage: '保存手动定义敏感字段失败!',
        })}`,
      } = yield call(services.saveOrUpdateSensitiveField, payload);
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS', defaultMessage: '保存成功' }));
      }
    },

    *getSafeSensitiveField({ payload }, { call }) {
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldDefinition.GetTableFieldsFailed',
          defaultMessage: '获取表敏感字段失败!',
        })}`,
      } = yield call(services.getSafeSensitiveField, payload);
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
