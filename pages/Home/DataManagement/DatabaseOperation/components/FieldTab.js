import React from 'react';
import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import EditableFormTable from '../EditableFormTable';
import { getFieldColumnsBySchemaType, FIELD_TAB_COLUMNS } from '../constant';
import { isMysqlOrOracleTable, checkIsRandomRowKey } from '../tools/utils';
import { defaultHandleResponse } from '@/utils/utils';
import { getNextDbFieldId } from '../services';

class FieldTab extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  beforeSaveRow = row => {
    const { tableId, schemaType, data: fieldList, rowKey } = this.props;
    const { accuracy } = row;
    const codeField = isMysqlOrOracleTable(schemaType) ? 'code' : 'columnCode';
    row.tableId = tableId;
    if (isMysqlOrOracleTable(schemaType)) {
      if (!accuracy || accuracy === 0) {
        row.accuracy = null;
      }
    }
    if (fieldList.length > 0) {
      const idx = fieldList.findIndex(
        o => o[codeField] === row[codeField] && o[rowKey] !== row[rowKey]
      );
      if (idx > -1) {
        message.warning(
          formatMessage({ id: 'metadata.sameFieldWarning', defaultMessage: '已有同名字段编码' })
        );
        return false;
      }
    }
    return true;
  };

  handleAddOrUpdateObject = record => {
    const { rowKey, schemaType, handleSaveData, handleAddOrUpdateObject } = this.props;
    // mysql和oracle要先获取一个自增id
    if (isMysqlOrOracleTable(schemaType) && checkIsRandomRowKey(record.id)) {
      record.isNew = true;
      this.setState({ loading: true });
      getNextDbFieldId().then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(response, resultObject => {
          record.id = resultObject;
          handleSaveData('fieldList', record, rowKey);
          handleAddOrUpdateObject('addedOrUpdatedFields', record, rowKey);
        });
      });
    } else {
      handleSaveData('fieldList', record, rowKey);
      handleAddOrUpdateObject('addedOrUpdatedFields', record, rowKey);
    }
  };

  handleDeleteObject = record => {
    const {
      rowKey,
      handleDeleteData,
      handleDeleteObjectById,
      handleDeleteObjectByRecord,
    } = this.props;
    handleDeleteData('fieldList', record, rowKey);
    handleDeleteObjectByRecord('addedOrUpdatedFields', record, rowKey);
    handleDeleteObjectById('deletedFieldIds', record[rowKey]);
  };

  checkActionStatus = row => {
    let showDelete = true;
    let showEdit = true;
    if (row.isExternalTable === '1') {
      showDelete = false;
    }
    if (row.partition) {
      showEdit = false;
      showDelete = false;
    }
    return { showEdit, showDelete };
  };

  render() {
    const { loading } = this.state;
    const { schemaType, tableId, ...restProps } = this.props;
    const columns = FIELD_TAB_COLUMNS.slice();
    getFieldColumnsBySchemaType(columns, schemaType);
    return (
      <EditableFormTable
        {...restProps}
        fixedAction
        loading={loading}
        tabName="fieldTab"
        columns={columns}
        schemaType={schemaType}
        afterSaveRow={this.handleAddOrUpdateObject}
        handleDeleteRow={this.handleDeleteObject}
        beforeSaveRow={this.beforeSaveRow}
        checkActionStatus={this.checkActionStatus}
      />
    );
  }
}
export default FieldTab;
