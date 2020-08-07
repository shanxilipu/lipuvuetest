import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { getDatabases, listHivePartitionColumn, hiveUploadFile } from '../services';
import {
  SQL_WINDOW_KEY,
  TREE_NODE_TYPE_DATASOURCE,
  TABLES_ROOT_NAME,
  VIEWS_ROOT_NAME,
  FUNCTIONS_ROOT_NAME,
  MYSQL_DATASOURCE_TYPE,
  ORACLE_DATASOURCE_TYPE,
  HIVE_DATASOURCE_TYPE,
  GREENPLUM_DATASOURCE_TYPE,
  ROOT_NAME,
} from '../constant';
import { getRandomMark, getInitSqlTabs } from '../tools/utils';

const initSqlTabs = getInitSqlTabs();

const initEmptyData = {
  shortcut: null,
  socketMessage: null,
  sqlContent: null, // 查看或编辑 视图、函数、存储过程时，会跳转到程序窗口，并回显sql内容
};

export default {
  namespace: 'dbOperation',
  state: {
    treeData: [],
    expandedTreeKeys: [ROOT_NAME],
    datasourceType: '',
    treeKeyMark: null,
    sqlEditTabs: initSqlTabs.tabs, // 默认有一个未与任何数据库关联的编辑器
    activeWindowKey: SQL_WINDOW_KEY, // 当前打开的窗口key
    activeSqlTabKey: initSqlTabs.editorWindowId, // sql窗口下默认的编辑器tab key
    selectedTreeNode: null, // 当前选择的树节点信息
    currentTableInfo: null, // 当前的表信息
    currentTableMark: 0,
    commonPropsMark: null,
    programWindowEditorComponentId: null,
    saveTableDataEvent: {},
    ...initEmptyData,
  },
  effects: {
    *getDatabases({ payload, callback }, { call, put }) {
      const { resultCode, resultMsg, resultObject } = yield call(getDatabases, payload);
      if (resultCode === '0') {
        // 这里统一改变datasourceType的值
        const datasourceTypes = [
          MYSQL_DATASOURCE_TYPE,
          ORACLE_DATASOURCE_TYPE,
          HIVE_DATASOURCE_TYPE,
          GREENPLUM_DATASOURCE_TYPE,
        ];
        const getCommonProps = item => ({
          parentKey: `${item.datasourceId}`,
          isLeaf: false,
          datasourceId: item.datasourceId,
          datasourceName: item.datasourceName,
        });
        const treeData = resultObject.map(item => ({
          ...item,
          key: `${item.datasourceId}`,
          title: item.datasourceName,
          treeNodeType: TREE_NODE_TYPE_DATASOURCE,
          datasourceType: datasourceTypes.find(o => item.datasourceType.indexOf(o) > -1),
          children: [
            {
              key: getRandomMark(),
              treeNodeType: TABLES_ROOT_NAME,
              title: formatMessage({ id: 'COMMON_TABLE' }),
              ...getCommonProps(item),
            },
            {
              key: getRandomMark(),
              treeNodeType: VIEWS_ROOT_NAME,
              title: formatMessage({ id: 'COMMON_DB_VIEW' }),
              ...getCommonProps(item),
            },
            {
              key: getRandomMark(),
              treeNodeType: FUNCTIONS_ROOT_NAME,
              title: `${formatMessage({ id: 'COMMON_FUNCTION' })}(${formatMessage({
                id: 'COMMON_PROCEDURE',
              })})`,
              ...getCommonProps(item),
            },
          ],
        }));
        yield put({
          type: 'save',
          payload: {
            treeData,
            currentTableInfo: null,
          },
        });
        if (callback) {
          callback();
        }
      } else {
        message.error(resultMsg);
      }
    },
    *listHivePartitionColumn({ payload, callback }, { call }) {
      const { resultCode, resultMsg, resultObject } = yield call(listHivePartitionColumn, payload);
      if (resultCode === '0') {
        if (callback) {
          callback(resultObject);
        }
      } else {
        message.error(resultMsg);
      }
    },
    *hiveUploadFile({ payload, callback }, { call }) {
      const { resultCode, resultMsg, resultObject } = yield call(hiveUploadFile, payload);
      if (resultCode === '0') {
        if (callback) {
          callback(resultObject);
        }
      } else {
        message.error(resultMsg);
      }
    },
  },
  reducers: {
    newSqlEditTab(state, { payload }) {
      let tabs = [];
      const { newTab: tab } = payload;
      const { sqlEditTabs: oldSqlEditTabs, datasourceType: schemaType } = state;
      const editorWindowId = getRandomMark();
      const newTab = { ...tab, editorWindowId, schemaType };
      if (oldSqlEditTabs.length === 1 && oldSqlEditTabs[0].componentId === null) {
        newTab.name = `${newTab.datasourceName}@1`;
        tabs = [newTab];
      } else {
        const { componentId } = newTab;
        const tabsNumWithSameComponentId = oldSqlEditTabs.filter(t => t.componentId === componentId)
          .length;
        newTab.name = `${newTab.datasourceName}@${tabsNumWithSameComponentId + 1}`;
        tabs = oldSqlEditTabs.concat([newTab]);
      }
      const s = {
        sqlEditTabs: tabs,
        activeSqlTabKey: editorWindowId,
        activeWindowKey: SQL_WINDOW_KEY,
      };
      return {
        ...state,
        commonPropsMark: getRandomMark(),
        ...initEmptyData,
        ...s,
      };
    },
    initSqlTabs(state) {
      let initTabs = getInitSqlTabs();
      const { datasourceType, treeData } = state;
      let programWindowEditorComponentId = null;
      if (treeData.length > 0) {
        const editorWindowId = getRandomMark();
        const { datasourceName, datasourceId } = treeData[0];
        initTabs = {
          tabs: [
            {
              name: `${datasourceName}@1`,
              componentId: datasourceId,
              editorWindowId,
              schemaType: datasourceType,
            },
          ],
          editorWindowId,
        };
        programWindowEditorComponentId = datasourceId;
      }
      return {
        ...state,
        commonPropsMark: getRandomMark(),
        ...initEmptyData,
        sqlEditTabs: initTabs.tabs,
        activeSqlTabKey: initTabs.editorWindowId,
        programWindowEditorComponentId,
      };
    },
    save(state, { payload }) {
      return {
        ...state,
        commonPropsMark: getRandomMark(),
        ...initEmptyData,
        ...payload,
      };
    },
    handleShortcutKeys(state, { payload }) {
      const { activeWindowKey, activeSqlTabKey } = state;
      const shortcut = {
        ...payload,
        activeWindowKey,
        activeSqlTabKey,
      };
      return {
        ...state,
        commonPropsMark: getRandomMark(),
        ...initEmptyData,
        shortcut,
      };
    },
  },
};
