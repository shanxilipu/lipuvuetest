import React, { Component } from 'react';
import { connect } from 'dva';
import { throttle } from 'lodash-decorators';
import { formatMessage } from 'umi/locale';
import { Button, Tabs, Upload, message, Tooltip, Table, Modal, Input, Form } from 'antd';
import styles from '../DatabaseOperation.less';
import Editor from './Editor';
import SqlHistoryLogs from './SqlHistoryLogs';
import ExecutionMessages from './ExecutionMessages';
import {
  ROOT_NAME,
  SQL_WINDOW_KEY,
  PROGRAM_WINDOW_KEY,
  TREE_NODE_TYPE_TABLE,
  SCRIPT_STATUS_ERROR,
  SCRIPT_STATUS_FINISHED,
} from '../constant';
import {
  getRandomMark,
  isParagraphRunning,
  getResultTable,
  getShowTotalText,
} from '../tools/utils';
import { downloadFile } from '@/utils/utils';
import { getWaterMark, getConfigList } from '../services';

const { TabPane } = Tabs;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

@Form.create()
class DataFileModal extends React.PureComponent {
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      onOk,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (err) {
        return false;
      }
      onOk(values);
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      onCancel,
      showDownloadFileModal,
    } = this.props;
    return (
      <Modal
        visible={showDownloadFileModal}
        title={formatMessage({ id: 'DATA_DOWNLOAD' })}
        onOk={this.handleSave}
        onCancel={onCancel}
      >
        <Form>
          <Form.Item {...formItemLayout} label={formatMessage({ id: 'DATA_FILE_NAME' })}>
            {getFieldDecorator('fileName', {
              rules: [{ required: true, message: formatMessage({ id: 'COMMON_REQUIRED' }) }],
            })(<Input placeholder={formatMessage({ id: 'DATA_FILE_NAME' })} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

@connect(({ dbOperation }) => ({
  dbOperation,
}))
@Form.create()
class SQLWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: 'historyLogs',
      resultTabsObj: {},
      executionMessagesNoteId: null,
      resultTabLoadings: {},
      downloadButtonLoading: false,
      showDownloadFileModal: false,
      openFileLoading: false,
      importFileLoading: false,
      waterMark: '',
      stateTrigger: 0,
      // hive类型 上传弹框信息
      hiveUploadModalInfo: {
        visible: false,
        params: '', // 当前分区参数
        fileItem: [],
      },
    };
    this.executionMessagesMark = null;
    this.runningEvents = {};
    this.executionMessagesNoteIdOnTabs = {};
    this.downloadBigDataEvent = null;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    getConfigList({ type: 'QUERY_WITH_WATER' }).then(response => {
      const { resultCode, resultObject } = response;
      if (resultCode === '0') {
        if (resultObject.standDisplayValue === '1') {
          this.getWaterMark();
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  getWaterMark = () => {
    getWaterMark().then(response => {
      const { resultMsg, resultCode, resultObject } = response;
      if (resultCode === '0') {
        this.setState({ waterMark: resultObject });
      } else {
        message.error(resultMsg);
      }
    });
  };

  @throttle(200)
  handleResize = () => {
    const { stateTrigger } = this.state;
    this.setState({ stateTrigger: stateTrigger + 1 });
  };

  componentWillReceiveProps(nextProps) {
    const {
      dbOperation: { socketMessage, sqlEditTabs, activeSqlTabKey: newSqlTabKey, commonPropsMark },
    } = nextProps;
    const {
      dbOperation: { commonPropsMark: preCommonMark },
    } = this.props;
    if (socketMessage) {
      const { op, bindConfig } = socketMessage;
      if (op === 'PARAGRAPH' && commonPropsMark !== preCommonMark) {
        const { isPagingQuery } = bindConfig;
        const { paragraph } = socketMessage.data;
        const { windowId } = paragraph;
        if (windowId !== PROGRAM_WINDOW_KEY) {
          this.onReceiveParagraph(paragraph, isPagingQuery);
        }
      } else if (
        (op === 'DOWNLOAD_ALL_DATA_RETURN' || op === 'DOWNLOAD_BIGTABLE_ALL_DATA_RETURN') &&
        commonPropsMark !== preCommonMark
      ) {
        const { downloadStatus, info, realFileName } = socketMessage.data;
        if (downloadStatus === SCRIPT_STATUS_FINISHED) {
          // 下载事件的响应，取消下载按钮loading
          this.setState({ downloadButtonLoading: false });
          if (op === 'DOWNLOAD_ALL_DATA_RETURN') {
            downloadFile(
              'smartsafe/SqlDataExportController/exportDataFront',
              {
                fileName: realFileName,
              },
              'GET'
            );
          } else if (op === 'DOWNLOAD_BIGTABLE_ALL_DATA_RETURN') {
            message.success(formatMessage({ id: 'DOWNLOAD_TASK_GENERATING' }));
          }
        } else if (downloadStatus === SCRIPT_STATUS_ERROR) {
          // 下载事件的响应，取消下载按钮loading
          this.setState({ downloadButtonLoading: false });
          message.error(info);
        }
      } else if (op === 'DOWNLOAD_ALL_DATA_ERROR' && commonPropsMark !== preCommonMark) {
        this.setState({ downloadButtonLoading: false });
        const { ERROR = '' } = socketMessage.data;
        message.error(ERROR.toString());
      }
    }
    // 删除那些已经关闭了的sql tab绑定的noteId
    const { executionMessagesNoteIdOnTabs } = this;
    const allNoteIdKeys = Object.keys(executionMessagesNoteIdOnTabs);
    if (allNoteIdKeys.length > 0) {
      const allSqlTabKeys = sqlEditTabs.map(tab => tab.editorWindowId);
      for (let i = 0; i < allNoteIdKeys.length; i++) {
        if (!allSqlTabKeys.includes(allNoteIdKeys[i])) {
          delete executionMessagesNoteIdOnTabs[allNoteIdKeys[i]];
        }
      }
    }
    // 当前sql tab切换的时候，要切换[执行消息]tab的内容
    const {
      dbOperation: { activeSqlTabKey },
    } = this.props;
    if (activeSqlTabKey !== newSqlTabKey) {
      // 如果没有noteId,设为null，无记录显示
      const nextNoteId = executionMessagesNoteIdOnTabs[newSqlTabKey] || null;
      this.executionMessagesMark = new Date().getTime().toString();
      this.setState({ executionMessagesNoteId: nextNoteId, activeTabKey: 'historyLogs' });
    }
  }

  onReceiveParagraph = (paragraph, isPagingQuery) => {
    const { status, windowId } = paragraph;
    const {
      dbOperation: { sqlEditTabs },
    } = this.props;
    const windowIndex = sqlEditTabs.findIndex(tab => tab.editorWindowId === windowId);
    // 说明来源的编辑器tab已经被关闭了，这时候返回的消息就不处理了
    if (windowIndex === -1) {
      return false;
    }
    // 处理finished了结果
    if (!isParagraphRunning(status)) {
      const { rawSQL, results, settings: { params = {} } = {}, sqlId } = paragraph;
      let pagination = null;
      if (params.iwhIsPage) {
        pagination = params;
      }
      if (!results || !results.msg) {
        return false;
      }
      const { resultTabsObj, resultTabLoadings } = this.state;
      const resultTabs = resultTabsObj[windowId] || [];
      const newResultTabs = resultTabs.slice();
      const index = newResultTabs.findIndex(tab => tab.sqlId === sqlId);
      if (index === -1) {
        newResultTabs.push({
          name: `${formatMessage({ id: 'COMMON_RESULT' })}${newResultTabs.length + 1}`,
          title: rawSQL,
          results,
          pagination,
          sqlId,
          windowId,
        });
      } else {
        const tab = newResultTabs[index];
        tab.results = results;
        tab.pagination = pagination;
        newResultTabs.splice(index, 1, tab);
      }
      const newResultTabsObj = { ...resultTabsObj, [windowId]: newResultTabs };
      const newResultTabLoadings = { ...resultTabLoadings };
      newResultTabLoadings[sqlId] = false;
      this.setState({ resultTabsObj: newResultTabsObj, resultTabLoadings: newResultTabLoadings });
      // 不是点分页查询的时候就切换到执行消息tab 看这次sql的执行消息
      if (!isPagingQuery) {
        this.setState({ activeTabKey: 'executingMsg' });
      }
    }
  };

  handlePagingResult = (pageIndex, pageSize, resultTab) => {
    const { windowId } = resultTab;
    const event = this.runningEvents[windowId];
    if (!event) {
      return false;
    }
    const {
      data: { paragraphs },
    } = event;
    const { paragraph } = paragraphs[0];
    const { sqlId } = resultTab;
    const pagingParagraph = paragraph.filter(o => o.sqlId === sqlId);
    const pagingEvent = { ...event };
    pagingEvent.data.iwhPageNo = pageIndex;
    pagingEvent.data.iwhPageSize = pageSize;
    pagingEvent.data.paragraphs = [{ paragraph: pagingParagraph }];
    pagingEvent.data.bindConfig.isPagingQuery = true;
    const { resultTabLoadings } = this.state;
    const loadings = { ...resultTabLoadings };
    loadings[sqlId] = true;
    this.setState({ resultTabLoadings: loadings });
    const { sendWebsocketMsg } = this.props;
    sendWebsocketMsg(pagingEvent);
  };

  handleDownload = (resultTab, dataSource) => {
    const { windowId } = resultTab;
    const event = this.runningEvents[windowId];
    if (!event) {
      return false;
    }
    const {
      data: { paragraphs },
    } = event;
    const { paragraph } = paragraphs[0];
    const { sqlId, pagination } = resultTab;
    const p = paragraph.filter(o => o.sqlId === sqlId);
    const downloadEvent = { ...event };
    const newData = { ...downloadEvent.data };
    delete newData.iwhPageNo;
    delete newData.iwhPageSize;
    newData.isDownload = true;
    newData.paragraphs = [{ paragraph: p }];
    newData.bindConfig = {};
    downloadEvent.op = 'DOWNLOAD_ALL_DATA';
    downloadEvent.data = newData;
    const doDownloadEvent = () => {
      const { sendWebsocketMsg } = this.props;
      sendWebsocketMsg(downloadEvent);
      this.setState({ downloadButtonLoading: true });
    };
    if (pagination) {
      const { iwhTotalCount } = pagination;
      if (iwhTotalCount > 1000) {
        downloadEvent.op = 'DOWNLOAD_BIGTABLE_ALL_DATA';
        this.downloadBigDataEvent = downloadEvent;
        this.setState({ showDownloadFileModal: true });
      } else {
        doDownloadEvent();
      }
    } else if (dataSource.length > 1000) {
      downloadEvent.op = 'DOWNLOAD_BIGTABLE_ALL_DATA';
      this.downloadBigDataEvent = downloadEvent;
      this.setState({ showDownloadFileModal: true });
    } else {
      doDownloadEvent();
    }
  };

  handleDownloadBigDataEvent = values => {
    const { fileName } = values;
    const downloadEvent = { ...this.downloadBigDataEvent };
    downloadEvent.data.fileName = fileName;
    const { sendWebsocketMsg } = this.props;
    sendWebsocketMsg(downloadEvent);
    this.setState({ downloadButtonLoading: true, showDownloadFileModal: false });
  };

  getWaterMarkContent = () => {
    const { waterMark } = this.state;
    const marks = waterMark.split('\n');
    const cellHeight = marks.length * 22;
    const rowNum = Math.ceil(window.innerHeight / cellHeight);
    const rows = Array.from({ length: rowNum }, (v, k) => k);
    const colNum = Math.ceil(window.innerWidth / 300);
    const cols = Array.from({ length: colNum }, (v, k) => k);
    const firstMargin = cellHeight / 2;
    return (
      <div
        style={{
          position: 'absolute',
          left: firstMargin,
          top: firstMargin,
          width: '100%',
          height: '100%',
        }}
      >
        {rows.map((r, rowIndex) => (
          <div
            key={rowIndex}
            className={styles.waterMarkRow}
            style={{ top: rowIndex * cellHeight + rowIndex * 50, height: cellHeight }}
          >
            {cols.map((c, colIndex) => (
              <div
                className={styles.waterMarkCell}
                style={{ left: colIndex * 300 }}
                key={getRandomMark()}
              >
                {marks.map(o => (
                  <div key={getRandomMark()}>{o}</div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  getResultTabContent = resultTab => {
    const {
      pagination,
      results: { msg },
      sqlId,
    } = resultTab;
    let paginationProps = {
      defaultCurrent: 1,
      defaultPageSize: 10,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50'],
      showTotal: total => getShowTotalText(total),
    };
    if (pagination) {
      const { iwhPageNo, iwhPageSize, iwhTotalCount } = pagination;
      paginationProps = {
        ...paginationProps,
        current: parseInt(iwhPageNo, 10),
        pageSize: parseInt(iwhPageSize, 10),
        total: parseInt(iwhTotalCount, 10),
        onChange: (pageIndex, pageSize) => {
          this.handlePagingResult(pageIndex, pageSize, resultTab);
        },
        onShowSizeChange: (pageIndex, pageSize) => {
          this.handlePagingResult(pageIndex, pageSize, resultTab);
        },
      };
    }
    const { resultTabLoadings, downloadButtonLoading, waterMark } = this.state;
    const loading = resultTabLoadings[sqlId];
    return (
      <div style={{ padding: '0 15px' }}>
        {msg.map(o => {
          const { type, data } = o;
          if (type === 'TABLE') {
            const { columns, dataSource } = getResultTable(data);
            const renderContent = text => (
              <Tooltip title={text}>
                <div className={styles.cellContent}>{text}</div>
              </Tooltip>
            );
            const _columns = columns.map(c => ({
              ...c,
              width: 120,
              render: renderContent,
              title: () => renderContent(c.title),
            }));
            return (
              <div className={styles.sqlTableResultCon} key={getRandomMark()}>
                <div style={{ marginBottom: 2 }}>
                  <Button
                    loading={downloadButtonLoading}
                    className={styles.downloadButton}
                    onClick={() => {
                      this.handleDownload(resultTab, dataSource);
                    }}
                    icon="download"
                  />
                </div>
                {waterMark && (
                  <div className={styles.waterMarkCon}>{this.getWaterMarkContent()}</div>
                )}
                <Table
                  bordered
                  loading={loading}
                  rowKey="rowKey"
                  columns={_columns}
                  dataSource={dataSource}
                  scroll={{ x: '100%', y: 500 }}
                  pagination={paginationProps}
                  className={styles.resultTable}
                />
              </div>
            );
          }
          if (data.length) {
            let bool = true;
            const arr = ['<div', '<button', '<span'];
            arr.forEach(tmpO => {
              if (data.indexOf(tmpO) > -1) {
                bool = false;
              }
            });
            if (!bool) {
              return null;
            }
          }
          return (
            <div style={{ position: 'relative' }} key={getRandomMark()}>
              <div className={styles.waterMarkCon}>{this.getWaterMarkContent()}</div>
              <div>{data}</div>
            </div>
          );
        })}
      </div>
    );
  };

  getEditTabContent = tab => {
    const { sendWebsocketMsg } = this.props;
    return (
      <Editor
        {...tab}
        key={tab.editorWindowId}
        windowKey={SQL_WINDOW_KEY}
        sendWebsocketMsg={sendWebsocketMsg}
        onRun={this.onRun}
        getExecutionMessages={executionMessagesNoteId => {
          this.executionMessagesMark = new Date().getTime().toString();
          this.setState({ executionMessagesNoteId });
          const {
            dbOperation: { activeSqlTabKey },
          } = this.props;
          // 绑定当前sql tab对应的noteId，在切换sql编辑器时切换下方[执行消息]的内容
          this.executionMessagesNoteIdOnTabs[activeSqlTabKey] = executionMessagesNoteId;
        }}
      />
    );
  };

  onRun = (event, windowId) => {
    this.runningEvents[windowId] = event;
    const { resultTabsObj } = this.state;
    const {
      dbOperation: { activeSqlTabKey },
    } = this.props;
    const newResultTabsObj = { ...resultTabsObj, [activeSqlTabKey]: [] };
    this.setState({ resultTabsObj: newResultTabsObj, activeTabKey: 'historyLogs' });
  };

  onSqlTabsEdit = (targetKey, action) => {
    if (action === 'remove') {
      const {
        dbOperation: { sqlEditTabs, activeSqlTabKey },
        dispatch,
      } = this.props;
      let activeKey = activeSqlTabKey;
      let lastIndex = -1;
      sqlEditTabs.forEach((pane, i) => {
        if (pane.editorWindowId === targetKey) {
          lastIndex = i - 1;
        }
      });
      let panes = sqlEditTabs.filter(pane => pane.editorWindowId !== targetKey);
      if (panes.length && activeSqlTabKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].editorWindowId;
        } else {
          activeKey = panes[0].editorWindowId;
        }
      } else if (panes.length === 0) {
        // 打开一个未与任何数据库绑定的空白tab
        activeKey = getRandomMark();
        panes = [{ name: 'Untitled', componentId: null, editorWindowId: activeKey }];
      }
      dispatch({
        type: 'dbOperation/save',
        payload: {
          sqlEditTabs: panes,
          activeSqlTabKey: activeKey,
        },
      });
    }
  };

  onSqlTabsChange = activeSqlTabKey => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        activeSqlTabKey,
      },
    });
  };

  newSqlTab = () => {
    const {
      dbOperation: { selectedTreeNode },
    } = this.props;
    if (!selectedTreeNode || selectedTreeNode.treeNodeType === ROOT_NAME) {
      return false;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/newSqlEditTab',
      payload: { newTab: selectedTreeNode },
    });
  };

  /**
   * 打开sql或者txt文件，显示到编辑器中
   * @param info
   */
  handleOpenFile = info => {
    const { status, response } = info.file;
    if (status === 'done') {
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        const { dispatch } = this.props;
        dispatch({
          type: 'dbOperation/handleShortcutKeys',
          payload: {
            action: 'paste',
            data: {
              text: resultObject,
            },
          },
        });
      } else {
        message.error(resultMsg);
      }
    }
    this.setState({ openFileLoading: status === 'uploading' });
  };

  handleImportFile = info => {
    const { status, response } = info.file;
    if (status === 'done') {
      const { resultCode, resultMsg } = response;
      if (resultCode === '0') {
        message.success(formatMessage({ id: 'COMMON_COMMAND_SUCCESS' }));
      } else {
        message.error(resultMsg);
      }
    }
    this.setState({ importFileLoading: status === 'uploading' });
  };

  onDoubleClickHistoryLog = sql => {
    const {
      dispatch,
      dbOperation: { activeSqlTabKey },
    } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        sqlContent: { sql, readOnly: false, editorWindowId: activeSqlTabKey },
      },
    });
  };

  listHivePartitionColumn = file => {
    const { dispatch } = this.props;
    const {
      dbOperation: { selectedTreeNode },
    } = this.props;
    const selectedTreeNodeTableId = selectedTreeNode.id;
    dispatch({
      type: 'dbOperation/listHivePartitionColumn',
      payload: {
        tableId: selectedTreeNodeTableId,
      },
      callback: res => {
        const arr = res || [];
        this.setState({
          importFileLoading: false,
          hiveUploadModalInfo: {
            visible: true,
            params: arr.map(str => `${str}=?`).join('/'),
            fileItem: file,
          },
        });
      },
    });
  };

  handleHiveUpload = () => {
    const { importFileLoading } = this.state;
    if (importFileLoading) return;

    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      // 手动上传
      const { partitionInfo } = values;
      const {
        dbOperation: { selectedTreeNode },
      } = this.props;
      const selectedTreeNodeTableId = selectedTreeNode.id;
      const selectedTreeNodeComponentId = selectedTreeNode.componentId;
      const {
        hiveUploadModalInfo: { fileItem },
      } = this.state;
      const formData = new FormData();
      formData.append('file', fileItem);
      formData.append('tableId', selectedTreeNodeTableId);
      formData.append('datasourceId', selectedTreeNodeComponentId);
      if (partitionInfo) {
        formData.append('partitionInfo', partitionInfo);
      }

      this.setState({
        importFileLoading: true,
      });

      dispatch({
        type: 'dbOperation/hiveUploadFile',
        payload: formData,
        callback: () => {
          message.success(formatMessage({ id: 'COMMON_COMMAND_SUCCESS' }));
          this.setState({
            hiveUploadModalInfo: {
              visible: false,
            },
          });
        },
      }).then(() => {
        this.setState({
          importFileLoading: false,
        });
      });
    });
  };

  render() {
    const {
      form,
      dbOperation: { sqlEditTabs, activeSqlTabKey, selectedTreeNode, datasourceType },
    } = this.props;
    const {
      resultTabsObj,
      activeTabKey,
      executionMessagesNoteId,
      showDownloadFileModal,
      openFileLoading,
      importFileLoading,
      hiveUploadModalInfo,
    } = this.state;
    const resultTabs = resultTabsObj[activeSqlTabKey] || [];
    const newTabBtnDisabled = !selectedTreeNode || selectedTreeNode.treeNodeType === ROOT_NAME;
    const importFileDisabled =
      newTabBtnDisabled || selectedTreeNode.treeNodeType !== TREE_NODE_TYPE_TABLE;
    let selectedTreeNodeTableId = null;
    let selectedTreeNodeComponentId = null;
    if (!importFileDisabled) {
      selectedTreeNodeTableId = selectedTreeNode.id;
      selectedTreeNodeComponentId = selectedTreeNode.componentId;
    }
    return (
      <div>
        {showDownloadFileModal && (
          <DataFileModal
            showDownloadFileModal={showDownloadFileModal}
            onOk={values => {
              this.handleDownloadBigDataEvent(values);
            }}
            onCancel={() => this.setState({ showDownloadFileModal: false })}
          />
        )}
        <div className={styles.btnsGroup} style={{ marginBottom: 10, marginLeft: 15 }}>
          <Button
            icon="plus"
            className={styles.btnItem}
            disabled={newTabBtnDisabled}
            onClick={this.newSqlTab}
          >
            {formatMessage({ id: 'NEW_WINDOW' })}
          </Button>
          <Upload
            name="zdevscriptUpload"
            action={`${ROUTER_BASE}modelweb/zdmetadata/FileImportController/importFile`}
            headers={{ 'signature-sessionId': window.name }}
            accept=".sql,.txt"
            showUploadList={false}
            onChange={this.handleOpenFile}
            beforeUpload={() => {
              this.setState({ openFileLoading: true });
            }}
          >
            <Button icon="folder" loading={openFileLoading} disabled={openFileLoading}>
              {formatMessage({ id: 'OPEN_FILE' })}
            </Button>
          </Upload>
          <Upload
            name="file"
            action="smartsafe/DatasourceController/uploadFile"
            headers={{ 'signature-sessionId': window.name }}
            accept=".csv,.txt"
            showUploadList={false}
            data={{ tableId: selectedTreeNodeTableId, datasourceId: selectedTreeNodeComponentId }}
            onChange={this.handleImportFile}
            beforeUpload={file => {
              this.setState({ importFileLoading: true });
              // hive类型，弹出弹框选择后再手动上传
              if (datasourceType === 'hive') {
                this.listHivePartitionColumn(file);
                return false;
              }
            }}
          >
            <Button icon="download" disabled={importFileDisabled} loading={importFileLoading}>
              {formatMessage({ id: 'IMPORT_FILE' })}
            </Button>
          </Upload>
        </div>
        <div className={styles.sqlWindowEditorBox}>
          <Tabs
            hideAdd
            type="editable-card"
            onChange={this.onSqlTabsChange}
            activeKey={activeSqlTabKey}
            onEdit={this.onSqlTabsEdit}
            className={styles.databaseOperationTabs}
          >
            {sqlEditTabs.map(tab => (
              <TabPane tab={tab.name} key={tab.editorWindowId}>
                {this.getEditTabContent(tab)}
              </TabPane>
            ))}
          </Tabs>
        </div>
        <Tabs
          activeKey={activeTabKey}
          onChange={key => {
            this.setState({ activeTabKey: key });
          }}
          type="card"
          style={{ marginTop: 20 }}
          className={styles.separatedCardTabs}
        >
          <TabPane tab={formatMessage({ id: 'HISTORY_LOGS' })} key="historyLogs">
            <SqlHistoryLogs
              executionMessagesMark={this.executionMessagesMark}
              noteId={executionMessagesNoteId}
              onDoubleClick={this.onDoubleClickHistoryLog}
              sourceWindow="1"
              showMsg={true}
            />
          </TabPane>
          <TabPane tab={formatMessage({ id: 'EXECUTE_MESSAGE' })} key="executingMsg">
            <ExecutionMessages
              noteId={executionMessagesNoteId}
              executionMessagesMark={this.executionMessagesMark}
            />
          </TabPane>
          {resultTabs.map(resultTab => (
            <TabPane
              tab={
                <Tooltip title={resultTab.title} placement="top">
                  <span>{resultTab.name}</span>
                </Tooltip>
              }
              key={resultTab.sqlId}
            >
              {this.getResultTabContent(resultTab)}
            </TabPane>
          ))}
        </Tabs>
        {hiveUploadModalInfo && hiveUploadModalInfo.visible && (
          <Modal
            visible={true}
            confirmLoading={importFileLoading}
            onOk={this.handleHiveUpload}
            onCancel={() => {
              this.setState({
                hiveUploadModalInfo: {
                  visible: false,
                },
              });
            }}
            okText={formatMessage({ id: 'form.submit', defaultMessage: '提交' })}
            title={formatMessage({ id: 'TARGET_PART', defaultMessage: '目标分区' })}
          >
            <p>
              {formatMessage({ id: 'TARGET_PART_TIP', defaultMessage: '当前表已知分区为' })}:{' '}
              {hiveUploadModalInfo.params || ''}
            </p>
            <Form.Item
              label={formatMessage({ id: 'TARGET_PART', defaultMessage: '目标分区' })}
              {...formItemLayout}
            >
              {form.getFieldDecorator('partitionInfo')(
                <Input
                  placeholder={formatMessage({
                    id: 'form.weight.placeholder',
                    defaultMessage: '请输入',
                  })}
                />
              )}
            </Form.Item>
          </Modal>
        )}
      </div>
    );
  }
}
export default SQLWindow;
