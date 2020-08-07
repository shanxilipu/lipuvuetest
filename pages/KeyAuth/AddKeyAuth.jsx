import React, { Component } from 'react';
import {
  Drawer,
  message,
  Form,
  Input,
  Col,
  Button,
  Row,
  Select,
  Radio,
  Table,
  DatePicker,
  Tree,
} from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import styles from './index.less';
import { AUTH_LEVEL_LIST, AUTH_TYPE_LIST } from './models/keyAuth';
import SysCatlog from '../KeyManagement/components/SysCatlog';

const PAGE_INFO = {
  pageIndex: 1,
  pageSize: 1000,
};

const FORM_LAYOUT = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@Form.create()
@connect(({ loading, keyAuth }) => ({
  loading: loading.effects['keyAuth/listKeys'],
  saveLoading: loading.effects['keyAuth/enableAuth'],
  keyAuth,
}))
class AddKeyAuth extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: formatMessage({ id: 'keyAuth.keyCode', defaultMessage: '密钥标识' }),
        key: 'keyCode',
        dataIndex: 'keyCode',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.keyName', defaultMessage: '密钥名称' }),
        key: 'keyName',
        dataIndex: 'keyName',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.keyDescribe', defaultMessage: '密钥说明' }),
        key: 'keyDescribe',
        dataIndex: 'keyDescribe',
        ellipsis: true,
      },
      {
        title: formatMessage({ id: 'keyAuth.encry', defaultMessage: '加密算法' }),
        key: 'encryptAlgorithm',
        dataIndex: 'encryptAlgorithm',
        ellipsis: true,
      },
    ];
  }

  state = {
    dataSource: {
      list: [],
      ...PAGE_INFO,
    },
    selectedRowKeys: [],
    treeData: [],
  };

  searchInfo = {
    ...PAGE_INFO,
  };

  treeSearchInfo = {};

  checkedKeys = [];

  componentDidMount() {
    const { genSysCode } = this.props;
    this.searchInfo.genAppSystem = genSysCode;
    this.getDataSource();
    this.getEncryList();
    this.getTreeData(AUTH_LEVEL_LIST[0].value);
  }

  getEncryList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyAuth/listAlgorithm2Bit',
      payload: {},
    });
  };

  getDataSource = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'keyAuth/listKeys',
      payload: {
        ...this.searchInfo,
      },
    }).then(res => {
      if (!res) return;
      this.setState({
        selectedRowKeys: [],
        dataSource: {
          list: res.rows,
          pageIndex: res.pageInfo && res.pageInfo.pageIndex,
          pageSize: res.pageInfo && res.pageInfo.pageSize,
          total: res.pageInfo && res.pageInfo.total,
        },
      });
    });
  };

  getTreeData = value => {
    const { dispatch, form } = this.props;
    const authLevel = value || form.getFieldValue('authLevel');
    const type =
      authLevel === AUTH_LEVEL_LIST[0].value
        ? 'keyAuth/listAllSafeAppsysTree'
        : 'keyAuth/getUsersTree';
    if (authLevel === AUTH_LEVEL_LIST[1].value) {
      this.treeSearchInfo.queryCode = this.treeSearchInfo.keyword;
    }
    dispatch({
      type,
      payload: {
        ...this.treeSearchInfo,
      },
    }).then(res => {
      if (!res) return;
      this.setState({
        treeData: res || [],
      });
    });
  };

  onCheck = (checkedKeys = []) => {
    this.checkedKeys = checkedKeys;
  };

  findItemFromTree = (treeData, userCode) => {
    let currItem;
    treeData.forEach(item => {
      // 优先判断父节点
      if (userCode === item.userCode && !currItem) {
        currItem = item;
      } else if (item.children && item.children.length && !currItem) {
        currItem = this.findItemFromTree(item.children, userCode);
      }
    });
    return currItem;
  };

  searchFun = value => {
    this.treeSearchInfo.keyword = value;
    this.getTreeData();
  };

  handleQuery = () => {
    const { form, genSysCode } = this.props;
    const values = form.getFieldsValue();
    this.searchInfo = {
      genAppSystem: genSysCode,
      keyName: values.keyName,
      keyDescribe: values.keyDescribe,
      encryptAlgorithm: values.encryptAlgorithm,
      createTimeStart:
        values.enableTime &&
        values.enableTime[0] &&
        moment(values.enableTime[0]).format('YYYY-MM-DD HH:mm'),
      createTimeEnd:
        values.enableTime &&
        values.enableTime[1] &&
        moment(values.enableTime[1]).format('YYYY-MM-DD HH:mm'),
      ...PAGE_INFO,
    };
    this.getDataSource();
  };

  handleReset = () => {
    const { form, genSysCode } = this.props;
    this.searchInfo = {
      genAppSystem: genSysCode,
      ...PAGE_INFO,
    };
    form.resetFields(['keyName', 'keyDescribe', 'encryptAlgorithm', 'enableTime']);
    this.getDataSource();
  };

  formatCheckList = () => {
    const { treeData } = this.state;
    const { form } = this.props;
    const authLevel = form.getFieldValue('authLevel');
    const list = [];
    this.checkedKeys.forEach(id => {
      if (authLevel === AUTH_LEVEL_LIST[0].value) {
        treeData.forEach(item => {
          if (item.safeAppSystem) {
            const [currItem] = item.safeAppSystem.filter(ele => `${ele.id}` === id);
            if (currItem) {
              list.push({
                appCode: currItem.appsysCode,
                appName: currItem.appsysName,
              });
            }
          }
        });
      } else {
        const currItem = this.findItemFromTree(treeData, id);
        if (currItem) {
          list.push({
            appCode: currItem.userCode,
            appName: currItem.userName,
            appUserId: currItem.userId,
          });
        }
      }
    });
    return list;
  };

  handleSave = () => {
    const { dispatch, form, saveLoading, genSysCode } = this.props;
    const { selectedRowKeys } = this.state;
    if (saveLoading) return;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (!this.checkedKeys || !this.checkedKeys.length) {
        message.error(
          formatMessage({ id: 'keyAuth.chooseTips1', defaultMessage: '请选择授权对象' })
        );
        return;
      }
      if (
        values.authType === AUTH_TYPE_LIST[1].value &&
        (!selectedRowKeys || !selectedRowKeys.length)
      ) {
        message.error(
          formatMessage({ id: 'keyAuth.chooseTips2', defaultMessage: '请选择指定授权密钥' })
        );
        return;
      }
      const { effectTime = [], authType, authLevel } = values;
      const item = {
        authType,
        authLevel,
        enableStartTime: effectTime[0] && moment(effectTime[0]).format('YYYY-MM-DD HH:mm'),
        enableEndTime: effectTime[1] && moment(effectTime[1]).format('YYYY-MM-DD HH:mm'),
      };
      const payload = [];
      const checkList = this.formatCheckList();
      if (authType === AUTH_TYPE_LIST[0].value) {
        // 全部密钥授权
        item.sysCode = genSysCode;
        checkList.forEach(ele => {
          const newItem = { ...item };
          if (authLevel === AUTH_LEVEL_LIST[0].value) {
            newItem.appSystemCode = ele.appCode;
            newItem.appSystemName = ele.appName;
          } else {
            newItem.appUserCode = ele.appCode;
            newItem.appUserName = ele.appName;
            newItem.appUserId = ele.appUserId;
          }
          payload.push(newItem);
        });
      } else {
        // 指定密钥授权
        checkList.forEach(ele => {
          const newItem = { ...item };
          if (authLevel === AUTH_LEVEL_LIST[0].value) {
            newItem.appSystemCode = ele.appCode;
            newItem.appSystemName = ele.appName;
          } else {
            newItem.appUserCode = ele.appCode;
            newItem.appUserName = ele.appName;
            newItem.appUserId = ele.appUserId;
          }
          selectedRowKeys.forEach(tableKey => {
            const tableItem = { ...newItem };
            tableItem.keyId = tableKey;
            payload.push(tableItem);
          });
        });
      }
      dispatch({
        type: 'keyAuth/enableAuth',
        payload,
      }).then(res => {
        if (!res) return;
        message.success(formatMessage({ id: 'keyAuth.authSuccess', defaultMessage: '授权成功' }));
        const { onCancel, loadList } = this.props;
        onCancel();
        loadList(true);
      });
    });
  };

  renderTreeNode = jsonTree =>
    jsonTree.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode
            key={item.key}
            title={item.title}
            value={item.key}
            checkable={item.checkable}
          >
            {this.renderTreeNode(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          key={item.userCode}
          title={item.userName}
          value={item.userCode}
          checkable={item.checkable}
        />
      );
    });

  renderUserTree = () => {
    const { treeData } = this.state;
    return (
      <Tree checkable={true} onCheck={this.onCheck}>
        {this.renderTreeNode(treeData)}
      </Tree>
    );
  };

  render() {
    const { dataSource, selectedRowKeys, treeData } = this.state;
    const {
      onCancel,
      loading,
      form,
      saveLoading,
      keyAuth: { encryList = [] },
    } = this.props;

    const title = formatMessage({ id: 'keyAuth.authAdd', defaultMessage: '密钥授权录入' });
    const authLevel = form.getFieldValue('authLevel');

    return (
      <Drawer
        visible={true}
        maskClosable={true}
        onClose={onCancel}
        width={1172}
        title={title}
        className={classnames(styles.drawWrap, styles.addKeyWrap)}
      >
        <div className="ub-f1 ub ub-ver fullHeight">
          <div className="ub ub-f1 fullHeight">
            <div className="ub ub-ver ub-f1">
              <div className={styles.addTitle}>
                <span>*</span>
                {formatMessage({ id: 'keyAuth.keyChoose', defaultMessage: '授权密钥选择' })}
              </div>
              <Form {...FORM_LAYOUT}>
                <Row className={styles.boxWrap} type="flex" align="middle">
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({ id: 'keyAuth.keyName', defaultMessage: '密钥名称' })}
                    >
                      {form.getFieldDecorator('keyName')(
                        <Input
                          placeholder={formatMessage({
                            id: 'form.weight.placeholder',
                            defaultMessage: '请输入',
                          })}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({
                        id: 'keyAuth.keyDescribe',
                        defaultMessage: '密钥说明',
                      })}
                    >
                      {form.getFieldDecorator('keyDescribe')(
                        <Input
                          placeholder={formatMessage({
                            id: 'form.weight.placeholder',
                            defaultMessage: '请输入',
                          })}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({ id: 'keyAuth.keyEncry', defaultMessage: '密钥算法' })}
                    >
                      {form.getFieldDecorator('encryptAlgorithm')(
                        <Select
                          placeholder={formatMessage({
                            id: 'COMMON_SELECT_ICON',
                            defaultMessage: '请选择',
                          })}
                        >
                          {encryList.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={formatMessage({
                        id: 'keyAuth.createTime',
                        defaultMessage: '生成时间',
                      })}
                    >
                      {form.getFieldDecorator('enableTime')(
                        <DatePicker.RangePicker
                          showTime={true}
                          format="YYYY-MM-DD HH:mm"
                          placeholder={[
                            `${formatMessage({ id: 'MAINTAINMGR_FROM' })}`,
                            `${formatMessage({ id: 'MAINTAINMGR_TO' })}`,
                          ]}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={24} className="textAlignRight">
                    <Button type="primary" onClick={this.handleQuery}>
                      {formatMessage({ id: 'BTN_SEARCH', defaultMessage: '查询' })}
                    </Button>
                    <Button onClick={this.handleReset}>
                      {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
                    </Button>
                  </Col>
                </Row>
              </Form>
              <Form {...FORM_LAYOUT} className={classnames('ub-f1', styles.boxWrap)}>
                <Col span={12}>
                  <Form.Item
                    label={formatMessage({ id: 'keyAuth.effectTime', defaultMessage: '有效时间' })}
                  >
                    {form.getFieldDecorator('effectTime', {
                      rules: [
                        {
                          required: true,
                          message: formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' }),
                        },
                      ],
                    })(
                      <DatePicker.RangePicker
                        showTime={true}
                        format="YYYY-MM-DD HH:mm"
                        placeholder={[
                          `${formatMessage({ id: 'MAINTAINMGR_FROM' })}`,
                          `${formatMessage({ id: 'MAINTAINMGR_TO' })}`,
                        ]}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={formatMessage({ id: 'keyAuth.authType', defaultMessage: '授权类型' })}
                  >
                    {form.getFieldDecorator('authType', {
                      initialValue: AUTH_TYPE_LIST[0].value,
                    })(
                      <Radio.Group>
                        {AUTH_TYPE_LIST.map(item => (
                          <Radio key={item.value} value={item.value}>
                            {item.name}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Table
                    columns={this.columns}
                    dataSource={dataSource.list}
                    rowKey="id"
                    size="small"
                    rowSelection={
                      form.getFieldValue('authType') === AUTH_TYPE_LIST[1].value
                        ? {
                            selectedRowKeys,
                            onChange: arr => {
                              this.setState({
                                selectedRowKeys: arr,
                              });
                            },
                          }
                        : null
                    }
                    loading={loading}
                    pagination={false}
                  />
                </Col>
              </Form>
            </div>
            <div className={classnames('ub ub-ver', styles.addRight)}>
              <div className={styles.addTitle}>
                <span>*</span>
                {formatMessage({ id: 'keyAuth.objectChoose', defaultMessage: '授权对象选择' })}
              </div>
              <div className={classnames('ub-f1 ub ub-ver', styles.boxWrap)}>
                <div className={styles.colTitle}>
                  <Form.Item
                    {...FORM_LAYOUT}
                    label={formatMessage({ id: 'keyAuth.authLevel', defaultMessage: '授权级别' })}
                  >
                    {form.getFieldDecorator('authLevel', {
                      initialValue: AUTH_LEVEL_LIST[0].value,
                    })(
                      <Select
                        placeholder={formatMessage({
                          id: 'COMMON_SELECT_ICON',
                          defaultMessage: '请选择',
                        })}
                        onChange={value => {
                          this.setState(
                            {
                              treeData: [],
                            },
                            () => {
                              this.getTreeData(value);
                            }
                          );
                        }}
                      >
                        {AUTH_LEVEL_LIST.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="ub-f1">
                  <SysCatlog
                    data={treeData}
                    checkable={true}
                    onCheck={this.onCheck}
                    searchFun={this.searchFun}
                    renderTree={authLevel === AUTH_LEVEL_LIST[0].value ? null : this.renderUserTree}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.bottom}>
            <Button type="primary" onClick={this.handleSave} loading={saveLoading}>
              {formatMessage({ id: 'form.save', defaultMessage: '保存' })}
            </Button>
            <Button onClick={onCancel}>
              {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
            </Button>
          </div>
        </div>
      </Drawer>
    );
  }
}

export default AddKeyAuth;
