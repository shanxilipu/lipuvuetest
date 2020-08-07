import React from 'react';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import Table from '@/components/Table';
import Search from '@/components/Search';
import { defaultHandleResponse } from '@/utils/utils';
import { getAllPortalUsers } from '@/pages/storageSecurityMgr/services/encryptionKeysMgr';
import styles from './index.less';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageInfo: {},
      loading: false,
    };
    this.allUsers = [];
    this.columns = [
      {
        ellipsis: true,
        dataIndex: 'userName',
        title: formatMessage({ id: 'USERMGR_USER_NAME', defaultMessage: '用户名称' }),
      },
      {
        ellipsis: true,
        dataIndex: 'userCode',
        title: formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' }),
      },
    ];
  }

  componentDidMount() {
    this.getAllUsers();
  }

  getAllUsers = queryCode => {
    this.setState({ loading: true });
    const payload = queryCode ? { queryCode } : {};
    getAllPortalUsers(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, resultObject => {
        if (!resultObject) {
          return false;
        }
        const { code, data, msg } = resultObject;
        if (code === 0) {
          const loop = arr => {
            arr.forEach(o => {
              const { children } = o;
              if (children) {
                if (children.length) {
                  loop(children);
                } else {
                  delete o.children;
                }
              }
            });
          };
          loop(data);
          this.allUsers = data;
          this.reloadUserList();
        } else {
          message.error(
            msg ||
              formatMessage({
                id: 'storage.encrypt.getUsersFailed',
                defaultMessage: '获取用户失败',
              })
          );
        }
      });
    });
  };

  reloadUserList = () => {
    const {
      pageInfo: { pageSize },
    } = this.state;
    this.getPagedData(1, pageSize);
  };

  getPagedData = (pageIndex = 1, pageSize = 10) => {
    const { allUsers } = this;
    if (!allUsers.length) {
      const { pageInfo } = this.state;
      this.setState({ pageInfo: { ...pageInfo, pageSize } });
      return false;
    }
    const idx = (pageIndex - 1) * pageSize;
    const list = allUsers.slice(idx, idx + pageSize);
    const pageInfo = { pageIndex, pageSize, total: this.allUsers.length };
    this.setState({ pageInfo, list });
  };

  setSelectedRows = (keys = []) => {
    const { setSelectedRowKeys } = this.props;
    setSelectedRowKeys(keys);
  };

  render() {
    const { selectedRowKeys, className = '' } = this.props;
    const { list, pageInfo, loading } = this.state;
    return (
      <div className={className}>
        <Search
          size="small"
          placeholder={formatMessage({
            id: 'rolesManagement.usersPlaceholder',
            defaultMessage: '请输入用户名称/编码',
          })}
          wrapperClassName={styles.userListSearch}
          onSearch={this.getAllUsers}
        />
        <Table
          checkable
          rowKey="userCode"
          rowSelectable
          loading={loading}
          dataSource={list}
          columns={this.columns}
          onChange={this.getPagedData}
          className={styles.userListTable}
          selectedRowKeys={selectedRowKeys}
          pagination={{ ...pageInfo, showQuickJumper: false }}
          onSelectRow={keys => this.setSelectedRows(keys)}
          paginationProps={{
            MultiActComponent: true,
            showCheckbox: false,
            pageAllCount: this.allUsers.length,
            className: styles.userListPagination,
          }}
          // onSelectAll={checked => this.setSelectedRows(checked ? [...list] : [])}
        />
      </div>
    );
  }
}
export default UserList;
