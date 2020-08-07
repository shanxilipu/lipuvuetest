import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Collapse, Input, Button, Popconfirm, Tooltip, message, Badge, Modal } from 'antd';
import _ from 'lodash';
import classNames from 'classnames';
import MyIcon from '@/components/MyIcon';
import SyncPortalUsers from './SyncPortalUsers';
import {
  listSafeAppUser,
  disableSafeAppUser,
  enableSafeAppUser,
  multiDisableSafeAppUse,
  multiEnableSafeAppUser,
  batchSaveSafeAppUser,
} from '@/services/authorizeManagement/applySysUserManagement';
import { downloadFile, defaultHandleResponse } from '@/utils/utils';
import AddUser from './AddUser';
import CSVUpLoad from '../components/CSVUpLoad';
import PageSelTable from '../../components/pageSelTable';
import styles from '../components/common.less';

const { Panel } = Collapse;
const { Search } = Input;
const { confirm } = Modal;
const renderTextColumn = text => {
  return text ? (
    <Tooltip title={text}>
      <span className="titleSpan">{text}</span>
    </Tooltip>
  ) : (
    '-'
  );
};
const _initState = {
  selectedRowKeys: [],
  selectedRowArr: [],
  dataSource: [],
  pageInfo: {
    pageIndex: 1,
    pageSize: 5,
    total: 0,
    searchName: '',
  },
};
class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ..._initState,
      loading: false,
      showModel: false,
      type: 'add',
      userItemAct: {},
      showSyncPortalUsers: false,
    };
    this.columns = [
      {
        title: `${formatMessage({ id: 'auditManagement.UserCode' })}`,
        dataIndex: 'appUserCode',
        width: '16%',
        className: 'modelTableEllipsis',
        render: renderTextColumn,
      },
      {
        title: `${formatMessage({ id: 'auditManagement.UserName' })}`,
        dataIndex: 'appUserName',
        width: '17%',
        className: 'modelTableEllipsis',
        render: renderTextColumn,
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.CellphoneNumber' })}`,
        dataIndex: 'appUserPhone',
        width: '17%',
        className: 'modelTableEllipsis',
        render: renderTextColumn,
      },
      {
        title: formatMessage({ id: 'riskConfig.email', defaultMessage: '邮件' }),
        dataIndex: 'appUserMail',
        className: 'modelTableEllipsis',
        width: '18%',
        render: renderTextColumn,
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.status' })}`,
        dataIndex: 'state',
        width: '16%',
        className: 'modelTableEllipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">
                {text === 'A' ? (
                  <Badge
                    status="success"
                    text={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                  />
                ) : (
                  <Badge
                    status="error"
                    text={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                  />
                )}
              </span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.Operate' })}`,
        key: 'caozuo',
        width: '16%',
        render: val => {
          const { state } = val;
          const { selectedSys, defaultAppsysCode } = this.props;
          const { appsysCode } = selectedSys;
          const isBss = THEME === 'bss';
          return (
            <div className="table-action-column" onClick={this.stopExpandColumn}>
              {(appsysCode !== defaultAppsysCode || !isBss) && (
                <MyIcon
                  type="iconbianjix"
                  title={`${formatMessage({ id: 'applySysUserManagement.Edit' })}`}
                  onClick={this.editUser.bind(this, val)}
                  className="square-icon"
                />
              )}

              {state === 'A' ? (
                <Popconfirm
                  title={`${formatMessage({ id: 'applySysUserManagement.DisableTip' })}`}
                  onConfirm={() => this.stateSafeAppUser(val.id, 'X')}
                  okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
                  cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
                >
                  <MyIcon
                    type="icontingyongx"
                    title={`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
                    className="square-icon"
                  />
                </Popconfirm>
              ) : (
                <Popconfirm
                  title={`${formatMessage({ id: 'applySysUserManagement.EnableTip' })}`}
                  onConfirm={() => this.stateSafeAppUser(val.id, 'A')}
                  okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
                  cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
                >
                  <MyIcon
                    type="iconqiyongx"
                    title={`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
                    className="square-icon"
                  />
                </Popconfirm>
              )}
            </div>
          );
        },
      },
    ];

    this.upFileColumns = [
      {
        title: `${formatMessage({ id: 'applySysUserManagement.ApplySysUserCode' })}`,
        dataIndex: 'appUserCode',
        width: '20%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.ApplySysUserName' })}`,
        dataIndex: 'appUserName',
        width: '20%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.ApplySysUserPhoneNum' })}`,
        dataIndex: 'appUserPhone',
        width: '45%',
        className: 'model_table_ellipsis',
        render: text => {
          return text ? (
            <Tooltip title={text}>
              <span className="titleSpan">{text}</span>
            </Tooltip>
          ) : (
            '-'
          );
        },
      },
      {
        title: `${formatMessage({ id: 'applySysUserManagement.IsRepeated' })}`,
        dataIndex: 'status',
        width: '15%',
        className: 'model_table_ellipsis',
        render: val => {
          const text =
            val === 'true'
              ? `${formatMessage({ id: 'applySysUserManagement.Yes' })}`
              : `${formatMessage({ id: 'applySysUserManagement.No' })}`;
          return (
            <Tooltip title={text}>
              <span className="titleSpan" style={val === 'true' ? { color: 'red' } : {}}>
                {text}
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }

  componentDidMount() {
    const { selectedSys } = this.props;
    if (selectedSys.id || `${selectedSys.id}` === '0') {
      this.getListSafeAppUser(selectedSys.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedSys } = this.props;
    if (
      (nextProps.selectedSys.id || `${nextProps.selectedSys.id}` === '0') &&
      nextProps.selectedSys.id !== selectedSys.id
    ) {
      this.setState({ ..._initState }, () => {
        this.getListSafeAppUser(nextProps.selectedSys.id);
      });
    } else if (!nextProps.selectedSys.id && `${nextProps.selectedSys.id}` !== '0') {
      this.setState({ ..._initState });
    }
  }

  // 分页变化
  handlePaginationOnChanges = pageIndex => {
    const { pageInfo } = this.state;
    pageInfo.pageIndex = pageIndex;
    this.setState(
      {
        pageInfo,
      },
      () => {
        this.getListSafeAppUser();
      }
    );
  };

  // 获取用户列表
  getListSafeAppUser = id => {
    let appsysId = '';
    const { selectedSys } = this.props;
    const { pageInfo } = this.state;
    if (id) {
      appsysId = id;
    } else {
      appsysId = selectedSys.id;
    }
    const params = {
      appsysId,
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
      searchName: pageInfo.searchName,
    };
    this.setState({
      loading: true,
    });
    listSafeAppUser(params).then(result => {
      this.setState({
        loading: false,
      });
      defaultHandleResponse(result, (resultObject = []) => {
        const { pageInfo: pageData, rows } = resultObject;
        pageInfo.total = pageData.total;
        this.setState({
          dataSource: rows,
          pageInfo,
          selectedRowKeys: [],
          selectedRowArr: [],
        });
      });
    });
  };

  handleRefresh = setPage => {
    if (setPage) {
      const pageInfo = {
        pageIndex: 1,
        pageSize: 5,
        total: 0,
        searchName: '',
      };
      this.setState(
        {
          pageInfo,
        },
        () => {
          this.getListSafeAppUser();
        }
      );
    } else {
      this.getListSafeAppUser();
    }
  };

  showModelFlag = (flag, refresh, setPage) => {
    this.setState({
      showModel: flag,
    });
    if (refresh) {
      this.handleRefresh(setPage);
    }
  };

  // 编辑用户
  editUser = val => {
    this.setState({
      type: 'edit',
      userItemAct: val,
      showModel: true,
    });
  };

  // 启/停用用户
  stateSafeAppUser = (id, type) => {
    this.setState({
      loading: true,
    });
    let fun = enableSafeAppUser;
    if (type !== 'A') {
      fun = disableSafeAppUser;
    }
    fun({ id }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.OperationFailed' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        if (type === 'A') {
          message.success(`${formatMessage({ id: 'applySysUserManagement.SuccessfullyEnabled' })}`);
        } else {
          message.success(
            `${formatMessage({ id: 'applySysUserManagement.SuccessfullyDisabled' })}`
          );
        }
        this.getListSafeAppUser();
      }
    });
  };

  // 批量启用/停用用户
  stateSafeAppUserList = type => {
    const { selectedRowKeys } = this.state;
    const idList = selectedRowKeys.map(item => {
      return { id: item };
    });
    this.setState({
      loading: true,
    });
    let fun = multiEnableSafeAppUser;
    if (type !== 'A') {
      fun = multiDisableSafeAppUse;
    }
    fun({ idList }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.OperationFailed' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        if (type === 'A') {
          message.success(`${formatMessage({ id: 'applySysUserManagement.SuccessfullyEnabled' })}`);
        } else {
          message.success(
            `${formatMessage({ id: 'applySysUserManagement.SuccessfullyDisabled' })}`
          );
        }
        this.getListSafeAppUser();
      }
    });
  };

  // 下载用户模板
  downloadTemp = () => {
    downloadFile('smartsafe/SafeAppUserController/downloadSafeAppUserTemplate', {}, 'POST');
  };

  getFooterBtn = selectedRowKeys => {
    return (
      <Fragment>
        <Popconfirm
          title={`${formatMessage({ id: 'applySysUserManagement.EnableUserTip' })}`}
          onConfirm={() => this.stateSafeAppUserList('A')}
          okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
          cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
        >
          <Button style={{ marginLeft: 30 }} size="small" disabled={selectedRowKeys.length <= 0}>
            {`${formatMessage({ id: 'applySysUserManagement.Enable' })}`}
          </Button>
        </Popconfirm>
        <Popconfirm
          title={`${formatMessage({ id: 'applySysUserManagement.DisableUserTip' })}`}
          onConfirm={() => this.stateSafeAppUserList('X')}
          okText={`${formatMessage({ id: 'applySysUserManagement.determine' })}`}
          cancelText={`${formatMessage({ id: 'applySysUserManagement.cancel' })}`}
        >
          <Button style={{ marginLeft: 10 }} size="small" disabled={selectedRowKeys.length <= 0}>
            {`${formatMessage({ id: 'applySysUserManagement.Disable' })}`}
          </Button>
        </Popconfirm>
      </Fragment>
    );
  };

  getSell = (selectedRowKeys, selectedRowArr) => {
    this.setState({
      selectedRowKeys,
      selectedRowArr,
    });
  };

  getDataSource = itemArr => {
    const [status = '', appUserCode = '', appUserName = '', appUserPhone = ''] = itemArr;
    return { status, appUserCode, appUserName, appUserPhone };
  };

  // 批量创建应用系统用户
  handleOk = (dataSource, callback) => {
    const { selectedSys } = this.props;
    const appsysId = selectedSys.id;
    const repeatCodeArr = [];
    const newDataSource = dataSource.map(item => {
      const { appUserCode, appUserName, appUserPhone, status } = item;
      if (status === 'true') {
        repeatCodeArr.push(appUserCode);
      }
      return { appUserCode, appUserName, appUserPhone, appsysId };
    });
    if (repeatCodeArr.length > 0) {
      const _this = this;
      confirm({
        title: `${formatMessage({ id: 'applySysUserManagement.ConfirmationOperate' })}`,
        content: (
          <div>
            {formatMessage({ id: 'applySysUserManagement.repeatCodeFalseTipLeft' })}
            {repeatCodeArr.join(',')}
            {formatMessage({ id: 'applySysUserManagement.repeatCodeFalseTipRightTwo' })}
          </div>
        ),
        okText: `${formatMessage({ id: 'applySysUserManagement.determine' })}`,
        cancelText: `${formatMessage({ id: 'applySysUserManagement.cancel' })}`,
        onOk() {
          _this.batchSaveSafeAppUser(newDataSource, callback);
          callback();
        },
        onCancel() {
          return false;
        },
      });
    } else {
      this.batchSaveSafeAppUser(newDataSource, callback);
      callback();
    }
  };

  batchSaveSafeAppUser = newDataSource => {
    this.setState({
      loading: true,
    });
    batchSaveSafeAppUser({ safeAppUserList: newDataSource }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const {
        resultCode,
        resultMsg = `${formatMessage({ id: 'applySysUserManagement.OperationFailed' })}`,
      } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(`${formatMessage({ id: 'applySysUserManagement.ImportUserSuccessTip' })}`);
        const { pageInfo } = this.state;
        pageInfo.pageIndex = 1;
        this.setState(
          {
            pageInfo,
          },
          () => {
            this.getListSafeAppUser();
          }
        );
      }
    });
  };

  render() {
    const {
      loading,
      selectedRowArr,
      dataSource,
      showModel,
      type,
      userItemAct,
      pageInfo,
      showSyncPortalUsers,
    } = this.state;
    const { selectedSys, defaultAppsysCode, syncPortalUsersEnable } = this.props;

    const { appsysCode } = selectedSys;

    const isBss = THEME === 'bss';

    return (
      <div className={styles.sysManageCon}>
        <Collapse
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'auditManagement.Collapse' })}`
                    : `${formatMessage({ id: 'auditManagement.Expand' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel
            header={`${formatMessage({ id: 'applySysUserManagement.ApplySysUserManag' })}`}
            key="1"
          >
            {/* {_.isEmpty(selectedSys) ? (
              <div className={styles.noSelFile} style={{ minHeight: '250px' }}>
                <MyIcon type="icon-zanwushuju" style={{ fontSize: '80px' }} />
                <span>请选择应用系统</span>
              </div>
            ) : ( */}
            <Fragment>
              <div className={styles.sysHeaderCon}>
                <span>{selectedSys.appsysName}</span>
                <div className={styles.sysHeaderRight}>
                  <Search
                    disabled={_.isEmpty(selectedSys)}
                    className={classNames(styles.searchInput, 'mr10')}
                    placeholder={`${formatMessage({
                      id: 'applySysUserManagement.ApplySysUserSearchTip',
                    })}`}
                    onSearch={value => {
                      pageInfo.searchName = value;
                      pageInfo.pageIndex = 1;
                      this.setState(
                        {
                          pageInfo,
                        },
                        () => {
                          this.getListSafeAppUser();
                        }
                      );
                    }}
                  />
                  {(appsysCode !== defaultAppsysCode || !isBss) && (
                    <Fragment>
                      <Button
                        icon="plus"
                        type="primary"
                        className="mr10"
                        disabled={_.isEmpty(selectedSys)}
                        onClick={() => {
                          this.setState(
                            {
                              type: 'add',
                              userItemAct: {},
                            },
                            () => {
                              this.showModelFlag(true);
                            }
                          );
                        }}
                      >
                        {`${formatMessage({ id: 'applySysUserManagement.AddUser' })}`}
                      </Button>
                      {syncPortalUsersEnable && (
                        <Button
                          type="primary"
                          className="mr10"
                          disabled={_.isEmpty(selectedSys)}
                          onClick={() => this.setState({ showSyncPortalUsers: true })}
                        >
                          {formatMessage({
                            id: 'applySysUserManagement.syncPortalUsers',
                            defaultMessage: '同步门户用户',
                          })}
                        </Button>
                      )}
                      <CSVUpLoad
                        upFileColumns={this.upFileColumns}
                        getDataSource={this.getDataSource}
                        handleOk={this.handleOk}
                        modelTitle={`${formatMessage({
                          id: 'applySysUserManagement.SysUserImportConfirm',
                        })}`}
                        type="userInfo"
                        selectedSys={selectedSys}
                        disabled={_.isEmpty(selectedSys)}
                        showModelFlag={this.showModelFlag}
                      />
                      <span className={styles.sysHeaderDownTemp} onClick={this.downloadTemp}>
                        {`${formatMessage({ id: 'applySysUserManagement.DownloadTemplate' })}`}
                      </span>
                    </Fragment>
                  )}
                </div>
              </div>
              <PageSelTable
                handlePaginationOnChanges={this.handlePaginationOnChanges}
                getFooterBtn={this.getFooterBtn}
                isLoading={loading}
                pageInfo={pageInfo}
                dataSource={dataSource}
                initVlaue={selectedRowArr}
                primaryKey="id"
                columns={this.columns}
                onGetSel={this.getSell}
              />
              <AddUser
                showModel={showModel}
                showModelFlag={this.showModelFlag}
                type={type}
                userItemAct={userItemAct}
                selectedSys={selectedSys}
              />
              <SyncPortalUsers
                selectedSys={selectedSys}
                visible={showSyncPortalUsers}
                onCancel={refresh => {
                  this.setState({ showSyncPortalUsers: false });
                  if (refresh) {
                    this.handleRefresh(true);
                  }
                }}
              />
            </Fragment>
            {/* )} */}
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default UserManage;
