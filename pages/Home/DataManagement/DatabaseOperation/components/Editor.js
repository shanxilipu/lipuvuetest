import React, { Component } from 'react';
import { connect } from 'dva';
import { message, Modal, Icon, Form, Input, Table, Spin, Progress } from 'antd';
import { formatMessage } from 'umi/locale';
import '@/components/ace/ace';
import '@/components/ace/ext-language_tools';
import '@/components/ace/mode-mysql';
import '@/components/ace/snippets/mysql';
import '@/components/ace/theme-chrome';
import sqlFormatter from 'sql-formatter';
import EditorSearchTool from '../tools/EditorSearchTool';
import EditorShortCutTool from '../tools/EditorShortCutTool';
import EditorToolbar from './EditorToolbar';
import { checkAndExecuteSql, checkVaultMsg } from '../services';
import { isParagraphRunning, getRandomMark } from '../tools/utils';
import { PROGRAM_WINDOW_KEY, SQL_WINDOW_KEY, SCRIPT_STATUS_ERROR } from '../constant';
import { downloadFile } from '@/utils/utils';
import setCompleters from '../tools/completerUtil';
import styles from '../DatabaseOperation.less';

@Form.create()
class EditableVaultModal extends React.Component {
  vaultColumns = [
    {
      title: formatMessage({ id: 'SERIAL_NUMBER' }),
      dataIndex: 'num',
    },
    { title: formatMessage({ id: 'FIELD_CODE' }), dataIndex: 'fields' },
    { title: formatMessage({ id: 'COMMON_AUDITOR' }), dataIndex: 'userName' },
    { title: formatMessage({ id: 'USERMGR_PHONE' }), dataIndex: 'phone' },
    {
      title: formatMessage({ id: 'form.verification-code.placeholder' }),
      dataIndex: 'verificationCode',
    },
  ];

  getValues = () => {
    const {
      form: { validateFields },
      onOk,
    } = this.props;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const { dataSource } = this.props;
      const nums = Object.keys(values);
      const params = {};
      nums.forEach(n => {
        const num = parseInt(n.substring(4), 10);
        const { phone } = dataSource[num - 1];
        params[phone] = values[n];
      });
      onOk(params);
    });
  };

  render() {
    const {
      dataSource,
      form: { getFieldDecorator },
      visible,
      onCancel,
      loading,
    } = this.props;
    const columns = this.vaultColumns.map(col => {
      if (col.dataIndex !== 'verificationCode') {
        return col;
      }
      return {
        ...col,
        render: (text, record) => (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(`num_${record.num}`, {
              rules: [{ required: true, message: formatMessage({ id: 'COMMON_REQUIRED' }) }],
              initialValue: '',
            })(<Input />)}
          </Form.Item>
        ),
      };
    });
    return (
      <Modal
        maskClosable={false}
        width={800}
        visible={visible}
        title={
          <div>
            <Icon type="info-circle" style={{ marginRight: 5 }} />
            <span>
              {formatMessage({
                id: 'SENSITIVE_DATA_ACCESS_AUTH',
                defaultMessage: '敏感数据访问认证',
              })}
            </span>
          </div>
        }
        onCancel={onCancel}
        onOk={this.getValues}
        confirmLoading={loading}
      >
        <Table
          className={styles.vaultModalTable}
          rowKey="num"
          dataSource={dataSource}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Modal>
    );
  }
}

@connect(({ dbOperation }) => ({
  dbOperation,
}))
class Editor extends Component {
  constructor(props) {
    super(props);
    this.editor = null;
    const { autoRun, editorWindowId, windowKey, componentId } = props;
    this.windowKey = windowKey; // windowKey指示编辑器属于SQL窗口还是程序窗口
    this.componentId = componentId;
    this.editorWindowId = editorWindowId; // windowId指示编辑器的唯一ID
    this.autoRun = autoRun;
    this.state = {
      loading: false,
      showAdvancedSearch: false,
      showVaultModal: false,
      isRunning: false,
      runningProgress: 0,
      hasError: false,
      openFileLoading: false,
    };
    this.noteId = null;
    this.runningTaskNum = 0;
    this.runningParagraphs = {};
    this.progressTimer = null;
  }

