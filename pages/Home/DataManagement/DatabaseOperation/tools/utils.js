import isString from 'lodash/isString';
import {
  GREENPLUM_COMPONENT_TYPE,
  GREENPLUM_DATASOURCE_TYPE,
  HIVE_COMPONENT_TYPE,
  HIVE_DATASOURCE_TYPE,
  MYSQL_COMPONENT_TYPE,
  MYSQL_DATASOURCE_TYPE,
  ORACLE_COMPONENT_TYPE,
  ORACLE_DATASOURCE_TYPE,
  TABLES_ROOT_NAME,
  VIEWS_ROOT_NAME,
  FUNCTIONS_ROOT_NAME,
  SCRIPT_STATUS_PENDING,
  SCRIPT_STATUS_RUNNING,
  scriptStatusDisplayText,
} from '../constant';
import { checkLanguageIsEnglish } from '@/utils/utils';

export function getRandomMark() {
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let editorWindowId = '';
  for (let i = 0; i < 9; i++) {
    let idx = Math.floor(Math.random() * str.length) - 1;
    if (idx < 0) {
      idx = 0;
    } else if (idx >= str.length) {
      idx--;
    }
    editorWindowId += str[idx];
  }
  return editorWindowId;
}

const randomRowKeyPrefix = 'randomKey_';

export function getRandomRowKey() {
  return `${randomRowKeyPrefix}${getRandomMark()}`;
}

export function checkIsRandomRowKey(rowKey) {
  return (
    rowKey &&
    isString(rowKey) &&
    rowKey.startsWith(randomRowKeyPrefix) &&
    rowKey.length === randomRowKeyPrefix.length + 9
  );
}

export function getInitSqlTabs() {
  const editorWindowId = getRandomMark();
  return {
    tabs: [{ name: 'Untitled', componentId: null, editorWindowId, schemaType: '' }],
    editorWindowId,
  };
}

export function getParagraphStatus(status) {
  return scriptStatusDisplayText[status];
}

export function isParagraphRunning(status) {
  if (!status) {
    return false;
  }

  return status === SCRIPT_STATUS_PENDING || status === SCRIPT_STATUS_RUNNING;
}

export function getResultTable(data) {
  const textRows = data.split('\n');
  const dataSource = [];
  let commentRow = false;
  const columns = [];
  textRows.forEach((textRow, i) => {
    if (commentRow) {
      return true;
    }
    if (textRow === '' || textRow === '<!--TABLE_COMMENT-->') {
      if (dataSource.length > 0) {
        commentRow = true;
      }
      return true;
    }
    const textCols = textRow.split('\t');
    const cols = { rowKey: i };
    textCols.forEach((col, j) => {
      if (i === 0) {
        columns.push({ title: col, dataIndex: col });
      } else {
        const valueOfCol = parseFloat(col);
        if (!Number.isNaN(valueOfCol) && Number.isFinite(col)) {
          col = valueOfCol;
        }
        const { dataIndex } = columns[j];
        if (typeof col === 'string') {
          col = col.length > 100 ? `${col.substring(0, 100)}...` : col;
        }
        cols[dataIndex] = col;
      }
    });
    if (i !== 0) {
      dataSource.push(cols);
    }
  });
  return { columns, dataSource };
}

export function getShowTotalText(total) {
  if (!checkLanguageIsEnglish()) {
    return `共${total}条`;
  }
  return `Total ${total}`;
}

export function getChildrenInTreeData(database, type) {
  const { children } = database;
  const treeNodeType =
    type === 'table' ? TABLES_ROOT_NAME : type === 'view' ? VIEWS_ROOT_NAME : FUNCTIONS_ROOT_NAME;
  const root = children.find(o => o.treeNodeType === treeNodeType);
  return root.children || [];
}

export const getComponentType = type => {
  const datasourceType = type.toLowerCase();
  if (datasourceType.indexOf(MYSQL_DATASOURCE_TYPE) > -1) {
    return MYSQL_COMPONENT_TYPE;
  }
  if (datasourceType.indexOf(ORACLE_DATASOURCE_TYPE) > -1) {
    return ORACLE_COMPONENT_TYPE;
  }
  if (datasourceType.indexOf(HIVE_DATASOURCE_TYPE) > -1) {
    return HIVE_COMPONENT_TYPE;
  }
  if (datasourceType.indexOf(GREENPLUM_DATASOURCE_TYPE) > -1) {
    return GREENPLUM_COMPONENT_TYPE;
  }
  return '';
};

export function findTreeNodeInTreeData(key, children, keyField = 'key') {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child[keyField] === key) {
      return child;
    }
    if (child.children && child.children.length > 0) {
      const result = findTreeNodeInTreeData(key, child.children, keyField);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export function appendTreeChildren(key, child = {}, treeData = [], keyField = 'key') {
  const treeNode = findTreeNodeInTreeData(key, treeData, keyField);
  if (!treeNode) {
    return false;
  }
  const { children = [] } = treeNode;
  const _children = Array.isArray(child) ? child : [{ ...child }];
  treeNode.children = children.concat(_children);
}

export function isMysqlOrOracleTable(datasourceType) {
  const type = datasourceType.toLowerCase();
  return type.indexOf('mysql') > -1 || type.indexOf('oracle') > -1;
}
