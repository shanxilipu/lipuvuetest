import React from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Popconfirm, message } from 'antd';
import Table from '@/components/Table';
import AddModal from './AddModal';
import MyIcon from '@/components/MyIcon';
import Search from '@/components/Search';
import {
  getGroupDatasourceList,
  deleteDatasourceFromGroup,
} from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';
import {
  getCommonPagedResponse,
  getPlaceholder,
  getPageIndexAfterDeletion,
  defaultHandleResponse,
} from '@/utils/utils';
import styles from './index.less';

class DatasourceList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
      showAddModal: false,
    };
    this.searchCode = '';
    this.columns = [
      { dataIndex: 'detailId', title: 'ID' },
      {
        dataIndex: 'dataSourcesCode',
        title: formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' }),
      },
      {
        dataIndex: 'dataSourcesIp',
        title: formatMessage({ id: 'datasource.ip.hostname', defaultMessage: '数据源IP/Hostname' }),
      },
      {
        dataIndex: 'dataSourcesPort',
        title: formatMessage({ id: 'datasource.port', defaultMessage: '数据源端口' }),
      },
      {
        dataIndex: 'dataSourcesType',
        title: formatMessage({ id: 'COMMON_TYPE', defaultMessage: '类型' }),
      },
      {
        dataIndex: 'action',
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        render: (t, record) => (
          <div className="table-action-column">
            <Popconfirm
              title={formatMessage({
                id: 'storage.encrypt.confirmDatasourceNoUse',
                defaultMessage: '确认数据源不再使用',
              })}
              onConfirm={() => this.deleteGroupedDatasource(record)}
            >
              <MyIcon type="iconshanchubeifenx" disabled={!record.canBeDelete} />
            </Popconfirm>
          </div>
        ),
      },
    ];
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    const { activeTreeNode } = this.props;
    const { activeTreeNode: preNode } = prevProps;
    if (activeTreeNode.key !== preNode.key) {
      this.getData();
    }
  }

  reload = index => {
    const {
      pageInfo: { pageIndex, pageSize },
    } = this.state;
    this.getData(index || pageIndex, pageSize);
  };

  getData = (pageIndex, pageSize) => {
    const { activeTreeNode } = this.props;
    if (!activeTreeNode.key) {
      this.setState({ list: [], pageInfo: {} });
      return false;
    }
    this.setState({ loading: true });
    getGroupDatasourceList({
      pageIndex,
      pageSize,
      groupId: activeTreeNode.key,
      dataSourcesCode: this.searchCode,
    }).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo });
      }
    });
  };

  deleteGroupedDatasource = item => {
    const { detailId, dataSourcesCode } = item;
    this.setState({ loading: true });
    deleteDatasourceFromGroup([{ detailId, dataSourcesCode }]).then(response => {
      defaultHandleResponse(
        response,
        () => {
          message.success(
            formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
          );
          const {
            list,
            pageInfo: { pageIndex },
          } = this.state;
          this.reload(getPageIndexAfterDeletion(list, [1], pageIndex));
        },
        () => {
          this.setState({ loading: false });
        }
      );
    });
  };

  render() {
    const { activeTreeNode } = this.props;
    const { list, pageInfo, loading, showAddModal } = this.state;
    return (
      <div className={styles.right}>
        <div className={styles.topBar}>
          <span className="common-title">
            {activeTreeNode.key
              ? activeTreeNode.title
              : formatMessage({
                  id: 'storage.encrypt.noGroupSelected',
                  defaultMessage: '未选中分组',
                })}
          </span>
          <div className="ub">
            <Search
              wrapperClassName={styles.searchBox}
              onSearch={val => {
                this.searchCode = val;
                this.reload(1);
              }}
              placeholder={getPlaceholder(
                formatMessage({ id: 'datasource.code', defaultMessage: '数据源编码' })
              )}
            />
            <Button
              type="primary"
              className="ml10"
              disabled={!activeTreeNode.key}
              onClick={() => this.setState({ showAddModal: true })}
            >
              <MyIcon type="iconxinjian1x" />
              {formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })}
            </Button>
          </div>
        </div>
        <Table
          rowKey="detailId"
          loading={loading}
          dataSource={list}
          pagination={pageInfo}
          columns={this.columns}
          onChange={this.getData}
          className={styles.table}
        />
        <AddModal
          reloadData={this.reload}
          visible={showAddModal}
          activeTreeNode={activeTreeNode}
          onCancel={() => this.setState({ showAddModal: false })}
        />
      </div>
    );
  }
}
export default DatasourceList;
