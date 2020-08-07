import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  Input,
  Tree,
  Tabs,
  Table,
  Form,
  Pagination,
  Button,
  Checkbox,
  Icon,
  message,
  Popconfirm,
} from 'antd';
import Modal from '@/components/Modal';
import MyIcon from '@/components/MyIcon';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import AddField from './AddField';
import FieldModal from './FieldModal';
import AccessTime from './AccessTime';
import UserRoles from './UserRoles';
import styles from './index.less';

const { TabPane } = Tabs;
const { TreeNode } = Tree;

@connect(({ applySysAuthorize, loading }) => ({
  applySysAuthorize,
  userFieldsLoading: loading.effects['applySysAuthorize/listSafeAppUserFieldAuth'],
}))
class ApplySysAuthorize extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys: [-1],
      selectedKeys: [-1],
      selectedObj: {},
      pageIndex: 1,
      pageSize: 5,
      // 过滤字段
      fieldsValue: {},
      nodeRow: {},

      specialSelectedRowKeys: [],

      isEditingField: false,
      fieldVisible: false,
      isEdit: false,
      activeTabKey: '1',
    };

    const { dispatch } = props;
    dispatch({
      type: 'applySysAuthorize/listAllSafeAppUser',
    }).then(res => {
      this.setState(
        {
          selectedKeys: [res.id],
          selectedObj: { ...res },
        },
        () => {
          this.specialHandles.handleSubmit();
        }
      );
    });
  }

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            icon={item.type === 'system' ? <Icon type="desktop" /> : <Icon type="menu" />}
            title={item.title}
            key={item.key}
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          {...item}
          title={
            <Fragment>
              {item.title}
              <div style={{ display: 'inline-block', textAlign: 'right', width: 'inherit' }}>
                <Icon
                  title={formatMessage({ id: 'ApplySysAuthorize.Copy', defaultMessage: '复制' })}
                  type="copy"
                  onClick={() => this.treeNodeCopy(item)}
                />
                &nbsp;&nbsp;
                <Icon
                  title={formatMessage({ id: 'ApplySysAuthorize.Paste', defaultMessage: '粘贴' })}
                  type="snippets"
                  theme="filled"
                  onClick={() => this.treeNodePaste(item)}
                />
              </div>
            </Fragment>
          }
          icon={<Icon type="user" />}
          dataRef={item}
        />
      );
    });

  treeNodeCopy = node => {
    this.copyUser = node.id;
    message.success(
      `${formatMessage({ id: 'ApplySysAuthorize.CopySuccessful', defaultMessage: '复制成功' })}`
    );
  };

  treeNodePaste = node => {
    const { dispatch } = this.props;
    if (!this.copyUser) {
      message.error(
        `${formatMessage({ id: 'ApplySysAuthorize.PleaseCopyFirst', defaultMessage: '请先复制' })}`
      );
      return;
    }
    dispatch({
      type: 'applySysAuthorize/copySafeAppUserTableAuth',
      payload: {
        copy: this.copyUser,
        paste: node.id,
      },
    }).then(re => {
      if (re && re.resultCode === '0') {
        message.success(
          `${formatMessage({
            id: 'ApplySysAuthorize.PastedSuccessfully',
            defaultMessage: '粘贴成功',
          })}`
        );
        // this.tree.handleTreeSearch();
      } else {
        message.error(re.resultMsg);
      }
    });
    this.copyUser = '';
  };

  // 特殊权限配置
  specialConfig = () => {
    return {
      searchArr: [
        {
          type: 'input',
          name: 'objectCode',
          label: `${formatMessage({
            id: 'ApplySysAuthorize.FieldAttributionTable',
            defaultMessage: '字段归属表',
          })}`,
          colSpan: 8,
        },
        {
          type: 'input',
          name: 'datasourceName',
          label: `${formatMessage({
            id: 'ApplySysAuthorize.BelongDatabase',
            defaultMessage: '所属数据库',
          })}`,
          colSpan: 8,
        },
        {
          type: 'button',
          searchBtnClick: this.specialHandles.handleSubmit,
          resetBtnClick: this.specialHandles.handleSubmit,
          colSpan: 8,
        },
      ],
      columns: [
        {
          title: `${formatMessage({
            id: 'ApplySysAuthorize.FieldAttributionTable',
            defaultMessage: '字段归属表',
          })}`,
          dataIndex: 'objectCode',
          key: 'objectCode',
        },
        {
          title: `${formatMessage({
            id: 'ApplySysAuthorize.BelongDatabase',
            defaultMessage: '所属数据库',
          })}`,
          dataIndex: 'datasourceName',
          key: 'datasourceName',
        },
        {
          title: `${formatMessage({
            id: 'ApplySysAuthorize.DatabaseType',
            defaultMessage: '数据库类型',
          })}`,
          dataIndex: 'sourceType',
          key: 'sourceType',
        },
        {
          title: `${formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}`,
          key: 'operator',
          width: 125,
          render: record => {
            return (
              <div className="table-action-column">
                <MyIcon
                  onClick={() => this.specialHandles.handleLookOnchangge(record)}
                  type="iconeye"
                  title={formatMessage({ id: 'COMMON_VIEW', defaultMessage: '查看' })}
                />
                <MyIcon
                  onClick={() => this.specialHandles.handleEditOnchangge(record)}
                  type="iconbianji"
                  title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
                />
                <Popconfirm
                  title={formatMessage({
                    id: 'COMMON_DELETE_TIP',
                    defaultMessage: '您确定要删除吗？',
                  })}
                  onConfirm={() => {
                    this.specialHandles.handleTableRowDelete(record);
                  }}
                  okText={formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}
                  cancelText={formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}
                >
                  <MyIcon
                    type="iconshanchubeifenx"
                    title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
                  />
                </Popconfirm>
              </div>
            );
          },
        },
      ],
    };
  };

  // 树查询/选择
  tree = {
    handleTreeSearch: value => {
      const { dispatch } = this.props;
      dispatch({
        type: 'applySysAuthorize/listAllSafeAppUser',
        payload: value,
      }).then(res => {
        this.setState(
          {
            selectedKeys: [res.id],
            selectedObj: { ...res },
          },
          () => {
            this.specialHandles.handleSubmit();
          }
        );
      });
    },
    handleTreeSelect: (selectedKeys, e) => {
      if (selectedKeys.length === 0 || !selectedKeys[0]) {
        return;
      }
      if (e.node.props.type === 'user') {
        this.setState(
          {
            selectedKeys,
            selectedObj: e.node.props.dataRef,
          },
          () => {
            const { fieldsValue } = this.state;
            this.specialHandles.handleSubmit(fieldsValue);
          }
        );
      }
    },
  };

  // 特殊用户表权限查询
  specialHandles = {
    handleSubmit: (fieldsValueObj = {}) => {
      const { pageIndex, pageSize, selectedObj } = this.state;
      const { dispatch } = this.props;
      if (selectedObj.id) {
        this.setState({ fieldsValue: fieldsValueObj, specialSelectedRowKeys: [] });
        dispatch({
          type: 'applySysAuthorize/listSafeAppUserFieldAuth',
          payload: {
            ...fieldsValueObj,
            appUserId: selectedObj.id,
            pageSize,
            pageIndex,
          },
        });
      }
    },

    handlePaginationOnchangge: pageIndex => {
      this.setState({ pageIndex }, () => {
        const { fieldsValue } = this.state;
        this.specialHandles.handleSubmit(fieldsValue);
      });
    },

    handleLookOnchangge: node => {
      this.setState({
        fieldVisible: true,
        nodeRow: node,
      });
    },

    handleEditOnchangge: node => {
      this.setState({
        isEditingField: true,
        isEdit: true,
        nodeRow: node,
      });
    },

    handleSelectAll: flag => {
      const {
        applySysAuthorize: { specialTableDatasource },
      } = this.props;
      this.setState({
        specialSelectedRowKeys: flag ? specialTableDatasource.map(o => o.id) : [],
      });
    },

    handleTableRowDelete: record => {
      const {
        applySysAuthorize: { defaultUser },
        dispatch,
      } = this.props;
      const { selectedKeys } = this.state;
      const selectedUserId = selectedKeys[0] === -1 ? defaultUser.id : selectedKeys[0];
      let records = record;
      if (!Array.isArray(record)) {
        records = [record];
      }
      dispatch({
        type: 'applySysAuthorize/multiDeleteSafeAppUserFieldAuth',
        payload: {
          idList: records.map(o => {
            return {
              appUserId: selectedUserId,
              dataobjectId: o.dataobjectId,
            };
          }),
        },
      }).then(deleteResult => {
        if (deleteResult && deleteResult.resultCode === '0') {
          message.success(
            `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功！' })}`
          );
          this.specialHandles.handleSubmit({});
        } else {
          message.error(deleteResult.resultMsg);
        }
      });
    },

    handleBacthDelete: () => {
      const { specialSelectedRowKeys } = this.state;
      const {
        applySysAuthorize: { specialTableDatasource },
      } = this.props;
      const records = specialTableDatasource.filter(o => {
        return (
          specialSelectedRowKeys.filter(p => {
            return o.id === p;
          }).length > 0
        );
      });
      this.specialHandles.handleTableRowDelete(records);
    },
  };

  authorizationBtn = () => {
    const { selectedKeys } = this.state;
    if (selectedKeys.length === 0) {
      message.error(
        `${formatMessage({
          id: 'ApplySysAuthorize.SelUserAuthTip',
          defaultMessage: '请选择用户授权',
        })}`
      );
      return;
    }
    this.setState({ isEditingField: true });
  };

  tabsActiveFunc = activeTabKey => {
    this.setState({ activeTabKey });
  };

  onFieldCancel = () => {
    this.setState({
      isEditingField: false,
      isEdit: false,
    });
  };

  fieldVisibleCancel = () => {
    this.setState({
      fieldVisible: false,
    });
  };

  render() {
    const specialConfig = this.specialConfig();
    const {
      expandedKeys,
      selectedKeys,
      pageSize,
      specialSelectedRowKeys,
      isEditingField,
      selectedObj,
      nodeRow,
      fieldVisible,
      isEdit,
      activeTabKey,
    } = this.state;
    const {
      userFieldsLoading,
      applySysAuthorize: { treeDatasource, specialTableDatasource, specialPageInfo, defaultUser },
    } = this.props;
    const selectedUserKeys = selectedKeys[0] === -1 ? defaultUser.id : selectedKeys;
    return (
      <div className={`${styles.page} smartsafeCon`}>
        <div className={styles.l}>
          <div className={styles.lh}>
            {formatMessage({
              id: 'ApplySysAuthorize.ApplicationSysCatalog',
              defaultMessage: '应用系统目录',
            })}
          </div>
          <Input.Search
            onSearch={this.tree.handleTreeSearch}
            placeholder={formatMessage({
              id: 'COMMON_ENTER_TIP',
              defaultMessage: '请输入',
            })}
            enterButton
          />
          {treeDatasource.length > 0 ? (
            <Tree
              showIcon
              blockNode
              expandedKeys={expandedKeys[0] === -1 ? defaultUser.id : expandedKeys}
              selectedKeys={selectedUserKeys}
              onExpand={keys => this.setState({ expandedKeys: keys })}
              onSelect={this.tree.handleTreeSelect}
            >
              {this.renderTreeNodes(treeDatasource)}
            </Tree>
          ) : (
            ''
          )}
        </div>
        <div className={styles.r}>
          <h3>
            {selectedObj.appUserName ? (
              `${formatMessage({
                id: 'ApplySysAuthorize.SelectApplicationUser',
                defaultMessage: '选择应用系统用户',
              })}：${selectedObj.appUserName}`
            ) : (
              <span style={{ color: 'red' }}>
                {formatMessage({
                  id: 'ApplySysAuthorize.NoUsersSelected',
                  defaultMessage: '未选择用户',
                })}
              </span>
            )}
          </h3>
          <Tabs
            className={styles.rTab}
            activeKey={activeTabKey}
            onChange={this.tabsActiveFunc}
            tabBarExtraContent={
              activeTabKey === '2' ? (
                <Button onClick={this.authorizationBtn}>
                  {formatMessage({ id: 'ApplySysAuthorize.Authorization', defaultMessage: '授权' })}
                </Button>
              ) : null
            }
          >
            <TabPane
              tab={formatMessage({
                id: 'ApplySysAuthorize.UserAuthority',
                defaultMessage: '用户权限',
              })}
              key="1"
            >
              <UserRoles appUserId={selectedUserKeys ? selectedUserKeys[0] : null} />
            </TabPane>
            <TabPane
              tab={formatMessage({
                id: 'ApplySysAuthorize.UserSpecialFieldPermissions',
                defaultMessage: '用户特殊字段权限',
              })}
              key="2"
            >
              <div className={styles.rt}>
                <QueryConditions searchArr={specialConfig.searchArr} loading={false} />
              </div>
              <Table
                rowSelection={{
                  selectedRowKeys: specialSelectedRowKeys,
                  onChange: selectedRowKeys1 => {
                    this.setState({ specialSelectedRowKeys: selectedRowKeys1 });
                  },
                }}
                loading={userFieldsLoading}
                className={styles.userTable}
                columns={specialConfig.columns}
                dataSource={specialTableDatasource}
                pagination={false}
                rowKey="id"
                scroll={{ y: 309 }}
              />
              <div className={styles.rb}>
                <div className={styles.rbl}>
                  <Checkbox onChange={e => this.specialHandles.handleSelectAll(e.target.checked)} />
                  <span className={styles.rblc}>
                    {formatMessage({ id: 'ApplySysAuthorize.SelectAll', defaultMessage: '全选' })}
                  </span>
                  <Popconfirm
                    title={formatMessage({
                      id: 'COMMON_DELETE_TIP',
                      defaultMessage: '您确定要删除吗？',
                    })}
                    onConfirm={() => this.specialHandles.handleBacthDelete()}
                    okText={formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}
                    cancelText={formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}
                  >
                    <Button disabled={!specialSelectedRowKeys.length}>
                      {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
                    </Button>
                  </Popconfirm>
                </div>
                <div className={styles.rbr}>
                  <Pagination
                    onChange={this.specialHandles.handlePaginationOnchangge}
                    defaultCurrent={1}
                    current={specialPageInfo.pageIndex}
                    total={specialPageInfo.total}
                    pageSize={pageSize}
                  />
                </div>
              </div>
            </TabPane>
            <TabPane
              key="3"
              tab={formatMessage({
                id: 'ApplySysAuthorize.AccessTime',
                defaultMessage: '访问时间',
              })}
            >
              <AccessTime selectedObj={selectedObj} />
            </TabPane>
          </Tabs>
        </div>

        {isEditingField && (
          <AddField
            visible={isEditingField}
            onCancel={this.onFieldCancel}
            selectedKeys={selectedKeys}
            nodeRow={nodeRow}
            isEdit={isEdit}
            onOk={() => this.specialHandles.handleSubmit({})}
          />
        )}
        <Modal
          footer={false}
          title={formatMessage({
            id: 'ApplySysAuthorize.UserPermissionDetails',
            defaultMessage: '用户权限详情',
          })}
          width="80%"
          visible={fieldVisible}
          onCancel={this.fieldVisibleCancel}
          destroyOnClose
          showOkButton={false}
        >
          <FieldModal
            nodeRow={nodeRow}
            selectedUserId={selectedUserKeys ? selectedUserKeys[0] : ''}
          />
        </Modal>
      </div>
    );
  }
}

export default Form.create()(ApplySysAuthorize);
