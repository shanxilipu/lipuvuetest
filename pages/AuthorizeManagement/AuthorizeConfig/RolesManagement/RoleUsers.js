import React from 'react';
import Modal from '@/components/Modal';
import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import TableTransfer from '@/components/TableTransfer';
import {
  getRoleUsers,
  saveRoleAuthUsers,
  cancelRoleAuthUsers,
} from '@/services/authorizeManagement/rolesManagement';
import { defaultHandleResponse } from '@/utils/utils';

class RoleUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...this.resetState(true) };
    this.columns = [
      {
        ellipsis: true,
        dataIndex: 'appUserName',
        title: formatMessage({ id: 'USERMGR_USER_NAME', defaultMessage: '用户名称' }),
      },
      {
        ellipsis: true,
        dataIndex: 'appUserCode',
        title: formatMessage({ id: 'USERMGR_USER_CODE', defaultMessage: '用户编码' }),
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (!props.visible && nextProps.visible) {
      this.resetState();
      this.getUsers({}, true);
      this.getUsers({}, false);
    }
  }

  resetState = justGet => {
    this.leftSearchParams = {};
    this.rightSearchParams = {};
    if (justGet) {
      return {
        leftObject: {},
        rightObject: {},
        loading: false,
        leftLoading: false,
        rightLoading: false,
      };
    }
    this.setState({
      leftObject: {},
      rightObject: {},
      loading: false,
      leftLoading: false,
      rightLoading: false,
    });
  };

  getUsers = (params, isLeft) => {
    const {
      appsysId,
      role: { appRoleId },
    } = this.props;
    const search = isLeft ? this.leftSearchParams : this.rightSearchParams;
    const payload = { ...params, appsysId, appRoleId, authState: isLeft ? 0 : 1, ...search };
    if (!payload.pageIndex) {
      payload.pageIndex = 1;
    }
    if (!payload.pageSize) {
      payload.pageSize = 10;
    }
    this.setState({ [isLeft ? 'leftLoading' : 'rightLoading']: true });
    getRoleUsers(payload).then(response => {
      this.setState({ [isLeft ? 'leftLoading' : 'rightLoading']: false });
      defaultHandleResponse(response, resultObject => {
        this.setState({ [isLeft ? 'leftObject' : 'rightObject']: resultObject || {} });
      });
    });
  };

  doAuth = (keys, auth, callback) => {
    const {
      role: { appRoleId },
    } = this.props;
    const payload = { roleIds: [appRoleId], appUserIds: keys };
    const service = auth ? saveRoleAuthUsers : cancelRoleAuthUsers;
    this.setState({ loading: true });
    service(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        this.getUsers({}, true);
        this.getUsers({}, false);
        callback();
      });
    });
  };

  getPagination = isLeft => {
    const { leftObject, rightObject } = this.state;
    const object = isLeft ? leftObject : rightObject;
    const { pageInfo: { pageIndex = 1, pageSize = 10, total = 0 } = {} } = object;
    return {
      current: pageIndex,
      pageSize,
      total,
      showQuickJumper: false,
      onChange: (i, s) => this.getUsers({ pageIndex: i, pageSize: s }, isLeft),
    };
  };

  onSearch = (searchName, isLeft) => {
    const params = { searchName };
    if (isLeft) {
      this.leftSearchParams = params;
    } else {
      this.rightSearchParams = params;
    }
    this.getUsers({}, isLeft);
  };

  render() {
    const { visible, onCancel } = this.props;
    const { loading, leftLoading, rightLoading, leftObject, rightObject } = this.state;
    return (
      <Modal
        width={900}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        height={Math.max(window.innerHeight * 0.8, 200)}
        title={formatMessage({ id: 'rolesManagement.roleUsersTitle', defaultMessage: '关联用户' })}
      >
        <TableTransfer
          rowKey="id"
          showSearch
          loading={loading}
          transfer={this.doAuth}
          columns={this.columns}
          onSearch={this.onSearch}
          getPagination={this.getPagination}
          leftData={leftObject.rows || []}
          rightData={rightObject.rows || []}
          leftTableProps={{ loading: leftLoading }}
          rightTableProps={{ loading: rightLoading }}
          rightTitle={formatMessage({
            id: 'rolesManagement.associatedUsers',
            defaultMessage: '已关联用户',
          })}
          leftTitle={formatMessage({
            id: 'rolesManagement.unAssociatedUsers',
            defaultMessage: '未关联用户',
          })}
          placeholder={formatMessage({
            id: 'rolesManagement.usersPlaceholder',
            defaultMessage: '请输入用户名称/编码',
          })}
        />
      </Modal>
    );
  }
}
export default RoleUsers;
