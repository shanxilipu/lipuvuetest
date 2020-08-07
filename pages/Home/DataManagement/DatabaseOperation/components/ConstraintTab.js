import React, { Component } from 'react';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { getLabelOfDatasource } from '../constant';
import EditableFormTable from '../EditableFormTable';
import { getDbDiction, getDbFieldsByTable } from '../services';
import { checkIsRandomRowKey } from '../tools/utils';
import { defaultHandleResponse } from '@/utils/utils';
import { COMMON_RULE } from '@/pages/common/const';

const CONSTRAINT_TYPES = [
  { label: formatMessage({ id: 'CONSTRAINT_PRIMARY_KEY' }), value: '0' },
  { label: formatMessage({ id: 'CONSTRAINT_UNIQUE' }), value: '1' },
  { label: formatMessage({ id: 'CONSTRAINT_NOTNULL' }), value: '2' },
  { label: formatMessage({ id: 'CONSTRAINT_FOREIGN_KEY' }), value: '3' },
  { label: formatMessage({ id: 'CONSTRAINT_CHECK' }), value: '4' },
];

class ConstraintTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tables: [],
      refFields: [],
      foreignKeyColsEditable: false,
      checkExpressionColsEditable: false,
    };
    this.INIT_COLUMNS = [
      {
        title: formatMessage({ id: 'CONSTRAINT_CODE' }),
        dataIndex: 'constraintName',
        editable: true,
        rules: [COMMON_RULE],
      },
      {
        title: formatMessage({ id: 'CONSTRAINT_TYPE' }),
        dataIndex: 'constraintType',
        editable: true,
        rules: [COMMON_RULE],
        inputType: 'select',
        datasource: CONSTRAINT_TYPES,
        onChange: type => {
          this.setState({
            foreignKeyColsEditable: type === '3',
            checkExpressionColsEditable: type === '4',
          });
        },
        render: text => getLabelOfDatasource(CONSTRAINT_TYPES, text),
      },
    ];
  }

  componentDidMount() {
    const { componentId } = this.props;
    this.getTables(componentId);
  }

  componentDidUpdate(prevProps) {
    const { componentId: prevComponentId } = prevProps;
    const { componentId } = this.props;
    if (prevComponentId !== componentId) {
      this.getTables(componentId);
    }
  }

  getTables = componentId => {
    if (componentId) {
      this.setState({ loading: true });
      const { tableId } = this.props;
      getDbDiction({ componentId, getAllSimpleData: true }).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(response, (resultObject = {}) => {
          const { rows = [] } = resultObject;
          let tables = rows;
          if (tableId) {
            tables = rows.filter(o => `${o.id}` !== `${tableId}`);
          }
          this.setState({ tables });
        });
      });
    }
  };

  getFieldsByTableId = tableId => {
    getDbFieldsByTable({ tableId, getAllSimpleData: true }).then(result => {
      const { resultCode, resultMsg, resultObject } = result;
      if (resultCode === '0') {
        this.setState({ refFields: resultObject.rows });
      } else {
        message.error(resultMsg);
      }
    });
  };

  beforeEditRow = record => {
    const isForeignKeyType = record.constraintType === '3';
    const isCheckKeyType = record.constraintType === '4';
    if (isForeignKeyType) {
      const { constraintRefTableId } = record;
      this.getFieldsByTableId(constraintRefTableId);
    }
    this.setState({
      foreignKeyColsEditable: isForeignKeyType,
      refFields: [],
      checkExpressionColsEditable: isCheckKeyType,
    });
  };

  beforeSaveRow = record => {
    const { fieldList, constraintList } = this.props;
    const { tables, refFields } = this.state;
    if (constraintList.length > 0) {
      const index = constraintList.findIndex(
        o => o.constraintName === record.constraintName && o.constraintId !== record.constraintId
      );
      if (index > -1) {
        message.warning(
          formatMessage({
            id: 'metadata.sameConstraintWarning',
            defaultMessage: '已有同名约束编码',
          })
        );
        return false;
      }
    }
    record.constraintColumn = '';
    record.constraintRefTable = '';
    record.constraintRefColumn = '';
    fieldList.forEach(o => {
      if (o.id === record.constraintColumnId) {
        record.constraintColumn = o.code;
      }
    });
    if (record.constraintRefTableId) {
      tables.forEach(o => {
        if (o.id === record.constraintRefTableId) {
          record.constraintRefTable = o.code;
        }
      });
    }
    if (record.constraintRefColumnId) {
      refFields.forEach(o => {
        if (o.id === record.constraintRefColumnId) {
          record.constraintRefColumn = o.code;
        }
      });
    }
    return true;
  };

  handleAddOrUpdateObject = record => {
    const { rowKey, handleSaveData, handleAddOrUpdateObject } = this.props;
    if (!record.constraintId || checkIsRandomRowKey(record.constraintId)) {
      record.isNew = true;
    }
    handleSaveData('constraintList', record, rowKey);
    handleAddOrUpdateObject('addedOrUpdatedConstraints', record, rowKey);
  };

  handleDeleteObject = record => {
    const {
      rowKey,
      handleDeleteData,
      handleDeleteObjectById,
      handleDeleteObjectByRecord,
    } = this.props;
    handleDeleteData('constraintList', record, rowKey);
    handleDeleteObjectByRecord('addedOrUpdatedConstraints', record, rowKey);
    handleDeleteObjectById('deletedConstraintIds', record[rowKey]);
  };

  render() {
    const {
      loading,
      tables,
      refFields,
      foreignKeyColsEditable,
      checkExpressionColsEditable,
    } = this.state;
    const { constraintList, fieldList, componentId, schemaType, ...restProps } = this.props;
    const columns = this.INIT_COLUMNS.slice();
    for (let i = 0; i < columns.length; i++) {
      const { dataIndex } = columns[i];
      if (dataIndex === 'constraintType' && schemaType === 'mysql') {
        // mysql没有检查约束
        columns[i].datasource = columns[i].datasource.filter(item => item.value !== '4');
        break;
      }
    }
    columns.push({
      title: formatMessage({ id: 'FIELD_CODE' }),
      dataIndex: 'constraintColumnId',
      editable: true,
      rules: [COMMON_RULE],
      inputType: 'select',
      datasource: fieldList,
      dataTextField: 'code',
      dataValueField: 'id',
      render: (text, record) => record.constraintColumn,
    });
    columns.push({
      title: formatMessage({ id: 'REFERENCED_TABLE' }),
      dataIndex: 'constraintRefTableId',
      editable: true,
      inputType: 'select',
      datasource: tables,
      dataTextField: 'code',
      dataValueField: 'id',
      cellEnable: foreignKeyColsEditable,
      rules: foreignKeyColsEditable ? [COMMON_RULE] : null,
      onChange: this.getFieldsByTableId,
      render: (text, record) => record.constraintRefTable,
      showSearch: true,
      optionFilterProp: 'children',
      filterOption: (input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
    });
    columns.push({
      title: formatMessage({ id: 'REFERENCED_FIELD' }),
      dataIndex: 'constraintRefColumnId',
      editable: true,
      inputType: 'select',
      datasource: refFields,
      dataTextField: 'code',
      dataValueField: 'id',
      cellEnable: foreignKeyColsEditable,
      rules: foreignKeyColsEditable ? [COMMON_RULE] : null,
      render: (text, record) => record.constraintRefColumn,
      showSearch: true,
      optionFilterProp: 'children',
      filterOption: (input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,
    });
    if (schemaType === 'oracle') {
      columns.push({
        title: formatMessage({ id: 'CHECK_EXPRESSION' }),
        editable: true,
        dataIndex: 'constraintValue',
        cellEnable: checkExpressionColsEditable,
        rules: [COMMON_RULE],
      });
    }
    return (
      <EditableFormTable
        {...restProps}
        schemaType={schemaType}
        data={constraintList}
        columns={columns}
        loading={loading}
        showAddRow={true}
        beforeEditRow={this.beforeEditRow}
        afterSaveRow={this.handleAddOrUpdateObject}
        beforeSaveRow={this.beforeSaveRow}
        handleDeleteRow={this.handleDeleteObject}
      />
    );
  }
}
export default ConstraintTab;
