import React from 'react';
import * as _ from 'lodash';
import PropTypes from 'prop-types';
import { Table, Tooltip, Popconfirm, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import MyIcon from '@/components/MyIcon';
import CommonTableModal from './CommonTableModal';
import { getRandomRowKey } from '../tools/utils';
import styles from './index.less';

class EditableFormTable extends React.Component {
  constructor(props) {
    super(props);
    // 对于字段信息和索引，由props控制data内容，这是因为选择实体后字段信息会添加记录，mysql会添加索引记录
    this.dataFromProps = props.dataFromProps;
    this.editingItem = {};
    this.editType = 'new';
    this.state = {
      modalVisible: false,
      scrollY: '100%',
    };
  }

  componentDidMount() {
    const height = this.domRef.clientHeight;
    const { showAddRow, editable } = this.props;
    const addRowHeight = showAddRow && editable ? 38 : 0;
    this.setState({ scrollY: height - addRowHeight - 58 });
  }

  save = row => {
    const { beforeSaveRow, afterSaveRow, rowKey } = this.props;
    let rowObj = {};
    if (this.editType === 'new') {
      row.operType = 'new';
      if (!row[rowKey]) {
        const newKey = getRandomRowKey();
        rowObj = { ...row, [rowKey]: newKey };
      } else {
        rowObj = { ...row };
      }
    } else {
      rowObj = { ...this.editingItem, ...row };
      delete rowObj.operType;
    }
    if (beforeSaveRow) {
      if (!beforeSaveRow(rowObj)) {
        return false;
      }
    }
    afterSaveRow(rowObj);
    this.closeModal();
  };

  edit = record => {
    const row = { ...record };
    const { beforeEditRow } = this.props;
    if (beforeEditRow) {
      beforeEditRow(row);
    }
    this.editingItem = row;
    this.editType = 'edit';
    this.setState({ modalVisible: true });
  };

  handleDelete = record => {
    const { handleDeleteRow } = this.props;
    if (handleDeleteRow) {
      handleDeleteRow(record);
    }
  };

  handleAddRow = () => {
    this.editType = 'new';
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.editingItem = {};
    this.setState({ modalVisible: false });
  };

  render() {
    const { modalVisible, scrollY } = this.state;
    const {
      data,
      columns,
      rowKey,
      form,
      showAddRow,
      tabName,
      pagination,
      editable,
      schemaType,
      beforeSaveRow,
      afterSaveRow,
      afterDeleteRow,
      beforeEditRow,
      fixedAction,
      checkActionStatus,
      ...restTableProps
    } = this.props;
    let paginationProps = false;
    if (pagination) {
      paginationProps = {
        ...pagination,
        onChange: pageIndex => {
          if (pagination.onChange) {
            pagination.onChange(pageIndex);
          }
        },
      };
    }
    let scroll = {};
    const _columns = columns.slice();
    if (tabName === 'fieldTab') {
      let scrollWidth = 0;
      _columns.forEach(o => {
        if (o.width && _.isNumber(o.width)) {
          scrollWidth += o.width;
        }
      });
      scroll = { y: scrollY };
      if (scrollWidth && fixedAction) {
        scroll.x = scrollWidth + 120;
      }
    }
    if (editable) {
      _columns.push({
        dataIndex: 'action',
        title: formatMessage({ id: 'OPERATE' }),
        fixed: fixedAction ? 'right' : false,
        width: 120,
        render: (text, record) => {
          let showEdit = true;
          let showDelete = true;
          if (checkActionStatus) {
            ({ showEdit, showDelete } = checkActionStatus(record));
          }
          return (
            <div>
              {showEdit && (
                <Tooltip title={formatMessage({ id: 'COMMON_EDIT' })}>
                  <MyIcon type="iconbianjix" onClick={() => this.edit(record)} />
                </Tooltip>
              )}
              {showDelete && (
                <Tooltip title={formatMessage({ id: 'COMMON_DELETE' })}>
                  <Popconfirm
                    title={formatMessage({ id: 'DELETE_ITEM_CONFIRM' })}
                    onConfirm={() => this.handleDelete(record)}
                  >
                    <MyIcon type="iconshanchubeifenx" style={{ marginLeft: showEdit ? 5 : 0 }} />
                  </Popconfirm>
                </Tooltip>
              )}
            </div>
          );
        },
      });
    }
    return (
      <div
        className="full-height"
        ref={ref => {
          this.domRef = ref;
        }}
      >
        {modalVisible && (
          <CommonTableModal
            tabName={tabName}
            columns={columns}
            visible={modalVisible}
            editingItem={this.editingItem}
            editType={this.editType}
            schemaType={schemaType}
            onOk={formData => {
              this.save(formData);
            }}
            onCancel={this.closeModal}
          />
        )}
        <Table
          {...restTableProps}
          scroll={scroll}
          bordered
          rowKey={rowKey}
          dataSource={data}
          columns={_columns}
          pagination={paginationProps}
          className={fixedAction && !data.length ? styles.noDataFixedTable : ''}
        />
        {showAddRow && editable && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Button type="primary" onClick={this.handleAddRow}>
              {formatMessage({ id: 'BUTTON_ADD' })}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

EditableFormTable.propTypes = {
  rowKey: PropTypes.string.isRequired,
  schemaType: PropTypes.string.isRequired,
};
export default EditableFormTable;
