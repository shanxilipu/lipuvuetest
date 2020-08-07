import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Tabs, message, Spin } from 'antd';
import TableInfo from './TableInfo';
import FieldTab from './FieldTab';
import ConstraintTab from './ConstraintTab';
import IndexTab from './IndexTab';
import PartitionTab from './PartitionTab';
import TableUserInfo from './TableUserInfo';
import { TABLE_WINDOW_KEY } from '../constant';
import { isMysqlOrOracleTable, getComponentType, checkIsRandomRowKey } from '../tools/utils';
import {
  getTableInfo,
  getDbFields,
  getDbIndexs,
  getDbConstraints,
  getBusinessCodeById,
  saveDbObjectInfo,
  saveHiveObjectInfo,
} from '../services';
import TableHistoryLogs from './TableHistoryLogs';
import styles from '../DatabaseOperation.less';
import { defaultHandleResponse } from '@/utils/utils';

@connect(({ dbOperation }) => ({
  dbOperation,
}))
class TableWindow extends Component {
  constructor(props) {
    super(props);
    this.initTableObjectFields();
    this.currentTableMark = null;
    this.schemaType = '';
    this.state = {
      loading: false,
      fieldList: [], // 字段列表
      tableInfo: null, // 表信息
      partitionList: [], // 分区字段信息
      indexList: [], // 索引信息
      constraintList: [], // 约束信息
    };
  }

  initTableObjectFields = () => {
    this.dbObjectFields = {
      addedOrUpdatedConstraints: {},
      addedOrUpdatedFields: {},
      addedOrUpdatedIndexs: {},
      deletedConstraintIds: [],
      deletedFieldIds: [],
      deletedIndexIds: [],
    };
  };

  componentDidMount() {
    const {
      dbOperation: { currentTableInfo, currentTableMark },
    } = this.props;
    this.currentTableMark = currentTableMark;
    if (currentTableInfo) {
      this.getData(currentTableInfo);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      dbOperation: { currentTableInfo: nextTableInfo, currentTableMark: nextCurrentTableMark },
    } = nextProps;
    if (nextTableInfo) {
      const {
        dbOperation: { currentTableMark },
      } = this.props;
      if (currentTableMark === nextCurrentTableMark) {
        return false;
      }
      this.currentTableMark = nextCurrentTableMark;
      this.initTableObjectFields();
      this.getData(nextTableInfo);
    }
  }

  getData = currentTableInfo => {
    const { tableId, schemaType } = currentTableInfo;
    if (!tableId) {
      this.setState({
        fieldList: [],
        tableInfo: null,
        partitionList: [],
        indexList: [],
        constraintList: [],
      });
      return false;
    }
    this.setState({ loading: true });

    // 没办法 hive的表信息 字段信息都在一个请求里。。。所以请求都写在父页面
    if (schemaType === 'hive') {
      getTableInfo(currentTableInfo).then(result => {
        this.setState({ loading: false });
        defaultHandleResponse(result, resultObject => {
          const { mainInfo = null, columnList: fieldList = [], partitionList = [] } = resultObject;
          this.setState({ tableInfo: mainInfo, fieldList, partitionList });
          this.getBusinessCode(mainInfo);
        });
      });
    } else {
      getTableInfo(currentTableInfo).then(result => {
        this.setState({ loading: false });
        defaultHandleResponse(result, tableInfo => {
          this.getBusinessCode(tableInfo);
        });
      });
      const tabs = [
        { name: 'fieldList', service: getDbFields },
        { name: 'indexList', service: getDbIndexs },
        { name: 'constraintList', service: getDbConstraints },
      ];
      tabs.forEach(tab => {
        tab.service({ ...currentTableInfo, getAllData: true }).then(result => {
          defaultHandleResponse(result, resultObject => {
            const { rows } = resultObject;
            if (tab.name === 'fieldList') {
              rows.forEach(row => {
                row.originCode = row.code;
              });
            } else if (tab.name === 'constraintList') {
              rows.forEach(row => {
                row.originConstraintName = row.constraintName;
                row.originConstraintType = row.constraintType;
              });
            }
            this.setState({ [tab.name]: rows });
          });
        });
      });
    }
  };

