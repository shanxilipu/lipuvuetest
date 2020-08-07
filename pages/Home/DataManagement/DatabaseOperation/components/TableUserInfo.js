import React from 'react';
import { Table } from 'antd';
import { USER_INFO_TAB_COLUMNS } from '../constant';
import { getTableUserInformation } from '../services';
import { defaultHandleResponse } from '@/utils/utils';

class TableUserInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    const {
      currentTableInfo: { tableId },
    } = this.props;
    const {
      currentTableInfo: { tableId: preTableId },
    } = prevProps;
    if (tableId !== preTableId) {
      this.getData();
    }
  }

  getData = () => {
    const {
      currentTableInfo: { tableId },
    } = this.props;
    if (!tableId) {
      this.setState({ data: [] });
    } else {
      this.setState({ loading: true });
      getTableUserInformation({ tableId }).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(response, (data = []) => {
          this.setState({ data });
        });
      });
    }
  };

  render() {
    const { data, loading } = this.state;
    return (
      <Table
        columns={USER_INFO_TAB_COLUMNS}
        dataSource={data}
        pagination={false}
        loading={loading}
      />
    );
  }
}
export default TableUserInfo;
