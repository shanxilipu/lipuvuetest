/**
 * 训练模型内嵌表格 通用组件
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import styles from './index.less';

class TrainTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: false,
      pagination: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      list: nextProps.list,
      loading: nextProps.loading,
      pagination: nextProps.pagination,
    });
  }

  render() {
    const { loading, list, pagination } = this.state;
    const {
      handleTableChange,
      columns,
      innerColumns,
      rowKey,
      expendContent,
      expendDiv,
      rowSelection,
      locale,
    } = this.props;
    // 嵌套表格
    const expandedRowRender = record => {
      const innerList = [record];
      if (innerColumns) {
        return (
          <Table
            columns={innerColumns}
            dataSource={innerList}
            pagination={false}
            rowKey={`${rowKey || 'id'}`}
          />
        );
      }
      return expendContent(record);
    };
    // 表格渲染：防止defaultExpandAllRows={true}不起作用
    const renderTable = () => {
      // const expands = list.map(item => item.id);
      const page = {
        ...pagination,
        showQuickJumper: true,
      };
      columns.forEach(ele => {
        ele.onHeaderCell = () => ({
          title: ele.title,
        });
      });
      return (
        <Table
          className={`${expendDiv ? '' : styles.noExpand}`}
          expandIconAsCell={false}
          rowClassName={styles.model_table_header}
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={page}
          onChange={handleTableChange}
          rowKey={`${rowKey || 'id'}`}
          expandedRowRender={expendDiv ? expandedRowRender : null}
          size="small"
          rowSelection={rowSelection}
          locale={locale}
        />
      );
    };
    return <div className={styles.model_table_wrapper}>{renderTable()}</div>;
  }
}

export default TrainTable;
