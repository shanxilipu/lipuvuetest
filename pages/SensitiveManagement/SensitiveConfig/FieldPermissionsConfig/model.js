import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import * as services from '@/services/sensitiveManagement/fieldPermissionsConfig';

function convertComAcctTree(objs) {
  if (Array.isArray(objs)) {
    objs.forEach(obj => {
      if (!obj) {
        return;
      }
      obj.key = obj.userId;
      obj.title = obj.userName;
      if (obj.children && obj.children.length > 0) {
        convertComAcctTree(obj.children);
      }
    });
  }
}

export default {
  namespace: 'fieldPermissionsConfig',

  state: {
    operators: [],
    senseLevels: [],
    senseMeasures: [],

    tableDatasource: [],
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
          id: 'FieldPermissionsConfig.QuerySensitivityLevelFailed',
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
        resultMsg: m1 = '查询敏感措施失败!',
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

    *getUserByComAcctId({ payload }, { call, put }) {
      // const { topUserInfo: { comAcctId = 0 } = {} } = yield select(o => o.user) || {};
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldPermissionsConfig.GetSensitiveFieldsFailed',
          defaultMessage: '获取表敏感字段失败!',
        })}`,
        resultObject,
      } = yield call(services.getUserByComAcctId, payload);

      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      let { data = [] } = resultObject;

      if (data === null) {
        data = [];
      }
      convertComAcctTree(data);
      yield put({
        type: 'save',
        payload: {
          operators: data,
        },
      });
    },

    *getTableSensitiveFieldList({ payload }, { call, put }) {
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldPermissionsConfig.sensitiveFieldPermissionsFailed',
          defaultMessage: '获取用户敏感字段权限失败!',
        })}`,
        resultObject,
      } = yield call(services.getTableSensitiveFieldList, payload);

      if (resultCode !== '0') {
        message.error(resultMsg);
        return;
      }
      const tableDatasource = (resultObject || []).map(o => {
        const { id: fieldId, code: fieldCode, sensitiveFieldDto } = o;
        const { id, datasourceId, tableId: dataobjectId, status: state, levelId, desensitizeId } =
          sensitiveFieldDto || {};
        return {
          id,
          datasourceId,
          dataobjectId,
          fieldId,
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
          id: 'FieldPermissionsConfig.SensitiveFieldPermissionConfigFailed',
          defaultMessage: '敏感字段权限配置失败!',
        })}`,
      } = yield call(services.saveOrUpdateSensitiveField, payload);
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
      message.success('保存成功');
    },

    *copy(
      {
        payload: { copyUserId, pasteUserId },
      },
      { call }
    ) {
      const {
        resultCode,
        resultMsg = `${formatMessage({
          id: 'FieldPermissionsConfig.QueryingUserPermissionsFailed',
          defaultMessage: '查询用户敏感字段权限失败!',
        })}`,
        resultObject,
      } = yield call(services.listSafeUserSpecialRoleByUserId, { userId: copyUserId });
      if (resultCode !== '0') {
        message.error(resultMsg);
      }
      const safeUserSpecialRoleList = resultObject.map(o => {
        return {
          userId: pasteUserId,
          fieldId: o.fieldId,
          levelId: o.levelId,
          desensitizeId: o.desensitizeId,
          state: o.state,
          datasourceId: o.datasourceId,
          dataobjectId: o.dataobjectId,
        };
      });
      const { resultCode: code } = yield call(services.saveSafeUserSpecialRole, {
        safeUserSpecialRoleList,
      });
      return code;
    },
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