  componentDidMount() {
    const {
      editorWindowId,
      defaultSqlText,
      autoRun,
      dbOperation: { sqlContent },
    } = this.props;
    this.editor = window.ace.edit(`${editorWindowId}Editor`);
    this.initEditorSetting();
    if (defaultSqlText) {
      this.editor.setValue(defaultSqlText);
    }
    this.editorSearchTool = new EditorSearchTool({
      editor: this.editor,
      dispatchResult: this.dispatchOccurrenceResult,
    });
    this.editorShortCutTool = new EditorShortCutTool({
      parentView: this,
      editor: this.editor,
    });
    if (sqlContent) {
      this.setSqlContent(sqlContent);
    }
    if (autoRun) {
      this.handleRun();
    }
  }

  componentWillMount() {
    clearInterval(this.progressTimer);
  }

  componentWillReceiveProps(nextProps) {
    const {
      dbOperation: { shortcut, socketMessage, sqlContent, commonPropsMark },
    } = nextProps;
    const {
      dbOperation: { commonPropsMark: preCommonMark },
    } = this.props;
    if (shortcut) {
      const { activeWindowKey, activeSqlTabKey, action, data } = shortcut;
      if (activeWindowKey === this.windowKey) {
        if (
          (activeWindowKey === SQL_WINDOW_KEY && activeSqlTabKey === this.editorWindowId) ||
          activeWindowKey === PROGRAM_WINDOW_KEY
        ) {
          this.editorShortCutTool.handleShortCut(action, data, commonPropsMark);
        }
      }
    }
    if (socketMessage) {
      const { op, bindConfig } = socketMessage;
      if (op === 'PARAGRAPH' && commonPropsMark !== preCommonMark && !bindConfig.isPagingQuery) {
        const { paragraph } = socketMessage.data;
        const { windowId } = paragraph;
        if (windowId === this.editorWindowId) {
          this.handleParagraphStatus(paragraph);
        }
      } else if (
        op === 'NEW_NOTE' &&
        commonPropsMark !== preCommonMark &&
        !bindConfig.isPagingQuery &&
        bindConfig.windowId === this.editorWindowId
      ) {
        const {
          data: {
            note: { id },
          },
        } = socketMessage;
        this.noteId = id;
        this.setState({ isRunning: true, runningProgress: 0 });
        this.startProgressTimer();
      }
    }
    if (sqlContent && commonPropsMark !== preCommonMark) {
      this.setSqlContent(sqlContent);
    }
  }

  startProgressTimer = () => {
    this.progressTimer = setInterval(() => {
      const { runningProgress } = this.state;
      if (runningProgress === 100) {
        clearInterval(this.progressTimer);
        return false;
      }
      let newProgress = runningProgress + 1;
      newProgress = newProgress >= 85 ? 85 : newProgress;
      this.setState({ runningProgress: newProgress });
    }, 1000);
  };

  setSqlContent = sqlContent => {
    const { sql, readOnly, editorWindowId, replace } = sqlContent;
    if (this.editorWindowId === editorWindowId) {
      if (replace) {
        this.editor.setValue(sql);
      } else {
        this.insert(sql);
      }
      this.editor.setReadOnly(readOnly);
    }
  };

  handleParagraphStatus = paragraph => {
    const { isRunning, runningProgress: curRunningProgress } = this.state;
    if (!isRunning) {
      return false;
    }
    const { runningParagraphs, runningTaskNum } = this;
    const { status, id } = paragraph;
    runningParagraphs[id] = status;
    let running = false;
    let finishNum = Math.min(runningTaskNum, Object.keys(runningParagraphs).length);
    let hasError = false;
    const { getExecutionMessages } = this.props;
    const runningIds = Object.keys(runningParagraphs);
    runningIds.forEach(parId => {
      if (isParagraphRunning(runningParagraphs[parId])) {
        finishNum--;
        running = true;
      }
      if (runningParagraphs[parId] === SCRIPT_STATUS_ERROR) {
        hasError = true;
      }
    });
    if (running) {
      let runningProgress = 0;
      if (finishNum > 0) {
        runningProgress = (finishNum / runningTaskNum) * 100;
        getExecutionMessages(this.noteId);
      }
      if (runningProgress < curRunningProgress) {
        runningProgress = curRunningProgress;
      }
      this.editor.setReadOnly(true);
      this.setState({ isRunning: true, runningProgress, hasError });
    } else if (finishNum === runningTaskNum) {
      getExecutionMessages(this.noteId);
      this.noteId = null;
      this.editor.setReadOnly(false);
      this.runningParagraphs = {};
      this.setState({ isRunning: false, runningProgress: 100, hasError });
      clearInterval(this.progressTimer);
    }
  };