  getBusinessCode = tableInfo => {
    const { businessId } = tableInfo;
    if (!businessId) {
      this.currentTableMark = new Date().getTime().toString();
      this.setState({ tableInfo: { ...tableInfo, businessCode: '', businessName: '' } });
      return false;
    }
    getBusinessCodeById({ businessId }).then(result => {
      defaultHandleResponse(result, resultObject => {
        this.currentTableMark = new Date().getTime().toString();
        const { wordCnName: businessName, wordEnName: businessCode } = resultObject;
        this.setState({ tableInfo: { ...tableInfo, businessCode, businessName } });
      });
    });
  };

  isEditingTable = () => {
    const { tableInfo } = this.state;
    return !!tableInfo;
  };

  getCommonEditableTableTabProps = tabName => {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    const isEditingTable = this.isEditingTable();
    const { schemaType = '', componentId, tableId = null, readOnly = true } = currentTableInfo;
    const editable = !readOnly;
    const props = {
      tabName,
      tableId,
      editable,
      schemaType,
      isEditingTable,
      showAddRow: editable,
      handleSaveData: this.handleSaveData,
      handleDeleteData: this.handleDeleteData,
      handleAddOrUpdateObject: this.handleAddOrUpdateObject,
      handleDeleteObjectById: this.handleDeleteObjectById,
      handleDeleteObjectByRecord: this.handleDeleteObjectByRecord,
    };
    const { fieldList, indexList, partitionList, constraintList } = this.state;
    switch (tabName) {
      case 'field':
        return {
          ...props,
          data: fieldList,
          tableId: currentTableInfo.tableId,
          rowKey: isMysqlOrOracleTable(schemaType) ? 'id' : 'columnId',
        };
      case 'index':
        return {
          ...props,
          data: indexList,
          fieldList,
          rowKey: 'id',
        };
      case 'constraint':
        return {
          ...props,
          rowKey: 'constraintId',
          constraintList,
          fieldList,
          componentId,
        };
      case 'partition':
        return {
          ...props,
          fieldList,
          rowKey: 'id',
          data: partitionList,
          showAddRow: !isEditingTable,
        };
      default:
        return {};
    }
  };

  getStateFilterByRowKey = (name, record, rowKey) => {
    const { state } = this;
    return state[name].filter(item => item[rowKey] !== record[rowKey]);
  };

  handleSaveData = (name, record, rowKey) => {
    const { state } = this;
    const _data = state[name].slice();
    const index = _data.findIndex(item => item[rowKey] === record[rowKey]);
    if (index === -1) {
      _data.push(record);
    } else {
      _data.splice(index, 1, record);
    }
    this.setState({ [name]: _data });
  };

  handleDeleteData = (name, record, rowKey) => {
    const _data = this.getStateFilterByRowKey(name, record, rowKey);
    this.setState({ [name]: _data });
    if (name === 'fieldList') {
      // 删除字段后，删除对应的索引和约束
      this.deleteIndexesAndConstraints(record);
    }
  };

  canShowTab = tabName => {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    if (!currentTableInfo) {
      return false;
    }
    if (tabName === 'userInfo') {
      return !!currentTableInfo && currentTableInfo.tableId;
    }
    const { schemaType } = currentTableInfo;
    if (schemaType === 'mysql' || schemaType === 'oracle') {
      return ['index', 'constraint'].includes(tabName);
    }
    if (schemaType === 'hive') {
      if (tabName === 'history') {
        return !!currentTableInfo && currentTableInfo.tableId;
      }
      return tabName === 'partition';
    }
    return false;
  };

  /**
   * mysql/oracle保存表需要构造一个对象记录每个tab的数据，该函数用于向该对象写入数据
   * @param name 对象的key
   * @param record 内容
   * @param rowKey rowKey
   * @returns {boolean}
   */
  handleAddOrUpdateObject = (name, record, rowKey) => {
    const {
      dbOperation: {
        currentTableInfo: { schemaType },
      },
    } = this.props;
    if (!isMysqlOrOracleTable(schemaType)) {
      return false;
    }
    if (!this.dbObjectFields[name]) {
      this.dbObjectFields[name] = {};
    }
    const key = record[rowKey];
    this.dbObjectFields[name][key] = record;
  };

