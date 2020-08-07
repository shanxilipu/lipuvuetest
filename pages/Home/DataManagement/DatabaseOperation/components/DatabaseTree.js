import React, { Component } from 'react';
import { connect } from 'dva';
import isEqual from 'lodash/isEqual';
import { formatMessage } from 'umi/locale';
import { Icon, Tree, Modal, message } from 'antd';
import MyIcon from '@/components/MyIcon';
import styles from '../DatabaseOperation.less';
import {
  FIELD_TAB_COLUMNS,
  FUNCTIONS_ROOT_NAME,
  ROOT_NAME,
  TABLES_ROOT_NAME,
  VIEWS_ROOT_NAME,
  MENU_QUERY,
  MENU_NEW,
  MENU_REFRESH,
  MENU_EDIT,
  TABLE_WINDOW_KEY,
  MENU_CHECK,
  MENU_PROPERTIES,
  MENU_DELETE,
  MENU_RENAME,
  MENU_NEW_WINDOW,
  PROGRAM_WINDOW_KEY,
  TREE_NODE_TYPE_DATASOURCE,
  TREE_NODE_TYPE_TABLE,
  TREE_NODE_TYPE_FUNCTION,
  TREE_NODE_TYPE_VIEW,
  TREE_NODE_TYPE_FIELD,
  ORACLE_DATASOURCE_TYPE,
} from '../constant';
import RightClickMenus from './RightClickMenus';
import PropertyModal from './PropertyModal';
import RenameModal from './RenameModal';
import { deleteTable, renameTable, getSqlContent, deleteFunOrPro } from '../services';
import {
  getRandomMark,
  isMysqlOrOracleTable,
  getComponentType,
  findTreeNodeInTreeData,
} from '../tools/utils';
import { loadChildren, getFields } from '../tools/databaseUtil';
import { defaultHandleResponse } from '@/utils/utils';

const { TreeNode } = Tree;

const _initState = {
  rightMenuVisible: false,
  propertyModalVisible: false,
  showRenameModal: false,
  renameLoading: false,
};

const _initReduxPropsKeys = [
  'datasourceType',
  'treeData',
  'currentTableInfo',
  'selectedTreeNode',
  'treeKeyMark',
  'expandedTreeKeys',
];

const getInitReduxProps = dbOperation => {
  const props = {};
  _initReduxPropsKeys.forEach(key => {
    props[key] = dbOperation[key];
  });
  return props;
};

@connect(({ dbOperation }) => getInitReduxProps(dbOperation))
class DatabaseTree extends Component {
  constructor(props) {
    super(props);
    this.lastClickTreeNodeTime = 0;
    this.lastClickTreeNodeKey = '';
    this.clickedTreeNode = null;
    this.renameTreeNodeProps = {};
    this.state = {
      ..._initState,
    };
  }

  propertyModalProps = { fields: [], columns: [], schemaType: '' };

  componentDidMount() {
    document.addEventListener('click', this.bindCancelRightMenu);
    document.addEventListener('keydown', this.bindKeyDown);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisState = this.state;
    const stateKeys = Object.keys(nextState);
    let bool = false;
    stateKeys.forEach(key => {
      const _thisItem = thisState[key];
      const _nextItem = nextState[key];
      if (!isEqual(_thisItem, _nextItem)) {
        bool = true;
      }
    });
    if (bool) {
      return true;
    }
    const thisProps = this.props;
    _initReduxPropsKeys.forEach(key => {
      const _thisItem = thisProps[key];
      const _nextItem = nextProps[key];
      if (!isEqual(_thisItem, _nextItem)) {
        bool = true;
      }
    });
    return bool;
  }

