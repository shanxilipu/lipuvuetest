import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Table, Tabs, Tooltip } from 'antd';
import styles from '../DatabaseOperation.less';
import Editor from './Editor';
import SqlHistoryLogs from './SqlHistoryLogs';
import ExecutionMessages from './ExecutionMessages';
import { PROGRAM_WINDOW_KEY } from '../constant';
import { getResultTable, isParagraphRunning } from '../tools/utils';

@connect(({ dbOperation }) => ({
  dbOperation,
}))
class ProgramWindow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resultTabs: [],
      executionMessagesNoteId: null,
      activeTabKey: 'historyLogs',
    };
    this.executionMessagesMark = null;
  }

  componentWillReceiveProps(nextProps) {
    const {
      dbOperation: { socketMessage, commonPropsMark },
    } = nextProps;
    const {
      dbOperation: { commonPropsMark: preCommonMark },
    } = this.props;
    if (socketMessage) {
      const { op } = socketMessage;
      if (op === 'PARAGRAPH' && commonPropsMark !== preCommonMark) {
        const { paragraph } = socketMessage.data;
        const { windowId } = paragraph;
        if (windowId === PROGRAM_WINDOW_KEY) {
          this.onReceiveParagraph(paragraph);
        }
      }
    }
  }

  onReceiveParagraph = paragraph => {
    const { status } = paragraph;
    // 处理finished了结果
    if (!isParagraphRunning(status)) {
      const { rawSQL, results, settings: { params: pagination = null } = {}, sqlId } = paragraph;
      if (!results || !results.msg) {
        return false;
      }
      const { resultTabs } = this.state;
      const newResultTabs = resultTabs.slice();
      const index = newResultTabs.findIndex(tab => tab.sqlId === sqlId);
      if (index === -1) {
        newResultTabs.push({
          name: `${formatMessage({ id: 'COMMON_RESULT' })}${newResultTabs.length + 1}`,
          title: rawSQL,
          results,
          pagination,
          sqlId,
        });
      } else {
        const tab = newResultTabs[index];
        tab.results = results;
        tab.pagination = pagination;
        newResultTabs.splice(index, 1, tab);
      }
      this.setState({ resultTabs: newResultTabs, activeTabKey: 'executingMsg' });
    }
  };

  getResultTabContent = resultTab => {
    const {
      results: { msg },
    } = resultTab;
    return (
      <div style={{ padding: '0 15px' }}>
        {msg.map(o => {
          const { type, data } = o;
          if (type === 'TABLE') {
            const { columns, dataSource } = getResultTable(data);
            return (
              <Table
                rowKey="rowKey"
                columns={columns}
                dataSource={dataSource}
                scroll={{ x: 'max-content' }}
                bordered
                pagination={false}
              />
            );
          }
          return <div>{data}</div>;
        })}
      </div>
    );
  };

  onDoubleClickHistoryLog = sql => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        activeWindowKey: PROGRAM_WINDOW_KEY,
        sqlContent: { sql, readOnly: false, editorWindowId: PROGRAM_WINDOW_KEY },
      },
    });
  };

  render() {
    const { executionMessagesNoteId, activeTabKey, resultTabs } = this.state;
    const { sendWebsocketMsg } = this.props;
    const editorProps = {
      name: PROGRAM_WINDOW_KEY,
      windowKey: PROGRAM_WINDOW_KEY,
      editorWindowId: PROGRAM_WINDOW_KEY,
      sendWebsocketMsg,
      getExecutionMessages: noteId => {
        this.executionMessagesMark = new Date().getTime().toString();
        this.setState({ executionMessagesNoteId: noteId });
      },
    };
    return (
      <div>
        <Editor
          {...editorProps}
          onRun={() => {
            this.setState({ resultTabs: [], activeTabKey: 'historyLogs' });
          }}
        />
        <Tabs
          activeKey={activeTabKey}
          onChange={key => {
            this.setState({ activeTabKey: key });
          }}
          type="card"
          style={{ marginTop: 20 }}
          className={styles.separatedCardTabs}
        >
          <Tabs.TabPane tab={formatMessage({ id: 'HISTORY_LOGS' })} key="historyLogs">
            <SqlHistoryLogs
              onDoubleClick={this.onDoubleClickHistoryLog}
              sourceWindow="2"
              noteId={executionMessagesNoteId}
              executionMessagesMark={this.executionMessagesMark}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'EXECUTE_MESSAGE' })} key="executingMsg">
            <ExecutionMessages
              noteId={executionMessagesNoteId}
              executionMessagesMark={this.executionMessagesMark}
            />
          </Tabs.TabPane>
          {resultTabs.map(resultTab => (
            <Tabs.TabPane
              tab={
                <Tooltip title={resultTab.title}>
                  <span>{resultTab.name}</span>
                </Tooltip>
              }
              key={resultTab.sqlId}
            >
              {this.getResultTabContent(resultTab)}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}
export default ProgramWindow;