  /**
   * mysql/oracle保存表的时候需要传一个描述删除内容对象(如被删除的字段id集合，被删除的索引id集合)，其中每项是一个数组
   * @param name 对象的key
   * @param id 要记录的id
   */
  handleDeleteObjectById = (name, id) => {
    const stringId = `${id}`;
    if (!this.dbObjectFields[name].includes(stringId)) {
      this.dbObjectFields[name].push(stringId);
    }
  };

  /**
   * 与handleAddOrUpdateObject函数是对应相反的
   * @param name
   * @param record
   * @param rowKey
   * @returns {boolean}
   */
  handleDeleteObjectByRecord = (name, record, rowKey) => {
    const {
      dbOperation: {
        currentTableInfo: { schemaType },
      },
    } = this.props;
    if (!isMysqlOrOracleTable(schemaType)) {
      return false;
    }
    if (!this.dbObjectFields[name]) {
      this.dbObjectFields[name] = {};
    }
    const key = record[rowKey];
    delete this.dbObjectFields[name][key];
  };

  handleSaveTableSuccessfully = (isNew, tableId) => {
    const {
      dbOperation: { currentTableInfo },
      dispatch,
    } = this.props;
    const { componentId } = currentTableInfo;
    this.initTableObjectFields();
    message.success(formatMessage({ id: 'COMMON_SAVE_SUCCESS' }));
    const mark = new Date().getTime().toString();
    const saveTableDataEvent = {
      mark,
      datasourceId: componentId,
    };
    const _tableId = isNew ? tableId : currentTableInfo.tableId;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        saveTableDataEvent,
        currentTableMark: mark,
        activeWindowKey: TABLE_WINDOW_KEY,
        currentTableInfo: { ...currentTableInfo, readOnly: true, tableId: _tableId },
      },
    });
  };

  /**
   * 删除字段后，删除对应的索引、约束和分发
   * @param field
   */
  deleteIndexesAndConstraints = field => {
    const {
      dbOperation: {
        currentTableInfo: { schemaType },
      },
    } = this.props;
    if (isMysqlOrOracleTable(schemaType)) {
      const indexRecord = { columnId: field.id };
      const constraintRecord = { constraintColumnId: field.id };
      this.handleDeleteData('indexList', indexRecord, 'columnId');
      this.handleDeleteObjectByRecord('addedOrUpdatedIndexs', indexRecord, 'columnId');
      this.handleDeleteData('constraintList', constraintRecord, 'constraintColumnId');
      this.handleDeleteObjectByRecord(
        'addedOrUpdatedConstraints',
        constraintRecord,
        'constraintColumnId'
      );
    } else {
      // hive就要删除对应的分区字段
      const tempRecord = { partitionCode: field.columnCode };
      this.handleDeleteData('partitionList', tempRecord, 'partitionCode');
    }
  };

  saveAllInfo = tableObj => {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    if (!currentTableInfo) {
      return false;
    }
    const { tableInfo, fieldList } = this.state;
    if (fieldList.length === 0) {
      message.error(
        formatMessage({ id: 'NO_FIELD_INFORMATION', defaultMessage: '请填写字段信息!' })
      );
      return false;
    }
    const { schemaType } = currentTableInfo;
    let params = {};
    if (tableInfo) {
      const { code, tableCode } = tableInfo;
      if (tableObj.code) {
        tableObj.code = code;
      } else if (tableObj.tableCode) {
        tableObj.tableCode = tableCode;
      }
      params = { ...tableInfo, ...tableObj };
    } else {
      params = { ...tableObj };
    }
    if (isMysqlOrOracleTable(schemaType)) {
      this.saveDbTable(params, currentTableInfo);
    } else {
      this.saveHiveTable(params, currentTableInfo);
    }
  };

  transferDbUpdateInfo = updateInfo => {
    const params = {};
    const names = ['addedOrUpdatedFields', 'addedOrUpdatedIndexs', 'addedOrUpdatedConstraints'];
    const keys = Object.keys(updateInfo);
    keys.forEach(name => {
      if (names.includes(name)) {
        params[name] = [];
        const obj = updateInfo[name];
        const objNames = Object.keys(obj);
        objNames.forEach(objName => {
          params[name].push(obj[objName]);
        });
      } else {
        params[name] = updateInfo[name];
      }
    });
    return params;
  };

  saveDbTable = tableObj => {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    const { schemaType, componentId, tableId } = currentTableInfo;
    const isNew = !tableId;
    const dbType = getComponentType(schemaType);
    const { dbObjectFields } = this;
    const { tableInfo } = this.state;
    tableObj = { ...tableInfo, ...tableObj };
    tableObj.componentId = componentId;
    tableObj.owner = componentId;
    tableObj.type = schemaType === 'mysql' ? 'MYSQL_TABLE' : 'ORACLE_TABLE';
    let params = {};
    if (isNew) {
      delete tableObj.id;
      const { fieldList, indexList, constraintList } = this.state;
      params = {
        colInfoList: fieldList,
        constraintInfoList: constraintList,
        indexInfoList: indexList,
        tableInfo: tableObj,
        zmgrMetaTableSql: { sqlText: '' },
        databaseInfo: {
          dbType,
          componentId,
        },
        isNew,
      };
    } else {
      const transferUpdateInfo = this.transferDbUpdateInfo(dbObjectFields);
      tableObj.id = tableId;
      params = {
        tableInfo: tableObj,
        dbInfo: {
          componentId,
          dbType,
        },
        ...transferUpdateInfo,
      };
      let isUpdate = false;
      const paramNames = Object.keys(transferUpdateInfo);
      for (let i = 0; i < paramNames.length; i++) {
        if (transferUpdateInfo[paramNames[i]].length > 0) {
          isUpdate = true;
          break;
        }
      }
      const isUpdateTableInfo =
        tableInfo.name !== tableObj.name ||
        tableInfo.code !== tableObj.code ||
        tableInfo.description !== tableObj.description;
      isUpdate = isUpdate || isUpdateTableInfo;
      params.isUpdate = isUpdate;
    }
    const { handleLoading } = this.props;
    handleLoading(true);
    saveDbObjectInfo(params, isNew).then(result => {
      handleLoading(false);
      defaultHandleResponse(result, (resultObject = null) => {
        this.handleSaveTableSuccessfully(isNew, resultObject);
      });
    });
  };

  saveHiveTable = tableObj => {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    const { componentId, tableId, schemaId } = currentTableInfo;
    const isNew = !tableId;
    const { partitionList: partitions, fieldList: columns } = this.state;
    const partitionList = partitions.slice();
    const columnList = columns.map(column => {
      let { columnId } = column;
      if (columnId && checkIsRandomRowKey(columnId)) {
        columnId = null;
      }
      return { ...column, columnId };
    });
    tableObj.tableType = 'HIVE_TABLE';
    tableObj.schemaId = schemaId;
    tableObj.componentId = componentId;
    if (isNew) {
      delete tableObj.tableId;
    } else {
      tableObj.metaTableId = tableId;
    }

    // const { isExternalTable } = tableObj;
    // if (isExternalTable === '0') {
    //   tableObj.hdfsLocation = '';
    //   tableObj.relHbaseTable = '';
    //   tableObj.relHbaseSchema = '';
    //   tableObj.relationObjId = -1;
    //   tableObj.relationComponentId = -1;
    // } else {
    //   if (isExternalTable === '1') {
    //     tableObj.relHbaseTable = '';
    //     tableObj.relHbaseSchema = '';
    //     tableObj.hdfsLocation = '';
    //     tableObj.storedFormat = '';
    //   } else if (isExternalTable === '2') {
    //     tableObj.hdfsLocation = '';
    //     tableObj.relHbaseTable = '';
    //     tableObj.relHbaseSchema = '';
    //   }
    //   tableObj.relationObjId = '';
    //   tableObj.relationComponentId = this.hiveExtObjComId;
    // }
    partitionList.forEach(partition => {
      if (checkIsRandomRowKey(partition.id)) {
        partition.type = 'create';
      }
      partition.columnCode = partition.partitionCode;
    });
    const params = {
      zmgrMetaTable: tableObj,
      partitionList,
      columnList,
      componentId,
      zmgrMetaTableSql: { sqlText: '' },
    };
    if (isNew) {
      params.databaseInfo = { componentId };
    }
    const { handleLoading } = this.props;
    handleLoading(true);
    saveHiveObjectInfo(params, isNew).then(result => {
      handleLoading(false);
      defaultHandleResponse(result, (resultObject = null) => {
        this.handleSaveTableSuccessfully(isNew, resultObject);
      });
    });
  };

  handleCancelEditTable = () => {
    const {
      dispatch,
      dbOperation: { currentTableInfo },
    } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        currentTableInfo: { ...currentTableInfo, readOnly: true },
      },
    });
  };

  render() {
    const {
      dbOperation: { currentTableInfo },
    } = this.props;
    let editable = false;
    let tableId = null;
    let schemaId = null;
    let schemaType = '';
    if (currentTableInfo) {
      editable = !currentTableInfo.readOnly;
      ({ tableId, schemaType, schemaId } = currentTableInfo);
    }
    const { tableInfo, loading } = this.state;
    const hasCurrentTable = !!currentTableInfo;
    return (
      <Spin spinning={loading} wrapperClassName="full-height-spin">
        <Tabs type="card" className={styles.tableWindowTab}>
          <Tabs.TabPane key="tableInfo" tab={formatMessage({ id: 'TABLE_INFORMATION' })}>
            <TableInfo
              currentTableMark={this.currentTableMark}
              tableId={tableId}
              editable={editable}
              tableInfo={tableInfo}
              schemaType={schemaType}
              schemaId={schemaId}
              handleSaveForm={this.saveAllInfo}
              handleCancelEditTable={this.handleCancelEditTable}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="fieldInfo" tab={formatMessage({ id: 'FIELD_INFORMATION' })}>
            {hasCurrentTable && <FieldTab {...this.getCommonEditableTableTabProps('field')} />}
          </Tabs.TabPane>
          {this.canShowTab('index') && (
            <Tabs.TabPane key="indexInfo" tab={formatMessage({ id: 'INDEX_INFORMATION' })}>
              {hasCurrentTable && <IndexTab {...this.getCommonEditableTableTabProps('index')} />}
            </Tabs.TabPane>
          )}
          {this.canShowTab('constraint') && (
            <Tabs.TabPane
              key="constraintInfo"
              tab={formatMessage({ id: 'CONSTRAINT_INFORMATION' })}
            >
              {hasCurrentTable && (
                <ConstraintTab {...this.getCommonEditableTableTabProps('constraint')} />
              )}
            </Tabs.TabPane>
          )}
          {this.canShowTab('partition') && (
            <Tabs.TabPane key="partitionInfo" tab={formatMessage({ id: 'PARTITION_FIELDS' })}>
              {hasCurrentTable && (
                <PartitionTab {...this.getCommonEditableTableTabProps('partition')} />
              )}
            </Tabs.TabPane>
          )}
          {this.canShowTab('userInfo') && (
            <Tabs.TabPane key="userInfo" tab={formatMessage({ id: 'USER_INFORMATION' })}>
              <TableUserInfo currentTableInfo={currentTableInfo} />
            </Tabs.TabPane>
          )}
          {this.canShowTab('history') && (
            <Tabs.TabPane key="historyLogs" tab={formatMessage({ id: 'HISTORY_LOGS' })}>
              {hasCurrentTable && <TableHistoryLogs schemaType={schemaType} tableId={tableId} />}
            </Tabs.TabPane>
          )}
        </Tabs>
      </Spin>
    );
  }
}
export default TableWindow;
