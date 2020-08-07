import React from 'react';
import { Spin, Empty } from 'antd';
import classNames from 'classnames';
import Tree from '@/components/Tree';
import { Resizable } from 're-resizable';
import { formatMessage } from 'umi/locale';
import isUndefined from 'lodash/isUndefined';
import Search from '@/components/Search';
import Pagination from '@/components/Pagination';
import { getSensitiveTablesByDatasource } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import {
  getGroupList,
  getGroupDatasourceList,
} from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';
import {
  randomWord,
  getPlaceholder,
  defaultHandleResponse,
  getCommonPagedResponse,
} from '@/utils/utils';
import styles from './index.less';

class GroupTableSelector extends React.Component {
  constructor(props) {
    super(props);
    this.searchTableCode = '';
    const { treeData } = props;
    this.treeDataFromProps = !isUndefined(treeData);
    this.state = {
      treeData: this.treeDataFromProps ? treeData : [],
      pageInfo: {},
      tableList: [],
      treeMark: null,
      treeLoading: false,
      bottomHeight: '60%',
      selectedTable: {},
      tableListLoading: false,
      selectedDatasource: {},
    };
  }

  componentDidMount() {
    const { treeData } = this.props;
    if (isUndefined(treeData)) {
      this.getGroupsTree();
    }
  }

  static getDerivedStateFromProps(props, preState) {
    const { treeData } = props;
    if (!isUndefined(treeData) && !preState.treeData.length) {
      return { treeData };
    }
    return null;
  }

  getGroupsTree = () => {
    this.setState({ treeLoading: true });
    getGroupList().then(response => {
      this.setState({ treeLoading: false });
      defaultHandleResponse(response, resultObject => {
        const treeData = (resultObject || []).map(o => ({
          ...o,
          title: o.groupName,
          key: `${o.groupId}`,
        }));
        this.setState({ treeData, treeMark: randomWord(false, 8) });
      });
    });
  };

  handleSelectTreeNode = (selectedKeys, { node }) => {
    const {
      props: { dataRef },
    } = node;
    const { key } = dataRef;
    const { selectedDatasource } = this.state;
    const { onSelectDatasource } = this.props;
    if (selectedDatasource.key !== key) {
      if (onSelectDatasource) {
        onSelectDatasource(dataRef);
      }
      this.setState({ selectedDatasource: { ...dataRef }, selectedTable: {} }, () => {
        this.handleReloadTableList();
      });
    }
  };

  loadAsyncTreeData = (treeNode, callback) => {
    if (this.treeDataFromProps) {
      callback([]);
      return false;
    }
    const { groupId } = treeNode;
    const payload = { groupId, pageIndex: 1, pageSize: 999999999 };
    getGroupDatasourceList(payload).then(response => {
      const { list } = getCommonPagedResponse(response);
      callback(
        list
          ? list.map(o => ({
              ...o,
              groupId,
              isLeaf: true,
              key: `${o.detailId}`,
              title: o.dataSourcesCode || '',
            }))
          : []
      );
    });
  };

  handleReloadTableList = () => {
    const {
      pageInfo: { pageSize },
    } = this.state;
    this.getTableData(1, pageSize);
  };

  getTableData = (pageIndex = 1, pageSize = 10) => {
    const {
      datasourceCodeKey = 'dataSourcesCode',
      datasourceIdKey = 'datasourcesId',
      isGetAllTable,
    } = this.props;
    const { pageInfo: oldPageInfo, selectedDatasource } = this.state;
    const { groupId } = selectedDatasource;
    const datasourceId = selectedDatasource[datasourceIdKey];
    if (!datasourceId) {
      const newPageInfo = { ...oldPageInfo, pageSize };
      this.setState({ pageInfo: newPageInfo });
      return false;
    }
    const payload = { pageIndex, pageSize, groupId, datasourceId, tableCode: this.searchTableCode };
    this.setState({ tableListLoading: true });
    getSensitiveTablesByDatasource(payload, isGetAllTable).then(response => {
      this.setState({ tableListLoading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        const tableList = list.map(o => {
          const ori = { ...o };
          ori.datasourceCode = selectedDatasource[datasourceCodeKey];
          return ori;
        });
        this.setState({ tableList, pageInfo });
      }
    });
  };

  handleResize = () => {
    const { upperRef } = this;
    if (upperRef) {
      const {
        size: { height = 0 },
      } = upperRef;
      this.setState({ bottomHeight: `calc(100% - ${height}px)` });
    }
  };

  handleSelectTable = item => {
    const { onSelectTable } = this.props;
    if (onSelectTable) {
      onSelectTable(item);
    }
    this.setState({ selectedTable: { ...item } });
  };

  render() {
    const {
      treeData,
      treeMark,
      tableList,
      pageInfo,
      treeLoading,
      bottomHeight,
      tableListLoading,
      selectedTable,
    } = this.state;
    const { tableListLoading: tableListLoadingProps = false } = this.props;
    const rowKey = 'tableId';
    return (
      <div className={styles.groupTableSelector}>
        <Resizable
          minHeight={80}
          bounds="parent"
          className={styles.resizable}
          maxHeight="calc(100% - 100px)"
          onResize={this.handleResize}
          ref={ref => {
            this.upperRef = ref;
          }}
          defaultSize={{ width: '100%', height: '40%' }}
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <Spin wrapperClassName="full-height-spin" spinning={treeLoading}>
            <div className={styles.selectGroupTip}>
              {formatMessage({
                id: 'storage.encrypt.selectDatasource',
                defaultMessage: '请选择数据源',
              })}
            </div>
            <div
              className={classNames(
                styles.tree,
                selectedTable[rowKey] ? styles.hasSelectedTable : ''
              )}
            >
              <Tree
                size="large"
                showIcon={false}
                treeData={treeData}
                treeMark={treeMark}
                onSelect={this.handleSelectTreeNode}
                loadAsyncData={this.loadAsyncTreeData.bind(this)}
                shouldUpdateProps={['treeMark']}
              />
            </div>
          </Spin>
        </Resizable>
        <div className={styles.bottom} style={{ height: bottomHeight }}>
          <div className={styles.bottomSearch}>
            <Search
              size="small"
              onSearch={val => {
                this.searchTableCode = val;
                this.handleReloadTableList();
              }}
              placeholder={getPlaceholder(
                formatMessage({ id: 'TABLE_CODE', defaultMessage: '表编码' })
              )}
            />
          </div>
          <div className={styles.tableBox}>
            <div className={styles.tableList}>
              <Spin
                wrapperClassName="full-height-spin"
                spinning={tableListLoading || tableListLoadingProps}
              >
                {tableList.length ? (
                  tableList.map(o => (
                    <div
                      key={o[rowKey]}
                      onClick={() => this.handleSelectTable(o)}
                      className={classNames(styles.tableListItem, 'ellipsis', {
                        [styles.activeTableListItem]: `${selectedTable[rowKey]}` === `${o[rowKey]}`,
                      })}
                    >
                      {o.tableCode}
                    </div>
                  ))
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Spin>
            </div>
            <Pagination
              showBorderTop={false}
              pagination={{
                ...pageInfo,
                showTotal: () => null,
                simple: true,
                onChange: this.getTableData,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default GroupTableSelector;
