import React, { Component } from 'react';
import { Table, message } from 'antd';
import { HISTORY_TAB_COLUMNS } from '../constant';
import { getTableOperLogs } from '../services';

const RESOURCE_TYPES = {
  hive: 'HIVE_TABLE',
};

class TableHistoryLogs extends Component {
  state = {
    loading: false,
    pageIndex: 1,
    dataSource: { rows: [], pageInfo: {} },
  };

  componentDidMount() {
    this.getTableOperLogs(1);
  }

  componentWillReceiveProps() {
    this.getTableOperLogs(1);
  }

  getTableOperLogs = pageIndex => {
    const { schemaType, tableId } = this.props;
    if (!tableId) {
      this.setState({ pageIndex: 1, dataSource: { rows: [], pageInfo: {} } });
      return false;
    }
    this.setState({ loading: true });
    const payload = {
      resourceType: RESOURCE_TYPES[schemaType],
      resourceId: tableId,
      pageIndex,
      pageSize: 5,
    };
    getTableOperLogs(payload).then(result => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = result;
      if (resultCode === '0') {
        this.setState({ dataSource: resultObject, pageIndex });
      } else {
        message.error(resultMsg);
      }
    });
  };

  render() {
    const {
      loading,
      pageIndex,
      dataSource: {
        rows,
        pageInfo: { total },
      },
    } = this.state;
    return (
      <Table
        loading={loading}
        columns={HISTORY_TAB_COLUMNS}
        rowKey="logId"
        dataSource={rows}
        pagination={{
          current: pageIndex,
          onChange: this.getTableOperLogs,
          total,
          pageSize: 5,
        }}
      />
    );
  }
}
export default TableHistoryLogs;
