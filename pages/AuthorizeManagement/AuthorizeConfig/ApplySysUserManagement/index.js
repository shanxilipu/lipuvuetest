import React from 'react';
import Layout from '../components/Layout';
import UserManage from './UserManage';
import { getConfigList } from '@/services/common';
import { defaultHandleResponse } from '@/utils/utils';

class ApplySysUserManagement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      syncPortalUsersEnable: false,
    };
  }

  componentWillMount() {
    getConfigList('DISPLAY_SYN_USER').then(response => {
      defaultHandleResponse(response, resultObject => {
        const { standDisplayValue } = resultObject || {};
        this.setState({ syncPortalUsersEnable: `${standDisplayValue}` === '1' });
      });
    });
  }

  render() {
    const { syncPortalUsersEnable } = this.state;
    return (
      <Layout
        getComponent={props => (
          <UserManage {...props} syncPortalUsersEnable={syncPortalUsersEnable} />
        )}
      />
    );
  }
}
export default ApplySysUserManagement;
