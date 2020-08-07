import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Form, Row, Col, Select, Input, Modal, message } from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import CommonTable from '@/pages/AuditManagement/components/commonTable';
import styles from './index.less';
import EditKeyAuth from './EditKeyAuth';
import AddKeyAuth from './AddKeyAuth';
import { AUTH_TYPE_LIST, AUTH_LEVEL_LIST, AUTH_STATE_LIST, EMPTY_LIST } from './models/keyAuth';
import CatalogAuth from './CatalogAuth';

const FORM_LAYOUT = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const MODAL_FORM_LAYOUT = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};

const PAGE_INFO = {
  pageIndex: 1,
  pageSize: 10,
};

@Form.create()
@connect(({ loading, keyAuth }) => ({
  loading: loading.effects['keyAuth/listGroupAuthTarget'],
  stateLoading: loading.effects['keyAuth/reverseAuth'],
  keyAuth,
}))
class KeyAuth extends Component {
  state = {
    dataSource: {
      list: [],
      ...PAGE_INFO,
    },
    selectedRowKeys: [],
    genSysCode: '',
    detailInfo: {
      visible: false,
    },
    editKeyAuthInfo: {
      visible: false,
    },
    addKeyAuthInfo: {
      visible: false,
    },
  };

  columns = [
    {
      key: 'appCode',
      dataIndex: 'appCode',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.appCode', defaultMessage: '授权系统编码' }),
    },
    {
      key: 'appName',
      dataIndex: 'appName',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.appName', defaultMessage: '授权系统名称' }),
    },
    {
      key: 'authType',
      dataIndex: 'authType',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.authType', defaultMessage: '授权类型' }),
      render: text => {
        const [currItem] = AUTH_TYPE_LIST.filter(item => item.value === text);
        return (currItem && currItem.name) || text;
      },
    },
    {
      key: 'authLevel',
      dataIndex: 'authLevel',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.authLevel', defaultMessage: '授权级别' }),
      render: text => {
        const [currItem] = AUTH_LEVEL_LIST.filter(item => item.value === text);
        return (currItem && currItem.name) || text;
      },
    },
    {
      key: 'state',
      dataIndex: 'state',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.authState', defaultMessage: '授权状态' }),
      render: text => {
        const [currItem] = AUTH_STATE_LIST.filter(item => item.value === text);
        return (currItem && currItem.name) || text;
      },
    },
    {
      key: 'action',
      dataIndex: 'action',
      align: 'right',
      width: '220px',
      ellipsis: true,
      title: formatMessage({ id: 'keyAuth.action', defaultMessage: '操作' }),
      render: (text, record) => (
        <Fragment>
          {/* {record.state === AUTH_STATE_LIST[1].value && <a onClick={() => this.switchModalDetail(record)}>{formatMessage({ id: 'keyAuth.detail', defaultMessage: '详情' })}</a>} */}
          {(record.state === AUTH_STATE_LIST[1].value ||
            record.state === AUTH_STATE_LIST[2].value) && (
            <a onClick={() => this.handleSwitchItem(record, AUTH_STATE_LIST[0].value)}>
              {formatMessage({ id: 'applySysUserManagement.Enable', defaultMessage: '启用' })}
            </a>
          )}
          {(record.state === AUTH_STATE_LIST[0].value ||
            record.state === AUTH_STATE_LIST[2].value) && (
            <a onClick={() => this.handleSwitchItem(record, AUTH_STATE_LIST[1].value)}>
              {formatMessage({ id: 'applySysUserManagement.Disable', defaultMessage: '停用' })}
            </a>
          )}
          <a onClick={() => this.switchEditKeyAuth(record)}>
            {formatMessage({ id: 'keyAuth.edit', defaultMessage: '编辑' })}
          </a>
          <a onClick={() => this.handleDelete(record)}>
            {formatMessage({ id: 'keyAuth.delete', defaultMessage: '删除' })}
          </a>
        </Fragment>
      ),
    },
  ];

  searchInfo = {
    ...PAGE_INFO,
  };

  resetSelectedCode = () => {};

  componentDidMount() {
    // this.getListGroupAuthTarget();
  }

