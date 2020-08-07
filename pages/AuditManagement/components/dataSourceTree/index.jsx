import React, { Component } from 'react';
import { Tree, Icon, Input, Spin, message } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import MyIcon from '@/components/MyIcon';
import { randomWord, defaultHandleResponse } from '@/utils/utils';
import {
  getDatabases,
  getTablesOrViews,
  getFunctionsOrProcedures,
  getFields,
  getDatasourceTypes,
} from './service';
import styles from './index.less';

const { TreeNode } = Tree;

const ROOT_NAME = 'root';
const TREE_NODE_TYPE_DATASOURCE = 'datasource';
const TABLES_ROOT_NAME = 'tablesRoot';
const TREE_NODE_TYPE_TABLE = 'table';
const TREE_NODE_TYPE_FIELD = 'field';
const VIEWS_ROOT_NAME = 'viewsRoot';
const TREE_NODE_TYPE_VIEW = 'view';
const FUNCTIONS_ROOT_NAME = 'functionsRoot';
const TREE_NODE_TYPE_FUNCTION = 'function';
const MYSQL_DATASOURCE_TYPE = 'mysql';
const ORACLE_DATASOURCE_TYPE = 'oracle';
const HIVE_DATASOURCE_TYPE = 'hive';
const GREENPLUM_DATASOURCE_TYPE = 'greenplum';

class DataSourceTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedTreeKeys: ['root'],
      treeData: [],
      allDatasourceType: [],
      loading: false,
      selectTreeNode: {},
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    getDatasourceTypes().then((result = {}) => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject = [] } = result;
      if (resultCode === '0') {
        this.setState(
          {
            allDatasourceType: resultObject,
          },
          () => {
            this.getDatabases();
          }
        );
      } else {
        message.error(resultMsg);
      }
    });
  }

  getDatabases = (payload = {}) => {
    const { allDatasourceType } = this.state;
    const { getTable, getView, getFunction } = this.props;
    const isBss = THEME === 'bss';
    this.setState({ loading: true });
    getDatabases(payload).then((result = {}) => {
      this.setState({ loading: false });
      const { resultCode, resultMsg, resultObject } = result;
      if (resultCode === '0') {
        // 这里统一改变datasourceType的值
        const datasourceTypes = [
          MYSQL_DATASOURCE_TYPE,
          ORACLE_DATASOURCE_TYPE,
          HIVE_DATASOURCE_TYPE,
          GREENPLUM_DATASOURCE_TYPE,
        ];
        const getdataSourceItem = resultObject.map(item => {
          const datasourceType = datasourceTypes.find(o => item.datasourceType.indexOf(o) > -1);
          const getTitle = isBss ? item.catalogName : item.datasourceName;
          const dataSourceItem = {
            ...item,
            key: `${item.datasourceId}`,
            title: getTitle,
            treeNodeType: TREE_NODE_TYPE_DATASOURCE,
            datasourceType,
            treeIndex: '1',
            isLeaf: !getTable && !getView && !getFunction,
            children: [],
          };
          if (getTable) {
            dataSourceItem.children.push({
              key: `itemId_${randomWord(false, 40)}`,
              parentKey: `${item.datasourceId}`,
              treeNodeType: TABLES_ROOT_NAME,
              title: formatMessage({ id: 'COMMON_TABLE' }),
              isLeaf: false,
              datasourceId: item.datasourceId,
              datasourceType,
              treeIndex: '4',
              datasourceName: getTitle,
            });
          }
          if (getView) {
            dataSourceItem.children.push({
              key: `itemId_${randomWord(false, 40)}`,
              parentKey: `${item.datasourceId}`,
              treeNodeType: VIEWS_ROOT_NAME,
              title: formatMessage({ id: 'COMMON_DB_VIEW' }),
              isLeaf: false,
              datasourceId: item.datasourceId,
              datasourceType,
              treeIndex: '4',
              datasourceName: getTitle,
            });
          }
          if (getFunction) {
            dataSourceItem.children.push({
              key: `itemId_${randomWord(false, 40)}`,
              parentKey: `${item.datasourceId}`,
              treeNodeType: FUNCTIONS_ROOT_NAME,
              title: `${formatMessage({ id: 'COMMON_FUNCTION' })}(${formatMessage({
                id: 'COMMON_PROCEDURE',
              })})`,
              isLeaf: false,
              datasourceId: item.datasourceId,
              datasourceType,
              treeIndex: '4',
              datasourceName: getTitle,
            });
          }
          return dataSourceItem;
        });

        if (isBss) {
          this.setState({ treeData: getdataSourceItem });
        } else {
          const datasourceTypeArr = {};
          allDatasourceType.forEach(item => {
            datasourceTypeArr[item] = [];
          });
          getdataSourceItem.forEach(item => {
            if (datasourceTypeArr[item.datasourceType]) {
              datasourceTypeArr[item.datasourceType].push(item);
            }
          });
          const treeData = [];
          Object.keys(datasourceTypeArr).forEach(item => {
            if (datasourceTypeArr[item] && datasourceTypeArr[item].length > 0) {
              treeData.push({
                key: `itemId_${randomWord(false, 40)}`,
                title: item,
                treeNodeType: 'catlog',
                children: datasourceTypeArr[item],
                datasourceType: item,
                treeIndex: '0',
              });
            }
          });
          this.setState({ treeData });
        }
      } else {
        message.error(resultMsg);
      }
    });
  };

  onExpand = expandedTreeKeys => {
    this.setState({
      expandedTreeKeys,
    });
  };

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

  reloadTreeNodeChildren = (treeNode, keyStr = '') =>
    new Promise(resolve => {
      const {
        props: { dataRef },
      } = treeNode;
      const { treeData } = this.state;
      const { key } = dataRef;
      const done = (data = []) => {
        // if (data.length) {
        const getTreeData = this.setChild(treeData, key, data);
        this.setState({
          treeData: getTreeData,
        });
        // }
        resolve();
      };
      this.loadChildren(dataRef, keyStr, done);
    });

  searchTreeNodeChildren = (dataRef, keyStr = '') =>
    new Promise(resolve => {
      const { treeData, expandedTreeKeys } = this.state;
      const { key } = dataRef;
      const done = (data = []) => {
        // if (data.length) {
        const getTreeData = this.setChild(treeData, key, data);
        this.setState({
          treeData: getTreeData,
        });
        if (!expandedTreeKeys.includes(key)) {
          expandedTreeKeys.push(key);
          this.setState({ expandedTreeKeys });
        }
        // }
        resolve();
      };
      this.loadChildren(dataRef, keyStr, done);
    });

  setChild = (arr, key, children) => {
    return arr.map(item => {
      if (item.key == key) {
        item.children = children;
      } else if (item.children && item.children.length > 0) {
        item.children = this.setChild(item.children, key, children);
      }
      return item;
    });
  };

  loadChildren = (item, keyword, callback) => {
    const { treeNodeType } = item;
    if (treeNodeType === TABLES_ROOT_NAME || treeNodeType === VIEWS_ROOT_NAME) {
      this.getTablesOrViews(item, keyword, treeNodeType).then(data => {
        callback(data);
      });
    } else if (treeNodeType === FUNCTIONS_ROOT_NAME) {
      this.getFunctionsOrProcedures(item, keyword).then(data => {
        callback(data);
      });
    } else if (treeNodeType === TREE_NODE_TYPE_TABLE || treeNodeType === TREE_NODE_TYPE_VIEW) {
      this.getFields(item, keyword).then(data => {
        callback(data);
      });
    }
  };

  getTablesOrViews(item, keyword, argTreeNodeType) {
    const { getTableFiled, getViewFiled } = this.props;
    let isLeaf = true;
    if (argTreeNodeType === TABLES_ROOT_NAME && getTableFiled) {
      isLeaf = false;
    }
    if (argTreeNodeType === VIEWS_ROOT_NAME && getViewFiled) {
      isLeaf = false;
    }
    return new Promise(resolve => {
      const { treeNodeType, datasourceId, key: parentKey, datasourceType, datasourceName } = item;
      const type = treeNodeType === TABLES_ROOT_NAME ? 'TABLE' : 'VIEW';
      const payload = { type, keyword, datasourceId };
      this.setState({ loading: true });
      getTablesOrViews(payload).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(
          response,
          (resultObject = []) => {
            const data = resultObject.map(o => ({
              ...o,
              key: `${datasourceId}&${o.id}`,
              title: o.code,
              treeNodeType: type === 'TABLE' ? TREE_NODE_TYPE_TABLE : TREE_NODE_TYPE_VIEW,
              datasourceId,
              datasourceName,
              parentKey,
              tableId: o.id,
              isLeaf,
              datasourceType,
              treeIndex: '2',
            }));
            resolve(data);
          },
          () => resolve([])
        );
      });
    });
  }

  getFunctionsOrProcedures = (item, keyword) => {
    return new Promise(resolve => {
      const { datasourceId, key: parentKey, datasourceType, datasourceName } = item;
      const payload = { keyword, datasourceId };
      this.setState({ loading: true });
      getFunctionsOrProcedures(payload).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(
          response,
          (resultObject = []) => {
            const data = resultObject.map(o => ({
              ...o,
              type: o.TYPE,
              name: o.NAME,
              code: o.NAME,
              key: `${datasourceId}&${o.NAME}`,
              title: o.NAME,
              treeNodeType: TREE_NODE_TYPE_FUNCTION,
              datasourceId,
              datasourceName,
              isLeaf: true,
              parentKey,
              datasourceType,
              treeIndex: '2',
            }));
            resolve(data);
          },
          () => resolve([])
        );
      });
    });
  };

  getFields = (item, keyword) => {
    return new Promise(resolve => {
      const { id, datasourceId, key: parentKey, datasourceType } = item;
      const payload = { tableId: id, keyword };
      this.setState({ loading: true });
      getFields(payload).then(response => {
        this.setState({ loading: false });
        defaultHandleResponse(
          response,
          (resultObject = []) => {
            const data = resultObject.map(o => ({
              key: `${datasourceId}&${id}&${o}`,
              code: o,
              name: o,
              title: o,
              treeNodeType: TREE_NODE_TYPE_FIELD,
              datasourceId,
              isLeaf: true,
              parentKey,
              datasourceType,
              treeIndex: '3',
            }));
            resolve(data);
          },
          () => resolve([])
        );
      });
    });
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

  getTreeNodeIcon = node => {
    const { dataRef } = node;
    const { treeNodeType } = dataRef;
    const type = {
      catlog: 'iconschema-folder',
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

  onSelectTreeNode = (selectedKeys, e) => {
    const { node } = e;
    const { onSelect } = this.props;
    const {
      props: { dataRef },
    } = node;
    this.setState({
      selectTreeNode: { ...dataRef },
    });
    if (onSelect) {
      onSelect([dataRef.key], e);
    }
  };

  getPlacehold = () => {
    const { selectTreeNode = {} } = this.state;
    const { treeIndex, treeNodeType } = selectTreeNode;
    if (treeIndex === '4') {
      let searchType = '';
      if (treeNodeType === TABLES_ROOT_NAME) {
        searchType = formatMessage({ id: 'CommonDataSourceTree.Table' });
      } else if (treeNodeType === VIEWS_ROOT_NAME) {
        searchType = formatMessage({ id: 'CommonDataSourceTree.View' });
      } else if (treeNodeType === FUNCTIONS_ROOT_NAME) {
        searchType = formatMessage({ id: 'CommonDataSourceTree.Function' });
      }
      return `${formatMessage({ id: 'CommonDataSourceTree.Search' })}${
        selectTreeNode.datasourceName
      }${formatMessage({ id: 'CommonDataSourceTree.Is' })}${searchType}`;
    }
    return formatMessage({ id: 'CommonDataSourceTree.SearchdataSource' });
  };

  render() {
    const { expandedTreeKeys, treeData, loading, selectTreeNode } = this.state;
    const {
      style = {},
      // onSelect = () => {},
      // selectedKeys = [],
      checkable,
      onCheck = () => {},
      showSearch,
      checkedKeys = [],
      showLoading,
    } = this.props;

    const selectedKeys = [];
    if (!isEmpty(selectTreeNode)) {
      selectedKeys.push(selectTreeNode.key);
    }

    const spanLoading = !!loading && !!showLoading;
    return (
      <div className={styles.dataSourceTreeCon} style={style}>
        <Spin spinning={spanLoading} wrapperClassName="full-height-spin">
          {showSearch && (
            <div className={styles.searchCon}>
              <Input.Search
                onSearch={value => {
                  const { treeIndex } = selectTreeNode;
                  if (treeIndex === '4') {
                    this.searchTreeNodeChildren(selectTreeNode, value);
                  } else {
                    this.getDatabases({ keyword: value });
                  }
                }}
                placeholder={this.getPlacehold()}
                enterButton
                allowClear
              />
            </div>
          )}

          <div className={classnames(styles.treeCon, showSearch ? styles.showSearch : '')}>
            <Tree
              showIcon
              blockNode
              switcherIcon={<Icon type="down" />}
              // onSelect={onSelect}
              onSelect={this.onSelectTreeNode}
              selectedKeys={selectedKeys}
              checkable={checkable}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
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
        </Spin>
      </div>
    );
  }
}

export default DataSourceTree;
