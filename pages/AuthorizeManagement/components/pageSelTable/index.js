/**
 * 训练模型内嵌表格 通用组件
 */
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Table, Pagination } from 'antd';
import styles from './index.less';

class TrainTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRowArr: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { primaryKey } = this.props;
    let selectedRowKeys = [];
    let selectedRowArr = [];
    if (nextProps.initVlaue && nextProps.initVlaue.length > 0) {
      selectedRowKeys = nextProps.initVlaue.map(item => item[primaryKey]);
      selectedRowArr = nextProps.initVlaue;
    }
    this.setState({
      selectedRowKeys,
      selectedRowArr,
    });
  }

  onSelect = (record, selected) => {
    const { primaryKey } = this.props;
    let { selectedRowKeys, selectedRowArr } = this.state;
    if (selected) {
      selectedRowKeys.push(record[primaryKey]);
      selectedRowArr.push(record);
    } else {
      selectedRowKeys = this.remove(selectedRowKeys, record[[primaryKey]]);
      selectedRowArr = this.remove(selectedRowArr, record[[primaryKey]], true);
    }
    this.setState(
      {
        selectedRowKeys,
        selectedRowArr,
      },
      () => {
        const { onGetSel } = this.props;
        if (onGetSel) {
          onGetSel(selectedRowKeys, selectedRowArr);
        }
      }
    );
  };

  onSelectAll = (selected, selectedRows, changeRows) => {
    let { selectedRowKeys, selectedRowArr } = this.state;
    const { primaryKey } = this.props;
    if (selected) {
      changeRows.forEach(item => {
        selectedRowKeys.push(item[primaryKey]);
        selectedRowArr.push(item);
      });
    } else {
      selectedRowKeys = this.removeArr(selectedRowKeys, changeRows);
      selectedRowArr = this.removeArr(selectedRowArr, changeRows, true);
    }
    this.setState(
      {
        selectedRowKeys,
        selectedRowArr,
      },
      () => {
        const { onGetSel } = this.props;
        if (onGetSel) {
          onGetSel(selectedRowKeys, selectedRowArr);
        }
      }
    );
  };

  remove = (arr, key, type) => {
    const { primaryKey } = this.props;
    let index = -1;
    if (type) {
      try {
        arr.forEach((item, num) => {
          if (item[primaryKey] === key) {
            index = num;
            throw new Error('跳出循环');
          }
        });
      } catch (e) {
        arr.splice(index, 1);
      }
    } else {
      index = arr.indexOf(key);
      arr.splice(index, 1);
    }
    return arr;
  };

  removeArr = (arr, childArr, type) => {
    const { primaryKey } = this.props;
    let index = -1;
    if (type) {
      childArr.forEach(item => {
        try {
          arr.forEach((ele, num) => {
            if (ele[primaryKey] === item[primaryKey]) {
              index = num;
              throw new Error('跳出循环');
            }
          });
        } catch (e) {
          arr.splice(index, 1);
        }
      });
    } else {
      childArr.forEach(item => {
        index = arr.indexOf(item[primaryKey]);
        arr.splice(index, 1);
      });
    }
    return arr;
  };

  handlePaginationOnChanges = (pagination, filters, sorter) => {
    const { handlePaginationOnChanges } = this.props;
    if (handlePaginationOnChanges) {
      handlePaginationOnChanges(pagination, filters, sorter);
    }
  };

  setClassName = record => {
    const { selectRecord = {} } = this.props;
    const { primaryKey } = this.props;
    return JSON.stringify(selectRecord) !== '{}' && record[primaryKey] === selectRecord[primaryKey]
      ? `ant-table-row-clicked row-key-${record[primaryKey]}`
      : `row-key-${record[primaryKey]}`;
  };

  render() {
    const { selectedRowKeys } = this.state;
    const {
      pageInfo,
      dataSource = [],
      isLoading,
      primaryKey,
      columns = [],
      noRowSelection,
      getFooterBtn,
      customRowSelection = {},
    } = this.props;

    const rowSelection = noRowSelection
      ? null
      : {
          selectedRowKeys,
          onSelect: (record, selected) => {
            this.onSelect(record, selected);
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            this.onSelectAll(selected, selectedRows, changeRows);
          },
          ...customRowSelection,
        };

    return (
      <div className={styles.pageSelTable}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          pagination={false}
          rowKey={`${primaryKey}`}
          size="small"
          onRow={record => ({
            onClick: () => {
              const { selectRecord = {} } = this.props;
              if (record[primaryKey] !== selectRecord[primaryKey]) {
                const { setclickRecord } = this.props;
                if (setclickRecord) {
                  setclickRecord(record);
                }
              }
            },
          })}
          rowClassName={this.setClassName}
        />
        <div className={styles.footerCon}>
          <div>
            <label>
              {formatMessage({ id: 'SELECTED', defaultMessage: '已选中' })}
              <span style={{ color: '#01C1DE' }}>{`${selectedRowKeys.length}`}</span>
              {`/${pageInfo.total}${formatMessage({ id: 'ITEMS', defaultMessage: '个' })}`}
            </label>
            {getFooterBtn(selectedRowKeys)}
          </div>
          <div>
            <Pagination
              size="small"
              current={pageInfo.pageIndex}
              total={pageInfo.total}
              pageSize={pageInfo.pageSize}
              onChange={this.handlePaginationOnChanges}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TrainTable;