  // 获取授权列表
  getListGroupAuthTarget = reloadFlag => {
    const { dispatch } = this.props;
    const { genSysCode } = this.state;
    if (reloadFlag) {
      this.searchInfo = {
        ...PAGE_INFO,
        genSysCode,
      };
    }
    if (!this.searchInfo.genSysCode) {
      message.warn(
        formatMessage({ id: 'keyAuth.chooseTreeTips', defaultMessage: '请选择归属应用系统' })
      );
      return;
    }
    dispatch({
      type: 'keyAuth/listGroupAuthTarget',
      payload: {
        ...this.searchInfo,
      },
    }).then(res => {
      if (!res) return;
      this.setState({
        dataSource: {
          list: res.rows,
          pageIndex: res.pageInfo && res.pageInfo.pageIndex,
          pageSize: res.pageInfo && res.pageInfo.pageSize,
          total: res.pageInfo && res.pageInfo.total,
        },
      });
    });
  };

  // 切换左侧授权系统目录选择
  updateCode = genSysCode => {
    if (!genSysCode) return;
    this.setState(
      {
        genSysCode,
        selectedRowKeys: [],
      },
      () => {
        this.searchInfo.genSysCode = genSysCode;
        this.getListGroupAuthTarget();
      }
    );
  };

  // 详情
  switchModalDetail = record => {
    if (record) {
      this.setState({
        detailInfo: {
          visible: true,
          enableStartTime:
            record.enableStartTime && moment(record.enableStartTime).format('YYYY-MM-DD HH:mm'),
          enableEndTime:
            record.enableEndTime && moment(record.enableEndTime).format('YYYY-MM-DD HH:mm'),
        },
      });
    } else {
      this.setState({
        detailInfo: {
          visible: false,
        },
      });
    }
  };

  // 编辑
  switchEditKeyAuth = record => {
    if (record) {
      this.setState({
        editKeyAuthInfo: {
          visible: true,
          appCode: record.appCode,
          authType: record.authType,
          authLevel: record.authLevel,
          genSysCode: record.genSysCode,
        },
      });
    } else {
      this.setState({
        editKeyAuthInfo: {
          visible: false,
        },
      });
    }
  };

  // 删除确认
  handleDelete = record => {
    const { selectedRowKeys } = this.state;
    if (!record && (!selectedRowKeys || !selectedRowKeys.length)) {
      message.warn(
        formatMessage({ id: 'keyAuth.chooseAuthTips', defaultMessage: '请选择授权系统' })
      );
      return;
    }
    Modal.info({
      title: formatMessage({
        id: 'keyAuth.deleteTitle',
        defaultMessage: '您确定要删除所选内容吗？',
      }),
      maskClosable: true,
      okText: formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' }),
      cancelText: formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' }),
      onOk: () => {
        this.handleDeleteItems(record);
      },
    });
  };

  // 删除授权
  handleDeleteItems = record => {
    const { dispatch } = this.props;
    const {
      selectedRowKeys,
      dataSource: { list },
    } = this.state;
    const arr = [];
    if (!record) {
      list.forEach(item => {
        if (selectedRowKeys.indexOf(item.id) > -1) {
          const newItem = this.getParamItem(item);
          arr.push(newItem);
        }
      });
    } else {
      const newItem = this.getParamItem(record);
      arr.push(newItem);
    }
    if (arr.length === 0) {
      return;
    }
    dispatch({
      type: 'keyAuth/batchDeleteAuth',
      payload: arr,
    }).then(res => {
      if (!res) return;
      const { dataSource } = this.state;
      const newList = [];
      dataSource.list.forEach(item => {
        if (record) {
          if (record.id !== item.id) {
            newList.push(item);
          }
        } else if (selectedRowKeys.indexOf(item.id) === -1) {
          newList.push(item);
        }
      });
      this.setState({
        dataSource: {
          ...dataSource,
          list: newList,
        },
      });
    });
  };

