import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Collapse, Row, Col, Input, Card, Form, Button, Tree, message, Checkbox } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import { AllowAccessTime } from '@/pages/AuthorizeManagement/components/AllowAccessTime';
import styles from '../index.less';
import {
  getUserAllowHostDetail,
  saveUserAllowConfigDetail,
} from '@/services/authorizeManagement/userCodeLinkConfig';

const { Panel } = Collapse;
const { Search } = Input;
const { TreeNode } = Tree;

@Form.create()
@connect(({ UserCodeLinkModel }) => ({
  selectedItem: UserCodeLinkModel.selectedItem,
}))
class DbAcccountsLink extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      totalNumber: '',
      treeData: [],
      allData: [],
      params: [],
      checkedKeys: [],
      checkedRow: [],
      loading: false,
    };
  }

  componentWillMount() {
    const { selectedItem } = this.props;
    if (selectedItem.userId || `${selectedItem.userId}` === '0') {
      this.getCatalogue(selectedItem.userId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedItem } = this.props;
    if (nextProps.selectedItem.userId !== selectedItem.userId) {
      this.getCatalogue(nextProps.selectedItem);
      this.setState({
        checkedKeys: [],
        checkedRow: [],
      });
    }
  }

  getCatalogue = (val, isSearch) => {
    const params = { sourceType: 1 };
    const { selectedItem } = this.props;
    if (typeof val == 'object') {
      params.userId = val.userId;
    } else if (typeof val == 'number') {
      params.userId = val;
    } else {
      // eslint-disable-next-line prefer-destructuring
      params.userId = selectedItem.userId;
      params.searchValue = val;
    }
    this.fetchParentTree(params, isSearch);
  };

  // 进入页面加载获取数据库目录树的父节点
  fetchParentTree = async (queryParm, isSearch) => {
    getUserAllowHostDetail(queryParm).then((resp = {}) => {
      const { resultCode, resultObject = {} } = resp;
      const {
        datasourceType2DataSourcesMap = {},
        datasourceId2UsernameMap = {},
        allowParamMap = {},
        allowMap = {},
      } = resultObject;
      let treeData = [];
      if (resultCode !== '0') {
        this.setState(
          {
            treeData,
            params: [],
            totalNumber: 0,
            checkedKeys: [],
            checkedRow: [],
          },
          () => {
            this.reset();
          }
        );
        return;
      }
      treeData = this.getTreeData(
        datasourceType2DataSourcesMap,
        datasourceId2UsernameMap,
        allowMap
      );
      if (isSearch) {
        this.setState({
          treeData,
        });
        return false;
      }
      const { checkedKeys, checkedRow, totalNumber } = this.getchecked(
        datasourceType2DataSourcesMap,
        allowMap
      );
      const allData = this.getCheckArr(treeData);
      this.setState(
        {
          treeData,
          allData,
          checkedKeys,
          checkedRow,
          totalNumber,
          params: allowParamMap,
        },
        () => {
          this.reset();
        }
      );
    });
  };

  getTreeData = (
    datasourceType2DataSourcesMap = {},
    datasourceId2UsernameMap = {},
    allowMap = {}
  ) => {
    const treeData = _.keys(datasourceType2DataSourcesMap).map(item => {
      const children = datasourceType2DataSourcesMap[item].map(user => {
        return {
          key: `${user.datasourceName}_${user.datasourceId}`,
          name: user.datasourceName,
          children: [
            {
              ...user,
              key: `${user.datasourceId}`,
              id: `${user.datasourceId}`,
              name: datasourceId2UsernameMap[user.datasourceId],
              checkFlag: allowMap[user.datasourceId],
              itemType: 1,
            },
          ],
          id: `${user.datasourceName}_${user.datasourceId}`,
          itemType: 2,
        };
      });
      return {
        key: `${item}`,
        name: item,
        children,
        id: `${item}`,
        itemType: 3,
      };
    });
    return treeData;
  };

  getchecked = (datasourceType2DataSourcesMap = {}, allowMap = {}) => {
    const checkedKeys = [];
    const checkedRow = [];
    let totalNumber = 0;
    _.keys(datasourceType2DataSourcesMap).forEach(item => {
      const arr = datasourceType2DataSourcesMap[item] || [];
      totalNumber += arr.length;
      arr.forEach(data => {
        if (allowMap[data.datasourceId]) {
          checkedKeys.push(`${data.datasourceId}`);
          checkedRow.push(data);
        }
      });
    });
    return { checkedKeys, checkedRow, totalNumber };
  };

  getCheckArr = (arr, result = []) => {
    arr.forEach(item => {
      if (item.itemType === 1) {
        result.push(item);
      }
      if (item.children) {
        this.getCheckArr(item.children, result);
      }
    });
    return result;
  };

  renderTreeNodes = nodeArr => {
    return nodeArr.map(item => {
      return (
        <TreeNode title={item.name} key={item.key} dataRef={item}>
          {item.children && item.children.length > 0 && this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    });
  };

  onSelect = () => {};

  onCheck = (keys, node) => {
    const { checkedKeys, checkedRow } = this.state;
    let newCheckedKeys = [...checkedKeys];
    let newCheckedRow = [...checkedRow];
    const { selectedItem } = this.props;
    if (!selectedItem.userId) {
      message.warning(
        `${formatMessage({
          id: 'AserCodeLinkConfig.selectOperatorAccountTip',
          defaultMessage: '请先在左侧选择操作员账号!',
        })}`
      );
      return false;
    }
    const {
      checked,
      node: { props },
    } = node;
    const { dataRef } = props;
    const { itemType, id } = dataRef;
    const keyArr = [];
    const rowArr = [];
    if (itemType === 1) {
      keyArr.push(`${id}`);
      rowArr.push({ ...dataRef });
    } else if (itemType == 2) {
      const actItem = dataRef.children || [];
      keyArr.push(`${actItem[0].id}`);
      rowArr.push({ ...actItem[0] });
    } else {
      dataRef.children.forEach(item => {
        if (item.children && item.children.length > 0) {
          keyArr.push(`${item.children[0].id}`);
          rowArr.push({ ...item.children[0] });
        }
      });
    }

    if (checked) {
      rowArr.forEach(item => {
        if (!checkedKeys.includes(`${item.id}`)) {
          newCheckedKeys.push(`${item.id}`);
          newCheckedRow.push(item);
        }
      });
    } else {
      newCheckedKeys = newCheckedKeys.filter(item => {
        return !keyArr.includes(`${item}`);
      });
      newCheckedRow = newCheckedRow.filter(item => {
        return !keyArr.includes(`${item.id}`);
      });
    }
    this.setState({
      checkedKeys: newCheckedKeys,
      checkedRow: newCheckedRow,
    });
  };

  // 保存
  save = () => {
    const { form, selectedItem } = this.props;
    const { checkedKeys, allData } = this.state;
    const allParams = {
      allowMap: {},
      allowParamMap: {},
      sourceType: 1, // 保存类型
      userId: selectedItem.userId,
    };
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (checkedKeys.length === 0 && _.keys(values).length === 0) {
          allParams.allowParamMap = {};
        } else {
          const ALLOW_TIME_START =
            form.getFieldValue('ALLOW_TIME_START') === null
              ? ''
              : moment(form.getFieldValue('ALLOW_TIME_START')).format('HH:mm:ss');
          const ALLOW_TIME_END =
            form.getFieldValue('ALLOW_TIME_END') === null
              ? ''
              : moment(form.getFieldValue('ALLOW_TIME_END')).format('HH:mm:ss');
          const ALLOW_DAY = _.join(form.getFieldValue('ALLOW_DAY'), ',');
          allParams.allowParamMap.ALLOW_DAY = ALLOW_DAY;
          allParams.allowParamMap.ALLOW_IP_END = form.getFieldValue('ALLOW_IP_END');
          allParams.allowParamMap.ALLOW_IP_START = form.getFieldValue('ALLOW_IP_START');
          allParams.allowParamMap.ALLOW_TIME_END = ALLOW_TIME_END;
          allParams.allowParamMap.ALLOW_TIME_START = ALLOW_TIME_START;
        }
        const allowMap = {};
        allData.forEach(item => {
          const flag = checkedKeys.includes(item.id);
          allowMap[item.id] = flag;
        });
        allParams.allowMap = allowMap;
        if (
          form.getFieldValue('ALLOW_IP_START') !== '' &&
          form.getFieldValue('ALLOW_IP_END') === ''
        ) {
          message.info(
            `${formatMessage({
              id: 'AserCodeLinkConfig.noEndIptip',
              defaultMessage: '终止IP地址没有设置，仅可访问开始IP地址!',
            })}`
          );
        }
        if (
          form.getFieldValue('ALLOW_IP_START') !== '' &&
          form.getFieldValue('ALLOW_IP_END') !== '' &&
          form.getFieldValue('ALLOW_IP_START') === form.getFieldValue('ALLOW_IP_END')
        ) {
          message.info(
            `${formatMessage({
              id: 'AserCodeLinkConfig.SameIpTip',
              defaultMessage: '开始IP地址和终止IP地址一致，仅可访问此IP地址!',
            })}`
          );
        }
        this.setState({
          loading: true,
        });
        saveUserAllowConfigDetail(allParams).then(result => {
          this.setState({
            loading: false,
          });
          if (!result) return;
          const { resultCode, resultMsg } = result;
          if (resultCode !== '0') {
            message.error(resultMsg);
          } else {
            message.success(
              `${formatMessage({
                id: 'AserCodeLinkConfig.SavedSuccessfully',
                defaultMessage: '保存成功!',
              })}`
            );
          }
        });
      }
    });
  };

  // 重置
  reset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  // 设置过滤条件
  filterData = name => {
    const { params } = this.state;
    if (params[name]) {
      return params[name];
    }
    return '';
  };

  handleIpValidator = (rule, callback) => {
    const { form } = this.props;
    const ALLOW_IP_START = form.getFieldValue('ALLOW_IP_START');
    const ALLOW_IP_END = form.getFieldValue('ALLOW_IP_END');
    const temp1 = _.split(ALLOW_IP_START, '.');
    const temp2 = _.split(ALLOW_IP_END, '.');
    const arr = temp1.map((item, index) => {
      if (temp2[index] - item >= 0) {
        return -1;
      }
      return 1;
    });
    if (arr.indexOf(1) > -1 && ALLOW_IP_END != '') {
      this.messageTip = `${formatMessage({
        id: 'AserCodeLinkConfig.EndIpTip',
        defaultMessage: '结束IP不能小于起始IP!',
      })}`;
      callback(this.messageTip);
    }
    callback();
  };

  onCheckAllChange = e => {
    const { checked } = e.target;
    const { treeData, checkedKeys, checkedRow } = this.state;
    let newCheckedKeys = [...checkedKeys];
    let newCheckedRow = [...checkedRow];
    if (treeData.length <= 0) {
      return;
    }
    const concatArr = this.getCheckArr(treeData);
    if (checked) {
      concatArr.forEach(item => {
        if (!newCheckedKeys.includes(`${item.datasourceId}`)) {
          newCheckedKeys.push(`${item.datasourceId}`);
          newCheckedRow.push(item);
        }
      });
    } else {
      concatArr.forEach(item => {
        newCheckedKeys = newCheckedKeys.filter(ckeckedItem => {
          return `${ckeckedItem}` !== `${item.datasourceId}`;
        });
        newCheckedRow = newCheckedRow.filter(ckeckedItem => {
          return `${ckeckedItem.datasourceId}` !== `${item.datasourceId}`;
        });
      });
    }
    this.setState({
      checkedKeys: newCheckedKeys,
      checkedRow: newCheckedRow,
    });
  };

  render() {
    const { form, currentIpAddr } = this.props;
    const { getFieldDecorator } = form;
    const { totalNumber, treeData, checkedKeys, loading } = this.state;
    let allChecked = true;
    if (treeData.length !== 0) {
      const concatArr = this.getCheckArr(treeData);
      concatArr.forEach(item => {
        if (!checkedKeys.includes(`${item.datasourceId}`)) {
          allChecked = false;
        }
      });
    } else {
      allChecked = false;
    }

    return (
      <div className={styles.sysManageCon} style={{ marginTop: '15px' }}>
        <Collapse
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                    : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
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
            header={formatMessage({
              id: 'AserCodeLinkConfig.AssociateWithDatabaseAccount',
              defaultMessage: '与数据库账号关联',
            })}
            key="1"
          >
            <div>
              <Row>
                <Col span={7}>
                  <p className={styles.title}>
                    <span className={styles.require}>*</span>
                    {formatMessage({
                      id: 'AserCodeLinkConfig.AllowAccessToDatabaseAccounts',
                      defaultMessage: '允许访问数据库账号',
                    })}
                  </p>
                  <Card
                    title={
                      <Checkbox checked={allChecked} onChange={this.onCheckAllChange}>
                        {formatMessage({
                          id: 'AserCodeLinkConfig.DatabaseAccount',
                          defaultMessage: '数据库账号',
                        })}
                      </Checkbox>
                    }
                    type="inner"
                    size="small"
                    extra={
                      <span>
                        <span style={{ color: '#00E5EE' }}>{checkedKeys.length}</span>/{totalNumber}
                      </span>
                    }
                    bodyStyle={{
                      height: 279,
                      overflowY: 'scroll',
                      overflowX: 'hidden',
                    }}
                  >
                    <Search
                      placeholder={formatMessage({
                        id: 'AserCodeLinkConfig.SearchKeyword',
                        defaultMessage: '搜索关键词',
                      })}
                      onSearch={value => {
                        this.getCatalogue(value, true);
                      }}
                    />
                    <Tree
                      className={styles.commonTreeCon}
                      onSelect={this.onSelect}
                      checkable
                      defaultExpandParent={true}
                      onCheck={this.onCheck}
                      checkedKeys={checkedKeys}
                    >
                      {this.renderTreeNodes(treeData)}
                    </Tree>
                  </Card>
                </Col>
                <Col span={1} />
                <Col span={16}>
                  <div style={{ marginBottom: 16 }}>
                    <p className={styles.title}>
                      <span className={styles.require}>*</span>
                      {formatMessage({
                        id: 'AserCodeLinkConfig.AllowedAccessTime',
                        defaultMessage: '允许访问时间',
                      })}
                    </p>
                    <AllowAccessTime
                      form={form}
                      initialValues={{
                        ALLOW_DAY: this.filterData('ALLOW_DAY'),
                        ALLOW_TIME_START: this.filterData('ALLOW_TIME_START'),
                        ALLOW_TIME_END: this.filterData('ALLOW_TIME_END'),
                      }}
                    />
                  </div>
                  <div>
                    <p className={styles.title}>
                      <span className={styles.require}>*</span>
                      {formatMessage({
                        id: 'AserCodeLinkConfig.AllowAccessToIPSegments',
                        defaultMessage: '允许访问 IP 段',
                      })}
                    </p>
                    <Card
                      title={formatMessage({
                        id: 'AserCodeLinkConfig.SetAccessIPSegment',
                        defaultMessage: '设置访问 IP 段',
                      })}
                      type="inner"
                      size="small"
                    >
                      <Form layout="inline">
                        <Form.Item
                          label={formatMessage({
                            id: 'AserCodeLinkConfig.Start',
                            defaultMessage: '开始',
                          })}
                        >
                          {getFieldDecorator('ALLOW_IP_START', {
                            rules: [
                              {
                                required: checkedKeys.length != 0,
                                message: `${formatMessage({
                                  id: 'AserCodeLinkConfig.EnterCorrectIPTip',
                                  defaultMessage: '请输入正确的 IP 地址',
                                })}`,
                                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                              },
                              {
                                validator: (rule, value, callback) =>
                                  this.handleIpValidator(rule, callback),
                              },
                            ],
                            initialValue: this.filterData('ALLOW_IP_START')
                              ? this.filterData('ALLOW_IP_START')
                              : '',
                          })(
                            <Input
                              placeholder={formatMessage({
                                id: 'AserCodeLinkConfig.enterIPTip',
                                defaultMessage: '请输入 IP 地址',
                              })}
                              style={{ width: 200 }}
                            />
                          )}
                        </Form.Item>
                        <Form.Item
                          label={formatMessage({
                            id: 'AserCodeLinkConfig.End',
                            defaultMessage: '结束',
                          })}
                        >
                          {getFieldDecorator('ALLOW_IP_END', {
                            rules: [
                              {
                                // required: true,
                                message: `${formatMessage({
                                  id: 'AserCodeLinkConfig.EnterCorrectIPTip',
                                  defaultMessage: '请输入正确的 IP 地址',
                                })}`,
                                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                              },
                              {
                                validator: (rule, value, callback) =>
                                  this.handleIpValidator(rule, callback),
                              },
                            ],
                            initialValue: this.filterData('ALLOW_IP_END')
                              ? this.filterData('ALLOW_IP_END')
                              : '',
                          })(
                            <Input
                              placeholder={formatMessage({
                                id: 'AserCodeLinkConfig.enterIPTip',
                                defaultMessage: '请输入 IP 地址',
                              })}
                              style={{ width: 200 }}
                            />
                          )}
                        </Form.Item>
                      </Form>
                      <div className={styles.ipAddrInfoCon}>
                        <span>
                          {formatMessage({
                            id: 'AserCodeLinkConfig.CurrentMachineIP',
                            defaultMessage: '当前机器IP',
                          })}
                          :
                        </span>
                        <span>{currentIpAddr}</span>
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>
              <Card
                extra={
                  <Row type="flex" justify="end">
                    <Button
                      type="primary"
                      onClick={this.save}
                      loading={loading}
                      disabled={!treeData.length}
                    >
                      {formatMessage({ id: 'COMMON_SAVE', defaultMessage: '保存' })}
                    </Button>
                    &nbsp;&nbsp;&nbsp;
                    <Button type="default" onClick={this.reset}>
                      {formatMessage({ id: 'BTN_RESET', defaultMessage: '重置' })}
                    </Button>
                  </Row>
                }
                bodyStyle={{ padding: 0 }}
                headStyle={{ padding: 0, borderBottom: 'none' }}
                bordered={false}
              />
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

export default DbAcccountsLink;
