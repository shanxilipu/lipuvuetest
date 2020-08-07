import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import EditableFormTable from '../EditableFormTable';
import { COMMONRule } from '../constant';
import { checkIsRandomRowKey } from '../tools/utils';

class PartitionTab extends Component {
  PARTITION_TAB_COLUMNS = [
    {
      title: formatMessage({ id: 'COMMON_CODE' }),
      dataIndex: 'partitionCode',
      rules: [
        COMMONRule,
        {
          pattern: /^[a-zA-Z_]\w+$/,
          message: formatMessage({ id: 'metadata.codingError', defaultMessage: '编码格式错误' }),
        },
      ],
      inputType: 'select',
    },
    {
      title: formatMessage({ id: 'COMMON_NAME' }),
      dataIndex: 'partitionName',
      rules: [COMMONRule],
    },
    { title: formatMessage({ id: 'COMMON_PARAMETERS' }), dataIndex: 'param', rules: [COMMONRule] },
    {
      title: formatMessage({ id: 'COMMON_SORTING' }),
      dataIndex: 'sort',
      rules: [COMMONRule],
      inputType: 'number',
    },
  ];

  checkActionStatus = row => {
    const { isEditingTable } = this.props;
    if (isEditingTable) {
      return {
        showEdit: true,
        showDelete: checkIsRandomRowKey(row.id),
      };
    }
    return {
      showEdit: true,
      showDelete: true,
    };
  };

  handleAddOrUpdateObject = record => {
    const { rowKey, handleSaveData } = this.props;
    handleSaveData('partitionList', record, rowKey);
  };

  handleDeleteObject = record => {
    const { rowKey, handleDeleteData } = this.props;
    handleDeleteData('partitionList', record, rowKey);
  };

  render() {
    const { fieldList, ...restProps } = this.props;
    const columns = this.PARTITION_TAB_COLUMNS.map(o => {
      if (o.dataIndex === 'partitionCode') {
        return {
          ...o,
          datasource: fieldList,
          dataTextField: 'columnCode',
          dataValueField: 'columnCode',
        };
      }
      return { ...o };
    });

    return (
      <EditableFormTable
        {...restProps}
        rowKey="id"
        columns={columns}
        afterSaveRow={this.handleAddOrUpdateObject}
        handleDeleteRow={this.handleDeleteObject}
        checkActionStatus={this.checkActionStatus}
      />
    );
  }
}
export default PartitionTab;