  dispatchOccurrenceResult = (occurrencesCount, currentOccurrence) => {
    this.editorToolbar.onOccurrencesChange({
      occurrencesCount,
      currentOccurrence,
    });
  };

  insert = text => {
    const { isRunning } = this.state;
    if (!isRunning) {
      if (this.editor.getValue()) {
        text = `\n${text}`;
      }
      this.editor.insert(text);
    }
  };

  initEditorSetting = () => {
    setCompleters(this);
    this.editor.setTheme('ace/theme/chrome');
    this.editor.getSession().setMode('ace/mode/mysql');
    this.editor.renderer.setShowGutter(true);
    this.editor.setShowFoldWidgets(true);
    this.editor.setHighlightActiveLine(true);
    this.editor.getSession().setUseWrapMode(true);
    this.editor.setOptions({
      showInvisibles: false,
      fontSize: 16,
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
  };

  onAdvancedSearch = searchOpts => {
    this.editorSearchTool.advancedSearch(searchOpts);
  };

  toggleAdvSearch = visible => {
    const { showAdvancedSearch } = this.state;
    let show = !showAdvancedSearch;
    if (visible !== undefined) {
      show = visible;
    }
    this.setState({ showAdvancedSearch: show });
  };

  getComponentId = () => {
    if (this.windowKey === PROGRAM_WINDOW_KEY) {
      const {
        dbOperation: { programWindowEditorComponentId },
      } = this.props;
      return programWindowEditorComponentId;
    }
    return this.componentId;
  };

  doRun = sqlDetails => {
    const { sendWebsocketMsg, name, schemaType, onRun } = this.props;
    // 需要添加一个sqlId来标记运行的每条sql，在分页时用到
    const paragraph = sqlDetails.map(o => ({
      ...o,
      logSensitiveId: `${o.logSensitiveId}`,
      sqlId: getRandomMark(),
    }));
    const event = {
      op: 'RUN_SQL_PARAGRAPH_SAFE_SYS',
      data: {
        bindConfig: {
          isPagingQuery: false,
        },
        noPersistNote: true,
        isDownload: false,
        iwhPageNo: 1,
        iwhPageSize: 10,
        windowId: this.editorWindowId,
        name,
        scriptName: name,
        datasourceType: schemaType,
        sourceWindow: this.windowKey === PROGRAM_WINDOW_KEY ? '2' : '1',
        mapperId: `${this.getComponentId()}`,
        paragraphs: [
          {
            paragraph,
          },
        ],
      },
    };
    this.autoRun = false;
    this.runningTaskNum = sqlDetails.length;
    this.runningParagraphs = {};
    sendWebsocketMsg(event);
    if (onRun) {
      onRun(event, this.editorWindowId);
    }
  };

  handleRun = () => {
    const componentId = this.getComponentId();
    if (!componentId) {
      return false;
    }
    const runText = this.editor.getSelectedText() || this.editor.getValue();
    if (!runText) {
      return false;
    }
    const { isRunning } = this.state;
    if (isRunning) {
      return false;
    }
    let { schemaType } = this.props;
    if (this.windowKey === PROGRAM_WINDOW_KEY) {
      const {
        dbOperation: { datasourceType },
      } = this.props;
      schemaType = datasourceType;
    }
    this.setState({ loading: true });
    checkAndExecuteSql({
      datasourceId: componentId,
      sql: runText,
      type: schemaType,
      sourceWindow: this.windowKey === PROGRAM_WINDOW_KEY ? '2' : '1',
    }).then(response => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        const { vaultFlag, vaultDetail, sqlDetails } = resultObject;
        if (vaultFlag) {
          const { list, key } = vaultDetail;
          const newList = list.map((item, index) => ({ ...item, num: index + 1 }));
          this.vaultDetail = { key, list: newList };
          this.setState({ showVaultModal: true });
        } else {
          this.doRun(sqlDetails);
        }
      } else {
        message.error(resultMsg);
      }
    });
  };