  componentDidUpdate(prevProps) {
    const { datasourceType, dispatch } = this.props;
    const { datasourceType: preDatasourceType } = prevProps;
    if (datasourceType !== preDatasourceType) {
      dispatch({
        type: 'dbOperation/save',
        payload: { expandedTreeKeys: [ROOT_NAME] },
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.bindCancelRightMenu);
    document.removeEventListener('keydown', this.bindKeyDown);
  }

  bindCancelRightMenu = () => {
    this.clickedTreeNode = null;
    this.setState({ rightMenuVisible: false });
  };

  bindKeyDown = e => {
    const { key, ctrlKey, altKey, metaKey } = e;
    if (!key) return;
    if (key.toLowerCase() === 'c' && !altKey && (ctrlKey || metaKey) && this.clickedTreeNode) {
      const inputElem = document.createElement('input');
      const { treeNodeType, code, datasourceName } = this.clickedTreeNode;
      if (
        ![ROOT_NAME, TABLES_ROOT_NAME, VIEWS_ROOT_NAME, FUNCTIONS_ROOT_NAME].includes(treeNodeType)
      ) {
        let value = code;
        if (treeNodeType === TREE_NODE_TYPE_DATASOURCE) {
          value = datasourceName;
        }
        inputElem.setAttribute('value', value);
        inputElem.setAttribute('readonly', 'readonly');
        document.body.appendChild(inputElem);
        inputElem.select();
        if (document.execCommand) {
          document.execCommand('Copy');
        }
        document.body.removeChild(inputElem);
      }
    }
  };

  getTreeNodeIcon = node => {
    const { dataRef } = node;
    const { treeNodeType } = dataRef;
    const type = {
      [TREE_NODE_TYPE_DATASOURCE]: 'iconschema-folder',
      [TABLES_ROOT_NAME]: 'icontable-folder',
      [TREE_NODE_TYPE_TABLE]: 'iconbiaogex',
      [TREE_NODE_TYPE_FIELD]: 'iconziduanguanli',
      [VIEWS_ROOT_NAME]: 'iconview-folder',
      [TREE_NODE_TYPE_VIEW]: 'iconshujujix',
      [FUNCTIONS_ROOT_NAME]: 'iconprocedure-folder',
      [TREE_NODE_TYPE_FUNCTION]: 'iconstored-procedure',
    }[treeNodeType];
    if (type) {
      return <MyIcon type={type} />;
    }
    return null;
  };

  getDatasourceDetailTreeNodes = treeData =>
    treeData.map(item => {
      const props = {
        key: `${item.key}`,
        icon: node => this.getTreeNodeIcon(node),
        dataRef: item,
        title: item.title,
        isLeaf: item.isLeaf,
      };
      if (item.children) {
        return <TreeNode {...props}>{this.getDatasourceDetailTreeNodes(item.children)}</TreeNode>;
      }
      return <TreeNode {...props} />;
    });

  loadTreeData = treeNode =>
    new Promise(resolve => {
      const {
        props: { children, dataRef },
      } = treeNode;
      if (children && children.length) {
        resolve();
        return false;
      }
      const { treeNodeType } = dataRef;
      if (treeNodeType === ROOT_NAME) {
        resolve();
        return false;
      }
      this.reloadTreeNodeChildren(treeNode).then(() => resolve());
    });

  reloadTreeNodeChildren = treeNode =>
    new Promise(resolve => {
      const { dispatch } = this.props;
      const {
        props: { dataRef },
      } = treeNode;
      const done = data => {
        if (data.length) {
          treeNode.props.dataRef.children = data;
          dispatch({
            type: 'dbOperation/save',
            payload: { treeKeyMark: getRandomMark() },
          });
        }
        resolve();
      };
      loadChildren(dataRef, '', done);
    });

  onExpand = expandedTreeKeys => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: { expandedTreeKeys },
    });
  };

  getTreeNodeProps = item => {
    const { datasourceType, treeData } = this.props;
    const { treeNodeType, datasourceId } = item;
    if (treeNodeType === ROOT_NAME) {
      return { ...item };
    }
    const database = treeData.find(o => o.datasourceId === datasourceId);
    const { datasourceName, schemaId } = database;
    return {
      ...item,
      datasourceName,
      schemaId: parseInt(schemaId, 10) || null,
      schemaType: datasourceType,
      componentId: datasourceId,
    };
  };

  onSelectTreeNode = (selectedKeys, { node }) => {
    const now = new Date().getTime();
    const {
      props: { dataRef },
    } = node; // 这里的eventKey就是节点的key
    const { dispatch } = this.props;
    const { key } = dataRef;
    const nodeProps = this.getTreeNodeProps(dataRef);
    if (now - this.lastClickTreeNodeTime < 200 && this.lastClickTreeNodeKey === key) {
      // 双击判断
      const { treeNodeType } = nodeProps;
      if (treeNodeType === TREE_NODE_TYPE_TABLE) {
        dispatch({
          type: 'dbOperation/newSqlEditTab',
          payload: { newTab: nodeProps },
        });
      } else if ([TREE_NODE_TYPE_TABLE, TREE_NODE_TYPE_FUNCTION].includes(treeNodeType)) {
        this.checkSqlContent(nodeProps, false);
      }
    }
    this.lastClickTreeNodeTime = now;
    this.lastClickTreeNodeKey = key;
    dispatch({
      type: 'dbOperation/save',
      payload: { selectedTreeNode: { ...nodeProps } },
    });
    setTimeout(() => {
      this.clickedTreeNode = { ...nodeProps };
    }, 10);
  };

  onClickRightMenu = (treeNode, menuName) => {
    const {
      props: { dataRef },
    } = treeNode;
    const nodeProps = this.getTreeNodeProps(dataRef);
    const { treeNodeType } = nodeProps;
    switch (menuName) {
      case MENU_NEW_WINDOW:
      case MENU_QUERY: // 查询数据
        this.doQuery(treeNode);
        break;
      case MENU_REFRESH: // 刷新
        this.handleRefresh(treeNode);
        break;
      case MENU_NEW: // 新建
        if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TABLES_ROOT_NAME) {
          this.editTable(nodeProps, true, false);
        } else {
          this.handleNewProgram(nodeProps);
        }
        break;
      case MENU_EDIT: // 编辑
      case MENU_CHECK: {
        // 查看
        if (treeNodeType === TREE_NODE_TYPE_TABLE) {
          this.editTable(nodeProps, false, menuName === MENU_CHECK);
        } else if ([TREE_NODE_TYPE_VIEW, TREE_NODE_TYPE_FUNCTION].includes(treeNodeType)) {
          this.checkSqlContent(nodeProps, menuName === MENU_CHECK);
        }
        break;
      }
      case MENU_PROPERTIES: // 属性
        if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TREE_NODE_TYPE_VIEW) {
          this.showPropertyModal(nodeProps);
        }
        break;
      case MENU_DELETE: // 删除
        if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TREE_NODE_TYPE_VIEW) {
          this.deleteTable(nodeProps);
        } else if (treeNodeType === TREE_NODE_TYPE_FUNCTION) {
          this.deleteFuncOrProcedure(nodeProps);
        }
        break;
      case MENU_RENAME:
        this.renameTreeNodeProps = { ...nodeProps };
        this.setState({ showRenameModal: true });
        break;
      default:
        return null;
    }
  };

  handleNewProgram = nodeProps => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: {
        activeWindowKey: PROGRAM_WINDOW_KEY,
        programWindowEditorComponentId: nodeProps.componentId,
        sqlContent: {
          sql: '',
          readOnly: false,
          editorWindowId: PROGRAM_WINDOW_KEY,
          replace: true,
        },
      },
    });
  };

  onRightClickTreeNode = ({ event, node }) => {
    const { clientX: x, clientY: y } = event;
    const {
      props: { dataRef },
    } = node;
    const { treeNodeType } = dataRef;
    if (treeNodeType === TREE_NODE_TYPE_FIELD) {
      return false;
    }
    this.rightClickMenusProps = { treeNode: node, x, y, onMenuClick: this.onClickRightMenu };
    const { dispatch } = this.props;
    dispatch({
      type: 'dbOperation/save',
      payload: { selectedTreeNode: { ...dataRef } },
    });
    this.setState({ rightMenuVisible: true });
  };

  doQuery = treeNode => {
    const {
      props: { dataRef },
    } = treeNode;
    const { treeNodeType, children = [] } = dataRef;
    const nodeProps = this.getTreeNodeProps(dataRef);
    const { dispatch } = this.props;
    const params = { ...nodeProps };
    const doDispatchNewTab = newTab => {
      dispatch({
        type: 'dbOperation/newSqlEditTab',
        payload: { newTab },
      });
    };
    if (treeNodeType === TREE_NODE_TYPE_TABLE) {
      const { code, datasourceName, schemaType } = nodeProps;
      const doQueryTable = (fields = []) => {
        params.defaultSqlText = `select ${fields
          .map(o => o.code)
          .join(',')} from ${datasourceName}.${code}${
          schemaType !== ORACLE_DATASOURCE_TYPE ? ' limit 1000' : ' where rownum <= 1000'
        }`;
        params.autoRun = fields.length > 0;
        doDispatchNewTab(params);
      };
      if (children && children.length) {
        doQueryTable(children);
      } else {
        getFields(dataRef).then(o => doQueryTable(o));
      }
    } else {
      doDispatchNewTab(params);
    }
  };

  handleRefresh = treeNode => {
    this.reloadTreeNodeChildren(treeNode).then(() => {});
  };

  editTable = (nodeProps, isNew, readOnly) => {
    const { treeNodeType } = nodeProps;
    if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TABLES_ROOT_NAME) {
      const { dispatch } = this.props;
      const { schemaId, tableId, schemaType, componentId } = nodeProps;
      dispatch({
        type: 'dbOperation/save',
        payload: {
          activeWindowKey: TABLE_WINDOW_KEY,
          currentTableInfo: {
            schemaId,
            componentId,
            schemaType,
            datasourceType: schemaType,
            tableId: isNew ? null : tableId,
            readOnly,
          },
          currentTableMark: getRandomMark(),
        },
      });
    }
  };

  checkSqlContent = (nodeProps, readOnly) => {
    const { componentId: datasourceId, code, treeNodeType } = nodeProps;
    const { handleLoading } = this.props;
    const params = { datasourceId, code, type: treeNodeType.toUpperCase() };
    handleLoading(true);
    getSqlContent(params).then(response => {
      handleLoading(false);
      defaultHandleResponse(response, (resultObject = '') => {
        const { dispatch } = this.props;
        dispatch({
          type: 'dbOperation/save',
          payload: {
            activeWindowKey: PROGRAM_WINDOW_KEY,
            programWindowEditorComponentId: datasourceId,
            sqlContent: {
              sql: resultObject,
              readOnly,
              editorWindowId: PROGRAM_WINDOW_KEY,
              replace: true,
            },
          },
        });
      });
    });
  };

  /**
   * 操作接口成功后，前端删除树节点，不再次请求接口
   * @param nodeProps
   * @returns {boolean}
   */
  deleteTreeNode = nodeProps => {
    const { treeData, dispatch } = this.props;
    const { parentKey, key } = nodeProps;
    const parentNode = findTreeNodeInTreeData(parentKey, treeData);
    const index = parentNode.children.findIndex(o => o.key === key);
    if (index > -1) {
      parentNode.children.splice(index, 1);
      dispatch({
        type: 'dbOperation/save',
        payload: { treeData, treeKeyMark: getRandomMark() },
      });
    }
  };

  deleteTable = nodeProps => {
    Modal.confirm({
      title: formatMessage({ id: 'COMMON_CONFIRM' }),
      content: formatMessage({
        id: `CONFIRM_DELETE_${nodeProps.treeNodeType === TREE_NODE_TYPE_TABLE ? 'TABLE' : 'VIEW'}`,
      }),
      okText: formatMessage({ id: 'COMMON_OK' }),
      cancelText: formatMessage({ id: 'COMMON_CANCEL' }),
      onOk: () => {
        const { schemaType, componentId, id } = nodeProps;
        let params = { componentId };
        if (isMysqlOrOracleTable(schemaType)) {
          const tmp = {
            tableIds: [id],
            dbType: getComponentType(schemaType),
            deleteType: 'physical',
          };
          params = { ...params, ...tmp };
        } else {
          params.metaTableIds = [id];
        }
        const { handleLoading } = this.props; // 删除表需要全局loading 调用父页面方法
        handleLoading(true);
        deleteTable(params, schemaType).then(response => {
          handleLoading(false);
          defaultHandleResponse(response, () => {
            this.deleteTreeNode(nodeProps);
            const { currentTableInfo, dispatch } = this.props;
            // 如果删除的是当前打开的表，则清空信息
            if (
              currentTableInfo &&
              schemaType === currentTableInfo.schemaType &&
              id === currentTableInfo.tableId
            ) {
              dispatch({
                type: 'dbOperation/save',
                payload: {
                  currentTableInfo: null,
                  currentTableMark: getRandomMark(),
                },
              });
            }
            message.success(formatMessage({ id: 'DELETE_SUCCESS' }));
          });
        });
      },
    });
  };

  deleteFuncOrProcedure = nodeProps => {
    Modal.confirm({
      title: formatMessage({ id: 'COMMON_CONFIRM' }),
      content: formatMessage({
        id: `CONFIRM_DELETE_${nodeProps.type}`,
      }),
      okText: formatMessage({ id: 'COMMON_OK' }),
      cancelText: formatMessage({ id: 'COMMON_CANCEL' }),
      onOk: () => {
        const { treeNodeType, name, componentId, schemaId } = nodeProps;
        const { datasourceType, handleLoading } = this.props;
        const params = { name, componentId, deleteType: treeNodeType.toUpperCase() };
        if (isMysqlOrOracleTable(datasourceType)) {
          params.dbType = getComponentType(datasourceType);
        } else {
          params.schemaId = schemaId;
        }
        handleLoading(true);
        deleteFunOrPro(params, datasourceType).then(response => {
          handleLoading(false);
          defaultHandleResponse(response, () => {
            this.deleteTreeNode(nodeProps);
            message.success(formatMessage({ id: 'DELETE_SUCCESS' }));
          });
        });
      },
    });
  };

  closeRenameModal = () => {
    this.renameTreeNodeProps = {};
    this.setState({ showRenameModal: false });
  };

  /**
   * 操作接口成功后，前端修改树节点名字
   * @param newName 新的名字
   * @returns {boolean}
   */
  renameTreeNode = newName => {
    const { treeData, dispatch } = this.props;
    const { key } = this.renameTreeNodeProps;
    const treeNode = findTreeNodeInTreeData(key, treeData);
    treeNode.title = newName;
    dispatch({
      type: 'dbOperation/save',
      payload: { treeData, treeKeyMark: getRandomMark() },
    });
  };

  renameTable = newCode => {
    const { id, schemaType, componentId } = this.renameTreeNodeProps;
    let params = {};
    if (isMysqlOrOracleTable(schemaType)) {
      params = {
        dbInfo: { dbType: getComponentType(schemaType), componentId },
        tableInfo: { id, code: newCode, componentId },
      };
    } else {
      params = { componentId, metaTableId: id, tableCode: newCode };
    }
    this.setState({ renameLoading: true });
    renameTable(params, schemaType).then(response => {
      this.setState({ renameLoading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'COMMON_COMMAND_SUCCESS' }));
        this.renameTreeNode(newCode);
        this.closeRenameModal();
      });
    });
  };

  showPropertyModal = nodeProps => {
    const { id, schemaType } = nodeProps;
    this.propertyModalProps = {
      columns: FIELD_TAB_COLUMNS.slice(),
      schemaType,
      tableId: id,
    };
    this.setState({ propertyModalVisible: true });
  };

  render() {
    const { rightMenuVisible, propertyModalVisible, showRenameModal, renameLoading } = this.state;
    const { height, treeData, selectedTreeNode, expandedTreeKeys } = this.props;
    const selectedTreeKeys = [];
    if (selectedTreeNode) {
      selectedTreeKeys.push(selectedTreeNode.key);
    }
    return (
      <div className={styles.indexTreeBox} style={{ height }}>
        {rightMenuVisible && <RightClickMenus {...this.rightClickMenusProps} />}
        <RenameModal
          visible={showRenameModal}
          onCancel={this.closeRenameModal}
          confirmLoading={renameLoading}
          onOk={this.renameTable}
          renameLabel={formatMessage({ id: 'TABLE_CODE' })}
          initialValue={this.renameTreeNodeProps.code}
        />
        <PropertyModal
          {...this.propertyModalProps}
          visible={propertyModalVisible}
          onCancel={() => this.setState({ propertyModalVisible: false })}
        />
        <Tree
          showIcon
          blockNode
          className={styles.indexTree}
          switcherIcon={<Icon type="down" />}
          onSelect={this.onSelectTreeNode}
          selectedKeys={selectedTreeKeys}
          onRightClick={this.onRightClickTreeNode}
          expandedKeys={expandedTreeKeys}
          onExpand={this.onExpand}
          loadData={this.loadTreeData}
        >
          <TreeNode
            title={formatMessage({ id: 'DATASOURCE' })}
            key={ROOT_NAME}
            dataRef={{ treeNodeType: ROOT_NAME, key: ROOT_NAME }}
            className={styles.rootTreeNode}
            icon={null}
          >
            {this.getDatasourceDetailTreeNodes(treeData)}
          </TreeNode>
        </Tree>
      </div>
    );
  }
}
export default DatabaseTree;
