import React, { Component } from 'react';
import { Table, Pagination, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { getToolTipColumns } from '@/utils/tableUtil';
import styles from './index.less';

class SelTable extends Component {
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
      selectedRowKeys = this.remove(selectedRowKeys, record[primaryKey]);
      selectedRowArr = this.remove(selectedRowArr, record[primaryKey], true);
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

  handleTableChange = (pageIndex, pageSize) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pageIndex, pageSize);
    }
  };

  render() {
    const { selectedRowKeys } = this.state;
    const {
      data,
      isLoading,
      primaryKey,
      columns,
      noRowSelection,
      size = 'small',
      btnArr,
      className = '',
      tooltipTitle,
      tooltipCell,
      scrollX,
    } = this.props;
    const { pagination } = data;

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
        };
    const _columns = getToolTipColumns(columns, tooltipTitle, tooltipCell);
    let scrollProps = {};
    if (scrollX) {
      scrollProps = { scroll: { x: '100%', scrollToFirstRowOnChange: true } };
    }
    return (
      <div className={styles.selTableCon}>
        <div className={styles.tableItemCon}>
          <Table
            rowSelection={rowSelection}
            columns={_columns}
            dataSource={data.list}
            loading={isLoading}
            pagination={false}
            rowKey={`${primaryKey}`}
            size={`${size}`}
            {...scrollProps}
            className={classnames('ellipsis-table', className, scrollX ? 'scroll-x-table' : '')}
          />
        </div>
        <div className={styles.pageCon}>
          <div>
            {formatMessage({ id: 'SELECTED' })}
            <span> {selectedRowKeys.length}</span>/{pagination.total}{' '}
            {formatMessage({ id: 'ITEMS' })}
            {btnArr &&
              btnArr.map((item, index) => {
                return (
                  <Button
                    key={index}
                    onClick={() => item.methed()}
                    size="small"
                    style={{ marginLeft: '10px' }}
                  >
                    {item.name}
                  </Button>
                );
              })}
          </div>
          <Pagination
            size="small"
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={this.handleTableChange}
            style={{ textAlign: 'right' }}
          />
        </div>
      </div>
    );
  }
}

export default SelTable;