  handleStop = () => {
    const { isRunning } = this.state;
    if (!isRunning) {
      return false;
    }
    const { sendWebsocketMsg } = this.props;
    const event = {
      op: 'CANCEL_ALL_PARAGRAPHS',
      data: {
        noteId: this.noteId,
      },
    };
    sendWebsocketMsg(event);
    clearInterval(this.progressTimer);
    this.setState({ isRunning: false, runningProgress: 0 });
  };

  checkVaultMsg = values => {
    const { key } = this.vaultDetail;
    const phones = Object.keys(values);
    const list = phones.map(phone => ({
      phone,
      verificationCode: values[phone],
    }));
    this.setState({ loading: true });
    checkVaultMsg({ key, list }).then(response => {
      this.setState({ loading: false, showVaultModal: false });
      this.vaultDetail = {};
      const { resultCode, resultMsg, resultObject } = response;
      if (resultCode === '0') {
        const { sqlDetails } = resultObject;
        this.doRun(sqlDetails);
      } else {
        message.error(resultMsg);
      }
    });
  };

  handleDownload = suffix => {
    downloadFile('smartsafe/DatasourceController/saveSqlScript', {
      sql: this.editor.getValue(),
      suffix,
    });
  };

  beautifySQL = () => {
    const selectedText = this.editor.getSelectedText();
    const text = selectedText || this.editor.getValue();
    if (!text) {
      return false;
    }
    const formattedSQL = sqlFormatter.format(text);
    if (!selectedText) {
      this.editor.selection.selectAll();
    }
    this.editor.commands.exec('insertstring', this.editor, formattedSQL);
    this.editor.focus();
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

  onProgramWindowComponentChange = programWindowEditorComponentId => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: { programWindowEditorComponentId },
    });
  };

  render() {
    const { editorWindowId } = this.props;
    let editorToolbarProps = {};
    if (this.windowKey === PROGRAM_WINDOW_KEY) {
      const {
        dbOperation: { treeData },
      } = this.props;
      const databases = treeData.map(o => {
        const { datasourceId, datasourceName } = o;
        return { datasourceId, datasourceName };
      });
      const programWindowComponentId = this.getComponentId();
      editorToolbarProps = {
        databases,
        programWindowComponentId,
        onProgramWindowComponentChange: this.onProgramWindowComponentChange,
      };
    }
    const {
      loading,
      showAdvancedSearch,
      showVaultModal,
      isRunning,
      runningProgress,
      hasError,
      openFileLoading,
    } = this.state;
    const progressProps = { status: hasError ? 'exception' : 'active' };
    if (runningProgress < 100) {
      progressProps.status = hasError ? 'exception' : 'active';
    } else if (hasError) {
      progressProps.status = 'exception';
    } else {
      delete progressProps.status;
    }
    return (
      <Spin spinning={loading}>
        <div style={{ padding: '0 15px' }}>
          {showVaultModal && (
            <EditableVaultModal
              loading={loading}
              dataSource={this.vaultDetail.list}
              visible={showVaultModal}
              onCancel={() => {
                this.vaultDetail = {};
                this.setState({ showVaultModal: false });
              }}
              onOk={this.checkVaultMsg}
            />
          )}
          <EditorToolbar
            {...editorToolbarProps}
            windowKey={this.windowKey}
            isRunning={isRunning}
            openFileLoading={openFileLoading}
            showAdvancedSearch={showAdvancedSearch}
            onAdvancedSearch={this.onAdvancedSearch}
            toggleAdvSearch={this.toggleAdvSearch}
            handleRun={this.handleRun}
            handleStop={this.handleStop}
            handleDownload={this.handleDownload}
            ref={editorToolbar => {
              this.editorToolbar = editorToolbar;
            }}
            beautifySQL={this.beautifySQL}
            handleOpenFile={this.handleOpenFile}
            beforeUpload={() => {
              this.setState({ openFileLoading: true });
            }}
          />
          <div id={`${editorWindowId}Editor`} className={styles.editor} />
          {this.runningTaskNum > 0 && (
            <Progress percent={runningProgress} showInfo={false} {...progressProps} />
          )}
        </div>
      </Spin>
    );
  }
}
export default Editor;
