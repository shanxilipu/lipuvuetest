import React from 'react';
import Layout from '../components/Layout';
import RoleList from './RoleList';

const RolesManagement = () => {
  return <Layout systemEditable={false} getComponent={props => <RoleList {...props} />} />;
};
export default RolesManagement;
