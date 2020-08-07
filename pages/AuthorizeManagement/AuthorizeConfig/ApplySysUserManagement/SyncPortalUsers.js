import React from 'react';
import { Modal, Table, Button, Input, Select, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { USER_TYPES } from '@/common/const';
import {
  getPortalUsers,
  syncPortalUsersToApp,
} from '@/services/authorizeManagement/applySysUserManagement';
import { defaultHandleResponse, extractSearchParams } from '@/utils/utils';

const _pageInfo = { pageIndex: 1, pageSize: 5, total: 0 };

class SyncPortalUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: false,
      selectedRowKeys: [],
      pageInfo: { ..._pageInfo },
    };
    this.columns = [
      {
        dataIndex: 'type',
        title: formatMessage({ id: 'USERMGR_USER_TYPE', defaultMessage: '用户类型' }),
        render: type => (USER_TYPES.find(o => o.value === type) || {}).label || '-',
      },
      {
        dataIndex: 'userName',
        title: formatMessage({ id: 'USERMGR_USER_NAME', defaultMessage: '用户名称' }),
      },
      {
        dataIndex: 'userCode',
        title: formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' }),
      },
      {
        dataIndex: 'phone',
        title: formatMessage({ id: 'USERMGR_PHONE', defaultMessage: '手机号码' }),
      },
      { dataIndex: 'email', title: formatMessage({ id: 'USERMGR_EMAIL', defaultMessage: '邮箱' }) },
    ];
    this.searchParams = {};
  }

  componentDidMount() {
    this.getUsers();
  }

  getUsers = (pageIndex = 1, pageSize = 5) => {
    this.setState({ loading: true });
    const params = extractSearchParams(this.searchParams);
    getPortalUsers({ ...params, pageIndex, pageSize }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        const { rows: users = [], pageInfo = { ..._pageInfo } } = resultObject;
        this.setState({ users, pageInfo, selectedRowKeys: [] });
      });
    });
  };

  handleSync = () => {
    const { selectedRowKeys, users } = this.state;
    const {
      selectedSys: { id: appsysId },
      onCancel,
    } = this.props;
    const dataIndices = this.columns.map(o => o.dataIndex);
    const payload = selectedRowKeys.map(o => {
      const user = users.find(u => `${u.userId}` === `${o}`);
      const params = { appsysId };
      dataIndices.forEach(k => {
        params[k] = user[k];
      });
      return params;
    });
    this.setState({ loading: true });
    syncPortalUsersToApp(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'applySysUserManagement.syncSuccess', defaultMessage: '同步成功!' })
        );
        onCancel(true);
      });
    });
  };

  render() {
    const { users, loading, pageInfo, selectedRowKeys } = this.state;
    const { pageIndex, pageSize, total } = pageInfo;
    const pagination = {
      current: pageIndex,
      pageSize,
      total,
      showSizeChanger: true,
      pageSizeOptions: ['5', '10', '20', '50'],
    };
    return (
      <div>
        <div className="ub ub-ac ub-pj mb10">
          <Button
            type="primary"
            loading={loading}
            disabled={!selectedRowKeys.length}
            onClick={this.handleSync}
          >
            {formatMessage({ id: 'applySysUserManagement.syncUsers', defaultMessage: '同步用户' })}
          </Button>
          <div>
            <Select
              allowClear
              style={{ width: 150 }}
              onChange={type => {
                const { searchParams } = this;
                this.searchParams = { ...searchParams, type };
                this.getUsers();
              }}
              placeholder={formatMessage({ id: 'USERMGR_USER_TYPE', defaultMessage: '用户类型' })}
            >
              {USER_TYPES.map(o => (
                <Select.Option key={o.value} value={o.value}>
                  {o.label}
                </Select.Option>
              ))}
            </Select>
            <Input.Search
              allowClear
              className="ml10"
              style={{ width: 200 }}
              onSearch={queryCode => {
                const { searchParams } = this;
                this.searchParams = { ...searchParams, queryCode };
                this.getUsers();
              }}
              placeholder={formatMessage({
                id: 'applySysUserManagement.syncUsersPlaceholder',
                defaultMessage: '用户名称/编码',
              })}
            />
          </div>
        </div>
        <Table
          rowKey="userId"
          dataSource={users}
          loading={loading}
          columns={this.columns}
          pagination={pagination}
          scroll={{ y: 5 * 52 }}
          rowSelection={{
            selectedRowKeys,
            onChange: keys => this.setState({ selectedRowKeys: keys }),
          }}
          onChange={({ current: c, pageSize: s }) => this.getUsers(c, s)}
        />
      </div>
    );
  }
}

class SyncPortalUsersIndex extends React.PureComponent {
  render() {
    const { visible, onCancel, ...restProps } = this.props;
    return (
      <Modal
        width={1000}
        destroyOnClose
        visible={visible}
        footer={null}
        onCancel={() => onCancel(false)}
        title={formatMessage({
          id: 'applySysUserManagement.syncPortalUsers',
          defaultMessage: '同步门户用户',
        })}
      >
        <SyncPortalUsers onCancel={onCancel} {...restProps} />
      </Modal>
    );
  }
}
export default SyncPortalUsersIndex;
