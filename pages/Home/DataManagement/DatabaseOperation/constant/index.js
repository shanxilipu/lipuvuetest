import React from 'react';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { Tooltip, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MyIcon from '@/components/MyIcon';

export const defaultFormItemLayout = {
  labelCol: {
    xs: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 16 },
  },
};

export const COMMONRule = {
  required: true,
  message: formatMessage({ id: 'COMMON_REQUIRED' }),
};
export const SQL_WINDOW_KEY = 'sqlWindow';
export const TABLE_WINDOW_KEY = 'tableWindow';
export const PROGRAM_WINDOW_KEY = 'programWindow';

export const MYSQL_DATASOURCE_TYPE = 'mysql';
export const ORACLE_DATASOURCE_TYPE = 'oracle';
export const HIVE_DATASOURCE_TYPE = 'hive';
export const GREENPLUM_DATASOURCE_TYPE = 'greenplum';

export const MYSQL_COMPONENT_TYPE = 'COMPONENT_MYSQL';
export const ORACLE_COMPONENT_TYPE = 'COMPONENT_ORACLE';
export const HIVE_COMPONENT_TYPE = 'HIVE';
export const GREENPLUM_COMPONENT_TYPE = 'GREENPLUM';

export const getLabelOfDatasource = (
  datasource,
  text,
  textField = 'label',
  valueField = 'value'
) => {
  for (let i = 0; i < datasource.length; i++) {
    if (datasource[i][valueField] === text) {
      return datasource[i][textField];
    }
  }
};
const HIVE_COLUMN_TYPES = [
  { label: 'STRING', value: 'STRING' },
  { label: 'INT', value: 'INT' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' },
  { label: 'DOUBLE', value: 'DOUBLE' },
  { label: 'BIGINT', value: 'BIGINT' },
];
const HIVE_DATE_TYPES = [
  { label: formatMessage({ id: 'COMMON_YEAR_UNIT' }), value: '4' },
  { label: formatMessage({ id: 'COMMON_MONTH_UNIT' }), value: '6' },
  { label: formatMessage({ id: 'COMMON_DAY_UNIT' }), value: '8' },
  { label: formatMessage({ id: 'COMMON_HOUR_UNIT' }), value: '10' },
];
const ORACLE_COLUMN_TYPES = [
  { label: 'NUMBER', value: '3' },
  { label: 'INTEGER', value: '4' },
  { label: 'BINARY_FLOAT', value: '3100' },
  { label: 'BINARY_DOUBLE', value: '3101' },
  { label: 'FLOAT', value: '6' },
  { label: 'CHAR', value: '1' },
  { label: 'NCHAR', value: '-15' },
  { label: 'VARCHAR', value: '12' },
  { label: 'VARCHAR2', value: '3500' },
  { label: 'NVARCHAR2', value: '3501' },
  { label: 'DATE', value: '91' },
  { label: 'TIMESTAMP', value: '93' },
  { label: 'BLOB', value: '2004' },
  { label: 'CLOB', value: '2005' },
  { label: 'NCLOB', value: '2011' },
  { label: 'LONG', value: '-2005' },
  { label: 'BFILE', value: '3401' },
];
const MYSQL_COLUMN_TYPES = [
  { label: 'TINYINT', value: '-6' },
  { label: 'SAMLLINT', value: '3000' },
  { label: 'MEDIUMINT', value: '3001' },
  { label: 'INT', value: '4' },
  { label: 'BIGINT', value: '-5' },
  { label: 'DECIMAL', value: '3' },
  { label: 'NUMERIC', value: '2' },
  { label: 'FLOAT', value: '6' },
  { label: 'DOUBLE', value: '8' },
  { label: 'REAL', value: '7' },
  { label: 'BIT', value: '-7' },
  { label: 'CHAR', value: '1' },
  { label: 'VARCHAR', value: '12' },
  { label: 'BINARY', value: '-2' },
  { label: 'VARBINARY', value: '-3' },
  { label: 'BLOB', value: '2004' },
  { label: 'TEXT', value: '3400' },
  { label: 'DATE', value: '91' },
  { label: 'DATETIME', value: '3100' },
  { label: 'TIMESTAMP', value: '93' },
];

export const FIELD_TAB_COLUMNS = [
  {
    title: formatMessage({ id: 'FIELD_CODE' }),
    dataIndex: 'columnCode',
    width: 140,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    editable: true,
    rules: [COMMONRule],
    isAutoCompleteField: true,
  },
  {
    title: formatMessage({ id: 'FIELD_NAME' }),
    dataIndex: 'columnName',
    editable: true,
    width: 140,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    rules: [COMMONRule],
    isAutoCompleteField: true,
  },
  {
    title: formatMessage({ id: 'FIELD_TYPE' }),
    dataIndex: 'columnType',
    editable: true,
    width: 140,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    inputType: 'select',
    datasource: HIVE_COLUMN_TYPES,
    rules: [COMMONRule],
  },
  {
    title: formatMessage({ id: 'FIELD_CODE' }),
    dataIndex: 'code',
    width: 140,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
    editable: true,
    rules: [COMMONRule],
    isAutoCompleteField: true,
  },
  {
    title: formatMessage({ id: 'FIELD_NAME' }),
    dataIndex: 'name',
    editable: true,
    width: 140,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
    rules: [COMMONRule],
    isAutoCompleteField: true,
  },
  {
    title: formatMessage({ id: 'FIELD_TYPE' }),
    dataIndex: 'type',
    editable: true,
    rules: [COMMONRule],
    width: 140,
    schemaTypes: [MYSQL_DATASOURCE_TYPE],
    inputType: 'select',
    datasource: MYSQL_COLUMN_TYPES,
    render: text => getLabelOfDatasource(MYSQL_COLUMN_TYPES, text),
  },
  {
    title: formatMessage({ id: 'FIELD_TYPE' }),
    dataIndex: 'type',
    editable: true,
    rules: [COMMONRule],
    width: 140,
    schemaTypes: [ORACLE_DATASOURCE_TYPE],
    inputType: 'select',
    datasource: ORACLE_COLUMN_TYPES,
    render: text => getLabelOfDatasource(ORACLE_COLUMN_TYPES, text),
  },
  {
    title: formatMessage({ id: 'DEFAULT_VALUE' }),
    dataIndex: 'defaultValue',
    editable: true,
    width: 100,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
  },
  {
    title: formatMessage({ id: 'FIELD_LENGTH' }),
    dataIndex: 'length',
    editable: true,
    inputType: 'number',
    width: 120,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
    min: 1,
  },
  {
    title: formatMessage({ id: 'ACCURACY' }),
    dataIndex: 'accuracy',
    editable: true,
    inputType: 'number',
    width: 100,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
    min: -84,
    max: 127,
  },
  {
    title: formatMessage({ id: 'DATE_FORMAT' }),
    dataIndex: 'dateType',
    editable: true,
    width: 120,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    inputType: 'select',
    datasource: HIVE_DATE_TYPES,
    render: text => getLabelOfDatasource(HIVE_DATE_TYPES, text),
    allowClear: true,
  },
  {
    title: formatMessage({ id: 'COMMON_SORTING' }),
    dataIndex: 'seq',
    inputType: 'number',
    editable: true,
    rules: [COMMONRule],
    width: 100,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    min: 1,
  },
  {
    title: formatMessage({ id: 'FIELD_DESCRIPTION' }),
    dataIndex: 'columnDesc',
    editable: true,
    inputType: 'textarea',
    render: text => <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>{text}</div>,
    schemaTypes: [HIVE_DATASOURCE_TYPE],
    width: 240,
  },
  {
    title: formatMessage({ id: 'FIELD_DESCRIPTION' }),
    dataIndex: 'description',
    editable: true,
    inputType: 'textarea',
    render: text => <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>{text}</div>,
    schemaTypes: [MYSQL_DATASOURCE_TYPE, ORACLE_DATASOURCE_TYPE],
    width: 240,
  },
];

export function getFieldColumnsBySchemaType(columns, schemaType) {
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    if (column.schemaTypes && !column.schemaTypes.includes(schemaType)) {
      columns.splice(i, 1);
      i--;
    }
  }
}

