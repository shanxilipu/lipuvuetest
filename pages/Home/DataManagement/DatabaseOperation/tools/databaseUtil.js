import {
  getTablesOrViews as getTablesOrViewsService,
  getFunctionsOrProcedures as getFunctionsOrProceduresService,
  getFields as getFieldsService,
} from '../services';
import {
  TABLES_ROOT_NAME,
  TREE_NODE_TYPE_TABLE,
  TREE_NODE_TYPE_VIEW,
  TREE_NODE_TYPE_FUNCTION,
  TREE_NODE_TYPE_FIELD,
  VIEWS_ROOT_NAME,
  FUNCTIONS_ROOT_NAME,
} from '../constant';
import { defaultHandleResponse } from '@/utils/utils';

export function getTablesOrViews(item, keyword) {
  return new Promise(resolve => {
    const { treeNodeType, datasourceId, key: parentKey, datasourceName } = item;
    const type = treeNodeType === TABLES_ROOT_NAME ? 'TABLE' : 'VIEW';
    const payload = { type, keyword, datasourceId };
    getTablesOrViewsService(payload).then(response => {
      defaultHandleResponse(
        response,
        (resultObject = []) => {
          const data = resultObject.map(o => ({
            ...o,
            key: `${datasourceId}${o.id}`,
            title: o.code,
            datasourceId,
            datasourceName,
            parentKey,
            tableId: o.id,
            isLeaf: false,
            treeNodeType: type === 'TABLE' ? TREE_NODE_TYPE_TABLE : TREE_NODE_TYPE_VIEW,
          }));
          resolve(data);
        },
        () => resolve([])
      );
    });
  });
}

export function getFunctionsOrProcedures(item, keyword) {
  return new Promise(resolve => {
    const { datasourceId, key: parentKey, datasourceName } = item;
    const payload = { keyword, datasourceId };
    getFunctionsOrProceduresService(payload).then(response => {
      defaultHandleResponse(
        response,
        (resultObject = []) => {
          const data = resultObject.map(o => ({
            ...o,
            type: o.TYPE,
            name: o.NAME,
            code: o.NAME,
            key: `${datasourceId}${o.NAME}`,
            title: o.NAME,
            treeNodeType: TREE_NODE_TYPE_FUNCTION,
            datasourceId,
            datasourceName,
            isLeaf: true,
            parentKey,
          }));
          resolve(data);
        },
        () => resolve([])
      );
    });
  });
}

export function getFields(item, keyword) {
  return new Promise(resolve => {
    const { id, datasourceId, key: parentKey, datasourceName } = item;
    const payload = { tableId: id, keyword };
    getFieldsService(payload).then(response => {
      defaultHandleResponse(
        response,
        (resultObject = []) => {
          const data = resultObject.map(o => ({
            key: `${datasourceId}${id}${o}`,
            code: o,
            name: o,
            title: o,
            datasourceId,
            datasourceName,
            isLeaf: true,
            parentKey,
            treeNodeType: TREE_NODE_TYPE_FIELD,
          }));
          resolve(data);
        },
        () => resolve([])
      );
    });
  });
}

export function loadChildren(item, keyword, callback) {
  const { treeNodeType } = item;
  if (treeNodeType === TABLES_ROOT_NAME || treeNodeType === VIEWS_ROOT_NAME) {
    getTablesOrViews(item, keyword).then(data => {
      callback(data);
    });
  } else if (treeNodeType === FUNCTIONS_ROOT_NAME) {
    getFunctionsOrProcedures(item, keyword).then(data => {
      callback(data);
    });
  } else if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TREE_NODE_TYPE_VIEW) {
    getFields(item, keyword).then(data => {
      callback(data);
    });
  }
}