  getParamItem = record => {
    const item = {
      authLevel: record.authLevel,
      authType: record.authType,
      genSysCode: record.genSysCode,
    };
    if (record.authLevel === AUTH_LEVEL_LIST[0].value) {
      item.toSysCode = record.appCode;
    } else {
      item.toUserCode = record.appCode;
    }
    return item;
  };

  // 切换状态
  handleSwitchItem = (record, state) => {
    const { dispatch, stateLoading } = this.props;
    if (stateLoading) return;
    const payload = this.getParamItem(record);
    payload.state = state;
    dispatch({
      type: 'keyAuth/reverseAuth',
      payload,
    }).then(res => {
      if (!res) return;
      message.success(
        formatMessage({ id: 'keyAuth.switchKeySuccess', defaultMessage: '切换状态成功' })
      );
      const {
        dataSource,
        dataSource: { list },
      } = this.state;
      const [currItem] = list.filter(item => item.id === record.id);
      if (!currItem) return;
      currItem.state = state;
      this.setState({
        dataSource: {
          ...dataSource,
          list,
        },
      });
    });
  };

  // 新增授权
  switchAddKeyAuth = flag => {
    const { genSysCode } = this.state;
    if (!genSysCode) {
      message.warn(
        formatMessage({ id: 'keyAuth.chooseTreeTips', defaultMessage: '请选择归属应用系统' })
      );
      return;
    }
    this.setState({
      addKeyAuthInfo: {
        visible: flag,
      },
    });
  };

