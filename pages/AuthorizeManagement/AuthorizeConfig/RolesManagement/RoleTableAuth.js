import React from 'react';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import TableOperationsAuth from '@/pages/AuthorizeManagement/components/TableOperationsAuth';
import {
  getRoleTableOperations,
  saveRoleTableOperations,
} from '@/services/authorizeManagement/rolesManagement';
import { defaultHandleResponse } from '@/utils/utils';

class RoleTableAuth extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
    };
  }

  getCheckedOperations = (dataRef, callback) => {
    const { role = {} } = this.props;
    const { appRoleId } = role;
    getRoleTableOperations({
      appRoleId,
      dataobjectId: dataRef.tableId,
    }).then(response => {
      let list = [];
      defaultHandleResponse(response, resultObject => {
        list = (resultObject || []).map(o => ({ ...o, executeId: parseInt(o.executeId, 10) }));
      });
      callback(list);
    });
  };

  handleSubmit = params => {
    const { role = {}, onCancel } = this.props;
    const payload = params.map(o => ({
      dataobjectId: o.tableId,
      executeId: o.executeIds.join(','),
      roleId: role.appRoleId,
    }));
    this.setState({ confirmLoading: true });
    saveRoleTableOperations(payload).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({
            id: 'ApplySysAuthorize.AuthorizationSucceeded',
            defaultMessage: '授权成功',
          })
        );
        onCancel();
      });
    });
  };

  render() {
    const { confirmLoading } = this.state;
    const { visible, onCancel } = this.props;
    return (
      <TableOperationsAuth
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleSubmit}
        confirmLoading={confirmLoading}
        getCheckedOperations={this.getCheckedOperations}
        title={formatMessage({
          id: 'rolesManagement.tableAuthTitle',
          defaultMessage: '角色表权限录入',
        })}
      />
    );
  }
}
export default RoleTableAuth;
