import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { formatMessage } from 'umi/locale';
import { Input, Button, Popconfirm, message } from 'antd';
import classNames from 'classnames';
import MyIcon from '@/components/MyIcon';
import Table from '@/components/Table';
import RoleUsers from './RoleUsers';
import RoleItemModal from './RoleItemModal';
import RoleTableAuth from './RoleTableAuth';
import RoleState from './RoleState';
import { getRolesList, deleteRole } from '@/services/authorizeManagement/rolesManagement';
import { defaultHandleResponse } from '@/utils/utils';
import styles from '../components/common.less';

const _initialState = {
  rolesList: [],
  pageInfo: {},
  loading: false,
  selectedRole: {},
  showItemModal: false,
  showRoleUsersModal: false,
  showRoleTableAuthModal: false,
};

class RoleList extends React.Component {
  constructor(props) {
    super(props);
    this.appsysId = null;
    this.searchParams = {};
    this.editingRole = {};
    this.state = { ..._initialState };
  }

  componentDidMount() {
    const { selectedSys } = this.props;
    if (selectedSys.id || `${selectedSys.id}` === '0') {
      this.appsysId = selectedSys.id;
      this.getRolesList();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedSys } = this.props;
    if (
      (nextProps.selectedSys.id || `${nextProps.selectedSys.id}` === '0') &&
      nextProps.selectedSys.id !== selectedSys.id
    ) {
      this.appsysId = nextProps.selectedSys.id;
      this.getRolesList();
    } else if (
      selectedSys.id &&
      !nextProps.selectedSys.id &&
      `${nextProps.selectedSys.id}` !== '0'
    ) {
      this.appsysId = null;
      this.setState({ ..._initialState });
    }
  }

  getRolesList = (pageIndex = 1, pageSize = 5) => {
    const payload = { pageIndex, pageSize, appsysId: this.appsysId, ...this.searchParams };
    this.setState({ loading: true, selectedRole: {} });
    getRolesList(payload).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, resultObject => {
        const { pageInfo = {}, rows = [] } = resultObject || {};
        this.setState({ pageInfo, rolesList: rows });
      });
    });
  };

  getColumns = () => [
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
    {
      ellipse: true,
      dataIndex: 'comAcctName',
      title: formatMessage({ id: 'OWNER_ENTERPRISE', defaultMessage: '归属企业' }),
    },
    {
      dataIndex: 'roleStatus',
      title: formatMessage({ id: 'COMMON_STATE', defaultMessage: '状态' }),
      render: status => <RoleState status={status} />,
    },
    {
      dataIndex: 'action',
      title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
      render: (t, record) => (
        <div className="table-action-column">
          <MyIcon
            type="iconbianjix"
            title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
            onClick={() => this.editRole(record)}
          />
          <Popconfirm
            title={formatMessage({ id: 'COMMON_DELETE_TIP', defaultMessage: '您确定要删除吗' })}
            onConfirm={() => this.deleteRole(record)}
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

  handleClickRow = (e, record) => {
    const { appRoleId } = record;
    const { selectedRole } = this.state;
    if (selectedRole.appRoleId !== appRoleId) {
      this.setState({ selectedRole: { ...record } });
    }
  };

  editRole = (role = {}) => {
    this.editingRole = { ...role };
    this.setState({ showItemModal: true });
  };

  deleteRole = role => {
    const { appRoleId } = role;
    this.setState({ loading: true });
    deleteRole([appRoleId]).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        this.getRolesList();
        message.success(formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' }));
      });
    });
  };

  render() {
    const { selectedSys } = this.props;
    const {
      loading,
      pageInfo,
      rolesList,
      selectedRole,
      showItemModal,
      showRoleUsersModal,
      showRoleTableAuthModal,
    } = this.state;
    const pagination = {
      current: pageInfo.pageIndex || 1,
      total: pageInfo.total || 0,
      pageSize: pageInfo.pageSize || 5,
    };
    return (
      <div className={styles.sysManageCon}>
        <div className={styles.sysHeaderCon}>
          <span>{formatMessage({ id: 'JOBMGR_ROLE_LIST', defaultMessage: '角色列表' })}</span>
          <div>
            <Input.Search
              allowClear
              onSearch={searchName => {
                this.searchParams = { searchName };
                this.getRolesList();
              }}
              className={classNames(styles.searchInput, 'mr10')}
              placeholder={formatMessage({
                id: 'rolesManagement.search.placeholder',
                defaultMessage: '请输入角色名称/编码',
              })}
            />
            <Button
              className="mr10"
              disabled={isEmpty(selectedRole)}
              onClick={() => this.setState({ showRoleUsersModal: true })}
            >
              {formatMessage({ id: 'rolesManagement.roleUsersTitle', defaultMessage: '关联用户' })}
            </Button>
            <Button
              className="mr10"
              disabled={isEmpty(selectedRole)}
              onClick={() => this.setState({ showRoleTableAuthModal: true })}
            >
              {formatMessage({ id: 'COMMON_GRANT', defaultMessage: '授权' })}
            </Button>
            <Button type="primary" disabled={isEmpty(selectedSys)} onClick={() => this.editRole()}>
              {formatMessage({ id: 'COMMON_NEW', defaultMessage: '新建' })}
            </Button>
          </div>
        </div>
        <Table
          rowKey="appRoleId"
          setScrollY={false}
          autoPageSize={false}
          largerSmallSize={false}
          loading={loading}
          dataSource={rolesList}
          columns={this.getColumns()}
          pagination={pagination}
          onChange={this.getRolesList}
          onRow={() => ({ onClick: this.handleClickRow })}
        />
        <RoleItemModal
          role={this.editingRole}
          visible={showItemModal}
          onOk={() => this.getRolesList()}
          extraData={{ appSystemId: this.appsysId }}
          onCancel={() => this.setState({ showItemModal: false })}
        />
        <RoleUsers
          role={selectedRole}
          appsysId={selectedSys.id}
          visible={showRoleUsersModal}
          onCancel={() => this.setState({ showRoleUsersModal: false })}
        />
        <RoleTableAuth
          role={selectedRole}
          visible={showRoleTableAuthModal}
          onCancel={() => this.setState({ showRoleTableAuthModal: false })}
        />
      </div>
    );
  }
}
export default RoleList;
