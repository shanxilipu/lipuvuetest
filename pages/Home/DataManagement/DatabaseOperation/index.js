import React, { Component } from 'react';
import { connect } from 'dva';
import isEqual from 'lodash/isEqual';
import { Layout, Icon, Select, Input, Tabs, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import MyIcon from '@/components/MyIcon';
import SQLWindow from './components/SQLWindow';
import TableWindow from './components/TableWindow';
import ProgramWindow from './components/ProgramWindow';
import DatabaseTree from './components/DatabaseTree';
import styles from './DatabaseOperation.less';
import Websocket from '@/components/Websocket/Websocket';
import {
  SQL_WINDOW_KEY,
  TABLE_WINDOW_KEY,
  PROGRAM_WINDOW_KEY,
  ROOT_NAME,
  TABLES_ROOT_NAME,
  FUNCTIONS_ROOT_NAME,
  VIEWS_ROOT_NAME,
  TREE_NODE_TYPE_TABLE,
  TREE_NODE_TYPE_VIEW,
} from './constant';
import getShortCuts from './tools/EditorShortCuts';
import { findTreeNodeInTreeData, getRandomMark } from './tools/utils';
import WebsocketEventsHandler from './tools/WebsocketEventsHandler';
import { getConfigList, getDatasourceTypes } from './services';
import { loadChildren } from './tools/databaseUtil';
import { checkLanguageIsEnglish, defaultHandleResponse } from '@/utils/utils';

const { Sider } = Layout;
const { TabPane } = Tabs;
let pingIntervalId;

const clearPingInterval = () => {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
};

@connect(({ dbOperation, user: { currentUser }, loading }) => ({
  dbOperation,
  user: currentUser,
  effectLoading: loading.effects['dbOperation/getDatabases'],
}))
class DatabaseOperation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      collapsed: false,
      datasourceTypes: [],
      extraRightMenuHeight: 0,
      searchKeyword: '',
      getDatasourceTypeLoading: false,
    };
    this.websocketReady = false;
    this.unSendEvents = [];
    this.websocketEventsHandler = new WebsocketEventsHandler({
      dispatchSocketMessage: this.dispatchSocketMessage,
    });
  }

  componentDidMount() {
    this.getDatasourceTypes();
    this.getWebsocketUrl();
    document.addEventListener('keydown', this.bindKeys);
  }

  componentDidUpdate(prevProps) {
    const {
      dbOperation: { saveTableDataEvent },
    } = this.props;
    const {
      dbOperation: { saveTableDataEvent: preSaveTableDataEvent },
    } = prevProps;
    if (!isEqual(saveTableDataEvent, preSaveTableDataEvent)) {
      this.handleSaveTableSuccess(saveTableDataEvent);
    }
  }

  getDatasourceTypes = () => {
    this.setState({ getDatasourceTypeLoading: true });
    getDatasourceTypes({}).then(response => {
      this.setState({ getDatasourceTypeLoading: false });
      defaultHandleResponse(response, (resultObject = []) => {
        const datasourceTypes = resultObject.map(o => {
          return { label: `${o[0].toUpperCase()}${o.substring(1)}`, value: o };
        });
        this.setState({ datasourceTypes });
        if (datasourceTypes.length > 0) {
          this.handleDatasourceTypeChange(resultObject[0]);
        }
      });
    });
  };

  getWebsocketUrl = () => {
    getConfigList({ type: 'SAFE_ZEPPELIN_URL' }).then(response => {
      const { resultCode, resultObject } = response;
      if (resultCode === '0') {
        // this.initWebSocket('ws://172.21.69.33:8080/ws');
        this.initWebSocket(resultObject.standDisplayValue);
      }
    });
  };

  initWebSocket = socketUrl => {
    this.socket = new Websocket({
      socketUrl,
      onopen: () => {
        const ts = this;
        ts.websocketReady = true;
        const { unSendEvents } = ts;
        if (unSendEvents.length) {
          unSendEvents.forEach(event => {
            ts.socket.sendMessage(event);
          });
        }
        ts.unSendEvents = [];
        pingIntervalId = setInterval(() => {
          ts.sendNewEvent({ op: 'PING' });
        }, 10000);
      },
      onclose: () => {
        clearPingInterval();
      },
      onmessage: event => {
        this.onSocketMessage(event);
      },
    });
  };

  sendNewEvent = event => {
    const {
      user: { userCode, userId },
    } = this.props;
    event.principal = 'anonymous';
    event.ticket = 'anonymous';
    event.roles = '';
    event.referer = 'safe_sys';
    event.data = event.data || {};
    const userInfo = { staffPasswd: window.name, staffCode: userCode, sysUserId: userId };
    event.data = { ...event.data, ...userInfo };
    if (!this.websocketReady) {
      this.unSendEvents.push(event);
      return false;
    }
    return this.socket.sendMessage(event);
  };

  onSocketMessage = event => {
    if (event.data) {
      this.websocketEventsHandler.onMessage(event);
    }
  };

  dispatchSocketMessage = socketMessage => {
    const { dispatch } = this.props;
    setTimeout(() => {
      dispatch({
        type: 'dbOperation/save',
        payload: { socketMessage },
      });
    }, 10);
  };

  bindKeys = e => {
    const { dispatch } = this.props;
    const action = getShortCuts(e);
    if (!action) {
      return false;
    }
    e.preventDefault();
    dispatch({
      type: 'dbOperation/handleShortcutKeys',
      payload: {
        action,
      },
    });
  };

  toggleCollapse = key => {
    const { state } = this;
    const collapsed = state[key];
    this.setState({
      [key]: !collapsed,
    });
  };

  componentWillUnmount() {
    clearPingInterval();
    this.socket.close();
    document.removeEventListener('keydown', this.bindKeys);
  }

  onWindowTabChange = activeWindowKey => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        activeWindowKey,
      },
    });
  };

  handleDatasourceTypeChange = datasourceType => {
    this.setState({ searchKeyword: '' });
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: { datasourceType, selectedTreeNode: null },
    });
    this.getDatabases(datasourceType, '', () => {
      // 切换数据源类型时，清空sql tab
      dispatch({
        type: 'dbOperation/initSqlTabs',
      });
    });
  };

  // datasourceDetail
  getDatabases = (type, keyword = '', callback) => {
    const {
      dbOperation: { datasourceType },
    } = this.props;
    const { dispatch } = this.props;
    if (!type) {
      type = datasourceType;
    }
    const payload = { type, keyword, filterAllow: true };
    dispatch({
      type: 'dbOperation/getDatabases',
      payload,
      callback,
    });
  };

  checkCanSearch = () => {
    const {
      dbOperation: { selectedTreeNode },
    } = this.props;
    return (
      !selectedTreeNode ||
      [
        ROOT_NAME,
        TABLES_ROOT_NAME,
        FUNCTIONS_ROOT_NAME,
        VIEWS_ROOT_NAME,
        TREE_NODE_TYPE_TABLE,
        TREE_NODE_TYPE_VIEW,
      ].includes(selectedTreeNode.treeNodeType)
    );
  };

  handleSearch = () => {
    const { searchKeyword } = this.state;
    const {
      dbOperation: { selectedTreeNode },
    } = this.props;
    if (!this.checkCanSearch()) {
      return false;
    }
    if (!selectedTreeNode || selectedTreeNode.key === ROOT_NAME) {
      this.getDatabases(null, searchKeyword);
      return false;
    }
    this.searchByTreeNode(selectedTreeNode);
  };

  searchByTreeNode = selectedTreeNode => {
    const { searchKeyword } = this.state;
    const {
      dbOperation: { treeData, expandedTreeKeys },
      dispatch,
    } = this.props;
    this.setState({ loading: true });
    loadChildren(selectedTreeNode, searchKeyword, data => {
      this.setState({ loading: false });
      const { key } = selectedTreeNode;
      const treeNode = findTreeNodeInTreeData(key, treeData);
      if (treeNode) {
        treeNode.children = data;
        const newExpandedTreeKeys = [...expandedTreeKeys];
        if (!newExpandedTreeKeys.includes(key)) {
          newExpandedTreeKeys.push(key);
        }
        dispatch({
          type: 'dbOperation/save',
          payload: {
            treeData,
            treeKeyMark: getRandomMark(),
            expandedTreeKeys: newExpandedTreeKeys,
          },
        });
      }
    });
  };

  getSearchPlaceholder = () => {
    if (!this.checkCanSearch()) {
      return '';
    }
    const {
      dbOperation: { selectedTreeNode },
    } = this.props;
    if (!selectedTreeNode) {
      return formatMessage({ id: 'SEARCH_DATABASE' });
    }
    const { treeNodeType, code } = selectedTreeNode;
    if (treeNodeType === ROOT_NAME) {
      return formatMessage({ id: 'SEARCH_DATABASE' });
    }
    if (
      treeNodeType === TABLES_ROOT_NAME ||
      treeNodeType === VIEWS_ROOT_NAME ||
      treeNodeType === FUNCTIONS_ROOT_NAME
    ) {
      const {
        dbOperation: { treeData },
      } = this.props;
      const { parentKey } = selectedTreeNode;
      const databaseNode = findTreeNodeInTreeData(parentKey, treeData);
      const { datasourceName } = databaseNode;
      if (checkLanguageIsEnglish()) {
        const name =
          treeNodeType === TABLES_ROOT_NAME
            ? 'tables'
            : treeNodeType === VIEWS_ROOT_NAME
            ? 'views'
            : 'functions(procedures)';
        return `search ${name} of ${datasourceName}`;
      }
      const name =
        treeNodeType === TABLES_ROOT_NAME
          ? '表'
          : treeNodeType === VIEWS_ROOT_NAME
          ? '视图'
          : '函数(存储过程)';
      return `搜索${datasourceName}的${name}`;
    }
    if (checkLanguageIsEnglish()) {
      return `search columns of ${code}`;
    }
    return `搜索${code}的字段`;
  };

  reloadTreeData = () => {
    this.setState({ searchKeyword: '' });
    const {
      dbOperation: { datasourceType },
    } = this.props;
    if (!datasourceType) {
      return false;
    }
    this.getDatabases(datasourceType);
  };

  handleLoading = loading => {
    this.setState({ loading });
  };

  handleSaveTableSuccess = event => {
    const { datasourceId } = event;
    if (!datasourceId) {
      return false;
    }
    const {
      dbOperation: { treeData },
    } = this.props;
    const datasourceNode = findTreeNodeInTreeData(`${datasourceId}`, treeData);
    if (datasourceNode) {
      const { children = [] } = datasourceNode;
      const tableRootNode = children.find(o => o.treeNodeType === TABLES_ROOT_NAME);
      if (tableRootNode) {
        this.searchByTreeNode(tableRootNode);
      }
    }
  };

  render() {
    const {
      collapsed,
      datasourceTypes,
      searchKeyword,
      loading,
      getDatasourceTypeLoading,
    } = this.state;
    const {
      effectLoading,
      dbOperation: { activeWindowKey, datasourceType },
    } = this.props;
    const dataObjSelectTitleHeight = 42;
    const dataObjSelectItemHeight = 53;
    const headerHeight = 0;
    const treeHeight =
      window.innerHeight -
      headerHeight -
      dataObjSelectTitleHeight -
      dataObjSelectItemHeight * 2 -
      20;
    const searchPlaceholder = this.getSearchPlaceholder();
    return (
      <Spin spinning={effectLoading || loading} wrapperClassName="full-height-spin">
        <Layout className="smartsafeCon full-height">
          <Sider
            className={`${styles.databaseOperationSider} ${
              collapsed ? styles.databaseOperationSiderCollapsed : ''
            }`}
            trigger={null}
            collapsible
            collapsed={collapsed}
          >
            <div
              style={{ height: dataObjSelectTitleHeight }}
              className={`${styles.flex} ${styles.spaceBetween} ${styles.padding10}`}
            >
              {!collapsed && (
                <span style={{ fontSize: 15 }}>{formatMessage({ id: 'DATA_OBJ_SELECT' })}</span>
              )}
              <Icon
                className="trigger"
                style={{ fontSize: 18 }}
                type={collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={() => this.toggleCollapse('collapsed')}
              />
            </div>
            <div style={{ display: collapsed ? 'none' : 'block' }}>
              <div
                className={styles.dataObjectSelection}
                style={{ height: dataObjSelectItemHeight }}
              >
                <Select
                  className={styles.borderedSelect}
                  value={datasourceType}
                  loading={getDatasourceTypeLoading}
                  onChange={this.handleDatasourceTypeChange}
                >
                  {datasourceTypes.map(o => (
                    <Select.Option value={o.value} key={o.value}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div
                className={styles.dataObjectSelection}
                style={{ height: dataObjSelectItemHeight }}
              >
                <div className={styles.flex}>
                  <Input.Search
                    disabled={!this.checkCanSearch()}
                    value={searchKeyword}
                    placeholder={searchPlaceholder}
                    title={searchPlaceholder}
                    className={styles.borderedSearch}
                    enterButton={<MyIcon type="iconsearch" />}
                    onSearch={this.handleSearch}
                    onChange={e => {
                      this.setState({ searchKeyword: e.target.value });
                    }}
                  />
                  <Icon
                    type="reload"
                    className={styles.ml10}
                    style={{ fontSize: 18, cursor: 'pointer' }}
                    onClick={this.reloadTreeData}
                  />
                </div>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.09)',
                  padding: '0 5px',
                  position: 'relative',
                }}
              >
                <DatabaseTree
                  height={treeHeight}
                  handleLoading={this.handleLoading}
                  reloadTreeData={this.reloadTreeData}
                />
              </div>
            </div>
          </Sider>
          <Layout className={styles.databaseOperationWorkspace}>
            <Tabs
              className={styles.databaseOperationTabs}
              activeKey={activeWindowKey}
              onChange={this.onWindowTabChange}
            >
              <TabPane tab={formatMessage({ id: 'SQL_WINDOW' })} key={SQL_WINDOW_KEY}>
                <SQLWindow sendWebsocketMsg={this.sendNewEvent} />
              </TabPane>
              <TabPane tab={formatMessage({ id: 'TABLE_WINDOW' })} key={TABLE_WINDOW_KEY}>
                <TableWindow handleLoading={this.handleLoading} />
              </TabPane>
              <TabPane tab={formatMessage({ id: 'PROGRAM_WINDOW' })} key={PROGRAM_WINDOW_KEY}>
                <ProgramWindow sendWebsocketMsg={this.sendNewEvent} />
              </TabPane>
            </Tabs>
          </Layout>
        </Layout>
      </Spin>
    );
  }
}

export default DatabaseOperation;
