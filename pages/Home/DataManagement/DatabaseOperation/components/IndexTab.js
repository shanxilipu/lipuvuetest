import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import { getLabelOfDatasource } from '../constant';
import EditableFormTable from '../EditableFormTable';
import { checkIsRandomRowKey } from '../tools/utils';

const COMMONRule = {
  required: true,
  message: formatMessage({ id: 'COMMON_REQUIRED' }),
};

const MYSQL_INDEX_TYPES = [
  { label: formatMessage({ id: 'ORDINARY_INDEX' }), value: '0' },
  { label: formatMessage({ id: 'UNIQUE_INDEX' }), value: '1' },
  { label: formatMessage({ id: 'FULL_INDEX' }), value: '2' },
  { label: formatMessage({ id: 'SPATIAL_INDEX' }), value: '3' },
];

const ORACLE_INDEX_TYPES = [
  { label: formatMessage({ id: 'ORDINARY_INDEX' }), value: '0' },
  { label: formatMessage({ id: 'UNIQUE_INDEX' }), value: '1' },
  { label: formatMessage({ id: 'BITMAP_INDEX' }), value: '2' },
];

class IndexTab extends Component {
  INDEX_TAB_COLUMNS = [
    {
      title: formatMessage({ id: 'INDEX_CODE' }),
      dataIndex: 'name',
      editable: true,
      rules: [COMMONRule],
    },
    {
      title: formatMessage({ id: 'FIELD_CODE' }),
      dataIndex: 'columnId',
      editable: true,
      inputType: 'select',
      rules: [COMMONRule],
    },
    {
      title: formatMessage({ id: 'INDEX_TYPE' }),
      dataIndex: 'type',
      editable: true,
      inputType: 'select',
      rules: [COMMONRule],
    },
  ];

  beforeSaveRow = row => {
    const { tableId, data } = this.props;
    if (data.length > 0) {
      const idx = data.findIndex(o => o.name === row.name && o.id !== row.id);
      if (idx > -1) {
        message.warning(
          formatMessage({ id: 'metadata.sameIndexWarning', defaultMessage: '已有同名索引编码' })
        );
        return false;
      }
    }
    row.tableId = tableId;
    return true;
  };

  handleAddOrUpdateObject = record => {
    const { rowKey, handleSaveData, handleAddOrUpdateObject } = this.props;
    if (checkIsRandomRowKey(record.id)) {
      record.isNew = true;
    }
    handleSaveData('indexList', record, rowKey);
    handleAddOrUpdateObject('addedOrUpdatedIndexs', record, rowKey);
  };

  handleDeleteObject = record => {
    const {
      rowKey,
      handleDeleteData,
      handleDeleteObjectById,
      handleDeleteObjectByRecord,
    } = this.props;
    handleDeleteData('indexList', record, rowKey);
    handleDeleteObjectByRecord('addedOrUpdatedIndexs', record, rowKey);
    handleDeleteObjectById('deletedIndexIds', record.id);
  };

  render() {
    const { fieldList, ...restProps } = this.props;
    const { schemaType } = restProps;
    const columns = this.INDEX_TAB_COLUMNS.map(o => {
      if (o.dataIndex === 'columnId') {
        return {
          ...o,
          datasource: fieldList,
          dataTextField: 'code',
          dataValueField: 'id',
          render: text => getLabelOfDatasource(fieldList, text, 'code', 'id'),
        };
      }
      if (o.dataIndex === 'type') {
        const datasource =
          schemaType === 'mysql' ? MYSQL_INDEX_TYPES.slice() : ORACLE_INDEX_TYPES.slice();
        return {
          ...o,
          datasource,
          render: text => getLabelOfDatasource(datasource, text),
        };
      }
      return { ...o };
    });

    return (
      <EditableFormTable
        {...restProps}
        columns={columns}
        beforeSaveRow={this.beforeSaveRow}
        afterSaveRow={this.handleAddOrUpdateObject}
        handleDeleteRow={this.handleDeleteObject}
      />
    );
  }
}
export default IndexTab;
