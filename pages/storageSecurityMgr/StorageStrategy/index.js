import React from 'react';
import { Button, Alert, Popconfirm, message } from 'antd';
import MyIcon from '@/components/MyIcon';
import { formatMessage } from 'umi/locale';
import { STATES } from './const';
import TaskState from './TaskState';
import CommonFilterTableBox from '@/components/CommonFilterTableBox';
import AddStrategyModal from './AddStrategyModal';
import EditStrategyModal from './EditStrategyModal';
import {
  defaultHandleResponse,
  getCommonPagedResponse,
  getPageIndexAfterDeletion,
} from '@/utils/utils';
import { getGroupList } from '@/pages/storageSecurityMgr/services/encryptStorageGroupMgr';
import {
  getStrategyList,
  deleteStrategy,
} from '@/pages/storageSecurityMgr/services/encryptionStrategy';
import styles from './index.less';

const SHOW_MODAL_NEW = 'new';
const SHOW_MODAL_VIEW = 'view';

class StorageStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      groupList: [],
      pageInfo: {},
      loading: false,
      showModalName: '',
    };
    this.currentRecord = {};
    this.searchParams = {};
    this.columns = [
      {
        dataIndex: 'groupId',
        title: formatMessage({ id: 'storage.encrypt.groupCode', defaultMessage: '分组编码' }),
      },
      {
        dataIndex: 'groupName',
        title: formatMessage({ id: 'storage.encrypt.groupName', defaultMessage: '分组名称' }),
      },
      {
        dataIndex: 'encryptionField',
        title: formatMessage({ id: 'FIELD_CODE', defaultMessage: '字段编码' }),
      },
      {
        dataIndex: 'state',
        render: t => <TaskState state={t} />,
        title: formatMessage({
          id: 'storage.strategy.initializeState',
          defaultMessage: '初始化状态',
        }),
      },
      {
        dataIndex: 'createDatetime',
        title: formatMessage({ id: 'CREATE_DATE', defaultMessage: '创建时间' }),
      },
      {
        dataIndex: 'action',
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        render: (t, record) => (
          <div className="table-action-column">
            <MyIcon
              type="iconeye"
              onClick={() => {
                this.currentRecord = record;
                this.setState({ showModalName: SHOW_MODAL_VIEW });
              }}
              title={formatMessage({ id: 'COMMON_VIEW', defaultMessage: '查看' })}
            />
            <Popconfirm
              title={formatMessage({
                id: 'COMMON_DELETE_TIP',
                defaultMessage: '您确定要删除吗？',
              })}
              onConfirm={() => this.handleDelete(record)}
            >
              <MyIcon
                type="iconshanchubeifenx"
                title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
              />
            </Popconfirm>
          </div>
        ),
      },
    ];
  }

  componentDidMount() {
    this.getGroups();
  }

  getGroups = () => {
    getGroupList().then(response => {
      defaultHandleResponse(response, resultObject => {
        const groupList = (resultObject || []).map(o => ({ value: o.groupId, label: o.groupName }));
        this.setState({ groupList });
      });
    });
  };

  getSearchArr = () => {
    const { groupList } = this.state;
    return [
      {
        type: 'select',
        name: 'groupId',
        dataSource: groupList,
        label: formatMessage({ id: 'storage,group', defaultMessage: '分组' }),
      },
      {
        name: 'encryptionField',
        label: formatMessage({ id: 'FIELD_CODE', defaultMessage: '字段编码' }),
      },
      {
        type: 'select',
        name: 'state',
        dataSource: STATES,
        label: formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' }),
      },
      {
        name: 'createTime',
        type: 'rangePicker',
        startName: 'startCreateDatetime',
        endName: 'endCreateDatetime',
        label: formatMessage({ id: 'CREATE_DATE', defaultMessage: '创建时间' }),
      },
    ];
  };

  handleSearch = params => {
    this.searchParams = params;
    this.handleRefresh(1);
  };

  handleRefresh = index => {
    const {
      pageInfo: { pageIndex = 1, pageSize },
    } = this.state;
    this.getData(index || pageIndex, pageSize);
  };

  getData = (pageIndex = 1, pageSize = 10) => {
    const payload = { pageIndex, pageSize, ...this.searchParams };
    this.setState({ loading: true });
    getStrategyList(payload).then(response => {
      this.setState({ loading: false });
      const { list, pageInfo } = getCommonPagedResponse(response);
      if (list) {
        this.setState({ list, pageInfo });
      }
    });
  };

  handleDelete = record => {
    const { storeFieldId } = record;
    this.setState({ loading: true });
    deleteStrategy(storeFieldId).then(response => {
      defaultHandleResponse(
        response,
        () => {
          message.success(
            formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功！' })
          );
          const {
            list,
            pageInfo: { pageIndex },
          } = this.state;
          const newPageIndex = getPageIndexAfterDeletion(list, [storeFieldId], pageIndex);
          this.handleRefresh(newPageIndex);
        },
        () => {
          this.setState({ loading: false });
        }
      );
    });
  };

  render() {
    const { list, pageInfo, loading, showModalName } = this.state;
    return (
      <CommonFilterTableBox
        rowKey="storeFieldId"
        loading={loading}
        dataSource={list}
        pageInfo={pageInfo}
        columns={this.columns}
        tableClassName={styles.table}
        onChange={this.getData}
        advancedFilterProps={{
          canFold: false,
          columnNumber: 4,
          searchArr: this.getSearchArr(),
          onSearch: this.handleSearch,
        }}
      >
        <div className={styles.topBar}>
          <Button type="primary" onClick={() => this.setState({ showModalName: SHOW_MODAL_NEW })}>
            <MyIcon type="iconxinjian1x" />
            {formatMessage({ id: 'BUTTON_ADD', defaultMessage: '新增' })}
          </Button>
          <Alert
            closable
            type="info"
            className={styles.floatTips}
            message={formatMessage({ id: 'storage.strategy.tips1' })}
          />
        </div>
        <AddStrategyModal
          onOk={() => this.handleRefresh(1)}
          visible={showModalName === SHOW_MODAL_NEW}
          onCancel={() => this.setState({ showModalName: '' })}
        />
        <EditStrategyModal
          item={this.currentRecord}
          visible={showModalName === SHOW_MODAL_VIEW}
          onCancel={() => this.setState({ showModalName: '' })}
        />
      </CommonFilterTableBox>
    );
  }
}
export default StorageStrategy;
