import React, { Component } from 'react';
import { Table, Tabs, Input, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { getExecutionMessages } from '../services';

class ExecutionMessages extends Component {
  columns = [
    { title: formatMessage({ id: 'SERIAL_NUMBER' }), dataIndex: 'logId', width: 80 },
    { title: formatMessage({ id: 'SQL_STATEMENT' }), dataIndex: 'sqlScript' },
    { title: formatMessage({ id: 'EXECUTE_MESSAGE' }), dataIndex: 'executeMessage', width: '20%' },
  ];

  state = {
    loading: false,
    curSelection: {},
    data: [],
  };

  componentDidMount() {
    const { noteId } = this.props;
    this.getExecutionMessages(noteId);
  }

  componentWillReceiveProps(nextProps) {
    const { noteId, executionMessagesMark: nextMark } = nextProps;
    const { executionMessagesMark } = this.props;
    if (nextMark !== executionMessagesMark) {
      this.getExecutionMessages(noteId);
    }
  }

  getExecutionMessages = noteId => {
    if (!noteId) {
      this.setState({ data: [], curSelection: {}, loading: false });
      return false;
    }
    this.setState({ loading: true });
    getExecutionMessages({ noteId }).then(response => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        this.setState({ data: resultObject });
      } else {
        message.error(resultMsg);
      }
    });
  };

  onSelectRow = curSelection => {
    this.setState({ curSelection });
  };

  render() {
    const { curSelection, data, loading } = this.state;
    let selection = curSelection;
    if (!selection.logId && data.length > 0) {
      [selection] = data;
    }
    return (
      <div>
        <Table
          loading={loading}
          style={{ padding: '0 15px' }}
          dataSource={data}
          columns={this.columns}
          rowKey="logId"
          pagination={false}
          onRow={record => {
            return {
              onClick: () => {
                this.onSelectRow(record);
              },
            };
          }}
        />
        <Tabs type="card" style={{ marginTop: 10, paddingBottom: 20 }}>
          <Tabs.TabPane
            tab={formatMessage({ id: 'SQL_STATEMENT' })}
            key="sqlStatement"
            style={{ padding: '0 15px' }}
          >
            <Input.TextArea disabled={true} autosize={{ minRows: 3 }} value={selection.sqlScript} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={formatMessage({ id: 'EXECUTE_MESSAGE' })}
            key="executionMsg"
            style={{ padding: '0 15px' }}
          >
            <Input.TextArea
              disabled={true}
              autosize={{ minRows: 3 }}
              value={selection.executeMessage}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}
export default ExecutionMessages;
