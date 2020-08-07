import React from 'react';
import { formatMessage } from 'umi/locale';
import { message } from 'antd';
import TableTransfer from '@/components/TableTransfer';
import { getRolesByUserId } from '@/services/authorizeManagement/applySysAuthorize';
import {
  saveRoleAuthUsers,
  cancelRoleAuthUsers,
} from '@/services/authorizeManagement/rolesManagement';
import { defaultHandleResponse } from '@/utils/utils';

class UserRoles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leftUsers: [],
      rightUsers: [],
      leftSearchKeyword: '',
      rightSearchKeyword: '',
      loading: false,
    };
    this.leftUsers = [];
    this.rightUsers = [];
    this.columns = [
      {
        ellipse: true,
        dataIndex: 'roleName',
        title: formatMessage({ id: 'ROLE_NAME', defaultMessage: '角色名称' }),
      },
      {
        ellipse: true,
        dataIndex: 'roleCode',
        title: formatMessage({ id: 'ROLE_CODE', defaultMessage: '角色编码' }),
      },
    ];
  }

  componentDidMount() {
    const { appUserId } = this.props;
    if (appUserId) {
      this.getRoles();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (nextProps.appUserId && props.appUserId !== nextProps.appUserId) {
      this.setState({ leftUsers: [], rightUsers: [] });
      this.getRoles(nextProps);
    }
  }

  getRoles = props => {
    if (!props) {
      ({ props } = this);
    }
    const { appUserId } = props;
    this.setState({ loading: true });
    getRolesByUserId({ appUserId }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, resultObject => {
        const { roleAuthList, roleList } = resultObject || {};
        let leftUsers = roleList || [];
        let rightUsers = roleAuthList || [];
        const rightKeys = rightUsers.map(o => o.appRoleId);
        leftUsers = leftUsers.filter(o => !rightKeys.includes(o.appRoleId));
        this.leftUsers = JSON.parse(JSON.stringify(leftUsers));
        this.rightUsers = JSON.parse(JSON.stringify(rightUsers));
        const { leftSearchKeyword, rightSearchKeyword } = this.state;
        if (leftSearchKeyword) {
          leftUsers = this.onSearch(leftSearchKeyword, true, true);
        }
        if (rightSearchKeyword) {
          rightUsers = this.onSearch(rightSearchKeyword, false, true);
        }
        this.setState({ leftUsers, rightUsers });
      });
    });
  };

  doAuth = (keys, auth, callback) => {
    const { appUserId } = this.props;
    const payload = { roleIds: keys, appUserIds: [appUserId] };
    const service = auth ? saveRoleAuthUsers : cancelRoleAuthUsers;
    this.setState({ loading: true });
    service(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        this.getRoles();
        callback();
      });
    });
  };

  onSearch = (value, isLeft, justGet) => {
    const { leftUsers, rightUsers } = this;
    const searchState = { [isLeft ? 'leftSearchKeyword' : 'rightSearchKeyword']: value };
    let originData = isLeft ? leftUsers : rightUsers;
    if (!value) {
      this.setState({ [isLeft ? 'leftUsers' : 'rightUsers']: [...originData], ...searchState });
      return false;
    }
    if (isLeft) {
      const rightKeys = rightUsers.map(o => o.appRoleId);
      originData = leftUsers.filter(o => !rightKeys.includes(o.appRoleId));
    }
    const lowerCaseVal = value.toLowerCase();
    const data = originData.filter(o => {
      return (
        (o.roleName || '').toLowerCase().indexOf(lowerCaseVal) > -1 ||
        (o.roleCode || '').toLowerCase().indexOf(lowerCaseVal) > -1
      );
    });
    if (justGet) {
      return data;
    }
    this.setState({ [isLeft ? 'leftUsers' : 'rightUsers']: data, ...searchState });
  };

  render() {
    const { loading, leftUsers, rightUsers } = this.state;
    return (
      <TableTransfer
        rowKey="appRoleId"
        showSearch
        loading={loading}
        transfer={this.doAuth}
        columns={this.columns}
        showPagination={false}
        leftData={leftUsers}
        rightData={rightUsers}
        onSearch={this.onSearch}
        rightTitle={formatMessage({
          id: 'usersAuthorize.ownedRoles',
          defaultMessage: '已经拥有的角色',
        })}
        leftTitle={formatMessage({
          id: 'usersAuthorize.unOwnedRoles',
          defaultMessage: '未拥有的角色',
        })}
        placeholder={formatMessage({
          id: 'rolesManagement.search.placeholder',
          defaultMessage: '请输入角色名称/编码',
        })}
      />
    );
  }
}
export default UserRoles;