export const USER_INFO_TAB_COLUMNS = [
  { title: formatMessage({ id: 'USER_ACCOUNT' }), dataIndex: 'account', width: '25%' },
  { title: formatMessage({ id: 'ACCOUNT_PRIVILEGE' }), dataIndex: 'privs' },
  {
    title: formatMessage({ id: 'OPERATE' }),
    dataIndex: 'operation',
    width: 90,
    render: (text, record) => (
      <CopyToClipboard
        text={record.account}
        onCopy={() => {
          message.success(formatMessage({ id: 'COPY_SUCCESSFULLY' }));
        }}
      >
        <Tooltip placement="top" title={formatMessage({ id: 'COPY_USER_ACCOUNT' })}>
          <MyIcon type="iconcopy" style={{ fontSize: 17 }} />
        </Tooltip>
      </CopyToClipboard>
    ),
  },
];

export const HISTORY_TAB_COLUMNS = [
  {
    title: formatMessage({ id: 'USERHIS_OPER_DATE' }),
    dataIndex: 'operDate',
    render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  { title: formatMessage({ id: 'USERHIS_OPER_USER_CODE' }), dataIndex: 'operStaff' },
  { title: formatMessage({ id: 'COMMON_DESCRIPTION' }), dataIndex: 'methodDesc' },
];

export const ROOT_NAME = 'root';
export const TABLES_ROOT_NAME = 'tablesRoot';
export const VIEWS_ROOT_NAME = 'viewsRoot';
export const FUNCTIONS_ROOT_NAME = 'functionsRoot';

export const MENU_NEW = 'new';
export const MENU_EDIT = 'edit';
export const MENU_CHECK = 'check';
export const MENU_DELETE = 'delete';
export const MENU_RENAME = 'rename';
export const MENU_REFRESH = 'refresh';
export const MENU_QUERY = 'query';
export const MENU_PROPERTIES = 'properties';
export const MENU_NEW_WINDOW = 'newWindow';

export const TREE_NODE_TYPE_DATASOURCE = 'datasource';
export const TREE_NODE_TYPE_TABLE = 'table';
export const TREE_NODE_TYPE_VIEW = 'view';
export const TREE_NODE_TYPE_FUNCTION = 'function';
export const TREE_NODE_TYPE_FIELD = 'field';

export const RIGHT_CLICK_MENUS = [
  { title: formatMessage({ id: 'COMMON_NEW' }), key: MENU_NEW, group: 0 },
  { title: formatMessage({ id: 'COMMON_EDIT' }), key: MENU_EDIT, group: 0 },
  { title: formatMessage({ id: 'COMMON_CHECK' }), key: MENU_CHECK, group: 0 },
  { title: formatMessage({ id: 'COMMON_DELETE' }), key: MENU_DELETE, group: 0 },
  { title: formatMessage({ id: 'COMMON_RENAME' }), key: MENU_RENAME, group: 1 },
  { title: formatMessage({ id: 'app.pwa.serviceworker.updated.ok' }), key: MENU_REFRESH, group: 1 },
  { title: formatMessage({ id: 'NEW_WINDOW' }), key: MENU_NEW_WINDOW, group: 1 },
  { title: formatMessage({ id: 'QUERY_DATA' }), key: MENU_QUERY, group: 1 },
  { title: formatMessage({ id: 'COMMON_PROPERTIES' }), key: MENU_PROPERTIES, group: 1 },
];

export const SCRIPT_STATUS_READY = 'READY';
export const SCRIPT_STATUS_PENDING = 'PENDING';
export const SCRIPT_STATUS_RUNNING = 'RUNNING';
export const SCRIPT_STATUS_FINISHED = 'FINISHED';
export const SCRIPT_STATUS_ABORT = 'ABORT';
export const SCRIPT_STATUS_ERROR = 'ERROR';

export const scriptStatusDisplayText = {
  [SCRIPT_STATUS_READY]: formatMessage({ id: 'SCRIPT_READY' }),
  [SCRIPT_STATUS_PENDING]: formatMessage({ id: 'SCRIPT_PENDING' }),
  [SCRIPT_STATUS_RUNNING]: formatMessage({ id: 'SCRIPT_RUNNING' }),
  [SCRIPT_STATUS_FINISHED]: formatMessage({ id: 'SCRIPT_FINISHED' }),
  [SCRIPT_STATUS_ABORT]: formatMessage({ id: 'SCRIPT_ABORT' }),
  [SCRIPT_STATUS_ERROR]: formatMessage({ id: 'SCRIPT_ERROR' }),
};