  handleQuery = () => {
    const { form } = this.props;
    const { genSysCode } = this.state;
    const values = form.getFieldsValue();
    this.searchInfo = {
      authType: values.authType,
      authLevel: values.authLevel,
      genSysCode,
      ...PAGE_INFO,
    };
    if (values.authLevel === AUTH_LEVEL_LIST[0].value) {
      this.searchInfo.toSysCode = values.appCode;
      this.searchInfo.toSysName = values.appName;
    } else if (values.authLevel === AUTH_LEVEL_LIST[1].value) {
      this.searchInfo.toUserCode = values.appCode;
      this.searchInfo.toUserName = values.appName;
    } else {
      this.searchInfo.toSysCode = values.appCode;
      this.searchInfo.toSysName = values.appName;
      this.searchInfo.toUserCode = values.appCode;
      this.searchInfo.toUserName = values.appName;
    }
    this.getListGroupAuthTarget();
  };

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.getListGroupAuthTarget(true);
  };

  render() {
    const { loading, form } = this.props;
    const {
      dataSource,
      selectedRowKeys,
      detailInfo,
      editKeyAuthInfo,
      addKeyAuthInfo,
      genSysCode,
    } = this.state;

    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      current: dataSource.pageIndex,
      pageSize: dataSource.pageSize,
      total: dataSource.total,
    };

    return (
      <div className={classnames('ub fullHeight', styles.listBox, styles.KeyAuthWrap)}>
        <div className={styles.leftCont}>
          <div className="ub ub-ver ub-f1 fullHeight">
            <CatalogAuth
              updateCode={this.updateCode}
              resetSelectedCode={resetSelectedKeys => {
                this.resetSelectedCode = resetSelectedKeys;
              }}
            />
          </div>
        </div>
        <div className="ub ub-ver ub-f1 fullHeight">
          <Form {...FORM_LAYOUT}>
            <Row className={styles.listHeader} type="flex" align="middle">
              <Col md={8} sm={12} xs={12}>
                <Form.Item
                  label={formatMessage({ id: 'keyAuth.appCode', defaultMessage: '应用系统编码' })}
                >
                  {form.getFieldDecorator('appCode')(
                    <Input
                      placeholder={formatMessage({
                        id: 'form.weight.placeholder',
                        defaultMessage: '请输入',
                      })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col md={8} sm={12} xs={12}>
                <Form.Item
                  label={formatMessage({ id: 'keyAuth.appName', defaultMessage: '应用系统名称' })}
                >
                  {form.getFieldDecorator('appName')(
                    <Input
                      placeholder={formatMessage({
                        id: 'form.weight.placeholder',
                        defaultMessage: '请输入',
                      })}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col md={8} sm={12} xs={12}>
                <Form.Item
                  label={formatMessage({ id: 'keyAuth.authLevel', defaultMessage: '授权级别' })}
                >
                  {form.getFieldDecorator('authLevel', {
                    initialValue: '',
                  })(
                    <Select
                      placeholder={formatMessage({
                        id: 'COMMON_SELECT_ICON',
                        defaultMessage: '请选择',
                      })}
                    >
                      {EMPTY_LIST.concat(AUTH_LEVEL_LIST).map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col md={8} sm={12} xs={12}>
                <Form.Item
                  label={formatMessage({ id: 'keyAuth.authType', defaultMessage: '授权类型' })}
                >
                  {form.getFieldDecorator('authType', {
                    initialValue: '',
                  })(
                    <Select
                      placeholder={formatMessage({
                        id: 'COMMON_SELECT_ICON',
                        defaultMessage: '请选择',
                      })}
                    >
                      {EMPTY_LIST.concat(AUTH_TYPE_LIST).map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col md={16} sm={12} xs={12} className="textAlignRight">
                <Button type="primary" onClick={this.handleQuery}>
                  {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
                </Button>
                <Button onClick={this.handleReset}>
                  {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="whiteBg ub-f1 ub ub-ver">
            <div className="ub ub-pj">
              <Button onClick={() => this.handleDelete()}>
                {formatMessage({
                  id: 'keyAuth.deleteItems',
                  defaultMessage: '批量删除',
                })}
              </Button>
              <Button type="primary" onClick={() => this.switchAddKeyAuth(true)}>
                {formatMessage({
                  id: 'keyAuth.auth',
                  defaultMessage: '授权',
                })}
              </Button>
            </div>
            <div className="ub ub-f1">
              <CommonTable
                columns={this.columns}
                list={dataSource.list}
                size="small"
                rowSelection={{
                  selectedRowKeys,
                  onChange: arr => {
                    this.setState({
                      selectedRowKeys: arr,
                    });
                  },
                }}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                handleTableChange={page => {
                  const prePageSize = this.searchInfo.pageSize;
                  const { current: pageIndex, pageSize } = page;
                  this.searchInfo.pageIndex = pageIndex;
                  this.searchInfo.pageSize = pageSize;
                  if (prePageSize !== pageSize) {
                    this.searchInfo.pageIndex = 1;
                  }
                  this.getListGroupAuthTarget();
                }}
                locale={
                  genSysCode
                    ? undefined
                    : {
                        emptyText: formatMessage({ id: 'keyAuth.chooseTreeTips', defaultMessage: '请选择归属应用系统' }),
                      }
                }
              />
            </div>
          </div>
        </div>
        <Modal
          title={formatMessage({ id: 'keyAuth.detailTitle', defaultMessage: '密钥授权系统详情' })}
          visible={detailInfo.visible}
          onCancel={() => this.switchModalDetail(false)}
          footer={
            <Button onClick={() => this.switchModalDetail(false)} type="primary">
              {formatMessage({ id: 'keyAuth.close', defaultMessage: '关闭' })}
            </Button>
          }
        >
          <Form {...MODAL_FORM_LAYOUT}>
            <Form.Item
              label={formatMessage({ id: 'keyAuth.enableStartTime', defaultMessage: '生效时间' })}
            >
              <Input disabled value={detailInfo.enableStartTime} />
            </Form.Item>
            <Form.Item
              label={formatMessage({ id: 'keyAuth.enableEndTime', defaultMessage: '失效时间' })}
            >
              <Input disabled value={detailInfo.enableEndTime} />
            </Form.Item>
          </Form>
        </Modal>
        {editKeyAuthInfo.visible && (
          <EditKeyAuth
            detailInfo={editKeyAuthInfo}
            onCancel={() => this.switchEditKeyAuth(false)}
            loadList={this.getListGroupAuthTarget}
          />
        )}
        {addKeyAuthInfo.visible && (
          <AddKeyAuth
            genSysCode={genSysCode}
            onCancel={() => this.switchAddKeyAuth(false)}
            loadList={this.getListGroupAuthTarget}
          />
        )}
      </div>
    );
  }
}

export default KeyAuth;
